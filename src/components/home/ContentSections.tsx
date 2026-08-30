import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin } from 'lucide-react';
import { SectionHeading } from '@/components/ui/typography';
import { ButtonLink } from '@/components/ui/Button';
import type { BannerRecord, ProjectRecord, ClientRecord } from '@/lib/repo-content';

/**
 * Home sections driven entirely by content the client manages in /admin:
 * banners, Latest Projects and the client logo wall. Each renders nothing at all
 * when its table is empty, so the page never shows a hollow band.
 */

// ---------------------------------------------------------------- banners

export function BannerStrip({ banners }: { banners: BannerRecord[] }) {
  const usable = banners.filter((banner) => banner.image);
  if (!usable.length) return null;

  return (
    <section className="section-sm bg-paper py-10 md:py-14">
      <div className="container-x">
        <div className={usable.length > 1 ? 'grid gap-5 md:grid-cols-2' : ''} data-stagger="0.08">
          {usable.map((banner, i) => {
            const inner = (
              <>
                <Image
                  src={banner.image}
                  alt={banner.imageAlt || banner.title || 'DecArt banner'}
                  fill
                  priority={i === 0}
                  sizes={usable.length > 1 ? '(max-width: 768px) 100vw, 50vw' : '100vw'}
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                />
                {banner.title || banner.subtitle || banner.ctaLabel ? (
                  <>
                    <span
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(90deg, rgb(31 30 28 / 0.72) 0%, rgb(31 30 28 / 0.35) 45%, transparent 75%)',
                      }}
                    />
                    <div className="absolute inset-0 flex flex-col justify-center gap-2 p-6 md:p-10">
                      {banner.title ? (
                        <h2 className="max-w-md font-display text-2xl font-semibold text-white md:text-3xl">
                          {banner.title}
                        </h2>
                      ) : null}
                      {banner.subtitle ? (
                        <p className="max-w-sm text-sm text-white/85 md:text-base">{banner.subtitle}</p>
                      ) : null}
                      {banner.ctaLabel && banner.href ? (
                        <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-btn bg-paper px-4 py-2 text-sm font-semibold text-decart-700">
                          {banner.ctaLabel}
                          <ArrowRight aria-hidden className="h-3.5 w-3.5" />
                        </span>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </>
            );

            const className =
              'group relative block aspect-[16/7] w-full overflow-hidden rounded-card bg-porcelain md:aspect-[21/8]';

            return banner.href ? (
              <Link key={banner._id} href={banner.href} data-anim="rise" className={className}>
                {inner}
              </Link>
            ) : (
              <div key={banner._id} data-anim="rise" className={className}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- latest projects

export function LatestProjects({ projects }: { projects: ProjectRecord[] }) {
  if (!projects.length) return null;

  return (
    <section className="section bg-porcelain">
      <div className="container-x">
        <SectionHeading
          eyebrow="Latest projects"
          index="07"
          title="Recently finished floors"
          lede="A look at what left the factory lately — the brief, the build and where it landed."
          action={
            <ButtonLink href="/projects" variant="secondary">
              All projects
              <ArrowRight aria-hidden className="h-4 w-4" />
            </ButtonLink>
          }
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-stagger="0.08">
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
                  <span className="flex h-full w-full items-center justify-center px-4 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-steel-400">
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
                <h3 className="text-lg font-semibold leading-snug text-ink-950 transition-colors group-hover:text-decart-700">
                  {project.title}
                </h3>
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
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- client logo wall

/** Rendered only when the client has added logos in /admin/clients. */
export function ClientWall({ clients }: { clients: ClientRecord[] }) {
  const withLogos = clients.filter((client) => client.logo);
  if (!withLogos.length) return null;

  const doubled = [...withLogos, ...withLogos];

  return (
    <section className="overflow-hidden border-y border-line bg-porcelain py-12">
      <div className="container-x text-center">
        <p className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-decart-700">
          Trusted by teams across India
        </p>
      </div>
      <Link href="/clients" aria-label="See the client wall" className="group block">
        <div className="mt-8 flex w-max animate-marquee gap-12 group-hover:[animation-play-state:paused]">
          {doubled.map((client, i) => (
            <span key={`${client._id}-${i}`} className="relative h-12 w-[120px] shrink-0">
              <Image
                src={client.logo}
                alt={i < withLogos.length ? client.name : ''}
                aria-hidden={i >= withLogos.length}
                fill
                sizes="120px"
                className="object-contain opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0"
              />
            </span>
          ))}
        </div>
        <span className="container-x mt-8 block text-center text-sm font-semibold text-decart-700 group-hover:underline">
          See the client wall →
        </span>
      </Link>
    </section>
  );
}
