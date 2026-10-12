# Jose Castillo Portfolio: Style Guide
**Direction:** classy, impactful, minimal. The *work* (illustration, chicha posters, photography) is loud and personal, so the *frame* stays quiet: warm paper, ink, one blue. Keep: the blue script wordmark, the character illustrations, the steel-blue accent (#5592B5). Drop: the slate gradient, the purple/pink hover gradient, Tailwind/Skeleton defaults.

## 1. Palette
| Token (Tailwind) | Hex | Role |
|---|---|---|
| `paper` | `#F5F3EE` | Page background (warm off-white; replaces the slate-300→50 gradient) |
| `white` | `#FFFFFF` | Raised surfaces: logo tiles, cards |
| `ink` | `#16191C` | Headings and body text; dark tiles (e.g. Roy) |
| `stone` | `#6B7176` | Secondary text, captions, eyebrow labels, pills |
| `rule` | `#DEDAD2` | Hairlines, card borders, dividers |
| `highlight` | `#5592B5` | **Brand accent**: wordmark, progress bar, focus ring. Decorative/large text only (3.3:1 on paper) |
| `accent-deep` | `#2E6584` | Accent for small text and links (6.2:1 on paper, passes AA) |

Rules: one accent only. No gradients, no pink/purple, no green hover. Color comes from the work itself (the images), not from the UI.

## 2. Typography: one type system on every page
**The rule:** one type system applies across every page: home, Work, each /work/* page, About, Contact. No page gets its own display face. Headings are set in **basic-sans**, the same as everything else.

- **Family: basic-sans** (Adobe Fonts kit, already licensed), used for headings, body, nav, labels and pills. This is the site's original, dominant font. The live audit on 2026-10-11 found it on every route.
- **Wordmark:** the blue script "Jose Castillo" image is the only script. Logo artwork (Roy, Sensational Concrete, Viru) keeps its own lettering because it's an image, not site type.
- **Correction:** Revisions 1–6 recommended Fraunces as a display serif. That is withdrawn. Fraunces shipped to production in PR #8 on the shared page title (h1 of every /work/* page) and on the Systems & Data headings. Branch `design/restore-social-icons` removes it everywhere: no Google Fonts link, no `font-display` family, no Fraunces in `Card.astro`.

| Role | Element | Style (Tailwind) | Computed |
|---|---|---|---|
| Page title | `PageHeader` h2 | `text-highlight text-4xl font-bold text-center` | basic-sans 700 / 36px |
| Section head | h2 | `text-highlight text-4xl font-bold` | basic-sans 700 / 36px |
| Item title (case study, video, design) | h3 | `text-highlight text-2xl font-bold` | basic-sans 700 / 24px |
| Sub-label (Problem / Built / Results) | h4 | `text-highlight text-xl font-bold` | basic-sans 700 / 20px |
| Body (work pages) | p | `text-lg` | basic-sans 400 / 18px |
| Body (About / Contact) | p | `text-xl tracking-wider` | basic-sans 400 / 20px |
| Nav, footer, default | body | base | basic-sans 400 / 16px |

Letter-spacing comes from the body's `tracking-wide` (0.4px at 16px); About and Contact use `tracking-wider`. Don't add per-page tracking or uppercase eyebrow labels.

## 3. Spacing (4 px base, Tailwind steps)
4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96. Between sections: 64–96. Grid gutters: 32 horizontal, 48 vertical. Card padding: 24/20. Never mix in odd values.

## 4. Grid
- Content max width 1152 px (`max-w-6xl`); reading width 768 px (`max-w-3xl`).
- **Work (Jose's rule): exactly main's layout.** A flush mosaic with no gutters: 2 columns ≥768 px, 1 column on mobile, 16:9 tiles. The last tile (Data & Engineering) spans both columns at 32:9 on desktop, so the grid has no empty cell. Titles show only on hover (main's original overlay).
- Center-aligned page titles; left-aligned reading text.

## 5. Cards, tiles and states
- **Work tile (unchanged from main, at Jose's request):** the image fills the tile. On hover it goes grayscale, a 50% black overlay fades in and the category name slides in, centered and white (500 ms). Images must be pre-cropped to the tile ratio (16:9, or 32:9 for the wide tile; pad with the artwork's own background) because main uses `object-fill`.
- **Venture logos** (Data & Engineering): bare, with transparent backgrounds and no tile or border, in one row centered on paper, optically balanced (see §9). Each is a link to its case study, with a visible focus ring.
- **Link card** (`Card.astro`): white, 1 px `rule` border, 4 px radius, no shadow.
  - Hover/focus: border becomes `ink` and the arrow nudges. **The purple→pink `--accent-gradient` is removed.**
- **Pills:** white, 1 px `rule` border, `stone` text, 14 px.
- **Focus:** a 2 px `highlight` outline with 2 px offset on every interactive element.

## 6. Image treatment
- Full color, no filters or hover grayscale. Crop with `object-cover`, never `object-fill` (it distorts).
- Category thumbnails are *photographic or illustrated textures*, not UI screenshots. Product UIs appear inside case studies only, if at all.
- Prefer Jose's own or commissioned illustration. Stock only as a last resort, under a verified free license, credited in `CREDITS.md`.
- Export JPG at q≈80, 2048 px max; GIFs under 3 MB (convert to MP4/WebM loops when possible).

## 7. Logo usage
- The site wordmark appears top-left, 64–80 px tall, original blue. Never recolor, outline or stretch it.
- Venture logos come from the venture's own site, keep their original colors, and sit on their native background color. Keep clear space of at least 25% of the logo height.

## 8. Motion
- Durations: 150–200 ms for color/borders and arrows, 300–500 ms for image scale. Easing: `ease-out` (cubic-bezier(.22,1,.36,1) for image scale).
- Animate only `transform`, `opacity` and `border-color`. No animated shadows or gradients.
- Bigger and farther moves are slower. Respect `prefers-reduced-motion` (disable the scale).
- The GIF/character animations carry personality; UI motion stays quiet.

## 9. Remixed from the inspiration pass (see inspiration/README.md)
- **Character over chrome** (after wattenberger.com, joshwcomeau.com): Jose's own illustrated faces and punk/chicha art are the only "decoration". Category thumbnails should be his illustrations (e.g. the skeleton-hand Data & Engineering art), never stock.
- **One signature color with conviction** (after robinsloan.com): steel blue stays the only accent. The illustrations' acid lime and chicha brights live *inside images*, never in UI chrome.
- **Bare logos** (Jose's feedback): venture logos sit on paper with no box, transparent, and optically balanced (compact marks larger, wide wordmarks shorter). Mobile/desktop heights: Roy `h-20/28`, Sensational Concrete `h-12/16`, Viru Andean House `h-24/32`. One centered row on desktop; stacked on mobile. Hover lifts them 2 px and brings opacity to 100%.

## Consistency (Jose's rule)
- Shared chrome is **identical on every page**: the nav (wordmark + Work/About/Contact), the footer and the social icon row (GitHub, Twitter, Instagram, Spotify, SoundCloud, Vimeo, LinkedIn). Same position, order, size, color and hover.
- It is rendered only from shared components in `src/layouts/Layout.astro` (`<Footer />` in `src/components/Footer.astro`, driven by `site.json` → `social`). Pages never add their own footer or social row.
- New pages must use `Layout`. Any change to the chrome happens once, in the shared component.

## 10. Don'ts (from the anti-vibe-coded checklist)
- Purple/pink gradients, glassmorphism, drop-shadow-heavy cards.
- Default Tailwind slate/indigo, or Skeleton theme tokens in the UI.
- Text over images on hover as the only label.
- Emoji, or more than one accent color.
