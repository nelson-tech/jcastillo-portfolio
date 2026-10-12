# Implementation spec: portfolio redesign (for Nate)
Repo `nelson-tech/jcastillo-portfolio`, app in `astro/`. Reference implementation: branch **`design/portfolio-style-guide`** (pushed and based on `origin/main`; **no PR opened**). Screenshots: `/workspace/portfolio-design/before/` vs `after/`. Merging auto-deploys to Vercel, so open the PR yourself after Jose approves. **The About text is not touched.**

## 0. Tokens and fonts
- `astro/tailwind.config.cjs`: add the colors `ink #16191C`, `paper #F5F3EE`, `stone #6B7176`, `rule #DEDAD2`, `accent-deep #2E6584` (keep `highlight #5592b5`). Add `fontFamily.display = Fraunces`, `fontFamily.sans = basic-sans`.
- `astro/src/layouts/Layout.astro`:
  - Add the Google Fonts `<link>` for Fraunces (opsz 9..144, wght 400 and 600).
  - On `<body>`: `font-[basic-sans] tracking-wider` → `font-sans tracking-wide text-ink bg-paper`.
  - Wrapper: `bg-gradient-to-tr from-slate-300 to-slate-50` → `bg-paper`.
- `astro/src/components/PageHeader.astro`: becomes an `h1` in `font-display text-ink text-5xl md:text-6xl font-semibold`.

## c) Remove the pink highlight
- Source: `Layout.astro` global `:root` defines `--accent: 124,58,237` (violet) and `--accent-gradient` (violet → `#da62c4` pink → white). `Card.astro` applies it on hover.
- Fix: set `--accent: 85, 146, 181` and delete `--accent-gradient`. Rewrite the `Card.astro` styles: white, 1 px `#DEDAD2` border, 4 px radius, no shadow, hover border `#16191C`, arrow `translateX(4px)`. See the branch.
- Also change `hover:text-green-500` → `hover:text-ink` in `pages/work/systems-data.astro` (#links) and **`pages/work/music.astro:56`** (same pattern).

## a) Systems & Data: clickable logos instead of screenshots and cards
*(Superseded: the earlier logo-tile version, with ink/white boxes and borders. See Revision 3 for the current design.)*
- Logos live in `public/media/logos/`: `roy-ink.svg` and `sensational-concrete-wordmark.png` (both transparent).
- `src/data/work/systems-data.json`: each case study has `logo: { src, alt, size, slug }`. `src/lib/content.ts` validates it.
- `src/pages/work/systems-data.astro`:
  - One centered row of bare logos. Each is an `<a href="#slug">` jumping to its case-study section, like the Sweet Tiger logo in Music.
  - Each case study is a `<section id=slug>` with a Fraunces title, "Visit site →", the summary, uppercase Problem/Built/Results labels and pills.
  - The screenshots and the `Card` import are removed.
- The old `public/media/systems-data-{roy,sensational-concrete}{,-mobile}.jpg` are unreferenced and can be deleted (not done).
- Viru Andean House: deferred (Jose's decision).

## b) The Work thumbnail that doesn't match
- The Systems & Data tile used to be a collage of UI screenshots, unlike every other tile.
- *(Superseded: the Unsplash fibre photo and then the Pexels fibre photo were both dropped.)*
- Current: **Jose's SoundCloud team logo (cropped to 3:2, RDAR text removed)** at `public/media/work/systems-data-thumb.webp` (1080×720, 83 KB). Credit in `/CREDITS.md`: "Artwork: Jose's SoundCloud team logo (cropped), used with his permission."
- The tile is a normal 3:2 tile (no `wide`), so the 2-column rhythm holds. `systems-data-tile*.jpg` are deleted.

## Work grid (minimal)
- `src/pages/work.astro`: the container becomes `mx-auto max-w-6xl grid md:grid-cols-2 gap-x-8 gap-y-12 px-4 md:px-8` (it was flush and gapless).
- `src/components/ProjectCard.astro`: the whole tile is one `<a>`. Image `aspect-[3/2]` (wide: `md:aspect-[3/1]`), `object-cover` (was `object-fill`, which distorted the images), hover `scale-[1.03]`. A label row *below* (Fraunces + arrow + `rule` hairline). **Removed:** the grayscale hover, the black 50% overlay and the hover-only title.

## Not done (follow-ups for consistency)
- `text-highlight text-2xl/4xl font-bold` headings on design/audio/video/public-diplomacy should move to `font-display text-ink`.
- The `contact.astro` gradient hover cards should get the same Card treatment.
- Add `prefers-reduced-motion` guards.

## Acceptance (original, superseded by the current list below)
- [ ] No `#da62c4`, `124, 58, 237`, `accent-gradient` or `green-500` remain under `astro/src`.
- [ ] The Systems & Data top shows 2 logo tiles. Clicking one scrolls to its case study, and "Visit site" opens the external site.
- [ ] The Work grid has visible labels, 32/48 px gaps and no distortion. The Systems & Data tile is the fibre photo.
- [ ] The About page is byte-identical to `main`.
- [ ] Lighthouse a11y ≥ 95. Link text uses `accent-deep`, not `highlight`.

## Revision 3 (current; matches branch `design/portfolio-style-guide`)
- **Bare, transparent logos:** no tiles, borders or backgrounds. Logos sit directly on `paper` in one centered row (`gap-x-20`), `w-auto`, `opacity-90`, and hover goes to `opacity-100` with a 2 px lift.
  - Visible focus outline in `highlight`.
  - Optical balance through per-logo heights in JSON: Roy `h-12 md:h-14` (compact mark), Sensational Concrete `h-8 md:h-10` (wide wordmark).
  - Roy: `roy-ink.svg` is royanalyst.com's `/icon.svg` recolored lime → ink #16191C, with explicit `width/height` added so `w-auto` sizes it. No dark version exists on royanalyst.com.
  - Sensational Concrete: `sensational-concrete-wordmark.png` is the live header lockup (the `/logo.png` truck plus "Sensational Concrete" in Fraunces 600), rebuilt as a transparent PNG.
- **Thumbnail:** v4 team-logo artwork (see b).
- **Numbered Work index:** `ProjectCard.astro` takes an `index` prop (passed from `work.astro`) and shows `01`–`07` in `text-stone text-xs tabular-nums tracking-widest` before the Fraunces label.
- **Tailwind content fix:** `tailwind.config.cjs` content glob now includes `json`, so classes stored in data files (the logo heights) get generated. Without it, the logos render at their natural size.
- **Unchanged and approved:** paper/ink/steel-blue palette, Fraunces + basic-sans, About page untouched. Other pages restyled later.

## Acceptance (current)
- [ ] No `#da62c4`, `124, 58, 237`, `accent-gradient`, `green-500` (systems-data), pexels or `systems-data-tile` references under `astro/src`.
- [ ] `/work/systems-data`: two bare logos, roughly equal visual weight; each scrolls to its case study; "Visit site" opens the external site.
- [ ] `/work`: 7 numbered, labelled 3:2 tiles in 2 columns; Systems & Data shows the team-logo art.
- [ ] About is byte-identical to `main`.
