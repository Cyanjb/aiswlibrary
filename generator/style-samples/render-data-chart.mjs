// Render data-chart.html to assets/style-samples/data-chart-animation.mp4 (960x540, 30 fps, 7 s) and its poster.
// Usage: node generator/style-samples/render-data-chart.mjs
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = dirname(fileURLToPath(import.meta.url)), OUT = join(dir, '..', '..', 'assets', 'style-samples');
const FPS = 30;
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await pg.goto('file://' + join(dir, 'data-chart.html')); await pg.waitForFunction(() => window.ready);
const dur = await pg.evaluate(() => window.DUR), n = Math.round(dur * FPS);
const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  '-vf', 'scale=960:540:flags=lanczos', '-c:v', 'libx264', '-crf', '20', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
  join(OUT, 'data-chart-animation.mp4')]);
const done = new Promise((ok, bad) => ff.on('close', c => (c ? bad(new Error('ffmpeg ' + c)) : ok())));
for (let i = 0; i < n; i++) {
  const url = await pg.evaluate(t => draw(t), i / FPS);
  if (!ff.stdin.write(Buffer.from(url.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
}
ff.stdin.end(); await done;
const poster = await pg.evaluate(t => draw(t), 6.5);
writeFileSync(join(OUT, 'data-chart-animation.full.jpg'), Buffer.from(poster.split(',')[1], 'base64'));
await new Promise((ok, bad) => spawn('ffmpeg', ['-loglevel', 'error', '-y', '-i', join(OUT, 'data-chart-animation.full.jpg'), '-vf', 'scale=960:540', '-q:v', '3',
  join(OUT, 'data-chart-animation.jpg')]).on('close', c => (c ? bad() : ok())));
(await import('node:fs')).unlinkSync(join(OUT, 'data-chart-animation.full.jpg'));
console.log('rendered data-chart-animation', `${dur}s`, n, 'frames');
await b.close();
