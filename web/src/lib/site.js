// Public site URL and launch switch. Set SITE_URL to the real domain and SITE_INDEXABLE=true at launch;
// until then search engines are kept out.
export const SITE_URL = (process.env.SITE_URL || 'https://priyametalmart.pages.dev').replace(/\/$/, '');
export const INDEXABLE = process.env.SITE_INDEXABLE === 'true';
