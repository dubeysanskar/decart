'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Search, ImageOff } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

export type ProductRow = {
  slug: string;
  code: string;
  name: string;
  family: string;
  status: string;
  featured: boolean;
  bestSeller: boolean;
  needsPhoto: boolean;
  images: number;
  hero: string;
};

export function ProductsTable({
  rows,
  families,
}: {
  rows: ProductRow[];
  families: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const [local, setLocal] = useState(rows);
  const [query, setQuery] = useState(params.get('q') ?? '');

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/admin/products?${next.toString()}`);
  };

  async function toggle(slug: string, field: 'featured' | 'bestSeller' | 'status', value: unknown) {
    setLocal((current) => current.map((row) => (row.slug === slug ? { ...row, [field]: value } : row)));
    const res = await fetch(`/api/products/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    toast.push(res.ok ? 'Saved.' : 'Could not save that.', res.ok ? 'success' : 'error');
    if (!res.ok) router.refresh();
  }

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setParam('q', query);
        }}
        className="flex flex-wrap gap-3 rounded-card border border-line bg-paper p-4"
      >
        <div className="relative min-w-[200px] flex-1">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or code"
            aria-label="Search products"
            className="h-11 w-full rounded-btn border border-line pl-9 pr-3 text-sm focus:border-decart-600"
          />
        </div>
        <select
          value={params.get('family') ?? ''}
          onChange={(e) => setParam('family', e.target.value)}
          aria-label="Filter by family"
          className="h-11 rounded-btn border border-line px-3 text-sm"
        >
          <option value="">All families</option>
          {families.map((family) => (
            <option key={family.slug} value={family.slug}>
              {family.name}
            </option>
          ))}
        </select>
        <select
          value={params.get('status') ?? ''}
          onChange={(e) => setParam('status', e.target.value)}
          aria-label="Filter by status"
          className="h-11 rounded-btn border border-line px-3 text-sm"
        >
          <option value="">Any status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <label className="flex h-11 items-center gap-2 rounded-btn border border-line px-3 text-sm">
          <input
            type="checkbox"
            checked={params.get('needsPhoto') === '1'}
            onChange={(e) => setParam('needsPhoto', e.target.checked ? '1' : '')}
          />
          Needs photo
        </label>
      </form>

      <div className="overflow-x-auto rounded-card border border-line bg-paper">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              {['', 'Code', 'Name', 'Family', 'Images', 'Featured', 'Best seller', 'Status'].map((head) => (
                <th key={head} className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-steel-600">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {local.map((row) => (
              <tr key={row.slug} className="hover:bg-porcelain">
                <td className="px-3 py-2">
                  <div className="relative h-10 w-10 overflow-hidden rounded-[6px] bg-porcelain">
                    {row.hero ? (
                      <Image src={row.hero} alt="" fill sizes="40px" className="object-contain p-0.5" />
                    ) : (
                      <ImageOff aria-hidden className="absolute inset-0 m-auto h-4 w-4 text-steel-400" />
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 font-mono text-[11px] tracking-[0.06em] text-steel-600">{row.code}</td>
                <td className="px-3 py-2">
                  <Link href={`/admin/products/${row.slug}`} className="font-medium text-ink-950 hover:text-decart-700">
                    {row.name}
                  </Link>
                </td>
                <td className="px-3 py-2 text-xs text-steel-600">{row.family}</td>
                <td className="px-3 py-2">
                  <span className={cn('font-mono text-xs', row.images ? 'text-ink-900' : 'text-danger')}>
                    {row.images}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={row.featured}
                    onChange={(e) => toggle(row.slug, 'featured', e.target.checked)}
                    aria-label={`Feature ${row.name}`}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={row.bestSeller}
                    onChange={(e) => toggle(row.slug, 'bestSeller', e.target.checked)}
                    aria-label={`Mark ${row.name} a best seller`}
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={row.status}
                    onChange={(e) => toggle(row.slug, 'status', e.target.value)}
                    aria-label={`Status for ${row.name}`}
                    className="rounded-btn border border-line bg-paper px-2 py-1 text-xs"
                  >
                    <option value="published">published</option>
                    <option value="draft">draft</option>
                    <option value="archived">archived</option>
                  </select>
                </td>
              </tr>
            ))}
            {!local.length ? (
              <tr>
                <td colSpan={8} className="px-3 py-12 text-center text-sm text-steel-600">
                  No products match these filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
