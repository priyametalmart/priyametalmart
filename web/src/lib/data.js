// Store data for the static build. Products, collections, banners, policies and contact details come
// from Shopify (synced into src/data/shopify.json by scripts/sync-shopify.mjs). Pages fall back to
// src/content/pages.json until the client creates them in Shopify.
import shopify from '@/data/shopify.json';
import fallbackPages from '@/content/pages.json';

export const BRAND = shopify.shop.name;
export const settings = shopify.settings;
export const storefront = shopify.storefront;

// Shopify's built-in "Home page" collection is not used by this site.
const HIDDEN = new Set(['frontpage']);
// Collections that are not product categories.
const SPECIAL = new Set(['best-sellers']);
// Menu order for the original categories. Categories the client adds later appear after these, A to Z.
const MENU_ORDER = ['iron-kadai', 'vegetable-cutter', 'rat-trap', 'knife', 'billhook', 'iron-tawa', 'paniyaram-pan-paddu-pan',
  'pooja-items', 'sieve', 'kitchen-essentials', 'baby-products', 'mortar-and-pestle', 'gardening-tool'];

function toProduct(p) {
  const buyable = p.variants.filter((v) => v.available);
  const pool = buyable.length ? buyable : p.variants;
  const cheapest = pool.reduce((a, b) => (b.price < a.price ? b : a));
  return {
    handle: p.handle,
    title: p.title,
    image: p.images[0]?.url ?? null,
    images: p.images,
    description: p.description,
    options: p.options,
    variants: p.variants,
    price: cheapest.price,
    compare: cheapest.compare && cheapest.compare > cheapest.price ? cheapest.compare : null,
    fromPrice: new Set(pool.map((v) => v.price)).size > 1,
    soldOut: !buyable.length,
    collections: p.collections,
  };
}

export const products = shopify.products.map(toProduct);
const byHandle = new Map(products.map((p) => [p.handle, p]));
export const getProduct = (h) => byHandle.get(h);
export const getProducts = (hs) => hs.map(getProduct).filter(Boolean);

export const collections = shopify.collections
  .filter((c) => c.products.length && !HIDDEN.has(c.handle))
  .map((c) => ({ ...c, short: c.title, image: c.image ?? getProducts(c.products).find((p) => p.image)?.image ?? null }));
export const getCollection = (h) => collections.find((c) => c.handle === h);

const rank = (h) => (MENU_ORDER.includes(h) ? MENU_ORDER.indexOf(h) : MENU_ORDER.length);
export const menu = collections
  .filter((c) => !SPECIAL.has(c.handle))
  .sort((a, b) => rank(a.handle) - rank(b.handle) || a.title.localeCompare(b.title));

const buyableFirst = (l) => [...l.filter((p) => !p.soldOut), ...l.filter((p) => p.soldOut)];
export const collectionProducts = (h) => buyableFirst(h === 'all' ? products : getProducts(getCollection(h)?.products ?? []));
export const collectionTitle = (h) => (h === 'all' ? 'All products' : getCollection(h)?.title ?? h);

export const productCollection = (p) => menu.find((c) => p.collections.includes(c.handle));
export const related = (p, n = 4) => collectionProducts(productCollection(p)?.handle ?? 'all').filter((x) => x.handle !== p.handle).slice(0, n);

export const heroBanner = shopify.banners.find((b) => b.placement === 'Hero');
export const promoBanners = shopify.banners.filter((b) => b.placement === 'Promo card' && b.collection);

const shopifyPages = new Map(shopify.pages.map((p) => [p.handle, { handle: p.handle, title: p.title, html: p.body }]));
export const pages = [...fallbackPages.filter((p) => !shopifyPages.has(p.handle)), ...shopifyPages.values()]
  .filter((p) => p.handle !== 'contact');

const POLICY_TITLES = [['refund-policy', 'Refund Policy'], ['privacy-policy', 'Privacy Policy'], ['shipping-policy', 'Shipping Policy'], ['terms-of-service', 'Terms of Service']];
export const policies = POLICY_TITLES.map(([handle, title]) => {
  const p = shopify.policies.find((x) => x.handle === handle);
  return { handle, title: p?.title ?? title, html: p?.body ?? null };
});

export const money = (n) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
export const percentOff = (p) => (p.compare && p.price ? Math.round((1 - p.price / p.compare) * 100) : 0);
