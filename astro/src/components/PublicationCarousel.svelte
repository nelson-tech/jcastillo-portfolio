<script lang="ts">
  import Carousel from "svelte-carousel";

  let carousel: any; // for calling methods of the carousel instance

  export let publications: AP_Publication[];

  const handleNextClick = () => {
    carousel.goToNext();
  };

  const apiURL = import.meta.env.PUBLIC_DIRECTUS_URL;
</script>

{#if typeof window !== undefined}
  <Carousel bind:this={carousel} class="">
    {#each publications as publication}
      <a
        href={publication.link}
        target="_blank"
        class="w-96 flex flex-col justify-center items-center group"
      >
        <div class="relative object-contain rounded overflow-hidden">
          <img
            src={`${apiURL}/assets/${publication.image}`}
            alt={publication.label}
            class="object-contain rounded group-hover:grayscale transition-all duration-500 relative"
          />
          <!-- <div
            class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-80 transition-all flex justify-center items-center duration-500"
          >
            <i
              class="fas fa-arrow-up-right-from-square fa-xl text-white opacity-0 group-hover:opacity-100 -translate-y-4 group-hover:translate-y-0 transition-all duration-500"
            />
          </div> -->
        </div>
        <span
          class="mt-4 text-lg text-center group-hover:text-highlight transition-colors"
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
