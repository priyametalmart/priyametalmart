import { BRAND, policies } from '@/lib/data';

export const dynamicParams = false;
export const generateStaticParams = () => policies.map(([handle]) => ({ handle }));
const title = (h) => policies.find(([k]) => k === h)[1];
export async function generateMetadata({ params }) { return { title: title((await params).handle) }; }

export default async function Policy({ params }) {
  return <div className="shell page reading"><h1>{title((await params).handle)}</h1><p>To be written for {BRAND}.</p></div>;
}
