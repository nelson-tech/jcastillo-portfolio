<script lang="ts">
  import { Lightbox } from "svelte-lightbox";
  import { assetUrl } from "../utils/constants";

  export let photograph: API_Asset;
</script>

<Lightbox>
  <img
    src={`${assetUrl}/${photograph.filename_disk}`}
    alt={photograph.title}
    class="photo object-contain rounded-sm md:rounded"
  />
</Lightbox>
