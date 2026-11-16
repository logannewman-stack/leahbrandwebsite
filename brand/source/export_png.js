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
  // Favicons / app icons from the filled arch icon, centred on a square
  const icon = fs.readFileSync(path.join(logos, 'leah-roling-icon.svg'), 'utf8');
  const sq = (size, pad, bg) => `<html><body style="margin:0;width:${size}px;height:${size}px;display:flex;align-items:flex-end;justify-content:center;background:${bg}">${icon.replace(/width="[\d.]+" height="[\d.]+"/, `height="${Math.round(size * (1 - pad))}"`)}</body></html>`;
  const out = path.join(root, 'assets', 'img', 'icons');
  fs.mkdirSync(out, { recursive: true });
  for (const [name, size, pad, bg] of [['favicon-32.png', 32, 0.06, 'transparent'], ['apple-touch-icon.png', 180, 0.16, '#F6F0E7'], ['icon-192.png', 192, 0.14, '#F6F0E7'], ['icon-512.png', 512, 0.14, '#F6F0E7']]) {
    await p.setViewportSize({ width: size, height: size });
    await p.setContent(sq(size, pad, bg));
    await p.screenshot({ path: path.join(out, name), omitBackground: bg === 'transparent' });
    console.log('icon', name);
  }
  await b.close();
})();
