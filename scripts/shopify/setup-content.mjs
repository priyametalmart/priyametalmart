#!/usr/bin/env node
// Creates the editable site content in Shopify (Content > Metaobjects in the admin):
//   - "Site settings": phone, WhatsApp, email, address, return period
//   - "Home banners": the hero and the promo cards on the home page
// Safe to run again: existing definitions and entries are left untouched.
//
// Usage: node scripts/shopify/setup-content.mjs
import { admin } from './lib/admin.mjs';

const DEFINITIONS = [
  {
    type: 'site_settings',
    name: 'Site settings',
    fieldDefinitions: [
      { key: 'phone', name: 'Phone', type: 'single_line_text_field' },
      { key: 'whatsapp', name: 'WhatsApp number', type: 'single_line_text_field' },
      { key: 'email', name: 'Email', type: 'single_line_text_field' },
      { key: 'address', name: 'Shop address', type: 'multi_line_text_field' },
      { key: 'return_period', name: 'Return period', type: 'single_line_text_field', description: 'For example "7 days". Shown on the home page and product pages.' },
    ],
  },
  {
    type: 'home_banner',
    name: 'Home banner',
    displayNameKey: 'heading',
    fieldDefinitions: [
      { key: 'placement', name: 'Placement', type: 'single_line_text_field', required: true,
        validations: [{ name: 'choices', value: JSON.stringify(['Hero', 'Promo card']) }] },
      { key: 'heading', name: 'Heading', type: 'single_line_text_field', required: true },
      { key: 'text', name: 'Text', type: 'single_line_text_field' },
      { key: 'button_label', name: 'Button label', type: 'single_line_text_field' },
      { key: 'collection', name: 'Links to collection', type: 'collection_reference' },
      { key: 'image', name: 'Image', type: 'file_reference', validations: [{ name: 'file_type_options', value: JSON.stringify(['Image']) }] },
      { key: 'position', name: 'Order', type: 'number_integer', description: 'Lower numbers show first.' },
    ],
  },
];

function existingTypes() {
  const { metaobjectDefinitions } = admin('{ metaobjectDefinitions(first: 50) { nodes { type } } }');
  return new Set(metaobjectDefinitions.nodes.map((d) => d.type));
}

function createDefinition(def) {
  admin(`mutation($definition: MetaobjectDefinitionCreateInput!) {
    metaobjectDefinitionCreate(definition: $definition) { metaobjectDefinition { id } userErrors { field message } }
  }`, {
    definition: {
      ...def,
      access: { storefront: 'PUBLIC_READ' },
      capabilities: { publishable: { enabled: true } },
    },
  }, { mutation: true });
  console.log(`  created definition ${def.type}`);
}

function upsertEntry(type, handle, fields) {
  admin(`mutation($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
    metaobjectUpsert(handle: $handle, metaobject: $metaobject) { metaobject { id } userErrors { field message } }
  }`, {
    handle: { type, handle },
    metaobject: {
      fields: Object.entries(fields).map(([key, value]) => ({ key, value: String(value) })),
      capabilities: { publishable: { status: 'ACTIVE' } },
    },
  }, { mutation: true });
  console.log(`  saved ${type}/${handle}`);
}

function entryExists(type, handle) {
  return Boolean(admin('query($h: MetaobjectHandleInput!) { metaobjectByHandle(handle: $h) { id } }',
    { h: { type, handle } }).metaobjectByHandle);
}

function collectionId(handle) {
  return admin('query($h: String!) { collectionByHandle(handle: $h) { id } }', { h: handle }).collectionByHandle?.id;
}

const types = existingTypes();
console.log('Definitions');
for (const def of DEFINITIONS) if (!types.has(def.type)) createDefinition(def);

// Starting content, matching what the site showed before. The client edits these in Shopify afterwards.
const ENTRIES = [
  ['site_settings', 'main', {}],
  ['home_banner', 'hero', { placement: 'Hero', heading: 'Iron Cookware Collection',
    text: 'Kadais, tawas and kitchen tools, delivered across India.', button_label: 'Shop now', position: 1 }],
  ['home_banner', 'promo-dosa-tawas', { placement: 'Promo card', heading: 'Dosa tawas', text: 'For crisp dosas and soft chapatis',
    button_label: 'Shop now', collection: collectionId('iron-tawa'), position: 2 }],
  ['home_banner', 'promo-cutters', { placement: 'Promo card', heading: 'Cutters and scrapers', text: 'Traditional tools for daily prep',
    button_label: 'Shop now', collection: collectionId('vegetable-cutter'), position: 3 }],
];

console.log('Entries');
for (const [type, handle, fields] of ENTRIES) {
  if (entryExists(type, handle)) continue;
  upsertEntry(type, handle, Object.fromEntries(Object.entries(fields).filter(([, v]) => v != null)));
}
console.log('Done');
