// Shared by the Astro and Svelte <Picture> components; safe to ship to the client
// (it doesn't import the manifest — islands receive their entry as a prop).
export interface Variant {
	w: number
	src: string
}

export interface ImageInfo {
	width: number
	height: number
	/** Dominant colour shown until the image loads; null for transparent images. */
	color: string | null
	avif?: Variant[]
	webp?: Variant[]
	/** Photography lightbox AVIF (long edge <= 2000, q72). */
	lightbox?: { src: string; width: number; height: number }
}

export const srcset = (variants: Variant[]) => variants.map((v) => `${v.src} ${v.w}w`).join(", ")

/** Layout-agnostic fallback: the image never renders wider than its natural width or the viewport. */
export const naturalSizes = (info: ImageInfo) => `(min-width: ${info.width}px) ${info.width}px, 100vw`

/** Sizes that make the browser pick the largest variant (≤1600w) at 1 image px per CSS px. */
export const largestSizes = (info: ImageInfo) =>
	`${Math.max(...(info.webp ?? []).map((v) => v.w), 0) || info.width}px`
