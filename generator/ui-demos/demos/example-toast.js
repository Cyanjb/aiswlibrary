/* Reference demo: shows the expected shape and quality bar. Copy this pattern. */
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
