'use client';
import { useRef } from 'react';
import ProductCard from './ProductCard';

export default function Rail({ items }) {
  const ref = useRef(null);
  const go = (d) => ref.current.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: 'smooth' });
  return (
    <div className="railwrap">
      <button className="railbtn prev" aria-label="Previous products" onClick={() => go(-1)}>‹</button>
      <div className="rail" ref={ref}>{items.map((p) => <ProductCard key={p.handle} p={p} />)}</div>
      <button className="railbtn next" aria-label="Next products" onClick={() => go(1)}>›</button>
    </div>
  );
}
