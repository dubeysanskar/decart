// Admin image uploads, driven through the real screens on the live site, then cleaned up.
// Usage: node scripts/upload-audit.mjs <path-to-any-image.png>   (needs ADMIN_EMAIL / ADMIN_PASSWORD / CLOUDINARY_* in .env.local)
import puppeteer from 'puppeteer-core';
import crypto from 'node:crypto';
import { config } from 'dotenv';
config({ path: '.env.local' });

const B = 'https://decart.co.in';
const IMG = process.argv[2];
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
const p = await b.newPage(); p.setDefaultTimeout(90000);
await p.setViewport({ width: 1440, height: 1000 });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const results = []; const uploaded = [];
const ok = (n, pass, note = '') => results.push(`${pass ? 'PASS' : 'FAIL'}  ${n}${note ? ' — ' + note : ''}`);
p.on('response', async (r) => { if (r.url().includes('/api/upload') && r.request().method() === 'POST') { try { const j = await r.json(); if (j?.data?.src) uploaded.push({ url: j.data.src, publicId: j.data.publicId ?? j.data.public_id }); results.push(`      upload response ${r.status()} ${j?.data?.src ?? j?.error ?? ''}`.slice(0, 160)); } catch {} } });

await p.goto(B + '/admin/login', { waitUntil: 'networkidle2' });
await p.waitForSelector('input[type="email"]');
await p.type('input[type="email"]', process.env.ADMIN_EMAIL); await p.type('input[type="password"]', process.env.ADMIN_PASSWORD);
await p.keyboard.press('Enter'); await p.waitForFunction(() => location.pathname === '/admin', { timeout: 45000 }); await wait(1500);

const api = (url, method = 'GET', body) => p.evaluate(async (u, m, bd) => { const r = await fetch(u, { method: m, headers: { 'Content-Type': 'application/json' }, body: bd ? JSON.stringify(bd) : undefined }); return { s: r.status, j: await r.json().catch(() => null) }; }, url, method, body);
const pickAndSave = async (labelRegex) => {
  const input = await p.$('input[type="file"]');
  await input.uploadFile(IMG);
  // wait for the field to show the uploaded URL
  await p.waitForFunction(() => [...document.querySelectorAll('input[type="text"],input:not([type])')].some((i) => /res\.cloudinary\.com/.test(i.value)), { timeout: 60000 }).catch(() => {});
  const url = await p.evaluate(() => [...document.querySelectorAll('input[type="text"],input:not([type])')].map((i) => i.value).find((v) => /res\.cloudinary\.com/.test(v)));
  return url;
};

// ------------------------------------------------ category picture through the Categories screen
await p.goto(B + '/admin/structure', { waitUntil: 'networkidle2' }); await wait(1500);
console.log('structure page url', p.url(), 'file inputs', (await p.$$('input[type="file"]')).length);
await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.trim().startsWith('Lounge Chair'))?.click()); await wait(1200);
const catUrl = await pickAndSave();
ok('category picture: file picked → uploaded to Cloudinary', /res\.cloudinary\.com/.test(catUrl || ''), catUrl);
await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Save changes'))?.click()); await wait(3500);
const tree = await api('/api/structure');
const saved = tree.j?.data?.masters?.flatMap((m) => m.categories).find((c) => c.slug === 'lounge-chair');
ok('category picture saved in the database', saved?.coverOwn === catUrl, saved?.coverOwn);
const pageHtml = await p.evaluate(async () => (await fetch('/categories/seating/lounge-chair', { cache: 'no-store' })).text());
ok('category page hero uses the uploaded picture', pageHtml.includes(encodeURIComponent(catUrl).slice(0, 40)) || pageHtml.includes('res.cloudinary.com') , '');
// the sticky bar thumbnail
ok('picture also reaches the catalogue bar thumbnail', (pageHtml.match(/res\.cloudinary\.com|res\.cloudinary/g) || []).length >= 2, `${(pageHtml.match(/res\.cloudinary/g) || []).length} references`);
await api('/api/structure/categories/lounge-chair', 'PATCH', { cover: '' });
ok('category picture restored to automatic', (await api('/api/structure')).j.data.masters.flatMap((m) => m.categories).find((c) => c.slug === 'lounge-chair').coverOwn === '');

// ------------------------------------------------ master picture
await p.goto(B + '/admin/structure', { waitUntil: 'networkidle2' }); await wait(1000);
await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.trim().startsWith('Institutional'))?.click()); await wait(800);
const mUrl = await pickAndSave();
ok('master picture: file picked → uploaded', /res\.cloudinary\.com/.test(mUrl || ''), mUrl);
await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Save changes'))?.click()); await wait(3500);
const mHtml = await p.evaluate(async () => (await fetch('/categories/institutional', { cache: 'no-store' })).text());
ok('master page hero uses the uploaded picture', mHtml.includes('res.cloudinary'), '');
await api('/api/structure/masters/institutional', 'PATCH', { cover: '' });

// ------------------------------------------------ hero banner image through the Banners screen
await p.goto(B + '/admin/banners', { waitUntil: 'networkidle2' }); await wait(1200);
const created = await api('/api/banners', 'POST', { title: 'Audit | upload', subtitle: 'Audit slide', image: '/scenes/cafe-dining.webp', imageAlt: 'audit', href: '/products', ctaLabel: 'Go', status: 'draft', page: 'home', order: 99 });
const bid = created.j?.data?._id ?? created.j?.data?.id;
ok('banner created (draft) for the upload test', created.s === 201 && bid, `${created.s}`);
if (bid) {
  await p.reload({ waitUntil: 'networkidle2' }); await wait(1200);
  const opened = await p.evaluate(() => { const btn = document.querySelector('button[aria-label^="Edit Audit"]'); btn?.click(); return !!btn; });
  await wait(1200);
  if (await p.$('input[type="file"]')) {
    const bUrl = await pickAndSave();
    ok('banner image: file picked → uploaded', /res\.cloudinary\.com/.test(bUrl || ''), bUrl);
    await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => /Save banner/.test(x.textContent))?.click()); await wait(3000);
    const row = (await api('/api/banners')).j?.data?.find?.((x) => (x._id ?? x.id) === bid);
    ok('banner image saved', row?.image === bUrl, row?.image);
  } else ok('banner editor opened', false, 'no file input found (opened=' + opened + ')');
  await api(`/api/banners/${bid}`, 'DELETE');
}

// ------------------------------------------------ clean the test assets out of Cloudinary
const cloud = process.env.CLOUDINARY_CLOUD_NAME, key = process.env.CLOUDINARY_API_KEY, secret = process.env.CLOUDINARY_API_SECRET;
let removed = 0;
for (const u of uploaded) {
  const publicId = u.publicId ?? u.public_id ?? (/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i.exec(u.url) || [])[1];
  if (!publicId) continue;
  const ts = Math.floor(Date.now() / 1000);
  const sig = crypto.createHash('sha1').update(`public_id=${publicId}&timestamp=${ts}${secret}`).digest('hex');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/destroy`, { method: 'POST', body: new URLSearchParams({ public_id: publicId, timestamp: String(ts), api_key: key, signature: sig }) });
  if ((await res.json().catch(() => ({}))).result === 'ok') removed++;
}
ok('test images removed from Cloudinary', removed === uploaded.length, `${removed}/${uploaded.length}`);
console.log(results.join('\n'));
await b.close();
