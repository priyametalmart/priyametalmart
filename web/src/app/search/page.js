'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ProductCard from '@/components/ProductCard';
import { products } from '@/lib/data';

function Results() {
  const q = (useSearchParams().get('q') || '').trim();
  const found = q ? products.filter((p) => p.title.toLowerCase().includes(q.toLowerCase())) : [];
  return (
    <>
      <p>{found.length === 1 ? '1 result' : `${found.length} results`} for “{q}”</p>
      <div className="grid">{found.map((p) => <ProductCard key={p.handle} p={p} />)}</div>
    </>
  );
}

export default function Search() {
  return <div className="shell page"><h1>Search results</h1><Suspense><Results /></Suspense></div>;
}
