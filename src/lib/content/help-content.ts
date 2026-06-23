// Help knowledge base (drives /about, the Help page). Pure data + a pure search helper, so it is unit-
// testable in node. Every string is 4-language (fi/hu/en/sv) with correct diacritics; plain hyphens only;
// no health claims (Hard Rule 15) - supplement/diet/safety copy stays neutral and caveated.

import { L, type Loc } from './data';

export type HelpSectionId = 'using' | 'workouts' | 'nutrition' | 'recipes' | 'supplements' | 'safety';

export interface HelpSection {
	id: HelpSectionId;
	title: Loc;
	intro: Loc;
}

export interface HelpEntry {
	id: string;
	section: HelpSectionId;
	title: Loc;
	body: Loc[];
	keywords?: Loc;
	micro?: string; // a tracked micronutrient key -> renders the nutrient icon in the Micronutrients area
}

export const HELP_SECTIONS: HelpSection[] = [
	{
		id: 'using',
		title: { en: 'Getting started', fi: 'Aloitus', hu: 'Első lépések', sv: 'Kom igång' },
		intro: {
			en: 'The first things to do here: build a workout, make a meal plan, save your work and set the basics.',
			fi: 'Ensimmäiset asiat täällä: rakenna treeni, tee ateriasuunnitelma, tallenna työsi ja säädä perusasiat.',
			hu: 'Az első teendők itt: állíts össze egy edzést, készíts étrendet, mentsd a munkádat és állítsd be az alapokat.',
			sv: 'Det första du gör här: bygg en träning, gör en måltidsplan, spara ditt arbete och ställ in grunderna.'
		}
	},
	{
		id: 'workouts',
		title: { en: 'Your workout', fi: 'Treenisi', hu: 'Az edzésed', sv: 'Din träning' },
		intro: {
			en: 'How your training program is built, how to adjust it, and how it adapts to your equipment and situation.',
			fi: 'Miten harjoitusohjelmasi rakentuu, miten säädät sitä ja miten se mukautuu välineisiisi ja tilanteeseesi.',
			hu: 'Hogyan épül fel az edzésprogramod, hogyan állíthatod be, és hogyan alkalmazkodik az eszközeidhez és helyzetedhez.',
			sv: 'Hur ditt träningsprogram byggs, hur du justerar det och hur det anpassas till din utrustning och situation.'
		}
	},
	{
		id: 'nutrition',
		title: { en: 'Meal plans, targets and nutrients', fi: 'Ateriasuunnitelmat, tavoitteet ja ravintoaineet', hu: 'Étrendtervek, célok és tápanyagok', sv: 'Måltidsplaner, mål och näringsämnen' },
		intro: {
			en: 'How the meal planner builds your week, the numbers behind your targets, and what each nutrient does.',
			fi: 'Miten ateriasuunnittelija rakentaa viikkosi, tavoitteidesi taustalla olevat luvut ja mitä kukin ravintoaine tekee.',
			hu: 'Hogyan építi fel az étrendtervező a hetedet, a célok mögötti számok, és mit csinál az egyes tápanyagok.',
			sv: 'Hur måltidsplaneraren bygger din vecka, siffrorna bakom dina mål och vad varje näringsämne gör.'
		}
	},
	{
		id: 'recipes',
		title: { en: 'Recipes, shopping and cooking for a group', fi: 'Reseptit, ostokset ja ryhmälle kokkaaminen', hu: 'Receptek, bevásárlás és főzés többeknek', sv: 'Recept, inköp och matlagning för flera' },
		intro: {
			en: 'Finding and scaling recipes, the shopping list, and cooking for a whole household.',
			fi: 'Reseptien etsiminen ja skaalaaminen, ostoslista ja koko ruokakunnalle kokkaaminen.',
			hu: 'Receptek keresése és méretezése, a bevásárlólista és főzés az egész háztartásnak.',
			sv: 'Hitta och skala recept, inköpslistan och matlagning för ett helt hushåll.'
		}
	},
	{
		id: 'supplements',
		title: { en: 'Supplements', fi: 'Lisäravinteet', hu: 'Étrend-kiegészítők', sv: 'Kosttillskott' },
		intro: {
			en: 'An honest, neutral overview - never part of your plan.',
			fi: 'Rehellinen ja neutraali yleiskatsaus - ei koskaan osa ohjelmaasi.',
			hu: 'Őszinte, semleges áttekintés - sosem része a tervednek.',
			sv: 'En ärlig, neutral översikt - aldrig en del av din plan.'
		}
	},
	{
		id: 'safety',
		title: { en: 'Safety and special situations', fi: 'Turvallisuus ja erityistilanteet', hu: 'Biztonság és különleges helyzetek', sv: 'Säkerhet och särskilda situationer' },
		intro: {
			en: 'What this tool is and is not, plus how it handles situations like pregnancy and breastfeeding.',
			fi: 'Mikä tämä työkalu on ja mikä se ei ole, sekä miten se käsittelee tilanteita kuten raskaus ja imetys.',
			hu: 'Mi ez az eszköz és mi nem, valamint hogyan kezeli az olyan helyzeteket, mint a várandósság és a szoptatás.',
			sv: 'Vad detta verktyg är och inte är, plus hur det hanterar situationer som graviditet och amning.'
		}
	}
];

export const helpEntries: HelpEntry[] = [
	// --- Getting started ---
	{
		id: 'create-workout', section: 'using',
		title: { en: 'Create a workout program', fi: 'Luo harjoitusohjelma', hu: 'Készíts edzésprogramot', sv: 'Skapa ett träningsprogram' },
		body: [{
			en: 'Open Workout, fill in your profile (age, sex, weight, height, goal, experience, the equipment you have, days per week and minutes per session), pick a weekly emphasis, then press Generate. Your plan appears with sets, reps and rest for each day.',
			fi: 'Avaa Treeni, täytä profiilisi (ikä, sukupuoli, paino, pituus, tavoite, kokemus, käytössäsi olevat välineet, päivät viikossa ja minuutit kerralla), valitse viikon painotus ja paina Luo. Ohjelmasi ilmestyy sarjoineen, toistoineen ja palautuksineen joka päivälle.',
			hu: 'Nyisd meg az Edzés oldalt, töltsd ki a profilodat (kor, nem, testsúly, magasság, cél, tapasztalat, elérhető eszközök, heti napok és percek alkalmanként), válassz heti hangsúlyt, majd nyomd meg a Létrehozás gombot. A terved sorozatokkal, ismétlésekkel és pihenőkkel jelenik meg minden napra.',
			sv: 'Öppna Träning, fyll i din profil (ålder, kön, vikt, längd, mål, erfarenhet, utrustningen du har, dagar per vecka och minuter per pass), välj en veckobetoning och tryck på Skapa. Din plan visas med set, repetitioner och vila för varje dag.'
		}]
	},
	{
		id: 'meal-plan', section: 'using',
		title: { en: 'Generate a weekly meal plan', fi: 'Luo viikon ateriasuunnitelma', hu: 'Készíts heti étrendet', sv: 'Skapa en veckomeny' },
		body: [{
			en: 'Open Nutrition, set meals per day and any dietary choices, then press Generate. The same profile drives both training and food, so your targets stay consistent. The generated week is temporary and kept only while you stay on the page - reloading starts a fresh week. To keep a week, press Save; only a saved plan is stored on your device.',
			fi: 'Avaa Ravinto, aseta aterioiden määrä päivässä ja mahdolliset ruokavalinnat ja paina Luo. Sama profiili ohjaa sekä treeniä että ruokaa, joten tavoitteesi pysyvät yhtenäisinä. Luotu viikko on väliaikainen ja säilyy vain niin kauan kuin pysyt sivulla - sivun uudelleenlataus aloittaa uuden viikon. Säilyttääksesi viikon paina Tallenna; vain tallennettu suunnitelma säilyy laitteellasi.',
			hu: 'Nyisd meg a Táplálkozás oldalt, állítsd be a napi étkezések számát és az esetleges étrendi választásokat, majd nyomd meg a Létrehozás gombot. Ugyanaz a profil vezérli az edzést és az étkezést is, így a céljaid összhangban maradnak. A létrehozott hét ideiglenes, és csak addig marad meg, amíg az oldalon vagy - az oldal újratöltése új hetet indít. A hét megtartásához nyomd meg a Mentés gombot; csak a mentett terv tárolódik az eszközödön.',
			sv: 'Öppna Kost, ange måltider per dag och eventuella kostval och tryck på Skapa. Samma profil styr både träning och mat, så dina mål förblir samstämmiga. Den skapade veckan är tillfällig och behålls bara så länge du är kvar på sidan - att ladda om sidan startar en ny vecka. För att behålla en vecka, tryck på Spara; bara en sparad plan lagras på din enhet.'
		}]
	},
	{
		id: 'save-reopen', section: 'using',
		title: { en: 'Save and reopen a plan', fi: 'Tallenna ja avaa ohjelma uudelleen', hu: 'Mentés és terv újranyitása', sv: 'Spara och öppna en plan igen' },
		body: [{
			en: 'Press Save on a workout or meal plan to keep it on your device. Find your saved items under the Saved tab on the Exercises and Recipes pages. Opening a saved meal plan also loads its shopping list.',
			fi: 'Paina Tallenna treeni- tai ateriaohjelmassa säilyttääksesi sen laitteellasi. Löydät tallennetut kohteet Tallennetut-välilehdeltä Liikkeet- ja Reseptit-sivuilla. Tallennetun ateriasuunnitelman avaaminen lataa myös sen ostoslistan.',
			hu: 'Nyomd meg a Mentés gombot egy edzés- vagy étrendtervnél, hogy az eszközödön maradjon. A mentett elemeket a Mentett fülön találod a Gyakorlatok és Receptek oldalon. Egy mentett étrend megnyitása a bevásárlólistáját is betölti.',
			sv: 'Tryck på Spara på ett tränings- eller måltidsschema för att behålla det på din enhet. Hitta dina sparade objekt under fliken Sparat på sidorna Övningar och Recept. Att öppna en sparad meny laddar även dess inköpslista.'
		}]
	},
	{
		id: 'language', section: 'using',
		title: { en: 'Change the language', fi: 'Vaihda kieli', hu: 'Nyelv váltása', sv: 'Byt språk' },
		body: [{
			en: 'Use the language switcher at the top right to switch between Finnish, English, Hungarian and Swedish. Your choice is remembered on this device.',
			fi: 'Käytä kielivalitsinta oikeassa yläkulmassa vaihtaaksesi suomen, englannin, unkarin ja ruotsin välillä. Valintasi muistetaan tällä laitteella.',
			hu: 'Használd a nyelvváltót a jobb felső sarokban a finn, angol, magyar és svéd közötti váltáshoz. A választásod megjegyződik ezen az eszközön.',
			sv: 'Använd språkväljaren uppe till höger för att byta mellan finska, engelska, ungerska och svenska. Ditt val kommer ihåg på den här enheten.'
		}]
	},
	{
		id: 'privacy', section: 'using',
		title: { en: 'Your data stays on your device', fi: 'Tietosi pysyvät laitteellasi', hu: 'Az adataid az eszközödön maradnak', sv: 'Dina uppgifter stannar på din enhet' },
		body: [{
			en: 'There is no account and no sign-up. Everything you enter is stored only in your browser, so the same inputs always produce the same plan. Clearing your browser data resets it.',
			fi: 'Tunnusta tai rekisteröitymistä ei ole. Kaikki syöttämäsi tallentuu vain selaimeesi, joten samat tiedot tuottavat aina saman ohjelman. Selaimen tietojen tyhjentäminen nollaa sen.',
			hu: 'Nincs fiók és nincs regisztráció. Minden, amit megadsz, csak a böngésződben tárolódik, így ugyanazok az adatok mindig ugyanazt a tervet adják. A böngészőadatok törlése visszaállítja.',
			sv: 'Det finns inget konto och ingen registrering. Allt du anger lagras bara i din webbläsare, så samma uppgifter ger alltid samma plan. Att rensa webbläsardata nollställer det.'
		}]
	},

	// --- Your workout ---
	{
		id: 'how-built', section: 'workouts',
		title: { en: 'How your program is built', fi: 'Miten ohjelmasi rakentuu', hu: 'Hogyan épül fel a programod', sv: 'Hur ditt program byggs' },
		body: [{
			en: 'A transparent, rule-based engine builds the plan - there is no random guessing. Sets and reps come from your goal, experience and weekly emphasis; the split (full body, upper/lower or push/pull/legs) follows your days per week and time per session.',
			fi: 'Läpinäkyvä, sääntöpohjainen moottori rakentaa ohjelman - mitään ei arvota satunnaisesti. Sarjat ja toistot tulevat tavoitteestasi, kokemuksestasi ja viikon painotuksesta; jako (koko keho, ylä/ala tai työntö/veto/jalat) seuraa viikkopäiviäsi ja kerta-aikaasi.',
			hu: 'Egy átlátható, szabályalapú motor építi a tervet - nincs véletlenszerű találgatás. A sorozatok és ismétlések a célodból, tapasztalatodból és heti hangsúlyodból adódnak; a felosztás (teljes test, felső/alsó vagy nyomás/húzás/láb) a heti napjaidat és az alkalmankénti időt követi.',
			sv: 'En transparent, regelbaserad motor bygger planen - inget slumpas. Set och repetitioner kommer från ditt mål, din erfarenhet och din veckobetoning; uppdelningen (helkropp, över/under eller push/pull/ben) följer dina dagar per vecka och tid per pass.'
		}]
	},
	{
		id: 'swaps', section: 'workouts',
		title: { en: 'Swap an exercise or ingredient', fi: 'Vaihda liike tai raaka-aine', hu: 'Cserélj gyakorlatot vagy hozzávalót', sv: 'Byt en övning eller ingrediens' },
		body: [{
			en: 'Use the swap icon next to an exercise or ingredient to cycle to a similar option. Exercises swap for the same movement pattern using equipment you have; ingredients swap within the same food family, so an onion stays an onion.',
			fi: 'Käytä vaihtokuvaketta liikkeen tai raaka-aineen vieressä vaihtaaksesi samankaltaiseen vaihtoehtoon. Liikkeet vaihtuvat samaan liikemalliin välineillä jotka sinulla on; raaka-aineet vaihtuvat saman ruokaperheen sisällä, joten sipuli pysyy sipulina.',
			hu: 'Használd a csere ikont egy gyakorlat vagy hozzávaló mellett, hogy hasonló lehetőségre válts. A gyakorlatok ugyanarra a mozgásmintára cserélődnek a nálad lévő eszközökkel; a hozzávalók ugyanazon ételcsaládon belül cserélődnek, így a hagyma hagyma marad.',
			sv: 'Använd bytesikonen bredvid en övning eller ingrediens för att växla till ett liknande alternativ. Övningar byts till samma rörelsemönster med utrustning du har; ingredienser byts inom samma matfamilj, så en lök förblir en lök.'
		}]
	},
	{
		id: 'equipment', section: 'workouts',
		title: { en: 'Train with what you have', fi: 'Treenaa sillä mitä sinulla on', hu: 'Edz azzal, amid van', sv: 'Träna med det du har' },
		body: [{
			en: 'Tick the equipment you own and the app only picks moves you can actually do. A wall and the floor are always available, so a useful program works even with no equipment at all.',
			fi: 'Rastita välineet jotka omistat, niin sovellus valitsee vain liikkeet jotka oikeasti pystyt tekemään. Seinä ja lattia ovat aina käytettävissä, joten toimiva ohjelma onnistuu jopa täysin ilman välineitä.',
			hu: 'Jelöld be a nálad lévő eszközöket, és az alkalmazás csak olyan gyakorlatokat választ, amelyeket valóban el tudsz végezni. A fal és a padló mindig elérhető, így hasznos program eszköz nélkül is működik.',
			sv: 'Kryssa i utrustningen du äger så väljer appen bara övningar du faktiskt kan göra. En vägg och golvet finns alltid tillgängliga, så ett användbart program fungerar även helt utan utrustning.'
		}]
	},
	{
		id: 'pull-gap', section: 'workouts',
		title: { en: 'Training your back with no equipment', fi: 'Selän treenaaminen ilman välineitä', hu: 'A hátad edzése eszköz nélkül', sv: 'Träna ryggen utan utrustning' },
		body: [{
			en: 'Pulling your bodyweight needs something to pull on. With no band, bar or sturdy table the plan cannot add real back exercises, so it fills those slots with other moves and shows a tip: add a resistance band or use a sturdy table to train your back properly.',
			fi: 'Oman kehon vetäminen vaatii jotain mistä vetää. Ilman kuminauhaa, tankoa tai tukevaa pöytää ohjelma ei voi lisätä oikeita selkäliikkeitä, joten se täyttää nuo paikat muilla liikkeillä ja näyttää vinkin: lisää kuminauha tai käytä tukevaa pöytää treenataksesi selkää kunnolla.',
			hu: 'A saját testsúlyod húzásához kell valami, amibe kapaszkodhatsz. Gumiszalag, rúd vagy stabil asztal nélkül a terv nem tud valódi hátgyakorlatokat hozzáadni, ezért más mozdulatokkal tölti fel azokat a helyeket, és egy tippet mutat: tegyél hozzá egy gumiszalagot, vagy használj egy stabil asztalt, hogy rendesen edzd a hátad.',
			sv: 'Att dra din kroppsvikt kräver något att dra i. Utan ett band, en stång eller ett stadigt bord kan planen inte lägga till riktiga ryggövningar, så den fyller de platserna med andra rörelser och visar ett tips: lägg till ett motståndsband eller använd ett stadigt bord för att träna ryggen ordentligt.'
		}]
	},
	{
		id: 'easier-options', section: 'workouts',
		title: { en: 'Show easier options', fi: 'Näytä helpommat vaihtoehdot', hu: 'Mutasd a könnyebb változatokat', sv: 'Visa enklare alternativ' },
		body: [{
			en: 'Turn on Show easier options if you are starting out or returning after a break. Swaps then lean toward gentler variations of each movement.',
			fi: 'Ota käyttöön Näytä helpommat vaihtoehdot, jos olet aloittelija tai palaat tauon jälkeen. Vaihdot painottuvat tällöin kunkin liikkeen kevyempiin variaatioihin.',
			hu: 'Kapcsold be a Mutasd a könnyebb változatokat funkciót, ha most kezded, vagy szünet után térsz vissza. A cserék ekkor az egyes mozdulatok kíméletesebb változatai felé hajlanak.',
			sv: 'Slå på Visa enklare alternativ om du är nybörjare eller kommer tillbaka efter ett uppehåll. Byten lutar då mot mildare varianter av varje rörelse.'
		}]
	},
	{
		id: 'warmup-cooldown', section: 'workouts',
		title: { en: 'Warm-up and cool-down', fi: 'Lämmittely ja loppuverryttely', hu: 'Bemelegítés és levezetés', sv: 'Uppvärmning och nedvarvning' },
		body: [{
			en: 'Choose a warm-up style (stretching, active drills, both, or mobility only) in your profile. Each session opens with a warm-up and ends with a short mobility cool-down.',
			fi: 'Valitse lämmittelytyyli (venyttely, aktiiviset liikkeet, molemmat tai vain liikkuvuus) profiilissasi. Jokainen treeni alkaa lämmittelyllä ja päättyy lyhyeen liikkuvuusverryttelyyn.',
			hu: 'Válassz bemelegítési stílust (nyújtás, aktív gyakorlatok, mindkettő vagy csak mobilitás) a profilodban. Minden edzés bemelegítéssel kezdődik és rövid mobilitási levezetéssel zárul.',
			sv: 'Välj en uppvärmningsstil (stretching, aktiva övningar, båda eller endast rörlighet) i din profil. Varje pass börjar med uppvärmning och avslutas med en kort rörlighetsnedvarvning.'
		}]
	},
	{
		id: 'pregnancy', section: 'workouts',
		title: { en: 'Pregnancy and postpartum', fi: 'Raskaus ja synnytyksen jälkeen', hu: 'Várandósság és szülés után', sv: 'Graviditet och efter förlossning' },
		body: [{
			en: 'If you mark pregnancy or recent birth, the program is built more conservatively (for example it avoids lying flat on the back or front) - it is a personalization, never a block. Always check with your own midwife or doctor, and stop if you feel pain, bleeding, dizziness or contractions.',
			fi: 'Jos merkitset raskauden tai äskettäisen synnytyksen, ohjelma rakennetaan varovaisemmin (esimerkiksi se välttää selällään tai vatsallaan makaamista) - kyseessä on yksilöllistäminen, ei koskaan esto. Tarkista aina omalta neuvolaltasi tai lääkäriltäsi ja lopeta, jos tunnet kipua, verenvuotoa, huimausta tai supistuksia.',
			hu: 'Ha várandósságot vagy közelmúltbeli szülést jelölsz, a program óvatosabban épül fel (például kerüli a háton vagy hason fekvést) - ez személyre szabás, sosem tiltás. Mindig egyeztess a saját védőnőddel vagy orvosoddal, és hagyd abba, ha fájdalmat, vérzést, szédülést vagy összehúzódásokat érzel.',
			sv: 'Om du anger graviditet eller nyligen förlossning byggs programmet mer försiktigt (det undviker till exempel att ligga plant på rygg eller mage) - det är en anpassning, aldrig ett stopp. Stäm alltid av med din egen barnmorska eller läkare, och sluta om du känner smärta, blödning, yrsel eller sammandragningar.'
		}]
	},

	// --- Meal plans, targets and nutrients ---
	{
		id: 'read-targets', section: 'nutrition',
		title: { en: 'Read your daily targets', fi: 'Lue päivittäiset tavoitteesi', hu: 'Értelmezd a napi céljaidat', sv: 'Förstå dina dagliga mål' },
		body: [{
			en: 'Your targets show calories, protein, carbs, fat and water for the day. Calories are shown as a single target with a small band that the planner stays within, not a hard number. Water is an estimate that rises with training, pregnancy, breastfeeding and age - treat it as a rough guide.',
			fi: 'Tavoitteesi näyttävät kalorit, proteiinin, hiilihydraatit, rasvan ja veden päivälle. Kalorit näytetään yhtenä tavoitteena, jonka ympärillä on pieni vaihteluväli jonka sisällä suunnittelija pysyy, ei tarkkana lukuna. Vesi on arvio joka kasvaa harjoittelun, raskauden, imetyksen ja iän myötä - käytä sitä karkeana ohjeena.',
			hu: 'A céljaid a napra mutatják a kalóriát, fehérjét, szénhidrátot, zsírt és vizet. A kalória egyetlen célként jelenik meg egy kis sávval, amelyen belül a tervező marad, nem szigorú számként. A víz egy becslés, amely nő az edzéssel, a várandóssággal, a szoptatással és a korral - tekintsd durva iránymutatásnak.',
			sv: 'Dina mål visar kalorier, protein, kolhydrater, fett och vatten för dagen. Kalorierna visas som ett enda mål med ett litet intervall som planeraren håller sig inom, inte en exakt siffra. Vatten är en uppskattning som ökar med träning, graviditet, amning och ålder - se det som en grov vägledning.'
		}, {
			en: 'You can set your own targets under Advanced if you prefer. The page also shows BMI, resting (BMR) and daily (TDEE) energy, and an optional waist-to-height screen. These are calculated estimates from your inputs, not measurements or a diagnosis - treat them as a starting point and adjust over time.',
			fi: 'Voit halutessasi asettaa omat tavoitteesi Lisäasetuksissa. Sivu näyttää myös painoindeksin, lepoaineenvaihdunnan (BMR) ja päivittäisen kulutuksen (TDEE) sekä valinnaisen vyötärö-pituussuhteen seulan. Nämä ovat laskennallisia arvioita tiedoistasi, eivät mittauksia tai diagnooseja - käytä niitä lähtökohtana ja säädä ajan myötä.',
			hu: 'Ha szeretnéd, a Speciális részben megadhatod a saját céljaidat. Az oldal megmutatja a testtömegindexet, a nyugalmi (BMR) és a napi (TDEE) energiát, valamint egy opcionális derék-magasság arány szűrést is. Ezek a megadott adataidból számított becslések, nem mérések vagy diagnózis - tekintsd kiindulópontnak, és idővel igazítsd.',
			sv: 'Du kan ange egna mål under Avancerat om du vill. Sidan visar även BMI, vilo- (BMR) och daglig (TDEE) energi, samt en valfri midja-längd-screening. Detta är beräknade uppskattningar från dina uppgifter, inte mätningar eller en diagnos - se dem som en utgångspunkt och justera med tiden.'
		}]
	},
	{
		id: 'cooking-mode', section: 'nutrition',
		title: { en: 'Smart cooking vs Precise portions', fi: 'Fiksu ruoanlaitto vs Tarkat annokset', hu: 'Okos főzés vs Pontos adagok', sv: 'Smart matlagning vs Exakta portioner' },
		body: [{
			en: 'Smart cooking is the default. It cooks a few dishes in bigger amounts and reuses them as leftovers, so you cook less and waste less. Precise portions instead gives one dish per meal slot for maximum variety. Switch between them with the toggle before you generate.',
			fi: 'Fiksu ruoanlaitto on oletus. Se valmistaa muutaman ruokalajin suurempina määrinä ja käyttää ne uudelleen tähteinä, joten kokkaat vähemmän ja hävikkiä syntyy vähemmän. Tarkat annokset antaa sen sijaan yhden ruokalajin jokaiseen ateriapaikkaan mahdollisimman suuren vaihtelun vuoksi. Vaihda niiden välillä valitsimella ennen kuin luot suunnitelman.',
			hu: 'Az okos főzés az alapértelmezett. Néhány ételt nagyobb mennyiségben főz meg, és maradékként újrahasználja őket, így kevesebbet főzöl és kevesebb megy kárba. A pontos adagok ehelyett minden étkezési helyre egy-egy ételt ad a legnagyobb változatosságért. Válts közöttük a kapcsolóval, mielőtt létrehozod a tervet.',
			sv: 'Smart matlagning är standard. Den lagar några rätter i större mängder och återanvänder dem som rester, så du lagar mindre och slänger mindre. Exakta portioner ger i stället en rätt per måltidsplats för största variation. Växla mellan dem med reglaget innan du skapar planen.'
		}]
	},
	{
		id: 'leftovers', section: 'nutrition',
		title: { en: 'How leftovers work', fi: 'Miten tähteet toimivat', hu: 'Hogyan működnek a maradékok', sv: 'Hur rester fungerar' },
		body: [{
			en: 'In Smart cooking the same cooked dish is reused for up to 3 days in a row, within common fridge guidance, and then a new dish takes over. A "Leftover" badge marks a reused dish. Breakfasts and light items stay fresh and are not carried over.',
			fi: 'Fiksussa ruoanlaitossa sama valmistettu ruokalaji käytetään uudelleen enintään 3 päivänä peräkkäin, yleisten jääkaappiohjeiden rajoissa, ja sitten uusi ruokalaji ottaa vallan. "Tähde"-merkki osoittaa uudelleenkäytetyn ruokalajin. Aamiaiset ja kevyet ruoat pysyvät tuoreina eikä niitä siirretä eteenpäin.',
			hu: 'Az okos főzésben ugyanazt a megfőzött ételt legfeljebb 3 egymást követő napon át újrahasználja, a szokásos hűtőszekrényes útmutatáson belül, majd egy új étel veszi át a helyét. Egy "Maradék" jelvény jelöli az újrahasznált ételt. A reggelik és a könnyű ételek frissek maradnak, és nem viszi át őket.',
			sv: 'I Smart matlagning återanvänds samma tillagade rätt i upp till 3 dagar i rad, inom vanliga kylskåpsråd, och sedan tar en ny rätt över. En "Rester"-markering visar en återanvänd rätt. Frukostar och lätta rätter hålls färska och förs inte vidare.'
		}]
	},
	{
		id: 'cook-sessions', section: 'nutrition',
		title: { en: 'How often you cook', fi: 'Kuinka usein kokkaat', hu: 'Milyen gyakran főzöl', sv: 'Hur ofta du lagar mat' },
		body: [{
			en: 'The Minimal, Balanced and "I enjoy cooking" presets set how many different dishes fill your week. Fewer distinct dishes means less variety and the simplest shopping; more distinct dishes means the most variety.',
			fi: 'Esiasetukset Minimaalinen, Tasapainoinen ja "Pidän kokkaamisesta" määräävät kuinka monta eri ruokalajia täyttää viikkosi. Vähemmän erillisiä ruokalajeja tarkoittaa vähemmän vaihtelua ja yksinkertaisinta ostamista; enemmän erillisiä ruokalajeja tarkoittaa eniten vaihtelua.',
			hu: 'A Minimális, a Kiegyensúlyozott és a "Szeretek főzni" beállítások határozzák meg, hány különböző étel tölti ki a hetedet. Kevesebb különböző étel kevesebb változatosságot és a legegyszerűbb bevásárlást jelenti; több különböző étel a legtöbb változatosságot jelenti.',
			sv: 'Förinställningarna Minimal, Balanserad och "Jag gillar att laga mat" anger hur många olika rätter som fyller din vecka. Färre olika rätter betyder mindre variation och enklast inköp; fler olika rätter betyder störst variation.'
		}]
	},
	{
		id: 'regenerate', section: 'nutrition',
		title: { en: 'Regenerate for fresh recipes', fi: 'Luo uudelleen tuoreita reseptejä varten', hu: 'Új létrehozás friss receptekért', sv: 'Skapa om för nya recept' },
		body: [{
			en: 'The Regenerate button keeps your same targets and settings but picks different recipes, so you can reroll a week you do not fancy without changing anything else.',
			fi: 'Luo uudelleen -painike säilyttää samat tavoitteesi ja asetuksesi mutta valitsee eri reseptit, joten voit arpoa uudelleen viikon josta et innostu muuttamatta mitään muuta.',
			hu: 'Az Új létrehozás gomb megtartja ugyanazokat a céljaidat és beállításaidat, de más recepteket választ, így újradobhatsz egy hetet, ami nem tetszik, anélkül hogy bármi mást módosítanál.',
			sv: 'Knappen Skapa om behåller samma mål och inställningar men väljer andra recept, så du kan slå om en vecka du inte gillar utan att ändra något annat.'
		}]
	},
	{
		id: 'own-targets', section: 'nutrition',
		title: { en: 'Set your own targets (advanced)', fi: 'Aseta omat tavoitteesi (lisäasetukset)', hu: 'Add meg a saját céljaidat (speciális)', sv: 'Ange egna mål (avancerat)' },
		body: [{
			en: 'Under "Advanced: set your own targets" you can type your own daily calories, protein, carbs, fat and water. Leave any field blank to keep it automatic. If the numbers are physically impossible together - for example 500 g protein inside 1000 kcal, when protein alone is about 2000 kcal - the planner explains the conflict and waits for you to adjust them before it builds a plan.',
			fi: 'Kohdassa "Lisäasetukset: aseta omat tavoitteesi" voit syöttää omat päivittäiset kalorisi, proteiinisi, hiilihydraattisi, rasvasi ja vetesi. Jätä kenttä tyhjäksi pitääksesi sen automaattisena. Jos luvut ovat fyysisesti mahdottomia yhdessä - esimerkiksi 500 g proteiinia 1000 kcal:n sisällä, kun pelkkä proteiini on noin 2000 kcal - suunnittelija selittää ristiriidan ja odottaa että säädät niitä ennen kuin se rakentaa suunnitelman.',
			hu: 'A "Speciális: add meg a saját céljaidat" alatt megadhatod a saját napi kalóriádat, fehérjédet, szénhidrátodat, zsírodat és vizedet. Hagyj bármelyik mezőt üresen, hogy automatikus maradjon. Ha a számok fizikailag lehetetlenek együtt - például 500 g fehérje 1000 kcal-on belül, miközben a fehérje önmagában körülbelül 2000 kcal - a tervező elmagyarázza az ellentmondást, és megvárja, amíg módosítod őket, mielőtt tervet készít.',
			sv: 'Under "Avancerat: ange egna mål" kan du skriva in dina egna dagliga kalorier, protein, kolhydrater, fett och vatten. Lämna ett fält tomt för att behålla det automatiskt. Om siffrorna är fysiskt omöjliga tillsammans - till exempel 500 g protein inom 1000 kcal, när enbart proteinet är ungefär 2000 kcal - förklarar planeraren konflikten och väntar tills du justerar dem innan den bygger en plan.'
		}]
	},
	{
		id: 'plant-proteins', section: 'nutrition',
		title: { en: 'Omnivore by default, plant proteins optional', fi: 'Sekasyöjä oletuksena, kasviproteiinit valinnaisia', hu: 'Alapból vegyes étrend, növényi fehérjék opcionálisak', sv: 'Allätare som standard, växtproteiner valfria' },
		body: [{
			en: 'Plans are omnivore by default, so tofu, tempeh and seitan main dishes are left out unless you tick "Include plant proteins" (or choose a vegetarian or vegan diet). Beans, lentils and other everyday plant foods are always included.',
			fi: 'Suunnitelmat ovat oletuksena sekasyöjälle, joten tofu-, tempeh- ja seitan-pääruoat jätetään pois ellet rastita "Sisällytä kasviproteiinit" (tai valitse kasvis- tai vegaaniruokavalio). Pavut, linssit ja muut arkiset kasviruoat ovat aina mukana.',
			hu: 'A tervek alapból vegyes étrendűek, ezért a tofu, tempeh és szejtán főételek kimaradnak, hacsak nem pipálod be a "Növényi fehérjék beillesztése" lehetőséget (vagy nem választasz vegetáriánus vagy vegán étrendet). A bab, a lencse és más hétköznapi növényi ételek mindig benne vannak.',
			sv: 'Planer är allätarbaserade som standard, så huvudrätter med tofu, tempeh och seitan utelämnas om du inte kryssar i "Inkludera växtproteiner" (eller väljer en vegetarisk eller vegansk kost). Bönor, linser och annan vardagsmat från växtriket finns alltid med.'
		}]
	},
	{
		id: 'nutrition-basics', section: 'nutrition',
		title: { en: 'Calories per gram', fi: 'Kalorit grammaa kohti', hu: 'Kalória grammonként', sv: 'Kalorier per gram' },
		body: [{
			en: 'Protein and carbs give about 4 kcal per gram, fat about 9, alcohol about 7 and fibre about 2. This is why fat is so energy-dense and why protein keeps meals filling for fewer calories.',
			fi: 'Proteiini ja hiilihydraatit antavat noin 4 kcal grammaa kohti, rasva noin 9, alkoholi noin 7 ja kuitu noin 2. Tästä syystä rasva on niin energiatiheää ja proteiini pitää ateriat kylläisinä pienemmillä kaloreilla.',
			hu: 'A fehérje és a szénhidrát körülbelül 4 kcal-t ad grammonként, a zsír körülbelül 9-et, az alkohol körülbelül 7-et, a rost pedig körülbelül 2-t. Ezért olyan energiasűrű a zsír, és ezért tart jól a fehérje kevesebb kalóriával.',
			sv: 'Protein och kolhydrater ger ungefär 4 kcal per gram, fett ungefär 9, alkohol ungefär 7 och fiber ungefär 2. Därför är fett så energität och protein gör måltider mättande för färre kalorier.'
		}]
	},
	{
		id: 'food-groups-ref', section: 'nutrition',
		title: { en: 'Food groups and diet guides', fi: 'Ruokaryhmät ja ruokavalio-oppaat', hu: 'Élelmiszer-csoportok és étrendi útmutatók', sv: 'Matgrupper och kostguider' },
		body: [{
			en: 'Browse the food-group cards below to see example foods and matching recipes for protein, carbs, vegetables, fruit, fats and fibre. The diet guides explain common eating patterns in plain terms.',
			fi: 'Selaa alla olevia ruokaryhmäkortteja nähdäksesi esimerkkiruoat ja sopivat reseptit proteiinille, hiilihydraateille, vihanneksille, hedelmille, rasvoille ja kuidulle. Ruokavalio-oppaat selittävät yleiset ruokailutavat selkokielellä.',
			hu: 'Böngészd az alábbi élelmiszer-csoport kártyákat, hogy lásd a példaételeket és az illő recepteket fehérjére, szénhidrátra, zöldségre, gyümölcsre, zsírokra és rostra. Az étrendi útmutatók közérthetően magyarázzák az elterjedt étkezési mintákat.',
			sv: 'Bläddra bland matgruppskorten nedan för att se exempelmat och matchande recept för protein, kolhydrater, grönsaker, frukt, fetter och fiber. Kostguiderna förklarar vanliga ätmönster på ett enkelt sätt.'
		}]
	},
	{
		id: 'weekly-nutrients', section: 'nutrition',
		title: { en: 'How the nutrient colors work (weekly)', fi: 'Miten ravintoaineiden värit toimivat (viikoittain)', hu: 'Hogyan működnek a tápanyag-színek (heti)', sv: 'Hur näringsfärgerna fungerar (per vecka)' },
		body: [{
			en: 'In the meal planner, each day nutrition-facts box shows today\'s value as the big number, with a small "wk NN%" underneath for the whole week against its target. The color follows the WEEK, not the day: green when the week is in the recommended range, yellow when it is a little off, and red ("too low" / "too high") only when the weekly total is genuinely below the recommended amount or above the safe upper limit. So one heavy or light day is fine as long as the week balances out. Tap a nutrient box to see your weekly total and range. Nutrients with no established upper limit (like potassium or B12 from food) are never marked "too high". These are general references for healthy adults, not medical advice.',
			fi: 'Ateriasuunnittelijassa kunkin päivän ravintosisältölaatikko näyttää tämän päivän arvon isona lukuna ja sen alla pienen "vk NN%" -merkinnän koko viikolle suhteessa tavoitteeseen. Väri seuraa VIIKKOA, ei päivää: vihreä kun viikko on suositellulla alueella, keltainen kun se on hieman pielessä, ja punainen ("liian vähän" / "liian paljon") vain kun viikon kokonaismäärä on selvästi alle suosituksen tai yli turvallisen ylärajan. Yksittäinen runsas tai niukka päivä on siis ok, kun viikko tasoittuu. Napauta ravintoainelaatikkoa nähdäksesi viikon kokonaismäärän ja vaihteluvälin. Ravintoaineita joilla ei ole ylärajaa (kuten kalium tai B12 ruoasta) ei koskaan merkitä "liian paljon". Nämä ovat yleisiä viitearvoja terveille aikuisille, eivät lääketieteellistä neuvontaa.',
			hu: 'Az étrendtervezőben minden napi tápérték-doboz a mai értéket mutatja nagy számként, alatta egy kis "hét NN%" jelzéssel a teljes hétre a célhoz viszonyítva. A szín a HETET követi, nem a napot: zöld, ha a hét az ajánlott tartományban van, sárga, ha kissé eltér, és piros ("túl kevés" / "túl sok") csak akkor, ha a heti összeg valóban az ajánlott mennyiség alatt vagy a biztonságos felső határ felett van. Egy bőséges vagy szűkös nap tehát rendben van, ha a hét kiegyenlítődik. Koppints egy tápanyag-dobozra a heti összeg és tartomány megtekintéséhez. A felső határ nélküli tápanyagokat (mint a kálium vagy a B12 ételből) sosem jelöljük "túl soknak". Ezek általános referenciaértékek egészséges felnőtteknek, nem orvosi tanács.',
			sv: 'I måltidsplaneraren visar varje dags näringsruta dagens värde som den stora siffran, med en liten "v NN%" under för hela veckan mot sitt mål. Färgen följer VECKAN, inte dagen: grönt när veckan ligger i det rekommenderade intervallet, gult när det är lite snett, och rött ("för lågt" / "för högt") bara när veckans totalsumma verkligen är under rekommendationen eller över den säkra övre gränsen. En tung eller lätt dag är alltså okej när veckan jämnar ut sig. Tryck på en näringsruta för att se din veckosumma och ditt intervall. Näringsämnen utan övre gräns (som kalium eller B12 från mat) markeras aldrig som "för högt". Detta är allmänna referensvärden för friska vuxna, inte medicinsk rådgivning.'
		}, {
			en: 'The reference amounts are set by your sex, age and pregnancy, and for each nutrient we use the higher of the US (NIH) and Nordic (NNR 2023) recommendation. If the plan still falls short of vitamin D, vitamin B12, iron, zinc or vitamin C, a small supplement line is added automatically. Calcium, magnesium, folate and potassium are covered from food only - if one of those runs low across the week it is flagged in yellow, not turned into a pill.',
			fi: 'Viitemäärät määräytyvät sukupuolen, iän ja raskauden mukaan, ja jokaiselle ravintoaineelle käytetään suurempaa yhdysvaltalaisesta (NIH) ja pohjoismaisesta (NNR 2023) suosituksesta. Jos suunnitelma jää silti vajaaksi D-vitamiinista, B12-vitamiinista, raudasta, sinkistä tai C-vitamiinista, lisätään automaattisesti pieni lisäravinnerivi. Kalsium, magnesium, folaatti ja kalium katetaan vain ruoasta - jos jokin niistä jää vähäiseksi viikon aikana, se merkitään keltaisella, ei muuteta tabletiksi.',
			hu: 'A referenciamennyiségeket a nemed, korod és a várandósság határozza meg, és minden tápanyagnál a magasabbat használjuk az amerikai (NIH) és az északi (NNR 2023) ajánlás közül. Ha a terv így is elmarad a D-vitamintól, a B12-vitamintól, a vastól, a cinktől vagy a C-vitamintól, automatikusan egy kis kiegészítő sor kerül hozzá. A kalciumot, a magnéziumot, a folátot és a káliumot csak ételből fedezzük - ha valamelyik kevésnek bizonyul a héten, sárgával jelöljük, nem tablettává alakítjuk.',
			sv: 'Referensmängderna styrs av kön, ålder och graviditet, och för varje näringsämne använder vi det högre av den amerikanska (NIH) och den nordiska (NNR 2023) rekommendationen. Om planen ändå inte når upp till D-vitamin, B12-vitamin, järn, zink eller C-vitamin läggs en liten tillskottsrad till automatiskt. Kalcium, magnesium, folat och kalium täcks enbart från mat - om något av dem blir lågt under veckan markeras det i gult, inte till en tablett.'
		}, {
			en: 'We never suggest a calcium supplement. Calcium from food is well supported, but calcium in pill form has been linked in some research to a possible increase in cardiovascular risk (the evidence is debated), so a low-calcium day is topped up with a calcium-rich food such as a glass of milk, not a pill.',
			fi: 'Emme koskaan suosittele kalsiumlisää. Ruoasta saatava kalsium on hyvin tuettua, mutta tablettimuotoinen kalsium on joissakin tutkimuksissa yhdistetty mahdolliseen sydän- ja verisuoniriskin kasvuun (näyttö on kiistanalaista), joten vähäkalsiuminen päivä täydennetään kalsiumpitoisella ruoalla, kuten lasillisella maitoa, ei tabletilla.',
			hu: 'Sosem javaslunk kalcium-kiegészítőt. Az ételből származó kalcium jól alátámasztott, de a tabletta formájú kalciumot egyes kutatások a szív- és érrendszeri kockázat lehetséges növekedésével hozták összefüggésbe (a bizonyíték vitatott), ezért az alacsony kalciumtartalmú napot kalciumban gazdag étellel, például egy pohár tejjel pótoljuk, nem tablettával.',
			sv: 'Vi föreslår aldrig ett kalciumtillskott. Kalcium från mat är väl underbyggt, men kalcium i tablettform har i viss forskning kopplats till en möjlig ökning av kardiovaskulär risk (bevisen är omdebatterade), så en kalciumfattig dag fylls på med en kalciumrik mat som ett glas mjölk, inte en tablett.'
		}]
	},
	{
		id: 'supplement-scope', section: 'nutrition',
		title: { en: 'Which nutrients can get a supplement', fi: 'Mille ravintoaineille voi tulla lisäravinne', hu: 'Mely tápanyagokhoz adható kiegészítő', sv: 'Vilka näringsämnen kan få ett tillskott' },
		body: [{
			en: 'Only vitamin D, vitamin B12, iron, zinc and vitamin C are ever added as a small supplement line, and only if the week falls short. Calcium, magnesium, folate and potassium are covered from food only; a weekly shortfall is flagged, never pilled. Supplements never carry calories.',
			fi: 'Vain D-vitamiini, B12-vitamiini, rauta, sinkki ja C-vitamiini voidaan koskaan lisätä pienenä lisäravinnerivinä, ja vain jos viikko jää vajaaksi. Kalsium, magnesium, folaatti ja kalium katetaan vain ruoasta; viikon vajaus merkitään, ei koskaan muuteta tabletiksi. Lisäravinteissa ei koskaan ole kaloreita.',
			hu: 'Csak a D-vitamin, a B12-vitamin, a vas, a cink és a C-vitamin kerül valaha kis kiegészítő sorként hozzáadásra, és csak akkor, ha a hét elmarad. A kalciumot, a magnéziumot, a folátot és a káliumot csak ételből fedezzük; a heti hiányt megjelöljük, sosem tablettázzuk. A kiegészítők soha nem tartalmaznak kalóriát.',
			sv: 'Endast D-vitamin, B12-vitamin, järn, zink och C-vitamin läggs någonsin till som en liten tillskottsrad, och bara om veckan blir för låg. Kalcium, magnesium, folat och kalium täcks enbart från mat; ett underskott under veckan markeras, blir aldrig en tablett. Tillskott innehåller aldrig kalorier.'
		}]
	},
	{
		id: 'calorie-notes', section: 'nutrition',
		title: { en: 'The day calorie notes', fi: 'Päivän kalorihuomautukset', hu: 'A napi kalória-megjegyzések', sv: 'Dagens kalorinoteringar' },
		body: [{
			en: 'A day can show "well under your calorie target" or "over your target" when its total drifts more than about 10% from the target. These notes are most useful after you swap or add foods, as a nudge to rebalance the day.',
			fi: 'Päivä voi näyttää "selvästi alle kaloritavoitteesi" tai "yli tavoitteesi" kun sen kokonaismäärä poikkeaa yli noin 10 % tavoitteesta. Nämä huomautukset ovat hyödyllisimpiä kun olet vaihtanut tai lisännyt ruokia, muistutuksena tasapainottaa päivä uudelleen.',
			hu: 'Egy nap megjelenítheti, hogy "jóval a kalóriacélod alatt" vagy "a célod felett", amikor az összege több mint körülbelül 10%-kal eltér a céltól. Ezek a megjegyzések leginkább akkor hasznosak, miután ételt cseréltél vagy adtál hozzá, finom emlékeztetőként a nap újraegyensúlyozására.',
			sv: 'En dag kan visa "klart under ditt kalorimål" eller "över ditt mål" när dess totalsumma avviker mer än ungefär 10% från målet. Dessa noteringar är mest användbara efter att du bytt eller lagt till mat, som en knuff att balansera om dagen.'
		}]
	},
	{
		id: 'micro-potassium', section: 'nutrition', micro: 'potassium_mg',
		title: { en: 'Potassium', fi: 'Kalium', hu: 'Kálium', sv: 'Kalium' },
		body: [{
			en: 'Helps regulate blood pressure and fluid balance and supports nerve and muscle function. Found in potatoes, bananas, beans, leafy greens and many vegetables. The target is an adequate intake, similar for adults of both sexes.',
			fi: 'Auttaa säätelemään verenpainetta ja nestetasapainoa ja tukee hermojen ja lihasten toimintaa. Lähteitä ovat peruna, banaani, pavut, lehtivihannekset ja monet kasvikset. Tavoite on riittävä saanti, samaa luokkaa molemmilla sukupuolilla.',
			hu: 'Segít szabályozni a vérnyomást és a folyadékegyensúlyt, és támogatja az ideg- és izomműködést. Megtalálható burgonyában, banánban, babban, leveles zöldekben és sok zöldségben. A cél a megfelelő bevitel, mindkét nemnél hasonló.',
			sv: 'Hjälper till att reglera blodtryck och vätskebalans och stödjer nerv- och muskelfunktion. Finns i potatis, banan, bönor, bladgrönt och många grönsaker. Målet är ett tillräckligt intag, liknande för båda könen.'
		}]
	},
	{
		id: 'micro-calcium', section: 'nutrition', micro: 'calcium_mg',
		title: { en: 'Calcium', fi: 'Kalsium', hu: 'Kalcium', sv: 'Kalcium' },
		body: [{
			en: 'Builds and maintains bone and teeth and supports muscle and nerve function. Found in dairy, fortified plant drinks, tofu, leafy greens and small fish with bones. The target rises with age. We top up a low day with food (e.g. milk), never a pill (see the weekly-colors note).',
			fi: 'Rakentaa ja ylläpitää luustoa ja hampaita ja tukee lihasten ja hermojen toimintaa. Lähteitä ovat maitotuotteet, täydennetyt kasvijuomat, tofu, lehtivihannekset ja pienet ruotoineen syötävät kalat. Tavoite kasvaa iän myötä. Täydennämme vähäisen päivän ruoalla (esim. maito), emme tabletilla.',
			hu: 'Felépíti és karbantartja a csontokat és fogakat, és támogatja az izom- és idegműködést. Megtalálható tejtermékben, dúsított növényi italban, tofuban, leveles zöldekben és szálkás kis halakban. A cél a korral nő. Az alacsony napot étellel (pl. tej) pótoljuk, sosem tablettával.',
			sv: 'Bygger och underhåller skelett och tänder och stödjer muskel- och nervfunktion. Finns i mejeri, berikade växtdrycker, tofu, bladgrönt och små fiskar med ben. Målet ökar med åldern. Vi fyller på en låg dag med mat (t.ex. mjölk), aldrig en tablett.'
		}]
	},
	{
		id: 'micro-iron', section: 'nutrition', micro: 'iron_mg',
		title: { en: 'Iron', fi: 'Rauta', hu: 'Vas', sv: 'Järn' },
		body: [{
			en: 'Carries oxygen in the blood and supports energy and immunity. Found in red meat, poultry, fish, beans, lentils, tofu and fortified grains; vitamin C improves absorption from plants. The target is higher for menstruating women and in pregnancy, lower after menopause and for men.',
			fi: 'Kuljettaa happea veressä ja tukee energiaa ja vastustuskykyä. Lähteitä ovat punainen liha, siipikarja, kala, pavut, linssit, tofu ja täydennetyt viljat; C-vitamiini parantaa imeytymistä kasveista. Tavoite on suurempi kuukautisia saavilla naisilla ja raskaudessa, pienempi vaihdevuosien jälkeen ja miehillä.',
			hu: 'Oxigént szállít a vérben, és támogatja az energiát és az immunitást. Megtalálható vörös húsban, baromfiban, halban, babban, lencsében, tofuban és dúsított gabonákban; a C-vitamin javítja a növényi felszívódást. A cél magasabb menstruáló nőknél és terhességben, alacsonyabb a menopauza után és férfiaknál.',
			sv: 'Transporterar syre i blodet och stödjer energi och immunförsvar. Finns i rött kött, fågel, fisk, bönor, linser, tofu och berikade spannmål; C-vitamin förbättrar upptaget från växter. Målet är högre för menstruerande kvinnor och vid graviditet, lägre efter klimakteriet och för män.'
		}, {
			en: 'Reaching the higher target from food alone is hard, so if the week falls short an iron supplement is added by default. You can instead choose "Get iron from food, skip iron supplements" in the Food settings: the planner then works harder to pick iron-rich meals and never adds an iron pill. Iron supplements help many people but can be hard on the stomach for some (heartburn, nausea, constipation), which is why the choice is yours. General information, not medical advice.',
			fi: 'Korkeamman tavoitteen saavuttaminen pelkästä ruoasta on vaikeaa, joten jos viikko jää vajaaksi, rautalisä lisätään oletuksena. Voit valita Ruoka-asetuksista vaihtoehdon "Saa rauta ruoasta, ohita rautalisät": suunnittelija valitsee silloin tarkemmin rautapitoisia aterioita eikä koskaan lisää rautatablettia. Rautalisät auttavat monia, mutta voivat olla osalle raskaita vatsalle (närästys, pahoinvointi, ummetus), siksi valinta on sinun. Yleistä tietoa, ei lääketieteellistä neuvontaa.',
			hu: 'A magasabb célt pusztán ételből nehéz elérni, ezért ha a hét elmarad, alapértelmezetten vas-kiegészítő kerül hozzáadásra. Az Étel beállításoknál választhatod a "Vasat ételből, vas-kiegészítő nélkül" lehetőséget: ekkor a tervező vasban gazdagabb étkezéseket választ, és soha nem ad vastablettát. A vas-kiegészítők sokaknak segítenek, de egyeseknek megterhelik a gyomrot (gyomorégés, hányinger, székrekedés), ezért a döntés a tiéd. Általános információ, nem orvosi tanács.',
			sv: 'Att nå det högre målet enbart från mat är svårt, så om veckan blir för låg läggs ett järntillskott till som standard. Du kan istället välja "Få järn från maten, hoppa över järntillskott" i Mat-inställningarna: planeraren väljer då järnrikare måltider och lägger aldrig till en järntablett. Järntillskott hjälper många men kan vara jobbiga för magen för vissa (halsbränna, illamående, förstoppning), därför är valet ditt. Allmän information, inte medicinsk rådgivning.'
		}]
	},
	{
		id: 'micro-magnesium', section: 'nutrition', micro: 'magnesium_mg',
		title: { en: 'Magnesium', fi: 'Magnesium', hu: 'Magnézium', sv: 'Magnesium' },
		body: [{
			en: 'Supports hundreds of enzyme reactions, muscle and nerve function and bone. Found in nuts, seeds, whole grains, legumes and leafy greens. The target is a little higher for men.',
			fi: 'Tukee satoja entsyymireaktioita, lihasten ja hermojen toimintaa ja luustoa. Lähteitä ovat pähkinät, siemenet, täysjyvävilja, palkokasvit ja lehtivihannekset. Tavoite on hieman suurempi miehillä.',
			hu: 'Több száz enzimreakciót, az izom- és idegműködést és a csontokat támogatja. Megtalálható dióféékben, magvakban, teljes kiőrlésű gabonában, hüvelyesekben és leveles zöldekben. A cél férfiaknál kissé magasabb.',
			sv: 'Stödjer hundratals enzymreaktioner, muskel- och nervfunktion och skelett. Finns i nötter, frön, fullkorn, baljväxter och bladgrönt. Målet är något högre för män.'
		}]
	},
	{
		id: 'micro-zinc', section: 'nutrition', micro: 'zinc_mg',
		title: { en: 'Zinc', fi: 'Sinkki', hu: 'Cink', sv: 'Zink' },
		body: [{
			en: 'Supports immunity, wound healing and taste, and is needed for many enzymes. Found in meat, shellfish, seeds, nuts, legumes and whole grains. The target is a little higher for men.',
			fi: 'Tukee vastustuskykyä, haavojen paranemista ja makuaistia ja sitä tarvitaan moniin entsyymeihin. Lähteitä ovat liha, äyriäiset, siemenet, pähkinät, palkokasvit ja täysjyvävilja. Tavoite on hieman suurempi miehillä.',
			hu: 'Támogatja az immunitást, a sebgyógyulást és az ízérzékelést, és sok enzimhez szükséges. Megtalálható húsban, kagylókban, magvakban, dióféékben, hüvelyesekben és teljes kiőrlésű gabonában. A cél férfiaknál kissé magasabb.',
			sv: 'Stödjer immunförsvar, sårläkning och smak och behövs för många enzymer. Finns i kött, skaldjur, frön, nötter, baljväxter och fullkorn. Målet är något högre för män.'
		}]
	},
	{
		id: 'micro-vitamin-c', section: 'nutrition', micro: 'vitamin_c_mg',
		title: { en: 'Vitamin C', fi: 'C-vitamiini', hu: 'C-vitamin', sv: 'C-vitamin' },
		body: [{
			en: 'An antioxidant that supports immunity, collagen and iron absorption. Found in citrus, berries, peppers, kiwi and many vegetables. The target is a little higher for men and rises slightly in pregnancy.',
			fi: 'Antioksidantti, joka tukee vastustuskykyä, kollageenia ja raudan imeytymistä. Lähteitä ovat sitrushedelmät, marjat, paprika, kiivi ja monet kasvikset. Tavoite on hieman suurempi miehillä ja nousee hieman raskaudessa.',
			hu: 'Antioxidáns, amely támogatja az immunitást, a kollagént és a vasfelszívódást. Megtalálható citrusfélékben, bogyókban, paprikában, kiviben és sok zöldségben. A cél férfiaknál kissé magasabb, és terhességben kissé nő.',
			sv: 'En antioxidant som stödjer immunförsvar, kollagen och järnupptag. Finns i citrus, bär, paprika, kiwi och många grönsaker. Målet är något högre för män och stiger något vid graviditet.'
		}]
	},
	{
		id: 'micro-vitamin-d', section: 'nutrition', micro: 'vitamin_d_ug',
		title: { en: 'Vitamin D', fi: 'D-vitamiini', hu: 'D-vitamin', sv: 'D-vitamin' },
		body: [{
			en: 'Helps absorb calcium and supports bone, muscle and immunity. Made in the skin from sunlight and found in oily fish, egg yolk and fortified foods; intake matters in the dark Nordic winter. The target rises for adults over 70. Hard to get from food, so it is often the supplement that is added.',
			fi: 'Auttaa kalsiumin imeytymisessä ja tukee luustoa, lihaksia ja vastustuskykyä. Muodostuu iholla auringonvalosta ja sitä on rasvaisessa kalassa, kananmunan keltuaisessa ja täydennetyissä ruoissa; saanti on tärkeää pimeänä pohjoismaisena talvena. Tavoite nousee yli 70-vuotiailla. Vaikea saada ruoasta, joten se on usein lisätty lisäravinne.',
			hu: 'Segíti a kalcium felszívódását, és támogatja a csontokat, izmokat és immunitást. A bőrben napfényből keletkezik, és megtalálható zsíros halban, tojássárgájában és dúsított ételekben; a bevitel fontos a sötét északi télen. A cél 70 év felett nő. Ételből nehéz bevinni, ezért gyakran ez a hozzáadott kiegészítő.',
			sv: 'Hjälper till att ta upp kalcium och stödjer skelett, muskler och immunförsvar. Bildas i huden av solljus och finns i fet fisk, äggula och berikade livsmedel; intaget spelar roll under den mörka nordiska vintern. Målet stiger för vuxna över 70. Svårt att få från mat, så det är ofta tillskottet som läggs till.'
		}]
	},
	{
		id: 'micro-vitamin-b12', section: 'nutrition', micro: 'vitamin_b12_ug',
		title: { en: 'Vitamin B12', fi: 'B12-vitamiini', hu: 'B12-vitamin', sv: 'B12-vitamin' },
		body: [{
			en: 'Needed for red blood cells, nerves and DNA. Found almost only in animal foods (meat, fish, eggs, dairy) and fortified products, so a plant-based diet usually needs a supplement.',
			fi: 'Tarvitaan punasoluihin, hermoihin ja DNA:han. Sitä on lähes vain eläinperäisissä ruoissa (liha, kala, kananmuna, maitotuotteet) ja täydennetyissä tuotteissa, joten kasvispainotteinen ruokavalio tarvitsee yleensä lisäravinteen.',
			hu: 'Szükséges a vörösvérsejtekhez, idegekhez és a DNS-hez. Szinte csak állati eredetű ételekben (hús, hal, tojás, tejtermék) és dúsított termékekben található, ezért a növényi étrend általában kiegészítőt igényel.',
			sv: 'Behövs för röda blodkroppar, nerver och DNA. Finns nästan bara i animaliska livsmedel (kött, fisk, ägg, mejeri) och berikade produkter, så en växtbaserad kost behöver oftast ett tillskott.'
		}]
	},
	{
		id: 'micro-folate', section: 'nutrition', micro: 'folate_ug',
		title: { en: 'Folate', fi: 'Folaatti', hu: 'Folát', sv: 'Folat' },
		body: [{
			en: 'Needed for cell growth and forming blood; especially important before and during pregnancy. Found in leafy greens, legumes, citrus and fortified grains. The target rises in pregnancy.',
			fi: 'Tarvitaan solujen kasvuun ja veren muodostukseen; erityisen tärkeä ennen raskautta ja sen aikana. Lähteitä ovat lehtivihannekset, palkokasvit, sitrushedelmät ja täydennetyt viljat. Tavoite nousee raskaudessa.',
			hu: 'Szükséges a sejtnövekedéshez és a vérképzéshez; különösen fontos a terhesség előtt és alatt. Megtalálható leveles zöldekben, hüvelyesekben, citrusfélékben és dúsított gabonákban. A cél terhességben nő.',
			sv: 'Behövs för celltillväxt och blodbildning; särskilt viktigt före och under graviditet. Finns i bladgrönt, baljväxter, citrus och berikade spannmål. Målet stiger vid graviditet.'
		}]
	},
	{
		id: 'fibre-hydration', section: 'nutrition',
		title: { en: 'Fibre and hydration', fi: 'Kuitu ja nesteytys', hu: 'Rost és folyadékbevitel', sv: 'Fiber och vätska' },
		body: [{
			en: 'Fibre comes from whole grains, beans, lentils, vegetables and fruit and helps meals feel filling. Water needs rise with training, warm weather, pregnancy and breastfeeding - use the water target as a rough guide.',
			fi: 'Kuitua saa täysjyväviljasta, pavuista, linsseistä, vihanneksista ja hedelmistä, ja se auttaa aterioita tuntumaan kylläisiltä. Veden tarve kasvaa harjoittelun, lämpimän sään, raskauden ja imetyksen myötä - käytä vesitavoitetta karkeana ohjeena.',
			hu: 'A rost teljes kiőrlésű gabonából, babból, lencséből, zöldségből és gyümölcsből származik, és segít, hogy az étkezés jóllakató legyen. A vízigény nő az edzéssel, meleg időben, várandósság és szoptatás alatt - használd a vízcélt durva iránymutatásként.',
			sv: 'Fiber kommer från fullkorn, bönor, linser, grönsaker och frukt och hjälper måltider att kännas mättande. Vattenbehovet ökar med träning, varmt väder, graviditet och amning - använd vattenmålet som en grov vägledning.'
		}]
	},

	// --- Recipes, shopping and cooking for a group ---
	{
		id: 'find-recipe', section: 'recipes',
		title: { en: 'Find a recipe', fi: 'Etsi resepti', hu: 'Keress receptet', sv: 'Hitta ett recept' },
		body: [{
			en: 'On the Recipes page, search by name or by an ingredient, and filter by course, goal, diet, FODMAP level or a nutrient focus. You can also sort and show nutrition per serving or per 100 g.',
			fi: 'Reseptit-sivulla hae nimellä tai raaka-aineella ja suodata aterialajin, tavoitteen, ruokavalion, FODMAP-tason tai ravintopainotuksen mukaan. Voit myös lajitella ja näyttää ravintosisällön annosta tai 100 g kohti.',
			hu: 'A Receptek oldalon keress név vagy hozzávaló alapján, és szűrj fogás, cél, étrend, FODMAP-szint vagy tápanyag-hangsúly szerint. Rendezhetsz is, és megjelenítheted a tápértéket adagonként vagy 100 g-onként.',
			sv: 'På Recept-sidan söker du på namn eller ingrediens och filtrerar på maträtt, mål, kost, FODMAP-nivå eller näringsfokus. Du kan även sortera och visa näring per portion eller per 100 g.'
		}]
	},
	{
		id: 'scale-servings', section: 'recipes',
		title: { en: 'Scale servings', fi: 'Skaalaa annokset', hu: 'Adagok méretezése', sv: 'Skala portioner' },
		body: [{
			en: 'Use the servings stepper on a recipe to change how many portions you make; the ingredient amounts and the nutrition update with it.',
			fi: 'Käytä reseptin annossäädintä muuttaaksesi kuinka monta annosta teet; raaka-ainemäärät ja ravintosisältö päivittyvät sen mukana.',
			hu: 'Használd a recept adagválasztóját, hogy módosítsd, hány adagot készítesz; a hozzávalók mennyisége és a tápérték ezzel együtt frissül.',
			sv: 'Använd portionsväljaren på ett recept för att ändra hur många portioner du gör; ingrediensmängderna och näringen uppdateras med den.'
		}]
	},
	{
		id: 'household', section: 'recipes',
		title: { en: 'Cooking for more than one', fi: 'Useammalle kokkaaminen', hu: 'Főzés többeknek', sv: 'Matlagning för fler' },
		body: [{
			en: 'Add the people who eat with you under "Who else is eating" - as adults, teenagers or children. The plan and shopping list then scale up to feed everyone. On the weekly menu you can switch between "Per person" (one plate) and "Whole household"; the shopping list and recipe amounts are always for the whole household, with a note saying so.',
			fi: 'Lisää henkilöt jotka syövät kanssasi kohtaan "Ketkä muut syövät" - aikuisina, teineinä tai lapsina. Suunnitelma ja ostoslista skaalautuvat tällöin ruokkimaan kaikki. Viikkomenussa voit vaihtaa "Per henkilö" (yksi lautanen) ja "Koko ruokakunta" välillä; ostoslista ja reseptien määrät ovat aina koko ruokakunnalle, ja siitä on maininta.',
			hu: 'Add hozzá azokat, akik veled esznek, a "Ki más eszik" résznél - felnőttként, tinédzserként vagy gyerekként. A terv és a bevásárlólista ekkor felskáláz, hogy mindenkit ellásson. A heti menüben válthatsz a "Személyenként" (egy tányér) és a "Teljes háztartás" között; a bevásárlólista és a receptmennyiségek mindig az egész háztartásra vonatkoznak, erről egy megjegyzés tájékoztat.',
			sv: 'Lägg till personerna som äter med dig under "Vem mer äter" - som vuxna, tonåringar eller barn. Planen och inköpslistan skalas då upp för att mätta alla. På veckomenyn kan du växla mellan "Per person" (en tallrik) och "Hela hushållet"; inköpslistan och receptmängderna är alltid för hela hushållet, med en notering om det.'
		}]
	},
	{
		id: 'household-units', section: 'recipes',
		title: { en: 'Friendly amounts', fi: 'Kätevät määrät', hu: 'Barátságos mennyiségek', sv: 'Begripliga mängder' },
		body: [{
			en: 'Where it helps, amounts are shown as whole units (for example "2 pieces" or "1.5 tbsp") next to the grams, on recipes, the shopping list and the PDF.',
			fi: 'Silloin kun siitä on apua, määrät näytetään kokonaisina yksikköinä (esimerkiksi "2 kpl" tai "1,5 rkl") grammojen vieressä, resepteissä, ostoslistalla ja PDF:ssä.',
			hu: 'Ahol segít, a mennyiségek egész egységként jelennek meg (például "2 darab" vagy "1,5 evőkanál") a grammok mellett a recepteken, a bevásárlólistán és a PDF-ben.',
			sv: 'Där det hjälper visas mängder som hela enheter (till exempel "2 stycken" eller "1,5 msk") bredvid grammen, på recept, inköpslistan och PDF:en.'
		}]
	},
	{
		id: 'shopping', section: 'recipes',
		title: { en: 'Use the shopping list', fi: 'Käytä ostoslistaa', hu: 'Használd a bevásárlólistát', sv: 'Använd inköpslistan' },
		body: [{
			en: 'Open the shopping list from your meal plan. Items are combined across the week and grouped by aisle, and you can check them off as you shop. Your ticks are kept for that plan.',
			fi: 'Avaa ostoslista ateriasuunnitelmastasi. Tuotteet yhdistetään koko viikolta ja ryhmitellään hyllyalueittain, ja voit merkitä ne ostaessasi. Merkintäsi säilyvät kyseiselle suunnitelmalle.',
			hu: 'Nyisd meg a bevásárlólistát az étrendedből. A tételek a hét egészére összevonódnak és polconként csoportosulnak, és kipipálhatod őket vásárlás közben. A pipák megmaradnak az adott tervhez.',
			sv: 'Öppna inköpslistan från din meny. Varorna slås ihop över veckan och grupperas efter avdelning, och du kan bocka av dem medan du handlar. Dina bockar sparas för den planen.'
		}]
	},
	{
		id: 'print-pdf', section: 'recipes',
		title: { en: 'Print or save a PDF', fi: 'Tulosta tai tallenna PDF', hu: 'Nyomtatás vagy PDF mentése', sv: 'Skriv ut eller spara en PDF' },
		body: [{
			en: 'On a result, press Save as PDF (or Print) to get a clean printable handout. Both the workout and the nutrition plan offer a Compact or Full detail choice. Your optional name shows in the header if you added it in the profile.',
			fi: 'Tuloksessa paina Tallenna PDF (tai Tulosta) saadaksesi siistin tulostettavan oppaan. Sekä treeni että ateriasuunnitelma tarjoavat valinnan Tiivis tai Täysi taso. Valinnainen nimesi näkyy ylätunnisteessa, jos lisäsit sen profiiliin.',
			hu: 'Az eredménynél nyomd meg a PDF mentése (vagy Nyomtatás) gombot, hogy letisztult, nyomtatható összefoglalót kapj. Az edzés és az étrend is kínál Tömör vagy Részletes szint választást. A nem kötelező neved a fejlécben jelenik meg, ha megadtad a profilban.',
			sv: 'På ett resultat trycker du på Spara som PDF (eller Skriv ut) för ett rent utskrivbart underlag. Både träningen och måltidsplanen erbjuder ett val mellan Kompakt eller Fullständig detalj. Ditt valfria namn visas i sidhuvudet om du angav det i profilen.'
		}]
	},
	{
		id: 'gf-lf', section: 'recipes',
		title: { en: 'Gluten-free and lactose-free', fi: 'Gluteeniton ja laktoositon', hu: 'Gluténmentes és laktózmentes', sv: 'Glutenfri och laktosfri' },
		body: [{
			en: 'When you choose a gluten-free or lactose-free diet, the app keeps a dish whenever an everyday swap exists and simply labels the ingredient (gluten free) or (lactose-free), instead of hiding the recipe. Dishes with no workable swap are still left out.',
			fi: 'Kun valitset gluteenittoman tai laktoosittoman ruokavalion, sovellus säilyttää ruokalajin aina kun arkinen korvaaja löytyy ja merkitsee raaka-aineen yksinkertaisesti (gluteeniton) tai (laktoositon) sen sijaan että piilottaisi reseptin. Ruokalajit joille ei ole toimivaa vaihtoa jätetään silti pois.',
			hu: 'Ha gluténmentes vagy laktózmentes étrendet választasz, az alkalmazás megtartja az ételt, valahányszor van hétköznapi csere, és egyszerűen megjelöli a hozzávalót (gluténmentes) vagy (laktózmentes), ahelyett, hogy elrejtené a receptet. Azok az ételek, amelyekhez nincs működő csere, továbbra is kimaradnak.',
			sv: 'När du väljer en glutenfri eller laktosfri kost behåller appen en rätt så länge ett vardagligt byte finns och märker helt enkelt ingrediensen (glutenfri) eller (laktosfri), i stället för att dölja receptet. Rätter utan ett fungerande byte utelämnas fortfarande.'
		}]
	},

	// --- Supplements (neutral, no health claims) ---
	{
		id: 'supp-tier-a', section: 'supplements',
		title: { en: 'Evidence-based basics', fi: 'Näyttöön perustuvat perusasiat', hu: 'Bizonyítékokon alapuló alapok', sv: 'Evidensbaserade grunder' },
		body: [{
			en: 'A short list of supplements with reasonable evidence is shown below with typical amounts and plain notes. They are optional extras, never part of your generated plan, and food comes first.',
			fi: 'Alla on lyhyt lista lisäravinteista joilla on kohtuullista näyttöä, tyypillisine määrineen ja selkein huomioin. Ne ovat valinnaisia lisiä, eivät koskaan osa luotua ohjelmaasi, ja ruoka tulee ensin.',
			hu: 'Alább egy rövid lista azokról a kiegészítőkről, amelyeknek ésszerű bizonyítéka van, a szokásos mennyiségekkel és egyszerű megjegyzésekkel. Ezek opcionális extrák, sosem részei a létrehozott tervednek, és az étel az első.',
			sv: 'Nedan visas en kort lista över tillskott med rimligt stöd, med typiska mängder och enkla noteringar. De är valfria tillägg, aldrig en del av din genererade plan, och mat kommer först.'
		}]
	},
	{
		id: 'supp-tier-b', section: 'supplements',
		title: { en: 'Commonly discussed, not recommended', fi: 'Usein puhutut, ei suositella', hu: 'Gyakran emlegetett, nem ajánlott', sv: 'Ofta omtalade, rekommenderas inte' },
		body: [{
			en: 'Other popular supplements are listed with a short, neutral note on why they are not recommended here. No dosing is given for them.',
			fi: 'Muut suositut lisäravinteet on listattu lyhyellä, neutraalilla huomiolla siitä miksi niitä ei suositella tässä. Niille ei anneta annostusta.',
			hu: 'Más népszerű kiegészítők rövid, semleges megjegyzéssel szerepelnek arról, miért nem ajánlottak itt. Hozzájuk nincs adagolás megadva.',
			sv: 'Andra populära tillskott listas med en kort, neutral notering om varför de inte rekommenderas här. Ingen dosering anges för dem.'
		}]
	},

	// --- Safety and special situations ---
	{
		id: 'not-medical', section: 'safety',
		title: { en: 'Not medical advice', fi: 'Ei lääketieteellistä neuvontaa', hu: 'Nem orvosi tanács', sv: 'Inte medicinsk rådgivning' },
		body: [{
			en: 'Voimareitti is a general wellness tool for healthy adults. It does not diagnose, treat or give medical or dietary advice. For any medical condition, medication or specific dietary need, talk to a professional.',
			fi: 'Voimareitti on yleinen hyvinvointityökalu terveille aikuisille. Se ei diagnosoi, hoida tai anna lääketieteellistä tai ravitsemusneuvontaa. Minkä tahansa sairauden, lääkityksen tai erityisen ruokavaliotarpeen osalta käänny ammattilaisen puoleen.',
			hu: 'A Voimareitti egy általános egészségmegőrző eszköz egészséges felnőtteknek. Nem diagnosztizál, nem kezel és nem ad orvosi vagy táplálkozási tanácsot. Bármilyen betegség, gyógyszer vagy speciális étrendi igény esetén fordulj szakemberhez.',
			sv: 'Voimareitti är ett allmänt hälsoverktyg för friska vuxna. Det diagnostiserar inte, behandlar inte och ger inte medicinsk eller kostrådgivning. Vid sjukdom, medicinering eller särskilda kostbehov, tala med en yrkesperson.'
		}]
	},
	{
		id: 'breastfeeding', section: 'safety',
		title: { en: 'Breastfeeding', fi: 'Imetys', hu: 'Szoptatás', sv: 'Amning' },
		body: [{
			en: 'If you are breastfeeding, the planner adds some daily energy and water and never sets a weight-loss deficit. It is a personalization, not medical advice - check with your own midwife or doctor.',
			fi: 'Jos imetät, suunnittelija lisää hieman päivittäistä energiaa ja vettä eikä koskaan aseta laihdutusvajetta. Kyseessä on yksilöllistäminen, ei lääketieteellinen neuvo - tarkista omalta neuvolaltasi tai lääkäriltäsi.',
			hu: 'Ha szoptatsz, a tervező hozzáad némi napi energiát és vizet, és soha nem állít be fogyókúrás hiányt. Ez személyre szabás, nem orvosi tanács - egyeztess a saját védőnőddel vagy orvosoddal.',
			sv: 'Om du ammar lägger planeraren till lite daglig energi och vatten och sätter aldrig ett viktnedgångsunderskott. Det är en anpassning, inte medicinsk rådgivning - stäm av med din egen barnmorska eller läkare.'
		}]
	},
	{
		id: 'your-responsibility', section: 'safety',
		title: { en: 'Your own decision', fi: 'Sinun oma päätöksesi', hu: 'A te döntésed', sv: 'Ditt eget beslut' },
		body: [{
			en: 'This is an automatic tool, not personal advice. How you use the program is your own decision and responsibility. Listen to your body and stop if something hurts.',
			fi: 'Tämä on automaattinen työkalu, ei henkilökohtaista neuvontaa. Se miten käytät ohjelmaa on sinun oma päätöksesi ja vastuusi. Kuuntele kehoasi ja lopeta, jos jokin sattuu.',
			hu: 'Ez egy automatikus eszköz, nem személyes tanácsadás. Az, ahogyan a programot használod, a te döntésed és felelősséged. Figyelj a testedre, és hagyd abba, ha valami fáj.',
			sv: 'Detta är ett automatiskt verktyg, inte personlig rådgivning. Hur du använder programmet är ditt eget beslut och ansvar. Lyssna på kroppen och sluta om något gör ont.'
		}]
	},
	{
		id: 'allergens', section: 'safety',
		title: { en: 'Check allergens yourself', fi: 'Tarkista allergeenit itse', hu: 'Ellenőrizd az allergéneket magad', sv: 'Kontrollera allergener själv' },
		body: [{
			en: 'Nutrition values are approximate and depend on the exact products and portions you use. Always check allergens against the labels of the products in your own kitchen.',
			fi: 'Ravintoarvot ovat likimääräisiä ja riippuvat käyttämistäsi tarkoista tuotteista ja annoksista. Tarkista allergeenit aina omassa keittiössäsi olevien tuotteiden pakkausmerkinnöistä.',
			hu: 'A tápértékek hozzávetőlegesek, és az általad használt pontos termékektől és adagoktól függenek. Mindig ellenőrizd az allergéneket a saját konyhádban lévő termékek címkéi alapján.',
			sv: 'Näringsvärdena är ungefärliga och beror på de exakta produkterna och portionerna du använder. Kontrollera alltid allergener mot etiketterna på produkterna i ditt eget kök.'
		}]
	}
];

/** Lowercase + strip diacritics, so search is accent-insensitive (e.g. "vahemman" finds "vähemmän"). */
export function normalizeText(s: string): string {
	return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function entryHaystack(e: HelpEntry, lang: string): string {
	const parts = [L(e.title, lang), ...e.body.map((b) => L(b, lang))];
	if (e.keywords) parts.push(L(e.keywords, lang));
	return normalizeText(parts.join(' '));
}

/**
 * Pure, accent-insensitive subject search over the help entries in the active language. An empty query
 * returns all entries in their declared order; a multi-word query requires every term to match (AND).
 * Order is always the declared `helpEntries` order, so results are stable.
 */
export function searchHelp(query: string, lang: 'fi' | 'hu' | 'en' | 'sv'): HelpEntry[] {
	const q = normalizeText(query.trim());
	if (!q) return helpEntries;
	const terms = q.split(/\s+/).filter(Boolean);
	return helpEntries.filter((e) => {
		const hay = entryHaystack(e, lang);
		return terms.every((t) => hay.includes(t));
	});
}
