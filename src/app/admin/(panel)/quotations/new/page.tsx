import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { hasDb } from '@/lib/db';
import { QuoteWizard } from '@/components/admin/QuoteWizard';

export const dynamic = 'force-dynamic';

export default function NewQuotationPage() {
  if (!hasDb()) {
    return (
      <div className="rounded-card border border-warning/30 bg-warning/5 p-6">
        <h1 className="font-display text-2xl text-ink-950">Quotations unavailable</h1>
        <p className="mt-3 text-sm text-steel-600">
          Set <code className="font-mono">TURSO_DATABASE_URL</code> to raise quotations.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          href="/admin/quotations"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-steel-600 hover:text-ink-950"
        >
          <ArrowLeft className="h-4 w-4" />
          All quotations
        </Link>
        <h1 className="mt-3 font-display text-3xl text-ink-950">Create a quotation</h1>
        <p className="mt-1 text-sm text-steel-600">
          Client, products, pricing, then generate. The number is reserved at the last step.
        </p>
      </div>

      <QuoteWizard />
    </div>
  );
}
