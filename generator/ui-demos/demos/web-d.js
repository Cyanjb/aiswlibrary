/* Group web-d: web motion effects. Every draw is a pure function of t. */
(function () {
  const { C, FONT, clamp, lerp, seg, ease, ep, rnd, rr, fillRR, text, lines, shadow, noShadow, backdrop, browser, clipTo, cursor, picture, button, path } = KIT;
  const TAU = Math.PI * 2;
  const BIG = { w: 880, h: 500 };

  // small helpers kept local to this file
  function measure(ctx, s, size, weight) { ctx.font = `${weight} ${size}px ${FONT}`; return ctx.measureText(s).width; }
  function spinner(ctx, x, y, rad, t, color = C.pink) {
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y, rad, 0, TAU); ctx.strokeStyle = C.line; ctx.lineWidth = 5; ctx.stroke();
    const a = t * TAU * 1.4;
    ctx.beginPath(); ctx.arc(x, y, rad, a, a + 1.9); ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.stroke();
    ctx.lineCap = 'butt';
  }
  function scrollbar(ctx, r, scroll, contentH) {
    const trackX = r.x + r.w - 12, trackY = r.y + 8, trackH = r.h - 16;
    fillRR(ctx, trackX, trackY, 6, trackH, 3, 'rgba(255,255,255,0.05)');
    const th = Math.max(40, trackH * r.h / contentH);
    const maxS = Math.max(1, contentH - r.h);
    const ty = trackY + (trackH - th) * clamp(scroll / maxS);
    fillRR(ctx, trackX, ty, 6, th, 3, C.soft);
  }
  function navBar(ctx, r, label = 'Moodboard') {
    fillRR(ctx, r.x + 30, r.y + 22, 30, 30, 9, C.pink);
    text(ctx, label, r.x + 72, r.y + 38, { size: 20, weight: 800 });
  }

  // 1. Ripple on click
  DEMOS['ripple-click'] = {
    cycle: 5, posterAt: 1.35,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = browser(ctx, W, H, BIG);
      clipTo(ctx, r, 0);
      navBar(ctx, r);
      lines(ctx, r.x + 230, r.y + 82, 420, 2, { seed: 4, gap: 18, h: 8 });
      const bw = 460, bh = 140, bx = r.x + (r.w - bw) / 2, by = r.y + 150;
      const clicks = [[1.1, bx + 120, by + 52], [2.7, bx + 360, by + 92]];
      const press = clicks.reduce((m, c) => Math.max(m, ep(t, c[0] - 0.1, c[0]) - ep(t, c[0], c[0] + 0.15)), 0);
      shadow(ctx, 30, 14, 'rgba(255,95,162,0.25)');
      fillRR(ctx, bx, by + press * 3, bw, bh, 28, C.pink); noShadow(ctx);
      // ripples, clipped to the button shape
      ctx.save(); rr(ctx, bx, by + press * 3, bw, bh, 28); ctx.clip();
      for (const [tc, cx, cy] of clicks) {
        const tau = t - tc;
        if (tau < 0 || tau > 1.0) continue;
        const rad = 10 + ease.out(seg(tau, 0, 0.9)) * 380;
        const a = 0.6 * (1 - seg(tau, 0.45, 1.0));
        ctx.beginPath(); ctx.arc(cx, cy + press * 3, rad, 0, TAU); ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.stroke();
      }
      ctx.restore();
      text(ctx, 'Save picks', bx + bw / 2, by + bh / 2 + press * 3 + 1, { size: 40, weight: 800, color: C.bg, align: 'center' });
      lines(ctx, r.x + 230, r.y + 340, 420, 3, { seed: 9, gap: 18, h: 8 });
      ctx.restore();
      const sx = r.x + r.w - 140, sy = r.y + r.h - 50;
      const [cx, cy] = path(t, [[0, sx, sy], [0.9, clicks[0][1], clicks[0][2]], [1.5, clicks[0][1], clicks[0][2]], [2.5, clicks[1][1], clicks[1][2]], [3.1, clicks[1][1], clicks[1][2]], [4.3, sx, sy], [5, sx, sy]]);
      const ring = Math.max(seg(t, 1.1, 1.5) % 1, seg(t, 2.7, 3.1) % 1);
      cursor(ctx, cx, cy, { press, ring });
    },
  };

  // 2. Link underline that grows on hover
  DEMOS['link-underline-animation'] = {
    cycle: 5, posterAt: 1.4,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = browser(ctx, W, H, BIG);
      clipTo(ctx, r, 0);
      // nav bar
      fillRR(ctx, r.x + 30, r.y + 34, 40, 40, 12, C.pink);
      const names = ['Home', 'Library', 'Picks', 'About'];
      const size = 32, ny = r.y + 54;
      const ws = names.map(n => measure(ctx, n, size, 700));
      const gap = 52; let x = r.x + r.w - 40 - ws.reduce((a, b) => a + b, 0) - gap * (names.length - 1);
      const xs = ws.map(w => { const v = x; x += w + gap; return v; });
      // hover windows per link: [enter, leave]
      const hover = { 1: [0.72, 1.95], 2: [2.2, 3.45] };
      ctx.fillStyle = C.line; ctx.fillRect(r.x, r.y + 108, r.w, 1);
      names.forEach((n, i) => {
        const h = hover[i];
        let a = 0, b = 0;
        if (h) { const grow = ep(t, h[0], h[0] + 0.35), shrink = ep(t, h[1], h[1] + 0.35); a = shrink; b = grow; }
        const on = h ? clamp(ep(t, h[0], h[0] + 0.2) - ep(t, h[1], h[1] + 0.2)) : 0;
        const col = on > 0.5 ? C.ink : C.soft;
        text(ctx, n, xs[i], ny, { size, weight: 700, color: col });
        if (b > a) fillRR(ctx, xs[i] + ws[i] * a, ny + 24, ws[i] * (b - a), 6, 3, C.pink);
      });
      // page body under the nav
      text(ctx, 'Find your next look', r.x + 40, r.y + 170, { size: 36, weight: 800 });
      lines(ctx, r.x + 40, r.y + 212, 360, 3, { seed: 2, gap: 18, h: 8 });
      picture(ctx, r.x + 460, r.y + 145, 380, 290, 1, 14);
      button(ctx, r.x + 40, r.y + 290, 190, 54, 'Browse', { size: 20 });
      ctx.restore();
      const sx = r.x + 330, sy = r.y + 400;
      const lib = xs[1] + ws[1] * 0.55, pk = xs[2] + ws[2] * 0.5;
      const [cx, cy] = path(t, [[0, sx, sy], [0.75, lib, ny + 2], [1.9, lib, ny + 2], [2.25, pk, ny + 2], [3.4, pk, ny + 2], [4.3, sx, sy], [5, sx, sy]]);
      cursor(ctx, cx, cy);
    },
  };

  // 3. Before and after slider
  DEMOS['before-and-after-slider'] = {
    cycle: 5.6, posterAt: 2.8,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = browser(ctx, W, H, BIG);
      const ix = r.x + 24, iy = r.y + 20, iw = r.w - 48, ih = r.h - 40;
      const keys = [[0, 0.5], [1.0, 0.5], [1.9, 0.2], [2.3, 0.2], [3.3, 0.82], [3.7, 0.82], [4.4, 0.5]];
      let f = 0.5;
      for (let i = 1; i < keys.length; i++) if (t >= keys[i - 1][0] && t <= keys[i][0]) f = lerp(keys[i - 1][1], keys[i][1], ep(t, keys[i - 1][0], keys[i][0]));
      const dx = ix + iw * f;
      // after: colourful, full
      picture(ctx, ix, iy, iw, ih, 2, 16);
      // before: same picture, greyed and dulled, on the left of the divider
      ctx.save(); rr(ctx, ix, iy, iw, ih, 16); ctx.clip(); ctx.beginPath(); ctx.rect(ix, iy, dx - ix, ih); ctx.clip();
      picture(ctx, ix, iy, iw, ih, 2, 16);
      ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#808080'; ctx.fillRect(ix, iy, iw, ih);
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = 'rgba(30,28,34,0.35)'; ctx.fillRect(ix, iy, iw, ih);
      ctx.restore();
      // labels
      fillRR(ctx, ix + 18, iy + 18, 108, 40, 20, 'rgba(18,16,22,0.7)');
      text(ctx, 'Before', ix + 72, iy + 38.5, { size: 19, weight: 700, align: 'center' });
      fillRR(ctx, ix + iw - 126, iy + 18, 108, 40, 20, 'rgba(18,16,22,0.7)');
      text(ctx, 'After', ix + iw - 72, iy + 38.5, { size: 19, weight: 700, align: 'center', color: C.pink });
      // divider and handle
      const hy = iy + ih / 2;
      ctx.fillStyle = C.white; ctx.fillRect(dx - 2, iy, 4, ih);
      const grab = ep(t, 0.9, 1.0) - ep(t, 4.4, 4.55);
      shadow(ctx, 18, 6); ctx.beginPath(); ctx.arc(dx, hy, 30 + grab * 3, 0, TAU); ctx.fillStyle = C.white; ctx.fill(); noShadow(ctx);
      ctx.fillStyle = C.bg;
      ctx.beginPath(); ctx.moveTo(dx - 7, hy - 9); ctx.lineTo(dx - 17, hy); ctx.lineTo(dx - 7, hy + 9); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(dx + 7, hy - 9); ctx.lineTo(dx + 17, hy); ctx.lineTo(dx + 7, hy + 9); ctx.closePath(); ctx.fill();
      // cursor grabs the handle and drags
      const sx = ix + iw * 0.5 + 170, sy = iy + ih - 40;
      let cx, cy;
      if (t < 0.9) [cx, cy] = path(t, [[0, sx, sy], [0.9, dx + 6, hy + 8]]);
      else if (t < 4.5) { cx = dx + 6; cy = hy + 8; }
      else[cx, cy] = path(t, [[4.5, dx + 6, hy + 8], [5.3, sx, sy]]);
      cursor(ctx, cx, cy, { press: grab });
    },
  };

  // 4. Preloader
  DEMOS['preloader'] = {
    cycle: 5.6, posterAt: 1.6,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = browser(ctx, W, H, BIG);
      clipTo(ctx, r, 0);
      // the page underneath
      navBar(ctx, r);
      text(ctx, 'Welcome in', r.x + 40, r.y + 140, { size: 48, weight: 800 });
      lines(ctx, r.x + 40, r.y + 190, 340, 3, { seed: 6, gap: 18, h: 8 });
      button(ctx, r.x + 40, r.y + 270, 200, 56, 'Start here', { size: 20 });
      picture(ctx, r.x + 450, r.y + 90, 390, 330, 3, 16);
      // loading screen: slides up after 100%, comes back down to restart
      const up = ep(t, 2.75, 3.3), down = ep(t, 4.75, 5.25);
      const off = t < 4.75 ? -up * (r.h + 20) : -(1 - down) * (r.h + 20);
      const pct = t < 4.75 ? Math.floor(ep(t, 0.3, 2.4) * 100) : 0;
      ctx.save(); ctx.translate(0, off);
      ctx.fillStyle = C.desk; ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle = C.pink; ctx.fillRect(r.x, r.y + r.h, r.w, 10);
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      // logo-like ring that fills with progress
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx, cy - 60, 44, 0, TAU); ctx.strokeStyle = C.line; ctx.lineWidth = 9; ctx.stroke();
      if (pct > 0) { ctx.beginPath(); ctx.arc(cx, cy - 60, 44, -Math.PI / 2, -Math.PI / 2 + TAU * pct / 100); ctx.strokeStyle = C.pink; ctx.stroke(); }
      ctx.lineCap = 'butt';
      text(ctx, pct + '%', cx, cy + 50, { size: 72, weight: 800, align: 'center' });
      fillRR(ctx, cx - 220, cy + 112, 440, 12, 6, C.line);
      if (pct > 0) fillRR(ctx, cx - 220, cy + 112, 440 * pct / 100, 12, 6, C.teal);
      ctx.restore();
      ctx.restore();
    },
  };

  // 5. Infinite scroll
  DEMOS['infinite-scroll'] = {
    cycle: 6, posterAt: 2.3,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = browser(ctx, W, H, BIG);
      const head = 80, rowH = 200, gap = 20, cols = 3;
      const cw = (r.w - 60 - gap * (cols - 1)) / cols, ch = 180;
      const baseRows = 3, extraRows = 2;
      const rows = baseRows + (t >= 2.6 && t < 5.6 ? extraRows : 0);
      const S1 = head + baseRows * rowH + 80 - r.h;
      const S2 = S1 + 300;
      let s = 0;
      if (t < 1.9) s = S1 * ep(t, 0.4, 1.9);
      else if (t < 3.0) s = S1;
      else if (t < 4.4) s = lerp(S1, S2, ep(t, 3.0, 3.9));
      else s = S2 * (1 - ep(t, 4.4, 5.5));
      // visible content height for the scrollbar: grows when new rows arrive, shrinks back at the top
      const grown = ep(t, 2.6, 3.0) * (1 - ep(t, 5.5, 5.9));
      const contentH = head + (baseRows + extraRows * grown) * rowH + 80;
      clipTo(ctx, r, 0);
      ctx.save(); ctx.translate(0, -s);
      text(ctx, 'Your feed', r.x + 30, r.y + 44, { size: 32, weight: 800 });
      for (let i = 0; i < rows * cols; i++) {
        const row = Math.floor(i / cols), col = i % cols;
        const isNew = row >= baseRows;
        const k = isNew ? ep(t, 2.6 + (i - baseRows * cols) * 0.06, 3.0 + (i - baseRows * cols) * 0.06, ease.out) : 1;
        if (k <= 0) continue;
        const x = r.x + 30 + col * (cw + gap), y = r.y + head + row * rowH + (1 - k) * 30;
        ctx.globalAlpha = k;
        fillRR(ctx, x, y, cw, ch, 14, C.card2);
        picture(ctx, x + 10, y + 10, cw - 20, 110, i, 10);
        lines(ctx, x + 14, y + 136, cw - 60, 2, { seed: i * 3, gap: 16, h: 8 });
        if (isNew) fillRR(ctx, x, y, cw, ch, 14, null, C.teal);
        ctx.globalAlpha = 1;
      }
      // loader at the bottom of the feed while new items arrive
      const ldA = (ep(t, 1.6, 1.9) - ep(t, 2.5, 2.7)) * 1;
      if (ldA > 0) {
        ctx.globalAlpha = ldA;
        const ly = r.y + head + baseRows * rowH + 30;
        spinner(ctx, r.x + r.w / 2 - 80, ly, 16, t);
        text(ctx, 'Loading more', r.x + r.w / 2 - 50, ly, { size: 22, weight: 700, color: C.soft });
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      scrollbar(ctx, r, s, contentH);
      ctx.restore();
    },
  };

  // 6. Page transition
  DEMOS['page-transition'] = {
    cycle: 5.4, posterAt: 1.2,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const onB = t >= 1.4 && t < 3.4;
      const r = browser(ctx, W, H, Object.assign({ url: onB ? 'aiandseewhy.com/gallery' : 'aiandseewhy.com' }, BIG));
      clipTo(ctx, r, 0);
      const linkX = r.x + 40, linkY = r.y + 300, backX = r.x + 40, backY = r.y + 46;
      if (!onB) {
        navBar(ctx, r);
        text(ctx, 'Hello there', r.x + 40, r.y + 140, { size: 52, weight: 800 });
        lines(ctx, r.x + 40, r.y + 190, 340, 3, { seed: 11, gap: 18, h: 8 });
        const lw = measure(ctx, 'See the gallery  →', 28, 700);
        text(ctx, 'See the gallery  →', linkX, linkY, { size: 28, weight: 700, color: C.teal });
        fillRR(ctx, linkX, linkY + 20, lw, 3, 1.5, C.teal);
        picture(ctx, r.x + 470, r.y + 80, 370, 340, 0, 16);
      } else {
        text(ctx, '←  Back', backX, backY, { size: 24, weight: 700, color: C.teal });
        text(ctx, 'Gallery', r.x + 40, r.y + 112, { size: 48, weight: 800 });
        const gw = (r.w - 80 - 40) / 3;
        for (let i = 0; i < 3; i++) {
          picture(ctx, r.x + 40 + i * (gw + 20), r.y + 160, gw, 200, i + 1, 14);
          lines(ctx, r.x + 40 + i * (gw + 20), r.y + 384, gw - 40, 2, { seed: i * 5, gap: 16, h: 8 });
        }
      }
      // pink panel: forward sweeps left to right, back sweeps right to left
      const fwdIn = ep(t, 1.0, 1.4), fwdOut = ep(t, 1.45, 1.85);
      const bkIn = ep(t, 3.0, 3.4), bkOut = ep(t, 3.45, 3.85);
      let a = 0, b = 0;
      if (t >= 1.0 && t < 1.9) { a = fwdOut; b = fwdIn; }
      else if (t >= 3.0 && t < 3.9) { a = 1 - bkIn; b = 1 - bkOut; }
      if (b > a) {
        ctx.fillStyle = C.pink; ctx.fillRect(r.x + r.w * a, r.y, r.w * (b - a), r.h);
        const mid = r.x + r.w * (a + b) / 2;
        fillRR(ctx, mid - 30, r.y + r.h / 2 - 30, 60, 60, 16, 'rgba(18,16,22,0.25)');
      }
      ctx.restore();
      const sx = r.x + 420, sy = r.y + 400;
      const [cx, cy] = path(t, [[0, sx, sy], [0.85, linkX + 120, linkY + 4], [1.2, linkX + 120, linkY + 4], [2.8, backX + 50, backY + 4], [3.2, backX + 50, backY + 4], [4.6, sx, sy], [5.4, sx, sy]]);
      const press = ep(t, 0.85, 0.95) - ep(t, 0.95, 1.1) + ep(t, 2.8, 2.9) - ep(t, 2.9, 3.05);
      cursor(ctx, cx, cy, { press, ring: Math.max(seg(t, 0.95, 1.35) % 1, seg(t, 2.9, 3.3) % 1) });
    },
  };

  // 7. Infinite marquee
  DEMOS['infinite-marquee'] = {
    cycle: 6, posterAt: 2,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = browser(ctx, W, H, BIG);
      clipTo(ctx, r, 0);
      text(ctx, 'Made for every kind of maker', r.x + r.w / 2, r.y + 52, { size: 30, weight: 800, align: 'center' });
      const p = t / 6;
      // row 1: big words with stars, moving left
      const w1 = ['Design', 'Motion', 'Colour', 'Layout'];
      const s1 = 76, g1 = 44, star = 44;
      const ww1 = w1.map(w => measure(ctx, w, s1, 800));
      const P1 = ww1.reduce((a, b) => a + b, 0) + w1.length * (g1 * 2 + star);
      const y1 = r.y + 185;
      const off1 = -p * P1;
      for (let k = -1; k * P1 + off1 < r.w + P1; k++) {
        let x = r.x + off1 + k * P1;
        w1.forEach((w, i) => {
          text(ctx, w, x, y1, { size: s1, weight: 800, color: C.ink }); x += ww1[i] + g1;
          text(ctx, '✦', x + star / 2, y1, { size: star, weight: 800, color: C.pink, align: 'center' }); x += star + g1;
        });
      }
      // row 2: outlined pills, moving right
      const w2 = ['Type', 'Light', 'Sound', 'Story', 'Craft'];
      const s2 = 46, pad = 40, g2 = 24, ph = 100;
      const ww2 = w2.map(w => measure(ctx, w, s2, 700) + pad * 2);
      const P2 = ww2.reduce((a, b) => a + b, 0) + w2.length * g2;
      const y2 = r.y + 345;
      const off2 = p * P2 - P2;
      for (let k = -1; k * P2 + off2 < r.w + P2; k++) {
        let x = r.x + off2 + k * P2;
        w2.forEach((w, i) => {
          const col = i % 2 ? C.teal : C.pink;
          fillRR(ctx, x, y2 - ph / 2, ww2[i], ph, ph / 2, i % 2 ? 'rgba(79,216,196,0.12)' : 'rgba(255,95,162,0.12)');
          ctx.lineWidth = 3; rr(ctx, x, y2 - ph / 2, ww2[i], ph, ph / 2); ctx.strokeStyle = col; ctx.stroke();
          text(ctx, w, x + ww2[i] / 2, y2 + 1, { size: s2, weight: 700, color: col, align: 'center' });
          x += ww2[i] + g2;
        });
      }
      // soft fade at both edges
      const fl = ctx.createLinearGradient(r.x, 0, r.x + 120, 0); fl.addColorStop(0, C.card); fl.addColorStop(1, 'rgba(27,23,34,0)');
      ctx.fillStyle = fl; ctx.fillRect(r.x, r.y + 100, 120, r.h - 100);
      const fr = ctx.createLinearGradient(r.x + r.w - 120, 0, r.x + r.w, 0); fr.addColorStop(0, 'rgba(27,23,34,0)'); fr.addColorStop(1, C.card);
      ctx.fillStyle = fr; ctx.fillRect(r.x + r.w - 120, r.y + 100, 120, r.h - 100);
      ctx.restore();
    },
  };

  // 8. Animated gradient background
  DEMOS['animated-gradient-background'] = {
    cycle: 6, posterAt: 1.5,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = browser(ctx, W, H, BIG);
      clipTo(ctx, r, 0);
      ctx.fillStyle = '#24163a'; ctx.fillRect(r.x, r.y, r.w, r.h);
      const ph = t / 6 * TAU;
      const blobs = [
        [C.pink, 0.25, 0.3, 0.22, 0.25, 0, 1, 360],
        [C.violet, 0.75, 0.35, 0.2, 0.3, 2.1, 1, 380],
        [C.teal, 0.55, 0.85, 0.28, 0.2, 4.2, 2, 340],
        [C.gold, 0.15, 0.85, 0.18, 0.22, 1.2, 1, 280],
        ['#ff8a5c', 0.9, 0.9, 0.15, 0.25, 3.3, 2, 300],
      ];
      ctx.globalCompositeOperation = 'screen';
      for (const [col, bx, by, ax, ay, phi, m, rad] of blobs) {
        const x = r.x + r.w * (bx + ax * Math.cos(ph + phi)), y = r.y + r.h * (by + ay * Math.sin(ph * m + phi));
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
        g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = 0.85; ctx.fillStyle = g; ctx.fillRect(r.x, r.y, r.w, r.h);
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(18,16,22,0.18)'; ctx.fillRect(r.x, r.y, r.w, r.h);
      const cx = r.x + r.w / 2;
      shadow(ctx, 20, 4, 'rgba(0,0,0,0.35)');
      text(ctx, 'Make something lovely', cx, r.y + 170, { size: 56, weight: 800, color: C.white, align: 'center' });
      text(ctx, 'A calm home for bold ideas', cx, r.y + 232, { size: 24, weight: 500, color: 'rgba(255,255,255,0.85)', align: 'center' });
      noShadow(ctx);
      shadow(ctx, 24, 10, 'rgba(0,0,0,0.3)');
      button(ctx, cx - 120, r.y + 290, 240, 64, 'Get started', { fill: C.white, color: C.bg, size: 22 });
      noShadow(ctx);
      ctx.restore();
    },
  };

  // 9. Staggered reveal
  DEMOS['staggered-reveal'] = {
    cycle: 5, posterAt: 2.4,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = browser(ctx, W, H, BIG);
      clipTo(ctx, r, 0);
      navBar(ctx, r);
      const fade = 1 - ep(t, 4.1, 4.6);
      const linesW = [['Design', 'that'], ['feels', 'alive.']];
      const size = 72, lx = r.x + 60, ly = [r.y + 150, r.y + 240];
      let k = 0;
      linesW.forEach((ws, li) => {
        let x = lx;
        ws.forEach(w => {
          const st = 0.4 + k * 0.16;
          const p = ep(t, st, st + 0.55, ease.out);
          const w0 = measure(ctx, w, size, 800);
          ctx.save(); ctx.beginPath(); ctx.rect(x - 4, ly[li] - 50, w0 + 12, 100); ctx.clip();
          ctx.globalAlpha = p * fade;
          text(ctx, w, x, ly[li] + (1 - p) * 80, { size, weight: 800, color: li === 1 && w === 'alive.' ? C.pink : C.ink });
          ctx.restore();
          x += w0 + 24; k++;
        });
      });
      // buttons follow
      const bts = [['Start free', C.pink, C.bg], ['See how', C.card2, C.ink], ['Pricing', C.card2, C.ink]];
      let bx = lx;
      bts.forEach(([l, f, c], i) => {
        const st = 1.25 + i * 0.14;
        const p = ep(t, st, st + 0.45, ease.out);
        const bw = 200;
        ctx.globalAlpha = p * fade;
        button(ctx, bx, r.y + 330 + (1 - p) * 40, bw, 64, l, { fill: f, color: c, size: 22 });
        if (f === C.card2) fillRR(ctx, bx, r.y + 330 + (1 - p) * 40, bw, 64, 32, null, C.dim);
        ctx.globalAlpha = 1;
        bx += bw + 20;
      });
      ctx.restore();
    },
  };

  // 10. Number counter
  DEMOS['number-counter'] = {
    cycle: 5, posterAt: 1.0,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = browser(ctx, W, H, BIG);
      clipTo(ctx, r, 0);
      text(ctx, 'Why people stay', r.x + r.w / 2, r.y + 60, { size: 34, weight: 800, align: 'center' });
      const cards = [
        [12000, v => Math.round(v).toLocaleString('en-US') + '+', 'Happy makers', C.pink],
        [98, v => Math.round(v) + '%', 'Would come back', C.teal],
        [4.9, v => v.toFixed(1), 'Average rating', C.gold],
      ];
      const gap = 24, cw = (r.w - 60 - gap * 2) / 3, ch = 260, cy = r.y + 120;
      const vis = 1 - ep(t, 4.2, 4.5) + ep(t, 4.55, 4.85);
      cards.forEach(([val, fmt, label, col], i) => {
        const x = r.x + 30 + i * (cw + gap);
        const st = 0.4 + i * 0.15;
        const p = t < 4.5 ? ease.out(seg(t, st, st + 1.9)) : 0;
        shadow(ctx, 24, 10); fillRR(ctx, x, cy, cw, ch, 20, C.card2); noShadow(ctx);
        fillRR(ctx, x, cy, cw, ch, 20, null, C.line);
        ctx.globalAlpha = vis;
        text(ctx, fmt(val * p), x + cw / 2, cy + 105, { size: 64, weight: 800, color: col, align: 'center' });
        ctx.globalAlpha = 1;
        text(ctx, label, x + cw / 2, cy + 175, { size: 22, weight: 600, color: C.soft, align: 'center' });
        fillRR(ctx, x + 40, cy + 212, cw - 80, 10, 5, C.line);
        if (p > 0) fillRR(ctx, x + 40, cy + 212, (cw - 80) * p, 10, 5, col);
      });
      ctx.restore();
    },
  };

  // 11. Text scramble
  DEMOS['text-scramble'] = {
    cycle: 5, posterAt: 1.5,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = browser(ctx, W, H, BIG);
      clipTo(ctx, r, 0);
      navBar(ctx, r);
      const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*@$?!<>/+=';
      const rowsT = ['HELLO THERE,', 'CREATIVE MIND'];
      const size = 76, fade = 1 - ep(t, 4.2, 4.6);
      const step = Math.floor(t / 0.06);
      let n = 0;
      rowsT.forEach((s, li) => {
        const y = r.y + 175 + li * 100, x0 = r.x + 60;
        for (let i = 0; i < s.length; i++, n++) {
          const ch = s[i];
          if (ch === ' ') continue;
          const xL = x0 + measure(ctx, s.slice(0, i), size, 800), cw = measure(ctx, ch, size, 800);
          const appear = 0.3 + n * 0.02, settle = 0.9 + n * 0.07;
          if (t < appear) continue;
          const done = t >= settle;
          const g = done ? ch : charset[Math.floor(rnd(n * 53.7 + step * 1.31) * charset.length)];
          ctx.globalAlpha = fade;
          text(ctx, g, xL + cw / 2, y, { size, weight: 800, color: done ? (li === 1 ? C.pink : C.ink) : C.teal, align: 'center' });
          ctx.globalAlpha = 1;
        }
      });
      ctx.globalAlpha = fade * ep(t, 2.6, 3.0);
      lines(ctx, r.x + 64, r.y + 340, 420, 2, { seed: 5, gap: 18, h: 8 });
      ctx.globalAlpha = 1;
      ctx.restore();
    },
  };

  // 12. Confetti burst
  DEMOS['confetti-burst'] = {
    cycle: 5, posterAt: 1.45,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = browser(ctx, W, H, BIG);
      clipTo(ctx, r, 0);
      // a simple form card
      const fx = r.x + r.w / 2 - 230, fy = r.y + 40, fw = 460, fh = 380;
      shadow(ctx, 30, 12); fillRR(ctx, fx, fy, fw, fh, 22, C.card2); noShadow(ctx);
      text(ctx, 'Send your picks', fx + 36, fy + 52, { size: 30, weight: 800 });
      fillRR(ctx, fx + 36, fy + 92, fw - 72, 54, 12, C.bg, C.line);
      lines(ctx, fx + 54, fy + 116, 200, 1, { seed: 1, h: 8 });
      fillRR(ctx, fx + 36, fy + 162, fw - 72, 54, 12, C.bg, C.line);
      lines(ctx, fx + 54, fy + 186, 260, 1, { seed: 2, h: 8 });
      const bx = fx + 36, by = fy + 262, bw = fw - 72, bh = 72;
      const tc = 1.0;
      const press = ep(t, 0.9, tc) - ep(t, tc, tc + 0.15);
      const done = t >= tc + 0.05 && t < 4.4;
      if (done) button(ctx, bx, by + press * 3, bw, bh, '✓  Done', { fill: C.teal, color: C.bg, r: 16, size: 28 });
      else button(ctx, bx, by + press * 3, bw, bh, 'Submit', { r: 16, size: 28 });
      // confetti: every piece is a pure function of its index and time since the click
      const ox = bx + bw / 2, oy = by + 20;
      const tau = t - tc;
      if (tau > 0 && tau < 2.6) {
        const cols = [C.pink, C.teal, C.gold, C.violet, C.white];
        for (let i = 0; i < 90; i++) {
          const ang = -Math.PI / 2 + (rnd(i * 3.1) - 0.5) * 2.6;
          const sp = 520 + rnd(i * 7.7 + 1) * 620;
          const k = 2.2, d = (1 - Math.exp(-k * tau)) / k;
          const sway = Math.sin(tau * (4 + rnd(i + 9) * 4) + i) * 14 * seg(tau, 0.3, 1);
          const x = ox + Math.cos(ang) * sp * d + sway;
          const y = oy + Math.sin(ang) * sp * d + 260 * tau * tau;
          const a = 1 - seg(tau, 1.5 + rnd(i + 4) * 0.6, 2.4);
          if (a <= 0) continue;
          ctx.save(); ctx.translate(x, y); ctx.rotate(rnd(i + 2) * 6 + tau * (5 + rnd(i + 5) * 8));
          ctx.globalAlpha = a; ctx.fillStyle = cols[i % cols.length];
          if (i % 3 === 0) { ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.fill(); }
          else ctx.fillRect(-9, -5, 18, 10 * Math.abs(Math.cos(tau * 6 + i)) + 2);
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      const sx = r.x + r.w - 110, sy = r.y + r.h - 40;
      const [cx, cy] = path(t, [[0, sx, sy], [0.85, ox + 60, by + 44], [1.5, ox + 60, by + 44], [2.6, sx, sy], [5, sx, sy]]);
      cursor(ctx, cx, cy, { press, ring: seg(t, tc, tc + 0.4) % 1 });
    },
  };
})();
