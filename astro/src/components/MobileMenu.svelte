<script lang="ts">
  import type { Collections } from "../utils/types/directus";
  import { isMenuOpen } from "../stores/menu";

  export let menuItems: Collections["menu_items"][] | null | undefined;

  const clickOutside = (node: HTMLElement, ignore?: string) => {
    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement;
      if (!event.target || (ignore && target.closest(ignore))) {
        return;
      }
      if (node && !node.contains(target) && !event.defaultPrevented) {
        node.dispatchEvent(new CustomEvent("click_outside"));
        isMenuOpen.set(false);
      }
    };

    document.addEventListener("click", handleClick, true);

    return {
      destroy() {
        document.removeEventListener("click", handleClick, true);
      },
    };
  };
</script>

<div
  class={`absolute inset-0 max-w-[300px] bg-gradient-to-tr bg-opacity-[20%] from-slate-200 to-white bg-transparent ${
    $isMenuOpen ? "" : "-translate-x-full"
  } transition-all`}
  use:clickOutside={"#user-menu-button"}
>
  {#if menuItems}
    <ul class="mt-16 bg-transparent">
      {#each menuItems as menuItem}
        <li
          class="p-8 text-2xl text-center"
          on:click={() => isMenuOpen.set(false)}
          on:keypress={() => isMenuOpen.set(false)}
        >
          <a href={menuItem.path} class="py-8 tracking-wide">{menuItem.label}</a
          >
        </li>
      {/each}
    </ul>
  {/if}
</div>
