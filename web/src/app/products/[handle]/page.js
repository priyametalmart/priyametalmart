import Link from 'next/link';
import AddToCart from '@/components/AddToCart';
import ProductCard, { Price } from '@/components/ProductCard';
import { BRAND, getProduct, productCollection, products, related, short } from '@/lib/data';

export const dynamicParams = false;
export const generateStaticParams = () => products.map((p) => ({ handle: p.handle }));
export async function generateMetadata({ params }) { return { title: getProduct((await params).handle).title }; }

export default async function Product({ params }) {
  const p = getProduct((await params).handle);
  const c = productCollection(p);
  return (
    <div className="shell page">
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/collections/">Shop</Link>{c && <> / <Link href={`/collections/${c.handle}/`}>{short[c.handle]}</Link></>}</nav>
      <div className="pdp">
        <div className="tile large"><img src={p.image} alt={p.title} /></div>
        <div className="pdp-info">
          <h1>{p.title}</h1>
          <Price p={p} />
          <p className="note">Tax included. Shipping calculated at checkout.</p>
          <AddToCart p={p} />
          {p.sizes && <p><b>Sizes and weights:</b> {p.sizes}</p>}
          <p>{p.desc || `Add this traditional piece to your kitchen. ${BRAND} delivers across India.`}</p>
          <details><summary>How to care for iron</summary><p>Wash with mild soap, dry on a low flame, then wipe with a little oil before you put it away.</p></details>
          <details><summary>Delivery</summary><p>Every order ships with tracking. Cash on Delivery is available.</p></details>
          <details><summary>Returns</summary><p>[Confirm with client: return terms.]</p></details>
        </div>
      </div>
      <section className="block"><h2>You may also like</h2><div className="grid">{related(p).map((x) => <ProductCard key={x.handle} p={x} />)}</div></section>
    </div>
  );
}
