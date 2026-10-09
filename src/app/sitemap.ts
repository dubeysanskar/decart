import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import { getAllProducts, getNavFamilies } from '@/lib/catalogue';
import { getPublishedPosts } from '@/lib/blog';
import { getProjects } from '@/lib/content';
import { getTaxonomy } from '@/lib/taxonomy';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [families, products, posts, projects, masters] = await Promise.all([
    getNavFamilies(),
    getAllProducts(),
    getPublishedPosts(),
    getProjects(),
    getTaxonomy(),
  ]);

  const staticRoutes = [
    { path: '/', priority: 1 },
    { path: '/products', priority: 0.9 },
    { path: '/quote', priority: 0.9 },
    { path: '/contact', priority: 0.8 },
    { path: '/about', priority: 0.7 },
    { path: '/manufacturing', priority: 0.7 },
    { path: '/life-at-decart', priority: 0.6 },
    { path: '/sustainability', priority: 0.6 },
    { path: '/certificates', priority: 0.6 },
    { path: '/career', priority: 0.6 },
    { path: '/projects', priority: 0.7 },
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
    // master categories, and only the categories that have a model online — an empty one is a
    // made-to-order page marked noindex, and listing it here would contradict that
    ...masters
      .filter((master) => master.count > 0)
      .map((master) => ({
        url: `${SITE.url}${master.href}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      })),
    ...masters.flatMap((master) =>
      master.categories
        .filter((category) => category.count > 0)
        .map((category) => ({
          url: `${SITE.url}${category.href}`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        })),
    ),
    ...products.map((product) => ({
      url: `${SITE.url}/products/${product.family}/${product.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: product.images?.length ? 0.7 : 0.5,
    })),
    ...projects.map((project) => ({
      url: `${SITE.url}/projects/${project.slug}`,
      lastModified: project.updatedAt ? new Date(project.updatedAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...posts.map((post) => ({
      url: `${SITE.url}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
