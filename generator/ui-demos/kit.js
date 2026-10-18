/* AI and See Why UI demo kit. Every demo is a pure function of time: draw(ctx, W, H, t) with 0 <= t < cycle.
   No clock, no Math.random at draw time, no state between calls, so live preview and frame-by-frame
   rendering give identical frames and the loop is seamless at t = cycle. */
(function () {
  const C = {
    bg: '#121016', desk: '#17131c', card: '#1b1722', card2: '#241e2d', ink: '#f2edf5', soft: '#a89db3',
    dim: '#6d6378', line: '#2c2536', pink: '#ff5fa2', teal: '#4fd8c4', gold: '#e8b64c', violet: '#9b7bff',
    shade: 'rgba(8,6,12,0.62)', white: '#ffffff',
  };
  const FONT = 'Inter, "Liberation Sans", sans-serif';
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, p) => a + (b - a) * p;
  // progress of t through [a, b], 0..1
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const ease = {
    linear: p => p,
    inOut: p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
    out: p => 1 - Math.pow(1 - p, 3),
    in: p => p * p * p,
    outBack: (p, s = 1.6) => 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2),
    outElastic: p => (p === 0 || p === 1 ? p : Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * (2 * Math.PI) / 3) + 1),
  };
  // eased progress through [a, b]
  const ep = (t, a, b, fn = ease.inOut) => fn(seg(t, a, b));
  // seeded pseudo-random, stable per index (use instead of Math.random)
  const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  function rr(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function fillRR(ctx, x, y, w, h, r, fill, stroke) {
    rr(ctx, x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
  }
  function text(ctx, s, x, y, { size = 16, weight = 500, color = C.ink, align = 'left', base = 'middle', font = FONT } = {}) {
    ctx.font = `${weight} ${size}px ${font}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillText(s, x, y);
  }
  // grey placeholder lines standing in for body copy
  function lines(ctx, x, y, w, n, { gap = 14, h = 6, color = C.line, seed = 0 } = {}) {
    for (let i = 0; i < n; i++) fillRR(ctx, x, y + i * gap, w * (i === n - 1 ? 0.55 : 0.82 + 0.18 * rnd(seed + i)), h, h / 2, color);
  }
  function shadow(ctx, blur = 24, y = 10, color = 'rgba(0,0,0,0.45)') { ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.shadowOffsetY = y; ctx.shadowOffsetX = 0; }
  function noShadow(ctx) { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }

  function backdrop(ctx, W, H) {
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W * 0.5, H * 0.35, 10, W * 0.5, H * 0.5, W * 0.7);
    g.addColorStop(0, 'rgba(255,95,162,0.07)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  // A browser window centred in the frame. Returns the content rect {x,y,w,h}.
  function browser(ctx, W, H, { w = 760, h = 430, url = 'aiandseewhy.com' } = {}) {
    const x = (W - w) / 2, y = (H - h) / 2 + 6;
    shadow(ctx, 40, 18); fillRR(ctx, x, y, w, h, 14, C.card); noShadow(ctx);
    fillRR(ctx, x, y, w, h, 14, null, C.line);
    ['#ff6b6b', '#ffc44d', '#4fd88a'].forEach((c, i) => { ctx.beginPath(); ctx.arc(x + 20 + i * 16, y + 18, 5, 0, 7); ctx.fillStyle = c; ctx.fill(); });
    fillRR(ctx, x + w / 2 - 130, y + 8, 260, 20, 10, C.bg);
    text(ctx, url, x + w / 2, y + 18.5, { size: 11, color: C.soft, align: 'center' });
    ctx.fillStyle = C.line; ctx.fillRect(x, y + 36, w, 1);
    return { x, y: y + 37, w, h: h - 37 };
  }
  // A phone centred in the frame. Returns the screen rect {x,y,w,h}.
  function phone(ctx, W, H, { w = 230, h = 460 } = {}) {
    const x = (W - w) / 2, y = (H - h) / 2;
    shadow(ctx, 40, 18); fillRR(ctx, x, y, w, h, 34, '#0b090e'); noShadow(ctx);
    fillRR(ctx, x + 8, y + 8, w - 16, h - 16, 27, C.card);
    fillRR(ctx, x + w / 2 - 34, y + 16, 68, 18, 9, '#0b090e');
    return { x: x + 8, y: y + 8, w: w - 16, h: h - 16 };
  }
  // Clip all later drawing to a rect (call ctx.restore() when done)
  function clipTo(ctx, r, radius = 0) { ctx.save(); rr(ctx, r.x, r.y, r.w, r.h, radius); ctx.clip(); }
  // Mouse pointer; press 0..1 shrinks it slightly and shows a click ring
  function cursor(ctx, x, y, { press = 0, ring = 0 } = {}) {
    if (ring > 0 && ring < 1) {
      ctx.beginPath(); ctx.arc(x, y, 6 + ring * 22, 0, 7); ctx.strokeStyle = `rgba(79,216,196,${1 - ring})`; ctx.lineWidth = 2; ctx.stroke();
    }
    const s = 1 - press * 0.12;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 22); ctx.lineTo(6, 17); ctx.lineTo(10, 26); ctx.lineTo(14, 24); ctx.lineTo(10, 15.5); ctx.lineTo(17, 15.5); ctx.closePath();
    ctx.fillStyle = C.white; ctx.fill(); ctx.strokeStyle = '#121016'; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore();
  }
  // Fingertip for phone demos
  function finger(ctx, x, y, { press = 0 } = {}) {
    ctx.beginPath(); ctx.arc(x, y, 15 - press * 3, 0, 7); ctx.fillStyle = `rgba(242,237,245,${0.35 + press * 0.3})`; ctx.fill();
    ctx.strokeStyle = 'rgba(242,237,245,0.8)'; ctx.lineWidth = 1.5; ctx.stroke();
  }
  // Path through points with eased segments: keys = [[t, x, y], ...]
  function path(t, keys, fn = ease.inOut) {
    if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) { const p = fn(seg(t, keys[i - 1][0], keys[i][0])); return [lerp(keys[i - 1][1], keys[i][1], p), lerp(keys[i - 1][2], keys[i][2], p)]; }
    }
    const k = keys[keys.length - 1]; return [k[1], k[2]];
  }
  // A coloured image placeholder (soft gradient + simple hills/sun), seeded by hue
  function picture(ctx, x, y, w, h, hue = 0, r = 10) {
    ctx.save(); rr(ctx, x, y, w, h, r); ctx.clip();
    const pal = [[C.pink, C.violet], [C.teal, '#2b6f8f'], [C.gold, C.pink], [C.violet, C.teal], ['#ff8a5c', C.gold]][((hue % 5) + 5) % 5];
    const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, pal[0]); g.addColorStop(1, pal[1]);
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.beginPath(); ctx.arc(x + w * 0.72, y + h * 0.32, Math.min(w, h) * 0.12, 0, 7); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x + w * 0.3, y + h * 0.55); ctx.lineTo(x + w * 0.55, y + h * 0.8); ctx.lineTo(x + w * 0.75, y + h * 0.6); ctx.lineTo(x + w, y + h); ctx.closePath();
    ctx.fillStyle = 'rgba(18,16,22,0.35)'; ctx.fill(); ctx.restore();
  }
  function button(ctx, x, y, w, h, label, { fill = C.pink, color = C.bg, r = 99, size = 14 } = {}) {
    fillRR(ctx, x, y, w, h, r, fill); text(ctx, label, x + w / 2, y + h / 2 + 0.5, { size, weight: 700, color, align: 'center' });
  }

  window.KIT = { C, FONT, clamp, lerp, seg, ease, ep, rnd, rr, fillRR, text, lines, shadow, noShadow, backdrop, browser, phone, clipTo, cursor, finger, path, picture, button };
  window.DEMOS = window.DEMOS || {};
})();
