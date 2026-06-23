// Structured per-exercise profiles, kept separate from the exercise definitions so the
// 100 exercise objects stay stable and the rich attributes can be authored/validated on their own.
// Merged + surfaced on the exercise detail pages. Suitability fields are set ONLY where there is a
// real, defensible reason; an omitted field means "suitable for all" (Mikael's explicit steer).
import type { Loc } from './data';
import { L } from './data';
import { profilesA } from './profiles-a';
import { profilesB } from './profiles-b';

export type BodyPart =
	| 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Core' | 'Legs' | 'Glutes' | 'Calves'
	| 'Full body' | 'Mobility';
export type PurposeTag =
	| 'strength' | 'hypertrophy' | 'endurance' | 'mobility' | 'rehab' | 'fat-loss' | 'posture' | 'general';
export type Level = 'beginner' | 'intermediate' | 'advanced' | 'professional';

export interface ExerciseProfile {
	bodyPart: BodyPart;
	secondary?: string[]; // secondary muscle keys (may be omitted/empty)
	effectiveness: number; // 1-5 overall effectiveness for its main purpose
	purposes: PurposeTag[]; // 1-4 main purposes
	equipment: string[]; // concrete equipment labels, e.g. ['Barbell','Rack'] or ['None'] (display + default AND-gate)
	// Optional alternatives gate (lowercase ownership TOKENS). Each inner array is an OR-group;
	// ALL groups must be satisfied (AND across groups). When present it REPLACES the label-derived
	// AND gate for this exercise. Absent = unchanged behaviour. Lets one exercise accept any of
	// several supports (e.g. a table OR bench OR chair) instead of demanding all of them.
	equipmentAny?: string[][];
	level: Level;
	recommended: Loc; // sets/reps/duration/intensity guidance
	// Suitability - present ONLY when there is a real reason; absence = suits all.
	ageMin?: number;
	ageMax?: number;
	bmiMax?: number;
	heightNote?: Loc;
	waistNote?: Loc;
	genderNote?: Loc;
	note?: Loc;
	// Library filter metadata (PR-I) - all optional; absent = unrestricted. Drives the prenatal/postpartum
	// safety predicate (supine/prone by trimester, high impact, high balance, diastasis) and future filters.
	position?: 'supine' | 'prone' | 'standing' | 'seated' | 'hands-knees' | 'side-lying' | 'floor-other';
	impact?: 'low' | 'medium' | 'high';
	balanceDemand?: 'low' | 'medium' | 'high';
	jointLoad?: string[];
	diastasisCaution?: boolean;
}

export const profiles: Record<string, ExerciseProfile> = { ...profilesA, ...profilesB };

export function getProfile(id: string): ExerciseProfile | undefined {
	return profiles[id];
}

// Localised labels for body parts and purposes (i18n catalogues key these too, but engine-side
// fallback lives here for any code path that needs the English label).
export const bodyParts: BodyPart[] = ['Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Legs', 'Glutes', 'Calves', 'Full body', 'Mobility'];
export const purposeTags: PurposeTag[] = ['strength', 'hypertrophy', 'endurance', 'mobility', 'rehab', 'fat-loss', 'posture', 'general'];

// ---- Localised labels (4 languages) ----
const BODY_PART: Record<string, Loc> = {
	Chest: { en: 'Chest', fi: 'Rinta', hu: 'Mell', sv: 'Bröst' },
	Back: { en: 'Back', fi: 'Selkä', hu: 'Hát', sv: 'Rygg' },
	Shoulders: { en: 'Shoulders', fi: 'Olkapäät', hu: 'Vállak', sv: 'Axlar' },
	Arms: { en: 'Arms', fi: 'Kädet', hu: 'Karok', sv: 'Armar' },
	Core: { en: 'Core', fi: 'Keskivartalo', hu: 'Törzs', sv: 'Bål' },
	Legs: { en: 'Legs', fi: 'Jalat', hu: 'Lábak', sv: 'Ben' },
	Glutes: { en: 'Glutes', fi: 'Pakarat', hu: 'Farizom', sv: 'Säte' },
	Calves: { en: 'Calves', fi: 'Pohkeet', hu: 'Vádli', sv: 'Vader' },
	'Full body': { en: 'Full body', fi: 'Koko keho', hu: 'Egész test', sv: 'Hela kroppen' },
	Mobility: { en: 'Mobility', fi: 'Liikkuvuus', hu: 'Mobilitás', sv: 'Rörlighet' }
};
const PURPOSE: Record<string, Loc> = {
	strength: { en: 'Strength', fi: 'Voima', hu: 'Erő', sv: 'Styrka' },
	hypertrophy: { en: 'Muscle growth', fi: 'Lihaskasvu', hu: 'Izomépítés', sv: 'Muskeltillväxt' },
	endurance: { en: 'Endurance', fi: 'Kestävyys', hu: 'Állóképesség', sv: 'Uthållighet' },
	mobility: { en: 'Mobility', fi: 'Liikkuvuus', hu: 'Mobilitás', sv: 'Rörlighet' },
	rehab: { en: 'Rehab', fi: 'Kuntoutus', hu: 'Rehabilitáció', sv: 'Rehab' },
	'fat-loss': { en: 'Fat loss', fi: 'Rasvanpoltto', hu: 'Zsírégetés', sv: 'Fettförbränning' },
	posture: { en: 'Posture', fi: 'Ryhti', hu: 'Testtartás', sv: 'Hållning' },
	general: { en: 'General fitness', fi: 'Yleiskunto', hu: 'Általános erőnlét', sv: 'Allmän kondition' }
};
const LEVEL: Record<string, Loc> = {
	beginner: { en: 'Beginner', fi: 'Aloittelija', hu: 'Kezdő', sv: 'Nybörjare' },
	intermediate: { en: 'Intermediate', fi: 'Keskitaso', hu: 'Középhaladó', sv: 'Medel' },
	advanced: { en: 'Advanced', fi: 'Edistynyt', hu: 'Haladó', sv: 'Avancerad' },
	professional: { en: 'Professional', fi: 'Ammattilainen', hu: 'Profi', sv: 'Professionell' }
};
const EQUIP: Record<string, Loc> = {
	None: { en: 'None', fi: 'Ei välineitä', hu: 'Nincs', sv: 'Inget' },
	Wall: { en: 'Wall', fi: 'Seinä', hu: 'Fal', sv: 'Vägg' },
	Chair: { en: 'Chair', fi: 'Tuoli', hu: 'Szék', sv: 'Stol' },
	Table: { en: 'Table', fi: 'Pöytä', hu: 'Asztal', sv: 'Bord' },
	Bench: { en: 'Bench', fi: 'Penkki', hu: 'Pad', sv: 'Bänk' },
	Dumbbell: { en: 'Dumbbell', fi: 'Käsipaino', hu: 'Kézisúlyzó', sv: 'Hantel' },
	Dumbbells: { en: 'Dumbbells', fi: 'Käsipainot', hu: 'Kézisúlyzók', sv: 'Hantlar' },
	Kettlebell: { en: 'Kettlebell', fi: 'Kahvakuula', hu: 'Kettlebell', sv: 'Kettlebell' },
	Barbell: { en: 'Barbell', fi: 'Levytanko', hu: 'Rúd', sv: 'Skivstång' },
	Rack: { en: 'Rack', fi: 'Teline', hu: 'Állvány', sv: 'Ställning' },
	'Pull-up bar': { en: 'Pull-up bar', fi: 'Leuanvetotanko', hu: 'Húzódzkodórúd', sv: 'Räckstång' },
	'Resistance band': { en: 'Resistance band', fi: 'Vastuskumi', hu: 'Gumiszalag', sv: 'Träningsband' },
	'Cable machine': { en: 'Cable machine', fi: 'Taljalaite', hu: 'Csigás gép', sv: 'Kabelmaskin' },
	Machine: { en: 'Machine', fi: 'Laite', hu: 'Gép', sv: 'Maskin' },
	'Ab wheel': { en: 'Ab wheel', fi: 'Vatsarulla', hu: 'Haskerék', sv: 'Magrulle' },
	'Exercise ball': { en: 'Exercise ball', fi: 'Jumppapallo', hu: 'Fitneszlabda', sv: 'Pilatesboll' },
	Treadmill: { en: 'Treadmill', fi: 'Juoksumatto', hu: 'Futópad', sv: 'Löpband' },
	'Walking pad': { en: 'Walking pad', fi: 'Kävelymatto', hu: 'Járópad', sv: 'Gångband' },
	'Exercise bike': { en: 'Exercise bike', fi: 'Kuntopyörä', hu: 'Szobabicikli', sv: 'Motionscykel' },
	'Rowing machine': { en: 'Rowing machine', fi: 'Soutulaite', hu: 'Evezőgép', sv: 'Roddmaskin' }
};
export const bodyPartLabel = (k: string, lang: string) => L(BODY_PART[k] ?? { en: k }, lang);
export const purposeLabel = (k: string, lang: string) => L(PURPOSE[k] ?? { en: k }, lang);
export const levelLabel = (k: string, lang: string) => L(LEVEL[k] ?? { en: k }, lang);
export const equipLabel = (k: string, lang: string) => L(EQUIP[k] ?? { en: k }, lang);
