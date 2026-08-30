import type { Metadata } from "next";
import Image from "next/image";
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Award,
  Factory,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { ContactBand } from "@/components/site/ContactBand";
import { LeadForm } from "@/components/forms/LeadForm";
import { ButtonLink } from "@/components/ui/Button";
import { ProductImage } from "@/components/ui/ProductImage";
import { Breadcrumbs } from "@/components/ui/bits";
import { buildMetadata } from "@/lib/seo";
import { CONTACT_DESKS, CONTACT_SUBJECTS, SITE } from "@/lib/site";
import { waLink, WA } from "@/lib/whatsapp";
import { listPublic } from "@/lib/assets";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Contact DecArt Furniture — Faridabad Office Furniture Manufacturer",
  description:
    "General, sales and support enquiries for DecArt Industries. Call +91 93119 42001, WhatsApp us or send an enquiry. Plot 230-C, Sector 87, Faridabad, Haryana. Mon–Sat, 9:30 AM – 6:00 PM.",
  path: "/contact",
});

const PROOF = [
  { icon: Award, value: "10+ years", label: "Manufacturing office furniture" },
  { icon: Factory, value: "Made in Faridabad", label: "Our own factory floor" },
  { icon: Truck, value: "Pan-India", label: "Delivery and installation" },
  { icon: ShieldCheck, value: "GST registered", label: `GSTIN ${SITE.gstin}` },
];

type Search = { desk?: string };

export default function ContactPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const desk =
    CONTACT_DESKS.find((option) => option.id === searchParams.desk) ??
    CONTACT_DESKS[0];
  // no factory photography in /public yet, so this falls back to the branded plate
  const factory = listPublic("factory")[0];

  return (
    <>
      {/* ---------------------------------------------------------------- opener */}
      <section className="relative border-b border-line bg-porcelain">
        <div className="container-x relative z-10 pb-8 pt-20 md:pb-10 md:pt-24">
          <div className="lg:w-[54%] lg:pr-14">
            <Breadcrumbs
              items={[{ name: "Home", href: "/" }, { name: "Contact" }]}
            />
            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-decart-700">
              We&rsquo;re here to help
            </p>
            <h1 className="mt-3 font-display text-h2 text-ink-950">
              Let&rsquo;s build your workspace
            </h1>
            <p className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-steel-600">
              Talk straight to the people who make the furniture — one cabin or
              a full floor, dealer stock, OEM production and custom builds. No
              call-centre in between.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink
                href={SITE.phoneHref}
                size="lg"
                className="w-full sm:w-auto"
              >
                <Phone aria-hidden className="h-4 w-4" />
                Call {SITE.phone}
              </ButtonLink>
              <ButtonLink
                href={waLink(WA.float())}
                variant="whatsapp"
                size="lg"
                data-wa="contact-hero"
                className="w-full sm:w-auto"
              >
                <MessageCircle aria-hidden className="h-4 w-4" />
                WhatsApp us
              </ButtonLink>
            </div>

            <p className="mt-3 flex items-center gap-2 text-xs text-steel-600">
              <Clock aria-hidden className="h-3.5 w-3.5 shrink-0" />
              {SITE.hours}
            </p>

            {/* the proof row sits in the opener now, as in the reference, rather than as its own band */}
            <ul className="mt-7 grid grid-cols-2 gap-4 border-t border-line pt-6 sm:grid-cols-4">
              {PROOF.map((item) => (
                <li key={item.label} className="flex min-w-0 items-start gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-decart-50 text-decart-700">
                    <item.icon aria-hidden className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-ink-950">
                      {item.value}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-steel-600">
                      {item.label}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* stacked under the copy on a phone; on a wide screen it runs to the right edge */}
        <div className="relative h-60 w-full sm:h-80 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[44%]">
          <Image
            src="/scenes/executive-cabin.webp"
            alt="A DecArt executive cabin — desk, storage and leather seating"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 44vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* --------------------------------------------------- form beside the desks */}
      <section className="bg-paper py-8 md:py-10">
        <div className="container-x grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div
            id="enquiry"
            className="min-w-0 scroll-mt-24 rounded-card border border-line bg-paper p-5 md:p-7"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel-400">
              Get in touch
            </p>
            <h2 className="mt-2 font-display text-h3 text-ink-950">
              Tell us what you&rsquo;re furnishing
            </h2>
            <p className="mt-2 text-[0.9375rem] text-steel-600">
              Going to the{" "}
              <strong className="font-semibold text-ink-950">
                {desk.title.toLowerCase()}
              </strong>{" "}
              desk — pick another card to send it elsewhere.
            </p>

            <div className="mt-6">
              {/* keyed on the desk so switching gives a clean form, and the lead lands in the
                  admin under the right type */}
              <LeadForm
                key={desk.id}
                type={desk.leadType}
                subjects={CONTACT_SUBJECTS}
                subjectLabel="What are you looking for?"
                alwaysAskCompany
              />
            </div>
          </div>

          <div className="min-w-0">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-steel-400">
              Connect with our team
            </p>
            <ContactBand activeDesk={desk.id} selectable stacked />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- factory */}
      <section className="border-y border-line bg-porcelain py-10 md:py-12">
        <div className="container-x grid gap-8 lg:grid-cols-[1fr_1.1fr_0.9fr] lg:items-center">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-decart-700">
              Visit our factory
            </p>
            <h2 className="mt-2 font-display text-h3 text-ink-950">
              See where quality takes shape
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-steel-600">
              Architects, dealers and buying teams are welcome on the floor. It
              is the shortest way to judge a manufacturer — you see the frames,
              the foam and the finish before you commit to a single chair.
            </p>
            <ButtonLink
              href={SITE.mapUrl}
              variant="secondary"
              external
              className="mt-6"
            >
              <MapPin aria-hidden className="h-4 w-4" />
              Open in Google Maps
            </ButtonLink>
          </div>

          <div className="relative aspect-[16/10] min-w-0 overflow-hidden rounded-img border border-line bg-paper">
            <ProductImage
              src={factory}
              alt="DecArt Industries manufacturing facility in Faridabad"
              label="Factory photography"
              fit="cover"
              sizes="(max-width: 1024px) 100vw, 460px"
            />
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            <div className="rounded-card border border-line bg-paper p-5">
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-steel-400">
                <MapPin aria-hidden className="h-3.5 w-3.5 text-decart-600" />
                {SITE.shortName}
              </p>
              <address className="mt-2 not-italic text-sm leading-relaxed text-steel-600">
                {SITE.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>

            <div className="rounded-card border border-line bg-paper p-5">
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-steel-400">
                <Clock aria-hidden className="h-3.5 w-3.5 text-decart-600" />
                Visiting hours
              </p>
              <p className="mt-2 text-sm text-steel-600">{SITE.hours}</p>
              <p className="mt-2 text-xs text-steel-600">
                Call ahead and we will have somebody free who can answer your
                questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-porcelain py-8 md:py-10">
        <div className="container-x overflow-hidden rounded-card border border-line bg-paper">
          <iframe
            title="DecArt Industries on Google Maps"
            src={SITE.mapEmbed}
            width="100%"
            height="360"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block border-0"
          />
        </div>
      </section>
    </>
  );
}
