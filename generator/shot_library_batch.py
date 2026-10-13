"""Shot Library batch (13 Oct 2026): example clips for the video-cinematography entries, plus new entries.

Media come from the Camera and Effects Library previews (robot clips and stills, made in Google Flow and
in code; pink cup moves; realistic one-takes). They are copied into assets/clips/. Run once from generator/:
    python shot_library_batch.py <path to motion-tests/camera-library/share>
then rebuild with build.py.
"""
import csv, os, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CSV = os.path.join(ROOT, "data", "keywords.csv")
CLIPS = os.path.join(ROOT, "assets", "clips")
SRC = sys.argv[1] if len(sys.argv) > 1 else None
WORKS = "seedance;kling;veo;runway"
DATE = "2026-10-13"

# existing slug -> media keys (first is the hero)
EXISTING = {
    "dolly-in": ["push"], "dolly-out": ["x-m-pullback"], "tracking-shot": ["x-m-tracking"],
    "crane-shot": ["x-m-crane"], "handheld": ["x-handheld"], "steadicam": ["steadicam"],
    "whip-pan": ["x-m-whip"], "dolly-zoom": ["x-m-dollyzoom"], "orbit": ["orbit"], "push-in": ["push-past"],
    "tilt-up": ["x-tilt"], "aerial-shot": ["x-m-descend"], "static-hold": ["x-static"],
    "long-take": ["x-m-onetake-concert", "x-m-onetake-beach", "x-m-onetake-rooftops"],
    "extreme-wide-shot": ["ext-wide"], "wide-shot": ["wide"], "medium-shot": ["medium"], "close-up": ["closeup"],
    "extreme-close-up": ["ecu"], "over-the-shoulder": ["ots"], "low-angle": ["low"], "high-angle": ["high"],
    "dutch-angle": ["dutch"], "pov-shot": ["pov"], "establishing-shot": ["x-m-crane"],
    "anamorphic": ["x-anamorphic"], "shallow-depth-of-field": ["shallow"], "deep-focus": ["deep"],
    "rack-focus": ["rack"], "wide-angle-lens": ["lens16"], "telephoto-compression": ["lens85"],
    "rim-lighting": ["x-backlight"], "low-key-lighting": ["x-lowkey"], "hard-light": ["spot"],
    "match-cut": ["x-graphic-match", "d-match"], "smash-cut": ["x-smash-cut"], "cross-dissolve": ["x-dissolve"],
    "j-cut": ["x-jcut"], "l-cut": ["x-jcut"], "speed-ramp": ["x-whip-ramp"], "golden-hour-grade": ["x-golden"],
}

# new rows: slug, name, category, definition, when_to_use, example, pairs, media, tag
NEW = [
    ("pan", "Pan", "camera-movements", "The camera stays in one spot and turns left or right, like turning your head.", "Use to follow someone across a room, or to reveal what is beside them.", "slow pan right across the busy market", "tilt-up;tracking-shot", ["pan"], "camera movement"),
    ("truck-shot", "Truck Shot", "camera-movements", "The whole camera slides sideways past the subject, so near and far things move at different speeds.", "Use for smooth product glides and reveals with a real sense of depth.", "the camera trucks left past the coffee cup on the desk", "tracking-shot;dolly-in", ["truck"], "camera movement"),
    ("arc-shot", "Arc Shot", "camera-movements", "The camera curves part of the way around the subject.", "Use to bring a still moment to life, or to show a new side of someone.", "slow arc around her as she reads the letter", "orbit;push-in", ["arc"], "camera movement"),
    ("pedestal", "Pedestal", "camera-movements", "The whole camera rises or lowers straight up and down, without tilting.", "Use to rise above a scene and show its layout, or to drop down to eye level.", "the camera pedestals up from the table into a top-down view", "crane-shot;tilt-up", ["ped-up"], "camera movement"),
    ("zoom", "Zoom", "camera-movements", "The camera stays still and only the lens zooms, so the background flattens as it closes in.", "Use for a watchful, documentary feel, or a 1970s film look.", "slow zoom in from the wide street to her face in the crowd", "snap-zoom;dolly-zoom", ["x-m-zoom"], "camera movement"),
    ("snap-zoom", "Snap Zoom", "camera-movements", "A split-second zoom from wide to tight.", "Use for comedy beats, reactions and punchlines.", "snap zoom onto his face as he realises", "zoom;whip-pan", ["x-m-snapzoom"], "camera movement"),
    ("spiral-shot", "Spiral Shot", "camera-movements", "The camera circles the subject while rising, like a corkscrew.", "Use for grand reveals, dream moments and big emotional lifts.", "the camera spirals up around the dancer and rises above the stage", "orbit;crane-shot", ["x-m-spiral"], "camera movement"),
    ("glide", "Glide", "camera-movements", "A slow, weightless drift past the subject, as if carried on a breeze.", "Use for dreamy, hypnotic, music-video moods.", "slow weightless glide past her through the flower field", "steadicam;tracking-shot", ["x-m-glide"], "camera movement"),
    ("follow-shot", "Follow Shot", "camera-movements", "The camera follows behind someone as they move.", "Use to take the viewer on the journey with your character.", "follow shot behind her as she walks into the crowd", "tracking-shot;steadicam", ["x-follow"], "camera movement"),
    ("fpv-drone", "FPV Drone", "camera-movements", "Fast first-person drone flight: the camera is the drone, diving and banking through space.", "Use for adrenaline, and for paths no person could ever fly.", "FPV drone dives off the cliff and skims the waves", "aerial-shot;tracking-shot", ["x-fpv"], "camera movement"),
    ("camera-roll", "Camera Roll", "camera-movements", "The camera rotates around its own lens, tipping the whole picture over.", "Use for dizziness, dream logic, or a world turning upside down.", "the camera rolls a full turn as it pushes toward her", "dutch-angle;whip-pan", ["roll"], "camera movement"),
    ("medium-close-up", "Medium Close-Up", "shot-sizes-angles", "From the chest up: closer than a medium shot, looser than a close-up.", "Use for conversations that should feel personal without getting in someone's face.", "medium close-up of him leaning in to whisper", "close-up;over-the-shoulder", ["x-mcu"], "framing"),
    ("insert-shot", "Insert Shot", "shot-sizes-angles", "A quick cut to one small detail: a text message, a ring, a button.", "Use to hand the viewer one important piece of information fast.", "insert shot of her phone lighting up with a message", "extreme-close-up;close-up", ["x-insert"], "framing"),
    ("full-shot", "Full Shot", "shot-sizes-angles", "The whole person from head to feet, nothing cut off.", "Use to show an outfit, a pose, a dance move or a full action.", "full shot of the dancer mid-leap", "medium-shot;wide-shot", ["full"], "framing"),
    ("eye-level", "Eye Level", "shot-sizes-angles", "The camera sits at the subject's eye height, looking straight at them.", "Use when you want the angle to feel neutral and honest.", "eye-level shot of her across the kitchen table", "low-angle;high-angle", ["x-eyelevel"], "framing"),
    ("ground-level", "Ground Level", "shot-sizes-angles", "The lens sits right on the floor, looking along it.", "Use for feet, things rolling past, or a creature's-eye view.", "ground-level shot as the skateboard rolls toward us", "low-angle;tracking-shot", ["x-ground"], "framing"),
    ("profile-shot", "Profile Shot", "shot-sizes-angles", "The subject seen exactly side-on.", "Use for silhouettes, faces deep in thought, or two people facing off.", "profile shot of him staring out of the train window", "close-up;rim-lighting", ["profile"], "framing"),
    ("birds-eye-view", "Bird's-Eye View", "shot-sizes-angles", "Looking straight down from above.", "Use for patterns, maps, choreography, or a calm god's-eye distance.", "bird's-eye view of the dancers forming a circle", "aerial-shot;high-angle", ["overhead"], "framing"),
    ("macro-lens", "Macro Lens", "lenses-optics", "An extreme close lens for tiny details and textures.", "Use to make something small feel huge.", "macro shot of a raindrop sliding down a leaf", "shallow-depth-of-field;extreme-close-up", ["x-macro"], "lens effect"),
    ("atmospheric-haze", "Atmospheric Haze", "cinematic-lighting", "Light hangs in the air and the distance fades into soft mist.", "Use for depth, mood and visible beams of light.", "atmospheric haze, morning light cutting through the trees", "rim-lighting;low-key-lighting", ["haze"], "lighting"),
    ("foreground-wipe", "Foreground Wipe", "transitions-editing", "Something passes right in front of the lens and, as it clears, the scene behind has changed.", "Use for a smooth one-take feel. One of the easiest transitions to get right in AI video.", "a blurred figure walks across the lens; as they clear frame we are in a new street", "match-cut;whip-pan", ["x-fg-wipe", "d-wipe"], "editing"),
    ("object-portal", "Object Portal", "transitions-editing", "A ring, frame or lens held up to the camera shows the next scene inside it, and the camera pushes through.", "Use to move into a new place or world in one playful move.", "a ring held up to the lens frames the beach; the camera pushes through it", "foreground-wipe;match-cut", ["x-ring-portal", "x-glasses-portal"], "editing"),
    ("hand-over-lens", "Hand Over Lens", "transitions-editing", "Hands cover the lens, then open on a new scene.", "Use for playful resets and reveals.", "she covers the lens with both hands; as they part she is somewhere new", "foreground-wipe;smash-cut", ["x-hand-over-lens"], "editing"),
    ("push-through", "Push-Through", "transitions-editing", "The camera pushes into something dark and round, like a peephole or a hole, and comes out in the next scene.", "Use for curiosity, spy moods and down-the-rabbit-hole jumps.", "the camera pushes into the keyhole and comes out in the next room", "object-portal;match-cut", ["x-peephole", "x-hole"], "editing"),
    ("colour-match-cut", "Colour Match Cut", "transitions-editing", "The frame fills with one colour, then cuts to something else of the same colour.", "Use to link two unrelated scenes in a satisfying way.", "the frame fills with red paint, then cuts to a red umbrella in the rain", "match-cut;graphic-match", ["x-colour-match"], "editing"),
    ("match-on-action", "Match on Action", "transitions-editing", "An action starts in one shot and finishes in the next.", "Use for energy, comedy and cause and effect.", "she throws the ball at the lens and it lands in the next scene", "match-cut;smash-cut", ["x-match-action"], "editing"),
    ("light-match-cut", "Light Match Cut", "transitions-editing", "A light flares to white, and the next shot opens on a light in the same spot.", "Use for time jumps and dreamy montages.", "the lantern flares to white; the next shot is a street lamp in the same place", "match-cut;flash-to-white", ["x-light-match"], "editing"),
    ("morph-transition", "Morph", "transitions-editing", "One scene smoothly reshapes into another.", "Use for signature dream moments. Far easier in AI video than in traditional effects.", "the paper crane slowly reshapes into a white bird", "match-cut;cross-dissolve", ["x-morph"], "editing"),
    ("freeze-frame", "Freeze Frame", "transitions-editing", "The picture freezes on a peak moment, then the next shot starts from that same pose.", "Use as a pattern break, a punchline or a 'that's me' moment.", "she leaps; the frame freezes at the top of the jump", "smash-cut;speed-ramp", ["x-freeze-motion"], "editing"),
    ("flash-to-white", "Flash to White", "transitions-editing", "The frame blows out to white from a real light, then fades into the next shot.", "Use for memories, revelations and impact.", "a camera flash fires and the white fades into the next scene", "cross-dissolve;light-match-cut", ["x-flash-white"], "editing"),
    ("fade-to-black", "Fade to Black", "transitions-editing", "The picture fades away to black.", "Use for endings, chapter breaks and deliberate pauses. Not between every scene.", "final shot fades to black", "cross-dissolve;l-cut", ["x-fadeblack"], "editing"),
    ("jump-cut", "Jump Cut", "transitions-editing", "The camera stays put while time jumps between cuts, so things pop in, out or around.", "Use for routines, comedy and fast montages.", "jump cuts on a locked frame as more friends appear beside her", "smash-cut;match-cut", ["x-jump-add", "x-overhead-time"], "editing"),
    ("background-swap", "Background Swap", "transitions-editing", "The subject stays exactly in place while the world behind them changes.", "Use to show time passing or a life changing around one person.", "he stays still while the background cuts from beach to city to snow", "jump-cut;match-cut", ["x-bg-swap"], "editing"),
    ("glitch-transition", "Glitch Transition", "transitions-editing", "A burst of digital distortion covers the cut.", "Use for tech, gaming and AI topics. Best added in the edit rather than prompted.", "add in the edit: a two-frame RGB glitch between the shots", "smash-cut;speed-ramp", ["x-glitch"], "editing"),
    ("light-leak", "Light Leak", "transitions-editing", "A warm wash of light sweeps across and covers the cut.", "Use for weddings, lifestyle and dreamy beauty edits. Best added in the edit.", "add in the edit: a warm light leak sweeping across the cut", "cross-dissolve;golden-hour-grade", ["x-lightleak"], "editing"),
    ("speed-smear", "Speed Smear", "transitions-editing", "Something fast whips past the lens and its blur becomes the cut.", "Use for racing, sport and anything fast.", "a car zooms past the lens and as the blur clears we are at the finish line", "whip-pan;speed-ramp", ["x-speed-smear"], "editing"),
]


def media_file(key):
    """Clip if one exists, otherwise the still."""
    if SRC and os.path.exists(os.path.join(SRC, "v", key + ".mp4")):
        return key + ".mp4", os.path.join(SRC, "v", key + ".mp4")
    return key + ".jpg", os.path.join(SRC, "p", key + ".jpg") if SRC else None


def assign(keys):
    out = []
    for k in keys:
        name, path = media_file(k)
        if SRC:
            os.makedirs(CLIPS, exist_ok=True)
            shutil.copy(path, os.path.join(CLIPS, name))
        out.append("clips/" + name)
    return ";".join(out)


EOL = "\r\n" if b"\r\n" in open(CSV, "rb").read(4096) else "\n"  # keep the file's own line endings
rows = list(csv.DictReader(open(CSV, encoding="utf-8", newline="")))
fields = list(rows[0].keys())
slugs = {r["slug"] for r in rows}
for r in rows:
    if r["slug"] in EXISTING:
        r["images"] = assign(EXISTING[r["slug"]])
added = 0
for slug, name, cat, d, w, ex, pairs, keys, tag in NEW:
    if slug in slugs:
        raise SystemExit(f"slug already exists: {slug}")
    pairs = ";".join(p for p in pairs.split(";") if p in slugs or p in {n[0] for n in NEW})
    rows.append({
        "slug": slug, "name": name, "category_id": cat, "definition": d, "when_to_use": w,
        "prompt_example": f'"{ex}"', "pairs_well_with": pairs, "works_in": WORKS, "tier": "free",
        "images": assign(keys), "status": "published", "source": "shot-library", "date_added": DATE,
        "tags": f"{tag};video",
    })
    added += 1
with open(CSV, "w", encoding="utf-8", newline="") as f:
    wr = csv.DictWriter(f, fieldnames=fields, lineterminator=EOL)
    wr.writeheader()
    wr.writerows(rows)
print(f"clips on {len(EXISTING)} existing entries, {added} new entries")
