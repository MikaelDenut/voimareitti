<script lang="ts">
	// Shared top navigation used on every page.
	// Mobile-first: compact bar + hamburger drawer below --bp; classic inline row above it.
	import { page } from '$app/stores';
	import { t, type Locale } from '$lib/i18n';
	import LangSwitcher from '$lib/LangSwitcher.svelte';

	let { lang }: { lang: Locale } = $props();
	const T = (k: string) => t(lang, k);

	const links = $derived([
		{ href: `/${lang}/generate`, label: T('nav_program') },
		{ href: `/${lang}/exercises`, label: T('nav_exercises') },
		{ href: `/${lang}/nutrition`, label: T('nav_nutrition') },
		{ href: `/${lang}/recipes`, label: T('nav_recipes') },
		{ href: `/${lang}/about`, label: T('nav_about') }
	]);
	const path = $derived($page.url.pathname);
	const isActive = (href: string) => path === href || path.startsWith(href + '/');

	let open = $state(false);
	let toggleEl: HTMLButtonElement | undefined = $state();
	let drawerEl: HTMLDivElement | undefined = $state();

	function closeMenu() { open = false; toggleEl?.focus(); }
	// Focusable elements INSIDE the drawer (the backdrop is excluded - it is aria-hidden + tabindex -1).
	function focusables(): HTMLElement[] {
		if (!drawerEl) return [];
		return Array.from(drawerEl.querySelectorAll<HTMLElement>(
			'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
		));
	}
	function onKeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
		// Focus trap: keep Tab inside the drawer (mirrors Modal.svelte) so a keyboard user cannot tab into
		// the page behind the open dialog.
		if (e.key === 'Tab') {
			const f = focusables();
			if (f.length === 0) { e.preventDefault(); return; }
			const first = f[0], last = f[f.length - 1];
			const active = document.activeElement as HTMLElement | null;
			if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
			else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
		}
	}
	$effect(() => {
		if (typeof document === 'undefined') return;
		document.body.style.overflow = open ? 'hidden' : '';
		return () => { document.body.style.overflow = ''; };
	});
	// Move focus INTO the drawer when it opens (was missing: focus stayed on the now-hidden hamburger).
	// closeMenu() already restores focus to the toggle.
	$effect(() => {
		if (open) queueMicrotask(() => { (focusables()[0] ?? drawerEl)?.focus(); });
	});
</script>

<svelte:window onkeydown={onKeydown} />

<a class="skiplink" href="#main-content">{T('skip_content')}</a>

<header class="site no-print">
	<a class="brand" href={`/${lang}`} aria-label="Voimareitti">
		<img src="/img/brand/logo-horizontal.png" alt="Voimareitti" />
	</a>

	<nav class="nav nav-inline" aria-label={T('nav_main')}>
		{#each links as l (l.href)}
			<a href={l.href} class:active={isActive(l.href)} aria-current={isActive(l.href) ? 'page' : undefined}>{l.label}</a>
		{/each}
	</nav>

	<div class="lang-inline">
		<LangSwitcher {lang} />
	</div>

	<button
		class="hamburger"
		type="button"
		bind:this={toggleEl}
		aria-label={T('nav_menu')}
		aria-controls="site-drawer"
		aria-expanded={open}
		onclick={() => (open = true)}
	>
		<span class="bars" aria-hidden="true"></span>
	</button>
</header>

<div class="drawer-root no-print" data-open={open}>
	<button class="backdrop" type="button" aria-hidden="true" tabindex="-1" onclick={closeMenu}></button>

	<div class="drawer" id="site-drawer" bind:this={drawerEl} role="dialog" aria-modal="true" aria-label={T('nav_menu')} tabindex="-1">
		<div class="drawer-head">
			<img class="drawer-logo" src="/img/brand/logo-horizontal.png" alt="Voimareitti" />
			<button class="close" type="button" aria-label={T('nav_close')} tabindex={open ? 0 : -1} onclick={closeMenu}>
				<span aria-hidden="true">&times;</span>
			</button>
		</div>

		<nav class="nav-drawer" aria-label={T('nav_main')}>
			{#each links as l (l.href)}
				<a
					href={l.href}
					class:active={isActive(l.href)}
					aria-current={isActive(l.href) ? 'page' : undefined}
					tabindex={open ? 0 : -1}
					onclick={closeMenu}>{l.label}</a>
			{/each}
		</nav>

		<div class="drawer-lang">
			<span class="lang-heading">{T('lang_label')}</span>
			<div class="lang-big">
				<LangSwitcher {lang} />
			</div>
		</div>
	</div>
</div>

<style>
	.site { display: flex; align-items: center; gap: 1rem; padding: 0.55rem 1.25rem;
		border-bottom: 1px solid var(--line); background: var(--bg); position: sticky; top: 0; z-index: 20; }
	.brand img { height: 24px; width: auto; display: block; }

	.nav-inline, .lang-inline { display: none; }

	.hamburger { margin-left: auto; width: 44px; height: 44px; display: inline-flex; align-items: center;
		justify-content: center; background: transparent; border: 1px solid var(--line); border-radius: 0.5rem;
		cursor: pointer; padding: 0; color: var(--text); }
	.hamburger:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
	.bars, .bars::before, .bars::after { display: block; width: 20px; height: 2px;
		background: currentColor; border-radius: 2px; position: relative; }
	.bars::before { content: ''; position: absolute; top: -6px; left: 0; }
	.bars::after { content: ''; position: absolute; top: 6px; left: 0; }

	.drawer-root { position: fixed; inset: 0; z-index: 40; visibility: hidden; pointer-events: none; }
	.drawer-root[data-open='true'] { visibility: visible; pointer-events: auto; }
	.backdrop { position: absolute; inset: 0; border: 0; padding: 0; margin: 0;
		background: rgba(27, 32, 36, 0.45); opacity: 0; cursor: pointer; transition: opacity 0.2s ease; }
	.drawer-root[data-open='true'] .backdrop { opacity: 1; }
	.drawer { position: absolute; top: 0; right: 0; height: 100%; width: min(85vw, 20rem);
		background: var(--surface); border-left: 1px solid var(--line); box-shadow: -8px 0 24px rgba(0,0,0,0.12);
		display: flex; flex-direction: column; padding: 0.75rem 1rem 1.5rem; transform: translateX(100%);
		transition: transform 0.25s ease; overflow-y: auto; -webkit-overflow-scrolling: touch; }
	.drawer-root[data-open='true'] .drawer { transform: translateX(0); }
	.drawer-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem;
		padding-bottom: 0.5rem; border-bottom: 1px solid var(--line); margin-bottom: 0.5rem; }
	.drawer-logo { height: 28px; width: auto; display: block; }
	.close { width: 44px; height: 44px; flex: none; display: inline-flex; align-items: center;
		justify-content: center; font-size: 1.6rem; line-height: 1; background: transparent;
		border: 1px solid var(--line); border-radius: 0.5rem; color: var(--text); cursor: pointer; }
	.close:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
	.nav-drawer { display: flex; flex-direction: column; gap: 0.15rem; }
	.nav-drawer a { display: flex; align-items: center; min-height: 48px; padding: 0 0.75rem;
		border-radius: 0.5rem; text-decoration: none; color: var(--text); font-size: 1.05rem; font-weight: 600; }
	.nav-drawer a:hover { background: var(--accent-soft); }
	.nav-drawer a.active { color: var(--primary); background: var(--accent-soft); }
	.nav-drawer a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
	.drawer-lang { margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--line); }
	.lang-heading { display: block; font-size: 0.8rem; font-weight: 700; text-transform: uppercase;
		letter-spacing: 0.04em; color: var(--muted); margin-bottom: 0.5rem; }
	.lang-big :global(.langs) { gap: 0.5rem; flex-wrap: wrap; }
	.lang-big :global(.langs a) { min-width: 44px; min-height: 44px; display: inline-flex; align-items: center;
		justify-content: center; font-size: 1rem; padding: 0 0.75rem; border: 1px solid var(--line); }

	@media (min-width: 760px) {
		.brand img { height: 28px; }
		.hamburger { display: none; }
		.drawer-root { display: none; }
		.nav-inline { display: flex; gap: 0.2rem; flex-wrap: wrap; flex: 1; }
		.nav-inline a { padding: 0.35rem 0.7rem; border-radius: 0.45rem; text-decoration: none;
			color: var(--muted); font-size: 0.9rem; font-weight: 600; }
		.nav-inline a:hover { color: var(--text); background: var(--accent-soft); }
		.nav-inline a.active { color: var(--primary); background: var(--accent-soft); }
		.lang-inline { display: block; }
	}
	@media (prefers-reduced-motion: reduce) { .drawer, .backdrop { transition: none; } }
	@media print { .site { display: none !important; } .drawer-root { display: none !important; } }
</style>
