#!/usr/bin/env node
// One-time seed of the Shopify store from the preview catalog (scripts/shopify/seed/catalog.json).
//
// It creates the category collections, the "Best sellers" collection and all products,
// then publishes them to the Headless sales channel.
//
// After the first run, Shopify is the source of truth and the client edits products there.
// Running this again would overwrite those edits, so it stops if the store already has
// products unless you pass --force.
//
// Usage: node scripts/shopify/import-catalog.mjs [--dry-run] [--force]
import { readFileSync } from 'node:fs';
import { admin, bulkMutation } from './lib/admin.mjs';
import { CATALOG_FILE, IMAGE_BASE_URL, VENDOR } from './lib/config.mjs';

const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');
const HEADLESS_CHANNEL = 'Priya Metal Mart Headless';

// Category collections, in menu order, with the short names the site uses.
const CATEGORIES = [
  ['iron-kadai', 'Kadai and Woks'],
  ['vegetable-cutter', 'Cutters and Scrapers'],
  ['rat-trap', 'Rat Traps'],
  ['knife', 'Knives'],
  ['billhook', 'Billhooks'],
  ['iron-tawa', 'Dosa Tawas'],
  ['paniyaram-pan-paddu-pan', 'Paniyaram Pans'],
  ['pooja-items', 'Pooja Items'],
  ['sieve', 'Sieves and Strainers'],
  ['kitchen-essentials', 'Kitchen Essentials'],
  ['baby-products', 'Baby Products'],
  ['mortar-and-pestle', 'Mortar and Pestle'],
  ['gardening-tool', 'Garden Tools'],
];
const BEST_SELLERS = ['best-sellers', 'Best Sellers'];

// An MRP this many times the selling price is probably a typo, so it gets tagged for the client to check.
const SUSPICIOUS_MRP_RATIO = 4;

function productInput(p, { collectionIds, locationId }) {
  const compare = p.compare && p.compare > p.price ? p.compare : null;
  const tags = ['imported'];
  // Products with several sizes on the reference site come in with one price (the lowest).
  // The client adds each size and its price in Shopify.
  if (p.fromPrice) tags.push('sizes-pending');
  if (compare && compare / p.price >= SUSPICIOUS_MRP_RATIO) tags.push('check-mrp');
  if (!compare) tags.push('mrp-missing');

  return {
    identifier: { handle: p.handle },
    input: {
      handle: p.handle,
      title: p.title,
      vendor: VENDOR,
      status: 'ACTIVE',
      tags,
      collections: collectionIds,
      productOptions: [{ name: 'Title', values: [{ name: 'Default Title' }] }],
      files: p.image ? [{ originalSource: IMAGE_BASE_URL + encodeURI(p.image), contentType: 'IMAGE', alt: p.title }] : [],
      variants: [{
        optionValues: [{ optionName: 'Title', name: 'Default Title' }],
        price: p.price.toFixed(2),
        compareAtPrice: compare ? compare.toFixed(2) : null,
        // Stock counts are not known yet. Sold-out items are tracked at 0; the rest stay buyable
        // until the client turns on tracking and enters quantities.
        inventoryItem: { tracked: Boolean(p.soldOut) },
        inventoryQuantities: p.soldOut ? [{ locationId, name: 'available', quantity: 0 }] : [],
      }],
    },
  };
}

function lookups() {
  const data = admin(`{
    productsCount { count }
    locations(first: 5) { nodes { id name } }
    publications(first: 20) { nodes { id name } }
    collections(first: 50) { nodes { id handle } }
  }`);
  const headless = data.publications.nodes.find((n) => n.name === HEADLESS_CHANNEL);
  if (!headless) throw new Error(`Sales channel "${HEADLESS_CHANNEL}" not found. Install the Headless channel first.`);
  return {
    productCount: data.productsCount.count,
    locationId: data.locations.nodes[0].id,
    publicationId: headless.id,
    collections: new Map(data.collections.nodes.map((c) => [c.handle, c.id])),
  };
}

function ensureCollection(handle, title, existing) {
  if (existing.has(handle)) return existing.get(handle);
  const { collectionCreate } = admin(
    'mutation($input: CollectionInput!) { collectionCreate(input: $input) { collection { id } userErrors { field message } } }',
    { input: { handle, title } }, { mutation: true });
  existing.set(handle, collectionCreate.collection.id);
  console.log(`  created collection ${handle}`);
  return collectionCreate.collection.id;
}

const PUBLISH = 'mutation($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { field message } } }';

async function main() {
  const { members, home, products } = JSON.parse(readFileSync(CATALOG_FILE, 'utf8'));
  const store = lookups();

  if (store.productCount > 0 && !FORCE && !DRY_RUN) {
    console.error(`The store already has ${store.productCount} products. This seed would overwrite the client's edits.`);
    console.error('Re-run with --force only if you are sure.');
    process.exit(1);
  }

  const groups = [...CATEGORIES.map(([h, t]) => [h, t, members[h] ?? []]), [...BEST_SELLERS, home.featured]];
  const known = new Set(products.map((p) => p.handle));
  const productCollections = new Map();
  for (const [handle, , list] of groups) {
    for (const h of list) if (known.has(h)) productCollections.set(h, [...(productCollections.get(h) ?? []), handle]);
  }

  console.log(`${products.length} products, ${groups.length} collections, images from ${IMAGE_BASE_URL}`);
  if (DRY_RUN) {
    const sample = productInput(products[0], { collectionIds: ['<id>'], locationId: store.locationId });
    console.log(JSON.stringify(sample, null, 2));
    return;
  }

  console.log('Collections');
  const collectionIds = new Map(groups.map(([h, t]) => [h, ensureCollection(h, t, store.collections)]));

  console.log('Products (bulk operation)');
  const lines = products.map((p) => productInput(p, {
    collectionIds: (productCollections.get(p.handle) ?? []).map((h) => collectionIds.get(h)),
    locationId: store.locationId,
  }));
  const results = await bulkMutation(`mutation($identifier: ProductSetIdentifiers, $input: ProductSetInput!) {
    productSet(identifier: $identifier, input: $input) { product { id handle } userErrors { field message } }
  }`, lines);

  const failed = results.filter((r) => r.data?.productSet?.userErrors?.length || !r.data?.productSet?.product);
  const productIds = results.map((r) => r.data?.productSet?.product?.id).filter(Boolean);
  console.log(`  ${productIds.length} saved, ${failed.length} failed`);
  for (const f of failed.slice(0, 20)) console.log('  ', JSON.stringify(f).slice(0, 300));

  console.log(`Publishing to ${HEADLESS_CHANNEL}`);
  const input = [{ publicationId: store.publicationId }];
  for (const id of collectionIds.values()) admin(PUBLISH, { id, input }, { mutation: true });
  const published = await bulkMutation(PUBLISH, productIds.map((id) => ({ id, input })));
  const unpublished = published.filter((r) => r.data?.publishablePublish?.userErrors?.length);
  console.log(`  ${productIds.length - unpublished.length} products published`);
  console.log('Done');
  if (failed.length) process.exit(1);
}

await main();
