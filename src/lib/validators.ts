import { z } from 'zod';
import { LEAD_TYPES, LEAD_STATUSES, DISPOSITIONS } from './site';

/** Shared client/server schemas — §9. */

const phone = z
  .string()
  .trim()
  .min(8, 'Enter a valid phone number')
  .max(20)
  .regex(/^[+\d][\d\s()-]{7,}$/, 'Enter a valid phone number');

const optionalEmail = z
  .union([z.literal(''), z.string().trim().email('Enter a valid email address')])
  .optional()
  .transform((v) => v ?? '');

export const leadSchema = z
  .object({
    type: z.enum(LEAD_TYPES),
    name: z.string().trim().min(2, 'Tell us your name').max(80),
    company: z.string().trim().max(120).optional().default(''),
    email: optionalEmail,
    phone,
    city: z.string().trim().max(80).optional().default(''),
    message: z.string().trim().max(4000).optional().default(''),
    productSlug: z.string().trim().max(120).optional().default(''),
    productCode: z.string().trim().max(60).optional().default(''),
    quantity: z.string().trim().max(60).optional().default(''),
    targetDate: z.string().trim().max(60).optional().default(''),
    extra: z.record(z.string().max(400)).optional().default({}),
    page: z.string().trim().max(300).optional().default(''),
    utm: z.record(z.string().max(200)).optional().default({}),
    /**
     * Anti-spam: `website` is a hidden honeypot and `startedAt` powers a 3-second time trap.
     * Both are accepted by the schema on purpose — the route drops them silently with a 202
     * so a bot never learns which field gave it away.
     */
    website: z.string().max(200).optional().default(''),
    startedAt: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    const required = (field: keyof typeof data, label: string) => {
      if (!String(data[field] ?? '').trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: `${label} is required` });
      }
    };
    if (data.type === 'contact') required('message', 'A short message');
    if (data.type === 'bulk') required('quantity', 'Quantity');
    if (data.type === 'dealer') {
      required('company', 'Company name');
      required('city', 'City');
    }
    if (data.type === 'oem') {
      required('company', 'Company name');
      required('message', 'Requirement details');
    }
  });

export type LeadInput = z.infer<typeof leadSchema>;

export const leadPatchSchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  disposition: z.enum(DISPOSITIONS).optional(),
  assignedTo: z.string().max(80).optional(),
  isRead: z.boolean().optional(),
  note: z.string().trim().max(2000).optional(),
});

export const respondSchema = z.object({
  subject: z.string().trim().min(2).max(200),
  body: z.string().trim().min(2).max(20000),
  to: z.string().trim().email(),
});

export const reviewSchema = z.object({
  productSlug: z.string().trim().max(120).optional().default(''),
  name: z.string().trim().min(2, 'Tell us your name').max(80),
  company: z.string().trim().max(120).optional().default(''),
  city: z.string().trim().max(80).optional().default(''),
  rating: z.coerce.number().int().min(1, 'Pick a rating').max(5),
  title: z.string().trim().max(140).optional().default(''),
  body: z.string().trim().min(10, 'A sentence or two, please').max(2000),
  photo: z.string().trim().max(500).optional().default(''),
  /** honeypot — the route drops filled submissions silently */
  website: z.string().max(200).optional().default(''),
});

export const reviewPatchSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  featured: z.boolean().optional(),
  adminReply: z.string().trim().max(2000).optional(),
});

const specSchema = z.object({ label: z.string().max(80), value: z.string().max(400) });
const imageSchema = z.object({ src: z.string().min(1).max(500), alt: z.string().max(300).optional().default('') });

export const productSchema = z.object({
  code: z.string().trim().min(1).max(60),
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(1).max(160),
  family: z.string().trim().min(1).max(60),
  group: z.enum(['seating', 'tables-desks', 'furniture']),
  tags: z.array(z.string().max(40)).default([]),
  summary: z.string().max(300).default(''),
  description: z.string().max(6000).default(''),
  specs: z.array(specSchema).default([]),
  buildOptions: z.boolean().default(false),
  sizeMm: z.string().max(120).default(''),
  finishNote: z.string().max(500).default(''),
  images: z.array(imageSchema).default([]),
  cataloguePage: z.coerce.number().int().min(0).max(500).optional(),
  price: z.object({ amount: z.coerce.number().min(0).default(0), show: z.boolean().default(false) }).default({ amount: 0, show: false }),
  moq: z.coerce.number().int().min(1).default(1),
  featured: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  needsPhoto: z.boolean().default(false),
  needsReview: z.boolean().default(false),
  order: z.coerce.number().int().default(0),
  seo: z.object({ title: z.string().max(120).default(''), description: z.string().max(300).default('') }).default({ title: '', description: '' }),
});

export const blogSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().min(1).max(180),
  excerpt: z.string().max(300).default(''),
  cover: z.object({ src: z.string().max(500).default(''), alt: z.string().max(300).default('') }).default({ src: '', alt: '' }),
  contentHtml: z.string().max(200000).default(''),
  tags: z.array(z.string().max(40)).default([]),
  status: z.enum(['draft', 'published']).default('draft'),
  publishedAt: z.string().optional(),
  relatedProductSlugs: z.array(z.string().max(160)).default([]),
  seo: z
    .object({
      metaTitle: z.string().max(120).default(''),
      metaDescription: z.string().max(300).default(''),
      ogImage: z.string().max(500).default(''),
      keywords: z.array(z.string().max(60)).default([]),
    })
    .default({ metaTitle: '', metaDescription: '', ogImage: '', keywords: [] }),
});

export const settingsSchema = z.object({
  phone: z.string().max(40).optional(),
  whatsapp: z.string().max(20).optional(),
  emailPrimary: z.union([z.literal(''), z.string().email()]).optional(),
  mailRouting: z.record(z.array(z.string())).optional(),
  addressFactory: z.string().max(400).optional(),
  addressShowroom: z.string().max(400).optional(),
  mapUrl: z.string().max(500).optional(),
  hours: z.string().max(120).optional(),
  gstin: z.string().max(30).optional(),
  social: z
    .object({
      instagram: z.string().max(300).optional(),
      linkedin: z.string().max(300).optional(),
      facebook: z.string().max(300).optional(),
      x: z.string().max(300).optional(),
    })
    .optional(),
  counters: z
    .object({
      years: z.coerce.number().optional(),
      models: z.coerce.number().optional(),
      families: z.coerce.number().optional(),
      clients: z.coerce.number().optional(),
    })
    .optional(),
  announcement: z.string().max(300).optional(),
  replySignature: z.string().max(1000).optional(),
});

/** Flatten a ZodError into { field: message } for inline form errors. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
