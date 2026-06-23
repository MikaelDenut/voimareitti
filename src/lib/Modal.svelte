<script lang="ts">
	// Accessible modal dialog (planning section 4). role="dialog" aria-modal, Escape to close, backdrop
	// click to close, focus trap, returns focus to the opener, reduced-motion safe. SSR-safe (renders
	// nothing when closed; focus logic is client-only via $effect). Content is passed as a snippet.

	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		title = '',
		closeLabel = 'Close',
		onclose,
		children
	}: {
		open?: boolean;
		title?: string;
		closeLabel?: string;
		onclose?: () => void;
		children: Snippet;
	} = $props();

	const titleId = 'modal-title-' + Math.random().toString(36).slice(2, 8);
	let dialogEl = $state<HTMLDivElement | null>(null);
	let opener: HTMLElement | null = null;

	function close() {
		open = false;
		onclose?.();
	}

	function focusables(): HTMLElement[] {
		if (!dialogEl) return [];
		return Array.from(
			dialogEl.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
			)
		);
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.stopPropagation();
			close();
			return;
		}
		if (e.key === 'Tab') {
			const f = focusables();
			if (f.length === 0) {
				e.preventDefault();
				return;
			}
			const first = f[0];
			const last = f[f.length - 1];
			const active = document.activeElement as HTMLElement | null;
			if (e.shiftKey && active === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && active === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}

	// Manage focus when the dialog opens / closes.
	$effect(() => {
		if (open) {
			opener = (document.activeElement as HTMLElement) ?? null;
			// focus the first focusable (or the dialog itself) once mounted
			queueMicrotask(() => {
				const f = focusables();
				(f[0] ?? dialogEl)?.focus();
			});
		} else if (opener) {
			opener.focus();
			opener = null;
		}
	});
</script>

{#if open}
	<button type="button" class="modal-backdrop" tabindex="-1" aria-hidden="true" onclick={close}></button>
	<div
		class="modal"
		bind:this={dialogEl}
		role="dialog"
		aria-modal="true"
		aria-labelledby={title ? titleId : undefined}
		tabindex="-1"
		onkeydown={onkeydown}
	>
		<div class="modal-head">
			{#if title}<h2 id={titleId} class="modal-title">{title}</h2>{/if}
			<button type="button" class="modal-close" onclick={close} aria-label={closeLabel}>×</button>
		</div>
		<div class="modal-body">
			{@render children()}
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		border: none;
		padding: 0;
		background: rgba(20, 24, 28, 0.45);
		cursor: pointer;
		z-index: 1000;
	}
	.modal {
		position: fixed;
		z-index: 1001;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: min(92vw, 560px);
		max-height: 88vh;
		overflow: auto;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
		padding: 1rem 1.25rem 1.25rem;
	}
	.modal-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}
	.modal-title {
		margin: 0;
		font-size: 1.15rem;
	}
	.modal-close {
		min-width: 44px;
		min-height: 44px;
		flex: none;
		background: none;
		border: none;
		font-size: 1.6rem;
		line-height: 1;
		color: var(--text);
		cursor: pointer;
		border-radius: var(--radius);
	}
	.modal-close:hover {
		background: var(--bg);
	}
	@media (prefers-reduced-motion: no-preference) {
		.modal {
			animation: modal-in 0.15s ease;
		}
	}
	@keyframes modal-in {
		from {
			opacity: 0;
			transform: translate(-50%, -48%);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -50%);
		}
	}
</style>
