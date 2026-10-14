<script lang="ts">
	import Carousel from "svelte-carousel"
	import Picture from "@components/Picture.svelte"
	import SynthNote from "@components/SynthNote.svelte"
	import type { ImageInfo } from "@lib/picture"

	let carousel: any // for calling methods of the carousel instance

	import type { publicDiplomacy } from "@lib/content"

	type Publication = (typeof publicDiplomacy)["publications"]["items"][number]
	export let publications: (Publication & { image: Publication["image"] & { info?: ImageInfo } })[] = []
	// Optional: dashboard slides (BI showcase). Same carousel, same styling; each slide gets the synthetic-data pill.
	type Dashboard = { slug: string; label: string; h: number; mh: number }
	export let dashboards: Dashboard[] = []
	export let note = ""

	const handleNextClick = () => {
		carousel.goToNext()
	}

	// Height follows the active slide (rules from #36): animated 200ms, instant under
	// prefers-reduced-motion, and the page never scrolls when the slide changes.
	import { onMount, onDestroy } from "svelte"
	let root: HTMLDivElement
	let pageIndex = 0
	let ready = false
	let ro: ResizeObserver | undefined
	let watched: Element | undefined

	const activeSlide = () => {
		const container = root?.querySelector(".sc-carousel__pages-container")
		if (!container) return undefined
		const n = dashboards.length + publications.length
		const clones = container.children.length > n ? (container.children.length - n) / 2 : 0
		return container.children[pageIndex + clones] as HTMLElement | undefined
	}

	const sync = () => {
		const win = root?.querySelector(".sc-carousel__pages-window") as HTMLElement | null
		const slide = activeSlide()
		if (!win || !slide || !slide.offsetHeight) return
		const h = slide.offsetHeight
		// Arrows: about 160px from the top of the slide (or centered on a short slide).
		root.style.setProperty("--pc-arrow-top", `${Math.max(0, Math.min(160, h / 2 - 20))}px`)
		// Watch the active slide before any early return, so a late image load (or a
		// source/aspect change) always re-fits the frame instead of clipping it.
		if (ro && watched !== slide) {
			if (watched) ro.unobserve(watched)
			ro.observe(slide)
			watched = slide
		}
		if (win.style.height === `${h}px`) return
		const y = window.scrollY
		win.style.height = `${h}px`
		const until = performance.now() + 300
		const pin = () => {
			if (window.scrollY !== y) window.scrollTo(0, y)
			if (performance.now() < until) requestAnimationFrame(pin)
		}
		pin()
	}

	const onPageChange = (event: CustomEvent<number>) => {
		if (typeof event.detail !== "number") return
		pageIndex = event.detail
		requestAnimationFrame(sync)
	}

	onMount(() => {
		if ("ResizeObserver" in window) ro = new ResizeObserver(() => sync())
		requestAnimationFrame(() => {
			sync()
			requestAnimationFrame(() => (ready = true))
		})
		window.addEventListener("resize", sync)
	})
	onDestroy(() => {
		ro?.disconnect()
		if (typeof window !== "undefined") window.removeEventListener("resize", sync)
	})
</script>

<div class="pc" class:ready bind:this={root}>
{#if typeof window !== undefined}
	<Carousel bind:this={carousel} class="" on:pageChange={onPageChange}>
		{#each dashboards as item, i}
			<figure class="synth border-rule border" data-first={i === 0 ? "" : undefined} tabindex="0" aria-label={`${i + 1} of ${dashboards.length}: ${item.label}`}>
				<picture>
					<source
						media="(max-width: 700px)"
						srcset={i === 0
							? `/media/showcase/${item.slug}-390-1x.webp 1x, /media/showcase/${item.slug}-390.webp 2x`
							: `/media/showcase/${item.slug}-390.webp`}
						width="780"
						height={item.mh}
					/>
					<img
						src={`/media/showcase/${item.slug}-1440.webp`}
						loading="lazy"
						decoding="async"
												width="2880"
						height={item.h}
						alt={`${item.label}. ${note}`}
						class="block h-auto w-full"
						draggable="false"
					/>
				</picture>
				<SynthNote {note} />
			</figure>
		{/each}
		{#each publications as publication, j}
			<a
				data-first={j === 0 && !dashboards.length ? "" : undefined}
				href={publication.link}
				target="_blank"
				rel="noopener"
				class="group flex w-96 flex-col items-center justify-center"
			>
				<div class="relative overflow-hidden rounded object-contain">
					<Picture
						src={publication.image.src}
						alt={publication.label}
						info={publication.image.info}
						class="relative rounded object-contain"
					/>
					<!-- <div
            class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-80 transition-all flex justify-center items-center duration-500"
          >
            <i
              class="fas fa-arrow-up-right-from-square fa-xl text-white opacity-0 group-hover:opacity-100 -translate-y-4 group-hover:translate-y-0 transition-all duration-500"
            />
          </div> -->
				</div>
				<span class="group-hover:text-highlight mt-4 text-center text-lg transition-colors"
					>{publication.text}</span
				>
			</a>
		{/each}
	</Carousel>
{/if}
</div>

<style>
	/* Height follows the active slide; never let scroll anchoring move the page */
	.pc { overflow-anchor: none; }
	.pc :global(.sc-carousel__pages-container) { align-items: flex-start; }
	/* animate only after the first measure, so the initial fit is a single instant change */
	.pc.ready :global(.sc-carousel__pages-window) { transition: height 200ms ease; }
	@media (prefers-reduced-motion: reduce) {
		.pc.ready :global(.sc-carousel__pages-window) { transition: none; }
	}
	/* Before the first measure, only slide 1 sets the height (no shrink-on-hydrate layout shift) */
	.pc:not(.ready) :global(.sc-carousel__pages-container > :not([data-first])) { display: none; }
	.pc:not(.ready) :global(.sc-carousel__pages-container > [data-first]) { flex: 0 0 100%; max-width: 100%; }
	/* Slides always show their full image: natural aspect, never cropped by a fixed box */
	.pc :global(.synth img) { height: auto; max-height: none; }
	/* Phones: pin arrows near the top of the slide so they stay on screen on tall slides */
	@media (max-width: 700px) {
		.pc :global(.sc-carousel__arrow-container) { align-items: flex-start; padding-top: var(--pc-arrow-top, 160px); }
	}
	:global(.sc-carousel-button) {
		background-color: transparent !important;
	}
	:root {
		--sc-arrow-size: 4px !important;
	}
</style>
