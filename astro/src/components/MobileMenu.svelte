<script lang="ts">
  import { isMenuOpen } from "../stores/menu";

  export let menuItems: Collections["menu_items"][] | null | undefined;
  export let footerItems: Collections["footer_icons"][] | null | undefined;

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

  isMenuOpen.subscribe((open) => {
    if (open) {
      document.body.style.position = "fixed";
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
  });
</script>

<div
  class={`md:hidden absolute inset-0 top-[128px] ${
    $isMenuOpen ? "" : "-z-10 opacity-0"
  } transition-all bg-gradient-to-tr from-slate-300 to-slate-50 duration-500`}
  use:clickOutside={"#menu-icon"}
>
  {#if menuItems}
    <ul
      class={`mt-16 ${
        $isMenuOpen ? "" : "translate-y-16"
      } transition-all duration-500`}
    >
      {#each menuItems as menuItem}
        <li class="p-8 text-2xl w-full text-center">
          <a
            href={menuItem.path}
            on:click={() => isMenuOpen.set(false)}
            on:keypress={() => isMenuOpen.set(false)}
            class="w-full py-8 hover:text-highlight transition-colors"
            >{menuItem.label}
          </a>
        </li>
      {/each}
    </ul>
  {/if}
  <div
    class={`mt-28 ${
      $isMenuOpen ? "" : "translate-y-16 opacity-0"
    } transition-all delay-500 duration-700`}
  >
    <div class="social flex justify-center gap-4">
      {#if footerItems}
        {#each footerItems as icon}
          <a
            href={icon.link}
            target="_blank"
            class="hover:animate-pulse"
            title={icon.brand}
          >
            <i
              class={`fab fa-${icon.brand.toLowerCase()} fa-2x hover:animate-pulse`}
            />
          </a>
        {/each}
      {/if}
    </div>
  </div>
</div>
