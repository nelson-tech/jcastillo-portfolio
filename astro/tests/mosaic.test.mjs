import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { BREAKPOINTS, byOrder, cropOf, isGapless, packMosaic } from "../src/lib/mosaic.js"

const load = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url)))
const galleries = {
	photography: load("../src/data/work/photography.json").images,
	graphicDesign: load("../src/data/work/design.json").graphicDesign.images,
}
for (const [name, images] of Object.entries(galleries)) {
	const items = byOrder(images).map((im) => {
		assert.ok(im.width && im.height, `${name}: ${im.src} needs width and height`)
		return { ar: im.width / im.height, feature: im.feature }
	})
	for (const [k, bp] of Object.entries(BREAKPOINTS)) {
		const { cells, rows } = packMosaic(items, bp)
		assert.equal(cells.length, items.length, `${name}@${k}: every image placed`)
		assert.ok(isGapless(cells, bp.cols, rows), `${name}@${k}: no holes, flush last row`)
		const crops = cells.map((c, i) => cropOf(c, items[i].ar))
		assert.ok(Math.max(...crops) <= Math.log(1.5), `${name}@${k}: a tile crops more than a third`)
		const areas = cells.map((c, i) => (c.w * c.h) / (items[i].feature ? 2.5 : 1))
		assert.ok(Math.min(...areas) >= bp.area * 0.33, `${name}@${k}: a tile is minor`)
		const p = cells.filter((_, i) => items[i].ar < 0.9).map((c) => c.w * c.h)
		const l = cells.filter((_, i) => items[i].ar > 1.1).map((c) => c.w * c.h)
		const avg = (a) => a.reduce((s, x) => s + x, 0) / a.length
		if (p.length && l.length) assert.ok(avg(p) >= avg(l) * 0.75, `${name}@${k}: portraits look minor`)
		console.log(`ok ${name}@${k}: ${rows} rows, max crop ${Math.max(...crops).toFixed(2)}`)
	}
}
// Data-driven ordering and features
assert.deepEqual(byOrder([{ a: 1 }, { a: 2, order: 1 }, { a: 3 }]).map((x) => x.a), [2, 1, 3])
const feat = packMosaic([{ ar: 1.5, feature: true }, ...Array(9).fill({ ar: 1.5 })], BREAKPOINTS.lg)
assert.ok(feat.cells[0].w * feat.cells[0].h > feat.cells[1].w * feat.cells[1].h, "feature gets a bigger tile")
console.log("ok order + feature")
