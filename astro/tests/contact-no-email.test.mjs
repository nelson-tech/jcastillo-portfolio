// Guard: the contact email must never appear as visible text on the built site.
// It may only live inside mailto: hrefs. Run after `npm run build`.
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import assert from "node:assert/strict"

const email = JSON.parse(readFileSync(new URL("../src/data/contact.json", import.meta.url))).email
const dist = new URL("../dist/", import.meta.url).pathname
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") ? [p] : [] })
const files = walk(dist)
assert.ok(files.length > 0, "no built HTML found; run npm run build first")
const variants = [email, email.replace("@", "&#64;"), email.replace("@", "&#x40;"), email.replace("@", "&commat;")].map((v) => v.toLowerCase())
let contactChecked = false
for (const f of files) {
	let html = readFileSync(f, "utf8")
	// Drop hrefs/attributes (mailto links are allowed), scripts, styles, comments, then tags.
	const text = html
		.replace(/<script[\s\S]*?<\/script>/gi, "")
		.replace(/<style[\s\S]*?<\/style>/gi, "")
		.replace(/<!--[\s\S]*?-->/g, "")
		.replace(/<[^>]*>/g, " ")
		.toLowerCase()
	for (const v of variants) assert.ok(!text.includes(v), `email address visible as text in ${f}`)
	if (/contact[\\/]index\.html$|contact\.html$/.test(f)) {
		contactChecked = true
		assert.match(html, /href="mailto:[^"]+"[^>]*>\s*Email me\s*</, "Email me mailto button missing on contact page")
	}
}
assert.ok(contactChecked, "contact page not found in dist")
console.log(`contact-no-email: OK (${files.length} pages checked)`)
