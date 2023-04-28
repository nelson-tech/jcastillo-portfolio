<script lang="ts">
	import { Lightbox } from "svelte-lightbox"
	import { assetUrl } from "@lib/constants"

	export let photograph: API_Asset
</script>

<Lightbox>
	<img
		src={`${assetUrl}/${photograph.filename_disk}`}
		alt={photograph.title}
		class="photo rounded-sm object-contain md:rounded"
	/>
</Lightbox>
