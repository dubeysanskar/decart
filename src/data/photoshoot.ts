/**
 * The 2023 photo-shoot range — models we hold real studio photography for.
 *
 * Image paths come from `photoshoot-images.generated.ts` (written by `npm run ingest-images`);
 * everything commercial (family, copy, specs, colourways) is authored here and stays editable
 * in admin once seeded.
 */
import { PHOTOSHOOT } from './photoshoot-images.generated';
import { SPEC_PROFILES, type Spec, type SpecProfile } from './specs';
import type { ProductGroup, SeedProduct } from './catalogue.seed';

type ModelMeta = {
  /** key into PHOTOSHOOT */
  key: string;
  name: string;
  code: string;
  family: string;
  group: ProductGroup;
  spec: SpecProfile;
  tags: string[];
  summary: string;
  /** 2–3 sentences for the PDP */
  description: string[];
  /** appended to / overriding the family spec profile */
  specOverrides?: Spec[];
  featured?: boolean;
  bestSeller?: boolean;
  sizeMm?: string;
};

const MESH_BACK = (back: 'High' | 'Mid') => `${back}-back`;

export const MODEL_META: ModelMeta[] = [
  {
    key: 'mustang-hb',
    name: 'Mustang High-Back Mesh Chair',
    code: 'MUSTANG-HB',
    family: 'ultra-luxury-mesh',
    group: 'seating',
    spec: 'mesh-ergo',
    tags: ['mesh', 'ergonomic', 'executive', 'office'],
    summary: 'Full ergonomic high-back with adjustable headrest and one-piece mesh frame.',
    description: [
      'The Mustang is our flagship long-hours chair. A single moulded frame carries the mesh back and the headrest, so the whole spine of the chair flexes together instead of hinging at a joint.',
      'Height-adjustable arms, a multi-lock weight mechanism and a Class-4 gas lift come standard; the mesh is a tight double-weave that holds tension after years of use.',
      'Supplied in black as standard, with seat fabric in six shades — and any shade you send us for project quantities.',
    ],
    featured: true,
    bestSeller: true,
  },
  {
    key: 'mustang-mb',
    name: 'Mustang Mid-Back Mesh Chair',
    code: 'MUSTANG-MB',
    family: 'ultra-luxury-mesh',
    group: 'seating',
    spec: 'mesh-ergo',
    tags: ['mesh', 'ergonomic', 'office', 'task'],
    summary: 'The Mustang platform without the headrest — for open floors and shared desks.',
    description: [
      'Same frame, same mechanism, same mesh as the high-back — the mid-back drops the headrest so it sits clean under a workstation screen.',
      'It is the version most large floors order: lower sightlines, identical comfort at the lumbar, and a colour-matched seat.',
      'Height-adjustable arms and a Class-4 gas lift are standard.',
    ],
  },
  {
    key: 'hilite-hb',
    name: 'Hilite High-Back Mesh Chair',
    code: 'HILITE-HB',
    family: 'ultra-luxury-mesh',
    group: 'seating',
    spec: 'mesh-ergo',
    tags: ['mesh', 'ergonomic', 'executive'],
    summary: 'Sculpted high-back with adjustable lumbar and a headrest that tilts with you.',
    description: [
      'The Hilite is the chair we put in cabins that want ergonomics without an engineering-lab look — a soft-edged mesh back, a slim aluminium-look base and a headrest that pivots as the back reclines.',
      'The lumbar block adjusts up and down independently of the back tension, which is what makes it work across very different builds of person.',
      'Full spec sheet available on request; the factory drawing is on the downloads page.',
    ],
    featured: true,
  },
  {
    key: 'hilite-mb',
    name: 'Hilite Mid-Back Mesh Chair',
    code: 'HILITE-MB',
    family: 'ultra-luxury-mesh',
    group: 'seating',
    spec: 'mesh-ergo',
    tags: ['mesh', 'ergonomic', 'office'],
    summary: 'The Hilite in mid-back form — the same lumbar block, a lower profile.',
    description: [
      'Mid-back Hilite for workstations and meeting rooms where a headrest gets in the way of the screen line.',
      'Adjustable lumbar, weight-sensing tilt and a Class-4 gas lift carry over unchanged from the high-back.',
      'Specify arms fixed or height-adjustable at order.',
    ],
  },
  {
    key: 'optimus-pre-hb',
    name: 'Optimus Pre High-Back Chair',
    code: 'OPTIMUS-PRE-HB',
    family: 'ultra-luxury-mesh',
    group: 'seating',
    spec: 'mesh-ergo',
    tags: ['mesh', 'ergonomic', 'executive'],
    summary: 'Premium ergonomic build — 4D arms, synchro tilt, adjustable everything.',
    description: [
      'Optimus Pre is the most adjustable chair we make: 4D armrests, seat-depth slide, adjustable lumbar and a synchronised tilt with four lock positions.',
      'It is specified where one desk is shared across shifts, or where a single chair has to fit a very wide range of users.',
      'A functional walkthrough video is available on request from the sales desk.',
    ],
    featured: true,
  },
  {
    key: 'optimus-pre-mb',
    name: 'Optimus Pre Mid-Back Chair',
    code: 'OPTIMUS-PRE-MB',
    family: 'ultra-luxury-mesh',
    group: 'seating',
    spec: 'mesh-ergo',
    tags: ['mesh', 'ergonomic', 'office'],
    summary: 'Optimus Pre adjustability in a mid-back shell.',
    description: [
      'The mid-back Optimus keeps the 4D arms and the synchro tilt and loses the headrest — the usual choice for benching runs.',
      'Seat-depth slide and adjustable lumbar are retained.',
      'Base and castors to your spec.',
    ],
  },
  {
    key: 'eiffel-hb',
    name: 'Eiffel High-Back Mesh Chair',
    code: 'EIFFEL-HB',
    family: 'special-luxury-mesh',
    group: 'seating',
    spec: 'mesh-ergo',
    tags: ['mesh', 'ergonomic', 'office'],
    summary: 'High-back mesh with a colour-flash back frame — six colourways.',
    description: [
      'The Eiffel is our most-ordered coloured chair. A black mesh back is framed in a second colour that runs down the spine and reappears on the seat, so a floor can be zoned by team without changing model.',
      'Underneath it is a straightforward, hard-wearing build: moulded foam seat, weight-sensing tilt, nylon base, Class-4 gas lift.',
      'Black with blue, green, grey, orange or red — plus all-grey.',
    ],
    featured: true,
    bestSeller: true,
  },
  {
    key: 'eiffel-mb',
    name: 'Eiffel Mid-Back Mesh Chair',
    code: 'EIFFEL-MB',
    family: 'special-luxury-mesh',
    group: 'seating',
    spec: 'mesh-ergo',
    tags: ['mesh', 'office', 'task'],
    summary: 'Mid-back Eiffel in the same six colourways.',
    description: [
      'The mid-back Eiffel is the workhorse of the range — same colour language, lower back, easier to specify in quantity.',
      'Moulded foam seat, mesh back, swivel-tilt mechanism and a nylon base.',
      'Stack the colourways across a floor or keep it to one; pricing does not change.',
    ],
  },
  {
    key: 'yaris-hb',
    name: 'Yaris High-Back Mesh Chair',
    code: 'YARIS-HB',
    family: 'special-luxury-mesh',
    group: 'seating',
    spec: 'mesh-ergo',
    tags: ['mesh', 'ergonomic', 'office'],
    summary: 'High-back mesh with a colour-flap headrest panel.',
    description: [
      'Yaris carries a contrast flap across the headrest — a small detail that reads clearly across a big floor and lets a client brand a zone without custom tooling.',
      'The back is a tensioned mesh over a moulded frame with an integrated lumbar curve.',
      'Six flap colours; seat and mesh stay black.',
    ],
  },
  {
    key: 'yaris-mb',
    name: 'Yaris Mid-Back Mesh Chair',
    code: 'YARIS-MB',
    family: 'special-luxury-mesh',
    group: 'seating',
    spec: 'mesh-ergo',
    tags: ['mesh', 'office', 'task'],
    summary: 'The Yaris shell in mid-back form.',
    description: [
      'Mid-back Yaris for open-plan desking — the same moulded frame and tensioned mesh, without the headrest flap.',
      'Swivel-tilt mechanism, Class-4 gas lift and a nylon base.',
      'Arms fixed or height-adjustable to order.',
    ],
  },
  {
    key: 'bonai-hb',
    name: 'Bonai High-Back Chair with Hanger',
    code: 'BONAI-HB',
    family: 'mesh',
    group: 'seating',
    spec: 'mesh-ergo',
    tags: ['mesh', 'ergonomic', 'executive'],
    summary: 'High-back mesh with a built-in coat hanger on the headrest.',
    description: [
      'The Bonai answers a small, permanent office problem: where the jacket goes. A moulded hanger sits behind the headrest, strong enough for a coat and shaped so it disappears from the front.',
      'The rest is a proper ergonomic build — cross-braced mesh back, adjustable headrest, cushioned seat and a five-star nylon base.',
      'Standard in black.',
    ],
  },
  {
    key: 'bonai-mb',
    name: 'Bonai Mid-Back Chair with Hanger',
    code: 'BONAI-MB',
    family: 'mesh',
    group: 'seating',
    spec: 'mesh-ergo',
    tags: ['mesh', 'office'],
    summary: 'Mid-back Bonai — hanger retained, headrest dropped.',
    description: [
      'Same hanger detail, shorter back. Specified where the chair has to tuck fully under a desk or a screen.',
      'Mesh back with a moulded-foam seat, swivel-tilt mechanism and Class-4 gas lift.',
      'Standard in black.',
    ],
  },
  {
    key: 'glanza-hb',
    name: 'Glanza High-Back Mesh Chair',
    code: 'GLANZA-HB',
    family: 'mesh',
    group: 'seating',
    spec: 'mesh-ergo',
    tags: ['mesh', 'ergonomic', 'executive'],
    summary: 'Catalogue mesh flagship — light frame, grey or white finish.',
    description: [
      'Glanza is the chair on page 19 of the catalogue and still one of our best-selling mesh builds. The frame is deliberately light — a slim back rim, a thin seat pan and a low-profile mechanism housing.',
      'Adjustable headrest and lumbar, weight-sensing tilt, Class-4 gas lift.',
      'Grey or white shell, which makes it the usual pick for lighter interiors.',
    ],
    featured: true,
    bestSeller: true,
  },
  {
    key: 'glanza-mb',
    name: 'Glanza Mid-Back Mesh Chair',
    code: 'GLANZA-MB',
    family: 'mesh',
    group: 'seating',
    spec: 'mesh-ergo',
    tags: ['mesh', 'office', 'task'],
    summary: 'Mid-back Glanza in grey or white.',
    description: [
      'The mid-back Glanza keeps the light frame and the light finish and drops the headrest.',
      'Moulded-foam seat, tensioned mesh back, swivel-tilt mechanism.',
      'Grey or white.',
    ],
  },
  {
    key: 'bubble-mb',
    name: 'Bubble Mid-Back Chair',
    code: 'BUBBLE-MB',
    family: 'task-mesh',
    group: 'seating',
    spec: 'mesh-task',
    tags: ['office', 'task', 'workstation', 'cafe'],
    summary: 'Perforated polymer back with a contrast lumbar pad — twelve colourways.',
    description: [
      'The Bubble replaces mesh with a perforated polymer shell: it breathes, it flexes, and it does not sag. A small upholstered lumbar pad clips onto the shell in a contrast colour.',
      'Black, grey or white shell with the seat and pad in blue, green, grey, orange or red — twelve combinations in the standard range, more to order.',
      'A soft-height-adjustable arm and a matching five-star base complete it. Popular in collaborative areas and cafés as much as at desks.',
    ],
    featured: true,
    bestSeller: true,
  },
  {
    key: 'feather-mb',
    name: 'Feather Mid-Back Task Chair',
    code: 'FEATHER-MB',
    family: 'task-mesh',
    group: 'seating',
    spec: 'mesh-task',
    tags: ['office', 'task', 'workstation'],
    summary: 'Light, tough task chair for full floors — eight colourways.',
    description: [
      'Feather is the chair to specify when the count is high and the budget is real. It is deliberately simple: mesh back, moulded-foam seat, centre-tilt mechanism, nylon base.',
      'What it does not skimp on is the parts that fail first — the gas lift is Class-4 and the castors are 60 mm twin-wheel.',
      'Eight seat colours including silver grey and full grey.',
    ],
    bestSeller: true,
  },
  {
    key: 'ecco-mb',
    name: 'Ecco Mid-Back Task Chair',
    code: 'ECCO-MB',
    family: 'task-mesh',
    group: 'seating',
    spec: 'mesh-task',
    tags: ['office', 'task', 'workstation'],
    summary: 'Compact task chair with a two-panel mesh back and fixed loop arms.',
    description: [
      'Ecco is the compact end of the task range — a two-panel mesh back with a ventilated centre spine and fixed loop arms moulded into the frame.',
      'It tucks fully under a 600 mm deep worktop, which is why it turns up in labs, call floors and back offices.',
      'Centre-tilt mechanism, Class-4 gas lift, nylon base.',
    ],
  },
  {
    key: 'comfort-hi-stool',
    name: 'Comfort Hi-Stool',
    code: 'COMFORT-HI-STOOL',
    family: 'cafe',
    group: 'seating',
    spec: 'cafe',
    tags: ['cafe', 'lounge'],
    summary: 'Upholstered bar stool with a footring and gas-lift height.',
    description: [
      'A café and counter stool built like an office chair — gas-lift height adjustment, a proper footring, and a moulded foam seat that survives an all-day rush.',
      'The shell is upholstered in a single bright shade; the base is a weighted disc with a nylon glide.',
      'Blue, green and orange in the standard range.',
    ],
    specOverrides: [
      { label: 'Type', value: 'Gas-lift bar stool with footring' },
      { label: 'Seat', value: 'Moulded PU foam, fabric upholstered' },
      { label: 'Height', value: 'Gas-lift adjustable, counter to bar height' },
      { label: 'Base', value: 'Weighted disc base with nylon glide' },
      { label: 'Customisation', value: 'Upholstery shade to order' },
    ],
  },
];

/** Profile rows first; an override with the same label replaces its row in place. */
function mergeSpecs(profile: Spec[], overrides?: Spec[]): Spec[] {
  if (!overrides?.length) return profile;
  const merged = profile.map((row) => overrides.find((o) => o.label === row.label) ?? row);
  const extra = overrides.filter((o) => !profile.some((row) => row.label === o.label));
  return [...merged, ...extra];
}

const ALT = (name: string, code: string, colour: string) =>
  `DecArt ${name} (${code}) in ${colour} — office chair manufacturer, Faridabad`;

/** Seed products for every photographed model, wired to the generated image manifest. */
export const PHOTOSHOOT_MODELS: SeedProduct[] = MODEL_META.map((meta, i) => {
  const shots = PHOTOSHOOT[meta.key];
  const colourways = shots?.colours ?? [];
  const images = colourways.flatMap((c) =>
    c.images.map((src) => ({ src, alt: ALT(meta.name, meta.code, c.label) })),
  );

  return {
    code: meta.code,
    name: meta.name,
    slug: meta.key,
    family: meta.family,
    group: meta.group,
    tags: meta.tags,
    summary: meta.summary,
    description: meta.description.join('\n\n'),
    specs: mergeSpecs(SPEC_PROFILES[meta.spec], meta.specOverrides),
    buildOptions: true,
    images,
    colourways,
    featured: !!meta.featured,
    bestSeller: !!meta.bestSeller,
    status: 'published' as const,
    needsPhoto: images.length === 0,
    needsReview: false,
    order: i,
    sizeMm: meta.sizeMm,
    seo: {
      title: `${meta.name} (${meta.code}) — DecArt Industries`,
      description: `${meta.summary} Manufactured in Faridabad by DecArt Industries. Request a quote or WhatsApp for pricing.`.slice(0, 158),
    },
  };
});

export const photoshootBySlug = (slug: string) => PHOTOSHOOT_MODELS.find((p) => p.slug === slug);
