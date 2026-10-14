import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { BREAKPOINTS, MAX_CROP, byOrder, cropOf, isGapless, packMosaic, sideOf } from "../src/lib/mosaic.js"

const load = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url)))
const galleries = {
	photography: load("../src/data/work/photography.json").images,
	graphicDesign: load("../src/data/work/design.json").graphicDesign.images,
}
const avg = (a) => a.reduce((s, x) => s + x, 0) / a.length
for (const [name, images] of Object.entries(galleries)) {
	// Ive's picks: every image has a unique order 1..N; featured photos exist.
	const orders = images.map((im) => im.order).sort((a, b) => a - b)
	assert.deepEqual(orders, images.map((_, i) => i + 1), `${name}: order is 1..N`)
	const sorted = byOrder(images)
	const items = sorted.map((im) => {
		assert.ok(im.width && im.height, `${name}: ${im.src} needs width and height`)
		return { ar: im.width / im.height, feature: im.feature }
	})
	assert.ok(items.some((it) => it.feature), `${name}: has featured tiles`)
	for (const [k, bp] of Object.entries(BREAKPOINTS)) {
		const { cells, rows } = packMosaic(items, bp)
		const tag = `${name}@${k}`
		assert.equal(cells.length, items.length, `${tag}: every image placed`)
		assert.ok(isGapless(cells, bp.cols, rows), `${tag}: no holes, flush last row`)
		// Rule 2: nothing (the levelled last row included) is cropped past the limit.
		cells.forEach((c, i) => assert.ok(cropOf(c, items[i].ar) <= MAX_CROP + 1e-9, `${tag}: ${sorted[i].src} over-cropped`))
		// Rule 3: a featured tile is never smaller than any normal tile.
		const normal = Math.max(...cells.filter((_, i) => !items[i].feature).map((c) => c.w * c.h))
		cells.forEach((c, i) => items[i].feature && assert.ok(c.w * c.h >= normal, `${tag}: feature ${sorted[i].src} smaller than a normal tile`))
		// Rule 1: big tiles alternate left / right edges (narrow grids: full width).
		const side = sideOf(items, bp.cols)
		cells.forEach((c, i) => {
			if (!items[i].feature) return
			if (side[i] === "left") assert.equal(c.x, 0, `${tag}: feature ${i} on the left`)
			else if (side[i] === "right") assert.equal(c.x + c.w, bp.cols, `${tag}: feature ${i} on the right`)
			else assert.equal(c.w, bp.cols, `${tag}: feature ${i} full width`)
		})
		const p = cells.filter((_, i) => items[i].ar < 0.9 && !items[i].feature).map((c) => c.w * c.h)
		const l = cells.filter((_, i) => items[i].ar > 1.1 && !items[i].feature).map((c) => c.w * c.h)
		if (p.length && l.length && bp.cols >= 8) assert.ok(avg(p) >= avg(l) * 0.75, `${tag}: portraits look minor`)
		console.log(`ok ${tag}: ${rows} rows, max crop ${Math.max(...cells.map((c, i) => cropOf(c, items[i].ar))).toFixed(2)}`)
	}
}
// Website screenshots are anchored to the top.
for (const im of galleries.graphicDesign) if (im.width / im.height > 1.8 && im.src.endsWith(".png")) assert.equal(im.anchor, "top", `${im.src} anchor top`)
assert.deepEqual(byOrder([{ a: 1 }, { a: 2, order: 1 }, { a: 3 }]).map((x) => x.a), [2, 1, 3])
assert.deepEqual(sideOf([{ feature: true }, {}, { feature: true }, { feature: true }]), ["left", null, "right", "left"])
console.log("ok order, sides, anchors")
