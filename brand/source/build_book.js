// Leah Roling — brand book + social template builder.
//
//   node brand/source/build_book.js            # social PNGs + PDF
//   node brand/source/build_book.js --pages    # also writes page previews to brand/source/preview/
//
// 1. Screenshots every template in social.html to brand/social/<id>.png
// 2. Prints brand-book.html to brand/Leah-Roling-Brand-Book.pdf (11 x 8.5 in, landscape)
//
// Website screenshots for the "Website" spread are read from brand/source/shots/
// (site-desktop.png, site-mobile.png). Re-run this script after they're generated.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SRC = __dirname;
const BRAND = path.resolve(SRC, '..');
const SOCIAL_OUT = path.join(BRAND, 'social');
const PDF_OUT = path.join(BRAND, 'Leah-Roling-Brand-Book.pdf');
const url = (f) => 'file://' + path.join(SRC, f);

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images).map((img) =>
        img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; })
      )
    );
  });
  await page.waitForTimeout(300);
}

(async () => {
  const browser = await chromium.launch();

  // ---- 1. Social templates -------------------------------------------------
  fs.mkdirSync(SOCIAL_OUT, { recursive: true });
  const social = await browser.newPage({ viewport: { width: 3200, height: 3200 }, deviceScaleFactor: 1 });
  await social.goto(url('social.html'));
  await settle(social);
  const ids = await social.$$eval('section.t[id]', (els) => els.map((e) => e.id));
  for (const id of ids) {
    await social.locator('#' + id).screenshot({ path: path.join(SOCIAL_OUT, id + '.png') });
    console.log('social  ', id + '.png');
  }
  await social.close();

  // ---- 2. Brand book PDF ---------------------------------------------------
  const book = await browser.newPage({ viewport: { width: 1056, height: 816 } });
  await book.goto(url('brand-book.html'));
  await settle(book);
  await book.emulateMedia({ media: 'print' });
  await book.pdf({ path: PDF_OUT, preferCSSPageSize: true, printBackground: true });
  const pages = await book.$$eval('.page', (p) => p.length);
  console.log('pdf     ', path.relative(process.cwd(), PDF_OUT), `(${pages} pages, ${(fs.statSync(PDF_OUT).size / 1048576).toFixed(1)} MB)`);

  // ---- 3. Optional page previews ------------------------------------------
  if (process.argv.includes('--pages')) {
    const dir = path.join(SRC, 'preview');
    fs.mkdirSync(dir, { recursive: true });
    await book.emulateMedia({ media: 'screen' });
    const handles = await book.$$('.page');
    for (let i = 0; i < handles.length; i++) {
      await handles[i].screenshot({ path: path.join(dir, `page-${String(i + 1).padStart(2, '0')}.png`) });
    }
    console.log('preview ', handles.length, 'pages →', path.relative(process.cwd(), dir));
  }
  await browser.close();
})();
