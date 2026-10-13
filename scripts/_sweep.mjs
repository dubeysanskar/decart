import puppeteer from 'puppeteer-core';
const [B, OUT] = [process.argv[2], process.argv[3]];
const pages = ['/', '/products', '/categories/seating', '/categories/seating/mesh-office-chair', '/categories/health-care/hospital-bed', '/products/cafe', '/about', '/contact', '/projects', '/blog', '/quote', '/search?q=chair', '/enquiry'];
const widths = [[360, 740], [390, 844], [768, 1024], [1024, 768]];
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
const p = await b.newPage();
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const report = [];
for (const [w, h] of widths) {
  await p.setViewport({ width: w, height: h, isMobile: w < 700, hasTouch: w < 1000 });
  for (const path of pages) {
    const res = await p.goto(B + path, { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => null);
    await wait(500);
    const r = await p.evaluate(() => {
      const vw = innerWidth;
      const wide = [...document.querySelectorAll('body *')].filter((el) => {
        const b = el.getBoundingClientRect();
        if (!b.width || getComputedStyle(el).position === 'fixed') return false;
        // clipped by a scroller on purpose
        for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
          const o = getComputedStyle(n).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden') return false;
        }
        return b.right > vw + 1;
      }).slice(0, 3).map((el) => el.tagName + '.' + String(el.className).slice(0, 60));
      const small = [...document.querySelectorAll('a,button')].filter((el) => {
        const b = el.getBoundingClientRect(); const cs = getComputedStyle(el);
        return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && (b.height < 28 || b.width < 28) && !el.closest('[aria-hidden="true"]') && (el.textContent || el.getAttribute('aria-label') || '').trim();
      }).length;
      return { overflow: document.documentElement.scrollWidth > vw + 1, wide, smallTargets: small };
    });
    report.push({ w, path, status: res?.status(), ...r });
  }
}
const bad = report.filter((r) => r.overflow || r.wide.length || r.status !== 200);
console.log('checked', report.length, '| problems', bad.length);
for (const r of bad) console.log(JSON.stringify(r));
console.log('small tap targets (<28px) per width:');
for (const w of widths.map((x) => x[0])) console.log(w, report.filter((r) => r.w === w).map((r) => r.smallTargets).join(','));
await b.close();
