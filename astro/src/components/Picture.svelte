<script lang="ts">
	// Svelte twin of Picture.astro. Islands can't read the manifest, so the page passes `info`
	// (from imageInfo() in @lib/images) as a prop.
	import { onMount } from "svelte"
	import { naturalSizes, srcset } from "@lib/picture"
	import type { ImageInfo } from "@lib/picture"

	export let src: string
	export let alt = ""
	export let info: ImageInfo | undefined = undefined
	export let sizes: string | undefined = undefined
	export let priority = false
	export let loading: "lazy" | "eager" = priority ? "eager" : "lazy"
	let className = ""
	export { className as class }

	let img: HTMLImageElement
	let loaded = false
	onMount(() => {
		if (img.complete) loaded = true
	})

	$: color = info?.avif?.length && !loaded ? info.color : null
	$: resolvedSizes = sizes ?? (info ? naturalSizes(info) : undefined)
</script>

{#if info?.avif?.length}
	<picture style="display:contents">
		<source type="image/avif" srcset={srcset(info.avif)} sizes={resolvedSizes} />
		<source type="image/webp" srcset={srcset(info.webp ?? [])} sizes={resolvedSizes} />
		<img
			bind:this={img}
			{src}
			{alt}
			class={className}
			width={info.width}
			height={info.height}
			{loading}
			decoding="async"
			fetchpriority={priority ? "high" : undefined}
			style:background-color={color}
			on:load={() => (loaded = true)}
		/>
	</picture>
{:else}
	<img
		bind:this={img}
		{src}
		{alt}
		class={className}
		width={info?.width}
		height={info?.height}
		{loading}
		decoding="async"
		fetchpriority={priority ? "high" : undefined}
	/>
{/if}
