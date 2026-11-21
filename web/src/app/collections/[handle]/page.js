import CollectionGrid from '@/components/CollectionGrid';
import { collectionProducts, collections, collectionTitle } from '@/lib/data';

export const dynamicParams = false;
export const generateStaticParams = () => [{ handle: 'all' }, ...collections.map((c) => ({ handle: c.handle }))];
export async function generateMetadata({ params }) { return { title: collectionTitle((await params).handle) }; }

export default async function Collection({ params }) {
  const { handle } = await params;
  return (
    <div className="shell page">
      <h1>{collectionTitle(handle)}</h1>
      <CollectionGrid items={collectionProducts(handle)} handle={handle} />
    </div>
  );
}
