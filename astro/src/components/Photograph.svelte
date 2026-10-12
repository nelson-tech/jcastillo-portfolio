<script lang="ts">
	import { Lightbox } from "svelte-lightbox"
	import Picture from "@components/Picture.svelte"
	import type { Image } from "@lib/content"
	import { largestSizes } from "@lib/picture"
	import type { ImageInfo } from "@lib/picture"

	export let image: Image & { info?: ImageInfo }
	// Grid cells are md:basis-1/3, full width minus mx-8 below md.
	export let sizes = "(min-width: 768px) 33vw, calc(100vw - 4rem)"
	/** First grid image is the LCP candidate: eager + fetchpriority="high". */
	export let priority = false
	export let loading: "lazy" | "eager" = priority ? "eager" : "lazy"
</script>

<Lightbox>
	<svelte:fragment slot="thumbnail">
		<Picture
			src={image.src}
			alt={image.alt}
			info={image.info}
			{sizes}
			{priority}
			{loading}
			class="photo rounded-sm object-contain md:rounded"
		/>
	</svelte:fragment>
	<!-- Opened view: the largest generated variant (1600w) instead of the full-size original. -->
	<Picture
		src={image.src}
		alt={image.alt}
		info={image.info}
		sizes={image.info ? largestSizes(image.info) : undefined}
		loading="eager"
		class="photo rounded-sm object-contain md:rounded"
	/>
</Lightbox>

<style>
	/* svelte-lightbox sizes its direct child; with <picture> as display:contents, apply that to the <img>. */
	:global(.svelte-lightbox-body > picture > img) {
		max-width: 100%;
		max-height: inherit;
		height: auto;
		width: auto;
		object-fit: contain;
	}
</style>
