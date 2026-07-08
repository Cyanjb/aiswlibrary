#!/usr/bin/env python3
"""AI and See Why Keyword Library generator. Reads ../data, writes site to repo root."""
import csv, os, shutil, html

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA, DIST = os.path.join(os.path.dirname(ROOT), "data"), os.path.dirname(ROOT)
DOMAIN = "https://library.aiandseewhy.com"
UPDATED = "July 2026"

def rows(name):
    with open(os.path.join(DATA, name), newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))

sections = rows("sections.csv")
cats = rows("categories.csv")
kws = [k for k in rows("keywords.csv") if k["status"] == "published"]
cats_by_id = {c["category_id"]: c for c in cats}
kw_by_cat = {}
for k in kws: kw_by_cat.setdefault(k["category_id"], []).append(k)
kw_by_slug = {k["slug"]: k for k in kws}

CSS = """
:root{--bg:#121016;--card:#1b1722;--ink:#f2edf5;--soft:#a89db3;--pink:#ff5fa2;--teal:#4fd8c4;--gold:#e8b64c;--line:#2c2536}
*{box-sizing:border-box}body{margin:0;font-family:Georgia,'Times New Roman',serif;background:var(--bg);color:var(--ink);line-height:1.6}
a{color:var(--teal);text-decoration:none}a:hover{color:var(--pink)}
.wrap{max-width:1080px;margin:0 auto;padding:0 20px}
header{border-bottom:1px solid var(--line);padding:18px 0}
.brand{font-size:1.15rem;color:var(--ink)}.brand b{color:var(--pink)}
.hero{padding:56px 0 36px}.hero h1{font-size:2.3rem;margin:0 0 10px}.hero p{color:var(--soft);max-width:640px}
h2{color:var(--pink);margin-top:44px}h3{margin:0 0 6px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;margin:18px 0}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px}
.card p{color:var(--soft);font-size:.92rem;margin:6px 0 0}
.tag{display:inline-block;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:var(--gold);border:1px solid var(--gold);border-radius:99px;padding:2px 10px;margin-bottom:8px}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{font-size:.8rem;border:1px solid var(--line);border-radius:99px;padding:4px 12px;color:var(--soft);background:var(--card);cursor:pointer}
.chip:hover,.chip.on{border-color:var(--pink);color:var(--pink)}
.searchbox{width:100%;font-size:1.05rem;padding:14px 18px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-family:inherit;outline:none}
.searchbox:focus{border-color:var(--teal)}
.fgroup{margin:14px 0}.fgroup .label{margin:0 0 6px}
#results .card small{color:var(--gold);font-size:.72rem;letter-spacing:.06em;text-transform:uppercase}
#noresults{color:var(--soft);padding:20px 0}
.entry{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:26px;margin:22px 0}
.label{font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--teal);margin:18px 0 4px}
.example{background:#0d0b11;border:1px dashed var(--line);border-radius:10px;padding:12px 16px;font-family:monospace;color:var(--gold)}
.pair a{margin-right:10px}
.imgs{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-top:10px}
.imgs .ph{aspect-ratio:1;background:#0d0b11;border:1px dashed var(--line);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--soft);font-size:.8rem}
.imgs img,.imgs video{width:100%;aspect-ratio:1;object-fit:cover;border-radius:10px;border:1px solid var(--line);display:block}
.cta{background:linear-gradient(120deg,#241a2e,#1a2430);border:1px solid var(--line);border-radius:16px;padding:22px;margin:34px 0}
.cta b{color:var(--pink)}
.crumb{color:var(--soft);font-size:.9rem;margin:20px 0 0}
footer{border-top:1px solid var(--line);margin-top:60px;padding:26px 0;color:var(--soft);font-size:.9rem}
"""

CTA = ""

def page(title, desc, body, canonical, depth=0):
    pre = "../" * depth
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title><meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{canonical}"><link rel="stylesheet" href="{pre}style.css"></head>
<body><header><div class="wrap"><a class="brand" href="{pre}index.html">AI and See <b>Why</b> · Keyword Library</a></div></header>
<div class="wrap">{body}</div>
<footer><div class="wrap">Every keyword tested, explained in plain language, and updated {UPDATED}. Built by Cyan Brown for people who were never shown how. <a href="https://www.aiandseewhy.com">aiandseewhy.com</a></div></footer></body></html>"""

urls = []

# Selective clean (never touches data/ or generator/)
for d in ["category", "keyword"]:
    p = os.path.join(DIST, d)
    if os.path.exists(p): shutil.rmtree(p)
for f in ["index.html", "sitemap.xml", "robots.txt", "style.css"]:
    p = os.path.join(DIST, f)
    if os.path.exists(p): os.remove(p)
os.makedirs(os.path.join(DIST, "category"), exist_ok=True)
os.makedirs(os.path.join(DIST, "keyword"), exist_ok=True)
open(os.path.join(DIST, "style.css"), "w").write(CSS)

# Keyword pages
for k in kws:
    c = cats_by_id[k["category_id"]]
    member = False
    pairs = ""
    if k["pairs_well_with"]:
        links = []
        for p in k["pairs_well_with"].split(";"):
            p = p.strip()
            slug = p.lower().replace(" ", "-")
            links.append(f'<a href="{slug}.html">{html.escape(p)}</a>' if slug in kw_by_slug else html.escape(p))
        pairs = f'<div class="label">Pairs well with</div><p class="pair">{" · ".join(links)}</p>'
    tagchips = ""
    ktags = [t.strip() for t in k.get("tags", "").split(";") if t.strip()]
    if ktags:
        chips = "".join(f'<a class="chip" href="../index.html?tag={html.escape(t)}">{html.escape(t)}</a>' for t in ktags)
        tagchips = f'<div class="label">Tags</div><div class="chips">{chips}</div>'
    if member:
        body_core = f"""<div class="label">Members only</div>
<p>{html.escape(k['definition'].split('.')[0])}. Full entry coming soon.</p>{CTA}"""
    else:
        media = [m.strip() for m in k.get("images", "").split(";") if m.strip()]
        if media:
            cells = []
            for m in media:
                src = html.escape(f"../assets/{m}")
                if m.lower().endswith((".mp4", ".webm")):
                    cells.append(f'<video src="{src}" autoplay muted loop playsinline></video>')
                else:
                    cells.append(f'<img src="{src}" alt="{html.escape(k["name"])} example" loading="lazy">')
            imgs = '<div class="imgs">' + "".join(cells) + "</div>"
        else:
            ph_text = "example clip coming soon" if "seedance" in k.get("works_in", "") else "example coming from the archive"
            imgs = '<div class="imgs">' + ''.join(f'<div class="ph">{ph_text}</div>' for _ in range(4)) + '</div>'
        body_core = f"""<div class="label">What it means</div><p>{html.escape(k['definition'])}</p>
<div class="label">When to use it</div><p>{html.escape(k['when_to_use'])}</p>
<div class="label">Try this</div><div class="example">{html.escape(k['prompt_example'])}</div>
{pairs}
<div class="label">Works in</div><p>{html.escape(k['works_in'].replace(';', ' · '))}</p>
{tagchips}
<div class="label">Examples</div>{imgs}"""
    body = f"""<p class="crumb"><a href="../index.html">Library</a> / <a href="../category/{c['category_id']}.html">{html.escape(c['name'])}</a> / {html.escape(k['name'])}</p>
<div class="hero"><span class="tag">{html.escape(c['name'])}</span><h1>{html.escape(k['name'])}</h1></div>
<div class="entry">{body_core}</div>{'' if member else CTA}"""
    html_out = page(f"{k['name']}: AI Prompt Keyword Explained | AI and See Why",
                    f"What {k['name']} does in AI image and video prompts, when to use it, and a ready-to-try example. Plain language, no jargon.",
                    body, f"{DOMAIN}/keyword/{k['slug']}.html", depth=1)
    open(os.path.join(DIST, "keyword", f"{k['slug']}.html"), "w").write(html_out)
    urls.append(f"/keyword/{k['slug']}.html")

# Category pages
for c in cats:
    items = kw_by_cat.get(c["category_id"], [])
    cards = ""
    for k in sorted(items, key=lambda x: x["name"]):
        lock = ""
        teaser = k["definition"].split(".")[0] + "."
        cards += f"""<div class="card"><h3><a href="../keyword/{k['slug']}.html">{html.escape(k['name'])}</a>{lock}</h3><p>{html.escape(teaser)}</p></div>"""
    if not items:
        cards = '<div class="card"><p>Entries from the archive are on their way. This category is being migrated from three years of tested posts.</p></div>'
    body = f"""<p class="crumb"><a href="../index.html">Library</a> / {html.escape(c['name'])}</p>
<div class="hero"><h1>{html.escape(c['name'])}</h1><p>{len(items)} keyword{'s' if len(items)!=1 else ''} in this category, each one tested and explained in plain language.</p></div>
<div class="grid">{cards}</div>{CTA}"""
    html_out = page(f"{c['name']}: AI Prompt Keywords | AI and See Why",
                    f"Tested {c['name'].lower()} keywords for AI image and video prompts, explained for beginners.",
                    body, f"{DOMAIN}/category/{c['category_id']}.html", depth=1)
    open(os.path.join(DIST, "category", f"{c['category_id']}.html"), "w").write(html_out)
    urls.append(f"/category/{c['category_id']}.html")

# Homepage
sec_html = ""
for s in sections:
    sec_cats = [c for c in cats if c["section_id"] == s["section_id"]]
    lock = ""
    cards = ""
    for c in sec_cats:
        n = len(kw_by_cat.get(c["category_id"], []))
        count = f"{n} keywords" if n else "migrating from the archive"
        cards += f"""<div class="card"><h3><a href="category/{c['category_id']}.html">{html.escape(c['name'])}</a></h3><p>{count}</p></div>"""
    sec_html += f"<h2>{html.escape(s['name'])}{lock}</h2><div class=\"grid\">{cards}</div>"
# Search index + filter groups
import json as _json
FILTER_GROUPS = [
 ("Color", ["pastel colors","vibrant colors","dark colors","neutral colors","pink","gold","black and white"]),
 ("Light", ["golden light","soft light","dramatic light","neon light","night","glow"]),
 ("Feel", ["cute","dreamy","cozy","elegant","playful","romantic","moody","calm","spooky","edgy","magical","retro","vintage","futuristic"]),
 ("Type", ["painting","drawing","photography","fashion","pattern","craft","abstract","texture","nature","urban"]),
 ("Video", ["camera movement","framing","lens effect","lighting","editing","film look"]),
]
all_tags = set()
index = []
for k in kws:
    ktags = [t.strip() for t in k.get("tags","").split(";") if t.strip()]
    all_tags.update(ktags)
    index.append({
        "n": k["name"], "s": k["slug"],
        "c": cats_by_id[k["category_id"]]["name"],
        "t": ktags,
        "d": k["definition"].split(".")[0] + ".",
    })
chips_html = ""
for gname, gtags in FILTER_GROUPS:
    present = [t for t in gtags if t in all_tags]
    if not present: continue
    chips = "".join(f'<span class="chip" data-tag="{html.escape(t)}">{html.escape(t)}</span>' for t in present)
    chips_html += f'<div class="fgroup"><div class="label">{gname}</div><div class="chips">{chips}</div></div>'

search_js = """
<script>
const IDX = INDEX_JSON;
const input = document.getElementById('q');
const results = document.getElementById('results');
const nores = document.getElementById('noresults');
const browse = document.getElementById('browse');
const active = new Set();
function norm(s){return s.toLowerCase().trim()}
function render(){
  const q = norm(input.value);
  const terms = q ? q.split(/\s+/) : [];
  if(!terms.length && !active.size){
    results.innerHTML=''; nores.style.display='none'; browse.style.display=''; return;
  }
  browse.style.display='none';
  const hits = IDX.filter(k=>{
    const hay = norm(k.n+' '+k.t.join(' ')+' '+k.d+' '+k.c);
    for(const t of terms){ if(!hay.includes(t)) return false; }
    for(const tag of active){ if(!k.t.includes(tag)) return false; }
    return true;
  });
  nores.style.display = hits.length ? 'none' : '';
  results.innerHTML = hits.map(k=>
    `<div class="card"><small>${k.c}</small><h3><a href="keyword/${k.s}.html">${k.n}</a></h3><p>${k.d}</p></div>`
  ).join('');
}
document.querySelectorAll('.chip[data-tag]').forEach(ch=>{
  ch.addEventListener('click',()=>{
    const t = ch.dataset.tag;
    if(active.has(t)){active.delete(t);ch.classList.remove('on')}
    else{active.add(t);ch.classList.add('on')}
    render();
  });
});
input.addEventListener('input', render);
const params = new URLSearchParams(location.search);
if(params.get('q')){ input.value = params.get('q'); }
if(params.get('tag')){
  const t = params.get('tag');
  document.querySelectorAll('.chip[data-tag]').forEach(ch=>{
    if(ch.dataset.tag===t){active.add(t);ch.classList.add('on')}
  });
  if(!active.has(t)) active.add(t);
}
render();
</script>"""
search_js = search_js.replace("INDEX_JSON", _json.dumps(index, ensure_ascii=False))

body = f"""<div class="hero"><h1>The Keyword Library</h1>
<p>Every prompt keyword tested, explained without jargon, and shown with real examples. Built from three years of experiments so you don't have to guess what a word will do to your image.</p></div>
<input id="q" class="searchbox" type="search" placeholder="Try: golden light, pastel colors, cute, camera movement..." autocomplete="off">
{chips_html}
<div id="noresults" style="display:none">Nothing matched that yet. Try a simpler word, or tap a tag above.</div>
<div id="results" class="grid"></div>
<div id="browse">{sec_html}</div>
{search_js}"""
open(os.path.join(DIST, "index.html"), "w").write(
    page("AI Prompt Keyword Library: Styles, Lighting, Textures Explained | AI and See Why",
         "The plain-language library of AI prompt keywords: styles, lighting, textures, palettes and more, tested and explained for beginners.",
         body, f"{DOMAIN}/index.html"))
urls.append("/index.html")

# Sitemap + robots
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
for u in urls: sm += f"  <url><loc>{DOMAIN}{u}</loc></url>\n"
open(os.path.join(DIST, "sitemap.xml"), "w").write(sm + "</urlset>\n")
open(os.path.join(DIST, "robots.txt"), "w").write(f"User-agent: *\nAllow: /\nSitemap: {DOMAIN}/sitemap.xml\n")
print(f"Built {len(urls)} pages")
