/* AI and See Why pick tray. Copied to the site root by build.py; edit this file, not /picks.js. */
(function () {
  var KEY = 'aisw-picks-v1', NOTE = 'aisw-note-v1';
  var SITE = 'https://library.aiandseewhy.com';
  var base = (document.currentScript && document.currentScript.src || '').replace(/picks\.js.*$/, '');
  var picks = load(KEY, []), note = load(NOTE, '');

  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(picks)); localStorage.setItem(NOTE, JSON.stringify(note)); } catch (e) {}
  }
  function has(slug) { return picks.some(function (p) { return p.s === slug; }); }
  function fromBtn(b) { var d = b.dataset; return { s: d.slug, n: d.name, c: d.cat, d: d.def, e: d.ex }; }
  function toggle(item) {
    if (has(item.s)) picks = picks.filter(function (p) { return p.s !== item.s; });
    else picks.push(item);
    save(); sync();
  }

  function link() { return SITE + '/index.html?pick=' + picks.map(function (p) { return p.s; }).join(','); }
  function forAI() {
    var out = ['I picked ' + picks.length + ' keyword' + (picks.length === 1 ? '' : 's') +
      ' from the AI and See Why Keyword Library. Use them in my prompt, in this order of importance.', ''];
    picks.forEach(function (p, i) {
      out.push((i + 1) + '. ' + p.n + ' (' + p.c + ')');
      if (p.d) out.push('   What it does: ' + p.d);
      if (p.e) out.push('   Example: ' + p.e);
      out.push('   ' + SITE + '/keyword/' + p.s + '.html');
    });
    if (note.trim()) { out.push(''); out.push('My note: ' + note.trim()); }
    out.push(''); out.push('Picks link: ' + link());
    return out.join('\n');
  }
  function keywords() { return picks.map(function (p) { return p.n.toLowerCase(); }).join(', '); }

  function copy(text, msg) {
    var done = function () { flash(msg); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
    function fallback() {
      var t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); done(); } catch (e) { flash('Copy failed. Select and copy by hand.'); }
      document.body.removeChild(t);
    }
  }

  var tray, countEl, namesEl, msgEl, noteEl, timer;
  function flash(m) { msgEl.textContent = m; clearTimeout(timer); timer = setTimeout(function () { msgEl.textContent = ''; }, 2600); }
  function build() {
    tray = document.createElement('div'); tray.id = 'tray'; tray.setAttribute('role', 'region'); tray.setAttribute('aria-label', 'Your picks');
    tray.innerHTML = '<div class="wrap"><div class="row"><span class="count"></span><span class="names"></span>' +
      '<button type="button" class="main" data-act="ai">Copy for AI</button>' +
      '<button type="button" data-act="kw" class="cap"><span class="lg">Copy </span>keywords</button>' +
      '<button type="button" data-act="link" class="cap"><span class="lg">Copy </span>link</button>' +
      '<button type="button" data-act="clear">Clear</button></div>' +
      '<div class="row" style="margin-top:8px"><input type="text" maxlength="200" placeholder="Note for the AI (optional): e.g. for the opening shot of my reel">' +
      '<span class="msg" aria-live="polite"></span></div></div>';
    document.body.appendChild(tray);
    countEl = tray.querySelector('.count'); namesEl = tray.querySelector('.names');
    msgEl = tray.querySelector('.msg'); noteEl = tray.querySelector('input');
    noteEl.value = note;
    noteEl.addEventListener('input', function () { note = noteEl.value; save(); });
    tray.addEventListener('click', function (ev) {
      var btn = ev.target.closest && ev.target.closest('[data-act]');
      var a = btn && btn.getAttribute('data-act');
      if (a === 'ai') copy(forAI(), 'Copied. Paste it into your AI.');
      else if (a === 'kw') copy(keywords(), 'Keywords copied.');
      else if (a === 'link') copy(link(), 'Link copied. It reopens these picks.');
      else if (a === 'clear') { picks = []; save(); sync(); }
    });
  }

  function sync() {
    document.querySelectorAll('.pick[data-slug]').forEach(function (b) {
      var on = has(b.dataset.slug);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.textContent = on ? 'Picked' : '+ Pick';
    });
    if (!tray) return;
    tray.classList.toggle('on', picks.length > 0);
    countEl.textContent = picks.length + ' picked';
    namesEl.textContent = picks.map(function (p) { return p.n; }).join(' · ');
  }

  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('.pick[data-slug]');
    if (b) { ev.preventDefault(); toggle(fromBtn(b)); }
  });

  // ?pick=slug,slug reopens a shared selection
  function fromLink() {
    var q = new URLSearchParams(location.search).get('pick');
    if (!q) return;
    var want = q.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    fetch(base + 'api/v1/keywords.json').then(function (r) { return r.json(); }).then(function (data) {
      var by = {}; data.keywords.forEach(function (k) { by[k.slug] = k; });
      want.forEach(function (s) {
        var k = by[s]; if (!k || has(s)) return;
        picks.push({ s: k.slug, n: k.name, c: k.category, d: k.definition, e: k.prompt_example });
      });
      save(); sync();
    }).catch(function () {});
  }

  build(); sync(); fromLink();
  window.AISWPicks = { sync: sync };
})();
