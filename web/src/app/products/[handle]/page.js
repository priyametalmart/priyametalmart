import Link from 'next/link';
import AddToCart from '@/components/AddToCart';
import ProductCard, { Price } from '@/components/ProductCard';
import { BRAND, getProduct, productCollection, products, related, settings } from '@/lib/data';

export const dynamicParams = false;
export const generateStaticParams = () => products.map((p) => ({ handle: p.handle }));
export async function generateMetadata({ params }) {
  const p = getProduct((await params).handle);
  const text = p.description || `Buy ${p.title} online from Priya Metal Mart.`;
  const description = text.length > 160 ? `${text.slice(0, 157).replace(/\s+\S*$/, '')}...` : text;
  return { title: p.title, description, alternates: { canonical: `/products/${p.handle}/` },
    openGraph: { title: p.title, description, url: `/products/${p.handle}/`, images: p.image ? [p.image] : undefined } };
}

export default async function Product({ params }) {
  const p = getProduct((await params).handle);
  const c = productCollection(p);
  return (
    <div className="shell page">
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/collections/">Shop</Link>{c && <> / <Link href={`/collections/${c.handle}/`}>{c.title}</Link></>}</nav>
      <div className="pdp">
        <div className="tile large">{p.image && <img src={p.image} alt={p.images[0]?.alt || p.title} />}</div>
        <div className="pdp-info">
          <h1>{p.title}</h1>
          <Price p={p} />
          <p className="note">Tax included. Shipping calculated at checkout.</p>
          <AddToCart p={p} />
          {p.description
            ? <div className="rte" dangerouslySetInnerHTML={{ __html: p.description }} />
            : <p>Add this traditional piece to your kitchen. {BRAND} delivers across India.</p>}
          <details><summary>How to care for iron</summary><p>Wash with mild soap, dry on a low flame, then wipe with a little oil before you put it away.</p></details>
          <details><summary>Delivery</summary><p>Every order ships with tracking. See our <Link href="/policies/shipping-policy/">shipping policy</Link>.</p></details>
          <details><summary>Returns</summary><p>{settings.return_period ? `Returns accepted within ${settings.return_period}. ` : ''}See our <Link href="/policies/refund-policy/">refund policy</Link>.</p></details>
        </div>
      </div>
      <section className="block"><h2>You may also like</h2><div className="grid">{related(p).map((x) => <ProductCard key={x.handle} p={x} />)}</div></section>
    </div>
  );
}
