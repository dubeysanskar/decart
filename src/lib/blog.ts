import 'server-only';
import sanitizeHtml from 'sanitize-html';
import { withDb } from './db';
import { publishedPosts, publishedPostBySlug } from './repo';

export type PublicPost = {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  cover?: { src: string; alt: string };
  contentHtml?: string;
  tags: string[];
  publishedAt?: string;
  author: string;
  readingMinutes: number;
  relatedProductSlugs: string[];
  updatedAt?: string;
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: string; keywords?: string[] };
};

export async function getPublishedPosts(limit?: number): Promise<PublicPost[]> {
  return withDb(async () => (await publishedPosts(limit)) as unknown as PublicPost[], []);
}

export async function getPost(slug: string): Promise<PublicPost | null> {
  return withDb(async () => (await publishedPostBySlug(slug)) as unknown as PublicPost | null, null);
}

/** TipTap output is stored raw and sanitised here, at render time (§10.7). */
export function renderPostHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 's', 'blockquote', 'ul', 'ol', 'li',
      'h2', 'h3', 'h4', 'a', 'img', 'figure', 'figcaption', 'hr', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          ...(attribs.href?.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
        },
      }),
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: 'lazy' } }),
    },
  });
}
