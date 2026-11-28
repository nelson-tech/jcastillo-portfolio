// Guard: the four oversized work/photography originals must not be referenced from
// client-facing build output (HTML, CSS, client JS). The SSR server bundle may still
// contain the source JSON paths used to look up the manifest. Run after `npm run build`.
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import assert from "node:assert/strict"

const heavy = [
	"/media/a0559d58-5fa2-408b-a1a4-9b6bb0af0625.gif",
	"/media/1ee5edcc-e2cc-4336-8d07-05e304091378.gif",
	"/media/566da578-5e9e-48f9-87b7-0959a9f122db.jpg",
	"/media/afa46505-8a05-4cc7-a38c-dfdc9c1a522e.JPG",
]
const dist = new URL("../dist/", import.meta.url).pathname
const walk = (d) =>
	readdirSync(d).flatMap((f) => {
		const p = join(d, f)
		return statSync(p).isDirectory() ? walk(p) : /\.(html|css|js|mjs|json)$/.test(p) ? [p] : []
	})
const files = walk(dist).filter((p) => !relative(dist, p).startsWith("server" + (p.includes("/") ? "/" : "")))
assert.ok(files.length > 0, "no client-facing built files found; run npm run build first")
for (const f of files) {
	const text = readFileSync(f, "utf8")
	for (const src of heavy) {
		assert.ok(!text.includes(src), `heavy original ${src} still referenced in ${f}`)
	}
}
console.log(`no-heavy-originals: OK (${files.length} client-facing files checked)`)
