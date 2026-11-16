// Renders every SVG in brand/logos to transparent PNG (2400px on the long edge)
// and builds favicon/app icons. Run: node brand/source/export_png.js
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..', '..');
const logos = path.join(root, 'brand', 'logos');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  async function render(svgFile, outFile, longEdge, bg) {
    const svg = fs.readFileSync(svgFile, 'utf8');
    const vb = svg.match(/viewBox="([\d.\s-]+)"/)[1].split(/\s+/).map(Number);
    const [w, h] = [vb[2], vb[3]];
    const s = longEdge / Math.max(w, h);
    const W = Math.round(w * s), H = Math.round(h * s);
    await p.setViewportSize({ width: W, height: H });
    await p.setContent(`<html><body style="margin:0;background:${bg || 'transparent'}">${svg.replace(/width="[\d.]+" height="[\d.]+"/, `width="${W}" height="${H}"`)}</body></html>`);
    await p.screenshot({ path: outFile, omitBackground: !bg, clip: { x: 0, y: 0, width: W, height: H } });
  }
  for (const f of fs.readdirSync(logos).filter(f => f.endsWith('.svg'))) {
    await render(path.join(logos, f), path.join(logos, 'png', f.replace('.svg', '.png')), 2400);
    console.log('png', f);
  }
  // Favicons / app icons from the monochrome app icon (it carries its own background)
  const icon = fs.readFileSync(path.join(logos, 'leah-roling-app-icon.svg'), 'utf8');
  const out = path.join(root, 'assets', 'img', 'icons');
  fs.mkdirSync(out, { recursive: true });
  for (const [name, size] of [['favicon-32.png', 32], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
    await p.setViewportSize({ width: size, height: size });
    await p.setContent(`<html><body style="margin:0;background:transparent">${icon.replace(/width="[\d.]+" height="[\d.]+"/, `width="${size}" height="${size}"`)}</body></html>`);
    await p.screenshot({ path: path.join(out, name), omitBackground: true });
    console.log('icon', name);
  }
  await b.close();
})();
