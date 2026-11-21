#!/usr/bin/env node
// Downloads the catalog and editable content from Shopify's Storefront API into
// src/data/shopify.json, which the static build reads. Runs before `dev` and `build`.
//
// Needs SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_PUBLIC_TOKEN (from .env.local or the environment).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/data/shopify.json');
const API_VERSION = '2026-10';
const IMAGE_WIDTH = 900;

function loadEnv() {
  try {
    for (const line of readFileSync(join(ROOT, '.env.local'), 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
    }
  } catch {}
}
loadEnv();

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN;
if (!DOMAIN || !TOKEN) {
  console.error('Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_PUBLIC_TOKEN. Copy .env.example to .env.local.');
  process.exit(1);
}

async function storefront(query, variables = {}) {
  const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(`Storefront API: ${res.status} ${JSON.stringify(json.errors ?? json)}`);
  return json.data;
}

async function paginate(field, query) {
  const nodes = [];
  let after = null;
  do {
    const page = (await storefront(query, { after }))[field];
    nodes.push(...page.nodes);
    after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (after);
  return nodes;
}

const IMAGE = `url(transform: { maxWidth: ${IMAGE_WIDTH} }) altText`;
const MONEY = 'amount';

const products = await paginate('products', `query($after: String) {
  products(first: 250, after: $after) {
    pageInfo { hasNextPage endCursor }
    nodes {
      handle title descriptionHtml tags
      images(first: 10) { nodes { ${IMAGE} } }
      options { name optionValues { name } }
      variants(first: 100) { nodes { id title availableForSale price { ${MONEY} } compareAtPrice { ${MONEY} } selectedOptions { name value } } }
      collections(first: 20) { nodes { handle } }
    }
  }
}`);

const collections = await paginate('collections', `query($after: String) {
  collections(first: 250, after: $after) {
    pageInfo { hasNextPage endCursor }
    nodes { handle title image { ${IMAGE} } products(first: 250) { nodes { handle } } }
  }
}`);

const { shop, pages } = await storefront(`{
  shop {
    name
    privacyPolicy { handle title body }
    refundPolicy { handle title body }
    shippingPolicy { handle title body }
    termsOfService { handle title body }
  }
  pages(first: 100) { nodes { handle title body } }
}`);

const fieldsOf = (m) => Object.fromEntries(m.fields.map((f) => [f.key, f.reference?.image?.url ?? f.reference?.handle ?? f.value]));
const metaobjects = async (type) => (await storefront(`query($type: String!) {
  metaobjects(type: $type, first: 50) {
    nodes { handle fields { key value reference { ... on MediaImage { image { ${IMAGE} } } ... on Collection { handle } } } }
  }
}`, { type })).metaobjects.nodes.map((m) => ({ handle: m.handle, ...fieldsOf(m) }));

const settings = (await metaobjects('site_settings'))[0] ?? {};
const banners = (await metaobjects('home_banner')).sort((a, b) => Number(a.position ?? 99) - Number(b.position ?? 99));

const num = (m) => (m ? Number(m.amount) : null);
const data = {
  syncedAt: new Date().toISOString(),
  // The public Storefront token is designed to be shipped to browsers; the cart uses it for checkout.
  storefront: { domain: DOMAIN, token: TOKEN, apiVersion: API_VERSION },
  shop: { name: shop.name },
  settings,
  banners,
  products: products.map((p) => {
    const variants = p.variants.nodes.map((v) => ({
      id: v.id,
      title: v.title,
      price: num(v.price),
      compare: num(v.compareAtPrice),
      available: v.availableForSale,
      options: v.selectedOptions,
    }));
    return {
      handle: p.handle,
      title: p.title,
      description: p.descriptionHtml,
      tags: p.tags,
      images: p.images.nodes.map((i) => ({ url: i.url, alt: i.altText })),
      options: p.options.filter((o) => !(o.name === 'Title' && o.optionValues.length === 1)).map((o) => ({ name: o.name, values: o.optionValues.map((v) => v.name) })),
      variants,
      collections: p.collections.nodes.map((c) => c.handle),
    };
  }),
  collections: collections.map((c) => ({ handle: c.handle, title: c.title, image: c.image?.url ?? null, products: c.products.nodes.map((p) => p.handle) })),
  policies: [shop.refundPolicy, shop.privacyPolicy, shop.shippingPolicy, shop.termsOfService].filter(Boolean),
  pages: pages.nodes,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(data));
console.log(`Synced ${data.products.length} products, ${data.collections.length} collections, ${data.banners.length} banners from ${DOMAIN}`);
