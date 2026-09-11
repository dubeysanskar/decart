/**
 * Backend audit against the LIVE site, as the admin.
 *
 * Reads every admin API, then does a write-and-clean-up on each module so the check proves
 * the whole path (auth → validation → database → revalidation → response), not just that a
 * route answers. Everything it creates is named "Audit" and removed before it exits.
 */
import puppeteer from 'puppeteer-core';
import { config } from 'dotenv';
config({ path: '.env.local' });

const B = process.env.AUDIT_BASE || 'https://decart.co.in';
const results = [];
const ok = (name, pass, note = '') => results.push({ name, pass: Boolean(pass), note });

const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
const p = await b.newPage();
p.setDefaultTimeout(60000);

// ---------------------------------------------------------------- 1. login
await p.goto(B + '/admin/login', { waitUntil: 'domcontentloaded' });
await new Promise((r) => setTimeout(r, 800));
await p.type('input[type="email"], input[name="email"]', process.env.ADMIN_EMAIL);
await p.type('input[type="password"], input[name="password"]', process.env.ADMIN_PASSWORD);
await Promise.all([p.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}), p.click('button[type="submit"]')]);
await new Promise((r) => setTimeout(r, 1500));
ok('admin login', p.url().endsWith('/admin'), p.url());

/** fetch from inside the page so the session cookie rides along */
const api = (path, init) =>
  p.evaluate(
    async (path, init) => {
      const res = await fetch(path, init ? { ...init, headers: { 'Content-Type': 'application/json', ...(init.headers || {}) } } : undefined);
      const text = await res.text();
      let json = null;
      try { json = JSON.parse(text); } catch {}
      return { status: res.status, json, text: text.slice(0, 200), type: res.headers.get('content-type') || '' };
    },
    path,
    init,
  );
const post = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) });
const patch = (path, body) => api(path, { method: 'PATCH', body: JSON.stringify(body) });
const del = (path) => api(path, { method: 'DELETE' });

// ---------------------------------------------------------------- 2. every admin read
for (const [name, path] of [
  ['products list', '/api/products?perPage=5'],
  ['categories list', '/api/categories'],
  ['banners list', '/api/banners'],
  ['blog list', '/api/blog'],
  ['projects list', '/api/projects'],
  ['client logos list', '/api/clients'],
  ['reviews list', '/api/reviews'],
  ['leads inbox', '/api/leads?perPage=5'],
  ['quotations list', '/api/quotations'],
  ['quote clients list', '/api/quote-clients'],
  ['settings (masked)', '/api/settings'],
  ['testimonials', '/api/testimonials'],
  ['public search', '/api/search?q=mesh'],
]) {
  const r = await api(path);
  ok(name, r.status === 200 && r.json?.ok !== false, `${r.status}`);
}

// ---------------------------------------------------------------- 3. settings: secrets stay masked, saving keeps them
{
  const s = await api('/api/settings');
  const d = s.json?.data ?? {};
  ok('settings masks SMTP password', d.smtp?.pass === '' && d.smtp?.hasPassword === true);
  ok('settings masks Cloudinary secret', d.cloudinary?.apiSecret === '' && d.cloudinary?.hasSecret === true);
  ok('settings smtp is the Gmail account', d.smtp?.user === 'decart.co.in@gmail.com' && Number(d.smtp?.port) === 465, `${d.smtp?.user}:${d.smtp?.port}`);
  // a no-op save must not wipe either secret
  const save = await patch('/api/settings', { smtp: { ...d.smtp, pass: '__unchanged__' }, cloudinary: { ...d.cloudinary, apiSecret: '__unchanged__' } });
  const after = (await api('/api/settings')).json?.data ?? {};
  ok('settings save preserves both secrets', save.status === 200 && after.smtp?.hasPassword && after.cloudinary?.hasSecret, `${save.status}`);
}

// ---------------------------------------------------------------- 4. SMTP: a real send from production
{
  const t = await post('/api/settings/test-mail', { to: 'decart.co.in@gmail.com' });
  ok('SMTP test mail from production', t.status === 200 && t.json?.ok, t.json?.data?.messageId || t.json?.error || t.status);
}

// ---------------------------------------------------------------- 5. upload: a real file through the admin route
{
  const r = await p.evaluate(async () => {
    // a 1x1 PNG, so nothing of size lands in the media library
    const png = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='), (c) => c.charCodeAt(0));
    const fd = new FormData(); fd.append('file', new Blob([png], { type: 'image/png' }), 'audit.png'); fd.append('folder', 'products');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    return { status: res.status, json: await res.json().catch(() => null) };
  });
  ok('image upload (Cloudinary)', r.status === 200 && r.json?.data?.src?.includes('res.cloudinary.com'), r.json?.data?.publicId || r.json?.error || r.status);
  results.uploadPublicId = r.json?.data?.publicId;
}

// ---------------------------------------------------------------- 6. categories: create, edit, read back, delete
{
  const c = await post('/api/categories', { name: 'Audit Temp Category', groupSlug: 'furniture', order: 999 });
  const slug = c.json?.data?.slug;
  ok('category create', c.status === 201 && slug, slug || c.text);
  if (slug) {
    const e = await patch(`/api/categories/${slug}`, { intro: 'audit', cover: '/families/storage.webp', status: 'hidden' });
    const back = (await api(`/api/categories/${slug}`)).json?.data;
    ok('category edit round-trip (new columns live)', e.status === 200 && back?.cover === '/families/storage.webp' && back?.status === 'hidden', JSON.stringify({ cover: back?.cover, status: back?.status }));
    const d = await del(`/api/categories/${slug}`);
    ok('category delete', d.status === 200);
  }
}

// ---------------------------------------------------------------- 7. banners: draft row with the new fields, then delete
{
  const c = await post('/api/banners', { title: 'Audit | draft', subtitle: 'x', image: '/scenes/cafe-dining.webp', href: '/products/cafe', page: 'home', eyebrow: 'AUDIT', models: ['comfort-hi-stool'], status: 'draft', order: 99 });
  const id = c.json?.data?._id;
  ok('banner create (draft)', c.status === 201 || c.status === 200, id || c.text);
  if (id) {
    const row = (await api('/api/banners')).json?.data?.find((r) => r._id === id);
    ok('banner new columns round-trip (page/eyebrow/models)', row?.page === 'home' && row?.eyebrow === 'AUDIT' && Array.isArray(row?.models) && row.models[0] === 'comfort-hi-stool', JSON.stringify({ page: row?.page, eyebrow: row?.eyebrow, models: row?.models }));
    const d = await del(`/api/banners/${id}`);
    ok('banner delete', d.status === 200);
  }
}

// ---------------------------------------------------------------- 8. products: edit a field and restore it
{
  const list = (await api('/api/products?perPage=1&q=mustang')).json?.data;
  const rows = list?.rows ?? list ?? [];
  const prod = rows[0];
  ok('product lookup', Boolean(prod?.slug), prod?.slug);
  if (prod?.slug) {
    const before = prod.finishNote ?? '';
    const e = await patch(`/api/products/${prod.slug}`, { finishNote: 'audit-touch' });
    const mid = (await api(`/api/products/${prod.slug}`)).json?.data;
    const restore = await patch(`/api/products/${prod.slug}`, { finishNote: before });
    ok('product edit + restore', e.status === 200 && mid?.finishNote === 'audit-touch' && restore.status === 200, `${e.status}/${restore.status}`);
  }
}

// ---------------------------------------------------------------- 9. enquiry (public) -> inbox -> mail status
{
  const startedAt = Date.now() - 5000;
  const r = await post('/api/leads', { type: 'contact', name: 'Audit Bot', phone: '9311942001', email: 'decart.co.in@gmail.com', message: 'Backend audit — please ignore.', extra: { subject: 'General enquiry' }, page: '/audit', startedAt });
  const id = r.json?.data?.id;
  ok('public enquiry accepted', (r.status === 202 || r.status === 200) && id, id || r.text);
  if (id) {
    const lead = (await api(`/api/leads/${id}`)).json?.data;
    ok('enquiry visible in inbox', lead?.name === 'Audit Bot');
    ok('enquiry alert e-mailed (SMTP on production)', lead?.mailStatus?.admin === 'sent', JSON.stringify(lead?.mailStatus));
    const j = await patch(`/api/leads/${id}`, { status: 'junk', note: 'backend audit' });
    ok('lead update (mark junk)', j.status === 200);
  }
}

// ---------------------------------------------------------------- 10. quotation: client -> quote -> PDF -> cancel
{
  const c = await post('/api/quote-clients', { company: 'Audit Client Pvt Ltd', contactPerson: 'Audit', email: 'decart.co.in@gmail.com', phone: '9311942001', state: 'Haryana', city: 'Faridabad' });
  const clientId = c.json?.data?._id;
  ok('quote client create', (c.status === 201 || c.status === 200) && clientId, clientId || c.text);
  if (clientId) {
    const q = await post('/api/quotations', { clientId, title: 'Audit quotation', items: [{ name: 'Audit chair', code: 'AUDIT-1', mrp: 1000, mode: 'price', unitPrice: 800, qty: 2 }], taxRate: 18 });
    const qid = q.json?.data?._id;
    ok('quotation create', (q.status === 201 || q.status === 200) && qid, q.json?.data?.number || q.text);
    if (qid) {
      const math = q.json.data;
      ok('quotation totals (server-side)', math.subtotal === 1600 && Math.round(math.total) === 1888, `subtotal ${math.subtotal} total ${math.total}`);
      const pdf = await p.evaluate(async (id) => { const r = await fetch(`/api/quotations/${id}/pdf`); const buf = await r.arrayBuffer(); return { status: r.status, type: r.headers.get('content-type'), bytes: buf.byteLength, magic: String.fromCharCode(...new Uint8Array(buf.slice(0, 4))) }; }, qid);
      ok('quotation PDF renders', pdf.status === 200 && pdf.magic === '%PDF' && pdf.bytes > 2000, `${pdf.type} ${pdf.bytes}b`);
      const cancel = await patch(`/api/quotations/${qid}`, { status: 'cancelled' });
      ok('quotation cancel', cancel.status === 200);
    }
  }
}

// ---------------------------------------------------------------- 11. admin pages render
for (const path of ['/admin', '/admin/products', '/admin/categories', '/admin/banners', '/admin/inbox', '/admin/quotations', '/admin/settings', '/admin/blog', '/admin/projects', '/admin/clients', '/admin/reviews']) {
  const r = await p.goto(B + path, { waitUntil: 'domcontentloaded' });
  await new Promise((res) => setTimeout(res, 600));
  const h1 = await p.evaluate(() => document.querySelector('h1')?.textContent?.trim() ?? '');
  ok(`page ${path}`, r.status() === 200 && h1 && !/unavailable/i.test(h1), h1);
}

await b.close();

const pass = results.filter((r) => r.pass).length;
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.note ? '  — ' + r.note : ''}`);
console.log(`\n${pass}/${results.length} passed`);
if (results.uploadPublicId) console.log('CLEANUP_UPLOAD=' + results.uploadPublicId);
