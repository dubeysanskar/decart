'use client';

import { useState, type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AccordionItem = { id: string; title: string; content: ReactNode };

export function Accordion({
  items,
  defaultOpen,
  className,
}: {
  items: AccordionItem[];
  defaultOpen?: string;
  className?: string;
}) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);

  return (
    <div className={cn('divide-y divide-line border-y border-line', className)}>
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : item.id)}
                aria-expanded={isOpen}
                aria-controls={`panel-${item.id}`}
                className="flex w-full items-center justify-between gap-4 py-4 text-left text-[0.9375rem] font-semibold text-ink-950 hover:text-decart-700"
              >
                {item.title}
                <Plus
                  aria-hidden
                  className={cn(
                    'h-4 w-4 shrink-0 text-steel-600 transition-transform duration-200',
                    isOpen && 'rotate-45',
                  )}
                />
              </button>
            </h3>
            <div
              id={`panel-${item.id}`}
              hidden={!isOpen}
              className="pb-6 pt-0 text-[0.9375rem] leading-relaxed text-steel-600"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
