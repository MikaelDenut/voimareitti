import { describe, it, expect } from 'vitest';
import { addSaved, removeSaved, parseSaved, SAVED_CAP, type SavedPlan } from './saved-core';

describe('saved-core', () => {
	it('adds entries newest-first with a generated id', () => {
		let list: SavedPlan<number>[] = [];
		list = addSaved(list, { name: 'A', payload: 1, savedAt: 100 });
		list = addSaved(list, { name: 'B', payload: 2, savedAt: 200 });
		expect(list.map((e) => e.name)).toEqual(['B', 'A']);
		expect(list[0].id).not.toBe(list[1].id);
	});

	it('blank name falls back to Untitled', () => {
		const list = addSaved([], { name: '   ', payload: 1 });
		expect(list[0].name).toBe('Untitled');
	});

	it('caps the list at SAVED_CAP, dropping the oldest', () => {
		let list: SavedPlan<number>[] = [];
		for (let i = 0; i < SAVED_CAP + 5; i++) list = addSaved(list, { name: 'n' + i, payload: i, savedAt: i });
		expect(list.length).toBe(SAVED_CAP);
		expect(list[0].name).toBe('n' + (SAVED_CAP + 4)); // newest kept
	});

	it('re-adding the same id replaces, not duplicates', () => {
		let list = addSaved([], { name: 'A', payload: 1, id: 'x', savedAt: 1 });
		list = addSaved(list, { name: 'A2', payload: 9, id: 'x', savedAt: 2 });
		expect(list.length).toBe(1);
		expect(list[0].name).toBe('A2');
		expect(list[0].payload).toBe(9);
	});

	it('removes by id', () => {
		const list = addSaved(addSaved([], { name: 'A', payload: 1, id: 'a' }), { name: 'B', payload: 2, id: 'b' });
		expect(removeSaved(list, 'a').map((e) => e.id)).toEqual(['b']);
		expect(removeSaved(list, 'missing').length).toBe(2);
	});

	it('parseSaved rejects garbage and keeps valid entries', () => {
		expect(parseSaved(null)).toEqual([]);
		expect(parseSaved('{not json')).toEqual([]);
		expect(parseSaved('42')).toEqual([]);
		const good = JSON.stringify([
			{ id: 'a', name: 'A', savedAt: 1, payload: { x: 1 } },
			{ id: 'b', name: 'B' }, // missing fields -> dropped
			'junk'
		]);
		const parsed = parseSaved<{ x: number }>(good);
		expect(parsed.length).toBe(1);
		expect(parsed[0].id).toBe('a');
	});

	it('round-trips through JSON', () => {
		const list = addSaved([], { name: 'Plan', payload: { a: [1, 2, 3] }, id: 'k', savedAt: 5 });
		expect(parseSaved(JSON.stringify(list))).toEqual(list);
	});
});
