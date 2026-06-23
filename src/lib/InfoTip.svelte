<script lang="ts">
	// Small "i" info icon that opens a plain-language explanation popover. Closes on outside click.
	let { title, body }: { title: string; body: string } = $props();
	let open = $state(false);
	let wrap: HTMLElement;

	function toggle() {
		open = !open;
	}
	$effect(() => {
		if (!open) return;
		const h = (e: MouseEvent) => {
			if (wrap && !wrap.contains(e.target as Node)) open = false;
		};
		window.addEventListener('click', h);
		return () => window.removeEventListener('click', h);
	});
</script>

<span class="wrap no-print" bind:this={wrap}>
	<button type="button" class="ibtn" aria-label={title} aria-expanded={open} onclick={toggle}>i</button>
	{#if open}
		<span class="pop" role="tooltip">
			<b>{title}</b>
			<span>{body}</span>
		</span>
	{/if}
</span>

<style>
	.wrap { position: relative; display: inline-flex; vertical-align: middle; }
	.ibtn { position: relative; width: 1.05rem; height: 1.05rem; border-radius: 50%; border: 1px solid var(--accent); background: var(--surface); color: var(--accent); font-size: 0.7rem; font-weight: 700; font-style: italic; line-height: 1; cursor: pointer; padding: 0; display: inline-flex; align-items: center; justify-content: center; }
	.ibtn:hover { background: var(--accent-soft); }
	.ibtn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
	/* Expand the touch target to ~44px without changing the visible icon size. */
	.ibtn::before { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 44px; height: 44px; }
	.pop { position: absolute; left: 0; top: 1.4rem; z-index: 40; width: 17rem; max-width: 80vw; background: var(--surface); border: 1px solid var(--line); border-radius: 0.5rem; box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12); padding: 0.6rem 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; text-align: left; font-weight: 400; }
	.pop b { color: var(--primary); font-size: 0.85rem; }
	.pop span { color: var(--text); font-size: 0.82rem; line-height: 1.4; }
</style>
