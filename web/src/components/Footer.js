import Link from 'next/link';
import { BRAND, EMAIL, PHONE, menu, policies } from '@/lib/data';

export default function Footer() {
  return (
    <footer className="foot">
      <div className="shell foot-cols">
        <div className="foot-brand"><p className="logo">{BRAND}</p><p>[Shop address]</p><p>{PHONE}</p><p>{EMAIL}</p></div>
        <div><h3>Shop</h3>{menu.slice(0, 6).map((c) => <Link key={c.handle} href={`/collections/${c.handle}/`}>{c.short}</Link>)}</div>
        <div><h3>Help</h3><Link href="/pages/contact/">Contact us</Link><Link href="/pages/faq/">FAQ</Link><Link href="/pages/delivery-time/">Delivery times</Link><Link href="/pages/track-your-order/">Track your order</Link></div>
        <div><h3>Policies</h3>{policies.slice(0, 4).map(([k, t]) => <Link key={k} href={`/policies/${k}/`}>{t}</Link>)}</div>
      </div>
      <div className="shell foot-end">© {new Date().getFullYear()} {BRAND}</div>
    </footer>
  );
}
