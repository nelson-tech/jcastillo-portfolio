// One-time export of the public Directus content into src/data/*.json and public/media/.
// Re-runnable until the Directus API is shut down. Run from astro/: node scripts/export-directus.mjs
import { mkdir, writeFile, access } from "node:fs/promises"
import path from "node:path"

const API = process.env.DIRECTUS_URL ?? "https://api.josecastillocorcuera.com"
const DATA_DIR = "src/data"
const MEDIA_DIR = "public/media"

const media = new Map() // local filename -> download URL

async function get(pathname, fields) {
	const url = `${API}${pathname}?limit=-1&fields=${encodeURIComponent(fields.join(","))}`
	const res = await fetch(url)
	if (!res.ok) throw new Error(`${res.status} ${url}`)
	return (await res.json()).data
}

function asset(file) {
	if (!file?.filename_disk) return null
	media.set(file.filename_disk, `${API}/assets/${file.id}`)
	return {
		src: `/media/${file.filename_disk}`,
		alt: file.title ?? "",
		...(file.width && { width: file.width }),
		...(file.height && { height: file.height })
	}
}

async function assetById(id, alt) {
	const res = await fetch(`${API}/assets/${id}`, { method: "HEAD" })
	if (!res.ok) throw new Error(`${res.status} asset ${id}`)
	const ext = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" }[res.headers.get("content-type")]
	if (!ext) throw new Error(`Unknown content type for asset ${id}`)
	return asset({ id, filename_disk: `${id}.${ext}`, title: alt })
}

const page = (d) => ({
	title: d.page_title ?? null,
	header: d.page_header ?? null,
	description: d.page_description ?? null
})

const video = ({ video_links_id: v }) => ({
	label: v.label ?? "",
	provider: v.provider?.value ?? "youtube",
	id: v.videoId,
	draft: v.status !== "published"
})

const PAGE_FIELDS = ["page_title", "page_header", "page_description"]

async function main() {
	const out = {}

	const [menu, footer] = await Promise.all([
		get("/items/menu_items", ["label", "path", "status"]),
		get("/items/footer_icons", ["brand", "link", "status"])
	])
	out["site.json"] = {
		menu: menu.filter((m) => m.status === "published").map(({ label, path }) => ({ label, path })),
		social: footer.filter((f) => f.status === "published").map(({ brand, link }) => ({ brand, link }))
	}

	const about = await get("/items/about", ["image.*", "content", "resume.*"])
	out["about.json"] = {
		image: asset(about.image),
		content: about.content,
		resume: about.resume ? asset(about.resume).src : null
	}

	const contact = await get("/items/contact", ["content", "email", "phone"])
	out["contact.json"] = { content: contact.content, email: contact.email, phone: contact.phone }

	const categories = await get("/items/work_categories", ["name", "slug", "image.*", "status"])
	out["work.json"] = {
		categories: categories
			.filter((c) => c.status === "published")
			.map((c) => ({ name: c.name, slug: c.slug, image: asset(c.image) }))
	}

	const photo = await get("/items/photography_projects", [...PAGE_FIELDS, "images.directus_files_id.*"])
	out["work/photography.json"] = {
		page: page(photo),
		images: photo.images.map((i) => asset(i.directus_files_id)).filter(Boolean)
	}

	const design = await get("/items/design_projects", [
		...PAGE_FIELDS,
		"motion_graphics_header",
		"motion_graphics_description",
		"motion_graphics_videos.video_links_id.*.*",
		"graphic_design_header",
		"graphic_design_description",
		"graphic_design_images.directus_files_id.*"
	])
	out["work/design.json"] = {
		page: page(design),
		motionGraphics: {
			header: design.motion_graphics_header,
			description: design.motion_graphics_description,
			videos: design.motion_graphics_videos.map(video)
		},
		graphicDesign: {
			header: design.graphic_design_header,
			description: design.graphic_design_description,
			images: design.graphic_design_images.map((i) => asset(i.directus_files_id)).filter(Boolean)
		}
	}

	const videos = await get("/items/videos", [
		...PAGE_FIELDS,
		"vr_header",
		"vr.video_links_id.*.*",
		"editing_header",
		"editing.video_links_id.*.*",
		"commercial_header",
		"commercial.video_links_id.*.*"
	])
	out["work/video.json"] = {
		page: page(videos),
		vr: { header: videos.vr_header, videos: videos.vr.map(video) },
		editing: { header: videos.editing_header, videos: videos.editing.map(video) },
		commercial: { header: videos.commercial_header, videos: videos.commercial.map(video) }
	}

	const audio = await get("/items/audio_projects", [
		...PAGE_FIELDS,
		"sound_design_header",
		"sound_design_description",
		"sound_design_video_links.video_links_id.*.*",
		"audio_engineering_header",
		"audio_engineering_description",
		"audio_engineering_html"
	])
	out["work/audio.json"] = {
		page: page(audio),
		soundDesign: {
			header: audio.sound_design_header,
			description: audio.sound_design_description,
			videos: audio.sound_design_video_links.map(video)
		},
		audioEngineering: {
			header: audio.audio_engineering_header,
			description: audio.audio_engineering_description,
			embeds: audio.audio_engineering_html.map(({ label, html }) => ({ label, html }))
		}
	}

	const music = await get("/items/music_projects", [...PAGE_FIELDS, "image.*", "link", "text", "links", "spotify"])
	out["work/music.json"] = {
		page: page(music),
		hero: music.image ? { image: asset(music.image), link: music.link } : null,
		spotifyArtists: (music.spotify ?? []).map((a) => ({ name: a.artist_name, id: a.artist_id })),
		press: { text: music.text, links: (music.links ?? []).map(({ label, url }) => ({ label, url })) }
	}

	const pd = await get("/items/academic_projects", [
		...PAGE_FIELDS,
		"academic_publications_header",
		"academic_publications",
		"podcasts_header",
		"podcasts"
	])
	out["work/public-diplomacy.json"] = {
		page: page(pd),
		publications: {
			header: pd.academic_publications_header,
			items: await Promise.all(
				pd.academic_publications.map(async (p) => ({
					text: p.text,
					label: p.label,
					link: p.link,
					image: await assetById(p.image, p.label)
				}))
			)
		},
		podcasts: { header: pd.podcasts_header, items: pd.podcasts.map(({ label, html }) => ({ label, html })) }
	}

	for (const [file, data] of Object.entries(out)) {
		const dest = path.join(DATA_DIR, file)
		await mkdir(path.dirname(dest), { recursive: true })
		await writeFile(dest, JSON.stringify(data, null, "\t") + "\n")
	}

	await mkdir(MEDIA_DIR, { recursive: true })
	let downloaded = 0
	for (const [name, url] of media) {
		const dest = path.join(MEDIA_DIR, name)
		if (await access(dest).then(() => true, () => false)) continue
		const res = await fetch(url)
		if (!res.ok) throw new Error(`${res.status} ${url}`)
		await writeFile(dest, Buffer.from(await res.arrayBuffer()))
		downloaded++
	}

	console.log(`Wrote ${Object.keys(out).length} data files; ${media.size} media files (${downloaded} downloaded).`)
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
