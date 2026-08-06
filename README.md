# DecArt Industries — website

Premium B2B marketing + catalogue site with an admin CRM for **DecArt Industries Private Limited**,
Faridabad. Built to `docs/DECART-WEBSITE-DEVELOPMENT.md` (the PDR) — that document remains the
source of truth for content and design decisions.

**Trust Is Our Sign.**

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS — tokens in `tailwind.config.ts` (§4.2 of the PDR) |
| Motion | GSAP + ScrollTrigger + Lenis, dynamically imported, killed under `prefers-reduced-motion` |
| Database | Turso (libSQL/SQLite) via `@libsql/client` — schema in `src/lib/schema.ts`, queries in `src/lib/repo.ts` |
| Auth | NextAuth (credentials), single seeded admin |
| Mail | Nodemailer (SMTP) with a routing map |
| Uploads | Cloudinary (blog covers, extra product images) |
| Validation | zod schemas shared by client and server |
| Editor | TipTap |
| Export | SheetJS — Inbox → .xlsx / .csv |

---

## Getting started

```bash
npm install
cp .env.example .env.local     # fill in what you have
npm run dev                    # http://localhost:3000
```

**The site runs without a database.** With `TURSO_DATABASE_URL` unset, the catalogue renders from the
static seed (`src/data/`) so you can work on the marketing pages immediately. Lead capture, admin,
reviews and blog need a real connection and say so clearly rather than failing silently.

### With a database

```bash
# .env.local
TURSO_DATABASE_URL=libsql://<db>-<org>.turso.io   # turso db show <db> --url
TURSO_AUTH_TOKEN=…                                # turso db tokens create <db>
NEXTAUTH_SECRET=$(openssl rand -base64 32)
ADMIN_EMAIL=info@decartseatings.in
ADMIN_PASSWORD=choose-a-strong-one     # remove after the first seed

npm run seed          # creates the schema + upserts the catalogue + admin user + Settings row
```

Then sign in at `/admin/login`.

`npm run seed` is idempotent and **never overwrites admin edits** — existing products only receive
fields they are missing, plus a refreshed image manifest. `npm run seed -- --overwrite` forces a
full refresh from the seed (and resets the admin password if `ADMIN_PASSWORD` is set).

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `build` / `start` | the usual |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run seed` | create the Turso schema, then upsert catalogue + admin + settings |
| `npm run ingest-images` | transcode the photo-shoot masters → `/public/products` + regenerate the manifest |
| `npm run brand` | derive `/public/brand/*` and the app icons from `public/decart logo.png` |
| `npm run check-images` | print which manifest paths are missing — the list to send the client |

---

## Images

The client's photo-shoot masters (~1.1 GB of 4–6K JPEGs) are **not** served directly. `npm run
ingest-images` reads them, transcodes to 1400 px WebP (19 MB total), paints out the studio label in
the top-right corner where that corner is bare paper, and writes:

```
public/products/<family>/<product-slug>/<colourway>-<n>.webp
src/data/photoshoot-images.generated.ts     # generated — do not hand-edit
```

18 products ship with real photography across 265 shots and 45 colourways:

| Family | Models |
|---|---|
| `ultra-luxury-mesh` | Mustang HB/MB · Hilite HB/MB · Optimus Pre HB/MB |
| `special-luxury-mesh` | Eiffel HB/MB · Yaris HB/MB |
| `mesh` | Glanza HB/MB · Bonai HB/MB |
| `task-mesh` | Bubble MB · Feather MB · Ecco MB |
| `cafe` | Comfort Hi-Stool |

Commercial copy for these lives in `src/data/photoshoot.ts`; the remaining ~350 catalogue models
expand from `src/data/catalogue.seed.ts` and render the branded `PlaceholderImage` until photos
land. Everything is editable in admin once seeded.

**Where to put the masters.** They currently sit in `public/Photo Shoot Images -/`. Move that folder
to `source-images/` (git-ignored, and the ingest script looks there first) so it never ships:

```bash
mv "public/Photo Shoot Images -" source-images
```

---

## Repository layout

```
src/
├─ app/
│  ├─ (site)/          public pages — layout carries Header, Footer, WhatsApp float, Lenis
│  ├─ admin/           protected panel — dashboard, inbox, products, reviews, blog, settings
│  ├─ api/             leads · reviews · products · blog · settings · upload · auth
│  ├─ sitemap.ts robots.ts not-found.tsx
├─ components/  ui/ site/ product/ forms/ home/ admin/
├─ lib/         db · schema · repo · mail · whatsapp · seo · auth · catalogue · blog · assets · validators
├─ data/        catalogue.seed.ts · photoshoot.ts · specs.ts · *.generated.ts
scripts/        seed · ingest-images · brand-assets · check-images
```

---

## Behaviour worth knowing

**A lead is never lost.** `POST /api/leads` validates → checks the honeypot and 3-second time trap →
**saves to Turso** → responds `202` → *then* attempts both emails, recording `mailStatus` on the
lead. An SMTP failure never fails the request, and every form surfaces a WhatsApp fallback with the
user's own data pre-filled on both the success and the error path.

**Render only what exists.** Certificate badges, the client logo wall, gallery tabs, the factory
gallery, download cards and model spec sheets all key off `lib/assets.ts`. Drop files into the
matching `/public` folder and the section lights up; leave it empty and the section either hides or
shows an honest empty state. No dead badges, no broken images.

**Motion is optional.** GSAP and Lenis are dynamically imported on the public layout only, and
skipped entirely under `prefers-reduced-motion` (reveals resolve to visible immediately). The admin
panel has no scroll-jacking at all.

---

## Deployment (Vercel)

Set every variable from `.env.example` in the project settings, plus `NEXTAUTH_URL` = the production
URL. Point `NEXT_PUBLIC_SITE_URL` at the live domain so canonicals, OG tags and JSON-LD resolve
correctly. `npm run seed` once against the production database, then remove `ADMIN_PASSWORD`.

**Data layer.** All SQL lives in `src/lib/repo.ts`; nothing else in the app writes queries. Nested
and list fields (specs, images, colourways, lead notes/responses, SEO blocks) are JSON text columns,
while everything filtered or sorted on is a real column with an index. The repo maps rows back to the
document shapes the components expect — `_id`, `group`, `order`, `price.amount`, `source.utm`,
`mailStatus.admin` — so storage details stop at that file. `src/lib/schema.ts` holds the DDL and is
applied idempotently by `npm run seed`; the running app never issues DDL.

---

## Open items for the client (PDR §18)

1. **GSTIN** `08AAACD3344H1ZW` starts with `08` (Rajasthan); a Faridabad registration normally
   starts `06`. Shipped as given — please confirm before it goes out on invoices and the footer.
2. **Email domain** — the checklist gives `decartseatings.in`, a separate mailbox list exists on
   `decart.co.in`. All routing is config: edit `MAIL_ROUTING_JSON` or Admin → Settings.
3. **Contact variants** on the catalogue back cover (Gurugram showroom, Plot 230 **& 231**,
   alternate phone numbers, `decartseatings@gmail.com`) — confirm what should be published. The
   Settings fields exist.
4. **Catalogue errata** handled in the seed and flagged `needsReview`: p.63 header misprint,
   duplicate "DWS-11", repeated "Height Adjustable 1" and "Hostel Bed 5" labels, "DS 5432" → DS-543,
   DS numbering gaps.
5. **Certificates** — only GST supplied. ISO/BIFMA/MSME files needed before the compliance strip
   upgrades from the text line.
6. **Warranty policy PDF** and **company brochure** pending; `/downloads` renders what exists.
7. **Catalogue PDF** — export to `public/downloads/decart-catalogue.pdf`. Until then the page links
   the Google Drive mirror and offers to email it.
8. **Gaming Chairs** family exists in the seed but is hidden from nav until it has products.
9. **Prices hidden** by default ("Price on request"); flip `price.show` per product if that changes.
10. **Marketplace URLs** (GeM, IndiaMART, TradeIndia, Flipkart, Amazon) needed to activate footer
    badges.
11. **Hero cut-out** — the masters can't be chroma-keyed reliably (a see-through mesh back averages
    lighter than the paper behind it), so the home hero stages the product on a porcelain plate
    instead. Supply a masked PNG and `Hero.tsx` will use it as-is.
12. **Photography** — `npm run check-images` prints exactly which models are still without a photo.
    Catalogue crops are acceptable for launch; the 2023 shoot can be extended later.
