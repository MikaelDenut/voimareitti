// Extended upper-body exercise library for Voimareitti.
// Four languages on every customer-visible string: en + fi / hu / sv.
// These EXTEND the base library in ./data; ids here must not collide with it.
import type { Exercise, GoalFit } from './data';

const f = (s: number, h: number, fl: number, g: number): GoalFit => ({
	strength: s, hypertrophy: h, fatLoss: fl, general: g
});

export const moreExercisesUpper: Exercise[] = [
	// ---------- CHEST ----------
	{
		id: 'barbell-bench-press',
		name: { en: 'Barbell bench press', fi: 'Penkkipunnerrus tangolla', hu: 'Fekvenyomás rúddal', sv: 'Bänkpress med skivstång' },
		pattern: 'push-h', minTier: 5, experienceMin: 'intermediate', primary: ['Chest', 'Triceps', 'Front delts'],
		cue: { en: 'Lower to the chest, drive up and slightly back.', fi: 'Laske rinnalle, työnnä ylös ja hieman taakse.', hu: 'Engedd a mellkasra, nyomd fel és kissé hátra.', sv: 'Sänk mot bröstet, pressa upp och något bakåt.' },
		purpose: { en: 'The classic barbell press for chest and pressing strength.', fi: 'Klassinen tankopenkki rinnan ja työntövoiman kehittämiseen.', hu: 'A klasszikus rúddal végzett fekvenyomás a mellkasért és a tolóerőért.', sv: 'Den klassiska bänkpressen för bröst och presstyrka.' },
		setup: { en: 'Lie on the bench, eyes under the bar, shoulder blades pinched.', fi: 'Makaa penkillä, silmät tangon alla, lapaluut yhteen puristettuna.', hu: 'Feküdj a padra, szemed a rúd alatt, lapockák összehúzva.', sv: 'Ligg på bänken, ögonen under stången, skulderbladen ihopdragna.' },
		mistakes: { en: 'Bouncing off the chest or flaring the elbows wide.', fi: 'Pomputus rinnasta tai kyynärpäiden levittäminen liian leveälle.', hu: 'Megpattintod a rudat a mellkason, vagy szélesre kinyitod a könyököd.', sv: 'Att studsa stången mot bröstet eller flänga ut armbågarna brett.' },
		easier: { en: 'Use dumbbells or lighter weight with a spotter.', fi: 'Käytä käsipainoja tai kevyempää painoa avustajan kanssa.', hu: 'Használj kézisúlyzókat vagy könnyebb súlyt segítővel.', sv: 'Använd hantlar eller lättare vikt med en passare.' },
		harder: { en: 'Add a pause on the chest or increase the load.', fi: 'Lisää tauko rinnalle tai kasvata kuormaa.', hu: 'Tarts szünetet a mellkason, vagy növeld a terhelést.', sv: 'Lägg till en paus vid bröstet eller öka belastningen.' },
		safety: { en: 'Use a rack or spotter; never train heavy to failure alone.', fi: 'Käytä telinettä tai avustajaa; älä treenaa raskaasti uupumukseen yksin.', hu: 'Használj állványt vagy segítőt; soha ne edz egyedül nehéz súllyal a kifáradásig.', sv: 'Använd ställning eller passare; träna aldrig tungt till utmattning ensam.' },
		fit: f(3, 3, 2, 2)
	},
	{
		id: 'incline-dumbbell-press',
		name: { en: 'Incline dumbbell press', fi: 'Vinopenkkipunnerrus käsipainoilla', hu: 'Ferdepados nyomás kézisúlyzóval', sv: 'Lutande hantelpress' },
		pattern: 'push-h', minTier: 4, experienceMin: 'beginner', primary: ['Chest', 'Front delts', 'Triceps'],
		cue: { en: 'Press the dumbbells up and together over the upper chest.', fi: 'Työnnä käsipainot ylös ja yhteen ylärinnan päälle.', hu: 'Nyomd a súlyzókat felfelé és össze a felső mellkas fölött.', sv: 'Pressa hantlarna upp och ihop över övre bröstet.' },
		purpose: { en: 'Targets the upper chest and front shoulders on an inclined bench.', fi: 'Kohdistuu ylärintaan ja etuolkapäihin vinopenkillä.', hu: 'A felső mellet és a mellső vállat célozza ferde padon.', sv: 'Träffar övre bröstet och främre axeln på en lutande bänk.' },
		setup: { en: 'Set the bench to about 30 degrees, dumbbells at chest level.', fi: 'Säädä penkki noin 30 asteeseen, käsipainot rinnan korkeudelle.', hu: 'Állítsd a padot körülbelül 30 fokra, kézisúlyzók mellkasmagasságban.', sv: 'Ställ bänken till cirka 30 grader, hantlarna i brösthöjd.' },
		mistakes: { en: 'Setting the incline too steep so it becomes a shoulder press.', fi: 'Liian jyrkkä kulma, jolloin liike muuttuu olkapääpunnerrukseksi.', hu: 'Túl meredekre állítod a dőlésszöget, így vállnyomássá válik.', sv: 'Att ställa lutningen för brant så att det blir en axelpress.' },
		easier: { en: 'Lower the incline angle or use lighter dumbbells.', fi: 'Loivenna kulmaa tai käytä kevyempiä käsipainoja.', hu: 'Csökkentsd a dőlésszöget, vagy használj könnyebb kézisúlyzókat.', sv: 'Sänk lutningsvinkeln eller använd lättare hantlar.' },
		harder: { en: 'Slow the lowering phase or add weight.', fi: 'Hidasta laskuvaihetta tai lisää painoa.', hu: 'Lassítsd az ereszkedő szakaszt, vagy adj hozzá súlyt.', sv: 'Sänk dig långsammare eller öka vikten.' },
		fit: f(2, 3, 2, 2)
	},
	{
		id: 'incline-pushup',
		name: { en: 'Incline pushup', fi: 'Vinopunnerrus', hu: 'Megemelt fekvőtámasz', sv: 'Lutande armhävning' },
		pattern: 'push-h', minTier: 1, experienceMin: 'beginner', primary: ['Chest', 'Triceps', 'Front delts'],
		cue: { en: 'Hands on a raised surface, lower the chest under control.', fi: 'Kädet korokkeella, laske rinta hallitusti.', hu: 'Kezek emelt felületen, engedd a mellkast kontrolláltan.', sv: 'Händer på upphöjd yta, sänk bröstet kontrollerat.' },
		purpose: { en: 'An easier pushup variation using a raised surface to reduce load.', fi: 'Helpompi punnerrusversio, jossa koroke keventää kuormaa.', hu: 'Könnyebb fekvőtámasz-változat, amely megemelt felülettel csökkenti a terhelést.', sv: 'En lättare armhävningsvariant där en förhöjd yta minskar belastningen.' },
		setup: { en: 'Hands on a sturdy table or bench, body in a straight line.', fi: 'Kädet tukevalla pöydällä tai penkillä, vartalo suorana.', hu: 'Kezek egy stabil asztalon vagy padon, test egyenes vonalban.', sv: 'Händerna på ett stadigt bord eller en bänk, kroppen i en rak linje.' },
		mistakes: { en: 'Letting the hips sag or flaring the elbows out.', fi: 'Lantion roikkuminen tai kyynärpäiden levittäminen sivuille.', hu: 'Leesik a csípő, vagy oldalra kinyitod a könyököd.', sv: 'Att låta höften hänga eller flänga ut armbågarna.' },
		easier: { en: 'Use a higher surface such as a kitchen counter.', fi: 'Käytä korkeampaa pintaa, kuten keittiötasoa.', hu: 'Használj magasabb felületet, például konyhapultot.', sv: 'Använd en högre yta, till exempel en köksbänk.' },
		harder: { en: 'Use a lower surface or move to floor pushups.', fi: 'Käytä matalampaa pintaa tai siirry lattiapunnerruksiin.', hu: 'Használj alacsonyabb felületet, vagy válts padlós fekvőtámaszra.', sv: 'Använd en lägre yta eller gå över till armhävningar på golvet.' },
		fit: f(1, 2, 3, 3)
	},
	{
		id: 'chest-dip',
		name: { en: 'Chest dip', fi: 'Dippi rinnalle', hu: 'Tolódzkodás mellre', sv: 'Dips för bröst' },
		pattern: 'push-h', minTier: 3, experienceMin: 'intermediate', primary: ['Chest', 'Triceps', 'Front delts'],
		cue: { en: 'Lean forward, lower until the shoulders are below the elbows.', fi: 'Nojaa eteen, laskeudu kunnes olkapäät ovat kyynärpäiden alapuolella.', hu: 'Dőlj előre, engedj le, amíg a váll a könyök alá kerül.', sv: 'Luta dig framåt, sänk tills axlarna är under armbågarna.' },
		purpose: { en: 'A bodyweight push that loads the lower chest and triceps hard.', fi: 'Kehonpainoliike, joka kuormittaa alarintaa ja ojentajia voimakkaasti.', hu: 'Saját testsúlyos toló gyakorlat, amely keményen terheli az alsó mellet és a tricepszet.', sv: 'En kroppsviktspress som belastar nedre bröstet och triceps hårt.' },
		setup: { en: 'Grip parallel bars, lean the torso forward, knees bent.', fi: 'Tartu rinnakkaistankoihin, kallista ylävartaloa eteen, polvet koukussa.', hu: 'Fogd meg a párhuzamos korlátokat, döntsd előre a törzsed, térdek behajlítva.', sv: 'Greppa parallellbarrarna, luta överkroppen framåt, böjda knän.' },
		mistakes: { en: 'Dipping too shallow or shrugging the shoulders up.', fi: 'Liian matala liikerata tai olkapäiden kohottaminen.', hu: 'Túl sekélyen ereszkedsz, vagy felhúzod a vállad.', sv: 'Att dippa för grunt eller dra upp axlarna.' },
		easier: { en: 'Use an assisted dip machine or a band for support.', fi: 'Käytä avustettua dippilaitetta tai kuminauhaa tueksi.', hu: 'Használj segített tolódzógépet vagy gumiszalagot a támaszhoz.', sv: 'Använd en assisterad dipmaskin eller ett band som stöd.' },
		harder: { en: 'Add weight with a belt or slow the lowering.', fi: 'Lisää painoa vyöllä tai hidasta laskuvaihetta.', hu: 'Adj hozzá súlyt övvel, vagy lassítsd az ereszkedést.', sv: 'Lägg till vikt med ett bälte eller sänk dig långsammare.' },
		safety: { en: 'Avoid sinking too deep if it strains the shoulders.', fi: 'Vältä liian syvää laskua, jos se rasittaa olkapäitä.', hu: 'Kerüld a túl mély ereszkedést, ha megterheli a vállad.', sv: 'Undvik att sänka dig för djupt om det belastar axlarna.' },
		fit: f(2, 3, 2, 2)
	},
	{
		id: 'dumbbell-fly',
		name: { en: 'Dumbbell fly', fi: 'Vipunostot makuulla', hu: 'Tárogatás kézisúlyzóval', sv: 'Hantelflyes' },
		pattern: 'push-h', minTier: 4, experienceMin: 'beginner', primary: ['Chest', 'Front delts'],
		cue: { en: 'Open the arms in a wide arc, slight bend in the elbows.', fi: 'Avaa kädet leveään kaareen, kyynärpäissä kevyt koukku.', hu: 'Nyisd a karokat széles ívben, könyök enyhén hajlítva.', sv: 'Öppna armarna i en vid båge, lätt böj i armbågarna.' },
		purpose: { en: 'An isolation move that stretches and squeezes the chest.', fi: 'Eristävä liike, joka venyttää ja puristaa rintaa.', hu: 'Izolációs gyakorlat, amely megnyújtja és összehúzza a mellet.', sv: 'En isolationsövning som tänjer och klämmer ihop bröstet.' },
		setup: { en: 'Lie on a bench, dumbbells above the chest, palms facing in.', fi: 'Makaa penkillä, käsipainot rinnan yllä, kämmenet sisäänpäin.', hu: 'Feküdj a padra, kézisúlyzók a mellkas felett, tenyerek befelé.', sv: 'Ligg på en bänk, hantlarna över bröstet, handflatorna inåt.' },
		mistakes: { en: 'Bending the elbows too much so it turns into a press.', fi: 'Kyynärpäiden liiallinen koukistaminen, jolloin liike muuttuu punnerrukseksi.', hu: 'Túlságosan behajlítod a könyököd, így nyomássá válik.', sv: 'Att böja armbågarna för mycket så att det blir en press.' },
		easier: { en: 'Use lighter dumbbells and a shorter range.', fi: 'Käytä kevyempiä käsipainoja ja lyhyempää liikerataa.', hu: 'Használj könnyebb kézisúlyzókat és rövidebb mozgástartományt.', sv: 'Använd lättare hantlar och kortare rörelseomfång.' },
		harder: { en: 'Add a pause at the stretched position.', fi: 'Lisää tauko venytetyssä asennossa.', hu: 'Tarts szünetet a megnyújtott helyzetben.', sv: 'Lägg till en paus i det tänjda läget.' },
		safety: { en: 'Do not overstretch at the bottom to protect the shoulders.', fi: 'Älä yliveny ala-asennossa olkapäiden suojaamiseksi.', hu: 'Ne nyújtsd túl a mélyponton, hogy védd a vállad.', sv: 'Tänj inte ut för långt i botten för att skydda axlarna.' },
		fit: f(1, 3, 2, 1)
	},
	{
		id: 'cable-crossover',
		name: { en: 'Cable crossover', fi: 'Taljaristikko', hu: 'Kábeles keresztezés', sv: 'Kabelkryss' },
		pattern: 'push-h', minTier: 5, experienceMin: 'intermediate', primary: ['Chest', 'Front delts'],
		cue: { en: 'Pull the handles down and together in front of the chest.', fi: 'Vedä kahvat alas ja yhteen rinnan eteen.', hu: 'Húzd a fogantyúkat le és össze a mellkas elé.', sv: 'Dra handtagen ner och ihop framför bröstet.' },
		purpose: { en: 'Cable isolation that keeps tension on the chest throughout.', fi: 'Talja-eristys, joka pitää jännityksen rinnalla koko liikkeen ajan.', hu: 'Kábeles izolációs gyakorlat, amely végig feszesen tartja a mellizmot.', sv: 'Kabelisolation som håller spänning på bröstet hela vägen.' },
		setup: { en: 'Set pulleys high, grab a handle in each hand, step forward.', fi: 'Aseta taljat ylös, ota kahva kumpaankin käteen, astu eteen.', hu: 'Állítsd a csigákat magasra, fogj egy-egy fogantyút, lépj előre.', sv: 'Ställ blocken högt, ta ett handtag i varje hand, kliv fram.' },
		mistakes: { en: 'Using the arms instead of squeezing the chest together.', fi: 'Vedon tekeminen käsillä rinnan puristamisen sijaan.', hu: 'A karoddal húzol a mellizom összehúzása helyett.', sv: 'Att använda armarna i stället för att klämma ihop bröstet.' },
		easier: { en: 'Lower the weight and shorten the range slightly.', fi: 'Laske paino ja lyhennä liikerataa hieman.', hu: 'Csökkentsd a súlyt, és rövidítsd kissé a mozgástartományt.', sv: 'Sänk vikten och korta rörelseomfånget något.' },
		harder: { en: 'Pause at the contracted position each rep.', fi: 'Pidä tauko supistuneessa asennossa joka toistolla.', hu: 'Tarts szünetet az összehúzott helyzetben minden ismétlésnél.', sv: 'Pausa i det hopdragna läget på varje repetition.' },
		fit: f(1, 3, 2, 1)
	},
	{
		id: 'machine-chest-press',
		name: { en: 'Machine chest press', fi: 'Rintaprässi laitteessa', hu: 'Gépi mellnyomás', sv: 'Bröstpress i maskin' },
		pattern: 'push-h', minTier: 5, experienceMin: 'beginner', primary: ['Chest', 'Triceps', 'Front delts'],
		cue: { en: 'Press the handles forward, control them back to the chest.', fi: 'Työnnä kahvat eteen, palauta hallitusti rinnalle.', hu: 'Nyomd a fogantyúkat előre, vezesd vissza a mellkashoz.', sv: 'Pressa handtagen framåt, för dem kontrollerat tillbaka.' },
		purpose: { en: 'A guided chest press that is easy to learn and load safely.', fi: 'Ohjattu rintaprässi, joka on helppo oppia ja kuormittaa turvallisesti.', hu: 'Vezetett mellnyomás, amelyet könnyű megtanulni és biztonságosan terhelni.', sv: 'En styrd bröstpress som är lätt att lära sig och belasta säkert.' },
		setup: { en: 'Adjust the seat so the handles line up with mid-chest.', fi: 'Säädä istuin niin, että kahvat ovat rinnan keskikorkeudella.', hu: 'Állítsd be az ülést úgy, hogy a fogantyúk a mellkas közepéhez igazodjanak.', sv: 'Justera sätet så att handtagen ligger i linje med mitten av bröstet.' },
		mistakes: { en: 'Setting the seat too high or too low for the chest line.', fi: 'Istuin liian ylhäällä tai alhaalla rinnan linjaan nähden.', hu: 'Túl magasra vagy alacsonyra állítod az ülést a mellkasvonalhoz képest.', sv: 'Att ställa sätet för högt eller för lågt mot bröstlinjen.' },
		easier: { en: 'Reduce the weight and use a comfortable range.', fi: 'Vähennä painoa ja käytä mukavaa liikerataa.', hu: 'Csökkentsd a súlyt, és használj kényelmes mozgástartományt.', sv: 'Minska vikten och använd ett bekvämt rörelseomfång.' },
		harder: { en: 'Increase the load or slow the return phase.', fi: 'Kasvata kuormaa tai hidasta palautusvaihetta.', hu: 'Növeld a terhelést, vagy lassítsd a visszatérő szakaszt.', sv: 'Öka belastningen eller bromsa returfasen.' },
		fit: f(2, 3, 2, 2)
	},

	// ---------- BACK ----------
	{
		id: 'pull-up',
		name: { en: 'Pull-up', fi: 'Leuanveto myötäotteella', hu: 'Húzódzkodás', sv: 'Pull-up' },
		pattern: 'pull-v', minTier: 3, experienceMin: 'advanced', primary: ['Lats', 'Back', 'Biceps'],
		cue: { en: 'Pull the chest toward the bar, drive the elbows down.', fi: 'Vedä rinta tankoa kohti, työnnä kyynärpäät alas.', hu: 'Húzd a mellkast a rúd felé, könyököket lefelé.', sv: 'Dra bröstet mot stången, för armbågarna nedåt.' },
		purpose: { en: 'The benchmark vertical pull for back and lat strength.', fi: 'Pystyvedon perusmittari selän ja leveän selkälihaksen voimalle.', hu: 'A függőleges húzás etalonja a hát és a széles hátizom erejéért.', sv: 'Riktmärket för vertikalt drag för rygg- och latsstyrka.' },
		setup: { en: 'Grip the bar overhand slightly wider than shoulders.', fi: 'Ota tangosta myötäote hieman hartioita leveämmältä.', hu: 'Fogd meg a rudat felső fogással, a vállnál kissé szélesebben.', sv: 'Greppa stången med överhandsgrepp, något bredare än axlarna.' },
		mistakes: { en: 'Swinging the body or only doing half reps.', fi: 'Vartalon heiluttaminen tai vain puolittaisten toistojen tekeminen.', hu: 'Lengeted a tested, vagy csak fél ismétléseket csinálsz.', sv: 'Att svinga kroppen eller bara göra halva repetitioner.' },
		easier: { en: 'Use a band, an assisted machine, or do negatives.', fi: 'Käytä kuminauhaa, avustettua laitetta tai tee negatiivisia.', hu: 'Használj gumiszalagot, segített gépet, vagy csinálj negatívokat.', sv: 'Använd ett band, en assisterad maskin eller gör negativa.' },
		harder: { en: 'Add weight with a belt or pause at the top.', fi: 'Lisää painoa vyöllä tai pidä tauko yläasennossa.', hu: 'Adj hozzá súlyt övvel, vagy tarts szünetet a felső ponton.', sv: 'Lägg till vikt med ett bälte eller pausa i toppen.' },
		fit: f(3, 3, 2, 2)
	},
	{
		id: 'chin-up',
		name: { en: 'Chin-up', fi: 'Leuanveto vastaotteella', hu: 'Húzódzkodás alsó fogással', sv: 'Chin-up' },
		pattern: 'pull-v', minTier: 3, experienceMin: 'advanced', primary: ['Lats', 'Biceps', 'Back'],
		cue: { en: 'Underhand grip, pull the chin over the bar.', fi: 'Vastaote, vedä leuka tangon yli.', hu: 'Alsó fogás, húzd az állat a rúd fölé.', sv: 'Underhandsgrepp, dra hakan över stången.' },
		purpose: { en: 'An underhand pull-up that hits the biceps and lats hard.', fi: 'Vastaotteen leuanveto, joka kuormittaa hauista ja leveää selkälihasta.', hu: 'Alsó fogású húzódzkodás, amely keményen terheli a bicepszet és a széles hátizmot.', sv: 'Ett räckhäv med underhandsgrepp som träffar biceps och lats hårt.' },
		setup: { en: 'Grip the bar underhand at shoulder width, hang fully.', fi: 'Ota tangosta vastaote hartioiden leveydeltä, riipu täysin.', hu: 'Fogd meg a rudat alsó fogással vállszélességben, lógj le teljesen.', sv: 'Greppa stången underhand i axelbredd, häng helt utsträckt.' },
		mistakes: { en: 'Kipping or failing to lower all the way down.', fi: 'Heilautus tai liikkeen jättäminen kesken ala-asennossa.', hu: 'Lendítesz, vagy nem ereszkedsz le egészen.', sv: 'Att kippa eller inte sänka hela vägen ner.' },
		easier: { en: 'Use a band or assisted machine for support.', fi: 'Käytä kuminauhaa tai avustettua laitetta tueksi.', hu: 'Használj gumiszalagot vagy segített gépet a támaszhoz.', sv: 'Använd ett band eller en assisterad maskin som stöd.' },
		harder: { en: 'Add weight or slow each lowering phase.', fi: 'Lisää painoa tai hidasta jokaista laskuvaihetta.', hu: 'Adj hozzá súlyt, vagy lassítsd minden ereszkedő szakaszt.', sv: 'Lägg till vikt eller sänk varje fas långsammare.' },
		fit: f(3, 3, 2, 2)
	},
	{
		id: 'lat-pulldown',
		name: { en: 'Lat pulldown', fi: 'Ylätalja', hu: 'Felső csiga lehúzás', sv: 'Latsdrag' },
		pattern: 'pull-v', minTier: 5, experienceMin: 'beginner', primary: ['Lats', 'Back', 'Biceps'],
		cue: { en: 'Pull the bar to the upper chest, elbows down and back.', fi: 'Vedä tanko ylärinnalle, kyynärpäät alas ja taakse.', hu: 'Húzd a rudat a felső mellkashoz, könyökök le és hátra.', sv: 'Dra stången mot övre bröstet, armbågar ner och bak.' },
		purpose: { en: 'A machine vertical pull that builds the lats with scalable load.', fi: 'Laitepystyveto, joka kehittää leveää selkälihasta säädettävällä kuormalla.', hu: 'Gépes függőleges húzás, amely állítható terheléssel fejleszti a széles hátizmot.', sv: 'Ett vertikalt drag i maskin som bygger lats med justerbar belastning.' },
		setup: { en: 'Set the thigh pad, grip the bar wider than shoulders.', fi: 'Säädä reisituki, ota tangosta hartioita leveämpi ote.', hu: 'Állítsd be a combpárnát, fogd meg a rudat a vállnál szélesebben.', sv: 'Ställ lårstödet, greppa stången bredare än axlarna.' },
		mistakes: { en: 'Leaning back too far or pulling behind the neck.', fi: 'Liiallinen taaksenojaus tai vetäminen niskan taakse.', hu: 'Túlságosan hátradőlsz, vagy a tarkó mögé húzol.', sv: 'Att luta dig för långt bakåt eller dra bakom nacken.' },
		easier: { en: 'Lower the weight and focus on a full range.', fi: 'Laske paino ja keskity täyteen liikerataan.', hu: 'Csökkentsd a súlyt, és koncentrálj a teljes mozgástartományra.', sv: 'Sänk vikten och fokusera på fullt rörelseomfång.' },
		harder: { en: 'Increase the load or pause at the bottom.', fi: 'Kasvata kuormaa tai pidä tauko ala-asennossa.', hu: 'Növeld a terhelést, vagy tarts szünetet a mélyponton.', sv: 'Öka belastningen eller pausa i botten.' },
		fit: f(2, 3, 2, 2)
	},
	{
		id: 'barbell-bent-over-row',
		name: { en: 'Barbell bent-over row', fi: 'Kulmasoutu tangolla', hu: 'Hajolt evezés rúddal', sv: 'Skivstångsrodd' },
		pattern: 'pull-h', minTier: 5, experienceMin: 'intermediate', primary: ['Back', 'Lats', 'Rhomboids'],
		cue: { en: 'Hinge forward, row the bar to the lower ribs.', fi: 'Taivuta lantiosta, souda tanko alakylkiluille.', hu: 'Dőlj előre csípőből, húzd a rudat az alsó bordákhoz.', sv: 'Fäll fram från höften, ro stången mot nedre revbenen.' },
		purpose: { en: 'A heavy horizontal pull for overall back thickness.', fi: 'Raskas vaakaveto koko selän paksuuden kehittämiseen.', hu: 'Nehéz vízszintes húzás a hát általános vastagságáért.', sv: 'Ett tungt horisontellt drag för tjocklek i hela ryggen.' },
		setup: { en: 'Hinge at the hips, flat back, bar hanging at arms length.', fi: 'Taivuta lantiosta, selkä suorana, tanko riippuu käsien varassa.', hu: 'Hajolj előre a csípőből, egyenes hát, a rúd a karod hosszában lóg.', sv: 'Fäll i höften, rak rygg, stången hänger med raka armar.' },
		mistakes: { en: 'Rounding the back or jerking the weight up.', fi: 'Selän pyöristäminen tai painon nykiminen ylös.', hu: 'Lekerekíted a hátad, vagy felrántod a súlyt.', sv: 'Att runda ryggen eller rycka upp vikten.' },
		easier: { en: 'Use lighter weight or a chest-supported row.', fi: 'Käytä kevyempää painoa tai rintatuettua soutua.', hu: 'Használj könnyebb súlyt vagy mellkassal megtámasztott evezést.', sv: 'Använd lättare vikt eller en bröststödd rodd.' },
		harder: { en: 'Add weight or pause the bar at the ribs.', fi: 'Lisää painoa tai pidä tauko kylkiluiden kohdalla.', hu: 'Adj hozzá súlyt, vagy tarts szünetet a rúddal a bordáidnál.', sv: 'Lägg till vikt eller pausa stången vid revbenen.' },
		safety: { en: 'Keep the back flat; a rounded spine under load risks injury.', fi: 'Pidä selkä suorana; pyöristynyt selkäranka kuorman alla on riski.', hu: 'Tartsd egyenesen a hátad; a terhelés alatt domborodó gerinc sérülésveszélyes.', sv: 'Håll ryggen rak; en rundad ryggrad under belastning är en skaderisk.' },
		fit: f(3, 3, 2, 2)
	},
	{
		id: 'seated-cable-row',
		name: { en: 'Seated cable row', fi: 'Alataljasoutu', hu: 'Ülő kábeles evezés', sv: 'Sittande kabelrodd' },
		pattern: 'pull-h', minTier: 5, experienceMin: 'beginner', primary: ['Back', 'Lats', 'Rhomboids'],
		cue: { en: 'Pull the handle to the stomach, squeeze the shoulder blades.', fi: 'Vedä kahva vatsalle, purista lapaluut yhteen.', hu: 'Húzd a fogantyút a hashoz, szorítsd össze a lapockákat.', sv: 'Dra handtaget mot magen, kläm ihop skulderbladen.' },
		purpose: { en: 'A controlled horizontal pull that builds mid-back thickness.', fi: 'Hallittu vaakaveto, joka kehittää keskiselän paksuutta.', hu: 'Kontrollált vízszintes húzás, amely fejleszti a középső hát vastagságát.', sv: 'Ett kontrollerat horisontellt drag som bygger tjocklek i mitten av ryggen.' },
		setup: { en: 'Sit upright, feet on the plate, slight bend at the knees.', fi: 'Istu suorassa, jalat tuella, polvissa kevyt koukku.', hu: 'Ülj egyenesen, talp a támaszon, térdek enyhén behajlítva.', sv: 'Sitt upprätt, fötterna mot plattan, lätt böjda knän.' },
		mistakes: { en: 'Leaning far back or rounding the shoulders forward.', fi: 'Liiallinen taaksenojaus tai olkapäiden pyöristäminen eteen.', hu: 'Túlságosan hátradőlsz, vagy előre lekerekíted a vállad.', sv: 'Att luta dig långt bakåt eller runda axlarna framåt.' },
		easier: { en: 'Lower the weight and keep the torso still.', fi: 'Laske paino ja pidä ylävartalo paikallaan.', hu: 'Csökkentsd a súlyt, és tartsd mozdulatlanul a törzsed.', sv: 'Sänk vikten och håll överkroppen stilla.' },
		harder: { en: 'Increase the load or pause at full contraction.', fi: 'Kasvata kuormaa tai pidä tauko täydessä supistuksessa.', hu: 'Növeld a terhelést, vagy tarts szünetet a teljes összehúzásnál.', sv: 'Öka belastningen eller pausa i fullt hopdraget läge.' },
		fit: f(2, 3, 2, 2)
	},
	{
		id: 'straight-arm-pulldown',
		name: { en: 'Straight-arm pulldown', fi: 'Suoran käden ylätalja', hu: 'Nyújtott karú lehúzás', sv: 'Rak arm-pulldown' },
		pattern: 'pull-h', minTier: 5, experienceMin: 'beginner', primary: ['Lats', 'Back'],
		cue: { en: 'Keep arms straight, pull the bar down to the thighs.', fi: 'Pidä kädet suorina, vedä tanko alas reisille.', hu: 'Tartsd a kart nyújtva, húzd a rudat le a combhoz.', sv: 'Håll armarna raka, dra stången ner mot låren.' },
		purpose: { en: 'A lat isolation that teaches the pull without the biceps.', fi: 'Leveän selkälihaksen eristys, joka opettaa vedon ilman hauista.', hu: 'Széleshátizom-izoláció, amely a biceps nélkül tanítja a húzást.', sv: 'En latsisolation som lär ut draget utan biceps.' },
		setup: { en: 'Stand at a high pulley, grip a straight bar, lean slightly.', fi: 'Seiso ylätaljalla, ota suorasta tangosta, nojaa hieman eteen.', hu: 'Állj egy felső csigához, fogj meg egy egyenes rudat, dőlj kissé előre.', sv: 'Stå vid ett högt block, greppa en rak stång, luta dig lätt framåt.' },
		mistakes: { en: 'Bending the elbows so it becomes a pulldown.', fi: 'Kyynärpäiden koukistaminen, jolloin liike muuttuu ylätaljaksi.', hu: 'Behajlítod a könyököd, így lehúzássá válik.', sv: 'Att böja armbågarna så att det blir en latsdragning.' },
		easier: { en: 'Lower the weight and use a shorter arc.', fi: 'Laske paino ja käytä lyhyempää kaarta.', hu: 'Csökkentsd a súlyt, és használj rövidebb ívet.', sv: 'Sänk vikten och använd en kortare båge.' },
		harder: { en: 'Pause at the bottom and squeeze the lats.', fi: 'Pidä tauko ala-asennossa ja purista leveää selkälihasta.', hu: 'Tarts szünetet a mélyponton, és húzd össze a széles hátizmot.', sv: 'Pausa i botten och kläm ihop latsen.' },
		fit: f(1, 2, 2, 1)
	},
	{
		id: 'face-pull',
		name: { en: 'Face pull', fi: 'Face pull', hu: 'Arcig húzás', sv: 'Face pull' },
		pattern: 'pull-h', minTier: 5, experienceMin: 'beginner', primary: ['Rear delts', 'Traps', 'Rhomboids'],
		cue: { en: 'Pull the rope toward the face, elbows high and wide.', fi: 'Vedä naru kasvoja kohti, kyynärpäät ylhäällä ja leveällä.', hu: 'Húzd a kötelet az arc felé, könyökök fent és szét.', sv: 'Dra repet mot ansiktet, armbågar högt och brett.' },
		purpose: { en: 'Strengthens the rear delts and upper back for shoulder health.', fi: 'Vahvistaa takaolkapäitä ja yläselkää olkapäiden hyvinvoinniksi.', hu: 'Erősíti a hátsó deltákat és a felső hátat a vállak egészségéért.', sv: 'Stärker bakre axeln och övre ryggen för friska axlar.' },
		setup: { en: 'Set a rope at face height, step back to take tension.', fi: 'Aseta naru kasvojen korkeudelle, astu taakse jännitykseen.', hu: 'Állíts egy kötelet arcmagasságba, lépj hátra a feszesség eléréséhez.', sv: 'Ställ ett rep i ansiktshöjd, kliv bakåt för att ta upp spänning.' },
		mistakes: { en: 'Letting the elbows drop or using too much weight.', fi: 'Kyynärpäiden tippuminen tai liian suuri paino.', hu: 'Leejted a könyököd, vagy túl nagy súlyt használsz.', sv: 'Att låta armbågarna falla eller använda för mycket vikt.' },
		easier: { en: 'Use a band anchored at face height instead.', fi: 'Käytä kasvojen korkeudelle kiinnitettyä kuminauhaa.', hu: 'Használj inkább arcmagasságba rögzített gumiszalagot.', sv: 'Använd i stället ett band förankrat i ansiktshöjd.' },
		harder: { en: 'Pause at the contracted position each rep.', fi: 'Pidä tauko supistuneessa asennossa joka toistolla.', hu: 'Tarts szünetet az összehúzott helyzetben minden ismétlésnél.', sv: 'Pausa i det hopdragna läget på varje repetition.' },
		fit: f(1, 2, 2, 3)
	},
	{
		id: 'dumbbell-pullover',
		name: { en: 'Dumbbell pullover', fi: 'Pullover käsipainolla', hu: 'Pullover kézisúlyzóval', sv: 'Hantelpullover' },
		pattern: 'pull-h', minTier: 4, experienceMin: 'intermediate', primary: ['Lats', 'Chest'],
		cue: { en: 'Lower the dumbbell behind the head, pull it back over.', fi: 'Laske käsipaino pään taakse, vedä takaisin yli.', hu: 'Engedd a súlyzót a fej mögé, húzd vissza fölé.', sv: 'Sänk hanteln bakom huvudet, dra tillbaka över.' },
		purpose: { en: 'Stretches and works the lats and chest in one arc.', fi: 'Venyttää ja kuormittaa leveää selkälihasta ja rintaa yhdellä kaarella.', hu: 'Megnyújtja és megdolgoztatja a széles hátizmot és a mellet egyetlen ívben.', sv: 'Tänjer och tränar lats och bröst i en och samma båge.' },
		setup: { en: 'Lie across or along a bench, hold one dumbbell overhead.', fi: 'Makaa penkin poikki tai pituudella, pidä yhtä käsipainoa pään yllä.', hu: 'Feküdj keresztben vagy hosszában egy padra, tarts egy kézisúlyzót a fejed felett.', sv: 'Ligg tvärs eller längs en bänk, håll en hantel över huvudet.' },
		mistakes: { en: 'Overarching the lower back at the stretch.', fi: 'Alaselän liiallinen notkistaminen venytyksessä.', hu: 'Túlságosan homorítod a derekad a nyújtásnál.', sv: 'Att överdriva svanken i ländryggen i tänjningen.' },
		easier: { en: 'Use a lighter dumbbell and a shorter range.', fi: 'Käytä kevyempää käsipainoa ja lyhyempää liikerataa.', hu: 'Használj könnyebb kézisúlyzót és rövidebb mozgástartományt.', sv: 'Använd en lättare hantel och kortare rörelseomfång.' },
		harder: { en: 'Increase the weight or pause at the stretch.', fi: 'Kasvata painoa tai pidä tauko venytyksessä.', hu: 'Növeld a súlyt, vagy tarts szünetet a nyújtásnál.', sv: 'Öka vikten eller pausa i tänjningen.' },
		safety: { en: 'Keep the core braced to protect the lower back.', fi: 'Pidä keskivartalo jännitettynä alaselän suojaamiseksi.', hu: 'Tartsd feszesen a törzsizmaidat a derék védelmében.', sv: 'Håll bålen spänd för att skydda ryggslutet.' },
		fit: f(1, 3, 2, 1)
	},

	// ---------- SHOULDERS ----------
	{
		id: 'barbell-overhead-press',
		name: { en: 'Barbell overhead press', fi: 'Pystypunnerrus tangolla', hu: 'Vállból nyomás rúddal', sv: 'Militärpress med skivstång' },
		pattern: 'push-v', minTier: 5, experienceMin: 'intermediate', primary: ['Shoulders', 'Front delts', 'Triceps'],
		cue: { en: 'Press the bar overhead, finish with it over the ears.', fi: 'Työnnä tanko pään yli, lopeta korvien linjaan.', hu: 'Nyomd a rudat fej fölé, fejezd be a fülek vonalában.', sv: 'Pressa stången över huvudet, avsluta över öronen.' },
		purpose: { en: 'The core standing press for shoulder and upper-body strength.', fi: 'Seisten tehtävä peruspunnerrus olkapäiden ja ylävartalon voimalle.', hu: 'Az alap állva végzett nyomás a váll és a felsőtest erejéért.', sv: 'Grundpressen stående för styrka i axlar och överkropp.' },
		setup: { en: 'Bar at the collarbones, feet hip-width, core braced.', fi: 'Tanko solisluiden kohdalla, jalat lantion levyisesti, keskivartalo jännitettynä.', hu: 'Rúd a kulcscsontnál, csípőszéles terpesz, törzs megfeszítve.', sv: 'Stången vid nyckelbenen, fötterna höftbrett isär, spänd bål.' },
		mistakes: { en: 'Leaning back excessively or pressing in front of the head.', fi: 'Liiallinen taaksenojaus tai työntö pään edessä.', hu: 'Túlzottan hátradőlsz, vagy a fejed előtt nyomsz.', sv: 'Att luta dig för mycket bakåt eller pressa framför huvudet.' },
		easier: { en: 'Use dumbbells or a seated press with back support.', fi: 'Käytä käsipainoja tai istuvaa punnerrusta selkätuella.', hu: 'Használj kézisúlyzókat, vagy ülve nyomj háttámasszal.', sv: 'Använd hantlar eller en sittande press med ryggstöd.' },
		harder: { en: 'Add weight or pause at the bottom each rep.', fi: 'Lisää painoa tai pidä tauko ala-asennossa joka toistolla.', hu: 'Adj hozzá súlyt, vagy tarts szünetet a mélyponton minden ismétlésnél.', sv: 'Lägg till vikt eller pausa i botten på varje repetition.' },
		safety: { en: 'Brace the core; avoid overarching the lower back overhead.', fi: 'Jännitä keskivartalo; vältä alaselän notkistamista pään yllä.', hu: 'Feszítsd meg a törzsed; kerüld a derék túlhomorítását a fej fölött.', sv: 'Spänn bålen; undvik att översvanka ländryggen ovanför huvudet.' },
		fit: f(3, 2, 2, 2)
	},
	{
		id: 'arnold-press',
		name: { en: 'Arnold press', fi: 'Arnold-punnerrus', hu: 'Arnold nyomás', sv: 'Arnoldpress' },
		pattern: 'push-v', minTier: 4, experienceMin: 'intermediate', primary: ['Shoulders', 'Front delts', 'Side delts'],
		cue: { en: 'Rotate the palms out as you press overhead.', fi: 'Käännä kämmenet ulospäin samalla kun työnnät ylös.', hu: 'Forgasd a tenyeret kifelé, ahogy felnyomsz.', sv: 'Rotera handflatorna utåt när du pressar upp.' },
		purpose: { en: 'A rotating dumbbell press that hits all three delt heads.', fi: 'Kiertävä käsipainopunnerrus, joka kuormittaa kaikkia kolmea olkapään osaa.', hu: 'Forgatott kézisúlyzós nyomás, amely mind a három deltafejet megdolgoztatja.', sv: 'En roterande hantelpress som träffar alla tre delar av axeln.' },
		setup: { en: 'Start with palms facing you at chin height, seated.', fi: 'Aloita kämmenet itseesi päin leuan korkeudella, istuen.', hu: 'Indíts tenyérrel magad felé, állmagasságban, ülve.', sv: 'Börja med handflatorna mot dig i hakhöjd, sittande.' },
		mistakes: { en: 'Rushing the rotation or arching the back.', fi: 'Kierron hätäily tai selän notkistaminen.', hu: 'Elkapkodod a forgatást, vagy homorítod a hátad.', sv: 'Att stressa rotationen eller svanka i ryggen.' },
		easier: { en: 'Use lighter dumbbells or a standard shoulder press.', fi: 'Käytä kevyempiä käsipainoja tai tavallista olkapääpunnerrusta.', hu: 'Használj könnyebb kézisúlyzókat vagy szokványos vállból nyomást.', sv: 'Använd lättare hantlar eller en vanlig axelpress.' },
		harder: { en: 'Slow the rotation or increase the load.', fi: 'Hidasta kiertoa tai kasvata kuormaa.', hu: 'Lassítsd a forgatást, vagy növeld a terhelést.', sv: 'Sakta ner rotationen eller öka belastningen.' },
		fit: f(2, 3, 2, 2)
	},
	{
		id: 'dumbbell-lateral-raise',
		name: { en: 'Dumbbell lateral raise', fi: 'Sivunostot käsipainoilla', hu: 'Oldalemelés kézisúlyzóval', sv: 'Sidolyft med hantlar' },
		pattern: 'push-v', minTier: 2, experienceMin: 'beginner', primary: ['Side delts', 'Shoulders'],
		cue: { en: 'Lift the dumbbells out to the sides up to shoulder height.', fi: 'Nosta käsipainot sivuille hartioiden korkeudelle.', hu: 'Emeld a súlyzókat oldalra váll magasságig.', sv: 'Lyft hantlarna ut åt sidorna till axelhöjd.' },
		purpose: { en: 'Isolates the side delts to build shoulder width.', fi: 'Eristää sivuolkapäät hartioiden leveyden kehittämiseksi.', hu: 'Izolálja az oldalsó deltákat a vállszélesség kiépítéséhez.', sv: 'Isolerar sidodelten för att bygga bredd över axlarna.' },
		setup: { en: 'Stand tall, a dumbbell in each hand, slight elbow bend.', fi: 'Seiso ryhdikkäästi, käsipaino kummassakin kädessä, kyynärpäissä kevyt koukku.', hu: 'Állj egyenesen, egy-egy kézisúlyzó a kezedben, könyökök enyhén behajlítva.', sv: 'Stå rak, en hantel i varje hand, lätt böjda armbågar.' },
		mistakes: { en: 'Swinging the weights up or shrugging the traps.', fi: 'Painojen heilauttaminen ylös tai epäkäslihasten kohottaminen.', hu: 'Felrántod a súlyokat, vagy felhúzod a csuklyásizmot.', sv: 'Att svinga upp vikterna eller dra upp kappmuskeln.' },
		easier: { en: 'Use lighter dumbbells or raise one arm at a time.', fi: 'Käytä kevyempiä käsipainoja tai nosta yksi käsi kerrallaan.', hu: 'Használj könnyebb kézisúlyzókat, vagy emelj egy karral egyszerre.', sv: 'Använd lättare hantlar eller lyft en arm i taget.' },
		harder: { en: 'Pause at the top or slow the lowering.', fi: 'Pidä tauko yläasennossa tai hidasta laskua.', hu: 'Tarts szünetet a felső ponton, vagy lassítsd az ereszkedést.', sv: 'Pausa i toppen eller sänk dig långsammare.' },
		fit: f(1, 2, 2, 2)
	},
	{
		id: 'rear-delt-fly',
		name: { en: 'Rear delt fly', fi: 'Takaolkapään vipunostot', hu: 'Hátsó vállas tárogatás', sv: 'Bakre axelflyes' },
		pattern: 'pull-h', minTier: 2, experienceMin: 'beginner', primary: ['Rear delts', 'Rhomboids', 'Traps'],
		cue: { en: 'Hinge forward, raise the dumbbells out to the sides.', fi: 'Taivuta eteen, nosta käsipainot sivuille.', hu: 'Dőlj előre, emeld a súlyzókat oldalra.', sv: 'Fäll fram, lyft hantlarna ut åt sidorna.' },
		purpose: { en: 'Targets the rear delts and upper back for balanced shoulders.', fi: 'Kohdistuu takaolkapäihin ja yläselkään tasapainoisia olkapäitä varten.', hu: 'A hátsó deltákat és a felső hátat célozza a kiegyensúlyozott vállakért.', sv: 'Träffar bakre axeln och övre ryggen för balanserade axlar.' },
		setup: { en: 'Bend at the hips, flat back, dumbbells hanging down.', fi: 'Taivuta lantiosta, selkä suorana, käsipainot roikkuvat alas.', hu: 'Hajolj előre a csípőből, egyenes hát, kézisúlyzók lefelé lógatva.', sv: 'Fäll i höften, rak rygg, hantlarna hänger rakt ner.' },
		mistakes: { en: 'Using momentum or letting the back round.', fi: 'Vauhdin käyttäminen tai selän pyöristyminen.', hu: 'Lendületet használsz, vagy hagyod lekerekedni a hátad.', sv: 'Att använda fart eller låta ryggen runda.' },
		easier: { en: 'Sit on a bench and lean over to support the torso.', fi: 'Istu penkille ja nojaa eteen ylävartalon tukemiseksi.', hu: 'Ülj egy padra, és dőlj előre a törzs megtámasztásához.', sv: 'Sitt på en bänk och luta dig fram för att stötta överkroppen.' },
		harder: { en: 'Pause at the top or add weight.', fi: 'Pidä tauko yläasennossa tai lisää painoa.', hu: 'Tarts szünetet a felső ponton, vagy adj hozzá súlyt.', sv: 'Pausa i toppen eller lägg till vikt.' },
		fit: f(1, 2, 2, 2)
	},
	{
		id: 'upright-row',
		name: { en: 'Upright row', fi: 'Pystysoutu', hu: 'Álló evezés', sv: 'Upright row' },
		pattern: 'push-v', minTier: 4, experienceMin: 'intermediate', primary: ['Side delts', 'Traps', 'Shoulders'],
		cue: { en: 'Pull the weight up the body, elbows leading and high.', fi: 'Vedä paino kehoa pitkin ylös, kyynärpäät edellä ja korkealla.', hu: 'Húzd a súlyt a test mentén fel, könyök elöl és magasan.', sv: 'Dra vikten uppåt längs kroppen, armbågar först och högt.' },
		purpose: { en: 'Builds the side delts and upper traps with a vertical pull.', fi: 'Kehittää sivuolkapäitä ja yläepäkästä pystyvedolla.', hu: 'Az oldalsó deltákat és a felső csuklyásizmot építi függőleges húzással.', sv: 'Bygger sidodelten och övre kappmuskeln med ett vertikalt drag.' },
		setup: { en: 'Stand with a barbell or dumbbells at thigh level.', fi: 'Seiso tanko tai käsipainot reisien korkeudella.', hu: 'Állj rúddal vagy kézisúlyzókkal combmagasságban.', sv: 'Stå med en skivstång eller hantlar i lårhöjd.' },
		mistakes: { en: 'Pulling too high which can pinch the shoulder.', fi: 'Liian korkea veto, joka voi puristaa olkapäätä.', hu: 'Túl magasra húzol, ami becsípheti a vállat.', sv: 'Att dra för högt, vilket kan klämma axeln.' },
		easier: { en: 'Use a wider grip and a lower finish point.', fi: 'Käytä leveämpää otetta ja matalampaa loppuasentoa.', hu: 'Használj szélesebb fogást és alacsonyabb végpontot.', sv: 'Använd ett bredare grepp och en lägre slutpunkt.' },
		harder: { en: 'Add weight or pause at the top.', fi: 'Lisää painoa tai pidä tauko yläasennossa.', hu: 'Adj hozzá súlyt, vagy tarts szünetet a felső ponton.', sv: 'Lägg till vikt eller pausa i toppen.' },
		safety: { en: 'Stop below shoulder height if it pinches the joint.', fi: 'Lopeta hartioiden alapuolelle, jos nivel puristuu.', hu: 'Állj meg vállmagasság alatt, ha becsípi az ízületet.', sv: 'Sluta under axelhöjd om det klämmer i leden.' },
		fit: f(2, 2, 2, 1)
	},
	{
		id: 'front-raise',
		name: { en: 'Front raise', fi: 'Etunostot', hu: 'Elülső vállemelés', sv: 'Frontlyft' },
		pattern: 'push-v', minTier: 2, experienceMin: 'beginner', primary: ['Front delts', 'Shoulders'],
		cue: { en: 'Raise the weight straight in front to shoulder height.', fi: 'Nosta paino suoraan eteen hartioiden korkeudelle.', hu: 'Emeld a súlyt egyenesen előre váll magasságig.', sv: 'Lyft vikten rakt fram till axelhöjd.' },
		purpose: { en: 'Isolates the front delts with a simple raising motion.', fi: 'Eristää etuolkapäät yksinkertaisella nostoliikkeellä.', hu: 'Izolálja a mellső deltákat egy egyszerű emelőmozdulattal.', sv: 'Isolerar främre axeln med en enkel lyftrörelse.' },
		setup: { en: 'Stand tall, dumbbell in each hand resting on the thighs.', fi: 'Seiso ryhdikkäästi, käsipaino kummassakin kädessä reisillä.', hu: 'Állj egyenesen, egy-egy kézisúlyzó a kezedben, a combodon nyugtatva.', sv: 'Stå rak, en hantel i varje hand vilande mot låren.' },
		mistakes: { en: 'Swinging the body to throw the weight up.', fi: 'Vartalon heilauttaminen painon heittämiseksi ylös.', hu: 'A tested lendíted, hogy feldobd a súlyt.', sv: 'Att svinga med kroppen för att kasta upp vikten.' },
		easier: { en: 'Use lighter weight or raise one arm at a time.', fi: 'Käytä kevyempää painoa tai nosta yksi käsi kerrallaan.', hu: 'Használj könnyebb súlyt, vagy emelj egy karral egyszerre.', sv: 'Använd lättare vikt eller lyft en arm i taget.' },
		harder: { en: 'Slow the lowering or pause at the top.', fi: 'Hidasta laskua tai pidä tauko yläasennossa.', hu: 'Lassítsd az ereszkedést, vagy tarts szünetet a felső ponton.', sv: 'Sänk dig långsammare eller pausa i toppen.' },
		fit: f(1, 2, 2, 1)
	},

	// ---------- TRICEPS ----------
	{
		id: 'triceps-pushdown',
		name: { en: 'Triceps pushdown', fi: 'Ojentajapunnerrus taljassa', hu: 'Tricepsz lenyomás', sv: 'Triceps pushdown' },
		pattern: 'push-v', minTier: 5, experienceMin: 'beginner', primary: ['Triceps'],
		cue: { en: 'Keep the elbows pinned, extend the arms straight down.', fi: 'Pidä kyynärpäät paikallaan, ojenna kädet suoraan alas.', hu: 'Tartsd a könyököt fixen, nyújtsd a kart egyenesen le.', sv: 'Håll armbågarna fixerade, sträck armarna rakt ner.' },
		purpose: { en: 'A cable isolation that builds triceps with constant tension.', fi: 'Talja-eristys, joka kehittää ojentajia tasaisella jännityksellä.', hu: 'Kábeles izolációs gyakorlat, amely állandó feszességgel építi a tricepszet.', sv: 'En kabelisolation som bygger triceps med konstant spänning.' },
		setup: { en: 'Stand at a high pulley, grip a bar or rope, elbows tucked.', fi: 'Seiso ylätaljalla, ota tangosta tai narusta, kyynärpäät kyljissä.', hu: 'Állj egy felső csigához, fogj egy rudat vagy kötelet, könyökök a törzshez húzva.', sv: 'Stå vid ett högt block, greppa en stång eller ett rep, armbågarna intill.' },
		mistakes: { en: 'Letting the elbows drift forward or leaning over the bar.', fi: 'Kyynärpäiden lipuminen eteen tai tangon yli nojaaminen.', hu: 'Hagyod előrecsúszni a könyököd, vagy a rúd fölé dőlsz.', sv: 'Att låta armbågarna glida framåt eller luta dig över stången.' },
		easier: { en: 'Lower the weight and keep a comfortable range.', fi: 'Laske paino ja pidä mukava liikerata.', hu: 'Csökkentsd a súlyt, és tarts kényelmes mozgástartományt.', sv: 'Sänk vikten och håll ett bekvämt rörelseomfång.' },
		harder: { en: 'Pause at full extension or increase the load.', fi: 'Pidä tauko täydessä ojennuksessa tai kasvata kuormaa.', hu: 'Tarts szünetet a teljes kinyújtásnál, vagy növeld a terhelést.', sv: 'Pausa i fullt utsträckt läge eller öka belastningen.' },
		fit: f(1, 2, 2, 1)
	},
	{
		id: 'overhead-triceps-extension',
		name: { en: 'Overhead triceps extension', fi: 'Ojentajapunnerrus pään takaa', hu: 'Fej mögötti tricepsz nyújtás', sv: 'Triceps över huvudet' },
		pattern: 'push-v', minTier: 2, experienceMin: 'beginner', primary: ['Triceps'],
		cue: { en: 'Lower the weight behind the head, extend straight up.', fi: 'Laske paino pään taakse, ojenna suoraan ylös.', hu: 'Engedd a súlyt a fej mögé, nyújtsd egyenesen fel.', sv: 'Sänk vikten bakom huvudet, sträck rakt upp.' },
		purpose: { en: 'Loads the long head of the triceps in a stretched position.', fi: 'Kuormittaa ojentajan pitkää päätä venytetyssä asennossa.', hu: 'Megnyújtott helyzetben terheli a triceps hosszú fejét.', sv: 'Belastar tricepsets långa huvud i ett tänjt läge.' },
		setup: { en: 'Hold one dumbbell with both hands overhead, elbows high.', fi: 'Pidä yhtä käsipainoa molemmin käsin pään yllä, kyynärpäät korkealla.', hu: 'Tarts egy kézisúlyzót mindkét kézzel a fejed felett, könyökök magasan.', sv: 'Håll en hantel med båda händerna över huvudet, armbågarna högt.' },
		mistakes: { en: 'Flaring the elbows wide or arching the back.', fi: 'Kyynärpäiden levittäminen tai selän notkistaminen.', hu: 'Szélesre kinyitod a könyököd, vagy homorítod a hátad.', sv: 'Att flänga ut armbågarna brett eller svanka i ryggen.' },
		easier: { en: 'Use a lighter weight and a shorter range.', fi: 'Käytä kevyempää painoa ja lyhyempää liikerataa.', hu: 'Használj könnyebb súlyt és rövidebb mozgástartományt.', sv: 'Använd en lättare vikt och kortare rörelseomfång.' },
		harder: { en: 'Slow the lowering or increase the weight.', fi: 'Hidasta laskua tai kasvata painoa.', hu: 'Lassítsd az ereszkedést, vagy növeld a súlyt.', sv: 'Sänk dig långsammare eller öka vikten.' },
		safety: { en: 'Control the weight behind the head to protect the elbows.', fi: 'Hallitse paino pään takana kyynärpäiden suojaamiseksi.', hu: 'Kontrolláld a súlyt a fej mögött a könyök védelmében.', sv: 'Kontrollera vikten bakom huvudet för att skydda armbågarna.' },
		fit: f(1, 2, 2, 1)
	},
	{
		id: 'skullcrusher',
		name: { en: 'Skullcrusher', fi: 'Otsapunnerrus', hu: 'Koponyatörő', sv: 'Skullcrusher' },
		pattern: 'push-h', minTier: 4, experienceMin: 'intermediate', primary: ['Triceps'],
		cue: { en: 'Lower the bar toward the forehead, keep the elbows still.', fi: 'Laske tanko otsaa kohti, pidä kyynärpäät paikallaan.', hu: 'Engedd a rudat a homlok felé, tartsd a könyököt fixen.', sv: 'Sänk stången mot pannan, håll armbågarna still.' },
		purpose: { en: 'A lying extension that builds the triceps mass.', fi: 'Makuulla tehtävä ojennus, joka kasvattaa ojentajia.', hu: 'Fekve végzett nyújtás, amely növeli a triceps tömegét.', sv: 'En liggande extension som bygger tricepsmassa.' },
		setup: { en: 'Lie on a bench, weight over the forehead, elbows up.', fi: 'Makaa penkillä, paino otsan yllä, kyynärpäät ylhäällä.', hu: 'Feküdj a padra, súly a homlokod felett, könyökök felfelé.', sv: 'Ligg på en bänk, vikten över pannan, armbågarna uppåt.' },
		mistakes: { en: 'Letting the elbows flare or moving the upper arms.', fi: 'Kyynärpäiden levittäminen tai olkavarsien liikuttaminen.', hu: 'Hagyod kinyílni a könyököd, vagy mozgatod a felkarod.', sv: 'Att låta armbågarna flänga ut eller flytta överarmarna.' },
		easier: { en: 'Use a lighter weight or dumbbells.', fi: 'Käytä kevyempää painoa tai käsipainoja.', hu: 'Használj könnyebb súlyt vagy kézisúlyzókat.', sv: 'Använd en lättare vikt eller hantlar.' },
		harder: { en: 'Lower toward behind the head for more stretch.', fi: 'Laske pään taakse lisävenytyksen saamiseksi.', hu: 'Ereszd a fejed mögé a nagyobb nyújtásért.', sv: 'Sänk vikten bakom huvudet för mer tänjning.' },
		safety: { en: 'Control the weight near the face; do not drop it.', fi: 'Hallitse paino kasvojen lähellä; älä pudota sitä.', hu: 'Kontrolláld a súlyt az arc közelében; ne ejtsd le.', sv: 'Kontrollera vikten nära ansiktet; tappa den inte.' },
		fit: f(1, 3, 2, 1)
	},
	{
		id: 'bench-dip',
		name: { en: 'Bench dip', fi: 'Penkkidippi', hu: 'Pados tolódzkodás', sv: 'Bänkdips' },
		pattern: 'push-h', minTier: 1, experienceMin: 'beginner', primary: ['Triceps', 'Front delts', 'Chest'],
		cue: { en: 'Lower the hips by bending the elbows, press back up.', fi: 'Laske lantio kyynärpäitä koukistamalla, työnnä takaisin ylös.', hu: 'Engedd a csípőt a könyök hajlításával, nyomd vissza.', sv: 'Sänk höften genom att böja armbågarna, pressa upp.' },
		purpose: { en: 'A bodyweight triceps move using a bench or chair.', fi: 'Kehonpainoinen ojentajaliike penkkiä tai tuolia hyödyntäen.', hu: 'Saját testsúlyos tricepszgyakorlat egy pad vagy szék segítségével.', sv: 'En tricepsövning med kroppsvikt som utnyttjar en bänk eller stol.' },
		setup: { en: 'Hands on a bench behind you, legs out in front.', fi: 'Kädet takana penkillä, jalat edessä suorina.', hu: 'Kezek mögötted egy padon, lábak elöl kinyújtva.', sv: 'Händerna på en bänk bakom dig, benen utsträckta framåt.' },
		mistakes: { en: 'Going too low or letting the shoulders roll forward.', fi: 'Liian matala lasku tai olkapäiden pyöriminen eteen.', hu: 'Túl mélyre ereszkedsz, vagy hagyod előregördülni a vállad.', sv: 'Att gå för lågt eller låta axlarna rulla framåt.' },
		easier: { en: 'Bend the knees and keep the feet closer in.', fi: 'Koukista polvet ja pidä jalat lähempänä.', hu: 'Hajlítsd be a térded, és húzd közelebb a lábad.', sv: 'Böj knäna och håll fötterna närmare in.' },
		harder: { en: 'Straighten the legs or add a weight on the lap.', fi: 'Suorista jalat tai lisää paino sylin päälle.', hu: 'Nyújtsd ki a lábad, vagy tegyél súlyt az öledbe.', sv: 'Sträck ut benen eller lägg en vikt i knät.' },
		safety: { en: 'Avoid sinking too deep to protect the shoulders.', fi: 'Vältä liian syvää laskua olkapäiden suojaamiseksi.', hu: 'Ne ereszkedj túl mélyre a váll védelmében.', sv: 'Undvik att sänka för djupt för att skydda axlarna.' },
		fit: f(1, 2, 3, 2)
	},
	{
		id: 'close-grip-pushup',
		modTips: { en: 'To make this easier, lower your knees to the floor, or do it on a raised surface or a wall. Stop if you feel pain or pressure.', fi: 'Helpota laskemalla polvet maahan, tai tee se korokkeelta tai seinää vasten. Lopeta, jos tunnet kipua tai painetta.', hu: 'A könnyítéshez ereszkedj térdre, vagy végezd megemelt felületen vagy falra támaszkodva. Állj le, ha fájdalmat vagy nyomást érzel.', sv: 'För att göra det lättare, sänk knäna mot golvet, eller gör det på en förhöjd yta eller mot en vägg. Sluta om du känner smärta eller tryck.' },
		name: { en: 'Close-grip pushup', fi: 'Kapeapunnerrus', hu: 'Szűk fogású fekvőtámasz', sv: 'Smal armhävning' },
		pattern: 'push-h', minTier: 0, experienceMin: 'beginner', primary: ['Triceps', 'Chest', 'Front delts'],
		cue: { en: 'Hands close together, keep the elbows tucked to the ribs.', fi: 'Kädet lähekkäin, pidä kyynärpäät kyljissä.', hu: 'Kezek közel, tartsd a könyököt a bordákhoz.', sv: 'Händerna nära, håll armbågarna intill revbenen.' },
		purpose: { en: 'A pushup variation that shifts the load onto the triceps.', fi: 'Punnerrusversio, joka siirtää kuorman ojentajille.', hu: 'Fekvőtámasz-változat, amely a terhelést a tricepszre helyezi.', sv: 'En armhävningsvariant som flyttar belastningen till triceps.' },
		setup: { en: 'Hands under the chest, body in a straight plank line.', fi: 'Kädet rinnan alla, vartalo suorana lankkulinjassa.', hu: 'Kezek a mellkas alatt, test egyenes plankvonalban.', sv: 'Händerna under bröstet, kroppen i en rak plankalinje.' },
		mistakes: { en: 'Flaring the elbows or letting the hips drop.', fi: 'Kyynärpäiden levittäminen tai lantion tippuminen.', hu: 'Kinyitod a könyököd, vagy leejted a csípőd.', sv: 'Att flänga ut armbågarna eller låta höften falla.' },
		easier: { en: 'Do them with the hands on a raised surface.', fi: 'Tee ne kädet korokkeella.', hu: 'Csináld megemelt felületen lévő kezekkel.', sv: 'Gör dem med händerna på en förhöjd yta.' },
		harder: { en: 'Elevate the feet or slow the lowering.', fi: 'Nosta jalat korokkeelle tai hidasta laskua.', hu: 'Emeld meg a lábad, vagy lassítsd az ereszkedést.', sv: 'Höj upp fötterna eller sänk dig långsammare.' },
		fit: f(2, 2, 3, 2)
	},

	// ---------- BICEPS ----------
	{
		id: 'barbell-curl',
		name: { en: 'Barbell curl', fi: 'Hauiskääntö tangolla', hu: 'Bicepsz hajlítás rúddal', sv: 'Skivstångscurl' },
		pattern: 'pull-v', minTier: 5, experienceMin: 'beginner', primary: ['Biceps', 'Forearms'],
		cue: { en: 'Curl the bar up, keep the elbows at your sides.', fi: 'Käännä tanko ylös, pidä kyynärpäät kyljissä.', hu: 'Hajlítsd a rudat fel, tartsd a könyököt a test mellett.', sv: 'Curla stången upp, håll armbågarna vid sidorna.' },
		purpose: { en: 'The standard barbell biceps builder for arm size.', fi: 'Tavallinen tankohauiskääntö käsivarsien kasvattamiseen.', hu: 'A klasszikus rúddal végzett bicepszhajlítás a karok tömegéért.', sv: 'Den klassiska skivstångscurlen för större armar.' },
		setup: { en: 'Stand tall, underhand grip at shoulder width.', fi: 'Seiso ryhdikkäästi, vastaote hartioiden leveydeltä.', hu: 'Állj egyenes háttal, alsó fogás vállszélességben.', sv: 'Stå upprätt, underhandsgrepp i axelbredd.' },
		mistakes: { en: 'Swinging the body or moving the elbows forward.', fi: 'Vartalon heilauttaminen tai kyynärpäiden vienti eteen.', hu: 'A test belendítése vagy a könyök előrevitele.', sv: 'Att svinga med kroppen eller skjuta armbågarna framåt.' },
		easier: { en: 'Use a lighter bar or curl dumbbells instead.', fi: 'Käytä kevyempää tankoa tai tee hauiskääntö käsipainoilla.', hu: 'Használj könnyebb rudat, vagy hajlíts inkább egykezes súlyzókkal.', sv: 'Använd en lättare stång eller curla med hantlar i stället.' },
		harder: { en: 'Slow the lowering or pause at the top.', fi: 'Hidasta laskua tai pidä tauko yläasennossa.', hu: 'Lassítsd le az engedést, vagy tarts szünetet a felső ponton.', sv: 'Sänk långsammare eller pausa i toppen.' },
		fit: f(1, 2, 1, 1)
	},
	{
		id: 'hammer-curl',
		name: { en: 'Hammer curl', fi: 'Vasarakääntö', hu: 'Kalapács hajlítás', sv: 'Hammarcurl' },
		pattern: 'pull-v', minTier: 2, experienceMin: 'beginner', primary: ['Biceps', 'Forearms'],
		cue: { en: 'Curl with the palms facing in, thumbs up.', fi: 'Käännä kämmenet sisäänpäin, peukalot ylös.', hu: 'Hajlíts úgy, hogy a tenyér befelé néz, hüvelyk fel.', sv: 'Curla med handflatorna inåt, tummarna upp.' },
		purpose: { en: 'A neutral-grip curl that builds the biceps and forearms.', fi: 'Neutraaliotteen kääntö, joka kehittää hauista ja kyynärvarsia.', hu: 'Semleges fogású hajlítás, amely a bicepszet és az alkart fejleszti.', sv: 'En hammarcurl som bygger biceps och underarmar.' },
		setup: { en: 'Stand with a dumbbell in each hand, palms facing in.', fi: 'Seiso käsipaino kummassakin kädessä, kämmenet sisäänpäin.', hu: 'Állj egy-egy súlyzóval a kezedben, tenyérrel befelé.', sv: 'Stå med en hantel i varje hand, handflatorna inåt.' },
		mistakes: { en: 'Rocking the body or swinging the weights.', fi: 'Vartalon keinuttaminen tai painojen heilauttaminen.', hu: 'A test ringatása vagy a súlyok belendítése.', sv: 'Att gunga med kroppen eller svinga vikterna.' },
		easier: { en: 'Use lighter dumbbells or curl one arm at a time.', fi: 'Käytä kevyempiä käsipainoja tai käännä yksi käsi kerrallaan.', hu: 'Használj könnyebb súlyzókat, vagy hajlíts egyszerre egy karral.', sv: 'Använd lättare hantlar eller curla en arm i taget.' },
		harder: { en: 'Slow the lowering or pause at the top.', fi: 'Hidasta laskua tai pidä tauko yläasennossa.', hu: 'Lassítsd le az engedést, vagy tarts szünetet a felső ponton.', sv: 'Sänk långsammare eller pausa i toppen.' },
		fit: f(1, 2, 1, 1)
	},
	{
		id: 'preacher-curl',
		name: { en: 'Preacher curl', fi: 'Saarnaajakääntö', hu: 'Scott-pados bicepsz', sv: 'Scottcurl' },
		pattern: 'pull-v', minTier: 4, experienceMin: 'intermediate', primary: ['Biceps', 'Forearms'],
		cue: { en: 'Rest the arms on the pad, curl without lifting the elbows.', fi: 'Tue käsivarret tyynyä vasten, käännä ilman kyynärpäiden nostoa.', hu: 'Támaszd a kart a párnára, hajlíts könyökemelés nélkül.', sv: 'Vila armarna på dynan, curla utan att lyfta armbågarna.' },
		purpose: { en: 'A supported curl that isolates the biceps strictly.', fi: 'Tuettu kääntö, joka eristää hauiksen tarkasti.', hu: 'Megtámasztott hajlítás, amely szigorúan izolálja a bicepszet.', sv: 'En stödd curl som isolerar biceps strikt.' },
		setup: { en: 'Sit at a preacher bench, arms over the pad, underhand grip.', fi: 'Istu saarnaajapenkkiin, kädet tyynyn yli, vastaote.', hu: 'Ülj a prédikálópadhoz, karok a párnán, alsó fogás.', sv: 'Sitt vid en scottbänk, armarna över dynan, underhandsgrepp.' },
		mistakes: { en: 'Bouncing at the bottom or extending too fast.', fi: 'Pomppiminen ala-asennossa tai liian nopea ojennus.', hu: 'Pattogás az alsó ponton vagy túl gyors nyújtás.', sv: 'Att studsa i botten eller sträcka ut för snabbt.' },
		easier: { en: 'Use lighter weight and stop short of full extension.', fi: 'Käytä kevyempää painoa ja pysähdy ennen täyttä ojennusta.', hu: 'Használj könnyebb súlyt, és állj meg a teljes nyújtás előtt.', sv: 'Använd lättare vikt och stanna före full utsträckning.' },
		harder: { en: 'Pause at the top or slow the lowering.', fi: 'Pidä tauko yläasennossa tai hidasta laskua.', hu: 'Tarts szünetet a felső ponton, vagy lassítsd le az engedést.', sv: 'Pausa i toppen eller sänk långsammare.' },
		safety: { en: 'Do not snap the elbow straight at the bottom.', fi: 'Älä napsauta kyynärpäätä suoraksi ala-asennossa.', hu: 'Ne rántsd ki teljesen a könyököt az alsó helyzetben.', sv: 'Räta inte ut armbågen med ett ryck i botten.' },
		fit: f(1, 2, 1, 1)
	},
	{
		id: 'cable-curl',
		name: { en: 'Cable curl', fi: 'Taljahauiskääntö', hu: 'Kábeles bicepsz', sv: 'Kabelcurl' },
		pattern: 'pull-v', minTier: 5, experienceMin: 'beginner', primary: ['Biceps', 'Forearms'],
		cue: { en: 'Curl the handle up with constant cable tension.', fi: 'Käännä kahva ylös taljan tasaisella jännityksellä.', hu: 'Hajlítsd a fogantyút fel folyamatos kábelfeszüléssel.', sv: 'Curla handtaget upp med jämn kabelspänning.' },
		purpose: { en: 'A cable curl that keeps tension on the biceps the whole rep.', fi: 'Taljakääntö, joka pitää jännityksen hauiksella koko toiston ajan.', hu: 'Kábeles bicepszhajlítás, amely végig a bicepszen tartja a feszülést.', sv: 'En kabelcurl som håller spänning på biceps hela repet.' },
		setup: { en: 'Stand at a low pulley, grip the bar underhand, elbows in.', fi: 'Seiso alataljalla, ota tangosta vastaote, kyynärpäät kyljissä.', hu: 'Állj az alsó csigánál, fogd alsó fogással a rudat, könyök a törzs mellett.', sv: 'Stå vid ett lågt block, ta underhandsgrepp om stången, armbågarna intill.' },
		mistakes: { en: 'Leaning back or letting the elbows drift forward.', fi: 'Taaksenojaus tai kyynärpäiden lipuminen eteen.', hu: 'Hátradőlés vagy a könyök előrecsúszása.', sv: 'Att luta sig bakåt eller låta armbågarna glida framåt.' },
		easier: { en: 'Lower the weight and keep the torso still.', fi: 'Laske paino ja pidä ylävartalo paikallaan.', hu: 'Csökkentsd a súlyt, és tartsd nyugton a törzset.', sv: 'Sänk vikten och håll överkroppen stilla.' },
		harder: { en: 'Pause at the top or slow the lowering.', fi: 'Pidä tauko yläasennossa tai hidasta laskua.', hu: 'Tarts szünetet a felső ponton, vagy lassítsd le az engedést.', sv: 'Pausa i toppen eller sänk långsammare.' },
		fit: f(1, 2, 1, 1)
	},

	// ---------- FOREARMS ----------
	{
		id: 'wrist-curl',
		name: { en: 'Wrist curl', fi: 'Rannekääntö', hu: 'Csuklóhajlítás', sv: 'Handledscurl' },
		pattern: 'pull-v', minTier: 2, experienceMin: 'beginner', primary: ['Forearms'],
		cue: { en: 'Curl the weight up using only the wrists.', fi: 'Käännä paino ylös pelkillä ranteilla.', hu: 'Hajlítsd a súlyt fel csak a csuklóval.', sv: 'Curla vikten upp endast med handlederna.' },
		purpose: { en: 'Strengthens the forearm flexors for grip and wrist size.', fi: 'Vahvistaa kyynärvarren koukistajia otetta ja kokoa varten.', hu: 'Erősíti az alkar hajlítóit a fogás és a méret érdekében.', sv: 'Stärker underarmens böjmuskler för grepp och storlek.' },
		setup: { en: 'Rest the forearms on the thighs, palms up, wrists past the knees.', fi: 'Tue kyynärvarret reisille, kämmenet ylös, ranteet polvien yli.', hu: 'Támaszd az alkart a combra, tenyérrel felfelé, csukló a térden túl.', sv: 'Vila underarmarna på låren, handflatorna upp, handlederna utanför knäna.' },
		mistakes: { en: 'Moving the whole arm instead of just the wrists.', fi: 'Koko käden liikuttaminen pelkkien ranteiden sijaan.', hu: 'A teljes kar mozgatása csupán a csukló helyett.', sv: 'Att röra hela armen i stället för bara handlederna.' },
		easier: { en: 'Use lighter weight and a smaller range.', fi: 'Käytä kevyempää painoa ja pienempää liikerataa.', hu: 'Használj könnyebb súlyt és kisebb mozgásterjedelmet.', sv: 'Använd lättare vikt och ett mindre rörelseomfång.' },
		harder: { en: 'Pause at the top or increase the load.', fi: 'Pidä tauko yläasennossa tai kasvata kuormaa.', hu: 'Tarts szünetet a felső ponton, vagy növeld a terhelést.', sv: 'Pausa i toppen eller öka belastningen.' },
		fit: f(1, 1, 1, 1)
	},
	{
		id: 'reverse-curl',
		name: { en: 'Reverse curl', fi: 'Käänteinen hauiskääntö', hu: 'Fordított bicepsz', sv: 'Omvänd curl' },
		pattern: 'pull-v', minTier: 2, experienceMin: 'beginner', primary: ['Forearms', 'Biceps'],
		cue: { en: 'Curl with the palms facing down, elbows at your sides.', fi: 'Käännä kämmenet alaspäin, kyynärpäät kyljissä.', hu: 'Hajlíts lefelé néző tenyérrel, könyök a test mellett.', sv: 'Curla med handflatorna nedåt, armbågar vid sidorna.' },
		purpose: { en: 'An overhand curl that targets the forearm extensors.', fi: 'Myötäotteen kääntö, joka kohdistuu kyynärvarren ojentajiin.', hu: 'Felső fogású hajlítás, amely az alkar feszítőit célozza.', sv: 'En överhandscurl som träffar underarmens sträckmuskler.' },
		setup: { en: 'Stand with a bar or dumbbells in an overhand grip.', fi: 'Seiso tanko tai käsipainot myötäotteella.', hu: 'Állj rúddal vagy súlyzókkal felső fogásban.', sv: 'Stå med en stång eller hantlar i överhandsgrepp.' },
		mistakes: { en: 'Letting the wrists bend or swinging the weight.', fi: 'Ranteiden taipuminen tai painon heilauttaminen.', hu: 'A csukló behajlítása vagy a súly belendítése.', sv: 'Att låta handlederna böja sig eller svinga vikten.' },
		easier: { en: 'Use lighter weight and a shorter range.', fi: 'Käytä kevyempää painoa ja lyhyempää liikerataa.', hu: 'Használj könnyebb súlyt és rövidebb mozgásterjedelmet.', sv: 'Använd lättare vikt och ett kortare rörelseomfång.' },
		harder: { en: 'Slow the lowering or pause at the top.', fi: 'Hidasta laskua tai pidä tauko yläasennossa.', hu: 'Lassítsd le az engedést, vagy tarts szünetet a felső ponton.', sv: 'Sänk långsammare eller pausa i toppen.' },
		fit: f(1, 1, 1, 1)
	}
];
