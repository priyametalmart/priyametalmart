import data from '@/data/catalog.json';

export const BRAND = 'Priya Metal Mart';
export const PHONE = '+91 00000 00000';
export const EMAIL = 'hello@example.com';

export const products = data.products;
export const collections = data.collections.filter((c) => c.handle !== 'frontpage');
export const home = data.home;
export const pages = data.pages;

export const short = { 'iron-kadai': 'Kadai and woks', 'vegetable-cutter': 'Cutters and scrapers', 'rat-trap': 'Rat traps', knife: 'Knives', billhook: 'Billhooks', 'iron-tawa': 'Dosa tawas', 'paniyaram-pan-paddu-pan': 'Paniyaram pans', 'pooja-items': 'Pooja items', sieve: 'Sieves', 'kitchen-essentials': 'Kitchen essentials', 'baby-products': 'Baby products', 'mortar-and-pestle': 'Mortar and pestle', 'gardening-tool': 'Garden tools', 'brass-product-collection': 'Brass' };

export const menu = [
  'iron-kadai', 'vegetable-cutter', 'rat-trap', 'knife', 'billhook', 'iron-tawa', 'paniyaram-pan-paddu-pan',
  'pooja-items', 'sieve', 'kitchen-essentials', 'baby-products', 'mortar-and-pestle', 'gardening-tool', 'brass-product-collection',
].map((h) => collections.find((c) => c.handle === h)).filter((c) => c && (data.members[c.handle] || []).length).map((c) => ({ ...c, short: short[c.handle] }));

export const policies = [
  ['refund-policy', 'Refund Policy'], ['privacy-policy', 'Privacy Policy'], ['shipping-policy', 'Shipping Policy'],
  ['terms-of-service', 'Terms of Service'], ['contact-information', 'Contact Information'],
];

const byHandle = new Map(products.map((p) => [p.handle, p]));
export const getProduct = (h) => byHandle.get(h);
export const getProducts = (hs) => hs.map(getProduct).filter(Boolean);
export const getCollection = (h) => data.collections.find((c) => c.handle === h);
const buyableFirst = (l) => [...l.filter((p) => p.price && !p.soldOut), ...l.filter((p) => !p.price || p.soldOut)];
export const collectionProducts = (h) => buyableFirst(h === 'all' ? products : getProducts(data.members[h] || []));
export const money = (n) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
export const percentOff = (p) => (p.compare && p.price ? Math.round((1 - p.price / p.compare) * 100) : 0);

export const related = (p, n = 4) => {
  const c = data.collections.find((x) => x.handle !== 'frontpage' && (data.members[x.handle] || []).includes(p.handle));
  return collectionProducts(c?.handle || 'frontpage').filter((x) => x.handle !== p.handle).slice(0, n);
};
export const productCollection = (p) => collections.find((c) => (data.members[c.handle] || []).includes(p.handle));
