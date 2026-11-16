// Captures the screenshots used in brand/ui-ux-overview.
// Requires the site served locally:  python3 -m http.server 8765
// Run: node brand/source/capture_overview.js && python3 brand/source/stitch_overview.py
const { chromium, devices } = require('playwright');
const path = require('path');
const out = path.resolve(__dirname, '..', 'ui-ux-overview', 'img');
const SITE = process.env.SITE_URL || 'http://127.0.0.1:8765/index.html';
const SECTIONS = [
  ['02-ticker', '.marquee'], ['03-roles', '#about'], ['04-story', '#story'], ['05-philosophy', '.philosophy'],
  ['06-doorways', '#work'], ['07-replaceable', '#replaceable'], ['08-bookshelf', '#books'],
  ['09-results', 'section:has(#results-title)'], ['10-speaking', '#speaking'], ['11-podcast', '#show'],
  ['12-faith', '#faith'], ['13-start', '#start'], ['14-contact', '#contact'],
];
const STILL = 'html{scroll-behavior:auto!important} .skip-link,.cursor{display:none!important}'; // HIDE_CURSOR
async function settle(p) {
  await p.addStyleTag({ content: STILL });
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 500) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(110); }
  await p.waitForTimeout(2200);
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500);
}
(async () => {
  const b = await chromium.launch();
  // ---- Desktop ----
  let p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  await p.goto(SITE); await p.addStyleTag({ content: STILL }); await p.waitForTimeout(2600);
  await p.screenshot({ path: path.join(out, '01-hero.png') });
  await settle(p);
  // Sections are captured as viewport-height slices and stitched afterwards, so each crop
  // shows exactly what a visitor sees (full-page capture mode lays some sections out differently).
  await p.addStyleTag({ content: '.header,.sticky-cta,.progress,.totop{display:none!important} .marquee__track{animation:none!important} .roles__stage,.speaking__visual{position:relative!important;top:auto!important}' });
  await p.waitForTimeout(300);
  const rects = await p.evaluate(sections => sections.map(([name, sel]) => { const r = document.querySelector(sel).getBoundingClientRect(); return { name, y: Math.round(r.top + scrollY), h: Math.round(r.height) }; }), SECTIONS);
  const slices = [];
  for (const r of rects) {
    for (let off = 0, k = 0; off < r.h; off += 900, k++) {
      await p.evaluate(y => scrollTo(0, y), r.y + off); await p.waitForTimeout(350);
      const file = `_${r.name}_${k}.png`;
      await p.screenshot({ path: path.join(out, file), clip: { x: 0, y: 0, width: 1440, height: Math.min(900, r.h - off) } });
      slices.push({ name: r.name, file });
    }
  }
  require('fs').writeFileSync(path.join(out, '_slices.json'), JSON.stringify(slices));
  await p.close();
  // ---- Tablet ----
  p = await b.newPage({ viewport: { width: 820, height: 1100 }, deviceScaleFactor: 1.5 });
  await p.goto(SITE); await p.addStyleTag({ content: STILL }); await p.waitForTimeout(2600);
  await p.screenshot({ path: path.join(out, 'tablet-hero.png') });
  await p.close();
  // ---- Phone ----
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  p = await ctx.newPage();
  await p.goto(SITE); await p.addStyleTag({ content: STILL }); await p.waitForTimeout(2600);
  await p.screenshot({ path: path.join(out, 'phone-hero.png') });
  await p.click('.menu-btn'); await p.waitForTimeout(1300);
  await p.screenshot({ path: path.join(out, 'phone-menu.png') });
  await p.click('.menu-btn'); await p.waitForTimeout(900);
  await settle(p);
  const shot = async (name, sel, dy) => {
    await p.evaluate(([sel, dy]) => { const e = document.querySelector(sel); scrollTo(0, e.getBoundingClientRect().top + scrollY + dy); }, [sel, dy]);
    await p.waitForTimeout(1500);
    await p.screenshot({ path: path.join(out, name + '.png') });
  };
  await shot('phone-roles', '.roles__list', -150);
  await shot('phone-doors', '.doors', -40);
  await b.close();
  console.log('captured');
})();
