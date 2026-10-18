/* AI and See Why card previews: hovering a card thumbnail plays its clip. Copied to the site root by build.py. */
(function () {
  if (!window.matchMedia || !matchMedia('(hover: hover)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function start(a) {
    var v = a.querySelector('video');
    if (!v) {
      v = document.createElement('video');
      v.src = a.getAttribute('data-video'); v.muted = true; v.loop = true; v.playsInline = true;
      a.appendChild(v);
    }
    v.play().catch(function () {});
  }
  function stop(a) { var v = a.querySelector('video'); if (v) { v.pause(); v.currentTime = 0; } }
  document.addEventListener('mouseover', function (e) {
    var a = e.target.closest && e.target.closest('.thumb[data-video]');
    if (a && !a.contains(e.relatedTarget)) start(a);
  });
  document.addEventListener('mouseout', function (e) {
    var a = e.target.closest && e.target.closest('.thumb[data-video]');
    if (a && !a.contains(e.relatedTarget)) stop(a);
  });
})();
