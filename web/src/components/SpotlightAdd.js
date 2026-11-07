'use client';
import { useCart } from './CartProvider';

export default function SpotlightAdd({ p }) {
  const { add } = useCart();
  return <button className="btn alt" onClick={() => add(p)}>Add to cart</button>;
}
