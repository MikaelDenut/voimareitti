// Voimareitti - structured profiles for the LOWER-BODY, CORE and MOBILITY exercise library
// (the moreExercisesLower set in ./more-exercises-lower.ts). Companion to profiles-a.ts.
// Suitability fields (ageMin, bmiMax, waistNote, genderNote, ...) are present ONLY where there is a
// real, defensible physiological or safety reason; an omitted field means "suitable for all"
// (Mikael's explicit steer). Finnish strings carry correct diacritics; plain hyphens only.

import type { ExerciseProfile } from './profiles';

export const profilesB: Record<string, ExerciseProfile> = {
	// ===== QUADS =====
	'barbell-back-squat': {
		bodyPart: 'Legs', secondary: ['Glutes', 'Core', 'Lower back'], effectiveness: 5,
		purposes: ['strength', 'hypertrophy'], equipment: ['Barbell', 'Rack'], level: 'intermediate',
		recommended: { en: '3-5 sets x 4-8 reps, rest 2-3 min', fi: '3-5 sarjaa x 4-8 toistoa, lepo 2-3 min', hu: '3-5 sorozat x 4-8 ismétlés, pihenő 2-3 perc', sv: '3-5 set x 4-8 repetitioner, vila 2-3 min' },
		ageMin: 15,
		note: { en: 'Heavy spinal load; learn the pattern light and use a rack with safety pins.', fi: 'Raskas selkäkuormitus opetellaan kevyellä; käytä turvatappitelinettä.', hu: 'Nehéz gerincterhelés; tanuld meg a mozgást könnyű súllyal, és használj biztonsági tüskékkel ellátott állványt.', sv: 'Tung belastning på ryggen; lär in rörelsen lätt och använd en ställning med säkerhetspinnar.' }
	},
	'front-squat': {
		bodyPart: 'Legs', secondary: ['Glutes', 'Core', 'Front delts'], effectiveness: 4,
		purposes: ['strength', 'hypertrophy'], equipment: ['Barbell', 'Rack'], level: 'advanced',
		recommended: { en: '3-5 sets x 4-8 reps, rest 2-3 min', fi: '3-5 sarjaa x 4-8 toistoa, lepo 2-3 min', hu: '3-5 sorozat x 4-8 ismétlés, pihenő 2-3 perc', sv: '3-5 set x 4-8 repetitioner, vila 2-3 min' },
		ageMin: 15,
		note: { en: 'Axial-loaded; squat in a rack so you can bail the bar forward safely.', fi: 'Aksiaalisesti kuormitettu; kyykkää telineessä, jotta voit pudottaa tangon eteen turvallisesti.', hu: 'Tengelyirányú terhelés; állványban guggolj, hogy biztonságosan előre tudd ejteni a rudat.', sv: 'Axiellt belastad; knäböj i en ställning så att du kan släppa stången framåt säkert.' }
	},
	'leg-press': {
		bodyPart: 'Legs', secondary: ['Glutes', 'Hamstrings'], effectiveness: 4,
		purposes: ['hypertrophy', 'strength'], equipment: ['Machine'], level: 'beginner',
		recommended: { en: '3-4 sets x 8-15 reps, rest 1-2 min', fi: '3-4 sarjaa x 8-15 toistoa, lepo 1-2 min', hu: '3-4 sorozat x 8-15 ismétlés, pihenő 1-2 perc', sv: '3-4 set x 8-15 repetitioner, vila 1-2 min' }
	},
	'leg-extension': {
		bodyPart: 'Legs', secondary: [], effectiveness: 4,
		purposes: ['hypertrophy'], equipment: ['Machine'], level: 'beginner',
		recommended: { en: '3-4 sets x 10-15 reps, rest 60-90 s', fi: '3-4 sarjaa x 10-15 toistoa, lepo 60-90 s', hu: '3-4 sorozat x 10-15 ismétlés, pihenő 60-90 mp', sv: '3-4 set x 10-15 repetitioner, vila 60-90 s' }
	},
	'hack-squat': {
		bodyPart: 'Legs', secondary: ['Glutes'], effectiveness: 4,
		purposes: ['hypertrophy', 'strength'], equipment: ['Machine'], level: 'intermediate',
		recommended: { en: '3-4 sets x 8-12 reps, rest 1-2 min', fi: '3-4 sarjaa x 8-12 toistoa, lepo 1-2 min', hu: '3-4 sorozat x 8-12 ismétlés, pihenő 1-2 perc', sv: '3-4 set x 8-12 repetitioner, vila 1-2 min' }
	},
	'wall-sit': {
		bodyPart: 'Legs', secondary: ['Glutes'], effectiveness: 3,
		purposes: ['endurance', 'general'], equipment: ['Wall'], level: 'beginner',
		recommended: { en: '3 x 30-60 s holds', fi: '3 x 30-60 s pitoa', hu: '3 x 30-60 mp tartás', sv: '3 x 30-60 s håll' }
	},
	'step-up': {
		balanceDemand: 'high',
		bodyPart: 'Legs', secondary: ['Glutes', 'Hamstrings', 'Core'], effectiveness: 3,
		purposes: ['strength', 'general', 'fat-loss'], equipment: ['Bench', 'Dumbbells'], equipmentAny: [['bench', 'chair']], level: 'beginner',
		recommended: { en: '3 sets x 8-12 reps per leg', fi: '3 sarjaa x 8-12 toistoa jalkaa kohti', hu: '3 sorozat x 8-12 ismétlés lábanként', sv: '3 set x 8-12 repetitioner per ben' }
	},
	'sissy-squat': {
		balanceDemand: 'high',
		bodyPart: 'Legs', secondary: [], effectiveness: 3,
		purposes: ['hypertrophy'], equipment: ['None'], level: 'advanced',
		recommended: { en: '3 sets x 8-15 reps', fi: '3 sarjaa x 8-15 toistoa', hu: '3 sorozat x 8-15 ismétlés', sv: '3 set x 8-15 repetitioner' },
		bmiMax: 32,
		note: { en: 'Demanding on the knees through a deep stretch; build up slowly and stop if it hurts.', fi: 'Rasittaa polvia syvässä venytyksessä; etene hitaasti ja lopeta jos kipua.', hu: 'Mély nyújtásban megterheli a térdet; haladj lassan, és állj le, ha fáj.', sv: 'Krävande för knäna i en djup töjning; bygg upp långsamt och sluta om det gör ont.' }
	},

	// ===== HAMSTRINGS / GLUTES (hinge) =====
	'barbell-deadlift': {
		bodyPart: 'Legs', secondary: ['Glutes', 'Hamstrings', 'Lower back', 'Back', 'Forearms'], effectiveness: 5,
		purposes: ['strength', 'hypertrophy'], equipment: ['Barbell'], level: 'intermediate',
		recommended: { en: '3-5 sets x 3-6 reps, rest 2-3 min', fi: '3-5 sarjaa x 3-6 toistoa, lepo 2-3 min', hu: '3-5 sorozat x 3-6 ismétlés, pihenő 2-3 perc', sv: '3-5 set x 3-6 repetitioner, vila 2-3 min' },
		ageMin: 15,
		heightNote: { en: 'Very tall lifters have a longer pull and more back stress; consider trap-bar or elevated pulls.', fi: 'Hyvin pitkillä on pidempi veto ja enemmän selkäkuormitusta; harkitse trap-tankoa tai korotettua vetoa.', hu: 'A nagyon magas emelőknél hosszabb a húzás és nagyobb a hátterhelés; fontold meg a trap-rudat vagy a megemelt húzást.', sv: 'Mycket långa lyftare har ett längre drag och mer belastning på ryggen; överväg trap-stång eller upphöjda lyft.' }
	},
	'sumo-deadlift': {
		bodyPart: 'Legs', secondary: ['Glutes', 'Hamstrings', 'Adductors', 'Lower back', 'Forearms'], effectiveness: 5,
		purposes: ['strength', 'hypertrophy'], equipment: ['Barbell'], level: 'intermediate',
		recommended: { en: '3-5 sets x 3-6 reps, rest 2-3 min', fi: '3-5 sarjaa x 3-6 toistoa, lepo 2-3 min', hu: '3-5 sorozat x 3-6 ismétlés, pihenő 2-3 perc', sv: '3-5 set x 3-6 repetitioner, vila 2-3 min' },
		ageMin: 15
	},
	'barbell-hip-thrust': {
		bodyPart: 'Glutes', secondary: ['Hamstrings', 'Quads'], effectiveness: 5,
		purposes: ['hypertrophy', 'strength'], equipment: ['Barbell', 'Bench'], level: 'intermediate',
		recommended: { en: '3-4 sets x 6-12 reps, rest 1-2 min', fi: '3-4 sarjaa x 6-12 toistoa, lepo 1-2 min', hu: '3-4 sorozat x 6-12 ismétlés, pihenő 1-2 perc', sv: '3-4 set x 6-12 repetitioner, vila 1-2 min' }
	},
	'lying-leg-curl': {
		position: 'supine',
		bodyPart: 'Legs', secondary: ['Calves'], effectiveness: 4,
		purposes: ['hypertrophy'], equipment: ['Machine'], level: 'beginner',
		recommended: { en: '3-4 sets x 10-15 reps, rest 60-90 s', fi: '3-4 sarjaa x 10-15 toistoa, lepo 60-90 s', hu: '3-4 sorozat x 10-15 ismétlés, pihenő 60-90 mp', sv: '3-4 set x 10-15 repetitioner, vila 60-90 s' }
	},
	'good-morning': {
		bodyPart: 'Legs', secondary: ['Glutes', 'Lower back', 'Spine'], effectiveness: 4,
		purposes: ['strength', 'hypertrophy'], equipment: ['Barbell'], level: 'advanced',
		recommended: { en: '3-4 sets x 6-10 reps, rest 2 min', fi: '3-4 sarjaa x 6-10 toistoa, lepo 2 min', hu: '3-4 sorozat x 6-10 ismétlés, pihenő 2 perc', sv: '3-4 set x 6-10 repetitioner, vila 2 min' },
		ageMin: 15,
		note: { en: 'Heavy load on a bent spine; start very light and any back rounding means stop.', fi: 'Raskas kuorma taipuneelle selälle; aloita hyvin kevyesti ja selän pyöristyminen tarkoittaa lopetusta.', hu: 'Nehéz terhelés hajlított gerincen; kezdd nagyon könnyen, és a hát bármilyen domborodása leállást jelent.', sv: 'Tung last på en böjd ryggrad; börja mycket lätt och varje rundning av ryggen betyder stopp.' }
	},
	'single-leg-rdl': {
		balanceDemand: 'high',
		bodyPart: 'Legs', secondary: ['Glutes', 'Hamstrings', 'Core'], effectiveness: 4,
		purposes: ['strength', 'general'], equipment: ['Dumbbell'], level: 'intermediate',
		recommended: { en: '3 sets x 6-10 reps per leg', fi: '3 sarjaa x 6-10 toistoa jalkaa kohti', hu: '3 sorozat x 6-10 ismétlés lábanként', sv: '3 set x 6-10 repetitioner per ben' }
	},
	'kettlebell-swing': {
		impact: 'medium',
		bodyPart: 'Glutes', secondary: ['Hamstrings', 'Core', 'Lower back'], effectiveness: 4,
		purposes: ['fat-loss', 'strength', 'endurance'], equipment: ['Kettlebell'], level: 'intermediate',
		recommended: { en: '4-6 sets x 10-20 reps, short rests', fi: '4-6 sarjaa x 10-20 toistoa, lyhyet levot', hu: '4-6 sorozat x 10-20 ismétlés, rövid pihenők', sv: '4-6 set x 10-20 repetitioner, korta vilor' },
		ageMin: 15, bmiMax: 35,
		note: { en: 'Explosive and high-impact on the hips and spine; learn the hinge before going heavy.', fi: 'Räjähtävä ja iskuttava lonkille ja selälle; opettele sarana ennen raskaita kuormia.', hu: 'Robbanékony és lökésszerűen terheli a csípőt és a gerincet; tanuld meg a csípőhajlást, mielőtt nehéz súllyal dolgozol.', sv: 'Explosiv och stötbelastande för höfter och rygg; lär in höftfällningen innan du tar tunga vikter.' }
	},
	'cable-pull-through': {
		bodyPart: 'Glutes', secondary: ['Hamstrings'], effectiveness: 4,
		purposes: ['hypertrophy', 'strength'], equipment: ['Cable machine'], level: 'beginner',
		recommended: { en: '3-4 sets x 10-15 reps, rest 60-90 s', fi: '3-4 sarjaa x 10-15 toistoa, lepo 60-90 s', hu: '3-4 sorozat x 10-15 ismétlés, pihenő 60-90 mp', sv: '3-4 set x 10-15 repetitioner, vila 60-90 s' }
	},
	'nordic-curl': {
		bodyPart: 'Legs', secondary: ['Glutes', 'Calves'], effectiveness: 4,
		purposes: ['strength', 'rehab'], equipment: ['None'], level: 'advanced',
		recommended: { en: '3 sets x 4-8 reps, slow eccentric', fi: '3 sarjaa x 4-8 toistoa, hidas eksentrinen', hu: '3 sorozat x 4-8 ismétlés, lassú excentrikus szakasz', sv: '3 set x 4-8 repetitioner, långsam negativ fas' },
		bmiMax: 32,
		note: { en: 'Very intense eccentric; start with hand-assisted reps.', fi: 'Erittäin kova eksentrinen; aloita käsillä avustetuilla toistoilla.', hu: 'Nagyon intenzív excentrikus terhelés; kezdd kézzel segített ismétlésekkel.', sv: 'Mycket tung negativ fas; börja med handassisterade repetitioner.' }
	},

	// ===== ADDUCTORS =====
	'cossack-squat': {
		balanceDemand: 'high',
		bodyPart: 'Legs', secondary: ['Quads', 'Glutes', 'Hips'], effectiveness: 3,
		purposes: ['mobility', 'strength', 'general'], equipment: ['None'], level: 'intermediate',
		recommended: { en: '3 sets x 6-10 reps per side', fi: '3 sarjaa x 6-10 toistoa puolta kohti', hu: '3 sorozat x 6-10 ismétlés oldalanként', sv: '3 set x 6-10 repetitioner per sida' },
		bmiMax: 33,
		waistNote: { en: 'A large waist can limit the deep hip flexion; stay shallower or hold a support.', fi: 'Suuri vyötärö voi rajoittaa syvää lonkan koukistusta; kyykkää loivemmin tai pidä tuesta.', hu: 'A nagy haskörfogat korlátozhatja a mély csípőhajlítást; guggolj sekélyebben vagy fogódzkodj meg egy támasztékban.', sv: 'Ett stort midjeomfång kan begränsa den djupa höftböjningen; knäböj grundare eller håll i ett stöd.' }
	},
	'adductor-machine': {
		bodyPart: 'Legs', secondary: [], effectiveness: 3,
		purposes: ['hypertrophy'], equipment: ['Machine'], level: 'beginner',
		recommended: { en: '3 sets x 12-20 reps, rest 60 s', fi: '3 sarjaa x 12-20 toistoa, lepo 60 s', hu: '3 sorozat x 12-20 ismétlés, pihenő 60 mp', sv: '3 set x 12-20 repetitioner, vila 60 s' }
	},
	'copenhagen-plank': {
		bodyPart: 'Core', secondary: ['Adductors', 'Obliques'], effectiveness: 4,
		purposes: ['strength', 'rehab'], equipment: ['Bench'], level: 'advanced',
		recommended: { en: '3 x 10-30 s per side', fi: '3 x 10-30 s puolta kohti', hu: '3 x 10-30 mp oldalanként', sv: '3 x 10-30 s per sida' },
		bmiMax: 33
	},

	// ===== ABDUCTORS =====
	'lateral-band-walk': {
		bodyPart: 'Glutes', secondary: ['Abductors'], effectiveness: 3,
		purposes: ['general', 'rehab', 'endurance'], equipment: ['Resistance band'], level: 'beginner',
		recommended: { en: '2-3 sets x 10-15 steps per direction', fi: '2-3 sarjaa x 10-15 askelta suuntaan', hu: '2-3 sorozat x 10-15 lépés irányonként', sv: '2-3 set x 10-15 steg per riktning' }
	},
	'hip-abduction': {
		bodyPart: 'Glutes', secondary: ['Abductors'], effectiveness: 3,
		purposes: ['hypertrophy', 'rehab'], equipment: ['Machine'], level: 'beginner',
		recommended: { en: '3 sets x 12-20 reps, rest 60 s', fi: '3 sarjaa x 12-20 toistoa, lepo 60 s', hu: '3 sorozat x 12-20 ismétlés, pihenő 60 mp', sv: '3 set x 12-20 repetitioner, vila 60 s' }
	},
	'side-lying-leg-raise': {
		position: 'side-lying',
		bodyPart: 'Glutes', secondary: ['Abductors'], effectiveness: 2,
		purposes: ['rehab', 'general'], equipment: ['None'], level: 'beginner',
		recommended: { en: '2-3 sets x 12-20 reps per side', fi: '2-3 sarjaa x 12-20 toistoa puolta kohti', hu: '2-3 sorozat x 12-20 ismétlés oldalanként', sv: '2-3 set x 12-20 repetitioner per sida' }
	},

	// ===== CALVES =====
	'standing-calf-raise': {
		bodyPart: 'Calves', secondary: [], effectiveness: 4,
		purposes: ['hypertrophy', 'strength'], equipment: ['Machine'], level: 'beginner',
		recommended: { en: '3-4 sets x 8-15 reps, full range', fi: '3-4 sarjaa x 8-15 toistoa, täysi liikerata', hu: '3-4 sorozat x 8-15 ismétlés, teljes mozgástartomány', sv: '3-4 set x 8-15 repetitioner, full rörelsebana' }
	},
	'seated-calf-raise': {
		bodyPart: 'Calves', secondary: [], effectiveness: 4,
		purposes: ['hypertrophy'], equipment: ['Machine'], level: 'beginner',
		recommended: { en: '3-4 sets x 12-20 reps, rest 60 s', fi: '3-4 sarjaa x 12-20 toistoa, lepo 60 s', hu: '3-4 sorozat x 12-20 ismétlés, pihenő 60 mp', sv: '3-4 set x 12-20 repetitioner, vila 60 s' }
	},
	'donkey-calf-raise': {
		bodyPart: 'Calves', secondary: [], effectiveness: 4,
		purposes: ['hypertrophy'], equipment: ['Machine'], level: 'intermediate',
		recommended: { en: '3-4 sets x 10-20 reps, full range', fi: '3-4 sarjaa x 10-20 toistoa, täysi liikerata', hu: '3-4 sorozat x 10-20 ismétlés, teljes mozgástartomány', sv: '3-4 set x 10-20 repetitioner, full rörelsebana' }
	},

	// ===== ABS / OBLIQUES / CORE =====
	'crunch': {
		position: 'supine', diastasisCaution: true,
		bodyPart: 'Core', secondary: ['Abs'], effectiveness: 3,
		purposes: ['hypertrophy', 'general'], equipment: ['None'], level: 'beginner',
		recommended: { en: '3 sets x 12-20 reps', fi: '3 sarjaa x 12-20 toistoa', hu: '3 sorozat x 12-20 ismétlés', sv: '3 set x 12-20 repetitioner' },
		waistNote: { en: 'A larger waist can limit trunk flexion; reduce the range and keep the neck relaxed.', fi: 'Suuri vyötärö voi rajoittaa vartalon koukistusta; pienennä liikerataa ja pidä niska rentona.', hu: 'A nagyobb haskörfogat korlátozhatja a törzshajlítást; csökkentsd a mozgástartományt és tartsd lazán a nyakat.', sv: 'Ett stort midjeomfång kan begränsa bålböjningen; minska rörelsebanan och håll nacken avslappnad.' }
	},
	'hanging-leg-raise': {
		bodyPart: 'Core', secondary: ['Abs', 'Hips', 'Forearms'], effectiveness: 4,
		purposes: ['hypertrophy', 'strength'], equipment: ['Pull-up bar'], level: 'advanced',
		recommended: { en: '3-4 sets x 6-12 reps', fi: '3-4 sarjaa x 6-12 toistoa', hu: '3-4 sorozat x 6-12 ismétlés', sv: '3-4 set x 6-12 repetitioner' },
		bmiMax: 32,
		waistNote: { en: 'Deep hip flexion can be limited by a larger waist; try lying leg raises.', fi: 'Suuri vyötärö voi rajoittaa syvää lonkan koukistusta; kokeile selinmakuun jalannostoja.', hu: 'A mély csípőhajlítást korlátozhatja a nagyobb haskörfogat; próbáld a fekvő lábemelést.', sv: 'Djup höftböjning kan begränsas av ett stort midjeomfång; prova benlyft liggande.' }
	},
	'lying-leg-raise': {
		position: 'supine', diastasisCaution: true,
		bodyPart: 'Core', secondary: ['Abs', 'Hips'], effectiveness: 3,
		purposes: ['hypertrophy', 'general'], equipment: ['None'], level: 'beginner',
		recommended: { en: '3 sets x 10-15 reps', fi: '3 sarjaa x 10-15 toistoa', hu: '3 sorozat x 10-15 ismétlés', sv: '3 set x 10-15 repetitioner' },
		waistNote: { en: 'A larger waist can shorten the comfortable range; bend the knees or lower one leg at a time.', fi: 'Suuri vyötärö voi lyhentää mukavaa liikerataa; koukista polvet tai laske yksi jalka kerrallaan.', hu: 'A nagyobb haskörfogat lerövidítheti a kényelmes mozgástartományt; hajlítsd be a térded vagy egyszerre csak az egyik lábad engedd le.', sv: 'Ett stort midjeomfång kan korta den bekväma rörelsebanan; böj knäna eller sänk ett ben i taget.' },
		genderNote: { en: 'Supine core work; modify or skip in pregnancy and during early postpartum recovery.', fi: 'Selinmakuun tehtävä keskivartaloliike; muokkaa tai jätä pois raskauden aikana ja varhaisessa synnytyksen jälkeisessä palautumisessa.', hu: 'Hanyatt fekvő törzsgyakorlat; terhesség alatt és a szülés utáni korai felépülés idején módosítsd vagy hagyd ki.', sv: 'Bålövning på rygg; anpassa eller hoppa över under graviditet och tidig återhämtning efter förlossning.' }
	},
	'cable-crunch': {
		bodyPart: 'Core', secondary: ['Abs'], effectiveness: 4,
		purposes: ['hypertrophy', 'strength'], equipment: ['Cable machine'], level: 'intermediate',
		recommended: { en: '3-4 sets x 10-15 reps, rest 60 s', fi: '3-4 sarjaa x 10-15 toistoa, lepo 60 s', hu: '3-4 sorozat x 10-15 ismétlés, pihenő 60 mp', sv: '3-4 set x 10-15 repetitioner, vila 60 s' }
	},
	'russian-twist': {
		position: 'seated', diastasisCaution: true,
		bodyPart: 'Core', secondary: ['Obliques', 'Abs'], effectiveness: 3,
		purposes: ['hypertrophy', 'endurance', 'general'], equipment: ['None'], level: 'beginner',
		recommended: { en: '3 sets x 10-20 reps per side', fi: '3 sarjaa x 10-20 toistoa puolta kohti', hu: '3 sorozat x 10-20 ismétlés oldalanként', sv: '3 set x 10-20 repetitioner per sida' },
		waistNote: { en: 'A larger waist can limit the rotation; keep the feet down and move slowly.', fi: 'Suuri vyötärö voi rajoittaa kiertoa; pidä jalat lattialla ja liiku hitaasti.', hu: 'A nagyobb haskörfogat korlátozhatja a csavarást; tartsd a lábad a földön és mozogj lassan.', sv: 'Ett stort midjeomfång kan begränsa rotationen; håll fötterna i golvet och rör dig långsamt.' }
	},
	'side-plank': {
		bodyPart: 'Core', secondary: ['Obliques', 'Abs'], effectiveness: 3,
		purposes: ['general', 'rehab', 'posture'], equipment: ['None'], level: 'beginner',
		recommended: { en: '3 x 20-45 s per side', fi: '3 x 20-45 s puolta kohti', hu: '3 x 20-45 mp oldalanként', sv: '3 x 20-45 s per sida' }
	},
	'dead-bug': {
		position: 'supine',
		bodyPart: 'Core', secondary: ['Abs'], effectiveness: 3,
		purposes: ['rehab', 'general', 'posture'], equipment: ['None'], level: 'beginner',
		recommended: { en: '3 sets x 8-12 reps per side, slow', fi: '3 sarjaa x 8-12 toistoa puolta kohti, hitaasti', hu: '3 sorozat x 8-12 ismétlés oldalanként, lassan', sv: '3 set x 8-12 repetitioner per sida, långsamt' },
		genderNote: { en: 'Supine core bracing; modify or skip in pregnancy and during early postpartum recovery.', fi: 'Selinmakuun tehtävä keskivartalon jännitys; muokkaa tai jätä pois raskauden aikana ja varhaisessa synnytyksen jälkeisessä palautumisessa.', hu: 'Hanyatt fekvő törzsfeszítés; terhesség alatt és a szülés utáni korai felépülés idején módosítsd vagy hagyd ki.', sv: 'Bålspänning på rygg; anpassa eller hoppa över under graviditet och tidig återhämtning efter förlossning.' }
	},
	'mountain-climber': {
		position: 'prone', impact: 'medium',
		bodyPart: 'Core', secondary: ['Abs', 'Shoulders', 'Hips'], effectiveness: 3,
		purposes: ['fat-loss', 'endurance', 'general'], equipment: ['None'], level: 'beginner',
		recommended: { en: '3-5 sets x 20-40 s', fi: '3-5 sarjaa x 20-40 s', hu: '3-5 sorozat x 20-40 mp', sv: '3-5 set x 20-40 s' },
		bmiMax: 35,
		note: { en: 'High-impact on the wrists and shoulders; step the knees in slowly if jumping is hard.', fi: 'Iskuttaa ranteita ja olkapäitä; astu polvet sisään hitaasti jos hyppiminen on raskasta.', hu: 'Lökésszerűen terheli a csuklót és a vállat; ha az ugrálás nehéz, lassan léptesd be a térded.', sv: 'Stötbelastande för handleder och axlar; för in knäna långsamt om hoppen känns tunga.' }
	},
	'hollow-hold': {
		position: 'supine', diastasisCaution: true,
		bodyPart: 'Core', secondary: ['Abs', 'Hips'], effectiveness: 3,
		purposes: ['strength', 'general'], equipment: ['None'], level: 'intermediate',
		recommended: { en: '3-4 x 15-40 s holds', fi: '3-4 x 15-40 s pitoa', hu: '3-4 x 15-40 mp tartás', sv: '3-4 x 15-40 s håll' },
		genderNote: { en: 'High intra-abdominal-pressure supine hold; modify or skip in pregnancy and during early postpartum recovery.', fi: 'Korkean vatsaontelon paineen selinmakuupito; muokkaa tai jätä pois raskauden aikana ja varhaisessa synnytyksen jälkeisessä palautumisessa.', hu: 'Magas hasűri nyomással járó hanyatt fekvő tartás; terhesség alatt és a szülés utáni korai felépülés idején módosítsd vagy hagyd ki.', sv: 'Bukhåll på rygg med högt buktryck; anpassa eller hoppa över under graviditet och tidig återhämtning efter förlossning.' }
	},
	'ab-wheel': {
		bodyPart: 'Core', secondary: ['Abs', 'Lats', 'Shoulders', 'Lower back'], effectiveness: 4,
		purposes: ['strength', 'hypertrophy'], equipment: ['Ab wheel'], level: 'advanced',
		recommended: { en: '3 sets x 6-12 reps', fi: '3 sarjaa x 6-12 toistoa', hu: '3 sorozat x 6-12 ismétlés', sv: '3 set x 6-12 repetitioner' },
		bmiMax: 32,
		note: { en: 'Hard on the lower back; keep it braced, never let it sag, and start from short rollouts.', fi: 'Rasittaa alaselkää; pidä se jännitettynä, älä päästä notkolle ja aloita lyhyillä rullauksilla.', hu: 'Megterheli a derekat; tartsd feszesen, soha ne hagyd behomorodni, és kezdd rövid kigördülésekkel.', sv: 'Påfrestande för ryggslutet; håll det spänt, låt det aldrig svanka och börja med korta utrullningar.' }
	},
	'pallof-press': {
		bodyPart: 'Core', secondary: ['Obliques', 'Abs'], effectiveness: 3,
		purposes: ['rehab', 'general', 'posture'], equipment: ['Cable machine', 'Resistance band'], equipmentAny: [['cable', 'band']], level: 'beginner',
		recommended: { en: '3 sets x 8-12 reps per side', fi: '3 sarjaa x 8-12 toistoa puolta kohti', hu: '3 sorozat x 8-12 ismétlés oldalanként', sv: '3 set x 8-12 repetitioner per sida' }
	},
	'farmer-carry': {
		bodyPart: 'Full body', secondary: ['Core', 'Back', 'Traps', 'Forearms'], effectiveness: 4,
		purposes: ['strength', 'fat-loss', 'general'], equipment: ['Dumbbells', 'Kettlebell'], equipmentAny: [['single-weight', 'dumbbells']], level: 'beginner',
		recommended: { en: '3-5 carries x 20-40 m, heavy', fi: '3-5 kantoa x 20-40 m, raskas', hu: '3-5 cipelés x 20-40 m, nehéz súllyal', sv: '3-5 bärningar x 20-40 m, tungt' }
	},
	'suitcase-carry': {
		bodyPart: 'Core', secondary: ['Obliques', 'Back', 'Forearms', 'Traps'], effectiveness: 4,
		purposes: ['strength', 'general'], equipment: ['Dumbbell', 'Kettlebell'], level: 'beginner',
		recommended: { en: '3-4 carries x 20-30 m per side', fi: '3-4 kantoa x 20-30 m puolta kohti', hu: '3-4 cipelés x 20-30 m oldalanként', sv: '3-4 bärningar x 20-30 m per sida' }
	},

	// ===== MOBILITY =====
	'deep-squat-hold': {
		bodyPart: 'Mobility', secondary: ['Hips', 'Adductors', 'Calves'], effectiveness: 3,
		purposes: ['mobility', 'general'], equipment: ['None'], level: 'beginner',
		recommended: { en: '2-3 x 30-60 s holds', fi: '2-3 x 30-60 s pitoa', hu: '2-3 x 30-60 mp tartás', sv: '2-3 x 30-60 s håll' },
		bmiMax: 33,
		waistNote: { en: 'A larger waist can limit deep hip flexion; hold a support or sit on a low block.', fi: 'Suuri vyötärö voi rajoittaa syvää lonkan koukistusta; pidä tuesta tai istu matalalle korokkeelle.', hu: 'A nagyobb haskörfogat korlátozhatja a mély csípőhajlítást; fogódzkodj meg egy támasztékban vagy ülj le egy alacsony bakra.', sv: 'Ett stort midjeomfång kan begränsa den djupa höftböjningen; håll i ett stöd eller sitt på ett lågt block.' }
	},
	'downward-dog': {
		bodyPart: 'Mobility', secondary: ['Hamstrings', 'Calves', 'Shoulders', 'Spine'], effectiveness: 3,
		purposes: ['mobility', 'general'], equipment: ['None'], level: 'beginner',
		recommended: { en: '1-2 x 5-8 slow breaths', fi: '1-2 x 5-8 hidasta hengitystä', hu: '1-2 x 5-8 lassú légvétel', sv: '1-2 x 5-8 långsamma andetag' }
	},
	'childs-pose': {
		bodyPart: 'Mobility', secondary: ['Spine', 'Hips', 'Lats'], effectiveness: 2,
		purposes: ['mobility', 'general'], equipment: ['None'], level: 'beginner',
		recommended: { en: '1-2 x 30-60 s, breathe slowly', fi: '1-2 x 30-60 s, hengitä rauhallisesti', hu: '1-2 x 30-60 mp, lélegezz nyugodtan', sv: '1-2 x 30-60 s, andas lugnt' }
	},
	'thread-the-needle': {
		bodyPart: 'Mobility', secondary: ['Spine', 'Back', 'Shoulders'], effectiveness: 3,
		purposes: ['mobility', 'posture'], equipment: ['None'], level: 'beginner',
		recommended: { en: '1-2 x 5-8 slow reps per side', fi: '1-2 x 5-8 hidasta toistoa puolta kohti', hu: '1-2 x 5-8 lassú ismétlés oldalanként', sv: '1-2 x 5-8 långsamma repetitioner per sida' }
	},
	'ninety-ninety-hip-switch': {
		bodyPart: 'Mobility', secondary: ['Hips'], effectiveness: 3,
		purposes: ['mobility', 'general'], equipment: ['None'], level: 'beginner',
		recommended: { en: '2-3 x 6-10 switches per side', fi: '2-3 x 6-10 vaihtoa puolta kohti', hu: '2-3 x 6-10 váltás oldalanként', sv: '2-3 x 6-10 byten per sida' }
	},
	'ball-seated-march': {
		bodyPart: 'Core', secondary: ['Hips', 'Core'], effectiveness: 3,
		purposes: ['mobility', 'general', 'rehab'], equipment: ['Exercise ball'], level: 'beginner',
		recommended: { en: '2-3 x 10-12 marches per side', fi: '2-3 x 10-12 marssia puolta kohti', hu: '2-3 x 10-12 menetelés oldalanként', sv: '2-3 x 10-12 marscher per sida' }
	},
	'ball-wall-squat': {
		bodyPart: 'Legs', secondary: ['Quads', 'Glutes'], effectiveness: 3,
		purposes: ['strength', 'general', 'rehab'], equipment: ['Exercise ball'], level: 'beginner',
		recommended: { en: '2-3 x 10-15 reps', fi: '2-3 x 10-15 toistoa', hu: '2-3 x 10-15 ismétlés', sv: '2-3 x 10-15 repetitioner' }
	},
	'ball-glute-bridge': {
		position: 'supine',
		bodyPart: 'Glutes', secondary: ['Glutes', 'Hamstrings', 'Core'], effectiveness: 3,
		purposes: ['strength', 'hypertrophy', 'general'], equipment: ['Exercise ball'], level: 'beginner',
		recommended: { en: '3 x 10-15 reps', fi: '3 x 10-15 toistoa', hu: '3 x 10-15 ismétlés', sv: '3 x 10-15 repetitioner' }
	},
	'ball-hamstring-curl': {
		position: 'supine',
		bodyPart: 'Legs', secondary: ['Hamstrings', 'Glutes', 'Core'], effectiveness: 4,
		purposes: ['strength', 'hypertrophy'], equipment: ['Exercise ball'], level: 'intermediate',
		recommended: { en: '3 x 8-12 reps', fi: '3 x 8-12 toistoa', hu: '3 x 8-12 ismétlés', sv: '3 x 8-12 repetitioner' }
	},
	'ball-stir-the-pot': {
		position: 'prone',
		bodyPart: 'Core', secondary: ['Core', 'Abs', 'Shoulders'], effectiveness: 4,
		purposes: ['strength', 'general'], equipment: ['Exercise ball'], level: 'advanced',
		recommended: { en: '2-3 x 5-8 circles per direction', fi: '2-3 x 5-8 ympyrää suuntaa kohti', hu: '2-3 x 5-8 kör irányonként', sv: '2-3 x 5-8 cirklar per riktning' }
	},
	'ball-thoracic-extension': {
		bodyPart: 'Mobility', secondary: ['Spine', 'Shoulders'], effectiveness: 3,
		purposes: ['mobility', 'posture'], equipment: ['Exercise ball'], level: 'beginner',
		recommended: { en: '1-2 x 5-8 slow reps or a 20-30 s hold', fi: '1-2 x 5-8 hidasta toistoa tai 20-30 s pito', hu: '1-2 x 5-8 lassú ismétlés vagy 20-30 mp tartás', sv: '1-2 x 5-8 långsamma reps eller 20-30 s håll' }
	},
	'arm-circles': { bodyPart: 'Mobility', secondary: ['Shoulders'], effectiveness: 3, purposes: ['mobility', 'general'], equipment: ['None'], level: 'beginner',
		recommended: { en: '1-2 x 10-15 s each direction', fi: '1-2 x 10-15 s kumpaankin suuntaan', hu: '1-2 x 10-15 mp mindkét irányba', sv: '1-2 x 10-15 s åt varje håll' } },
	'shoulder-rolls': { bodyPart: 'Mobility', secondary: ['Shoulders', 'Traps'], effectiveness: 3, purposes: ['mobility', 'posture'], equipment: ['None'], level: 'beginner',
		recommended: { en: '1-2 x 8-10 rolls each way', fi: '1-2 x 8-10 pyöritystä suuntaansa', hu: '1-2 x 8-10 körzés irányonként', sv: '1-2 x 8-10 rullningar åt varje håll' } },
	'hip-circles': { bodyPart: 'Mobility', secondary: ['Hips'], effectiveness: 3, purposes: ['mobility', 'general'], equipment: ['None'], level: 'beginner',
		recommended: { en: '1-2 x 8-10 circles each way', fi: '1-2 x 8-10 ympyrää suuntaansa', hu: '1-2 x 8-10 kör irányonként', sv: '1-2 x 8-10 cirklar åt varje håll' } },
	'torso-rotations': { bodyPart: 'Mobility', secondary: ['Spine', 'Obliques'], effectiveness: 3, purposes: ['mobility', 'general'], equipment: ['None'], level: 'beginner',
		recommended: { en: '1-2 x 10-12 rotations', fi: '1-2 x 10-12 kiertoa', hu: '1-2 x 10-12 forgatás', sv: '1-2 x 10-12 rotationer' } },
	'side-bends': { bodyPart: 'Mobility', secondary: ['Obliques', 'Spine'], effectiveness: 3, purposes: ['mobility', 'general'], equipment: ['None'], level: 'beginner',
		recommended: { en: '1-2 x 8-10 per side', fi: '1-2 x 8-10 puolta kohti', hu: '1-2 x 8-10 oldalanként', sv: '1-2 x 8-10 per sida' } },
	'standing-forward-bend': { bodyPart: 'Mobility', secondary: ['Hamstrings', 'Spine'], effectiveness: 3, purposes: ['mobility'], equipment: ['None'], level: 'beginner',
		recommended: { en: '1-2 x 5-8 slow reps', fi: '1-2 x 5-8 hidasta toistoa', hu: '1-2 x 5-8 lassú ismétlés', sv: '1-2 x 5-8 långsamma reps' } },
	'marching-in-place': { bodyPart: 'Mobility', secondary: ['Hips', 'Core'], effectiveness: 3, purposes: ['general', 'mobility', 'fat-loss'], equipment: ['None'], level: 'beginner',
		recommended: { en: '1-2 x 30-60 s', fi: '1-2 x 30-60 s', hu: '1-2 x 30-60 mp', sv: '1-2 x 30-60 s' } },
	'step-touch': { bodyPart: 'Mobility', secondary: ['Hips', 'Calves'], effectiveness: 3, purposes: ['general', 'mobility', 'fat-loss'], equipment: ['None'], level: 'beginner',
		recommended: { en: '1-2 x 30-60 s', fi: '1-2 x 30-60 s', hu: '1-2 x 30-60 mp', sv: '1-2 x 30-60 s' } },
	'ankle-circles': { bodyPart: 'Mobility', secondary: ['Calves'], effectiveness: 3, purposes: ['mobility', 'rehab'], equipment: ['None'], level: 'beginner',
		recommended: { en: '1-2 x 8-10 each way per foot', fi: '1-2 x 8-10 suuntaansa per jalka', hu: '1-2 x 8-10 irányonként lábanként', sv: '1-2 x 8-10 åt varje håll per fot' } },
	'leg-swings': { bodyPart: 'Mobility', secondary: ['Hips', 'Hamstrings'], effectiveness: 3, purposes: ['mobility', 'general'], equipment: ['None'], level: 'beginner',
		recommended: { en: '1-2 x 8-10 per leg', fi: '1-2 x 8-10 per jalka', hu: '1-2 x 8-10 lábanként', sv: '1-2 x 8-10 per ben' } },
	'inchworm-walkout': { position: 'prone', bodyPart: 'Mobility', secondary: ['Core', 'Hamstrings', 'Shoulders'], effectiveness: 3, purposes: ['mobility', 'general'], equipment: ['None'], level: 'beginner',
		recommended: { en: '1-2 x 4-6 walkouts', fi: '1-2 x 4-6 kävelyä', hu: '1-2 x 4-6 kilépés', sv: '1-2 x 4-6 utgångar' } },
	'low-impact-jacks': { bodyPart: 'Mobility', secondary: ['Shoulders', 'Calves'], effectiveness: 3, purposes: ['general', 'fat-loss', 'mobility'], equipment: ['None'], level: 'beginner',
		recommended: { en: '1-2 x 30-45 s', fi: '1-2 x 30-45 s', hu: '1-2 x 30-45 mp', sv: '1-2 x 30-45 s' } },
	'outdoor-walk': { bodyPart: 'Full body', secondary: ['Heart'], effectiveness: 3, purposes: ['endurance', 'general', 'fat-loss'], equipment: ['None'], level: 'beginner',
		recommended: { en: '10-20 min at a brisk pace', fi: '10-20 min reippaassa tahdissa', hu: '10-20 perc élénk tempóban', sv: '10-20 min i rask takt' } },
	'treadmill-walk': { bodyPart: 'Full body', secondary: ['Heart'], effectiveness: 3, purposes: ['endurance', 'general', 'fat-loss'], equipment: ['Treadmill'], level: 'beginner',
		recommended: { en: '10-15 min, easy pace', fi: '10-15 min, rauhallinen tahti', hu: '10-15 perc, könnyű tempó', sv: '10-15 min, lugnt tempo' } },
	'walking-pad-walk': { bodyPart: 'Full body', secondary: ['Heart'], effectiveness: 3, purposes: ['endurance', 'general', 'fat-loss'], equipment: ['Walking pad'], level: 'beginner',
		recommended: { en: '10-15 min, easy pace', fi: '10-15 min, rauhallinen tahti', hu: '10-15 perc, könnyű tempó', sv: '10-15 min, lugnt tempo' } },
	'stationary-bike-warmup': { bodyPart: 'Full body', secondary: ['Heart', 'Quads'], effectiveness: 3, purposes: ['endurance', 'general', 'fat-loss'], equipment: ['Exercise bike'], level: 'beginner',
		recommended: { en: '10 min, light resistance', fi: '10 min, kevyt vastus', hu: '10 perc, könnyű ellenállás', sv: '10 min, lätt motstånd' } },
	'rowing-warmup': { bodyPart: 'Full body', secondary: ['Heart', 'Back', 'Quads'], effectiveness: 3, purposes: ['endurance', 'general', 'fat-loss'], equipment: ['Rowing machine'], level: 'beginner',
		recommended: { en: '5-10 min, light stroke', fi: '5-10 min, kevyt veto', hu: '5-10 perc, könnyű húzás', sv: '5-10 min, lätt drag' } },
	'knee-pushup': { position: 'prone', diastasisCaution: true, bodyPart: 'Chest', secondary: ['Triceps', 'Front delts', 'Core'], effectiveness: 3, purposes: ['strength', 'endurance', 'general'], equipment: ['None'], level: 'beginner',
		recommended: { en: '2-3 x 8-15 reps', fi: '2-3 x 8-15 toistoa', hu: '2-3 x 8-15 ismétlés', sv: '2-3 x 8-15 repetitioner' } },
	'elevated-pushup': { position: 'prone', bodyPart: 'Chest', secondary: ['Triceps', 'Front delts', 'Core'], effectiveness: 3, purposes: ['strength', 'endurance', 'rehab', 'general'], equipment: ['Table', 'Bench'], equipmentAny: [['table', 'bench', 'chair']], level: 'beginner',
		recommended: { en: '2-3 x 8-15 reps', fi: '2-3 x 8-15 toistoa', hu: '2-3 x 8-15 ismétlés', sv: '2-3 x 8-15 repetitioner' } },
	'deep-supported-squat': { bodyPart: 'Mobility', secondary: ['Hips', 'Adductors'], effectiveness: 3, purposes: ['mobility', 'rehab'], equipment: ['None'], level: 'beginner',
		recommended: { en: '2-3 x 20-40 s hold', fi: '2-3 x 20-40 s pito', hu: '2-3 x 20-40 mp tartás', sv: '2-3 x 20-40 s håll' } },
	'birth-ball-hip-circles': { bodyPart: 'Mobility', secondary: ['Hips', 'Core'], effectiveness: 3, purposes: ['mobility', 'rehab'], equipment: ['Exercise ball'], level: 'beginner',
		recommended: { en: '1-2 x 8-10 circles each way', fi: '1-2 x 8-10 ympyrää suuntaansa', hu: '1-2 x 8-10 kör irányonként', sv: '1-2 x 8-10 cirklar åt varje håll' } },
	'birth-ball-rocking': { bodyPart: 'Mobility', secondary: ['Hips', 'Spine'], effectiveness: 3, purposes: ['mobility', 'rehab'], equipment: ['Exercise ball'], level: 'beginner',
		recommended: { en: '1-2 x 30-60 s', fi: '1-2 x 30-60 s', hu: '1-2 x 30-60 mp', sv: '1-2 x 30-60 s' } },
	'birth-ball-pelvic-tilt': { bodyPart: 'Mobility', secondary: ['Hips', 'Core'], effectiveness: 3, purposes: ['mobility', 'rehab'], equipment: ['Exercise ball'], level: 'beginner',
		recommended: { en: '1-2 x 8-12 tilts', fi: '1-2 x 8-12 kallistusta', hu: '1-2 x 8-12 billentés', sv: '1-2 x 8-12 tippningar' } },
	'birth-ball-bounce': { bodyPart: 'Mobility', secondary: ['Hips'], effectiveness: 2, purposes: ['mobility', 'general'], equipment: ['Exercise ball'], level: 'beginner',
		recommended: { en: '1-2 x 30-60 s gentle', fi: '1-2 x 30-60 s kevyesti', hu: '1-2 x 30-60 mp finoman', sv: '1-2 x 30-60 s mjukt' } },
	'standing-pelvic-tilt': { bodyPart: 'Mobility', secondary: ['Hips', 'Spine'], effectiveness: 3, purposes: ['mobility', 'posture', 'rehab'], equipment: ['None'], level: 'beginner',
		recommended: { en: '1-2 x 8-12 tilts', fi: '1-2 x 8-12 kallistusta', hu: '1-2 x 8-12 billentés', sv: '1-2 x 8-12 tippningar' } },
	'hands-knees-pelvic-tilt': { bodyPart: 'Mobility', secondary: ['Spine', 'Core'], effectiveness: 3, purposes: ['mobility', 'posture', 'rehab'], equipment: ['None'], level: 'beginner',
		recommended: { en: '1-2 x 8-12 tilts', fi: '1-2 x 8-12 kallistusta', hu: '1-2 x 8-12 billentés', sv: '1-2 x 8-12 tippningar' } },
	'butterfly-tailor-sitting': { bodyPart: 'Mobility', secondary: ['Hips', 'Adductors'], effectiveness: 3, purposes: ['mobility'], equipment: ['None'], level: 'beginner',
		recommended: { en: '2-3 x 20-40 s', fi: '2-3 x 20-40 s', hu: '2-3 x 20-40 mp', sv: '2-3 x 20-40 s' } },
	'side-lying-rest': { bodyPart: 'Mobility', secondary: ['Hips'], effectiveness: 2, purposes: ['mobility', 'general'], equipment: ['None'], level: 'beginner',
		recommended: { en: '1-3 min, relaxed breathing', fi: '1-3 min, rauhallinen hengitys', hu: '1-3 perc, nyugodt légzés', sv: '1-3 min, lugn andning' } },
	'pelvic-floor-kegel': { bodyPart: 'Core', secondary: ['Core'], effectiveness: 4, purposes: ['rehab', 'general'], equipment: ['None'], level: 'beginner',
		recommended: { en: '2-3 x 8-10 lifts with full release', fi: '2-3 x 8-10 nostoa ja täysi vapautus', hu: '2-3 x 8-10 emelés teljes elengedéssel', sv: '2-3 x 8-10 lyft med full avslappning' } }
};
