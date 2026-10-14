// Gapless mosaic packing (Jose: "Tetris-like"; portraits as prominent as landscapes), computed at
// build time for each breakpoint. The gallery is a CSS grid of square cells, `cols` wide. Each photo
// gets a w x h block of cells whose shape stays close to its own aspect ratio (little cropping) and
// whose area is about the same for portraits and landscapes, so no photo looks minor.
// Skyline packing: always fill the lowest, leftmost gap, choosing among the next few photos and
// their allowed shapes. Widths are even, so every gap can take a 2-wide portrait. Finally the
// bottom is levelled (tiles on the last row grow or shrink a little) so there is no ragged end.

/** @typedef {{ ar: number, feature?: boolean }} MosaicItem */
/** @typedef {{ x: number, y: number, w: number, h: number }} Cell  0-based column/row, spans */

export const MAX_CROP = Math.log(1.3) // allowed shape vs. photo aspect mismatch, either way
export const FEATURE_SCALE = 2.5 // a featured tile targets 2.5x the normal area
export const FEATURE_MIN = 2 // and is never under 2x the normal target area

/**
 * @param {MosaicItem[]} items in display order
 * @param {{ cols: number, area: number, lookahead?: number }} opts area = target cells per tile
 * @returns {{ cells: Cell[], rows: number }} cells[i] is the block of items[i]
 */
const cache = new Map()

/** Memoised: the search takes seconds, and SSR (Docker) would otherwise repeat it per request. */
export function packMosaic(items, opts) {
	const key = JSON.stringify([items.map((it) => [it.ar, !!it.feature]), opts])
	if (!cache.has(key)) cache.set(key, search(items, opts))
	const { cells, rows } = cache.get(key)
	return { cells: cells.map((c) => ({ ...c })), rows }
}

function search(items, opts) {
	// The skyline is greedy, so try a few lookaheads and keep the layout that crops the least.
	let best = null
	let found = 0
	for (let lookahead = 2; lookahead <= 8; lookahead++)
		for (const narrow of [0.25, 0.6, 1])
			for (const flush of [0.3, 0.6])
			for (const scale of [1, 0.75, 1.33]) {
				const r = packOnce(items, { ...opts, area: opts.area * scale, lookahead, narrow, flush })
				if (!isGapless(r.cells, opts.cols, r.rows)) continue
				const crops = r.cells.map((c, i) => cropOf(c, items[i].ar))
				if (Math.max(...crops) > MAX_CROP + 1e-9) continue // levelling may never over-crop
				if (!featuresOk(items, r.cells, { ...opts, area: opts.area * scale })) continue
				const small = r.cells.filter((c, i) => c.w * c.h < opts.area * (items[i].feature ? FEATURE_SCALE : 1) * 0.5).length
				r.score = 3 * Math.max(...crops) + crops.reduce((a, b) => a + b, 0) / crops.length + small + Math.abs(Math.log(scale)) * 0.3
				if (!best || r.score < best.score) best = r
				if (++found >= 16) return { cells: best.cells, rows: best.rows }
			}
	if (!best) throw new Error("packMosaic: no gapless layout")
	return { cells: best.cells, rows: best.rows }
}

function packOnce(items, { cols, area, lookahead, narrow, flush }) {
	const sky = new Array(cols).fill(0)
	const cells = new Array(items.length)
	const left = items.map((_, i) => i)
	const target = (it) => area * (it.feature ? FEATURE_SCALE : 1)
	// Featured tiles: at least 2x the target area, or a full-width square on narrow grids. Normal
	// tiles stay under 1.4x the target, so a featured tile is never the smaller one.
	const minArea = (it) => (it.feature ? Math.min(FEATURE_MIN * area, cols * cols * 1.25) : target(it) * 0.45)
	const maxArea = (it) => (it.feature ? Infinity : Math.min(target(it) * 1.4, cols * cols * 1.25))
	// Big tiles alternate sides: the 1st, 3rd, ... featured photo sits on the left edge, the 2nd,
	// 4th, ... on the right edge (Ive). Featured tiles wait (within the lookahead) for such a gap.
	const side = sideOf(items, cols)
	// On 8+ column grids every tile (and so every gap) is at least 4 cells wide, so no slot is left
	// that only a sliver could fill.
	const minW = cols >= 8 ? 4 : 2
	const shapes = (it, maxW) => {
		const out = []
		for (let w = minW; w <= Math.min(maxW, cols); w += 2)
			for (let h = 2; h <= 2 * Math.ceil(Math.sqrt(target(it) * 2)); h++) {
				const crop = Math.abs(Math.log(w / h / it.ar))
				out.push({ w, h, crop, size: Math.abs(Math.log((w * h) / target(it))) })
			}
		return out
	}
	const snaps = []
	while (left.length) {
		snaps.push({ sky: sky.slice(), cells: cells.slice(), left: left.slice() })
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
					if (strict && (s.crop > MAX_CROP || s.w * s.h < minArea(it) || s.w * s.h > maxArea(it))) continue
					const rem = g - s.w
					const sd = side[left[k]]
					if (sd === "left" && x !== 0) continue
					if (sd === "right" && x + g !== cols) continue
					if (rem > 0 && rem < minW) continue
					if (!strict && (s.w * s.h < minArea(it) || s.w * s.h > maxArea(it))) continue
					const top = y + s.h
					let score = 2 * s.crop + s.size + k * 0.35
					if (rem > 0 && rem < 4) score += narrow // a slot only a portrait can take
					if (top === leftH || (rem === 0 && top === rightH)) score -= flush // flush with a neighbour
					if (Math.abs(top - leftH) === 1) score += 0.15 // one-cell steps fragment the skyline
					if (!best || score < best.score) best = { score, k, ...s, at: sd === "right" ? x + rem : x }
				}
			}
			if (best) break
		}
		if (!best) return { cells, rows: 0 } // a featured tile found no slot; packMosaic rejects this
		const i = left.splice(best.k, 1)[0]
		cells[i] = { x: best.at, y, w: best.w, h: best.h }
		for (let c = best.at; c < best.at + best.w; c++) sky[c] = y + best.h
	}
	const rows = levelBottom(items, cells, sky, minArea, maxArea)
	if (rows) return { cells, rows }
	// The greedy end left a ragged bottom that can't be levelled within the crop limit: re-pack the
	// last few photos with a small exhaustive search that must end flush.
	for (const tail of [4, 8, 14]) {
		const snap = snaps[snaps.length - tail]
		if (!snap) break
		const out = endgame(items, snap, { cols, minArea, maxArea, target, side })
		if (out) return out
	}
	return { cells, rows: 0 }
}

function endgame(items, snap, { cols, minArea, maxArea, target, side }) {
	const sky = snap.sky.slice()
	const cells = snap.cells.map((c) => c && { ...c })
	const left = snap.left.slice()
	let budget = 60000
	const failed = new Set() // skyline shape + photos left that are known dead ends
	const dfs = () => {
		if (--budget < 0) return 0
		if (!left.length) return levelBottom(items, cells, sky, minArea, maxArea)
		const y = Math.min(...sky)
		const key = sky.map((h) => h - y).join(",") + "|" + left.join(",")
		if (failed.has(key)) return 0
		const x = sky.indexOf(y)
		let g = 0
		while (x + g < cols && sky[x + g] === y) g++
		for (let k = 0; k < (left.length <= 6 ? left.length : 3); k++) {
			const i = left[k]
			const it = items[i]
			const sd = side[i]
			if (sd === "left" && x !== 0) continue
			if (sd === "right" && x + g !== cols) continue
			const opts = []
			for (let w = cols >= 8 ? 4 : 2; w <= g; w += 2)
				for (let h = 2; h <= 2 * Math.ceil(Math.sqrt(target(it) * 2)); h++) {
					const crop = Math.abs(Math.log(w / h / it.ar))
					if (crop <= MAX_CROP && w * h >= minArea(it) && w * h <= maxArea(it)) opts.push({ w, h, crop, d: Math.abs(Math.log((w * h) / target(it))) })
				}
			opts.sort((a, b) => a.crop + a.d - b.crop - b.d)
			for (const o of opts.slice(0, 8)) {
				const at = sd === "right" ? x + g - o.w : x
				const rem = g - o.w
				if (rem > 0 && rem < (cols >= 8 ? 4 : 2)) continue
				cells[i] = { x: at, y, w: o.w, h: o.h }
				left.splice(k, 1)
				for (let c = at; c < at + o.w; c++) sky[c] = y + o.h
				const rows = dfs()
				if (rows) return rows
				for (let c = at; c < at + o.w; c++) sky[c] = y
				left.splice(k, 0, i)
				cells[i] = undefined
			}
		}
		if (budget > 0) failed.add(key)
		return 0
	}
	const rows = dfs()
	return rows ? { cells, rows } : null
}

// Make the last row flush: tiles that touch the skyline are stretched or shortened to one bottom
// line, picking the line that crops the least. Returns the total number of rows.
function levelBottom(items, cells, sky, minArea, maxArea) {
	const tops = cells.map((c, i) => i).filter((i) => {
		const c = cells[i]
		for (let x = c.x; x < c.x + c.w; x++) if (sky[x] !== c.y + c.h) return false
		return true
	})
	// Every column must end in a tile that can move its bottom edge, or levelling would leave a hole.
	if (tops.reduce((n, i) => n + cells[i].w, 0) !== sky.length) return 0
	let best = null
	for (let H = Math.min(...sky); H <= Math.max(...sky); H++) {
		let cost = 0
		for (const i of tops) {
			const c = cells[i]
			const h = H - c.y
			const crop = Math.abs(Math.log(c.w / h / items[i].ar))
			if (h < 2 || crop > MAX_CROP || c.w * h < minArea(items[i]) || c.w * h > maxArea(items[i])) { cost = Infinity; break }
			cost += Math.abs(Math.log(c.w / h / items[i].ar)) - Math.abs(Math.log(c.w / c.h / items[i].ar))
		}
		if (cost < Infinity && (!best || cost < best.cost)) best = { H, cost }
	}
	if (!best) return 0 // can't be levelled within the limits
	for (const i of tops) cells[i].h = best.H - cells[i].y
	return best.H
}

/** Which edge each featured item must touch: alternating left, right, left, ... */
export function sideOf(items, cols = 16) {
	let n = 0
	if (cols < 8) return items.map(() => null) // narrow grids: featured tiles span the full width
	return items.map((it) => (it.feature ? (n++ % 2 ? "right" : "left") : null))
}

/** Featured tiles are on their side and never smaller than any normal tile or 2x the target. */
export function featuresOk(items, cells, { cols, area }) {
	const side = sideOf(items, cols)
	const normal = Math.max(0, ...cells.filter((_, i) => !items[i].feature).map((c) => c.w * c.h))
	return cells.every((c, i) => {
		if (!items[i].feature) return true
		const a = c.w * c.h
		if (a < normal || a < Math.min(FEATURE_MIN * area, cols * cols * 1.25)) return false
		return c.w === cols || (side[i] === "left" ? c.x === 0 : c.x + c.w === cols)
	})
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
