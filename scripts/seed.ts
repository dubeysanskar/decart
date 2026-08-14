/**
 * Idempotent seed — `npm run seed`.
 *
 * Creates the Turso schema, upserts every catalogue family (§7) plus the photographed 2023
 * range, creates the admin user from ADMIN_EMAIL/ADMIN_PASSWORD, and writes the Settings
 * singleton.
 *
 * Re-running never clobbers admin edits: existing products only receive fields they are missing,
 * plus the recomputed image manifest. Pass --overwrite to force a full refresh from the seed.
 */
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import { ensureSchema } from '../src/lib/schema';
import { allSeedProducts, FAMILIES, FAMILY_LEDE } from '../src/data/catalogue.seed';
import { SITE, COPY } from '../src/lib/site';

// match Next's precedence: .env.local wins over .env, and neither overrides a real shell var
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const OVERWRITE = process.argv.includes('--overwrite');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

const exists = (relative: string) => {
  try {
    return fs.statSync(path.join(PUBLIC_DIR, relative.replace(/^\//, ''))).isFile();
  } catch {
    return false;
  }
};

const J = (value: unknown) => JSON.stringify(value ?? null);
const now = () => new Date().toISOString();

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    console.error('TURSO_DATABASE_URL is not set. Add it to .env.local and try again.');
    process.exit(1);
  }

  const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  await ensureSchema(db);
  console.log('Connected to Turso · schema ready\n');

  // ---------------------------------------------------------------- products
  const seeds = allSeedProducts();
  let created = 0;
  let filled = 0;
  let untouched = 0;

  for (const seed of seeds) {
    const images = seed.images.filter((image) => exists(image.src));
    const needsPhoto = images.length === 0;

    const existing = (
      await db.execute({
        sql: `SELECT slug, summary, description, specs, tags, seo, sizeMm, images FROM products WHERE slug = ?`,
        args: [seed.slug],
      })
    ).rows[0] as Record<string, unknown> | undefined;

    if (!existing) {
      const stamp = now();
      await db.execute({
        sql: `INSERT INTO products (id, code, name, slug, family, grp, tags, summary, description, specs,
                buildOptions, sizeMm, images, colourways, cataloguePage, featured, bestSeller, status,
                needsPhoto, needsReview, ord, seo, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          randomUUID(),
          seed.code.toUpperCase(),
          seed.name,
          seed.slug,
          seed.family,
          seed.group,
          J(seed.tags),
          seed.summary,
          seed.description,
          J(seed.specs),
          seed.buildOptions ? 1 : 0,
          seed.sizeMm ?? '',
          J(images),
          J(seed.colourways ?? []),
          seed.cataloguePage ?? null,
          seed.featured ? 1 : 0,
          seed.bestSeller ? 1 : 0,
          seed.status,
          needsPhoto ? 1 : 0,
          seed.needsReview ? 1 : 0,
          seed.order,
          J(seed.seo),
          stamp,
          stamp,
        ],
      });
      created++;
      continue;
    }

    if (OVERWRITE) {
      await db.execute({
        sql: `UPDATE products SET code = ?, name = ?, family = ?, grp = ?, tags = ?, summary = ?, description = ?,
                specs = ?, buildOptions = ?, sizeMm = ?, images = ?, colourways = ?, cataloguePage = ?,
                featured = ?, bestSeller = ?, status = ?, needsPhoto = ?, needsReview = ?, ord = ?, seo = ?,
                updatedAt = ? WHERE slug = ?`,
        args: [
          seed.code.toUpperCase(),
          seed.name,
          seed.family,
          seed.group,
          J(seed.tags),
          seed.summary,
          seed.description,
          J(seed.specs),
          seed.buildOptions ? 1 : 0,
          seed.sizeMm ?? '',
          J(images),
          J(seed.colourways ?? []),
          seed.cataloguePage ?? null,
          seed.featured ? 1 : 0,
          seed.bestSeller ? 1 : 0,
          seed.status,
          needsPhoto ? 1 : 0,
          seed.needsReview ? 1 : 0,
          seed.order,
          J(seed.seo),
          now(),
          seed.slug,
        ],
      });
      filled++;
      continue;
    }

    // fill only what's missing, and always refresh the image manifest (files move, admin edits don't)
    const empty = (value: unknown) => !value || value === '' || value === '[]' || value === '{}';
    const emptyJsonArray = (value: unknown) => {
      try {
        return !Array.isArray(JSON.parse(String(value))) || JSON.parse(String(value)).length === 0;
      } catch {
        return true;
      }
    };
    const seoEmpty = (() => {
      try {
        return !JSON.parse(String(existing.seo ?? '{}')).title;
      } catch {
        return true;
      }
    })();

    const sets: string[] = [];
    const args: (string | number | null)[] = [];
    const set = (column: string, value: string | number | null) => {
      sets.push(`${column} = ?`);
      args.push(value);
    };

    if (empty(existing.summary)) set('summary', seed.summary);
    if (empty(existing.description)) set('description', seed.description);
    if (emptyJsonArray(existing.specs)) set('specs', J(seed.specs));
    if (emptyJsonArray(existing.tags)) set('tags', J(seed.tags));
    if (seoEmpty) set('seo', J(seed.seo));
    if (empty(existing.sizeMm) && seed.sizeMm) set('sizeMm', seed.sizeMm);
    if (emptyJsonArray(existing.images) && images.length) {
      set('images', J(images));
      set('colourways', J(seed.colourways ?? []));
      set('needsPhoto', 0);
    }

    if (sets.length) {
      await db.execute({
        sql: `UPDATE products SET ${sets.join(', ')}, updatedAt = ? WHERE slug = ?`,
        args: [...args, now(), seed.slug],
      });
      filled++;
    } else {
      untouched++;
    }
  }

  const withPhotos = seeds.filter((seed) => seed.images.some((image) => exists(image.src))).length;
  console.log(`Products: ${created} created · ${filled} updated · ${untouched} unchanged`);
  console.log(`          ${withPhotos} of ${seeds.length} have photography on disk\n`);

  // ---------------------------------------------------------------- admin user
  const email = (process.env.ADMIN_EMAIL || SITE.emailPrimary).toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const existingAdmin = (await db.execute({ sql: `SELECT email FROM admin_users WHERE email = ?`, args: [email] }))
    .rows[0];

  if (existingAdmin) {
    if (password && OVERWRITE) {
      await db.execute({
        sql: `UPDATE admin_users SET passwordHash = ?, updatedAt = ? WHERE email = ?`,
        args: [await bcrypt.hash(password, 12), now(), email],
      });
      console.log(`Admin: password reset for ${email}`);
    } else {
      console.log(`Admin: ${email} already exists (pass --overwrite with ADMIN_PASSWORD to reset)`);
    }
  } else if (password) {
    const stamp = now();
    await db.execute({
      sql: `INSERT INTO admin_users (id, email, passwordHash, name, role, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [randomUUID(), email, await bcrypt.hash(password, 12), 'DecArt Admin', 'admin', stamp, stamp],
    });
    console.log(`Admin: created ${email} — remove ADMIN_PASSWORD from the environment now.`);
  } else {
    console.warn('Admin: ADMIN_PASSWORD not set, no admin user created. /admin will be unusable.');
  }

  // ---------------------------------------------------------------- settings
  let routing: Record<string, string[]> = { default: [SITE.emailPrimary] };
  try {
    if (process.env.MAIL_ROUTING_JSON) routing = JSON.parse(process.env.MAIL_ROUTING_JSON);
  } catch {
    console.warn('Settings: MAIL_ROUTING_JSON is not valid JSON — using the default routing.');
  }

  const settingsExists = (await db.execute(`SELECT key FROM settings WHERE key = 'site'`)).rows[0];
  if (!settingsExists) {
    await db.execute({
      sql: `INSERT INTO settings (key, data, updatedAt) VALUES ('site', ?, ?)`,
      args: [
        J({
          phone: SITE.phone,
          whatsapp: SITE.whatsapp,
          emailPrimary: SITE.emailPrimary,
          mailRouting: routing,
          addressFactory: SITE.addressFactory,
          addressShowroom: '',
          mapUrl: SITE.mapUrl,
          hours: SITE.hours,
          gstin: SITE.gstin,
          social: SITE.social,
          counters: { years: 10, models: 350, families: 30, clients: 40 },
          announcement: '',
          replySignature: `${SITE.legalName}\n${SITE.addressFactory}\n${SITE.phone} · ${SITE.emailPrimary}\nTrust is our Sign.`,
        }),
        now(),
      ],
    });
    console.log('Settings: singleton created\n');
  } else {
    console.log('Settings: singleton already present\n');
  }

  // ---------------------------------------------------------------- category content
  /**
   * Starter description + FAQ per family so the category pages are never bare and the client has
   * something concrete to edit at /admin/categories. Only ever inserts — a row the client has
   * touched is left alone, even with --overwrite, because that copy is theirs.
   */
  let contentCreated = 0;
  let contentKept = 0;
  let contentRefreshed = 0;

  for (const family of FAMILIES.filter((f) => !f.hidden)) {
    const present = (
      await db.execute({ sql: `SELECT slug FROM family_content WHERE slug = ?`, args: [family.slug] })
    ).rows[0];
    if (present && !OVERWRITE) {
      contentKept++;
      continue;
    }

    const lede = FAMILY_LEDE[family.slug] ?? '';
    const singular = family.name.replace(/s$/, '');
    const faq = [
      {
        q: `What is the minimum order for ${family.name.toLowerCase()}?`,
        a: 'Single pieces for most chairs; project MOQs apply to workstations and custom builds. Tell us the quantity and we will confirm on the quote.',
      },
      {
        q: `Can ${family.name.toLowerCase()} be customised?`,
        a: 'Yes. Upholstery, mesh, base, castors, gas lift and armrests are all specified per order, and we match powder-coat shades on project quantities.',
      },
      { q: 'Do you show prices?', a: COPY.quoteFaq[0].a },
      { q: 'Do you deliver outside NCR?', a: COPY.quoteFaq[2].a },
    ];

    /**
     * Section order follows the reference page the client sent (geeken.in/collections/wood-storage):
     * About the manufacturer → Our <Category> Range → Our Process. Every family gets the same
     * skeleton so the client edits copy rather than inventing structure.
     */
    const bodyHtml = [
      `<p>DecArt Industries has manufactured office furniture in Faridabad since ${SITE.established}. Frames, ply, metalwork and upholstery are all produced in-house, which is how we can quote a specification and then actually ship it — ${family.name.toLowerCase()} included.</p>`,
      `<h3>Our ${family.name} Range</h3>`,
      `<p>${lede} Every ${singular.toLowerCase()} is built to order: finish, mechanism, base and upholstery are specified per requirement, and project quantities can be matched to a shade or a reference design.</p>`,
      `<h3>Our Process — How We Work</h3>`,
      `<ul>`,
      `<li><strong>Design.</strong> Ergonomics, frame geometry and finish planned against how the product will really be used.</li>`,
      `<li><strong>Fabricate.</strong> Frames, ply and metalwork made and finished on our own floor.</li>`,
      `<li><strong>Upholster &amp; assemble.</strong> High-density moulded PU foam, mesh and leatherette fitted by hand.</li>`,
      `<li><strong>Test &amp; pack.</strong> BIFMA/SGS-tested components, per-piece checks, and packing that survives Indian roads.</li>`,
      `</ul>`,
    ].join('');

    const args = [
      `About DecArt — Trusted Office Furniture Manufacturer`,
      lede,
      bodyHtml,
      J(faq),
      '',
      '',
      now(),
    ];

    if (present) {
      await db.execute({
        sql: `UPDATE family_content SET heading = ?, intro = ?, bodyHtml = ?, faq = ?, seoTitle = ?,
                seoDescription = ?, updatedAt = ? WHERE slug = ?`,
        args: [...args, family.slug],
      });
      contentRefreshed++;
    } else {
      await db.execute({
        sql: `INSERT INTO family_content (slug, heading, intro, bodyHtml, faq, seoTitle, seoDescription, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [family.slug, ...args],
      });
      contentCreated++;
    }
  }

  console.log(
    `Categories: ${contentCreated} seeded · ${contentRefreshed} refreshed · ${contentKept} left as the client wrote them\n`,
  );

  db.close();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
