import Link from 'next/link';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <h1>Iron Cookware Collection</h1>
        <p>Kadais, tawas and kitchen tools, delivered across India.</p>
        <Link className="btn" href="/collections/all/">Shop now</Link>
      </div>
      <div className="hero-art"><img src="/brand/hero.jpg" alt="Iron pan on a wooden kitchen table" width="1400" height="934" fetchPriority="high" /></div>
    </section>
  );
}
