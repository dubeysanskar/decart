import { hasDb } from '@/lib/db';
import { getNavFamilies } from '@/lib/catalogue';
import { getTaxonomy } from '@/lib/taxonomy';
import { StructureEditor } from '@/components/admin/StructureEditor';

export const dynamic = 'force-dynamic';

export default async function AdminStructurePage() {
  // hidden categories included: this is where they are unhidden
  const [masters, families] = await Promise.all([getTaxonomy({ includeHidden: true }), getNavFamilies()]);

  return (
    <StructureEditor
      initialMasters={masters}
      initialSeries={families.map((f) => ({ slug: f.slug, name: f.name, count: f.count }))}
      writable={hasDb()}
    />
  );
}
