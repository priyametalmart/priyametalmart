'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { menu } from '@/lib/data';
import { CloseIcon } from './Icons';

export default function CategorySheet({ current }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', esc);
    };
  }, [open]);
  return (
    <>
      <button className="catbtn" aria-haspopup="dialog" onClick={() => setOpen(true)}>Categories</button>
      {open && (
        <div className="scrim" onClick={() => setOpen(false)}>
          <div className="sheet" role="dialog" aria-label="Categories" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-head"><h2>Categories</h2><button aria-label="Close categories" onClick={() => setOpen(false)}><CloseIcon /></button></div>
            <div className="sheet-list">
              <Link href="/collections/all/" className={current === 'all' ? 'on' : ''} onClick={() => setOpen(false)}>All products</Link>
              {menu.map((c) => (
                <Link key={c.handle} href={`/collections/${c.handle}/`} className={current === c.handle ? 'on' : ''} onClick={() => setOpen(false)}>
                  <span className="mini"><img src={c.image} alt="" loading="lazy" /></span>{c.short}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
