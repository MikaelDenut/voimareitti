<script lang="ts">
	// Food image with a guaranteed fallback (planning section 4 / 22). The src should already be resolved
	// via $lib/recipe-images (final art or a placeholder). This component adds a runtime onerror safety
	// net: if the file 404s anyway (e.g. a stale manifest), it swaps to a placeholder ONCE so a broken
	// image icon can never render. Decorative by default (alt=''); pass a real alt for meaningful images.

	let {
		src,
		alt = '',
		placeholder = '/img/placeholders/placeholder-recipe-generic.webp',
		loading = 'lazy',
		klass = ''
	}: {
		src: string;
		alt?: string;
		placeholder?: string;
		loading?: 'lazy' | 'eager';
		klass?: string;
	} = $props();

	let broken = $state(false);
	const current = $derived(broken ? placeholder : src);

	// Reset the broken guard whenever src changes (swap / serving change).
	$effect(() => {
		void src;
		broken = false;
	});

	function onerror() {
		if (src !== placeholder) broken = true;
	}
</script>

<img src={current} {alt} {loading} class={klass} onerror={onerror} />

<style>
	img {
		display: block;
		max-width: 100%;
		height: auto;
	}
</style>
