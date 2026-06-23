<script lang="ts">
	// Segmented control (planning section 4) - a radiogroup of buttons for small mutually-exclusive
	// choices (figure variant, per-serving vs per-100g, density, etc.). Roving tabindex + arrow-key
	// navigation, aria-checked, 44px targets, reduced-motion safe. Bindable value.

	let {
		options,
		value = $bindable(''),
		ariaLabel = '',
		onchange
	}: {
		options: { value: string; label: string }[];
		value?: string;
		ariaLabel?: string;
		onchange?: (value: string) => void;
	} = $props();

	let btns = $state<HTMLButtonElement[]>([]);

	function select(v: string) {
		value = v;
		onchange?.(v);
	}

	function onkeydown(e: KeyboardEvent, i: number) {
		let next = -1;
		if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % options.length;
		else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + options.length) % options.length;
		else if (e.key === 'Home') next = 0;
		else if (e.key === 'End') next = options.length - 1;
		if (next >= 0) {
			e.preventDefault();
			select(options[next].value);
			btns[next]?.focus();
		}
	}
</script>

<div class="seg" role="radiogroup" aria-label={ariaLabel || undefined}>
	{#each options as opt, i (opt.value)}
		<button
			type="button"
			bind:this={btns[i]}
			class="seg-btn"
			class:on={value === opt.value}
			role="radio"
			aria-checked={value === opt.value}
			tabindex={value === opt.value || (value === '' && i === 0) ? 0 : -1}
			onclick={() => select(opt.value)}
			onkeydown={(e) => onkeydown(e, i)}
		>{opt.label}</button>
	{/each}
</div>

<style>
	.seg {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 2px;
		padding: 2px;
		background: var(--bg);
		border: 1px solid var(--line);
		border-radius: 999px;
	}
	.seg-btn {
		min-height: 44px;
		padding: 0.4rem 0.9rem;
		border: none;
		border-radius: 999px;
		background: none;
		color: var(--text);
		font: inherit;
		font-size: 0.9rem;
		cursor: pointer;
	}
	.seg-btn.on {
		background: var(--surface);
		color: var(--primary);
		font-weight: 600;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
	}
	.seg-btn:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 1px;
	}
</style>
