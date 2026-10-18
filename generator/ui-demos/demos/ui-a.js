/* Group ui-a: UI component demos. Every draw is a pure function of t and loops seamlessly. */
(function () {
  const { C, ep, ease, seg, lerp, clamp, rnd, backdrop, browser, phone, clipTo, lines, fillRR, text, shadow, noShadow, button, cursor, finger, path, picture } = KIT;

  /* ---------- local helpers ---------- */
  // larger browser window so the action fills the frame
  function win(ctx, W, H) { backdrop(ctx, W, H); return browser(ctx, W, H, { w: 860, h: 480 }); }
  function hex(c) { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function mix(a, b, p) { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(p)))).join(',')})`; }
  // press and ring values for a list of click times
  function clicks(t, list) {
    let press = 0, ring = 0;
    for (const at of list) {
      press += ep(t, at - 0.1, at) - ep(t, at, at + 0.15);
      const g = seg(t, at, at + 0.4); if (g > 0 && g < 1) ring = g;
    }
    return { press: clamp(press), ring };
  }
  function chevron(ctx, x, y, s, ang, color, lw = 3) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(-s, -s / 2); ctx.lineTo(0, s / 2); ctx.lineTo(s, -s / 2);
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
  }
  function dim(ctx, r, a) { if (a <= 0) return; ctx.fillStyle = `rgba(8,6,12,${0.62 * a})`; ctx.fillRect(r.x, r.y, r.w, r.h); }
  function dot(ctx, x, y, rad, color) { ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); }
  function heart(ctx, x, y, s, color) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 20, s / 20);
    ctx.beginPath(); ctx.moveTo(0, 7);
    ctx.bezierCurveTo(-12, -1, -10, -12, 0, -6); ctx.bezierCurveTo(10, -12, 12, -1, 0, 7);
    ctx.fillStyle = color; ctx.fill(); ctx.restore();
  }
  function play(ctx, x, y, s, color) {
    ctx.beginPath(); ctx.moveTo(x - s * 0.4, y - s * 0.5); ctx.lineTo(x + s * 0.55, y); ctx.lineTo(x - s * 0.4, y + s * 0.5); ctx.closePath();
    ctx.fillStyle = color; ctx.fill();
  }
  function scaleAt(ctx, cx, cy, s) { ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy); }
  function textW(ctx, s, size, weight = 700) { ctx.font = `${weight} ${size}px ${KIT.FONT}`; return ctx.measureText(s).width; }

  /* ---------- 1. modal dialog ---------- */
  DEMOS['modal-dialog'] = {
    cycle: 5.5, posterAt: 2.3,
    draw(ctx, W, H, t) {
      const r = win(ctx, W, H);
      clipTo(ctx, r, 0);
      text(ctx, 'Your library', r.x + 40, r.y + 48, { size: 32, weight: 800 });
      lines(ctx, r.x + 40, r.y + 82, 380, 2, { seed: 5 });
      const bx = r.x + 40, by = r.y + 118;
      const c1 = clicks(t, [1.0]);
      button(ctx, bx, by + c1.press * 2, 200, 54, 'Delete list', { size: 19 });
      for (let i = 0; i < 3; i++) picture(ctx, r.x + 40 + i * 267, r.y + 200, 246, 200, i + 1, 14);
      // page dims and the dialog pops in, then closes on Cancel
      const openP = ep(t, 1.05, 1.45, ease.outBack), q = ep(t, 3.15, 3.4, ease.in);
      dim(ctx, r, ep(t, 1.05, 1.35) - ep(t, 3.15, 3.45));
      const alpha = seg(t, 1.05, 1.25) * (1 - q);
      const dw = 540, dh = 270, dx = r.x + (r.w - dw) / 2, dy = r.y + (r.h - dh) / 2;
      const cxb = dx + dw - 32 - 150 - 16 - 150, byb = dy + dh - 32 - 54;
      const hov = ep(t, 2.75, 2.95) - ep(t, 3.15, 3.3), c2 = clicks(t, [3.1]);
      if (alpha > 0) {
        ctx.save(); ctx.globalAlpha = alpha;
        scaleAt(ctx, dx + dw / 2, dy + dh / 2, lerp(0.82, 1, openP) * (1 - 0.08 * q));
        shadow(ctx, 40, 16); fillRR(ctx, dx, dy, dw, dh, 20, C.card2); noShadow(ctx);
        fillRR(ctx, dx, dy, dw, dh, 20, null, C.line);
        text(ctx, 'Delete this list?', dx + 36, dy + 58, { size: 32, weight: 800 });
        text(ctx, 'Your 12 saved picks will be removed.', dx + 36, dy + 108, { size: 20, color: C.soft });
        text(ctx, 'You cannot undo this.', dx + 36, dy + 138, { size: 20, color: C.soft });
        fillRR(ctx, cxb, byb + c2.press * 2, 150, 54, 99, mix(C.card, '#3a3145', hov), C.dim);
        text(ctx, 'Cancel', cxb + 75, byb + 27.5 + c2.press * 2, { size: 19, weight: 700, align: 'center' });
        button(ctx, cxb + 166, byb, 150, 54, 'Delete', { size: 19 });
        ctx.restore();
      }
      ctx.restore();
      const [cx, cy] = path(t, [[0, r.x + 640, r.y + 410], [0.85, bx + 140, by + 34], [1.5, bx + 140, by + 34], [2.9, cxb + 80, byb + 32], [3.5, cxb + 80, byb + 32], [4.4, r.x + 560, r.y + 360], [5.4, r.x + 640, r.y + 410]]);
      cursor(ctx, cx, cy, { press: Math.max(c1.press, c2.press), ring: c1.ring || c2.ring });
    },
  };

  /* ---------- 2. side drawer ---------- */
  DEMOS['side-drawer'] = {
    cycle: 5.5, posterAt: 2.3,
    draw(ctx, W, H, t) {
      const r = win(ctx, W, H);
      clipTo(ctx, r, 0);
      ctx.fillStyle = C.desk; ctx.fillRect(r.x, r.y, r.w, 76); ctx.fillStyle = C.line; ctx.fillRect(r.x, r.y + 76, r.w, 1);
      const hx = r.x + 22, hy = r.y + 12;
      const hHov = ep(t, 0.6, 0.85) - ep(t, 1.0, 1.2);
      fillRR(ctx, hx, hy, 54, 52, 12, hHov > 0 ? `rgba(255,95,162,${0.22 * hHov})` : null);
      for (let i = 0; i < 3; i++) fillRR(ctx, hx + 11, hy + 14 + i * 10, 32, 4.5, 2.25, C.ink);
      text(ctx, 'Your library', hx + 76, r.y + 38, { size: 28, weight: 800 });
      for (let i = 0; i < 3; i++) picture(ctx, r.x + 40 + i * 267, r.y + 110, 246, 180, i + 2, 14);
      lines(ctx, r.x + 40, r.y + 320, 520, 4, { seed: 9, gap: 22, h: 9 });
      // drawer slides in from the left over a dimmed page
      const open = ep(t, 0.95, 1.4, ease.out) - ep(t, 3.4, 3.8, ease.inOut);
      dim(ctx, r, open);
      const [cx, cy] = path(t, [[0, r.x + 640, r.y + 400], [0.85, hx + 30, hy + 30], [1.4, hx + 30, hy + 30], [1.9, r.x + 190, r.y + 194], [2.5, r.x + 190, r.y + 256], [3.05, r.x + 600, r.y + 250], [3.6, r.x + 600, r.y + 250], [5.4, r.x + 640, r.y + 400]]);
      const dw = 340, dx = r.x - dw + dw * open;
      if (open > 0) {
        shadow(ctx, 40, 0, 'rgba(0,0,0,0.55)'); ctx.fillStyle = C.card2; ctx.fillRect(dx, r.y, dw, r.h); noShadow(ctx);
        text(ctx, 'Menu', dx + 32, r.y + 50, { size: 30, weight: 800 });
        const rows = ['Home', 'Saved picks', 'Collections', 'Settings'], cols = [C.pink, C.teal, C.gold, C.violet];
        const top = r.y + 104, rh = 62;
        // hover highlight follows the cursor while it is inside the drawer
        const hAlpha = (ep(t, 1.6, 1.85) - ep(t, 2.6, 2.85)) * open;
        if (hAlpha > 0) {
          const hy2 = clamp(cy - top - rh / 2, 0, rh * 3);
          ctx.globalAlpha = hAlpha;
          fillRR(ctx, dx + 14, top + hy2, dw - 28, rh - 6, 12, 'rgba(255,95,162,0.18)');
          fillRR(ctx, dx + 14, top + hy2 + 12, 5, rh - 30, 3, C.pink);
          ctx.globalAlpha = 1;
        }
        rows.forEach((s, i) => {
          dot(ctx, dx + 50, top + i * rh + 28, 13, cols[i]);
          text(ctx, s, dx + 78, top + i * rh + 28, { size: 22, weight: 600 });
        });
      }
      ctx.restore();
      const c = clicks(t, [0.95, 3.35]);
      cursor(ctx, cx, cy, c);
    },
  };

  /* ---------- 3. bottom sheet ---------- */
  DEMOS['bottom-sheet'] = {
    cycle: 5.5, posterAt: 2.2,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const s = phone(ctx, W, H, { w: 266, h: 524 });
      clipTo(ctx, s, 27);
      text(ctx, 'Photos', s.x + 22, s.y + 64, { size: 28, weight: 800 });
      const gw = (s.w - 44 - 12) / 2;
      for (let i = 0; i < 6; i++) picture(ctx, s.x + 22 + (i % 2) * (gw + 12), s.y + 92 + Math.floor(i / 2) * (gw * 0.8 + 12), gw, gw * 0.8, i, 12);
      const sbx = s.x + 22, sby = s.y + s.h - 76, sbw = s.w - 44;
      const tap = clicks(t, [0.9]);
      shadow(ctx, 18, 6); button(ctx, sbx, sby + tap.press * 2, sbw, 54, 'Share', { size: 20 }); noShadow(ctx);
      // sheet slides up, is dragged down by its handle, then slides away
      const sh = 300, openY = s.y + s.h - sh, closedY = s.y + s.h + 12;
      const p = ep(t, 1.0, 1.45, ease.out), drag = 120 * ep(t, 3.15, 3.7), q = ep(t, 3.7, 4.0, ease.in);
      const y = closedY + (openY - closedY) * p + drag * (1 - q) + q * (closedY - openY);
      dim(ctx, s, p * (1 - 0.45 * seg(t, 3.15, 3.7)) * (1 - q));
      if (y < s.y + s.h) {
        shadow(ctx, 30, -6, 'rgba(0,0,0,0.5)'); fillRR(ctx, s.x, y, s.w, sh + 40, 24, C.card2); noShadow(ctx);
        const grab = ep(t, 2.95, 3.1) - ep(t, 3.7, 3.85);
        fillRR(ctx, s.x + s.w / 2 - 30, y + 13, 60, 8, 4, mix(C.soft, C.pink, grab));
        text(ctx, 'Share to', s.x + 24, y + 58, { size: 24, weight: 800 });
        const opts = ['Copy link', 'Send message', 'Save to files'], cols = [C.teal, C.pink, C.gold];
        opts.forEach((o, i) => {
          const oy = y + 108 + i * 62;
          dot(ctx, s.x + 44, oy, 19, cols[i]);
          text(ctx, o, s.x + 76, oy, { size: 19, weight: 600 });
          if (i < 2) { ctx.fillStyle = C.line; ctx.fillRect(s.x + 76, oy + 31, s.w - 96, 1); }
        });
      }
      ctx.restore();
      const hy = openY + 17;
      const [fx, fy] = path(t, [[0, s.x + 196, s.y + 330], [0.8, s.x + s.w / 2, sby + 27], [1.3, s.x + s.w / 2, sby + 27], [2.9, s.x + s.w / 2, hy], [3.15, s.x + s.w / 2, hy], [3.7, s.x + s.w / 2, hy + 120], [4.1, s.x + s.w / 2 + 10, hy + 110], [5.3, s.x + 196, s.y + 330]]);
      finger(ctx, fx, fy, { press: Math.max(tap.press, ep(t, 2.95, 3.1) - ep(t, 3.7, 3.85)) });
    },
  };

  /* ---------- 4. accordion ---------- */
  DEMOS['accordion'] = {
    cycle: 5.5, posterAt: 2.4,
    draw(ctx, W, H, t) {
      const r = win(ctx, W, H);
      clipTo(ctx, r, 0);
      text(ctx, 'Questions', r.x + 40, r.y + 40, { size: 32, weight: 800 });
      const open = ep(t, 1.05, 1.5) - ep(t, 3.45, 3.9);
      const extra = 118 * open, x = r.x + 40, w = r.w - 80, hh = 74, gap = 12, top = r.y + 78;
      const labels = ['What is a keyword?', 'How do picks work?', 'Can I share my list?'];
      const hov = ep(t, 0.6, 0.85) - ep(t, 4.0, 4.3);
      for (let i = 0; i < 3; i++) {
        const y = top + i * (hh + gap) + (i > 1 ? extra : 0), h = hh + (i === 1 ? extra : 0);
        fillRR(ctx, x, y, w, h, 14, i === 1 ? mix(C.card2, '#2e2538', hov) : C.card2, i === 1 && open > 0.01 ? `rgba(255,95,162,${0.8 * open})` : C.line);
        text(ctx, labels[i], x + 28, y + hh / 2, { size: 25, weight: 700 });
        chevron(ctx, x + w - 40, y + hh / 2, 9, i === 1 ? open * Math.PI : 0, i === 1 ? mix(C.soft, C.pink, open) : C.soft);
        if (i === 1 && open > 0) {
          ctx.save(); ctx.beginPath(); ctx.rect(x, y + hh - 4, w, h - hh + 4); ctx.clip(); ctx.globalAlpha = open;
          text(ctx, 'Tap the heart on any keyword to save it.', x + 28, y + hh + 16, { size: 19, color: C.ink });
          text(ctx, 'All your picks stay together in one list.', x + 28, y + hh + 46, { size: 19, color: C.soft });
          lines(ctx, x + 28, y + hh + 74, 420, 2, { seed: 4, gap: 16, h: 7 });
          ctx.restore();
        }
      }
      ctx.restore();
      const hy = top + hh + gap + hh / 2;
      const [cx, cy] = path(t, [[0, r.x + 640, r.y + 410], [0.85, x + w - 120, hy + 4], [3.6, x + w - 120, hy + 4], [5.4, r.x + 640, r.y + 410]]);
      cursor(ctx, cx, cy, clicks(t, [1.0, 3.4]));
    },
  };

  /* ---------- 5. dropdown menu ---------- */
  DEMOS['dropdown-menu'] = {
    cycle: 5.5, posterAt: 2.1,
    draw(ctx, W, H, t) {
      const r = win(ctx, W, H);
      clipTo(ctx, r, 0);
      const x0 = r.x + 60, bw = 400;
      text(ctx, 'New project', x0, r.y + 50, { size: 32, weight: 800 });
      text(ctx, 'Style', x0, r.y + 104, { size: 18, weight: 600, color: C.soft });
      const by = r.y + 124, bh = 60;
      const open = ep(t, 0.95, 1.3, ease.out) - ep(t, 2.7, 2.95);
      const chosen = ep(t, 2.62, 2.76) - ep(t, 4.5, 4.95);
      const flash = ep(t, 2.65, 2.85) - ep(t, 3.3, 3.8);
      const focus = Math.max(open, flash);
      fillRR(ctx, x0, by, bw, bh, 12, C.card2, focus > 0.02 ? mix('#2c2536', C.pink, focus) : C.line);
      if (focus > 0.02) { ctx.lineWidth = 2.5; ctx.strokeStyle = mix('#2c2536', C.pink, focus); KIT.rr(ctx, x0, by, bw, bh, 12); ctx.stroke(); }
      ctx.globalAlpha = 1 - chosen; text(ctx, 'Choose a style', x0 + 22, by + bh / 2, { size: 20, color: C.soft });
      ctx.globalAlpha = chosen; text(ctx, 'Pixel art', x0 + 22, by + bh / 2, { size: 21, weight: 700 }); ctx.globalAlpha = 1;
      chevron(ctx, x0 + bw - 32, by + bh / 2, 8, open * Math.PI, C.ink);
      // preview card on the right follows the choice
      const px = r.x + 520, py = r.y + 40, pw = 280, ph = 300;
      fillRR(ctx, px, py, pw, ph, 18, C.card2, C.line);
      fillRR(ctx, px + 20, py + 20, pw - 40, ph - 90, 12, C.bg);
      ctx.globalAlpha = 1 - chosen; text(ctx, 'No style yet', px + pw / 2, py + 20 + (ph - 90) / 2, { size: 18, color: C.dim, align: 'center' });
      ctx.globalAlpha = chosen; picture(ctx, px + 20, py + 20, pw - 40, ph - 90, 3, 12); ctx.globalAlpha = 1;
      text(ctx, 'Preview', px + 22, py + ph - 42, { size: 20, weight: 700 });
      lines(ctx, px + 22, py + ph - 22, 150, 1, { seed: 2 });
      // cursor and list
      const lt = by + bh + 8, oh = 54;
      const [cx, cy] = path(t, [[0, r.x + 440, r.y + 410], [0.8, x0 + 300, by + 32], [1.3, x0 + 300, by + 32], [1.6, x0 + 280, lt + 8 + oh * 0.5], [1.95, x0 + 280, lt + 8 + oh * 1.5], [2.3, x0 + 280, lt + 8 + oh * 2.5], [2.75, x0 + 280, lt + 8 + oh * 2.5], [3.5, x0 + 330, r.y + 330], [5.4, r.x + 440, r.y + 410]]);
      if (open > 0) {
        const lh = 8 * 2 + oh * 4;
        ctx.save(); ctx.globalAlpha = open;
        ctx.beginPath(); ctx.rect(x0 - 30, lt - 4, bw + 60, (lh + 40) * open); ctx.clip();
        shadow(ctx, 30, 12); fillRR(ctx, x0, lt, bw, lh, 14, C.card2); noShadow(ctx);
        fillRR(ctx, x0, lt, bw, lh, 14, null, C.line);
        const ha = ep(t, 1.35, 1.55);
        const hi = clamp((cy - lt - 8 - oh / 2) / oh, 0, 3);
        if (ha > 0) { ctx.globalAlpha = open * ha; fillRR(ctx, x0 + 8, lt + 8 + hi * oh, bw - 16, oh, 10, 'rgba(255,95,162,0.22)'); ctx.globalAlpha = open; }
        ['Watercolor', 'Film noir', 'Pixel art', 'Claymation'].forEach((o, i) => text(ctx, o, x0 + 24, lt + 8 + i * oh + oh / 2, { size: 20, weight: 600, color: ha > 0 && Math.abs(hi - i) < 0.5 ? C.white : C.ink }));
        ctx.restore();
      }
      ctx.restore();
      cursor(ctx, cx, cy, clicks(t, [0.9, 2.6]));
    },
  };

  /* ---------- 6. tooltip ---------- */
  DEMOS['tooltip'] = {
    cycle: 5, posterAt: 2.2,
    draw(ctx, W, H, t) {
      const r = win(ctx, W, H);
      clipTo(ctx, r, 0);
      const x = r.x + 80, y = r.y + 30, w = r.w - 160, h = r.h - 60;
      fillRR(ctx, x, y, w, h, 20, C.card2, C.line);
      text(ctx, 'Settings', x + 40, y + 52, { size: 32, weight: 800 });
      const rows = [['Auto save', y + 190, 1], ['Show hints', y + 300, 0]];
      let ix = 0, iy = 0;
      rows.forEach(([label, ry, on], i) => {
        text(ctx, label, x + 40, ry, { size: 28, weight: 700 });
        if (i === 0) { ix = x + 40 + textW(ctx, label, 28) + 36; iy = ry; }
        fillRR(ctx, x + w - 120, ry - 22, 80, 44, 22, on ? C.pink : '#3a3145');
        dot(ctx, x + w - 120 + (on ? 58 : 22), ry, 17, C.white);
        if (i === 0) { ctx.fillStyle = C.line; ctx.fillRect(x + 40, ry + 55, w - 80, 1); }
      });
      // info icon lights up on hover
      const hov = ep(t, 0.85, 1.0) - ep(t, 3.1, 3.25);
      dot(ctx, ix, iy, 19, hov > 0 ? `rgba(255,95,162,${0.25 * hov})` : 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(ix, iy, 18, 0, Math.PI * 2); ctx.lineWidth = 2.5; ctx.strokeStyle = mix(C.soft, C.pink, hov); ctx.stroke();
      text(ctx, 'i', ix, iy + 1, { size: 22, weight: 800, color: mix(C.soft, C.pink, hov), align: 'center' });
      // tooltip fades in above the icon
      const a = ep(t, 1.05, 1.35) - ep(t, 3.25, 3.55);
      if (a > 0) {
        const tw = 300, th = 58, tx = ix - tw / 2, ty = iy - 36 - th + (1 - a) * 10;
        ctx.save(); ctx.globalAlpha = a;
        shadow(ctx, 20, 8); fillRR(ctx, tx, ty, tw, th, 12, C.ink); noShadow(ctx);
        ctx.beginPath(); ctx.moveTo(ix - 11, ty + th - 1); ctx.lineTo(ix, ty + th + 12); ctx.lineTo(ix + 11, ty + th - 1); ctx.closePath(); ctx.fillStyle = C.ink; ctx.fill();
        text(ctx, 'Saves every 30 seconds', ix, ty + th / 2 + 1, { size: 20, weight: 700, color: C.bg, align: 'center' });
        ctx.restore();
      }
      ctx.restore();
      const [cx, cy] = path(t, [[0, r.x + 620, r.y + 400], [0.95, ix + 4, iy + 6], [3.1, ix + 4, iy + 6], [3.6, r.x + 560, r.y + 360], [4.9, r.x + 620, r.y + 400]]);
      cursor(ctx, cx, cy);
    },
  };

  /* ---------- 8. tabs ---------- */
  const SW = [1.0, 2.6, 4.2], SEQ = [0, 1, 2, 0];
  // which panel is showing, with its fade, for a sequence of switches
  function panelAt(t) {
    let cur = SEQ[0], alpha = 1, dy = 0;
    SW.forEach((s, i) => {
      if (t < s) return;
      const u = seg(t, s, s + 0.4);
      if (u < 0.35) { cur = SEQ[i]; alpha = 1 - u / 0.35; dy = 0; } else { const a = ease.out((u - 0.35) / 0.65); cur = SEQ[i + 1]; alpha = a; dy = (1 - a) * 14; }
    });
    return { cur, alpha, dy };
  }
  function slidePos(t) { return ep(t, 1.0, 1.4) + ep(t, 2.6, 3.0) - 2 * ep(t, 4.2, 4.6); }
  DEMOS['tabs'] = {
    cycle: 6, posterAt: 1.9,
    draw(ctx, W, H, t) {
      const r = win(ctx, W, H);
      clipTo(ctx, r, 0);
      const x0 = r.x + 40, tw = 220, ty = r.y + 50;
      const pos = slidePos(t);
      ['Photos', 'Videos', 'Saved'].forEach((s, j) => {
        const near = 1 - clamp(Math.abs(pos - j));
        text(ctx, s, x0 + j * tw + tw / 2, ty, { size: 24, weight: 700, color: mix(C.dim, C.ink, near), align: 'center' });
      });
      ctx.fillStyle = C.line; ctx.fillRect(x0, ty + 38, r.w - 80, 2);
      fillRR(ctx, x0 + pos * tw + 16, ty + 35, tw - 32, 6, 3, C.pink);
      const { cur, alpha, dy } = panelAt(t);
      ctx.save(); ctx.globalAlpha = alpha; ctx.translate(0, dy);
      const py = r.y + 120, pw = r.w - 80;
      if (cur === 0) {
        for (let i = 0; i < 3; i++) picture(ctx, x0 + i * 265, py, 250, 210, i, 14);
        lines(ctx, x0, py + 238, 500, 3, { seed: 1, gap: 20, h: 8 });
      } else if (cur === 1) {
        const vids = ['Studio tour', 'Morning light', 'City at night'];
        for (let i = 0; i < 3; i++) {
          const ry = py + i * 98;
          fillRR(ctx, x0, ry, pw, 84, 14, C.card2);
          picture(ctx, x0 + 12, ry + 10, 116, 64, i + 3, 10);
          dot(ctx, x0 + 70, ry + 42, 17, 'rgba(18,16,22,0.6)'); play(ctx, x0 + 72, ry + 42, 16, C.white);
          text(ctx, vids[i], x0 + 152, ry + 30, { size: 22, weight: 700 });
          lines(ctx, x0 + 152, ry + 52, 300, 1, { seed: i + 7, h: 8 });
          text(ctx, (i + 2) + ':0' + (i * 3), x0 + pw - 24, ry + 42, { size: 18, color: C.soft, align: 'right' });
        }
      } else {
        const saved = ['Soft light', 'Film grain', 'Warm tones', 'Wide shot'];
        for (let i = 0; i < 4; i++) {
          const cx = x0 + (i % 2) * (pw / 2 + 8), cy = py + Math.floor(i / 2) * 166, cw = pw / 2 - 8;
          fillRR(ctx, cx, cy, cw, 150, 14, C.card2);
          dot(ctx, cx + 56, cy + 75, 32, 'rgba(255,95,162,0.16)'); heart(ctx, cx + 56, cy + 75, 36, C.pink);
          text(ctx, saved[i], cx + 106, cy + 60, { size: 24, weight: 700 });
          lines(ctx, cx + 106, cy + 90, 200, 2, { seed: i + 11, h: 7 });
        }
      }
      ctx.restore();
      ctx.restore();
      const tc = j => x0 + j * tw + tw / 2 + 10;
      const [cx, cy] = path(t, [[0, r.x + 640, r.y + 410], [0.85, tc(1), ty + 6], [1.3, tc(1), ty + 6], [1.9, r.x + 600, r.y + 380], [2.45, tc(2), ty + 6], [2.9, tc(2), ty + 6], [3.5, r.x + 620, r.y + 390], [4.05, tc(0), ty + 6], [4.5, tc(0), ty + 6], [5.9, r.x + 640, r.y + 410]]);
      cursor(ctx, cx, cy, clicks(t, SW));
    },
  };

  /* ---------- 9. image carousel ---------- */
  DEMOS['image-carousel'] = {
    cycle: 6, posterAt: 1.2,
    draw(ctx, W, H, t) {
      const r = win(ctx, W, H);
      clipTo(ctx, r, 0);
      const steps = [1.0, 2.4, 3.8, 5.2];
      const p = steps.reduce((a, s) => a + ep(t, s, s + 0.5), 0);
      const sw = 540, sh = 300, cx = r.x + r.w / 2, top = r.y + 40, step = sw + 28;
      const names = ['Spring', 'Summer', 'Autumn', 'Winter'];
      for (let i = 0; i < 4; i++) {
        let o = (((i - p) % 4) + 4) % 4; if (o > 2) o -= 4;
        const x = cx - sw / 2 + o * step, k = Math.min(1, Math.abs(o));
        if (x > r.x + r.w || x + sw < r.x) continue;
        ctx.save(); scaleAt(ctx, x + sw / 2, top + sh / 2, 1 - 0.1 * k);
        shadow(ctx, 30, 12); fillRR(ctx, x, top, sw, sh, 18, C.card); noShadow(ctx);
        picture(ctx, x, top, sw, sh, [0, 1, 4, 3][i], 18);
        text(ctx, names[i], x + 30, top + sh - 40, { size: 34, weight: 800, color: C.white });
        if (k > 0) fillRR(ctx, x, top, sw, sh, 18, `rgba(18,16,22,${0.55 * k})`);
        ctx.restore();
      }
      // arrow buttons
      const ay = top + sh / 2, c = clicks(t, steps);
      [[cx - sw / 2 - 6, Math.PI / 2], [cx + sw / 2 + 6, -Math.PI / 2]].forEach(([ax, ang], i) => {
        shadow(ctx, 14, 4); dot(ctx, ax, ay + (i ? c.press * 2 : 0), 28, C.card2); noShadow(ctx);
        chevron(ctx, ax + (i ? -2 : 2), ay + (i ? c.press * 2 : 0), 8, ang, C.ink, 3.5);
      });
      // dots below
      const dy = top + sh + 46;
      let dx = cx - (3 * 26 + 46) / 2;
      for (let i = 0; i < 4; i++) {
        let d = Math.abs((((p - i) % 4) + 4) % 4); if (d > 2) d = 4 - d;
        const a = 1 - clamp(d), w = 14 + 32 * a;
        fillRR(ctx, dx, dy - 7, w, 14, 7, mix(C.dim, C.pink, a));
        dx += w + 12;
      }
      ctx.restore();
      const ax = cx + sw / 2 + 6;
      const keys = [[0, ax + 50, ay + 70]];
      steps.forEach(s => { keys.push([s - 0.25, ax + 4, ay + 6], [s + 0.2, ax + 4, ay + 6], [s + 0.65, ax + 50, ay + 70]); });
      keys.push([6, ax + 50, ay + 70]);
      const [mx, my] = path(t, keys);
      cursor(ctx, mx, my, c);
    },
  };

  /* ---------- 10. toggle switch ---------- */
  DEMOS['toggle-switch'] = {
    cycle: 5.5, posterAt: 2.3,
    draw(ctx, W, H, t) {
      const r = win(ctx, W, H);
      clipTo(ctx, r, 0);
      const x = r.x + 70, y = r.y + 24, w = r.w - 140;
      text(ctx, 'Settings', x, y + 36, { size: 32, weight: 800 });
      const v = ep(t, 1.0, 1.3) - ep(t, 3.4, 3.7);
      const rows = [['Dark mode', 1], ['Notifications', v], ['Auto play', 0]];
      const tw = 96, th = 52, sx = x + w - tw;
      rows.forEach(([label, on], i) => {
        const ry = y + 132 + i * 108;
        fillRR(ctx, x - 20, ry - 48, w + 40, 96, 16, i === 1 ? C.card2 : 'rgba(36,30,45,0.5)');
        text(ctx, label, x + 10, ry - 12, { size: 26, weight: 700 });
        ctx.globalAlpha = 1 - on; text(ctx, 'Off', x + 10, ry + 20, { size: 18, color: C.soft });
        ctx.globalAlpha = on; text(ctx, 'On', x + 10, ry + 20, { size: 18, weight: 700, color: C.pink }); ctx.globalAlpha = 1;
        fillRR(ctx, sx - 10, ry - th / 2, tw, th, th / 2, mix('#3a3145', C.pink, on));
        shadow(ctx, 8, 3, 'rgba(0,0,0,0.4)'); dot(ctx, sx - 10 + th / 2 + on * (tw - th), ry, th / 2 - 5, C.white); noShadow(ctx);
      });
      ctx.restore();
      const swx = sx - 10 + tw / 2, swy = y + 132 + 108;
      const [cx, cy] = path(t, [[0, r.x + 520, r.y + 420], [0.85, swx, swy + 4], [1.5, swx, swy + 4], [2.1, swx - 120, swy + 60], [3.2, swx - 4, swy + 4], [3.6, swx, swy + 4], [5.4, r.x + 520, r.y + 420]]);
      cursor(ctx, cx, cy, clicks(t, [1.0, 3.4]));
    },
  };

  /* ---------- 11. segmented control ---------- */
  DEMOS['segmented-control'] = {
    cycle: 6, posterAt: 1.9,
    draw(ctx, W, H, t) {
      const r = win(ctx, W, H);
      clipTo(ctx, r, 0);
      text(ctx, 'Your activity', r.x + r.w / 2, r.y + 44, { size: 30, weight: 800, align: 'center' });
      const pw = 600, ph = 72, px = r.x + (r.w - pw) / 2, py = r.y + 82, segW = (pw - 12) / 3;
      fillRR(ctx, px, py, pw, ph, ph / 2, C.bg, C.line);
      const pos = slidePos(t);
      shadow(ctx, 14, 4, 'rgba(255,95,162,0.35)'); fillRR(ctx, px + 6 + pos * segW, py + 6, segW, ph - 12, (ph - 12) / 2, C.pink); noShadow(ctx);
      ['Day', 'Week', 'Month'].forEach((s, j) => {
        const near = 1 - clamp(Math.abs(pos - j));
        text(ctx, s, px + 6 + j * segW + segW / 2, py + ph / 2 + 1, { size: 24, weight: 700, color: mix(C.soft, C.bg, near), align: 'center' });
      });
      // bars below change with the chosen segment
      const set = s => Array.from({ length: 7 }, (_, i) => 0.22 + 0.72 * rnd(s * 17 + i * 3 + 2));
      let hs = set(SEQ[0]);
      SW.forEach((s, i) => { const p = ep(t, s, s + 0.45); if (p > 0) { const a = set(SEQ[i]), b = set(SEQ[i + 1]); hs = a.map((v, k) => lerp(v, b[k], p)); } });
      const base = r.y + r.h - 34, maxH = 230, bw = 70, gap = (r.w - 160 - 7 * bw) / 6;
      ctx.fillStyle = C.line; ctx.fillRect(r.x + 60, base + 2, r.w - 120, 2);
      hs.forEach((v, i) => fillRR(ctx, r.x + 80 + i * (bw + gap), base - v * maxH, bw, v * maxH, 10, i === 3 ? C.teal : 'rgba(79,216,196,0.45)'));
      ctx.restore();
      const sc = j => px + 6 + j * segW + segW / 2 + 10;
      const [cx, cy] = path(t, [[0, r.x + 690, r.y + 200], [0.85, sc(1), py + 42], [1.3, sc(1), py + 42], [1.9, r.x + 700, r.y + 210], [2.45, sc(2), py + 42], [2.9, sc(2), py + 42], [3.5, r.x + 680, r.y + 220], [4.05, sc(0), py + 42], [4.5, sc(0), py + 42], [5.9, r.x + 690, r.y + 200]]);
      cursor(ctx, cx, cy, clicks(t, SW));
    },
  };

  /* ---------- 12. filter chips ---------- */
  const CATS = ['Photos', 'Art', 'Video', 'Art', 'Saved', 'Photos', 'Art', 'Video'];
  const HUE = { Photos: 1, Art: 0, Video: 3, Saved: 2 };
  const STATES = [null, ['Art'], ['Art', 'Photos'], null];
  const FT = [1.05, 2.45, 3.95];
  function slotOf(st, c) {
    const vis = CATS.map((k, i) => i).filter(i => !st || st.includes(CATS[i]));
    return vis.indexOf(c);
  }
  DEMOS['filter-chips'] = {
    cycle: 6, posterAt: 3.4,
    draw(ctx, W, H, t) {
      const r = win(ctx, W, H);
      clipTo(ctx, r, 0);
      text(ctx, 'Explore', r.x + 40, r.y + 44, { size: 32, weight: 800 });
      const sel = {
        All: 1 - ep(t, 1.0, 1.25) + ep(t, 3.9, 4.15),
        Art: ep(t, 1.0, 1.25) - ep(t, 3.9, 4.15),
        Photos: ep(t, 2.4, 2.65) - ep(t, 3.9, 4.15),
        Video: 0, Saved: 0,
      };
      const chipY = r.y + 82, chipH = 48, chipPos = {};
      let x = r.x + 40;
      ['All', 'Photos', 'Art', 'Video', 'Saved'].forEach(k => {
        const w = textW(ctx, k, 19) + 48, s = sel[k];
        fillRR(ctx, x, chipY, w, chipH, chipH / 2, mix(C.card2, C.pink, s), s > 0.5 ? null : '#3a3145');
        text(ctx, k, x + w / 2, chipY + chipH / 2 + 1, { size: 19, weight: 700, color: mix(C.ink, C.bg, s), align: 'center' });
        chipPos[k] = x + w / 2; x += w + 12;
      });
      // cards move to their new places as the filter changes
      const cw = (r.w - 80 - 48) / 4, ch = 128, gx = r.x + 40, gy = r.y + 152;
      const slotXY = s => [gx + (s % 4) * (cw + 16), gy + Math.floor(s / 4) * (ch + 16)];
      let k = -1; FT.forEach((s, i) => { if (t >= s) k = i; });
      const from = STATES[k < 0 ? 0 : k], to = STATES[k < 0 ? 0 : k + 1], p = k < 0 ? 0 : ep(t, FT[k], FT[k] + 0.55);
      for (let c = 0; c < 8; c++) {
        const a = slotOf(from, c), b = slotOf(to, c);
        let px, py, al = 1, sc = 1;
        if (a >= 0 && b >= 0) { const A = slotXY(a), B = slotXY(b); px = lerp(A[0], B[0], p); py = lerp(A[1], B[1], p); }
        else if (a >= 0) { [px, py] = slotXY(a); al = 1 - clamp(p * 1.8); sc = 1 - 0.2 * p; }
        else if (b >= 0) { [px, py] = slotXY(b); const q = seg(p, 0.35, 1); al = q; sc = 0.8 + 0.2 * q; }
        else continue;
        if (al <= 0) continue;
        ctx.save(); ctx.globalAlpha = al; scaleAt(ctx, px + cw / 2, py + ch / 2, sc);
        picture(ctx, px, py, cw, ch, HUE[CATS[c]], 14);
        const lw = textW(ctx, CATS[c], 16) + 22;
        fillRR(ctx, px + 10, py + ch - 38, lw, 28, 14, 'rgba(18,16,22,0.72)');
        text(ctx, CATS[c], px + 10 + lw / 2, py + ch - 23.5, { size: 16, weight: 700, color: C.white, align: 'center' });
        ctx.restore();
      }
      ctx.restore();
      const rest = [r.x + 720, r.y + 60];
      const [cx, cy] = path(t, [[0, ...rest], [0.85, chipPos.Art + 6, chipY + 30], [1.3, chipPos.Art + 6, chipY + 30], [2.25, chipPos.Photos + 6, chipY + 30], [2.7, chipPos.Photos + 6, chipY + 30], [3.75, chipPos.All + 6, chipY + 30], [4.2, chipPos.All + 6, chipY + 30], [5.9, ...rest]]);
      cursor(ctx, cx, cy, clicks(t, [1.0, 2.4, 3.9]));
    },
  };
})();

/* 7. toast notification: copied unchanged from the reference demo. */
(function () {
  const { C, ep, ease, seg, lerp, backdrop, browser, clipTo, lines, fillRR, text, shadow, noShadow, button, cursor, path } = KIT;
  DEMOS['toast-notification'] = {
    cycle: 5,
    draw(ctx, W, H, t) {
      backdrop(ctx, W, H);
      const r = browser(ctx, W, H);
      clipTo(ctx, r, 0);
      text(ctx, 'Your library', r.x + 30, r.y + 40, { size: 30, weight: 800 });
      lines(ctx, r.x + 30, r.y + 70, 340, 4, { seed: 3 });
      const bx = r.x + 30, by = r.y + 140;
      const press = ep(t, 0.9, 1.0) - ep(t, 1.0, 1.15);
      button(ctx, bx, by + press * 2, 190, 52, 'Save picks', { size: 18 });
      // cursor travels to the button, clicks at 1.0s, leaves
      const [cx, cy] = path(t, [[0, r.x + 520, r.y + 330], [0.85, bx + 130, by + 32], [1.6, bx + 130, by + 32], [2.4, r.x + 420, r.y + 300], [4.9, r.x + 520, r.y + 330]]);
      // toast slides up at 1.05s, holds, slides out at 3.9s
      const inP = ep(t, 1.05, 1.5, ease.outBack), outP = ep(t, 3.9, 4.3, ease.in);
      const ty = lerp(r.y + r.h + 20, r.y + r.h - 96, inP) + outP * 120;
      const tw = 380, tx = r.x + r.w - tw - 24;
      shadow(ctx, 24, 10); fillRR(ctx, tx, ty, tw, 70, 14, C.card2); noShadow(ctx);
      fillRR(ctx, tx, ty, tw, 70, 14, null, C.line);
      ctx.beginPath(); ctx.arc(tx + 34, ty + 35, 15, 0, 7); ctx.fillStyle = C.teal; ctx.fill();
      text(ctx, '✓', tx + 34, ty + 36, { size: 18, weight: 800, color: C.bg, align: 'center' });
      text(ctx, 'Picks saved', tx + 60, ty + 26, { size: 19, weight: 800 });
      text(ctx, '3 keywords added to your list', tx + 60, ty + 47, { size: 15, color: C.soft });
      // timer bar shrinking while the toast is shown
      const life = 1 - seg(t, 1.5, 3.9);
      fillRR(ctx, tx + 12, ty + 63, (tw - 24) * life, 4, 2, C.teal);
      ctx.restore();
      cursor(ctx, cx, cy, { press, ring: seg(t, 1.0, 1.4) });
    },
  };
})();
