// Structured per-exercise profiles - part A: the core library (data.ts) + the upper-body
// extension module (more-exercises-upper.ts). Suitability fields are set ONLY where there is
// a real, defensible reason; an omitted field means "suitable for all" (Mikael's explicit steer).
import type { ExerciseProfile } from './profiles';

export const profilesA: Record<string, ExerciseProfile> = {
	// ============================================================
	// CORE LIBRARY (data.ts) - 24 exercises
	// ============================================================

	// ---------- LEGS / GLUTES (squat + hinge + lunge) ----------
	'bodyweight-squat': {
		bodyPart: 'Legs', secondary: ['Quads', 'Glutes', 'Hamstrings', 'Core'], effectiveness: 4,
		purposes: ['strength', 'endurance', 'general'], equipment: ['None'], level: 'beginner',
		recommended: { en: '3 sets x 10-20 reps, rest 45-60 s', fi: '3 sarjaa x 10-20 toistoa, lepo 45-60 s', hu: '3 sorozat x 10-20 ismétlés, pihenő 45-60 mp', sv: '3 set x 10-20 repetitioner, vila 45-60 s' }
	},
	'chair-squat': {
		bodyPart: 'Legs', secondary: ['Quads', 'Glutes'], effectiveness: 3,
		purposes: ['rehab', 'endurance', 'general'], equipment: ['Chair'], level: 'beginner',
		recommended: { en: '2-3 sets x 8-15 reps, rest 45-60 s', fi: '2-3 sarjaa x 8-15 toistoa, lepo 45-60 s', hu: '2-3 sorozat x 8-15 ismétlés, pihenő 45-60 mp', sv: '2-3 set x 8-15 repetitioner, vila 45-60 s' }
	},
	'goblet-squat': {
		bodyPart: 'Legs', secondary: ['Quads', 'Glutes', 'Core', 'Adductors'], effectiveness: 5,
		purposes: ['strength', 'hypertrophy', 'general'], equipment: ['Dumbbell', 'Kettlebell'], level: 'beginner',
		recommended: { en: '3-4 sets x 8-12 reps, rest 60-90 s', fi: '3-4 sarjaa x 8-12 toistoa, lepo 60-90 s', hu: '3-4 sorozat x 8-12 ismétlés, pihenő 60-90 mp', sv: '3-4 set x 8-12 repetitioner, vila 60-90 s' }
	},
	'glute-bridge': {
		position: 'supine',
		bodyPart: 'Glutes', secondary: ['Hamstrings', 'Core', 'Lower back'], effectiveness: 3,
		purposes: ['rehab', 'endurance', 'posture'], equipment: ['None'], level: 'beginner',
		recommended: { en: '2-3 sets x 12-20 reps, rest 45-60 s', fi: '2-3 sarjaa x 12-20 toistoa, lepo 45-60 s', hu: '2-3 sorozat x 12-20 ismétlés, pihenő 45-60 mp', sv: '2-3 set x 12-20 repetitioner, vila 45-60 s' }
	},
	'db-romanian-deadlift': {
		bodyPart: 'Legs', secondary: ['Hamstrings', 'Glutes', 'Lower back', 'Forearms'], effectiveness: 5,
		purposes: ['strength', 'hypertrophy'], equipment: ['Dumbbells'], level: 'intermediate',
		recommended: { en: '3-4 sets x 8-12 reps, rest 90-120 s', fi: '3-4 sarjaa x 8-12 toistoa, lepo 90-120 s', hu: '3-4 sorozat x 8-12 ismétlés, pihenő 90-120 mp', sv: '3-4 set x 8-12 repetitioner, vila 90-120 s' },
		note: { en: 'Hinge from the hips with a flat back; round-back lifting risks the lower back.', fi: 'Taivuta lantiosta selkä suorana; pyöreällä selällä nostaminen rasittaa alaselkää.', hu: 'Hajolj csípőből, egyenes háttal; a háthajlítva történő emelés terheli a derekat.', sv: 'Fäll från höfterna med rak rygg; lyft med rundad rygg belastar ryggslutet.' }
	},
	'reverse-lunge': {
		balanceDemand: 'medium',
		bodyPart: 'Legs', secondary: ['Quads', 'Glutes', 'Hamstrings', 'Core'], effectiveness: 4,
		purposes: ['strength', 'general', 'endurance'], equipment: ['None'], level: 'beginner',
		recommended: { en: '3 sets x 8-12 reps per leg, rest 60-90 s', fi: '3 sarjaa x 8-12 toistoa per jalka, lepo 60-90 s', hu: '3 sorozat x 8-12 ismétlés lábanként, pihenő 60-90 mp', sv: '3 set x 8-12 repetitioner per ben, vila 60-90 s' }
	},
	'bulgarian-split-squat': {
		balanceDemand: 'high',
		bodyPart: 'Legs', secondary: ['Quads', 'Glutes', 'Hamstrings', 'Adductors'], effectiveness: 5,
		purposes: ['strength', 'hypertrophy'], equipment: ['Chair', 'Bench'], equipmentAny: [['chair', 'bench']], level: 'intermediate',
		recommended: { en: '3-4 sets x 8-12 reps per leg, rest 60-90 s', fi: '3-4 sarjaa x 8-12 toistoa per jalka, lepo 60-90 s', hu: '3-4 sorozat x 8-12 ismétlés lábanként, pihenő 60-90 mp', sv: '3-4 set x 8-12 repetitioner per ben, vila 60-90 s' },
		note: { en: 'Demands single-leg balance; hold a support at first if needed.', fi: 'Vaatii yhden jalan tasapainoa; pidä tarvittaessa tuesta aluksi kiinni.', hu: 'Egylábas egyensúlyt kíván; eleinte szükség esetén fogódzkodj meg egy támasztékban.', sv: 'Kräver balans på ett ben; håll i ett stöd till en början om det behövs.' }
	},
	'calf-raise': {
		bodyPart: 'Calves', secondary: ['Calves'], effectiveness: 3,
		purposes: ['hypertrophy', 'endurance', 'general'], equipment: ['None'], level: 'beginner',
		recommended: { en: '3-4 sets x 12-20 reps, rest 45-60 s', fi: '3-4 sarjaa x 12-20 toistoa, lepo 45-60 s', hu: '3-4 sorozat x 12-20 ismétlés, pihenő 45-60 mp', sv: '3-4 set x 12-20 repetitioner, vila 45-60 s' }
	},

	// ---------- CHEST / PUSH (horizontal) ----------
	'wall-pushup': {
		bodyPart: 'Chest', secondary: ['Triceps', 'Front delts', 'Core'], effectiveness: 2,
		purposes: ['rehab', 'endurance', 'general'], equipment: ['Wall'], level: 'beginner',
		recommended: { en: '2-3 sets x 10-20 reps, rest 45-60 s', fi: '2-3 sarjaa x 10-20 toistoa, lepo 45-60 s', hu: '2-3 sorozat x 10-20 ismétlés, pihenő 45-60 mp', sv: '2-3 set x 10-20 repetitioner, vila 45-60 s' }
	},
	'pushup': {
		position: 'prone',
		bodyPart: 'Chest', secondary: ['Triceps', 'Front delts', 'Core'], effectiveness: 4,
		purposes: ['strength', 'hypertrophy', 'endurance'], equipment: ['None'], level: 'intermediate',
		recommended: { en: '3-4 sets x 8-15 reps, rest 60-90 s', fi: '3-4 sarjaa x 8-15 toistoa, lepo 60-90 s', hu: '3-4 sorozat x 8-15 ismétlés, pihenő 60-90 mp', sv: '3-4 set x 8-15 repetitioner, vila 60-90 s' }
	},
	'band-press': {
		bodyPart: 'Chest', secondary: ['Triceps', 'Front delts'], effectiveness: 3,
		purposes: ['hypertrophy', 'endurance', 'general'], equipment: ['Resistance band'], level: 'beginner',
		recommended: { en: '3 sets x 10-15 reps, rest 60-90 s', fi: '3 sarjaa x 10-15 toistoa, lepo 60-90 s', hu: '3 sorozat x 10-15 ismétlés, pihenő 60-90 mp', sv: '3 set x 10-15 repetitioner, vila 60-90 s' }
	},
	'db-bench-press': {
		bodyPart: 'Chest', secondary: ['Triceps', 'Front delts'], effectiveness: 5,
		purposes: ['hypertrophy', 'strength'], equipment: ['Dumbbells', 'Bench'], level: 'intermediate',
		recommended: { en: '3-4 sets x 6-12 reps, rest 90-120 s', fi: '3-4 sarjaa x 6-12 toistoa, lepo 90-120 s', hu: '3-4 sorozat x 6-12 ismétlés, pihenő 90-120 mp', sv: '3-4 set x 6-12 repetitioner, vila 90-120 s' }
	},

	// ---------- SHOULDERS / PUSH (vertical) ----------
	'band-overhead-press': {
		bodyPart: 'Shoulders', secondary: ['Front delts', 'Triceps', 'Side delts'], effectiveness: 3,
		purposes: ['hypertrophy', 'endurance', 'general'], equipment: ['Resistance band'], level: 'beginner',
		recommended: { en: '3 sets x 10-15 reps, rest 60-90 s', fi: '3 sarjaa x 10-15 toistoa, lepo 60-90 s', hu: '3 sorozat x 10-15 ismétlés, pihenő 60-90 mp', sv: '3 set x 10-15 repetitioner, vila 60-90 s' }
	},
	'db-shoulder-press': {
		bodyPart: 'Shoulders', secondary: ['Front delts', 'Triceps', 'Side delts'], effectiveness: 5,
		purposes: ['strength', 'hypertrophy'], equipment: ['Dumbbells'], level: 'intermediate',
		recommended: { en: '3-4 sets x 6-12 reps, rest 90-120 s', fi: '3-4 sarjaa x 6-12 toistoa, lepo 90-120 s', hu: '3-4 sorozat x 6-12 ismétlés, pihenő 90-120 mp', sv: '3-4 set x 6-12 repetitioner, vila 90-120 s' }
	},

	// ---------- BACK / PULL ----------
	'inverted-row': {
		bodyPart: 'Back', secondary: ['Lats', 'Biceps', 'Rhomboids', 'Rear delts'], effectiveness: 4,
		purposes: ['strength', 'hypertrophy', 'posture'], equipment: ['Table'], level: 'beginner',
		recommended: { en: '3 sets x 8-15 reps, rest 60-90 s', fi: '3 sarjaa x 8-15 toistoa, lepo 60-90 s', hu: '3 sorozat x 8-15 ismétlés, pihenő 60-90 mp', sv: '3 set x 8-15 repetitioner, vila 60-90 s' }
	},
	'band-row': {
		bodyPart: 'Back', secondary: ['Lats', 'Biceps', 'Rhomboids', 'Rear delts'], effectiveness: 3,
		purposes: ['hypertrophy', 'endurance', 'posture'], equipment: ['Resistance band'], level: 'beginner',
		recommended: { en: '3 sets x 10-15 reps, rest 60-90 s', fi: '3 sarjaa x 10-15 toistoa, lepo 60-90 s', hu: '3 sorozat x 10-15 ismétlés, pihenő 60-90 mp', sv: '3 set x 10-15 repetitioner, vila 60-90 s' }
	},
	'dumbbell-row': {
		bodyPart: 'Back', secondary: ['Lats', 'Biceps', 'Rhomboids', 'Rear delts'], effectiveness: 5,
		purposes: ['strength', 'hypertrophy'], equipment: ['Dumbbell', 'Bench', 'Chair'], equipmentAny: [['single-weight'], ['bench', 'chair']], level: 'beginner',
		recommended: { en: '3-4 sets x 8-12 reps per arm, rest 60-90 s', fi: '3-4 sarjaa x 8-12 toistoa per käsi, lepo 60-90 s', hu: '3-4 sorozat x 8-12 ismétlés karonként, pihenő 60-90 mp', sv: '3-4 set x 8-12 repetitioner per arm, vila 60-90 s' }
	},

	// ---------- ARMS ----------
	'dumbbell-curl': {
		bodyPart: 'Arms', secondary: ['Biceps', 'Forearms'], effectiveness: 4,
		purposes: ['hypertrophy', 'general'], equipment: ['Dumbbells'], level: 'beginner',
		recommended: { en: '3 sets x 8-15 reps, rest 60-90 s', fi: '3 sarjaa x 8-15 toistoa, lepo 60-90 s', hu: '3 sorozat x 8-15 ismétlés, pihenő 60-90 mp', sv: '3 set x 8-15 repetitioner, vila 60-90 s' }
	},

	// ---------- CORE ----------
	'plank': {
		position: 'prone',
		bodyPart: 'Core', secondary: ['Abs', 'Obliques', 'Lower back', 'Shoulders'], effectiveness: 3,
		purposes: ['endurance', 'posture', 'general'], equipment: ['None'], level: 'beginner',
		recommended: { en: '3 sets x 20-60 s hold, rest 45-60 s', fi: '3 sarjaa x 20-60 s pito, lepo 45-60 s', hu: '3 sorozat x 20-60 mp tartás, pihenő 45-60 mp', sv: '3 set x 20-60 s håll, vila 45-60 s' }
	},
	'bird-dog': {
		bodyPart: 'Core', secondary: ['Lower back', 'Glutes', 'Spine', 'Shoulders'], effectiveness: 3,
		purposes: ['rehab', 'posture', 'general'], equipment: ['None'], level: 'beginner',
		recommended: { en: '2-3 sets x 8-12 reps per side, rest 30-45 s', fi: '2-3 sarjaa x 8-12 toistoa per puoli, lepo 30-45 s', hu: '2-3 sorozat x 8-12 ismétlés oldalanként, pihenő 30-45 mp', sv: '2-3 set x 8-12 repetitioner per sida, vila 30-45 s' }
	},

	// ---------- MOBILITY ----------
	'cat-cow': {
		bodyPart: 'Mobility', secondary: ['Spine', 'Core', 'Lower back'], effectiveness: 3,
		purposes: ['mobility', 'rehab', 'posture'], equipment: ['None'], level: 'beginner',
		recommended: { en: '1-2 sets x 8-12 slow cycles', fi: '1-2 sarjaa x 8-12 hidasta kiertoa', hu: '1-2 sorozat x 8-12 lassú ciklus', sv: '1-2 set x 8-12 långsamma cykler' }
	},
	'hip-flexor-stretch': {
		bodyPart: 'Mobility', secondary: ['Hips', 'Quads'], effectiveness: 3,
		purposes: ['mobility', 'posture', 'rehab'], equipment: ['None'], level: 'beginner',
		recommended: { en: '2-3 holds x 20-40 s per side', fi: '2-3 pitoa x 20-40 s per puoli', hu: '2-3 tartás x 20-40 mp oldalanként', sv: '2-3 håll x 20-40 s per sida' }
	},
	'world-greatest-stretch': {
		bodyPart: 'Mobility', secondary: ['Hips', 'Spine', 'Shoulders', 'Hamstrings'], effectiveness: 4,
		purposes: ['mobility', 'general'], equipment: ['None'], level: 'beginner',
		recommended: { en: '1-2 sets x 4-6 reps per side', fi: '1-2 sarjaa x 4-6 toistoa per puoli', hu: '1-2 sorozat x 4-6 ismétlés oldalanként', sv: '1-2 set x 4-6 repetitioner per sida' }
	},
	'thoracic-rotation': {
		bodyPart: 'Mobility', secondary: ['Spine', 'Shoulders', 'Back'], effectiveness: 3,
		purposes: ['mobility', 'posture'], equipment: ['None'], level: 'beginner',
		recommended: { en: '1-2 sets x 8-10 reps per side', fi: '1-2 sarjaa x 8-10 toistoa per puoli', hu: '1-2 sorozat x 8-10 ismétlés oldalanként', sv: '1-2 set x 8-10 repetitioner per sida' }
	},

	// ============================================================
	// UPPER-BODY EXTENSION (more-exercises-upper.ts) - 32 exercises
	// ============================================================

	// ---------- CHEST ----------
	'barbell-bench-press': {
		bodyPart: 'Chest', secondary: ['Triceps', 'Front delts'], effectiveness: 5,
		purposes: ['strength', 'hypertrophy'], equipment: ['Barbell', 'Bench', 'Rack'], level: 'intermediate',
		recommended: { en: '3-5 sets x 5-10 reps, rest 120-180 s', fi: '3-5 sarjaa x 5-10 toistoa, lepo 120-180 s', hu: '3-5 sorozat x 5-10 ismétlés, pihenő 120-180 mp', sv: '3-5 set x 5-10 repetitioner, vila 120-180 s' },
		note: { en: 'Use a rack or spotter; never train heavy to failure alone.', fi: 'Käytä telinettä tai avustajaa; älä treenaa raskaasti uupumukseen yksin.', hu: 'Használj állványt vagy segítőt; soha ne edzz nehéz súllyal kifáradásig egyedül.', sv: 'Använd ställning eller passare; träna aldrig tungt till utmattning ensam.' }
	},
	'incline-dumbbell-press': {
		bodyPart: 'Chest', secondary: ['Front delts', 'Triceps'], effectiveness: 4,
		purposes: ['hypertrophy', 'strength'], equipment: ['Dumbbells', 'Bench'], level: 'beginner',
		recommended: { en: '3-4 sets x 8-12 reps, rest 90-120 s', fi: '3-4 sarjaa x 8-12 toistoa, lepo 90-120 s', hu: '3-4 sorozat x 8-12 ismétlés, pihenő 90-120 mp', sv: '3-4 set x 8-12 repetitioner, vila 90-120 s' }
	},
	'incline-pushup': {
		bodyPart: 'Chest', secondary: ['Triceps', 'Front delts', 'Core'], effectiveness: 3,
		purposes: ['endurance', 'rehab', 'general'], equipment: ['Table', 'Bench'], equipmentAny: [['table', 'bench', 'chair']], level: 'beginner',
		recommended: { en: '2-3 sets x 10-20 reps, rest 45-60 s', fi: '2-3 sarjaa x 10-20 toistoa, lepo 45-60 s', hu: '2-3 sorozat x 10-20 ismétlés, pihenő 45-60 mp', sv: '2-3 set x 10-20 repetitioner, vila 45-60 s' }
	},
	'chest-dip': {
		bodyPart: 'Chest', secondary: ['Triceps', 'Front delts'], effectiveness: 4,
		purposes: ['strength', 'hypertrophy'], equipment: ['Machine'], level: 'intermediate',
		recommended: { en: '3-4 sets x 6-12 reps, rest 90-120 s', fi: '3-4 sarjaa x 6-12 toistoa, lepo 90-120 s', hu: '3-4 sorozat x 6-12 ismétlés, pihenő 90-120 mp', sv: '3-4 set x 6-12 repetitioner, vila 90-120 s' },
		bmiMax: 32, note: { en: 'Hard at higher body weight; use assisted-dip or band support, and avoid sinking too deep if the shoulders strain.', fi: 'Raskas suuremmalla kehonpainolla; käytä avustettua dippiä tai kuminauha-apua, äläkä laske liian syvälle jos olkapäät rasittuvat.', hu: 'Nagyobb testsúlynál nehéz; használj segített tolódzkodást vagy gumiszalagos támogatást, és ne ereszkedj túl mélyre, ha a vállad megterhelődik.', sv: 'Tungt vid högre kroppsvikt; använd assisterad dip eller bandstöd, och undvik att sänka för djupt om axlarna belastas.' }
	},
	'dumbbell-fly': {
		bodyPart: 'Chest', secondary: ['Front delts'], effectiveness: 3,
		purposes: ['hypertrophy'], equipment: ['Dumbbells', 'Bench'], level: 'beginner',
		recommended: { en: '3 sets x 10-15 reps, rest 60-90 s', fi: '3 sarjaa x 10-15 toistoa, lepo 60-90 s', hu: '3 sorozat x 10-15 ismétlés, pihenő 60-90 mp', sv: '3 set x 10-15 repetitioner, vila 60-90 s' },
		note: { en: 'Do not overstretch at the bottom; protect the shoulders.', fi: 'Älä yliveny ala-asennossa; suojaa olkapäät.', hu: 'Ne nyújtsd túl a vállat az alsó helyzetben; védd a vállízületet.', sv: 'Töj inte ut för mycket i botten; skydda axlarna.' }
	},
	'cable-crossover': {
		bodyPart: 'Chest', secondary: ['Front delts'], effectiveness: 3,
		purposes: ['hypertrophy'], equipment: ['Cable machine'], level: 'intermediate',
		recommended: { en: '3 sets x 10-15 reps, rest 60-90 s', fi: '3 sarjaa x 10-15 toistoa, lepo 60-90 s', hu: '3 sorozat x 10-15 ismétlés, pihenő 60-90 mp', sv: '3 set x 10-15 repetitioner, vila 60-90 s' }
	},
	'machine-chest-press': {
		bodyPart: 'Chest', secondary: ['Triceps', 'Front delts'], effectiveness: 4,
		purposes: ['hypertrophy', 'strength', 'general'], equipment: ['Machine'], level: 'beginner',
		recommended: { en: '3-4 sets x 8-12 reps, rest 90-120 s', fi: '3-4 sarjaa x 8-12 toistoa, lepo 90-120 s', hu: '3-4 sorozat x 8-12 ismétlés, pihenő 90-120 mp', sv: '3-4 set x 8-12 repetitioner, vila 90-120 s' }
	},

	// ---------- BACK ----------
	'pull-up': {
		bodyPart: 'Back', secondary: ['Lats', 'Biceps', 'Forearms', 'Rhomboids'], effectiveness: 5,
		purposes: ['strength', 'hypertrophy'], equipment: ['Pull-up bar'], level: 'advanced',
		recommended: { en: '3-5 sets x 3-8 reps, rest 90-120 s', fi: '3-5 sarjaa x 3-8 toistoa, lepo 90-120 s', hu: '3-5 sorozat x 3-8 ismétlés, pihenő 90-120 mp', sv: '3-5 set x 3-8 repetitioner, vila 90-120 s' },
		bmiMax: 32, note: { en: 'Hard at higher body weight; use band assistance or rows instead.', fi: 'Raskas suuremmalla kehonpainolla; käytä kuminauha-apua tai souda sen sijaan.', hu: 'Nagyobb testsúlynál nehéz; használj gumiszalagos segítséget vagy helyette evezz.', sv: 'Tungt vid högre kroppsvikt; använd bandassistans eller rodd istället.' }
	},
	'chin-up': {
		bodyPart: 'Back', secondary: ['Lats', 'Biceps', 'Forearms'], effectiveness: 5,
		purposes: ['strength', 'hypertrophy'], equipment: ['Pull-up bar'], level: 'advanced',
		recommended: { en: '3-5 sets x 3-8 reps, rest 90-120 s', fi: '3-5 sarjaa x 3-8 toistoa, lepo 90-120 s', hu: '3-5 sorozat x 3-8 ismétlés, pihenő 90-120 mp', sv: '3-5 set x 3-8 repetitioner, vila 90-120 s' },
		bmiMax: 32, note: { en: 'Hard at higher body weight; use band assistance or rows instead.', fi: 'Raskas suuremmalla kehonpainolla; käytä kuminauha-apua tai souda sen sijaan.', hu: 'Nagyobb testsúlynál nehéz; használj gumiszalagos segítséget vagy helyette evezz.', sv: 'Tungt vid högre kroppsvikt; använd bandassistans eller rodd istället.' }
	},
	'lat-pulldown': {
		bodyPart: 'Back', secondary: ['Lats', 'Biceps', 'Rhomboids'], effectiveness: 4,
		purposes: ['hypertrophy', 'strength', 'general'], equipment: ['Cable machine', 'Machine'], level: 'beginner',
		recommended: { en: '3-4 sets x 8-12 reps, rest 60-90 s', fi: '3-4 sarjaa x 8-12 toistoa, lepo 60-90 s', hu: '3-4 sorozat x 8-12 ismétlés, pihenő 60-90 mp', sv: '3-4 set x 8-12 repetitioner, vila 60-90 s' }
	},
	'barbell-bent-over-row': {
		bodyPart: 'Back', secondary: ['Lats', 'Rhomboids', 'Rear delts', 'Lower back', 'Biceps'], effectiveness: 5,
		purposes: ['strength', 'hypertrophy'], equipment: ['Barbell'], level: 'intermediate',
		recommended: { en: '3-4 sets x 6-10 reps, rest 90-120 s', fi: '3-4 sarjaa x 6-10 toistoa, lepo 90-120 s', hu: '3-4 sorozat x 6-10 ismétlés, pihenő 90-120 mp', sv: '3-4 set x 6-10 repetitioner, vila 90-120 s' },
		note: { en: 'Keep the back flat; a rounded spine under load risks injury.', fi: 'Pidä selkä suorana; pyöristynyt selkäranka kuorman alla on riski.', hu: 'Tartsd egyenesen a hátad; a terhelés alatti lekerekített gerinc sérülésveszélyes.', sv: 'Håll ryggen rak; en rundad ryggrad under belastning är en skaderisk.' }
	},
	'seated-cable-row': {
		bodyPart: 'Back', secondary: ['Lats', 'Rhomboids', 'Rear delts', 'Biceps'], effectiveness: 4,
		purposes: ['hypertrophy', 'strength', 'posture'], equipment: ['Cable machine'], level: 'beginner',
		recommended: { en: '3-4 sets x 8-12 reps, rest 60-90 s', fi: '3-4 sarjaa x 8-12 toistoa, lepo 60-90 s', hu: '3-4 sorozat x 8-12 ismétlés, pihenő 60-90 mp', sv: '3-4 set x 8-12 repetitioner, vila 60-90 s' }
	},
	'straight-arm-pulldown': {
		bodyPart: 'Back', secondary: ['Lats'], effectiveness: 3,
		purposes: ['hypertrophy'], equipment: ['Cable machine'], level: 'beginner',
		recommended: { en: '3 sets x 10-15 reps, rest 60-90 s', fi: '3 sarjaa x 10-15 toistoa, lepo 60-90 s', hu: '3 sorozat x 10-15 ismétlés, pihenő 60-90 mp', sv: '3 set x 10-15 repetitioner, vila 60-90 s' }
	},
	'face-pull': {
		bodyPart: 'Shoulders', secondary: ['Rear delts', 'Traps', 'Rhomboids'], effectiveness: 3,
		purposes: ['posture', 'hypertrophy', 'rehab'], equipment: ['Cable machine', 'Resistance band'], equipmentAny: [['cable', 'band']], level: 'beginner',
		recommended: { en: '3 sets x 12-20 reps, rest 45-60 s', fi: '3 sarjaa x 12-20 toistoa, lepo 45-60 s', hu: '3 sorozat x 12-20 ismétlés, pihenő 45-60 mp', sv: '3 set x 12-20 repetitioner, vila 45-60 s' }
	},
	'dumbbell-pullover': {
		bodyPart: 'Back', secondary: ['Lats', 'Chest', 'Triceps'], effectiveness: 3,
		purposes: ['hypertrophy'], equipment: ['Dumbbell', 'Bench'], level: 'intermediate',
		recommended: { en: '3 sets x 10-15 reps, rest 60-90 s', fi: '3 sarjaa x 10-15 toistoa, lepo 60-90 s', hu: '3 sorozat x 10-15 ismétlés, pihenő 60-90 mp', sv: '3 set x 10-15 repetitioner, vila 60-90 s' },
		note: { en: 'Keep the core braced to protect the lower back.', fi: 'Pidä keskivartalo jännitettynä alaselän suojaamiseksi.', hu: 'Tartsd megfeszítve a törzsed a derekad védelméért.', sv: 'Håll bålen spänd för att skydda ländryggen.' }
	},

	// ---------- SHOULDERS ----------
	'barbell-overhead-press': {
		bodyPart: 'Shoulders', secondary: ['Front delts', 'Triceps', 'Side delts', 'Core'], effectiveness: 5,
		purposes: ['strength', 'hypertrophy'], equipment: ['Barbell', 'Rack'], level: 'intermediate',
		recommended: { en: '3-5 sets x 5-8 reps, rest 120-180 s', fi: '3-5 sarjaa x 5-8 toistoa, lepo 120-180 s', hu: '3-5 sorozat x 5-8 ismétlés, pihenő 120-180 mp', sv: '3-5 set x 5-8 repetitioner, vila 120-180 s' },
		ageMin: 15, note: { en: 'Heavy axial overhead loading; brace the core and avoid overarching the lower back.', fi: 'Raskas pystysuora kuormitus pään yllä; jännitä keskivartalo ja vältä alaselän notkistamista.', hu: 'Nehéz, fej fölötti tengelyirányú terhelés; feszítsd meg a törzsizmokat és kerüld a derék túlfeszítését.', sv: 'Tung lodrät belastning över huvudet; spänn bålen och undvik att svanka ryggslutet.' }
	},
	'arnold-press': {
		bodyPart: 'Shoulders', secondary: ['Front delts', 'Side delts', 'Triceps'], effectiveness: 4,
		purposes: ['hypertrophy', 'strength'], equipment: ['Dumbbells', 'Bench'], level: 'intermediate',
		recommended: { en: '3-4 sets x 8-12 reps, rest 90-120 s', fi: '3-4 sarjaa x 8-12 toistoa, lepo 90-120 s', hu: '3-4 sorozat x 8-12 ismétlés, pihenő 90-120 mp', sv: '3-4 set x 8-12 repetitioner, vila 90-120 s' }
	},
	'dumbbell-lateral-raise': {
		bodyPart: 'Shoulders', secondary: ['Side delts'], effectiveness: 4,
		purposes: ['hypertrophy'], equipment: ['Dumbbells'], level: 'beginner',
		recommended: { en: '3-4 sets x 12-20 reps, rest 45-60 s', fi: '3-4 sarjaa x 12-20 toistoa, lepo 45-60 s', hu: '3-4 sorozat x 12-20 ismétlés, pihenő 45-60 mp', sv: '3-4 set x 12-20 repetitioner, vila 45-60 s' }
	},
	'rear-delt-fly': {
		bodyPart: 'Shoulders', secondary: ['Rear delts', 'Rhomboids', 'Traps'], effectiveness: 3,
		purposes: ['hypertrophy', 'posture'], equipment: ['Dumbbells', 'Bench'], level: 'beginner',
		recommended: { en: '3 sets x 12-20 reps, rest 45-60 s', fi: '3 sarjaa x 12-20 toistoa, lepo 45-60 s', hu: '3 sorozat x 12-20 ismétlés, pihenő 45-60 mp', sv: '3 set x 12-20 repetitioner, vila 45-60 s' }
	},
	'upright-row': {
		bodyPart: 'Shoulders', secondary: ['Side delts', 'Traps'], effectiveness: 3,
		purposes: ['hypertrophy', 'strength'], equipment: ['Barbell', 'Dumbbells'], level: 'intermediate',
		recommended: { en: '3 sets x 8-12 reps, rest 60-90 s', fi: '3 sarjaa x 8-12 toistoa, lepo 60-90 s', hu: '3 sorozat x 8-12 ismétlés, pihenő 60-90 mp', sv: '3 set x 8-12 repetitioner, vila 60-90 s' },
		note: { en: 'Stop below shoulder height if it pinches the joint.', fi: 'Lopeta hartioiden alapuolelle, jos nivel puristuu.', hu: 'Állj meg a vállmagasság alatt, ha becsípi az ízületet.', sv: 'Sluta under axelhöjd om det klämmer i leden.' }
	},
	'front-raise': {
		bodyPart: 'Shoulders', secondary: ['Front delts'], effectiveness: 3,
		purposes: ['hypertrophy'], equipment: ['Dumbbells'], level: 'beginner',
		recommended: { en: '3 sets x 10-15 reps, rest 45-60 s', fi: '3 sarjaa x 10-15 toistoa, lepo 45-60 s', hu: '3 sorozat x 10-15 ismétlés, pihenő 45-60 mp', sv: '3 set x 10-15 repetitioner, vila 45-60 s' }
	},

	// ---------- TRICEPS ----------
	'triceps-pushdown': {
		bodyPart: 'Arms', secondary: ['Triceps'], effectiveness: 4,
		purposes: ['hypertrophy'], equipment: ['Cable machine'], level: 'beginner',
		recommended: { en: '3-4 sets x 10-15 reps, rest 45-60 s', fi: '3-4 sarjaa x 10-15 toistoa, lepo 45-60 s', hu: '3-4 sorozat x 10-15 ismétlés, pihenő 45-60 mp', sv: '3-4 set x 10-15 repetitioner, vila 45-60 s' }
	},
	'overhead-triceps-extension': {
		bodyPart: 'Arms', secondary: ['Triceps'], effectiveness: 3,
		purposes: ['hypertrophy'], equipment: ['Dumbbell'], level: 'beginner',
		recommended: { en: '3 sets x 10-15 reps, rest 45-60 s', fi: '3 sarjaa x 10-15 toistoa, lepo 45-60 s', hu: '3 sorozat x 10-15 ismétlés, pihenő 45-60 mp', sv: '3 set x 10-15 repetitioner, vila 45-60 s' },
		note: { en: 'Control the weight behind the head to protect the elbows.', fi: 'Hallitse paino pään takana kyynärpäiden suojaamiseksi.', hu: 'Kontrolláld a súlyt a fejed mögött a könyökök védelméért.', sv: 'Kontrollera vikten bakom huvudet för att skydda armbågarna.' }
	},
	'skullcrusher': {
		bodyPart: 'Arms', secondary: ['Triceps'], effectiveness: 4,
		purposes: ['hypertrophy'], equipment: ['Barbell', 'Dumbbells', 'Bench'], level: 'intermediate',
		recommended: { en: '3-4 sets x 8-12 reps, rest 60-90 s', fi: '3-4 sarjaa x 8-12 toistoa, lepo 60-90 s', hu: '3-4 sorozat x 8-12 ismétlés, pihenő 60-90 mp', sv: '3-4 set x 8-12 repetitioner, vila 60-90 s' },
		note: { en: 'Control the weight near the face; do not drop it.', fi: 'Hallitse paino kasvojen lähellä; älä pudota sitä.', hu: 'Kontrolláld a súlyt az arcod közelében; ne ejtsd le.', sv: 'Kontrollera vikten nära ansiktet; tappa den inte.' }
	},
	'bench-dip': {
		bodyPart: 'Arms', secondary: ['Triceps', 'Front delts', 'Chest'], effectiveness: 3,
		purposes: ['endurance', 'hypertrophy', 'general'], equipment: ['Bench', 'Chair'], equipmentAny: [['bench', 'chair']], level: 'beginner',
		recommended: { en: '3 sets x 8-15 reps, rest 45-60 s', fi: '3 sarjaa x 8-15 toistoa, lepo 45-60 s', hu: '3 sorozat x 8-15 ismétlés, pihenő 45-60 mp', sv: '3 set x 8-15 repetitioner, vila 45-60 s' },
		note: { en: 'Avoid sinking too deep to protect the shoulders.', fi: 'Vältä liian syvää laskua olkapäiden suojaamiseksi.', hu: 'Kerüld a túl mély ereszkedést a vállak védelméért.', sv: 'Undvik att sänka dig för djupt för att skydda axlarna.' }
	},
	'close-grip-pushup': {
		position: 'prone',
		bodyPart: 'Arms', secondary: ['Triceps', 'Chest', 'Front delts', 'Core'], effectiveness: 4,
		purposes: ['strength', 'hypertrophy', 'endurance'], equipment: ['None'], level: 'beginner',
		recommended: { en: '3 sets x 8-15 reps, rest 60-90 s', fi: '3 sarjaa x 8-15 toistoa, lepo 60-90 s', hu: '3 sorozat x 8-15 ismétlés, pihenő 60-90 mp', sv: '3 set x 8-15 repetitioner, vila 60-90 s' }
	},

	// ---------- BICEPS ----------
	'barbell-curl': {
		bodyPart: 'Arms', secondary: ['Biceps', 'Forearms'], effectiveness: 4,
		purposes: ['hypertrophy', 'strength'], equipment: ['Barbell'], level: 'beginner',
		recommended: { en: '3-4 sets x 8-12 reps, rest 60-90 s', fi: '3-4 sarjaa x 8-12 toistoa, lepo 60-90 s', hu: '3-4 sorozat x 8-12 ismétlés, pihenő 60-90 mp', sv: '3-4 set x 8-12 repetitioner, vila 60-90 s' }
	},
	'hammer-curl': {
		bodyPart: 'Arms', secondary: ['Biceps', 'Forearms'], effectiveness: 4,
		purposes: ['hypertrophy'], equipment: ['Dumbbells'], level: 'beginner',
		recommended: { en: '3 sets x 8-12 reps, rest 60-90 s', fi: '3 sarjaa x 8-12 toistoa, lepo 60-90 s', hu: '3 sorozat x 8-12 ismétlés, pihenő 60-90 mp', sv: '3 set x 8-12 repetitioner, vila 60-90 s' }
	},
	'preacher-curl': {
		bodyPart: 'Arms', secondary: ['Biceps', 'Forearms'], effectiveness: 4,
		purposes: ['hypertrophy'], equipment: ['Barbell', 'Dumbbell', 'Machine', 'Bench'], level: 'intermediate',
		recommended: { en: '3 sets x 8-12 reps, rest 60-90 s', fi: '3 sarjaa x 8-12 toistoa, lepo 60-90 s', hu: '3 sorozat x 8-12 ismétlés, pihenő 60-90 mp', sv: '3 set x 8-12 repetitioner, vila 60-90 s' },
		note: { en: 'Do not snap the elbow straight at the bottom.', fi: 'Älä napsauta kyynärpäätä suoraksi ala-asennossa.', hu: 'Ne rántsd egyenesre a könyököt az alsó ponton.', sv: 'Lås inte armbågen rakt med ett ryck i botten.' }
	},
	'cable-curl': {
		bodyPart: 'Arms', secondary: ['Biceps', 'Forearms'], effectiveness: 4,
		purposes: ['hypertrophy'], equipment: ['Cable machine'], level: 'beginner',
		recommended: { en: '3 sets x 10-15 reps, rest 45-60 s', fi: '3 sarjaa x 10-15 toistoa, lepo 45-60 s', hu: '3 sorozat x 10-15 ismétlés, pihenő 45-60 mp', sv: '3 set x 10-15 repetitioner, vila 45-60 s' }
	},

	// ---------- FOREARMS ----------
	'wrist-curl': {
		bodyPart: 'Arms', secondary: ['Forearms'], effectiveness: 2,
		purposes: ['hypertrophy', 'endurance'], equipment: ['Dumbbells', 'Barbell'], level: 'beginner',
		recommended: { en: '3 sets x 12-20 reps, rest 45-60 s', fi: '3 sarjaa x 12-20 toistoa, lepo 45-60 s', hu: '3 sorozat x 12-20 ismétlés, pihenő 45-60 mp', sv: '3 set x 12-20 repetitioner, vila 45-60 s' }
	},
	'reverse-curl': {
		bodyPart: 'Arms', secondary: ['Forearms', 'Biceps'], effectiveness: 3,
		purposes: ['hypertrophy', 'endurance'], equipment: ['Barbell', 'Dumbbells'], level: 'beginner',
		recommended: { en: '3 sets x 10-15 reps, rest 45-60 s', fi: '3 sarjaa x 10-15 toistoa, lepo 45-60 s', hu: '3 sorozat x 10-15 ismétlés, pihenő 45-60 mp', sv: '3 set x 10-15 repetitioner, vila 45-60 s' }
	}
};
