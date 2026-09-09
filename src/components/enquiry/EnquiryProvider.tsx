'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ENQUIRY_KEY,
  MAX_LINES,
  mergeItem,
  readEnquiry,
  removeItem,
  setItemQty,
  summarise,
  writeEnquiry,
  type EnquiryItem,
  type EnquirySummary,
} from '@/lib/enquiry';

type Api = {
  items: EnquiryItem[];
  summary: EnquirySummary;
  /** False until localStorage has been read, so nothing renders a count the server did not send. */
  ready: boolean;
  full: boolean;
  has: (slug: string) => boolean;
  add: (item: EnquiryItem) => 'added' | 'topped-up' | 'full';
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const EnquiryContext = createContext<Api | null>(null);

/**
 * Holds the enquiry list for the whole site.
 *
 * The list is read after mount rather than during render: the server has no localStorage, so a
 * count rendered on the first pass would not match the client's and React would throw away the
 * markup. `ready` lets the badge and the buttons stay quiet for that one frame instead of
 * flashing an empty list at someone who has ten models in it.
 */
export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<EnquiryItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readEnquiry());
    setReady(true);

    // a second tab is the same buyer: keep both windows on the same list
    const onStorage = (event: StorageEvent) => {
      if (event.key === ENQUIRY_KEY) setItems(readEnquiry());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /** Every mutation goes through here, so state and storage can never disagree. */
  const commit = useCallback((next: EnquiryItem[]) => {
    setItems(next);
    writeEnquiry(next);
  }, []);

  const add = useCallback<Api['add']>(
    (item) => {
      const existing = items.some((row) => row.slug === item.slug);
      if (!existing && items.length >= MAX_LINES) return 'full';
      commit(mergeItem(items, item));
      return existing ? 'topped-up' : 'added';
    },
    [items, commit],
  );

  const api = useMemo<Api>(
    () => ({
      items,
      summary: summarise(items),
      ready,
      full: items.length >= MAX_LINES,
      has: (slug) => items.some((row) => row.slug === slug),
      add,
      setQty: (slug, qty) => commit(setItemQty(items, slug, qty)),
      remove: (slug) => commit(removeItem(items, slug)),
      clear: () => commit([]),
    }),
    [items, ready, add, commit],
  );

  return <EnquiryContext.Provider value={api}>{children}</EnquiryContext.Provider>;
}

export function useEnquiry(): Api {
  const api = useContext(EnquiryContext);
  if (!api) throw new Error('useEnquiry must be used inside <EnquiryProvider>');
  return api;
}
