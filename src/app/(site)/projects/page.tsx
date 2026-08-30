import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/site/PageHeader';
import { QuoteBand } from '@/components/home/sections';
import { buildMetadata } from '@/lib/seo';
import { getProjects } from '@/lib/content';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Latest Projects — Office Furniture Installations by DecArt',
  description:
    'Recent office seating and workstation installations by DecArt Furniture: corporate floors, campuses, hotels and hospitals furnished from our Faridabad factory.',
  path: '/projects',
});

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <PageHeader
        eyebrow="Latest projects"
        title="Floors we have just finished."
        lede="Recent installations — what the brief was, what we built, and where it went."
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Projects' }]}
      />

      <section className="section bg-paper">
        <div className="container-x">
          {projects.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-stagger="0.08">
              {projects.map((project) => (
                <Link
                  key={project._id}
                  href={`/projects/${project.slug}`}
                  data-anim="rise"
                  className="group flex min-w-0 flex-col overflow-hidden rounded-card bg-paper shadow-[0_0_0_1px_rgb(227_231_236)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-porcelain">
                    {project.images[0]?.src ? (
                      <Image
                        src={project.images[0].src}
                        alt={project.images[0].alt || project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 380px"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center font-mono text-[10px] uppercase tracking-[0.12em] text-steel-400">
                        {project.title}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    {project.completedAt ? (
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-decart-700">
                        {project.completedAt}
                      </p>
                    ) : null}
                    <h2 className="text-lg font-semibold leading-snug text-ink-950 transition-colors group-hover:text-decart-700">
                      {project.title}
                    </h2>
                    {project.summary ? (
                      <p className="line-clamp-2 text-sm leading-relaxed text-steel-600">{project.summary}</p>
                    ) : null}
                    {project.location ? (
                      <p className="mt-auto flex items-center gap-1.5 pt-2 text-xs text-steel-600">
                        <MapPin aria-hidden className="h-3.5 w-3.5" />
                        {project.location}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-card border border-dashed border-line bg-porcelain p-12 text-center">
              <h2 className="font-display text-h3 text-ink-950">Project stories are on the way.</h2>
              <p className="mx-auto mt-3 max-w-xl text-steel-600">
                We are photographing recent installations now. In the meantime, the gallery has shots from the
                factory floor and finished sites.
              </p>
              <Link
                href="/gallery"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-decart-700 hover:underline"
              >
                Open the gallery <ArrowRight aria-hidden className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <QuoteBand />
    </>
  );
}
