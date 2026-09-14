import { notFound } from 'next/navigation';
import { hasDb } from '@/lib/db';
import { projectBySlug } from '@/lib/repo-content';
import { ProjectEditor, EMPTY_PROJECT, type ProjectDraft } from '@/components/admin/ProjectEditor';

export const dynamic = 'force-dynamic';

export default async function ProjectEditorPage({ params }: { params: { slug: string } }) {
  if (params.slug === 'new') return <ProjectEditor initial={EMPTY_PROJECT} isNew />;

  if (!hasDb()) notFound();
  const project = await projectBySlug(params.slug);
  if (!project) notFound();

  const initial: ProjectDraft = {
    title: project.title,
    slug: project.slug,
    client: project.client,
    location: project.location,
    summary: project.summary,
    bodyHtml: project.bodyHtml,
    images: project.images,
    scope: project.scope,
    completedAt: project.completedAt,
    featured: project.featured,
    status: project.status,
    order: project.order,
    seoTitle: project.seoTitle,
    seoDescription: project.seoDescription,
  };

  return <ProjectEditor initial={initial} isNew={false} />;
}
