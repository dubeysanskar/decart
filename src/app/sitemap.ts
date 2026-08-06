import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import { getAllProducts, getNavFamilies } from '@/lib/catalogue';
import { getPublishedPosts } from '@/lib/blog';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [families, products, posts] = await Promise.all([getNavFamilies(), getAllProducts(), getPublishedPosts()]);

  const staticRoutes = [
    { path: '/', priority: 1 },
    { path: '/products', priority: 0.9 },
    { path: '/quote', priority: 0.9 },
    { path: '/contact', priority: 0.8 },
    { path: '/about', priority: 0.7 },
    { path: '/manufacturing', priority: 0.7 },
    { path: '/clients', priority: 0.6 },
    { path: '/gallery', priority: 0.6 },
    { path: '/blog', priority: 0.6 },
    { path: '/downloads', priority: 0.5 },
    { path: '/privacy-policy', priority: 0.3 },
    { path: '/terms', priority: 0.3 },
    { path: '/shipping-refund-policy', priority: 0.3 },
  ];

  const now = new Date();

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE.url}${route.path === '/' ? '' : route.path}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: route.priority,
    })),
    ...families.map((family) => ({
      url: `${SITE.url}/products/${family.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${SITE.url}/products/${product.family}/${product.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: product.images?.length ? 0.7 : 0.5,
    })),
    ...posts.map((post) => ({
      url: `${SITE.url}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
