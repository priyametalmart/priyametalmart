'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

const Ctx = createContext(null);
// v2: cart lines are stored per Shopify variant. Older saved carts are ignored.
const KEY = 'pmm_cart_v2';

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  useEffect(() => { setItems(read()); }, []);

  const save = (next) => {
    setItems(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  };

  // `variant` defaults to the product's cheapest buyable variant.
  const add = (p, qty = 1, show = true, variant = p.variants.find((v) => v.available && v.price === p.price) ?? p.variants[0]) => {
    const found = items.find((i) => i.variantId === variant.id);
    save(found
      ? items.map((i) => (i === found ? { ...i, qty: i.qty + qty } : i))
      : [...items, {
        variantId: variant.id, handle: p.handle, title: p.title, image: p.image, price: variant.price, qty,
        variantTitle: p.variants.length > 1 ? variant.title : null,
      }]);
    if (show) {
      setToast(p.title);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), 3500);
    }
  };
  const setQty = (id, qty) => save(items.map((i) => (i.variantId === id ? { ...i, qty: Math.max(1, qty) } : i)));
  const remove = (id) => save(items.filter((i) => i.variantId !== id));

  const count = items.reduce((a, i) => a + i.qty, 0);
  const total = items.reduce((a, i) => a + i.qty * i.price, 0);
  return <Ctx.Provider value={{ items, add, setQty, remove, count, total, toast, setToast }}>{children}</Ctx.Provider>;
}
export const useCart = () => useContext(Ctx);
