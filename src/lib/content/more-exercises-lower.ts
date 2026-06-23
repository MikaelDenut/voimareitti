// Voimareitti - extended LOWER-BODY, CORE and MOBILITY exercise library.
// Extends the seed set in ./data.ts. Names + cues are 4-language (en/fi/hu/sv);
// the longer coaching fields are EN + FI. All non-English strings carry correct
// diacritics - CLAUDE.md Hard Rule 2. No em/en dashes anywhere, plain hyphen only.

import type { Exercise, GoalFit } from './data';

const f = (s: number, h: number, fl: number, g: number): GoalFit => ({
	strength: s, hypertrophy: h, fatLoss: fl, general: g
});

export const moreExercisesLower: Exercise[] = [
	// ===== QUADS =====
	{
		id: 'barbell-back-squat',
		name: { en: 'Barbell back squat', fi: 'Takakyykky tangolla', hu: 'Hátsó guggolás rúddal', sv: 'Knäböj med skivstång' },
		pattern: 'squat', minTier: 5, experienceMin: 'intermediate', primary: ['Quads', 'Glutes'],
		cue: { en: 'Brace, sit between the hips, drive up through mid-foot.', fi: 'Jännitä, kyykkää lonkkien väliin, nouse jalkapohjan keskeltä.', hu: 'Feszíts, ülj a csípők közé, nyomj fel a középtalpon át.', sv: 'Spänn, sätt dig mellan höfterna, tryck upp genom mellanfoten.' },
		purpose: { en: 'The foundational barbell leg builder for strength and size.', fi: 'Perustavanlaatuinen tankokyykky jalkojen voimaan ja kokoon.', hu: 'Az alapvető rúddal végzett lábépítő gyakorlat erőért és tömegért.', sv: 'Den grundläggande skivstångsövningen för benens styrka och storlek.' },
		setup: { en: 'Bar on the upper back, feet shoulder-width, toes slightly out.', fi: 'Tanko yläselälle, jalat hartioiden leveydellä, varpaat hieman ulos.', hu: 'Rúd a felső háton, láb vállszélességben, lábujjak kissé kifelé.', sv: 'Stången på övre ryggen, fötterna i axelbredd, tårna något utåt.' },
		mistakes: { en: 'Knees caving in or the heels lifting off the floor.', fi: 'Polvet painuvat sisään tai kantapäät nousevat lattiasta.', hu: 'A térd befelé dőlése vagy a sarok elemelkedése a talajról.', sv: 'Att knäna faller inåt eller hälarna lyfter från golvet.' },
		easier: { en: 'Squat to a box or use a goblet squat instead.', fi: 'Kyykkää laatikolle tai tee goblet-kyykky sen sijaan.', hu: 'Guggolj dobozra, vagy végezz inkább goblet guggolást.', sv: 'Knäböj till en låda eller gör en gobletböj i stället.' },
		harder: { en: 'Add load or pause at the bottom.', fi: 'Lisää kuormaa tai pidä tauko ala-asennossa.', hu: 'Adj hozzá terhelést, vagy tarts szünetet az alsó ponton.', sv: 'Lägg på vikt eller pausa i botten.' },
		safety: { en: 'Use a rack with safety pins; keep a flat back.', fi: 'Käytä telinettä turvatappien kanssa; pidä selkä suorana.', hu: 'Használj állványt biztonsági rudakkal; tartsd egyenesen a hátad.', sv: 'Använd ett ställ med säkerhetspinnar; håll ryggen rak.' },
		fit: f(3, 3, 2, 2)
	},
	{
		id: 'front-squat',
		name: { en: 'Front squat', fi: 'Etukyykky', hu: 'Első guggolás', sv: 'Frontböj' },
		pattern: 'squat', minTier: 5, experienceMin: 'advanced', primary: ['Quads', 'Glutes'],
		cue: { en: 'Elbows high, stay upright, sit straight down.', fi: 'Kyynärpäät ylhäällä, pysy pystyssä, kyykkää suoraan alas.', hu: 'Magas könyök, maradj egyenes, ülj le egyenesen.', sv: 'Höga armbågar, håll dig upprätt, sätt dig rakt ner.' },
		purpose: { en: 'Quad-focused squat that demands and trains an upright torso.', fi: 'Etureisiä korostava kyykky, joka vaatii ja harjoittaa pystyä vartaloa.', hu: 'Combfeszítőre fókuszáló guggolás, amely egyenes törzset kíván és edz.', sv: 'En framlårsfokuserad knäböj som kräver och tränar en upprätt överkropp.' },
		setup: { en: 'Bar on the front delts, fingers under it, elbows up high.', fi: 'Tanko etuolkapäille, sormet sen alla, kyynärpäät korkealla.', hu: 'Rúd az elülső vállon, ujjak alatta, könyök magasra emelve.', sv: 'Stången på främre axlarna, fingrarna under den, armbågarna högt.' },
		mistakes: { en: 'Elbows dropping so the bar rolls forward off the shoulders.', fi: 'Kyynärpäät putoavat ja tanko vierii eteen olkapäiltä.', hu: 'A könyök leesik, ezért a rúd előregurul a vállról.', sv: 'Att armbågarna sjunker så stången rullar framåt av axlarna.' },
		easier: { en: 'Use a goblet squat to learn the upright position.', fi: 'Käytä goblet-kyykkyä pystyasennon oppimiseen.', hu: 'Goblet guggolással tanuld meg az egyenes testtartást.', sv: 'Använd en gobletböj för att lära dig den upprätta positionen.' },
		harder: { en: 'Add load or add a pause in the bottom.', fi: 'Lisää kuormaa tai lisää tauko ala-asentoon.', hu: 'Adj hozzá terhelést, vagy iktass be szünetet az alsó ponton.', sv: 'Lägg på vikt eller lägg till en paus i botten.' },
		safety: { en: 'Squat in a rack so you can bail the bar forward safely.', fi: 'Kyykkää telineessä, jotta voit pudottaa tangon eteen turvallisesti.', hu: 'Guggolj állványban, hogy a rudat biztonságosan előre dobhasd.', sv: 'Knäböj i ett ställ så du kan släppa stången framåt säkert.' },
		fit: f(3, 3, 2, 2)
	},
	{
		id: 'leg-press',
		name: { en: 'Leg press', fi: 'Jalkaprässi', hu: 'Lábtoló gép', sv: 'Benpress' },
		pattern: 'squat', minTier: 5, experienceMin: 'beginner', primary: ['Quads', 'Glutes'],
		cue: { en: 'Lower under control, press without locking out hard.', fi: 'Laske hallitusti, työnnä lukitsematta polvia rajusti.', hu: 'Ereszkedj kontrolláltan, told ki erős zárás nélkül.', sv: 'Sänk kontrollerat, pressa utan att låsa hårt.' },
		purpose: { en: 'Heavy quad and glute loading with the back fully supported.', fi: 'Raskas etureisi- ja pakarakuormitus selkä täysin tuettuna.', hu: 'Nehéz comb- és farizomterhelés teljesen megtámasztott háttal.', sv: 'Tung belastning på framlår och säte med ryggen helt stödd.' },
		setup: { en: 'Feet shoulder-width on the platform, back flat on the pad.', fi: 'Jalat hartioiden leveydellä levyllä, selkä tasaisesti tukea vasten.', hu: 'Láb vállszélességben a platformon, hát laposan a párnán.', sv: 'Fötterna i axelbredd på plattan, ryggen platt mot dynan.' },
		mistakes: { en: 'Lowering so far the lower back rounds off the seat.', fi: 'Lasket niin syvälle, että alaselkä pyöristyy irti tuesta.', hu: 'Olyan mélyre engeded, hogy a derék elemelkedik az üléstől.', sv: 'Att sänka så djupt att ryggslutet rundas av från sätet.' },
		easier: { en: 'Reduce the range or the load.', fi: 'Pienennä liikerataa tai kuormaa.', hu: 'Csökkentsd a mozgásterjedelmet vagy a terhelést.', sv: 'Minska rörelseomfånget eller belastningen.' },
		harder: { en: 'Add load or use a single-leg press.', fi: 'Lisää kuormaa tai tee yhden jalan prässi.', hu: 'Adj hozzá terhelést, vagy végezd egy lábbal.', sv: 'Lägg på vikt eller kör enbenspress.' },
		fit: f(2, 3, 2, 2)
	},
	{
		id: 'leg-extension',
		name: { en: 'Leg extension', fi: 'Reiden ojennus', hu: 'Lábnyújtás gép', sv: 'Benextension' },
		pattern: 'squat', minTier: 5, experienceMin: 'beginner', primary: ['Quads'],
		cue: { en: 'Straighten the knees smoothly, squeeze, lower slowly.', fi: 'Suorista polvet pehmeästi, purista, laske hitaasti.', hu: 'Nyújtsd ki simán a térdet, szorítsd, ereszd lassan.', sv: 'Sträck knäna mjukt, spänn, sänk långsamt.' },
		purpose: { en: 'Isolated quad work to build the front of the thigh.', fi: 'Eristetty etureisiliike reiden etuosan kasvattamiseen.', hu: 'Izolált combmunka a comb elülső részének építéséhez.', sv: 'Isolerat framlårsarbete för att bygga framsidan av låret.' },
		setup: { en: 'Knee joint at the machine pivot, pad on the lower shins.', fi: 'Polvinivel laitteen akselilla, tyyny alasäärille.', hu: 'A térdízület a gép tengelyénél, párna az alsó lábszáron.', sv: 'Knäleden vid maskinens axel, dynan mot nedre smalbenen.' },
		mistakes: { en: 'Swinging the weight up with momentum instead of muscle.', fi: 'Heilautat painon ylös vauhdilla lihaksen sijaan.', hu: 'A súly lendülettel való felrántása izommunka helyett.', sv: 'Att svinga upp vikten med fart i stället för med muskeln.' },
		easier: { en: 'Lower the weight and shorten the range.', fi: 'Kevennä painoa ja lyhennä liikerataa.', hu: 'Csökkentsd a súlyt, és rövidítsd a mozgásterjedelmet.', sv: 'Sänk vikten och korta rörelseomfånget.' },
		harder: { en: 'Pause at the top or do slow negatives.', fi: 'Pidä tauko ylhäällä tai tee hitaat negatiivit.', hu: 'Tarts szünetet a felső ponton, vagy végezz lassú negatívokat.', sv: 'Pausa i toppen eller kör långsamma negativ.' },
		fit: f(1, 3, 1, 1)
	},
	{
		id: 'hack-squat',
		name: { en: 'Hack squat', fi: 'Hack-kyykky', hu: 'Hack guggolás', sv: 'Hack squat' },
		pattern: 'squat', minTier: 5, experienceMin: 'intermediate', primary: ['Quads', 'Glutes'],
		cue: { en: 'Back flat on the pad, sit deep, drive through the feet.', fi: 'Selkä tukea vasten, kyykkää syvään, työnnä jaloista.', hu: 'Hát a párnán, ülj mélyre, nyomj a lábakon át.', sv: 'Rygg mot dynan, sätt dig djupt, tryck genom fötterna.' },
		purpose: { en: 'Machine squat that overloads the quads with a stable back.', fi: 'Laitekyykky, joka kuormittaa etureisiä selkä tuettuna.', hu: 'Gépi guggolás, amely megtámasztott háttal terheli a combot.', sv: 'En maskinböj som överbelastar framlåret med stödd rygg.' },
		setup: { en: 'Shoulders under the pads, feet mid-platform, back braced.', fi: 'Olkapäät tyynyjen alle, jalat levyn keskelle, keskivartalo jännittyneenä.', hu: 'Váll a párnák alatt, láb a platform közepén, törzs feszesen.', sv: 'Axlarna under dynorna, fötterna mitt på plattan, bålen spänd.' },
		mistakes: { en: 'Letting the knees collapse inward under the load.', fi: 'Annat polvien painua sisään kuorman alla.', hu: 'A térd befelé dőlni hagyása a terhelés alatt.', sv: 'Att låta knäna falla inåt under belastningen.' },
		easier: { en: 'Reduce load or limit the depth.', fi: 'Kevennä kuormaa tai rajoita syvyyttä.', hu: 'Csökkentsd a terhelést, vagy korlátozd a mélységet.', sv: 'Minska belastningen eller begränsa djupet.' },
		harder: { en: 'Add load or pause in the bottom.', fi: 'Lisää kuormaa tai pidä tauko ala-asennossa.', hu: 'Adj hozzá terhelést, vagy tarts szünetet az alsó ponton.', sv: 'Lägg på vikt eller pausa i botten.' },
		fit: f(2, 3, 2, 2)
	},
	{
		id: 'wall-sit',
		name: { en: 'Wall sit', fi: 'Seinäkyykky', hu: 'Fal melletti ülés', sv: 'Väggsittande' },
		pattern: 'squat', minTier: 0, experienceMin: 'beginner', primary: ['Quads', 'Glutes'],
		cue: { en: 'Slide down to a right angle and hold it still.', fi: 'Liu\'u alas suoraan kulmaan ja pidä paikallaan.', hu: 'Csússz le derékszögig és tartsd mozdulatlanul.', sv: 'Glid ner till rät vinkel och håll still.' },
		purpose: { en: 'Builds quad endurance with a simple isometric hold.', fi: 'Kehittää etureisien kestävyyttä yksinkertaisella pidolla.', hu: 'Combállóképességet fejleszt egy egyszerű izometrikus tartással.', sv: 'Bygger framlårets uthållighet med en enkel statisk hållning.' },
		setup: { en: 'Back flat on a wall, feet out, thighs parallel to the floor.', fi: 'Selkä seinää vasten, jalat eteen, reidet lattian suuntaisesti.', hu: 'Hát laposan a falnak, láb előrébb, comb a talajjal párhuzamosan.', sv: 'Ryggen platt mot en vägg, fötterna ut, låren parallella med golvet.' },
		mistakes: { en: 'Sitting too high or sliding the hips back up to rest.', fi: 'Istut liian ylhäällä tai nostat lonkkia lepuuttaaksesi.', hu: 'Túl magasan ülsz, vagy a csípőt feljebb csúsztatod pihenni.', sv: 'Att sitta för högt eller skjuta höften uppåt för att vila.' },
		easier: { en: 'Hold a shallower angle for less time.', fi: 'Pidä loivempaa kulmaa lyhyemmän ajan.', hu: 'Tarts laposabb szöget rövidebb ideig.', sv: 'Håll en grundare vinkel under kortare tid.' },
		harder: { en: 'Hold longer or rest a weight on the thighs.', fi: 'Pidä pidempään tai aseta paino reisien päälle.', hu: 'Tartsd tovább, vagy tegyél súlyt a combodra.', sv: 'Håll längre eller vila en vikt på låren.' },
		fit: f(1, 1, 2, 2)
	},
	{
		id: 'step-up',
		name: { en: 'Step-up', fi: 'Askelkyykky korokkeelle', hu: 'Fellépés', sv: 'Step-up' },
		pattern: 'lunge', minTier: 1, experienceMin: 'beginner', primary: ['Quads', 'Glutes'], unilateral: true,
		cue: { en: 'Drive through the top foot, stand tall, lower softly.', fi: 'Työnnä ylemmästä jalasta, nouse ryhdikkäästi, laske pehmeästi.', hu: 'Nyomj a felső lábon, állj fel egyenesen, ereszd lágyan.', sv: 'Tryck genom övre foten, res dig rakt, sänk mjukt.' },
		purpose: { en: 'Single-leg strength and balance using a box or step.', fi: 'Yhden jalan voimaa ja tasapainoa korokkeen avulla.', hu: 'Egylábas erő és egyensúly dobozzal vagy lépcsővel.', sv: 'Enbensstyrka och balans med hjälp av en låda eller ett steg.' },
		setup: { en: 'Stand facing a knee-high box, one foot fully on it.', fi: 'Seiso polvenkorkuisen korokkeen edessä, toinen jalka kokonaan päällä.', hu: 'Állj egy térdmagasságú doboz elé, az egyik láb teljesen rajta.', sv: 'Stå vänd mot en knähög låda med ena foten helt på den.' },
		mistakes: { en: 'Pushing off the bottom foot instead of the top leg.', fi: 'Ponnistat alemmasta jalasta ylemmän reiden sijaan.', hu: 'Az alsó lábbal rugaszkodsz a felső láb helyett.', sv: 'Att skjuta ifrån med nedre foten i stället för övre benet.' },
		easier: { en: 'Use a lower step or hold a rail for balance.', fi: 'Käytä matalampaa korotusta tai pidä kaiteesta kiinni.', hu: 'Használj alacsonyabb lépcsőt, vagy fogd a korlátot egyensúlyért.', sv: 'Använd ett lägre steg eller håll i ett räcke för balans.' },
		harder: { en: 'Hold dumbbells or use a higher box.', fi: 'Pidä käsipainoja tai käytä korkeampaa korotusta.', hu: 'Tarts súlyzókat, vagy használj magasabb dobozt.', sv: 'Håll hantlar eller använd en högre låda.' },
		fit: f(2, 2, 3, 3)
	},
	{
		id: 'sissy-squat',
		name: { en: 'Sissy squat', fi: 'Sissy-kyykky', hu: 'Sissy guggolás', sv: 'Sissy squat' },
		pattern: 'squat', minTier: 0, experienceMin: 'advanced', primary: ['Quads'],
		cue: { en: 'Lean back, knees forward, stretch the quads under control.', fi: 'Nojaa taakse, polvet eteen, venytä etureisiä hallitusti.', hu: 'Dőlj hátra, térd előre, nyújtsd a combot kontrolláltan.', sv: 'Luta dig bakåt, knäna framåt, sträck framsidan kontrollerat.' },
		purpose: { en: 'Deep quad isolation through knee extension under stretch.', fi: 'Syvä etureisien eristys polven ojennuksella venytyksessä.', hu: 'Mély combizoláció térdnyújtással, nyújtott helyzetben.', sv: 'Djup framlårsisolering genom knästräckning under sträck.' },
		setup: { en: 'Hold a support, rise on the balls of the feet, hips straight.', fi: 'Pidä tuesta, nouse päkiöille, lonkat suorana.', hu: 'Fogj meg egy támaszt, emelkedj a lábujjhegyre, csípő egyenesen.', sv: 'Håll i ett stöd, res dig på framfötterna, höften rak.' },
		mistakes: { en: 'Bending at the hips instead of only at the knees.', fi: 'Taivutat lonkista pelkän polven sijaan.', hu: 'Csípőből hajlítasz, nem pedig csak a térdből.', sv: 'Att böja i höften i stället för bara i knäna.' },
		easier: { en: 'Reduce the lean and hold a support firmly.', fi: 'Vähennä nojausta ja pidä tuesta tukevasti.', hu: 'Csökkentsd a dőlést, és kapaszkodj erősen a támaszba.', sv: 'Minska lutningen och håll i ett stöd ordentligt.' },
		harder: { en: 'Add load or slow the lowering phase.', fi: 'Lisää kuormaa tai hidasta laskuvaihetta.', hu: 'Adj hozzá terhelést, vagy lassítsd le az engedési fázist.', sv: 'Lägg på vikt eller sänk långsammare i nedåtfasen.' },
		safety: { en: 'Hard on the knees; build up slowly and stop if it hurts.', fi: 'Rasittaa polvia; etene hitaasti ja lopeta jos kipua.', hu: 'Megterheli a térdet; haladj lassan, és állj le, ha fáj.', sv: 'Påfrestande för knäna; bygg upp långsamt och sluta om det gör ont.' },
		fit: f(1, 2, 1, 1)
	},

	// ===== HAMSTRINGS / GLUTES (hinge) =====
	{
		id: 'barbell-deadlift',
		name: { en: 'Barbell deadlift', fi: 'Maastaveto tangolla', hu: 'Felhúzás rúddal', sv: 'Marklyft med skivstång' },
		pattern: 'hinge', minTier: 5, experienceMin: 'intermediate', primary: ['Hamstrings', 'Glutes', 'Back'],
		cue: { en: 'Flat back, push the floor away, lock out the hips.', fi: 'Selkä suorana, työnnä lattiaa pois, lukitse lonkat.', hu: 'Egyenes hát, nyomd el a talajt, zárd a csípőt.', sv: 'Rak rygg, tryck bort golvet, lås höften.' },
		purpose: { en: 'The total-body strength lift for the whole posterior chain.', fi: 'Koko kehon voimaliike koko takaketjulle.', hu: 'Az egész testet erősítő emelés a teljes hátsó láncra.', sv: 'Helkroppslyftet för styrka i hela bakre kedjan.' },
		setup: { en: 'Bar over mid-foot, grip outside the knees, hips set back.', fi: 'Tanko jalkapöydän keskellä, ote polvien ulkopuolelta, lonkat taakse.', hu: 'Rúd a lábfej közepe felett, fogás a térden kívül, csípő hátra.', sv: 'Stången över mellanfoten, greppet utanför knäna, höften bakåt.' },
		mistakes: { en: 'Rounding the lower back or jerking the bar off the floor.', fi: 'Pyöristät alaselän tai nykäiset tangon lattiasta.', hu: 'A derék behomorítása vagy a rúd megrántása a talajról.', sv: 'Att runda ryggslutet eller rycka stången från golvet.' },
		easier: { en: 'Pull from blocks or use a lighter trap-bar.', fi: 'Vedä korokkeilta tai käytä kevyempää trap-tankoa.', hu: 'Húzz blokkokról, vagy használj könnyebb trap rudat.', sv: 'Dra från block eller använd en lättare trapstång.' },
		harder: { en: 'Add load or pause just off the floor.', fi: 'Lisää kuormaa tai pidä tauko hieman irti lattiasta.', hu: 'Adj hozzá terhelést, vagy tarts szünetet közvetlenül a talaj felett.', sv: 'Lägg på vikt eller pausa precis ovanför golvet.' },
		safety: { en: 'Brace hard and keep a neutral spine throughout.', fi: 'Jännitä voimakkaasti ja pidä selkäranka neutraalina koko ajan.', hu: 'Feszíts erősen, és tartsd végig semleges helyzetben a gerinced.', sv: 'Spänn ordentligt och håll ryggraden neutral hela tiden.' },
		fit: f(3, 3, 2, 2)
	},
	{
		id: 'sumo-deadlift',
		name: { en: 'Sumo deadlift', fi: 'Sumomaastaveto', hu: 'Szumó felhúzás', sv: 'Sumomarklyft' },
		pattern: 'hinge', minTier: 5, experienceMin: 'intermediate', primary: ['Glutes', 'Hamstrings', 'Adductors'],
		cue: { en: 'Wide stance, open the knees, drive the hips through.', fi: 'Leveä haara-asento, avaa polvet, työnnä lonkat eteen.', hu: 'Széles állás, nyisd a térdet, told át a csípőt.', sv: 'Bred stans, öppna knäna, för höften framåt.' },
		purpose: { en: 'A hip-and-glute heavy deadlift with a more upright back.', fi: 'Lonkka- ja pakaravoittoinen maastaveto pystymmällä selällä.', hu: 'Csípő- és farizom-dominált felhúzás egyenesebb háttal.', sv: 'Ett höft- och sätestungt marklyft med en mer upprätt rygg.' },
		setup: { en: 'Feet wide, toes out, hands inside the knees on the bar.', fi: 'Jalat leveällä, varpaat ulos, kädet polvien sisäpuolelta tankoon.', hu: 'Láb szélesen, lábujjak kifelé, kéz a térden belül a rúdon.', sv: 'Bred fotställning, tårna ut, händerna innanför knäna på stången.' },
		mistakes: { en: 'Hips shooting up first so it becomes a stiff-leg pull.', fi: 'Lonkat nousevat ensin, jolloin veto muuttuu suorin jaloin tehdyksi.', hu: 'A csípő emelkedik elsőként, így nyújtott lábú húzássá válik.', sv: 'Att höften skjuter upp först så det blir ett raka-ben-lyft.' },
		easier: { en: 'Pull from a low block to shorten the range.', fi: 'Vedä matalalta korokkeelta lyhentääksesi liikerataa.', hu: 'Húzz alacsony blokkról a mozgásterjedelem rövidítéséhez.', sv: 'Dra från ett lågt block för att korta rörelseomfånget.' },
		harder: { en: 'Add load or pause below the knees.', fi: 'Lisää kuormaa tai pidä tauko polvien alapuolella.', hu: 'Adj hozzá terhelést, vagy tarts szünetet a térd alatt.', sv: 'Lägg på vikt eller pausa under knäna.' },
		safety: { en: 'Keep the bar against the legs and the back neutral.', fi: 'Pidä tanko jalkoja vasten ja selkä neutraalina.', hu: 'Tartsd a rudat a lábhoz közel, a hátad semleges helyzetben.', sv: 'Håll stången mot benen och ryggen neutral.' },
		fit: f(3, 3, 2, 2)
	},
	{
		id: 'barbell-hip-thrust',
		name: { en: 'Barbell hip thrust', fi: 'Lantionnosto tangolla', hu: 'Csípőemelés rúddal', sv: 'Höftlyft med skivstång' },
		pattern: 'hinge', minTier: 5, experienceMin: 'intermediate', primary: ['Glutes', 'Hamstrings'],
		cue: { en: 'Tuck the chin, squeeze the glutes, full lockout at the top.', fi: 'Leuka rintaan, purista pakarat, täysi ojennus ylhäällä.', hu: 'Húzd be az állad, szorítsd a fart, teljes zárás fent.', sv: 'Haka in, spänn sätet, full låsning i toppen.' },
		purpose: { en: 'The most direct loaded glute builder there is.', fi: 'Suorin kuormitettu pakaroiden kasvatusliike.', hu: 'A legközvetlenebb terhelt farizomépítő gyakorlat.', sv: 'Den mest direkta belastade sätesövningen som finns.' },
		setup: { en: 'Upper back on a bench, bar over the hips on a pad.', fi: 'Yläselkä penkillä, tanko lantion päällä pehmusteella.', hu: 'Felső hát a padon, rúd a csípő felett egy párnán.', sv: 'Övre ryggen mot en bänk, stången över höften på en dyna.' },
		mistakes: { en: 'Overarching the lower back instead of locking the hips.', fi: 'Notkistat alaselkää lonkkien lukitsemisen sijaan.', hu: 'A derék túlhomorítása a csípő rögzítése helyett.', sv: 'Att svanka ryggslutet i stället för att låsa höften.' },
		easier: { en: 'Do a bodyweight hip thrust or a glute bridge.', fi: 'Tee lantionnosto omalla painolla tai pakarasilta.', hu: 'Végezz csípőtolást saját testsúllyal vagy farizomhidat.', sv: 'Gör en höftlyft med kroppsvikt eller en sätesbro.' },
		harder: { en: 'Add load or pause at full lockout.', fi: 'Lisää kuormaa tai pidä tauko täydessä ojennuksessa.', hu: 'Adj hozzá terhelést, vagy tarts szünetet a teljes záráskor.', sv: 'Lägg på vikt eller pausa i full utsträckning.' },
		fit: f(2, 3, 2, 2)
	},
	{
		id: 'lying-leg-curl',
		name: { en: 'Lying leg curl', fi: 'Makuulta tehtävä jalkakoukistus', hu: 'Fekvő lábhajlítás', sv: 'Liggande lårcurl' },
		pattern: 'hinge', minTier: 5, experienceMin: 'beginner', primary: ['Hamstrings'],
		cue: { en: 'Curl the heels to the glutes, lower slowly.', fi: 'Koukista kantapäät pakaroita kohti, laske hitaasti.', hu: 'Hajlítsd a sarkat a far felé, ereszd lassan.', sv: 'Curla hälarna mot sätet, sänk långsamt.' },
		purpose: { en: 'Isolates the hamstrings through knee flexion.', fi: 'Eristää takareidet polven koukistuksella.', hu: 'Izolálja a combhajlítókat a térd behajlításán keresztül.', sv: 'Isolerar baklåret genom knäböj.' },
		setup: { en: 'Lie face down, pad on the lower calves, hips on the bench.', fi: 'Asetu vatsalleen, tyyny alapohkeille, lonkat penkillä.', hu: 'Feküdj hasra, párna az alsó vádlin, csípő a padon.', sv: 'Ligg på magen, dynan mot nedre vaderna, höften på bänken.' },
		mistakes: { en: 'Lifting the hips off the bench to cheat the weight up.', fi: 'Nostat lonkat penkiltä huijataksesi painon ylös.', hu: 'A csípő elemelése a padról, hogy felcsald a súlyt.', sv: 'Att lyfta höften från bänken för att fuska upp vikten.' },
		easier: { en: 'Lower the weight and shorten the range.', fi: 'Kevennä painoa ja lyhennä liikerataa.', hu: 'Csökkentsd a súlyt, és rövidítsd a mozgásterjedelmet.', sv: 'Sänk vikten och korta rörelseomfånget.' },
		harder: { en: 'Slow the negative or do single-leg curls.', fi: 'Hidasta negatiivia tai tee yhden jalan koukistuksia.', hu: 'Lassítsd a negatívot, vagy végezz egylábas hajlítást.', sv: 'Sänk negativen långsammare eller kör enbenscurl.' },
		fit: f(1, 3, 1, 1)
	},
	{
		id: 'good-morning',
		name: { en: 'Good morning', fi: 'Good morning', hu: 'Jó reggelt gyakorlat', sv: 'Good morning' },
		pattern: 'hinge', minTier: 5, experienceMin: 'advanced', primary: ['Hamstrings', 'Glutes', 'Lower back'],
		cue: { en: 'Soft knees, push the hips back, flat back throughout.', fi: 'Pehmeät polvet, työnnä lonkat taakse, selkä suorana koko ajan.', hu: 'Lágy térd, told hátra a csípőt, végig egyenes hát.', sv: 'Mjuka knän, för höften bakåt, rak rygg hela tiden.' },
		purpose: { en: 'Loads the hamstrings and lower back through a strict hinge.', fi: 'Kuormittaa takareisiä ja alaselkää tarkalla saranaliikkeellä.', hu: 'Megterheli a combhajlítókat és a derekat egy szigorú csípőhajlítással.', sv: 'Belastar baklår och ryggslut genom ett strikt höftfall.' },
		setup: { en: 'Light bar on the upper back, feet hip-width.', fi: 'Kevyt tanko yläselälle, jalat lantion leveydellä.', hu: 'Könnyű rúd a felső háton, láb csípőszélességben.', sv: 'Lätt stång på övre ryggen, fötterna i höftbredd.' },
		mistakes: { en: 'Rounding the back or turning it into a squat.', fi: 'Pyöristät selän tai muutat liikkeen kyykyksi.', hu: 'A hát behomorítása vagy a mozdulat guggolássá alakítása.', sv: 'Att runda ryggen eller göra om det till en knäböj.' },
		easier: { en: 'Use bodyweight or a very light bar first.', fi: 'Käytä ensin omaa painoa tai hyvin kevyttä tankoa.', hu: 'Használj előbb saját testsúlyt vagy nagyon könnyű rudat.', sv: 'Använd kroppsvikt eller en mycket lätt stång först.' },
		harder: { en: 'Add load or add a pause at the bottom.', fi: 'Lisää kuormaa tai lisää tauko ala-asentoon.', hu: 'Adj hozzá terhelést, vagy iktass be szünetet az alsó ponton.', sv: 'Lägg på vikt eller lägg till en paus i botten.' },
		safety: { en: 'Start very light; any back rounding means stop.', fi: 'Aloita hyvin kevyesti; selän pyöristyminen tarkoittaa lopetusta.', hu: 'Kezdd nagyon könnyen; ha a hát behajlik, állj le.', sv: 'Börja mycket lätt; minsta rundning av ryggen betyder stopp.' },
		fit: f(2, 2, 1, 1)
	},
	{
		id: 'single-leg-rdl',
		name: { en: 'Single-leg Romanian deadlift', fi: 'Yhden jalan romanialainen maastaveto', hu: 'Egylábas román felhúzás', sv: 'Enbens rumänsk marklyft' },
		pattern: 'hinge', minTier: 2, experienceMin: 'intermediate', primary: ['Hamstrings', 'Glutes'], unilateral: true,
		cue: { en: 'Hinge over one leg, hips level, reach the weight down.', fi: 'Saranoi yhden jalan yli, lantio suorassa, vie paino alas.', hu: 'Csukódj egy lábon, csípő egyenes, vidd le a súlyt.', sv: 'Fäll över ett ben, höften vågrät, för vikten nedåt.' },
		purpose: { en: 'Builds hamstring strength and balance one leg at a time.', fi: 'Kehittää takareiden voimaa ja tasapainoa jalka kerrallaan.', hu: 'Combhajlító-erőt és egyensúlyt fejleszt egy lábon egyszerre.', sv: 'Bygger baklårsstyrka och balans ett ben i taget.' },
		setup: { en: 'Stand on one leg, weight in the opposite hand.', fi: 'Seiso yhdellä jalalla, paino vastakkaisessa kädessä.', hu: 'Állj egy lábon, a súly az ellenkező kézben.', sv: 'Stå på ett ben med vikten i motsatt hand.' },
		mistakes: { en: 'Letting the hips open and the back round at the bottom.', fi: 'Annat lantion kiertyä ja selän pyöristyä alhaalla.', hu: 'A csípő kinyílni és a hát behajolni hagyása az alsó ponton.', sv: 'Att låta höften öppna sig och ryggen runda i botten.' },
		easier: { en: 'Touch the back toe down for support.', fi: 'Kosketa takavarpaalla maata tueksi.', hu: 'Érintsd le a hátsó lábujjadat támaszért.', sv: 'Nudda bakre tån i golvet för stöd.' },
		harder: { en: 'Use a heavier weight or close the eyes.', fi: 'Käytä raskaampaa painoa tai sulje silmät.', hu: 'Használj nehezebb súlyt, vagy csukd be a szemed.', sv: 'Använd en tyngre vikt eller blunda.' },
		fit: f(2, 2, 2, 3)
	},
	{
		id: 'kettlebell-swing',
		name: { en: 'Kettlebell swing', fi: 'Kahvakuulaheilautus', hu: 'Kettlebell lendítés', sv: 'Kettlebell-sving' },
		pattern: 'hinge', minTier: 2, experienceMin: 'intermediate', primary: ['Glutes', 'Hamstrings'],
		cue: { en: 'Snap the hips, let the bell float, brace the core.', fi: 'Räväytä lonkat, anna kuulan kellua, jännitä keskivartalo.', hu: 'Pattintsd a csípőt, hagyd lebegni a súlyt, feszítsd a törzset.', sv: 'Snäpp höften, låt klotet flyta, spänn bålen.' },
		purpose: { en: 'Explosive hip-hinge power and conditioning in one move.', fi: 'Räjähtävää lonkkavoimaa ja kuntoa yhdessä liikkeessä.', hu: 'Robbanékony csípőerő és kondíció egyetlen mozdulatban.', sv: 'Explosiv höftkraft och kondition i en och samma rörelse.' },
		setup: { en: 'Bell on the floor ahead, hinge and grip it with both hands.', fi: 'Kuula edessä lattialla, saranoi ja tartu molemmin käsin.', hu: 'A kettlebell a talajon eléd, hajolj csípőből, és fogd meg két kézzel.', sv: 'Kettlebellen på golvet framför, fall i höften och grip den med båda händerna.' },
		mistakes: { en: 'Squatting and lifting with the arms instead of hinging.', fi: 'Kyykkäät ja nostat käsillä saranoinnin sijaan.', hu: 'Guggolsz és karral emelsz csípőből hajlítás helyett.', sv: 'Att knäböja och lyfta med armarna i stället för att fälla i höften.' },
		easier: { en: 'Use a lighter bell and swing only to chest height.', fi: 'Käytä kevyempää kuulaa ja heilauta vain rinnan korkeudelle.', hu: 'Használj könnyebb kettlebellt, és lendítsd csak mellmagasságig.', sv: 'Använd en lättare kettlebell och swinga bara till brösthöjd.' },
		harder: { en: 'Use a heavier bell or do single-arm swings.', fi: 'Käytä raskaampaa kuulaa tai tee yhden käden heilautuksia.', hu: 'Használj nehezebb kettlebellt, vagy végezz egykezes lendítést.', sv: 'Använd en tyngre kettlebell eller kör enarmssving.' },
		fit: f(2, 2, 3, 3)
	},
	{
		id: 'cable-pull-through',
		name: { en: 'Cable pull-through', fi: 'Taljaveto jalkojen välistä', hu: 'Kábeles húzás láb közt', sv: 'Kabeldrag mellan benen' },
		pattern: 'hinge', minTier: 5, experienceMin: 'beginner', primary: ['Glutes', 'Hamstrings'],
		cue: { en: 'Hinge back, then drive the hips forward to stand tall.', fi: 'Saranoi taakse, työnnä sitten lonkat eteen ryhdikkääseen seisontaan.', hu: 'Csukódj hátra, majd told előre a csípőt egyenes állásba.', sv: 'Fäll bakåt, för sedan höften framåt till rak hållning.' },
		purpose: { en: 'Teaches the hip hinge with constant cable tension on the glutes.', fi: 'Opettaa lonkkasaranan tasaisella taljan vedolla pakaroihin.', hu: 'A csípőhajlítást tanítja, folyamatos tárcsafeszüléssel a farizmon.', sv: 'Lär ut höftfallet med konstant kabelspänning på sätet.' },
		setup: { en: 'Face away from a low pulley, rope between the legs.', fi: 'Seiso selin matalaan taljaan, naru jalkojen välissä.', hu: 'Állj háttal az alsó csigának, a kötél a lábad között.', sv: 'Stå vänd bort från ett lågt block, repet mellan benen.' },
		mistakes: { en: 'Squatting down or pulling with the arms.', fi: 'Kyykkäät alas tai vedät käsillä.', hu: 'Leguggolsz, vagy karral húzol.', sv: 'Att knäböja eller dra med armarna.' },
		easier: { en: 'Use a lighter setting and a shorter hinge.', fi: 'Käytä kevyempää kuormaa ja lyhyempää saranaa.', hu: 'Használj könnyebb terhelést és rövidebb csípőhajlítást.', sv: 'Använd en lättare inställning och ett kortare höftfall.' },
		harder: { en: 'Add load or pause at the lockout.', fi: 'Lisää kuormaa tai pidä tauko ojennuksessa.', hu: 'Adj hozzá terhelést, vagy tarts szünetet a záráskor.', sv: 'Lägg på vikt eller pausa i utsträckningen.' },
		fit: f(1, 2, 2, 2)
	},
	{
		id: 'nordic-curl',
		name: { en: 'Nordic hamstring curl', fi: 'Nordic-takareisikoukistus', hu: 'Nordic combhajlítás', sv: 'Nordic hamstring curl' },
		pattern: 'hinge', minTier: 0, experienceMin: 'advanced', primary: ['Hamstrings'],
		cue: { en: 'Anchor the heels, lower slowly, hips straight all the way.', fi: 'Lukitse kantapäät, laske hitaasti, lonkat suorana loppuun asti.', hu: 'Rögzítsd a sarkat, ereszd lassan, csípő végig egyenes.', sv: 'Förankra hälarna, sänk långsamt, höften rak hela vägen.' },
		purpose: { en: 'A powerful eccentric exercise for hamstring strength and injury resistance.', fi: 'Tehokas eksentrinen liike takareisien voimaan ja vammojen ehkäisyyn.', hu: 'Hatékony excentrikus gyakorlat a combhajlító erejéért és a sérülések megelőzéséért.', sv: 'En kraftfull excentrisk övning för baklårsstyrka och skadeskydd.' },
		setup: { en: 'Kneel with the heels held down by a partner or strap.', fi: 'Asetu polvillesi, kantapäät kumppanin tai hihnan pitäminä.', hu: 'Térdelj le, a sarkad egy társ vagy heveder tartja le.', sv: 'Stå på knäna med hälarna fasthållna av en partner eller rem.' },
		mistakes: { en: 'Bending at the hips instead of keeping the body straight.', fi: 'Taivutat lonkista sen sijaan, että pidät kehon suorana.', hu: 'Csípőből hajlítasz ahelyett, hogy a tested egyenesen tartanád.', sv: 'Att böja i höften i stället för att hålla kroppen rak.' },
		easier: { en: 'Push back up with the hands to assist.', fi: 'Työnnä käsillä takaisin ylös avuksi.', hu: 'Told vissza magad a kezeddel segítségül.', sv: 'Tryck tillbaka upp med händerna för att hjälpa till.' },
		harder: { en: 'Slow the descent or reach lower before pushing back.', fi: 'Hidasta laskua tai laskeudu syvemmälle ennen työntöä.', hu: 'Lassítsd az ereszkedést, vagy ereszkedj mélyebbre, mielőtt visszatolsz.', sv: 'Sänk långsammare eller nå lägre innan du trycker tillbaka.' },
		safety: { en: 'Very intense eccentric; start with hand-assisted reps.', fi: 'Erittäin kova eksentrinen; aloita käsillä avustetuilla toistoilla.', hu: 'Nagyon intenzív excentrikus; kezdd kézzel segített ismétlésekkel.', sv: 'Mycket intensiv excentrik; börja med handassisterade repetitioner.' },
		fit: f(2, 2, 1, 1)
	},

	// ===== ADDUCTORS =====
	{
		id: 'cossack-squat',
		name: { en: 'Cossack squat', fi: 'Kasakkakyykky', hu: 'Kozák guggolás', sv: 'Cossack squat' },
		pattern: 'lunge', minTier: 0, experienceMin: 'intermediate', primary: ['Adductors', 'Quads', 'Glutes'], unilateral: true,
		cue: { en: 'Sit to one side, other leg straight, stay on the heel.', fi: 'Kyykkää sivulle, toinen jalka suorana, paino kantapäällä.', hu: 'Ülj le egy oldalra, másik láb egyenes, maradj a sarkon.', sv: 'Sätt dig åt ena sidan, andra benet rakt, stå på hälen.' },
		purpose: { en: 'A wide, deep squat that loads and mobilises the adductors.', fi: 'Leveä, syvä kyykky, joka kuormittaa ja liikuttaa lähentäjiä.', hu: 'Széles, mély guggolás, amely terheli és átmozgatja a közelítőket.', sv: 'En bred, djup knäböj som belastar och rörlighetstränar adduktorerna.' },
		setup: { en: 'Wide stance, toes slightly out, weight at the chest.', fi: 'Leveä asento, varpaat hieman ulos, paino rinnalla.', hu: 'Széles állás, lábujjak kissé kifelé, súly a mellkasnál.', sv: 'Bred ställning, tårna något utåt, vikten vid bröstet.' },
		mistakes: { en: 'Heel lifting or the knee caving on the bent leg.', fi: 'Kantapää nousee tai polvi painuu sisään koukistetussa jalassa.', hu: 'A sarok elemelkedik, vagy a térd befelé dől a hajlított lábon.', sv: 'Att hälen lyfter eller knät faller inåt på det böjda benet.' },
		easier: { en: 'Hold a support and stay shallower.', fi: 'Pidä tuesta ja kyykkää loivemmin.', hu: 'Fogj meg egy támaszt, és maradj feljebb.', sv: 'Håll i ett stöd och stanna grundare.' },
		harder: { en: 'Hold a dumbbell or sink fully to the bottom.', fi: 'Pidä käsipainoa tai laskeudu kokonaan alas.', hu: 'Tarts súlyzót, vagy ereszkedj egészen az alsó pontig.', sv: 'Håll en hantel eller sjunk hela vägen ner.' },
		fit: f(1, 2, 2, 3)
	},
	{
		id: 'adductor-machine',
		name: { en: 'Adductor machine', fi: 'Lähentäjälaite', hu: 'Combközelítő gép', sv: 'Adduktormaskin' },
		pattern: 'core', minTier: 5, experienceMin: 'beginner', primary: ['Adductors'],
		cue: { en: 'Squeeze the knees together, return slowly.', fi: 'Purista polvet yhteen, palauta hitaasti.', hu: 'Szorítsd össze a térdet, engedd vissza lassan.', sv: 'Pressa ihop knäna, återgå långsamt.' },
		purpose: { en: 'Isolates the inner-thigh adductors under control.', fi: 'Eristää sisäreiden lähentäjät hallitusti.', hu: 'Izolálja a belső combi közelítőket kontrolláltan.', sv: 'Isolerar innerlårets adduktorer under kontroll.' },
		setup: { en: 'Sit with the pads on the inner thighs, knees apart.', fi: 'Istu tyynyt sisäreisillä, polvet erillään.', hu: 'Ülj a párnákkal a belső combodon, térd szétnyitva.', sv: 'Sitt med dynorna mot innerlåren, knäna isär.' },
		mistakes: { en: 'Slamming the pads together with too much weight.', fi: 'Lyöt tyynyt yhteen liian suurella painolla.', hu: 'A párnák összecsapása túl nagy súllyal.', sv: 'Att slamma ihop dynorna med för mycket vikt.' },
		easier: { en: 'Reduce the load and the starting width.', fi: 'Kevennä kuormaa ja kavenna aloitusleveyttä.', hu: 'Csökkentsd a terhelést és a kezdő szélességet.', sv: 'Minska belastningen och startbredden.' },
		harder: { en: 'Add load or pause when fully squeezed.', fi: 'Lisää kuormaa tai pidä tauko täydessä puristuksessa.', hu: 'Adj hozzá terhelést, vagy tarts szünetet a teljes összezáráskor.', sv: 'Lägg på vikt eller pausa när du klämt ihop helt.' },
		fit: f(1, 2, 1, 1)
	},
	{
		id: 'copenhagen-plank',
		name: { en: 'Copenhagen plank', fi: 'Kööpenhaminan lankku', hu: 'Koppenhágai plank', sv: 'Köpenhamnsplanka' },
		pattern: 'core', minTier: 1, experienceMin: 'advanced', primary: ['Adductors', 'Core'], unilateral: true,
		cue: { en: 'Top leg on the bench, lift the hips, hold a straight line.', fi: 'Ylempi jalka penkillä, nosta lonkat, pidä suora linja.', hu: 'Felső láb a padon, emeld a csípőt, tarts egyenes vonalat.', sv: 'Övre benet på bänken, lyft höften, håll en rak linje.' },
		purpose: { en: 'A demanding side hold that strengthens the adductors.', fi: 'Vaativa sivupito, joka vahvistaa lähentäjiä.', hu: 'Megterhelő oldalsó tartás, amely erősíti a közelítőket.', sv: 'En krävande sidohållning som stärker adduktorerna.' },
		setup: { en: 'Side plank with the upper inner ankle or knee on a bench.', fi: 'Kylkilankku ylemmän nilkan tai polven ollessa penkillä.', hu: 'Oldalsó plank a felső belső boka vagy térd egy padon.', sv: 'Sidoplanka med övre innersidans fotled eller knä på en bänk.' },
		mistakes: { en: 'Hips sagging or the body twisting out of line.', fi: 'Lonkat valuvat alas tai vartalo kiertyy pois linjasta.', hu: 'A csípő megereszkedik, vagy a test kicsavarodik a vonalból.', sv: 'Att höften sjunker eller kroppen vrider sig ur linje.' },
		easier: { en: 'Rest the lower knee on the floor for support.', fi: 'Tue alempi polvi lattiaan.', hu: 'Támaszd az alsó térded a talajra.', sv: 'Vila nedre knät mot golvet för stöd.' },
		harder: { en: 'Straighten the top leg fully or hold longer.', fi: 'Suorista ylempi jalka kokonaan tai pidä pidempään.', hu: 'Nyújtsd ki teljesen a felső lábad, vagy tartsd tovább.', sv: 'Sträck det övre benet helt eller håll längre.' },
		fit: f(2, 1, 1, 2)
	},

	// ===== ABDUCTORS =====
	{
		id: 'lateral-band-walk',
		name: { en: 'Lateral band walk', fi: 'Sivuaskelkävely kuminauhalla', hu: 'Oldalsó gumipántos lépés', sv: 'Sidogång med band' },
		pattern: 'core', minTier: 3, experienceMin: 'beginner', primary: ['Abductors', 'Glutes'],
		cue: { en: 'Stay low, step wide, keep tension on the band.', fi: 'Pysy matalalla, astu leveästi, pidä jännitys nauhassa.', hu: 'Maradj alacsonyan, lépj szélesen, tartsd a feszülést.', sv: 'Håll dig låg, kliv brett, håll spänning i bandet.' },
		purpose: { en: 'Activates and strengthens the hip abductors and glutes.', fi: 'Aktivoi ja vahvistaa lonkan loitontajia ja pakaroita.', hu: 'Aktiválja és erősíti a csípő távolítóit és a farizmokat.', sv: 'Aktiverar och stärker höftens abduktorer och sätesmuskler.' },
		setup: { en: 'Band around the knees or ankles, half-squat stance.', fi: 'Nauha polvien tai nilkkojen ympäri, puolikyykkyasento.', hu: 'Gumiszalag a térd vagy boka körül, félguggoló állás.', sv: 'Band runt knäna eller fotlederna, halvböjd ställning.' },
		mistakes: { en: 'Standing up tall and letting the knees cave in.', fi: 'Nouset pystyyn ja annat polvien painua sisään.', hu: 'Felegyenesedsz, és a térded befelé dőlni hagyod.', sv: 'Att resa sig upprätt och låta knäna falla inåt.' },
		easier: { en: 'Use a lighter band or take smaller steps.', fi: 'Käytä kevyempää nauhaa tai ota pienempiä askeleita.', hu: 'Használj könnyebb szalagot, vagy lépj kisebbeket.', sv: 'Använd ett lättare band eller ta mindre steg.' },
		harder: { en: 'Use a stronger band or stay lower throughout.', fi: 'Käytä vahvempaa nauhaa tai pysy matalammalla koko ajan.', hu: 'Használj erősebb szalagot, vagy maradj végig mélyebben.', sv: 'Använd ett starkare band eller stanna lägre hela tiden.' },
		fit: f(1, 1, 2, 3)
	},
	{
		id: 'hip-abduction',
		name: { en: 'Hip abduction machine', fi: 'Loitonnuslaite', hu: 'Combtávolító gép', sv: 'Abduktormaskin' },
		pattern: 'core', minTier: 5, experienceMin: 'beginner', primary: ['Abductors', 'Glutes'],
		cue: { en: 'Press the knees out, squeeze, return under control.', fi: 'Työnnä polvet ulos, purista, palauta hallitusti.', hu: 'Told ki a térdet, szorítsd, engedd vissza kontrolláltan.', sv: 'Pressa ut knäna, spänn, återgå kontrollerat.' },
		purpose: { en: 'Isolated work for the gluteus medius and hip abductors.', fi: 'Eristetty harjoitus keskimmäiselle pakaralihakselle ja loitontajille.', hu: 'Izolált munka a középső farizomnak és a csípő távolítóinak.', sv: 'Isolerat arbete för mellersta sätesmuskeln och höftabduktorerna.' },
		setup: { en: 'Sit with the pads on the outer thighs, knees together.', fi: 'Istu tyynyt ulkoreisillä, polvet yhdessä.', hu: 'Ülj a párnákkal a külső combodon, térd összezárva.', sv: 'Sitt med dynorna mot ytterlåren, knäna ihop.' },
		mistakes: { en: 'Leaning back to throw the weight out with the torso.', fi: 'Nojaat taakse heittääksesi painon ulos vartalolla.', hu: 'Hátradőlsz, hogy a súlyt a törzseddel lökd ki.', sv: 'Att luta sig bakåt för att kasta ut vikten med bålen.' },
		easier: { en: 'Reduce the load and the range.', fi: 'Kevennä kuormaa ja liikerataa.', hu: 'Csökkentsd a terhelést és a mozgásterjedelmet.', sv: 'Minska belastningen och rörelseomfånget.' },
		harder: { en: 'Add load or pause at full abduction.', fi: 'Lisää kuormaa tai pidä tauko täydessä loitonnuksessa.', hu: 'Adj hozzá terhelést, vagy tarts szünetet a teljes távolításkor.', sv: 'Lägg på vikt eller pausa i full abduktion.' },
		fit: f(1, 2, 1, 1)
	},
	{
		id: 'side-lying-leg-raise',
		name: { en: 'Side-lying leg raise', fi: 'Kylkimakuun jalannosto', hu: 'Oldalfekvő lábemelés', sv: 'Sidoliggande benlyft' },
		pattern: 'core', minTier: 0, experienceMin: 'beginner', primary: ['Abductors', 'Glutes'], unilateral: true,
		cue: { en: 'Lift the top leg slowly, lead with the heel.', fi: 'Nosta ylempää jalkaa hitaasti, johda kantapäällä.', hu: 'Emeld lassan a felső lábat, sarokkal vezess.', sv: 'Lyft övre benet långsamt, led med hälen.' },
		purpose: { en: 'Bodyweight activation for the hip abductors and side glutes.', fi: 'Oman painon aktivointi lonkan loitontajille ja sivupakaroille.', hu: 'Saját testsúlyos aktiválás a csípő távolítóinak és az oldalsó farizmoknak.', sv: 'Kroppsviktsaktivering för höftabduktorerna och sidosätet.' },
		setup: { en: 'Lie on your side, body in a straight line, head supported.', fi: 'Asetu kyljellesi, vartalo suorassa linjassa, pää tuettuna.', hu: 'Feküdj oldalra, a tested egyenes vonalban, fej megtámasztva.', sv: 'Ligg på sidan, kroppen i rak linje, huvudet stött.' },
		mistakes: { en: 'Rolling the hips back so the leg swings forward.', fi: 'Kierrät lantion taakse, jolloin jalka heilahtaa eteen.', hu: 'A csípő hátradöntése, amitől a láb előrelendül.', sv: 'Att rulla höften bakåt så benet svingar framåt.' },
		easier: { en: 'Reduce the range and move slowly.', fi: 'Pienennä liikerataa ja liiku hitaasti.', hu: 'Csökkentsd a mozgásterjedelmet, és mozogj lassan.', sv: 'Minska rörelseomfånget och rör dig långsamt.' },
		harder: { en: 'Add an ankle weight or a band around the knees.', fi: 'Lisää nilkkapaino tai nauha polvien ympärille.', hu: 'Tegyél bokasúlyt vagy gumiszalagot a térd köré.', sv: 'Lägg till en fotledsvikt eller ett band runt knäna.' },
		fit: f(1, 1, 1, 2)
	},

	// ===== CALVES =====
	{
		id: 'standing-calf-raise',
		name: { en: 'Standing calf raise', fi: 'Seisten tehtävä pohjennosto', hu: 'Álló vádliemelés', sv: 'Stående tåhävning' },
		pattern: 'calf', minTier: 5, experienceMin: 'beginner', primary: ['Calves'],
		cue: { en: 'Rise onto the toes fully, lower for a deep stretch.', fi: 'Nouse päkiöille kokonaan, laske syvään venytykseen.', hu: 'Emelkedj teljesen lábujjhegyre, ereszd mély nyújtásig.', sv: 'Res dig helt på tå, sänk till en djup stretch.' },
		purpose: { en: 'Builds the gastrocnemius with a full range of motion.', fi: 'Kasvattaa kaksoiskantalihasta täydellä liikeradalla.', hu: 'Az ikerizmot építi teljes mozgásterjedelemmel.', sv: 'Bygger vadmuskeln med fullt rörelseomfång.' },
		setup: { en: 'Balls of the feet on a step, shoulders under the pads.', fi: 'Päkiät askelmalla, olkapäät tyynyjen alla.', hu: 'Lábujjhegy egy lépcsőn, váll a párnák alatt.', sv: 'Framfötterna på ett steg, axlarna under dynorna.' },
		mistakes: { en: 'Bouncing through short, partial reps.', fi: 'Pomppiminen lyhyillä, osittaisilla toistoilla.', hu: 'Pattogás rövid, részleges ismétléseken keresztül.', sv: 'Att studsa genom korta, halva repetitioner.' },
		easier: { en: 'Reduce the load or use bodyweight only.', fi: 'Kevennä kuormaa tai käytä pelkkää omaa painoa.', hu: 'Csökkentsd a terhelést, vagy használj csak saját testsúlyt.', sv: 'Minska belastningen eller använd bara kroppsvikt.' },
		harder: { en: 'Add load or pause at the top and bottom.', fi: 'Lisää kuormaa tai pidä tauko ylä- ja ala-asennossa.', hu: 'Adj hozzá terhelést, vagy tarts szünetet a felső és alsó ponton.', sv: 'Lägg på vikt eller pausa i toppen och botten.' },
		fit: f(1, 3, 1, 2)
	},
	{
		id: 'seated-calf-raise',
		name: { en: 'Seated calf raise', fi: 'Istuen tehtävä pohjennosto', hu: 'Ülő vádliemelés', sv: 'Sittande tåhävning' },
		pattern: 'calf', minTier: 5, experienceMin: 'beginner', primary: ['Calves'],
		cue: { en: 'Drive the knees up onto the toes, lower slowly.', fi: 'Työnnä polvet ylös päkiöille, laske hitaasti.', hu: 'Told fel a térdet lábujjhegyre, ereszd lassan.', sv: 'Tryck upp knäna på tå, sänk långsamt.' },
		purpose: { en: 'Targets the soleus with the knees bent.', fi: 'Kohdistaa kuorman leveään kantalihakseen polvet koukussa.', hu: 'A lábikra mélyizmát célozza behajlított térddel.', sv: 'Tränar den djupa vadmuskeln (soleus) med böjda knän.' },
		setup: { en: 'Sit with the pads on the knees, balls of feet on the step.', fi: 'Istu tyynyt polvilla, päkiät askelmalla.', hu: 'Ülj a párnákkal a térdeden, lábujjhegy a lépcsőn.', sv: 'Sitt med dynorna mot knäna, framfötterna på steget.' },
		mistakes: { en: 'Using a tiny range and never fully stretching.', fi: 'Käytät pientä liikerataa etkä koskaan venytä täysin.', hu: 'Apró mozgásterjedelmet használsz, és sosem nyújtasz ki teljesen.', sv: 'Att använda ett pyttelitet rörelseomfång och aldrig sträcka fullt.' },
		easier: { en: 'Lower the load and slow the tempo.', fi: 'Kevennä kuormaa ja hidasta tahtia.', hu: 'Csökkentsd a terhelést, és lassíts a tempón.', sv: 'Sänk belastningen och sakta ner tempot.' },
		harder: { en: 'Add load or pause in the stretched position.', fi: 'Lisää kuormaa tai pidä tauko venytetyssä asennossa.', hu: 'Adj hozzá terhelést, vagy tarts szünetet a nyújtott helyzetben.', sv: 'Lägg på vikt eller pausa i det sträckta läget.' },
		fit: f(1, 3, 1, 1)
	},
	{
		id: 'donkey-calf-raise',
		name: { en: 'Donkey calf raise', fi: 'Aasipohjenosto', hu: 'Szamár vádliemelés', sv: 'Donkey calf raise' },
		pattern: 'calf', minTier: 1, experienceMin: 'intermediate', primary: ['Calves'],
		cue: { en: 'Hinge at the hips, push up tall onto the toes.', fi: 'Saranoi lonkista, nouse korkealle päkiöille.', hu: 'Csukódj a csípőből, nyomj fel magasra lábujjhegyre.', sv: 'Fäll i höften, tryck upp högt på tå.' },
		purpose: { en: 'Loads the calves in a bent-over position for a strong stretch.', fi: 'Kuormittaa pohkeita etukumarassa asennossa voimakkaaseen venytykseen.', hu: 'Előrehajolt helyzetben terheli a vádlit erős nyújtásért.', sv: 'Belastar vaderna i en framåtlutad position för en kraftig sträckning.' },
		setup: { en: 'Bend forward onto a support, balls of feet on a step.', fi: 'Nojaa eteen tukea vasten, päkiät askelmalla.', hu: 'Hajolj előre egy támaszra, lábujjhegy egy lépcsőn.', sv: 'Luta dig framåt mot ett stöd, framfötterna på ett steg.' },
		mistakes: { en: 'Bending the knees or using a half range.', fi: 'Koukistat polvia tai käytät puolikasta liikerataa.', hu: 'A térd behajlítása vagy fél mozgásterjedelem használata.', sv: 'Att böja knäna eller använda ett halvt rörelseomfång.' },
		easier: { en: 'Use bodyweight before adding any load.', fi: 'Käytä omaa painoa ennen kuorman lisäämistä.', hu: 'Használj saját testsúlyt, mielőtt terhelést adsz hozzá.', sv: 'Använd kroppsvikt innan du lägger på någon belastning.' },
		harder: { en: 'Have a partner sit on the hips or add a belt.', fi: 'Anna kumppanin istua lonkilla tai lisää vyökuorma.', hu: 'Ültess egy társat a csípődre, vagy adj hozzá övsúlyt.', sv: 'Låt en partner sitta på höften eller lägg till ett bältesstöd.' },
		fit: f(1, 3, 1, 1)
	},

	// ===== ABS / OBLIQUES / CORE =====
	{
		id: 'crunch',
		name: { en: 'Crunch', fi: 'Vatsarutistus', hu: 'Hasprés', sv: 'Crunch' },
		pattern: 'core', minTier: 0, experienceMin: 'beginner', primary: ['Abs'],
		cue: { en: 'Curl the ribs toward the hips, exhale, lower slowly.', fi: 'Rullaa kylkiluut lantiota kohti, hengitä ulos, laske hitaasti.', hu: 'Görbítsd a bordát a csípő felé, fújj ki, ereszd lassan.', sv: 'Curla revbenen mot höften, andas ut, sänk långsamt.' },
		purpose: { en: 'A simple movement to train the upper abs.', fi: 'Yksinkertainen liike ylävatsalihasten harjoittamiseen.', hu: 'Egyszerű mozdulat a felső hasizom edzésére.', sv: 'En enkel rörelse för att träna övre magen.' },
		setup: { en: 'Lie on your back, knees bent, hands by the ears.', fi: 'Asetu selällesi, polvet koukussa, kädet korvien vieressä.', hu: 'Feküdj a hátadra, térd behajlítva, kéz a fül mellett.', sv: 'Ligg på rygg, knäna böjda, händerna vid öronen.' },
		mistakes: { en: 'Pulling on the neck instead of lifting with the abs.', fi: 'Vedät niskasta sen sijaan, että nostat vatsalihaksilla.', hu: 'A nyak húzása a hasizommal való emelés helyett.', sv: 'Att dra i nacken i stället för att lyfta med magen.' },
		easier: { en: 'Reduce the range and cross the arms on the chest.', fi: 'Pienennä liikerataa ja vie kädet ristiin rinnalle.', hu: 'Csökkentsd a mozgásterjedelmet, és tedd keresztbe a karod a mellkason.', sv: 'Minska rörelseomfånget och korsa armarna över bröstet.' },
		harder: { en: 'Hold a weight or slow the tempo.', fi: 'Pidä painoa tai hidasta tahtia.', hu: 'Tarts súlyt, vagy lassíts a tempón.', sv: 'Håll en vikt eller sakta ner tempot.' },
		fit: f(1, 2, 1, 2)
	},
	{
		id: 'hanging-leg-raise',
		name: { en: 'Hanging leg raise', fi: 'Riipunnan jalannosto', hu: 'Függő lábemelés', sv: 'Hängande benlyft' },
		pattern: 'core', minTier: 5, experienceMin: 'advanced', primary: ['Abs', 'Core'],
		cue: { en: 'Curl the pelvis up, lift the legs without swinging.', fi: 'Rullaa lantio ylös, nosta jalat heilumatta.', hu: 'Görbítsd fel a medencét, emeld a lábat lengés nélkül.', sv: 'Curla bäckenet upp, lyft benen utan att svinga.' },
		purpose: { en: 'A strong lower-ab exercise from a dead hang.', fi: 'Tehokas alavatsaliike täydestä riipunnasta.', hu: 'Hatékony alsó hasizomgyakorlat teljes függésből.', sv: 'En kraftfull nedre-mage-övning från fullt häng.' },
		setup: { en: 'Hang from a bar, shoulders active, legs together.', fi: 'Riipu tangosta, hartiat aktiivisina, jalat yhdessä.', hu: 'Függj egy rúdról, váll aktívan, láb összezárva.', sv: 'Häng från en stång, axlarna aktiva, benen ihop.' },
		mistakes: { en: 'Swinging the legs up with momentum.', fi: 'Heilautat jalat ylös vauhdilla.', hu: 'A láb lendülettel való felemelése.', sv: 'Att svinga upp benen med fart.' },
		easier: { en: 'Raise bent knees only.', fi: 'Nosta vain koukistetut polvet.', hu: 'Csak behajlított térdet emelj.', sv: 'Lyft bara böjda knän.' },
		harder: { en: 'Raise straight legs to the bar.', fi: 'Nosta suorat jalat tankoon asti.', hu: 'Emeld a nyújtott lábad a rúdig.', sv: 'Lyft raka ben upp till stången.' },
		fit: f(2, 2, 1, 2)
	},
	{
		id: 'lying-leg-raise',
		name: { en: 'Lying leg raise', fi: 'Selinmakuun jalannosto', hu: 'Fekvő lábemelés', sv: 'Liggande benlyft' },
		pattern: 'core', minTier: 0, experienceMin: 'beginner', primary: ['Abs', 'Core'],
		cue: { en: 'Lower the legs slowly, keep the lower back down.', fi: 'Laske jalat hitaasti, pidä alaselkä alhaalla.', hu: 'Ereszd lassan a lábat, tartsd a derekat a talajon.', sv: 'Sänk benen långsamt, håll ländryggen nere.' },
		purpose: { en: 'Trains the lower abs lying on the floor.', fi: 'Harjoittaa alavatsaa lattialla maaten.', hu: 'A talajon fekve edzi az alsó hasizmot.', sv: 'Tränar nedre magen liggande på golvet.' },
		setup: { en: 'Lie on your back, hands under the hips, legs straight.', fi: 'Asetu selällesi, kädet lonkkien alle, jalat suorina.', hu: 'Feküdj a hátadra, kéz a csípő alatt, láb nyújtva.', sv: 'Ligg på rygg, händerna under höften, benen raka.' },
		mistakes: { en: 'Letting the lower back arch off the floor.', fi: 'Annat alaselän nousta kaarelle lattiasta.', hu: 'A derék elemelkedni hagyása a talajról.', sv: 'Att låta ryggslutet svanka upp från golvet.' },
		easier: { en: 'Bend the knees or lower one leg at a time.', fi: 'Koukista polvet tai laske yksi jalka kerrallaan.', hu: 'Hajlítsd be a térded, vagy engedd le egyszerre egy lábad.', sv: 'Böj knäna eller sänk ett ben i taget.' },
		harder: { en: 'Add an ankle weight or slow the lowering.', fi: 'Lisää nilkkapaino tai hidasta laskua.', hu: 'Tegyél fel bokasúlyt, vagy lassítsd le az engedést.', sv: 'Lägg till en fotledsvikt eller sänk långsammare.' },
		fit: f(1, 2, 1, 2)
	},
	{
		id: 'cable-crunch',
		name: { en: 'Cable crunch', fi: 'Taljavatsarutistus', hu: 'Kábeles hasprés', sv: 'Kabelcrunch' },
		pattern: 'core', minTier: 5, experienceMin: 'intermediate', primary: ['Abs'],
		cue: { en: 'Crunch the ribs down, hips still, contract the abs.', fi: 'Rullaa kylkiluut alas, lonkat paikallaan, supista vatsa.', hu: 'Húzd le a bordát, csípő mozdulatlan, feszítsd a hasat.', sv: 'Curla revbenen ner, höften still, spänn magen.' },
		purpose: { en: 'Loaded ab flexion for progressive overload on the abs.', fi: 'Kuormitettu vatsan koukistus vatsalihasten progressioon.', hu: 'Terhelt hasizomhajlítás a hasizom progresszív túlterheléséért.', sv: 'Belastad magböj för progressiv överbelastning av magen.' },
		setup: { en: 'Kneel below a high pulley, rope held by the head.', fi: 'Polvistu korkean taljan alle, naru pään vieressä.', hu: 'Térdelj egy felső csiga alá, a kötelet a fejed mellett tartva.', sv: 'Stå på knä under ett högt block, repet hållet vid huvudet.' },
		mistakes: { en: 'Pulling with the arms or rocking from the hips.', fi: 'Vedät käsillä tai keinutat lonkista.', hu: 'Karral húzol, vagy csípőből ringatsz.', sv: 'Att dra med armarna eller gunga från höften.' },
		easier: { en: 'Reduce the load and shorten the range.', fi: 'Kevennä kuormaa ja lyhennä liikerataa.', hu: 'Csökkentsd a terhelést, és rövidítsd a mozgásterjedelmet.', sv: 'Minska belastningen och korta rörelseomfånget.' },
		harder: { en: 'Add load or pause at the bottom of the crunch.', fi: 'Lisää kuormaa tai pidä tauko rutistuksen alaosassa.', hu: 'Adj hozzá terhelést, vagy tarts szünetet a hajlítás alján.', sv: 'Lägg på vikt eller pausa i botten av crunchen.' },
		fit: f(1, 3, 1, 1)
	},
	{
		id: 'russian-twist',
		name: { en: 'Russian twist', fi: 'Venäläinen kierto', hu: 'Orosz csavarás', sv: 'Russian twist' },
		pattern: 'core', minTier: 0, experienceMin: 'beginner', primary: ['Obliques', 'Core'],
		cue: { en: 'Rotate from the ribs, touch each side, stay tall.', fi: 'Kierrä kylkiluista, kosketa molemmin puolin, pysy ryhdikkäänä.', hu: 'Forgass a bordából, érintsd mindkét oldalt, maradj egyenes.', sv: 'Rotera från revbenen, nudda varje sida, sitt rakt.' },
		purpose: { en: 'A rotational drill for the obliques and trunk control.', fi: 'Kiertoliike vinoille vatsalihaksille ja vartalon hallintaan.', hu: 'Forgató gyakorlat a ferde hasizmoknak és a törzs kontrolljáért.', sv: 'En roterande övning för sneda magmuskler och bålkontroll.' },
		setup: { en: 'Sit leaning back, knees bent, feet light or lifted.', fi: 'Istu nojaten taakse, polvet koukussa, jalat kevyinä tai irti.', hu: 'Ülj hátradőlve, térd behajlítva, láb könnyedén vagy felemelve.', sv: 'Sitt lutad bakåt, knäna böjda, fötterna lätta eller lyfta.' },
		mistakes: { en: 'Just moving the arms while the torso stays still.', fi: 'Liikutat vain käsiä vartalon pysyessä paikallaan.', hu: 'Csak a karod mozgatod, miközben a törzs nyugton marad.', sv: 'Att bara röra armarna medan bålen står stilla.' },
		easier: { en: 'Keep the feet on the floor and move slowly.', fi: 'Pidä jalat lattialla ja liiku hitaasti.', hu: 'Tartsd a lábad a talajon, és mozogj lassan.', sv: 'Håll fötterna i golvet och rör dig långsamt.' },
		harder: { en: 'Hold a weight or lift the feet off the floor.', fi: 'Pidä painoa tai nosta jalat irti lattiasta.', hu: 'Tarts súlyt, vagy emeld el a lábad a talajról.', sv: 'Håll en vikt eller lyft fötterna från golvet.' },
		fit: f(1, 1, 2, 2)
	},
	{
		id: 'side-plank',
		name: { en: 'Side plank', fi: 'Kylkilankku', hu: 'Oldalplank', sv: 'Sidoplanka' },
		pattern: 'core', minTier: 0, experienceMin: 'beginner', primary: ['Obliques', 'Core'], unilateral: true,
		cue: { en: 'Stack the body, lift the hips, hold a straight line.', fi: 'Pinoa vartalo, nosta lonkat, pidä suora linja.', hu: 'Rendezd egyenesbe a testet, emeld a csípőt, tarts egyenes vonalat.', sv: 'Stapla kroppen, lyft höften, håll en rak linje.' },
		purpose: { en: 'Builds lateral core stability and oblique endurance.', fi: 'Kehittää sivuttaista keskivartalon tukea ja vinojen kestävyyttä.', hu: 'Oldalsó törzsstabilitást és ferdehasizom-állóképességet fejleszt.', sv: 'Bygger lateral bålstabilitet och uthållighet i sneda magmuskler.' },
		setup: { en: 'On one forearm, feet stacked, body in a straight line.', fi: 'Toisen kyynärvarren varassa, jalat päällekkäin, vartalo suorassa.', hu: 'Egy alkaron, láb egymáson, test egyenes vonalban.', sv: 'På en underarm, fötterna staplade, kroppen i rak linje.' },
		mistakes: { en: 'Hips sagging toward the floor.', fi: 'Lonkat valuvat kohti lattiaa.', hu: 'A csípő megereszkedik a talaj felé.', sv: 'Att höften sjunker mot golvet.' },
		easier: { en: 'Drop the lower knee to the floor.', fi: 'Laske alempi polvi lattiaan.', hu: 'Engedd le az alsó térded a talajra.', sv: 'Släpp ner nedre knät mot golvet.' },
		harder: { en: 'Lift the top leg or hold longer.', fi: 'Nosta ylempi jalka tai pidä pidempään.', hu: 'Emeld fel a felső lábad, vagy tartsd tovább.', sv: 'Lyft det övre benet eller håll längre.' },
		fit: f(1, 1, 1, 3)
	},
	{
		id: 'dead-bug',
		name: { en: 'Dead bug', fi: 'Dead bug', hu: 'Halott bogár', sv: 'Dead bug' },
		pattern: 'core', minTier: 0, experienceMin: 'beginner', primary: ['Core', 'Abs'],
		cue: { en: 'Lower opposite arm and leg, keep the back pinned down.', fi: 'Laske vastakkainen käsi ja jalka, pidä selkä painettuna alas.', hu: 'Engedd le az ellentétes kart és lábat, tartsd a hátad lent.', sv: 'Sänk motsatt arm och ben, håll ryggen nedtryckt.' },
		purpose: { en: 'Teaches core bracing while the limbs move.', fi: 'Opettaa keskivartalon jännityksen raajojen liikkuessa.', hu: 'A törzs feszítését tanítja, miközben a végtagok mozognak.', sv: 'Lär ut bålspänning medan armar och ben rör sig.' },
		setup: { en: 'Lie on your back, arms up, knees bent over the hips.', fi: 'Asetu selällesi, kädet ylös, polvet koukussa lonkkien yllä.', hu: 'Feküdj a hátadra, kar felfelé, térd behajlítva a csípő felett.', sv: 'Ligg på rygg, armarna upp, knäna böjda över höften.' },
		mistakes: { en: 'Letting the lower back arch up off the floor.', fi: 'Annat alaselän nousta kaarelle lattiasta.', hu: 'A derék elemelkedni hagyása a talajról.', sv: 'Att låta ryggslutet svanka upp från golvet.' },
		easier: { en: 'Move only the legs, keep the arms still.', fi: 'Liikuta vain jalkoja, pidä kädet paikallaan.', hu: 'Csak a lábad mozgasd, a kart tartsd nyugton.', sv: 'Rör bara benen, håll armarna stilla.' },
		harder: { en: 'Slow the movement or hold light weights.', fi: 'Hidasta liikettä tai pidä kevyitä painoja.', hu: 'Lassítsd a mozdulatot, vagy tarts könnyű súlyokat.', sv: 'Sakta ner rörelsen eller håll lätta vikter.' },
		fit: f(1, 1, 1, 3)
	},
	{
		id: 'mountain-climber',
		name: { en: 'Mountain climber', fi: 'Vuorikiipeilijä', hu: 'Hegymászó', sv: 'Bergsklättrare' },
		pattern: 'core', minTier: 0, experienceMin: 'beginner', primary: ['Core', 'Abs'],
		cue: { en: 'Drive the knees in fast, keep the hips low and still.', fi: 'Vedä polvia nopeasti, pidä lonkat matalalla ja vakaina.', hu: 'Húzd be gyorsan a térdet, tartsd a csípőt alacsonyan.', sv: 'Dra in knäna snabbt, håll höften låg och stilla.' },
		purpose: { en: 'A dynamic core and conditioning move from a plank.', fi: 'Dynaaminen keskivartalo- ja kuntoliike lankusta.', hu: 'Dinamikus törzs- és kondíciógyakorlat plankból.', sv: 'En dynamisk bål- och konditionsrörelse från en planka.' },
		setup: { en: 'Start in a high plank, hands under the shoulders.', fi: 'Aloita korkeasta lankusta, kädet hartioiden alla.', hu: 'Indulj magas plankból, kéz a váll alatt.', sv: 'Börja i en hög planka, händerna under axlarna.' },
		mistakes: { en: 'Bouncing the hips up high with each rep.', fi: 'Pomppautat lonkat ylös jokaisella toistolla.', hu: 'A csípő magasra pattintása minden ismétlésnél.', sv: 'Att studsa upp höften högt vid varje repetition.' },
		easier: { en: 'Step the knees in slowly one at a time.', fi: 'Astu polvet sisään hitaasti yksi kerrallaan.', hu: 'Lépj be a térdeddel lassan, egyenként.', sv: 'Stega in knäna långsamt, ett i taget.' },
		harder: { en: 'Speed up or bring the knees across the body.', fi: 'Nopeuta tai vie polvet vartalon yli.', hu: 'Gyorsíts, vagy húzd a térded a test előtt keresztbe.', sv: 'Öka tempot eller för knäna tvärs över kroppen.' },
		fit: f(1, 1, 3, 3)
	},
	{
		id: 'hollow-hold',
		name: { en: 'Hollow hold', fi: 'Hollow hold', hu: 'Hollow tartás', sv: 'Hollow hold' },
		pattern: 'core', minTier: 0, experienceMin: 'intermediate', primary: ['Abs', 'Core'],
		cue: { en: 'Press the back flat, lift the shoulders and legs, hold.', fi: 'Paina selkä litteäksi, nosta hartiat ja jalat, pidä.', hu: 'Nyomd laposra a hátad, emeld a vállat és lábat, tarts.', sv: 'Tryck ryggen platt, lyft axlar och ben, håll.' },
		purpose: { en: 'A whole-front-of-body brace common in gymnastics.', fi: 'Koko etupuolen jännitysasento, tuttu voimistelusta.', hu: 'Az egész test elülső felének feszítése, a tornából ismert.', sv: 'En helkroppsspänning på framsidan, vanlig inom gymnastiken.' },
		setup: { en: 'Lie on your back, arms overhead, legs straight.', fi: 'Asetu selällesi, kädet pään yli, jalat suorina.', hu: 'Feküdj a hátadra, kar a fej fölött, láb nyújtva.', sv: 'Ligg på rygg, armarna över huvudet, benen raka.' },
		mistakes: { en: 'Letting the lower back lift off the floor.', fi: 'Annat alaselän nousta irti lattiasta.', hu: 'A derék elemelkedni hagyása a talajról.', sv: 'Att låta ryggslutet lyfta från golvet.' },
		easier: { en: 'Bend the knees or tuck the arms to the sides.', fi: 'Koukista polvet tai vie kädet kyljille.', hu: 'Hajlítsd be a térded, vagy húzd a karod a test mellé.', sv: 'Böj knäna eller dra in armarna mot sidorna.' },
		harder: { en: 'Straighten the limbs fully and add small rocks.', fi: 'Suorista raajat täysin ja lisää pieni keinunta.', hu: 'Nyújtsd ki teljesen a végtagjaid, és adj hozzá kis ringatást.', sv: 'Sträck armar och ben helt och lägg till små gungningar.' },
		fit: f(1, 1, 1, 3)
	},
	{
		id: 'ab-wheel',
		name: { en: 'Ab wheel rollout', fi: 'Vatsarullaus', hu: 'Haskerék kigördítés', sv: 'Magrulle' },
		pattern: 'core', minTier: 2, experienceMin: 'advanced', primary: ['Abs', 'Core'],
		cue: { en: 'Roll out slowly, brace hard, do not let the back sag.', fi: 'Rullaa hitaasti ulos, jännitä lujasti, älä päästä selkää notkolle.', hu: 'Gördülj ki lassan, feszíts erősen, ne ess be a hátad.', sv: 'Rulla ut långsamt, spänn hårt, låt inte ryggen svikta.' },
		purpose: { en: 'A demanding anti-extension exercise for the whole core.', fi: 'Vaativa ojennusta vastustava liike koko keskivartalolle.', hu: 'Megterhelő, nyújtást gátló gyakorlat az egész törzsnek.', sv: 'En krävande anti-extensionsövning för hela bålen.' },
		setup: { en: 'Kneel holding the wheel, arms under the shoulders.', fi: 'Polvistu pidellen rullaa, kädet hartioiden alla.', hu: 'Térdelj a kereket fogva, kéz a váll alatt.', sv: 'Stå på knä och håll i hjulet, armarna under axlarna.' },
		mistakes: { en: 'Rolling out so far the lower back caves down.', fi: 'Rullaat niin pitkälle, että alaselkä painuu alas.', hu: 'Olyan messzire gurulsz ki, hogy a derék lefelé süllyed.', sv: 'Att rulla ut så långt att ryggslutet sjunker ner.' },
		easier: { en: 'Roll out only a short distance toward a wall.', fi: 'Rullaa vain lyhyt matka kohti seinää.', hu: 'Gurulj ki csak rövid távra egy fal felé.', sv: 'Rulla ut bara en kort bit mot en vägg.' },
		harder: { en: 'Roll out further or perform it from the feet.', fi: 'Rullaa pidemmälle tai tee se varpailta.', hu: 'Gurulj messzebbre, vagy végezd lábról.', sv: 'Rulla ut längre eller utför den från fötterna.' },
		safety: { en: 'Hard on the lower back; keep it braced, never let it sag.', fi: 'Rasittaa alaselkää; pidä se jännitettynä, älä päästä notkolle.', hu: 'Megterheli a derekat; tartsd feszesen, sose hagyd megereszkedni.', sv: 'Påfrestande för ryggslutet; håll det spänt, låt det aldrig sjunka.' },
		fit: f(2, 2, 1, 2)
	},
	{
		id: 'pallof-press',
		name: { en: 'Pallof press', fi: 'Pallof-työntö', hu: 'Pallof nyomás', sv: 'Pallof-press' },
		pattern: 'core', minTier: 3, experienceMin: 'beginner', primary: ['Core', 'Obliques'],
		cue: { en: 'Press straight out and resist the pull to rotate.', fi: 'Työnnä suoraan eteen ja vastusta kiertoon vetävää voimaa.', hu: 'Told ki egyenesen, és állj ellen a forgatásnak.', sv: 'Pressa rakt ut och motstå dragningen att rotera.' },
		purpose: { en: 'An anti-rotation drill that builds core stability.', fi: 'Kiertoa vastustava liike, joka rakentaa keskivartalon tukea.', hu: 'Forgást gátló gyakorlat, amely törzsstabilitást épít.', sv: 'En anti-rotationsövning som bygger bålstabilitet.' },
		setup: { en: 'Stand side-on to a band or cable, hands at the chest.', fi: 'Seiso kyljittäin nauhaan tai taljaan, kädet rinnalla.', hu: 'Állj oldalra egy szalaghoz vagy csigához, kéz a mellkasnál.', sv: 'Stå med sidan mot ett band eller en kabel, händerna vid bröstet.' },
		mistakes: { en: 'Letting the torso twist toward the anchor.', fi: 'Annat vartalon kiertyä kohti kiinnityspistettä.', hu: 'A törzs kifordulni hagyása a rögzítési pont felé.', sv: 'Att låta bålen vrida sig mot fästet.' },
		easier: { en: 'Stand closer to the anchor for less tension.', fi: 'Seiso lähempänä kiinnitystä pienemmällä jännityksellä.', hu: 'Állj közelebb a rögzítéshez a kisebb feszülésért.', sv: 'Stå närmare fästet för mindre spänning.' },
		harder: { en: 'Use a stronger band or step further away.', fi: 'Käytä vahvempaa nauhaa tai astu kauemmas.', hu: 'Használj erősebb szalagot, vagy lépj távolabb.', sv: 'Använd ett starkare band eller stega längre bort.' },
		fit: f(1, 1, 1, 3)
	},
	{
		id: 'farmer-carry',
		name: { en: 'Farmer carry', fi: 'Farmarikävely', hu: 'Farmer séta', sv: 'Farmer\'s walk' },
		pattern: 'core', minTier: 2, experienceMin: 'beginner', primary: ['Core', 'Back'],
		cue: { en: 'Stand tall, brace, walk with steady controlled steps.', fi: 'Seiso ryhdikkäästi, jännitä, kävele tasaisin hallituin askelin.', hu: 'Állj egyenesen, feszíts, sétálj egyenletes léptekkel.', sv: 'Stå rak, spänn, gå med stadiga kontrollerade steg.' },
		purpose: { en: 'Loaded carry for grip, core and total-body strength.', fi: 'Kuormitettu kanto otteen, keskivartalon ja koko kehon voimaan.', hu: 'Terhelt cipelés a fogásért, a törzsért és az egész test erejéért.', sv: 'Belastad bärning för grepp, bål och helkroppsstyrka.' },
		setup: { en: 'A heavy weight in each hand, shoulders back and down.', fi: 'Raskas paino kummassakin kädessä, hartiat taakse ja alas.', hu: 'Nehéz súly egy-egy kézben, váll hátra és le.', sv: 'En tung vikt i varje hand, axlarna bakåt och nedåt.' },
		mistakes: { en: 'Leaning to one side or letting the shoulders slump.', fi: 'Nojaat toiselle puolelle tai annat hartioiden lysähtää.', hu: 'Egyik oldalra dőlsz, vagy a vállad lesüllyedni hagyod.', sv: 'Att luta åt ena hållet eller låta axlarna sjunka ihop.' },
		easier: { en: 'Use lighter weights over a shorter distance.', fi: 'Käytä kevyempiä painoja lyhyemmällä matkalla.', hu: 'Használj könnyebb súlyokat rövidebb távon.', sv: 'Använd lättare vikter över en kortare sträcka.' },
		harder: { en: 'Add load or carry for a longer distance.', fi: 'Lisää kuormaa tai kanna pidemmän matkan.', hu: 'Adj hozzá terhelést, vagy cipelj hosszabb távon.', sv: 'Lägg på vikt eller bär en längre sträcka.' },
		fit: f(2, 1, 3, 3)
	},
	{
		id: 'suitcase-carry',
		name: { en: 'Suitcase carry', fi: 'Matkalaukkukanto', hu: 'Bőrönd séta', sv: 'Suitcase carry' },
		pattern: 'core', minTier: 2, experienceMin: 'beginner', primary: ['Obliques', 'Core'], unilateral: true,
		cue: { en: 'Carry on one side, stay upright, do not lean over.', fi: 'Kanna yhdellä kädellä, pysy pystyssä, älä nojaa sivulle.', hu: 'Vidd egy oldalon, maradj egyenes, ne dőlj oldalra.', sv: 'Bär på ena sidan, håll dig upprätt, luta dig inte.' },
		purpose: { en: 'An offset carry that hammers the obliques and grip.', fi: 'Epäsymmetrinen kanto, joka kuormittaa vinoja ja otetta.', hu: 'Egyoldali cipelés, amely megterheli a ferdéket és a fogást.', sv: 'En ensidig bärning som hamrar på sneda magmuskler och greppet.' },
		setup: { en: 'One heavy weight in one hand, the other hand free.', fi: 'Yksi raskas paino yhdessä kädessä, toinen käsi vapaana.', hu: 'Egy nehéz súly az egyik kézben, a másik kéz szabadon.', sv: 'En tung vikt i ena handen, den andra handen fri.' },
		mistakes: { en: 'Leaning toward the weight instead of staying tall.', fi: 'Nojaat painoa kohti ryhdikkäänä pysymisen sijaan.', hu: 'A súly felé dőlsz egyenes tartás helyett.', sv: 'Att luta mot vikten i stället för att stå upprätt.' },
		easier: { en: 'Use a lighter weight over a short distance.', fi: 'Käytä kevyempää painoa lyhyellä matkalla.', hu: 'Használj könnyebb súlyt rövid távon.', sv: 'Använd en lättare vikt över en kort sträcka.' },
		harder: { en: 'Add load or extend the distance carried.', fi: 'Lisää kuormaa tai pidennä kannettua matkaa.', hu: 'Adj hozzá terhelést, vagy növeld a cipelt távot.', sv: 'Lägg på vikt eller förläng bärsträckan.' },
		fit: f(2, 1, 2, 3)
	},

	// ===== MOBILITY =====
	{
		id: 'deep-squat-hold',
		name: { en: 'Deep squat hold', fi: 'Syväkyykyn pito', hu: 'Mély guggolás tartás', sv: 'Vila i djup knäböj' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Hips', 'Adductors'],
		cue: { en: 'Sink to the bottom, relax, gently press the knees out.', fi: 'Vajoa alas, rentoudu, paina polvia varovasti ulos.', hu: 'Süllyedj le, lazíts, told finoman kifelé a térdet.', sv: 'Sjunk ner, slappna av, tryck knäna mjukt utåt.' },
		purpose: { en: 'Opens the hips, ankles and groin for better squat depth.', fi: 'Avaa lonkat, nilkat ja nivuset paremman kyykkysyvyyden vuoksi.', hu: 'Nyitja a csípőt, a bokát és az ágyékot a jobb guggolásmélységért.', sv: 'Öppnar höfter, fotleder och ljumskar för bättre knäböjsdjup.' },
		setup: { en: 'Squat all the way down, feet flat, heels on the floor.', fi: 'Kyykkää kokonaan alas, jalat tasaisesti, kantapäät lattiassa.', hu: 'Guggolj egészen le, talp laposan, sarok a talajon.', sv: 'Knäböj hela vägen ner, fötterna platta, hälarna i golvet.' },
		mistakes: { en: 'Heels lifting or the back rounding hard.', fi: 'Kantapäät nousevat tai selkä pyöristyy voimakkaasti.', hu: 'A sarok elemelkedik, vagy a hát erősen behajlik.', sv: 'Att hälarna lyfter eller ryggen rundas kraftigt.' },
		easier: { en: 'Hold a support or sit on a low block.', fi: 'Pidä tuesta tai istu matalalle korokkeelle.', hu: 'Fogj meg egy támaszt, vagy ülj egy alacsony blokkra.', sv: 'Håll i ett stöd eller sitt på ett lågt block.' },
		harder: { en: 'Hold longer or rock gently side to side.', fi: 'Pidä pidempään tai keinu varovasti puolelta toiselle.', hu: 'Tartsd tovább, vagy ringj finoman oldalról oldalra.', sv: 'Håll längre eller gunga försiktigt från sida till sida.' },
		fit: f(1, 1, 1, 3)
	},
	{
		id: 'downward-dog',
		name: { en: 'Downward dog', fi: 'Alaspäin katsova koira', hu: 'Lefelé néző kutya', sv: 'Nedåtgående hund' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Hamstrings', 'Spine'],
		cue: { en: 'Push the hips up and back, lengthen the spine and legs.', fi: 'Työnnä lonkat ylös ja taakse, pidennä selkärankaa ja jalkoja.', hu: 'Told fel és hátra a csípőt, nyújtsd a gerincet és a lábat.', sv: 'Tryck höften upp och bakåt, sträck ryggen och benen.' },
		purpose: { en: 'Stretches the hamstrings, calves and shoulders together.', fi: 'Venyttää takareisiä, pohkeita ja olkapäitä yhdessä.', hu: 'Egyszerre nyújtja a combhajlítókat, a vádlit és a vállat.', sv: 'Sträcker baklår, vader och axlar tillsammans.' },
		setup: { en: 'From all fours, lift the hips into an inverted V.', fi: 'Konttausasennosta nosta lonkat ylösalaisin V-asentoon.', hu: 'Négykézláb helyzetből emeld a csípőd fordított V alakba.', sv: 'Från fyrfotastående, lyft höften till ett upp-och-nedvänt V.' },
		mistakes: { en: 'Rounding the back to force the heels down.', fi: 'Pyöristät selkää pakottaaksesi kantapäät alas.', hu: 'A hát behomorítása, hogy lenyomd a sarkad.', sv: 'Att runda ryggen för att tvinga ner hälarna.' },
		easier: { en: 'Bend the knees and keep the back long.', fi: 'Koukista polvet ja pidä selkä pitkänä.', hu: 'Hajlítsd be a térded, és tartsd hosszan a hátad.', sv: 'Böj knäna och håll ryggen lång.' },
		harder: { en: 'Press the heels toward the floor and hold longer.', fi: 'Paina kantapäät kohti lattiaa ja pidä pidempään.', hu: 'Nyomd a sarkad a talaj felé, és tartsd tovább.', sv: 'Tryck hälarna mot golvet och håll längre.' },
		fit: f(1, 1, 1, 3)
	},
	{
		id: 'childs-pose',
		name: { en: 'Childs pose', fi: 'Lapsen lepoasento', hu: 'Gyermekpóz', sv: 'Barnets position' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Spine', 'Hips'],
		cue: { en: 'Sit back onto the heels, reach forward, breathe slowly.', fi: 'Istu taakse kantapäille, kurota eteen, hengitä rauhallisesti.', hu: 'Ülj hátra a sarkakra, nyúlj előre, lélegezz lassan.', sv: 'Sätt dig tillbaka på hälarna, sträck framåt, andas lugnt.' },
		purpose: { en: 'A gentle rest that lengthens the back and hips.', fi: 'Lempeä lepoasento, joka pidentää selkää ja lonkkia.', hu: 'Lágy pihenőhelyzet, amely megnyújtja a hátat és a csípőt.', sv: 'En mjuk vila som förlänger rygg och höfter.' },
		setup: { en: 'Kneel, big toes together, fold forward over the thighs.', fi: 'Polvistu, isovarpaat yhdessä, taivu eteen reisien yli.', hu: 'Térdelj, nagylábujjak összeérnek, hajolj előre a combod fölé.', sv: 'Stå på knä, stortårna ihop, vik dig framåt över låren.' },
		mistakes: { en: 'Forcing the stretch instead of relaxing into it.', fi: 'Pakotat venytystä sen sijaan, että rentoutuisit siihen.', hu: 'A nyújtás erőltetése ahelyett, hogy ellazulnál benne.', sv: 'Att tvinga fram sträckningen i stället för att slappna av i den.' },
		easier: { en: 'Place a cushion under the hips or chest.', fi: 'Aseta tyyny lonkkien tai rinnan alle.', hu: 'Tegyél párnát a csípőd vagy a mellkasod alá.', sv: 'Lägg en kudde under höften eller bröstet.' },
		harder: { en: 'Walk the hands to one side for a deeper stretch.', fi: 'Kävele kädet toiselle puolelle syvempään venytykseen.', hu: 'Sétáltasd a kezed az egyik oldalra a mélyebb nyújtásért.', sv: 'Vandra händerna åt ena hållet för en djupare sträckning.' },
		fit: f(1, 1, 1, 3)
	},
	{
		id: 'thread-the-needle',
		name: { en: 'Thread the needle', fi: 'Neulansilmä', hu: 'Tűbefűzés', sv: 'Thread the needle' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Spine', 'Back'],
		cue: { en: 'Reach one arm under the body, rotate the upper back.', fi: 'Vie toinen käsi vartalon ali, kierrä yläselkää.', hu: 'Nyúlj egy karral a test alá, forgasd a felső hátat.', sv: 'För en arm under kroppen, rotera övre ryggen.' },
		purpose: { en: 'Mobilises the thoracic spine and opens the shoulders.', fi: 'Liikuttaa rintarankaa ja avaa olkapäitä.', hu: 'Átmozgatja a hátgerincet, és nyitja a vállat.', sv: 'Rörlighetstränar bröstryggen och öppnar axlarna.' },
		setup: { en: 'On all fours, slide one arm under and across the body.', fi: 'Konttausasennossa liu\'uta toinen käsi vartalon ali ja yli.', hu: 'Négykézláb helyzetben csúsztasd az egyik karod a test alá és át.', sv: 'På alla fyra, glid ena armen under och tvärs över kroppen.' },
		mistakes: { en: 'Turning from the hips instead of the upper back.', fi: 'Kierrät lonkista yläselän sijaan.', hu: 'Csípőből fordulsz a felső hát helyett.', sv: 'Att vrida från höften i stället för övre ryggen.' },
		easier: { en: 'Move through a smaller, gentle range.', fi: 'Liiku pienemmällä, lempeällä liikeradalla.', hu: 'Mozogj kisebb, lágy mozgásterjedelemben.', sv: 'Rör dig genom ett mindre, mjukt rörelseomfång.' },
		harder: { en: 'Hold the end position and breathe into it.', fi: 'Pidä loppuasentoa ja hengitä siihen.', hu: 'Tartsd a végpozíciót, és lélegezz bele.', sv: 'Håll slutläget och andas in i det.' },
		fit: f(1, 1, 1, 3)
	},
	{
		id: 'ninety-ninety-hip-switch',
		name: { en: '90/90 hip switch', fi: '90/90 lonkkavaihto', hu: '90/90 csípőváltás', sv: '90/90 höftväxling' },
		pattern: 'mobility', minTier: 0, experienceMin: 'beginner', primary: ['Hips'],
		cue: { en: 'Rotate both knees from side to side, stay tall.', fi: 'Kierrä molemmat polvet puolelta toiselle, pysy ryhdikkäänä.', hu: 'Forgasd mindkét térdet oldalról oldalra, maradj egyenes.', sv: 'Rotera båda knäna sida till sida, sitt rakt.' },
		purpose: { en: 'Improves internal and external hip rotation.', fi: 'Parantaa lonkan sisä- ja ulkokiertoa.', hu: 'Javítja a csípő belső és külső forgatását.', sv: 'Förbättrar höftens inåt- och utåtrotation.' },
		setup: { en: 'Sit with both knees bent at 90 degrees to one side.', fi: 'Istu molemmat polvet 90 asteessa toiselle puolelle.', hu: 'Ülj mindkét térded 90 fokban behajlítva az egyik oldalra.', sv: 'Sitt med båda knäna böjda i 90 grader åt ena hållet.' },
		mistakes: { en: 'Leaning back and using momentum to switch.', fi: 'Nojaat taakse ja vaihdat puolta vauhdilla.', hu: 'Hátradőlsz, és lendülettel váltasz oldalt.', sv: 'Att luta sig bakåt och använda fart för att byta.' },
		easier: { en: 'Use the hands behind you for support.', fi: 'Tue käsillä takaa.', hu: 'Támaszkodj a mögötted lévő kezeidre.', sv: 'Använd händerna bakom dig för stöd.' },
		harder: { en: 'Keep the chest up and hover the hands.', fi: 'Pidä rinta ylhäällä ja pidä kädet irti.', hu: 'Tartsd a mellkasod felemelve, és emeld el a kezed a talajról.', sv: 'Håll bröstet uppe och lyft händerna fritt.' },
		fit: f(1, 1, 1, 3)
	}
];
