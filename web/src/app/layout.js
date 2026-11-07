import '@fontsource-variable/bodoni-moda/index.css';
import '@fontsource-variable/hanken-grotesk/index.css';
import './globals.css';
import { CartProvider } from '@/components/CartProvider';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { BRAND } from '@/lib/data';

export const metadata = { title: { default: BRAND, template: `%s | ${BRAND}` }, description: 'Traditional iron and cast iron kitchenware, delivered across India.', robots: { index: false, follow: false } };

export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#f6f2ea' };

export default function RootLayout({ children }) {
  return (
    <html lang="en"><body><CartProvider>
      <Header /><main>{children}</main><Footer />
    </CartProvider></body></html>
  );
}
