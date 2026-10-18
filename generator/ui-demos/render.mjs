// Render every demo to assets/ui-motion/<id>.mp4 (30 fps, 2 loops) plus a <id>.jpg poster.
// Usage: node render.mjs [id ...]   (no ids = all demos in demos/)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(dir, '..', '..', 'assets', 'ui-motion'); mkdirSync(OUT, { recursive: true });
const FPS = 30, LOOPS = 2;
const files = readdirSync(join(dir, 'demos')).filter(f => f.endsWith('.js') && !f.startsWith('example'));
const srv = createServer((q, s) => { try { const p = join(dir, decodeURIComponent(q.url.split('?')[0])); s.writeHead(200, { 'content-type': extname(p) === '.js' ? 'text/javascript' : 'text/html' }); s.end(readFileSync(p)); } catch { s.writeHead(404); s.end(); } }).listen(0);
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 960, height: 540 } });
await pg.goto(`http://127.0.0.1:${srv.address().port}/stage.html?files=${files.join(',')}`); await pg.evaluate(() => window.ready);
let demos = await pg.evaluate(() => list()); const want = process.argv.slice(2);
if (want.length) demos = demos.filter(d => want.includes(d.id));
for (const d of demos) {
  const n = Math.round(d.cycle * FPS);
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-vf', `loop=${LOOPS - 1}:${n}:0,scale=640:360`, '-c:v', 'libx264', '-crf', '24', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', join(OUT, d.id + '.mp4')]);
  const done = new Promise((ok, bad) => ff.on('close', c => (c ? bad(new Error('ffmpeg ' + c)) : ok())));
  for (let i = 0; i < n; i++) {
    const url = await pg.evaluate(([id, t]) => frame(id, t), [d.id, i / FPS]);
    if (!ff.stdin.write(Buffer.from(url.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await done;
  // poster: the moment the demo is most "in action" (posterAt, default 45% through)
  const at = await pg.evaluate(id => (DEMOS[id].posterAt ?? DEMOS[id].cycle * 0.45), d.id);
  const jpg = await pg.evaluate(([id, t]) => frame(id, t), [d.id, at]);
  writeFileSync(join(OUT, d.id + '.full.jpg'), Buffer.from(jpg.split(',')[1], 'base64'));
  await new Promise((ok, bad) => spawn('ffmpeg', ['-loglevel', 'error', '-y', '-i', join(OUT, d.id + '.full.jpg'), '-vf', 'scale=640:360', '-q:v', '4', join(OUT, d.id + '.jpg')]).on('close', c => (c ? bad() : ok())));
  (await import('node:fs')).unlinkSync(join(OUT, d.id + '.full.jpg'));
  console.log('rendered', d.id, `${d.cycle}s`);
}
await b.close(); srv.close();
