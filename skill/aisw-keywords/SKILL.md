---
name: aisw-keywords
description: 'Reads the AI and See Why Keyword Library (aiswlibrary.netlify.app): tested, plain-language prompt keywords for AI image and video models, covering styles, lighting, textures, palettes, camera movements, shot sizes, lenses, transitions and film looks. Use when the person pastes picks copied from the library ("I picked N keywords from the AI and See Why Keyword Library"), shares a picks link (?pick=slug,slug), names AISW keywords, asks "what is this look or camera move called", or wants a prompt for Midjourney, Nano Banana Pro, GPT Image, Seedance, Veo, Kling or Runway built from library keywords.'
---

# AI and See Why keywords

The library is Cyan Brown's collection of tested prompt keywords. Each entry has a name, a plain definition, when to use it, an example prompt phrase, keywords it pairs well with, the tools it has been tested in (`works_in`), tags, and example images or clips.

## Where the data is

Fetch the feed once per task:

1. `https://aiswlibrary.netlify.app/api/v1/keywords.json`
2. If that fails, `https://raw.githubusercontent.com/Cyanjb/aiswlibrary/main/api/v1/keywords.json`

Each item has `slug`, `name`, `category`, `section`, `definition`, `when_to_use`, `prompt_example`, `pairs_well_with`, `works_in`, `tags`, `media` and `url`. Never invent an entry; if a keyword is not in the feed, say so and offer the closest matches.

## What the person may hand you

- **Pasted picks.** Text starting "I picked N keywords from the AI and See Why Keyword Library". The order is the order of importance. A "My note" line says where or how to use them; follow it.
- **A picks link.** `...?pick=golden-hour,push-in`. Look up each slug in the feed, in order.
- **Names in passing.** "Use push in and golden hour". Match names case-insensitively against `name` and `slug`.
- **No picks.** If they describe a look or move but do not know the word, search the feed by `name`, `tags` and `definition`, offer 3 to 5 candidates with one-line meanings and the entry links, and let them choose. Suggest browsing the library and pressing Copy for AI if they want to pick by eye.

## Building the prompt

1. Use exactly the keywords they picked. Do not add, drop or swap any on your own. If one does not suit the request or the target tool, say why and ask.
2. Keep their subject and story. The keywords describe style, light, camera, lens and edit, not what the picture is about.
3. Check `works_in` against the tool they name. If the keyword is untested there, say so plainly and use it anyway only if they agree.
4. Write the keyword the way the library writes it. Use the `prompt_example` for phrasing and placement, not as text to paste in whole.
5. Write for the target tool:
   - Image models (Midjourney, Nano Banana Pro, GPT Image): one subject line, then light, style and lens keywords. No camera movement words.
   - Video models (Seedance, Veo, Kling, Runway): subject and action first, then one camera movement, then shot size and lens, then light and grade. One camera move per shot unless they ask for more. Transitions belong between shots, so write each shot separately.
6. When two picks fight (two camera moves on one shot, high-key with low-key), point it out and offer the fix in one line.

## Real film examples

If they want to see a keyword in real films, or need reference frames to study, fetch `https://aiswlibrary.netlify.app/api/v1/references.json` (fallback: `https://raw.githubusercontent.com/Cyanjb/aiswlibrary/main/api/v1/references.json`). For a camera, lens or lighting keyword, give the StillsLab link by putting the keyword name into its `search_url`. For camera moves, point to Film Vibes (clips) or Screenmusings (whole scenes). Remind them to study the frames and describe the look with keywords, not upload the frames into a generator for work they publish.

## Reply format

Give the finished prompt or prompts first. Then list each keyword used with its entry link, and anything you changed or could not use.
