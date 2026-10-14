// Justified-rows (Flickr-style) partition, computed at build time.
// Every row, the last included, is later scaled by CSS flex to exactly fill the container,
// so the only choice here is where rows break. The split minimises each row's deviation from
// the target height at the reference width and heavily penalises rows outside [min, max].

/**
 * @param {number[]} aspects width / height of each image, in order
 * @param {{ width?: number, target?: number, min?: number, max?: number }} [opts]
 * @returns {number[][]} rows of item indexes, in order
 */
export function justifyRows(aspects, { width = 1216, target = 360, min = 260, max = 480 } = {}) {
	const n = aspects.length
	if (n === 0) return []
	const best = new Array(n + 1).fill(Infinity)
	const from = new Array(n + 1).fill(0)
	best[0] = 0
	for (let end = 1; end <= n; end++) {
		let sum = 0
		for (let start = end - 1; start >= 0; start--) {
			sum += aspects[start]
			const h = width / sum
			if (h < min * 0.5) break
			let cost = (h - target) ** 2
			if (h < min || h > max) cost += 1e7 + (h < min ? min - h : h - max) * 1e4
			if (best[start] + cost < best[end]) {
				best[end] = best[start] + cost
				from[end] = start
			}
		}
	}
	const rows = []
	for (let end = n; end > 0; end = from[end]) rows.unshift(Array.from({ length: end - from[end] }, (_, k) => from[end] + k))
	return rows
}

/** Row height in px at the reference width, for checks and tests. */
export const rowHeight = (aspects, row, width = 1216) => width / row.reduce((s, i) => s + aspects[i], 0)
