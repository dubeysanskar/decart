/** Canonical client facts — §1 of the build spec. Overridable at runtime from the Settings doc. */

export const SITE = {
  legalName: 'DecArt Industries Private Limited',
  shortName: 'DecArt Industries',
  /** Marketing brand used in page titles and og:site_name (the legal entity stays above). */
  brandName: 'DecArt Furniture',
  tagline: 'Trust Is Our Sign',
  established: 2015,
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://decartseatings.in',

  phone: '+91 93119 42001',
  phoneHref: 'tel:+919311942001',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || '919311942001',
  emailPrimary: 'info@decartseatings.in',
  /** Desk inboxes. They fall back to the primary address until the client creates the aliases,
      so nothing is ever sent to a mailbox that does not exist yet. */
  emailSales: process.env.NEXT_PUBLIC_EMAIL_SALES || 'info@decartseatings.in',
  emailSupport: process.env.NEXT_PUBLIC_EMAIL_SUPPORT || 'info@decartseatings.in',
  /** Desk numbers, same fallback rule as the addresses above. */
  phoneSales: process.env.NEXT_PUBLIC_PHONE_SALES || '+91 93119 42001',
  phoneSupport: process.env.NEXT_PUBLIC_PHONE_SUPPORT || '+91 93119 42001',

  addressFactory: 'Plot no-230 C, Indra Complex, Industrial Area, Dwa Factory Wali Gali, Sector 87, Faridabad, Haryana 121002',
  addressLines: [
    'Plot no-230 C, Indra Complex, Industrial Area',
    'Dwa Factory Wali Gali, Sector 87',
    'Faridabad, Haryana 121002',
  ],
  city: 'Faridabad',
  state: 'Haryana',
  postalCode: '121002',
  mapUrl: 'https://maps.app.goo.gl/HcNho95QJXeLm7JZ8',
  mapEmbed:
    'https://www.google.com/maps?q=Plot+230C+Indra+Complex+Sector+87+Faridabad+Haryana+121002&output=embed',

  hours: 'Mon–Sat · 9:30 AM – 6:00 PM',
  hoursSchema: 'Mo-Sa 09:30-18:00',
  gstin: '08AAACD3344H1ZW',

  catalogueDrive: 'https://drive.google.com/file/d/1AyocxBIMq1PNqeH5hwHyiLaiBIehQr17/view?usp=sharing',
  /**
   * The one link every "download the brochure" button and email should use. It pointed at
   * /downloads/decart-catalogue.pdf, which does not exist in /public — so the customer
   * acknowledgement email was shipping a 404 to everybody who filled in a form. Point this at
   * the local path again the day that PDF is actually added.
   */
  catalogueHref: 'https://drive.google.com/file/d/1AyocxBIMq1PNqeH5hwHyiLaiBIehQr17/view?usp=sharing',

  social: {
    instagram: '',
    linkedin: '',
    facebook: '',
    x: '',
  },

  counters: [
    { value: '10+', label: 'Years manufacturing' },
    { value: '350+', label: 'Models in catalogue' },
    { value: '30', label: 'Product families' },
    { value: 'Pan-India', label: 'Delivery' },
  ],

  /** Compliance strip — upgrades to real badges once certificate files land in /public/certificates (§14.6). */
  complianceLine: 'BIFMA/SGS-tested components · GST-registered · Made in India',

  segments: [
    { name: 'Corporate Offices', blurb: 'Full-floor seating, desking and cabins.' },
    { name: 'Education', blurb: 'Classrooms, labs, libraries and hostels.' },
    { name: 'Hospitality', blurb: 'Cafés, lobbies, banquet and back-of-house.' },
    { name: 'Healthcare', blurb: 'Waiting halls, consulting rooms and wards.' },
    { name: 'Government & Institutions', blurb: 'Tendered supply with documented specs.' },
  ],

  /** Logo wall — files land in /public/clients as client-01.png…; names from catalogue p.6. */
  clients: [
    'Marriott', 'Westin', 'Toyota', 'Hero', '3M', 'Tech Mahindra', 'SBI', 'PNB', 'OLA', 'Flipkart',
    'DLF', 'UltraTech', 'Ashok Leyland', 'Allianz', 'Dixon', 'Minda', 'Medanta', 'Fortis',
    'Manipal University', 'GD Goenka University', 'NIIT Foundation', 'Vatika',
  ],
} as const;

export const LEAD_TYPES = ['contact', 'quote', 'bulk', 'dealer', 'oem', 'custom', 'support'] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

export const LEAD_TYPE_LABEL: Record<LeadType, string> = {
  contact: 'General enquiry',
  quote: 'Request a quote',
  bulk: 'Bulk order',
  dealer: 'Dealer / distributor',
  oem: 'OEM manufacturing',
  custom: 'Custom chair',
  support: 'Support / after-sales',
};

/**
 * The three enquiry desks on /contact (client brief: the same tab row as /quote, but for
 * General / Sales / Support). Each desk picks the lead type, which is what mail.ts routes on —
 * so a support enquiry can be sent to a different inbox from a sales one via MAIL_ROUTING_JSON.
 */
export const CONTACT_DESKS = [
  {
    id: 'general',
    leadType: 'contact' as LeadType,
    title: 'General Enquiry',
    blurb: 'Anything that is not pricing or a running order.',
    email: SITE.emailPrimary,
    phones: [SITE.phone],
  },
  {
    id: 'sales',
    leadType: 'quote' as LeadType,
    title: 'Sales Enquiry',
    blurb: 'Pricing, bulk floors, dealers and OEM.',
    email: SITE.emailSales,
    phones: [SITE.phoneSales],
  },
  {
    id: 'support',
    leadType: 'support' as LeadType,
    title: 'Support Enquiry',
    blurb: 'Spares, warranty and after-sales on a delivered order.',
    email: SITE.emailSupport,
    phones: [SITE.phoneSupport],
  },
] as const;

export type ContactDeskId = (typeof CONTACT_DESKS)[number]['id'];

/** Subject options on the contact form. Stored on the lead as extra.subject. */
export const CONTACT_SUBJECTS = [
  'New enquiry or quotation',
  'Bulk or project requirement',
  'Dealer or distributor',
  'OEM manufacturing',
  'An existing order or delivery',
  'Spares, warranty or service',
  'Careers',
  'Something else',
] as const;

export const LEAD_STATUSES = ['new', 'contacted', 'quoted', 'negotiation', 'won', 'lost', 'junk'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const DISPOSITIONS = [
  '',
  'interested',
  'callback',
  'no-response',
  'wrong-number',
  'price-issue',
  'future-requirement',
  'not-interested',
] as const;
export type Disposition = (typeof DISPOSITIONS)[number];

/** §14.8 microcopy */
export const COPY = {
  formHelper: 'Fields marked * are required. We reply within one working day (Mon–Sat, 9:30–6).',
  success:
    `Your enquiry is with our sales desk. Expect a call from ${SITE.phone} within one working day ` +
    `(${SITE.hours}) with pricing and lead time. Need it sooner? Continue on WhatsApp — everything ` +
    `you just typed is already in the message.`,
  error: 'That didn’t go through. Nothing is lost — send it on WhatsApp instead, or call +91 93119 42001.',
  reviewThanks: 'Thanks — your review is with our team and appears after a quick check.',
  emptyFamily: 'No models match those filters. Tell us what you need — custom builds are our daily work.',
  warranty:
    'DecArt products are covered against manufacturing defects; component warranties (mechanisms, gas lifts, castors) as per quotation. Dispatch timelines and freight are confirmed on your quote. Transit damage? Tell us within 48 hours with photos and we’ll make it right.',
  quoteBand: {
    heading: 'Furnishing a floor, a campus, or one great cabin?',
    sub: 'Send the requirement — sizes, quantities, site city — and get a working quote fast.',
  },
  notFound: 'This page went for upholstery. Head to Products or ask us directly.',
  quoteFaq: [
    {
      q: 'Do you show prices?',
      a: 'B2B pricing depends on quantity, finish and freight, so we quote per requirement — usually the same day.',
    },
    { q: 'Minimum order?', a: 'Single pieces for most chairs; project MOQs for workstations and custom builds.' },
    { q: 'Do you deliver outside NCR?', a: 'Yes — pan-India via surface transport.' },
    { q: 'Can you match a reference design?', a: 'Yes — that’s the Custom Chair flow; share a photo on WhatsApp.' },
  ],
} as const;
