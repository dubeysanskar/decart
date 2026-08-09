import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = 'C:\\Users\\Dell\\AppData\\Local\\Temp\\claude\\c--Users-Dell-OneDrive-Desktop-1clickdistributor\\bc17823f-b101-4a2e-ad22-f793e0594106\\scratchpad\\shots';
const BASE = 'http://localhost:3000';

const PAGES = [
  ['home', '/'],
  ['products', '/products'],
  ['family', '/products/mesh'],
  ['pdp', '/products/mesh/bonai-hb'],
  ['contact', '/contact'],
  ['quote', '/quote'],
  ['about', '/about'],
];

await fs.mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'],
});

const page = await browser.newPage();
// isMobile:false on purpose — mobile emulation silently WIDENS the layout viewport when content
// does not fit, which hides exactly the overflow bugs this audit exists to catch.
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: false });

let totalOverflow = 0;
let totalSmallTaps = 0;

for (const [name, path] of PAGES) {
  try {
    await page.goto(BASE + path, { waitUntil: 'networkidle2', timeout: 120000 });
    await new Promise((r) => setTimeout(r, 2200));

    const audit = await page.evaluate(() => {
      // neutralise the body clip so genuine overflow is measurable rather than silently chopped
      document.body.style.overflowX = 'visible';
      document.documentElement.style.overflowX = 'visible';
      const winW = window.innerWidth;
      const inScroller = (el) => {
        let p = el.parentElement;
        while (p) {
          const ov = getComputedStyle(p).overflowX;
          if (ov === 'auto' || ov === 'scroll') return true;
          p = p.parentElement;
        }
        return false;
      };

      const bad = [];
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.right > winW + 1 && !inScroller(el)) {
          bad.push({
            tag: el.tagName.toLowerCase(),
            cls: String(el.className || '').slice(0, 82),
            right: Math.round(r.right),
            w: Math.round(r.width),
            depth: (() => { let d = 0, p = el; while ((p = p.parentElement)) d++; return d; })(),
          });
        }
      }
      bad.sort((a, b) => a.depth - b.depth);

      const small = [];
      for (const el of document.querySelectorAll('a,button')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        // footer/inline prose links are fine; flag interactive chips and standalone controls
        if (r.height < 36) {
          small.push({ tag: el.tagName.toLowerCase(), text: (el.textContent || '').trim().slice(0, 30), h: Math.round(r.height) });
        }
      }

      let hidden = 0;
      const anims = document.querySelectorAll('[data-anim]');
      for (const el of anims) if (parseFloat(getComputedStyle(el).opacity) < 0.05) hidden++;

      return { winW, docW: document.documentElement.scrollWidth, overflowCount: bad.length, bad: bad.slice(0, 6), smallTaps: small.length, animTotal: anims.length, hiddenAboveFold: hidden };
    });

    await page.screenshot({ path: `${OUT}\\${name}-top.png` });
    totalOverflow += audit.overflowCount;
    totalSmallTaps += audit.smallTaps;

    const clean = audit.overflowCount === 0 && audit.docW <= audit.winW + 1;
    const mark = clean ? 'OK  ' : 'FAIL';
    console.log(`${mark} ${name.padEnd(9)} vw=${audit.winW} doc=${audit.docW}  overflow=${audit.overflowCount}  smallTaps=${audit.smallTaps}`);
    for (const b of audit.bad) console.log(`       d${b.depth} <${b.tag}> right=${b.right} w=${b.w} .${b.cls}`);
  } catch (err) {
    console.log(`ERR  ${name}: ${err.message}`);
  }
}

console.log(`\nTOTAL overflowing elements: ${totalOverflow}`);
console.log(`TOTAL sub-36px tap targets: ${totalSmallTaps}`);

await browser.close();
