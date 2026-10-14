import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

// /work: full-width header strip, then 6 thumbnails 2 per row (Jose, Oct 14).
const { categories } = JSON.parse(readFileSync(new URL("../src/data/work.json", import.meta.url)))
assert.equal(categories[0].wide, true, "first category is the full-width header strip")
assert.equal(categories.filter((c) => c.wide).length, 1, "exactly one wide category")
assert.equal(categories.length - 1, 6, "6 thumbnails under the header strip")
const page = readFileSync(new URL("../src/pages/work.astro", import.meta.url), "utf8")
assert.match(page, /md:grid-cols-2/, "/work grid is 2 per row")
assert.doesNotMatch(page, /JustifiedGallery/, "/work does not use the photo gallery")
console.log("ok work grid: header + 6 thumbnails, 2 per row")
