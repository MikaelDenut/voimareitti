// Exercise ids that have an illustration at static/img/exercises/<id>.webp.
// Generated from the asset folder; keep in sync when art is added. The slug equals the exercise id.
export const exerciseImages = new Set<string>([
	'ab-wheel', 'adductor-machine', 'arnold-press', 'band-overhead-press', 'band-press', 'band-row',
	'barbell-back-squat', 'barbell-bench-press', 'barbell-bent-over-row', 'barbell-curl', 'barbell-deadlift',
	'barbell-hip-thrust', 'barbell-overhead-press', 'bench-dip', 'bird-dog', 'bodyweight-squat',
	'bulgarian-split-squat', 'cable-crossover', 'cable-crunch', 'cable-curl', 'cable-pull-through',
	'calf-raise', 'cat-cow', 'chair-squat', 'chest-dip', 'childs-pose', 'chin-up', 'close-grip-pushup',
	'copenhagen-plank', 'cossack-squat', 'crunch', 'db-bench-press', 'db-romanian-deadlift', 'db-shoulder-press',
	'dead-bug', 'deep-squat-hold', 'donkey-calf-raise', 'downward-dog', 'dumbbell-curl', 'dumbbell-fly',
	'dumbbell-lateral-raise', 'dumbbell-pullover', 'dumbbell-row', 'face-pull', 'farmer-carry', 'front-raise',
	'front-squat', 'glute-bridge', 'goblet-squat', 'good-morning', 'hack-squat', 'hammer-curl',
	'hanging-leg-raise', 'hip-abduction', 'hip-flexor-stretch', 'hollow-hold', 'incline-dumbbell-press',
	'incline-pushup', 'inverted-row', 'kettlebell-swing', 'lat-pulldown', 'lateral-band-walk', 'leg-extension',
	'leg-press', 'lying-leg-curl', 'lying-leg-raise', 'machine-chest-press', 'mountain-climber',
	'ninety-ninety-hip-switch', 'nordic-curl', 'overhead-triceps-extension', 'pallof-press', 'plank',
	'preacher-curl', 'pull-up', 'pushup', 'rear-delt-fly', 'reverse-curl', 'reverse-lunge', 'russian-twist',
	'seated-cable-row', 'seated-calf-raise', 'side-lying-leg-raise', 'side-plank', 'single-leg-rdl',
	'sissy-squat', 'skullcrusher', 'standing-calf-raise', 'step-up', 'straight-arm-pulldown', 'suitcase-carry',
	'sumo-deadlift', 'thoracic-rotation', 'thread-the-needle', 'triceps-pushdown', 'upright-row', 'wall-pushup',
	'wall-sit', 'world-greatest-stretch', 'wrist-curl',
	'ball-seated-march', 'ball-wall-squat', 'ball-glute-bridge', 'ball-stir-the-pot', 'ball-hamstring-curl', 'ball-thoracic-extension',
	'arm-circles', 'shoulder-rolls', 'hip-circles', 'torso-rotations', 'side-bends', 'standing-forward-bend',
	'marching-in-place', 'step-touch', 'ankle-circles', 'leg-swings', 'inchworm-walkout', 'low-impact-jacks',
	'outdoor-walk', 'treadmill-walk', 'walking-pad-walk', 'stationary-bike-warmup', 'rowing-warmup',
	'knee-pushup', 'elevated-pushup',
	'deep-supported-squat', 'birth-ball-hip-circles', 'birth-ball-rocking', 'birth-ball-pelvic-tilt', 'birth-ball-bounce',
	'standing-pelvic-tilt', 'hands-knees-pelvic-tilt', 'butterfly-tailor-sitting', 'side-lying-rest', 'pelvic-floor-kegel'
]);

export function exerciseImage(id: string): string | undefined {
	return exerciseImages.has(id) ? id : undefined;
}

// Slugs that have a <slug>.male.webp variant (all 100; literally the same slugs as exerciseImages).
// Defined explicitly so the helper stays honest if male coverage ever becomes partial.
export const maleImages = new Set<string>([
	'ab-wheel', 'adductor-machine', 'arnold-press', 'band-overhead-press', 'band-press', 'band-row',
	'barbell-back-squat', 'barbell-bench-press', 'barbell-bent-over-row', 'barbell-curl', 'barbell-deadlift',
	'barbell-hip-thrust', 'barbell-overhead-press', 'bench-dip', 'bird-dog', 'bodyweight-squat',
	'bulgarian-split-squat', 'cable-crossover', 'cable-crunch', 'cable-curl', 'cable-pull-through',
	'calf-raise', 'cat-cow', 'chair-squat', 'chest-dip', 'childs-pose', 'chin-up', 'close-grip-pushup',
	'copenhagen-plank', 'cossack-squat', 'crunch', 'db-bench-press', 'db-romanian-deadlift', 'db-shoulder-press',
	'dead-bug', 'deep-squat-hold', 'donkey-calf-raise', 'downward-dog', 'dumbbell-curl', 'dumbbell-fly',
	'dumbbell-lateral-raise', 'dumbbell-pullover', 'dumbbell-row', 'face-pull', 'farmer-carry', 'front-raise',
	'front-squat', 'glute-bridge', 'goblet-squat', 'good-morning', 'hack-squat', 'hammer-curl',
	'hanging-leg-raise', 'hip-abduction', 'hip-flexor-stretch', 'hollow-hold', 'incline-dumbbell-press',
	'incline-pushup', 'inverted-row', 'kettlebell-swing', 'lat-pulldown', 'lateral-band-walk', 'leg-extension',
	'leg-press', 'lying-leg-curl', 'lying-leg-raise', 'machine-chest-press', 'mountain-climber',
	'ninety-ninety-hip-switch', 'nordic-curl', 'overhead-triceps-extension', 'pallof-press', 'plank',
	'preacher-curl', 'pull-up', 'pushup', 'rear-delt-fly', 'reverse-curl', 'reverse-lunge', 'russian-twist',
	'seated-cable-row', 'seated-calf-raise', 'side-lying-leg-raise', 'side-plank', 'single-leg-rdl',
	'sissy-squat', 'skullcrusher', 'standing-calf-raise', 'step-up', 'straight-arm-pulldown', 'suitcase-carry',
	'sumo-deadlift', 'thoracic-rotation', 'thread-the-needle', 'triceps-pushdown', 'upright-row', 'wall-pushup',
	'wall-sit', 'world-greatest-stretch', 'wrist-curl',
	'ball-seated-march', 'ball-wall-squat', 'ball-glute-bridge', 'ball-stir-the-pot', 'ball-hamstring-curl', 'ball-thoracic-extension',
	'arm-circles', 'shoulder-rolls', 'hip-circles', 'torso-rotations', 'side-bends', 'standing-forward-bend',
	'marching-in-place', 'step-touch', 'ankle-circles', 'leg-swings', 'inchworm-walkout', 'low-impact-jacks',
	'outdoor-walk', 'treadmill-walk', 'walking-pad-walk', 'stationary-bike-warmup', 'rowing-warmup',
	'knee-pushup', 'elevated-pushup',
	'deep-supported-squat', 'birth-ball-hip-circles', 'birth-ball-rocking', 'birth-ball-pelvic-tilt', 'birth-ball-bounce',
	'standing-pelvic-tilt', 'hands-knees-pelvic-tilt', 'butterfly-tailor-sitting', 'side-lying-rest', 'pelvic-floor-kegel'
]);

// Slugs that have a <slug>.prenatal.webp variant (24; from temp/maps/variant_manifest.json "prenatal").
export const prenatalImages = new Set<string>([
	'band-row', 'bird-dog', 'bodyweight-squat', 'cat-cow', 'chair-squat', 'childs-pose', 'deep-squat-hold',
	'downward-dog', 'dumbbell-curl', 'dumbbell-lateral-raise', 'dumbbell-row', 'hip-flexor-stretch',
	'incline-pushup', 'pallof-press', 'reverse-lunge', 'side-lying-leg-raise', 'side-plank', 'standing-calf-raise',
	'step-up', 'suitcase-carry', 'thoracic-rotation', 'wall-pushup', 'wall-sit', 'world-greatest-stretch',
	'ball-seated-march', 'ball-wall-squat', 'ball-thoracic-extension',
	'arm-circles', 'shoulder-rolls', 'hip-circles', 'torso-rotations', 'side-bends', 'standing-forward-bend',
	'marching-in-place', 'step-touch', 'ankle-circles', 'leg-swings',
	'outdoor-walk', 'treadmill-walk', 'walking-pad-walk', 'stationary-bike-warmup', 'elevated-pushup',
	'deep-supported-squat', 'birth-ball-hip-circles', 'birth-ball-rocking', 'birth-ball-pelvic-tilt', 'birth-ball-bounce',
	'standing-pelvic-tilt', 'hands-knees-pelvic-tilt', 'butterfly-tailor-sitting', 'side-lying-rest', 'pelvic-floor-kegel'
]);

export type FigureSex = 'male' | 'female' | 'unspecified';

// Best available image PATH for a slug given the user context, or undefined if there is no general image.
// Precedence: prenatal > male > general. Missing variant falls back silently to the general image.
export function exerciseImageSrc(
	id: string,
	ctx: { prenatal?: boolean; sex?: FigureSex } = {}
): string | undefined {
	if (!exerciseImages.has(id)) return undefined;
	if (ctx.prenatal && prenatalImages.has(id)) return `/img/exercises/${id}.prenatal.webp`;
	if (ctx.sex === 'male' && maleImages.has(id)) return `/img/exercises/${id}.male.webp`;
	return `/img/exercises/${id}.webp`;
}
