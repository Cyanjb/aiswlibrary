/* Group ui-b: twelve UI component demos. Each is a pure function of t and loops seamlessly. */
(function () {
  const { C, FONT, clamp, lerp, seg, ease, ep, rnd, rr, fillRR, text, lines, shadow, noShadow, backdrop, browser, phone, clipTo, cursor, finger, path, picture, button } = KIT;

  /* ---------- local helpers ---------- */
  const TAU = Math.PI * 2;
  function circ(ctx, x, y, r, fill, stroke, lw = 2) {
    ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  }
  // a quick press pulse around a click time: 0 -> 1 -> 0
  const pulse = (t, at) => ep(t, at - 0.1, at) - ep(t, at, at + 0.15);
  const pressOf = (t, times) => times.reduce((m, a) => Math.max(m, pulse(t, a)), 0);
  const ringOf = (t, times) => { for (const a of times) { const s = seg(t, a, a + 0.4); if (s > 0 && s < 1) return s; } return 0; };
  // a check mark drawn progressively (p 0..1), centred on x,y, size s
  function check(ctx, x, y, s, p, color, lw) {
    if (p <= 0) return;
    const pts = [[-0.42, 0.02], [-0.12, 0.32], [0.45, -0.3]];
    const l1 = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]), l2 = Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]);
    const d = p * (l1 + l2);
    ctx.beginPath(); ctx.moveTo(x + pts[0][0] * s, y + pts[0][1] * s);
    if (d <= l1) { const k = d / l1; ctx.lineTo(x + lerp(pts[0][0], pts[1][0], k) * s, y + lerp(pts[0][1], pts[1][1], k) * s); }
    else { const k = (d - l1) / l2; ctx.lineTo(x + pts[1][0] * s, y + pts[1][1] * s); ctx.lineTo(x + lerp(pts[1][0], pts[2][0], k) * s, y + lerp(pts[1][1], pts[2][1], k) * s); }
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.lineCap = 'butt';
  }
  function chevron(ctx, x, y, s, dir, color, lw = 3) {
    ctx.beginPath(); ctx.moveTo(x - dir * s * 0.4, y - s); ctx.lineTo(x + dir * s * 0.4, y); ctx.lineTo(x - dir * s * 0.4, y + s);
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.lineCap = 'butt';
  }
  function plusSign(ctx, x, y, s, color, lw) {
    ctx.beginPath(); ctx.moveTo(x - s, y); ctx.lineTo(x + s, y); ctx.moveTo(x, y - s); ctx.lineTo(x, y + s);
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineCap = 'butt';
  }
  function measure(ctx, s, size, weight) { ctx.font = `${weight} ${size}px ${FONT}`; return ctx.measureText(s).width; }
  const big = (ctx, W, H, url) => browser(ctx, W, H, { w: 860, h: 490, url });

  /* ---------- 1. range slider ---------- */
  DEMOS['range-slider'] = {
    cycle: 5, posterAt: 2.3,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = big(ctx, W, H);
      clipTo(ctx, r, 0);
      // value: rests at 25, dragged to 85, held, dragged back
      const v = lerp(25, 85, ep(t, 0.95, 1.85)) - 60 * ep(t, 2.95, 3.75);
      text(ctx, 'Brightness', r.x + 60, r.y + 46, { size: 30, weight: 800 });
      text(ctx, 'Drag to adjust your photo', r.x + 60, r.y + 80, { size: 17, color: C.soft });
      // preview picture that brightens with the value
      const px = r.x + 60, py = r.y + 110, pw = r.w - 120, ph = 170;
      picture(ctx, px, py, pw, ph, 2, 14);
      fillRR(ctx, px, py, pw, ph, 14, `rgba(8,6,12,${0.82 * (1 - v / 100)})`);
      // track
      const x0 = r.x + 90, x1 = r.x + r.w - 90, ty = r.y + 375;
      const kx = lerp(x0, x1, v / 100);
      fillRR(ctx, x0, ty - 8, x1 - x0, 16, 8, C.card2);
      const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, C.violet); g.addColorStop(1, C.pink);
      fillRR(ctx, x0, ty - 8, kx - x0, 16, 8, g);
      // grabbed state: from press at 0.85 to release at 3.85
      const held = ep(t, 0.8, 0.95) - ep(t, 3.8, 3.95);
      circ(ctx, kx, ty, 26 + held * 12, `rgba(255,95,162,${0.22 * held})`);
      shadow(ctx, 14, 4); circ(ctx, kx, ty, 24, C.white); noShadow(ctx);
      circ(ctx, kx, ty, 24, null, C.pink, 5);
      // value bubble
      const bs = 1 + held * 0.15, bw = 76 * bs, bh = 44 * bs, by = ty - 46 - bh - held * 6;
      ctx.beginPath(); ctx.moveTo(kx - 9, by + bh - 1); ctx.lineTo(kx, by + bh + 10); ctx.lineTo(kx + 9, by + bh - 1); ctx.closePath(); ctx.fillStyle = C.pink; ctx.fill();
      fillRR(ctx, kx - bw / 2, by, bw, bh, 12, C.pink);
      text(ctx, String(Math.round(v)), kx, by + bh / 2 + 1, { size: 24 * bs, weight: 800, color: C.bg, align: 'center' });
      ctx.restore();
      const rest = [r.x + r.w - 170, r.y + r.h - 20], k25 = lerp(x0, x1, 0.25);
      let cx, cy;
      if (t < 0.8) [cx, cy] = path(t, [[0, rest[0], rest[1]], [0.75, k25, ty]]);
      else if (t < 3.9) { cx = kx; cy = ty; }
      else [cx, cy] = path(t, [[3.9, k25, ty], [4.8, rest[0], rest[1]]]);
      cursor(ctx, cx, cy, { press: held });
    },
  };

  /* ---------- 2. stepper buttons ---------- */
  DEMOS['stepper-buttons'] = {
    cycle: 5.5, posterAt: 2.4,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = big(ctx, W, H);
      clipTo(ctx, r, 0);
      const plusT = [1.0, 1.45, 1.9], minusT = [3.2, 3.6, 4.0];
      const changes = plusT.map(a => [a, 1]).concat(minusT.map(a => [a, -1]));
      let n = 1, last = -9;
      for (const [a, d] of changes) if (t >= a) { n += d; last = a; }
      const pop = last > 0 ? 1 + 0.28 * (1 - ep(t, last, last + 0.32, ease.out)) : 1;
      text(ctx, 'Tickets', r.x + 60, r.y + 46, { size: 30, weight: 800 });
      text(ctx, 'How many seats do you need?', r.x + 60, r.y + 80, { size: 17, color: C.soft });
      const cx = r.x + r.w / 2, cy = r.y + 215;
      shadow(ctx, 30, 12); fillRR(ctx, cx - 280, cy - 80, 560, 160, 80, C.card2); noShadow(ctx);
      fillRR(ctx, cx - 280, cy - 80, 560, 160, 80, null, C.line);
      const pm = pressOf(t, minusT), pp = pressOf(t, plusT);
      const mx = cx - 190, qx = cx + 190;
      const ms = 1 - pm * 0.1, ps = 1 - pp * 0.1;
      circ(ctx, mx, cy, 54 * ms, C.card, C.soft, 3);
      ctx.beginPath(); ctx.moveTo(mx - 20 * ms, cy); ctx.lineTo(mx + 20 * ms, cy); ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineCap = 'butt';
      shadow(ctx, 16, 6, 'rgba(255,95,162,0.35)'); circ(ctx, qx, cy, 54 * ps, C.pink); noShadow(ctx);
      plusSign(ctx, qx, cy, 20 * ps, C.bg, 6);
      ctx.save(); ctx.translate(cx, cy + 3); ctx.scale(pop, pop);
      text(ctx, String(n), 0, 0, { size: 84, weight: 800, align: 'center', color: pop > 1.02 ? C.pink : C.ink });
      ctx.restore();
      // seat chips reinforce the count
      const sw = 70, gap = 18, rowW = 4 * sw + 3 * gap, sx = cx - rowW / 2, sy = r.y + 345;
      for (let i = 0; i < 4; i++) {
        let s = 1;
        if (i > 0) { const a = plusT[i - 1], b = minusT[3 - i]; s = t < b ? ep(t, a, a + 0.35, ease.outBack) : 1 - ep(t, b, b + 0.25); }
        fillRR(ctx, sx + i * (sw + gap), sy, sw, 56, 14, null, C.line);
        if (s > 0.01) {
          const w = sw * s, h = 56 * s;
          fillRR(ctx, sx + i * (sw + gap) + (sw - w) / 2, sy + (56 - h) / 2, w, h, 14 * s, C.teal);
        }
      }
      ctx.restore();
      const rest = [r.x + r.w - 120, r.y + r.h - 30];
      const [px, py] = path(t, [[0, rest[0], rest[1]], [0.85, qx + 10, cy + 8], [2.3, qx + 10, cy + 8], [2.95, mx + 10, cy + 8], [4.25, mx + 10, cy + 8], [5.3, rest[0], rest[1]]]);
      cursor(ctx, px, py, { press: Math.max(pm, pp), ring: ringOf(t, plusT.concat(minusT)) });
    },
  };

  /* ---------- 3. pagination ---------- */
  DEMOS['pagination'] = {
    cycle: 6, posterAt: 2.0,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = big(ctx, W, H);
      clipTo(ctx, r, 0);
      const clicks = [[0.95, 2, 6], [1.75, 3, 6], [2.55, 4, 6], [4.35, 1, 1]]; // [time, new page, button index]
      let pos = 1, page = 1, prev = 1, lastT = -9;
      for (const [a, pg] of clicks) { if (t >= a) { prev = page; page = pg; lastT = a; } pos = lerp(pos, pg, ep(t, a, a + 0.38)); }
      text(ctx, 'Results', r.x + 50, r.y + 44, { size: 30, weight: 800 });
      // page content: three tiles, slides when the page changes
      const k = lastT > 0 ? ep(t, lastT, lastT + 0.38) : 1, dir = page > prev ? 1 : -1;
      const drawGrid = (pg, alpha, dx) => {
        ctx.globalAlpha = alpha;
        for (let i = 0; i < 3; i++) {
          const tw = 238, gx = r.x + 50 + i * (tw + 23) + dx, gy = r.y + 78;
          fillRR(ctx, gx, gy, tw, 228, 14, C.card2);
          picture(ctx, gx + 10, gy + 10, tw - 20, 140, pg * 3 + i, 10);
          text(ctx, `Item ${(pg - 1) * 3 + i + 1}`, gx + 16, gy + 176, { size: 20, weight: 700 });
          lines(ctx, gx + 16, gy + 198, tw - 50, 2, { gap: 13, seed: pg * 7 + i });
        }
        ctx.globalAlpha = 1;
      };
      if (k < 0.5) drawGrid(prev, 1 - 2 * k, -dir * 70 * 2 * k);
      else drawGrid(page, 2 * k - 1, dir * 70 * (2 - 2 * k));
      // pager row
      const bw = 72, gap = 14, n = 7, rowW = n * bw + (n - 1) * gap, rx = r.x + (r.w - rowW) / 2, ry = r.y + r.h - 98;
      const bxOf = i => rx + i * (bw + gap);
      const press = pressOf(t, clicks.map(c => c[0]));
      for (let i = 0; i < n; i++) fillRR(ctx, bxOf(i), ry, bw, bw, 14, C.card2, C.line);
      const hx = lerp(bxOf(1), bxOf(5), (pos - 1) / 4);
      shadow(ctx, 16, 5, 'rgba(255,95,162,0.4)'); fillRR(ctx, hx, ry, bw, bw, 14, C.pink); noShadow(ctx);
      for (let p = 1; p <= 5; p++) {
        const near = 1 - clamp(Math.abs(pos - p));
        text(ctx, String(p), bxOf(p) + bw / 2, ry + bw / 2 + 1, { size: 30, weight: 800, align: 'center', color: near > 0.5 ? C.bg : C.ink });
      }
      chevron(ctx, bxOf(0) + bw / 2, ry + bw / 2, 11, -1, page > 1 || pos > 1.01 ? C.ink : C.dim, 4);
      chevron(ctx, bxOf(6) + bw / 2, ry + bw / 2, 11, 1, C.ink, 4);
      ctx.restore();
      const nx = bxOf(6) + bw / 2 + 6, ny = ry + bw / 2 + 6, ox = bxOf(1) + bw / 2 + 6;
      const rest = [r.x + r.w - 110, r.y + r.h - 18];
      const [cx, cy] = path(t, [[0, rest[0], rest[1]], [0.8, nx, ny], [3.7, nx, ny], [4.25, ox, ny], [4.8, ox, ny], [5.8, rest[0], rest[1]]]);
      cursor(ctx, cx, cy, { press, ring: ringOf(t, clicks.map(c => c[0])) });
    },
  };

  /* ---------- 4. hamburger menu ---------- */
  DEMOS['hamburger-menu'] = {
    cycle: 5, posterAt: 2.2,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = big(ctx, W, H);
      clipTo(ctx, r, 0);
      const open = ep(t, 1.05, 1.5) - ep(t, 3.35, 3.8);
      // nav bar
      const nh = 84;
      circ(ctx, r.x + 54, r.y + nh / 2, 16, C.pink);
      text(ctx, 'Studio', r.x + 82, r.y + nh / 2 + 1, { size: 28, weight: 800 });
      ctx.fillStyle = C.line; ctx.fillRect(r.x, r.y + nh, r.w, 1);
      // page behind
      picture(ctx, r.x + 40, r.y + nh + 30, r.w - 80, 200, 3, 14);
      text(ctx, 'Make something new', r.x + 40, r.y + nh + 268, { size: 28, weight: 800 });
      lines(ctx, r.x + 40, r.y + nh + 300, 420, 3, { seed: 5 });
      // dim page while the menu is open
      ctx.fillStyle = `rgba(8,6,12,${0.55 * open})`; ctx.fillRect(r.x, r.y + nh + 1, r.w, r.h);
      // menu panel drops down
      const items = ['Home', 'Library', 'Lessons', 'Contact'], ih = 70, mh = items.length * ih + 20;
      const shown = mh * open;
      if (shown > 1) {
        ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y + nh + 1, r.w, shown); ctx.clip();
        const top = r.y + nh + 1 - mh + shown;
        shadow(ctx, 30, 12); ctx.fillStyle = C.card2; ctx.fillRect(r.x, top, r.w, mh); noShadow(ctx);
        items.forEach((s, i) => {
          const a = t < 2.5 ? ep(t, 1.1 + i * 0.06, 1.45 + i * 0.06) : 1;
          const y = top + 10 + i * ih;
          text(ctx, s, r.x + 60 + (1 - a) * -24, y + ih / 2, { size: 28, weight: 700, color: i === 0 ? C.pink : C.ink });
          chevron(ctx, r.x + r.w - 70, y + ih / 2, 8, 1, C.dim, 3);
          ctx.globalAlpha = 1;
          if (i < items.length - 1) { ctx.fillStyle = C.line; ctx.fillRect(r.x + 60, y + ih, r.w - 120, 1); }
        });
        ctx.restore();
      }
      // icon button: three lines morph into an X
      const bx = r.x + r.w - 82, by = r.y + nh / 2;
      const press = pressOf(t, [1.0, 3.3]);
      fillRR(ctx, bx - 34, by - 34, 68, 68, 16, open > 0.5 ? 'rgba(255,95,162,0.16)' : C.card2, C.line);
      const col = open > 0.5 ? C.pink : C.ink;
      const L = 38 * (1 - press * 0.08), th = 6;
      const bar = (dy, rot, alpha, sx) => {
        ctx.save(); ctx.globalAlpha = alpha; ctx.translate(bx, by + dy); ctx.rotate(rot); ctx.scale(sx, 1);
        fillRR(ctx, -L / 2, -th / 2, L, th, th / 2, col); ctx.restore();
      };
      bar(-13 * (1 - open), open * Math.PI / 4, 1, 1);
      bar(0, 0, 1 - open, 1 - open);
      bar(13 * (1 - open), -open * Math.PI / 4, 1, 1);
      ctx.restore();
      const rest = [r.x + r.w - 250, r.y + 330];
      const [cx, cy] = path(t, [[0, rest[0], rest[1]], [0.85, bx + 4, by + 6], [3.6, bx + 4, by + 6], [4.7, rest[0], rest[1]]]);
      cursor(ctx, cx, cy, { press, ring: ringOf(t, [1.0, 3.3]) });
    },
  };

  /* ---------- 5. breadcrumbs ---------- */
  DEMOS['breadcrumbs'] = {
    cycle: 6, posterAt: 2.3,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = big(ctx, W, H);
      clipTo(ctx, r, 0);
      const names = ['Home', 'Library', 'Lighting', 'Golden Hour'];
      const trim = ep(t, 3.25, 3.6);
      const vis = [1, 1, ep(t, 0.65, 1.0) * (1 - trim), ep(t, 1.45, 1.8) * (1 - trim)];
      const cur = t >= 3.25 ? 1 : t >= 1.45 ? 3 : t >= 0.65 ? 2 : 1;
      // crumb layout
      const size = 26, padX = 16, sep = 42, y = r.y + 52;
      let x = r.x + 44; const boxes = [];
      for (let i = 0; i < 4; i++) {
        const w = measure(ctx, names[i], size, 700) + padX * 2;
        boxes.push({ x, w, v: vis[i] });
        x += (w + sep) * vis[i];
      }
      // highlight pill tracks the current crumb
      const tgt = boxes[cur];
      const fromIdx = t >= 3.25 ? 3 : cur - 1;
      const mv = t >= 3.25 ? trim : cur === 3 ? ep(t, 1.45, 1.8) : cur === 2 ? ep(t, 0.65, 1.0) : 1;
      const src = boxes[Math.max(0, fromIdx)];
      const hx = lerp(src.x, tgt.x, mv), hw = lerp(src.w, tgt.w, mv);
      fillRR(ctx, hx, y - 25, hw, 50, 25, 'rgba(255,95,162,0.18)', C.pink);
      for (let i = 0; i < 4; i++) {
        const b = boxes[i]; if (b.v <= 0.01) continue;
        ctx.globalAlpha = b.v;
        const isCur = Math.abs(b.x + b.w / 2 - (hx + hw / 2)) < 30;
        text(ctx, names[i], b.x + padX - (1 - b.v) * 14, y + 1, { size, weight: 700, color: isCur ? C.pink : C.soft });
        if (i > 0) chevron(ctx, b.x - sep / 2 - (1 - b.v) * 14, y, 8, 1, C.dim, 3);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = C.line; ctx.fillRect(r.x, r.y + 100, r.w, 1);
      // page body crossfades with the current page
      const pages = [[1, 'Library'], [0.65, 'Lighting'], [1.45, 'Golden Hour'], [3.25, 'Library']];
      let pi = 0; for (let i = 0; i < pages.length; i++) if (t >= pages[i][0] && i > 0) pi = i;
      if (t < 0.65) pi = 0;
      const k = pi === 0 ? 1 : ep(t, pages[pi][0], pages[pi][0] + 0.35);
      const body = (idx, alpha) => {
        ctx.globalAlpha = alpha;
        text(ctx, pages[idx][1], r.x + 44, r.y + 146, { size: 34, weight: 800 });
        const seedH = [0, 2, 4, 0][idx];
        for (let i = 0; i < 4; i++) picture(ctx, r.x + 44 + i * 196, r.y + 186, 180, 150, seedH + i, 12);
        lines(ctx, r.x + 44, r.y + 360, 520, 3, { seed: [0, 1, 2, 0][idx] * 5 });
        ctx.globalAlpha = 1;
      };
      if (k < 0.5) body(Math.max(0, pi - 1), 1 - 2 * k);
      else body(pi, 2 * k - 1);
      ctx.restore();
      const tile = [r.x + 44 + 100, r.y + 270], rest = [r.x + 260, r.y + 410];
      const lib = [boxes[1].x + boxes[1].w / 2 + 6, y + 6];
      const [cx, cy] = path(t, [[0, rest[0], rest[1]], [0.5, tile[0], tile[1]], [1.0, tile[0] + 196, tile[1]], [1.3, tile[0] + 196, tile[1]], [2.4, tile[0] + 196, tile[1]], [3.05, lib[0], lib[1]], [3.7, lib[0], lib[1]], [5.6, rest[0], rest[1]]]);
      const clicks = [0.6, 1.4, 3.2];
      cursor(ctx, cx, cy, { press: pressOf(t, clicks), ring: ringOf(t, clicks) });
    },
  };

  /* ---------- 6. skeleton screen ---------- */
  DEMOS['skeleton-screen'] = {
    cycle: 5.5, posterAt: 0.75,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = big(ctx, W, H);
      clipTo(ctx, r, 0);
      const real = ep(t, 2.2, 2.7) - ep(t, 4.5, 5.0);
      const band = lerp(r.x - 300, r.x + r.w + 300, (t % 1.1) / 1.1);
      const sk = ctx.createLinearGradient(band - 180, 0, band + 180, 0);
      sk.addColorStop(0, '#3a3146'); sk.addColorStop(0.5, '#64577a'); sk.addColorStop(1, '#3a3146');
      const cw = 238, gap = 23, cy0 = r.y + 110;
      // header
      ctx.globalAlpha = 1 - real;
      fillRR(ctx, r.x + 50, r.y + 30, 260, 34, 10, sk);
      ctx.globalAlpha = real;
      text(ctx, 'Fresh picks', r.x + 50, r.y + 48, { size: 30, weight: 800 });
      ctx.globalAlpha = 1;
      const titles = ['Golden Hour', 'Soft Window', 'Neon Night'], subs = ['Warm, low sun', 'Gentle daylight', 'Glowing signs'];
      for (let i = 0; i < 3; i++) {
        const x = r.x + 50 + i * (cw + gap), y = cy0;
        fillRR(ctx, x, y, cw, 320, 16, C.card2);
        // skeleton layer
        ctx.globalAlpha = 1 - real;
        fillRR(ctx, x + 12, y + 12, cw - 24, 160, 12, sk);
        fillRR(ctx, x + 16, y + 194, cw * 0.7, 22, 8, sk);
        fillRR(ctx, x + 16, y + 228, cw * 0.5, 16, 8, sk);
        circ(ctx, x + 32, y + 284, 16, sk); fillRR(ctx, x + 58, y + 276, 110, 16, 8, sk);
        // real layer
        ctx.globalAlpha = real;
        picture(ctx, x + 12, y + 12, cw - 24, 160, i * 2 + 2, 12);
        text(ctx, titles[i], x + 16, y + 206, { size: 22, weight: 800 });
        text(ctx, subs[i], x + 16, y + 237, { size: 17, color: C.soft });
        circ(ctx, x + 32, y + 284, 16, [C.pink, C.teal, C.gold][i]);
        text(ctx, 'by Studio', x + 58, y + 285, { size: 16, color: C.soft });
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    },
  };

  /* ---------- 7. loading spinner ---------- */
  DEMOS['loading-spinner'] = {
    cycle: 5, posterAt: 1.2,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = big(ctx, W, H);
      clipTo(ctx, r, 0);
      lines(ctx, r.x + 50, r.y + 40, 300, 2, { seed: 2, gap: 18, h: 10 });
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2 + 12;
      shadow(ctx, 36, 14); fillRR(ctx, cx - 290, cy - 190, 580, 380, 26, C.card2); noShadow(ctx);
      fillRR(ctx, cx - 290, cy - 190, 580, 380, 26, null, C.line);
      const done = t < 4.3 ? ep(t, 2.5, 2.9) : 0;
      const sy = cy - 34, R = 88;
      // spinner (fades out as it completes, back in on reset)
      const rot = t * TAU * 1.2;
      const sweep = lerp(TAU * (0.22 + 0.2 * (0.5 + 0.5 * Math.sin(t * TAU * 0.8))), TAU, done);
      const sAlpha = t < 4.3 ? 1 - ep(t, 2.95, 3.15) : ep(t, 4.55, 4.8);
      if (sAlpha > 0.01) {
        ctx.globalAlpha = sAlpha;
        circ(ctx, cx, sy, R, null, C.line, 15);
        ctx.beginPath(); ctx.arc(cx, sy, R, rot - Math.PI / 2, rot - Math.PI / 2 + sweep);
        ctx.strokeStyle = done > 0.5 ? C.teal : C.pink; ctx.lineWidth = 15; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineCap = 'butt';
        ctx.globalAlpha = 1;
      }
      // check badge
      const cs = t < 4.3 ? ep(t, 2.9, 3.3, ease.outBack) : 1 - ep(t, 4.3, 4.55);
      if (cs > 0.01) {
        circ(ctx, cx, sy, R * cs, C.teal);
        check(ctx, cx, sy, 92 * cs, ep(t, 3.05, 3.45), C.bg, 13);
      }
      // label
      const dots = '...'.slice(0, Math.floor(t * 2.5) % 4);
      const la = t < 2.9 ? 1 : t < 4.55 ? 0 : ep(t, 4.55, 4.8);
      const da = t < 4.3 ? ep(t, 3.0, 3.3) : 1 - ep(t, 4.3, 4.55);
      ctx.globalAlpha = la * (t < 2.9 ? 1 - ep(t, 2.7, 2.9) : 1);
      text(ctx, 'Loading' , cx - 4, sy + 142, { size: 34, weight: 800, align: 'center' });
      text(ctx, dots, cx + measure(ctx, 'Loading', 34, 800) / 2 - 3, sy + 142, { size: 34, weight: 800 });
      ctx.globalAlpha = da;
      text(ctx, 'All done', cx, sy + 142, { size: 34, weight: 800, align: 'center', color: C.teal });
      ctx.globalAlpha = 1;
      ctx.restore();
    },
  };

  /* ---------- 8. notification badge ---------- */
  function bell(ctx, x, y, s, rot, color) {
    ctx.save(); ctx.translate(x, y - s * 0.55); ctx.rotate(rot); ctx.translate(0, s * 0.55);
    ctx.beginPath();
    ctx.moveTo(-s * 0.62, s * 0.38);
    ctx.bezierCurveTo(-s * 0.45, s * 0.2, -s * 0.48, -s * 0.05, -s * 0.46, -s * 0.18);
    ctx.bezierCurveTo(-s * 0.44, -s * 0.48, -s * 0.24, -s * 0.62, 0, -s * 0.62);
    ctx.bezierCurveTo(s * 0.24, -s * 0.62, s * 0.44, -s * 0.48, s * 0.46, -s * 0.18);
    ctx.bezierCurveTo(s * 0.48, -s * 0.05, s * 0.45, s * 0.2, s * 0.62, s * 0.38);
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
    fillRR(ctx, -s * 0.66, s * 0.34, s * 1.32, s * 0.12, s * 0.06, color);
    circ(ctx, 0, s * 0.56, s * 0.13, color);
    circ(ctx, 0, -s * 0.66, s * 0.08, color);
    ctx.restore();
  }
  DEMOS['notification-badge'] = {
    cycle: 5.5, posterAt: 2.4,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = big(ctx, W, H);
      clipTo(ctx, r, 0);
      // app bar and page
      text(ctx, 'Inbox', r.x + 50, r.y + 44, { size: 30, weight: 800 });
      lines(ctx, r.x + 50, r.y + 90, 220, 6, { gap: 26, h: 12, seed: 4 });
      const cx = r.x + r.w / 2 + 120, cy = r.y + r.h / 2 + 10;
      const ticks = [0.6, 1.2, 1.8], clickT = 3.4;
      let n = 0, lastT = -9; for (const a of ticks) if (t >= a) { n++; lastT = a; }
      if (t >= clickT) n = 0;
      // gentle ring wiggle at each tick
      let rot = 0; for (const a of ticks) { const s = seg(t, a, a + 0.6); if (s > 0 && s < 1) rot = 0.32 * Math.sin(s * Math.PI * 5) * (1 - s); }
      const press = pressOf(t, [clickT]);
      shadow(ctx, 36, 14); circ(ctx, cx, cy, 120 * (1 - press * 0.05), C.card2); noShadow(ctx);
      circ(ctx, cx, cy, 120 * (1 - press * 0.05), null, C.line, 2);
      bell(ctx, cx, cy + 4, 130, rot, C.ink);
      // badge pops in, ticks up, clears on click
      const inS = ep(t, 0.6, 0.95, ease.outBack), outS = ep(t, clickT + 0.05, clickT + 0.35, ease.in);
      const tickPop = lastT > 0.7 && t < clickT ? 1 + 0.25 * (1 - ep(t, lastT, lastT + 0.3, ease.out)) : 1;
      const bs = inS * (1 - outS) * tickPop;
      if (bs > 0.01) {
        const bx = cx + 62, by = cy - 70;
        circ(ctx, bx, by, 40 * bs, C.card2);
        shadow(ctx, 14, 4, 'rgba(255,95,162,0.5)'); circ(ctx, bx, by, 34 * bs, C.pink); noShadow(ctx);
        text(ctx, String(Math.max(1, n || 3)), bx, by + 1, { size: 36 * bs, weight: 800, color: C.white, align: 'center' });
      }
      ctx.restore();
      const rest = [r.x + r.w - 110, r.y + r.h - 20], tgt = [cx + 20, cy + 30];
      const [px, py] = path(t, [[0, rest[0], rest[1]], [2.6, rest[0], rest[1]], [3.25, tgt[0], tgt[1]], [3.8, tgt[0], tgt[1]], [4.8, rest[0], rest[1]]]);
      cursor(ctx, px, py, { press, ring: ringOf(t, [clickT]) });
    },
  };

  /* ---------- 9. empty state ---------- */
  DEMOS['empty-state'] = {
    cycle: 6, posterAt: 0.9,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = big(ctx, W, H);
      clipTo(ctx, r, 0);
      text(ctx, 'Your picks', r.x + 50, r.y + 44, { size: 30, weight: 800 });
      const clickT = 1.7;
      const gone = ep(t, clickT + 0.05, clickT + 0.4) - ep(t, 4.7, 5.15);
      const item = ep(t, clickT + 0.25, clickT + 0.7, ease.outBack) - ep(t, 4.5, 4.85);
      const ax = r.x + 50, ay = r.y + 82, aw = r.w - 100, ah = r.h - 112;
      // dashed empty area
      ctx.save(); rr(ctx, ax, ay, aw, ah, 18); ctx.setLineDash([10, 9]); ctx.strokeStyle = C.line; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
      const cx = r.x + r.w / 2;
      const press = pressOf(t, [clickT]);
      if (gone < 0.99) {
        ctx.globalAlpha = 1 - gone;
        // line drawing: an open box with a floating heart
        const ix = cx, iy = ay + 110, bob = Math.sin(t / 6 * TAU * 2) * 6;
        ctx.strokeStyle = C.soft; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(ix - 70, iy - 10); ctx.lineTo(ix - 70, iy + 50); ctx.lineTo(ix + 70, iy + 50); ctx.lineTo(ix + 70, iy - 10); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ix - 70, iy - 10); ctx.lineTo(ix - 100, iy - 38); ctx.moveTo(ix + 70, iy - 10); ctx.lineTo(ix + 100, iy - 38); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ix - 30, iy + 18); ctx.quadraticCurveTo(ix, iy + 34, ix + 30, iy + 18); ctx.stroke();
        const hy = iy - 60 + bob, hs = 16;
        ctx.beginPath(); ctx.moveTo(ix, hy + hs * 0.9);
        ctx.bezierCurveTo(ix - hs * 1.6, hy - hs * 0.1, ix - hs * 0.8, hy - hs * 1.3, ix, hy - hs * 0.4);
        ctx.bezierCurveTo(ix + hs * 0.8, hy - hs * 1.3, ix + hs * 1.6, hy - hs * 0.1, ix, hy + hs * 0.9);
        ctx.fillStyle = C.pink; ctx.fill();
        circ(ctx, ix - 62, iy - 66 - bob * 0.5, 5, C.teal); circ(ctx, ix + 66, iy - 58 + bob * 0.5, 4, C.gold);
        ctx.lineCap = 'butt';
        text(ctx, 'Nothing here yet', cx, ay + 205, { size: 30, weight: 800, align: 'center' });
        text(ctx, 'Save a keyword and it will show up here', cx, ay + 240, { size: 18, color: C.soft, align: 'center' });
        button(ctx, cx - 110, ay + 268 + press * 2, 220, 54, 'Add first pick', { size: 19 });
        ctx.globalAlpha = 1;
      }
      if (item > 0.01) {
        const iy = ay + 24 + (1 - item) * 30;
        ctx.globalAlpha = clamp(item);
        shadow(ctx, 24, 10); fillRR(ctx, ax + 20, iy, aw - 40, 110, 16, C.card2); noShadow(ctx);
        picture(ctx, ax + 34, iy + 14, 120, 82, 2, 10);
        text(ctx, 'Golden Hour', ax + 176, iy + 40, { size: 26, weight: 800 });
        text(ctx, 'Warm, low sun light', ax + 176, iy + 74, { size: 18, color: C.soft });
        fillRR(ctx, ax + aw - 150, iy + 38, 96, 34, 17, 'rgba(79,216,196,0.18)');
        text(ctx, 'Saved', ax + aw - 102, iy + 56, { size: 17, weight: 700, color: C.teal, align: 'center' });
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      const rest = [r.x + r.w - 160, r.y + r.h - 24], tgt = [cx + 40, ay + 300];
      const [px, py] = path(t, [[0, rest[0], rest[1]], [0.4, rest[0], rest[1]], [1.55, tgt[0], tgt[1]], [2.1, tgt[0], tgt[1]], [3.2, rest[0], rest[1]]]);
      cursor(ctx, px, py, { press, ring: ringOf(t, [clickT]) });
    },
  };

  /* ---------- 10. step indicator ---------- */
  DEMOS['step-indicator'] = {
    cycle: 6, posterAt: 2.5,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = big(ctx, W, H);
      clipTo(ctx, r, 0);
      const clicks = [0.9, 1.9, 2.9], doneT = [0.9, 1.9, 2.9, 3.5];
      const reset = ep(t, 5.2, 5.7);
      // fill progress along the line (0..3)
      let lineP = 0; for (let i = 0; i < 3; i++) lineP += ep(t, clicks[i] + 0.05, clicks[i] + 0.5);
      lineP *= 1 - reset;
      const doneOf = i => ep(t, doneT[i], doneT[i] + 0.3, ease.outBack) * (1 - reset);
      let current = 0; for (const a of clicks) if (t >= a && t < 5.2) current++;
      const labels = ['Account', 'Profile', 'Plan', 'Done'];
      const x0 = r.x + 130, x1 = r.x + r.w - 130, y = r.y + 78, R = 32;
      const xs = i => lerp(x0, x1, i / 3);
      fillRR(ctx, x0, y - 5, x1 - x0, 10, 5, C.card2);
      const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, C.teal); g.addColorStop(1, C.pink);
      fillRR(ctx, x0, y - 5, (x1 - x0) * lineP / 3, 10, 5, g);
      for (let i = 0; i < 4; i++) {
        const d = doneOf(i), x = xs(i);
        const active = i === current && d < 0.5;
        circ(ctx, x, y, R + 6, C.card);
        circ(ctx, x, y, R, C.card2, active ? C.pink : C.line, active ? 4 : 2);
        if (active) circ(ctx, x, y, R + 11, null, 'rgba(255,95,162,0.3)', 3);
        if (d < 0.6) text(ctx, String(i + 1), x, y + 1, { size: 26, weight: 800, align: 'center', color: active ? C.pink : C.soft });
        if (d > 0.01) { circ(ctx, x, y, R * clamp(d, 0, 1.2), C.teal); check(ctx, x, y, 36 * clamp(d), ep(t, doneT[i] + 0.1, doneT[i] + 0.4) * (1 - reset), C.bg, 6); }
        text(ctx, labels[i], x, y + 62, { size: 20, weight: 700, align: 'center', color: active || d > 0.5 ? C.ink : C.soft });
      }
      // form card for the current step
      const titles = ['Create account', 'Your profile', 'Pick a plan', 'All set!'];
      const fx = r.x + 150, fy = r.y + 180, fw = r.w - 300, fh = 240;
      shadow(ctx, 30, 12); fillRR(ctx, fx, fy, fw, fh, 20, C.card2); noShadow(ctx);
      let showIdx = current, fade = current > 0 ? ep(t, clicks[current - 1], clicks[current - 1] + 0.3) : 1;
      if (t >= 5.2) { showIdx = t < 5.45 ? 3 : 0; fade = t < 5.45 ? 1 - ep(t, 5.2, 5.45) : ep(t, 5.45, 5.7); }
      ctx.globalAlpha = fade;
      text(ctx, titles[showIdx], fx + 36, fy + 50, { size: 30, weight: 800, color: showIdx === 3 ? C.teal : C.ink });
      if (showIdx < 3) {
        fillRR(ctx, fx + 36, fy + 90, fw - 72, 46, 12, C.card, C.line);
        lines(ctx, fx + 54, fy + 110, 180, 1, { h: 8, seed: showIdx });
      } else {
        text(ctx, 'Welcome aboard', fx + 36, fy + 96, { size: 20, color: C.soft });
        lines(ctx, fx + 36, fy + 130, 300, 2, { h: 8, gap: 20, seed: 9 });
      }
      ctx.globalAlpha = 1;
      const press = pressOf(t, clicks);
      const nbx = fx + fw - 186, nby = fy + fh - 78;
      const na = t < 5.2 ? 1 - ep(t, 2.95, 3.2) : ep(t, 5.45, 5.7);
      if (na > 0.01) { ctx.globalAlpha = na; button(ctx, nbx, nby + press * 2, 150, 54, 'Next', { size: 21 }); ctx.globalAlpha = 1; }
      ctx.restore();
      const bt = [nbx + 100, nby + 34], rest = [nbx + 150, nby + 112];
      const [px, py] = path(t, [[0, rest[0], rest[1]], [0.75, bt[0], bt[1]], [3.1, bt[0], bt[1]], [4.0, rest[0], rest[1]]]);
      cursor(ctx, px, py, { press, ring: ringOf(t, clicks) });
    },
  };

  /* ---------- 11. floating action button (phone) ---------- */
  DEMOS['floating-action-button'] = {
    cycle: 5, posterAt: 2.2,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const s = phone(ctx, W, H, { w: 270, h: 520 });
      clipTo(ctx, s, 27);
      text(ctx, 'Notes', s.x + 22, s.y + 62, { size: 30, weight: 800 });
      for (let i = 0; i < 4; i++) {
        const y = s.y + 92 + i * 92;
        fillRR(ctx, s.x + 16, y, s.w - 32, 80, 14, C.card2);
        fillRR(ctx, s.x + 30, y + 16, 48, 48, 12, [C.pink, C.teal, C.gold, C.violet][i]);
        lines(ctx, s.x + 92, y + 26, s.w - 140, 2, { gap: 18, h: 9, seed: i * 3 });
      }
      const open = ep(t, 1.05, 1.45) - ep(t, 3.35, 3.75);
      ctx.fillStyle = `rgba(8,6,12,${0.6 * open})`; ctx.fillRect(s.x, s.y, s.w, s.h);
      const fx = s.x + s.w - 56, fy = s.y + s.h - 60;
      // three mini actions fan out above the button
      const acts = [[-90, C.teal], [-135, C.gold], [180, C.violet]];
      acts.forEach(([deg, col], i) => {
        const a = ep(t, 1.1 + i * 0.07, 1.5 + i * 0.07, ease.outBack) - ep(t, 3.35 + (2 - i) * 0.04, 3.65 + (2 - i) * 0.04);
        if (a <= 0.01) return;
        const rad = deg * Math.PI / 180, d = 112 * a;
        const ax = fx + Math.cos(rad) * d, ay = fy + Math.sin(rad) * d, ar = 27 * clamp(a, 0, 1.2);
        shadow(ctx, 12, 5); circ(ctx, ax, ay, ar, col); noShadow(ctx);
        ctx.save(); ctx.translate(ax, ay); ctx.scale(clamp(a), clamp(a));
        ctx.strokeStyle = C.bg; ctx.fillStyle = C.bg; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        if (i === 0) { ctx.beginPath(); ctx.moveTo(-8, 9); ctx.lineTo(9, -8); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-10, 11); ctx.lineTo(-6, 4); ctx.lineTo(-3, 7); ctx.closePath(); ctx.fill(); }
        if (i === 1) { fillRR(ctx, -11, -6, 22, 15, 4, C.bg); circ(ctx, 0, 1.5, 4.5, col); fillRR(ctx, -4, -10, 8, 5, 2, C.bg); }
        if (i === 2) { fillRR(ctx, -4, -11, 8, 14, 4, C.bg); ctx.beginPath(); ctx.arc(0, -1, 8, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 7); ctx.lineTo(0, 11); ctx.stroke(); }
        ctx.lineCap = 'butt'; ctx.restore();
      });
      const press = pressOf(t, [1.0, 3.3]);
      const fr = 32 * (1 - press * 0.08);
      shadow(ctx, 18, 8, 'rgba(255,95,162,0.45)'); circ(ctx, fx, fy, fr, C.pink); noShadow(ctx);
      ctx.save(); ctx.translate(fx, fy); ctx.rotate(open * Math.PI / 4); plusSign(ctx, 0, 0, 12, C.bg, 5); ctx.restore();
      ctx.restore();
      const rest = [s.x + s.w + 70, s.y + s.h - 10];
      const [px, py] = path(t, [[0, rest[0], rest[1]], [0.85, fx, fy], [1.4, fx, fy], [2.2, fx + 50, fy + 30], [2.8, fx + 50, fy + 30], [3.2, fx, fy], [3.6, fx, fy], [4.6, rest[0], rest[1]]]);
      finger(ctx, px, py, { press });
    },
  };

  /* ---------- 12. card flip ---------- */
  DEMOS['card-flip'] = {
    cycle: 5, posterAt: 1.2,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = big(ctx, W, H);
      clipTo(ctx, r, 0);
      const cw = 230, ch = 330, gap = 36, y0 = r.y + (r.h - ch) / 2 + 4;
      const xOf = i => r.x + (r.w - (3 * cw + 2 * gap)) / 2 + i * (cw + gap);
      const titles = ['Soft Window', 'Golden Hour', 'Neon Night'];
      const front = (x, y, i) => {
        fillRR(ctx, x, y, cw, ch, 18, C.card2, C.line);
        picture(ctx, x + 12, y + 12, cw - 24, 190, [1, 2, 3][i], 12);
        text(ctx, titles[i], x + 18, y + 236, { size: 24, weight: 800 });
        lines(ctx, x + 18, y + 266, cw - 50, 3, { gap: 15, h: 7, seed: i * 4 });
      };
      for (const i of [0, 2]) { shadow(ctx, 24, 10); fillRR(ctx, xOf(i), y0, cw, ch, 18, C.card2); noShadow(ctx); front(xOf(i), y0, i); }
      // middle card flips: angle 0 -> PI and back
      const a = Math.PI * (ep(t, 0.9, 1.5) - ep(t, 3.2, 3.8));
      const sx = Math.cos(a), lift = Math.sin(a);
      const cx = xOf(1) + cw / 2, cy = y0 + ch / 2;
      ctx.save(); ctx.translate(cx, cy - lift * 12); ctx.scale(Math.max(0.002, Math.abs(sx)), 1 + 0.06 * lift);
      shadow(ctx, 24 + lift * 20, 10 + lift * 14); fillRR(ctx, -cw / 2, -ch / 2, cw, ch, 18, C.card2); noShadow(ctx);
      if (sx >= 0) front(-cw / 2, -ch / 2, 1);
      else {
        const x = -cw / 2, y = -ch / 2;
        const g = ctx.createLinearGradient(x, y, x + cw, y + ch); g.addColorStop(0, C.pink); g.addColorStop(1, C.violet);
        fillRR(ctx, x, y, cw, ch, 18, g);
        text(ctx, 'Golden Hour', x + cw / 2, y + 62, { size: 26, weight: 800, align: 'center', color: C.bg });
        ['Warm, low sun', 'Long soft shadows', 'Glowing skin'].forEach((s, k) => text(ctx, s, x + cw / 2, y + 120 + k * 36, { size: 18, weight: 600, align: 'center', color: C.bg }));
        button(ctx, x + 40, y + ch - 82, cw - 80, 50, 'Use it', { fill: C.bg, color: C.ink, size: 19 });
      }
      // edge shading sells the turn
      fillRR(ctx, -cw / 2, -ch / 2, cw, ch, 18, `rgba(8,6,12,${0.45 * Math.abs(lift) * Math.abs(lift)})`);
      ctx.restore();
      ctx.restore();
      const clicks = [0.8, 3.1];
      const tgt = [cx + 30, cy + 40], rest = [cx + 90, y0 + ch + 40];
      const [px, py] = path(t, [[0, rest[0], rest[1]], [0.65, tgt[0], tgt[1]], [1.2, tgt[0], tgt[1]], [1.9, rest[0], rest[1]], [2.4, rest[0], rest[1]], [2.95, tgt[0], tgt[1]], [3.5, tgt[0], tgt[1]], [4.3, rest[0], rest[1]]]);
      cursor(ctx, px, py, { press: pressOf(t, clicks), ring: ringOf(t, clicks) });
    },
  };
})();
