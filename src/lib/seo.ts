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
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.shortName,
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
  name: SITE.legalName,
  alternateName: SITE.shortName,
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
