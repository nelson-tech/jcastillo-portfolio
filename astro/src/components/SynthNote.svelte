<script lang="ts">
	// Shared synthetic-data pill. Put it inside an element with class "synth" (the figure);
	// it shows on hover, keyboard focus, or tap (.is-open, toggled by the page script).
	export let note = "Recreated with synthetic data to protect confidential information."
</script>

<span class="synth-note" aria-hidden="true">{note}</span>

<style>
	:global(.synth) { position: relative; margin: 0; -webkit-tap-highlight-color: transparent; outline-offset: 3px; }
	:global(.synth:focus) { outline: none; }
	:global(.synth:focus-visible) { outline: 2px solid #6b7176; outline-offset: 4px; }
	.synth-note {
		position: absolute; right: 12px; bottom: 12px; max-width: calc(100% - 24px); box-sizing: border-box;
		font: 12px/1.35 basic-sans, system-ui, sans-serif; color: rgb(22 25 28 / 0.7);
		background: rgb(245 243 238 / 0.9); border: 1px solid #dedad2; border-radius: 4px; padding: 4px 8px;
		opacity: 0; transition: opacity 150ms ease; pointer-events: none;
	}
	:global(.synth:hover) .synth-note,
	:global(.synth:focus-visible) .synth-note,
	:global(.synth:focus-within) .synth-note,
	:global(.synth.is-open) .synth-note { opacity: 1; }
	@media (prefers-reduced-motion: reduce) { .synth-note { transition: none; } }
</style>
