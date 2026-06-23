// Plain, beginner-friendly explanations for the jargon, shown via info icons. EN + FI (others fall back).
import type { Loc } from './data';

export interface GlossaryEntry {
	title: Loc;
	body: Loc;
}

export const glossary: Record<string, GlossaryEntry> = {
	sets: {
		title: { en: 'Sets', fi: 'Sarjat', hu: 'Sorozatok', sv: 'Set' },
		body: { en: 'A set is one round of an exercise: you do the listed reps, then rest before the next round. "3 sets" means do that round three times.', fi: 'Sarja on yksi kierros liikettä: teet mainitut toistot, sitten lepäät ennen seuraavaa kierrosta. "3 sarjaa" tarkoittaa, että teet kierroksen kolme kertaa.', hu: 'A sorozat egy gyakorlat egy köre: megcsinálod a megadott ismétléseket, majd pihensz a következő kör előtt. A "3 sorozat" azt jelenti, hogy a kört háromszor csinálod meg.', sv: 'Ett set är en omgång av en övning: du gör de angivna repetitionerna och vilar sedan före nästa omgång. "3 set" betyder att du gör den omgången tre gånger.' }
	},
	reps: {
		title: { en: 'Reps (repetitions)', fi: 'Toistot', hu: 'Ismétlések', sv: 'Repetitioner (reps)' },
		body: { en: 'A rep is one full movement, for example lowering and pressing once. "8-12 reps" means do between 8 and 12 of them in each set.', fi: 'Toisto on yksi täysi liike, esimerkiksi yksi lasku ja työntö. "8-12 toistoa" tarkoittaa, että teet niitä 8-12 jokaisessa sarjassa.', hu: 'Az ismétlés egy teljes mozdulat, például egy leengedés és egy nyomás. A "8-12 ismétlés" azt jelenti, hogy minden sorozatban 8 és 12 közötti mennyiséget csinálj belőle.', sv: 'En repetition är en hel rörelse, till exempel att sänka och pressa en gång. "8-12 repetitioner" betyder att du gör mellan 8 och 12 av dem i varje set.' }
	},
	rest: {
		title: { en: 'Rest', fi: 'Lepo', hu: 'Pihenő', sv: 'Vila' },
		body: { en: 'The pause between sets so the muscle recovers enough for the next one. Heavier, lower-rep work needs longer rest; lighter, higher-rep work needs less.', fi: 'Tauko sarjojen välissä, jotta lihas palautuu seuraavaa varten. Raskaampi, vähätoistoinen työ vaatii pidemmän levon; kevyempi, runsastoistoinen vähemmän.', hu: 'A sorozatok közötti szünet, hogy az izom eleget regenerálódjon a következőhöz. A nehezebb, alacsony ismétlésszámú munka hosszabb pihenőt igényel; a könnyebb, magas ismétlésszámú kevesebbet.', sv: 'Pausen mellan seten så att muskeln återhämtar sig tillräckligt för nästa. Tyngre arbete med få repetitioner behöver längre vila; lättare arbete med fler repetitioner behöver mindre.' }
	},
	tempo: {
		title: { en: 'Tempo', fi: 'Tempo', hu: 'Tempó', sv: 'Tempo' },
		body: { en: 'How fast you move, in seconds per phase. "3-1-1" means lower for 3 seconds, pause 1 second, lift in 1 second. Slowing the lowering makes even a light weight feel much harder, safely.', fi: 'Liikkeen nopeus sekunteina vaihetta kohti. "3-1-1" tarkoittaa: laske 3 sekuntia, tauko 1 sekunti, nosta 1 sekunnissa. Laskun hidastaminen tekee kevyestäkin painosta paljon haastavamman, turvallisesti.', hu: 'Milyen gyorsan mozogsz, fázisonkénti másodpercben. A "3-1-1" azt jelenti: engedd le 3 másodperc alatt, tarts 1 másodperc szünetet, emeld 1 másodperc alatt. A leengedés lassítása még egy könnyű súlyt is sokkal nehezebbé tesz, biztonságosan.', sv: 'Hur snabbt du rör dig, i sekunder per fas. "3-1-1" betyder sänk i 3 sekunder, pausa 1 sekund, lyft på 1 sekund. Att sakta ner sänkningen gör även en lätt vikt mycket tyngre, på ett säkert sätt.' }
	},
	effort: {
		title: { en: 'Effort (how hard a set is)', fi: 'Kuormitus (kuinka raskas sarja on)', hu: 'Terhelés (mennyire nehéz egy sorozat)', sv: 'Ansträngning (hur tungt ett set är)' },
		body: { en: 'How close to your limit a set is. "Leave 1-2 reps in reserve" means stop when you could still do about 1-2 more clean reps. "Close to failure" means stopping 0-2 reps short. You do NOT need to push to total failure to make good progress.', fi: 'Kuinka lähellä rajaasi sarja on. "Jätä 1-2 toistoa varaan" tarkoittaa, että lopetat kun pystyisit vielä noin 1-2 puhtaaseen toistoon. "Lähellä uupumusta" tarkoittaa 0-2 toiston päähän pysähtymistä. Sinun EI tarvitse mennä täydelliseen uupumukseen edistyäksesi.', hu: 'Mennyire vagy közel a határodhoz egy sorozatban. A "Hagyj 1-2 ismétlést tartalékban" azt jelenti, hogy akkor állj le, amikor még nagyjából 1-2 tiszta ismétlésre lennél képes. A "Közel a kifáradáshoz" azt jelenti, hogy 0-2 ismétléssel előtte állsz le. NEM kell teljes kifáradásig hajtanod a jó fejlődéshez.', sv: 'Hur nära din gräns ett set är. "Lämna 1-2 repetitioner i reserv" betyder att du slutar när du fortfarande skulle klara ungefär 1-2 rena repetitioner till. "Nära utmattning" betyder att sluta 0-2 repetitioner före. Du behöver INTE pressa till total utmattning för att göra goda framsteg.' }
	},
	progression: {
		title: { en: 'Progression', fi: 'Eteneminen', hu: 'Progresszió', sv: 'Progression' },
		body: { en: 'How you keep improving over weeks. A simple method (double progression): each week add a rep or two until you reach the top of the range (say 12), then add a little weight and start again near the bottom (say 8).', fi: 'Miten kehityt viikkojen aikana. Yksinkertainen tapa (kaksoisprogressio): lisää joka viikko toisto tai kaksi, kunnes saavutat haarukan ylärajan (esim. 12), lisää sitten hieman painoa ja aloita taas alarajalta (esim. 8).', hu: 'Ahogyan a hetek során folyamatosan fejlődsz. Egy egyszerű módszer (kettős progresszió): minden héten adj hozzá egy-két ismétlést, amíg eléred a tartomány tetejét (mondjuk 12), aztán tegyél rá egy kis súlyt, és kezdd újra az alsó határ közelében (mondjuk 8).', sv: 'Hur du fortsätter förbättras över veckor. En enkel metod (dubbel progression): lägg varje vecka till en repetition eller två tills du når toppen av intervallet (säg 12), lägg sedan på lite vikt och börja om nära botten (säg 8).' }
	},
	dropset: {
		title: { en: 'Drop set', fi: 'Pudotussarja', hu: 'Ledolgozó sorozat', sv: 'Dropset' },
		body: { en: 'An optional finisher: at the end of a set, reduce the weight and immediately keep going for more reps. A way to add intensity. Not required.', fi: 'Vapaaehtoinen lopetus: sarjan lopussa vähennät painoa ja jatkat heti lisää toistoja. Tapa lisätä intensiteettiä. Ei pakollinen.', hu: 'Opcionális lezárás: a sorozat végén csökkented a súlyt, és azonnal folytatod további ismétlésekkel. Az intenzitás növelésének egy módja. Nem kötelező.', sv: 'En valfri avslutning: i slutet av ett set minskar du vikten och fortsätter direkt med fler repetitioner. Ett sätt att lägga till intensitet. Inte nödvändigt.' }
	},
	superset: {
		title: { en: 'Superset', fi: 'Supersarja', hu: 'Szupersorozat', sv: 'Superset' },
		body: { en: 'Two exercises done back to back with no rest between them, usually to save time. Optional.', fi: 'Kaksi liikettä peräkkäin ilman lepoa niiden välissä, yleensä ajan säästämiseksi. Vapaaehtoinen.', hu: 'Két gyakorlat egymás után, köztük pihenő nélkül, általában időmegtakarítás céljából. Opcionális.', sv: 'Två övningar gjorda i följd utan vila mellan dem, oftast för att spara tid. Valfritt.' }
	},
	cardio: {
		title: { en: 'Cardio', fi: 'Kardio', hu: 'Kardió', sv: 'Kondition' },
		body: { en: 'Easy aerobic activity such as walking, cycling or swimming, done in ADDITION to your strength days, for heart health and recovery. It does not replace the strength sessions you chose.', fi: 'Kevyttä aerobista liikuntaa, kuten kävely, pyöräily tai uinti, tehtynä voimapäivien LISÄKSI sydämen terveyden ja palautumisen vuoksi. Se ei korvaa valitsemiasi voimaharjoituksia.', hu: 'Könnyű aerob mozgás, például séta, kerékpározás vagy úszás, az erőedzéseid MELLETT végezve, a szív egészségéért és a regenerációért. Nem helyettesíti a választott erőedzéseket.', sv: 'Lätt aerob aktivitet som promenad, cykling eller simning, gjord UTÖVER dina styrkepass, för hjärthälsa och återhämtning. Den ersätter inte de styrkepass du valt.' }
	}
};
