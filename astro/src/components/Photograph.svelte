<script lang="ts">
  import { Lightbox } from "svelte-lightbox";

  export let photograph: API_Photograph;

  const apiURL = import.meta.env.PUBLIC_DIRECTUS_URL;
</script>

<Lightbox>
  <img
    src={`${apiURL}/assets/${photograph.image}`}
    alt={photograph.alt}
    class="object-contain rounded-sm md:rounded max-w-96 max-h-96"
  />
</Lightbox>
