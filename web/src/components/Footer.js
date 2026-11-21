import Link from 'next/link';
import { BRAND, menu, policies, settings } from '@/lib/data';

export default function Footer() {
  return (
    <footer className="foot">
      <div className="shell foot-cols">
        <div className="foot-brand">
          <p className="logo">{BRAND}</p>
          {settings.address && <p>{settings.address}</p>}
          {settings.phone && <p><a href={`tel:${settings.phone.replace(/\s/g, '')}`}>{settings.phone}</a></p>}
          {settings.email && <p><a href={`mailto:${settings.email}`}>{settings.email}</a></p>}
        </div>
        <div><h3>Shop</h3>{menu.slice(0, 6).map((c) => <Link key={c.handle} href={`/collections/${c.handle}/`}>{c.short}</Link>)}</div>
        <div><h3>Help</h3><Link href="/pages/contact/">Contact us</Link><Link href="/pages/faq/">FAQ</Link><Link href="/pages/delivery-time/">Delivery times</Link><Link href="/pages/track-your-order/">Track your order</Link></div>
        <div><h3>Policies</h3>{policies.map((p) => <Link key={p.handle} href={`/policies/${p.handle}/`}>{p.title}</Link>)}</div>
      </div>
      <div className="shell foot-end">© {new Date().getFullYear()} {BRAND}</div>
    </footer>
  );
}
