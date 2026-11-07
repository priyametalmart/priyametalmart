import CollectionGrid from '@/components/CollectionGrid';
import { collectionProducts, collections, short } from '@/lib/data';

export const dynamicParams = false;
export const generateStaticParams = () => [{ handle: 'all' }, { handle: 'frontpage' }, ...collections.map((c) => ({ handle: c.handle }))];
const title = (h) => (h === 'all' ? 'All products' : h === 'frontpage' ? 'Popular right now' : short[h]);
export async function generateMetadata({ params }) { return { title: title((await params).handle) }; }

export default async function Collection({ params }) {
  const { handle } = await params;
  return (
    <div className="shell page">
      <h1>{title(handle)}</h1>
      <CollectionGrid items={collectionProducts(handle)} handle={handle} />
    </div>
  );
}
