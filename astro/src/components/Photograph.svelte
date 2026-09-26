<script lang="ts">
	import { Lightbox } from "svelte-lightbox"
	import type { Image } from "@lib/content"

	export let image: Image
</script>

<Lightbox>
	<img
		src={image.src}
		alt={image.alt}
		class="photo rounded-sm object-contain md:rounded"
	/>
</Lightbox>
