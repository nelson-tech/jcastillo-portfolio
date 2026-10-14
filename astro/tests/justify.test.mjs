import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { justifyRows, rowHeight } from "../src/lib/justify.js"

const load = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url)))
const galleries = {
	photography: load("../src/data/work/photography.json").images,
	graphicDesign: load("../src/data/work/design.json").graphicDesign.images,
	workIndex: load("../src/data/work.json").categories.filter((c) => !c.wide).map((c) => c.image),
}
for (const [name, images] of Object.entries(galleries)) {
	const aspects = images.map((im) => {
		assert.ok(im.width && im.height, `${name}: ${im.src} needs width and height`)
		return im.width / im.height
	})
	for (const width of [1216, 1248]) {
		const rows = justifyRows(aspects, { width })
		assert.deepEqual(rows.flat(), aspects.map((_, i) => i), `${name}: every image once, in order`)
		for (const row of rows) {
			const h = rowHeight(aspects, row, width)
			assert.ok(h >= 260 && h <= 480, `${name}@${width}: row ${row} is ${h.toFixed(0)}px`)
		}
	}
	console.log(`ok ${name}: ${justifyRows(aspects).map((r) => Math.round(rowHeight(aspects, r))).join(", ")}px rows`)
}
