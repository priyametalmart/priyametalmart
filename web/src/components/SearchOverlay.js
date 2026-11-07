'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { money, products } from '@/lib/data';
import { CloseIcon } from './Icons';

export default function SearchOverlay({ onClose }) {
  const [q, setQ] = useState('');
  const router = useRouter();
  const t = q.trim().toLowerCase();
  const found = t ? products.filter((p) => p.title.toLowerCase().includes(t)) : [];
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const esc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', esc);
    };
  }, [onClose]);
  return (
    <div className="search-layer" role="dialog" aria-label="Search products">
      <form className="shell search-form" onSubmit={(e) => { e.preventDefault(); onClose(); router.push(`/search/?q=${encodeURIComponent(q)}`); }}>
        <input autoFocus type="search" enterKeyHint="search" placeholder="Search kadai, tawa, knife" aria-label="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="button" aria-label="Close search" onClick={onClose}><CloseIcon /></button>
      </form>
      {!t && (
        <div className="shell search-popular"><p>Popular searches</p>{['Kadai', 'Dosa tawa', 'Knife', 'Paniyaram', 'Coconut'].map((w) => <button key={w} onClick={() => setQ(w)}>{w}</button>)}</div>
      )}
      {t && (
        <div className="shell search-results">
          {found.slice(0, 6).map((p) => (
            <Link key={p.handle} href={`/products/${p.handle}/`} onClick={onClose}>
              <span className="mini"><img src={p.image} alt="" /></span>
              <span>{p.title}<small>{p.price ? money(p.price) : 'Price coming soon'}</small></span>
            </Link>
          ))}
          {found.length === 0 && <p className="none">No products match “{q}”. Try a shorter word, like “tawa”.</p>}
          {found.length > 6 && <Link className="see-all" href={`/search/?q=${encodeURIComponent(q)}`} onClick={onClose}>See all {found.length} results</Link>}
        </div>
      )}
    </div>
  );
}
