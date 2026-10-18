/* Group web-c: web motion effects (scrolling, hover and cursor effects). */
(function () {
  const { C, FONT, clamp, lerp, seg, ease, ep, rnd, rr, fillRR, text, lines, shadow, noShadow, backdrop, browser, clipTo, cursor, path, picture, button } = KIT;

  // ---------- shared helpers ----------
  const BW = { w: 900, h: 500 };
  // keyed value: keys = [[t, v], ...], eased between keys
  function val(t, keys, fn = ease.inOut) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], fn(seg(t, keys[i - 1][0], keys[i][0])));
    }
    return keys[keys.length - 1][1];
  }
  // thin scrollbar on the right of rect r; p = 0..1 position, view = visible fraction of the page
  function scrollbar(ctx, r, p, view = 0.35, active = 1) {
    const x = r.x + r.w - 14, top = r.y + 8, h = r.h - 16;
    fillRR(ctx, x, top, 8, h, 4, 'rgba(255,255,255,0.06)');
    const th = Math.max(40, h * view), ty = top + (h - th) * clamp(p);
    fillRR(ctx, x, ty, 8, th, 4, `rgba(242,237,245,${0.45 + 0.35 * active})`);
  }
  // speed of a keyed scroll value, 0..1, used to light the scrollbar and the mouse wheel
  function moving(t, keys, scale) { return clamp(Math.abs(val(t + 0.03, keys) - val(t - 0.03, keys)) / scale); }
  // small mouse glyph with a wheel that rolls while scrolling
  function mouse(ctx, x, y, t, act, dir = 1) {
    fillRR(ctx, x - 17, y - 27, 34, 54, 17, 'rgba(18,16,22,0.72)', `rgba(242,237,245,${0.5 + 0.4 * act})`);
    const ph = ((t * 2.2) % 1 + 1) % 1;
    const wy = y - 13 + (act > 0.05 ? (dir > 0 ? ph : 1 - ph) * 10 : 0);
    fillRR(ctx, x - 3, wy, 6, 11, 3, act > 0.05 ? C.pink : C.soft);
    ctx.globalAlpha = act;
    const ay = y + 38;
    ctx.strokeStyle = C.pink; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 2; i++) {
      const yy = ay + i * 9 * dir;
      ctx.beginPath(); ctx.moveTo(x - 8, yy - 4 * dir); ctx.lineTo(x, yy + 4 * dir); ctx.lineTo(x + 8, yy - 4 * dir); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.lineCap = 'butt';
  }
  function card(ctx, x, y, w, h, hue, title, { lift = 0, seed = 0 } = {}) {
    shadow(ctx, 18 + lift * 40, 6 + lift * 30, `rgba(0,0,0,${0.35 + lift * 0.35})`);
    fillRR(ctx, x, y, w, h, 14, C.card2); noShadow(ctx);
    fillRR(ctx, x, y, w, h, 14, null, lift > 0.05 ? `rgba(255,95,162,${lift * 0.8})` : C.line);
    const ph = h * 0.58;
    picture(ctx, x + 10, y + 10, w - 20, ph - 10, hue, 10);
    text(ctx, title, x + 18, y + ph + 26, { size: 21, weight: 800 });
    lines(ctx, x + 18, y + ph + 50, w - 50, 2, { seed, gap: 14, h: 7 });
  }

  // ---------- 1. parallax scrolling ----------
  {
    const S = 230;
    const K = [[0, 0], [0.6, 0], [2.4, S], [3.6, S], [4.8, 0], [5.5, 0]];
    function ridge(ctx, r, base, amp, seed, fill, w) {
      ctx.beginPath(); ctx.moveTo(r.x - 10, r.y + r.h + 600);
      for (let i = 0; i <= 24; i++) {
        const x = r.x - 10 + (r.w + 20) * i / 24;
        const y = base - amp * (0.55 * Math.sin(i * 0.55 + seed) + 0.45 * Math.sin(i * 1.3 + seed * 2));
        ctx.lineTo(x, y);
      }
      ctx.lineTo(r.x + r.w + 10, r.y + r.h + 600); ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    }
    DEMOS['parallax-scrolling'] = {
      cycle: 5.5, posterAt: 1.5,
      draw(ctx, W, H, t) {
        backdrop(ctx, W, H);
        const r = browser(ctx, W, H, BW);
        const s = val(t, K);
        clipTo(ctx, r, 0);
        // layer 1: sky, barely moves
        const sy = -0.12 * s;
        const g = ctx.createLinearGradient(0, r.y + sy, 0, r.y + sy + r.h);
        g.addColorStop(0, C.card2); g.addColorStop(0.45, C.violet); g.addColorStop(1, C.pink);
        ctx.fillStyle = g; ctx.fillRect(r.x, r.y, r.w, r.h + 40);
        ctx.beginPath(); ctx.arc(r.x + 640, r.y + 150 + sy, 54, 0, 7); ctx.fillStyle = C.gold; ctx.fill();
        ctx.beginPath(); ctx.arc(r.x + 640, r.y + 150 + sy, 72, 0, 7); ctx.fillStyle = 'rgba(232,182,76,0.22)'; ctx.fill();
        [[150, 90, 1], [420, 60, 0.8], [760, 110, 0.7]].forEach(([cx, cy, k]) => {
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          fillRR(ctx, r.x + cx, r.y + cy + sy, 110 * k, 26 * k, 13 * k, 'rgba(255,255,255,0.3)');
          fillRR(ctx, r.x + cx + 26 * k, r.y + cy + sy - 14 * k, 60 * k, 26 * k, 13 * k, 'rgba(255,255,255,0.3)');
        });
        // layer 2: far hills, medium speed
        const fy = -0.45 * s;
        ridge(ctx, r, r.y + 285 + fy, 45, 1.2, C.violet, r.w);
        ridge(ctx, r, r.y + 285 + fy, 45, 1.2, 'rgba(18,16,22,0.3)', r.w);
        // page title moves with the page
        text(ctx, 'Into the hills', r.x + 60, r.y + 120 - s, { size: 50, weight: 800, color: C.white });
        text(ctx, 'A slow walk at sunset', r.x + 62, r.y + 168 - s, { size: 22, weight: 600, color: 'rgba(255,255,255,0.85)' });
        // layer 3: near hills, full speed, merging into the page body
        const ny = -1.0 * s;
        ridge(ctx, r, r.y + 400 + ny, 38, 3.7, C.teal, r.w);
        ridge(ctx, r, r.y + 418 + ny, 34, 5.1, C.desk, r.w);
        // body content below the hero
        for (let i = 0; i < 3; i++) {
          const cw = 250, cx = r.x + 60 + i * (cw + 25), cy = r.y + 470 - s;
          fillRR(ctx, cx, cy, cw, 190, 14, C.card2);
          picture(ctx, cx + 10, cy + 10, cw - 20, 110, i + 1, 10);
          lines(ctx, cx + 16, cy + 136, cw - 40, 3, { seed: i * 3 });
        }
        scrollbar(ctx, r, s / S * 0.6, 0.5, moving(t, K, 6));
        ctx.restore();
      },
    };
  }

  // ---------- 2. fade in on scroll ----------
  {
    const S = 540;
    const K = [[0, 0], [0.5, 0], [2.6, S], [3.8, S], [4.8, 0], [5.5, 0]];
    const ROW0 = 240, STEP = 225, CH = 200;
    // first time the scroll value reaches v on the way down
    function reach(v) {
      for (let tt = 0.5; tt <= 2.6; tt += 0.005) if (val(tt, K) >= v) return tt;
      return 99;
    }
    const trig = [0, 1, 2, 3].map(i => (i === 0 ? -1 : reach(ROW0 + i * STEP - (463 - 70))));
    DEMOS['fade-in-on-scroll'] = {
      cycle: 5.5, posterAt: 1.9,
      draw(ctx, W, H, t) {
        backdrop(ctx, W, H);
        const r = browser(ctx, W, H, BW);
        const s = val(t, K);
        clipTo(ctx, r, 0);
        text(ctx, 'Latest stories', r.x + 50, r.y + 80 - s, { size: 44, weight: 800 });
        lines(ctx, r.x + 50, r.y + 128 - s, 420, 3, { seed: 4, gap: 18, h: 8 });
        const cw = (r.w - 100 - 2 * 26) / 3;
        const titles = ['City lights', 'Ocean days', 'Forest trail', 'Night market', 'Snow peaks', 'Desert road', 'Rainy cafe', 'Old harbour', 'Sky garden', 'Quiet lake', 'Paper boats', 'Sun fields'];
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 3; col++) {
            let p = 1;
            if (row > 0) p = t >= 4.85 ? 0 : ep(t, trig[row] + col * 0.12, trig[row] + col * 0.12 + 0.55, ease.out);
            if (p <= 0) continue;
            const x = r.x + 50 + col * (cw + 26), y = r.y + ROW0 + row * STEP - s + (1 - p) * 60;
            ctx.globalAlpha = p;
            card(ctx, x, y, cw, CH, row * 3 + col, titles[row * 3 + col], { seed: row * 3 + col });
            ctx.globalAlpha = 1;
          }
        }
        scrollbar(ctx, r, s / S, 0.4, moving(t, K, 8));
        ctx.restore();
      },
    };
  }

  // ---------- 3. sticky header ----------
  {
    const S = 380;
    const K = [[0, 0], [0.6, 0], [2.3, S], [3.6, S], [4.8, 0], [5.5, 0]];
    DEMOS['sticky-header'] = {
      cycle: 5.5, posterAt: 2.6,
      draw(ctx, W, H, t) {
        backdrop(ctx, W, H);
        const r = browser(ctx, W, H, BW);
        const s = val(t, K);
        const k = clamp(s / 90);
        clipTo(ctx, r, 0);
        // page content scrolling under the header
        const top = r.y + 90 - s;
        text(ctx, 'Fresh ideas, every week', r.x + 50, top + 60, { size: 42, weight: 800 });
        lines(ctx, r.x + 50, top + 104, 520, 3, { seed: 2, gap: 18, h: 8 });
        const cw = (r.w - 100 - 2 * 24) / 3;
        for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
          const x = r.x + 50 + col * (cw + 24), y = top + 170 + row * 210;
          fillRR(ctx, x, y, cw, 190, 14, C.card2);
          picture(ctx, x + 10, y + 10, cw - 20, 118, row * 3 + col, 10);
          lines(ctx, x + 16, y + 146, cw - 40, 2, { seed: row * 3 + col });
        }
        // the header: pinned at the top, shrinks and gains a shadow once the page moves
        const hh = lerp(88, 64, k);
        shadow(ctx, 30 * k, 14 * k, `rgba(0,0,0,${0.6 * k})`);
        ctx.fillStyle = `rgba(36,30,45,${0.82 + 0.15 * k})`; ctx.fillRect(r.x, r.y, r.w, hh); noShadow(ctx);
        ctx.fillStyle = k > 0.02 ? `rgba(255,95,162,${0.6 * k})` : C.line; ctx.fillRect(r.x, r.y + hh - 2, r.w, 2);
        const lr = lerp(17, 13, k), cy = r.y + hh / 2;
        ctx.beginPath(); ctx.arc(r.x + 50, cy, lr, 0, 7); ctx.fillStyle = C.pink; ctx.fill();
        text(ctx, 'Studio', r.x + 50 + lr + 14, cy + 1, { size: lerp(28, 22, k), weight: 800 });
        ['Work', 'About', 'Blog'].forEach((n, i) => text(ctx, n, r.x + 470 + i * 96, cy + 1, { size: lerp(19, 17, k), weight: 600, color: C.soft }));
        const bh = lerp(46, 38, k);
        button(ctx, r.x + r.w - 170, cy - bh / 2, 120, bh, 'Join', { size: lerp(18, 16, k) });
        scrollbar(ctx, { x: r.x, y: r.y + hh, w: r.w, h: r.h - hh }, s / S, 0.45, moving(t, K, 8));
        ctx.restore();
      },
    };
  }

  // ---------- 4. scroll pinning ----------
  {
    const INTRO = 260, STEPH = 200, PIN = 3 * STEPH, SMAX = 1060;
    const K = [[0, 0], [0.4, 0], [1.1, 360], [1.8, 360], [2.15, 560], [2.85, 560], [3.2, 760], [3.9, 760], [4.4, SMAX], [4.85, SMAX], [5.6, 0], [6, 0]];
    const STEPS = [['01', 'Pick a style'], ['02', 'Add your words'], ['03', 'Share it']];
    DEMOS['scroll-pinning'] = {
      cycle: 6, posterAt: 2.5,
      draw(ctx, W, H, t) {
        backdrop(ctx, W, H);
        const r = browser(ctx, W, H, BW);
        const s = val(t, K);
        const off = s < INTRO ? s : s < INTRO + PIN ? INTRO : s - PIN;
        const v = clamp((s - INTRO - 100) / STEPH, 0, 2);
        clipTo(ctx, r, 0);
        // intro section
        text(ctx, 'How it works', r.x + 60, r.y + 110 - off, { size: 46, weight: 800 });
        lines(ctx, r.x + 60, r.y + 160 - off, 460, 3, { seed: 7, gap: 18, h: 8 });
        // the pinned section
        const py = r.y + INTRO - off;
        ctx.fillStyle = C.card2; ctx.fillRect(r.x, py, r.w, r.h);
        for (let k = 0; k < 3; k++) {
          const a = clamp(1 - Math.abs(v - k) * 1.6);
          if (a <= 0) continue;
          const dy = (k - v) * 70;
          ctx.globalAlpha = a;
          text(ctx, STEPS[k][0], r.x + 60, py + 150 + dy, { size: 130, weight: 800, color: C.pink });
          text(ctx, STEPS[k][1], r.x + 66, py + 260 + dy, { size: 34, weight: 800 });
          lines(ctx, r.x + 66, py + 300 + dy, 320, 3, { seed: k * 5, gap: 18, h: 8 });
          picture(ctx, r.x + 480, py + 60 + dy * 0.5, 340, 300, k + 1, 18);
          ctx.globalAlpha = 1;
        }
        // step progress
        for (let k = 0; k < 3; k++) {
          const f = clamp(v + 1 - k);
          fillRR(ctx, r.x + 66 + k * 120, py + 395, 104, 10, 5, C.line);
          fillRR(ctx, r.x + 66 + k * 120, py + 395, 104 * f, 10, 5, C.pink);
        }
        // section after the pin
        const ny = py + r.h;
        ctx.fillStyle = C.card; ctx.fillRect(r.x, ny, r.w, 400);
        text(ctx, 'Ready to begin?', r.x + 60, ny + 80, { size: 40, weight: 800 });
        button(ctx, r.x + 60, ny + 130, 200, 56, 'Start now', { size: 20 });
        const act = moving(t, K, 10);
        scrollbar(ctx, r, s / SMAX, 0.3, act);
        mouse(ctx, r.x + r.w - 60, r.y + r.h - 90, t, act, val(t + 0.03, K) >= val(t - 0.03, K) ? 1 : -1);
        ctx.restore();
      },
    };
  }

  // ---------- 5. horizontal scroll ----------
  {
    const K = [[0, 0], [0.5, 0], [2.6, 1], [3.6, 1], [4.8, 0], [5.5, 0]];
    DEMOS['horizontal-scroll'] = {
      cycle: 5.5, posterAt: 1.6,
      draw(ctx, W, H, t) {
        backdrop(ctx, W, H);
        const r = browser(ctx, W, H, BW);
        const p = val(t, K);
        clipTo(ctx, r, 0);
        text(ctx, 'Our journey', r.x + 60, r.y + 62, { size: 40, weight: 800 });
        const cw = 300, gap = 30, n = 5, total = n * cw + (n - 1) * gap;
        const travel = total - (r.w - 120);
        const x0 = r.x + 60 - p * travel;
        for (let i = 0; i < n; i++) {
          const x = x0 + i * (cw + gap), y = r.y + 110;
          shadow(ctx, 24, 10); fillRR(ctx, x, y, cw, 300, 18, C.card2); noShadow(ctx);
          picture(ctx, x + 12, y + 12, cw - 24, 190, i, 12);
          text(ctx, 'Chapter ' + (i + 1), x + 22, y + 232, { size: 26, weight: 800 });
          lines(ctx, x + 22, y + 260, cw - 60, 2, { seed: i * 2, h: 7 });
        }
        // sideways position track
        fillRR(ctx, r.x + 60, r.y + 434, 300, 6, 3, C.line);
        fillRR(ctx, r.x + 60 + p * 200, r.y + 434, 100, 6, 3, C.pink);
        const act = moving(t, K, 0.02);
        scrollbar(ctx, r, p, 0.35, act);
        mouse(ctx, r.x + r.w - 70, r.y + 60, t, act, val(t + 0.03, K) >= val(t - 0.03, K) ? 1 : -1);
        ctx.restore();
      },
    };
  }

  // ---------- 6. scroll snap ----------
  {
    const PH = 463;
    const snap = p => ease.outBack(p * p * (3 - 2 * p), 0.7);
    const K = [[0, 0], [0.8, 0], [1.4, 1], [2.5, 1], [3.1, 2], [4.2, 2], [5.2, 0], [6, 0]];
    const NAMES = ['Morning', 'Noon', 'Night'];
    DEMOS['scroll-snap'] = {
      cycle: 6, posterAt: 1.15,
      draw(ctx, W, H, t) {
        backdrop(ctx, W, H);
        const r = browser(ctx, W, H, BW);
        const s = val(t, K, t > 4.2 && t < 5.2 ? ease.inOut : snap) * PH;
        clipTo(ctx, r, 0);
        for (let i = 0; i < 3; i++) {
          const y = r.y + i * PH - s;
          if (y > r.y + r.h || y + PH < r.y) continue;
          picture(ctx, r.x, y, r.w, PH, [4, 2, 3][i], 0);
          const g = ctx.createLinearGradient(0, y + PH * 0.4, 0, y + PH);
          g.addColorStop(0, 'rgba(18,16,22,0)'); g.addColorStop(1, 'rgba(18,16,22,0.75)');
          ctx.fillStyle = g; ctx.fillRect(r.x, y, r.w, PH);
          text(ctx, '0' + (i + 1), r.x + 70, y + PH - 150, { size: 28, weight: 800, color: 'rgba(255,255,255,0.8)' });
          text(ctx, NAMES[i], r.x + 66, y + PH - 95, { size: 64, weight: 800, color: C.white });
          ctx.fillStyle = 'rgba(18,16,22,0.5)'; ctx.fillRect(r.x, y + PH - 3, r.w, 3);
        }
        // panel dots
        const cur = s / PH;
        for (let i = 0; i < 3; i++) {
          const a = clamp(1 - Math.abs(cur - i));
          ctx.beginPath(); ctx.arc(r.x + r.w - 48, r.y + r.h / 2 - 36 + i * 36, 7 + a * 4, 0, 7);
          ctx.fillStyle = a > 0.5 ? C.pink : 'rgba(255,255,255,0.55)'; ctx.fill();
        }
        scrollbar(ctx, r, cur / 2, 1 / 3, moving(t, K, 0.02));
        ctx.restore();
      },
    };
  }

  // ---------- 7. scroll progress bar ----------
  {
    const S = 760;
    const K = [[0, 0], [0.5, 0], [3.2, S], [4.4, S], [5.4, 0], [6, 0]];
    DEMOS['scroll-progress-bar'] = {
      cycle: 6, posterAt: 2.0,
      draw(ctx, W, H, t) {
        backdrop(ctx, W, H);
        const r = browser(ctx, W, H, BW);
        const s = val(t, K);
        clipTo(ctx, r, 0);
        const cx = r.x + 150, top = r.y + 40 - s;
        text(ctx, 'How to brew better coffee', cx, top + 40, { size: 40, weight: 800 });
        ctx.beginPath(); ctx.arc(cx + 18, top + 100, 18, 0, 7); ctx.fillStyle = C.teal; ctx.fill();
        text(ctx, '6 minute read', cx + 48, top + 101, { size: 18, color: C.soft });
        lines(ctx, cx, top + 150, 600, 6, { seed: 1, gap: 22, h: 9 });
        picture(ctx, cx, top + 300, 600, 220, 4, 16);
        lines(ctx, cx, top + 560, 600, 6, { seed: 9, gap: 22, h: 9 });
        text(ctx, 'The water matters', cx, top + 730, { size: 30, weight: 800 });
        lines(ctx, cx, top + 775, 600, 7, { seed: 15, gap: 22, h: 9 });
        lines(ctx, cx, top + 950, 600, 7, { seed: 22, gap: 22, h: 9 });
        lines(ctx, cx, top + 1130, 600, 4, { seed: 31, gap: 22, h: 9 });
        // the bar across the top
        ctx.fillStyle = C.line; ctx.fillRect(r.x, r.y, r.w, 10);
        const p = s / S;
        shadow(ctx, 14, 0, 'rgba(255,95,162,0.7)');
        ctx.fillStyle = C.pink; ctx.fillRect(r.x, r.y, r.w * p, 10); noShadow(ctx);
        scrollbar(ctx, { x: r.x, y: r.y + 10, w: r.w, h: r.h - 10 }, p, 0.3, moving(t, K, 10));
        ctx.restore();
      },
    };
  }

  // ---------- 8. text highlight sweep ----------
  {
    const LINES = ['We turn rough ideas', 'into clear, simple pictures', 'that anyone can follow.'];
    DEMOS['text-highlight-sweep'] = {
      cycle: 5, posterAt: 1.6,
      draw(ctx, W, H, t) {
        backdrop(ctx, W, H);
        const r = browser(ctx, W, H, BW);
        clipTo(ctx, r, 0);
        const x = r.x + 90, size = 52;
        text(ctx, 'Our promise', x, r.y + 70, { size: 22, weight: 700, color: C.teal });
        const fade = 1 - ep(t, 4.1, 4.6);
        ctx.font = `800 ${size}px ${FONT}`;
        LINES.forEach((ln, i) => {
          const y = r.y + 150 + i * 78;
          const w = ctx.measureText(ln).width;
          const p = ep(t, 0.5 + i * 0.6, 1.0 + i * 0.6, ease.inOut);
          if (p > 0 && fade > 0) {
            ctx.globalAlpha = fade;
            const hw = (w + 20) * p;
            ctx.save(); ctx.translate(x - 10, y + 4); ctx.transform(1, 0, -0.08, 1, 0, 0);
            fillRR(ctx, 0, -size * 0.36, hw, size * 0.78, 8, 'rgba(255,95,162,0.62)');
            ctx.restore();
            ctx.globalAlpha = 1;
          }
          text(ctx, ln, x, y, { size, weight: 800 });
          ctx.font = `800 ${size}px ${FONT}`;
        });
        lines(ctx, x, r.y + 370, 600, 3, { seed: 5, gap: 20, h: 9 });
        ctx.restore();
      },
    };
  }

  // ---------- 9. hover lift ----------
  {
    const CW = 240, CHt = 290;
    DEMOS['hover-lift'] = {
      cycle: 5, posterAt: 1.5,
      draw(ctx, W, H, t) {
        backdrop(ctx, W, H);
        const r = browser(ctx, W, H, BW);
        const gap = (r.w - 3 * CW) / 4;
        const xs = [0, 1, 2].map(i => r.x + gap + i * (CW + gap)), y0 = r.y + 120;
        const hov = [[0.75, 1.9], [2.15, 3.05], [3.35, 4.15]];
        const lifts = hov.map(([a, b]) => ep(t, a, a + 0.35, ease.out) - ep(t, b, b + 0.4, ease.inOut));
        clipTo(ctx, r, 0);
        text(ctx, 'Pick a trip', r.x + gap, r.y + 62, { size: 38, weight: 800 });
        ['Mountains', 'Coastline', 'Old town'].forEach((n, i) => {
          const L = lifts[i], cx = xs[i] + CW / 2, cy = y0 + CHt / 2 - L * 30;
          ctx.save(); ctx.translate(cx, cy); ctx.scale(1 + L * 0.06, 1 + L * 0.06);
          card(ctx, -CW / 2, -CHt / 2, CW, CHt, i, n, { lift: L, seed: i * 4 });
          ctx.restore();
        });
        ctx.restore();
        const cy = y0 + 150;
        const [mx, my] = path(t, [[0, r.x + 120, r.y + r.h - 20], [0.4, r.x + 120, r.y + r.h - 20], [0.85, xs[0] + 150, cy], [1.95, xs[0] + 150, cy],
          [2.3, xs[1] + 150, cy + 10], [3.15, xs[1] + 150, cy + 10], [3.5, xs[2] + 140, cy], [4.2, xs[2] + 140, cy], [4.85, r.x + 120, r.y + r.h - 20], [5, r.x + 120, r.y + r.h - 20]]);
        cursor(ctx, mx, my);
      },
    };
  }

  // ---------- 10. image zoom on hover ----------
  {
    DEMOS['image-zoom-on-hover'] = {
      cycle: 5.5, posterAt: 2.6,
      draw(ctx, W, H, t) {
        backdrop(ctx, W, H);
        const r = browser(ctx, W, H, BW);
        clipTo(ctx, r, 0);
        const fw = 600, fh = 360, fx = r.x + (r.w - fw) / 2, fy = r.y + (r.h - fh) / 2;
        const on = ep(t, 1.0, 1.4, ease.out) - ep(t, 3.6, 4.0, ease.inOut);
        const z = 1 + 0.2 * (ep(t, 1.0, 3.4, ease.out) - ep(t, 3.6, 4.3, ease.inOut));
        shadow(ctx, 30 + on * 16, 12 + on * 8); fillRR(ctx, fx, fy, fw, fh, 20, C.card2); noShadow(ctx);
        ctx.save(); rr(ctx, fx, fy, fw, fh, 20); ctx.clip();
        ctx.translate(fx + fw * 0.55, fy + fh * 0.45); ctx.scale(z, z); ctx.translate(-(fx + fw * 0.55), -(fy + fh * 0.45));
        picture(ctx, fx, fy, fw, fh, 3, 0);
        // extra scenery so the zoom is easy to see
        for (let i = 0; i < 3; i++) {
          const tx = fx + 90 + i * 70, ty = fy + fh - 70 - i * 8;
          ctx.beginPath(); ctx.moveTo(tx, ty - 70); ctx.lineTo(tx - 26, ty); ctx.lineTo(tx + 26, ty); ctx.closePath(); ctx.fillStyle = 'rgba(18,16,22,0.6)'; ctx.fill();
          ctx.fillStyle = 'rgba(18,16,22,0.6)'; ctx.fillRect(tx - 4, ty, 8, 16);
        }
        fillRR(ctx, fx + 120, fy + 70, 120, 30, 15, 'rgba(255,255,255,0.4)');
        fillRR(ctx, fx + 150, fy + 52, 64, 30, 15, 'rgba(255,255,255,0.4)');
        ctx.restore();
        // caption sliding up from the bottom edge
        ctx.save(); rr(ctx, fx, fy, fw, fh, 20); ctx.clip();
        const ch = 100, cy = fy + fh - ch * on;
        const g = ctx.createLinearGradient(0, cy, 0, cy + ch); g.addColorStop(0, 'rgba(18,16,22,0.55)'); g.addColorStop(1, 'rgba(18,16,22,0.9)');
        ctx.fillStyle = g; ctx.fillRect(fx, cy, fw, ch);
        text(ctx, 'Forest at dawn', fx + 30, cy + 40, { size: 30, weight: 800 });
        text(ctx, '24 photos', fx + 30, cy + 74, { size: 18, color: C.soft });
        ctx.restore();
        fillRR(ctx, fx, fy, fw, fh, 20, null, on > 0.05 ? `rgba(255,95,162,${on * 0.7})` : C.line);
        ctx.restore();
        const [mx, my] = path(t, [[0, fx + fw + 90, fy + fh + 40], [0.4, fx + fw + 90, fy + fh + 40], [1.0, fx + fw * 0.5, fy + fh * 0.4], [3.55, fx + fw * 0.52, fy + fh * 0.42],
          [4.1, fx + fw + 90, fy + fh + 40], [5.5, fx + fw + 90, fy + fh + 40]]);
        cursor(ctx, mx, my);
      },
    };
  }

  // ---------- 11. cursor follower ----------
  {
    const CYC = 5;
    function cur(t, r) {
      const bx = r.x + 200, by = r.y + 300;
      return path(((t % CYC) + CYC) % CYC, [[0, r.x + 720, r.y + 360], [0.3, r.x + 720, r.y + 360], [0.85, r.x + 560, r.y + 120], [1.35, r.x + 300, r.y + 200],
        [1.75, bx + 100, by + 30], [2.95, bx + 104, by + 32], [3.45, r.x + 480, r.y + 220], [3.95, r.x + 640, r.y + 120], [4.45, r.x + 720, r.y + 360], [5, r.x + 720, r.y + 360]]);
    }
    DEMOS['cursor-follower'] = {
      cycle: CYC, posterAt: 1.25,
      draw(ctx, W, H, t) {
        backdrop(ctx, W, H);
        const r = browser(ctx, W, H, BW);
        clipTo(ctx, r, 0);
        text(ctx, 'Make something', r.x + 100, r.y + 110, { size: 52, weight: 800 });
        text(ctx, 'wonderful today', r.x + 100, r.y + 172, { size: 52, weight: 800, color: C.pink });
        lines(ctx, r.x + 100, r.y + 220, 420, 2, { seed: 3, gap: 18, h: 8 });
        const bx = r.x + 200, by = r.y + 300;
        const hv = ep(t, 1.65, 2.0, ease.outBack) - ep(t, 2.95, 3.25, ease.inOut);
        button(ctx, r.x + 100, by, 200, 62, 'Get started', { size: 21 });
        text(ctx, 'Learn more', r.x + 340, by + 31, { size: 21, weight: 700, color: C.soft });
        // follower: weighted average of where the cursor has been, so it lags behind
        let sx = 0, sy = 0, sw = 0;
        for (let k = 0; k < 40; k++) {
          const w = Math.exp(-k / 9), [px, py] = cur(t - k * 0.015, r);
          sx += px * w; sy += py * w; sw += w;
        }
        const fx = sx / sw, fy = sy / sw, rad = lerp(22, 74, hv);
        ctx.beginPath(); ctx.arc(fx, fy, rad, 0, 7); ctx.fillStyle = `rgba(255,95,162,${0.28 + 0.12 * hv})`; ctx.fill();
        ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(255,95,162,0.9)'; ctx.stroke();
        ctx.restore();
        const [mx, my] = cur(t, r);
        cursor(ctx, mx, my);
      },
    };
  }

  // ---------- 12. magnetic button ----------
  {
    DEMOS['magnetic-button'] = {
      cycle: 5.5, posterAt: 3.45,
      draw(ctx, W, H, t) {
        backdrop(ctx, W, H);
        const r = browser(ctx, W, H, BW);
        const cx = r.x + r.w / 2, cy = r.y + 275, R = 260;
        const far = [r.x + r.w - 90, r.y + r.h - 40];
        const keys = [[0, far[0], far[1]], [0.4, far[0], far[1]], [1.2, cx + 150, cy - 70], [1.8, cx + 135, cy + 55], [2.2, cx + 30, cy + 8], [2.9, cx + 30, cy + 8],
          [3.3, cx - 140, cy - 50], [3.55, cx - 140, cy - 50], [3.85, r.x + 120, r.y + r.h - 30], [4.9, far[0], far[1]], [5.5, far[0], far[1]]];
        const pull = (mx, my) => { const dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy); const m = clamp(1 - (d - 50) / (R - 50)); return [dx * 0.6 * m, dy * 0.6 * m, m]; };
        let [mx, my] = path(t, keys);
        let ox, oy, m;
        const TR = 3.55;
        if (t < TR) [ox, oy, m] = pull(mx, my);
        else {
          const [px, py] = path(TR, keys), [rx, ry] = pull(px, py);
          const q = 1 - ease.outElastic(seg(t, TR, TR + 1.0));
          ox = rx * q; oy = ry * q; m = clamp(1 - seg(t, TR, TR + 0.3));
        }
        // click squash at 2.45
        const sq = ep(t, 2.4, 2.5) * (1 - ease.outBack(seg(t, 2.5, 2.85), 2.2));
        const press = ep(t, 2.4, 2.5) - ep(t, 2.5, 2.65);
        clipTo(ctx, r, 0);
        text(ctx, 'Ready to start?', cx, r.y + 80, { size: 46, weight: 800, align: 'center' });
        text(ctx, 'We would love to hear from you', cx, r.y + 128, { size: 20, color: C.soft, align: 'center' });
        // faint field ring
        ctx.beginPath(); ctx.arc(cx, cy, 170, 0, 7); ctx.setLineDash([6, 8]);
        ctx.strokeStyle = `rgba(255,95,162,${0.12 + 0.35 * m})`; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
        const bw = 280, bh = 84;
        // faint outline of the resting spot, so the lean is easy to see
        const away = clamp(Math.hypot(ox, oy) / 20);
        if (away > 0.02) { rr(ctx, cx - bw / 2, cy - bh / 2, bw, bh, 42); ctx.setLineDash([5, 6]); ctx.strokeStyle = `rgba(242,237,245,${0.3 * away})`; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]); }
        ctx.save(); ctx.translate(cx + ox, cy + oy); ctx.scale(1 + sq * 0.1, 1 - sq * 0.16);
        shadow(ctx, 26 + 20 * m, 10 + 6 * m, `rgba(255,95,162,${0.25 + 0.3 * m})`);
        fillRR(ctx, -bw / 2, -bh / 2, bw, bh, 42, C.pink); noShadow(ctx);
        text(ctx, "Let's talk", ox * 0.25, oy * 0.25 + 1, { size: 30, weight: 800, color: C.bg, align: 'center' });
        ctx.restore();
        ctx.restore();
        cursor(ctx, mx, my, { press, ring: seg(t, 2.45, 2.85) });
      },
    };
  }
})();
