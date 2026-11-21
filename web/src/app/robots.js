import { INDEXABLE, SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export default function robots() {
  if (!INDEXABLE) return { rules: { userAgent: '*', disallow: '/' } };
  return { rules: { userAgent: '*', allow: '/', disallow: ['/cart/', '/search/'] }, sitemap: `${SITE_URL}/sitemap.xml` };
}
