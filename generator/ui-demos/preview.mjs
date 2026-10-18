// Contact sheet for checking demos by eye: 6 frames across each demo's cycle.
// Usage: node preview.mjs <demos-file.js> [out.png]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = dirname(fileURLToPath(import.meta.url));
const file = process.argv[2], out = process.argv[3] || join(dir, 'preview.png');
const srv = createServer((q, s) => { try { const p = join(dir, decodeURIComponent(q.url.split('?')[0])); s.writeHead(200, { 'content-type': extname(p) === '.js' ? 'text/javascript' : 'text/html' }); s.end(readFileSync(p)); } catch { s.writeHead(404); s.end(); } }).listen(0);
const port = srv.address().port;
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 960, height: 540 } });
const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => m.type() === 'error' && errs.push(m.text()));
await pg.goto(`http://127.0.0.1:${port}/stage.html?files=${file}`); await pg.evaluate(() => window.ready);
const sheet = await pg.evaluate(async () => {
  const ids = Object.keys(DEMOS).filter(id => id !== 'toast-notification' || Object.keys(DEMOS).length === 1);
  const cols = 6, tw = 320, th = 180, lab = 22;
  const c = document.createElement('canvas'); c.width = cols * tw; c.height = ids.length * (th + lab); const x = c.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height);
  for (let r = 0; r < ids.length; r++) {
    const d = DEMOS[ids[r]];
    x.fillStyle = '#fff'; x.font = '600 14px Inter'; x.textBaseline = 'middle'; x.fillText(`${ids[r]}  (cycle ${d.cycle}s)`, 6, r * (th + lab) + 11);
    for (let i = 0; i < cols; i++) {
      const t = d.cycle * i / cols;
      const img = new Image(); img.src = frame(ids[r], t, 'image/png'); await img.decode();
      x.drawImage(img, i * tw, r * (th + lab) + lab, tw, th);
      x.fillStyle = '#ff0'; x.font = '600 11px Inter'; x.fillText('t=' + t.toFixed(2), i * tw + 4, r * (th + lab) + lab + 9);
    }
  }
  return c.toDataURL('image/png');
});
const { writeFileSync } = await import('node:fs');
writeFileSync(out, Buffer.from(sheet.split(',')[1], 'base64'));
console.log('wrote', out, errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no errors');
await b.close(); srv.close();
