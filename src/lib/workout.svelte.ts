// In-memory current working WORKOUT plan (2026-07 parity audit H2) - the exact mirror of plan.svelte.ts
// on the nutrition side. The generated program (including manual swaps / removes / adds) survives in-app
// navigation and a "Back" to the landing; it is NOT persisted - a full reload falls back to the page's
// vr-generated deterministic re-run, and the ONLY durable store stays the explicit Save (saveWorkout).
// Before this, the workout Back destroyed every manual edit while the nutrition Back kept them - the same
// visual affordance with opposite consequences.
import type { Plan, Profile } from './engine/engine';

export const currentWorkout = $state<{ plan: Plan | null; used: Profile | null }>({ plan: null, used: null });
