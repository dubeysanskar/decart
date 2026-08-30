import Link from 'next/link';
import { SITE } from '@/lib/site';

/**
 * Long-form copy at the foot of the home page. Search engines reward a page that actually
 * explains what the business does in prose, and this is also the block a first-time buyer
 * skims before deciding whether to enquire — so it is written for a person, with the internal
 * links a person would want next, rather than stuffed with search terms.
 */
export function HomeSeo() {
  return (
    <section className="border-t border-line bg-porcelain py-16 md:py-20">
      <div className="container-x">
        <div className="mx-auto max-w-4xl" data-anim="up">
          <h2 className="text-center font-display text-h3 text-ink-950">
            Office furniture manufactured in Faridabad, delivered across India
          </h2>

          <div className="mt-8 flex flex-col gap-5 text-[0.9375rem] leading-relaxed text-steel-600">
            <p>
              DecArt Industries has built office furniture in Faridabad since {SITE.established}. Frames,
              ply, metalwork and upholstery are produced in our own factory, which is the reason we can
              quote a specification line by line and then actually ship what the quote says. The
              catalogue runs to more than 350 models across{' '}
              <Link href="/products" className="font-semibold text-decart-700 hover:underline">
                thirty product families
              </Link>{' '}
              — task and mesh chairs, executive and CEO seating, visitor and café ranges, conference and
              meeting tables, workstations, cubicles, storage and institutional furniture.
            </p>

            <p>
              Most of what we do is project work rather than single pieces: a floor of workstations for a
              growing team, seating for a campus, a boardroom that has to match an existing interior. That
              is why there are no prices on the site. A chair costs what its mechanism, foam density,
              upholstery and quantity make it cost, so we{' '}
              <Link href="/quote" className="font-semibold text-decart-700 hover:underline">
                quote against your actual requirement
              </Link>{' '}
              — usually the same working day.
            </p>

            <p>
              We supply direct to corporates, institutions and government buyers, and we also work with{' '}
              <Link href="/quote?type=dealer" className="font-semibold text-decart-700 hover:underline">
                dealers and distributors
              </Link>{' '}
              who stock DecArt in their own city, plus{' '}
              <Link href="/quote?type=oem" className="font-semibold text-decart-700 hover:underline">
                OEM buyers
              </Link>{' '}
              who need furniture built to their brand and specification. Delivery is pan-India by surface
              freight, packed for Indian roads, with installation support on project quantities.
            </p>

            <p>
              If you are specifying an office now, the{' '}
              <Link href="/blog" className="font-semibold text-decart-700 hover:underline">
                notes in our blog
              </Link>{' '}
              cover the things that decide whether a fit-out lasts: what actually makes a chair ergonomic,
              how to compare two quotations that look identical, and which workstation layout suits the
              floor you have. Or come and see the{' '}
              <Link href="/manufacturing" className="font-semibold text-decart-700 hover:underline">
                factory
              </Link>{' '}
              — it is the shortest way to judge a manufacturer.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
