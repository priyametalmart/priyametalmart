'use client';
import { useMemo, useState } from 'react';
import CategorySheet from './CategorySheet';
import ProductCard from './ProductCard';

const STEP = 24;
const SORTS = {
  featured: () => 0,
  'price-asc': (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
  'price-desc': (a, b) => (b.price ?? -1) - (a.price ?? -1),
  'title-asc': (a, b) => a.title.localeCompare(b.title),
};

export default function CollectionGrid({ items, handle }) {
  const [sort, setSort] = useState('featured');
  const [shown, setShown] = useState(STEP);
  const sorted = useMemo(() => [...items].sort(SORTS[sort]), [items, sort]);
  return (
    <>
      <div className="listbar">
        <CategorySheet current={handle} />
        <span className="count">{items.length} {items.length === 1 ? 'product' : 'products'}</span>
        <label><span className="vh">Sort by</span>
          <select value={sort} onChange={(e) => { setSort(e.target.value); setShown(STEP); }}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price, low to high</option>
            <option value="price-desc">Price, high to low</option>
            <option value="title-asc">Name, A to Z</option>
          </select>
        </label>
      </div>
      <div className="grid">{sorted.slice(0, shown).map((p) => <ProductCard key={p.handle} p={p} />)}</div>
      {shown < sorted.length && <div className="more"><button className="btn alt" onClick={() => setShown(shown + STEP)}>Show more products</button></div>}
    </>
  );
}
