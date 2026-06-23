// Shared profile store (planning section 6) - the ONE source of truth for the user's profile across the
// whole app: Workout/Generate, Exercises, Nutrition, Recipes. Svelte 5 runes need the .svelte.ts
// extension; callers import from '$lib/profile'. Pure logic + types live in ./profile-core (unit-tested);
// this file only adds the reactive store + guarded, SSR-safe localStorage persistence. Never sends data
// anywhere. localStorage key is REUSED from the legacy workout form so old saves migrate seamlessly
// (CLAUDE.md: do not rename localStorage keys).

import { browser } from '$app/environment';
import { defaultProfile, parseStored, type FullProfile } from './profile-core';

export * from './profile-core';

const KEY = 'vr-profile';

function load(): FullProfile {
	if (!browser) return defaultProfile();
	try { return parseStored(localStorage.getItem(KEY)); } catch { return defaultProfile(); }
}

// --- the shared reactive store ----------------------------------------------

export const profile = $state<FullProfile>(load());

/** Patch fields on the shared profile (reactive; auto-persists in the browser). */
export function updateProfile(patch: Partial<FullProfile>): void {
	Object.assign(profile, patch);
}

/** Reset the shared profile to defaults. */
export function resetProfile(): void {
	Object.assign(profile, defaultProfile());
}

/** Force-write the current profile to localStorage (normally automatic). */
export function persistProfile(): void {
	if (!browser) return;
	try { localStorage.setItem(KEY, JSON.stringify(profile)); } catch { /* private mode / quota */ }
}

// Auto-persist on any change, browser only. $effect.root gives a persistent effect scope at module level.
if (browser) {
	$effect.root(() => {
		$effect(() => {
			const snap = JSON.stringify(profile); // reads every field -> tracks all of them
			try { localStorage.setItem(KEY, snap); } catch { /* private mode / quota */ }
		});
	});
}
