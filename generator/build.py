#!/usr/bin/env python3
"""AI and See Why Keyword Library generator. Reads ../data, writes site to repo root."""
import csv, os, shutil, html, urllib.parse

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA, DIST = os.path.join(os.path.dirname(ROOT), "data"), os.path.dirname(ROOT)
# The address canonical tags, the sitemap and the AI feed point to. library.aiandseewhy.com has no DNS
# record yet (checked 19 Oct 2026); switch back here once it points at Netlify.
DOMAIN = "https://aiswlibrary.netlify.app"
UPDATED = "October 2026"

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
refs = sorted(rows("references.csv"), key=lambda r: int(r["order"]))

# Film reference sites (data/references.csv). Costs were checked on these dates; recheck when you edit the file.
REFS_CHECKED = "October 2026"
# Categories whose keywords show up in a single frame get a StillsLab search link on their pages
STILL_CATS = {"shot-sizes-angles", "lenses-optics", "cinematic-lighting", "film-looks-grades", "composition",
              "lighting", "photo-angles", "colors-palettes", "weather"}
# Moves and edits need a clip, not a still
MOTION_CATS = {"camera-movements", "transitions-editing"}

CSS = """
:root{--bg:#121016;--card:#1b1722;--ink:#f2edf5;--soft:#a89db3;--pink:#ff5fa2;--teal:#4fd8c4;--gold:#e8b64c;--line:#2c2536}
*{box-sizing:border-box}body{margin:0;font-family:Georgia,'Times New Roman',serif;background:var(--bg);color:var(--ink);line-height:1.6}
a{color:var(--teal);text-decoration:none}a:hover{color:var(--pink)}
.wrap{max-width:1080px;margin:0 auto;padding:0 20px}
header{border-bottom:1px solid var(--line);padding:18px 0}
header .wrap{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:6px 16px}
.nav{font-size:.92rem}
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
.media-note{color:var(--soft);font-size:.8rem;font-style:italic;margin:8px 0 0}
.imgs.media{grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}
.imgs.media img,.imgs.media video{aspect-ratio:16/9;object-fit:contain;background:#0d0b11}
.imgs.media .portrait{width:100%;max-width:420px;height:auto;justify-self:center}
.cta{background:linear-gradient(120deg,#241a2e,#1a2430);border:1px solid var(--line);border-radius:16px;padding:22px;margin:34px 0}
.cta b{color:var(--pink)}
.crumb{color:var(--soft);font-size:.9rem;margin:20px 0 0}
footer{border-top:1px solid var(--line);margin-top:60px;padding:26px 0 120px;color:var(--soft);font-size:.9rem}
.card{position:relative}.card .pick{position:absolute;top:14px;right:14px;z-index:2}.card h3{padding-right:74px}
.card .thumb{display:block;position:relative;margin:-18px -18px 14px;aspect-ratio:16/9;overflow:hidden;border-radius:14px 14px 0 0;background:#0d0b11;border-bottom:1px solid var(--line)}
.card .thumb img,.card .thumb video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.card .thumb.portrait img,.card .thumb.portrait video{object-fit:contain}
.card .thumb+.pick+h3{padding-right:0}
.card>small{display:block;padding-right:74px}.card .thumb~small{padding-right:0}
.cprev{display:grid;margin:-18px -18px 14px;aspect-ratio:16/9;overflow:hidden;border-radius:14px 14px 0 0;background:#0d0b11;border-bottom:1px solid var(--line);gap:2px}
.cprev img{width:100%;height:100%;min-height:0;object-fit:cover;display:block}
.cprev.trio{grid-template-columns:repeat(3,1fr)}.cprev.trio img{object-fit:contain}
.cprev.quad{grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr}
.cprev.words{gap:8px;align-content:center;justify-items:start;padding:16px 18px;background:radial-gradient(120% 140% at 0% 0%,color-mix(in srgb,var(--tint) 34%,#1b1722) 0%,#15111a 70%)}
.cprev.words span{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.86rem;color:var(--ink);border:1px solid color-mix(in srgb,var(--tint) 55%,transparent);border-radius:99px;padding:3px 12px;background:rgba(18,16,22,.45)}
.pick{font:inherit;font-size:.78rem;border:1px solid var(--line);border-radius:99px;padding:3px 12px;background:#0d0b11;color:var(--soft);cursor:pointer;white-space:nowrap}
.pick:hover{border-color:var(--teal);color:var(--teal)}
.pick[aria-pressed="true"]{background:var(--pink);border-color:var(--pink);color:#121016}
.hero .pick{font-size:.9rem;padding:6px 16px;margin-top:12px}
#tray{position:fixed;left:0;right:0;bottom:0;z-index:50;background:#1b1722f2;border-top:1px solid var(--pink);backdrop-filter:blur(8px);padding:12px 0;display:none}
#tray.on{display:block}
#tray .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
#tray .count{color:var(--pink);font-weight:bold;margin-right:4px}
#tray .names{color:var(--soft);font-size:.85rem;flex:1 1 220px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#tray input{flex:1 1 220px;min-width:0;font:inherit;font-size:.9rem;padding:8px 12px;border-radius:10px;border:1px solid var(--line);background:#0d0b11;color:var(--ink)}
#tray button{font:inherit;font-size:.85rem;border-radius:99px;padding:7px 14px;cursor:pointer;border:1px solid var(--line);background:var(--card);color:var(--ink)}
#tray button.main{background:var(--teal);border-color:var(--teal);color:#121016;font-weight:bold}
#tray button:hover{border-color:var(--pink)}
#tray .msg{color:var(--gold);font-size:.85rem}
@media (max-width:600px){#tray{padding:10px 0}#tray .names{display:none}#tray .row{gap:6px}#tray button{font-size:.76rem;padding:6px 10px}#tray .count{font-size:.85rem}#tray .lg{display:none}#tray .cap::first-letter{text-transform:uppercase}}
.howto{color:var(--soft);font-size:.92rem;border-left:3px solid var(--teal);padding:4px 0 4px 14px;margin:18px 0}
.steps{counter-reset:step;list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;margin:18px 0}
.steps li{counter-increment:step;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px;color:var(--soft);font-size:.92rem}
.steps li::before{content:counter(step);display:block;color:var(--pink);font-size:1.6rem;line-height:1;margin-bottom:8px}
.steps b{color:var(--ink)}
.ref h3 a{color:var(--ink)}.ref h3 a:hover{color:var(--pink)}
.ref .kind{color:var(--gold);font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;display:block;margin-bottom:6px}
.ref .label{margin-top:14px}
.ref .tip{border-left:3px solid var(--pink);padding-left:10px}
.ref .go{display:inline-block;margin-top:14px;font-size:.9rem}
.seefilm{color:var(--soft);font-size:.95rem}
.seefilm-row{display:flex;flex-wrap:wrap;gap:12px 18px;align-items:center}.seefilm-row .seefilm{flex:1 1 260px;margin:0}
.seefilm-row video{width:240px;max-width:100%;aspect-ratio:16/9;border-radius:10px;border:1px solid var(--line);display:block;background:#0d0b11}
.method{width:100%;max-width:760px;aspect-ratio:16/9;border-radius:16px;border:1px solid var(--line);display:block;margin:18px 0;background:#0d0b11}
"""

SKILL_HINT = "Pick keywords as you browse, then press Copy for AI and paste into ChatGPT, Claude or any AI. Copy keywords gives a plain list for Midjourney or Seedance."

ASSETS = os.path.join(DIST, "assets")

def poster_for(m):
    """A still for a media path: the image itself, or a same-named .jpg beside a video."""
    if m.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
        return m
    jpg = m.rsplit(".", 1)[0] + ".jpg"
    return jpg if os.path.exists(os.path.join(ASSETS, jpg)) else None

import struct

def image_size(path):
    """(width, height) of a JPEG or PNG, read from its header; None if unknown."""
    try:
        with open(path, "rb") as f:
            data = f.read(256 * 1024)
    except OSError:
        return None
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return struct.unpack(">II", data[16:24])
    i = 2
    while i + 9 < len(data) and data[:2] == b"\xff\xd8":
        if data[i] != 0xFF:
            return None
        marker, seglen = data[i + 1], struct.unpack(">H", data[i + 2:i + 4])[0]
        if marker in (0xC0, 0xC1, 0xC2):
            h, w = struct.unpack(">HH", data[i + 5:i + 9])
            return (w, h)
        i += 2 + seglen
    return None

def shape_of(m):
    """CSS aspect-ratio ('480 / 768') and 'portrait' or 'landscape' for a media path, from its still."""
    p = poster_for(m)
    size = image_size(os.path.join(ASSETS, p)) if p else None
    if not size:
        return ("16 / 9", "landscape")
    w, h = size
    return (f"{w} / {h}", "portrait" if h > w * 1.05 else "landscape")

def thumb_of(k):
    """(still, video) for a card thumbnail, from the keyword's first media item."""
    media = [m.strip() for m in k.get("images", "").split(";") if m.strip()]
    if not media:
        return (None, "")
    p = poster_for(media[0])
    return (p, media[0] if media[0].lower().endswith((".mp4", ".webm")) and p else "")

def thumb_html(k, pre):
    p, v = thumb_of(k)
    if not p:
        return ""
    dv = f' data-video="{html.escape(pre + "assets/" + v)}"' if v else ""
    ratio, shape = shape_of(p)
    return (f'<a class="thumb {shape}" style="aspect-ratio:{ratio}" href="{pre}keyword/{html.escape(k["slug"])}.html"{dv}>'
            f'<img src="{html.escape(pre + "assets/" + p)}" alt="" loading="lazy"></a>')

def pick_btn(k):
    return (f'<button type="button" class="pick" aria-pressed="false" data-slug="{html.escape(k["slug"])}" '
            f'data-name="{html.escape(k["name"])}" data-cat="{html.escape(cats_by_id[k["category_id"]]["name"])}" '
            f'data-def="{html.escape(k["definition"])}" data-ex="{html.escape(k["prompt_example"])}">+ Pick</button>')

CTA = ""

def page(title, desc, body, canonical, depth=0):
    pre = "../" * depth
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title><meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{canonical}"><link rel="stylesheet" href="{pre}style.css"></head>
<body><header><div class="wrap"><a class="brand" href="{pre}index.html">AI and See <b>Why</b> · Keyword Library</a><a class="nav" href="{pre}references.html">Film references</a></div></header>
<div class="wrap">{body}</div>
<footer><div class="wrap">Every keyword tested, explained in plain language, and updated {UPDATED}. Built by Cyan Brown for people who were never shown how. <a href="https://www.aiandseewhy.com">aiandseewhy.com</a></div></footer>
<script src="{pre}picks.js" defer></script><script src="{pre}gallery.js" defer></script></body></html>"""

def ref_video(name, cls="", pre=""):
    """Autoplaying loop for a Film Reference Finder demo in assets/references/ (drawn in generator/ui-demos/demos/refs.js)."""
    if not os.path.exists(os.path.join(ASSETS, "references", f"{name}.mp4")):
        return ""
    src = html.escape(f"{pre}assets/references/{name}")
    c = f' class="{cls}"' if cls else ""
    return f'<video{c} src="{src}.mp4" poster="{src}.jpg" autoplay muted loop playsinline aria-hidden="true"></video>'

def see_in_films(k, c):
    """Where to see a keyword in real films: a StillsLab search for still-friendly categories, a pointer to clip sites for moves."""
    cid = c["category_id"]
    if cid in STILL_CATS:
        sl = next(r for r in refs if r["slug"] == "stillslab")
        q = urllib.parse.quote(k["name"])
        link = html.escape(sl["search_url"].replace("{q}", q))
        return (f'<div class="label">See it in real films</div><div class="seefilm-row">{ref_video("ref-see-still", pre="../")}'
                f'<p class="seefilm"><a href="{link}" target="_blank" rel="noopener">'
                f'Search StillsLab for &ldquo;{html.escape(k["name"])}&rdquo;</a>, free real film frames. '
                f'Look at three and name what you see. <a href="../references.html">More film reference sites</a></p></div>')
    if cid in MOTION_CATS:
        return (f'<div class="label">See it in real films</div><div class="seefilm-row">{ref_video("ref-see-motion", pre="../")}'
                f'<p class="seefilm">A still can\'t show a move. '
                f'Search a clip site like <a href="https://filmvibes.io" target="_blank" rel="noopener">Film Vibes</a> for '
                f'&ldquo;{html.escape(k["name"])}&rdquo;, or follow a whole scene on '
                f'<a href="https://screenmusings.org" target="_blank" rel="noopener">Screenmusings</a>. '
                f'<a href="../references.html">More film reference sites</a></p></div>')
    return ""

urls = []

# Selective clean (never touches data/ or generator/)
for d in ["category", "keyword", "api"]:
    p = os.path.join(DIST, d)
    if os.path.exists(p): shutil.rmtree(p)
for f in ["index.html", "references.html", "sitemap.xml", "robots.txt", "style.css", "picks.js", "gallery.js", "llms.txt"]:
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
                ratio, shape = shape_of(m)
                fit = f' class="{shape}" style="aspect-ratio:{ratio}"'
                if m.lower().endswith((".mp4", ".webm")):
                    p = poster_for(m)
                    pa = f' poster="{html.escape("../assets/" + p)}"' if p else ""
                    cells.append(f'<video src="{src}"{pa}{fit} autoplay muted loop playsinline controls></video>')
                else:
                    cells.append(f'<img src="{src}"{fit} alt="{html.escape(k["name"])} example" loading="lazy">')
            imgs = '<div class="imgs media">' + "".join(cells) + "</div>"
            if any(m.startswith("style-samples/") for m in media):
                imgs += '<p class="media-note">Style sample: a code-animated reference for the look, not the output of this prompt. Your AI tool will give its own take.</p>'
            if any(m.startswith("styles/") for m in media):
                imgs += '<p class="media-note">Style demo: the same 10-second fake ad (an energy drink for cats) built in every style, so you can compare looks side by side. Built in code, not the output of this prompt.</p>'
        else:
            ph_text = "example clip coming soon" if "seedance" in k.get("works_in", "") else "example coming from the archive"
            imgs = '<div class="imgs">' + ''.join(f'<div class="ph">{ph_text}</div>' for _ in range(4)) + '</div>'
        body_core = f"""<div class="label">What it means</div><p>{html.escape(k['definition'])}</p>
<div class="label">When to use it</div><p>{html.escape(k['when_to_use'])}</p>
<div class="label">Try this</div><div class="example">{html.escape(k['prompt_example'])}</div>
{pairs}
<div class="label">Works in</div><p>{html.escape(k['works_in'].replace(';', ' · '))}</p>
{tagchips}
<div class="label">Examples</div>{imgs}
{see_in_films(k, c)}"""
    body = f"""<p class="crumb"><a href="../index.html">Library</a> / <a href="../category/{c['category_id']}.html">{html.escape(c['name'])}</a> / {html.escape(k['name'])}</p>
<div class="hero"><span class="tag">{html.escape(c['name'])}</span><h1>{html.escape(k['name'])}</h1>{'' if member else pick_btn(k)}</div>
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
        cards += f"""<div class="card">{thumb_html(k, "../")}{pick_btn(k)}<h3><a href="../keyword/{k['slug']}.html">{html.escape(k['name'])}</a>{lock}</h3><p>{html.escape(teaser)}</p></div>"""
    if not items:
        cards = '<div class="card"><p>Entries from the archive are on their way. This category is being migrated from three years of tested posts.</p></div>'
    howto = f'<p class="howto">{SKILL_HINT}</p>' if items else ""
    body = f"""<p class="crumb"><a href="../index.html">Library</a> / {html.escape(c['name'])}</p>
<div class="hero"><h1>{html.escape(c['name'])}</h1><p>{len(items)} keyword{'s' if len(items)!=1 else ''} in this category, each one tested and explained in plain language.</p>{howto}</div>
<div class="grid">{cards}</div>{CTA}"""
    html_out = page(f"{c['name']}: AI Prompt Keywords | AI and See Why",
                    f"Tested {c['name'].lower()} keywords for AI image and video prompts, explained for beginners.",
                    body, f"{DOMAIN}/category/{c['category_id']}.html", depth=1)
    open(os.path.join(DIST, "category", f"{c['category_id']}.html"), "w").write(html_out)
    urls.append(f"/category/{c['category_id']}.html")

# Homepage
PREVIEW_TINTS = ["#ff5fa2", "#4fd8c4", "#e8b64c", "#9b7bff"]

def cat_preview(c):
    """Banner for a homepage category card: its own stills when it has some, else sample keyword names."""
    items = sorted(kw_by_cat.get(c["category_id"], []), key=lambda k: k["name"])
    stills = [p for p in (thumb_of(k)[0] for k in items) if p]
    href = f'category/{c["category_id"]}.html'
    if stills:
        portrait = [p for p in stills if shape_of(p)[1] == "portrait"]
        if len(portrait) >= 3:
            pick, layout = portrait[:3], "trio"
        elif len(stills) >= 4:
            pick, layout = stills[:4], "quad"
        else:
            pick, layout = stills[:1], "single"
        imgs = "".join(f'<img src="assets/{html.escape(p)}" alt="" loading="lazy">' for p in pick)
        return f'<a class="cprev {layout}" href="{href}" tabindex="-1" aria-hidden="true">{imgs}</a>'
    tint = PREVIEW_TINTS[sum(map(ord, c["category_id"])) % len(PREVIEW_TINTS)]
    words = "".join(f"<span>{html.escape(k['name'])}</span>" for k in items[:3])
    return f'<a class="cprev words" style="--tint:{tint}" href="{href}" tabindex="-1" aria-hidden="true">{words}</a>'

sec_html = ""
for s in sections:
    sec_cats = [c for c in cats if c["section_id"] == s["section_id"]]
    lock = ""
    cards = ""
    for c in sec_cats:
        n = len(kw_by_cat.get(c["category_id"], []))
        count = f"{n} keywords" if n else "migrating from the archive"
        cards += f"""<div class="card">{cat_preview(c)}<h3><a href="category/{c['category_id']}.html">{html.escape(c['name'])}</a></h3><p>{count}</p></div>"""
    sec_html += f"<h2>{html.escape(s['name'])}{lock}</h2><div class=\"grid\">{cards}</div>"
# Search index + filter groups
import json as _json
FILTER_GROUPS = [
 ("Color", ["pastel colors","vibrant colors","dark colors","neutral colors","pink","gold","black and white"]),
 ("Light", ["golden light","soft light","dramatic light","neon light","night","glow"]),
 ("Feel", ["cute","dreamy","cozy","elegant","playful","romantic","moody","calm","spooky","edgy","magical","retro","vintage","futuristic"]),
 ("Type", ["painting","drawing","photography","fashion","pattern","craft","abstract","texture","nature","urban"]),
 ("Video", ["camera movement","framing","lens effect","lighting","editing","film look"]),
 ("Design", ["web design","ui motion","motion graphics"]),
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
        "D": k["definition"], "e": k["prompt_example"],
        **({"i": thumb_of(k)[0], "v": thumb_of(k)[1], "r": shape_of(thumb_of(k)[0])[0], "o": shape_of(thumb_of(k)[0])[1]} if thumb_of(k)[0] else {}),
    })
chips_html = ""
for gname, gtags in FILTER_GROUPS:
    present = [t for t in gtags if t in all_tags]
    if not present: continue
    chips = "".join(f'<span class="chip" data-tag="{html.escape(t)}">{html.escape(t)}</span>' for t in present)
    chips_html += f'<div class="fgroup"><div class="label">{gname}</div><div class="chips">{chips}</div></div>'

search_js = r"""
<script>
const IDX = INDEX_JSON;
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
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
    `<div class="card">${k.i?`<a class="thumb ${k.o}" style="aspect-ratio:${k.r}" href="keyword/${k.s}.html"${k.v?` data-video="assets/${esc(k.v)}"`:''}><img src="assets/${esc(k.i)}" alt="" loading="lazy"></a>`:''}<button type="button" class="pick" aria-pressed="false" data-slug="${esc(k.s)}" data-name="${esc(k.n)}" data-cat="${esc(k.c)}" data-def="${esc(k.D)}" data-ex="${esc(k.e)}">+ Pick</button><small>${k.c}</small><h3><a href="keyword/${k.s}.html">${k.n}</a></h3><p>${k.d}</p></div>`
  ).join('');
  if(window.AISWPicks) AISWPicks.sync();
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

# Film Reference Finder page
ref_cards = ""
for r in refs:
    vid = ref_video(f"ref-{r['slug']}")
    thumb = f'<div class="thumb">{vid}</div>' if vid else ""
    ref_cards += f"""<div class="card ref">{thumb}<span class="kind">{html.escape(r['kind'])}</span>
<h3><a href="{html.escape(r['url'])}" target="_blank" rel="noopener">{html.escape(r['name'])}</a></h3>
<p>{html.escape(r['what'])}</p>
<div class="label">Best for</div><p>{html.escape(r['best_for'])}</p>
<div class="label">Cost</div><p>{html.escape(r['cost'])}</p>
<div class="label">Try this</div><p class="tip">{html.escape(r['tip'])}</p>
<a class="go" href="{html.escape(r['url'])}" target="_blank" rel="noopener">Open {html.escape(r['name'])} &rarr;</a></div>"""
ref_body = f"""<p class="crumb"><a href="index.html">Library</a> / Film references</p>
<div class="hero"><h1>Film Reference Finder</h1>
<p>Free places to find real film frames, and how to turn what you see into keywords. Great directors learned by copying shots they loved. You can too.</p></div>
<h2>How to use a film frame</h2>
{ref_video("ref-method", "method")}
<ol class="steps">
<li><b>Find it.</b> Open a camera, lens or lighting keyword and press its StillsLab link, or search one of the sites below.</li>
<li><b>Name it.</b> Look at three frames and describe them in library words: shot size, angle, lens, light, color. Press + Pick on each keyword.</li>
<li><b>Prompt it.</b> Press Copy for AI or Copy keywords and write your own scene. Your subject, their technique.</li>
</ol>
<p class="howto">Five-minute drill: open any site below, find a frame you love, and write three keywords for it before you look anything up. Then search this library and check how close you got.</p>
<h2>Where to look</h2>
<div class="grid">{ref_cards}</div>
<div class="entry"><div class="label">Study freely, create your own</div>
<p>Film frames belong to the studios that made them. Use them to learn and for private mood boards. Don't upload them as image references for work you publish or sell, and don't recreate real actors' faces. Describe the look with keywords instead. Each site has its own terms too.</p></div>
<p class="howto">The animations on this page are drawn in code to show how each site works. They are not screenshots of the sites or their films. Costs checked {REFS_CHECKED}. Sites change their plans, so check before you pay. These are independent sites; AI and See Why isn't paid to list them.</p>"""
open(os.path.join(DIST, "references.html"), "w").write(
    page("Free Film Reference Sites for AI Prompts: Find Real Movie Frames | AI and See Why",
         "Where to find real film frames for free, and how to turn a movie still into AI prompt keywords. StillsLab, Shot.Café, FilmGrab and more, explained for beginners.",
         ref_body, f"{DOMAIN}/references.html"))
urls.append("/references.html")

body = f"""<div class="hero"><h1>The Keyword Library</h1>
<p>Every prompt keyword tested, explained without jargon, and shown with real examples. Built from three years of experiments so you don't have to guess what a word will do to your image.</p>
<p>New: the <a href="references.html">Film Reference Finder</a>. Free places to see any camera or lighting keyword in real films.</p></div>
<input id="q" class="searchbox" type="search" placeholder="Try: golden light, pastel colors, cute, camera movement..." autocomplete="off">
<p class="howto">{SKILL_HINT}</p>
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

# Pick tray script (source lives in generator/)
shutil.copy(os.path.join(ROOT, "picks.js"), os.path.join(DIST, "picks.js"))
shutil.copy(os.path.join(ROOT, "gallery.js"), os.path.join(DIST, "gallery.js"))

# Machine-readable feed for AI agents (the aisw-keywords skill reads this)
secs_by_id = {s["section_id"]: s for s in sections}
api_dir = os.path.join(DIST, "api", "v1")
os.makedirs(api_dir, exist_ok=True)
feed = []
for k in sorted(kws, key=lambda x: x["slug"]):
    c = cats_by_id[k["category_id"]]
    feed.append({
        "slug": k["slug"], "name": k["name"],
        "category": c["name"], "category_id": c["category_id"],
        "section": secs_by_id[c["section_id"]]["name"],
        "definition": k["definition"], "when_to_use": k["when_to_use"],
        "prompt_example": k["prompt_example"],
        "pairs_well_with": [p.strip() for p in k["pairs_well_with"].split(";") if p.strip()],
        "works_in": [w.strip() for w in k["works_in"].split(";") if w.strip()],
        "tags": [t.strip() for t in k.get("tags", "").split(";") if t.strip()],
        "media": [f"{DOMAIN}/assets/{m.strip()}" for m in k.get("images", "").split(";") if m.strip()],
        "url": f"{DOMAIN}/keyword/{k['slug']}.html",
    })
with open(os.path.join(api_dir, "keywords.json"), "w", encoding="utf-8") as f:
    _json.dump({"library": "AI and See Why Keyword Library", "updated": UPDATED, "count": len(feed), "keywords": feed}, f, ensure_ascii=False, indent=1)
with open(os.path.join(api_dir, "references.json"), "w", encoding="utf-8") as f:
    _json.dump({"checked": REFS_CHECKED, "page": f"{DOMAIN}/references.html",
                "sites": [{k: r[k] for k in ("slug", "name", "url", "kind", "what", "best_for", "cost", "tip", "search_url")} for r in refs]},
               f, ensure_ascii=False, indent=1)
with open(os.path.join(api_dir, "categories.json"), "w", encoding="utf-8") as f:
    _json.dump([{"category_id": c["category_id"], "name": c["name"], "section": secs_by_id[c["section_id"]]["name"],
                 "count": len(kw_by_cat.get(c["category_id"], []))} for c in cats], f, ensure_ascii=False, indent=1)

llms = f"""# AI and See Why Keyword Library

> Plain-language library of tested AI prompt keywords for image and video models (Midjourney, Nano Banana Pro, GPT Image, Seedance and more). Each keyword has a definition, when to use it, an example prompt phrase, pairings, the tools it works in, and example images or clips.

## For AI agents
- Full feed (JSON): {DOMAIN}/api/v1/keywords.json
- Categories (JSON): {DOMAIN}/api/v1/categories.json
- Film reference sites (JSON): {DOMAIN}/api/v1/references.json. Where to find real film frames for a keyword; a search_url with {{q}} takes the keyword name.
- Fallback if the domain is unreachable: https://raw.githubusercontent.com/Cyanjb/aiswlibrary/main/api/v1/keywords.json
- A picks link looks like {DOMAIN}/index.html?pick=golden-hour,push-in and lists keyword slugs in the order the person chose them.
- Use the keyword names as written. Keep the person's subject; the keywords describe style, light, camera and edit.

## Sections
""" + "".join(f"- {s['name']}\n" for s in sections)
open(os.path.join(DIST, "llms.txt"), "w", encoding="utf-8").write(llms)

# Sitemap + robots
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
for u in urls: sm += f"  <url><loc>{DOMAIN}{u}</loc></url>\n"
open(os.path.join(DIST, "sitemap.xml"), "w").write(sm + "</urlset>\n")
open(os.path.join(DIST, "robots.txt"), "w").write(f"User-agent: *\nAllow: /\nSitemap: {DOMAIN}/sitemap.xml\n")
print(f"Built {len(urls)} pages")
