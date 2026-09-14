import Link from 'next/link';
import Image from 'next/image';
import { Plus, Star } from 'lucide-react';
import { hasDb } from '@/lib/db';
import { listProjects } from '@/lib/repo-content';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminProjectsPage() {
  if (!hasDb()) {
    return (
      <div className="rounded-card border border-warning/30 bg-warning/5 p-6">
        <h1 className="font-display text-2xl text-ink-950">Projects unavailable</h1>
        <p className="mt-3 text-sm text-steel-600">Set TURSO_DATABASE_URL to publish completed projects.</p>
      </div>
    );
  }

  const projects = await listProjects();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink-950">Latest projects</h1>
          <p className="mt-1 text-sm text-steel-600">
            Completed installations, with photos and the story. {projects.length} published.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex h-11 items-center gap-2 rounded-btn bg-decart-700 px-4 text-sm font-semibold text-white hover:bg-decart-800"
        >
          <Plus className="h-4 w-4" /> New project
        </Link>
      </div>

      {projects.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project._id}>
              <Link
                href={`/admin/projects/${project.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-paper transition-shadow hover:shadow-lift"
              >
                <div className="relative aspect-[4/3] bg-porcelain">
                  {project.images[0]?.src ? (
                    <Image
                      src={project.images[0].src}
                      alt={project.images[0].alt || project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 320px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center font-mono text-[10px] uppercase tracking-[0.12em] text-steel-400">
                      No photo
                    </span>
                  )}
                  <div className="absolute left-3 top-3 flex gap-1.5">
                    {project.status !== 'published' ? (
                      <span className="rounded-full bg-ink-950/80 px-2.5 py-1 text-[11px] text-porcelain">Draft</span>
                    ) : null}
                    {project.featured ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-decart-700 px-2.5 py-1 text-[11px] text-white">
                        <Star className="h-3 w-3" /> Home
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <h2
                    className={cn(
                      'font-semibold leading-snug text-ink-950 transition-colors group-hover:text-decart-700',
                    )}
                  >
                    {project.title}
                  </h2>
                  <p className="text-sm text-steel-600">
                    {[project.client, project.location].filter(Boolean).join(' · ') || '—'}
                  </p>
                  <p className="mt-auto pt-2 font-mono text-[10px] text-steel-400">
                    {project.images.length} {project.images.length === 1 ? 'photo' : 'photos'}
                    {project.completedAt ? ` · ${project.completedAt}` : ''}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-card border border-dashed border-line bg-paper p-10 text-center text-sm text-steel-600">
          No projects yet. Add one and it appears on the home page and at /projects.
        </p>
      )}
    </div>
  );
}
