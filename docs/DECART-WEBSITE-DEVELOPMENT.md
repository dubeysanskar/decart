# DECART INDUSTRIES — WEBSITE DEVELOPMENT SPEC (PDR)

**Project:** Premium B2B website for DecArt Industries Private Limited — office chair & institutional furniture manufacturer, Faridabad (est. 2015).
**Tagline:** *Trust Is Our Sign*
**Repo:** `github.com/dubeysanskar/decart` (push all work here; `main` = production)
**Deliverable:** A design-led marketing + catalogue site with a full admin panel (products, blog, reviews, lead inbox), SMTP mail, and WhatsApp query capture.
**Author of record for content decisions:** this document. Where the client checklist said *"prepare according to your own understanding"*, the copy in §14 is the prepared content — use it verbatim unless the client overrides.

---

## 0. HOW TO USE THIS FILE

This is the single source of truth for an AI/human developer building the site end-to-end. Work in the phase order of §16. Never invent placeholder content when §14 (Copy Deck) or §7 (Seed Data) already provides it. Never invent image URLs — every image path must come from the Public Image Manifest (§6). If an image is missing on disk, render the branded placeholder fallback, never a broken image.

**Priority order when instructions conflict:** client-provided facts (§1) → this spec → your judgement.

---

## 1. CLIENT FACTS (canonical — do not alter)

| Field | Value |
|---|---|
| Legal name | DecArt Industries Private Limited |
| Tagline | Trust Is Our Sign |
| Established | 2015 (10+ years of manufacturing as of 2026) |
| Office & Factory | Plot no-230 C, Indra Complex, Industrial Area, Dwa Factory Wali Gali, Sector 87, Faridabad, Haryana 121002 |
| Phone / WhatsApp | +91 93119 42001 → links use `tel:+919311942001` and `https://wa.me/919311942001` |
| Email (primary) | `Info@decartseatings.in` (lowercase `info@decartseatings.in` in code) |
| Google Maps | https://maps.app.goo.gl/HcNho95QJXeLm7JZ8 |
| Working hours | Mon–Sat, 09:30 AM – 6:00 PM IST |
| GSTIN | 08AAACD3344H1ZW ⚠️ verify with client — `08` is the Rajasthan state code; a Faridabad (Haryana) registration normally starts `06`. Ship it as given, flag it in handover. |
| Catalogue PDF | Google Drive: `https://drive.google.com/file/d/1AyocxBIMq1PNqeH5hwHyiLaiBIehQr17/view?usp=sharing` — ALSO self-host at `/public/downloads/decart-catalogue.pdf` and link the local copy on the site. |

**⚠️ Email domain discrepancy (resolve with client, build for both):** the checklist gives `info@decartseatings.in`, but a separate mailbox list exists on **decart.co.in**: `info@`, `purchase@`, `customercare@`, `sales1@`, `sales2@`, `raghvendra@`, `admin@`, `account@decart.co.in`. Implement all sender/recipient addresses via env + a `MAIL_ROUTING` map (§10.3) so switching domains is a config change, not a code change. Default: primary = `info@decartseatings.in`, CC routing to sales mailboxes optional.

**Business goals (rank features against these):** generate B2B leads · dealer/distributor inquiries · OEM orders · export inquiries · corporate bulk orders. Every page must end in a path to one of: **Request Quote / WhatsApp / Call**.

---

## 2. GOLDEN RULES

1. **Mobile-first, always.** Design and build every screen at 390px first, then scale up. Indian B2B buyers will hit this from WhatsApp on a phone.
2. **Premium is restraint.** One signature idea per page (see §4.6). No stock-icon clutter, no autoplay carousels, no gradient soup, no more than two typefaces + one mono.
3. **A lead is never lost.** Every form/API failure still shows the WhatsApp + phone fallback with the message pre-filled. Leads are written to DB *before* email is attempted.
4. **Real content only.** Copy from §14, products from §7 seed, images from §6 manifest. Placeholder = branded placeholder component, not lorem ipsum.
5. **Fast.** LCP < 2.5s on 4G, CLS < 0.1, images via `next/image` (AVIF/WebP), fonts via `next/font` with `display: swap`.
6. **Accessible.** 4.5:1 text contrast, visible focus rings, labels on every input, `prefers-reduced-motion` respected globally.
7. **Everything admin-editable is DB-backed.** Products, blog, reviews, leads, and site settings live in the database (Turso); only static brand imagery lives in `/public`.
8. **Ship in phases (§16), commit per phase**, conventional commits (`feat:`, `fix:`, `content:`), deploy previews on Vercel.

---

## 3. WHAT WE'RE BUILDING (feature map)

**Public site:** Home · Products (filterable catalogue) · Collection pages · Product detail (specs, build options, reviews, WhatsApp/Quote CTAs) · About · Manufacturing · Clients & Testimonials · Gallery · Blog (list + article) · Contact (map, hours, forms) · Get a Quote hub (Quote / Bulk / Dealer / OEM / Custom-chair intents) · Downloads · Privacy / Terms / Shipping & Refund.

**Lead capture:** SMTP email (admin notify + branded customer auto-acknowledgement) · floating WhatsApp button · per-product WhatsApp query with pre-filled message · click-to-call.

**Admin panel (`/admin`):** Dashboard KPIs · **Inbox** (all queries: status, disposition, response-by-email, notes, filters, CSV/XLSX **download button**) · Products CRUD (images, variants, specs, draft/publish, featured) · Reviews moderation (approve/reject/feature) · Blog CRUD (cover image upload, basic SEO fields) · Settings (contact info, WhatsApp number, SMTP routing, social links, counters).

---

## 4. BRAND & DESIGN SYSTEM

### 4.1 Design thesis

DecArt's logo is a **hexagon** (industrial precision) holding a **serif D** with a **handshake** (trust). The 68-page catalogue is clean white with DecArt-blue header bands and honest, code-labelled product grids; the site keeps that catalogue clarity for browsing and adds what print can't — staging. The site reads as a **"dark showroom with an engineer's nameplate"**: gallery-dark hero and band sections where chairs are lit like products on a stage, generous porcelain-white catalogue sections for browsing, serif display type echoing the wordmark, and model codes treated as machined nameplates. Confident, calm, factory-real — not a template SaaS look.

### 4.2 Color tokens (Tailwind config — exact values)

```js
colors: {
  ink:      { 950:'#0F1317', 900:'#161B21', 800:'#242B33' },   // showroom darks (hero, bands, footer)
  porcelain:'#F6F7F9',                                          // light section background
  paper:    '#FFFFFF',                                          // cards
  line:     '#E3E7EC',                                          // hairline borders
  steel:    { 600:'#5C6670', 400:'#8B949E' },                   // secondary text
  decart:   { 50:'#EAF6FD', 100:'#D6EDFA', 300:'#8FCDEF',
              500:'#4FAEE3', 600:'#2E8FC7', 700:'#20719F' },    // brand blue (from logo)
  cognac:   { 500:'#C9822E', 600:'#A96A22' },                   // leather accent — Executive collection ONLY, ≤5% of any screen
  success:  '#1E9E5A', warning:'#D97E00', danger:'#D64541',
}
```

Usage law: dark sections = `ink.950` bg + `porcelain` text + `decart.500` accents. Light sections = `porcelain` bg + `ink.900` text. `cognac` appears only on Executive/leather contexts (badge, underline, spec-plate edge) — it is the "leather smell" of the site, not a second brand color. Never place `decart.500` text on `porcelain` for body copy (contrast) — use it for accents ≥ 18px bold, chips, lines, icons.

### 4.3 Typography

Load with `next/font/google`, subset `latin`.

| Role | Face | Why / usage |
|---|---|---|
| Display | **Prata** (400 only) | High-contrast serif that mirrors the logo's "D"; H1/H2 and big numerals. Tight leading (1.05–1.15), never below 28px. |
| UI + body | **Archivo** (variable 400–700, use Expanded width for eyebrows) | Grotesque with signage DNA — nav, body, buttons, forms. Body 16px/1.65 mobile, 17px desktop. |
| Data / codes | **IBM Plex Mono** (400/500) | Model codes (`DS-501`, `CUBIC-07`), spec tables, GSTIN, counters — the "nameplate" voice. Always uppercase, +0.08em tracking. |

Type scale (mobile → desktop): H1 34→64 (Prata) · H2 28→44 (Prata) · H3 20→26 (Archivo 600) · Eyebrow 11→12 (Archivo Expanded 600, uppercase, +0.14em, `decart.600`) · Body 16→17 · Caption 13.

### 4.4 Space, radius, elevation, grid

4px base scale; section padding `py-16` mobile / `py-28` desktop. Container `max-w-[1200px] px-5 md:px-8`. Radius: cards 16px, buttons 12px, chips 999px, images 12px. Shadows: near-none on light (`0 1px 2px rgb(15 19 23 / .06)`); dark sections use borders `white/10` instead of shadows. 12-col grid desktop, 4-col mobile.

### 4.5 Core components (build once in `components/ui`)

`Button` (primary = decart.500 on dark / ink.900 on light; secondary = outline; whatsapp = #25D366 filled, white WA glyph; ghost) · `Eyebrow` · `SectionHeading` (eyebrow + Prata title + lede) · `SpecPlate` (see 4.6) · `ProductCard` · `CategoryCard` · `StatBlock` (Plex Mono numeral + Archivo label) · `Badge` (Est. 2015 / Made in Faridabad / GST Verified) · `Input/Select/Textarea` (48px min height, floating labels optional) · `Accordion` · `Breadcrumbs` · `EmptyState` · `PlaceholderImage` (ink.900 bg, hex outline pattern, series name in Plex Mono — the fallback when a manifest image is missing) · `Toast` · `Table` (admin) · `Modal/Drawer`.

### 4.6 Signature elements (the memorable 5%)

1. **The Nameplate (`SpecPlate`)** — every product carries a machined-metal style chip: `IBM Plex Mono` code (`DS-101 · DIRECTOR`), hairline border, tiny hexagon "rivet" at the left edge (cognac rivet on Executive items). It appears on cards, PDP hero, quote forms, and even the WhatsApp pre-fill text. This is the brand's engineering honesty turned into UI.
2. **Hexagon system** — the logo hexagon is the only decorative motif: list bullets, image hover reveal (image scales 1.03 inside a subtly clipped hex-cornered frame), section index markers, loading spinner (rotating hex outline), and a faint 6% opacity hex-grid on `ink.950` bands (CSS, not an image).
3. **Showroom hero** — full-bleed `ink.950` stage, radial "spotlight" (`radial-gradient(60% 50% at 70% 40%, rgb(79 174 227 / .16), transparent)`), one hero chair cut-out floating right, oversized Prata headline left, `SpecPlate` chip parked on the chair like a tag.

Everything else stays quiet so these three land.

### 4.7 Iconography & imagery rules

Icons: `lucide-react`, 1.5px stroke, never filled, `steel.600` on light / `porcelain` on dark. Photography: chairs on clean or dark backgrounds (cut-outs preferred for heroes/cards — client will drop images into `/public`, see §6); factory shots warm and honest, slight contrast lift; no watermarked stock. Every `<Image>` gets meaningful `alt` ("DecArt Centium DA-101 high-back mesh office chair").

---

## 5. COMPETITOR TEARDOWN (what to take, what to refuse)

| Site | Take | Refuse |
|---|---|---|
| featherlitestore.com | Category-first mega-menu with small product thumbnails; clean PDP spec order; sticky "enquire" bar | E-commerce cart complexity (DecArt is inquiry-led, no checkout) |
| geeken.in | Manufacturer credibility framing ("since…", factory story), catalogue download prominence | Dated dense layouts, carousel overload |
| afcindia.in | Trust band pattern: **certification badges + counters** ("15+ years, BIFMA, 40K+ installations") right under hero — replicate with DecArt numbers (§14.6) | Generic blue-corporate styling |
| viakgroup.com | Projects/installation gallery as proof; B2B segments (corporate/institutional) nav | Thin product data |
| neeman.in | D2C polish: photography discipline, soft human microcopy, uncluttered PDP, strong mobile bottom bar | Playful consumer tone — DecArt stays confident/industrial |
| (benchmark) hermanmiller.com | PDP hierarchy: gallery → one-line promise → variants → specs accordion → reviews | Price display (DecArt shows "Request price") |

**Net direction:** Featherlite's structure + AFC's trust band + Neeman's polish, wrapped in DecArt's dark-showroom identity. During build, screenshot-compare your Home and PDP against these on mobile; DecArt must look more considered than all five.

---

## 6. TECH STACK, REPO LAYOUT & PUBLIC IMAGE MANIFEST

### 6.1 Stack (fixed)

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 14+ (App Router) + TypeScript** | SSR/ISR for SEO-critical catalogue + blog |
| Styling | **Tailwind CSS** + tokens from §4.2 | `tailwind.config.ts` is the design system |
| Motion | **GSAP + ScrollTrigger + Lenis** smooth scroll | Marketing pages only; admin has zero scroll-jacking. Respect `prefers-reduced-motion` (kill Lenis + tweens). |
| DB | **Turso (libSQL/SQLite) + `@libsql/client`** | Tables in §8. Schema DDL in `src/lib/schema.ts`, all queries in `src/lib/repo.ts`. *(Migrated from MongoDB Atlas/Mongoose — §8 below is written in the original document shapes, which the repo layer still returns.)* |
| Auth (admin) | **NextAuth (credentials)** + bcrypt | Single admin seeded from env (`ADMIN_EMAIL`, `ADMIN_PASSWORD`); middleware-protect `/admin/*` and mutating APIs |
| Email | **Nodemailer (SMTP)** | Hostinger/Zoho/GoDaddy-style creds via env; templates §10.3 |
| Uploads | **Cloudinary** (free tier) | Admin-uploaded blog covers & extra product images; static brand/catalogue imagery stays in `/public` |
| Forms/validation | react-hook-form + **zod** (shared client/server schemas) | |
| Rich text (blog) | **TipTap** (StarterKit + Image + Link) | Store HTML; sanitize on render |
| Tables (admin) | **TanStack Table v8** | Inbox, products, reviews lists |
| Export | **SheetJS (`xlsx`)** | Inbox "Download" button → .xlsx (CSV fallback) |
| SEO | Next Metadata API + `next-sitemap` + JSON-LD helpers | §12 |
| Deploy | **Vercel** (site) + Turso + Cloudinary | Env vars in §15; `vercel.json` pins the `bom1` (Mumbai) region |

### 6.2 Repository layout

```
decart/
├─ public/                    # §6.3 — client drops images here
├─ src/
│  ├─ app/
│  │  ├─ (site)/              # public pages: layout with Header/Footer/WhatsAppFloat
│  │  │  ├─ page.tsx                       # Home
│  │  │  ├─ products/page.tsx              # all products + filters
│  │  │  ├─ products/[family]/page.tsx     # family listing (director, task-mesh, workstation…)
│  │  │  ├─ products/[family]/[slug]/page.tsx    # PDP
│  │  │  ├─ about/ manufacturing/ clients/ gallery/ contact/
│  │  │  ├─ quote/page.tsx                 # quote hub (?type=quote|bulk|dealer|oem|custom)
│  │  │  ├─ blog/page.tsx  blog/[slug]/page.tsx
│  │  │  ├─ downloads/ privacy-policy/ terms/ shipping-refund-policy/
│  │  ├─ admin/               # protected: layout with sidebar
│  │  │  ├─ page.tsx (dashboard) inbox/ inbox/[id]/ products/ products/new products/[id]
│  │  │  ├─ reviews/ blog/ blog/new blog/[id] settings/
│  │  ├─ api/
│  │  │  ├─ leads/route.ts  leads/[id]/route.ts  leads/export/route.ts
│  │  │  ├─ products/…  reviews/…  blog/…  upload/route.ts
│  │  │  ├─ auth/[...nextauth]/route.ts  settings/route.ts
│  │  ├─ sitemap.ts  robots.ts  not-found.tsx
│  ├─ components/ (ui/ site/ product/ forms/ admin/)
│  ├─ lib/ (db.ts mail.ts whatsapp.ts cloudinary.ts seo.ts auth.ts validators/)
│  ├─ models/ (Product Review BlogPost Lead Settings AdminUser)
│  ├─ data/ (catalogue.seed.ts categories.ts)
│  └─ styles/globals.css
├─ scripts/seed.ts            # `npm run seed` → creates the schema, upserts §7 into Turso
└─ .env.example               # §15, committed
```

### 6.3 PUBLIC IMAGE MANIFEST ⭐ (client will drop files here — build against these exact paths)

Rules: **kebab-case**, no spaces, `.webp` preferred (`.jpg` accepted), product cut-outs on transparent `.png`/`.webp` where possible. Site must render `PlaceholderImage` (§4.5) for any missing file — never a broken image. A `scripts/check-images.ts` script should print which manifest paths are missing.

```
public/
├─ brand/
│  ├─ logo.svg                 # full lockup (hex + wordmark + tagline)
│  ├─ logo-mark.svg            # hexagon-D only (favicons, loader, plates)
│  ├─ logo-dark.svg            # for ink.950 backgrounds
│  ├─ favicon.ico  apple-touch-icon.png
│  └─ og-default.jpg           # 1200×630 social card
├─ hero/
│  ├─ home-chair.webp          # cut-out hero chair (min 1200px tall) — the tan-leather RAYBACH (catalogue p.7) is ideal
│  ├─ about-factory.jpg  manufacturing-line.jpg  contact-office.jpg
├─ families/                   # 900×1100 portrait tiles, one per §7.1 family slug
│  ├─ director.webp ceo.webp executive.webp manager.webp mesh.webp task-mesh.webp
│  ├─ visitor.webp cafe.webp lounge.webp sofa.webp tandem.webp training.webp school.webp
│  ├─ auditorium.webp imported.webp reception.webp table.webp workstation.webp cubicle.webp
│  ├─ conference.webp meeting.webp storage.webp … (full slug list in §7.1)
├─ products/                   # ONE folder per family (§7.2) · files named by printed model code, lower-cased
│  ├─ director/ds-101.webp … ds-153.webp
│  ├─ ceo/ds-201.webp … ds-227.webp
│  ├─ executive/ds-301.webp … ds-337.webp  relcro.webp relcro-1.webp galgo.webp galgo-1.webp velgo.webp
│  ├─ manager/ds-401.webp …    mesh/glanza.webp ds-501.webp    ultra-luxury-mesh/ds-503.webp … ds-506.webp
│  ├─ special-luxury-mesh/ds-507.webp … fly.webp fly-1.webp marvel.webp marvel-mb.webp velfire.webp velfire-1.webp
│  ├─ task-mesh/ds-532.webp … ds-574.webp  ditto.webp punch.webp seltos.webp
│  ├─ visitor/exter.webp ds-601.webp … ds-616.webp      cafe/ds-701.webp … ds-736.webp
│  ├─ cafe-table/ds-801.webp …   lounge/ds-901.webp … ds-936.webp   sofa/ds-1001.webp … ds-1015.webp
│  ├─ centre-table/ds-1101.webp …  tandem/ds-1201.webp …  training/ds-1301.webp …  school/ds-1401.webp …
│  ├─ auditorium/audi-1.webp ds-1501.webp … ds-1509.webp
│  ├─ imported/raybach.webp vibe.webp boat.webp daisy.webp senora.webp moon.webp faux.webp
│  ├─ reception/reception-1.webp … reception-7.webp
│  ├─ imported-table/afm01-1816.webp afm03-b6218.webp afm-hda06.webp afm-lja02.webp afm-fya02.webp
│  ├─ table/dmf-bs01.webp dmf-01.webp … pmf-02.webp pmf-09.webp
│  ├─ workstation/dws-01.webp … dws-19.webp     cubicle/cubic-01.webp … cubic-11.webp
│  ├─ conference/conference-01.webp … conference-17.webp   meeting/mt-01.webp … mt-06.webp
│  ├─ computer-table/computer-1.webp …   foldable/fold-1.webp … ha-1.webp …
│  ├─ hostel-bed/hostel-bed-1.webp …
│  └─ storage/storage-1.webp … locker-01.webp … full-height-01.webp … low-height-01.webp … filing-01.webp …
│     (extra angles for any model: `<code>-alt-1.webp`, `<code>-alt-2.webp`)
├─ factory/       factory-01.jpg … factory-12.jpg
├─ gallery/
│  ├─ installations/ install-01.jpg …   # client sites
│  ├─ warehouse/ warehouse-01.jpg …
│  └─ exhibitions/ expo-01.jpg …
├─ clients/       client-01.png … client-24.png   # crop logo wall from catalogue p.67; grayscale PNGs on transparent
├─ certificates/  gst.jpg  msme.jpg  iso.jpg  bifma.jpg   # show only the ones that exist
├─ team/          team-01.jpg … (optional)
├─ downloads/
│  ├─ decart-catalogue.pdf     # export from the master catalogue (self-hosted primary link)
│  ├─ company-brochure.pdf  warranty-policy.pdf   # when provided
└─ placeholders/  product.webp  wide.jpg          # used by PlaceholderImage
```

**Sourcing tip for the client:** every model image can be cropped straight from the master catalogue — §7.2 maps each family to its exact catalogue pages and code list, and filenames are simply the printed code, lower-cased (`DS 501` → `ds-501.webp`, `CUBIC - 07` → `cubic-07.webp`). Drop files in, run `npm run check-images`, and the site lights up.

---

## 7. CATALOGUE TAXONOMY & SEED DATA (source of truth: DecArt Master Catalogue, 68 pp.)

### 7.1 Site taxonomy

Three nav groups → 30 **families**. URL = `/products/[family-slug]`. The mega-menu shows the three group columns; family pages are the real landing units. A family only appears in nav once it has ≥1 published product.

| Group | Families (slug) |
|---|---|
| **Office Seating** | director · ceo · executive · manager · mesh · ultra-luxury-mesh · special-luxury-mesh · task-mesh · imported · visitor · cafe · lounge · tandem · training · auditorium |
| **Tables & Desks** | table (executive desks) · imported-table · reception · conference · meeting · cafe-table · centre-table · computer-table · foldable · workstation · cubicle |
| **Furniture & Institutional** | sofa · school · hostel-bed · storage |

**Client-checklist category mapping** (the 12 requested categories exist as *tags/filters and SEO landing aliases*, resolved onto families):

| Checklist category | Resolves to |
|---|---|
| Executive Chairs | executive + ceo |
| Office Chairs | manager + task-mesh |
| Mesh Chairs | mesh + special-luxury-mesh + task-mesh |
| Ergonomic Chairs | ultra-luxury-mesh + mesh |
| Visitor Chairs | visitor |
| Conference Chairs | visitor (cantilever DS-6xx) + conference (tables) |
| Gaming Chairs | **no catalogue models yet** — family exists in DB, hidden from nav until admin adds products |
| Training Chairs | training |
| Cafe Chairs | cafe |
| Director Chairs | director |
| Workstation Chairs | task-mesh (chairs) / workstation (desking) |
| Custom Chairs | `/quote?type=custom` landing (inquiry flow, not a listing) |

### 7.2 Family / model master table (transcribed from the catalogue — verify each row against its page during the content pass)

| Family | Pages | Models | Spec profile (§7.3) |
|---|---|---|---|
| Imported Chairs | 7–8 | RAYBACH (featured) · Vibe · Boat · Daisy · Senora · Moon · Faux | `imported` |
| Director | 9–13 | DS-101 … DS-153 | `leather-exec` |
| CEO | 14–15 | DS-201 … DS-227 | `leather-exec` |
| Executive | 16–17 | DS-301 … DS-337 (a few numbers absent in print) + Relcro, Relcro-1, Galgo, Galgo-1, Velgo | `leather-exec` |
| Manager | 18 | DS-401 … DS-419 (gaps: 404–406, 416–417) | `fabric-task` |
| Mesh | 19 | Glanza · DS-501 | `mesh-ergo` |
| Ultra Luxury Mesh | 20 | DS-503 … DS-506 | `mesh-ergo` |
| Special Luxury Mesh | 21–22 | DS-507…510, DS-515…529 + Fly, Fly-1, Marvel, Marvel-MB, Velfire, Velfire-1 | `mesh-ergo` |
| Task Mesh | 23–25 | DS-532 … DS-574 (p.23 prints "DS 5432" = DS-543) + Ditto, Punch, Seltos | `mesh-task` |
| Visitor | 26 | Exter + DS-601 … DS-616 | `visitor` |
| Café (chairs + bar stools) | 27–28 | DS-701 … DS-736 | `cafe` |
| Café Tables | 29 | DS-801 … DS-813 | `table-cafe` |
| Lounge | 30–32 | DS-901 … DS-936 (+ DS-909A; 933–936 are pouffes) | `lounge` |
| Sofas | 33–35 | DS-1001 … DS-1015 (1/2/3-seater sets) | `sofa` |
| Centre Tables | 36 | DS-1101 … DS-1112 | `table-cafe` |
| Tandem / Waiting | 37–38 | DS-1201 … DS-1213 (2/3/4-seater beams) | `tandem` |
| Training | 39 | DS-1301 … DS-1317 (gaps 1311–1313) | `training` |
| School | 40–42 | DS-1401 … DS-1419 (desks, kids sets, library racks, lecterns) | `school` |
| Auditorium | 43 | Audi-1 + DS-1501 … DS-1509 | `auditorium` |
| — Chair Accessories | 44 | not products — feeds "Build options" (§7.3) | — |
| Reception Desks | 45–46 | Reception-1 … Reception-7 | `desk` |
| Imported Exec Desks | 47–48 | AFM01-1816 · AFM03-B6218 · AFM-HDA06 · AFM-LJA02 · AFM-FYA02 | `desk` |
| Executive & Manager Desks | 49–51 | DMF-BS01 · DMF-01…05 · DMF-08…11 · PMF-02 · PMF-09 | `desk` |
| Workstations (linear) | 52–54 | DWS-01 … DWS-19 (sizes below; "DWS-11" printed twice — renumber first as DWS-10) | `desking` |
| Cubicles | 55–56 | CUBIC-01 … CUBIC-11 | `desking` |
| Conference Tables | 57–59 | Conference-01 … Conference-17 | `table-conf` |
| Meeting Tables | 60 | MT-01 … MT-06 (round/square) | `table-conf` |
| Computer Tables | 61 | Computer-1 … Computer-7 | `desk` |
| Foldable & Height-Adjustable | 62 | Fold-1…3 + HA-1…3 (page repeats "Height Adjustable 1" — renumber) | `desk` |
| Hostel Beds | 63 | Hostel-Bed-1 … 5 (page header misprinted "Imported Conference Table"; labels repeat "5" — renumber) | `institutional` |
| Storage & Lockers | 64–66 | Storage-1…7 · Locker-01…05 · Full-Height-01…05 · Low-Height-01…03 · Filing-01…03 (+ unlabelled wardrobes/bookcases p.65 → label W-01… at content pass) | `storage` |

**Printed sizes to seed as `sizeMm` (W×D×H):**
DWS — 01:1200×1200×1050 · 02:2400×1200×1050 · 03:2400×600×1050 · 04:3600×1200×900 · 05:2400×1200×1050 · 06:1500×1200×1050 · 07:3600×1200×1050 · 08:2400×1200×1050 · 09:3600×1200×1050 · 10:4800×1200×1200 · 11:3600×1200×1200 · 12:2700×1200×1050 · 13:2400×1200×1050 · 14:3000×1200×1050 · 15:2700×1200×1050 · 16:2700×1200×1050 · 17:3600×600×1050 · 18:3600×1200×900 · 19:4200×1200×1050
CUBIC — 01:1200×1200×1050 · 02:1500×1200×1050 · 03:3000×3000×1350 · 04:1500×3000×1200 · 05:3000×3000×1050 · 06:3000×3000×1050 · 07:1200×1200×1050 · 08:1500×1200×1050 · 09:3000×3000×1350 · 10:1500×1200×1200 · 11:3000×3000×1050
Conference (×750 H) — 01:3600×1500 · 02:3000×1200 · 03:3000×1350 · 04:2400×1050 · 05:3000×1350 · 06:4500×1500 · 07:4500×1200 · 08:3600×1200 · 09:3000×1350 · 10:2400×1200 · 11:2400×1050 · 12:6000×3000 · 13:3600×1800 · 14:4800×2100 · 15:4200×1500 · 16:3600×1500 · 17:5400×3000
MT — L750×D750 / 900×900 / 1200×1200, H750 (round & square)
Reception — standard 1800 / 2400 / 3000 × 600 × 1050; Prelam/Postlam particle board, MDF or ply; customisable
Executive desks (DMF/PMF) — standard 1500×1650×750 · 1800×1650×750 · 2100×1800×750 · 2400×1950×750; top 25+12 mm, 36 mm gable leg, side storage 25/18 mm, pre-laminated particle board (MDF/HDHMR/ply on request)

### 7.3 Spec profiles (canonical bullets — render on PDP, editable per product in admin)

`leather-exec` (from Director pp.9–10):
High Back Director Chair · Twin-Colour Leatherette Tapestry · Wooden Ply Frame with High-Density PU Foam & Polyfill · Foam & Polyfill Cushion Arms · Torsion-Bar Auto-Weight Mechanism (knee-tilt on select models) · Aluminium / Chrome Base · 85 mm C-4 Samhongsa Gas Lift (65 mm on select models) · 60 mm Castors (pin wheel)

`mesh-ergo` (from Mesh p.19):
High-Back Special / Dotted Mesh · 4D Armrests with PU Pad (2D on select models) · Adjustable Headrest · Adjustable Lumbar Support · Multi-Lock Weight Mechanism · Eco-Friendly Seat with Engineered PU Moulded Foam · C-4 Samhongsa Gas Lift · Aluminium / Chrome / Nylon Base · 60 mm Castors

`mesh-task`: Mesh back, moulded-foam seat · Fixed or height-adjustable arms · Swivel-tilt / centre-tilt mechanism · Class-4 gas lift · Nylon / chrome base · 50–60 mm castors
`fabric-task`: Moulded-foam seat & back, fabric tapestry · Push-back / swivel-tilt mechanism · Class-4 gas lift · Nylon or powder-coated base
`imported` (RAYBACH p.7): Heavy-finish moulded PU foam · Donati mechanism · C-4 hydraulic · Aluminium base · PU silent castors
`visitor`: Cantilever / four-leg frame, chrome or powder-coated · Cushioned or mesh back · Stackable on select models
`cafe` / `table-cafe` / `lounge` / `sofa` / `tandem` / `training` / `school` / `auditorium` / `desk` / `desking` / `table-conf` / `storage` / `institutional`: 3–5 sensible bullets each following the same voice (material · frame/finish · mechanism or configuration · capacity/size · customisation line). Seed writes them; admin refines.

**Build options (from Chair Accessories p.44 — shown as a PDP accordion on all seating + as dropdowns on the Custom form):**
Castors 50/60 mm (fixed or moveable, BIFMA/SGS tested) · Base: Nylon / PP / Chrome / Powder-coated · Gas lift: 65/85/100/120 mm · Armrests: Fixed / Height-adjustable / 2D / 3D · Mechanism: Swivel Tilt / Knee Tilt / Torsion Bar / Push Back

**Finishes (p.67 — furniture families):** laminate swatch board (Beech/Maple/Teak/Walnut/Oak/Wenge tones — exact swatch names confirmed at content pass) + powder coats (Black, Ivory, White, Chocolate Brown, Moon Grey, Silver Grey, Bone Grey, D.A. Grey) + leg-design gallery. Render as a "Finishes & legs" accordion with swatch chips.

### 7.4 Seed implementation

`src/data/catalogue.seed.ts`:

```ts
export type FamilySeed = {
  slug: string; name: string; group: 'seating'|'tables-desks'|'furniture';
  pages: string;                      // "9–13"
  ds?: { from: number; to: number; skip?: number[] };
  codes?: string[];                   // non-DS printed codes
  named?: string[];                   // named models
  spec: SpecProfile;
  sizes?: Record<string, string>;     // code suffix -> "W×D×H"
  note?: string;
};

export const FAMILIES: FamilySeed[] = [
  { slug:'imported', name:'Imported Chairs', group:'seating', pages:'7–8', spec:'imported',
    named:['Raybach','Vibe','Boat','Daisy','Senora','Moon','Faux'] },
  { slug:'director', name:'Director Chairs', group:'seating', pages:'9–13', spec:'leather-exec',
    ds:{ from:101, to:153 } },
  { slug:'ceo', name:'CEO Chairs', group:'seating', pages:'14–15', spec:'leather-exec',
    ds:{ from:201, to:227 } },
  { slug:'executive', name:'Executive Chairs', group:'seating', pages:'16–17', spec:'leather-exec',
    ds:{ from:301, to:337 }, named:['Relcro','Relcro-1','Galgo','Galgo-1','Velgo'],
    note:'verify absent numbers against print' },
  { slug:'manager', name:'Manager Chairs', group:'seating', pages:'18', spec:'fabric-task',
    ds:{ from:401, to:419, skip:[404,405,406,416,417] } },
  { slug:'mesh', name:'Mesh Chairs', group:'seating', pages:'19', spec:'mesh-ergo',
    ds:{ from:501, to:501 }, named:['Glanza'] },
  { slug:'ultra-luxury-mesh', name:'Ultra Luxury Mesh', group:'seating', pages:'20', spec:'mesh-ergo',
    ds:{ from:503, to:506 } },
  { slug:'special-luxury-mesh', name:'Special Luxury Mesh', group:'seating', pages:'21–22', spec:'mesh-ergo',
    ds:{ from:507, to:529, skip:[511,512,513,514] },
    named:['Fly','Fly-1','Marvel','Marvel-MB','Velfire','Velfire-1'] },
  { slug:'task-mesh', name:'Task Mesh Chairs', group:'seating', pages:'23–25', spec:'mesh-task',
    ds:{ from:532, to:574 }, named:['Ditto','Punch','Seltos'], note:'p23 prints DS 5432 = DS-543' },
  { slug:'visitor', name:'Visitor Chairs', group:'seating', pages:'26', spec:'visitor',
    ds:{ from:601, to:616 }, named:['Exter'] },
  { slug:'cafe', name:'Café Chairs & Bar Stools', group:'seating', pages:'27–28', spec:'cafe',
    ds:{ from:701, to:736 } },
  { slug:'cafe-table', name:'Café Tables', group:'tables-desks', pages:'29', spec:'table-cafe',
    ds:{ from:801, to:813 } },
  { slug:'lounge', name:'Lounge Seating', group:'seating', pages:'30–32', spec:'lounge',
    ds:{ from:901, to:936 }, codes:['DS-909A'], note:'933–936 pouffes' },
  { slug:'sofa', name:'Office Sofas', group:'furniture', pages:'33–35', spec:'sofa',
    ds:{ from:1001, to:1015 } },
  { slug:'centre-table', name:'Centre Tables', group:'tables-desks', pages:'36', spec:'table-cafe',
    ds:{ from:1101, to:1112 } },
  { slug:'tandem', name:'Tandem & Waiting Benches', group:'seating', pages:'37–38', spec:'tandem',
    ds:{ from:1201, to:1213 } },
  { slug:'training', name:'Training Chairs', group:'seating', pages:'39', spec:'training',
    ds:{ from:1301, to:1317, skip:[1311,1312,1313] } },
  { slug:'school', name:'School Furniture', group:'furniture', pages:'40–42', spec:'school',
    ds:{ from:1401, to:1419 } },
  { slug:'auditorium', name:'Auditorium Seating', group:'seating', pages:'43', spec:'auditorium',
    ds:{ from:1501, to:1509 }, named:['Audi-1'] },
  { slug:'reception', name:'Reception Desks', group:'tables-desks', pages:'45–46', spec:'desk',
    codes:['Reception-1','Reception-2','Reception-3','Reception-4','Reception-5','Reception-6','Reception-7'] },
  { slug:'imported-table', name:'Imported Executive Desks', group:'tables-desks', pages:'47–48', spec:'desk',
    codes:['AFM01-1816','AFM03-B6218','AFM-HDA06','AFM-LJA02','AFM-FYA02'] },
  { slug:'table', name:'Executive & Manager Desks', group:'tables-desks', pages:'49–51', spec:'desk',
    codes:['DMF-BS01','DMF-01','DMF-02','DMF-03','DMF-04','DMF-05','DMF-08','DMF-09','DMF-10','DMF-11','PMF-02','PMF-09'] },
  { slug:'workstation', name:'Workstations', group:'tables-desks', pages:'52–54', spec:'desking',
    codes:[...Array(19)].map((_,i)=>`DWS-${String(i+1).padStart(2,'0')}`) /* sizes map in §7.2 */ },
  { slug:'cubicle', name:'Cubicles', group:'tables-desks', pages:'55–56', spec:'desking',
    codes:[...Array(11)].map((_,i)=>`CUBIC-${String(i+1).padStart(2,'0')}`) },
  { slug:'conference', name:'Conference Tables', group:'tables-desks', pages:'57–59', spec:'table-conf',
    codes:[...Array(17)].map((_,i)=>`Conference-${String(i+1).padStart(2,'0')}`) },
  { slug:'meeting', name:'Meeting Tables', group:'tables-desks', pages:'60', spec:'table-conf',
    codes:['MT-01','MT-02','MT-03','MT-04','MT-05','MT-06'] },
  { slug:'computer-table', name:'Computer Tables', group:'tables-desks', pages:'61', spec:'desk',
    codes:['Computer-1','Computer-2','Computer-3','Computer-4','Computer-5','Computer-6','Computer-7'] },
  { slug:'foldable', name:'Foldable & Height-Adjustable Desks', group:'tables-desks', pages:'62', spec:'desk',
    codes:['Fold-1','Fold-2','Fold-3','HA-1','HA-2','HA-3'], note:'renumbered from repeated labels' },
  { slug:'hostel-bed', name:'Hostel Beds', group:'furniture', pages:'63', spec:'institutional',
    codes:['Hostel-Bed-1','Hostel-Bed-2','Hostel-Bed-3','Hostel-Bed-4','Hostel-Bed-5'],
    note:'page header misprinted in catalogue; labels repeat — renumbered' },
  { slug:'storage', name:'Storage & Lockers', group:'furniture', pages:'64–66', spec:'storage',
    codes:['Storage-1','Storage-2','Storage-3','Storage-4','Storage-5','Storage-6','Storage-7',
           'Locker-01','Locker-02','Locker-03','Locker-04','Locker-05',
           'Full-Height-01','Full-Height-02','Full-Height-03','Full-Height-04','Full-Height-05',
           'Low-Height-01','Low-Height-02','Low-Height-03','Filing-01','Filing-02','Filing-03'] },
  { slug:'gaming', name:'Gaming Chairs', group:'seating', pages:'—', spec:'mesh-ergo',
    note:'no catalogue models — hidden from nav until products exist' },
];
```

`scripts/seed.ts` behaviour: expand every family → upsert one Product per code/name (key: `slug`); `name` defaults to `"{Family singular} {CODE}"` (e.g. "Director Chair DS-104", "Workstation DWS-07") or the named model; `heroImage` = manifest path; `needsPhoto` auto-computed by `check-images`; `status:'published'`; erratum rows get `needsReview:true`. Seed is **idempotent** and never overwrites admin-edited fields (only fills missing ones). Featured defaults: Raybach, Glanza, DS-101, DS-201, Fly, Exter, DS-701, DWS-07, CUBIC-03, Conference-01.

---

## 8. DATA MODELS

*Storage note (post-migration): these are now SQLite tables in Turso — DDL in `src/lib/schema.ts`, queries in `src/lib/repo.ts`. Nested/list fields (`specs`, `images`, `colourways`, `notes`, `responses`, `seo`, `extra`, `utm`) are JSON text columns; everything filtered or sorted on is a real indexed column. `group`/`order` are stored as `grp`/`ord` (reserved words) and `_id` is a UUID text primary key. The repo layer maps rows back to exactly the document shapes below, so the field names in this section remain accurate for application code.*

```ts
// Product
{
  code: String,                 // "DS-101", "RAYBACH", "CUBIC-07" — uppercase, unique with family
  name: String,                 // "Director Chair DS-101" / "Raybach"
  slug: { type:String, unique:true },          // "ds-101", "raybach"
  family: String,               // §7.1 slug
  group: String,                // 'seating' | 'tables-desks' | 'furniture'
  tags: [String],               // checklist aliases: 'executive','mesh','ergonomic','conference'…
  summary: String,              // 1 line for cards
  description: String,          // 2–3 short paragraphs (PDP)
  specs: [{ label:String, value:String }],     // from §7.3 profile, editable
  buildOptions: Boolean,        // seating families → show p.44 accordion
  sizeMm: String,               // "2400×1200×1050" where printed
  finishNote: String,           // furniture families
  images: [{ src:String, alt:String }],        // [0] = hero; /public path or Cloudinary URL
  cataloguePage: Number,
  price: { amount:Number, show:{ type:Boolean, default:false } },   // default "Request price"
  moq: Number,
  featured: Boolean, bestSeller: Boolean,
  status: { type:String, enum:['draft','published','archived'], default:'published' },
  needsPhoto: Boolean, needsReview: Boolean,
  order: Number,
  seo: { title:String, description:String },
  ratingAvg: { type:Number, default:0 }, ratingCount: { type:Number, default:0 },
  timestamps: true
}

// Review
{ productSlug:String|null, name:String, company:String, city:String,
  rating:{ type:Number, min:1, max:5 }, title:String, body:String, photo:String,
  status:{ enum:['pending','approved','rejected'], default:'pending' },
  featured:Boolean,            // featured + approved → homepage testimonials
  adminReply:String, timestamps:true }

// BlogPost
{ title:String, slug:{unique:true}, excerpt:String,
  cover:{ src:String, alt:String },            // Cloudinary upload
  contentHtml:String,                          // TipTap output, sanitized on render
  tags:[String], status:{ enum:['draft','published'] }, publishedAt:Date,
  author:{ type:String, default:'DecArt Team' },
  readingMinutes:Number,                       // auto: words/200
  relatedProductSlugs:[String],
  seo:{ metaTitle:String, metaDescription:String, ogImage:String, keywords:[String] },
  timestamps:true }

// Lead  ("query")
{ type:{ enum:['contact','quote','bulk','dealer','oem','custom'] },
  name:String, company:String, email:String, phone:String, city:String,
  message:String, productSlug:String, productCode:String, quantity:String, targetDate:String,
  source:{ page:String, utm:Object },
  status:{ enum:['new','contacted','quoted','negotiation','won','lost','junk'], default:'new' },
  disposition:{ enum:['','interested','callback','no-response','wrong-number','price-issue',
                      'future-requirement','not-interested'], default:'' },
  notes:[{ by:String, text:String, at:Date }],
  responses:[{ subject:String, body:String, sentTo:String, at:Date, messageId:String }],
  assignedTo:String, isRead:{ type:Boolean, default:false },
  mailStatus:{ admin:String, ack:String },     // 'sent' | 'failed:<reason>'
  timestamps:true }

// Settings (singleton doc, key:'site')
{ key:{ default:'site', unique:true },
  phone:String, whatsapp:String, emailPrimary:String,
  mailRouting:Object,                          // §10.3
  addressFactory:String, addressShowroom:String,   // showroom from catalogue back cover — confirm (§18)
  mapUrl:String, hours:String, gstin:String,
  social:{ instagram:String, linkedin:String, facebook:String, x:String },
  counters:{ years:Number, models:Number, families:Number, clients:Number },
  announcement:String }

// AdminUser
{ email:{unique:true}, passwordHash:String, name:String, role:{ default:'admin' } }
```

Indexes (as created in `src/lib/schema.ts`): products `(family,status,ord)`, `(status)`, unique `(code,family)`, unique `(slug)`; leads `(createdAt DESC)`, `(status,createdAt DESC)`, `(type)`; reviews `(productSlug,status)`, `(status)`; blog_posts `(status,publishedAt DESC)`, unique `(slug)`. Product search is `LIKE` over `name`/`code` rather than a text index — at 542 rows that is well inside budget.

---

## 9. API SURFACE

All mutating routes require the NextAuth admin session **except** public POSTs marked ◦. Validate everything with shared zod schemas (`lib/validators/`). Return `{ ok, data | error }`.

| Route | Methods | Purpose |
|---|---|---|
| `/api/leads` | ◦POST (public, rate-limited, honeypot) · GET (admin, filters+pagination) | create / list queries |
| `/api/leads/[id]` | GET · PATCH (status, disposition, assignedTo, isRead, +note) | inbox detail ops |
| `/api/leads/[id]/respond` | POST | send email reply via SMTP, append to `responses[]` |
| `/api/leads/export` | GET `?from&to&type&status&disposition&format=xlsx|csv` | **Download button** — SheetJS workbook stream |
| `/api/products` | GET (public: published; admin: all) · POST | list / create |
| `/api/products/[slug]` | GET · PATCH · DELETE (soft → archived) | product ops |
| `/api/reviews` | ◦POST (public, pending) · GET (admin queue / public approved by product) | reviews |
| `/api/reviews/[id]` | PATCH (approve/reject/feature/reply) · DELETE | moderation; recompute ratingAvg/Count |
| `/api/blog` | GET · POST | posts |
| `/api/blog/[slug]` | GET · PATCH · DELETE | post ops |
| `/api/upload` | POST (admin) | Cloudinary signed upload (folder: `decart/blog` or `decart/products`) |
| `/api/settings` | GET (public subset) · PATCH (admin) | site settings |
| `/api/auth/[...nextauth]` | — | credentials login for `/admin` |

Lead POST flow (never lose a lead): zod-validate → honeypot+time-trap check → save to the DB → respond `202 {ok:true}` to the user immediately-after-save → then attempt `sendAdminNotify()` and `sendCustomerAck()` in a `try/catch` each, recording `mailStatus` — mail failure must never fail the request. Client success screen always shows the WhatsApp continuation link (§10.1) regardless.

---

## 10. FEATURE SPECS

### 10.1 WhatsApp integration

- **Number:** from Settings (`919311942001`). Helper `lib/whatsapp.ts` → `waLink(template, vars)` returns `https://wa.me/919311942001?text=<encoded>`.
- **Floating button:** all public pages, bottom-right; 56px circle, `#25D366`, white glyph, subtle pulse every 8s (off with reduced-motion). On mobile PDP/quote pages it sits *above* the sticky action bar. Template: §14.10-A.
- **PDP button:** secondary CTA "WhatsApp this model" — prefills product name + code + page URL (§14.10-B). Also fired from the SpecPlate long-press context on mobile (nice-to-have).
- **Form fallback:** on submit error OR success screen, show "Continue on WhatsApp" with the form's data summarised into the message (§14.10-C).
- Track clicks via a `data-wa` attribute → optional GA4 event `whatsapp_click {context}`.

### 10.2 Lead capture surfaces

One shared `<LeadForm type=…>` powers: Contact page (`contact`) · Quote hub (`quote|bulk|dealer|oem|custom` via `?type=`) · PDP "Get a quote" (prefills `productSlug/Code`) · CTA bands. Fields by type:

| Type | Fields (all: name*, phone*, email, city) |
|---|---|
| contact | message* |
| quote | product (auto on PDP / picker elsewhere), quantity, message |
| bulk | product/family, quantity*, target date, message |
| dealer | company*, city*, current brands dealt, message |
| oem | company*, monthly volume, requirement details* |
| custom | base family, quantity, build options (dropdowns from §7.3 accessories), reference notes/message |

UX: single column, 48px inputs, phone keyboard `inputmode="tel"`, honeypot field `website` (hidden), min-3s time-trap, inline zod errors, submit button shows spinner → success panel (§14.8) with WA continuation + "download catalogue" link.

### 10.3 SMTP mail (Nodemailer)

```ts
// lib/mail.ts
transport = nodemailer.createTransport({
  host: env.SMTP_HOST, port: +env.SMTP_PORT,          // 465 secure / 587 STARTTLS
  secure: env.SMTP_PORT === '465',
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});
```

**Routing map** (Settings.mailRouting, env-seeded `MAIL_ROUTING_JSON`) — resolves recipients per lead type so the decartseatings.in ⇄ decart.co.in question is pure config:

```json
{ "default": ["info@decartseatings.in"],
  "quote":   ["info@decartseatings.in"], "bulk": ["info@decartseatings.in"],
  "dealer":  ["info@decartseatings.in"], "oem": ["info@decartseatings.in"],
  "custom":  ["info@decartseatings.in"], "contact": ["info@decartseatings.in"] }
```
(When the client confirms the decart.co.in mailboxes, point `quote/bulk` → sales1/sales2, `dealer/oem` → purchase or raghvendra, `contact` → customercare — one JSON edit.)

Two sends per lead — full copy in §14.9:
1. **Admin notify** — from `DecArt Website <SMTP_USER>`, replyTo = customer, to = routing[type]. Subject: `New {TYPE} query — {name} ({phone})`.
2. **Customer acknowledgement** — to customer (if email given), from `DecArt Industries <SMTP_USER>`, replyTo = `info@decartseatings.in`.

HTML templates: table-based, inline CSS only (mail-safe): `ink.950` header band with white logo → blue 2px rule → nameplate-style summary table (Plex-mono-ish `font-family:Consolas,monospace` for codes) → CTA buttons (Call / WhatsApp) → footer with address, hours, GSTIN. Always include a plain-text alternative.

Inbox "Respond" (10.4) reuses the same transport with a minimal branded wrapper; store `messageId` in `responses[]`.

### 10.4 Admin Inbox — query management (the CRM heart)

**List `/admin/inbox`:** TanStack table — columns: ⬤ unread dot · Date · Name (+company) · Type chip (color per type) · Product/code · Phone (tap-to-call) · **Status** (inline select) · **Disposition** (inline select) · Assigned · ↗ open. Toolbar: search, filters (type, status, disposition, date range), tabs "All / Needs reply / Won", and the **Download button** → `/api/leads/export` honouring current filters; menu offers **.xlsx** (default) and .csv. Export columns: Date, Type, Name, Company, Email, Phone, City, Product, Code, Qty, Message, Status, Disposition, Assigned, Source page, Last response at, Notes count.

**Detail drawer/page:** full message + meta · timeline (created → notes → responses, newest first) · quick actions: WhatsApp reply link (prefilled §14.10-D), call, copy email · **Respond by email** composer (subject prefilled `Re: your DecArt query`, TipTap-lite body seeded with greeting + signature from Settings; send → POST `/respond`) · status & disposition selects · add internal note · assign · mark junk.

**Statuses:** new → contacted → quoted → negotiation → won | lost | junk. **Dispositions:** interested · callback · no-response · wrong-number · price-issue · future-requirement · not-interested. Changing status auto-adds a timeline note.

**Dashboard `/admin`:** cards — New this week · Awaiting first response (status=new, count red if >0 older than 24h) · Quotes in play · Won this month; small bar of leads by type (14 days); latest 5 queries; shortcuts.

### 10.5 Products CRUD (admin)

List: search (name/code), family filter, status filter, `needsPhoto` filter, featured/bestSeller toggles inline, drag-reorder within family (writes `order`). Editor tabs:
1. **Basics** — name, code, family, group (auto), tags (checklist aliases multi-select), summary, description, cataloguePage, MOQ, price (+show toggle).
2. **Media** — image list: add via Cloudinary upload OR type a `/products/...` public path (validated by check-images manifest); set alt; drag order; first = hero.
3. **Specs** — label/value rows, "Load profile" button inserts the family's §7.3 bullets; buildOptions toggle; sizeMm; finishNote.
4. **SEO** — title (≤60 chars, counter), description (≤160), preview snippet.
5. **Publish** — status, featured, bestSeller, needsReview flag with note.
Slug auto-generates from code/name, editable, uniqueness-checked. Delete = archive with confirm; hard delete only from archived list.

### 10.6 Ratings & reviews management

- **Public (PDP):** "Rated ★4.6 · 12 reviews" summary → approved reviews list (name, company, city, date, stars, body, optional photo, admin reply) → "Write a review" inline form (name*, company, city, stars*, review*, photo optional via unsigned Cloudinary preset ≤2 MB). Submissions land `pending` with a moderation note shown (§14.8).
- **Admin `/admin/reviews`:** queue tabs Pending / Approved / Rejected; card shows full text + product link; actions approve / reject / feature (approved-only) / reply / delete. Approve or reject → recompute product `ratingAvg` + `ratingCount` (approved only).
- **Site reuse:** `featured && approved` reviews (product-linked or general) feed the homepage Testimonials section; general reviews can be entered by admin (productSlug null) for imported client testimonials.
- Aggregate rating emitted in Product JSON-LD only when `ratingCount > 0` (§12).

### 10.7 Blog (basic, with image upload + basic SEO)

- **Admin editor:** title → auto slug (editable) · excerpt (≤180) · cover image upload (Cloudinary, alt required) · TipTap body (H2/H3, bold, lists, quote, link, inline image via upload) · tags · related products picker · SEO panel (metaTitle ≤60 with counter, metaDescription ≤160, keywords chips, ogImage defaults to cover) · status draft/published + publishedAt. Reading time auto. Preview button renders the public template.
- **Public:** `/blog` — cover-card grid (image, tag, title, excerpt, date, reading time), newest first, simple pagination. `/blog/[slug]` — cover, H1, meta row, prose (max-w-prose, Archivo 17/1.7, Prata H2s), inline images rounded, share row (WhatsApp prominent), related products rail, end CTA band ("Need seating for your project? → Get a quote"). Article JSON-LD + OG tags from SEO fields. Sanitize `contentHtml` (rehype-sanitize allow-list) at render.

### 10.8 Settings screen (admin)

Edit everything in the Settings model: contact block, WhatsApp number, hours, GSTIN, addresses (factory + optional showroom), map URL, socials, counters, announcement bar text, mail routing JSON (with "send test email" button), signature for inbox replies. Changes revalidate affected static pages (`revalidatePath`).

---

## 11. SITEMAP & PAGE-BY-PAGE SPEC

### 11.1 Public sitemap

`/` · `/products` · `/products/[family]` (×30) · `/products/[family]/[slug]` · `/about` · `/manufacturing` · `/clients` · `/gallery` · `/blog` · `/blog/[slug]` · `/contact` · `/quote` (+`?type=`) · `/downloads` · `/privacy-policy` · `/terms` · `/shipping-refund-policy` · `/404`

Header (public): logo left · center nav **Products ▾ (mega) · About · Manufacturing · Clients · Blog · Contact** · right: phone (desktop) + primary "Get a Quote". Transparent over dark hero → solid `paper` with hairline on scroll (compressed 64px). Mobile: logo + call icon + hamburger → full-screen drawer (groups as accordions, big tap rows, WA + call buttons pinned at drawer bottom).
Footer (`ink.950`): 4 columns — brand+tagline+about line · Products (top 8 families + "View all") · Company links · Contact (address, phone, WA, email, hours) — then cert/marketplace strip (only assets that exist) and legal bar: `© {year} DecArt Industries Private Limited · GSTIN 08AAACD3344H1ZW · Privacy · Terms · Shipping & Refunds`.

### 11.2 Home (the showpiece)

1. **Hero (showroom, §4.6-3):** ink.950 stage, hex-grid 6%, spotlight; left: eyebrow + Prata H1 + sub + CTAs [Explore products] [Get a quote] + micro trust row ("Since 2015 · Faridabad · Pan-India delivery"); right: `hero/home-chair.webp` cut-out with parked SpecPlate (`RAYBACH · IMPORTED`). Copy §14.2.
2. **Trust bar:** 4 StatBlocks (counters §14.6, count-up on view) + slim certification badges row (only files present in `/certificates`).
3. **Browse by family:** heading + 8 featured family tiles (portrait image, name, model count) + "All 30 families →". Tiles use hex hover reveal.
4. **Bestsellers rail:** horizontal snap-scroll ProductCards (featured/bestSeller), each with nameplate + "Quote" quick action.
5. **Why DecArt (split):** factory image left; right 4 points (§14.4 "How we build") with hex bullets; CTA → /manufacturing.
6. **Segments we serve:** 5 chips-cards — Corporate Offices · Education · Hospitality · Healthcare · Institutions (copy §14.7-b).
7. **Client marquee:** grayscale logos (`/clients`), slow loop, pause on hover; caption "Trusted by teams across India".
8. **Testimonials:** 3 featured reviews (§10.6), Prata pull-quote style with stars.
9. **Project strip:** 4 tiles from `/gallery/installations` → /gallery.
10. **Blog teaser:** latest 3 posts.
11. **Quote CTA band (ink.900):** §14.8-g headline + [Get a quote] [WhatsApp us].

### 11.3 Products listing & family pages

`/products`: page head + group tabs (Seating / Tables & Desks / Furniture) + family chip row; grid of ProductCards (image on `porcelain` tile, name, SpecPlate, family tag). `/products/[family]`: family hero line (one-liner §14.7) + count; toolbar: search-in-family, tag filters (checklist aliases), sort (Featured · Newest · Code); **mobile filters = bottom-sheet drawer** with sticky Apply. Grid 2-col mobile / 3–4 desktop, `next/image` lazy, skeleton shimmer. Empty state → "No models match — talk to us for a custom build" + WA/Quote. Pagination: "Load more" (24/step).

### 11.4 Product detail (PDP)

Breadcrumb → 2-col (stacks on mobile): **Gallery** left (main image on porcelain tile, thumb strip, hex-corner frame, tap-to-zoom) · right: family eyebrow → Prata name → **SpecPlate (code · family)** → summary → rating summary link → price row ("Price on request" default) → CTA row: [Get a quote] primary · [WhatsApp this model] · phone link → key specs (top 4) → accordions: Full specifications (all §7.3 rows) · Build options (p.44, seating) / Finishes & legs (furniture) · Size (`sizeMm` diagram-style mono text) · Warranty & delivery (§14.8-f) → Reviews block (§10.6) → Related models rail (same family) → catalogue download line.
**Mobile sticky action bar (signature UX):** bottom fixed, safe-area aware, 3 buttons — Call · WhatsApp · **Get Quote** (primary, 50% width). Appears after hero scroll, hides on footer.

### 11.5 Other public pages

- **/about:** dark intro band (Prata pull line + est. badge) → story (§14.4) → From the Managing Director card (photo `team/`, quote §14.5-d, name "Raghvendra Gupta, Managing Director") → Vision & Mission split → 7 Core Values grid (catalogue p.2 set, hex icons) → counters → CTA.
- **/manufacturing:** hero image band → "How we build" 4-step flow (Design → Fabricate → Upholster & Assemble → QC & Pack, §14.4-c) → capability grid (in-house frames, upholstery, powder-coat partners, BIFMA-tested components p.44) → factory gallery (`/factory`) → quality note → CTA "Visit the factory / OEM with us".
- **/clients:** logo wall (all `/clients`) → segments row → testimonials (all approved+featured, filter by segment later) → case-study slots (3 cards, hidden until content) → dealer CTA band ("Become a DecArt dealer" → /quote?type=dealer).
- **/gallery:** tabs Products · Factory · Installations · Warehouse · Exhibitions (folders §6.3); masonry grid, lightbox, lazy.
- **/contact:** 4 info cards (Call · WhatsApp · Email · Hours) → LeadForm(type=contact) beside Google Map embed (`mapUrl`) → factory address block (+ showroom block if confirmed §18) → GSTIN line.
- **/quote:** intent selector (5 tiles: Quote · Bulk order · Dealer/Distributor · OEM · Custom chair — preselected via `?type=`) → LeadForm(type) → reassurance row (response time, WA alternative) → mini-FAQ (4 items §14.8-h).
- **/downloads:** cards — Product Catalogue (self-hosted PDF, size shown, + "mirror on Google Drive" secondary link) · Company Brochure · Warranty Policy (render only files that exist).
- **Legal pages:** §13 content, prose template, last-updated line.

### 11.6 Admin screens (layout: left sidebar — Dashboard · Inbox · Products · Reviews · Blog · Settings · Logout; topbar with env badge + "View site")

Covered in §10.4–10.8. Global admin rules: no Lenis/GSAP; instant navigation; every table state in URL params (shareable filters); optimistic UI for status/disposition; toasts for all mutations; confirm dialogs on destructive actions; mobile-responsive down to 390px (tables become stacked cards).

### 11.7 Mobile-first UX rules (non-negotiable)

Design at 390px first · tap targets ≥44px · sticky PDP action bar (11.4) · WhatsApp float clear of the bar · filter/select UIs as bottom sheets · form inputs 16px+ (no iOS zoom), correct `inputmode` · hero type scales via clamp() · nav drawer reachable one-handed (actions bottom) · tables scroll-x with sticky first column (admin) · test on 360×740 Android + iPhone SE viewport · marquee/motion never blocks scroll · `100svh` not `100vh` for hero.

### 11.8 Motion spec (GSAP + ScrollTrigger + Lenis)

Lenis `{ lerp: 0.08, smoothWheel: true }`, RAF-driven, killed for reduced-motion + admin. Defaults: reveal = fade-up 24px, 0.7s, `power3.out`, stagger 0.08, `once:true`, batch via `ScrollTrigger.batch('[data-reveal]')`. **Hero load timeline (one orchestrated moment):** bg spotlight fades in (0.6s) → chair slides up 40px + fades (0.8s, -0.4 overlap) → headline lines mask-reveal (0.9s, stagger 0.12) → SpecPlate pops (scale .9→1, 0.3s) → trust row fades. Counters: count-up on enter (1.2s). Hex hover: image scale 1.03 + plate lift 2px (CSS, 200ms). Marquee: CSS animation, `animation-play-state: paused` on hover. Nothing scroll-jacks; no pinned sections in v1.

---

## 12. SEO & PERFORMANCE

- **Metadata:** central `lib/seo.ts` builder → per-route `generateMetadata`. Title patterns: Home `DecArt Industries — Office Chairs & Furniture Manufacturer, Faridabad`; family `"{Family} — DecArt Industries | Manufacturer in Faridabad"`; PDP `"{Name} ({code}) — {Family} | DecArt"`; blog uses its SEO fields. Descriptions from §14 copy; canonical on all; `metadataBase` = prod URL.
- **JSON-LD (`<script type="application/ld+json">`):** Organization + LocalBusiness (name, url, logo, address Faridabad, phone, openingHours Mo–Sa 09:30–18:00, sameAs socials) on layout; `Product` on PDP (name, sku=code, brand DecArt, image, description; `aggregateRating` only when ratingCount>0; **no offers/price**); `BreadcrumbList` on family+PDP; `Article` on blog posts.
- **Sitemap/robots:** `sitemap.ts` = static routes + published families/products/posts (lastmod=updatedAt); robots disallow `/admin`, `/api`.
- **Images:** `next/image` everywhere, AVIF/WebP, correct `sizes`, hero `priority`, all others lazy; alt formula `"DecArt {name} {code} {family} — office furniture manufacturer"`.
- **Perf budget:** LCP <2.5s (hero image ≤180KB AVIF), CLS <0.1 (fixed aspect boxes), JS: GSAP/Lenis dynamically imported on public layout only, TipTap admin-only chunk; fonts subset latin, `display:swap`, preload display face. Lighthouse mobile targets: ≥90 Perf, ≥95 SEO/A11y/Best-Practices on Home, family, PDP, blog post.
- **Analytics (optional env):** GA4 or Plausible; events: lead_submit{type}, whatsapp_click{context}, call_click, catalogue_download.

---

## 13. LEGAL PAGES (draft copy — adjust with client sign-off)

**Privacy Policy (`/privacy-policy`):** What we collect (form fields: name, contact details, company, requirement; technical basics) · Why (respond to queries, prepare quotations, service communication) · Storage (secured database; access limited to DecArt sales staff) · Sharing (never sold; shared only with logistics/service partners to fulfil an order) · WhatsApp/phone contact consent by submitting a form · Cookies (essential + optional analytics) · Retention (business-record duration) · Your rights (request correction/deletion via info@decartseatings.in) · Contact block.

**Terms & Conditions (`/terms`):** Site content is informational; **product designs & specifications are subject to change without prior notice** (catalogue back-cover clause) · Images indicative; finishes may vary · Quotations valid 15 days unless stated · Orders confirmed against advance/PO per quotation · IP: all content, images and the DecArt marks belong to DecArt Industries Pvt. Ltd. · Liability limited to order value · Governing law: India; jurisdiction: Faridabad, Haryana courts.

**Shipping & Refund Policy (`/shipping-refund-policy`):** Made-to-order B2B supply; typical dispatch 2–4 weeks by quantity/customisation (confirmed per order) [confirm timelines] · Pan-India delivery by surface transport; freight & unloading as per quotation · Inspect on delivery; transit damage/shortage claims within 48 hours with photos · Manufacturing-defect resolution: repair or replacement of the affected part/unit first, per warranty terms [warranty document pending — §18] · Cancellations accepted only before production starts; advances against custom production are non-refundable once materials are cut · Returns not accepted on customised goods except for verified defects.

---

## 14. COPY DECK (final content — checklist items marked "prepare according to your own understanding" are prepared here; use verbatim)

### 14.1 Voice

Confident, plain, engineering-warm. Short sentences. Indian-English B2B. No exclamation marks, no "world-class/best-in-class" filler except where quoting the MD. "We" = DecArt. Numbers in mono where UI allows.

### 14.2 Hero (pick A; B/C are approved alternates)

- Eyebrow: `DECART INDUSTRIES · FARIDABAD · SINCE 2015`
- **A — H1:** "Seating a workday can rest on." · Sub: "From director cabins to 500-seat floors — chairs, workstations and office furniture manufactured in-house and delivered pan-India." · CTAs: `Explore products` / `Get a quote`
- **B — H1:** "Trust is our sign. Comfort is our proof."
- **C — H1:** "350+ models. One promise."
- Micro trust row: `Since 2015 · In-house manufacturing · Pan-India delivery`

### 14.3 Company profile (~100 words — footer/About intro/press)

DecArt Industries Private Limited is an office seating and furniture manufacturer based in Faridabad, Haryana. Since 2015, we have designed and built chairs and modular furniture end-to-end in our own facility — director and executive seating, ergonomic mesh ranges, visitor and training chairs, café and lounge collections, workstations, conference tables and institutional furniture. Our catalogue spans 350+ models across 30 families, supplied to corporates, universities, hotels and hospitals across India. Every DecArt product carries the same promise our sign does: comfort you can measure, build quality you can trust, and service that stays after delivery.

### 14.4 About page

**a — Story:** DecArt began in 2015 on a simple observation: workplaces were changing faster than the furniture inside them. A four-legged table and a filing cabinet no longer made an office. So we built a factory in Faridabad that could make what modern work actually needs — seating engineered for long hours, workstations that assemble into any floor plan, and furniture that survives real use. Ten years on, DecArt is a pan-India name in end-to-end chairs and modular furniture, with our own manufacturing, a growing dealer network, and installations in some of the country's most demanding workplaces.
**b — What we make:** Everything the working day sits on and works at: director, CEO and executive chairs; ergonomic mesh and task seating; visitor, training, café, lounge and auditorium ranges; sofas; workstations and cubicles; conference, meeting and reception tables; school furniture; storage, lockers and hostel beds. If a space needs it, we either have it in the catalogue — or we build it to order.
**c — How we build (4 steps):** 1) **Design** — ergonomics, frame geometry and finish planned against how the product will really be used. 2) **Fabricate** — frames, ply and metalwork made and finished in-house. 3) **Upholster & assemble** — high-density moulded PU foam, mesh and leatherette tapestry fitted by hand. 4) **Test & pack** — BIFMA/SGS-tested components, per-piece checks, and packing that survives Indian roads.
**d — Who we serve:** Corporate offices · Education (schools & universities) · Hospitality (hotels & cafés) · Healthcare · Government & institutions.
**e — Closer:** No over-promises, no under-deliveries. Transparency and honesty are what set us apart — it's why our sign says trust.

### 14.5 Vision, Mission, Values, MD's message

**Vision:** To be India's most trusted name in workplace seating — the sign teams look for when comfort, durability and honesty all have to show up in one chair.
**Mission:** Design ergonomic, durable furniture for every kind of workplace · Manufacture end-to-end in-house so quality is never outsourced · Deliver pan-India with dependable timelines and honest pricing · Stand behind every piece with real after-sales service.
**Core values (catalogue p.2 — keep all seven):** Integrity — we say what we do and do what we say · Enduring Relationships — clients become repeat clients · Commitment — every order, every deadline · Embracing Change — workplaces evolve; so do we · Progressive Improvement — better products every year · Teamwork — one factory, one goal · Customer Focus — your delight is the spec sheet.
**From the Managing Director (adapted from catalogue p.3, attribute to Raghvendra Gupta):** "DecArt rises every day to make workplaces better — offices, homes, schools, hospitality and healthcare. Ten-plus years of putting comfort and functionality before everything else have made us a leader in modular seating. We value our people first, because valuing people is where valuing customers begins — and we measure our success in our customers' delight."

### 14.6 Counters & trust strip

`10+` Years manufacturing · `350+` Models in catalogue · `30` Product families · `Pan-India` Delivery — optional 5th: `40+` Marquee clients.
**Marquee client names (logos crop from catalogue p.6):** Marriott, Westin, Toyota, Hero, 3M, Tech Mahindra, SBI, PNB, OLA, Flipkart, DLF, UltraTech, Ashok Leyland, Allianz, Dixon, Minda, Medanta, Fortis, Manipal University, GD Goenka University, NIIT Foundation, Vatika. *(Show logos only; no client-endorsement sentences without permission.)*
**Compliance strip caveat:** catalogue p.5 lists BIFMA-compliant components, ISO 9001:2015, ISO 14001, ISO 45001, ISO 50001, ISO 27001, ISO 13485:2016, BIS, IGBC membership, GRIHA, GREENGUARD, India Design Mark. **Render a badge only when the client supplies that certificate file** (§6.3 `/certificates`); until then the strip shows: "BIFMA/SGS-tested components · GST-registered · Made in India".

### 14.7 Family one-liners (family page heroes + tiles)

director: "Cabin-grade presence — leatherette, ply-frame builds with auto-weight mechanisms." · ceo: "Statement seating for the corner office." · executive: "Everyday leadership chairs that outlast the lease." · manager: "Honest, hard-wearing task seating for full floors." · mesh: "Breathable high-backs with adjustable lumbar and headrest." · ultra-luxury-mesh: "Our flagship ergonomic builds — 4D arms, multi-lock control." · special-luxury-mesh: "Premium mesh, floor-friendly prices." · task-mesh: "Light, tough, stack-the-floor task chairs." · imported: "Hand-picked international designs, DecArt-serviced." · visitor: "Cantilever and four-leg guest seating that keeps its posture." · cafe: "Café chairs and bar stools that take the rush." · lounge: "Breakout and reception seating with personality." · tandem: "Beam seating for lobbies, waiting halls and terminals." · training: "Tablet-arm and stackable chairs for learning spaces." · auditorium: "Fixed seating engineered for full houses." · sofa: "Office sofa sets from cabin two-seaters to lounge suites." · table: "Executive desks in standard sizes or made to measure." · imported-table: "Imported executive desk programs." · reception: "First-impression desks, sized to your lobby." · conference: "Boardroom tables from 4 seats to 40." · meeting: "Round and square huddle tables." · cafe-table: "Café tables in glass, wood and metal." · centre-table: "Centre tables for lounges and cabins." · computer-table: "Compact computer desks for labs and back offices." · foldable: "Fold-flat and height-adjustable desking." · workstation: "Linear desking systems, 2 to 8 seats per run." · cubicle: "Cubicle systems with real acoustic privacy." · school: "Classroom desks, kids' sets and library furniture." · hostel-bed: "Powder-coated hostel beds built for years of terms." · storage: "Cupboards, lockers and filing that keep order."

### 14.8 Microcopy

a **Form helper:** "Fields marked * are required. We reply within one working day (Mon–Sat, 9:30–6)."
b **Success:** "Query received. Our sales desk will call you within one working day. In a hurry? Continue on WhatsApp — your details are already in the message." Buttons: `Continue on WhatsApp` / `Download catalogue`.
c **Error:** "That didn't go through. Nothing is lost — send it on WhatsApp instead, or call +91 93119 42001." (WA button carries the summary.)
d **Review thanks:** "Thanks — your review is with our team and appears after a quick check."
e **Empty family:** "No models match those filters. Tell us what you need — custom builds are our daily work." → `Request a custom build`
f **Warranty & delivery accordion (until warranty doc arrives):** "DecArt products are covered against manufacturing defects; component warranties (mechanisms, gas lifts, castors) as per quotation. Dispatch timelines and freight are confirmed on your quote. Transit damage? Tell us within 48 hours with photos and we'll make it right."
g **Quote CTA band:** H2 "Furnishing a floor, a campus, or one great cabin?" · sub "Send the requirement — sizes, quantities, site city — and get a working quote fast." 
h **Quote FAQ (4):** Do you show prices? — "B2B pricing depends on quantity, finish and freight, so we quote per requirement — usually the same day." · Minimum order? — "Single pieces for most chairs; project MOQs for workstations and custom builds." · Do you deliver outside NCR? — "Yes — pan-India via surface transport." · Can you match a reference design? — "Yes — that's the Custom Chair flow; share a photo on WhatsApp."
i **404:** "This page went for upholstery. Head to Products or ask us directly." 

### 14.9 Email templates

**A — Admin notify** · Subject: `New {TYPE} query — {name} ({phone})`
Header band + title "New website query" · summary table: Type / Name / Company / Phone (tel link) / Email / City / Product (+code, linked) / Qty / Target date / Message / Page · buttons `Call {name}` (tel) + `Reply on WhatsApp` (wa.me/{customer}) · footer "DecArt website · received {datetime IST}".
**B — Customer acknowledgement** · Subject: `We've received your query — DecArt Industries`
"Namaste {name}, Thank you for reaching out to DecArt Industries. Your query is with our sales desk and you'll hear from us within one working day (Mon–Sat, 9:30 AM–6:00 PM)." · nameplate summary card (Product/code · Qty · Your message) · "Need it faster?" `WhatsApp us` / `Call +91 93119 42001` · catalogue button (self-hosted PDF) · signature: DecArt Industries Private Limited · Plot 230-C, Indra Complex, Sector 87, Faridabad 121002 · info@decartseatings.in · Trust is our Sign. Plain-text version mirrors this.
**C — Inbox reply wrapper:** minimal — logo header, admin's composed body, standard signature (from Settings).

### 14.10 WhatsApp message templates (URL-encoded via `waLink`)

A **Float:** "Hello DecArt team 👋 I'm browsing your website and have a query."
B **PDP:** "Hello DecArt team, I'd like a quote for *{name}* ({code}) — {url}\nQuantity: \nCity: "
C **Form fallback/success:** "Hello DecArt, sharing my query from the website:\nName: {name}\nType: {type}\nProduct: {product} {code}\nQty: {qty}\nCity: {city}\nMessage: {message}"
D **Inbox reply (admin→customer):** "Hello {name}, this is DecArt Industries regarding your {type} query for {product}. "

### 14.11 Footer line & misc

About line under logo: "Office chairs and modular furniture, manufactured in Faridabad since 2015. Trust is our Sign." · Hours line: "Mon–Sat · 9:30 AM – 6:00 PM" · Marketplace badges (catalogue cover: GeM, IndiaMART, TradeIndia, Flipkart, Amazon) render only if the client supplies store URLs — never dead badges.

---

## 15. ENVIRONMENT VARIABLES (`.env.example` — commit example, never secrets)

```
NEXT_PUBLIC_SITE_URL=https://decartseatings.in
TURSO_DATABASE_URL=       # libsql://<db>-<org>.turso.io
TURSO_AUTH_TOKEN=
NEXTAUTH_URL= NEXTAUTH_SECRET=
ADMIN_EMAIL=info@decartseatings.in
ADMIN_PASSWORD=            # hashed & seeded on first run, then remove
SMTP_HOST= SMTP_PORT=465 SMTP_USER= SMTP_PASS=
MAIL_FROM_NAME=DecArt Industries
MAIL_ROUTING_JSON={"default":["info@decartseatings.in"]}
CLOUDINARY_CLOUD_NAME= CLOUDINARY_API_KEY= CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET=   # review photos only
NEXT_PUBLIC_WHATSAPP=919311942001
NEXT_PUBLIC_GA_ID=                        # optional
```

---

## 16. BUILD PHASES (commit + deploy preview per phase)

**P0 — Foundation:** Next+TS+Tailwind, tokens §4.2, fonts, Turso connect, schema + repo layer, NextAuth admin, seed script + `check-images`, PlaceholderImage, deploy pipeline. ✔ seed runs idempotently; /admin login works; placeholder renders.
**P1 — Design system:** all §4.5 components, Header/Footer/mega-menu, WhatsApp float, Lenis+GSAP wiring, motion defaults. ✔ Storybook-style `/dev/ui` page (dev-only) shows every component in both themes at 390/1280.
**P2 — Catalogue:** /products, family pages, PDP (minus reviews), filters, sticky mobile bar, JSON-LD, sitemap. ✔ all 30 families render from seed; missing photos fall back cleanly; Lighthouse mobile ≥85 already.
**P3 — Leads:** LeadForm ×6 types, /quote hub, /contact + map, API + honeypot/rate-limit, SMTP both templates, success/fallback UX. ✔ test lead → DB row + 2 emails + WA fallback verified on phone.
**P4 — Admin CRM:** dashboard, Inbox (filters, status/disposition, notes, respond-by-email, **xlsx/csv export**), Settings. ✔ full lifecycle: submit → respond → status won → export contains the row.
**P5 — Products admin:** CRUD, uploads, reorder, spec profile loader, SEO tab. ✔ create product end-to-end and see it live via revalidate.
**P6 — Reviews + Blog:** public review form + moderation + aggregates; blog editor + public pages + Article SEO. ✔ pending→approved updates PDP stars; post publishes with correct meta/OG.
**P7 — Content, polish, launch:** pour §14 copy, Home sections 1–11, About/Manufacturing/Clients/Gallery/Downloads, legal pages, imagery pass with client `/public` drops, motion polish, §17 QA, Lighthouse ≥90, domain + prod envs, submit sitemap to Search Console. ✔ launch checklist signed.

---

## 17. QA CHECKLIST (pre-launch)

☐ 390/768/1280/1536 pass on every public page · ☐ sticky PDP bar + WA float never overlap or cover content · ☐ all 6 lead types: DB row, admin mail, ack mail, routing correct, export shows row · ☐ mail failure path still returns success + WA fallback (test with wrong SMTP pass) · ☐ honeypot & <3s submits rejected silently · ☐ WhatsApp links open with correct prefilled text (Android + iOS) · ☐ tel: links work · ☐ admin auth: /admin & mutating APIs reject anon; wrong password locked out politely · ☐ review lifecycle + aggregate math · ☐ blog XSS: pasted `<script>` sanitized · ☐ export .xlsx opens in Excel/Sheets with correct columns & dates (IST) · ☐ SEO: titles/descriptions unique, JSON-LD validates (Rich Results test), sitemap/robots live, 404 correct status · ☐ images: no layout shift, alts present, hero ≤180KB · ☐ reduced-motion: Lenis off, reveals instant · ☐ keyboard nav + focus visible on menus, accordions, forms, admin tables · ☐ Lighthouse mobile ≥90/95/95/95 on Home, family, PDP, blog · ☐ favicon/OG cards render (WhatsApp link preview!) · ☐ .env.example current; no secrets in repo.

---

## 18. HANDOVER FLAGS (open items for the client — track in README)

1. **GSTIN** `08AAACD3344H1ZW` starts with Rajasthan code `08`; Haryana is `06` — confirm before printing it site-wide (§1).
2. **Email domain:** decartseatings.in (checklist, catalogue back cover) vs decart.co.in mailbox set — confirm; then tune `MAIL_ROUTING_JSON` (§10.3).
3. **Contact variants on catalogue back cover:** showroom "Shop No. 837/929, Shakti Park, Near HDFC Bank, Khandsa, Sector-10, Gurugram", plants "Plot 230 **& 231**", phones +91-99992-99501 / 92365-99534, decartseatings@gmail.com. Checklist (Plot 230-C, 93119-42001) treated as canonical; confirm whether to publish showroom + alt numbers (Settings fields exist).
4. **Catalogue errata** consciously handled in seed: p.63 header misprint (hostel beds), duplicate "DWS-11", repeated "Height Adjustable 1" and "Hostel Bed 5" labels, "DS 5432", DS gaps (§7.2/§7.4) — items flagged `needsReview`.
5. **Certificates:** only GST provided; ISO/BIFMA/MSME badge files needed before the compliance strip upgrades (§14.6).
6. **Warranty policy PDF** + brochure pending → /downloads renders what exists.
7. **Gaming Chairs** family empty by design — add products when available.
8. **Prices hidden by default** ("Request price") — flip per-product `price.show` if the client ever wants list prices.
9. **Marketplace store URLs** (GeM/IndiaMART/TradeIndia/Flipkart/Amazon) needed to activate footer badges.
10. **Photography:** `npm run check-images` prints missing manifest files — share the list with the client; catalogue crops are acceptable for launch, real shoots can replace later.

— END OF SPEC —
