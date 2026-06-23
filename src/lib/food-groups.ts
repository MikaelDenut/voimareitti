// Shared food-group funnel + diet-info content (planning sections 15-16). Used by the workout result
// page and the nutrition page so the copy never drifts. 4-language, correct diacritics, plain hyphens.
import type { Loc } from './content/data';

// foodGroups image slug -> recipes ?focus key.
export const FOCUS_BY_IMAGE: Record<string, string> = {
	'foods-protein': 'protein', 'foods-carbs': 'carbs', 'foods-veg': 'vegetables',
	'foods-fruit': 'fruit', 'foods-fats': 'fats', 'foods-legumes': 'fibre'
};
export function focusKeyFromImage(image?: string): string {
	return (image && FOCUS_BY_IMAGE[image]) || 'protein';
}

// Short hook per food group (keyed by focus key).
export const FG_INFO: Record<string, Loc> = {
	protein: { en: 'Protein helps you keep and build muscle and keeps meals filling. Aim for a source at each meal.', fi: 'Proteiini auttaa ylläpitämään ja kasvattamaan lihasta ja pitää ateriat kylläisinä. Tavoittele lähde joka aterialle.', hu: 'A fehérje segít megőrizni és építeni az izmot, és jóllakottá teszi az étkezést. Minden étkezésnél legyen forrása.', sv: 'Protein hjälper dig behålla och bygga muskler och gör måltider mättande. Sikta på en källa vid varje måltid.' },
	carbs: { en: 'Quality carbs fuel training and recovery. Favour whole grains, potatoes, fruit.', fi: 'Laadukkaat hiilihydraatit antavat energiaa treeniin ja palautumiseen. Suosi täysjyvää, perunaa, hedelmiä.', hu: 'A minőségi szénhidrátok energiát adnak az edzéshez és regenerációhoz. Részesítsd előnyben a teljes kiőrlésűt, burgonyát, gyümölcsöt.', sv: 'Bra kolhydrater ger energi till träning och återhämtning. Välj fullkorn, potatis, frukt.' },
	vegetables: { en: 'Vegetables add fibre, vitamins and volume for few calories. Fill half the plate.', fi: 'Vihannekset tuovat kuitua, vitamiineja ja tilavuutta vähin kalorein. Täytä puolet lautasesta.', hu: 'A zöldségek rostot, vitaminokat és tömeget adnak kevés kalóriával. Töltsd meg velük a tányér felét.', sv: 'Grönsaker ger fiber, vitaminer och volym för få kalorier. Fyll halva tallriken.' },
	fruit: { en: 'Fruit is an easy source of vitamins, fibre and natural sweetness.', fi: 'Hedelmä on helppo vitamiinien, kuidun ja luontaisen makeuden lähde.', hu: 'A gyümölcs a vitaminok, rostok és természetes édesség egyszerű forrása.', sv: 'Frukt är en enkel källa till vitaminer, fiber och naturlig sötma.' },
	fats: { en: 'Healthy fats support hormones and help you absorb vitamins. A little goes a long way.', fi: 'Terveelliset rasvat tukevat hormoneja ja auttavat vitamiinien imeytymisessä. Pieni määrä riittää.', hu: 'Az egészséges zsírok támogatják a hormonokat és segítik a vitaminok felszívódását. Kevés is sokat számít.', sv: 'Nyttiga fetter stödjer hormoner och hjälper dig ta upp vitaminer. Lite räcker långt.' },
	fibre: { en: 'Fibre-rich foods aid digestion and keep you full. Beans, lentils, oats, whole grains.', fi: 'Kuitupitoiset ruoat edistävät ruoansulatusta ja pitävät kylläisenä. Pavut, linssit, kaura, täysjyvä.', hu: 'A rostban gazdag ételek segítik az emésztést és jóllakottá tesznek. Bab, lencse, zab, teljes kiőrlésű.', sv: 'Fiberrik mat hjälper matsmältningen och håller dig mätt. Bönor, linser, havre, fullkorn.' }
};

// Diet-info topics for the nutrition page. General wellness info, not medical advice.
export const DIET_INFO: { key: string; title: Loc; body: Loc }[] = [
	{
		key: 'fodmap',
		title: { en: 'FODMAP / IBS', fi: 'FODMAP / IBS', hu: 'FODMAP / IBS', sv: 'FODMAP / IBS' },
		body: { en: 'A low-FODMAP approach can ease IBS symptoms by limiting certain fermentable carbs. Use it as a gentle guide, not a strict rule, and reintroduce foods over time. Not medical advice.', fi: 'Vähä-FODMAP-ruokavalio voi helpottaa IBS-oireita rajoittamalla tiettyjä fermentoituvia hiilihydraatteja. Käytä sitä kevyenä ohjeena, ei tiukkana sääntönä, ja palauta ruokia vähitellen. Ei lääketieteellistä neuvontaa.', hu: 'Az alacsony FODMAP-tartalmú étrend enyhítheti az IBS tüneteit bizonyos erjedő szénhidrátok korlátozásával. Használd enyhe iránymutatásként, ne szigorú szabályként, és fokozatosan vezesd vissza az ételeket. Nem orvosi tanács.', sv: 'En låg-FODMAP-kost kan lindra IBS-besvär genom att begränsa vissa jäsbara kolhydrater. Använd den som en mild vägledning, inte en strikt regel, och återinför livsmedel över tid. Inte medicinsk rådgivning.' }
	},
	{
		key: 'gluten',
		title: { en: 'Coeliac / gluten-free', fi: 'Keliakia / gluteeniton', hu: 'Cöliákia / gluténmentes', sv: 'Celiaki / glutenfri' },
		body: { en: 'People with coeliac disease must avoid gluten (wheat, barley, rye). Many foods are naturally gluten-free (rice, potatoes, oats marked gluten-free). Always check labels. Not medical advice.', fi: 'Keliakiaa sairastavien on vältettävä gluteenia (vehnä, ohra, ruis). Monet ruoat ovat luonnostaan gluteenittomia (riisi, peruna, gluteenittomaksi merkitty kaura). Tarkista aina pakkausmerkinnät. Ei lääketieteellistä neuvontaa.', hu: 'A cöliákiásoknak kerülniük kell a glutént (búza, árpa, rozs). Sok étel természetesen gluténmentes (rizs, burgonya, gluténmentesnek jelölt zab). Mindig ellenőrizd a címkéket. Nem orvosi tanács.', sv: 'Personer med celiaki måste undvika gluten (vete, korn, råg). Många livsmedel är naturligt glutenfria (ris, potatis, havre märkt glutenfri). Kontrollera alltid etiketter. Inte medicinsk rådgivning.' }
	},
	{
		key: 'lactose',
		title: { en: 'Lactose-free', fi: 'Laktoositon', hu: 'Laktózmentes', sv: 'Laktosfri' },
		body: { en: 'Lactose intolerance means trouble digesting milk sugar. Lactose-free dairy, hard cheeses, and plant drinks are usually well tolerated. Not medical advice.', fi: 'Laktoosi-intoleranssi tarkoittaa vaikeutta sulattaa maitosokeria. Laktoosittomat maitotuotteet, kovat juustot ja kasvijuomat ovat yleensä hyvin siedettyjä. Ei lääketieteellistä neuvontaa.', hu: 'A laktózérzékenység a tejcukor emésztésének nehézségét jelenti. A laktózmentes tejtermékek, kemény sajtok és növényi italok általában jól tolerálhatók. Nem orvosi tanács.', sv: 'Laktosintolerans innebär svårt att smälta mjölksocker. Laktosfria mejeriprodukter, hårda ostar och växtdrycker tolereras oftast väl. Inte medicinsk rådgivning.' }
	},
	{
		key: 'allergens',
		title: { en: 'Allergens (soy, nuts)', fi: 'Allergeenit (soija, pähkinät)', hu: 'Allergének (szója, dió)', sv: 'Allergener (soja, nötter)' },
		body: { en: 'Allergies are individual and can be serious. The diet tags here are a starting point, not a guarantee - always check the actual product labels. Not medical advice.', fi: 'Allergiat ovat yksilöllisiä ja voivat olla vakavia. Tässä olevat ruokavaliomerkinnät ovat lähtökohta, eivät takuu - tarkista aina käyttämäsi tuotteen pakkausmerkinnät. Ei lääketieteellistä neuvontaa.', hu: 'Az allergiák egyéniek és súlyosak lehetnek. Az itteni étrendi címkék kiindulópontot jelentenek, nem garanciát - mindig ellenőrizd a tényleges termék címkéjét. Nem orvosi tanács.', sv: 'Allergier är individuella och kan vara allvarliga. Kosttaggarna här är en utgångspunkt, inte en garanti - kontrollera alltid den faktiska produktens etikett. Inte medicinsk rådgivning.' }
	}
];
