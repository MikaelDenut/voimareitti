import { describe, it, expect } from 'vitest';
import { generate } from './engine';
import { defaultProfile } from '../profile-core';

// D4 (audit planning/53/54): a bodyweight/chair user has ZERO reachable pull moves, so a PPL "Pull" day
// used to come back COMPLETELY EMPTY. The fix back-fills an empty slot with the closest available
// alternative pattern so no session is ever left blank, while still flagging pullGap so the "add a
// band/table to train your back" tip shows. Equipped profiles must be byte-for-byte unchanged.

function bw(over: Partial<ReturnType<typeof defaultProfile>> = {}) {
	return { ...defaultProfile(), equipment: [], location: 'home', ...over } as ReturnType<typeof defaultProfile>;
}

describe('empty-slot fallback fill (D4)', () => {
	it('never produces an empty strength session for bodyweight users across days/minutes/goals', () => {
		for (const goal of ['strength', 'hypertrophy', 'fat-loss', 'general'] as const) {
			for (const days of [1, 3, 5, 7]) {
				for (const minutes of [10, 30, 60]) {
					for (const equipment of [[], ['chair']]) {
						const p = bw({ trainingGoal: goal, days, minutes, equipment });
						const plan = generate(p as any, 0);
						for (const s of plan.sessions) {
							expect(s.items.length, `${goal}/d${days}/m${minutes}/eq${equipment.join('+')} ${s.titleKey} d${s.day}`).toBeGreaterThan(0);
						}
					}
				}
			}
		}
	});

	it('still flags pullGap for a bodyweight PPL user (so the add-a-band tip surfaces)', () => {
		const plan = generate(bw({ days: 5, minutes: 45 }) as any, 0);
		expect(plan.resolvedSplit).toBe('ppl');
		expect(plan.pullGap).toBe(true);
	});

	it('fallback fill is deterministic (same profile+seed -> identical exercise ids)', () => {
		const p = bw({ days: 5, minutes: 45 });
		const a = generate(p as any, 0).sessions.flatMap((s) => s.items.map((i) => i.exercise.id));
		const b = generate(p as any, 0).sessions.flatMap((s) => s.items.map((i) => i.exercise.id));
		expect(a).toEqual(b);
	});

	it('does NOT fire for an equipped user: a gym PPL Pull day still contains real pull moves', () => {
		const p = { ...defaultProfile(), location: 'gym', equipment: [], days: 6, minutes: 60 };
		const plan = generate(p as any, 0);
		expect(plan.pullGap).toBe(false);
		const pullDays = plan.sessions.filter((s) => s.titleKey === 'pull');
		expect(pullDays.length).toBeGreaterThan(0);
		for (const s of pullDays) {
			expect(s.items.some((i) => i.exercise.pattern === 'pull-h' || i.exercise.pattern === 'pull-v'),
				`gym pull day ${s.day} should contain a pull move`).toBe(true);
		}
	});
});
