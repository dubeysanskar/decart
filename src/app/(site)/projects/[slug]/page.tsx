import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, CalendarDays, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/site/PageHeader';
import { QuoteBand } from '@/components/home/sections';
import { ButtonLink } from '@/components/ui/Button';
import { buildMetadata, breadcrumbLd } from '@/lib/seo';
import { renderPostHtml } from '@/lib/blog';
import { hasDb } from '@/lib/db';
import { listProjects } from '@/lib/repo-content';
import { getProject } from '@/lib/content';

export const revalidate = 3600;

export async function generateStaticParams() {
  if (!hasDb()) return [];
  try {
    return (await listProjects(true)).map((project) => ({ slug: project.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  if (!hasDb()) return {};
  const project = await getProject(params.slug);
  if (!project) return {};
  return buildMetadata({
    title: project.seoTitle || `${project.title} — DecArt Furniture`,
    description:
      project.seoDescription ||
      project.summary ||
      `An office furniture installation by DecArt Furniture${project.location ? ` in ${project.location}` : ''}.`,
    path: `/projects/${project.slug}`,
    image: project.images[0]?.src,
  });
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const project = await getProject(params.slug);
  if (!project) notFound();

  const [cover, ...rest] = project.images;
  const facts = [
    project.client ? { icon: Building2, label: 'Client', value: project.client } : null,
    project.location ? { icon: MapPin, label: 'Location', value: project.location } : null,
    project.completedAt ? { icon: CalendarDays, label: 'Completed', value: project.completedAt } : null,
  ].filter(Boolean) as { icon: typeof MapPin; label: string; value: string }[];

  return (
    <>
      <PageHeader
        eyebrow="Latest projects"
        title={project.title}
        lede={project.summary}
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Projects', href: '/projects' },
          { name: project.title },
        ]}
      />

      <section className="section bg-paper">
        <div className="container-x">
          {cover?.src ? (
            <div
              className="relative aspect-[16/9] w-full overflow-hidden rounded-img bg-porcelain"
              data-anim="scale"
            >
              <Image
                src={cover.src}
                alt={cover.alt || project.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1100px"
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="mt-12 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
            <div className="min-w-0">
              {project.bodyHtml ? (
                <div
                  className="prose-decart"
                  dangerouslySetInnerHTML={{ __html: renderPostHtml(project.bodyHtml) }}
                />
              ) : (
                <p className="text-lg leading-relaxed text-steel-600">{project.summary}</p>
              )}
            </div>

            <aside className="min-w-0">
              {facts.length ? (
                <dl className="divide-y divide-line rounded-card border border-line bg-porcelain">
                  {facts.map((fact) => (
                    <div key={fact.label} className="flex items-start gap-3 p-4">
                      <fact.icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-decart-700" />
                      <div className="min-w-0">
                        <dt className="text-xs uppercase tracking-[0.1em] text-steel-600">{fact.label}</dt>
                        <dd className="mt-0.5 font-medium text-ink-950">{fact.value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              ) : null}

              {project.scope.length ? (
                <div className="mt-6">
                  <p className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-decart-700">
                    What we supplied
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {project.scope.map((item) => (
                      <li
                        key={item}
                        className="rounded-full border border-line bg-paper px-3.5 py-1.5 text-sm text-ink-900"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <ButtonLink href="/quote" className="mt-8 w-full">
                Plan a floor like this
              </ButtonLink>
            </aside>
          </div>

          {rest.length ? (
            <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3" data-stagger="0.07">
              {rest.map((image, i) => (
                <div
                  key={`${image.src}-${i}`}
                  data-anim="rise"
                  className="relative aspect-[4/3] min-w-0 overflow-hidden rounded-img bg-porcelain"
                >
                  <Image
                    src={image.src}
                    alt={image.alt || `${project.title} — photo ${i + 2}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}

          <Link
            href="/projects"
            className="mt-14 inline-flex items-center gap-1.5 text-sm font-semibold text-steel-600 hover:text-ink-950"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" /> All projects
          </Link>
        </div>
      </section>

      <QuoteBand />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbLd([
              { name: 'Home', path: '/' },
              { name: 'Projects', path: '/projects' },
              { name: project.title, path: `/projects/${project.slug}` },
            ]),
          ),
        }}
      />
    </>
  );
}
