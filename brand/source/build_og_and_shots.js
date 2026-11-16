// Builds assets/img/og-image.jpg and the website screenshots used in the brand book.
// Requires the site to be served locally:  python3 -m http.server 8765
// Run: node brand/source/build_og_and_shots.js
const { chromium, devices } = require('playwright');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const SITE = process.env.SITE_URL || 'http://127.0.0.1:8765/index.html';
(async () => {
  const b = await chromium.launch();
  // Social share image
  let p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto('file://' + path.join(__dirname, 'og.html'));
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(root, 'assets/img/og-image.jpg'), type: 'jpeg', quality: 88 });
  await p.close();
  // Desktop screenshot
  p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  await p.addInitScript(() => sessionStorage.setItem('lr-intro', '1'));
  await p.goto(SITE); await p.waitForTimeout(2600);
  await p.screenshot({ path: path.join(root, 'brand/source/shots/site-desktop.png') });
  await p.close();
  // Mobile screenshot
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  p = await ctx.newPage();
  await p.addInitScript(() => sessionStorage.setItem('lr-intro', '1'));
  await p.goto(SITE); await p.waitForTimeout(2600);
  await p.screenshot({ path: path.join(root, 'brand/source/shots/site-mobile.png') });
  await b.close();
  console.log('og-image + site screenshots written');
})();
