import type { Metadata } from 'next';
import { SITE } from './site';

const OG_DEFAULT = '/brand/og-default.jpg';

export function buildMetadata({
  title,
  description,
  path = '/',
  image = OG_DEFAULT,
  type = 'website',
  keywords,
  publishedTime,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  keywords?: string[];
  publishedTime?: string;
}): Metadata {
  const url = `${SITE.url}${path === '/' ? '' : path}`;
  return {
    // absolute: these titles already follow the §12 patterns and name the company, so the
    // root layout's "%s | DecArt Industries" template would otherwise double it up
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.brandName,
      type,
      locale: 'en_IN',
      images: [{ url: image.startsWith('http') ? image : `${SITE.url}${image}`, width: 1200, height: 630, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.startsWith('http') ? image : `${SITE.url}${image}`],
    },
  };
}

// ------------------------------------------------------------------ JSON-LD

export const organisationLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE.url}/#organization`,
  name: SITE.legalName,
  // every name the company goes by, so a search for any of them resolves to this site
  alternateName: [SITE.shortName, SITE.brandName, 'DecArt'],
  url: SITE.url,
  logo: `${SITE.url}/brand/logo.png`,
  slogan: SITE.tagline,
  foundingDate: String(SITE.established),
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+91-93119-42001',
      contactType: 'sales',
      areaServed: 'IN',
      availableLanguage: ['en', 'hi'],
    },
  ],
  sameAs: Object.values(SITE.social).filter(Boolean),
});

/**
 * The site as a thing Google can name and search.
 *
 * WebSite with a SearchAction is what the sitelinks search box is built from, and `name` is
 * what Google prefers for the site name in results. The navigation list mirrors the header —
 * it is not an official sitelinks signal, but it states in one place which six sections the
 * site considers primary, which is what sitelinks are.
 */
export const websiteLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  url: SITE.url,
  name: SITE.brandName,
  alternateName: ['DecArt', SITE.shortName],
  publisher: { '@id': `${SITE.url}/#organization` },
  inLanguage: 'en-IN',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE.url}/search?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
});

export const siteNavigationLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: [
    { name: 'Products', url: '/products', description: 'The full catalogue: 350+ models across thirty families.' },
    { name: 'Office Seating', url: '/products?group=seating', description: 'Director, executive, mesh, task and visitor chairs.' },
    { name: 'Tables & Desks', url: '/products?group=tables-desks', description: 'Workstations, conference, reception and executive desks.' },
    { name: 'Our Company', url: '/about', description: 'Ten years of manufacturing office furniture in Faridabad.' },
    { name: 'Projects', url: '/projects', description: 'Floors we have recently furnished.' },
    { name: 'Contact', url: '/contact', description: 'Sales, support and general enquiries.' },
  ].map((item, i) => ({
    '@type': 'SiteNavigationElement',
    position: i + 1,
    name: item.name,
    description: item.description,
    url: `${SITE.url}${item.url}`,
  })),
});

export const localBusinessLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'FurnitureStore',
  '@id': `${SITE.url}#business`,
  name: SITE.legalName,
  image: `${SITE.url}/brand/og-default.jpg`,
  url: SITE.url,
  telephone: '+91-93119-42001',
  email: SITE.emailPrimary,
  priceRange: '₹₹',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Plot no-230 C, Indra Complex, Industrial Area, Sector 87',
    addressLocality: SITE.city,
    addressRegion: SITE.state,
    postalCode: SITE.postalCode,
    addressCountry: 'IN',
  },
  openingHours: SITE.hoursSchema,
  hasMap: SITE.mapUrl,
});

export const productLd = (p: {
  name: string;
  code: string;
  slug: string;
  family: string;
  description: string;
  image?: string;
  ratingAvg?: number;
  ratingCount?: number;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: p.name,
  sku: p.code,
  brand: { '@type': 'Brand', name: SITE.shortName },
  description: p.description.slice(0, 400),
  ...(p.image ? { image: [`${SITE.url}${p.image}`] } : {}),
  url: `${SITE.url}/products/${p.family}/${p.slug}`,
  ...(p.ratingCount && p.ratingCount > 0
    ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: Number(p.ratingAvg ?? 0).toFixed(1),
          reviewCount: p.ratingCount,
        },
      }
    : {}),
});

export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: `${SITE.url}${item.path}`,
  })),
});

export const articleLd = (p: {
  title: string;
  slug: string;
  description: string;
  image?: string;
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: p.title,
  description: p.description,
  ...(p.image ? { image: [p.image.startsWith('http') ? p.image : `${SITE.url}${p.image}`] } : {}),
  datePublished: p.publishedAt,
  dateModified: p.updatedAt ?? p.publishedAt,
  author: { '@type': 'Organization', name: p.author || SITE.shortName },
  publisher: {
    '@type': 'Organization',
    name: SITE.legalName,
    logo: { '@type': 'ImageObject', url: `${SITE.url}/brand/logo.png` },
  },
  mainEntityOfPage: `${SITE.url}/blog/${p.slug}`,
});
