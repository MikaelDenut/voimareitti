<script lang="ts">
	// Branded fallback for any error (e.g. an unknown locale or a mistyped exercise id), instead of
	// SvelteKit's bare default page. Stays locale-agnostic (the error route has no [lang]).
	import { page } from '$app/stores';
	const status = $derived($page.status);
	const message = $derived($page.error?.message ?? '');
</script>

<svelte:head>
	<title>Voimareitti</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="err">
	<a class="brand" href="/"><img src="/img/brand/logo-horizontal.png" alt="Voimareitti" /></a>
	<h1>{status === 404 ? 'Sivua ei löytynyt / Page not found' : 'Jokin meni pieleen / Something went wrong'}</h1>
	{#if message}<p class="muted">{message}</p>{/if}
	<p><a class="cta" href="/">Etusivulle / Back to start</a></p>
</main>

<style>
	.err { max-width: 40rem; margin: 4rem auto; padding: 0 1.25rem; text-align: center; }
	.brand img { height: 32px; width: auto; }
	h1 { font-size: 1.4rem; margin: 1.5rem 0 0.5rem; }
	.muted { color: var(--muted); }
	.cta { display: inline-block; margin-top: 1rem; background: var(--accent); color: #fff;
		text-decoration: none; padding: 0.7rem 1.5rem; border-radius: 0.5rem; font-weight: 600; }
	.cta:hover { filter: brightness(0.95); }
</style>
