"""Add the 21 motion styles made on 22 Oct 2026 (Motion Style Catalog pages 74 to 89, with the Vox and
torn-paper palettes) to the library: one row each in data/keywords.csv, a 480x768 clip and a 360x576 still
in assets/styles/, and tag-group entries in generator/tags_map.py.

Clips come from the catalog renders (1080x1920), with the bottom style-label strip trimmed off like the
other motion-style demos. Run from the repo root:  PYTHONUTF8=1 python generator/catalog_batch_2026_10_24.py
"""
import csv, io, os, re, subprocess

RENDERS = r'C:\Users\cyanj\motion-tests\style-catalog\renders'
WORKS = 'claude-code;seedance;kling;veo;runway'
DATE = '2026-10-24'
SOURCE = 'cyan-library-motion-styles'

# slug, name, catalog key, definition, when to use, prompt example, pairs well with, tags
ROWS = [
("vox-collage", "Vox Collage", "md-vox-collage",
 "The investigative news-video look: halftone photo prints, clippings and typed labels on a paper desk. The camera glides from clue to clue while highlighter, red circles and red string are drawn on in small handmade steps.",
 "Use for history, news and how-it-really-happened stories built on real photos and documents. It needs material to show; without any it becomes an empty desk.",
 "\"documentary collage, halftone archive photos taped to a paper desk, red marker circles a date, red string leads to the next photo, camera glides\"",
 "vox collage dark card;vox collage bright editorial;archive light table", "editing;vintage;black and white;texture;motion graphics;documentary"),
("vox-collage-dark-card", "Vox Collage, Dark Card", "md-vox-collage-dark",
 "The same collage desk with a big black card laid on it for one section: a quote or timeline types on in white, with a red line underneath.",
 "Use for a key quote, a turning point or a run of dates inside a collage film. One dark section per film keeps it special.",
 "\"documentary collage, black card on a paper desk, a quote types on in white, red underline draws beneath it\"",
 "vox collage;timeline", "editing;dark colors;words and letters;motion graphics;documentary"),
("vox-collage-bright-editorial", "Vox Collage, Bright Editorial", "md-vox-collage-bright",
 "Cut-out photos with white paper borders over bold flat colour fields of warm yellow, off-white, deep navy and coral. Big condensed words stamp in beside them.",
 "Use for punchy explainers, social clips and chapter openers. One colour field per scene keeps it readable.",
 "\"bright editorial collage, halftone cut-out photo with white paper border on a flat coral background, a big bold word stamps in\"",
 "vox collage;flat colour editorial", "vibrant colors;playful;words and letters;motion graphics;documentary"),
("vox-collage-paper-diorama", "Vox Collage, Paper Diorama", "md-vox-collage-diorama",
 "A miniature world built from aged sepia newspaper: cut-out figures with black bars over their eyes, one burnt-orange object as the only colour, and short words printed on signs and props, under warm lamp light.",
 "Use for dramatic, investigative stories about money, power or mystery. The full look usually starts from generated images, with labels and moves added on top.",
 "\"paper diorama made of aged sepia newspaper, cut-out figure with a black censor bar over the eyes, one burnt-orange prop, letterpress word on a sign, warm tungsten light, tilt-shift blur\"",
 "vox collage;tilt shift miniature", "craft;vintage;moody;golden light;motion graphics;documentary"),
("archive-light-table", "Archive Light Table", "md-archive-light-table",
 "Old photo negatives and records laid on a glowing light table. A magnifying loupe slides over each one and turns the negative into a positive inside the lens, with notes pointing at what matters.",
 "Use when a story checks a famous claim against its original source, or looks closely at old photos and documents.",
 "\"glass photo negatives on a backlit light table, a loupe slides over one and shows it as a positive, orange rings point to details\"",
 "vox collage;microscope story", "vintage;photography;glow;motion graphics;documentary"),
("archival-editorial-edit", "Archival Editorial Edit", "md-archival-editorial-edit",
 "An edit over talking-head footage: soft black-and-white archive inserts with gentle glow and fine moving grain, elegant words in three typefaces, a word tucked behind the speaker, and split screens that slide in beside them.",
 "Use to dress up interviews and presenter videos with archive material while keeping the person clean and in colour.",
 "\"interview edit, presenter on the left, bright soft black and white archive photo slides in as a split screen, an italic serif word sits behind the speaker\"",
 "vox collage;kinetic typography", "editing;black and white;elegant;film look;motion graphics;documentary"),
("torn-paper-collage-film", "Torn-Paper Collage Film", "md-torn-paper-collage",
 "One unbroken stop-motion dive through torn magazine collage at night: pieces drop in, holes tear open into the next world, a kaleidoscope zooms, a title lands and the page peels away to a logo. Neon pink on a night sky.",
 "Use for channel intros, launch films and short, energetic openers. It cuts to the music, so it suits pieces with a strong beat.",
 "\"10-second stop-motion torn paper collage intro, night sky with neon pink, a hole tears open into the next scene, title drops in, page peels to the logo\"",
 "torn paper collage daylight;punk zine collage;mid century cutout", "craft;playful;vibrant colors;night;motion graphics"),
("torn-paper-collage-daylight", "Torn-Paper Collage, Daylight", "md-torn-paper-collage-daylight",
 "The torn-paper collage dive in bright daylight colours: sky blue, red, orange and yellow torn sheets, halftone photo cut-outs and white paper tags.",
 "Use for cheerful intros, travel and family-friendly openers.",
 "\"stop-motion torn paper collage, sky blue and red torn sheets, halftone photo cut-outs, a hole tears open into a sunny scene\"",
 "torn paper collage film;memphis animation", "craft;playful;vibrant colors;motion graphics"),
("torn-paper-collage-pastel", "Torn-Paper Collage, Pastel", "md-torn-paper-collage-aisw",
 "The torn-paper collage dive in soft pastels: cream, blush pink and lavender sheets with magenta accents.",
 "Use for gentle, friendly brand intros and lifestyle openers.",
 "\"stop-motion torn paper collage in cream, blush pink and lavender, magenta accents, a page peels to reveal the logo\"",
 "torn paper collage film;paper storybook", "craft;cute;pastel colors;pink;motion graphics"),
("subject-analysis", "Subject Analysis", "md-subject-analysis",
 "A security-camera feed takes a subject apart in stages: a target locks on, a silhouette scans in, edges and a mesh appear, colour returns with an enhance zoom, an ID match counts up, and the feed glitches back to the start.",
 "Use for tech reveals, mystery hooks and looping social clips.",
 "\"CCTV analysis of a character, reticle locks on, silhouette scan, wireframe mesh, enhance zoom, ID match 98 percent, glitch back to start\"",
 "hologram hud;glitch datamosh", "tech;futuristic;edgy;motion graphics"),
("satellite-briefing", "Satellite Briefing", "md-satellite-briefing",
 "One long zoom from a globe down to a single place through layers of satellite-style maps. A targeting reticle locks on, moving things leave thin tracks, and one amber reading counts the key number.",
 "Use for stories about places, borders, land and change over time. The full style uses real satellite pictures.",
 "\"zoom from the globe down to a neighbourhood through satellite map layers, reticle locks on, one amber number counts up\"",
 "paper map journey;lidar survey", "tech;futuristic;architecture;motion graphics;documentary"),
("engineering-briefing-board", "Engineering Briefing Board", "md-engineering-briefing-board",
 "One whiteboard wall filled live: cut-out photos pinned with magnets, marker notes written letter by letter, blue measuring lines, and a red stamp when something crosses the safe limit. It ends on one pull back that shows the whole wall.",
 "Use to explain a problem and its options, like a planning meeting for one hard decision.",
 "\"whiteboard wall, photo cut-outs pinned with magnets, marker notes write on, a measuring line passes the safe limit, red stamp\"",
 "live whiteboard lesson;vox collage", "drawing;tech;words and letters;motion graphics;documentary"),
("lidar-survey", "LiDAR Survey", "md-lidar-survey",
 "A laser point cloud scans a place: the picture turns into thousands of points, layers peel away to show what is underneath, and the ground settles into contour lines.",
 "Use for archaeology, landscapes, buildings and anything about what lies beneath the surface.",
 "\"lidar point cloud scan of a house and garden, roof peels away layer by layer, ground becomes contour lines\"",
 "satellite briefing;white model projection", "tech;futuristic;architecture;motion graphics"),
("white-model-projection", "White Model Projection", "md-white-model-projection",
 "A plain white model of a town on a table in a dark room. A projector lights it with data: houses change colour, waves of light climb the streets, and pins label what matters.",
 "Use for city planning, maps of change and data about places.",
 "\"white architectural model of a town in a dark room, projector lights the houses blue, a wave of colour climbs the streets\"",
 "lidar survey;data physicalization", "architecture;tech;glow;motion graphics"),
("data-physicalization", "Data Physicalization", "md-data-physicalization",
 "Numbers built as real objects on a studio table: every value is a stack of plates to scale, landing one by one, with a counter and labels pointing at each pile.",
 "Use when a number is hard to imagine and needs to feel solid, like money, time or quantities.",
 "\"data physicalization on a walnut table, brass and glass plates stack to show each number to scale, counter ticks up\"",
 "data viz explainer;white model projection", "tech;elegant;texture;motion graphics"),
("exploded-teardown", "Exploded Teardown", "md-exploded-teardown",
 "An object comes apart along one line as the camera circles it, part by part, then closes back up with real measurements drawn on.",
 "Use for product explainers, how-it-is-made videos and anything about the parts inside.",
 "\"exploded view of a can on a dark bench, layers lift apart along one axis as the camera orbits, dimension lines appear\"",
 "exploded product animation;blueprint to reality", "tech;elegant;dark colors;motion graphics"),
("microscope-story", "Microscope Story", "md-microscope-story",
 "One continuous zoom down a microscope slide, from the glass to a single cell, with a scale bar, the lens in use and a reading that counts what it finds.",
 "Use for science, biology and health stories that describe what is seen. Keep it to description, never diagnosis.",
 "\"continuous zoom down a stained microscope slide to one cell, scale bar and magnification label, focus breathes\"",
 "lidar survey;archive light table", "tech;calm;abstract;motion graphics"),
("maths-morph-animation", "Maths Morph Animation", "md-3blue1brown",
 "On a black background, one shape smoothly turns into the next while the equation beside it changes. Each colour stands for one idea, and the picture stays still while you read.",
 "Use for maths, science and how-it-works ideas that build step by step.",
 "\"on black, a circle morphs into a curve while the equation updates, blue for one idea and yellow for energy, smooth transform\"",
 "math morph explainer;data viz explainer", "tech;abstract;dark colors;motion graphics"),
("flat-science-animation", "Flat Science Animation", "md-kurzgesagt-flat-science",
 "A flat, outline-free world that glows on a deep blue night. The camera dives through scale, from a planet to a window to a tiny detail, and labels pop in beside each thing.",
 "Use for science explainers about size and scale, from space down to cells.",
 "\"flat outline-free glowing illustration, camera dives from a night planet into a lit window, labels pop in\"",
 "flat science explainer;kinetic type animation", "playful;glow;night;vibrant colors;motion graphics"),
("storytime-stick-figure", "Storytime Stick Figure", "md-storytime-stick-figure",
 "A simple drawn character tells a story in quick cuts: poses snap into place and freeze, and the joke lands on a silent close-up of the character's face.",
 "Use for personal stories, funny explainers and voiceover-led videos with one host character.",
 "\"simple white cartoon character with thick lines, poses snap and freeze, silent reaction close-up for the punchline\"",
 "storytime animation;sci fi sitcom toon", "cute;playful;drawing;motion graphics"),
("presenter-host-animation", "Presenter Host Animation", "md-presenter-explainer",
 "A small cartoon host stands beside charts, numbers and key words, and the layout changes every sentence: a full-page number, a chart with the host beside it, a host standing on a bar.",
 "Use for business, history and money explainers where a friendly guide keeps viewers company.",
 "\"cartoon host beside a bar chart, a big number counts to the spoken word, the layout changes each sentence\"",
 "presenter explainer;data viz explainer", "playful;tech;words and letters;motion graphics"),
]

DOC_EXTRA = ['collage-explainer', 'paper-map-journey', 'data-chart-animation']   # existing entries that also suit documentary work


def media(key, slug):
    src = os.path.join(RENDERS, key + '.mp4')
    out_v = os.path.join('assets', 'styles', key + '.mp4')
    out_p = os.path.join('assets', 'styles', key + '.jpg')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', src, '-vf', 'crop=1080:1728:0:0,scale=480:768:flags=lanczos,setsar=1',
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '64k',
                    '-movflags', '+faststart', out_v], check=True)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', '6.8', '-i', src, '-frames:v', '1',
                    '-vf', 'crop=1080:1728:0:0,scale=360:576:flags=lanczos', '-q:v', '4', out_p], check=True)
    return 'styles/' + key + '.mp4'


def main():
    path = os.path.join('data', 'keywords.csv')
    raw = open(path, 'rb').read()
    eol = '\r\n' if b'\r\n' in raw else '\n'
    rows = list(csv.DictReader(io.StringIO(raw.decode('utf-8'))))
    fields = list(rows[0].keys())
    have = {r['slug'] for r in rows}
    added = []
    for slug, name, key, definition, when, prompt, pairs, tags in ROWS:
        if slug in have:
            continue
        rows.append({'slug': slug, 'name': name, 'category_id': 'motion-graphics-styles', 'definition': definition,
                     'when_to_use': when, 'prompt_example': prompt, 'pairs_well_with': pairs, 'works_in': WORKS,
                     'tier': 'free', 'images': media(key, slug), 'status': 'published', 'source': SOURCE,
                     'date_added': DATE, 'tags': tags})
        added.append((slug, tags))
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=fields, lineterminator=eol)
    w.writeheader(); w.writerows(rows)
    open(path, 'w', encoding='utf-8', newline='').write(buf.getvalue())

    # Tag groups: add each new slug to the groups it is tagged with, and create "documentary".
    tpath = os.path.join('generator', 'tags_map.py')
    t = open(tpath, encoding='utf-8', newline='').read()
    for slug, tags in added:
        for tag in tags.split(';'):
            if tag in ('motion graphics', 'documentary'):
                continue
            m = re.search(r'^"' + re.escape(tag) + r'": \[(.*?)\],', t, re.M)
            if m and f'"{slug}"' not in m.group(1):
                t = t[:m.end(1)] + f',"{slug}"' + t[m.end(1):]
    if '"documentary":' not in t:
        doc = [s for s, tg in added if 'documentary' in tg.split(';')] + DOC_EXTRA
        line = '"documentary": [' + ','.join(f'"{s}"' for s in doc) + '],'
        nl = '\r\n' if '\r\n' in t else '\n'
        t = t.replace('# video / cinematography beginner tags', line + nl + '# video / cinematography beginner tags', 1)
    open(tpath, 'w', encoding='utf-8', newline='').write(t)
    print(f'added {len(added)} rows')


if __name__ == '__main__':
    main()
