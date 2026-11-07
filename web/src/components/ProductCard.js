'use client';
import Link from 'next/link';
import { money, percentOff } from '@/lib/data';
import { useCart } from './CartProvider';

export function Price({ p }) {
  if (!p.price) return <p className="price quiet">Price coming soon</p>;
  return (
    <p className="price">
      <b>{p.fromPrice ? 'From ' : ''}{money(p.price)}</b>
      {p.compare && <s>{money(p.compare)}</s>}
      {percentOff(p) > 0 && <span>{percentOff(p)}% off</span>}
    </p>
  );
}

export default function ProductCard({ p }) {
  const { add } = useCart();
  const buyable = p.price && !p.soldOut;
  return (
    <article className="card">
      <Link href={`/products/${p.handle}/`}>
        <div className="tile">
          <img src={p.image} alt={p.title} loading="lazy" />
          {p.soldOut && <span className="flag">Sold out</span>}
        </div>
        <h3>{p.title}</h3>
      </Link>
      <Price p={p} />
      {buyable && <button className="addline" aria-label={`Add ${p.title} to cart`} onClick={() => add(p)}>Add to cart</button>}
    </article>
  );
}
