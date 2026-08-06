'use client';

import Image from 'next/image';
import { useState } from 'react';
import { X } from 'lucide-react';
import { EmptyState } from '@/components/ui/bits';
import { ButtonLink } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type Tab = { id: string; label: string; images: { src: string; alt: string }[] };

export function GalleryTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? '');
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  if (!tabs.length) {
    return (
      <section className="section bg-paper">
        <div className="container-x">
          <EmptyState
            title="Gallery images are on their way"
            body="Factory, installation and exhibition photos drop into /public/gallery and appear here automatically."
            action={<ButtonLink href="/products">Browse the catalogue instead</ButtonLink>}
          />
        </div>
      </section>
    );
  }

  const current = tabs.find((tab) => tab.id === active) ?? tabs[0];

  return (
    <section className="section bg-paper">
      <div className="container-x">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                tab.id === current.id
                  ? 'border-ink-900 bg-ink-900 text-porcelain'
                  : 'border-line bg-paper text-ink-900 hover:border-ink-800',
              )}
            >
              {tab.label}
              <span className="ml-2 font-mono text-[10px] text-steel-400">{tab.images.length}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 columns-2 gap-4 md:columns-3 lg:columns-4">
          {current.images.map((image) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setLightbox(image)}
              className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-img border border-line bg-porcelain"
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={600}
                height={600}
                sizes="(max-width: 768px) 50vw, 25vw"
                className="h-auto w-full object-contain transition-transform duration-300 hover:scale-[1.03]"
              />
            </button>
          ))}
        </div>
      </div>

      {lightbox ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-950/95 p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-porcelain hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative h-full w-full max-w-4xl">
            <Image src={lightbox.src} alt={lightbox.alt} fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      ) : null}
    </section>
  );
}
