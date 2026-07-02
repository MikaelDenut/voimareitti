// Pure saved-plans logic (Theme 3): add / remove / cap / parse for the saved workout + meal plans.
// No runes, no DOM, no localStorage - unit-testable in node. The reactive store + persistence live in
// saved.svelte.ts and wrap this. Each entry stores a name, a timestamp, and a serializable payload
// (a profile snapshot for workouts, a WeekPlan for meals) so the plan can be reopened later.

export interface SavedPlan<T = unknown> {
	id: string;
	name: string;
	savedAt: number; // epoch ms
	payload: T;
}

// Keep the list bounded so localStorage never blows the quota.
export const SAVED_CAP = 25;

let seq = 0;
function newId(savedAt: number): string {
	seq = (seq + 1) % 1e6;
	return 's' + savedAt.toString(36) + '-' + seq.toString(36);
}

/** Add an entry to the FRONT of the list (newest first), de-duped by id, capped. Pure. */
export function addSaved<T>(
	list: SavedPlan<T>[],
	entry: { name: string; payload: T; id?: string; savedAt?: number },
	cap = SAVED_CAP
): SavedPlan<T>[] {
	const savedAt = entry.savedAt ?? Date.now();
	const e: SavedPlan<T> = {
		id: entry.id ?? newId(savedAt),
		name: (entry.name ?? '').trim() || 'Untitled',
		savedAt,
		payload: entry.payload
	};
	return [e, ...list.filter((x) => x.id !== e.id)].slice(0, Math.max(0, cap));
}

/** Remove an entry by id. Pure. */
export function removeSaved<T>(list: SavedPlan<T>[], id: string): SavedPlan<T>[] {
	return list.filter((x) => x.id !== id);
}

/** Parse a raw localStorage string into a valid, defensively-typed list. Garbage -> []. */
export function parseSaved<T>(raw: string | null): SavedPlan<T>[] {
	if (!raw) return [];
	try {
		const v = JSON.parse(raw);
		if (!Array.isArray(v)) return [];
		return v.filter(
			(e): e is SavedPlan<T> =>
				!!e && typeof e === 'object' &&
				typeof (e as SavedPlan<T>).id === 'string' &&
				typeof (e as SavedPlan<T>).name === 'string' &&
				typeof (e as SavedPlan<T>).savedAt === 'number' &&
				'payload' in (e as object)
		);
	} catch {
		return [];
	}
}

/** Shape guard for a saved MEAL payload (2026-07 audit M3): a WeekPlan-looking object with a days array
 *  of meal arrays and a meta object. An old-schema or hand-corrupted payload used to throw inside the
 *  snapshot render and take down the whole recipes page until localStorage was cleared. Kept structural
 *  (not exhaustive) so future ADDITIVE WeekPlan fields never invalidate old saves. */
export function isValidWeekPlanPayload(p: unknown): boolean {
	if (!p || typeof p !== 'object') return false;
	const w = p as { days?: unknown; meta?: unknown };
	if (!Array.isArray(w.days) || w.days.length === 0) return false;
	if (!w.meta || typeof w.meta !== 'object') return false;
	return w.days.every((d) => !!d && typeof d === 'object' && Array.isArray((d as { meals?: unknown }).meals));
}
