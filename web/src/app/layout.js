import '@fontsource-variable/bodoni-moda/index.css';
import '@fontsource-variable/hanken-grotesk/index.css';
import './globals.css';
import { CartProvider } from '@/components/CartProvider';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { BRAND } from '@/lib/data';
import { INDEXABLE, SITE_URL } from '@/lib/site';

const description = 'Traditional iron and cast iron kitchenware, delivered across India.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: BRAND, template: `%s | ${BRAND}` },
  description,
  openGraph: { siteName: BRAND, type: 'website', locale: 'en_IN', description, images: ['/brand/hero.jpg'] },
  robots: INDEXABLE ? undefined : { index: false, follow: false },
};

export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#f6f2ea' };

export default function RootLayout({ children }) {
  return (
    <html lang="en"><body><CartProvider>
      <Header /><main>{children}</main><Footer />
    </CartProvider></body></html>
  );
}
