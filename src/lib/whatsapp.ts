import { SITE } from './site';

/** §10.1 — every WhatsApp entry point goes through here so the number stays a single source. */
export function waLink(text: string, number: string = SITE.whatsapp) {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}

export const WA = {
  /** A — floating button */
  float: () => 'Hello DecArt team 👋 I’m browsing your website and have a query.',

  /** B — product detail page */
  product: (name: string, code: string, url: string) =>
    `Hello DecArt team, I’d like a quote for *${name}* (${code}) — ${url}\nQuantity: \nCity: `,

  /** C — form fallback / success continuation */
  form: (d: {
    name?: string;
    type?: string;
    product?: string;
    code?: string;
    quantity?: string;
    city?: string;
    message?: string;
  }) =>
    [
      'Hello DecArt, sharing my query from the website:',
      d.name && `Name: ${d.name}`,
      d.type && `Type: ${d.type}`,
      (d.product || d.code) && `Product: ${[d.product, d.code].filter(Boolean).join(' ')}`,
      d.quantity && `Qty: ${d.quantity}`,
      d.city && `City: ${d.city}`,
      d.message && `Message: ${d.message}`,
    ]
      .filter(Boolean)
      .join('\n'),

  /** D — admin replying to a customer from the inbox */
  reply: (name: string, type: string, product: string) =>
    `Hello ${name}, this is DecArt Industries regarding your ${type} query${product ? ` for ${product}` : ''}. `,
};
