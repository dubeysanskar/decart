import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const configured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET,
  );

/** POST /api/upload — admin-only signed upload for blog covers and extra product images. */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!configured()) {
    return NextResponse.json(
      { ok: false, error: 'Cloudinary is not configured. Add the CLOUDINARY_* env vars, or use a /public path.' },
      { status: 503 },
    );
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  const form = await req.formData();
  const file = form.get('file');
  const folder = form.get('folder') === 'products' ? 'decart/products' : 'decart/blog';

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'No file supplied' }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: 'Files must be 8 MB or smaller' }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await new Promise<{ secure_url: string; public_id: string; width: number; height: number }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder, resource_type: 'image' }, (error, uploaded) =>
            error || !uploaded ? reject(error ?? new Error('Upload failed')) : resolve(uploaded as never),
          )
          .end(buffer);
      },
    );

    return NextResponse.json({
      ok: true,
      data: { src: result.secure_url, publicId: result.public_id, width: result.width, height: result.height },
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 502 });
  }
}
