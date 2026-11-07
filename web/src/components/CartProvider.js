'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

const Ctx = createContext(null);
const KEY = 'pmm_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY)) || []); } catch {}
  }, []);

  const save = (next) => {
    setItems(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  };

  const add = (p, qty = 1, show = true) => {
    const found = items.find((i) => i.handle === p.handle);
    save(found
      ? items.map((i) => (i === found ? { ...i, qty: i.qty + qty } : i))
      : [...items, { handle: p.handle, title: p.title, image: p.image, price: p.price, qty }]);
    if (show) {
      setToast(p.title);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), 3500);
    }
  };
  const setQty = (handle, qty) => save(items.map((i) => (i.handle === handle ? { ...i, qty: Math.max(1, qty) } : i)));
  const remove = (handle) => save(items.filter((i) => i.handle !== handle));

  const count = items.reduce((a, i) => a + i.qty, 0);
  const total = items.reduce((a, i) => a + i.qty * i.price, 0);
  return <Ctx.Provider value={{ items, add, setQty, remove, count, total, toast, setToast }}>{children}</Ctx.Provider>;
}
export const useCart = () => useContext(Ctx);
