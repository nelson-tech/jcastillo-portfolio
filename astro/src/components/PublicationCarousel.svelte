<script lang="ts">
	import Carousel from "svelte-carousel"
	import Picture from "@components/Picture.svelte"
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
</script>

{#if typeof window !== undefined}
	<Carousel bind:this={carousel} class="">
		{#each dashboards as item, i}
			<figure class="synth border-rule border" tabindex="0" aria-label={`${i + 1} of ${dashboards.length}: ${item.label}`}>
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
						loading={i === 0 ? "eager" : "lazy"}
						decoding="async"
						fetchpriority={i === 0 ? "high" : undefined}
						width="2880"
						height={item.h}
						alt={`${item.label}. ${note}`}
						class="block h-auto w-full"
						draggable="false"
					/>
				</picture>
				<span class="synth-note" aria-hidden="true">{note}</span>
			</figure>
		{/each}
		{#each publications as publication}
			<a
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
						class="relative rounded object-contain transition-all duration-500 group-hover:grayscale"
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

<style>
	/* Synthetic-data pill: same spec as the BI slides from #34/#36 */
	.synth { position: relative; margin: 0; -webkit-tap-highlight-color: transparent; outline-offset: 3px; }
	.synth:focus { outline: none; }
	.synth:focus-visible { outline: 2px solid #6b7176; outline-offset: 4px; }
	.synth-note {
		position: absolute; right: 12px; bottom: 12px; max-width: calc(100% - 24px); box-sizing: border-box;
		font: 12px/1.35 basic-sans, system-ui, sans-serif; color: rgb(22 25 28 / 0.7);
		background: rgb(245 243 238 / 0.9); border: 1px solid #dedad2; border-radius: 4px; padding: 4px 8px;
		opacity: 0; transition: opacity 150ms ease; pointer-events: none;
	}
	.synth:hover .synth-note,
	.synth:focus-visible .synth-note,
	.synth:focus-within .synth-note,
	:global(.synth.is-open) .synth-note { opacity: 1; }
	@media (prefers-reduced-motion: reduce) { .synth-note { transition: none; } }
	:global(.sc-carousel-button) {
		background-color: transparent !important;
	}
	:root {
		--sc-arrow-size: 4px !important;
	}
</style>
