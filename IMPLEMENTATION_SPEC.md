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
- Assets (added on the branch):
  - `public/media/logos/roy.svg`: from https://royanalyst.com/icon.svg (lime "Roy" wordmark, #C8FF00). Place it on an `ink` tile.
  - `public/media/logos/sensational-concrete.png`: from https://sensationalconcrete.com/logo.png (cyan mixer truck, 1024×572, transparent). Place it on a white tile. **Flag: it is an illustration with no wordmark;** ask the owner for a wordmark lockup if one exists.
- `src/data/work/systems-data.json`: add `logo: { src, alt, bg: "ink" | "white", slug }` per case study.
- `src/lib/content.ts`: extend the case-study schema with that `logo` object.
- `src/pages/work/systems-data.astro`:
  - Replace the screenshot `<a><picture>` and `<Card>` per study with a 2-column row of logo tiles (`aspect-[3/2]`, border `rule`, hover border `ink`). Each tile links to `#<slug>`, its case-study section on the same page, the way the Sweet Tiger logo is a single clickable image in `music.astro`.
  - Below, each case study is a `<section id=slug>` with a Fraunces title, a "Visit site →" external link (`accent-deep`), the summary in `stone`, uppercase eyebrow labels (Problem/Built/Results) and pills.
  - Remove the `Card` import.
- Optional clean-up: `public/media/systems-data-{roy,sensational-concrete}{,-mobile}.jpg` are no longer referenced, so they can be deleted (not done on the branch).
- **Other ventures:** only Roy and Sensational Concrete are in the data. Jose also has the private repo `viru-andean-house` (live at https://viru-andean-house.vercel.app); it has no logo asset in this repo. **Jose decides** whether to add it.

## b) The Work thumbnail that doesn't match
- **Systems & Data** (`/media/systems-data-tile.jpg` + `-wide.jpg`) is a collage of website UI screenshots; every other tile is a photo or illustration.
- Replacement: **"Blue light passing over fibre optic cable"** by **Compare Fibre** (@comparefibre) on Unsplash, https://unsplash.com/photos/blue-and-white-light-in-dark-room-INNsF0Zz_kQ , free under the Unsplash License (attribution appreciated, not required). Source file: https://images.unsplash.com/photo-1606814540563-5c02d62fd409 . I confirmed the photographer from the image's Unsplash listing and a third-party credit filename ("compare-fibre-INNsF0Zz_kQ-unsplash"), not from the photo page itself, which blocked bots.
- On the branch: cropped into `systems-data-tile.jpg` (1024×576) and `systems-data-tile-wide.jpg` (2048×576), with the credit in the alt text in `src/data/work.json`. Add the credit to `CREDITS.md`.

## Work grid (minimal)
- `src/pages/work.astro`: the container becomes `mx-auto max-w-6xl grid md:grid-cols-2 gap-x-8 gap-y-12 px-4 md:px-8` (it was flush and gapless).
- `src/components/ProjectCard.astro`: the whole tile is one `<a>`. Image `aspect-[3/2]` (wide: `md:aspect-[3/1]`), `object-cover` (was `object-fill`, which distorted the images), hover `scale-[1.03]`. A label row *below* (Fraunces + arrow + `rule` hairline). **Removed:** the grayscale hover, the black 50% overlay and the hover-only title.

## Not done (follow-ups for consistency)
- `text-highlight text-2xl/4xl font-bold` headings on design/audio/video/public-diplomacy should move to `font-display text-ink`.
- The `contact.astro` gradient hover cards should get the same Card treatment.
- Add `prefers-reduced-motion` guards.

## Acceptance
- [ ] No `#da62c4`, `124, 58, 237`, `accent-gradient` or `green-500` remain under `astro/src`.
- [ ] The Systems & Data top shows 2 logo tiles. Clicking one scrolls to its case study, and "Visit site" opens the external site.
- [ ] The Work grid has visible labels, 32/48 px gaps and no distortion. The Systems & Data tile is the fibre photo.
- [ ] The About page is byte-identical to `main`.
- [ ] Lighthouse a11y ≥ 95. Link text uses `accent-deep`, not `highlight`.

## Revision 2 (after Chip's review), same branch
- **Logo tiles:** both are now white with a `rule` border, `p-5 md:p-10`, 3:2, and the logo box is `h-16 w-full max-w-[80%] object-contain`.
  - Roy: `public/media/logos/roy-ink.svg`. This is Roy's official icon.svg recolored from lime #C8FF00 to ink #16191C; royanalyst.com serves no dark version.
  - Sensational Concrete: `public/media/logos/sensational-concrete-wordmark.png`. The live header is the truck mark (`/logo.png`) plus the name as live text in Fraunces 600, so there is no single logo file; I rebuilt the same lockup as a transparent PNG.
  - The old `roy.svg` and `sensational-concrete.png` are removed.
- **Work:** the Systems & Data tile is no longer `wide`, so it's a normal 3:2 tile in the 2-column rhythm. `systems-data-tile-wide.jpg` is removed.
- **Photo swapped to a verified one:** "Close-Up Shot of a Green and Blue Fiber Optic" by **Atlantic Ambience**, https://www.pexels.com/photo/close-up-shot-of-a-green-and-blue-fiber-optic-12932191/ . The page itself shows License: Free (Pexels License); I verified it in a real browser on Oct 11, 2026. The Unsplash photo was dropped because both its napi endpoint and page are bot-blocked and its official API needs a key. Credits are in `/CREDITS.md`.
