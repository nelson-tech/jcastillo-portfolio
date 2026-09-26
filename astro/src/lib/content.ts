import { existsSync } from "node:fs"
import path from "node:path"
import { z } from "astro/zod"

import siteJson from "@data/site.json"
import aboutJson from "@data/about.json"
import contactJson from "@data/contact.json"
import workJson from "@data/work.json"
import photographyJson from "@data/work/photography.json"
import designJson from "@data/work/design.json"
import videoJson from "@data/work/video.json"
import audioJson from "@data/work/audio.json"
import musicJson from "@data/work/music.json"
import publicDiplomacyJson from "@data/work/public-diplomacy.json"

const publicDir = path.join(process.cwd(), "public")
// The production Docker image deletes public/ after building, so only check when it exists.
const checkFiles = existsSync(publicDir)

const mediaPath = z
	.string()
	.startsWith("/media/")
	.refine((src) => !checkFiles || existsSync(path.join(publicDir, src)), {
		message: "File not found in public/media"
	})

const text = z.string().nullable()
const html = z.string()

const image = z.object({
	src: mediaPath,
	alt: z.string(),
	width: z.number().int().positive().optional(),
	height: z.number().int().positive().optional()
})

const video = z.object({
	label: z.string(),
	provider: z.enum(["youtube", "vimeo"]),
	id: z.string().min(1),
	draft: z.boolean()
})

const pageInfo = z.object({ title: text, header: text, description: text })

const videoSection = z.object({ header: text, videos: z.array(video) })

export type Image = z.infer<typeof image>
export type Video = z.infer<typeof video>

export const site = z
	.object({
		menu: z.array(z.object({ label: z.string(), path: z.string().startsWith("/") })),
		social: z.array(z.object({ brand: z.string(), link: z.string().url() }))
	})
	.parse(siteJson)

export const about = z
	.object({ image, content: html, resume: mediaPath.nullable() })
	.parse(aboutJson)

export const contact = z
	.object({ content: html, email: z.string().email(), phone: z.string() })
	.parse(contactJson)

export const work = z
	.object({
		categories: z.array(z.object({ name: z.string(), slug: z.string(), image }))
	})
	.parse(workJson)

export const photography = z
	.object({ page: pageInfo, images: z.array(image) })
	.parse(photographyJson)

export const design = z
	.object({
		page: pageInfo,
		motionGraphics: videoSection.extend({ description: text }),
		graphicDesign: z.object({ header: text, description: text, images: z.array(image) })
	})
	.parse(designJson)

export const videos = z
	.object({ page: pageInfo, vr: videoSection, editing: videoSection, commercial: videoSection })
	.parse(videoJson)

export const audio = z
	.object({
		page: pageInfo,
		soundDesign: videoSection.extend({ description: text }),
		audioEngineering: z.object({
			header: text,
			description: text,
			embeds: z.array(z.object({ label: z.string(), html }))
		})
	})
	.parse(audioJson)

export const music = z
	.object({
		page: pageInfo,
		hero: z.object({ image, link: z.string().url() }).nullable(),
		spotifyArtists: z.array(z.object({ name: z.string(), id: z.string().min(1) })),
		press: z.object({
			text,
			links: z.array(z.object({ label: z.string(), url: z.string().url() }))
		})
	})
	.parse(musicJson)

export const publicDiplomacy = z
	.object({
		page: pageInfo,
		publications: z.object({
			header: text,
			items: z.array(z.object({ text: z.string(), label: z.string(), link: z.string().url(), image }))
		}),
		podcasts: z.object({ header: text, items: z.array(z.object({ label: z.string(), html })) })
	})
	.parse(publicDiplomacyJson)
