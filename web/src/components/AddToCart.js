'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { money } from '@/lib/data';
import { useCart } from './CartProvider';

export default function AddToCart({ p }) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [variantId, setVariantId] = useState((p.variants.find((v) => v.available) ?? p.variants[0]).id);
  const variant = p.variants.find((v) => v.id === variantId);
  const chooser = p.variants.length > 1;

  return (
    <>
      {chooser && (
        <fieldset className="sizes">
          <legend>{p.options.map((o) => o.name).join(' / ') || 'Size'}</legend>
          {p.variants.map((v) => (
            <label key={v.id} className={v.available ? '' : 'out'}>
              <input type="radio" name="variant" value={v.id} checked={v.id === variantId} disabled={!v.available} onChange={() => setVariantId(v.id)} />
              <span>{v.title}<small>{v.available ? money(v.price) : 'Sold out'}</small></span>
            </label>
          ))}
        </fieldset>
      )}
      {!variant.available ? <button className="btn" disabled>Sold out</button> : (
        <>
          <div className="stepper" role="group" aria-label="Quantity">
            <button aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span>{qty}</span>
            <button aria-label="Increase quantity" onClick={() => setQty(qty + 1)}>+</button>
          </div>
          <div className="buybar">
            <div className="buybar-in">
              <b>{money(variant.price * qty)}</b>
              <button className="btn" onClick={() => add(p, qty, true, variant)}>Add to cart</button>
              <button className="btn alt" onClick={() => { add(p, qty, false, variant); router.push('/cart/'); }}>Buy now</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
