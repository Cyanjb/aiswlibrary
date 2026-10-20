/* Film Reference Finder demos: one per reference site, the Find, Name, Prompt method, and two small loops
   for the "See it in real films" line on keyword pages. Every film frame is drawn in code (no real films, no
   real people). Rendered to assets/references/ with: OUT=references node render.mjs <id ...> */
(function () {
  const { C, ep, ease, seg, lerp, clamp, rnd, rr, backdrop, browser, clipTo, fillRR, text, shadow, noShadow, cursor, path } = KIT;

  // ---------- helpers ----------
  const typed = (s, p) => s.slice(0, Math.round(s.length * clamp(p)));
  const blink = t => Math.floor(t * 2.2) % 2 === 0;
  function figure(ctx, x, y, h, color) {
    // simple standing silhouette, feet at (x, y)
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y - h * 0.86, h * 0.12, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - h * 0.16, y - h * 0.7); ctx.lineTo(x + h * 0.16, y - h * 0.7); ctx.lineTo(x + h * 0.11, y); ctx.lineTo(x - h * 0.11, y); ctx.closePath(); ctx.fill();
  }
  function glow(ctx, x, y, r, color, a = 0.6) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color.replace('A', a)); g.addColorStop(1, color.replace('A', 0));
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // A drawn film frame. kind: golden | night | car | teal | diner | forest. zoom about focus (fx, fy) in 0..1.
  function scene(ctx, x, y, w, h, kind, seed = 0, { zoom = 1, fx = 0.5, fy = 0.5, r = 8, bars = true } = {}) {
    ctx.save(); rr(ctx, x, y, w, h, r); ctx.clip();
    ctx.translate(x + w * fx * (1 - zoom), y + h * fy * (1 - zoom)); ctx.scale(zoom, zoom);
    const s = rnd(seed + 1), s2 = rnd(seed + 7);
    if (kind === 'golden') {
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffcf7a'); g.addColorStop(0.55, '#ff7a6b'); g.addColorStop(1, '#7a2c5a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const sx = w * (0.55 + 0.3 * s), sy = h * 0.62;
      glow(ctx, sx, sy, h * 0.45, 'rgba(255,236,190,A)', 0.8);
      ctx.beginPath(); ctx.arc(sx, sy, h * 0.09, 0, 7); ctx.fillStyle = '#fff3d6'; ctx.fill();
      ctx.fillStyle = '#3a1830'; ctx.beginPath(); ctx.moveTo(0, h * 0.72);
      for (let i = 0; i <= 6; i++) ctx.lineTo(w * i / 6, h * (0.7 + 0.05 * rnd(seed * 3 + i)));
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
      figure(ctx, w * (0.2 + 0.25 * s2), h * 0.78, h * 0.34, '#24101e');
    } else if (kind === 'night' || kind === 'diner') {
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0c0f2e'); g.addColorStop(1, '#241238');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      if (kind === 'night') {
        for (let i = 0; i < 5; i++) {
          const bx = w * (i / 5) + w * 0.02, bw = w * 0.17, bh = h * (0.4 + 0.35 * rnd(seed + i * 5));
          ctx.fillStyle = '#100b22'; ctx.fillRect(bx, h * 0.78 - bh, bw, bh);
          for (let k = 0; k < 6; k++) {
            if (rnd(seed + i * 11 + k) < 0.5) continue;
            ctx.fillStyle = [C.pink, C.teal, C.gold][(i + k) % 3];
            ctx.globalAlpha = 0.85; ctx.fillRect(bx + bw * (0.18 + 0.4 * (k % 2)), h * 0.78 - bh + bh * (0.1 + 0.14 * Math.floor(k / 2)), bw * 0.22, bh * 0.07); ctx.globalAlpha = 1;
          }
        }
        glow(ctx, w * 0.3, h * 0.5, h * 0.5, 'rgba(255,95,162,A)', 0.35);
        glow(ctx, w * 0.75, h * 0.45, h * 0.45, 'rgba(79,216,196,A)', 0.3);
        ctx.fillStyle = '#0a0818'; ctx.fillRect(0, h * 0.78, w, h * 0.22);
        ctx.fillStyle = 'rgba(255,95,162,0.25)'; ctx.fillRect(w * 0.22, h * 0.8, w * 0.12, h * 0.18);
        ctx.fillStyle = 'rgba(79,216,196,0.22)'; ctx.fillRect(w * 0.68, h * 0.8, w * 0.1, h * 0.18);
        figure(ctx, w * (0.45 + 0.2 * s), h * 0.86, h * 0.36, '#05040c');
      } else {
        // diner: counter, stool, seated figure, neon sign, cup
        glow(ctx, w * 0.7, h * 0.26, h * 0.5, 'rgba(255,95,162,A)', 0.55);
        fillRR(ctx, w * 0.58, h * 0.18, w * 0.24, h * 0.14, h * 0.07, null, null);
        ctx.strokeStyle = C.pink; ctx.lineWidth = Math.max(2, h * 0.025); rr(ctx, w * 0.6, h * 0.19, w * 0.2, h * 0.12, h * 0.06); ctx.stroke();
        ctx.fillStyle = '#1a1030'; ctx.fillRect(0, h * 0.62, w, h * 0.38);
        ctx.fillStyle = '#3b2450'; ctx.fillRect(0, h * 0.6, w, h * 0.05);
        glow(ctx, w * 0.25, h * 0.4, h * 0.4, 'rgba(79,216,196,A)', 0.25);
        figure(ctx, w * 0.42, h * 0.66, h * 0.34, '#07050f');
        ctx.fillStyle = '#e9e2f0'; ctx.fillRect(w * 0.53, h * 0.56, w * 0.035, h * 0.045);
        ctx.strokeStyle = 'rgba(200,220,255,0.18)'; ctx.lineWidth = 1.2;
        for (let i = 0; i < 26; i++) { const rx = w * rnd(seed + i * 3), ry = h * rnd(seed + i * 5) * 0.6; ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - w * 0.01, ry + h * 0.08); ctx.stroke(); }
      }
    } else if (kind === 'car') {
      ctx.fillStyle = '#07060d'; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.beginPath(); ctx.moveTo(w * 0.08, h * 0.12); ctx.lineTo(w * 0.92, h * 0.12); ctx.lineTo(w * 0.98, h * 0.6); ctx.lineTo(w * 0.02, h * 0.6); ctx.closePath(); ctx.clip();
      ctx.fillStyle = '#141a3a'; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 9; i++) {
        const c = ['rgba(255,95,162,A)', 'rgba(232,182,76,A)', 'rgba(79,216,196,A)'][i % 3];
        glow(ctx, w * rnd(seed + i * 2.3), h * (0.25 + 0.3 * rnd(seed + i * 4.1)), h * (0.08 + 0.08 * rnd(i)), c, 0.8);
      }
      ctx.restore();
      ctx.fillStyle = '#0d0b18'; ctx.fillRect(0, h * 0.6, w, h * 0.4);
      ctx.fillStyle = 'rgba(79,216,196,0.5)'; ctx.fillRect(w * 0.5, h * 0.66, w * 0.12, h * 0.03);
      ctx.strokeStyle = '#1c1830'; ctx.lineWidth = h * 0.05; ctx.beginPath(); ctx.arc(w * 0.3, h * 0.92, h * 0.24, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      figure(ctx, w * (0.25 + 0.05 * s), h * 1.05, h * 0.62, '#030207');
    } else if (kind === 'teal') {
      const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#1b5a63'); g.addColorStop(1, '#0b2228');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const wx = w * (0.55 + 0.2 * s);
      ctx.fillStyle = '#ffc27a'; ctx.fillRect(wx, h * 0.18, w * 0.16, h * 0.36);
      ctx.fillStyle = 'rgba(255,170,90,0.22)'; ctx.beginPath(); ctx.moveTo(wx, h * 0.18); ctx.lineTo(wx + w * 0.16, h * 0.18); ctx.lineTo(wx - w * 0.05, h); ctx.lineTo(wx - w * 0.38, h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#0a1d22'; ctx.fillRect(0, h * 0.8, w, h * 0.2);
      figure(ctx, w * (0.3 + 0.12 * s2), h * 0.9, h * 0.5, '#081417');
      ctx.strokeStyle = 'rgba(255,190,120,0.7)'; ctx.lineWidth = Math.max(1.5, h * 0.012);
      ctx.beginPath(); ctx.arc(w * (0.3 + 0.12 * s2), h * 0.9 - h * 0.43, h * 0.06, -0.9, 0.9); ctx.stroke();
    } else if (kind === 'forest') {
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#a9c9b0'); g.addColorStop(1, '#3d5c4c');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (let layer = 0; layer < 3; layer++) {
        ctx.fillStyle = ['rgba(60,95,80,0.45)', 'rgba(38,66,55,0.7)', '#1d332a'][layer];
        for (let i = 0; i < 7; i++) {
          const tx = w * (i / 6) + w * 0.08 * (rnd(seed + layer * 9 + i) - 0.5), th = h * (0.5 + 0.25 * layer);
          ctx.beginPath(); ctx.moveTo(tx, h - th); ctx.lineTo(tx + w * 0.05, h); ctx.lineTo(tx - w * 0.05, h); ctx.closePath(); ctx.fill();
        }
      }
      figure(ctx, w * (0.55 + 0.2 * s), h * 0.95, h * 0.3, '#14241d');
    }
    ctx.restore();
    if (bars) { ctx.save(); rr(ctx, x, y, w, h, r); ctx.clip(); ctx.fillStyle = '#000'; ctx.fillRect(x, y, w, h * 0.07); ctx.fillRect(x, y + h * 0.93, w, h * 0.07); ctx.restore(); }
  }
  function searchBar(ctx, x, y, w, h, value, placeholder, t, focus) {
    fillRR(ctx, x, y, w, h, h / 2, C.bg, focus ? C.teal : C.line);
    ctx.strokeStyle = C.soft; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x + 30, y + h / 2 - 2, 9, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 37, y + h / 2 + 5); ctx.lineTo(x + 43, y + h / 2 + 11); ctx.stroke();
    if (value) {
      text(ctx, value, x + 58, y + h / 2, { size: 24, weight: 600 });
      ctx.font = `600 24px ${KIT.FONT}`;
      if (focus && blink(t)) { ctx.fillStyle = C.teal; ctx.fillRect(x + 60 + ctx.measureText(value).width, y + h / 2 - 13, 2.5, 26); }
    } else {
      text(ctx, placeholder, x + 58, y + h / 2, { size: 22, color: C.dim });
    }
  }
  function chip(ctx, x, y, label, { on = false, size = 18, h = 38 } = {}) {
    ctx.font = `600 ${size}px ${KIT.FONT}`; const w = ctx.measureText(label).width + 34;
    fillRR(ctx, x, y, w, h, h / 2, on ? C.pink : C.card2, on ? C.pink : C.line);
    text(ctx, label, x + w / 2, y + h / 2 + 0.5, { size, weight: 600, color: on ? C.bg : C.ink, align: 'center' });
    return w;
  }
  const pop = (t, a, d = 0.35) => ep(t, a, a + d, ease.outBack);
  function popIn(ctx, p, cx, cy, draw) {
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha *= clamp(p * 1.4); ctx.translate(cx, cy); const s = 0.85 + 0.15 * p; ctx.scale(s, s); ctx.translate(-cx, -cy); draw(); ctx.restore();
  }
  function grid(r, cols, rows, top, { pad = 30, gap = 14, aspect = 9 / 16, bottom = 22 } = {}) {
    let cw = (r.w - pad * 2 - gap * (cols - 1)) / cols, ch = cw * aspect;
    const avail = r.y + r.h - bottom - top;
    if (ch * rows + gap * (rows - 1) > avail) { ch = (avail - gap * (rows - 1)) / rows; cw = ch / aspect; }
    const gw = cw * cols + gap * (cols - 1), x0 = r.x + (r.w - gw) / 2;
    const cells = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) cells.push({ x: x0 + i * (cw + gap), y: top + j * (ch + gap), w: cw, h: ch });
    return cells;
  }
  const BW = { w: 880, h: 500 };

  // ---------- 1. StillsLab: search an idea, frames fill in, one shows its lens and palette ----------
  DEMOS['ref-stillslab'] = {
    cycle: 6.5, posterAt: 3.6,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = browser(ctx, W, H, { ...BW, url: 'stillslab.com' });
      clipTo(ctx, r, 0);
      const out = ep(t, 5.6, 6.2);
      const q = typed('golden hour', seg(t, 0.4, 1.4) - seg(t, 5.6, 6.1));
      searchBar(ctx, r.x + 30, r.y + 22, r.w - 60, 56, q, 'Search an idea...', t, t > 0.2 && t < 6.1);
      const cells = grid(r, 4, 2, r.y + 100);
      cells.forEach((c, i) => {
        const p = pop(t, 1.6 + i * 0.07) * (1 - out);
        popIn(ctx, p, c.x + c.w / 2, c.y + c.h / 2, () => scene(ctx, c.x, c.y, c.w, c.h, 'golden', i * 3 + 1, [{}, { zoom: 1.7, fx: 0.4, fy: 0.75 }, { zoom: 1.3, fx: 0.8, fy: 0.6 }, { zoom: 2.4, fx: 0.3, fy: 0.7 }][(i * 3) % 4]));
      });
      // one frame gets its details
      const d = ep(t, 2.8, 3.2, ease.out) * (1 - ep(t, 5.0, 5.4));
      if (d > 0) {
        const c = cells[1];
        ctx.save(); ctx.globalAlpha = d;
        ctx.lineWidth = 4; ctx.strokeStyle = C.pink; rr(ctx, c.x - 2, c.y - 2, c.w + 4, c.h + 4, 10); ctx.stroke();
        const bx = c.x + c.w * 0.1, by = c.y + c.h + 10 - 8 * (1 - d), bw = 330, bh = 112;
        shadow(ctx, 24, 10); fillRR(ctx, bx, by, bw, bh, 14, C.card2); noShadow(ctx); fillRR(ctx, bx, by, bw, bh, 14, null, C.line);
        text(ctx, 'Lens  35mm', bx + 20, by + 28, { size: 20, weight: 700 });
        text(ctx, 'Wide shot  ·  warm light', bx + 20, by + 58, { size: 18, color: C.soft });
        ['#ffcf7a', '#ff7a6b', '#7a2c5a', '#3a1830'].forEach((col, k) => fillRR(ctx, bx + 20 + k * 52, by + 78, 44, 22, 6, col));
        ctx.restore();
      }
      ctx.restore();
    },
  };

  // ---------- 2. Shot.Cafe: stack two tags, the grid narrows ----------
  DEMOS['ref-shot-cafe'] = {
    cycle: 7, posterAt: 4.2,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = browser(ctx, W, H, { ...BW, url: 'shot.cafe' });
      clipTo(ctx, r, 0);
      const reset = ep(t, 5.8, 6.4);
      const on1 = t > 1.25 && t < 6.0, on2 = t > 2.75 && t < 6.0;
      const tags = ['night', 'car interior', 'daylight', 'rain'];
      let x = r.x + 30; const pos = [];
      tags.forEach((s, i) => { const w = chip(ctx, x, r.y + 24, s, { on: (i === 0 && on1) || (i === 1 && on2), size: 20, h: 44 }); pos.push([x + w / 2, r.y + 46]); x += w + 12; });
      const count = on2 ? '38 shots' : on1 ? '386 shots' : '24,321 shots';
      text(ctx, count, r.x + r.w - 30, r.y + 46, { size: 20, weight: 700, color: C.gold, align: 'right' });
      const kinds = ['golden', 'night', 'car', 'teal', 'diner', 'forest', 'car', 'golden', 'night', 'forest', 'car', 'teal'];
      const cells = grid(r, 4, 3, r.y + 96, { gap: 10 });
      const cars = [2, 6, 10];
      const big = grid(r, 3, 1, r.y + 150, { gap: 18, pad: 40 });
      const f1 = ep(t, 1.3, 1.7) * (1 - reset), f2 = ep(t, 2.8, 3.2) * (1 - reset), mv = ep(t, 3.3, 3.9) * (1 - ep(t, 5.6, 6.2));
      kinds.forEach((k, i) => {
        const night = ['night', 'car', 'diner'].includes(k), car = k === 'car';
        let a = 1;
        if (!night) a -= 0.9 * f1;
        if (night && !car) a -= 0.9 * f2;
        if (!car) a *= 1 - mv;
        let c = cells[i];
        if (car) { const b = big[cars.indexOf(i)]; c = { x: lerp(c.x, b.x, mv), y: lerp(c.y, b.y, mv), w: lerp(c.w, b.w, mv), h: lerp(c.h, b.h, mv) }; }
        if (a <= 0.01) return;
        ctx.save(); ctx.globalAlpha = a; scene(ctx, c.x, c.y, c.w, c.h, k, i + 2); ctx.restore();
      });
      ctx.restore();
      const [cx, cy] = path(t, [[0, r.x + r.w - 80, r.y + r.h - 40], [1.1, pos[0][0] + 8, pos[0][1] + 6], [1.5, pos[0][0] + 8, pos[0][1] + 6], [2.6, pos[1][0] + 8, pos[1][1] + 6], [3.1, pos[1][0] + 8, pos[1][1] + 6], [4.0, r.x + r.w - 140, r.y + r.h - 60], [6.9, r.x + r.w - 80, r.y + r.h - 40]]);
      const press = Math.max(ep(t, 1.15, 1.25) - ep(t, 1.25, 1.4), ep(t, 2.65, 2.75) - ep(t, 2.75, 2.9));
      cursor(ctx, cx, cy, { press, ring: t < 2 ? seg(t, 1.25, 1.65) : seg(t, 2.75, 3.15) });
    },
  };

  // ---------- 3. FilmGrab: one film's frames scroll by, the style formula writes itself ----------
  DEMOS['ref-filmgrab'] = {
    cycle: 7, posterAt: 3.4,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = browser(ctx, W, H, { ...BW, url: 'film-grab.com' });
      clipTo(ctx, r, 0);
      text(ctx, 'One film, frame by frame', r.x + 30, r.y + 40, { size: 28, weight: 800 });
      const fw = 236, fh = 133, gap = 16, n = 4, period = n * (fw + gap);
      const off = (t / 7) * period;
      const shots = [{ zoom: 1 }, { zoom: 1.8, fx: 0.35, fy: 0.45 }, { zoom: 1.2, fx: 0.7, fy: 0.4 }, { zoom: 2.6, fx: 0.38, fy: 0.42 }];
      for (let i = -1; i < 6; i++) {
        const k = ((i % n) + n) % n, x = r.x + 30 + i * (fw + gap) - (off % period) + (Math.floor(off / period) * 0);
        scene(ctx, x, r.y + 76, fw, fh, 'teal', k + 4, { ...shots[k] });
      }
      // style formula card
      const cx = r.x + 30, cy = r.y + 232, cw = r.w - 60, ch = 176;
      fillRR(ctx, cx, cy, cw, ch, 16, C.card2, C.line);
      text(ctx, 'STYLE FORMULA', cx + 24, cy + 30, { size: 16, weight: 700, color: C.teal });
      const items = [['Teal shadows', '#1b5a63'], ['Warm window light', '#ffc27a'], ['Lonely wide shots', '#0b2228']];
      const out = ep(t, 5.9, 6.5);
      items.forEach(([s, col], i) => {
        const p = ep(t, 1.0 + i * 0.8, 1.4 + i * 0.8, ease.out) * (1 - out);
        if (p <= 0) return;
        ctx.save(); ctx.globalAlpha = p;
        const y = cy + 66 + i * 38;
        fillRR(ctx, cx + 24, y - 12, 24, 24, 6, col, 'rgba(255,255,255,0.25)');
        text(ctx, s, cx + 62 + (1 - p) * 20, y, { size: 22, weight: 600 });
        ctx.restore();
      });
      ctx.restore();
    },
  };

  // ---------- 4. Screenmusings: a whole scene in order, wide to detail ----------
  const SHOTS = [['WIDE', { zoom: 1 }], ['MEDIUM', { zoom: 1.9, fx: 0.42, fy: 0.5 }], ['CLOSE', { zoom: 3.6, fx: 0.42, fy: 0.42 }], ['DETAIL', { zoom: 5, fx: 0.545, fy: 0.58 }]];
  DEMOS['ref-screenmusings'] = {
    cycle: 7.2, posterAt: 1.0,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = browser(ctx, W, H, { ...BW, url: 'screenmusings.org' });
      clipTo(ctx, r, 0);
      const cur = Math.min(3, Math.floor(t / 1.8)), local = (t - cur * 1.8) / 1.8;
      const vw = 456, vh = 256, vx = r.x + (r.w - vw) / 2, vy = r.y + 18;
      scene(ctx, vx, vy, vw, vh, 'diner', 3, { ...SHOTS[cur][1], r: 12 });
      text(ctx, `${cur + 1} / 4`, vx + vw - 14, vy + vh - 30, { size: 18, weight: 700, align: 'right', color: C.white });
      const tw = 176, th = 99, gap = 18, sx = r.x + (r.w - (tw * 4 + gap * 3)) / 2, sy = vy + vh + 22;
      SHOTS.forEach(([label, z], i) => {
        const x = sx + i * (tw + gap);
        ctx.save(); ctx.globalAlpha = i === cur ? 1 : 0.55; scene(ctx, x, sy, tw, th, 'diner', 3, { ...z, bars: false }); ctx.restore();
        if (i === cur) { ctx.lineWidth = 3.5; ctx.strokeStyle = C.pink; rr(ctx, x - 2, sy - 2, tw + 4, th + 4, 10); ctx.stroke(); fillRR(ctx, x, sy + th + 34, tw * local, 4, 2, C.pink); }
        text(ctx, label, x + tw / 2, sy + th + 20, { size: 17, weight: 700, color: i === cur ? C.ink : C.soft, align: 'center' });
        if (i < 3) text(ctx, '›', x + tw + gap / 2, sy + th / 2, { size: 26, weight: 700, color: C.dim, align: 'center' });
      });
      ctx.restore();
    },
  };

  // ---------- 5. Flim: describe it in a sentence, matching frames appear ----------
  DEMOS['ref-flim'] = {
    cycle: 7, posterAt: 4.0,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = browser(ctx, W, H, { ...BW, url: 'flim.ai' });
      clipTo(ctx, r, 0);
      const out = ep(t, 5.9, 6.6);
      const sentence = 'a lonely diner at night, neon through rain';
      const q = typed(sentence, seg(t, 0.3, 2.1) - seg(t, 6.0, 6.7));
      searchBar(ctx, r.x + 30, r.y + 22, r.w - 60, 56, q, 'Describe a look...', t, t > 0.15 && t < 6.7);
      // thinking dots
      const think = seg(t, 2.2, 2.7) > 0 && t < 2.75;
      if (think) for (let i = 0; i < 3; i++) { const a = 0.3 + 0.7 * Math.abs(Math.sin((t * 6 + i) * 1.2)); ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(r.x + r.w / 2 - 24 + i * 24, r.y + 200, 8, 0, 7); ctx.fillStyle = C.teal; ctx.fill(); ctx.globalAlpha = 1; }
      const cells = grid(r, 4, 2, r.y + 100);
      const kinds = ['diner', 'night', 'diner', 'car', 'night', 'diner', 'car', 'night'];
      cells.forEach((c, i) => {
        const p = pop(t, 2.75 + i * 0.07) * (1 - out);
        popIn(ctx, p, c.x + c.w / 2, c.y + c.h / 2, () => scene(ctx, c.x, c.y, c.w, c.h, kinds[i], i * 5 + 2, i % 3 === 1 ? { zoom: 1.5, fx: 0.45, fy: 0.55 } : {}));
      });
      ctx.restore();
    },
  };

  // ---------- 6. Film Vibes: a clip opens and plays a camera move ----------
  DEMOS['ref-film-vibes'] = {
    cycle: 7, posterAt: 3.2,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = browser(ctx, W, H, { ...BW, url: 'filmvibes.io' });
      clipTo(ctx, r, 0);
      const tiles = grid(r, 3, 1, r.y + 120, { gap: 18 });
      const kinds = ['golden', 'night', 'teal'];
      const open = ep(t, 1.0, 1.5) * (1 - ep(t, 5.2, 5.7));
      const bigR = { x: r.x + 60, y: r.y + 22, w: r.w - 120, h: (r.w - 120) * 9 / 16 * 0.8 };
      bigR.w = bigR.h * 16 / 9; bigR.x = r.x + (r.w - bigR.w) / 2;
      kinds.forEach((k, i) => {
        if (i === 1) return;
        ctx.save(); ctx.globalAlpha = 1 - 0.85 * open; scene(ctx, tiles[i].x, tiles[i].y, tiles[i].w, tiles[i].h, k, i + 9); ctx.restore();
      });
      const a = tiles[1];
      const c = { x: lerp(a.x, bigR.x, open), y: lerp(a.y, bigR.y, open), w: lerp(a.w, bigR.w, open), h: lerp(a.h, bigR.h, open) };
      const play = seg(t, 1.5, 5.0);
      const zoom = 1 + 0.9 * ease.inOut(play) * (open > 0.99 ? 1 : open);
      shadow(ctx, 30, 12); fillRR(ctx, c.x, c.y, c.w, c.h, 10, '#000'); noShadow(ctx);
      scene(ctx, c.x, c.y, c.w, c.h, 'night', 10, { zoom, fx: 0.62, fy: 0.62, r: 10 });
      // play badge or scrubber
      if (open < 0.5) {
        ctx.beginPath(); ctx.arc(c.x + c.w / 2, c.y + c.h / 2, 24, 0, 7); ctx.fillStyle = 'rgba(18,16,22,0.7)'; ctx.fill();
        ctx.beginPath(); ctx.moveTo(c.x + c.w / 2 - 7, c.y + c.h / 2 - 11); ctx.lineTo(c.x + c.w / 2 + 12, c.y + c.h / 2); ctx.lineTo(c.x + c.w / 2 - 7, c.y + c.h / 2 + 11); ctx.closePath(); ctx.fillStyle = C.white; ctx.fill();
      } else {
        ctx.save(); ctx.globalAlpha = seg(open, 0.5, 1);
        fillRR(ctx, c.x + 20, c.y + c.h - 22, c.w - 40, 6, 3, 'rgba(255,255,255,0.25)');
        fillRR(ctx, c.x + 20, c.y + c.h - 22, (c.w - 40) * play, 6, 3, C.pink);
        ctx.restore();
      }
      const lab = ep(t, 1.8, 2.2, ease.outBack) * (1 - ep(t, 5.0, 5.3));
      if (lab > 0) popIn(ctx, lab, r.x + r.w / 2, bigR.y + bigR.h + 34, () => {
        ctx.font = `700 22px ${KIT.FONT}`; const w = ctx.measureText('Clip: slow push in').width + 40;
        fillRR(ctx, r.x + (r.w - w) / 2, bigR.y + bigR.h + 14, w, 42, 21, C.card2, C.pink);
        text(ctx, 'Clip: slow push in', r.x + r.w / 2, bigR.y + bigR.h + 35.5, { size: 22, weight: 700, align: 'center' });
      });
      ctx.restore();
      const [cx, cy] = path(t, [[0, r.x + r.w - 90, r.y + r.h - 30], [0.8, a.x + a.w / 2 + 10, a.y + a.h / 2 + 12], [1.2, a.x + a.w / 2 + 10, a.y + a.h / 2 + 12], [2.0, r.x + r.w - 60, r.y + r.h - 20], [6.9, r.x + r.w - 90, r.y + r.h - 30]]);
      cursor(ctx, cx, cy, { press: ep(t, 0.85, 0.95) - ep(t, 0.95, 1.1), ring: seg(t, 0.95, 1.35) });
    },
  };

  // ---------- 7. MovieStillsDB: a behind-the-scenes photo, the setup gets labelled ----------
  DEMOS['ref-moviestillsdb'] = {
    cycle: 6.5, posterAt: 3.8,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = browser(ctx, W, H, { ...BW, url: 'moviestillsdb.com' });
      clipTo(ctx, r, 0);
      const px = r.x + 40, py = r.y + 22, pw = r.w - 80, ph = r.h - 44;
      ctx.save(); rr(ctx, px, py, pw, ph, 12); ctx.clip();
      const g = ctx.createLinearGradient(0, py, 0, py + ph); g.addColorStop(0, '#3a3140'); g.addColorStop(1, '#221c28'); ctx.fillStyle = g; ctx.fillRect(px, py, pw, ph);
      // set wall (the part the audience sees) and floor
      fillRR(ctx, px + pw * 0.3, py + ph * 0.12, pw * 0.42, ph * 0.62, 4, '#5a4a5e');
      fillRR(ctx, px + pw * 0.46, py + ph * 0.22, pw * 0.1, ph * 0.22, 3, '#c9a77a');
      ctx.fillStyle = '#17121b'; ctx.fillRect(px, py + ph * 0.74, pw, ph * 0.26);
      // key light on a stand, with its beam
      const on = ep(t, 0.9, 1.3) * (1 - ep(t, 5.6, 6.1));
      const lx = px + pw * 0.14, ly = py + ph * 0.3;
      ctx.save(); ctx.globalAlpha = 0.15 + 0.35 * on; ctx.fillStyle = '#ffe2a8';
      ctx.beginPath(); ctx.moveTo(lx + 30, ly - 22); ctx.lineTo(lx + 30, ly + 22); ctx.lineTo(px + pw * 0.52, py + ph * 0.8); ctx.lineTo(px + pw * 0.56, py + ph * 0.2); ctx.closePath(); ctx.fill(); ctx.restore();
      ctx.strokeStyle = '#0d0a10'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, py + ph * 0.88); ctx.moveTo(lx - 26, py + ph * 0.88); ctx.lineTo(lx, py + ph * 0.8); ctx.lineTo(lx + 26, py + ph * 0.88); ctx.stroke();
      fillRR(ctx, lx - 8, ly - 30, 40, 60, 6, on > 0.5 ? '#fff3d6' : '#8a8090');
      // actor
      figure(ctx, px + pw * 0.5, py + ph * 0.8, ph * 0.46, '#0f0b12');
      // camera on tripod
      const kx = px + pw * 0.84, ky = py + ph * 0.46;
      ctx.beginPath(); ctx.moveTo(kx, ky + 20); ctx.lineTo(kx - 30, py + ph * 0.9); ctx.moveTo(kx, ky + 20); ctx.lineTo(kx + 30, py + ph * 0.9); ctx.moveTo(kx, ky + 20); ctx.lineTo(kx, py + ph * 0.9); ctx.stroke();
      fillRR(ctx, kx - 34, ky - 18, 62, 40, 6, '#0d0a10'); fillRR(ctx, kx - 58, ky - 8, 26, 20, 4, '#0d0a10');
      // warm, slightly faded photo grade
      ctx.fillStyle = 'rgba(232,182,76,0.08)'; ctx.fillRect(px, py, pw, ph);
      ctx.restore();
      const labels = [['Key light', lx + 10, ly - 30, lx + 10, py + 40, 1.4], ['Camera', kx - 4, ky - 18, kx - 4, py + 40, 2.2], ['The set', px + pw * 0.51, py + ph * 0.12, px + pw * 0.51, py + 40, 3.0]];
      const out = ep(t, 5.4, 5.9);
      labels.forEach(([s, ax, ay, bx, by, at]) => {
        const p = pop(t, at) * (1 - out);
        if (p <= 0) return;
        ctx.save(); ctx.globalAlpha = clamp(p);
        ctx.strokeStyle = C.pink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by + 18); ctx.stroke();
        ctx.beginPath(); ctx.arc(ax, ay, 6, 0, 7); ctx.fillStyle = C.pink; ctx.fill();
        ctx.font = `700 20px ${KIT.FONT}`; const w = ctx.measureText(s).width + 30;
        fillRR(ctx, bx - w / 2, by - 4, w, 40, 20, C.pink);
        text(ctx, s, bx, by + 16.5, { size: 20, weight: 700, color: C.bg, align: 'center' });
        ctx.restore();
      });
      ctx.restore();
    },
  };

  // ---------- 8. The method: Find, Name, Prompt ----------
  DEMOS['ref-method'] = {
    cycle: 10, posterAt: 9.0,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const steps = ['1  Find it', '2  Name it', '3  Prompt it'];
      const phase = t < 2.8 ? 0 : t < 5.6 ? 1 : 2;
      let sx = 140;
      steps.forEach((s, i) => {
        ctx.font = `700 22px ${KIT.FONT}`; const w = ctx.measureText(s).width + 44;
        const active = i === phase && t < 9.3;
        fillRR(ctx, sx, 28, w, 46, 23, active ? C.pink : C.card, active ? C.pink : C.line);
        text(ctx, s, sx + w / 2, 51.5, { size: 22, weight: 700, color: active ? C.bg : C.soft, align: 'center' });
        sx += w + 30;
      });
      const out = ep(t, 9.3, 9.9);
      // the frame: big in Find, moves left in Name and Prompt
      const fIn = ep(t, 0.3, 0.8, ease.out) * (1 - out);
      const mv = ep(t, 2.8, 3.4);
      const fw = lerp(560, 380, mv), fh = fw * 9 / 16, fx = lerp((W - 560) / 2, 70, mv), fy = lerp(110, 108, mv);
      if (fIn > 0) popIn(ctx, fIn, fx + fw / 2, fy + fh / 2, () => { shadow(ctx, 30, 12); fillRR(ctx, fx, fy, fw, fh, 12, '#000'); noShadow(ctx); scene(ctx, fx, fy, fw, fh, 'night', 21, { zoom: 1.25, fx: 0.55, fy: 0.95, r: 12 }); });
      if (t > 0.9 && t < 2.8) { const p = ep(t, 1.0, 1.4) * (1 - ep(t, 2.5, 2.8)); ctx.globalAlpha = p; text(ctx, 'A real film frame', W / 2, 110 + 315 + 30, { size: 24, weight: 600, color: C.soft, align: 'center' }); ctx.globalAlpha = 1; }
      // keyword chips with picks
      const words = ['Low angle', 'Neon light', 'Rain'];
      words.forEach((s, i) => {
        const p = pop(t, 3.3 + i * 0.25) * (1 - out);
        if (p <= 0) return;
        const picked = t > 3.9 + i * 0.45 && t < 9.4;
        const y = 130 + i * 64;
        popIn(ctx, p, 600, y + 24, () => {
          fillRR(ctx, 490, y, 380, 50, 14, C.card, picked ? C.pink : C.line);
          text(ctx, s, 512, y + 25.5, { size: 22, weight: 700 });
          fillRR(ctx, 760, y + 10, 94, 30, 15, picked ? C.pink : C.bg, picked ? C.pink : C.line);
          text(ctx, picked ? 'Picked' : '+ Pick', 807, y + 25.5, { size: 15, weight: 700, color: picked ? C.bg : C.soft, align: 'center' });
        });
      });
      // the prompt
      const pIn = ep(t, 5.6, 6.0, ease.out) * (1 - out);
      if (pIn > 0) {
        ctx.save(); ctx.globalAlpha = pIn;
        const bx = 70, by = 350 + (1 - pIn) * 16, bw = 800, bh = 140;
        fillRR(ctx, bx, by, bw, bh, 16, C.card, C.teal);
        text(ctx, 'YOUR PROMPT', bx + 24, by + 28, { size: 15, weight: 700, color: C.teal });
        const line = 'A tiny robot waits at a bus stop, low angle, neon light, rain.';
        const s = typed(line, seg(t, 6.1, 8.2));
        const cut = 38; const a = s.slice(0, cut), b = s.slice(cut);
        text(ctx, a, bx + 24, by + 66, { size: 25, weight: 600 });
        text(ctx, b, bx + 24, by + 104, { size: 25, weight: 600 });
        ctx.restore();
      }
    },
  };

  // ---------- 9 and 10. Small loops beside "See it in real films" on keyword pages ----------
  DEMOS['ref-see-still'] = {
    cycle: 5, posterAt: 2.2,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      text(ctx, 'See it in real films', W / 2, 78, { size: 44, weight: 800, align: 'center' });
      const kinds = ['golden', 'night', 'teal'];
      const fw = 270, fh = 152, gap = 26, x0 = (W - (fw * 3 + gap * 2)) / 2, y0 = 170;
      const lx = lerp(x0 - 60, x0 + fw * 3 + gap * 2 + 60, ep(t, 0.4, 4.2));
      kinds.forEach((k, i) => {
        const x = x0 + i * (fw + gap), lit = ep(t, 0.6 + i * 1.1, 1.0 + i * 1.1) * (1 - ep(t, 4.3, 4.9));
        ctx.save(); ctx.globalAlpha = 0.35 + 0.65 * lit; scene(ctx, x, y0, fw, fh, k, i + 30, { r: 12 }); ctx.restore();
        if (lit > 0) { ctx.save(); ctx.globalAlpha = lit; ctx.lineWidth = 4; ctx.strokeStyle = C.pink; rr(ctx, x - 3, y0 - 3, fw + 6, fh + 6, 14); ctx.stroke(); ctx.restore(); }
      });
      // magnifier sweeping across
      const my = y0 + fh / 2;
      ctx.lineWidth = 9; ctx.strokeStyle = C.teal; ctx.beginPath(); ctx.arc(lx, my, 48, 0, 7); ctx.stroke();
      ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(lx + 36, my + 36); ctx.lineTo(lx + 74, my + 74); ctx.stroke(); ctx.lineCap = 'butt';
      text(ctx, 'Free real frames to study', W / 2, 420, { size: 28, weight: 600, color: C.soft, align: 'center' });
    },
  };
  DEMOS['ref-see-motion'] = {
    cycle: 5, posterAt: 2.5,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      text(ctx, 'See the move in a clip', W / 2, 78, { size: 44, weight: 800, align: 'center' });
      // film strip scrolling left, frames push in one after another
      const fw = 230, fh = 130, gap = 22, period = 4 * (fw + gap), off = (t / 5) * period;
      const sy = 165;
      ctx.fillStyle = '#0b090e'; ctx.fillRect(0, sy - 34, W, fh + 68);
      for (let i = 0; i < 40; i++) { const hx = ((i * 48 - off * 1) % (W + 48) + W + 48) % (W + 48) - 24; fillRR(ctx, hx, sy - 24, 22, 14, 3, C.card2); fillRR(ctx, hx, sy + fh + 10, 22, 14, 3, C.card2); }
      for (let i = -1; i < 9; i++) {
        const k = ((i % 4) + 4) % 4, x = 40 + i * (fw + gap) - (off % period);
        scene(ctx, x, sy, fw, fh, 'golden', 40, { zoom: 1 + k * 0.35, fx: 0.33, fy: 0.62, r: 6, bars: false });
      }
      // play badge
      ctx.beginPath(); ctx.arc(W / 2, sy + fh / 2, 40, 0, 7); ctx.fillStyle = 'rgba(18,16,22,0.75)'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(W / 2 - 12, sy + fh / 2 - 18); ctx.lineTo(W / 2 + 20, sy + fh / 2); ctx.lineTo(W / 2 - 12, sy + fh / 2 + 18); ctx.closePath(); ctx.fillStyle = C.pink; ctx.fill();
      text(ctx, 'A still can’t show movement', W / 2, 420, { size: 28, weight: 600, color: C.soft, align: 'center' });
    },
  };
})();
