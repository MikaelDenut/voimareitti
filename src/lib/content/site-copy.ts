// Prose-only content + the Loc type/helper. Deliberately imports NOTHING heavy, so light pages
// (e.g. the About page) can pull just this instead of the whole exercise dataset in data.ts.
// data.ts re-exports Loc + L from here, so existing `from '$lib/content/data'` imports keep working.

export interface Loc {
	en: string;
	fi?: string;
	hu?: string;
	sv?: string;
}

export function L(x: Loc, lang: string): string {
	const v = (x as unknown as Record<string, string | undefined>)[lang];
	return v ?? x.en;
}

// ---- About / How it works ----
export const aboutLead: Loc = {
	en: 'Voimareitti turns a few simple inputs into a personalized strength-training, nutrition and supplement guide you can use, change, print, or ignore. It is a free, automatic tool - not a coach and not medical advice.',
	fi: 'Voimareitti muuttaa muutaman yksinkertaisen tiedon henkilökohtaiseksi voimaharjoittelu-, ravinto- ja lisäravinneoppaaksi, jota voit käyttää, muuttaa, tulostaa tai jättää huomiotta. Se on ilmainen, automaattinen työkalu - ei valmentaja eikä lääketieteellinen neuvo.',
	hu: 'A Voimareitti néhány egyszerű adatból személyre szabott erőnléti, táplálkozási és étrend-kiegészítő útmutatót készít, amelyet használhatsz, módosíthatsz, kinyomtathatsz vagy figyelmen kívül hagyhatsz. Ingyenes, automatikus eszköz - nem edző és nem orvosi tanács.',
	sv: 'Voimareitti gör om några enkla uppgifter till en personlig guide för styrketräning, kost och kosttillskott som du kan använda, ändra, skriva ut eller ignorera. Det är ett gratis, automatiskt verktyg - inte en coach och inte medicinsk rådgivning.'
};
export const aboutSteps: { title: Loc; body: Loc }[] = [
	{
		title: { en: 'Tell us about you', fi: 'Kerro itsestäsi', hu: 'Mesélj magadról', sv: 'Berätta om dig' },
		body: { en: 'Age, sex, height, weight, your training and nutrition goals, experience, training style, days and minutes, and what equipment you have.', fi: 'Ikä, sukupuoli, pituus, paino, treeni- ja ravintotavoitteesi, kokemus, treenityyli, päivät ja minuutit sekä käytettävissä olevat välineet.', hu: 'Életkor, nem, magasság, testsúly, edzés- és táplálkozási célok, tapasztalat, edzésstílus, napok és percek, valamint a rendelkezésre álló felszerelés.', sv: 'Ålder, kön, längd, vikt, dina tränings- och kostmål, erfarenhet, träningsstil, dagar och minuter, och vilken utrustning du har.' }
	},
	{
		title: { en: 'We estimate your energy and macros', fi: 'Arvioimme energiasi ja makrosi', hu: 'Megbecsüljük az energiát és a makrókat', sv: 'Vi uppskattar din energi och dina makron' },
		body: { en: 'A cited equation estimates your resting and daily burn, then a calorie and protein target for your goal, plus fibre and water.', fi: 'Tutkittu kaava arvioi lepo- ja päiväkulutuksesi, sitten kalori- ja proteiinitavoitteen tavoitteellesi sekä kuidun ja veden.', hu: 'Egy hivatkozott képlet megbecsüli a nyugalmi és napi égetést, majd a célodhoz tartozó kalória- és fehérjecélt, valamint a rostot és a vizet.', sv: 'En refererad formel uppskattar din vilande och dagliga förbränning, sedan ett kalori- och proteinmål för ditt mål, plus fiber och vatten.' }
	},
	{
		title: { en: 'We build the program', fi: 'Rakennamme ohjelman', hu: 'Felépítjük a programot', sv: 'Vi bygger programmet' },
		body: { en: 'A deterministic engine picks a weekly structure and exercises that fit your equipment, experience and time, with sets, reps, rest and progression.', fi: 'Deterministinen moottori valitsee viikkorakenteen ja liikkeet, jotka sopivat välineisiisi, kokemukseesi ja aikaasi, sarjoineen, toistoineen, lepoineen ja etenemisineen.', hu: 'Egy determinisztikus motor heti felépítést és gyakorlatokat választ, amelyek illenek a felszereléshez, tapasztalathoz és időhöz, sorozatokkal, ismétlésekkel, pihenővel és progresszióval.', sv: 'En deterministisk motor väljer en veckostruktur och övningar som passar din utrustning, erfarenhet och tid, med set, reps, vila och progression.' }
	},
	{
		title: { en: 'Use it, print it, adjust it', fi: 'Käytä, tulosta, säädä', hu: 'Használd, nyomtasd, állítsd', sv: 'Använd, skriv ut, justera' },
		body: { en: 'Read it on screen or save a clean PDF. Change any input and the plan changes with it. Come back any time - your inputs stay on your device.', fi: 'Lue se näytöltä tai tallenna siisti PDF. Muuta mitä tahansa tietoa ja suunnitelma muuttuu mukana. Palaa milloin tahansa - tietosi pysyvät laitteellasi.', hu: 'Olvasd a képernyőn vagy ments egy letisztult PDF-et. Változtass bármelyik adaton, és a terv vele változik. Térj vissza bármikor - az adataid az eszközödön maradnak.', sv: 'Läs den på skärmen eller spara en ren PDF. Ändra valfri uppgift så ändras planen. Kom tillbaka när som helst - dina uppgifter stannar på din enhet.' }
	}
];
