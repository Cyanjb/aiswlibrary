# AI and See Why Keyword Library

The plain-language library of tested AI prompt keywords. Freemium: public pages drive SEO and Pinterest traffic; Advanced Keywords and Sref Codes sections are vault-member content.

## Layout
- **/data/** — the database: sections.csv, categories.csv, keywords.csv
- **/generator/** — build.py reads /data, writes the site to the repo root. Run: `cd generator && python3 build.py`
- **Repo root** — generated site (category/, keyword/, api/, index.html, sitemap.xml, style.css, robots.txt, llms.txt, picks.js). Never hand-edit; only data/, generator/ and skill/ are editable.
- **/skill/aisw-keywords/** — Claude skill that reads the library feed and turns picks into prompts

## Pick and send to AI
- Every keyword (search results, category cards, keyword pages) has a **+ Pick** button. Picks show in a tray at the bottom of every page and survive page changes (stored in the visitor's browser).
- **Copy for AI**: a full brief (name, meaning, example, link per pick, plus the visitor's note) to paste into ChatGPT, Claude or any AI.
- **Copy keywords**: a plain comma list for Midjourney, Seedance and other prompt boxes.
- **Copy link**: `index.html?pick=slug,slug` reopens the same picks for anyone.
- Source: generator/picks.js (copied to the root on build).

## Media and the gallery
- `assets/clips/`: Shot Library stills and clips (from the Camera and Effects Library). `assets/style-samples/`: code-animated style references. `assets/styles/`: the Motion Style Catalog demos, one 10-second fake ad per style, with the "STYLE: name" label cropped off.
- `assets/style-samples/data-chart-animation.mp4` is drawn in code from `generator/style-samples/data-chart.html` (a made-up company, Lantern Coffee); re-render with `node generator/style-samples/render-data-chart.mjs`. Style samples must not show real companies or people.
- Every video has a same-named `.jpg` beside it. The generator uses it as the poster and as the card thumbnail; hovering a thumbnail plays the clip (`generator/gallery.js`). When you add a video, add its `.jpg` too (`ffmpeg -ss 1 -i clip.mp4 -frames:v 1 -vf scale=640:-2 clip.jpg`).
- Rows with source `cyan-library-web-styles`, `cyan-library-motion-styles` or `cyan-library-camera` came from Cyan's own style library, motion-design skill and Camera and Effects Library (18 October 2026). Brand-derived styles were given generic names, and the Pac-Man style has no demo because the clip shows the real characters.

## Keyword example images (October 2026)
- `assets/clips/kw-<slug>.jpg`: 36 stills that filled the empty examples in Lighting, Cinematic Lighting, Film Looks and Grades, Lenses and Optics, Photo Angles, Palettes and Weather (21 October 2026). Made with Nano Banana 2.1 on OpenArt, using the mascot still `assets/clips/medium.jpg` as the reference so they match the Shot Library. Each image was checked to clearly show its keyword; ones that did not were remade.
- Slow Motion still has no example: it needs a video clip, not a still.

## UI and Web Motion demos
- `generator/ui-demos/`: the 48 UI Components and Web Motion and Effects demos, drawn in code (`kit.js` plus one file per group in `demos/`). Every demo is a pure function of time, so it loops seamlessly and renders the same every time.
- Check by eye: `node generator/ui-demos/preview.mjs <group>.js out.png`. Render to `assets/ui-motion/`: `node generator/ui-demos/render.mjs [slug ...]`. `BRIEF.md` there holds the rules for adding a demo.

## AI feed
- `/api/v1/keywords.json` (every published entry, full fields) and `/api/v1/categories.json`, rebuilt on every build
- `/llms.txt` tells AI agents where the feed is
- Install the skill by copying `skill/aisw-keywords` to `~/.claude/skills/` (all projects) or `.claude/skills/` in a project

## Entry format (decided April 2026, do not drift)
Term + plain definition + when to use it + example prompt phrase. Beginner voice: warm, no jargon, no film school.

## Tiers
- tier=free: full public entry
- tier=member: public teaser + vault CTA; full content delivered inside the vault

## Adding keywords
Add a row to keywords.csv (status=published), rebuild, upload changed files to GitHub. Netlify deploys automatically.
Rows with source=claude-2026-10-18 were written by Claude to fill empty categories. When the Discord archive is migrated, a tested archive post replaces the Claude row for the same keyword (keep the slug).

## Style samples
`assets/style-samples/` holds code-animated style clips made with the huashu-art-motion skill (rows with source=huashu-art-motion-2026-10-18, added by `generator/style_samples_batch.py`). They show the look of a style, not a prompt result, so build.py captions every clip from that folder as a style sample. When a real tested result exists for the keyword, add it to `images` ahead of the sample (or replace it).

## Migrating the Discord archive
1. Third party: DiscordChatExporter (free, github.com/Tyrrrz/DiscordChatExporter) exports each forum channel to JSON with image attachments
2. Hand the export folder to a Claude session: it parses posts into keywords.csv rows (matching category by channel name) and collects the 4-image grids
3. Images go in /images/<keyword-slug>/ and the generator picks them up (placeholder slots exist on every page)
4. Review voice and publish in batches of one category at a time

## Rules
- Slugs are permanent once published
- Living people are NOT published by name. Deceased creators are allowed in Architects, Photographers, Fashion Designers and Interior Designers, with birth and death years in the definition (decided 18 October 2026)
- The Public Domain Artists section stays strictly public domain: Classics died before 1800, Painters and Illustrators died before 1956
- Sref codes are only published from real tests; never write a code that was not run
- Every page carries the vault CTA; the library is the top of the funnel
