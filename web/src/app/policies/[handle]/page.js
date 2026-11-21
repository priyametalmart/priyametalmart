import { policies } from '@/lib/data';

export const dynamicParams = false;
export const generateStaticParams = () => policies.map((p) => ({ handle: p.handle }));
const get = (h) => policies.find((p) => p.handle === h);
export async function generateMetadata({ params }) { return { title: get((await params).handle).title }; }

export default async function Policy({ params }) {
  const p = get((await params).handle);
  return (
    <div className="shell page reading">
      <h1>{p.title}</h1>
      {p.html ? <div className="rte" dangerouslySetInnerHTML={{ __html: p.html }} /> : <p>This policy is being updated. Please contact us with any questions.</p>}
    </div>
  );
}
