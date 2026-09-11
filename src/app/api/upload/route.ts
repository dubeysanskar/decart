import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '@/lib/auth';
import { getSettings } from '@/lib/repo';
import { hasDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * Where the keys come from: /admin/settings first, the environment as the fallback.
 *
 * Same rule as SMTP. Keys pasted into the admin go live at once on every instance, with no
 * deploy and no hosting dashboard — which is what unblocked uploads on the day the client
 * finally sent them.
 */
async function cloudinaryConfig() {
  let saved: { cloudName?: string; apiKey?: string; apiSecret?: string } = {};
  if (hasDb()) {
    try {
      const doc = (await getSettings()) as { cloudinary?: typeof saved } | null;
      saved = doc?.cloudinary ?? {};
    } catch {
      /* settings unreadable — the environment still stands on its own */
    }
  }
  return {
    cloud_name: saved.cloudName || process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: saved.apiKey || process.env.CLOUDINARY_API_KEY || '',
    api_secret: saved.apiSecret || process.env.CLOUDINARY_API_SECRET || '',
  };
}

/** POST /api/upload — admin-only signed upload for blog covers and extra product images. */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const keys = await cloudinaryConfig();
  if (!keys.cloud_name || !keys.api_key || !keys.api_secret) {
    return NextResponse.json(
      { ok: false, error: 'Image uploads are not set up yet — add the Cloudinary keys under Settings, or use a /public path.' },
      { status: 503 },
    );
  }

  cloudinary.config({ ...keys, secure: true });

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
