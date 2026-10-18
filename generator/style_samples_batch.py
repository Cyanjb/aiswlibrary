#!/usr/bin/env python3
"""Style samples batch (18 October 2026): code-animated style clips from the huashu-art-motion skill.

Attaches a clip to 10 existing keywords, adds 17 new art-style keywords and a new
Explainer Animation Styles category with 8 keywords. Clips live in assets/style-samples/
and build.py captions every clip from that folder as a style sample, not a prompt result.

Naming follows the library rules: no living people by name; deceased creators who are not
public domain are described by movement, not by name. Safe to re-run: existing slugs are skipped
and a clip is only attached once.
Run: cd generator && python3 style_samples_batch.py && python3 build.py
"""
import csv, os

DATA = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
SOURCE, DATE = "huashu-art-motion-2026-10-18", "2026-10-18"
IMAGE_TOOLS = "midjourney;nano-banana-pro;gpt-image-2;seedance"
VIDEO_TOOLS = "seedance;kling;veo;runway"

# Existing keywords that get a clip (slug -> clip file in assets/style-samples/)
ATTACH = ["vincent-van-gogh", "claude-monet", "gustav-klimt", "edvard-munch", "alphonse-mucha",
          "chinese-ink-wash-painting", "rubber-hose-animation", "illuminated-manuscript", "sfumato", "ben-day-dots"]

NEW_CATEGORY = ("explainer-animation", "Explainer Animation Styles", "video-cinematography", "free")

# slug, name, category, definition, when to use, prompt example, pairs, works in, clips, tags
NEW = [
("anime-watercolor-background", "Anime Watercolor Background", "anime-and-manga",
 "Soft hand-painted backgrounds from classic Japanese animated films: see-through watercolor washes, puffy summer clouds, grass that sways and sunlight dappling through leaves.",
 "Use for cozy countryside scenes, nostalgic summer days and any world that should feel gentle and lived-in.",
 "\"hillside cottage on a breezy summer afternoon, anime watercolor background, puffy clouds\"",
 "watercolor;golden hour;cel shading", IMAGE_TOOLS, "anime-watercolor-background.mp4", "japanese style;painting;cozy;nature;dreamy"),
("anime-light-rays", "Anime Light Rays", "anime-and-manga",
 "The glowing light of modern anime films: towering clouds, beams of sun slicing through windows, soft lens glow and tiny floating specks of light, all brighter and cleaner than real life.",
 "Use for hopeful, emotional moments, city skies after rain and anything that should feel like a movie poster for a feeling.",
 "\"empty classroom at sunset, anime light rays through the window, floating dust specks\"",
 "volumetric light;golden hour;cel shading", IMAGE_TOOLS, "anime-light-rays.mp4", "japanese style;golden light;glow;dreamy"),
("vaporwave", "Vaporwave", "art-styles-movements",
 "Internet nostalgia from the 2010s: pink and teal neon, a striped setting sun, a grid floor rolling to the horizon, VHS fuzz and Greek statues in a shopping-mall daydream.",
 "Use for retro-future music art, playful tech nostalgia and anything that should feel like 1987 seen through a dream.",
 "\"palm trees and a striped sunset over a neon grid, vaporwave, VHS glitch\"",
 "synthwave;neon glow;chiptune", IMAGE_TOOLS, "vaporwave.mp4", "art style;retro;neon light;pink"),
("analytic-cubism", "Analytic Cubism", "art-styles-movements",
 "Early 1900s painting that breaks people and objects into overlapping see-through shards, showing several sides at once, mostly in browns, greys and muted ochre.",
 "Use for thoughtful, puzzle-like portraits and still lifes, or to show one subject from many angles at once.",
 "\"cafe table with a guitar and a newspaper, analytic cubism, muted browns and greys\"",
 "oil painting;muted palette;fauvism", IMAGE_TOOLS, "analytic-cubism.mp4", "art style;painting;abstract;neutral colors;vintage"),
("henri-matisse", "Henri Matisse", "pd-painters",
 "(1869-1954) French painter who, late in life, made bright paper cut-outs: shapes snipped from hand-painted paper, seaweed forms, stars and dancers in pure, joyful color.",
 "Use for bold, cheerful compositions with simple shapes, posters and anything that should feel like a celebration.",
 "\"swimmers among seaweed shapes, in the style of Henri Matisse paper cut-outs\"",
 "fauvism;jewel tones;ben-day dots", IMAGE_TOOLS, "henri-matisse.mp4", "painting;vibrant colors;playful;pattern"),
("flat-vector-illustration", "Flat Vector Illustration", "illustration-and-animation",
 "Today's clean digital illustration: solid color shapes with no outlines, a soft grain texture, friendly characters in expressive poses and plenty of breathing room.",
 "Use for explainers, app and brand graphics, editorial spots and characters that should feel modern and approachable.",
 "\"woman watering plants on a sunny balcony, flat vector illustration, soft grain texture\"",
 "saas flat illustration;pastel palette;cartoon", IMAGE_TOOLS, "flat-vector-illustration.mp4", "drawing;playful;tech;vibrant colors"),
("bauhaus-graphic-design", "Bauhaus Graphic Design", "art-styles-movements",
 "The 1920s German design school look: circles, squares and triangles in red, yellow, blue and black, strong grids and clean sans-serif lettering.",
 "Use for posters, logos and layouts that should feel smart, modern and built with a ruler.",
 "\"exhibition poster of a cat made of circles and triangles, bauhaus graphic design, red yellow blue\"",
 "hard-edge painting;typographic art;bauhaus", IMAGE_TOOLS, "bauhaus-graphic-design.mp4", "art style;abstract;words and letters;vintage"),
("early-cgi", "Early CGI", "renders",
 "The look of 1990s computer graphics: shiny plastic surfaces, chrome balls, checkerboard floors with perfect reflections and a slightly toy-like, too-clean finish.",
 "Use for retro tech nostalgia, music-video throwbacks and playful 3D scenes that wink at the dawn of computer art.",
 "\"chrome sphere on a checkerboard floor, early cgi, 1993 render\"",
 "ray tracing;iridescent;chiptune", IMAGE_TOOLS, "early-cgi.mp4", "3d;retro;tech;weird and wonderful"),
("cave-painting", "Cave Painting", "world-culture-styles",
 "The oldest art we know: animals drawn in red ochre and charcoal on rough rock walls, stencilled handprints, and flickering firelight bringing it all to life.",
 "Use for ancient, primal moods, origin stories and any subject that should feel timeless and deeply human.",
 "\"herd of horses running across a rock wall, cave painting, red ochre and charcoal\"",
 "weathered;candlelight;charcoal sketch", IMAGE_TOOLS, "cave-painting.mp4", "world cultures;painting;texture;vintage"),
("egyptian-tomb-painting", "Egyptian Tomb Painting", "world-culture-styles",
 "Ancient Egyptian wall art: figures with side-on faces and front-facing eyes, flat bright colors, crisp outlines and rows of hieroglyphs in neat bands.",
 "Use for stylized storytelling scenes, mythic portraits and any subject that should feel ceremonial and ancient.",
 "\"cat sipping tea at a low table, egyptian tomb painting, hieroglyph border\"",
 "gold leaf;jewel tones;iconography", IMAGE_TOOLS, "egyptian-tomb-painting.mp4", "world cultures;painting;gold;vintage"),
("dunhuang-mural", "Dunhuang Mural", "world-culture-styles",
 "Buddhist cave paintings from the Silk Road in China: earthy red backgrounds, mineral greens and blues, flying celestial figures trailing long ribbons, and paint worn and flaking with age.",
 "Use for graceful, spiritual scenes, flowing fabric and anything that should feel ancient, sacred and softly faded.",
 "\"celestial dancer with flowing ribbons, dunhuang mural, faded mineral colors\"",
 "weathered;chinese ink wash painting;jewel tones", IMAGE_TOOLS, "dunhuang-mural.mp4", "world cultures;painting;elegant;vintage"),
("infinity-polka-dots", "Infinity Polka Dots", "patterns",
 "Dots everywhere: bold polka dots covering walls, floors, objects and people until everything melts into one endless pattern, often red and white or yellow and black.",
 "Use for immersive, playful installation scenes, statement fashion and dreamy rooms that feel like they go on forever.",
 "\"room covered in red polka dots with mirrored walls, infinity polka dots\"",
 "ben-day dots;surrealist pop;kinetic art", IMAGE_TOOLS, "infinity-polka-dots.mp4", "pattern;playful;vibrant colors;weird and wonderful"),
("surrealism", "Surrealism", "art-styles-movements",
 "Dream logic painted with realistic detail: melting clocks, impossible deserts, long shadows and ordinary objects behaving in ways that make no sense.",
 "Use for dreams, strange feelings and ideas you can't show literally.",
 "\"melting pocket watch draped over a tree branch in a desert at dusk, surrealism\"",
 "dreamscape;surrealist pop;oil painting", IMAGE_TOOLS, "surrealism.mp4", "art style;painting;weird and wonderful;dreamy"),
("american-realism", "American Realism", "art-styles-movements",
 "Quiet American scenes from the 1920s to the 1950s: diners, hotel rooms and city windows with hard-edged sunlight, flat shadows and people lost in their own thoughts.",
 "Use for lonely, reflective moments, urban stillness and stories told in a single look out of a window.",
 "\"woman by a window in morning sun, american realism, hard light across an empty room\"",
 "muted palette;golden hour;oil painting", IMAGE_TOOLS, "american-realism.mp4", "art style;painting;moody;urban;dramatic light"),
("silver-age-comics", "Silver Age Comics", "comic-books",
 "Comic books from the late 1950s to about 1970: cosmic heroes, blocky muscular action, crackling energy dots, big sound-effect lettering and four-color printing.",
 "Use for explosive action, sci-fi heroes and anything that needs a loud, joyful comic-book bang.",
 "\"hero bursting through a wall, silver age comics, crackling energy dots, KRAKOOM lettering\"",
 "golden age comics;ben-day dots;splash page", IMAGE_TOOLS, "silver-age-comics.mp4", "retro;vintage;vibrant colors;drawing"),
("pop-line-figures", "Pop Line Figures", "art-styles-movements",
 "Simple figures drawn with thick, even black lines and flat bright colors, surrounded by little radiating motion lines so they look like they're dancing or buzzing.",
 "Use for upbeat murals, music and party graphics, and any message about energy, love or togetherness.",
 "\"crowd of dancing figures with motion lines, pop line figures, bold black outlines, yellow background\"",
 "graffiti pop art;doodle;line drawing", IMAGE_TOOLS, "pop-line-figures.mp4", "art style;drawing;playful;vibrant colors;urban"),
("chinese-shadow-puppetry", "Chinese Shadow Puppetry", "world-culture-styles",
 "Translucent leather puppets lit from behind a paper screen: lace-like cut patterns, glowing color, jointed limbs moved on rods and the warm flicker of an oil lamp.",
 "Use for folk tales, theatrical storytelling and scenes that should feel handmade, warm and ancient.",
 "\"warrior and dragon behind a glowing paper screen, chinese shadow puppetry, translucent leather\"",
 "candlelight;woodblock print;jewel tones", IMAGE_TOOLS, "chinese-shadow-puppetry.mp4", "world cultures;craft;glow;vintage"),
# Explainer Animation Styles
("math-morph-explainer", "Math Morph Explainer", "explainer-animation",
 "The calm style of popular math videos: a dark background, one idea on screen at a time, and shapes that smoothly morph from one concept into the next, with each idea keeping its own color.",
 "Use when explaining how something works step by step, like an equation, an algorithm or how an AI model learns.",
 "\"dark background, a glowing curve smoothly morphs into a bar chart, math explainer animation\"",
 "kinetic typography;data chart animation", VIDEO_TOOLS, "math-morph-explainer.mp4", "video;tech;abstract;calm"),
("data-chart-animation", "Data Chart Animation", "explainer-animation",
 "The newsroom way to animate numbers: the axes draw in first, then the data grows into place, and only one thing gets highlighted. Bars start at zero, one color for the star, grey for the rest.",
 "Use for any number you want people to remember, like growth, price changes or before-and-after comparisons.",
 "\"bar chart grows up from zero, one bar highlighted in red, clean finance chart animation\"",
 "infographic;math morph explainer", VIDEO_TOOLS, "data-chart-animation.mp4", "video;tech;words and letters"),
("keynote-reveal", "Keynote Reveal", "explainer-animation",
 "Product-launch presentation style: one idea per screen, a soft glowing background, frosted-glass cards and big numbers that land the moment they're mentioned.",
 "Use for software tutorials, feature announcements and showing off a product or a result.",
 "\"giant number 8 fades up on a dark navy background, frosted glass card, product keynote style\"",
 "kinetic typography;data chart animation", VIDEO_TOOLS, "keynote-reveal.mp4;keynote-reveal-fullscreen.mp4", "video;tech;elegant;words and letters"),
("whiteboard-animation", "Whiteboard Animation", "explainer-animation",
 "A hand-drawn explainer where a pen sketches simple pictures, arrows and words on a board while the narrator talks, then pulls back to show the whole idea as one map.",
 "Use to explain processes, relationships and step-by-step ideas alongside a voiceover.",
 "\"marker draws a clock, an arrow and a lightbulb on a chalkboard, whiteboard animation\"",
 "doodle;line drawing;flowchart", VIDEO_TOOLS, "whiteboard-animation.mp4", "video;drawing;words and letters;calm"),
("collage-explainer", "Collage Explainer", "explainer-animation",
 "The investigative news-video look: real clippings, photos and charts laid on a desk, with red lines and highlighter drawn on as the camera moves from clue to clue.",
 "Use for arguments built on evidence, like news stories, history and how-it-really-happened breakdowns.",
 "\"newspaper clippings and a chart on a desk, red marker circles the key number, collage explainer\"",
 "whiteboard animation;data chart animation", VIDEO_TOOLS, "collage-explainer.mp4", "video;texture;words and letters"),
("flat-science-explainer", "Flat Science Explainer", "explainer-animation",
 "Bright flat shapes with no outlines in a softly glowing world, where the camera zooms between the tiny and the enormous, from a single cell to a whole planet.",
 "Use for science, space, biology and big-picture ideas where scale is the story.",
 "\"camera zooms from a drop of seawater into a glowing diatom, flat science explainer, no outlines\"",
 "flat vector illustration;math morph explainer", VIDEO_TOOLS, "flat-science-explainer.mp4", "video;tech;vibrant colors;tiny worlds"),
("kinetic-typography", "Kinetic Typography", "explainer-animation",
 "Words are the actors: the key word slams onto the screen on the beat, supporting words slide up from below, and there's only ever one thing to read at a time.",
 "Use for openers, quotes, lists and short-form video where the words carry the message.",
 "\"the word AGENTS slams onto a black screen in bold yellow, kinetic typography\"",
 "typographic art;keynote reveal", VIDEO_TOOLS, "kinetic-typography.mp4", "video;words and letters;fast and exciting"),
("storytime-animation", "Storytime Animation", "explainer-animation",
 "The story-channel cartoon: a simple character with thick outlines snaps between a few poses, cuts to a big reaction close-up and holds still for the punchline.",
 "Use for personal stories, funny mishaps and talking-to-camera content where the voice is the star.",
 "\"cartoon girl with big glasses shrugs at a computer full of code, storytime animation, thick outlines\"",
 "cartoon;flat vector illustration", VIDEO_TOOLS, "storytime-animation.mp4", "video;drawing;playful"),
("presenter-explainer", "Presenter Explainer", "explainer-animation",
 "A cartoon host walks the viewer through the story on a paper-and-sticker page: she points at cards, stands inside the chart, and cuts to a big reaction close-up when the number lands.",
 "Use for business, money and history explainers where a friendly guide keeps a voiceover personal and easy to follow.",
 "\"cartoon host in a yellow hoodie points at a bar chart on a cream dotted page, presenter explainer animation\"",
 "storytime animation;data chart animation;kinetic typography", VIDEO_TOOLS, "presenter-explainer.mp4", "video;drawing;playful;words and letters"),
]

def load(name):
    with open(os.path.join(DATA, name), newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        return r.fieldnames, list(r)

def save(name, fields, rows):
    with open(os.path.join(DATA, name), "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

cfields, cats = load("categories.csv")
if not any(c["category_id"] == NEW_CATEGORY[0] for c in cats):
    cats.append(dict(zip(cfields, NEW_CATEGORY)))
    save("categories.csv", cfields, cats)

kfields, kws = load("keywords.csv")
by_slug = {k["slug"]: k for k in kws}
cat_ids = {c["category_id"] for c in cats}
attached = added = 0
for slug in ATTACH:
    k = by_slug[slug]
    clip = f"style-samples/{slug}.mp4"
    media = [m.strip() for m in k["images"].split(";") if m.strip()]
    if clip not in media:
        k["images"] = ";".join(media + [clip])
        attached += 1
for slug, name, cat, definition, when, example, pairs, works, clips, tags in NEW:
    assert cat in cat_ids, cat
    if slug in by_slug:
        continue
    images = ";".join(f"style-samples/{c}" for c in clips.split(";") if c)
    kws.append({"slug": slug, "name": name, "category_id": cat, "definition": definition, "when_to_use": when,
                "prompt_example": example, "pairs_well_with": pairs, "works_in": works, "tier": "free",
                "images": images, "status": "published", "source": SOURCE, "date_added": DATE, "tags": tags})
    added += 1
save("keywords.csv", kfields, kws)
print(f"clips attached to {attached} existing keywords, {added} keywords added")
