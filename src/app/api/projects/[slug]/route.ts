import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { projectBySlug, updateProjectBySlug, deleteProject } from '@/lib/repo-content';
import { requireAdmin } from '@/lib/auth';
import { projectSchema, fieldErrors } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const project = await projectBySlug(params.slug);
  if (!project) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, data: project });
}

export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = projectSchema.partial().safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }

  if (!(await projectBySlug(params.slug))) {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }

  const project = await updateProjectBySlug(params.slug, parsed.data);
  revalidatePath('/');
  revalidatePath('/projects');
  if (project) revalidatePath(`/projects/${project.slug}`);
  return NextResponse.json({ ok: true, data: project });
}

export async function DELETE(_req: Request, { params }: { params: { slug: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  await deleteProject(params.slug);
  revalidatePath('/');
  revalidatePath('/projects');
  return NextResponse.json({ ok: true });
}
