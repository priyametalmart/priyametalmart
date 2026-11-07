'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { money } from '@/lib/data';
import { useCart } from './CartProvider';

export default function AddToCart({ p }) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  if (p.soldOut) return <button className="btn" disabled>Sold out</button>;
  if (!p.price) return <button className="btn" disabled>Price coming soon</button>;
  return (
    <>
      <div className="stepper" role="group" aria-label="Quantity">
        <button aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span>{qty}</span>
        <button aria-label="Increase quantity" onClick={() => setQty(qty + 1)}>+</button>
      </div>
      <div className="buybar">
        <div className="buybar-in">
          <b>{money(p.price * qty)}</b>
          <button className="btn" onClick={() => add(p, qty)}>Add to cart</button>
          <button className="btn alt" onClick={() => { add(p, qty, false); router.push('/cart/'); }}>Buy now</button>
        </div>
      </div>
    </>
  );
}
