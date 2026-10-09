/**
 * The catalogue's browse structure: master category → category → products.
 *
 * Names and order come from the client's own sheet (docs/master-categories.xlsx): eight master
 * categories, and thirty-seven categories under six of them. Hotel Furniture and Home Furniture
 * are on their list as masters but have no categories yet, so they stay out of the public menus
 * until somebody adds some in /admin/structure.
 *
 * What the sheet does NOT say is which of our existing series (the thirty-one product lines in
 * catalogue.seed.ts — Director, Mesh, Café, …) belongs in which category. `series` below is that
 * mapping, and it is a default, not the client's decision:
 *
 *   - a category with an obvious home gets it (Café Dining Chair ← the Café series);
 *   - a category can hold several series, and a series can sit in several categories — "Office
 *     Chair" is the umbrella over every chair series, while "Mesh Office Chair" narrows it;
 *   - the catalogue records carry no material or size data, so categories the sheet splits by
 *     material (Metal / Wood Storage, Leatherette / Fabric) can only be split by SERIES. Where a
 *     series covers both, it is listed in both rather than guessing;
 *   - a category with no series is left empty on purpose and renders a made-to-order page.
 *
 * Everything here is the fallback and the first import. Once /admin/structure has been used, the
 * database is the authority and this file is only read when the database is empty or unreachable.
 */

export type MasterSeed = {
  slug: string;
  name: string;
  order: number;
};

export type CategorySeed = {
  slug: string;
  master: string;
  name: string;
  order: number;
  /** Series (catalogue families) shown in this category, in display order. */
  series: string[];
};

export const MASTERS: MasterSeed[] = [
  { slug: 'seating', name: 'Seating', order: 1 },
  { slug: 'table', name: 'Table', order: 2 },
  { slug: 'storage', name: 'Storage', order: 3 },
  { slug: 'sofa-lounger', name: 'Sofa & Lounger', order: 4 },
  { slug: 'institutional', name: 'Institutional', order: 5 },
  { slug: 'health-care', name: 'Health Care', order: 6 },
  { slug: 'hotel-furniture', name: 'Hotel Furniture', order: 7 },
  { slug: 'home-furniture', name: 'Home Furniture', order: 8 },
];

/** Every chair series that is an office chair of some kind — the umbrella for "Office Chair". */
const OFFICE_CHAIR_SERIES = [
  'imported',
  'director',
  'ceo',
  'executive',
  'manager',
  'mesh',
  'ultra-luxury-mesh',
  'special-luxury-mesh',
  'task-mesh',
  'visitor',
];

export const CATEGORIES: CategorySeed[] = [
  // ------------------------------------------------------------------ Seating
  { slug: 'office-chair', master: 'seating', name: 'Office Chair', order: 1, series: OFFICE_CHAIR_SERIES },
  {
    slug: 'mesh-office-chair',
    master: 'seating',
    name: 'Mesh Office Chair',
    order: 2,
    series: ['mesh', 'ultra-luxury-mesh', 'special-luxury-mesh', 'task-mesh'],
  },
  {
    slug: 'leatherette-office-chair',
    master: 'seating',
    name: 'Leatherette Office Chair',
    order: 3,
    series: ['imported', 'director', 'ceo', 'executive'],
  },
  // GUESS: the Manager series is "honest, hard-wearing task seating", which reads as fabric
  { slug: 'fabric-office-chair', master: 'seating', name: 'Fabric Office Chair', order: 4, series: ['manager'] },
  { slug: 'recliner-chair', master: 'seating', name: 'Recliner Chair', order: 5, series: [] },
  { slug: 'cafe-dining-chair', master: 'seating', name: 'Cafe Dining Chair', order: 6, series: ['cafe'] },
  { slug: 'auditorium-chair', master: 'seating', name: 'Auditorium Chair', order: 7, series: ['auditorium'] },
  { slug: 'lounge-chair', master: 'seating', name: 'Lounge Chair', order: 8, series: ['lounge'] },

  // -------------------------------------------------------------------- Table
  {
    slug: 'office-table',
    master: 'table',
    name: 'Office Table',
    order: 1,
    series: ['table', 'imported-table', 'director-table', 'manager-table'],
  },
  { slug: 'workstation', master: 'table', name: 'Workstation', order: 2, series: ['workstation', 'cubicle'] },
  { slug: 'height-adjustable-desk', master: 'table', name: 'Height Adjustable Desk', order: 3, series: ['foldable'] },
  { slug: 'meeting-table', master: 'table', name: 'Meeting Table', order: 4, series: ['conference', 'meeting'] },
  // the sheet lists "Office Table" a second time here (its row 5); it is folded into the first
  { slug: 'desk', master: 'table', name: 'Desk', order: 5, series: [] },
  { slug: 'computer-table', master: 'table', name: 'Computer Table', order: 6, series: ['computer-table'] },
  { slug: 'reception-table', master: 'table', name: 'Reception Table', order: 7, series: ['reception'] },
  { slug: 'cafe-dining-table', master: 'table', name: 'Cafe Dining Table', order: 8, series: ['cafe-table'] },
  { slug: 'center-table', master: 'table', name: 'Center Table', order: 9, series: ['centre-table'] },
  { slug: 'corner-table', master: 'table', name: 'Corner Table', order: 10, series: [] },

  // ------------------------------------------------------------------ Storage
  // the one Storage series is "cupboards, lockers and filing": lockers and filing are metal,
  // cupboards are almirahs — so it is listed under both rather than guessed into one
  { slug: 'metal-storage', master: 'storage', name: 'Metal Storage', order: 1, series: ['storage', 'metal-storage'] },
  { slug: 'wood-storage', master: 'storage', name: 'Wood Storage', order: 2, series: [] },
  { slug: 'compactor-storage', master: 'storage', name: 'Compactor Storage', order: 3, series: [] },
  { slug: 'almirah', master: 'storage', name: 'Almirah', order: 4, series: ['storage'] },

  // ----------------------------------------------------------- Sofa & Lounger
  { slug: 'sofa', master: 'sofa-lounger', name: 'Sofa', order: 1, series: ['sofa'] },
  { slug: 'visitor-bench', master: 'sofa-lounger', name: 'Visitor Bench', order: 2, series: ['tandem'] },
  { slug: 'recliner-sofa', master: 'sofa-lounger', name: 'Recliner Sofa', order: 3, series: [] },
  { slug: 'lounger', master: 'sofa-lounger', name: 'Lounger', order: 4, series: [] },
  { slug: 'pouffe', master: 'sofa-lounger', name: 'Pouffe', order: 5, series: [] },

  // ------------------------------------------------------------ Institutional
  { slug: 'training-chair', master: 'institutional', name: 'Training Chair', order: 1, series: ['training'] },
  { slug: 'student-desk', master: 'institutional', name: 'Student Desk', order: 2, series: ['school'] },
  // the School series is "classroom desks, kids sets and library furniture"
  { slug: 'library-rack', master: 'institutional', name: 'Library Rack', order: 3, series: ['school'] },
  { slug: 'lab-table', master: 'institutional', name: 'Lab Table', order: 4, series: [] },
  {
    slug: 'hostel-bed-furniture',
    master: 'institutional',
    name: 'Hostel Bed & Furniture',
    order: 5,
    series: ['hostel-bed'],
  },
  { slug: 'sliding-board', master: 'institutional', name: 'Sliding Board', order: 6, series: [] },

  // -------------------------------------------------------------- Health Care
  { slug: 'hospital-bed', master: 'health-care', name: 'Hospital Bed', order: 1, series: [] },
  { slug: 'ward-utility', master: 'health-care', name: 'Ward Utility', order: 2, series: [] },
  { slug: 'equipment-trolley-cart', master: 'health-care', name: 'Equipment Trolley / Cart', order: 3, series: [] },
  { slug: 'wheel-chair-stretcher', master: 'health-care', name: 'Wheel Chair / Stretcher', order: 4, series: [] },
];

export const masterSeed = (slug: string) => MASTERS.find((m) => m.slug === slug);
