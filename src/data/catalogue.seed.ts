/**
 * Catalogue taxonomy + seed expansion — §7 of the build spec.
 * Source of truth: DecArt Master Catalogue (68 pp.), plus the 2023 photo-shoot models (§/data/photoshoot.ts).
 */
import type { SpecProfile } from './specs';
import { SPEC_PROFILES } from './specs';
import { PHOTOSHOOT_MODELS } from './photoshoot';

export type ProductGroup = 'seating' | 'tables-desks' | 'furniture';

export type FamilySeed = {
  slug: string;
  name: string;
  /** singular noun used to build product names: "Director Chair DS-101" */
  singular: string;
  group: ProductGroup;
  pages: string;
  ds?: { from: number; to: number; skip?: number[] };
  codes?: string[];
  named?: string[];
  spec: SpecProfile;
  sizes?: Record<string, string>;
  tags?: string[];
  note?: string;
  /** hidden from nav until it has published products */
  hidden?: boolean;
};

const dws = (list: string[]) => Object.fromEntries(list.map((v, i) => [`DWS-${String(i + 1).padStart(2, '0')}`, v]));
const cubic = (list: string[]) => Object.fromEntries(list.map((v, i) => [`CUBIC-${String(i + 1).padStart(2, '0')}`, v]));
const conf = (list: string[]) =>
  Object.fromEntries(list.map((v, i) => [`Conference-${String(i + 1).padStart(2, '0')}`, `${v}×750`]));

export const FAMILIES: FamilySeed[] = [
  {
    slug: 'imported',
    name: 'Imported Chairs',
    singular: 'Imported Chair',
    group: 'seating',
    pages: '7–8',
    spec: 'imported',
    named: ['Raybach', 'Vibe', 'Boat', 'Daisy', 'Senora', 'Moon', 'Faux'],
    tags: ['executive', 'imported'],
  },
  {
    slug: 'director',
    name: 'Director Chairs',
    singular: 'Director Chair',
    group: 'seating',
    pages: '9–13',
    spec: 'leather-exec',
    ds: { from: 101, to: 153 },
    tags: ['director', 'executive', 'leather'],
  },
  {
    slug: 'ceo',
    name: 'CEO Chairs',
    singular: 'CEO Chair',
    group: 'seating',
    pages: '14–15',
    spec: 'leather-exec',
    ds: { from: 201, to: 227 },
    tags: ['executive', 'leather'],
  },
  {
    slug: 'executive',
    name: 'Executive Chairs',
    singular: 'Executive Chair',
    group: 'seating',
    pages: '16–17',
    spec: 'leather-exec',
    ds: { from: 301, to: 337 },
    named: ['Relcro', 'Relcro-1', 'Galgo', 'Galgo-1', 'Velgo'],
    tags: ['executive', 'leather'],
    note: 'verify absent numbers against print',
  },
  {
    slug: 'manager',
    name: 'Manager Chairs',
    singular: 'Manager Chair',
    group: 'seating',
    pages: '18',
    spec: 'fabric-task',
    ds: { from: 401, to: 419, skip: [404, 405, 406, 416, 417] },
    tags: ['office', 'task'],
  },
  {
    slug: 'mesh',
    name: 'Mesh Chairs',
    singular: 'Mesh Chair',
    group: 'seating',
    pages: '19',
    spec: 'mesh-ergo',
    ds: { from: 501, to: 501 },
    named: ['Glanza'],
    tags: ['mesh', 'ergonomic'],
  },
  {
    slug: 'ultra-luxury-mesh',
    name: 'Ultra Luxury Mesh',
    singular: 'Ultra Luxury Mesh Chair',
    group: 'seating',
    pages: '20',
    spec: 'mesh-ergo',
    ds: { from: 503, to: 506 },
    tags: ['mesh', 'ergonomic'],
  },
  {
    slug: 'special-luxury-mesh',
    name: 'Special Luxury Mesh',
    singular: 'Special Luxury Mesh Chair',
    group: 'seating',
    pages: '21–22',
    spec: 'mesh-ergo',
    ds: { from: 507, to: 529, skip: [511, 512, 513, 514] },
    named: ['Fly', 'Fly-1', 'Marvel', 'Marvel-MB', 'Velfire', 'Velfire-1'],
    tags: ['mesh', 'ergonomic'],
  },
  {
    slug: 'task-mesh',
    name: 'Task Mesh Chairs',
    singular: 'Task Chair',
    group: 'seating',
    pages: '23–25',
    spec: 'mesh-task',
    ds: { from: 532, to: 574 },
    named: ['Ditto', 'Punch', 'Seltos'],
    tags: ['mesh', 'office', 'workstation', 'task'],
    note: 'p.23 prints DS 5432 = DS-543',
  },
  {
    slug: 'visitor',
    name: 'Visitor Chairs',
    singular: 'Visitor Chair',
    group: 'seating',
    pages: '26',
    spec: 'visitor',
    ds: { from: 601, to: 616 },
    named: ['Exter'],
    tags: ['visitor', 'conference'],
  },
  {
    slug: 'cafe',
    name: 'Café Chairs & Bar Stools',
    singular: 'Café Chair',
    group: 'seating',
    pages: '27–28',
    spec: 'cafe',
    ds: { from: 701, to: 736 },
    tags: ['cafe'],
  },
  {
    slug: 'lounge',
    name: 'Lounge Seating',
    singular: 'Lounge Chair',
    group: 'seating',
    pages: '30–32',
    spec: 'lounge',
    ds: { from: 901, to: 936 },
    codes: ['DS-909A'],
    tags: ['lounge'],
    note: '933–936 are pouffes',
  },
  {
    slug: 'tandem',
    name: 'Tandem & Waiting Benches',
    singular: 'Tandem Bench',
    group: 'seating',
    pages: '37–38',
    spec: 'tandem',
    ds: { from: 1201, to: 1213 },
    tags: ['visitor'],
  },
  {
    slug: 'training',
    name: 'Training Chairs',
    singular: 'Training Chair',
    group: 'seating',
    pages: '39',
    spec: 'training',
    ds: { from: 1301, to: 1317, skip: [1311, 1312, 1313] },
    tags: ['training'],
  },
  {
    slug: 'auditorium',
    name: 'Auditorium Seating',
    singular: 'Auditorium Seat',
    group: 'seating',
    pages: '43',
    spec: 'auditorium',
    ds: { from: 1501, to: 1509 },
    named: ['Audi-1'],
    tags: ['auditorium'],
  },
  {
    slug: 'gaming',
    name: 'Gaming Chairs',
    singular: 'Gaming Chair',
    group: 'seating',
    pages: '—',
    spec: 'mesh-ergo',
    tags: ['gaming'],
    hidden: true,
    note: 'no catalogue models yet — hidden from nav until admin adds products',
  },

  // ---- tables & desks ----
  {
    slug: 'table',
    name: 'Executive & Manager Desks',
    singular: 'Executive Desk',
    group: 'tables-desks',
    pages: '49–51',
    spec: 'desk',
    codes: ['DMF-BS01', 'DMF-01', 'DMF-02', 'DMF-03', 'DMF-04', 'DMF-05', 'DMF-08', 'DMF-09', 'DMF-10', 'DMF-11', 'PMF-02', 'PMF-09'],
    tags: ['desk'],
  },
  {
    slug: 'imported-table',
    name: 'Imported Executive Desks',
    singular: 'Imported Executive Desk',
    group: 'tables-desks',
    pages: '47–48',
    spec: 'desk',
    codes: ['AFM01-1816', 'AFM03-B6218', 'AFM-HDA06', 'AFM-LJA02', 'AFM-FYA02'],
    tags: ['desk', 'imported'],
  },
  {
    slug: 'reception',
    name: 'Reception Desks',
    singular: 'Reception Desk',
    group: 'tables-desks',
    pages: '45–46',
    spec: 'desk',
    codes: ['Reception-1', 'Reception-2', 'Reception-3', 'Reception-4', 'Reception-5', 'Reception-6', 'Reception-7'],
    tags: ['desk', 'reception'],
  },
  {
    slug: 'conference',
    name: 'Conference Tables',
    singular: 'Conference Table',
    group: 'tables-desks',
    pages: '57–59',
    spec: 'table-conf',
    codes: Array.from({ length: 17 }, (_, i) => `Conference-${String(i + 1).padStart(2, '0')}`),
    sizes: conf([
      '3600×1500', '3000×1200', '3000×1350', '2400×1050', '3000×1350', '4500×1500', '4500×1200', '3600×1200',
      '3000×1350', '2400×1200', '2400×1050', '6000×3000', '3600×1800', '4800×2100', '4200×1500', '3600×1500',
      '5400×3000',
    ]),
    tags: ['conference'],
  },
  {
    slug: 'meeting',
    name: 'Meeting Tables',
    singular: 'Meeting Table',
    group: 'tables-desks',
    pages: '60',
    spec: 'table-conf',
    codes: ['MT-01', 'MT-02', 'MT-03', 'MT-04', 'MT-05', 'MT-06'],
    tags: ['conference'],
  },
  {
    slug: 'cafe-table',
    name: 'Café Tables',
    singular: 'Café Table',
    group: 'tables-desks',
    pages: '29',
    spec: 'table-cafe',
    ds: { from: 801, to: 813 },
    tags: ['cafe'],
  },
  {
    slug: 'centre-table',
    name: 'Centre Tables',
    singular: 'Centre Table',
    group: 'tables-desks',
    pages: '36',
    spec: 'table-cafe',
    ds: { from: 1101, to: 1112 },
    tags: ['lounge'],
  },
  {
    slug: 'computer-table',
    name: 'Computer Tables',
    singular: 'Computer Table',
    group: 'tables-desks',
    pages: '61',
    spec: 'desk',
    codes: ['Computer-1', 'Computer-2', 'Computer-3', 'Computer-4', 'Computer-5', 'Computer-6', 'Computer-7'],
    tags: ['desk'],
  },
  {
    slug: 'foldable',
    name: 'Foldable & Height-Adjustable Desks',
    singular: 'Foldable Desk',
    group: 'tables-desks',
    pages: '62',
    spec: 'desk',
    codes: ['Fold-1', 'Fold-2', 'Fold-3', 'HA-1', 'HA-2', 'HA-3'],
    tags: ['desk'],
    note: 'renumbered from repeated print labels',
  },
  {
    slug: 'workstation',
    name: 'Workstations',
    singular: 'Workstation',
    group: 'tables-desks',
    pages: '52–54',
    spec: 'desking',
    codes: Array.from({ length: 19 }, (_, i) => `DWS-${String(i + 1).padStart(2, '0')}`),
    sizes: dws([
      '1200×1200×1050', '2400×1200×1050', '2400×600×1050', '3600×1200×900', '2400×1200×1050', '1500×1200×1050',
      '3600×1200×1050', '2400×1200×1050', '3600×1200×1050', '4800×1200×1200', '3600×1200×1200', '2700×1200×1050',
      '2400×1200×1050', '3000×1200×1050', '2700×1200×1050', '2700×1200×1050', '3600×600×1050', '3600×1200×900',
      '4200×1200×1050',
    ]),
    tags: ['workstation', 'desk'],
    note: 'catalogue prints "DWS-11" twice — the first was renumbered DWS-10',
  },
  {
    slug: 'cubicle',
    name: 'Cubicles',
    singular: 'Cubicle',
    group: 'tables-desks',
    pages: '55–56',
    spec: 'desking',
    codes: Array.from({ length: 11 }, (_, i) => `CUBIC-${String(i + 1).padStart(2, '0')}`),
    sizes: cubic([
      '1200×1200×1050', '1500×1200×1050', '3000×3000×1350', '1500×3000×1200', '3000×3000×1050', '3000×3000×1050',
      '1200×1200×1050', '1500×1200×1050', '3000×3000×1350', '1500×1200×1200', '3000×3000×1050',
    ]),
    tags: ['workstation'],
  },

  // ---- furniture & institutional ----
  {
    slug: 'sofa',
    name: 'Office Sofas',
    singular: 'Sofa',
    group: 'furniture',
    pages: '33–35',
    spec: 'sofa',
    ds: { from: 1001, to: 1015 },
    tags: ['lounge'],
  },
  {
    slug: 'school',
    name: 'School Furniture',
    singular: 'School Furniture',
    group: 'furniture',
    pages: '40–42',
    spec: 'school',
    ds: { from: 1401, to: 1419 },
    tags: ['institutional'],
  },
  {
    slug: 'hostel-bed',
    name: 'Hostel Beds',
    singular: 'Hostel Bed',
    group: 'furniture',
    pages: '63',
    spec: 'institutional',
    codes: ['Hostel-Bed-1', 'Hostel-Bed-2', 'Hostel-Bed-3', 'Hostel-Bed-4', 'Hostel-Bed-5'],
    tags: ['institutional'],
    note: 'catalogue page header misprinted; repeated labels renumbered',
  },
  {
    slug: 'storage',
    name: 'Storage & Lockers',
    singular: 'Storage Unit',
    group: 'furniture',
    pages: '64–66',
    spec: 'storage',
    codes: [
      'Storage-1', 'Storage-2', 'Storage-3', 'Storage-4', 'Storage-5', 'Storage-6', 'Storage-7',
      'Locker-01', 'Locker-02', 'Locker-03', 'Locker-04', 'Locker-05',
      'Full-Height-01', 'Full-Height-02', 'Full-Height-03', 'Full-Height-04', 'Full-Height-05',
      'Low-Height-01', 'Low-Height-02', 'Low-Height-03',
      'Filing-01', 'Filing-02', 'Filing-03',
    ],
    tags: ['storage'],
  },
];

export const GROUPS: { slug: ProductGroup; name: string }[] = [
  { slug: 'seating', name: 'Office Seating' },
  { slug: 'tables-desks', name: 'Tables & Desks' },
  { slug: 'furniture', name: 'Furniture & Institutional' },
];

/** Checklist categories (§7.1) resolved onto families — SEO landing aliases + filters. */
export const CHECKLIST_CATEGORIES: { slug: string; name: string; families: string[] }[] = [
  { slug: 'executive-chairs', name: 'Executive Chairs', families: ['executive', 'ceo'] },
  { slug: 'office-chairs', name: 'Office Chairs', families: ['manager', 'task-mesh'] },
  { slug: 'mesh-chairs', name: 'Mesh Chairs', families: ['mesh', 'special-luxury-mesh', 'task-mesh'] },
  { slug: 'ergonomic-chairs', name: 'Ergonomic Chairs', families: ['ultra-luxury-mesh', 'mesh'] },
  { slug: 'visitor-chairs', name: 'Visitor Chairs', families: ['visitor'] },
  { slug: 'conference-chairs', name: 'Conference Chairs', families: ['visitor', 'conference'] },
  { slug: 'gaming-chairs', name: 'Gaming Chairs', families: ['gaming'] },
  { slug: 'training-chairs', name: 'Training Chairs', families: ['training'] },
  { slug: 'cafe-chairs', name: 'Cafe Chairs', families: ['cafe'] },
  { slug: 'director-chairs', name: 'Director Chairs', families: ['director'] },
  { slug: 'workstation-chairs', name: 'Workstation Chairs', families: ['task-mesh', 'workstation'] },
];

/** Family one-liners — §14.7 copy deck. */
export const FAMILY_LEDE: Record<string, string> = {
  director: 'Cabin-grade presence — leatherette, ply-frame builds with auto-weight mechanisms.',
  ceo: 'Statement seating for the corner office.',
  executive: 'Everyday leadership chairs that outlast the lease.',
  manager: 'Honest, hard-wearing task seating for full floors.',
  mesh: 'Breathable high-backs with adjustable lumbar and headrest.',
  'ultra-luxury-mesh': 'Our flagship ergonomic builds — 4D arms, multi-lock control.',
  'special-luxury-mesh': 'Premium mesh, floor-friendly prices.',
  'task-mesh': 'Light, tough, stack-the-floor task chairs.',
  imported: 'Hand-picked international designs, DecArt-serviced.',
  visitor: 'Cantilever and four-leg guest seating that keeps its posture.',
  cafe: 'Café chairs and bar stools that take the rush.',
  lounge: 'Breakout and reception seating with personality.',
  tandem: 'Beam seating for lobbies, waiting halls and terminals.',
  training: 'Tablet-arm and stackable chairs for learning spaces.',
  auditorium: 'Fixed seating engineered for full houses.',
  gaming: 'Built to order — tell us the spec and we will quote it.',
  sofa: 'Office sofa sets from cabin two-seaters to lounge suites.',
  table: 'Executive desks in standard sizes or made to measure.',
  'imported-table': 'Imported executive desk programs.',
  reception: 'First-impression desks, sized to your lobby.',
  conference: 'Boardroom tables from 4 seats to 40.',
  meeting: 'Round and square huddle tables.',
  'cafe-table': 'Café tables in glass, wood and metal.',
  'centre-table': 'Centre tables for lounges and cabins.',
  'computer-table': 'Compact computer desks for labs and back offices.',
  foldable: 'Fold-flat and height-adjustable desking.',
  workstation: 'Linear desking systems, 2 to 8 seats per run.',
  cubicle: 'Cubicle systems with real acoustic privacy.',
  school: 'Classroom desks, kids sets and library furniture.',
  'hostel-bed': 'Powder-coated hostel beds built for years of terms.',
  storage: 'Cupboards, lockers and filing that keep order.',
};

export type SeedProduct = {
  code: string;
  name: string;
  slug: string;
  family: string;
  group: ProductGroup;
  tags: string[];
  summary: string;
  description: string;
  specs: { label: string; value: string }[];
  buildOptions: boolean;
  sizeMm?: string;
  images: { src: string; alt: string }[];
  cataloguePage?: number;
  featured: boolean;
  bestSeller: boolean;
  status: 'draft' | 'published';
  needsPhoto: boolean;
  needsReview: boolean;
  order: number;
  colourways?: { label: string; slug: string; images: string[] }[];
  seo: { title: string; description: string };
};

export const FEATURED_CODES = new Set(
  [
    'RAYBACH', 'GLANZA-HB', 'MUSTANG-HB', 'HILITE-HB', 'OPTIMUS-PRE-HB', 'EIFFEL-HB', 'BUBBLE-MB',
    'DS-101', 'DS-201', 'FLY', 'EXTER', 'DS-701', 'DWS-07', 'CUBIC-03', 'CONFERENCE-01',
  ].map((c) => c.toUpperCase()),
);

const BEST_SELLERS = new Set(['MUSTANG-HB', 'GLANZA-HB', 'EIFFEL-HB', 'BUBBLE-MB', 'FEATHER-MB', 'DS-101']);

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const firstPage = (pages: string) => {
  const n = pages.match(/\d+/);
  return n ? Number(n[0]) : undefined;
};

function describe(family: FamilySeed, name: string): string {
  const lede = FAMILY_LEDE[family.slug] ?? '';
  return [
    `${name} is part of the DecArt ${family.name.toLowerCase()} range, manufactured end-to-end at our Faridabad facility. ${lede}`,
    'Every unit is built to the same spec sheet we quote from — frame, foam, mechanism and finish are all stated up front, and each one is checked before it is packed.',
    'Available for single-piece supply or full-floor projects, with finish and build options confirmed on your quotation.',
  ].join('\n\n');
}

/** Expand the family table into one seed product per printed model code. */
export function expandFamily(family: FamilySeed): SeedProduct[] {
  const codes: string[] = [];

  if (family.ds) {
    const skip = new Set(family.ds.skip ?? []);
    for (let n = family.ds.from; n <= family.ds.to; n++) {
      if (!skip.has(n)) codes.push(`DS-${n}`);
    }
  }
  if (family.codes) codes.push(...family.codes);
  if (family.named) codes.push(...family.named);

  const page = firstPage(family.pages);
  const isSeating = family.group === 'seating';

  return codes.map((rawCode, i) => {
    const code = rawCode.toUpperCase();
    const isNamed = !!family.named?.some((n) => n.toUpperCase() === code);
    const name = isNamed ? titleise(rawCode) : `${family.singular} ${code}`;
    const slug = slugify(rawCode);
    const sizeMm = family.sizes?.[rawCode];

    return {
      code,
      name,
      slug,
      family: family.slug,
      group: family.group,
      tags: family.tags ?? [],
      summary: FAMILY_LEDE[family.slug] ?? family.name,
      description: describe(family, name),
      specs: SPEC_PROFILES[family.spec],
      buildOptions: isSeating,
      sizeMm,
      images: [],
      cataloguePage: page,
      featured: FEATURED_CODES.has(code),
      bestSeller: BEST_SELLERS.has(code),
      status: 'published' as const,
      needsPhoto: true,
      needsReview: !!family.note,
      order: i,
      seo: {
        title: `${name} (${code}) — ${family.name} | DecArt`,
        description: `${name} by DecArt Industries, Faridabad. ${FAMILY_LEDE[family.slug] ?? ''} Request a quote or WhatsApp us for pricing.`.slice(0, 158),
      },
    };
  });
}

function titleise(s: string) {
  return s
    .split(/[\s-]/)
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Every seed product: catalogue expansion + the photographed 2023 models. */
export function allSeedProducts(): SeedProduct[] {
  const catalogue = FAMILIES.flatMap(expandFamily);
  const photographed = PHOTOSHOOT_MODELS;

  // photographed models win on slug collision (Glanza ships with real images)
  const bySlug = new Map<string, SeedProduct>();
  for (const p of catalogue) bySlug.set(p.slug, p);
  for (const p of photographed) bySlug.set(p.slug, p);
  return [...bySlug.values()];
}

export const familyBySlug = (slug: string) => FAMILIES.find((f) => f.slug === slug);
export const visibleFamilies = () => FAMILIES.filter((f) => !f.hidden);
