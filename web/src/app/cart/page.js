'use client';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { money } from '@/lib/data';

export default function Cart() {
  const { items, setQty, remove, total } = useCart();
  if (!items.length) return <div className="shell page empty"><h1>Your cart is empty</h1><p>Add products from the shop to see them here.</p><Link className="btn" href="/collections/all/">Shop all products</Link></div>;
  return (
    <div className="shell page cartpage">
      <div>
        <h1>Your cart</h1>
        {items.map((i) => (
          <div className="line" key={i.handle}>
            <Link href={`/products/${i.handle}/`} className="tile thumb"><img src={i.image} alt="" /></Link>
            <div>
              <Link href={`/products/${i.handle}/`}>{i.title}</Link>
              <p><b>{money(i.price)}</b></p>
              <div className="line-actions">
                <div className="stepper small" role="group" aria-label="Quantity">
                  <button aria-label="Decrease quantity" onClick={() => setQty(i.handle, i.qty - 1)}>−</button><span>{i.qty}</span>
                  <button aria-label="Increase quantity" onClick={() => setQty(i.handle, i.qty + 1)}>+</button>
                </div>
                <button className="text-btn" onClick={() => remove(i.handle)}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <aside className="summary">
        <p className="total"><span>Total</span><b>{money(total)}</b></p>
        <p className="note">Tax included. Shipping calculated at checkout.</p>
        <button className="btn" disabled>Checkout opens at launch</button>
      </aside>
    </div>
  );
}
