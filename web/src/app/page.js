import Link from 'next/link';
import Hero from '@/components/Hero';
import { CashIcon, ReturnIcon, TruckIcon } from '@/components/Icons';
import ProductCard from '@/components/ProductCard';
import Rail from '@/components/Rail';
import { collectionProducts, getCollection, menu, percentOff, promoBanners, settings } from '@/lib/data';

export default function Home() {
  const priced = collectionProducts('all').filter((p) => p.price && !p.soldOut && !/cleaver/.test(p.handle));
  const best = collectionProducts('best-sellers').filter((p) => p.price && !p.soldOut && !/cleaver/.test(p.handle)).slice(0, 4);
  const used = new Set(best.map((p) => p.handle));
  const popular = priced.filter((p) => !used.has(p.handle)).slice(0, 8);
  const top = Math.max(...priced.map(percentOff));
  const kadai = getCollection('iron-kadai') ?? menu[0];
  return (
    <>
      <div className="shell top-grid">
        <aside className="catside" aria-label="All categories">
          <h2>Categories</h2>
          <nav>{menu.map((c) => <Link key={c.handle} href={`/collections/${c.handle}/`}>{c.short}<span aria-hidden="true">›</span></Link>)}</nav>
          <Link className="btn" href="/collections/all/">All products</Link>
        </aside>
        <Hero />
      </div>

      <section className="shell promos" aria-label="Offers">
        {promoBanners.map((b) => (
          <Link key={b.handle} href={`/collections/${b.collection}/`}>
            <div><h2>{b.heading}</h2>{b.text && <p>{b.text}</p>}<span className="btn small">{b.button_label || 'Shop now'}</span></div>
            <img src={b.image ?? getCollection(b.collection)?.image} alt="" loading="lazy" />
          </Link>
        ))}
      </section>

      <section className="shell home-cats">
        <div className="head center"><h2>Shop by category</h2></div>
        <div className="cats">{menu.map((c) => <Link key={c.handle} href={`/collections/${c.handle}/`}><span className="tile"><img src={c.image} alt="" loading="lazy" /></span>{c.short}</Link>)}</div>
      </section>

      <section className="shell home-list">
        <div className="head"><h2>Best sellers</h2><Link href="/collections/best-sellers/">View all</Link></div>
        <div className="grid">{best.map((p) => <ProductCard key={p.handle} p={p} />)}</div>
      </section>

      <section className="shell home-list">
        <div className="split">
          <div className="split-copy"><h2>Up to {top}% off selected products</h2><p>Offers across the store.</p><Link className="btn lightbtn" href="/collections/all/">Shop offers</Link></div>
          <div className="split-art"><img src={kadai.image} alt={kadai.short || 'Iron kadai'} loading="lazy" /></div>
        </div>
      </section>

      <section className="shell home-list" id="popular-products">
        <div className="head"><h2>Popular products</h2><Link href="/collections/all/">View all</Link></div>
        <Rail items={popular} />
      </section>

      <section className="shell trust" aria-label="Why shop with us">
        <div><CashIcon /><p><b>Cash on Delivery</b><span>Pay when it arrives</span></p></div>
        <div><TruckIcon /><p><b>Delivery across India</b><span>Tracked shipping</span></p></div>
        <div><ReturnIcon /><p><b>Easy returns</b><span>{settings.return_period ? `${settings.return_period} returns` : 'See our refund policy'}</span></p></div>
      </section>
    </>
  );
}
