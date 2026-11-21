// Shared settings for the Shopify scripts.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function readEnv(file) {
  try {
    return Object.fromEntries(readFileSync(file, 'utf8').split('\n')
      .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)).filter(Boolean).map((m) => [m[1], m[2]]));
  } catch {
    return {};
  }
}

const env = { ...readEnv(join(ROOT, 'web/.env.local')), ...process.env };
export const STORE_DOMAIN = env.SHOPIFY_STORE_DOMAIN;
if (!STORE_DOMAIN) throw new Error('SHOPIFY_STORE_DOMAIN is not set. Set it in web/.env.local (see web/.env.example).');

// Images are fetched by Shopify from the current preview site during import.
export const IMAGE_BASE_URL = env.IMPORT_IMAGE_BASE_URL || 'https://priyametalmart.pages.dev';
export const CATALOG_FILE = join(ROOT, 'scripts/shopify/seed/catalog.json');
export const VENDOR = 'Priya Metal Mart';
