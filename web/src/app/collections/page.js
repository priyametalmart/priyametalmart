import Link from 'next/link';
import { menu } from '@/lib/data';

export const metadata = { title: 'Shop' };

export default function Collections() {
  return (
    <div className="shell page">
      <h1>Shop by category</h1>
      <div className="cats all">
        <Link href="/collections/all/"><span className="tile allp">All products</span>All products</Link>
        {menu.map((c) => <Link key={c.handle} href={`/collections/${c.handle}/`}><span className="tile"><img src={c.image} alt="" loading="lazy" /></span>{c.short}</Link>)}
      </div>
    </div>
  );
}
