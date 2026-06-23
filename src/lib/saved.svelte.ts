// Saved-plans reactive store (Theme 3). Wraps the pure saved-core logic with Svelte 5 runes + guarded,
// SSR-safe localStorage persistence. Two keys: workout plans (profile snapshots) and meal plans
// (WeekPlan). Never sends data anywhere. callers import from '$lib/saved.svelte'.

import { browser } from '$app/environment';
import { addSaved, removeSaved, parseSaved, type SavedPlan } from './saved-core';
import type { WeekPlan } from './engine/meal-planner';
import type { Plan, Profile } from './engine/engine';
import type { FullProfile } from './profile-core';

export * from './saved-core';

// A saved workout now stores the generated PLAN snapshot (so manual swaps/removes/adds survive) plus the
// profile it was built from (for "Use as my plan" + the snapshot's body/energy context). Older entries
// stored only a bare profile; the union + the `'plan' in payload` guard handle that migration.
export interface SavedWorkout { plan: Plan; used: Profile }
export type WorkoutPayload = SavedWorkout | FullProfile;
export function isWorkoutSnapshot(p: WorkoutPayload): p is SavedWorkout {
	return !!p && typeof p === 'object' && 'plan' in p && 'used' in p;
}

const KEY_WORKOUTS = 'voimareitti.saved.workouts';
const KEY_MEALS = 'voimareitti.saved.meals';

function load<T>(key: string): SavedPlan<T>[] {
	if (!browser) return [];
	try { return parseSaved<T>(localStorage.getItem(key)); } catch { return []; }
}

// One shared reactive object so the exported helpers can reassign the lists (you cannot reassign a bare
// exported `let`, but mutating a $state object's properties is reactive).
export const saved = $state<{ workouts: SavedPlan<WorkoutPayload>[]; meals: SavedPlan<WeekPlan>[] }>({
	workouts: load<WorkoutPayload>(KEY_WORKOUTS),
	meals: load<WeekPlan>(KEY_MEALS)
});

function persist(): void {
	if (!browser) return;
	try {
		localStorage.setItem(KEY_WORKOUTS, JSON.stringify(saved.workouts));
		localStorage.setItem(KEY_MEALS, JSON.stringify(saved.meals));
	} catch { /* private mode / quota */ }
}

export function saveWorkout(name: string, payload: SavedWorkout): void {
	saved.workouts = addSaved(saved.workouts, { name, payload });
	persist();
}
export function deleteWorkout(id: string): void {
	saved.workouts = removeSaved(saved.workouts, id);
	persist();
}
export function saveMeal(name: string, week: WeekPlan): void {
	saved.meals = addSaved(saved.meals, { name, payload: week });
	persist();
}
export function deleteMeal(id: string): void {
	saved.meals = removeSaved(saved.meals, id);
	persist();
}
