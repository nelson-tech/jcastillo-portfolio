<script lang="ts">
  import { Lightbox } from "svelte-lightbox";
  import { assetUrl } from "../utils/constants";

  export let photograph: API_Asset;
</script>

<Lightbox>
  <img
    src={`${assetUrl}/${photograph.filename_disk}`}
    alt={photograph.title}
    class="object-contain rounded-sm md:rounded max-w-96 max-h-96"
  />
</Lightbox>
