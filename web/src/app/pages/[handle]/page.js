import { pages } from '@/lib/data';

export const dynamicParams = false;
export const generateStaticParams = () => [...pages.map((p) => ({ handle: p.handle })), { handle: 'track-your-order' }];
const get = (h) => pages.find((p) => p.handle === h) || { title: 'Track your order', html: '<p>Enter your order number here once orders are live.</p>' };
export async function generateMetadata({ params }) { return { title: get((await params).handle).title }; }

export default async function Page({ params }) {
  const p = get((await params).handle);
  return <div className="shell page reading"><h1>{p.title}</h1><div className="rte" dangerouslySetInnerHTML={{ __html: p.html }} /></div>;
}
