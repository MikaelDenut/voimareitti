// Optional owner details for the printable guide (name / phone / email). Device-only, stored under the
// legacy `vr-owner` key, kept OUT of the deterministic profile. Shared so the About-you section of the
// profile box can edit it and both PDFs (PrintGuide + MealPrint) can print it. Never sent anywhere.

import { browser } from '$app/environment';

export interface Owner { name: string; phone: string; email: string; }
const KEY = 'vr-owner';
const empty = (): Owner => ({ name: '', phone: '', email: '' });

function load(): Owner {
	if (!browser) return empty();
	try {
		const v = JSON.parse(localStorage.getItem(KEY) || 'null');
		return v && typeof v === 'object'
			? { name: String(v.name ?? ''), phone: String(v.phone ?? ''), email: String(v.email ?? '') }
			: empty();
	} catch { return empty(); }
}

export const owner = $state<Owner>(load());

if (browser) {
	$effect.root(() => {
		$effect(() => {
			const snap = JSON.stringify(owner);
			try { localStorage.setItem(KEY, snap); } catch { /* private mode / quota */ }
		});
	});
}
