<script lang="ts">
	import Carousel from "svelte-carousel"

	let carousel: any // for calling methods of the carousel instance

	export let publications: AP_Publication[]

	const handleNextClick = () => {
		carousel.goToNext()
	}

	const apiURL = import.meta.env.PUBLIC_API_URL
</script>

{#if typeof window !== undefined}
	<Carousel bind:this={carousel} class="">
		{#each publications as publication}
			<a
				href={publication.link}
				target="_blank"
				class="group flex w-96 flex-col items-center justify-center"
			>
				<div class="relative overflow-hidden rounded object-contain">
					<img
						src={`${apiURL}/assets/${publication.image}`}
						alt={publication.label}
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
	:global(.sc-carousel-button) {
		background-color: transparent !important;
	}
	:root {
		--sc-arrow-size: 4px !important;
	}
</style>
