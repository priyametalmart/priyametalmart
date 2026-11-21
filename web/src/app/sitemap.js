import { menu, pages, policies, products } from '@/lib/data';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap() {
  const paths = ['/', ...menu.map((c) => `/collections/${c.handle}/`), ...products.map((p) => `/products/${p.handle}/`),
    ...pages.map((p) => `/pages/${p.handle}/`), ...policies.map((p) => `/policies/${p.handle}/`)];
  return paths.map((p) => ({ url: SITE_URL + p }));
}
