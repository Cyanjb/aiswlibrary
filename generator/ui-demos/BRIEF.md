# UI and Web Motion demos: builder brief

Each demo is a short looping animation that shows one UI component or web effect in action, drawn in code on a 960x540 canvas and rendered to a 640x360 MP4. They appear on the AI and See Why Keyword Library as the moving example for that keyword, in a grid of thumbnails about 280px wide. Viewers are beginners who do not know what the thing is called. The demo has to make it obvious.

## Files
- `kit.js`: shared palette (`C`), easing, `browser()`, `phone()`, `cursor()`, `finger()`, `path()`, `picture()`, `button()`, `lines()`, `text()`, `fillRR()`. Read it first. Do not edit it; put any helper you need inside your own demos file.
- `demos/example-toast.js`: the reference demo. Match its structure and quality.
- Your file: `demos/<group>.js`, registering `DEMOS['<slug>'] = { cycle, posterAt?, draw(ctx, W, H, t) }`. The key is the keyword slug.
- Check by eye: `node preview.mjs <group>.js /tmp/claude-0/-home-user/182cd1e3-b0c2-5fd5-a1a7-0ea32fd124b9/scratchpad/preview-<group>.png`, then Read the PNG. Six frames per demo across the cycle. Fix and re-check until every row reads clearly.

## Rules
1. **Pure function of t.** No `Date`, no `performance.now`, no `Math.random` (use `KIT.rnd(i)`), no state kept between calls.
2. **Seamless loop.** The frame at t = cycle must equal the frame at t = 0: everything returns to its start pose (cursor included) by the end. Start and end on a calm resting state.
3. **One idea per demo.** Show the component appearing or being used once, clearly: cursor or finger moves in, acts, the UI responds, a short hold, then everything resets gently.
4. **Big and legible.** Thumbnails are small. Main UI elements large, headline text 26px or more, labels 16px or more. No tiny detail that carries the meaning. Fill the frame; do not leave the action in a corner.
5. **Look.** AISW colours from `C` only (dark background, pink `C.pink` as the main accent, teal `C.teal` second, gold sparingly). Inter font via `text()`. Use `browser()` for web things and `phone()` for mobile patterns (bottom sheet, swipe, pull to refresh). Soft shadows, rounded corners, calm easing (`ease.inOut`, `ease.out`, `ease.outBack` for small pops).
6. **Timing.** cycle 4 to 6 seconds. Motions 0.25 to 0.6 s. Hold the key state at least 1 s so it registers. Set `posterAt` to the moment that best explains the demo on its own as a still.
7. **No brands, no real logos, no real product names,** and no text that names the component (the page title does that). Placeholder words are fine ("Your library", "Save picks", "Settings").
8. No em dashes or en dashes anywhere, code comments included.

## Entries
Also write the keyword entries for your demos as a JSON array (path given in your task), one object per demo with string fields: `slug` (= demo key), `name`, `category_id`, `definition` (1 to 2 short plain sentences: what it is and what it looks like), `when_to_use` (1 to 2 sentences, with an honest limit when useful), `prompt_example` (short request a person would give a coding AI, wrapped in straight double quotes so the value itself starts and ends with `"`), `pairs_well_with` (2 to 3 lowercase names separated by `;` with no spaces, from existing keywords or this section), `works_in` (`claude-code;lovable;v0;bolt`), `tags` (2 to 5 separated by `;`, always including `web design` and `ui motion`, plus at least one of: playful, calm, elegant, tech, futuristic, retro, edgy, cozy, minimal, vibrant colors).
Voice: beginner, warm, no jargon, explain any design word in a few plain words. Existing keywords are listed in `/tmp/claude-0/-home-user/182cd1e3-b0c2-5fd5-a1a7-0ea32fd124b9/scratchpad/existing.txt` (`slug | name | category`); do not reuse a slug or name.
