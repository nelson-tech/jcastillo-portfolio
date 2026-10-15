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
		// Featured tiles read as featured: >= 2.5x the median normal tile on 8+ column grids.
		if (bp.cols >= 8) {
			const sizes = cells.filter((_, i) => !items[i].feature).map((c) => c.w * c.h).sort((x, y) => x - y)
			const median = sizes[sizes.length >> 1]
			cells.forEach((c, i) => items[i].feature && assert.ok(c.w * c.h >= 2.5 * median, `${tag}: feature ${sorted[i].src} is ${(c.w * c.h / median).toFixed(1)}x the median tile`))
		}
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
// Pairs Ive keeps apart (B&W Merlion/kangaroo, night pair, character heads) never touch.
const touch = (a, b) => {
	const h = a.x < b.x + b.w && b.x < a.x + a.w
	const v = a.y < b.y + b.h && b.y < a.y + a.h
	return (h && (a.y + a.h === b.y || b.y + b.h === a.y)) || (v && (a.x + a.w === b.x || b.x + b.w === a.x))
}
for (const [name, pairs] of [["photography", [["8c45031a", "ab684da1"], ["42918015", "b9941f03"]]], ["graphicDesign", [["f7d01920", "f0709fa1"], ["7cd2863f", "f7d01920"], ["7cd2863f", "f0709fa1"]]]]) {
	const sorted = byOrder(galleries[name])
	const items = sorted.map((im) => ({ ar: im.width / im.height, feature: im.feature }))
	const at = (id) => sorted.findIndex((im) => im.src.includes(id))
	for (const [k, bp] of Object.entries(BREAKPOINTS)) {
		const { cells } = packMosaic(items, bp)
		for (const [a, b] of pairs) assert.ok(!touch(cells[at(a)], cells[at(b)]), `${name}@${k}: ${a} touches ${b}`)
	}
}
// Phones follow the data order exactly: reading order (top to bottom, left to right) is 1..N.
for (const [name, images] of Object.entries(galleries)) {
	const items = byOrder(images).map((im) => ({ ar: im.width / im.height, feature: im.feature }))
	const { cells } = packMosaic(items, BREAKPOINTS.sm)
	const visual = cells.map((c, i) => ({ c, i })).sort((a, b) => a.c.y - b.c.y || a.c.x - b.c.x).map((x) => x.i)
	assert.deepEqual(visual, items.map((_, i) => i), `${name}@sm: visual order equals data order`)
	assert.equal(byOrder(images)[0].order, 1)
}
// Website screenshots are anchored to the top.
for (const im of galleries.graphicDesign) if (im.width / im.height > 1.8 && im.src.endsWith(".png")) assert.equal(im.anchor, "top", `${im.src} anchor top`)
assert.deepEqual(byOrder([{ a: 1 }, { a: 2, order: 1 }, { a: 3 }]).map((x) => x.a), [2, 1, 3])
assert.deepEqual(sideOf([{ feature: true }, {}, { feature: true }, { feature: true }]), ["left", null, "right", "left"])
console.log("ok order, sides, anchors")
