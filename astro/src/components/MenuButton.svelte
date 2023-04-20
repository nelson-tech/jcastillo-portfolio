<script lang="ts">
  import { isMenuOpen } from "../stores/menu";

  const toggleMenu = () => {
    isMenuOpen.set(!$isMenuOpen);
  };
</script>

<div
  id="menu-icon"
  class={`cursor-pointer z-50 ${$isMenuOpen ? "close" : ""}`}
  on:click={toggleMenu}
  on:keypress={toggleMenu}
>
  <div class="bar" />
  <div class="bar" />
  <div class="bar" />
</div>

<style>
  div#menu-icon {
    display: inline-block;
    padding: 10px;
  }
  div#menu-icon .bar {
    margin: 3px;
    width: 25px;
    height: 3px;
    background: #000;
    border-radius: 1.5px;
    transition: margin 0.2s, transform 0.2s;

    /* same as above but with prefixes added */
    -webkit-transition: margin 0.2s, -webkit-transform 0.2s;
    transition: margin 0.2s, -webkit-transform 0.2s;
    -o-transition: margin 0.2s, transform 0.2s;
    transition: margin 0.2s, transform 0.2s;
    transition: margin 0.2s, transform 0.2s, -webkit-transform 0.2s;
  }

  div#menu-icon:not(.close):hover {
    padding: 6px 10px;
  }

  div#menu-icon:not(.close):hover .bar {
    margin: 5px 3px;
  }

  div#menu-icon.close .bar:first-child {
    -webkit-transform: translateY(6px) rotate(45deg);
    -ms-transform: translateY(6px) rotate(45deg);
    transform: translateY(6px) rotate(45deg);
  }
  div#menu-icon.close .bar:nth-child(2) {
    opacity: 0;
  }
  div#menu-icon.close .bar:last-child {
    -webkit-transform: translateY(-6px) rotate(-45deg);
    -ms-transform: translateY(-6px) rotate(-45deg);
    transform: translateY(-6px) rotate(-45deg);
  }
</style>
