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

## 2. Typography
- **Display: Fraunces** (Google Fonts, SIL OFL, free). Weights 400/600, optical size axis on. A warm, slightly quirky old-style serif with character that echoes the hand-made feel of Jose's work without competing with the script wordmark. Use it for page titles, section heads, card titles and case-study names. Letter-spacing: normal (never tracked).
- **Text: basic-sans** (already licensed through his Adobe Fonts kit). Use it for body, nav, captions and pills. Tracking `0.025em` (`tracking-wide`) for body; `0.1em` uppercase only for eyebrow labels.
- **Wordmark:** the existing blue script "Jose Castillo" PNG. It is the only script on the site; never set other text in script.

| Step | Size / line height | Use |
|---|---|---|
| Display XL | 60/64 (md), 48/52 (mobile) | Page title (h1) |
| Display L | 30/36 | Section head (h2), case-study name |
| Display M | 20–22/28 | Card titles, Work tile labels |
| Body L | 18/28 | Case-study body |
| Body | 16/24 | Default |
| Small | 14/20 | Pills, meta |
| Eyebrow | 12–14/16, uppercase, 0.1em, `stone` | "Problem / Built / Results" |

Measure: body copy max ~70ch (`max-w-3xl`).

## 3. Spacing (4 px base, Tailwind steps)
4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96. Between sections: 64–96. Grid gutters: 32 horizontal, 48 vertical. Card padding: 24/20. Never mix in odd values.

## 4. Grid
- Content max width 1152 px (`max-w-6xl`); reading width 768 px (`max-w-3xl`).
- **Work (Jose's rule): exactly main's layout.** A flush mosaic with no gutters: 2 columns ≥768 px, 1 column on mobile, 16:9 tiles. The last tile (Systems & Data) spans both columns at 32:9 on desktop, so the grid has no empty cell. Titles show only on hover (main's original overlay).
- Center-aligned page titles; left-aligned reading text.

## 5. Cards, tiles and states
- **Work tile (unchanged from main, at Jose's request):** the image fills the tile. On hover it goes grayscale, a 50% black overlay fades in and the category name slides in, centered and white (500 ms). Images must be pre-cropped to the tile ratio (16:9, or 32:9 for the wide tile; pad with the artwork's own background) because main uses `object-fill`.
- **Venture logos** (Systems & Data): bare, with transparent backgrounds and no tile or border, in one row centered on paper, optically balanced (see §9). Each is a link to its case study, with a visible focus ring.
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
- **Character over chrome** (after wattenberger.com, joshwcomeau.com): Jose's own illustrated faces and punk/chicha art are the only "decoration". Category thumbnails should be his illustrations (e.g. the skeleton-hand Systems & Data art), never stock.
- **One signature color with conviction** (after robinsloan.com): steel blue stays the only accent. The illustrations' acid lime and chicha brights live *inside images*, never in UI chrome.
- **Bare logos** (Jose's feedback): venture logos sit on paper with no box, transparent, and optically balanced (compact marks larger, wide wordmarks shorter; Roy `h-12/14`, SC `h-8/10`). Hover lifts them 2 px and brings opacity to 100%.

## 10. Don'ts (from the anti-vibe-coded checklist)
- Purple/pink gradients, glassmorphism, drop-shadow-heavy cards.
- Default Tailwind slate/indigo, or Skeleton theme tokens in the UI.
- Text over images on hover as the only label.
- Emoji, or more than one accent color.
