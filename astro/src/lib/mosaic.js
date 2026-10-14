// Gapless mosaic packing (Jose: "Tetris-like"; portraits as prominent as landscapes), computed at
// build time for each breakpoint. The gallery is a CSS grid of square cells, `cols` wide. Each photo
// gets a w x h block of cells whose shape stays close to its own aspect ratio (little cropping) and
// whose area is about the same for portraits and landscapes, so no photo looks minor.
// Skyline packing: always fill the lowest, leftmost gap, choosing among the next few photos and
// their allowed shapes. Widths are even, so every gap can take a 2-wide portrait. Finally the
// bottom is levelled (tiles on the last row grow or shrink a little) so there is no ragged end.

/** @typedef {{ ar: number, feature?: boolean }} MosaicItem */
/** @typedef {{ x: number, y: number, w: number, h: number }} Cell  0-based column/row, spans */

const MAX_CROP = Math.log(1.3) // allowed shape vs. photo aspect mismatch, either way

/**
 * @param {MosaicItem[]} items in display order
 * @param {{ cols: number, area: number, lookahead?: number }} opts area = target cells per tile
 * @returns {{ cells: Cell[], rows: number }} cells[i] is the block of items[i]
 */
export function packMosaic(items, opts) {
	// The skyline is greedy, so try a few lookaheads and keep the layout that crops the least.
	let best = null
	for (let lookahead = 2; lookahead <= 8; lookahead++)
		for (const narrow of [0.25, 0.6, 1])
			for (const flush of [0.3, 0.6])
			for (const scale of [1, 0.75, 1.33]) {
				const r = packOnce(items, { ...opts, area: opts.area * scale, lookahead, narrow, flush })
				if (!isGapless(r.cells, opts.cols, r.rows)) continue
				const crops = r.cells.map((c, i) => cropOf(c, items[i].ar))
				const small = r.cells.filter((c, i) => c.w * c.h < opts.area * (items[i].feature ? 2.5 : 1) * 0.5).length
				r.score = 3 * Math.max(...crops) + crops.reduce((a, b) => a + b, 0) / crops.length + small + Math.abs(Math.log(scale)) * 0.3
				if (!best || r.score < best.score) best = r
			}
	if (!best) throw new Error("packMosaic: no gapless layout")
	return { cells: best.cells, rows: best.rows }
}

function packOnce(items, { cols, area, lookahead, narrow, flush }) {
	const sky = new Array(cols).fill(0)
	const cells = new Array(items.length)
	const left = items.map((_, i) => i)
	const target = (it) => area * (it.feature ? 2.5 : 1)
	const shapes = (it, maxW) => {
		const out = []
		for (let w = 2; w <= Math.min(maxW, cols); w += 2)
			for (let h = 2; h <= 2 * Math.ceil(Math.sqrt(target(it) * 2)); h++) {
				const crop = Math.abs(Math.log(w / h / it.ar))
				out.push({ w, h, crop, size: Math.abs(Math.log((w * h) / target(it))) })
			}
		return out
	}
	while (left.length) {
		const y = Math.min(...sky)
		const x = sky.indexOf(y)
		let g = 0
		while (x + g < cols && sky[x + g] === y) g++
		const leftH = x > 0 ? sky[x - 1] : Infinity
		const rightH = x + g < cols ? sky[x + g] : Infinity
		let best = null
		for (const strict of [true, false]) {
			for (let k = 0; k < Math.min(lookahead, left.length); k++) {
				const it = items[left[k]]
				for (const s of shapes(it, g)) {
					if (strict && (s.crop > MAX_CROP || s.w * s.h < target(it) * 0.6)) continue
					const rem = g - s.w
					const top = y + s.h
					let score = 2 * s.crop + s.size + k * 0.35
					if (rem > 0 && rem < 4) score += narrow // a slot only a portrait can take
					if (top === leftH || (rem === 0 && top === rightH)) score -= flush // flush with a neighbour
					if (Math.abs(top - leftH) === 1) score += 0.15 // one-cell steps fragment the skyline
					if (!best || score < best.score) best = { score, k, ...s }
				}
			}
			if (best) break
		}
		const i = left.splice(best.k, 1)[0]
		cells[i] = { x, y, w: best.w, h: best.h }
		for (let c = x; c < x + best.w; c++) sky[c] = y + best.h
	}
	return { cells, rows: levelBottom(items, cells, sky) }
}

// Make the last row flush: tiles that touch the skyline are stretched or shortened to one bottom
// line, picking the line that crops the least. Returns the total number of rows.
function levelBottom(items, cells, sky) {
	const tops = cells.map((c, i) => i).filter((i) => {
		const c = cells[i]
		for (let x = c.x; x < c.x + c.w; x++) if (sky[x] !== c.y + c.h) return false
		return true
	})
	let best = null
	for (let H = Math.min(...sky); H <= Math.max(...sky); H++) {
		let cost = 0
		for (const i of tops) {
			const c = cells[i]
			const h = H - c.y
			if (h < 2) { cost = Infinity; break }
			cost += Math.abs(Math.log(c.w / h / items[i].ar)) - Math.abs(Math.log(c.w / c.h / items[i].ar))
		}
		if (cost < Infinity && (!best || cost < best.cost)) best = { H, cost }
	}
	if (!best) return Math.max(...sky) // leaves a hole; packMosaic rejects this layout
	for (const i of tops) cells[i].h = best.H - cells[i].y
	return best.H
}

/** True when the blocks tile a cols x rows rectangle exactly (no holes, no overlaps). */
export function isGapless(cells, cols, rows) {
	const grid = new Uint8Array(cols * rows)
	for (const c of cells)
		for (let y = c.y; y < c.y + c.h; y++)
			for (let x = c.x; x < c.x + c.w; x++) {
				if (x >= cols || y >= rows || grid[y * cols + x]) return false
				grid[y * cols + x] = 1
			}
	return grid.every(Boolean)
}

/** Shape-vs-photo mismatch for one block: 0 = no crop, 0.2 = about 22% of one side cropped. */
export const cropOf = (cell, ar) => Math.abs(Math.log(cell.w / cell.h / ar))

/** The breakpoints the gallery uses; keep in sync with JustifiedGallery.astro's media queries. */
export const BREAKPOINTS = {
	lg: { min: 1024, cols: 16, area: 24 },
	md: { min: 641, cols: 12, area: 24 },
	sm: { min: 0, cols: 4, area: 12 },
}

/** Sorts by optional `order` (stable; items without one keep their place after ordered ones). */
export const byOrder = (list) =>
	list.map((it, i) => ({ it, i })).sort((a, b) => (a.it.order ?? Infinity) - (b.it.order ?? Infinity) || a.i - b.i).map((x) => x.it)
