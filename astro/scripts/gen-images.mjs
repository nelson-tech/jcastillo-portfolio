// Generates responsive AVIF/WebP variants of every raster in public/media (plus the root
// logo/portrait PNGs) into public/media-opt/, and writes src/data/image-manifest.json:
//   "/media/x.jpg" -> { width, height, color, avif: [{ w, src }], webp: [{ w, src }] }
// Incremental: output names derive from the file contents + encoder settings, so existing
// outputs are reused and only new/changed images are encoded. Runs as `prebuild`.
import { createHash } from "node:crypto"
import { existsSync } from "node:fs"
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const publicDir = path.join(root, "public")
const outDir = path.join(publicDir, "media-opt")
const manifestPath = path.join(root, "src/data/image-manifest.json")
// Vercel restores node_modules between builds, so encoded variants survive in this cache and
// a deploy only encodes images that are new or changed.
const cacheDir = path.join(root, "node_modules/.cache/gen-images")

const WIDTHS = [480, 640, 800, 1200, 1600]
const AVIF = { quality: 62, effort: 4 }
const WEBP = { quality: 80, effort: 4 }
// Bump to force every variant to be re-encoded.
const SETTINGS = JSON.stringify({ v: 1, WIDTHS, AVIF, WEBP })

const RASTER = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"])
// Recorded for width/height only: SVGs are already small, and GIFs are animated.
const SIZE_ONLY = new Set([".svg", ".gif"])
// Photography lightbox: one larger, higher-quality AVIF per photo (long edge <= 2000, never upscaled).
const LIGHTBOX = { long: 2000, avif: { quality: 72, effort: 4, chromaSubsampling: "4:2:0" } }
const LIGHTBOX_SRCS = new Set(
	(JSON.parse(await readFile(path.join(root, "src/data/work/photography.json"), "utf8")).images ?? []).map((i) => i.src)
)
const EXTRA = ["Jose Alejandro_low res.png", "Jose Castillo logo.png"]

async function walk(dir) {
	const entries = await readdir(dir, { withFileTypes: true })
	const files = await Promise.all(
		entries.map((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]))
	)
	return files.flat()
}

const toUrl = (file) => "/" + path.relative(publicDir, file).split(path.sep).join("/")
const slug = (file) =>
	path
		.basename(file, path.extname(file))
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 40)
const hex = ({ r, g, b }) => "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")

function targetWidths(width) {
	const widths = WIDTHS.filter((w) => w <= width)
	const last = widths.at(-1)
	// Never upscale; include the original width when it's meaningfully larger than the last step.
	if (width < WIDTHS.at(-1) && (!last || width > last * 1.15)) widths.push(width)
	return widths
}

async function processFile(file, previous, written) {
	const ext = path.extname(file).toLowerCase()
	const buffer = await readFile(file)
	const hash = createHash("sha1").update(buffer).update(SETTINGS).digest("hex").slice(0, 10)
	const base = `${slug(file)}-${hash}`

	let entry = previous?.hash === hash ? previous : null
	if (!entry) {
		const meta = await sharp(buffer).metadata()
		const rotated = (meta.orientation ?? 1) >= 5
		const width = rotated ? meta.height : meta.width
		const height = rotated ? meta.width : meta.height
		entry = { hash, width, height, color: null }
		if (RASTER.has(ext)) {
			const stats = await sharp(buffer).stats()
			// Transparent images (logos, cut-outs) get no placeholder so no box flashes behind them.
			entry.color = stats.isOpaque ? hex(stats.dominant) : null
		}
	}
	if (!RASTER.has(ext)) return { hash, width: entry.width, height: entry.height, color: null }

	const isPhoto = ext === ".jpg" || ext === ".jpeg"
	const result = { hash, width: entry.width, height: entry.height, color: entry.color, avif: [], webp: [] }
	for (const w of targetWidths(entry.width)) {
		for (const format of ["avif", "webp"]) {
			const name = `${base}-${w}.${format}`
			written.add(name)
			result[format].push({ w, src: `/media-opt/${name}` })
			const out = path.join(outDir, name)
			if (existsSync(out)) continue
			const cached = path.join(cacheDir, name)
			if (existsSync(cached)) {
				await copyFile(cached, out)
				continue
			}
			const img = sharp(buffer).rotate().resize({ width: w, withoutEnlargement: true })
			// Photos tolerate 4:2:0 chroma; keep full chroma for graphics/logos with hard colour edges.
			const encoded =
				format === "avif"
					? img.avif({ ...AVIF, chromaSubsampling: isPhoto ? "4:2:0" : "4:4:4" })
					: img.webp(WEBP)
			await encoded.toFile(cached)
			await copyFile(cached, out)
		}
	}
	if (LIGHTBOX_SRCS.has(toUrl(file))) {
		const scale = Math.min(1, LIGHTBOX.long / Math.max(entry.width, entry.height))
		const lw = Math.round(entry.width * scale), lh = Math.round(entry.height * scale)
		const name = `${base}-lb${LIGHTBOX.long}q${LIGHTBOX.avif.quality}.avif`
		written.add(name)
		result.lightbox = { src: `/media-opt/${name}`, width: lw, height: lh }
		const out = path.join(outDir, name), cached = path.join(cacheDir, name)
		if (!existsSync(out)) {
			if (!existsSync(cached)) await sharp(buffer).rotate().resize({ width: lw, height: lh, fit: "inside", withoutEnlargement: true }).avif(LIGHTBOX.avif).toFile(cached)
			await copyFile(cached, out)
		}
	}
	return result
}

async function main() {
	const started = Date.now()
	await mkdir(outDir, { recursive: true })
	await mkdir(cacheDir, { recursive: true })
	const previous = existsSync(manifestPath) ? JSON.parse(await readFile(manifestPath, "utf8")) : {}

	const files = [
		...(await walk(path.join(publicDir, "media"))),
		...EXTRA.map((f) => path.join(publicDir, f)).filter(existsSync)
	].filter((f) => {
		const ext = path.extname(f).toLowerCase()
		return RASTER.has(ext) || SIZE_ONLY.has(ext)
	})

	const manifest = {}
	const written = new Set()
	const queue = [...files]
	sharp.concurrency(1)
	const workers = Array.from({ length: Math.max(1, os.cpus().length) }, async () => {
		for (let file; (file = queue.shift()); ) {
			const src = toUrl(file)
			try {
				manifest[src] = await processFile(file, previous[src], written)
			} catch (err) {
				console.warn(`[gen-images] skipped ${src}: ${err.message}`)
			}
		}
	})
	await Promise.all(workers)

	// Drop variants of images that were removed or changed.
	const stale = (await readdir(outDir)).filter((name) => !written.has(name))
	await Promise.all(stale.map((name) => rm(path.join(outDir, name))))
	const staleCache = (await readdir(cacheDir)).filter((name) => !written.has(name))
	await Promise.all(staleCache.map((name) => rm(path.join(cacheDir, name))))

	const sorted = Object.fromEntries(Object.keys(manifest).sort().map((k) => [k, manifest[k]]))
	await writeFile(manifestPath, JSON.stringify(sorted, null, "\t") + "\n")
	const seconds = ((Date.now() - started) / 1000).toFixed(1)
	console.log(`[gen-images] ${files.length} images, ${written.size} variants, ${stale.length} pruned in ${seconds}s`)
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
