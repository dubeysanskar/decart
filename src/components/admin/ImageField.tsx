'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { Upload, X, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/form';
import { HexSpinner } from '@/components/ui/bits';

/**
 * Picks an image for banners, client logos and project photos.
 *
 * Two ways in, because they fail independently:
 *  - upload, which posts to /api/upload (Cloudinary). That route answers 503 until the
 *    CLOUDINARY_* env vars are filled in, so the error is surfaced rather than swallowed.
 *  - a path typed by hand, for anything already sitting in /public.
 */
export function ImageField({
  label = 'Image',
  value,
  onChange,
  folder = 'blog',
  hint,
  aspect = 'aspect-[16/9]',
}: {
  label?: string;
  value: string;
  onChange: (src: string) => void;
  folder?: 'blog' | 'products';
  hint?: string;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function upload(file: File) {
    setBusy(true);
    setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('folder', folder);
      const res = await fetch('/api/upload', { method: 'POST', body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setError(json?.error || `Upload failed (${res.status}).`);
        return;
      }
      onChange(json.data?.src ?? '');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-sm font-medium text-ink-900">{label}</span>

      <div className="flex flex-wrap items-start gap-3">
        <div className={`relative w-40 shrink-0 overflow-hidden rounded-card border border-line bg-porcelain ${aspect}`}>
          {value ? (
            <>
              <Image src={value} alt="" fill sizes="160px" className="object-contain p-2" />
              <button
                type="button"
                onClick={() => onChange('')}
                aria-label="Remove image"
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-paper/90 text-steel-600 shadow-card hover:text-danger"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <span className="flex h-full w-full items-center justify-center text-center font-mono text-[10px] uppercase tracking-[0.12em] text-steel-400">
              No image
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex h-10 items-center gap-2 rounded-btn border border-line bg-paper px-3.5 text-sm font-semibold text-ink-900 hover:border-ink-800 disabled:opacity-60"
            >
              {busy ? <HexSpinner /> : <Upload className="h-4 w-4" />}
              Upload
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upload(file);
              }}
            />
          </div>

          <Input
            label="…or paste a path / URL"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/clients/marriott.png"
            hint={hint}
          />

          {error ? (
            <p className="flex items-start gap-1.5 text-sm text-danger" role="alert">
              <AlertTriangle aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
