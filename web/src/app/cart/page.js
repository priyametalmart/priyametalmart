'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { createCheckout } from '@/lib/checkout';
import { money } from '@/lib/data';

export default function Cart() {
  const { items, setQty, remove, total } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const checkout = async () => {
    setBusy(true);
    setError(null);
    try {
      window.location.href = await createCheckout(items);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  if (!items.length) return <div className="shell page empty"><h1>Your cart is empty</h1><p>Add products from the shop to see them here.</p><Link className="btn" href="/collections/all/">Shop all products</Link></div>;
  return (
    <div className="shell page cartpage">
      <div>
        <h1>Your cart</h1>
        {items.map((i) => (
          <div className="line" key={i.variantId}>
            <Link href={`/products/${i.handle}/`} className="tile thumb"><img src={i.image} alt="" /></Link>
            <div>
              <Link href={`/products/${i.handle}/`}>{i.title}</Link>
              {i.variantTitle && <p>{i.variantTitle}</p>}
              <p><b>{money(i.price)}</b></p>
              <div className="line-actions">
                <div className="stepper small" role="group" aria-label="Quantity">
                  <button aria-label="Decrease quantity" onClick={() => setQty(i.variantId, i.qty - 1)}>−</button><span>{i.qty}</span>
                  <button aria-label="Increase quantity" onClick={() => setQty(i.variantId, i.qty + 1)}>+</button>
                </div>
                <button className="text-btn" onClick={() => remove(i.variantId)}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <aside className="summary">
        <p className="total"><span>Total</span><b>{money(total)}</b></p>
        <p className="note">Tax included. Shipping calculated at checkout.</p>
        <button className="btn" onClick={checkout} disabled={busy}>{busy ? 'Opening checkout…' : 'Checkout'}</button>
        {error && <p className="checkout-error" role="alert">{error}</p>}
      </aside>
    </div>
  );
}
