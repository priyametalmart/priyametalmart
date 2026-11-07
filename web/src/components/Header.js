'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { BRAND } from '@/lib/data';
import { useCart } from './CartProvider';
import { CartIcon, HelpIcon, HomeIcon, SearchIcon, ShopIcon } from './Icons';
import SearchOverlay from './SearchOverlay';

export default function Header() {
  const { count, toast, setToast } = useCart();
  const path = usePathname();
  const [search, setSearch] = useState(false);
  useEffect(() => setToast(null), [path, setToast]);
  const on = (t) => (t ? 'on' : '');
  return (
    <>
      <p className="announce">Cash on Delivery available across India</p>
      <header className="top">
        <div className="shell top-in">
          <Link href="/" className="logo">{BRAND}</Link>
          <nav className="toplinks" aria-label="Main">
            <Link href="/collections/all/">Shop</Link>
            <Link href="/collections/">Categories</Link>
            <Link href="/pages/about-us/">About</Link>
            <Link href="/pages/contact/">Contact</Link>
          </nav>
          <div className="topicons">
            <button className="ic" aria-label="Search" onClick={() => setSearch(true)}><SearchIcon /></button>
            <Link href="/cart/" className="ic topcart" aria-label={`Cart, ${count} items`}><CartIcon />{count > 0 && <b>{count}</b>}</Link>
          </div>
        </div>
      </header>
      {search && <SearchOverlay onClose={() => setSearch(false)} />}
      {toast && (
        <div className={`toast${path.startsWith('/products/') ? ' raised' : ''}`} role="status">
          <span>Added to cart</span><Link href="/cart/">View cart</Link>
        </div>
      )}
      {!path.startsWith('/products/') && (
        <nav className="tabs" aria-label="Primary">
          <Link href="/" className={on(path === '/')}><HomeIcon />Home</Link>
          <Link href="/collections/" className={on(path.startsWith('/collections'))}><ShopIcon />Shop</Link>
          <button onClick={() => setSearch(true)}><SearchIcon />Search</button>
          <Link href="/cart/" className={on(path.startsWith('/cart'))}><span className="tabcart"><CartIcon />{count > 0 && <b>{count}</b>}</span>Cart</Link>
          <Link href="/pages/contact/" className={on(path.startsWith('/pages'))}><HelpIcon />Help</Link>
        </nav>
      )}
    </>
  );
}
