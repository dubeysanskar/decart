import { hasDb } from '@/lib/db';
import { listBanners } from '@/lib/repo-content';
import { BannerManager, type BannerRow } from '@/components/admin/BannerManager';

export const dynamic = 'force-dynamic';

export default async function AdminBannersPage() {
  if (!hasDb()) {
    return (
      <div className="rounded-card border border-warning/30 bg-warning/5 p-6">
        <h1 className="font-display text-2xl text-ink-950">Banners unavailable</h1>
        <p className="mt-3 text-sm text-steel-600">Set TURSO_DATABASE_URL to manage home-page banners.</p>
      </div>
    );
  }
  const banners = (await listBanners()) as BannerRow[];
  return <BannerManager banners={banners} />;
}
