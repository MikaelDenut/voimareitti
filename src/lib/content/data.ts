// Voimareitti content model + seed data.
// Four languages: en (primary fallback) + fi / hu / sv.
// Names + cues are 4-language; the longer coaching fields are EN + FI (HU/SV fall back to EN
// until reviewed). All non-English strings carry correct diacritics - CLAUDE.md Hard Rule 2.

import { moreExercisesUpper } from './more-exercises-upper';
import { moreExercisesLower } from './more-exercises-lower';
// Loc + L and the About prose live in site-copy.ts (prose-only, no heavy imports) so light pages can
// pull them without the exercise dataset. Re-exported here so existing `from './data'` imports work.
import { L, type Loc } from './site-copy';
export { L };
export type { Loc };
export { aboutLead, aboutSteps } from './site-copy';

export type Pattern =
	| 'squat' | 'hinge' | 'push-h' | 'push-v' | 'pull-h' | 'pull-v' | 'lunge' | 'core' | 'calf'
	| 'mobility';
export type GoalId = 'strength' | 'hypertrophy' | 'fat-loss' | 'general';
export type NutritionGoalId = 'lose' | 'maintain' | 'gain';
export type EmphasisId = 'minimalist' | 'balanced' | 'high-volume';
export type SplitId = 'auto' | 'full-body' | 'upper-lower' | 'ppl';
export type Sex = 'male' | 'female' | 'unspecified';
export type Experience = 'beginner' | 'intermediate' | 'advanced';

const EXP_RANK: Record<Experience, number> = { beginner: 0, intermediate: 1, advanced: 2 };
export function expRank(e: Experience): number {
	return EXP_RANK[e];
}

// Muscle-group labels, localised. Engine stores English keys in Exercise.primary;
// the UI resolves them through muscle() so the cards read in the user's language.
const MUSCLES: Record<string, Loc> = {
	Quads: { en: 'Quads', fi: 'Etureidet', hu: 'Combfeszítő', sv: 'Framsida lår' },
	Glutes: { en: 'Glutes', fi: 'Pakarat', hu: 'Farizom', sv: 'Säte' },
	Hamstrings: { en: 'Hamstrings', fi: 'Takareidet', hu: 'Combhajlító', sv: 'Baksida lår' },
	Back: { en: 'Back', fi: 'Selkä', hu: 'Hát', sv: 'Rygg' },
	Chest: { en: 'Chest', fi: 'Rinta', hu: 'Mell', sv: 'Bröst' },
	Triceps: { en: 'Triceps', fi: 'Ojentajat', hu: 'Tricepsz', sv: 'Triceps' },
	'Front delts': { en: 'Front delts', fi: 'Etuolkapäät', hu: 'Elülső vállak', sv: 'Främre axlar' },
	Shoulders: { en: 'Shoulders', fi: 'Olkapäät', hu: 'Vállak', sv: 'Axlar' },
	Biceps: { en: 'Biceps', fi: 'Hauikset', hu: 'Bicepsz', sv: 'Biceps' },
	Core: { en: 'Core', fi: 'Keskivartalo', hu: 'Törzs', sv: 'Bål' },
	Calves: { en: 'Calves', fi: 'Pohkeet', hu: 'Vádli', sv: 'Vader' },
	Lats: { en: 'Lats', fi: 'Leveä selkälihas', hu: 'Széles hátizom', sv: 'Breda ryggmuskeln' },
	Traps: { en: 'Traps', fi: 'Epäkäslihas', hu: 'Csuklyásizom', sv: 'Kappmuskeln' },
	Rhomboids: { en: 'Rhomboids', fi: 'Suunnikaslihakset', hu: 'Rombuszizmok', sv: 'Romboiderna' },
	'Lower back': { en: 'Lower back', fi: 'Alaselkä', hu: 'Alsó hát', sv: 'Nedre rygg' },
	Forearms: { en: 'Forearms', fi: 'Kyynärvarret', hu: 'Alkar', sv: 'Underarmar' },
	'Side delts': { en: 'Side delts', fi: 'Sivuolkapäät', hu: 'Oldalsó vállak', sv: 'Sidoaxlar' },
	'Rear delts': { en: 'Rear delts', fi: 'Takaolkapäät', hu: 'Hátsó vállak', sv: 'Bakre axlar' },
	Abs: { en: 'Abs', fi: 'Vatsalihakset', hu: 'Hasizmok', sv: 'Magmuskler' },
	Obliques: { en: 'Obliques', fi: 'Vinot vatsalihakset', hu: 'Ferde hasizmok', sv: 'Sneda bukmuskler' },
	Adductors: { en: 'Adductors', fi: 'Lähentäjät', hu: 'Közelítők', sv: 'Adduktorer' },
	Abductors: { en: 'Abductors', fi: 'Loitontajat', hu: 'Távolítók', sv: 'Abduktorer' },
	Neck: { en: 'Neck', fi: 'Niska', hu: 'Nyak', sv: 'Nacke' },
	Hips: { en: 'Hips', fi: 'Lonkat', hu: 'Csípő', sv: 'Höfter' },
	Spine: { en: 'Spine', fi: 'Selkäranka', hu: 'Gerinc', sv: 'Ryggrad' },
	Heart: { en: 'Heart and lungs', fi: 'Sydän ja keuhkot', hu: 'Szív és tüdő', sv: 'Hjärta och lungor' }
};
export function muscle(key: string, lang: string): string {
	const m = MUSCLES[key];
	return m ? L(m, lang) : key;
}
export const muscleKeys = Object.keys(MUSCLES);

// Movement category for browsing (collapses horizontal/vertical push & pull).
export function categoryKey(p: Pattern): string {
	if (p === 'push-h' || p === 'push-v') return 'push';
	if (p === 'pull-h' || p === 'pull-v') return 'pull';
	return p; // squat | hinge | lunge | core | calf | mobility
}
export const categoryKeys = ['squat', 'hinge', 'push', 'pull', 'lunge', 'core', 'calf', 'mobility'];

// Coarse equipment requirement for filtering: nothing / home / gym.
export function equipmentNeed(minTier: number): 'none' | 'home' | 'gym' {
	return minTier === 0 ? 'none' : minTier >= 5 ? 'gym' : 'home';
}

export interface GoalFit {
	strength: number;
	hypertrophy: number;
	fatLoss: number;
	general: number;
}

export interface Exercise {
	id: string;
	name: Loc;
	pattern: Pattern;
	minTier: number;
	experienceMin: Experience;
	primary: string[];
	image?: string;
	unilateral?: boolean;
	cue: Loc;
	purpose: Loc;
	setup: Loc;
	mistakes: Loc;
	easier: Loc;
	harder: Loc;
	safety?: Loc;
	// Warm-up character for pattern 'mobility' moves: 'active' = dynamic/pulse-raising drill,
	// 'stretch' = static/positional. Absent = treated as 'stretch' (today's behaviour). Read by the
	// warm-up preference logic; does not affect the default warm-up output.
	warmupType?: 'active' | 'stretch' | 'cardio';
	// Short, practical "make it easier / stay safe" note shown inline on harder moves (e.g. pressing).
	modTips?: Loc;
	// Birth-preparation relevance by trimester [T1, T2, T3], 0-3. Present only on birth-prep moves; it
	// marks them as the birth-prep pool and weights their selection for pregnant users.
	prenatalWeight?: [number, number, number];
	fit: GoalFit;
}

const f = (s: number, h: number, fl: number, g: number): GoalFit => ({
	strength: s, hypertrophy: h, fatLoss: fl, general: g
});

const coreExercises: Exercise[] = [
	{
		id: 'bodyweight-squat',
		name: { en: 'Bodyweight squat', fi: 'Kyykky omalla painolla', hu: 'Saját testsúlyos guggolás', sv: 'Knäböj med kroppsvikt' },
		pattern: 'squat', minTier: 0, experienceMin: 'beginner', primary: ['Quads', 'Glutes'], image: 'bodyweight-squat',
		cue: { en: 'Sit back, knees track over toes, chest up.', fi: 'Istu taakse, polvet varpaiden suuntaan, rinta ylös.', hu: 'Ülj hátra, a térd a lábujjak felé néz, mellkas fel.', sv: 'Sätt dig bakåt, knäna i linje med tårna, bröstet upp.' },
		purpose: { en: 'Builds leg and glute strength with no equipment - the base lower-body movement.', fi: 'Vahvistaa jalkoja ja pakaroita ilman välineitä - alavartalon perusliike.', hu: 'Eszköz nélkül erősíti a lábat és a farizmokat - az alsótest alapgyakorlata.', sv: 'Bygger styrka i ben och säte utan redskap - underkroppens grundövning.' },
		setup: { en: 'Feet shoulder-width, toes slightly out, arms forward for balance.', fi: 'Jalat hartioiden levyisesti, varpaat hieman ulospäin, kädet eteen tasapainoksi.', hu: 'Vállszéles terpesz, lábujjak kissé kifelé, karok előre az egyensúly miatt.', sv: 'Fötterna axelbrett isär, tårna lätt utåt, armarna fram för balans.' },
		mistakes: { en: 'Knees caving inward, heels lifting, or only half-squatting.', fi: 'Polvet painuvat sisään, kantapäät nousevat tai kyykky jää puolikkaaksi.', hu: 'A térdek befelé esnek, a sarkak felemelkednek, vagy csak félig guggolsz le.', sv: 'Knäna faller inåt, hälarna lyfter eller du går bara halvvägs ner.' },
		easier: { en: 'Squat down onto a chair and stand back up.', fi: 'Kyykkää tuolille ja nouse takaisin ylös.', hu: 'Guggolj le egy székre, majd állj fel róla.', sv: 'Sätt dig ner på en stol och res dig upp igen.' },
		harder: { en: 'Lower for 3 seconds and pause at the bottom, or hold a weight.', fi: 'Laskeudu 3 sekunnissa ja pidä tauko ala-asennossa, tai pidä painoa.', hu: 'Ereszkedj 3 másodperc alatt, és tarts szünetet a mélyponton, vagy fogj egy súlyt.', sv: 'Sänk dig på 3 sekunder och pausa i botten, eller håll en vikt.' },
		fit: f(1, 2, 3, 3)
	},
	{
		id: 'chair-squat',
		name: { en: 'Chair sit-to-stand', fi: 'Tuolikyykky', hu: 'Felállás székről', sv: 'Uppresning från stol' },
		pattern: 'squat', minTier: 1, experienceMin: 'beginner', primary: ['Quads', 'Glutes'], image: 'chair-squat',
		cue: { en: 'Stand fully, control the way down to the chair.', fi: 'Nouse täyteen seisontaan, laskeudu hallitusti tuolille.', hu: 'Állj fel teljesen, kontrolláltan ereszkedj a székre.', sv: 'Res dig helt, sänk dig kontrollerat mot stolen.' },
		purpose: { en: 'A scalable squat that teaches depth and control using a chair as a target.', fi: 'Skaalautuva kyykky, joka opettaa syvyyttä ja hallintaa tuolin avulla.', hu: 'Skálázható guggolás, amely székkel mint célponttal tanítja a mélységet és a kontrollt.', sv: 'En anpassningsbar knäböj som lär ut djup och kontroll med stolen som mål.' },
		setup: { en: 'Sit tall on a sturdy chair, feet flat, weight in the heels.', fi: 'Istu ryhdikkäästi tukevalla tuolilla, jalat tasaisesti, paino kantapäillä.', hu: 'Ülj egyenes háttal egy stabil székre, talp a földön, súly a sarkadon.', sv: 'Sitt rak i ryggen på en stadig stol, fötterna i golvet, tyngden på hälarna.' },
		mistakes: { en: 'Flopping down, or yanking forward with momentum to stand.', fi: 'Pudottautuminen alas tai nykäisy eteen vauhdilla noustessa.', hu: 'Lehuppansz, vagy lendülettel rántod magad előre, hogy felállj.', sv: 'Att plumsa ner eller rycka dig framåt med fart för att resa dig.' },
		easier: { en: 'Use a higher chair or push lightly off your thighs.', fi: 'Käytä korkeampaa tuolia tai työnnä kevyesti reisistä.', hu: 'Használj magasabb széket, vagy told meg kicsit magad a combodról.', sv: 'Använd en högre stol eller skjut ifrån lätt mot låren.' },
		harder: { en: 'Use a lower seat or pause 2 seconds before standing.', fi: 'Käytä matalampaa istuinta tai pidä 2 sekunnin tauko ennen nousua.', hu: 'Használj alacsonyabb ülést, vagy tarts 2 másodperc szünetet felállás előtt.', sv: 'Använd en lägre sits eller pausa 2 sekunder innan du reser dig.' },
		fit: f(1, 2, 3, 3)
	},
	{
		id: 'goblet-squat',
		name: { en: 'Goblet squat', fi: 'Goblet-kyykky', hu: 'Gobletguggolás', sv: 'Gobletknäböj' },
		pattern: 'squat', minTier: 2, experienceMin: 'beginner', primary: ['Quads', 'Glutes'], image: 'goblet-squat',
		cue: { en: 'Hold the weight at the chest, squat deep.', fi: 'Pidä paino rinnan edessä, kyykkää syvään.', hu: 'Tartsd a súlyt a mellkasodnál, guggolj mélyre.', sv: 'Håll vikten vid bröstet, böj djupt.' },
		purpose: { en: 'Adds load to the squat while the front weight keeps your torso upright.', fi: 'Lisää kyykkyyn kuormaa; etupaino pitää ylävartalon pystyssä.', hu: 'Terhelést ad a guggoláshoz, miközben az elöl tartott súly egyenesen tartja a felsőtested.', sv: 'Lägger belastning på knäböjen medan vikten framtill håller överkroppen upprätt.' },
		setup: { en: 'Hold one dumbbell or kettlebell vertically against the chest.', fi: 'Pidä yhtä käsipainoa tai kahvakuulaa pystyssä rintaa vasten.', hu: 'Tarts egy kézisúlyzót vagy kettlebellt függőlegesen a mellkasodhoz.', sv: 'Håll en hantel eller kettlebell lodrätt mot bröstet.' },
		mistakes: { en: 'Letting the elbows and chest drop forward at the bottom.', fi: 'Kyynärpäät ja rinta valuvat eteen ala-asennossa.', hu: 'Hagyod, hogy a könyök és a mellkas előrebillenjen a mélyponton.', sv: 'Att låta armbågar och bröst falla framåt i botten.' },
		easier: { en: 'Use a lighter weight and a shallower depth.', fi: 'Käytä kevyempää painoa ja matalampaa syvyyttä.', hu: 'Használj könnyebb súlyt és kisebb mélységet.', sv: 'Använd en lättare vikt och mindre djup.' },
		harder: { en: 'Pause at the bottom or add reps before increasing weight.', fi: 'Pidä tauko ala-asennossa tai lisää toistoja ennen painon nostoa.', hu: 'Tarts szünetet a mélyponton, vagy adj hozzá ismétléseket, mielőtt növelnéd a súlyt.', sv: 'Pausa i botten eller lägg till repetitioner innan du ökar vikten.' },
		fit: f(2, 3, 3, 3)
	},
	{
		id: 'glute-bridge',
		name: { en: 'Glute bridge', fi: 'Lantionnosto', hu: 'Csípőemelés', sv: 'Höftlyft' },
		pattern: 'hinge', minTier: 0, experienceMin: 'beginner', primary: ['Glutes', 'Hamstrings'], image: 'glute-bridge',
		cue: { en: 'Drive through the heels, squeeze at the top.', fi: 'Työnnä kantapäistä, purista pakarat ylhäällä.', hu: 'Nyomj a sarkadon át, szorítsd össze felül.', sv: 'Tryck genom hälarna, knip till i toppen.' },
		purpose: { en: 'Teaches the hip hinge and builds glutes with zero equipment.', fi: 'Opettaa lonkkasaranan ja vahvistaa pakaroita ilman välineitä.', hu: 'Megtanítja a csípőhajlítást és eszköz nélkül erősíti a farizmokat.', sv: 'Lär ut höftfällningen och bygger sätesmuskler helt utan redskap.' },
		setup: { en: 'Lie on your back, knees bent, feet flat near your hips.', fi: 'Makaa selälläsi, polvet koukussa, jalat lähellä lantiota.', hu: 'Feküdj a hátadra, térdek behajlítva, talp a földön a csípőd közelében.', sv: 'Ligg på rygg, böjda knän, fötterna i golvet nära höften.' },
		mistakes: { en: 'Arching the lower back instead of squeezing the glutes.', fi: 'Alaselän notkistaminen pakaroiden puristamisen sijaan.', hu: 'A derekadat homorítod a farizmok megfeszítése helyett.', sv: 'Att svanka i ryggen i stället för att spänna sätet.' },
		easier: { en: 'Reduce range and hold the top briefly.', fi: 'Pienennä liikerataa ja pidä yläasentoa hetki.', hu: 'Csökkentsd a mozgástartományt, és tarts ki röviden a felső ponton.', sv: 'Minska rörelseomfånget och håll kvar en stund i toppen.' },
		harder: { en: 'Do one leg at a time or rest a weight on the hips.', fi: 'Tee yksi jalka kerrallaan tai aseta paino lantion päälle.', hu: 'Csináld egy lábbal, vagy tegyél súlyt a csípődre.', sv: 'Gör ett ben i taget eller lägg en vikt på höften.' },
		fit: f(1, 2, 2, 3)
	},
	{
		id: 'db-romanian-deadlift',
		name: { en: 'Dumbbell Romanian deadlift', fi: 'Romanialainen maastaveto käsipainoilla', hu: 'Román felhúzás kézisúlyzóval', sv: 'Rumänsk marklyft med hantlar' },
		pattern: 'hinge', minTier: 4, experienceMin: 'intermediate', primary: ['Hamstrings', 'Glutes', 'Back'], image: 'db-romanian-deadlift',
		cue: { en: 'Hinge at the hips, flat back, soft knees.', fi: 'Saranoi lonkista, selkä suorana, polvet pehmeinä.', hu: 'Csípőből hajolj, egyenes hát, lágy térd.', sv: 'Fäll i höften, rak rygg, mjuka knän.' },
		purpose: { en: 'The main hamstring and glute builder; trains the hinge under load.', fi: 'Tärkein takareisi- ja pakaraliike; harjoittaa saranaa kuormalla.', hu: 'A fő combhajlító- és farizomépítő gyakorlat; terhelés alatt edzi a csípőhajlítást.', sv: 'Den viktigaste övningen för baksida lår och säte; tränar höftfällningen med belastning.' },
		setup: { en: 'Stand with dumbbells in front of the thighs, feet hip-width.', fi: 'Seiso käsipainot reisien edessä, jalat lantion levyisesti.', hu: 'Állj kézisúlyzókkal a combod előtt, csípőszéles terpeszben.', sv: 'Stå med hantlar framför låren, fötterna höftbrett isär.' },
		mistakes: { en: 'Rounding the back or turning it into a squat.', fi: 'Selän pyöristäminen tai liikkeen muuttuminen kyykyksi.', hu: 'Lekerekíted a hátad, vagy guggolássá alakítod a mozdulatot.', sv: 'Att runda ryggen eller göra om det till en knäböj.' },
		easier: { en: 'Use lighter weights and a shorter range to the shins.', fi: 'Käytä kevyempiä painoja ja lyhyempää liikerataa sääriin asti.', hu: 'Használj könnyebb súlyokat és rövidebb mozgástartományt, lábszárig.', sv: 'Använd lättare vikter och kortare rörelseomfång ner till smalbenen.' },
		harder: { en: 'Slow the lowering or do single-leg variations.', fi: 'Hidasta laskua tai tee yhden jalan muunnoksia.', hu: 'Lassítsd az ereszkedést, vagy csináld egy lábon.', sv: 'Sänk vikten långsammare eller gör enbensvarianter.' },
		safety: { en: 'Stop if you feel it in your lower back instead of the hamstrings.', fi: 'Lopeta, jos tunnet sen alaselässä etkä takareisissä.', hu: 'Hagyd abba, ha a derekadban érzed a combhajlítók helyett.', sv: 'Sluta om du känner det i ländryggen i stället för i baksida lår.' },
		fit: f(3, 3, 2, 2)
	},
	{
		id: 'wall-pushup',
		name: { en: 'Wall push-up', fi: 'Seinäpunnerrus', hu: 'Fali fekvőtámasz', sv: 'Väggarmhävning' },
		pattern: 'push-h', minTier: 0, experienceMin: 'beginner', primary: ['Chest', 'Triceps', 'Front delts'], image: 'wall-pushup',
		cue: { en: 'Body in one line, elbows about 45 degrees.', fi: 'Vartalo suorana, kyynärpäät noin 45 astetta.', hu: 'Test egy vonalban, könyök kb. 45 fok.', sv: 'Kroppen i en linje, armbågar cirka 45 grader.' },
		purpose: { en: 'The easiest push-up entry point; builds chest and triceps standing up.', fi: 'Helpoin punnerruksen aloitustapa; vahvistaa rintaa ja ojentajia pystyssä.', hu: 'A legkönnyebb fekvőtámasz-belépő; állva erősíti a mellet és a tricepszet.', sv: 'Den enklaste ingången till armhävningar; bygger bröst och triceps stående.' },
		setup: { en: 'Hands on a wall at shoulder height, step the feet back.', fi: 'Kädet seinälle hartioiden korkeudelle, astu jalat taakse.', hu: 'Kezek a falon vállmagasságban, lépj a lábaddal hátra.', sv: 'Händerna mot väggen i axelhöjd, kliv bakåt med fötterna.' },
		mistakes: { en: 'Sagging hips or flaring the elbows straight out.', fi: 'Lantio valuu tai kyynärpäät levitetään suoraan sivulle.', hu: 'Leesik a csípő, vagy egyenesen oldalra lebegteted a könyököt.', sv: 'Att svanka med höften eller flänga ut armbågarna rakt åt sidan.' },
		easier: { en: 'Stand closer to the wall.', fi: 'Seiso lähempänä seinää.', hu: 'Állj közelebb a falhoz.', sv: 'Stå närmare väggen.' },
		harder: { en: 'Step further back, or move to an incline on a table.', fi: 'Astu kauemmas, tai siirry vinopunnerrukseen pöytää vasten.', hu: 'Lépj távolabb, vagy válts ferde fekvőtámaszra egy asztalon.', sv: 'Kliv längre bakåt, eller gå över till lutande armhävning mot ett bord.' },
		fit: f(1, 1, 2, 3)
	},
	{
		id: 'pushup',
		name: { en: 'Push-up', fi: 'Punnerrus', hu: 'Fekvőtámasz', sv: 'Armhävning' },
		pattern: 'push-h', minTier: 0, experienceMin: 'intermediate', primary: ['Chest', 'Triceps', 'Front delts'], image: 'pushup',
		modTips: { en: 'Too hard? Drop to your knees, or put your hands on a raised surface or a wall. Stop if you feel pain.', fi: 'Liian rankka? Laske polvet maahan tai aseta kädet korokkeelle tai seinää vasten. Lopeta, jos tunnet kipua.', hu: 'Túl nehéz? Ereszkedj térdre, vagy tedd a kezed megemelt felületre vagy falra. Állj le, ha fájdalmat érzel.', sv: 'För svårt? Gå ner på knäna, eller lägg händerna på en förhöjd yta eller en vägg. Sluta om du känner smärta.' },
		cue: { en: 'Full plank, lower the chest with control.', fi: 'Täysi lankku, laske rinta hallitusti.', hu: 'Teljes plank, kontrolláltan engedd le a mellkast.', sv: 'Full planka, sänk bröstet kontrollerat.' },
		purpose: { en: 'A complete upper-body push that also trains the core as a plank.', fi: 'Täysipainoinen ylävartalon työntö, joka harjoittaa myös keskivartaloa lankkuna.', hu: 'Teljes értékű felsőtest-toló gyakorlat, amely plankként a törzset is edzi.', sv: 'En komplett press för överkroppen som även tränar bålen som en planka.' },
		setup: { en: 'Hands under shoulders, body straight from head to heels.', fi: 'Kädet hartioiden alla, vartalo suorana päästä kantapäihin.', hu: 'Kezek a váll alatt, test egyenes a fejtől a sarkadig.', sv: 'Händerna under axlarna, kroppen rak från huvud till hälar.' },
		mistakes: { en: 'Dropping the hips or only doing half the range.', fi: 'Lantion valuminen tai vain puolikas liikerata.', hu: 'Leejted a csípőt, vagy csak fél mozgástartományt csinálsz.', sv: 'Att tappa höften eller bara gå halva vägen ner.' },
		easier: { en: 'Put your hands on a table or do them on your knees.', fi: 'Aseta kädet pöydälle tai tee polviltasi.', hu: 'Tedd a kezed egy asztalra, vagy csináld térdről.', sv: 'Lägg händerna på ett bord eller gör dem på knäna.' },
		harder: { en: 'Slow the lowering, pause at the bottom, or elevate the feet.', fi: 'Hidasta laskua, pidä tauko alhaalla tai nosta jalat koholle.', hu: 'Lassítsd az ereszkedést, tarts szünetet a mélyponton, vagy emeld meg a lábad.', sv: 'Sänk dig långsammare, pausa i botten eller höj upp fötterna.' },
		fit: f(2, 3, 3, 3)
	},
	{
		id: 'band-press',
		name: { en: 'Band chest press', fi: 'Kuminauhapunnerrus', hu: 'Gumiszalagos mellnyomás', sv: 'Bröstpress med band' },
		pattern: 'push-h', minTier: 3, experienceMin: 'beginner', primary: ['Chest', 'Triceps'], image: 'band-press',
		cue: { en: 'Band behind the back, press forward and squeeze.', fi: 'Kuminauha selän takana, työnnä eteen ja purista.', hu: 'Szalag a hát mögött, nyomd előre és szorítsd.', sv: 'Bandet bakom ryggen, pressa framåt och knip.' },
		purpose: { en: 'A joint-friendly chest press with smooth, adjustable resistance.', fi: 'Nivelystävällinen rintaprässi tasaisella, säädettävällä vastuksella.', hu: 'Ízületkímélő mellnyomás egyenletes, állítható ellenállással.', sv: 'En ledvänlig bröstpress med jämnt, justerbart motstånd.' },
		setup: { en: 'Loop the band across your upper back, ends in each hand.', fi: 'Pujota kuminauha yläselän yli, päät käsiin.', hu: 'Vezesd át a gumiszalagot a felső hátadon, a végeit fogd kézbe.', sv: 'Lägg bandet över övre delen av ryggen, ändarna i varsin hand.' },
		mistakes: { en: 'Letting the band snap back instead of resisting it.', fi: 'Kuminauhan annetaan napsahtaa takaisin vastustamisen sijaan.', hu: 'Hagyod visszacsapódni a szalagot, ahelyett hogy fékeznéd.', sv: 'Att låta bandet snärta tillbaka i stället för att bromsa det.' },
		easier: { en: 'Use a lighter band or grip it further out.', fi: 'Käytä kevyempää kuminauhaa tai ota ote kauempaa.', hu: 'Használj gyengébb szalagot, vagy fogd meg távolabb.', sv: 'Använd ett lättare band eller ta greppet längre ut.' },
		harder: { en: 'Use a stronger band or add a pause at full reach.', fi: 'Käytä vahvempaa kuminauhaa tai pidä tauko ääriasennossa.', hu: 'Használj erősebb szalagot, vagy tarts szünetet a teljes kinyújtásnál.', sv: 'Använd ett hårdare band eller pausa i ytterläget.' },
		fit: f(2, 3, 2, 2)
	},
	{
		id: 'db-bench-press',
		name: { en: 'Dumbbell bench press', fi: 'Penkkipunnerrus käsipainoilla', hu: 'Fekvenyomás kézisúlyzóval', sv: 'Bänkpress med hantlar' },
		pattern: 'push-h', minTier: 4, experienceMin: 'intermediate', primary: ['Chest', 'Triceps', 'Front delts'], image: 'db-bench-press',
		cue: { en: 'Lower to the chest, press up and together.', fi: 'Laske rinnalle, työnnä ylös ja yhteen.', hu: 'Engedd a mellkashoz, nyomd fel és össze.', sv: 'Sänk mot bröstet, pressa upp och ihop.' },
		purpose: { en: 'Loaded horizontal press for chest size and pushing strength.', fi: 'Kuormitettu vaakatyöntö rinnan kasvuun ja työntövoimaan.', hu: 'Terhelt vízszintes nyomás a mellkas méretéért és a tolóerőért.', sv: 'Belastad horisontell press för bröstmassa och presstyrka.' },
		setup: { en: 'Lie on a bench, dumbbells over the chest, feet planted.', fi: 'Makaa penkillä, käsipainot rinnan yllä, jalat tukevasti.', hu: 'Feküdj a padra, kézisúlyzók a mellkas felett, talp a földön.', sv: 'Ligg på en bänk, hantlarna över bröstet, fötterna stadigt i golvet.' },
		mistakes: { en: 'Bouncing the weights or flaring the elbows to 90 degrees.', fi: 'Painojen pomputtelu tai kyynärpäiden levittäminen 90 asteeseen.', hu: 'Megpattintod a súlyokat, vagy 90 fokra kinyitod a könyököt.', sv: 'Att studsa vikterna eller flänga ut armbågarna till 90 grader.' },
		easier: { en: 'Use lighter dumbbells or press on the floor.', fi: 'Käytä kevyempiä käsipainoja tai työnnä lattialla.', hu: 'Használj könnyebb kézisúlyzókat, vagy nyomj a földön.', sv: 'Använd lättare hantlar eller pressa på golvet.' },
		harder: { en: 'Slow the lowering or add a pause on the chest.', fi: 'Hidasta laskua tai pidä tauko rinnalla.', hu: 'Lassítsd az ereszkedést, vagy tarts szünetet a mellkason.', sv: 'Sänk dig långsammare eller pausa vikten vid bröstet.' },
		fit: f(3, 3, 2, 2)
	},
	{
		id: 'band-overhead-press',
		name: { en: 'Band overhead press', fi: 'Pystypunnerrus kuminauhalla', hu: 'Vállból nyomás gumiszalaggal', sv: 'Press över huvudet med band' },
		pattern: 'push-v', minTier: 3, experienceMin: 'beginner', primary: ['Shoulders', 'Triceps'], image: 'band-overhead-press',
		cue: { en: 'Stand on the band, press overhead.', fi: 'Seiso kuminauhan päällä, työnnä pään yli.', hu: 'Állj a szalagra, nyomd a fejed fölé.', sv: 'Stå på bandet, pressa över huvudet.' },
		purpose: { en: 'Builds shoulders overhead with band tension that spares the joints.', fi: 'Vahvistaa olkapäitä pään yli kuminauhan vastuksella, joka säästää niveliä.', hu: 'A fej fölött erősíti a vállat ízületkímélő gumiszalag-ellenállással.', sv: 'Bygger axlar över huvudet med bandmotstånd som skonar lederna.' },
		setup: { en: 'Stand on the middle of the band, handles at the shoulders.', fi: 'Seiso kuminauhan keskellä, kahvat hartioilla.', hu: 'Állj a gumiszalag közepére, a fogantyúk a válladnál.', sv: 'Stå mitt på bandet, handtagen vid axlarna.' },
		mistakes: { en: 'Leaning back and turning it into a chest press.', fi: 'Taaksepäin nojaaminen ja liikkeen muuttuminen rintaprässiksi.', hu: 'Hátradőlsz, és mellnyomássá alakítod a mozdulatot.', sv: 'Att luta dig bakåt och göra om det till en bröstpress.' },
		easier: { en: 'Step off some of the band for less tension.', fi: 'Astu osittain pois kuminauhalta vähentääksesi vastusta.', hu: 'Lépj le a szalag egy részéről a kisebb ellenállásért.', sv: 'Kliv av en del av bandet för mindre motstånd.' },
		harder: { en: 'Shorten the band or press one arm at a time.', fi: 'Lyhennä kuminauhaa tai työnnä yksi käsi kerrallaan.', hu: 'Rövidítsd le a szalagot, vagy nyomj egy karral egyszerre.', sv: 'Korta av bandet eller pressa en arm i taget.' },
		fit: f(2, 2, 2, 2)
	},
	{
		id: 'db-shoulder-press',
		name: { en: 'Dumbbell shoulder press', fi: 'Pystypunnerrus käsipainoilla', hu: 'Vállból nyomás kézisúlyzóval', sv: 'Axelpress med hantlar' },
		pattern: 'push-v', minTier: 4, experienceMin: 'intermediate', primary: ['Shoulders', 'Triceps'], image: 'db-shoulder-press',
		cue: { en: 'Press from the shoulders to overhead.', fi: 'Työnnä olkapäiltä pään yli.', hu: 'Nyomd a vállból a fejed fölé.', sv: 'Pressa från axlarna upp över huvudet.' },
		purpose: { en: 'Loaded overhead press for shoulder strength and size.', fi: 'Kuormitettu pystytyöntö olkapäiden voimaan ja kokoon.', hu: 'Terhelt vállból nyomás a vállerőért és -méretért.', sv: 'Belastad press över huvudet för axelstyrka och muskelmassa.' },
		setup: { en: 'Sit or stand tall, dumbbells at shoulder height, core braced.', fi: 'Istu tai seiso ryhdikkäästi, käsipainot hartioilla, keskivartalo jännitettynä.', hu: 'Ülj vagy állj egyenesen, kézisúlyzók vállmagasságban, törzs megfeszítve.', sv: 'Sitt eller stå rak, hantlarna i axelhöjd, spänd bål.' },
		mistakes: { en: 'Over-arching the lower back to push the weight up.', fi: 'Alaselän liiallinen notkistus painon nostamiseksi.', hu: 'Túlzottan homorítod a derekad, hogy felnyomd a súlyt.', sv: 'Att överdriva svanken i ländryggen för att pressa upp vikten.' },
		easier: { en: 'Use lighter dumbbells or press seated with back support.', fi: 'Käytä kevyempiä painoja tai työnnä istuen selkätuella.', hu: 'Használj könnyebb kézisúlyzókat, vagy nyomj ülve háttámasszal.', sv: 'Använd lättare hantlar eller pressa sittande med ryggstöd.' },
		harder: { en: 'Slow the lowering or pause at the top.', fi: 'Hidasta laskua tai pidä tauko yläasennossa.', hu: 'Lassítsd az ereszkedést, vagy tarts szünetet a felső ponton.', sv: 'Sänk dig långsammare eller pausa i toppen.' },
		fit: f(3, 3, 2, 2)
	},
	{
		id: 'inverted-row',
		name: { en: 'Inverted row (under a table)', fi: 'Kehonpainosoutu pöydän alla', hu: 'Fordított evezés (asztal alatt)', sv: 'Australisk rodd (under ett bord)' },
		pattern: 'pull-h', minTier: 1, experienceMin: 'beginner', primary: ['Back', 'Biceps'], image: 'inverted-row',
		cue: { en: 'Pull the chest to the edge, squeeze the blades.', fi: 'Vedä rinta reunaan, purista lapaluut yhteen.', hu: 'Húzd a mellkast a szélhez, szorítsd össze a lapockákat.', sv: 'Dra bröstet mot kanten, knip ihop skulderbladen.' },
		purpose: { en: 'A horizontal pull for the back using only a sturdy table.', fi: 'Vaakaveto selälle pelkän tukevan pöydän avulla.', hu: 'Vízszintes húzás a hátnak, mindössze egy stabil asztallal.', sv: 'En horisontell rodd för ryggen med bara ett stadigt bord.' },
		setup: { en: 'Lie under a sturdy table, grip the edge, body straight.', fi: 'Makaa tukevan pöydän alla, ota ote reunasta, vartalo suorana.', hu: 'Feküdj egy stabil asztal alá, fogd meg a szélét, test egyenes.', sv: 'Ligg under ett stadigt bord, greppa kanten, kroppen rak.' },
		mistakes: { en: 'Letting the hips sag or shrugging the shoulders up.', fi: 'Lantion valuminen tai hartioiden kohautus ylös.', hu: 'Leesik a csípő, vagy felhúzod a vállad.', sv: 'Att låta höften hänga eller dra upp axlarna.' },
		easier: { en: 'Bend the knees and walk the feet in.', fi: 'Koukista polvet ja siirrä jalat lähemmäs.', hu: 'Hajlítsd be a térded, és lépj közelebb a lábaddal.', sv: 'Böj knäna och flytta in fötterna.' },
		harder: { en: 'Straighten the legs or elevate the feet.', fi: 'Suorista jalat tai nosta jalat koholle.', hu: 'Nyújtsd ki a lábad, vagy emeld meg a lábfejed.', sv: 'Sträck ut benen eller höj upp fötterna.' },
		safety: { en: 'Make sure the table is stable enough to hold your weight.', fi: 'Varmista, että pöytä kestää painosi tukevasti.', hu: 'Győződj meg róla, hogy az asztal elég stabil, hogy megtartsa a súlyod.', sv: 'Se till att bordet är stabilt nog att bära din tyngd.' },
		fit: f(2, 2, 2, 3)
	},
	{
		id: 'band-row',
		name: { en: 'Band row', fi: 'Kuminauhasoutu', hu: 'Gumiszalagos evezés', sv: 'Rodd med band' },
		pattern: 'pull-h', minTier: 3, experienceMin: 'beginner', primary: ['Back', 'Biceps'], image: 'band-row',
		cue: { en: 'Pull the elbows back, squeeze the shoulder blades.', fi: 'Vedä kyynärpäät taakse, purista lapaluut yhteen.', hu: 'Húzd hátra a könyököt, szorítsd össze a lapockákat.', sv: 'Dra armbågarna bakåt, knip ihop skulderbladen.' },
		purpose: { en: 'A back-builder with adjustable band tension; great at home.', fi: 'Selän vahvistaja säädettävällä kuminauhan vastuksella; loistava kotona.', hu: 'Hátépítő gyakorlat állítható gumiszalag-ellenállással; otthon kiváló.', sv: 'En ryggbyggare med justerbart bandmotstånd; perfekt hemma.' },
		setup: { en: 'Anchor the band at waist height (or around the feet), sit or stand tall.', fi: 'Kiinnitä kuminauha vyötärön korkeudelle (tai jalkojen ympärille), istu tai seiso ryhdikkäästi.', hu: 'Rögzítsd a szalagot derékmagasságban (vagy a lábad köré), ülj vagy állj egyenesen.', sv: 'Förankra bandet i midjehöjd (eller runt fötterna), sitt eller stå rak.' },
		mistakes: { en: 'Pulling with the arms only and rounding the upper back.', fi: 'Vetäminen vain käsillä ja yläselän pyöristäminen.', hu: 'Csak a karoddal húzol, és lekerekíted a felső hátad.', sv: 'Att dra bara med armarna och runda övre delen av ryggen.' },
		easier: { en: 'Step closer to the anchor for less tension.', fi: 'Astu lähemmäs kiinnityspistettä vähentääksesi vastusta.', hu: 'Lépj közelebb a rögzítési ponthoz a kisebb ellenállásért.', sv: 'Kliv närmare förankringen för mindre motstånd.' },
		harder: { en: 'Use a stronger band or pause at the squeeze.', fi: 'Käytä vahvempaa kuminauhaa tai pidä tauko puristuksessa.', hu: 'Használj erősebb szalagot, vagy tarts szünetet az összehúzásnál.', sv: 'Använd ett hårdare band eller pausa när du klämmer ihop.' },
		fit: f(2, 3, 2, 3)
	},
	{
		id: 'dumbbell-row',
		name: { en: 'One-arm dumbbell row', fi: 'Yhden käden soutu', hu: 'Egykezes kézisúlyzós evezés', sv: 'Enarmsrodd med hantel' },
		pattern: 'pull-h', minTier: 2, experienceMin: 'beginner', primary: ['Back', 'Biceps'], image: 'dumbbell-row', unilateral: true,
		cue: { en: 'Hinge, pull the weight to the hip.', fi: 'Saranoi, vedä paino lonkalle.', hu: 'Hajolj, húzd a súlyt a csípődhöz.', sv: 'Fäll framåt, dra vikten mot höften.' },
		purpose: { en: 'A loaded back row needing only one weight and a bench or chair.', fi: 'Kuormitettu selkäsoutu, joka vaatii vain yhden painon ja penkin tai tuolin.', hu: 'Terhelt hátevezés, amelyhez csak egy súly és egy pad vagy szék kell.', sv: 'En belastad ryggrodd som bara kräver en vikt och en bänk eller stol.' },
		setup: { en: 'One hand and knee on a bench, flat back, weight hanging down.', fi: 'Yksi käsi ja polvi penkillä, selkä suorana, paino roikkuu alhaalla.', hu: 'Egy kéz és térd a padon, egyenes hát, a súly lóg lefelé.', sv: 'En hand och ett knä på bänken, rak rygg, vikten hänger rakt ner.' },
		mistakes: { en: 'Twisting the torso or using momentum to swing the weight.', fi: 'Ylävartalon kiertäminen tai vauhdin käyttö painon heilauttamiseen.', hu: 'Megcsavarod a törzsed, vagy lendülettel löksz a súllyal.', sv: 'Att vrida överkroppen eller svinga upp vikten med fart.' },
		easier: { en: 'Use a lighter weight and a shorter range.', fi: 'Käytä kevyempää painoa ja lyhyempää liikerataa.', hu: 'Használj könnyebb súlyt és rövidebb mozgástartományt.', sv: 'Använd en lättare vikt och kortare rörelseomfång.' },
		harder: { en: 'Pause at the top and lower over 3 seconds.', fi: 'Pidä tauko yläasennossa ja laske 3 sekunnissa.', hu: 'Tarts szünetet a felső ponton, és ereszd 3 másodperc alatt.', sv: 'Pausa i toppen och sänk på 3 sekunder.' },
		fit: f(3, 3, 2, 2)
	},
	{
		id: 'reverse-lunge',
		name: { en: 'Reverse lunge', fi: 'Askelkyykky taakse', hu: 'Hátralépő kitörés', sv: 'Bakåtutfall' },
		pattern: 'lunge', minTier: 0, experienceMin: 'beginner', primary: ['Quads', 'Glutes'], unilateral: true, image: 'reverse-lunge',
		cue: { en: 'Step back, both knees about 90 degrees.', fi: 'Astu taakse, molemmat polvet noin 90 astetta.', hu: 'Lépj hátra, mindkét térd kb. 90 fok.', sv: 'Kliv bakåt, båda knäna cirka 90 grader.' },
		purpose: { en: 'Single-leg strength and balance; gentler on the knees than forward lunges.', fi: 'Yhden jalan voima ja tasapaino; polville hellävaraisempi kuin eteen askellus.', hu: 'Egylábas erő és egyensúly; kíméletesebb a térdnek, mint az előre kitörés.', sv: 'Enbensstyrka och balans; skonsammare mot knäna än utfall framåt.' },
		setup: { en: 'Stand tall, hands on hips, step one foot straight back.', fi: 'Seiso ryhdikkäästi, kädet lantiolla, astu toinen jalka suoraan taakse.', hu: 'Állj egyenesen, kezek a csípőn, lépj az egyik lábaddal egyenesen hátra.', sv: 'Stå rak, händerna på höften, kliv ett ben rakt bakåt.' },
		mistakes: { en: 'Short steps that push the front knee past the toes.', fi: 'Liian lyhyet askeleet, jolloin etupolvi ylittää varpaat.', hu: 'Túl rövid lépések, amelyektől a mellső térd túlnyúlik a lábujjakon.', sv: 'För korta steg som låter främre knät passera tårna.' },
		easier: { en: 'Hold a wall or chair for balance, smaller range.', fi: 'Pidä kiinni seinästä tai tuolista tasapainon vuoksi, pienempi liikerata.', hu: 'Fogódzz a falba vagy egy székbe az egyensúlyért, kisebb mozgástartomány.', sv: 'Håll i en vägg eller stol för balans, mindre rörelseomfång.' },
		harder: { en: 'Hold weights or pause at the bottom.', fi: 'Pidä painoja tai pidä tauko ala-asennossa.', hu: 'Fogj súlyokat, vagy tarts szünetet a mélyponton.', sv: 'Håll vikter eller pausa i botten.' },
		fit: f(1, 2, 3, 3)
	},
	{
		id: 'bulgarian-split-squat',
		name: { en: 'Bulgarian split squat', fi: 'Bulgarialainen askelkyykky', hu: 'Bolgár kitörés', sv: 'Bulgarisk split squat' },
		pattern: 'lunge', minTier: 1, experienceMin: 'intermediate', primary: ['Quads', 'Glutes'], unilateral: true, image: 'bulgarian-split-squat',
		cue: { en: 'Rear foot on a chair, lower straight down.', fi: 'Takajalka tuolilla, laskeudu suoraan alas.', hu: 'Hátsó láb a széken, ereszkedj egyenesen le.', sv: 'Bakre foten på en stol, sänk rakt ner.' },
		purpose: { en: 'A demanding single-leg builder that loads quads and glutes hard.', fi: 'Vaativa yhden jalan liike, joka kuormittaa etureisiä ja pakaroita voimakkaasti.', hu: 'Igényes egylábas gyakorlat, amely keményen terheli a combot és a farizmokat.', sv: 'En krävande enbensövning som belastar framsida lår och säte hårt.' },
		setup: { en: 'Rear foot on a chair behind you, front foot a stride ahead.', fi: 'Takajalka tuolilla takanasi, etujalka askeleen verran edessä.', hu: 'A hátsó lábfej egy mögötted lévő széken, a mellső láb egy lépéssel előrébb.', sv: 'Bakre foten på en stol bakom dig, främre foten ett steg fram.' },
		mistakes: { en: 'Leaning too far forward or letting the front knee cave.', fi: 'Liiallinen eteenpäin nojaaminen tai etupolven painuminen sisään.', hu: 'Túlságosan előredőlsz, vagy hagyod a mellső térdet befelé esni.', sv: 'Att luta dig för långt fram eller låta främre knät falla inåt.' },
		easier: { en: 'Lower the rear foot or hold a support.', fi: 'Laske takajalka alemmas tai pidä kiinni tuesta.', hu: 'Tedd lejjebb a hátsó lábad, vagy fogódzz meg egy támaszba.', sv: 'Sänk bakre foten eller håll i ett stöd.' },
		harder: { en: 'Hold dumbbells or slow the lowering.', fi: 'Pidä käsipainoja tai hidasta laskua.', hu: 'Fogj kézisúlyzókat, vagy lassítsd az ereszkedést.', sv: 'Håll hantlar eller sänk dig långsammare.' },
		fit: f(2, 3, 3, 2)
	},
	{
		id: 'plank',
		name: { en: 'Forearm plank', fi: 'Lankku', hu: 'Alkartámasz (plank)', sv: 'Underarmsplanka' },
		pattern: 'core', minTier: 0, experienceMin: 'beginner', primary: ['Core'], image: 'plank',
		cue: { en: 'Brace the core, hips level, hold.', fi: 'Jännitä keskivartalo, lantio linjassa, pidä.', hu: 'Feszítsd a törzset, csípő egy vonalban, tartsd.', sv: 'Spänn bålen, höften i linje, håll.' },
		purpose: { en: 'Builds core stability and a stronger, more protected lower back.', fi: 'Vahvistaa keskivartalon tukevuutta ja suojaa alaselkää.', hu: 'Erősíti a törzs stabilitását, és erősebbé, védettebbé teszi a derekat.', sv: 'Bygger bålstabilitet och en starkare, mer skyddad ländrygg.' },
		setup: { en: 'Forearms under shoulders, body straight, toes on the floor.', fi: 'Kyynärvarret hartioiden alla, vartalo suorana, varpaat lattialla.', hu: 'Alkarok a váll alatt, test egyenes, lábujjak a földön.', sv: 'Underarmarna under axlarna, kroppen rak, tårna i golvet.' },
		mistakes: { en: 'Hips sagging down or piking up too high.', fi: 'Lantio valuu alas tai nousee liian ylös.', hu: 'A csípő leesik, vagy túl magasra emelkedik.', sv: 'Att låta höften sjunka eller höja stjärten för högt.' },
		easier: { en: 'Plank from the knees or against a table.', fi: 'Lankku polvilta tai pöytää vasten.', hu: 'Plankelj térdről, vagy egy asztalnak támaszkodva.', sv: 'Gör plankan från knäna eller mot ett bord.' },
		harder: { en: 'Hold longer, or lift one foot at a time.', fi: 'Pidä pidempään tai nosta yksi jalka kerrallaan.', hu: 'Tarts ki tovább, vagy emeld fel egyszerre az egyik lábad.', sv: 'Håll längre, eller lyft en fot i taget.' },
		fit: f(2, 2, 2, 3)
	},
	{
		id: 'bird-dog',
		name: { en: 'Bird-dog', fi: 'Lintukoira', hu: 'Térdelő átlós nyújtás (bird-dog)', sv: 'Bird-dog' },
		pattern: 'core', minTier: 0, experienceMin: 'beginner', primary: ['Core', 'Glutes'], image: 'bird-dog',
		cue: { en: 'Extend opposite arm and leg, keep the back flat.', fi: 'Ojenna vastakkainen käsi ja jalka, pidä selkä suorana.', hu: 'Nyújtsd az ellentétes kart és lábat, tartsd egyenesen a hátad.', sv: 'Sträck motsatt arm och ben, håll ryggen rak.' },
		purpose: { en: 'A gentle anti-rotation core drill that is kind to the back.', fi: 'Hellävarainen kiertoa vastustava keskivartaloliike, joka säästää selkää.', hu: 'Kíméletes, forgásnak ellenálló törzsgyakorlat, amely védi a hátat.', sv: 'En skonsam antirotationsövning för bålen som är snäll mot ryggen.' },
		setup: { en: 'On all fours, hands under shoulders, knees under hips.', fi: 'Konttausasennossa, kädet hartioiden alla, polvet lantion alla.', hu: 'Négykézláb, kezek a váll alatt, térdek a csípő alatt.', sv: 'Stå på alla fyra, händerna under axlarna, knäna under höften.' },
		mistakes: { en: 'Twisting the hips or arching the lower back.', fi: 'Lantion kiertäminen tai alaselän notkistaminen.', hu: 'Megcsavarod a csípőd, vagy homorítod a derekad.', sv: 'Att vrida höften eller svanka i ländryggen.' },
		easier: { en: 'Extend just the leg, then just the arm.', fi: 'Ojenna ensin vain jalka, sitten vain käsi.', hu: 'Először csak a lábat nyújtsd ki, aztán csak a kart.', sv: 'Sträck ut bara benet, sedan bara armen.' },
		harder: { en: 'Pause 2 seconds at full extension each rep.', fi: 'Pidä 2 sekunnin tauko ääriasennossa joka toistolla.', hu: 'Tarts 2 másodperc szünetet a teljes kinyújtásnál minden ismétlésnél.', sv: 'Pausa 2 sekunder i ytterläget på varje repetition.' },
		fit: f(1, 1, 2, 3)
	},
	{
		id: 'dumbbell-curl',
		name: { en: 'Dumbbell biceps curl', fi: 'Hauiskääntö', hu: 'Bicepszhajlítás kézisúlyzóval', sv: 'Bicepscurl med hantel' },
		pattern: 'pull-v', minTier: 2, experienceMin: 'beginner', primary: ['Biceps'], image: 'dumbbell-curl',
		cue: { en: 'Curl with control, no swinging.', fi: 'Kääntö hallitusti, ei heilautusta.', hu: 'Hajlíts kontrolláltan, lendítés nélkül.', sv: 'Curla kontrollerat, utan att svinga.' },
		purpose: { en: 'Direct biceps work to round out arm and pulling development.', fi: 'Suora hauisliike täydentämään käsien ja vetojen kehitystä.', hu: 'Közvetlen bicepszmunka a kar- és húzófejlődés kiegészítésére.', sv: 'Direkt biceparbete som kompletterar utvecklingen av armar och drag.' },
		setup: { en: 'Stand tall, dumbbells at your sides, elbows tucked in.', fi: 'Seiso ryhdikkäästi, käsipainot sivuilla, kyynärpäät kiinni kyljissä.', hu: 'Állj egyenesen, kézisúlyzók a tested mellett, könyökök a törzshez húzva.', sv: 'Stå rak, hantlarna längs sidorna, armbågarna intill kroppen.' },
		mistakes: { en: 'Swinging with the back or moving the elbows forward.', fi: 'Heilautus selästä tai kyynärpäiden vieminen eteen.', hu: 'A hátaddal lendítesz, vagy előrehozod a könyököd.', sv: 'Att svinga med ryggen eller föra armbågarna framåt.' },
		easier: { en: 'Use a lighter weight or curl one arm at a time.', fi: 'Käytä kevyempää painoa tai käännä yksi käsi kerrallaan.', hu: 'Használj könnyebb súlyt, vagy hajlíts egy karral egyszerre.', sv: 'Använd en lättare vikt eller curla en arm i taget.' },
		harder: { en: 'Lower over 3 seconds or pause at the top.', fi: 'Laske 3 sekunnissa tai pidä tauko yläasennossa.', hu: 'Ereszd 3 másodperc alatt, vagy tarts szünetet a felső ponton.', sv: 'Sänk på 3 sekunder eller pausa i toppen.' },
		fit: f(1, 3, 1, 2)
	},
	{
		id: 'calf-raise',
		name: { en: 'Calf raise', fi: 'Varvasnousu', hu: 'Vádliemelés', sv: 'Tåhävning' },
		pattern: 'calf', minTier: 0, experienceMin: 'beginner', primary: ['Calves'], image: 'calf-raise',
		cue: { en: 'Rise onto the balls of the feet, control down.', fi: 'Nouse päkiöille, laske hallitusti.', hu: 'Emelkedj a lábujjhegyre, kontrolláltan le.', sv: 'Res dig på trampdynorna, sänk kontrollerat.' },
		purpose: { en: 'Strengthens the calves and ankles for walking, running and jumping.', fi: 'Vahvistaa pohkeita ja nilkkoja kävelyä, juoksua ja hyppyjä varten.', hu: 'Erősíti a vádlit és a bokát a járáshoz, futáshoz és ugráshoz.', sv: 'Stärker vader och vrister för gång, löpning och hopp.' },
		setup: { en: 'Stand tall, feet hip-width, near a wall for balance.', fi: 'Seiso ryhdikkäästi, jalat lantion levyisesti, seinän lähellä tasapainoksi.', hu: 'Állj egyenesen, csípőszéles terpesz, fal közelében az egyensúly miatt.', sv: 'Stå rak, fötterna höftbrett isär, nära en vägg för balans.' },
		mistakes: { en: 'Bouncing quickly instead of a full, controlled range.', fi: 'Nopea pomppiminen täyden, hallitun liikeradan sijaan.', hu: 'Gyorsan pattogsz a teljes, kontrollált mozgástartomány helyett.', sv: 'Att studsa snabbt i stället för fullt, kontrollerat rörelseomfång.' },
		easier: { en: 'Hold a wall and use both feet.', fi: 'Pidä kiinni seinästä ja käytä molempia jalkoja.', hu: 'Fogódzz a falba, és használd mindkét lábad.', sv: 'Håll i en vägg och använd båda fötterna.' },
		harder: { en: 'Do one leg at a time or pause at the top.', fi: 'Tee yksi jalka kerrallaan tai pidä tauko yläasennossa.', hu: 'Csináld egy lábbal, vagy tarts szünetet a felső ponton.', sv: 'Gör ett ben i taget eller pausa i toppen.' },
		fit: f(1, 2, 1, 2)
	},

	// Mobility / warm-up track (tier 0, no equipment). fit favours general.
	{
		id: 'cat-cow',
		name: { en: 'Cat-cow', fi: 'Kissa-lehmä', hu: 'Macska-tehén', sv: 'Katt-ko' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Spine', 'Core'], image: 'cat-cow',
		cue: { en: 'On all fours, alternate arching and rounding the back slowly.', fi: 'Konttausasennossa vuorottele selän notkistusta ja pyöristystä rauhallisesti.', hu: 'Négykézláb lassan váltakozva domborítsd és homorítsd a hátad.', sv: 'På alla fyra, växla långsamt mellan att svanka och runda ryggen.' },
		purpose: { en: 'Warms up the spine and eases morning stiffness.', fi: 'Lämmittää selkärangan ja helpottaa aamujäykkyyttä.', hu: 'Bemelegíti a gerincet, és enyhíti a reggeli merevséget.', sv: 'Värmer upp ryggraden och lättar morgonstelhet.' },
		setup: { en: 'On all fours, hands under shoulders, knees under hips.', fi: 'Konttausasennossa, kädet hartioiden alla, polvet lantion alla.', hu: 'Négykézláb, kezek a váll alatt, térdek a csípő alatt.', sv: 'Stå på alla fyra, händerna under axlarna, knäna under höften.' },
		mistakes: { en: 'Rushing instead of moving with the breath.', fi: 'Kiirehtiminen hengityksen tahtiin liikkumisen sijaan.', hu: 'Kapkodsz ahelyett, hogy a légzéseddel együtt mozognál.', sv: 'Att stressa i stället för att röra dig i takt med andningen.' },
		easier: { en: 'Use a smaller range of motion.', fi: 'Käytä pienempää liikerataa.', hu: 'Használj kisebb mozgástartományt.', sv: 'Använd ett mindre rörelseomfång.' },
		harder: { en: 'Add a longer pause at each end.', fi: 'Lisää pidempi tauko kummassakin ääriasennossa.', hu: 'Tarts hosszabb szünetet mindkét végponton.', sv: 'Lägg till en längre paus i varje ytterläge.' },
		fit: f(1, 1, 1, 3)
	},
	{
		id: 'hip-flexor-stretch',
		name: { en: 'Kneeling hip-flexor stretch', fi: 'Lonkankoukistajan venytys polviasennossa', hu: 'Térdelő csípőhajlító nyújtás', sv: 'Knästående höftböjarstretch' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Hips', 'Quads'], image: 'hip-flexor-stretch',
		cue: { en: 'Half-kneel, tuck the hips, gently push forward.', fi: 'Toispolviseisonta, kallista lantiota, työnnä varovasti eteen.', hu: 'Fél térdre, döntsd a csípőt, finoman told előre.', sv: 'Halvt knästående, tippa höften, skjut försiktigt framåt.' },
		purpose: { en: 'Opens tight hips from long hours of sitting.', fi: 'Avaa istumisesta jäykistyneet lonkat.', hu: 'Megnyitja a sok üléstől merevvé vált csípőt.', sv: 'Öppnar upp stela höfter efter långa timmar av stillasittande.' },
		setup: { en: 'Kneel on one knee, other foot flat in front, tall torso.', fi: 'Polvistu toiselle polvelle, toinen jalka edessä, ylävartalo ryhdikkäänä.', hu: 'Térdelj az egyik térdedre, a másik talp elöl a földön, törzs egyenes.', sv: 'Stå på ett knä, andra foten platt framför, rak överkropp.' },
		mistakes: { en: 'Arching the lower back instead of tucking the hips.', fi: 'Alaselän notkistaminen lantion kallistamisen sijaan.', hu: 'Homorítod a derekad ahelyett, hogy alábillentenéd a csípőd.', sv: 'Att svanka i ländryggen i stället för att tippa höften under.' },
		easier: { en: 'Reduce the forward shift.', fi: 'Pienennä eteenpäin siirtymistä.', hu: 'Csökkentsd az előre tolódás mértékét.', sv: 'Minska hur långt fram du skjuter.' },
		harder: { en: 'Reach the same-side arm overhead.', fi: 'Vie saman puolen käsi pään yli.', hu: 'Nyújtsd az azonos oldali karod a fejed fölé.', sv: 'Sträck upp armen på samma sida över huvudet.' },
		fit: f(1, 1, 1, 3)
	},
	{
		id: 'world-greatest-stretch',
		name: { en: "World's greatest stretch", fi: 'Maailman paras venytys', hu: 'A világ legjobb nyújtása', sv: 'Världens bästa stretch' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Hips', 'Spine', 'Shoulders'],
		cue: { en: 'Deep lunge, drop the elbow inside, then rotate the chest open.', fi: 'Syvä askelkyykky, vie kyynärpää sisäpuolelle, kierrä sitten rinta auki.', hu: 'Mély kitörés, vidd a könyököt belülre, majd nyisd ki a mellkast forgatva.', sv: 'Djupt utfall, sänk armbågen på insidan, rotera sedan upp bröstet.' },
		purpose: { en: 'A full-body warm-up for hips, spine and shoulders in one move.', fi: 'Koko kehon lämmittely lonkille, selkärangalle ja olkapäille yhdellä liikkeellä.', hu: 'Teljes testes bemelegítés a csípőnek, gerincnek és vállnak egyetlen mozdulatban.', sv: 'En helkroppsuppvärmning för höfter, rygg och axlar i en enda rörelse.' },
		setup: { en: 'Step into a deep lunge, both hands on the floor inside the front foot.', fi: 'Astu syvään askelkyykkyyn, molemmat kädet lattialle etujalan sisäpuolelle.', hu: 'Lépj mély kitörésbe, mindkét kéz a földön a mellső lábfej belső oldalán.', sv: 'Kliv ner i ett djupt utfall, båda händerna i golvet innanför främre foten.' },
		mistakes: { en: 'Rushing the rotation or holding your breath.', fi: 'Kierron kiirehtiminen tai hengityksen pidättäminen.', hu: 'Elkapkodod a forgatást, vagy visszatartod a lélegzeted.', sv: 'Att stressa rotationen eller hålla andan.' },
		easier: { en: 'Keep the rear knee on the floor.', fi: 'Pidä takapolvi lattiassa.', hu: 'Tartsd a hátsó térded a földön.', sv: 'Håll bakre knät i golvet.' },
		harder: { en: 'Add a longer hold at the open rotation.', fi: 'Lisää pidempi pito avoimessa kierrossa.', hu: 'Tarts hosszabb kitartást a nyitott forgatásnál.', sv: 'Lägg till en längre paus i öppna rotationen.' },
		fit: f(1, 1, 2, 3)
	},
	{
		id: 'thoracic-rotation',
		name: { en: 'Thoracic rotation', fi: 'Rintarangan kierto', hu: 'Háti gerinc rotáció', sv: 'Bröstryggsrotation' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Spine', 'Shoulders'], image: 'thoracic-rotation',
		cue: { en: 'On all fours, hand behind the head, rotate the elbow up and open.', fi: 'Konttausasennossa, käsi pään takana, kierrä kyynärpää ylös ja auki.', hu: 'Négykézláb, kéz a fej mögött, forgasd a könyököt felfelé és kifelé.', sv: 'På alla fyra, handen bakom huvudet, rotera armbågen uppåt och öppna.' },
		purpose: { en: 'Restores upper-back rotation for pressing and pulling.', fi: 'Palauttaa yläselän kiertoliikkuvuuden työntöihin ja vetoihin.', hu: 'Helyreállítja a felső hát forgómozgékonyságát a nyomásokhoz és húzásokhoz.', sv: 'Återställer rotationen i bröstryggen för press och drag.' },
		setup: { en: 'On all fours, one hand behind the head.', fi: 'Konttausasennossa, toinen käsi pään takana.', hu: 'Négykézláb, egyik kéz a fej mögött.', sv: 'Stå på alla fyra, en hand bakom huvudet.' },
		mistakes: { en: 'Rotating from the lower back instead of the upper back.', fi: 'Kierto tulee alaselästä yläselän sijaan.', hu: 'A derékból forgatsz a felső hát helyett.', sv: 'Att rotera från ländryggen i stället för bröstryggen.' },
		easier: { en: 'Smaller rotation, hand on the lower back.', fi: 'Pienempi kierto, käsi alaselällä.', hu: 'Kisebb forgatás, kéz a deréknál.', sv: 'Mindre rotation, handen på ländryggen.' },
		harder: { en: 'Pause at the top of each rotation.', fi: 'Pidä tauko jokaisen kierron ääriasennossa.', hu: 'Tarts szünetet minden forgatás végpontján.', sv: 'Pausa i toppen av varje rotation.' },
		fit: f(1, 1, 1, 3)
	}
];

// Exercise-ball (stability / Swiss / birth ball) moves. Tier 1 home equipment.
// No health claims (Hard Rule 15): framed as mobility/strength/stability, not "healthy air"-style benefits.
const ballExercises: Exercise[] = [
	{
		id: 'ball-seated-march',
		name: { en: 'Seated ball march', fi: 'Istuva pallomarssi', hu: 'Ülő labdamenetelés', sv: 'Sittande bollmarsch' },
		pattern: 'core', minTier: 1, experienceMin: 'beginner', primary: ['Core', 'Hips'], image: 'ball-seated-march',
		cue: { en: 'Sit tall on the ball, lift one knee, stay balanced.', fi: 'Istu ryhdikkäästi pallolla, nosta toinen polvi, pysy tasapainossa.', hu: 'Ülj egyenesen a labdán, emeld az egyik térded, maradj egyensúlyban.', sv: 'Sitt rak på bollen, lyft ett knä, håll balansen.' },
		purpose: { en: 'A gentle seated balance and core drill; comfortable for most levels.', fi: 'Hellävarainen istuva tasapaino- ja keskivartaloliike; sopii useimmille tasoille.', hu: 'Kíméletes ülő egyensúly- és törzsgyakorlat; a legtöbb szintnek kényelmes.', sv: 'En mjuk sittande balans- och bålövning; bekväm för de flesta nivåer.' },
		setup: { en: 'Sit on the centre of a stability ball, feet flat hip-width, spine tall.', fi: 'Istu jumppapallon keskelle, jalat lattiassa lantion levyisesti, selkä ryhdikkäänä.', hu: 'Ülj a fitneszlabda közepére, talp a talajon csípőszélességben, gerinc egyenes.', sv: 'Sitt mitt på en pilatesboll, fötterna platt i höftbredd, ryggen rak.' },
		mistakes: { en: 'Slumping the back or letting the ball roll away.', fi: 'Selän lysähtäminen tai pallon karkaaminen.', hu: 'A hát megroggyanása vagy a labda elgurulni hagyása.', sv: 'Att tappa hållningen i ryggen eller låta bollen rulla iväg.' },
		easier: { en: 'Keep both feet down and just shift weight side to side.', fi: 'Pidä molemmat jalat maassa ja siirrä vain painoa puolelta toiselle.', hu: 'Tartsd mindkét lábad a talajon, és csak helyezd át a súlyt oldalról oldalra.', sv: 'Håll båda fötterna i golvet och flytta bara vikten från sida till sida.' },
		harder: { en: 'Lift the knee higher or add a slow opposite-arm reach.', fi: 'Nosta polvi korkeammalle tai lisää hidas vastakkaisen käden ojennus.', hu: 'Emeld magasabbra a térded, vagy adj hozzá egy lassú, ellentétes karú nyújtást.', sv: 'Lyft knät högre eller lägg till en långsam sträckning med motsatt arm.' },
		fit: f(1, 1, 2, 3)
	},
	{
		id: 'ball-wall-squat',
		name: { en: 'Ball wall squat', fi: 'Palloseinäkyykky', hu: 'Labdás fali guggolás', sv: 'Bollväggsknäböj' },
		pattern: 'squat', minTier: 1, experienceMin: 'beginner', primary: ['Quads', 'Glutes'], image: 'ball-wall-squat',
		cue: { en: 'Ball behind your back on the wall, squat down and up.', fi: 'Pallo selän takana seinää vasten, kyykkää alas ja ylös.', hu: 'A labda a hátad mögött a falon, guggolj le és fel.', sv: 'Bollen bakom ryggen mot väggen, böj ner och upp.' },
		purpose: { en: 'A supported squat; the ball guides a smooth, controlled path.', fi: 'Tuettu kyykky; pallo ohjaa tasaisen, hallitun liikeradan.', hu: 'Megtámasztott guggolás; a labda sima, kontrollált mozgáspályát vezet.', sv: 'En stödd knäböj; bollen styr en jämn, kontrollerad rörelsebana.' },
		setup: { en: 'Place a stability ball between your lower back and a wall, feet a step forward.', fi: 'Aseta jumppapallo alaselän ja seinän väliin, jalat askel eteen.', hu: 'Helyezz egy fitneszlabdát a derekad és a fal közé, a lábad egy lépéssel előrébb.', sv: 'Placera en pilatesboll mellan ländryggen och en vägg, fötterna ett steg framåt.' },
		mistakes: { en: 'Knees caving in or letting the ball slip up to the neck.', fi: 'Polvet painuvat sisään tai pallo luiskahtaa niskaan.', hu: 'A térd befelé dőlése, vagy a labda felcsúszása a tarkóhoz.', sv: 'Att knäna faller inåt eller att bollen glider upp mot nacken.' },
		easier: { en: 'Squat to a shallow depth.', fi: 'Kyykkää matalalle syvyydelle.', hu: 'Guggolj csak sekély mélységig.', sv: 'Böj bara till ett grunt djup.' },
		harder: { en: 'Pause at the bottom or hold a light weight at the chest.', fi: 'Pidä tauko ala-asennossa tai pidä kevyt paino rinnalla.', hu: 'Tarts szünetet az alsó ponton, vagy tarts egy könnyű súlyt a mellkasodnál.', sv: 'Pausa i botten eller håll en lätt vikt vid bröstet.' },
		fit: f(1, 2, 2, 3)
	},
	{
		id: 'ball-glute-bridge',
		name: { en: 'Feet-on-ball glute bridge', fi: 'Lantionnosto jalat pallolla', hu: 'Csípőemelés lábbal a labdán', sv: 'Höftlyft med fötter på boll' },
		pattern: 'hinge', minTier: 1, experienceMin: 'beginner', primary: ['Glutes', 'Hamstrings'], image: 'ball-glute-bridge',
		cue: { en: 'Heels on the ball, drive the hips up, squeeze the glutes.', fi: 'Kantapäät pallolla, työnnä lantio ylös, purista pakarat.', hu: 'Sarkak a labdán, told fel a csípőt, szorítsd a farizmot.', sv: 'Hälarna på bollen, lyft höften, knip ihop sätet.' },
		purpose: { en: 'Adds a balance challenge to the glute bridge via the unstable ball.', fi: 'Lisää lantionnostoon tasapainohaastetta epävakaan pallon avulla.', hu: 'Egyensúlyi kihívással bővíti a csípőemelést az instabil labda révén.', sv: 'Lägger till en balansutmaning i höftlyftet via den instabila bollen.' },
		setup: { en: 'Lie on your back, heels on a stability ball, arms flat for support.', fi: 'Makaa selälläsi, kantapäät jumppapallolla, kädet lattialla tueksi.', hu: 'Feküdj a hátadra, sarkak a fitneszlabdán, karok a talajon a támasztáshoz.', sv: 'Ligg på rygg, hälarna på en pilatesboll, armarna platt för stöd.' },
		mistakes: { en: 'Arching the lower back or letting the ball wobble loose.', fi: 'Alaselän notkistaminen tai pallon holtiton heiluminen.', hu: 'A derék behomorítása, vagy a labda szabad ingadozni hagyása.', sv: 'Att svanka ländryggen eller låta bollen vingla löst.' },
		easier: { en: 'Rest the calves on the ball for a wider base.', fi: 'Lepuuta pohkeita pallolla leveämmän tuen saamiseksi.', hu: 'Támaszd a vádlidat a labdára a szélesebb alaphoz.', sv: 'Vila vaderna på bollen för en bredare bas.' },
		harder: { en: 'Bridge on one leg or add a slow ball curl-in.', fi: 'Tee yhdellä jalalla tai lisää hidas pallon veto kohti lantiota.', hu: 'Emelj egy lábon, vagy adj hozzá egy lassú labdabehúzást a csípő felé.', sv: 'Lyft på ett ben eller lägg till en långsam inrullning av bollen.' },
		fit: f(1, 2, 2, 3)
	},
	{
		id: 'ball-hamstring-curl',
		name: { en: 'Ball hamstring curl', fi: 'Takareisikääntö pallolla', hu: 'Combhajlító labdával', sv: 'Lårcurl med boll' },
		pattern: 'hinge', minTier: 1, experienceMin: 'intermediate', primary: ['Hamstrings', 'Glutes'], image: 'ball-hamstring-curl',
		cue: { en: 'Hips lifted, curl the ball toward you with the heels.', fi: 'Lantio ylhäällä, vedä palloa kohti kantapäillä.', hu: 'Csípő felemelve, húzd magad felé a labdát a sarkaddal.', sv: 'Höften lyft, rulla bollen mot dig med hälarna.' },
		purpose: { en: 'A loaded hamstring curl using bodyweight and the rolling ball.', fi: 'Kuormitettu takareisikääntö kehonpainolla ja vierivällä pallolla.', hu: 'Terhelt combhajlítás saját testsúllyal és a guruló labdával.', sv: 'En belastad lårcurl med kroppsvikt och den rullande bollen.' },
		setup: { en: 'Lie on your back, heels on the ball, lift the hips into a bridge.', fi: 'Makaa selälläsi, kantapäät pallolla, nosta lantio siltaan.', hu: 'Feküdj a hátadra, sarkak a labdán, emeld a csípőd hídba.', sv: 'Ligg på rygg, hälarna på bollen, lyft höften till en bro.' },
		mistakes: { en: 'Dropping the hips as the ball rolls in.', fi: 'Lantion valuminen, kun pallo vierii sisään.', hu: 'A csípő leejtése, miközben a labda begurul.', sv: 'Att tappa höften medan bollen rullar in.' },
		easier: { en: 'Curl with both legs and a smaller range.', fi: 'Vedä molemmilla jaloilla ja lyhyemmällä liikeradalla.', hu: 'Húzz mindkét lábbal és kisebb mozgástartományban.', sv: 'Curla med båda benen och ett mindre rörelseomfång.' },
		harder: { en: 'Slow the return or progress toward one leg.', fi: 'Hidasta paluuta tai etene kohti yhtä jalkaa.', hu: 'Lassítsd a visszatérést, vagy haladj egy láb felé.', sv: 'Sänk returen långsammare eller gå mot ett ben.' },
		fit: f(2, 3, 2, 2)
	},
	{
		id: 'ball-stir-the-pot',
		name: { en: 'Ball stir-the-pot', fi: 'Pallon sekoitus (stir-the-pot)', hu: 'Kavarás a labdán', sv: 'Rör-i-grytan på boll' },
		pattern: 'core', minTier: 1, experienceMin: 'advanced', primary: ['Core', 'Abs'], image: 'ball-stir-the-pot',
		cue: { en: 'Forearms on the ball in a plank, draw small circles.', fi: 'Kyynärvarret pallolla lankussa, piirrä pieniä ympyröitä.', hu: 'Alkarok a labdán plankben, rajzolj kis köröket.', sv: 'Underarmar på bollen i planka, rita små cirklar.' },
		purpose: { en: 'A demanding anti-movement core exercise for trunk stability.', fi: 'Vaativa liikettä vastustava keskivartaloliike vartalon tukevuuteen.', hu: 'Megterhelő, mozgást gátló törzsgyakorlat a törzs stabilitásáért.', sv: 'En krävande anti-rörelse-bålövning för bålstabilitet.' },
		setup: { en: 'Forearms on a stability ball, body straight in a plank, feet wide.', fi: 'Kyynärvarret jumppapallolla, vartalo suorana lankussa, jalat leveällä.', hu: 'Alkarok egy fitneszlabdán, test egyenesen plankben, láb szélesen.', sv: 'Underarmarna på en pilatesboll, kroppen rak i en planka, fötterna brett isär.' },
		mistakes: { en: 'Letting the hips sag or the lower back arch.', fi: 'Lantion valuminen tai alaselän notkistuminen.', hu: 'A csípő megereszkedése vagy a derék behomorítása.', sv: 'Att låta höften sjunka eller ländryggen svanka.' },
		easier: { en: 'Hold a still plank on the ball without circling.', fi: 'Pidä paikallaan oleva lankku pallolla ilman ympyröitä.', hu: 'Tarts egy mozdulatlan plankot a labdán körzés nélkül.', sv: 'Håll en stilla planka på bollen utan att cirkla.' },
		harder: { en: 'Make the circles bigger or bring the feet closer.', fi: 'Tee ympyröistä suurempia tai tuo jalat lähemmäs.', hu: 'Csinálj nagyobb köröket, vagy húzd közelebb a lábad.', sv: 'Gör cirklarna större eller för fötterna närmare ihop.' },
		safety: { en: 'Skip if you cannot hold a solid plank yet.', fi: 'Jätä väliin, jos et vielä hallitse tukevaa lankkua.', hu: 'Hagyd ki, ha még nem tudsz stabil plankot tartani.', sv: 'Hoppa över om du inte kan hålla en stabil planka än.' },
		fit: f(2, 2, 2, 3)
	},
	{
		id: 'ball-thoracic-extension',
		name: { en: 'Ball thoracic extension', fi: 'Rintarangan ojennus pallolla', hu: 'Háti gerinc nyújtás labdán', sv: 'Bröstryggsextension på boll' },
		pattern: 'mobility', minTier: 1, experienceMin: 'beginner', primary: ['Spine', 'Shoulders'], image: 'ball-thoracic-extension',
		cue: { en: 'Drape the upper back over the ball, open the chest gently.', fi: 'Anna yläselän laskeutua pallon yli, avaa rintaa rauhallisesti.', hu: 'Engedd a felső hátad a labdára, nyisd a mellkast finoman.', sv: 'Låt övre ryggen vila över bollen, öppna bröstet mjukt.' },
		purpose: { en: 'A gentle upper-back mobility stretch over the ball.', fi: 'Hellävarainen yläselän liikkuvuusvenytys pallon yli.', hu: 'Kíméletes felsőháti mozgékonysági nyújtás a labda fölött.', sv: 'En mjuk rörlighetsstretch för övre ryggen över bollen.' },
		setup: { en: 'Sit in front of the ball, lean back so it supports the upper back.', fi: 'Istu pallon eteen, nojaa taakse niin että se tukee yläselkää.', hu: 'Ülj a labda elé, dőlj hátra, hogy az megtámassza a felső hátadat.', sv: 'Sitt framför bollen, luta dig bakåt så att den stöttar övre ryggen.' },
		mistakes: { en: 'Forcing the range or holding the breath.', fi: 'Liikeradan pakottaminen tai hengityksen pidättäminen.', hu: 'A mozgástartomány erőltetése vagy a légzés visszatartása.', sv: 'Att tvinga fram rörelseomfånget eller hålla andan.' },
		easier: { en: 'Keep the hips low and the range small.', fi: 'Pidä lantio matalalla ja liikerata pienenä.', hu: 'Tartsd a csípőd alacsonyan és a mozgástartományt kicsiben.', sv: 'Håll höften låg och rörelseomfånget litet.' },
		harder: { en: 'Reach the arms overhead for a deeper opening.', fi: 'Ojenna kädet pään yli syvempää avausta varten.', hu: 'Nyújtsd a karod a fejed fölé a mélyebb nyitásért.', sv: 'Sträck armarna över huvudet för en djupare öppning.' },
		fit: f(1, 1, 1, 3)
	}
];

// Active warm-up / dynamic mobility drills (pattern 'mobility', no equipment). warmupType 'active'
// marks them as pulse-raising/dynamic vs the static stretches. They are available via mobility
// add/swap now; the warm-up preference (later) selects them. Default warm-up output is unchanged.
const warmupExercises: Exercise[] = [
	{
		id: 'arm-circles', name: { en: 'Arm circles', fi: 'Käsien pyöritys', hu: 'Karkörzés', sv: 'Armcirklar' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Shoulders'], image: 'arm-circles', warmupType: 'active',
		cue: { en: 'Arms out to the sides, draw steady circles.', fi: 'Kädet sivuille, piirrä tasaisia ympyröitä.', hu: 'Karok oldalra, rajzolj egyenletes köröket.', sv: 'Armarna ut åt sidorna, rita jämna cirklar.' },
		purpose: { en: 'Warms up the shoulders and gets the blood moving.', fi: 'Lämmittää olkapäät ja saa veren liikkeelle.', hu: 'Bemelegíti a vállat, és beindítja a vérkeringést.', sv: 'Värmer upp axlarna och får blodet i rörelse.' },
		setup: { en: 'Stand tall, feet shoulder-width, arms extended to the sides.', fi: 'Seiso ryhdikkäästi, jalat hartioiden levyisesti, kädet sivuille ojennettuina.', hu: 'Állj egyenesen, láb vállszélességben, karok oldalra nyújtva.', sv: 'Stå rak, fötterna i axelbredd, armarna utsträckta åt sidorna.' },
		mistakes: { en: 'Shrugging the shoulders up toward the ears.', fi: 'Hartioiden kohauttaminen kohti korvia.', hu: 'A vállak felhúzása a fülek felé.', sv: 'Att dra upp axlarna mot öronen.' },
		easier: { en: 'Make smaller circles.', fi: 'Tee pienempiä ympyröitä.', hu: 'Csinálj kisebb köröket.', sv: 'Gör mindre cirklar.' },
		harder: { en: 'Make bigger circles or hold light bottles.', fi: 'Tee suurempia ympyröitä tai pidä kevyitä pulloja.', hu: 'Csinálj nagyobb köröket, vagy tarts könnyű palackokat.', sv: 'Gör större cirklar eller håll lätta flaskor.' },
		fit: f(1, 1, 2, 3)
	},
	{
		id: 'shoulder-rolls', name: { en: 'Shoulder rolls', fi: 'Hartioiden pyöritys', hu: 'Vállkörzés', sv: 'Axelrullningar' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Shoulders', 'Traps'], image: 'shoulder-rolls', warmupType: 'active',
		cue: { en: 'Roll the shoulders back in a smooth arc.', fi: 'Pyöritä hartioita taaksepäin pehmeästi.', hu: 'Görgesd a vállad hátrafelé, lágy ívben.', sv: 'Rulla axlarna bakåt i en mjuk båge.' },
		purpose: { en: 'Loosens the shoulders and upper back before training.', fi: 'Avaa hartioita ja yläselkää ennen harjoittelua.', hu: 'Lazítja a vállat és a felső hátat az edzés előtt.', sv: 'Mjukar upp axlarna och övre ryggen före träning.' },
		setup: { en: 'Stand tall, arms relaxed at the sides.', fi: 'Seiso ryhdikkäästi, kädet rentoina sivuilla.', hu: 'Állj egyenesen, karok lazán a test mellett.', sv: 'Stå rak, armarna avslappnade vid sidorna.' },
		mistakes: { en: 'Rushing the movement instead of a full circle.', fi: 'Liikkeen hätäily täyden ympyrän sijaan.', hu: 'A mozdulat elkapkodása teljes körzés helyett.', sv: 'Att stressa rörelsen i stället för en hel cirkel.' },
		easier: { en: 'Roll one shoulder at a time.', fi: 'Pyöritä yhtä hartiaa kerrallaan.', hu: 'Körzz egy vállal egyszerre.', sv: 'Rulla en axel i taget.' },
		harder: { en: 'Add a bigger range through the upper back.', fi: 'Lisää laajempaa liikettä yläselästä.', hu: 'Adj hozzá nagyobb mozgástartományt a felső háton át.', sv: 'Lägg till ett större rörelseomfång genom övre ryggen.' },
		fit: f(1, 1, 1, 3)
	},
	{
		id: 'hip-circles', name: { en: 'Hip circles', fi: 'Lantion pyöritys', hu: 'Csípőkörzés', sv: 'Höftcirklar' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Hips'], image: 'hip-circles', warmupType: 'active',
		cue: { en: 'Hands on hips, circle the hips slowly.', fi: 'Kädet lantiolla, pyöritä lantiota rauhallisesti.', hu: 'Kezek a csípőn, körözz lassan a csípővel.', sv: 'Händerna på höften, cirkla höften långsamt.' },
		purpose: { en: 'Mobilises the hips before lower-body work.', fi: 'Liikuttaa lonkkia ennen alavartalon harjoittelua.', hu: 'Átmozgatja a csípőt az alsótest edzése előtt.', sv: 'Rörlighetstränar höften före underkroppsarbete.' },
		setup: { en: 'Stand tall, feet shoulder-width, hands on the hips.', fi: 'Seiso ryhdikkäästi, jalat hartioiden levyisesti, kädet lantiolla.', hu: 'Állj egyenesen, láb vállszélességben, kezek a csípőn.', sv: 'Stå rak, fötterna i axelbredd, händerna på höften.' },
		mistakes: { en: 'Moving only the upper body instead of the hips.', fi: 'Vain ylävartalon liikuttaminen lantion sijaan.', hu: 'Csak a felsőtest mozgatása a csípő helyett.', sv: 'Att bara röra överkroppen i stället för höften.' },
		easier: { en: 'Keep the circles small.', fi: 'Pidä ympyrät pieninä.', hu: 'Tartsd a köröket kicsiben.', sv: 'Håll cirklarna små.' },
		harder: { en: 'Widen the circles in both directions.', fi: 'Laajenna ympyröitä molempiin suuntiin.', hu: 'Tágítsd a köröket mindkét irányba.', sv: 'Vidga cirklarna åt båda hållen.' },
		fit: f(1, 1, 2, 3)
	},
	{
		id: 'torso-rotations', name: { en: 'Torso rotations', fi: 'Vartalon kierto', hu: 'Törzsforgatás', sv: 'Bålrotationer' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Spine', 'Obliques'], image: 'torso-rotations', warmupType: 'active',
		cue: { en: 'Hips forward, swing the arms across the body.', fi: 'Lantio eteenpäin, heiluta käsiä vartalon yli.', hu: 'Csípő előre, lendítsd a karokat a test előtt.', sv: 'Höften framåt, sväng armarna över kroppen.' },
		purpose: { en: 'Warms up the spine through gentle rotation.', fi: 'Lämmittää selkärankaa hellävaraisella kierrolla.', hu: 'Bemelegíti a gerincet kíméletes forgatással.', sv: 'Värmer upp ryggraden genom mjuk rotation.' },
		setup: { en: 'Stand tall, feet shoulder-width, arms relaxed.', fi: 'Seiso ryhdikkäästi, jalat hartioiden levyisesti, kädet rentoina.', hu: 'Állj egyenesen, láb vállszélességben, karok lazán.', sv: 'Stå rak, fötterna i axelbredd, armarna avslappnade.' },
		mistakes: { en: 'Forcing the twist or moving the hips with it.', fi: 'Kierron pakottaminen tai lantion kääntäminen mukana.', hu: 'A csavarás erőltetése vagy a csípő együttmozgatása.', sv: 'Att tvinga fram vridningen eller flytta höften med den.' },
		easier: { en: 'Rotate a shorter range.', fi: 'Kierrä lyhyemmällä liikeradalla.', hu: 'Forgass kisebb mozgástartományban.', sv: 'Rotera ett kortare rörelseomfång.' },
		harder: { en: 'Add a slightly larger, controlled swing.', fi: 'Lisää hieman laajempi, hallittu heilautus.', hu: 'Adj hozzá egy kissé nagyobb, kontrollált lendítést.', sv: 'Lägg till en något större, kontrollerad sväng.' },
		fit: f(1, 1, 2, 3)
	},
	{
		id: 'side-bends', name: { en: 'Standing side bends', fi: 'Kylkitaivutus seisten', hu: 'Oldalra hajlás állva', sv: 'Sidoböjningar stående' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Obliques', 'Spine'], image: 'side-bends', warmupType: 'active',
		cue: { en: 'Reach one arm overhead, lean gently to the side.', fi: 'Ojenna toinen käsi pään yli, taivu kevyesti sivulle.', hu: 'Nyújtsd az egyik kart a fejed fölé, hajolj finoman oldalra.', sv: 'Sträck en arm över huvudet, luta dig mjukt åt sidan.' },
		purpose: { en: 'Opens the sides of the trunk before training.', fi: 'Avaa vartalon kylkiä ennen harjoittelua.', hu: 'Megnyitja a törzs oldalait az edzés előtt.', sv: 'Öppnar sidorna av bålen före träning.' },
		setup: { en: 'Stand tall, feet hip-width, one hand on the thigh.', fi: 'Seiso ryhdikkäästi, jalat lantion levyisesti, toinen käsi reidellä.', hu: 'Állj egyenesen, láb csípőszélességben, az egyik kéz a combodon.', sv: 'Stå rak, fötterna i höftbredd, ena handen på låret.' },
		mistakes: { en: 'Leaning forward or back instead of straight sideways.', fi: 'Eteen tai taakse nojaaminen suoran sivutaivutuksen sijaan.', hu: 'Előre vagy hátra dőlés az egyenes oldalra hajlás helyett.', sv: 'Att luta framåt eller bakåt i stället för rakt åt sidan.' },
		easier: { en: 'Keep the reach low and the bend small.', fi: 'Pidä kurotus matalana ja taivutus pienenä.', hu: 'Tartsd a nyújtást alacsonyan és a hajlást kicsiben.', sv: 'Håll sträckningen låg och böjningen liten.' },
		harder: { en: 'Reach further overhead for a longer line.', fi: 'Kurota kauemmas pään yli pidemmän linjan saamiseksi.', hu: 'Nyúlj messzebbre a fejed fölé a hosszabb vonalért.', sv: 'Sträck längre över huvudet för en längre linje.' },
		fit: f(1, 1, 1, 3)
	},
	{
		id: 'standing-forward-bend', name: { en: 'Standing forward bend', fi: 'Eteentaivutus seisten', hu: 'Előrehajlás állva', sv: 'Framåtfällning stående' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Hamstrings', 'Spine'], image: 'standing-forward-bend', warmupType: 'active',
		cue: { en: 'Soft knees, hinge and reach toward the shins.', fi: 'Pehmeät polvet, taivu ja kurota kohti säriä.', hu: 'Lágy térd, hajolj és nyúlj a lábszárad felé.', sv: 'Mjuka knän, fäll och nå mot smalbenen.' },
		purpose: { en: 'Gently lengthens the back and hamstrings.', fi: 'Pidentää hellävaraisesti selkää ja takareisiä.', hu: 'Kíméletesen nyújtja a hátat és a combhajlítókat.', sv: 'Förlänger varsamt ryggen och baklåren.' },
		setup: { en: 'Stand with feet hip-width, knees slightly bent.', fi: 'Seiso jalat lantion levyisesti, polvet hieman koukussa.', hu: 'Állj csípőszélességben, térdek enyhén behajlítva.', sv: 'Stå med fötterna i höftbredd, knäna lätt böjda.' },
		mistakes: { en: 'Locking the knees or yanking down hard.', fi: 'Polvien lukitseminen tai voimakas nykiminen alas.', hu: 'A térd kizárása vagy erős lerántás.', sv: 'Att låsa knäna eller rycka ner hårt.' },
		easier: { en: 'Bend the knees more and reach less far.', fi: 'Koukista polvia enemmän ja kurota lyhyemmälle.', hu: 'Hajlítsd be jobban a térded, és nyúlj kevésbé mélyre.', sv: 'Böj knäna mer och nå mindre långt.' },
		harder: { en: 'Straighten the legs a little more.', fi: 'Suorista jalkoja hieman enemmän.', hu: 'Nyújtsd ki a lábad egy kicsit jobban.', sv: 'Räta ut benen lite mer.' },
		safety: { en: 'Move slowly; come up unhurried to avoid dizziness.', fi: 'Liiku rauhallisesti; nouse ylös kiireettä huimauksen välttämiseksi.', hu: 'Mozogj lassan; állj fel sietség nélkül a szédülés elkerülésére.', sv: 'Rör dig långsamt; res dig upp utan brådska för att undvika yrsel.' },
		fit: f(1, 1, 1, 3)
	},
	{
		id: 'marching-in-place', name: { en: 'Marching in place', fi: 'Paikallaan marssi', hu: 'Helyben menetelés', sv: 'Marsch på stället' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Hips', 'Core'], image: 'marching-in-place', warmupType: 'active',
		cue: { en: 'Lift the knees to hip height, swing opposite arm.', fi: 'Nosta polvet lantion korkeudelle, heiluta vastakkaista kättä.', hu: 'Emeld a térded csípőmagasságba, lendítsd az ellentétes kart.', sv: 'Lyft knäna till höfthöjd, sväng motsatt arm.' },
		purpose: { en: 'A low-impact way to raise the heart rate.', fi: 'Matalatehoinen tapa nostaa sykettä.', hu: 'Kíméletes módja a pulzus megemelésének.', sv: 'Ett skonsamt sätt att höja pulsen.' },
		setup: { en: 'Stand tall with feet hip-width.', fi: 'Seiso ryhdikkäästi jalat lantion levyisesti.', hu: 'Állj egyenesen, láb csípőszélességben.', sv: 'Stå rak med fötterna i höftbredd.' },
		mistakes: { en: 'Slouching or barely lifting the knees.', fi: 'Lysähtäminen tai polvien tuskin nostaminen.', hu: 'A görnyedés vagy a térd alig megemelése.', sv: 'Att sjunka ihop eller knappt lyfta knäna.' },
		easier: { en: 'Lift the knees lower.', fi: 'Nosta polvet matalammalle.', hu: 'Emeld alacsonyabbra a térded.', sv: 'Lyft knäna lägre.' },
		harder: { en: 'March faster or lift the knees higher.', fi: 'Marssi nopeammin tai nosta polvet korkeammalle.', hu: 'Menetelj gyorsabban, vagy emeld magasabbra a térded.', sv: 'Marschera snabbare eller lyft knäna högre.' },
		fit: f(1, 1, 3, 3)
	},
	{
		id: 'step-touch', name: { en: 'Step-touch', fi: 'Sivuaskellus', hu: 'Oldallépés (step-touch)', sv: 'Step-touch' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Hips', 'Calves'], image: 'step-touch', warmupType: 'active',
		cue: { en: 'Step to the side, tap the other foot in, swing the arms.', fi: 'Astu sivulle, tuo toinen jalka viereen, heiluta käsiä.', hu: 'Lépj oldalra, érintsd be a másik lábad, lendítsd a karokat.', sv: 'Kliv åt sidan, sätt ner andra foten, sväng armarna.' },
		purpose: { en: 'A gentle, rhythmic full-body warm-up.', fi: 'Hellävarainen, rytmikäs koko kehon lämmittely.', hu: 'Kíméletes, ritmikus, egész testre ható bemelegítés.', sv: 'En mjuk, rytmisk helkroppsuppvärmning.' },
		setup: { en: 'Stand with a little space to each side.', fi: 'Seiso niin että molemmilla puolilla on hieman tilaa.', hu: 'Állj úgy, hogy mindkét oldalon legyen egy kis hely.', sv: 'Stå med lite utrymme åt vardera sidan.' },
		mistakes: { en: 'Stiff arms or a tense, jerky rhythm.', fi: 'Jäykät kädet tai jännittynyt, nykivä rytmi.', hu: 'Merev karok vagy feszült, szaggatott ritmus.', sv: 'Stela armar eller en spänd, ryckig rytm.' },
		easier: { en: 'Take smaller steps.', fi: 'Ota pienempiä askeleita.', hu: 'Lépj kisebbeket.', sv: 'Ta mindre steg.' },
		harder: { en: 'Step wider or add a gentle pace.', fi: 'Astu leveämmin tai lisää rauhallista vauhtia.', hu: 'Lépj szélesebben, vagy adj hozzá egy nyugodt tempót.', sv: 'Kliv bredare eller lägg till ett lugnt tempo.' },
		fit: f(1, 1, 3, 3)
	},
	{
		id: 'ankle-circles', name: { en: 'Ankle circles', fi: 'Nilkkojen pyöritys', hu: 'Bokakörzés', sv: 'Fotledscirklar' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Calves'], image: 'ankle-circles', warmupType: 'active',
		cue: { en: 'Lift one foot, circle the ankle both ways.', fi: 'Nosta toinen jalka, pyöritä nilkkaa molempiin suuntiin.', hu: 'Emeld fel az egyik lábad, körözz a bokáddal mindkét irányba.', sv: 'Lyft ena foten, cirkla fotleden åt båda håll.' },
		purpose: { en: 'Mobilises the ankles before standing work.', fi: 'Liikuttaa nilkkoja ennen seisten tehtävää harjoittelua.', hu: 'Átmozgatja a bokát az állva végzett munka előtt.', sv: 'Rörlighetstränar fotlederna före stående arbete.' },
		setup: { en: 'Hold a wall or chair for balance, lift one foot.', fi: 'Pidä kiinni seinästä tai tuolista tasapainoksi, nosta toinen jalka.', hu: 'Fogj meg egy falat vagy széket az egyensúlyhoz, emeld fel az egyik lábad.', sv: 'Håll i en vägg eller stol för balans, lyft ena foten.' },
		mistakes: { en: 'Rushing instead of a slow, full circle.', fi: 'Hätäily hitaan, täyden ympyrän sijaan.', hu: 'A sietség a lassú, teljes körzés helyett.', sv: 'Att stressa i stället för en långsam, hel cirkel.' },
		easier: { en: 'Rest the toe on the floor and circle the heel.', fi: 'Lepuuta varvasta lattialla ja pyöritä kantapäätä.', hu: 'Támaszd a lábujjad a talajra, és körözz a sarkaddal.', sv: 'Vila tån mot golvet och cirkla med hälen.' },
		harder: { en: 'Lift the foot higher and slow the circles.', fi: 'Nosta jalka korkeammalle ja hidasta ympyröitä.', hu: 'Emeld magasabbra a lábad, és lassítsd a köröket.', sv: 'Lyft foten högre och sakta ner cirklarna.' },
		fit: f(1, 1, 1, 3)
	},
	{
		id: 'leg-swings', name: { en: 'Leg swings', fi: 'Jalan heilautukset', hu: 'Láblendítés', sv: 'Bensvingar' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Hips', 'Hamstrings'], image: 'leg-swings', warmupType: 'active',
		cue: { en: 'Hold a support, swing one leg forward and back.', fi: 'Pidä kiinni tuesta, heiluta jalkaa eteen ja taakse.', hu: 'Fogódzz meg, lendítsd a lábad előre-hátra.', sv: 'Håll i ett stöd, sväng benet fram och tillbaka.' },
		purpose: { en: 'Dynamically opens the hips before leg work.', fi: 'Avaa lonkkia dynaamisesti ennen jalkaharjoittelua.', hu: 'Dinamikusan nyitja a csípőt a lábmunka előtt.', sv: 'Öppnar dynamiskt höften före benarbete.' },
		setup: { en: 'Stand side-on to a wall, one hand for balance.', fi: 'Seiso kyljittäin seinään, toinen käsi tasapainoksi.', hu: 'Állj oldalra egy falhoz, az egyik kéz az egyensúlyhoz.', sv: 'Stå med sidan mot en vägg, ena handen för balans.' },
		mistakes: { en: 'Swinging from the back instead of the hip.', fi: 'Heilautus selästä lonkan sijaan.', hu: 'Lendítés a hátból a csípő helyett.', sv: 'Att svinga från ryggen i stället för höften.' },
		easier: { en: 'Swing through a smaller range.', fi: 'Heiluta lyhyemmällä liikeradalla.', hu: 'Lendíts kisebb mozgástartományban.', sv: 'Sväng genom ett mindre rörelseomfång.' },
		harder: { en: 'Swing a little higher with control.', fi: 'Heiluta hieman korkeammalle hallitusti.', hu: 'Lendíts egy kicsit magasabbra, kontrolláltan.', sv: 'Sväng lite högre med kontroll.' },
		fit: f(1, 1, 2, 3)
	},
	{
		id: 'inchworm-walkout', name: { en: 'Inchworm walkout', fi: 'Matomato-kävely', hu: 'Tenyérléptetés (inchworm)', sv: 'Inchworm-utgång' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Core', 'Hamstrings', 'Shoulders'], image: 'inchworm-walkout', warmupType: 'active',
		cue: { en: 'Hinge down, walk the hands out to a plank, walk back.', fi: 'Taivu alas, kävele kädet lankkuun, kävele takaisin.', hu: 'Hajolj le, lépegess kézzel plankbe, majd vissza.', sv: 'Fäll ner, gå ut med händerna till planka, gå tillbaka.' },
		purpose: { en: 'A full-body dynamic warm-up for the whole posterior chain.', fi: 'Koko kehon dynaaminen lämmittely takaketjulle.', hu: 'Egész testre ható dinamikus bemelegítés a teljes hátsó láncnak.', sv: 'En dynamisk helkroppsuppvärmning för hela bakre kedjan.' },
		setup: { en: 'Stand with feet hip-width, soft knees.', fi: 'Seiso jalat lantion levyisesti, polvet pehmeinä.', hu: 'Állj csípőszélességben, térdek lazán.', sv: 'Stå med fötterna i höftbredd, mjuka knän.' },
		mistakes: { en: 'Letting the hips sag in the plank position.', fi: 'Lantion valuminen lankkuasennossa.', hu: 'A csípő megereszkedni hagyása plank helyzetben.', sv: 'Att låta höften sjunka i plankaläget.' },
		easier: { en: 'Walk the hands out a shorter distance.', fi: 'Kävele kädet lyhyemmälle matkalle.', hu: 'Lépegess kézzel rövidebb távra.', sv: 'Gå ut med händerna en kortare sträcka.' },
		harder: { en: 'Walk out to a full plank and add a slow push-up.', fi: 'Kävele täyteen lankkuun ja lisää hidas punnerrus.', hu: 'Lépegess teljes plankba, és adj hozzá egy lassú fekvőtámaszt.', sv: 'Gå ut till en full planka och lägg till en långsam armhävning.' },
		fit: f(1, 1, 3, 3)
	},
	{
		id: 'low-impact-jacks', name: { en: 'Low-impact jacks', fi: 'Matalatehoiset haaraperushypyt', hu: 'Kíméletes terpeszbe lépés', sv: 'Skonsamma jumping jacks' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Shoulders', 'Calves'], image: 'low-impact-jacks', warmupType: 'active',
		cue: { en: 'Step one foot out as the arms rise, no jumping.', fi: 'Astu toinen jalka sivulle kun kädet nousevat, ei hyppyä.', hu: 'Lépj egyik lábbal oldalra, ahogy a karok emelkednek, ugrás nélkül.', sv: 'Kliv ut med ena foten när armarna höjs, inget hopp.' },
		purpose: { en: 'Raises the heart rate while keeping impact low.', fi: 'Nostaa sykettä pitäen iskukuormituksen matalana.', hu: 'Megemeli a pulzust, miközben alacsonyan tartja a becsapódást.', sv: 'Höjer pulsen samtidigt som belastningen hålls låg.' },
		setup: { en: 'Stand tall with room to step to each side.', fi: 'Seiso ryhdikkäästi niin että voit astua kummallekin sivulle.', hu: 'Állj egyenesen úgy, hogy mindkét oldalra léphess.', sv: 'Stå rak med utrymme att kliva åt vardera sidan.' },
		mistakes: { en: 'Rounding the shoulders as the arms rise.', fi: 'Hartioiden pyöristäminen käsien noustessa.', hu: 'A vállak lekerekítése, ahogy a karok emelkednek.', sv: 'Att runda axlarna när armarna höjs.' },
		easier: { en: 'Raise the arms only to shoulder height.', fi: 'Nosta kädet vain hartioiden korkeudelle.', hu: 'Emeld a karod csak vállmagasságig.', sv: 'Höj armarna bara till axelhöjd.' },
		harder: { en: 'Add a gentle pace or full overhead reach.', fi: 'Lisää rauhallista vauhtia tai täysi kurotus pään yli.', hu: 'Adj hozzá egy nyugodt tempót, vagy nyújtsd teljesen a fejed fölé.', sv: 'Lägg till ett lugnt tempo eller en full sträckning över huvudet.' },
		fit: f(1, 1, 3, 3)
	}
];

// Cardio warm-up options (pattern 'mobility', warmupType 'cardio'). outdoor-walk needs no equipment
// and is always available; the others require the matching machine. Used by the active/both/mobility
// warm-up styles. No health claims - framed as a gentle way to raise the heart rate before training.
const cardioExercises: Exercise[] = [
	{
		id: 'outdoor-walk', name: { en: 'Outdoor walk', fi: 'Reipas kävely ulkona', hu: 'Séta a szabadban', sv: 'Rask promenad utomhus' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Heart'], image: 'outdoor-walk', warmupType: 'cardio',
		cue: { en: 'Walk at a brisk, conversational pace - out and back.', fi: 'Kävele reippaasti, puhekykytahdissa - menomatka ja paluu.', hu: 'Sétálj élénk, beszélgetős tempóban - oda és vissza.', sv: 'Gå i rask, samtalsvänligt tempo - dit och tillbaka.' },
		purpose: { en: 'A no-equipment way to raise the heart rate before training.', fi: 'Välineetön tapa nostaa sykettä ennen harjoittelua.', hu: 'Eszköz nélküli módja a pulzus megemelésének az edzés előtt.', sv: 'Ett sätt att höja pulsen före träning utan utrustning.' },
		setup: { en: 'Step outside and pick a route you can walk out and back.', fi: 'Mene ulos ja valitse reitti, jonka voit kävellä edestakaisin.', hu: 'Menj ki, és válassz egy útvonalat, amelyet oda-vissza végig tudsz sétálni.', sv: 'Gå ut och välj en rutt du kan gå dit och tillbaka.' },
		mistakes: { en: 'Strolling so slowly the heart rate never rises.', fi: 'Niin verkkainen kävely, ettei syke nouse lainkaan.', hu: 'Olyan lassú séta, hogy a pulzus sosem emelkedik meg.', sv: 'Att gå så långsamt att pulsen aldrig stiger.' },
		easier: { en: 'Walk 5-10 minutes at an easy pace.', fi: 'Kävele 5-10 minuuttia rauhallista tahtia.', hu: 'Sétálj 5-10 percet nyugodt tempóban.', sv: 'Gå 5-10 minuter i lugnt tempo.' },
		harder: { en: 'Add a gentle incline or a brisker pace.', fi: 'Lisää loiva ylämäki tai reippaampi tahti.', hu: 'Adj hozzá egy enyhe emelkedőt vagy egy élénkebb tempót.', sv: 'Lägg till en lätt stigning eller ett raskare tempo.' },
		fit: f(1, 1, 3, 3)
	},
	{
		id: 'treadmill-walk', name: { en: 'Treadmill walk', fi: 'Kävely juoksumatolla', hu: 'Séta futópadon', sv: 'Promenad på löpband' },
		pattern: 'mobility', minTier: 1, experienceMin: 'beginner', primary: ['Heart'], image: 'treadmill-walk', warmupType: 'cardio',
		cue: { en: 'Walk at an easy, steady pace to warm up.', fi: 'Kävele rauhallista, tasaista tahtia lämmitelläksesi.', hu: 'Sétálj könnyű, egyenletes tempóban a bemelegítéshez.', sv: 'Gå i lugnt, jämnt tempo för att värma upp.' },
		purpose: { en: 'A simple indoor way to raise the heart rate before training.', fi: 'Yksinkertainen sisätapa nostaa sykettä ennen harjoittelua.', hu: 'Egyszerű beltéri módja a pulzus megemelésének az edzés előtt.', sv: 'Ett enkelt inomhussätt att höja pulsen före träning.' },
		setup: { en: 'Set the treadmill to a comfortable walking speed.', fi: 'Säädä juoksumatto mukavalle kävelynopeudelle.', hu: 'Állítsd a futópadot kényelmes sétatempóra.', sv: 'Ställ in löpbandet på en bekväm gånghastighet.' },
		mistakes: { en: 'Holding the rails so hard you lean on them.', fi: 'Kaiteista niin tiukka ote, että nojaat niihin.', hu: 'A korlátok olyan erős fogása, hogy rájuk támaszkodsz.', sv: 'Att hålla i räckena så hårt att du lutar dig mot dem.' },
		easier: { en: 'Keep it flat and walk 5-10 minutes.', fi: 'Pidä matto tasaisena ja kävele 5-10 minuuttia.', hu: 'Tartsd laposan, és sétálj 5-10 percet.', sv: 'Håll det plant och gå 5-10 minuter.' },
		harder: { en: 'Add a slight incline or a brisker pace.', fi: 'Lisää pieni nousukulma tai reippaampi tahti.', hu: 'Adj hozzá egy enyhe emelkedőt vagy egy élénkebb tempót.', sv: 'Lägg till en lätt stigning eller ett raskare tempo.' },
		fit: f(1, 1, 3, 3)
	},
	{
		id: 'walking-pad-walk', name: { en: 'Walking-pad walk', fi: 'Kävely kävelymatolla', hu: 'Séta járópadon', sv: 'Promenad på gångband' },
		pattern: 'mobility', minTier: 1, experienceMin: 'beginner', primary: ['Heart'], image: 'walking-pad-walk', warmupType: 'cardio',
		cue: { en: 'Walk at an easy office pace to warm up.', fi: 'Kävele rauhallista perustahtia lämmitelläksesi.', hu: 'Sétálj könnyű, kényelmes tempóban a bemelegítéshez.', sv: 'Gå i lugnt tempo för att värma upp.' },
		purpose: { en: 'A compact indoor walk to raise the heart rate.', fi: 'Tiivis sisäkävely sykkeen nostamiseen.', hu: 'Helytakarékos beltéri séta a pulzus megemelésére.', sv: 'En kompakt inomhuspromenad för att höja pulsen.' },
		setup: { en: 'Set the walking pad to a comfortable speed.', fi: 'Säädä kävelymatto mukavalle nopeudelle.', hu: 'Állítsd a járópadot kényelmes sebességre.', sv: 'Ställ in gångbandet på en bekväm hastighet.' },
		mistakes: { en: 'Looking down at a screen and rounding the back.', fi: 'Näyttöön tuijottaminen ja selän pyöristäminen.', hu: 'A képernyő lefelé nézése és a hát lekerekítése.', sv: 'Att titta ner på en skärm och runda ryggen.' },
		easier: { en: 'Slow the pace and walk 5-10 minutes.', fi: 'Hidasta tahtia ja kävele 5-10 minuuttia.', hu: 'Lassíts a tempón, és sétálj 5-10 percet.', sv: 'Sänk tempot och gå 5-10 minuter.' },
		harder: { en: 'Pick up the pace for the last few minutes.', fi: 'Nopeuta tahtia viimeisiksi minuuteiksi.', hu: 'Gyorsíts a tempón az utolsó néhány percre.', sv: 'Öka tempot de sista minuterna.' },
		fit: f(1, 1, 3, 3)
	},
	{
		id: 'stationary-bike-warmup', name: { en: 'Easy bike spin', fi: 'Kevyt kuntopyöräily', hu: 'Könnyű szobabiciklizés', sv: 'Lätt motionscykling' },
		pattern: 'mobility', minTier: 1, experienceMin: 'beginner', primary: ['Heart'], image: 'stationary-bike-warmup', warmupType: 'cardio',
		cue: { en: 'Pedal at an easy pace, gradually building cadence.', fi: 'Polje rauhallista tahtia, lisää poljinnopeutta vähitellen.', hu: 'Tekerj könnyű tempóban, fokozatosan növelve a fordulatszámot.', sv: 'Trampa i lugnt tempo, öka kadensen gradvis.' },
		purpose: { en: 'A joint-friendly way to raise the heart rate before training.', fi: 'Nivelystävällinen tapa nostaa sykettä ennen harjoittelua.', hu: 'Ízületkímélő módja a pulzus megemelésének az edzés előtt.', sv: 'Ett ledvänligt sätt att höja pulsen före träning.' },
		setup: { en: 'Set the seat to hip height and a light resistance.', fi: 'Säädä satula lantion korkeudelle ja kevyt vastus.', hu: 'Állítsd az ülést csípőmagasságba és könnyű ellenállásra.', sv: 'Ställ sätet i höfthöjd och ett lätt motstånd.' },
		mistakes: { en: 'Cranking the resistance so high it becomes a workout.', fi: 'Vastuksen nostaminen niin kovaksi, että siitä tulee harjoitus.', hu: 'Az ellenállás olyan magasra állítása, hogy edzéssé válik.', sv: 'Att veva upp motståndet så högt att det blir ett träningspass.' },
		easier: { en: 'Spin 5-10 minutes at low resistance.', fi: 'Polje 5-10 minuuttia kevyellä vastuksella.', hu: 'Tekerj 5-10 percet könnyű ellenállással.', sv: 'Trampa 5-10 minuter med lätt motstånd.' },
		harder: { en: 'Build the cadence toward the end.', fi: 'Lisää poljinnopeutta loppua kohti.', hu: 'Növeld a fordulatszámot a vége felé.', sv: 'Öka kadensen mot slutet.' },
		fit: f(1, 1, 3, 3)
	},
	{
		id: 'rowing-warmup', name: { en: 'Easy row', fi: 'Kevyt soutu', hu: 'Könnyű evezés', sv: 'Lätt rodd' },
		pattern: 'mobility', minTier: 1, experienceMin: 'beginner', primary: ['Heart'], image: 'rowing-warmup', warmupType: 'cardio',
		cue: { en: 'Legs, then back, then arms - smooth and steady.', fi: 'Jalat, sitten selkä, sitten kädet - tasaisesti ja rauhallisesti.', hu: 'Láb, majd hát, majd kar - simán és egyenletesen.', sv: 'Ben, sedan rygg, sedan armar - mjukt och jämnt.' },
		purpose: { en: 'A full-body way to raise the heart rate before training.', fi: 'Koko kehon tapa nostaa sykettä ennen harjoittelua.', hu: 'Egész testre ható módja a pulzus megemelésének az edzés előtt.', sv: 'Ett helkroppssätt att höja pulsen före träning.' },
		setup: { en: 'Sit tall, strap the feet, hold the handle with a light grip.', fi: 'Istu ryhdikkäästi, kiinnitä jalat, ota kahvasta kevyt ote.', hu: 'Ülj egyenesen, rögzítsd a lábad, fogd meg a fogantyút könnyű fogással.', sv: 'Sitt rak, spänn fast fötterna, håll handtaget med ett lätt grepp.' },
		mistakes: { en: 'Yanking with the arms before the legs drive.', fi: 'Nykiminen käsillä ennen kuin jalat työntävät.', hu: 'Rángatás a karral, mielőtt a láb nyomna.', sv: 'Att rycka med armarna innan benen trycker ifrån.' },
		easier: { en: 'Row 5 minutes at a light, slow stroke.', fi: 'Souda 5 minuuttia kevyellä, hitaalla vedolla.', hu: 'Evezz 5 percet könnyű, lassú húzással.', sv: 'Ro 5 minuter med ett lätt, långsamt tag.' },
		harder: { en: 'Lengthen and quicken the stroke a little.', fi: 'Pidennä ja nopeuta vetoa hieman.', hu: 'Nyújtsd és gyorsítsd a húzást egy kicsit.', sv: 'Förläng och snabba upp taget lite.' },
		fit: f(1, 1, 3, 3)
	}
];

// Easier push-up regressions, so swapping a hard push-up offers a genuinely easier option.
const pushupRegressions: Exercise[] = [
	{
		id: 'knee-pushup', name: { en: 'Knee push-up', fi: 'Punnerrus polvilta', hu: 'Fekvőtámasz térdről', sv: 'Armhävning på knä' },
		pattern: 'push-h', minTier: 0, experienceMin: 'beginner', primary: ['Chest', 'Triceps', 'Front delts'], image: 'knee-pushup',
		cue: { en: 'Knees down, straight line knees to head, lower with control.', fi: 'Polvet maahan, suora linja polvista päähän, laske hallitusti.', hu: 'Térd a földön, egyenes vonal a térdtől a fejig, kontrolláltan engedj le.', sv: 'Knäna i golvet, rak linje från knä till huvud, sänk kontrollerat.' },
		purpose: { en: 'A scaled push-up that builds pressing strength from the knees.', fi: 'Skaalattu punnerrus, joka rakentaa työntövoimaa polvilta.', hu: 'Skálázott fekvőtámasz, amely térdről építi a tolóerőt.', sv: 'En anpassad armhävning som bygger presstyrka från knäna.' },
		setup: { en: 'Kneel, hands under the shoulders, hips in line with the body.', fi: 'Asetu polville, kädet hartioiden alle, lantio linjassa vartalon kanssa.', hu: 'Térdelj le, kezek a váll alatt, csípő a testtel egy vonalban.', sv: 'Stå på knä, händerna under axlarna, höften i linje med kroppen.' },
		mistakes: { en: 'Letting the hips pike up or the lower back sag.', fi: 'Lantion nouseminen pystyyn tai alaselän notkahtaminen.', hu: 'A csípő felemelkedése, vagy a derék megereszkedése.', sv: 'Att låta höften peka upp eller ländryggen sjunka.' },
		easier: { en: 'Place the hands on a raised surface to reduce the load.', fi: 'Aseta kädet korokkeelle vähentääksesi kuormaa.', hu: 'Tedd a kezed megemelt felületre a terhelés csökkentéséhez.', sv: 'Lägg händerna på en förhöjd yta för att minska belastningen.' },
		harder: { en: 'Move to a full push-up on the toes.', fi: 'Siirry täyteen punnerrukseen varpailta.', hu: 'Válts teljes, lábujjon végzett fekvőtámaszra.', sv: 'Gå över till en full armhävning på tårna.' },
		modTips: { en: 'To make pressing easier, lower the knees to the floor and keep the movement slow and controlled.', fi: 'Helpota työntöä laskemalla polvet maahan ja pidä liike hitaana ja hallittuna.', hu: 'A tolás könnyítéséhez ereszkedj térdre, és tartsd a mozdulatot lassan és kontrolláltan.', sv: 'För att göra pressen lättare, sänk knäna mot golvet och håll rörelsen långsam och kontrollerad.' },
		fit: f(1, 2, 2, 3)
	},
	{
		id: 'elevated-pushup', name: { en: 'Elevated push-up', fi: 'Punnerrus korokkeelta', hu: 'Megemelt fekvőtámasz', sv: 'Förhöjd armhävning' },
		pattern: 'push-h', minTier: 1, experienceMin: 'beginner', primary: ['Chest', 'Triceps', 'Front delts'], image: 'elevated-pushup',
		cue: { en: 'Hands on a sturdy raised surface, body in one straight line.', fi: 'Kädet tukevalle korokkeelle, vartalo yhtenä suorana linjana.', hu: 'Kezek egy stabil, megemelt felületen, test egy egyenes vonalban.', sv: 'Händerna på en stadig förhöjning, kroppen i en rak linje.' },
		purpose: { en: 'The higher the hands, the easier the push - a great push-up entry point.', fi: 'Mitä korkeammalla kädet, sitä kevyempi työntö - loistava aloituspunnerrus.', hu: 'Minél magasabban a kéz, annál könnyebb a tolás - kiváló belépő fekvőtámasz.', sv: 'Ju högre händerna, desto lättare pressen - en utmärkt ingång till armhävningar.' },
		setup: { en: 'Place the hands on a sturdy table, bench or chair, step the feet back.', fi: 'Aseta kädet tukevalle pöydälle, penkille tai tuolille, astu jalat taakse.', hu: 'Tedd a kezed egy stabil asztalra, padra vagy székre, lépj a lábaddal hátra.', sv: 'Lägg händerna på ett stadigt bord, en bänk eller en stol, kliv bakåt med fötterna.' },
		mistakes: { en: 'Sagging the hips or flaring the elbows straight out.', fi: 'Lantion valuminen tai kyynärpäiden levittäminen suoraan sivulle.', hu: 'A csípő megereszkedése, vagy a könyök egyenesen oldalra kinyitása.', sv: 'Att tappa höften eller flänga ut armbågarna rakt åt sidan.' },
		easier: { en: 'Use a higher surface (the higher, the easier).', fi: 'Käytä korkeampaa pintaa (mitä korkeampi, sitä helpompi).', hu: 'Használj magasabb felületet (minél magasabb, annál könnyebb).', sv: 'Använd en högre yta (ju högre, desto lättare).' },
		harder: { en: 'Use a lower surface, or move to a knee push-up on the floor.', fi: 'Käytä matalampaa pintaa tai siirry polvipunnerrukseen lattialla.', hu: 'Használj alacsonyabb felületet, vagy válts térdről végzett fekvőtámaszra a talajon.', sv: 'Använd en lägre yta eller gå över till en armhävning på knäna på golvet.' },
		modTips: { en: 'The higher and sturdier the surface, the easier this is - start at a kitchen counter if needed.', fi: 'Mitä korkeampi ja tukevampi pinta, sitä helpompi tämä on - aloita tarvittaessa keittiötasolta.', hu: 'Minél magasabb és stabilabb a felület, annál könnyebb ez - szükség esetén kezdd a konyhapultnál.', sv: 'Ju högre och stadigare yta, desto lättare är detta - börja vid en köksbänk om det behövs.' },
		fit: f(1, 2, 2, 3)
	}
];

// Birth-preparation movements (pattern 'mobility'). Gentle, pregnancy-oriented; selected into a
// trimester-weighted birth-prep block for pregnant users. NO medical claims - the program shows a
// "consult your maternity clinic / midwife" note and a stop-rule alongside these.
const birthPrepExercises: Exercise[] = [
	{
		id: 'deep-supported-squat', name: { en: 'Supported deep squat', fi: 'Tuettu syväkyykky', hu: 'Támasztott mély guggolás', sv: 'Stödd djup knäböj' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Hips', 'Adductors'], image: 'deep-supported-squat', prenatalWeight: [1, 2, 3],
		cue: { en: 'Hold a sturdy support, sink into a deep squat, heels down.', fi: 'Pidä kiinni tukevasta tuesta, laskeudu syvään kyykkyyn, kantapäät maassa.', hu: 'Fogj meg egy stabil támaszt, ereszkedj mély guggolásba, sarok a földön.', sv: 'Håll i ett stadigt stöd, sjunk ner i en djup knäböj, hälarna i golvet.' },
		purpose: { en: 'A supported hip-opening squat hold often used to prepare for labour.', fi: 'Tuettu lonkkia avaava kyykkypito, jota käytetään usein synnytykseen valmistautumisessa.', hu: 'Megtámasztott, csípőt nyitó guggolástartás, amelyet gyakran használnak a szülésre való felkészüléshez.', sv: 'En stödd höftöppnande knäböjshållning som ofta används för att förbereda inför förlossning.' },
		setup: { en: 'Hold a door frame, rail or sturdy furniture; feet a little wider than the hips.', fi: 'Pidä kiinni ovenkarmista, kaiteesta tai tukevasta huonekalusta; jalat hieman lantiota leveämmällä.', hu: 'Fogj meg egy ajtótokot, korlátot vagy stabil bútort; a láb a csípőnél kissé szélesebben.', sv: 'Håll i en dörrkarm, ett räcke eller en stadig möbel; fötterna lite bredare än höften.' },
		mistakes: { en: 'Forcing the depth or letting the heels lift.', fi: 'Syvyyden pakottaminen tai kantapäiden nouseminen.', hu: 'A mélység erőltetése vagy a sarkak elemelkedni hagyása.', sv: 'Att tvinga fram djupet eller låta hälarna lyfta.' },
		easier: { en: 'Squat to a comfortable depth or sit on a low stool.', fi: 'Kyykkää mukavalle syvyydelle tai istu matalalle jakkaralle.', hu: 'Guggolj kényelmes mélységig, vagy ülj egy alacsony zsámolyra.', sv: 'Böj till ett bekvämt djup eller sitt på en låg pall.' },
		harder: { en: 'Hold a little longer with relaxed breathing.', fi: 'Pidä hieman pidempään rauhallisesti hengittäen.', hu: 'Tartsd egy kicsit tovább, nyugodt légzéssel.', sv: 'Håll lite längre med avslappnad andning.' },
		safety: { en: 'Avoid in late pregnancy if your provider has advised against deep squatting; stop if uncomfortable.', fi: 'Vältä loppuraskaudessa, jos neuvolasi on kehottanut välttämään syväkyykkyä; lopeta, jos epämukavaa.', hu: 'Kerüld a késői terhességben, ha a szakembered a mély guggolás ellen javasolt; állj le, ha kényelmetlen.', sv: 'Undvik sent i graviditeten om din vårdgivare har avrått från djupa knäböj; sluta om det känns obekvämt.' },
		fit: f(1, 1, 1, 2)
	},
	{
		id: 'birth-ball-hip-circles', name: { en: 'Birth-ball hip circles', fi: 'Lantion pyöritys pallolla', hu: 'Csípőkörzés labdán', sv: 'Höftcirklar på boll' },
		pattern: 'mobility', minTier: 1, experienceMin: 'beginner', primary: ['Hips', 'Core'], image: 'birth-ball-hip-circles', prenatalWeight: [1, 2, 3],
		cue: { en: 'Sit tall on the ball, circle the hips slowly.', fi: 'Istu ryhdikkäästi pallolla, pyöritä lantiota rauhallisesti.', hu: 'Ülj egyenesen a labdán, körözz lassan a csípővel.', sv: 'Sitt rak på bollen, cirkla höften långsamt.' },
		purpose: { en: 'Gentle pelvic mobility on the ball; popular in pregnancy for comfort.', fi: 'Hellävarainen lantion liikkuvuus pallolla; suosittu raskausaikana mukavuuden vuoksi.', hu: 'Kíméletes medencei mozgékonyság a labdán; a terhességben népszerű a kényelem miatt.', sv: 'Mjuk bäckenrörlighet på bollen; populär under graviditet för komforten.' },
		setup: { en: 'Sit on a stability ball, feet flat and a little wide.', fi: 'Istu jumppapallolle, jalat tasaisesti ja hieman leveällä.', hu: 'Ülj egy fitneszlabdára, talp a talajon és kissé szélesen.', sv: 'Sitt på en pilatesboll, fötterna platt och lite brett isär.' },
		mistakes: { en: 'Moving only the upper body instead of the hips.', fi: 'Vain ylävartalon liikuttaminen lantion sijaan.', hu: 'Csak a felsőtest mozgatása a csípő helyett.', sv: 'Att bara röra överkroppen i stället för höften.' },
		easier: { en: 'Make the circles smaller.', fi: 'Tee ympyröistä pienempiä.', hu: 'Csinálj kisebb köröket.', sv: 'Gör cirklarna mindre.' },
		harder: { en: 'Widen the circles slowly in both directions.', fi: 'Laajenna ympyröitä hitaasti molempiin suuntiin.', hu: 'Tágítsd a köröket lassan mindkét irányba.', sv: 'Vidga cirklarna långsamt åt båda hållen.' },
		safety: { en: 'Keep the ball against a wall for balance; stop if you feel unsteady.', fi: 'Pidä pallo seinää vasten tasapainon vuoksi; lopeta, jos olo on epävakaa.', hu: 'Tartsd a labdát a falnak támasztva az egyensúly miatt; állj le, ha bizonytalannak érzed magad.', sv: 'Håll bollen mot en vägg för balans; sluta om du känner dig ostadig.' },
		fit: f(1, 1, 1, 2)
	},
	{
		id: 'birth-ball-rocking', name: { en: 'Birth-ball rocking', fi: 'Keinunta pallolla', hu: 'Ringatózás labdán', sv: 'Gunga på boll' },
		pattern: 'mobility', minTier: 1, experienceMin: 'beginner', primary: ['Hips', 'Spine'], image: 'birth-ball-rocking', prenatalWeight: [1, 2, 3],
		cue: { en: 'Sit tall, rock the hips gently forward and back.', fi: 'Istu ryhdikkäästi, keinuta lantiota hellävaraisesti eteen ja taakse.', hu: 'Ülj egyenesen, ringasd a csípőt finoman előre-hátra.', sv: 'Sitt rak, gunga höften mjukt fram och tillbaka.' },
		purpose: { en: 'Soothing pelvic movement on the ball.', fi: 'Rauhoittava lantion liike pallolla.', hu: 'Megnyugtató medencei mozgás a labdán.', sv: 'En lugnande bäckenrörelse på bollen.' },
		setup: { en: 'Sit on a stability ball, hands resting on the thighs.', fi: 'Istu jumppapallolle, kädet reisillä.', hu: 'Ülj egy fitneszlabdára, kezek a combodon pihennek.', sv: 'Sitt på en pilatesboll, händerna vilande på låren.' },
		mistakes: { en: 'Rocking so fast you lose control of the ball.', fi: 'Niin nopea keinunta, että pallon hallinta katoaa.', hu: 'Olyan gyors ringatás, hogy elveszíted a labda feletti uralmat.', sv: 'Att gunga så snabbt att du tappar kontrollen över bollen.' },
		easier: { en: 'Keep the range small and slow.', fi: 'Pidä liikerata pienenä ja hitaana.', hu: 'Tartsd a mozgástartományt kicsiben és lassan.', sv: 'Håll rörelseomfånget litet och långsamt.' },
		harder: { en: 'Add gentle side-to-side rocking.', fi: 'Lisää hellävaraista keinuntaa puolelta toiselle.', hu: 'Adj hozzá kíméletes oldalról oldalra ringatást.', sv: 'Lägg till mjuk gungning från sida till sida.' },
		safety: { en: 'Keep the ball against a wall for support; stop if uncomfortable.', fi: 'Pidä pallo seinää vasten tueksi; lopeta, jos epämukavaa.', hu: 'Tartsd a labdát a falnak támasztva a támaszért; állj le, ha kényelmetlen.', sv: 'Håll bollen mot en vägg för stöd; sluta om det känns obekvämt.' },
		fit: f(1, 1, 1, 2)
	},
	{
		id: 'birth-ball-pelvic-tilt', name: { en: 'Birth-ball pelvic tilt', fi: 'Lantion kallistus pallolla', hu: 'Medencebillentés labdán', sv: 'Bäckentippning på boll' },
		pattern: 'mobility', minTier: 1, experienceMin: 'beginner', primary: ['Hips', 'Core'], image: 'birth-ball-pelvic-tilt', prenatalWeight: [1, 2, 3],
		cue: { en: 'Sit tall, tilt the pelvis forward then back.', fi: 'Istu ryhdikkäästi, kallista lantiota eteen ja sitten taakse.', hu: 'Ülj egyenesen, billentsd a medencét előre, majd hátra.', sv: 'Sitt rak, tippa bäckenet framåt och sedan bakåt.' },
		purpose: { en: 'Mobilises the pelvis and low back on the ball.', fi: 'Liikuttaa lantiota ja alaselkää pallolla.', hu: 'Átmozgatja a medencét és a derekat a labdán.', sv: 'Rörlighetstränar bäckenet och ländryggen på bollen.' },
		setup: { en: 'Sit on a stability ball, hands at the sides.', fi: 'Istu jumppapallolle, kädet sivuilla.', hu: 'Ülj egy fitneszlabdára, kezek a test mellett.', sv: 'Sitt på en pilatesboll, händerna vid sidorna.' },
		mistakes: { en: 'Holding the breath or tensing the shoulders.', fi: 'Hengityksen pidättäminen tai hartioiden jännittäminen.', hu: 'A légzés visszatartása vagy a vállak megfeszítése.', sv: 'Att hålla andan eller spänna axlarna.' },
		easier: { en: 'Use a small, comfortable range.', fi: 'Käytä pientä, mukavaa liikerataa.', hu: 'Használj kicsi, kényelmes mozgástartományt.', sv: 'Använd ett litet, bekvämt rörelseomfång.' },
		harder: { en: 'Pair the tilt with a slow exhale.', fi: 'Yhdistä kallistus hitaaseen uloshengitykseen.', hu: 'Párosítsd a billentést egy lassú kilégzéssel.', sv: 'Para ihop tippningen med en långsam utandning.' },
		safety: { en: 'Keep the ball stable against a wall; stop if you feel pain.', fi: 'Pidä pallo vakaana seinää vasten; lopeta, jos tunnet kipua.', hu: 'Tartsd a labdát stabilan a falnak támasztva; állj le, ha fájdalmat érzel.', sv: 'Håll bollen stabil mot en vägg; sluta om du känner smärta.' },
		fit: f(1, 1, 1, 2)
	},
	{
		id: 'birth-ball-bounce', name: { en: 'Gentle birth-ball bounce', fi: 'Hellävarainen pomppu pallolla', hu: 'Finom labdás rugózás', sv: 'Mjuk studs på boll' },
		pattern: 'mobility', minTier: 1, experienceMin: 'beginner', primary: ['Hips'], image: 'birth-ball-bounce', prenatalWeight: [1, 2, 3],
		cue: { en: 'Sit tall, small gentle bounces, feet planted.', fi: 'Istu ryhdikkäästi, pienet hellävaraiset pomput, jalat tukevasti.', hu: 'Ülj egyenesen, apró finom rugózás, talp a földön.', sv: 'Sitt rak, små mjuka studsar, fötterna stadigt.' },
		purpose: { en: 'A light, comfortable way to stay mobile on the ball.', fi: 'Kevyt, mukava tapa pysyä liikkeessä pallolla.', hu: 'Könnyű, kényelmes módja annak, hogy mozgásban maradj a labdán.', sv: 'Ett lätt, bekvämt sätt att hålla sig rörlig på bollen.' },
		setup: { en: 'Sit on a stability ball, feet flat and wide, core gently engaged.', fi: 'Istu jumppapallolle, jalat tasaisesti ja leveällä, keskivartalo kevyesti aktivoituna.', hu: 'Ülj egy fitneszlabdára, talp laposan és szélesen, törzs finoman megfeszítve.', sv: 'Sitt på en pilatesboll, fötterna platt och brett isär, bålen mjukt aktiverad.' },
		mistakes: { en: 'Bouncing too high or losing control.', fi: 'Liian korkea pomppu tai hallinnan menettäminen.', hu: 'Túl magas rugózás vagy az uralom elvesztése.', sv: 'Att studsa för högt eller tappa kontrollen.' },
		easier: { en: 'Barely bounce - just press gently into the ball.', fi: 'Tuskin pompi - paina vain kevyesti palloon.', hu: 'Alig rugózz - csak nyomódj finoman a labdába.', sv: 'Studsa knappt - tryck bara mjukt ner i bollen.' },
		harder: { en: 'Keep a steady, light rhythm a little longer.', fi: 'Pidä tasaista, kevyttä rytmiä hieman pidempään.', hu: 'Tarts egyenletes, könnyű ritmust egy kicsit tovább.', sv: 'Håll en jämn, lätt rytm lite längre.' },
		safety: { en: 'Keep the bounce small and controlled; stop if unsteady or uncomfortable.', fi: 'Pidä pomppu pienenä ja hallittuna; lopeta, jos epävakaa tai epämukava olo.', hu: 'Tartsd a rugózást kicsiben és kontrolláltan; állj le, ha bizonytalannak vagy kényelmetlennek érzed magad.', sv: 'Håll studsen liten och kontrollerad; sluta om du känner dig ostadig eller obekväm.' },
		fit: f(1, 1, 1, 2)
	},
	{
		id: 'standing-pelvic-tilt', name: { en: 'Standing pelvic tilt', fi: 'Lantion kallistus seisten', hu: 'Álló medencebillentés', sv: 'Stående bäckentippning' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Hips', 'Spine'], image: 'standing-pelvic-tilt', prenatalWeight: [2, 2, 2],
		cue: { en: 'Hand on a wall, gently tuck and release the pelvis.', fi: 'Käsi seinällä, kallista lantiota varovasti ja vapauta.', hu: 'Kéz a falon, finoman billentsd be és engedd a medencét.', sv: 'Hand mot vägg, tippa bäckenet mjukt och släpp.' },
		purpose: { en: 'Eases the low back and mobilises the pelvis standing.', fi: 'Helpottaa alaselkää ja liikuttaa lantiota seisten.', hu: 'Megkönnyíti a derekat, és állva mozgatja a medencét.', sv: 'Avlastar ländryggen och rörlighetstränar bäckenet stående.' },
		setup: { en: 'Stand with soft knees, one hand on a wall.', fi: 'Seiso polvet pehmeinä, toinen käsi seinällä.', hu: 'Állj lazán behajlított térddel, az egyik kéz a falon.', sv: 'Stå med mjuka knän, ena handen på en vägg.' },
		mistakes: { en: 'Forcing the movement from the low back.', fi: 'Liikkeen pakottaminen alaselästä.', hu: 'A mozdulat erőltetése a derékból.', sv: 'Att tvinga fram rörelsen från ländryggen.' },
		easier: { en: 'Use a very small range.', fi: 'Käytä hyvin pientä liikerataa.', hu: 'Használj nagyon kicsi mozgástartományt.', sv: 'Använd ett mycket litet rörelseomfång.' },
		harder: { en: 'Add a slow exhale on the tuck.', fi: 'Lisää hidas uloshengitys kallistukseen.', hu: 'Adj hozzá egy lassú kilégzést a billentéskor.', sv: 'Lägg till en långsam utandning vid tippningen.' },
		safety: { en: 'Move gently; stop if you feel pain or dizziness.', fi: 'Liiku hellävaraisesti; lopeta, jos tunnet kipua tai huimausta.', hu: 'Mozogj kíméletesen; állj le, ha fájdalmat vagy szédülést érzel.', sv: 'Rör dig varsamt; sluta om du känner smärta eller yrsel.' },
		fit: f(1, 1, 1, 2)
	},
	{
		id: 'hands-knees-pelvic-tilt', name: { en: 'All-fours pelvic tilt', fi: 'Lantion kallistus konttausasennossa', hu: 'Négykézláb medencebillentés', sv: 'Bäckentippning på alla fyra' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Spine', 'Core'], image: 'hands-knees-pelvic-tilt', prenatalWeight: [2, 3, 3],
		cue: { en: 'On all fours, gently round and release the low back.', fi: 'Konttausasennossa, pyöristä ja vapauta alaselkää varovasti.', hu: 'Négykézláb, finoman kerekítsd és engedd a derekat.', sv: 'På alla fyra, runda och släpp ländryggen mjukt.' },
		purpose: { en: 'A back-friendly pelvic mobility drill, comfortable in pregnancy.', fi: 'Selälle ystävällinen lantion liikkuvuusliike, mukava raskausaikana.', hu: 'Hátbarát medencei mozgékonysági gyakorlat, kényelmes a terhességben.', sv: 'En ryggvänlig bäckenrörlighetsövning, bekväm under graviditet.' },
		setup: { en: 'Hands under shoulders, knees under hips, neutral neck.', fi: 'Kädet hartioiden alla, polvet lantion alla, niska neutraalina.', hu: 'Kezek a váll alatt, térdek a csípő alatt, nyak semleges helyzetben.', sv: 'Händerna under axlarna, knäna under höften, nacken neutral.' },
		mistakes: { en: 'Dropping the head or over-arching the back.', fi: 'Pään pudottaminen tai selän liiallinen notkistaminen.', hu: 'A fej leejtése vagy a hát túlhomorítása.', sv: 'Att tappa huvudet eller översvanka ryggen.' },
		easier: { en: 'Use a small, slow range.', fi: 'Käytä pientä, hidasta liikerataa.', hu: 'Használj kicsi, lassú mozgástartományt.', sv: 'Använd ett litet, långsamt rörelseomfång.' },
		harder: { en: 'Pair each tilt with the breath.', fi: 'Yhdistä jokainen kallistus hengitykseen.', hu: 'Párosítsd minden billentést a légzéssel.', sv: 'Para ihop varje tippning med andningen.' },
		safety: { en: 'Pad the knees; stop if the wrists or back hurt.', fi: 'Pehmusta polvet; lopeta, jos ranteet tai selkä kipeytyvät.', hu: 'Párnázd ki a térded; állj le, ha a csukló vagy a hát fáj.', sv: 'Stoppa under knäna; sluta om handlederna eller ryggen gör ont.' },
		fit: f(1, 1, 1, 2)
	},
	{
		id: 'butterfly-tailor-sitting', name: { en: 'Tailor (butterfly) sitting', fi: 'Perhosistunta', hu: 'Pillangó ülés', sv: 'Fjärilssittande' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Hips', 'Adductors'], image: 'butterfly-tailor-sitting', prenatalWeight: [2, 2, 3],
		cue: { en: 'Sit tall, soles together, let the knees open.', fi: 'Istu ryhdikkäästi, jalkapohjat yhteen, anna polvien avautua.', hu: 'Ülj egyenesen, talpak össze, engedd a térdeket kinyílni.', sv: 'Sitt rak, fotsulorna ihop, låt knäna öppna sig.' },
		purpose: { en: 'A gentle inner-thigh and hip opener for sitting comfort.', fi: 'Hellävarainen sisäreisien ja lonkkien avaus istumamukavuuteen.', hu: 'Kíméletes belső comb- és csípőnyitó az üléskényelemért.', sv: 'En mjuk öppnare för innerlår och höft för sittkomfort.' },
		setup: { en: 'Sit tall on the floor, hands on the ankles.', fi: 'Istu ryhdikkäästi lattialla, kädet nilkoilla.', hu: 'Ülj egyenesen a talajon, kezek a bokádon.', sv: 'Sitt rak på golvet, händerna på fotlederna.' },
		mistakes: { en: 'Pushing the knees down hard.', fi: 'Polvien voimakas painaminen alas.', hu: 'A térd erős lenyomása.', sv: 'Att trycka ner knäna hårt.' },
		easier: { en: 'Sit on a cushion and keep the feet further out.', fi: 'Istu tyynyn päällä ja pidä jalat kauempana.', hu: 'Ülj egy párnára, és tartsd a lábad távolabb.', sv: 'Sitt på en kudde och håll fötterna längre ut.' },
		harder: { en: 'Sit taller and let the knees relax lower.', fi: 'Istu ryhdikkäämmin ja anna polvien rentoutua alemmas.', hu: 'Ülj egyenesebben, és engedd a térded lejjebb lazulni.', sv: 'Sitt rakare och låt knäna slappna av lägre.' },
		safety: { en: 'Never force the knees; stop if the hips or pubic area hurt.', fi: 'Älä koskaan pakota polvia; lopeta, jos lonkat tai häpyluun seutu kipeytyvät.', hu: 'Soha ne erőltesd a térded; állj le, ha a csípő vagy a szeméremcsont környéke fáj.', sv: 'Tvinga aldrig knäna; sluta om höften eller blygdbensområdet gör ont.' },
		fit: f(1, 1, 1, 2)
	},
	{
		id: 'side-lying-rest', name: { en: 'Side-lying rest', fi: 'Kylkimakuulepo', hu: 'Oldalfekvő pihenés', sv: 'Sidliggande vila' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Hips'], image: 'side-lying-rest', prenatalWeight: [1, 2, 3],
		cue: { en: 'Lie on the left side, a pillow between the knees, breathe slowly.', fi: 'Makaa vasemmalla kyljellä, tyyny polvien välissä, hengitä rauhallisesti.', hu: 'Feküdj a bal oldaladra, párna a térdek között, lélegezz lassan.', sv: 'Ligg på vänster sida, en kudde mellan knäna, andas långsamt.' },
		purpose: { en: 'A restful, comfortable position with calm breathing.', fi: 'Lepoasento mukavuuteen ja rauhalliseen hengitykseen.', hu: 'Pihentető, kényelmes helyzet nyugodt légzéssel.', sv: 'En vilsam, bekväm position med lugn andning.' },
		setup: { en: 'Lie on the left side, knees bent, a pillow between them.', fi: 'Makaa vasemmalla kyljellä, polvet koukussa, tyyny niiden välissä.', hu: 'Feküdj a bal oldaladra, térdek behajlítva, egy párna közöttük.', sv: 'Ligg på vänster sida, knäna böjda, en kudde mellan dem.' },
		mistakes: { en: 'Tensing the shoulders instead of relaxing.', fi: 'Hartioiden jännittäminen rentoutumisen sijaan.', hu: 'A vállak megfeszítése az ellazulás helyett.', sv: 'Att spänna axlarna i stället för att slappna av.' },
		easier: { en: 'Add a pillow under the bump for support.', fi: 'Lisää tyyny vatsan alle tueksi.', hu: 'Tegyél egy párnát a pocak alá támaszként.', sv: 'Lägg en kudde under magen som stöd.' },
		harder: { en: 'Lengthen the exhale for deeper relaxation.', fi: 'Pidennä uloshengitystä syvempään rentoutumiseen.', hu: 'Nyújtsd a kilégzést a mélyebb ellazuláshoz.', sv: 'Förläng utandningen för djupare avslappning.' },
		safety: { en: 'The left side is usually most comfortable later in pregnancy; adjust as needed.', fi: 'Vasen kylki on yleensä mukavin loppuraskaudessa; säädä tarpeen mukaan.', hu: 'A bal oldal általában a legkényelmesebb a késői terhességben; igazítsd szükség szerint.', sv: 'Vänster sida är oftast bekvämast senare i graviditeten; anpassa efter behov.' },
		fit: f(1, 1, 1, 2)
	},
	{
		id: 'pelvic-floor-kegel', name: { en: 'Pelvic-floor focus', fi: 'Lantionpohjan harjoitus', hu: 'Medencefenék-gyakorlat', sv: 'Bäckenbottenfokus' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Core'], image: 'pelvic-floor-kegel', prenatalWeight: [3, 3, 3],
		cue: { en: 'Sit tall, gently draw up the pelvic-floor muscles, then fully release.', fi: 'Istu ryhdikkäästi, vedä lantionpohjan lihaksia kevyesti ylös, sitten vapauta täysin.', hu: 'Ülj egyenesen, finoman húzd fel a medencefenék izmait, majd teljesen engedd el.', sv: 'Sitt rak, dra försiktigt upp bäckenbottenmusklerna och släpp sedan helt.' },
		purpose: { en: 'Pelvic-floor awareness and control, including full relaxation.', fi: 'Lantionpohjan tiedostaminen ja hallinta, mukaan lukien täysi rentoutus.', hu: 'A medencefenék tudatosítása és kontrollja, beleértve a teljes ellazítást.', sv: 'Medvetenhet och kontroll över bäckenbotten, inklusive full avslappning.' },
		setup: { en: 'Sit or lie comfortably, breathe normally.', fi: 'Istu tai makaa mukavasti, hengitä normaalisti.', hu: 'Ülj vagy feküdj kényelmesen, lélegezz normálisan.', sv: 'Sitt eller ligg bekvämt, andas normalt.' },
		mistakes: { en: 'Holding the breath or squeezing the glutes instead.', fi: 'Hengityksen pidättäminen tai pakaroiden puristaminen sen sijaan.', hu: 'A légzés visszatartása vagy ehelyett a farizom összeszorítása.', sv: 'Att hålla andan eller knipa ihop sätet i stället.' },
		easier: { en: 'Start with short, gentle lifts and full releases.', fi: 'Aloita lyhyillä, kevyillä nostoilla ja täysillä vapautuksilla.', hu: 'Kezdd rövid, finom megemelésekkel és teljes elengedésekkel.', sv: 'Börja med korta, mjuka lyft och fulla släpp.' },
		harder: { en: 'Hold a little longer, always fully releasing after.', fi: 'Pidä hieman pidempään, vapauta aina täysin jälkeenpäin.', hu: 'Tartsd egy kicsit tovább, mindig teljesen elengedve utána.', sv: 'Håll lite längre, släpp alltid helt efteråt.' },
		safety: { en: 'Learning to relax the pelvic floor matters as much as lifting; a women\'s-health physiotherapist can guide you.', fi: 'Lantionpohjan rentouttaminen on yhtä tärkeää kuin jännittäminen; naistentautien fysioterapeutti voi opastaa.', hu: 'A medencefenék ellazításának megtanulása ugyanolyan fontos, mint a megfeszítés; egy nőgyógyászati fizioterapeuta tud útmutatást adni.', sv: 'Att lära sig slappna av i bäckenbotten är lika viktigt som att knipa; en fysioterapeut inom kvinnohälsa kan vägleda dig.' },
		fit: f(1, 1, 1, 2)
	}
];

// Full library = the core illustrated set + the larger researched expansion modules.
export const exercises: Exercise[] = [...coreExercises, ...moreExercisesUpper, ...moreExercisesLower, ...ballExercises, ...warmupExercises, ...cardioExercises, ...pushupRegressions, ...birthPrepExercises];

// ---- Training goals (how you train: reps, sets, rest, intensity, progression) ----
export interface Goal {
	id: GoalId;
	name: Loc;
	reps: [number, number];
	sets: [number, number]; // [beginner-ish, advanced-ish] per-exercise baseline
	restSec: number;
	rir: Loc; // reps-in-reserve / effort guidance
	tempo: string; // e.g. "3-1-1" lowering-pause-lift seconds
	cardio: Loc;
	progression: Loc;
	note: Loc;
}
export const goals: Goal[] = [
	{
		id: 'strength', name: { en: 'Get stronger', fi: 'Tule vahvemmaksi', hu: 'Legyél erősebb', sv: 'Bli starkare' },
		reps: [4, 6], sets: [3, 5], restSec: 150, tempo: '2-1-1',
		rir: { en: 'Leave 1-2 reps in reserve; the last rep should be hard but clean.', fi: 'Jätä 1-2 toistoa varaan; viimeisen toiston tulee olla raskas mutta puhdas.', hu: 'Hagyj 1-2 ismétlést tartalékban; az utolsó ismétlés legyen nehéz, de tiszta technikájú.', sv: 'Lämna 1-2 repetitioner i reserv; sista repetitionen ska kännas tung men ren.' },
		cardio: { en: 'Optional cardio, separate from your strength days: 1-2 easy sessions (e.g. a walk) a week aids recovery.', fi: 'Vapaaehtoinen kardio, erillään voimapäivistä: 1-2 kevyttä kertaa (esim. kävely) viikossa auttaa palautumaan.', hu: 'Opcionális kardió, az erőedzésektől elkülönítve: heti 1-2 könnyű alkalom (például egy séta) segíti a regenerációt.', sv: 'Valfri kondition, skild från dina styrkepass: 1-2 lätta pass (t.ex. en promenad) i veckan hjälper återhämtningen.' },
		progression: { en: 'Add a little weight whenever you hit the top of the rep range with good form.', fi: 'Lisää hieman painoa aina kun saavutat toistohaarukan ylärajan hyvällä tekniikalla.', hu: 'Tegyél rá egy kicsit a súlyból, valahányszor jó technikával eléred az ismétléstartomány tetejét.', sv: 'Lägg på lite vikt varje gång du når toppen av repintervallet med god teknik.' },
		note: { en: 'Heavier loads, lower reps, longer rest.', fi: 'Raskaammat painot, vähemmän toistoja, pidemmät levot.', hu: 'Nehezebb terhelés, kevesebb ismétlés, hosszabb pihenő.', sv: 'Tyngre vikter, färre repetitioner, längre vila.' }
	},
	{
		id: 'hypertrophy', name: { en: 'Build muscle', fi: 'Kasvata lihasta', hu: 'Építs izmot', sv: 'Bygg muskler' },
		reps: [8, 12], sets: [3, 4], restSec: 90, tempo: '3-1-1',
		rir: { en: 'Train close to failure: 0-2 reps left on the last set.', fi: 'Treenaa lähelle uupumusta: 0-2 toistoa jäljellä viimeisessä sarjassa.', hu: 'Edz a kifáradás közelében: az utolsó sorozatban 0-2 ismétlés maradjon benned.', sv: 'Träna nära utmattning: 0-2 repetitioner kvar i sista setet.' },
		cardio: { en: 'Optional cardio on top of your strength days: about 2 easy sessions (walk, bike) a week.', fi: 'Vapaaehtoinen kardio voimapäivien lisäksi: noin 2 kevyttä kertaa (kävely, pyöräily) viikossa.', hu: 'Opcionális kardió az erőedzések mellé: heti nagyjából 2 könnyű alkalom (séta, kerékpározás).', sv: 'Valfri kondition utöver dina styrkepass: ungefär 2 lätta pass (promenad, cykling) i veckan.' },
		progression: { en: 'Add reps within the range each week, then add weight and reset to the bottom (double progression).', fi: 'Lisää toistoja haarukan sisällä joka viikko, lisää sitten painoa ja palaa alarajaan (kaksoisprogressio).', hu: 'Hetente adj hozzá ismétléseket a tartományon belül, majd növeld a súlyt és állj vissza az alsó határra (kettős progresszió).', sv: 'Lägg till repetitioner inom intervallet varje vecka, öka sedan vikten och börja om från botten (dubbel progression).' },
		note: { en: 'Moderate loads, more volume, train close to failure.', fi: 'Kohtuulliset painot, enemmän volyymia, treenaa lähelle uupumusta.', hu: 'Mérsékelt terhelés, több volumen, eddz közel a kifáradásig.', sv: 'Måttliga vikter, mer volym, träna nära utmattning.' }
	},
	{
		id: 'fat-loss', name: { en: 'Lose fat (training style)', fi: 'Pudota rasvaa (treenityyli)', hu: 'Zsírégető stílus', sv: 'Fettförbränningsstil' },
		reps: [10, 15], sets: [2, 4], restSec: 60, tempo: '2-0-1',
		rir: { en: 'Brisk pace, short rests, 1-2 reps in reserve; keep moving.', fi: 'Reipas tahti, lyhyet levot, 1-2 toistoa varaan; pidä liike käynnissä.', hu: 'Pörgős tempó, rövid pihenők, 1-2 ismétlés tartalékban; tartsd folyamatosan mozgásban a testet.', sv: 'Rask takt, korta vilor, 1-2 repetitioner i reserv; håll rörelsen igång.' },
		cardio: { en: 'Cardio supports the deficit: daily steps plus 2-3 easy cardio sessions a week, in addition to your strength days.', fi: 'Kardio tukee kalorivajetta: päivittäiset askeleet sekä 2-3 kevyttä kardiokertaa viikossa, voimapäivien lisäksi.', hu: 'A kardió támogatja a kalóriadeficitet: napi lépésszám plusz heti 2-3 könnyű kardió alkalom, az erőedzések mellett.', sv: 'Kondition stödjer underskottet: dagliga steg plus 2-3 lätta konditionspass i veckan, utöver dina styrkepass.' },
		progression: { en: 'Add reps or shorten rest as you get fitter; the diet drives the fat loss.', fi: 'Lisää toistoja tai lyhennä lepoa kunnon kohentuessa; ruokavalio hoitaa rasvanpudotuksen.', hu: 'Ahogy javul az állóképességed, adj hozzá ismétléseket vagy rövidítsd a pihenőt; a zsírvesztést az étrend hajtja.', sv: 'Lägg till repetitioner eller korta vilan när konditionen förbättras; kosten står för fettförbränningen.' },
		note: { en: 'Higher reps, short rest, circuit feel; keep muscle while you cut.', fi: 'Enemmän toistoja, lyhyt lepo, kiertoharjoittelun tuntu; säilytä lihas kuurin aikana.', hu: 'Több ismétlés, rövid pihenő, köredzés jelleg; tartsd meg az izmot a diéta alatt.', sv: 'Fler reps, kort vila, cirkelkänsla; behåll muskler under nedgången.' }
	},
	{
		id: 'general', name: { en: 'General fitness', fi: 'Yleiskunto', hu: 'Általános erőnlét', sv: 'Allmän kondition' },
		reps: [8, 12], sets: [2, 3], restSec: 75, tempo: '2-1-1',
		rir: { en: 'Comfortably hard: stop 2-3 reps before failure.', fi: 'Mukavan haastavaa: lopeta 2-3 toistoa ennen uupumusta.', hu: 'Kellemesen nehéz: állj le 2-3 ismétléssel a kifáradás előtt.', sv: 'Lagom tungt: sluta 2-3 repetitioner före utmattning.' },
		cardio: { en: 'Aim for 7-10k steps a day, plus about 2 easy cardio sessions a week on top of your strength days.', fi: 'Tavoittele 7-10k askelta päivässä ja noin 2 kevyttä kardiokertaa viikossa voimapäivien lisäksi.', hu: 'Célozz napi 7-10 ezer lépést, plusz heti nagyjából 2 könnyű kardió alkalmat az erőedzések mellé.', sv: 'Sikta på 7-10k steg om dagen, plus ungefär 2 lätta konditionspass i veckan utöver dina styrkepass.' },
		progression: { en: 'Slowly add reps or weight as movements feel easy.', fi: 'Lisää hitaasti toistoja tai painoa, kun liikkeet tuntuvat helpoilta.', hu: 'Lassan adj hozzá ismétléseket vagy súlyt, ahogy a gyakorlatok könnyebbnek érződnek.', sv: 'Lägg långsamt till repetitioner eller vikt när rörelserna känns lätta.' },
		note: { en: 'Balanced, sustainable training and eating.', fi: 'Tasapainoinen ja kestävä harjoittelu ja syöminen.', hu: 'Kiegyensúlyozott, fenntartható edzés és táplálkozás.', sv: 'Balanserad, hållbar träning och kost.' }
	}
];

// ---- Nutrition goals (energy direction, independent of training goal) ----
export interface NutritionGoal {
	id: NutritionGoalId;
	name: Loc;
	calAdjustPct: number;
	proteinPerKg: [number, number];
	note: Loc;
}
export const nutritionGoals: NutritionGoal[] = [
	{
		id: 'lose', name: { en: 'Lose fat', fi: 'Pudota rasvaa', hu: 'Fogyás', sv: 'Tappa fett' },
		calAdjustPct: -18, proteinPerKg: [1.8, 2.4],
		note: { en: 'A moderate calorie deficit with high protein to hold onto muscle.', fi: 'Maltillinen kalorivaje runsaalla proteiinilla lihasten säilyttämiseksi.', hu: 'Mérsékelt kalóriadeficit magas fehérjével az izom megtartásához.', sv: 'Ett måttligt kaloriunderskott med högt protein för att behålla muskler.' }
	},
	{
		id: 'maintain', name: { en: 'Maintain', fi: 'Ylläpidä', hu: 'Fenntartás', sv: 'Bibehåll' },
		calAdjustPct: 0, proteinPerKg: [1.6, 2.2],
		note: { en: 'Eat around maintenance and let training drive the changes.', fi: 'Syö ylläpidon tienoilla ja anna harjoittelun ohjata muutoksia.', hu: 'Egyél a fenntartás körül, és hagyd, hogy az edzés vezesse a változást.', sv: 'Ät kring underhåll och låt träningen driva förändringen.' }
	},
	{
		id: 'gain', name: { en: 'Gain muscle', fi: 'Kasvata lihasta', hu: 'Izomépítés', sv: 'Bygg muskler' },
		calAdjustPct: 10, proteinPerKg: [1.6, 2.0],
		note: { en: 'A small surplus so you gain muscle with minimal fat.', fi: 'Pieni kaloriylijäämä, jotta kasvatat lihasta vähäisellä rasvalla.', hu: 'Kis kalóriatöbblet, hogy minimális zsírral építs izmot.', sv: 'Ett litet överskott så att du bygger muskler med minimalt fett.' }
	}
];

// ---- Training emphasis (how much work per session) ----
export interface Emphasis {
	id: EmphasisId;
	name: Loc;
	setsDelta: number;
	slotsDelta: number;
	note: Loc;
}
export const emphases: Emphasis[] = [
	{ id: 'minimalist', name: { en: 'Minimalist', fi: 'Minimalistinen', hu: 'Minimalista', sv: 'Minimalistisk' }, setsDelta: -1, slotsDelta: -1, note: { en: 'Fewer hard sets, the essentials only - time-efficient.', fi: 'Vähemmän raskaita sarjoja, vain olennainen - aikatehokas.', hu: 'Kevesebb nehéz sorozat, csak a lényeg - időhatékony.', sv: 'Färre hårda set, bara det viktigaste - tidseffektivt.' } },
	{ id: 'balanced', name: { en: 'Balanced', fi: 'Tasapainoinen', hu: 'Kiegyensúlyozott', sv: 'Balanserad' }, setsDelta: 0, slotsDelta: 0, note: { en: 'A sensible middle ground of volume and time.', fi: 'Järkevä keskitie volyymin ja ajan välillä.', hu: 'Ésszerű középút a volumen és az idő között.', sv: 'En vettig medelväg mellan volym och tid.' } },
	{ id: 'high-volume', name: { en: 'High-volume', fi: 'Suuri volyymi', hu: 'Nagy volumen', sv: 'Hög volym' }, setsDelta: 1, slotsDelta: 1, note: { en: 'More sets and exercises for faster progress, if you have the time.', fi: 'Enemmän sarjoja ja liikkeitä nopeampaan kehitykseen, jos aikaa riittää.', hu: 'Több sorozat és gyakorlat a gyorsabb fejlődésért, ha van időd.', sv: 'Fler set och övningar för snabbare framsteg, om du har tid.' } }
];

// ---- Split options ----
export interface Split {
	id: SplitId;
	name: Loc;
}
export const splits: Split[] = [
	{ id: 'auto', name: { en: 'Automatic (recommended)', fi: 'Automaattinen (suositus)', hu: 'Automatikus (ajánlott)', sv: 'Automatisk (rekommenderas)' } },
	{ id: 'full-body', name: { en: 'Full-body', fi: 'Koko keho', hu: 'Teljes test', sv: 'Helkropp' } },
	{ id: 'upper-lower', name: { en: 'Upper / Lower', fi: 'Ylä / Ala', hu: 'Felső / Alsó', sv: 'Över / Under' } },
	{ id: 'ppl', name: { en: 'Push / Pull / Legs', fi: 'Työnnä / Vedä / Jalat', hu: 'Toló / Húzó / Láb', sv: 'Tryck / Drag / Ben' } }
];

export interface EquipmentItem {
	id: string;
	name: Loc;
	tier: number;
	image?: string;
}
export const equipment: EquipmentItem[] = [
	{ id: 'none', name: { en: 'Nothing / bodyweight only', fi: 'Ei välineitä', hu: 'Semmi / csak testsúly', sv: 'Inget / endast kroppsvikt' }, tier: 0 },
	{ id: 'wall', name: { en: 'A wall', fi: 'Seinä', hu: 'Egy fal', sv: 'En vägg' }, tier: 0, image: 'wall' },
	{ id: 'chair', name: { en: 'A sturdy chair', fi: 'Tukeva tuoli', hu: 'Egy stabil szék', sv: 'En stadig stol' }, tier: 1, image: 'chair' },
	{ id: 'table', name: { en: 'A sturdy table', fi: 'Tukeva pöytä', hu: 'Egy stabil asztal', sv: 'Ett stadigt bord' }, tier: 1, image: 'table' },
	{ id: 'water-bottles', name: { en: 'Filled bottles / a light weight', fi: 'Täytetyt pullot tai kevyt paino', hu: 'Teli palackok / kis súly', sv: 'Fyllda flaskor / en lätt vikt' }, tier: 1, image: 'water-bottles' },
	{ id: 'exercise-ball', name: { en: 'An exercise ball', fi: 'Jumppapallo', hu: 'Egy fitneszlabda', sv: 'En pilatesboll' }, tier: 1, image: 'exercise-ball' },
	{ id: 'treadmill', name: { en: 'A treadmill', fi: 'Juoksumatto', hu: 'Egy futópad', sv: 'Ett löpband' }, tier: 1, image: 'treadmill' },
	{ id: 'walking-pad', name: { en: 'A walking pad', fi: 'Kävelymatto', hu: 'Egy járópad', sv: 'Ett gångband' }, tier: 1, image: 'walking-pad' },
	{ id: 'exercise-bike', name: { en: 'An exercise bike', fi: 'Kuntopyörä', hu: 'Egy szobabicikli', sv: 'En motionscykel' }, tier: 1, image: 'exercise-bike' },
	{ id: 'rowing-machine', name: { en: 'A rowing machine', fi: 'Soutulaite', hu: 'Egy evezőgép', sv: 'En roddmaskin' }, tier: 1, image: 'rowing-machine' },
	{ id: 'dumbbell', name: { en: 'A single dumbbell', fi: 'Yksi käsipaino', hu: 'Egy kézisúlyzó', sv: 'En hantel' }, tier: 2, image: 'dumbbell' },
	{ id: 'kettlebell', name: { en: 'A kettlebell', fi: 'Kahvakuula', hu: 'Egy kettlebell', sv: 'En kettlebell' }, tier: 2, image: 'kettlebell' },
	{ id: 'resistance-band', name: { en: 'Resistance bands', fi: 'Vastuskumit', hu: 'Gumiszalagok', sv: 'Träningsband' }, tier: 3, image: 'resistance-band' },
	{ id: 'pull-up-bar', name: { en: 'A pull-up bar', fi: 'Leuanvetotanko', hu: 'Húzódzkodórúd', sv: 'En räckstång' }, tier: 3, image: 'pull-up-bar' },
	{ id: 'ab-wheel', name: { en: 'An ab wheel', fi: 'Vatsarulla', hu: 'Haskerék', sv: 'En magrulle' }, tier: 3, image: 'ab-wheel' },
	{ id: 'adjustable-dumbbells', name: { en: 'A pair of dumbbells', fi: 'Käsipainopari', hu: 'Egy pár kézisúlyzó', sv: 'Ett par hantlar' }, tier: 4, image: 'adjustable-dumbbells' },
	{ id: 'bench', name: { en: 'A bench', fi: 'Penkki', hu: 'Egy pad', sv: 'En bänk' }, tier: 4, image: 'bench' },
	{ id: 'barbell', name: { en: 'A barbell + rack', fi: 'Levytanko ja teline', hu: 'Súlyzórúd és állvány', sv: 'Skivstång och ställning' }, tier: 5, image: 'gym-rack' }
];

export const dietPrinciples: { title: Loc; body: Loc }[] = [
	{
		title: { en: 'Energy balance comes first', fi: 'Energiatasapaino ratkaisee', hu: 'Az energiamérleg a legfontosabb', sv: 'Energibalansen kommer först' },
		body: { en: 'Fat loss or gain is set by calories in vs out. Everything else is fine-tuning.', fi: 'Rasvan pudotus tai nousu määräytyy syödyistä ja kulutetuista kaloreista. Kaikki muu on hienosäätöä.', hu: 'A fogyást vagy hízást a bevitt és elégetett kalória dönti el. Minden más finomhangolás.', sv: 'Fettminskning eller -ökning styrs av kalorier in mot ut. Allt annat är finjustering.' }
	},
	{
		title: { en: 'Protein is the priority', fi: 'Proteiini on tärkein', hu: 'A fehérje az első', sv: 'Protein är prioritet' },
		body: { en: 'Spread your daily protein target across 3-4 meals to support muscle.', fi: 'Jaa päivittäinen proteiinitavoite 3-4 aterialle lihasten tueksi.', hu: 'Oszd el a napi fehérjecélt 3-4 étkezésre az izmok támogatásához.', sv: 'Fördela ditt dagliga proteinmål över 3-4 måltider för att stödja musklerna.' }
	},
	{
		title: { en: 'No good or bad foods', fi: 'Ei hyviä tai huonoja ruokia', hu: 'Nincs jó vagy rossz étel', sv: 'Inga bra eller dåliga livsmedel' },
		body: { en: 'Hit your targets with foods you enjoy; sustainability beats perfection (flexible dieting).', fi: 'Saavuta tavoitteesi ruoilla joista pidät; kestävyys voittaa täydellisyyden (joustava ruokavalio).', hu: 'Érd el a céljaidat olyan ételekkel, amelyeket szeretsz; a fenntarthatóság többet ér a tökéletességnél (rugalmas étrend).', sv: 'Nå dina mål med mat du gillar; hållbarhet slår perfektion (flexibel kost).' }
	},
	{
		title: { en: 'Eat for fullness', fi: 'Syö kylläiseksi', hu: 'Egyél a jóllakásért', sv: 'Ät för mättnad' },
		body: { en: 'Lean on high-volume, high-fibre, minimally processed foods to control hunger.', fi: 'Suosi runsasvolyymisia, kuitupitoisia ja vähän prosessoituja ruokia hallitaksesi nälkää.', hu: 'Támaszkodj nagy térfogatú, rostdús, kevéssé feldolgozott ételekre az éhség kontrollálásához.', sv: 'Luta dig mot mat med stor volym, mycket fiber och minimal bearbetning för att styra hungern.' }
	},
	{
		title: { en: 'Calibrate over a week', fi: 'Kalibroi viikossa', hu: 'Hangold be egy hét alatt', sv: 'Kalibrera över en vecka' },
		body: { en: 'Treat the calorie target as a starting estimate; weigh in weekly and adjust if the trend stalls.', fi: 'Pidä kaloritavoitetta lähtöarviona; punnitse viikoittain ja säädä, jos kehitys pysähtyy.', hu: 'Kezeld a kalóriacélt kiindulási becslésként; hetente mérlegelj, és módosíts, ha a trend megáll.', sv: 'Se kalorimålet som en startuppskattning; väg dig varje vecka och justera om trenden stannar av.' }
	}
];

export const foodGroups: { name: Loc; examples: Loc; image?: string }[] = [
	{
		name: { en: 'Lean protein', fi: 'Vähärasvainen proteiini', hu: 'Sovány fehérje', sv: 'Magert protein' },
		examples: { en: 'Chicken, fish, eggs, low-fat dairy, tofu, legumes', fi: 'Kana, kala, kananmunat, vähärasvaiset maitotuotteet, tofu, palkokasvit', hu: 'Csirke, hal, tojás, alacsony zsírtartalmú tejtermék, tofu, hüvelyesek', sv: 'Kyckling, fisk, ägg, magra mejeriprodukter, tofu, baljväxter' }, image: 'foods-protein'
	},
	{
		name: { en: 'Quality carbs', fi: 'Laadukkaat hiilihydraatit', hu: 'Minőségi szénhidrátok', sv: 'Bra kolhydrater' },
		examples: { en: 'Oats, potatoes, rice, whole-grain bread, fruit', fi: 'Kaura, peruna, riisi, täysjyväleipä, hedelmät', hu: 'Zab, burgonya, rizs, teljes kiőrlésű kenyér, gyümölcs', sv: 'Havre, potatis, ris, fullkornsbröd, frukt' }, image: 'foods-carbs'
	},
	{
		name: { en: 'Vegetables', fi: 'Kasvikset', hu: 'Zöldségek', sv: 'Grönsaker' },
		examples: { en: 'Leafy greens, peppers, broccoli, tomatoes, carrots', fi: 'Lehtivihannekset, paprikat, parsakaali, tomaatit, porkkanat', hu: 'Leveles zöldek, paprika, brokkoli, paradicsom, sárgarépa', sv: 'Bladgrönt, paprika, broccoli, tomater, morötter' }, image: 'foods-veg'
	},
	{
		name: { en: 'Fruits', fi: 'Hedelmät', hu: 'Gyümölcsök', sv: 'Frukt' },
		examples: { en: 'Apples, bananas, oranges, berries, grapes', fi: 'Omenat, banaanit, appelsiinit, marjat, viinirypäleet', hu: 'Alma, banán, narancs, bogyós gyümölcsök, szőlő', sv: 'Äpplen, bananer, apelsiner, bär, vindruvor' }, image: 'foods-fruit'
	},
	{
		name: { en: 'Healthy fats', fi: 'Terveelliset rasvat', hu: 'Egészséges zsírok', sv: 'Nyttiga fetter' },
		examples: { en: 'Olive oil, nuts, seeds, avocado, oily fish', fi: 'Oliiviöljy, pähkinät, siemenet, avokado, rasvainen kala', hu: 'Olívaolaj, diófélék, magvak, avokádó, olajos hal', sv: 'Olivolja, nötter, frön, avokado, fet fisk' }, image: 'foods-fats'
	},
	{
		name: { en: 'Fibre / resistant starch', fi: 'Kuitu', hu: 'Rost / rezisztens keményítő', sv: 'Fiber / resistent stärkelse' },
		examples: { en: 'Legumes, oats, cooled potatoes/rice, green bananas', fi: 'Palkokasvit, kaura, jäähdytetyt perunat/riisi, vihreät banaanit', hu: 'Hüvelyesek, zab, lehűtött burgonya/rizs, zöld banán', sv: 'Baljväxter, havre, kyld potatis/ris, gröna bananer' }, image: 'foods-legumes'
	}
];

// High-volume, low-calorie foods - useful when in a deficit (shown for nutritionGoal 'lose').
export const highVolumeFoods: Loc = {
	en: 'Leafy salads, broth-based soups, berries, cucumber, tomatoes, popcorn (air-popped), zero-calorie drinks, and plenty of vegetables fill you up for very few calories.',
	fi: 'Lehtisalaatit, liemipohjaiset keitot, marjat, kurkku, tomaatit, ilmapaahdettu popcorn, kalorittomat juomat ja runsaat kasvikset täyttävät vatsan hyvin pienellä kalorimäärällä.',
	hu: 'Leveles saláták, alaplé alapú levesek, bogyós gyümölcsök, uborka, paradicsom, légpukkasztott popcorn, kalóriamentes italok és bőséges zöldség nagyon kevés kalóriával laktat.',
	sv: 'Bladsallad, buljongsoppor, bär, gurka, tomat, luftpoppad popcorn, kalorifria drycker och gott om grönsaker mättar för väldigt få kalorier.'
};

export const hydrationNote: Loc = {
	en: 'Aim for clear or pale-yellow urine; more on training days and in the heat. Roughly 30-35 ml per kg of body weight is a sensible baseline.',
	fi: 'Tavoittele kirkasta tai vaaleankeltaista virtsaa; enemmän treenipäivinä ja helteellä. Noin 30-35 ml painokiloa kohti on järkevä lähtötaso.',
	hu: 'Célozz tiszta vagy halványsárga vizeletet; többet edzésnapokon és melegben. Kb. 30-35 ml testtömegkilogrammonként ésszerű alap.',
	sv: 'Sikta på klar eller ljusgul urin; mer på träningsdagar och i värme. Ungefär 30-35 ml per kg kroppsvikt är en rimlig grund.'
};

export const fibreNote: Loc = {
	en: 'Build up gradually toward your daily fibre target with vegetables, fruit, whole grains and legumes; it improves fullness and digestion.',
	fi: 'Lisää kuitua vähitellen päivätavoitetta kohti kasviksilla, hedelmillä, täysjyvällä ja palkokasveilla; se parantaa kylläisyyttä ja ruoansulatusta.',
	hu: 'Fokozatosan építsd fel a napi rostcélt zöldséggel, gyümölccsel, teljes kiőrlésű gabonával és hüvelyesekkel; javítja a jóllakottságot és az emésztést.',
	sv: 'Bygg upp mot ditt dagliga fibermål gradvis med grönsaker, frukt, fullkorn och baljväxter; det förbättrar mättnad och matsmältning.'
};

export interface Supplement {
	id: string;
	name: Loc;
	tier: 'A' | 'B';
	dose: Loc;
	use: Loc;
	caution: Loc;
	goals: GoalId[];
}
export const supplements: Supplement[] = [
	{
		id: 'creatine', name: { en: 'Creatine monohydrate', fi: 'Kreatiinimonohydraatti', hu: 'Kreatin-monohidrát', sv: 'Kreatinmonohydrat' }, tier: 'A',
		dose: { en: '3-5 g per day, any time', fi: '3-5 g päivässä, mihin aikaan tahansa', hu: 'Napi 3-5 g, bármikor', sv: '3-5 g per dag, när som helst' },
		use: { en: 'The best-evidenced supplement for strength and muscle; benefits all ages.', fi: 'Parhaiten tutkittu lisäravinne voimaan ja lihaksiin; hyödyttää kaikenikäisiä.', hu: 'A legjobban bizonyított étrend-kiegészítő erőhöz és izomhoz; minden korosztálynak hasznos.', sv: 'Det bäst belagda tillskottet för styrka och muskler; gynnar alla åldrar.' },
		caution: { en: 'Optional, not required. Stay hydrated.', fi: 'Vapaaehtoinen, ei pakollinen. Juo riittävästi.', hu: 'Opcionális, nem kötelező. Igyál eleget.', sv: 'Valfritt, inte ett krav. Drick tillräckligt.' },
		goals: ['strength', 'hypertrophy', 'general']
	},
	{
		id: 'protein', name: { en: 'Protein / whey powder', fi: 'Proteiini- tai herajauhe', hu: 'Fehérje / tejsavópor', sv: 'Protein- / vasslepulver' }, tier: 'A',
		dose: { en: 'As needed to reach your daily protein target', fi: 'Tarpeen mukaan päivittäisen proteiinitavoitteen saavuttamiseksi', hu: 'Szükség szerint a napi fehérjecél eléréséhez', sv: 'Efter behov för att nå ditt dagliga proteinmål' },
		use: { en: 'A convenient way to hit protein; whole food first.', fi: 'Kätevä tapa saavuttaa proteiini; oikea ruoka ensin.', hu: 'Kényelmes módja a fehérjebevitelnek; az igazi étel az első.', sv: 'Ett smidigt sätt att nå proteinet; riktig mat först.' },
		caution: { en: 'It is a food, not a requirement.', fi: 'Se on ruokaa, ei välttämättömyys.', hu: 'Ez egy élelmiszer, nem kötelező.', sv: 'Det är ett livsmedel, inte ett krav.' },
		goals: ['strength', 'hypertrophy', 'fat-loss', 'general']
	},
	{
		id: 'vitamin-d', name: { en: 'Vitamin D', fi: 'D-vitamiini', hu: 'D-vitamin', sv: 'D-vitamin' }, tier: 'A',
		dose: { en: 'Per label if deficient; common in northern winters', fi: 'Pakkauksen ohjeen mukaan jos puutosta; yleistä pohjoisen talvina', hu: 'A címke szerint, ha hiányos; gyakori az északi teleken', sv: 'Enligt förpackning vid brist; vanligt under nordiska vintrar' },
		use: { en: 'Corrects a deficiency; consider testing your level.', fi: 'Korjaa puutoksen; harkitse tason mittaamista.', hu: 'Pótolja a hiányt; érdemes méretni a szintedet.', sv: 'Åtgärdar en brist; överväg att testa din nivå.' },
		caution: { en: 'For correcting deficiency, not a performance booster.', fi: 'Puutoksen korjaamiseen, ei suorituskyvyn parantamiseen.', hu: 'A hiány pótlására, nem teljesítménynövelő.', sv: 'För att åtgärda brist, inte en prestationshöjare.' },
		goals: ['general', 'strength', 'hypertrophy', 'fat-loss']
	},
	{
		id: 'omega-3', name: { en: 'Omega-3 (fish or algae oil)', fi: 'Omega-3 (kala- tai leväöljy)', hu: 'Omega-3 (hal- vagy algaolaj)', sv: 'Omega-3 (fisk- eller algolja)' }, tier: 'A',
		dose: { en: 'About 1 g EPA+DHA per day', fi: 'Noin 1 g EPA+DHA päivässä', hu: 'Napi kb. 1 g EPA+DHA', sv: 'Cirka 1 g EPA+DHA per dag' },
		use: { en: 'Supports general health; the food source is oily fish.', fi: 'Tukee yleisterveyttä; ravinnonlähde on rasvainen kala.', hu: 'Az általános egészséget támogatja; étrendi forrása az olajos hal.', sv: 'Stödjer allmän hälsa; matkällan är fet fisk.' },
		caution: { en: 'Optional alongside a varied diet.', fi: 'Vapaaehtoinen monipuolisen ruokavalion ohella.', hu: 'Opcionális a változatos étrend mellett.', sv: 'Valfritt vid en varierad kost.' },
		goals: ['general', 'strength', 'hypertrophy', 'fat-loss']
	},
	{
		id: 'caffeine', name: { en: 'Caffeine', fi: 'Kofeiini', hu: 'Koffein', sv: 'Koffein' }, tier: 'A',
		dose: { en: 'A sensible pre-workout dose (e.g. a coffee)', fi: 'Järkevä annos ennen treeniä (esim. kahvi)', hu: 'Ésszerű edzés előtti adag (pl. egy kávé)', sv: 'En rimlig dos före träning (t.ex. en kaffe)' },
		use: { en: 'Can support training energy and focus.', fi: 'Voi tukea treenienergiaa ja keskittymistä.', hu: 'Támogathatja az edzésenergiát és a fókuszt.', sv: 'Kan stödja träningsenergi och fokus.' },
		caution: { en: 'Mind your total daily intake and your sleep.', fi: 'Tarkkaile päivittäistä kokonaissaantia ja untasi.', hu: 'Figyelj a napi összbevitelre és az alvásodra.', sv: 'Tänk på ditt totala dagliga intag och din sömn.' },
		goals: ['strength', 'hypertrophy', 'fat-loss', 'general']
	}
];

export const supplementIntro: Loc = {
	en: 'This is neutral education, not advertising. Supplements are optional extras on top of good training, food and sleep - none of them are required. Food first, always.',
	fi: 'Tämä on neutraalia tietoa, ei mainontaa. Lisäravinteet ovat vapaaehtoisia lisiä hyvän harjoittelun, ruoan ja unen päälle - mikään niistä ei ole pakollinen. Ruoka ensin, aina.',
	hu: 'Ez semleges tájékoztatás, nem reklám. Az étrend-kiegészítők opcionális kiegészítők a jó edzés, étkezés és alvás mellett - egyik sem kötelező. Mindig az étel az első.',
	sv: 'Detta är neutral information, inte reklam. Kosttillskott är valfria tillägg ovanpå bra träning, mat och sömn - inget av dem är ett krav. Mat först, alltid.'
};

// ---- Tier B supplements: commonly discussed, weak/mixed evidence, NOT recommended, no dosing ----
// (Digest D6.2.7) Shown as honest education on the Nutrition page; never in the generated plan.
export const supplementsTierB: { id: string; name: Loc; note: Loc }[] = [
	{ id: 'bcaa', name: { en: 'BCAAs', fi: 'BCAA-aminohapot', hu: 'BCAA-aminosavak', sv: 'BCAA-aminosyror' }, note: { en: 'Of little use if you already eat enough protein.', fi: 'Vähän hyötyä, jos saat jo riittävästi proteiinia.', hu: 'Alig van haszna, ha amúgy is elég fehérjét eszel.', sv: 'Liten nytta om du redan får i dig tillräckligt med protein.' } },
	{ id: 'fat-burner', name: { en: 'Fat burners', fi: 'Rasvanpolttajat', hu: 'Zsírégetők', sv: 'Fettförbrännare' }, note: { en: 'Marketing around a tiny effect at best; no substitute for a calorie deficit.', fi: 'Markkinointia korkeintaan pienen vaikutuksen ympärillä; ei korvaa kalorivajetta.', hu: 'Legjobb esetben is egy elenyésző hatás köré épített marketing; nem helyettesíti a kalóriadeficitet.', sv: 'Marknadsföring kring i bästa fall en liten effekt; ersätter inte ett kaloriunderskott.' } },
	{ id: 'test-booster', name: { en: 'Testosterone boosters', fi: 'Testosteronin tehosteet', hu: 'Tesztoszteronfokozók', sv: 'Testosteronhöjare' }, note: { en: 'Over-the-counter boosters do not meaningfully raise testosterone.', fi: 'Käsikauppavalmisteet eivät nosta testosteronia merkittävästi.', hu: 'A szabadon kapható készítmények érdemben nem emelik a tesztoszteronszintet.', sv: 'Receptfria preparat höjer inte testosteronet på något meningsfullt sätt.' } },
	{ id: 'glutamine', name: { en: 'Glutamine', fi: 'Glutamiini', hu: 'Glutamin', sv: 'Glutamin' }, note: { en: 'Popular but without a clear benefit for healthy trainees.', fi: 'Suosittu mutta ilman selvää hyötyä terveille harjoittelijoille.', hu: 'Népszerű, de egészséges edzők számára nincs egyértelmű haszna.', sv: 'Populärt men utan tydlig nytta för friska träningsutövare.' } },
	{ id: 'taurine', name: { en: 'Taurine', fi: 'Tauriini', hu: 'Taurin', sv: 'Taurin' }, note: { en: 'Researched for various effects; the evidence is still mixed.', fi: 'Tutkittu eri vaikutusten osalta; näyttö on yhä ristiriitaista.', hu: 'Sokféle hatás kapcsán vizsgálták; a bizonyítékok egyelőre ellentmondásosak.', sv: 'Undersökt för olika effekter; beläggen är fortfarande motstridiga.' } },
	{ id: 'fibre-supp', name: { en: 'Resistant starch / fibre supplements', fi: 'Resistentti tärkkelys ja kuitulisät', hu: 'Rezisztens keményítő és rostkészítmények', sv: 'Resistent stärkelse och fibertillskott' }, note: { en: 'Whole-food fibre is the simpler, cheaper route.', fi: 'Kokoruoan kuitu on yksinkertaisempi ja edullisempi tapa.', hu: 'A teljes értékű ételekből származó rost egyszerűbb és olcsóbb megoldás.', sv: 'Fiber från riktig mat är det enklare och billigare alternativet.' } }
];
export const supplementsTierBIntro: Loc = {
	en: 'These come up a lot, but the evidence is weak or mixed. We list them honestly; we do not recommend them and give no dosing. The basics and food come first.',
	fi: 'Nämä nousevat usein esiin, mutta näyttö on heikkoa tai ristiriitaista. Listaamme ne rehellisesti; emme suosittele niitä emmekä anna annostusta. Perusasiat ja ruoka ensin.',
	hu: 'Ezek gyakran szóba kerülnek, de a bizonyíték gyenge vagy vegyes. Őszintén felsoroljuk őket; nem ajánljuk és nem adunk adagolást. Az alapok és az étel az első.',
	sv: 'Dessa nämns ofta, men bevisen är svaga eller blandade. Vi listar dem ärligt; vi rekommenderar dem inte och ger ingen dosering. Grunderna och maten kommer först.'
};

// ---- Intensity techniques: make light loads hard (Digest D5.11 / D6.2.9) ----
export const intensityTechniques: { name: Loc; how: Loc }[] = [
	{ name: { en: 'Slow lowering', fi: 'Hidas lasku', hu: 'Lassú leengedés', sv: 'Långsam negativ fas' }, how: { en: 'Take 3-4 seconds to lower each rep; the muscle works harder with no extra load.', fi: 'Käytä 3-4 sekuntia jokaisen toiston laskuun; lihas tekee enemmän työtä ilman lisäkuormaa.', hu: 'Engedd le minden ismétlést 3-4 másodperc alatt; az izom keményebben dolgozik plusz terhelés nélkül.', sv: 'Ta 3-4 sekunder på att sänka varje repetition; muskeln jobbar hårdare utan extra belastning.' } },
	{ name: { en: 'Pauses', fi: 'Tauot', hu: 'Megállások', sv: 'Pauser' }, how: { en: 'Pause 1-2 seconds at the hardest point to remove momentum.', fi: 'Pidä 1-2 sekunnin tauko vaikeimmassa kohdassa poistaaksesi vauhdin.', hu: 'Tarts 1-2 másodperc szünetet a legnehezebb ponton, hogy kivedd a lendületet.', sv: 'Pausa 1-2 sekunder i det tyngsta läget för att ta bort fart.' } },
	{ name: { en: 'One-and-a-half reps', fi: 'Puolitoista-toistot', hu: 'Másfeles ismétlések', sv: 'En och en halv repetition' }, how: { en: 'Do a full rep, then a half rep, and count the two as one.', fi: 'Tee täysi toisto, sitten puolikas, ja laske ne yhdeksi.', hu: 'Csinálj egy teljes ismétlést, majd egy felet, és számold a kettőt egynek.', sv: 'Gör en hel repetition, sedan en halv, och räkna de två som en.' } },
	{ name: { en: 'Shorter rest', fi: 'Lyhyempi lepo', hu: 'Rövidebb pihenő', sv: 'Kortare vila' }, how: { en: 'Cut the rest between sets to make the same work harder.', fi: 'Lyhennä sarjojen välistä lepoa tehdäksesi saman työn raskaammaksi.', hu: 'Csökkentsd a sorozatok közötti pihenőt, hogy ugyanaz a munka nehezebb legyen.', sv: 'Korta vilan mellan seten för att göra samma arbete tyngre.' } },
	{ name: { en: 'Closer to failure', fi: 'Lähemmäs uupumusta', hu: 'Közelebb a kifáradáshoz', sv: 'Närmare utmattning' }, how: { en: 'With light loads, take the set to within 1-2 reps of failure.', fi: 'Kevyillä kuormilla vie sarja 1-2 toiston päähän uupumuksesta.', hu: 'Könnyű súlyokkal vidd a sorozatot 1-2 ismétlésnyire a kifáradástól.', sv: 'Med lätta vikter, ta setet till 1-2 repetitioner från utmattning.' } },
	{ name: { en: 'One side at a time', fi: 'Yksi puoli kerrallaan', hu: 'Egyszerre egy oldal', sv: 'En sida i taget' }, how: { en: 'Train one arm or leg at a time to roughly double the relative load.', fi: 'Harjoita yhtä kättä tai jalkaa kerrallaan kaksinkertaistaaksesi suhteellisen kuorman.', hu: 'Edzd egyszerre csak az egyik kart vagy lábat, hogy nagyjából megduplázd a viszonylagos terhelést.', sv: 'Träna en arm eller ett ben i taget för att ungefär fördubbla den relativa belastningen.' } }
];

// ---- Body-metric explanations (calm, non-alarmist, with limitations) ----
export const bmiNote: Loc = {
	en: 'BMI is a quick screen from height and weight only. It cannot tell muscle from fat, so very muscular people often read high and it does not apply during pregnancy. Treat it as a rough guide, not a verdict.',
	fi: 'BMI on nopea arvio pelkästä pituudesta ja painosta. Se ei erota lihasta rasvasta, joten hyvin lihaksikkailla lukema on usein korkea, eikä se päde raskauden aikana. Pidä sitä suuntaa antavana, ei tuomiona.',
	hu: 'A BMI gyors becslés csak a magasságból és testsúlyból. Nem különbözteti meg az izmot a zsírtól, ezért nagyon izmos embereknél gyakran magas, és terhesség alatt nem érvényes. Tekintsd iránymutatásnak, nem ítéletnek.',
	sv: 'BMI är en snabb uppskattning från enbart längd och vikt. Det skiljer inte muskler från fett, så mycket muskulösa personer får ofta ett högt värde, och det gäller inte under graviditet. Se det som en grov vägledning, inte en dom.'
};
export const paceNote: Loc = {
	en: 'This target changes weight faster than about 1% of your body weight a week. A steadier pace (roughly 0.5-1 kg a week) is easier to sustain and helps protect muscle.',
	fi: 'Tämä tavoite muuttaa painoa nopeammin kuin noin 1 % painostasi viikossa. Tasaisempi tahti (noin 0,5-1 kg viikossa) on helpompi ylläpitää ja suojaa lihaksia.',
	hu: 'Ez a cél gyorsabban változtatja a súlyt, mint kb. a testsúlyod 1%-a hetente. Az egyenletesebb ütem (kb. 0,5-1 kg hetente) könnyebben fenntartható és védi az izmot.',
	sv: 'Det här målet ändrar vikten snabbare än ungefär 1% av din kroppsvikt per vecka. En jämnare takt (cirka 0,5-1 kg per vecka) är lättare att hålla och skyddar musklerna.'
};
export const waistNote: Loc = {
	en: 'Waist-to-height tracks central fat better than BMI and is not thrown off by muscle. A simple aim is to keep your waist under half your height (ratio below 0.5). Measure at the navel, relaxed.',
	fi: 'Vyötärön suhde pituuteen kuvaa keskivartalon rasvaa paremmin kuin BMI, eikä lihas vääristä sitä. Yksinkertainen tavoite on pitää vyötärö alle puolet pituudesta (suhde alle 0,5). Mittaa navan kohdalta rentona.',
	hu: 'A derék-magasság arány jobban jelzi a hasi zsírt, mint a BMI, és az izom nem torzítja. Egyszerű cél: tartsd a derekad a magasságod felénél kisebbnek (arány 0,5 alatt). Köldöknél mérd, lazán.',
	sv: 'Midja-längd visar bukfett bättre än BMI och påverkas inte av muskler. Ett enkelt mål är att hålla midjan under halva längden (kvot under 0,5). Mät vid naveln, avslappnad.'
};
export const pregnancyBodyNote: Loc = {
	en: 'BMI and weight-change targets are not used during pregnancy or shortly after birth. Follow the guidance of your doctor or midwife.',
	fi: 'BMI:tä ja painonmuutostavoitteita ei käytetä raskauden aikana tai pian synnytyksen jälkeen. Noudata lääkärisi tai kätilösi ohjeita.',
	hu: 'A BMI-t és a súlyváltozási célokat nem használjuk terhesség alatt vagy röviddel a szülés után. Kövesd az orvosod vagy a szülésznőd útmutatását.',
	sv: 'BMI och mål för viktförändring används inte under graviditet eller strax efter förlossning. Följ råden från din läkare eller barnmorska.'
};

// Hard deny-list: never recommended, never given a protocol.
export const DENY_SUBSTANCES = [
	'ECA stack', 'DNP', 'clenbuterol', 'T3 / thyroid', 'SARMs', 'anabolic steroids',
	'high-dose yohimbine', 'fat burners', 'HGH', 'DHEA'
] as const;
