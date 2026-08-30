import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { hasDb } from '@/lib/db';
import { listProjects, projectBySlug, insertProject } from '@/lib/repo-content';
import { requireAdmin, auth } from '@/lib/auth';
import { projectSchema, fieldErrors } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!hasDb()) return NextResponse.json({ ok: true, data: [] });
  const session = await auth();
  return NextResponse.json({ ok: true, data: await listProjects(!session?.user) });
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = projectSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }

  if (await projectBySlug(parsed.data.slug)) {
    return NextResponse.json({ ok: false, errors: { slug: 'That slug is already taken' } }, { status: 409 });
  }

  const project = await insertProject(parsed.data);
  revalidatePath('/');
  revalidatePath('/projects');
  return NextResponse.json({ ok: true, data: project }, { status: 201 });
}
