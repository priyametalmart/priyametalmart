import Link from 'next/link';
import { heroBanner } from '@/lib/data';

// Text, button and image are edited in Shopify: Content > Metaobjects > Home banner > "hero".
export default function Hero() {
  const b = heroBanner ?? { heading: 'Iron Cookware Collection', button_label: 'Shop now' };
  const href = b.collection ? `/collections/${b.collection}/` : '/collections/all/';
  return (
    <section className="hero">
      <div className="hero-copy">
        <h1>{b.heading}</h1>
        {b.text && <p>{b.text}</p>}
        <Link className="btn" href={href}>{b.button_label || 'Shop now'}</Link>
      </div>
      <div className="hero-art">
        {b.image
          ? <img src={b.image} alt="" fetchPriority="high" />
          : <img src="/brand/hero.jpg" alt="Iron pan on a wooden kitchen table" width="1400" height="934" fetchPriority="high" />}
      </div>
    </section>
  );
}
