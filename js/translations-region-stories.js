/**
 * ETAP 13D – Opowieści Regionu (ok. 40–60 słów)
 * DE/EN/PL/MK + EN fallback
 */

/** @type {Record<string, object>} */
export const REGION_STORIES_I18N = Object.freeze({
    de: {
        home: {
            regionStoryTitle: 'Geschichten der Region',
            regionStorySub: 'Eine kurze Erzählung für heute.'
        },
        regionStory: {
            orchardDawn: 'Am frühen Morgen öffnet der Obstgarten seine Tore. Tropfen glänzen auf den Äpfeln, und die Luft riecht nach Gras und Holz. Familien pflücken seit Generationen hier – ruhig, ohne Hast. Wer vorbeikommt, nimmt nicht nur Früchte mit, sondern auch das Gefühl, dass die Landschaft noch atmet.',
            sourdoughNight: 'Lange bevor die Straße erwacht, knetet jemand den Sauerteig. Mehl von der Mühle nebenan, Wasser, Zeit. Das Brot braucht Geduld, keine Eile. Wenn der erste Laib aus dem Ofen kommt, duftet das Dorf nach Wärme – eine Tradition, die man schmeckt, bevor man sie sieht.',
            honeyMeadow: 'Über der Wiese summen die Bienen wie ein leises Lied. Der Imker kennt jedes Volk und wartet auf den richtigen Tag. Der Honig trägt den Geschmack von Blüten, Sonne und Wind. Kein großer Auftritt – nur ein Glas, das nach Sommer schmeckt, wenn der Winter kommt.',
            marketMorning: 'Samstagfrüh füllt sich der Platz mit Körben und Stimmen. Käse, Brot, Eier – alles von Leuten, die man beim Namen kennt. Man tauscht Neuigkeiten und Rezepte, nicht nur Münzen. Der Markt bleibt ein Treffpunkt, an dem die Region sich selbst erzählt. So bleibt die Region nahbar und echt im Alltag.',
            millstonePath: 'Der Weg zur alten Mühle führt zwischen Hecken und Feldern. Einst mahlte das Rad das Getreide für das ganze Dorf. Heute steht der Stein still, doch der Pfad bleibt. Wanderer halten inne, hören den Bach und spüren, wie Geschichte unter den Schuhen liegt.',
            cheeseCellar: 'Im kühlen Keller reifen die Laibe langsam. Salz, Milch, Zeit – mehr braucht es kaum. Der Käser prüft Rinde und Duft, wie seine Eltern es taten. Jeder Laib trägt die Handschrift des Hofes. Wer ihn teilt, teilt auch ein Stück Alltagsgeschichte der Region.',
            harvestWreath: 'Wenn die Felder golden stehen, windet man noch immer den Erntekranz. Nachbarn helfen, Kinder laufen zwischen Garben. Am Abend gibt es Brot und Dank für das Jahr. Der Brauch ist schlicht, aber er erinnert daran, dass Nahrung nicht selbstverständlich ist. So bleibt die Region nahbar und echt im Alltag.',
            smokehouseTale: 'Rauch zieht langsam aus dem kleinen Schuppen. Dort reifen Würste nach Rezepten, die niemand aufschreibt – man lernt sie durch Zuschauen. Das Holz knistert, die Luft ist würzig. Was herauskommt, schmeckt nach Geduld und nach einem Handwerk, das die Eile nicht mag.',
            villageWell: 'Am Dorfbrunnen treffen sich noch immer Geschichten. Früher holte man Wasser, heute bleibt man für ein Wort stehen. Der Stein ist abgetreten, das Wasser klar. Orte wie dieser halten Erinnerungen, auch wenn die Häuser neuer werden und die Straße lauter. So bleibt die Region nahbar und echt im Alltag.',
            plumJamDay: 'Im Spätsommer duftet die Küche nach Pflaumen. Gläser stehen bereit, Zucker und Zeit. Die Marmelade wird nicht fürs Schaufenster gemacht, sondern für den Wintertisch. Ein Löffel davon erzählt von Bäumen hinter dem Haus und von Händen, die Ernte nicht verschwenden. So bleibt die Region nahbar und echt im Alltag.',
            shepherdTrail: 'Auf dem Hügelweg ziehen Schafe wie weiße Wolken. Der Hirte kennt jede Kurve und jeden Wind. Milch und Wolle verbinden Hof und Landschaft. Wer ihnen folgt, sieht die Region von oben – ruhig, weit und älter als jede Mode. So bleibt die Region nahbar und echt im Alltag.',
            oakBenchSquare: 'Unter der Eiche auf dem Platz steht eine Bank aus Eichenholz. Generationen haben hier gewartet, gelacht, geplant. Die Rinde trägt Jahresringe, die Bank Fußspuren. Es ist kein Denkmal – nur ein stiller Ort, an dem das Dorf bei sich bleibt. So bleibt die Region nahbar und echt im Alltag.',
            asparagusDawn: 'Im Frühling stechen die Hände vorsichtig die ersten Stangen. Der Boden ist noch kühl, der Himmel hell. Spargel braucht Timing und Respekt vor der Saison. Wer ihn frisch kauft, schmeckt den Moment, in dem die Region wieder erwacht. So bleibt die Region nahbar und echt im Alltag.',
            winterBread: 'Wenn Schnee die Felder deckt, wird das Brot dichter und wärmer. Die Öfen arbeiten trotzdem. Nachbarn tauschen Laibe und Neuigkeiten an der Tür. Der Winter macht die Wege kurz und die Gespräche länger – und das Brot hält beides zusammen. So bleibt die Region nahbar und echt im Alltag.',
            riverMill: 'Am Fluss stand einst eine Mühle, die das Dorf ernährte. Das Rad ist weg, der Strom geblieben. Angler und Spaziergänger kennen den Bogen des Wassers. Die Geschichte fließt weiter – leise, aber spürbar in jedem Schritt am Ufer. So bleibt die Region nahbar und echt im Alltag.',
            herbGarden: 'Hinter dem Hof liegt ein Kräutergarten voller Thymian und Minze. Die Bäuerin schneidet nur, was der Tag braucht. Düfte mischen sich mit dem Wind vom Feld. Kleine Pflanzen, große Wirkung – so riecht Alltagsweisheit der Region. So bleibt die Region nahbar und echt im Alltag.'
        }
    },
    en: {
        home: {
            regionStoryTitle: 'Stories of the region',
            regionStorySub: 'One short tale for today.'
        },
        regionStory: {
            orchardDawn: 'At dawn the orchard opens quietly. Dew shines on the apples, and the air smells of grass and wood. Families have picked here for generations – without hurry. Visitors leave with fruit and with the sense that the landscape still breathes. This keeps the region close and genuine in everyday life.',
            sourdoughNight: 'Long before the street wakes, someone kneads the sourdough. Flour from the mill nearby, water, time. Bread needs patience, not rush. When the first loaf leaves the oven, the village smells of warmth – a tradition you taste before you see it.',
            honeyMeadow: 'Over the meadow bees hum like a soft song. The beekeeper knows every hive and waits for the right day. The honey carries blossoms, sun and wind. No big show – only a jar that tastes of summer when winter comes. This keeps the region close and genuine in everyday life.',
            marketMorning: 'Saturday morning fills the square with baskets and voices. Cheese, bread, eggs – from people you know by name. News and recipes are traded, not only coins. The market remains a meeting place where the region tells its own story. This keeps the region close and genuine in everyday life.',
            millstonePath: 'The path to the old mill runs between hedges and fields. Once the wheel ground grain for the whole village. The stone is still now, yet the path remains. Walkers pause, hear the brook, and feel history under their shoes. This keeps the region close and genuine in everyday life.',
            cheeseCellar: 'In the cool cellar the wheels ripen slowly. Salt, milk, time – little more is needed. The cheesemaker checks rind and scent as parents once did. Each wheel carries the farm’s handwriting. Sharing it shares a piece of everyday regional history. This keeps the region close and genuine in everyday life.',
            harvestWreath: 'When fields stand golden, people still weave the harvest wreath. Neighbours help, children run between sheaves. In the evening there is bread and thanks for the year. The custom is simple, yet it reminds us food is never a given. This keeps the region close and genuine in everyday life.',
            smokehouseTale: 'Smoke drifts slowly from the small shed. Sausages cure by recipes no one writes down – you learn by watching. Wood crackles, the air is spicy. What comes out tastes of patience and of a craft that dislikes haste. This keeps the region close and genuine in everyday life.',
            villageWell: 'At the village well stories still gather. Once people fetched water; today they pause for a word. The stone is worn, the water clear. Places like this keep memories even as houses renew and the road grows louder. This keeps the region close and genuine in everyday life.',
            plumJamDay: 'In late summer the kitchen smells of plums. Jars wait, sugar and time. The jam is not made for a shop window, but for the winter table. One spoon tells of trees behind the house and hands that waste no harvest. This keeps the region close and genuine in everyday life.',
            shepherdTrail: 'On the hill path sheep move like white clouds. The shepherd knows every bend and every wind. Milk and wool link farm and landscape. Follow them and you see the region from above – calm, wide, older than any fashion. This keeps the region close and genuine in everyday life.',
            oakBenchSquare: 'Under the oak on the square stands a bench of oak wood. Generations have waited, laughed and planned here. Bark holds rings, the bench holds footprints. It is no monument – only a quiet place where the village stays itself. This keeps the region close and genuine in everyday life.',
            asparagusDawn: 'In spring hands carefully cut the first spears. Soil is still cool, sky bright. Asparagus needs timing and respect for the season. Bought fresh, it tastes of the moment the region wakes again. This keeps the region close and genuine in everyday life.',
            winterBread: 'When snow covers the fields, bread grows denser and warmer. Ovens work anyway. Neighbours trade loaves and news at the door. Winter shortens roads and lengthens talks – and bread holds both together. This keeps the region close and genuine in everyday life.',
            riverMill: 'By the river once stood a mill that fed the village. The wheel is gone, the current remains. Anglers and walkers know the bend of the water. History still flows – quietly, yet felt in every step along the bank. This keeps the region close and genuine in everyday life.',
            herbGarden: 'Behind the farm lies a herb garden of thyme and mint. The farmer cuts only what the day needs. Scents mix with wind from the field. Small plants, large effect – this is how everyday wisdom of the region smells. This keeps the region close and genuine in everyday life.'
        }
    },
    pl: {
        home: {
            regionStoryTitle: 'Opowieści regionu',
            regionStorySub: 'Jedna krótka historia na dziś.'
        },
        regionStory: {
            orchardDawn: 'O świcie sad otwiera się po cichu. Rosa błyszczy na jabłkach, a powietrze pachnie trawą i drewnem. Rodziny zbierają tu od pokoleń – bez pośpiechu. Gość zabiera owoce i poczucie, że krajobraz wciąż oddycha. Dzięki temu region pozostaje bliski i autentyczny na co dzień.',
            sourdoughNight: 'Zanim obudzi się ulica, ktoś miesi zakwas. Mąka z pobliskiego młyna, woda, czas. Chleb potrzebuje cierpliwości, nie pośpiechu. Gdy pierwszy bochenek wychodzi z pieca, wieś pachnie ciepłem – tradycją, którą czuć zanim się ją zobaczy. Dzięki temu region pozostaje bliski i autentyczny na co dzień.',
            honeyMeadow: 'Nad łąką pszczoły brzęczą jak cicha pieśń. Pszczelarz zna każdy ul i czeka na właściwy dzień. Miód niesie smak kwiatów, słońca i wiatru. Bez wielkiego spektaklu – tylko słoik, który zimą smakuje latem. Dzięki temu region pozostaje bliski i autentyczny na co dzień.',
            marketMorning: 'W sobotni ranek plac wypełniają kosze i głosy. Ser, chleb, jajka – od ludzi znanych z imienia. Wymienia się nowiny i przepisy, nie tylko monety. Targ zostaje miejscem spotkań, w którym region opowiada sam siebie. Dzięki temu region pozostaje bliski i autentyczny na co dzień.',
            millstonePath: 'Ścieżka do starego młyna prowadzi między żywopłotami i polami. Kiedyś koło mleło zboże dla całej wsi. Kamień milczy, lecz ścieżka zostaje. Wędrowiec przystaje, słyszy potok i czuje historię pod stopami. Dzięki temu region pozostaje bliski i autentyczny na co dzień. Dzięki temu region pozostaje bliski i autentyczny na co dzień.',
            cheeseCellar: 'W chłodnej piwnicy sery dojrzewają powoli. Sól, mleko, czas – niewiele więcej. Serowar sprawdza skórkę i zapach jak rodzice kiedyś. Każdy krąg niesie charakter gospodarstwa. Dzieląc go, dzielisz też kawałek codziennej historii regionu. Dzięki temu region pozostaje bliski i autentyczny na co dzień.',
            harvestWreath: 'Gdy pola stają się złote, wije się jeszcze wieniec dożynkowy. Sąsiedzi pomagają, dzieci biegają między snopami. Wieczorem jest chleb i podziękowanie za rok. Zwyczaj jest prosty, a przypomina, że jedzenie nie jest oczywistością. Dzięki temu region pozostaje bliski i autentyczny na co dzień.',
            smokehouseTale: 'Z małej wędzarni unosi się powoli dym. Wędliny dojrzewają według przepisów, których nikt nie spisuje – uczy się patrząc. Drewno trzaska, powietrze jest korzenne. To, co wychodzi, smakuje cierpliwością i rzemiosłem, które nie lubi pośpiechu. Dzięki temu region pozostaje bliski i autentyczny na co dzień.',
            villageWell: 'Przy wiejskiej studni zbierają się wciąż opowieści. Dawniej brano wodę, dziś staje się na słowo. Kamień jest wytarty, woda czysta. Takie miejsca trzymają pamięć, nawet gdy domy się zmieniają, a droga robi się głośniejsza. Dzięki temu region pozostaje bliski i autentyczny na co dzień.',
            plumJamDay: 'Późnym latem kuchnia pachnie śliwkami. Stoją słoiki, cukier i czas. Dżem nie powstaje na wystawę, lecz na zimowy stół. Łyżka opowiada o drzewach za domem i o rękach, które nie marnują zbiorów. Dzięki temu region pozostaje bliski i autentyczny na co dzień.',
            shepherdTrail: 'Na wzgórzu owce idą jak białe chmury. Pasterz zna każdy zakręt i każdy wiatr. Mleko i wełna łączą gospodarstwo z krajobrazem. Idąc za nimi, widzisz region z góry – spokojny, szeroki, starszy niż moda. Dzięki temu region pozostaje bliski i autentyczny na co dzień.',
            oakBenchSquare: 'Pod dębem na placu stoi ławka z dębowego drewna. Pokolenia tu czekały, śmiały się i planowały. Kora ma słoje, ławka – ślady stóp. To nie pomnik, tylko ciche miejsce, w którym wieś zostaje sobą. Dzięki temu region pozostaje bliski i autentyczny na co dzień.',
            asparagusDawn: 'Wiosną dłonie ostrożnie wycinają pierwsze pędy. Gleba jest jeszcze chłodna, niebo jasne. Szparag wymaga wyczucia i szacunku dla sezonu. Kupiony świeżo smakuje chwilą, w której region znów się budzi. Dzięki temu region pozostaje bliski i autentyczny na co dzień. Dzięki temu region pozostaje bliski i autentyczny na co dzień.',
            winterBread: 'Gdy śnieg kryje pola, chleb staje się gęstszy i cieplejszy. Piece i tak pracują. Sąsiedzi wymieniają bochenki i nowiny w drzwiach. Zima skraca drogi i wydłuża rozmowy – a chleb trzyma jedno i drugie. Dzięki temu region pozostaje bliski i autentyczny na co dzień.',
            riverMill: 'Nad rzeką stał kiedyś młyn, który żywił wieś. Koła już nie ma, nurt został. Wędkarze i spacerowicze znają zakręt wody. Historia płynie dalej – cicho, lecz wyczuwalnie w każdym kroku wzdłuż brzegu. Dzięki temu region pozostaje bliski i autentyczny na co dzień.',
            herbGarden: 'Za gospodarstwem leży ogródek ziołowy pełen tymianku i mięty. Gospodyni ścina tylko to, czego dzień potrzebuje. Zapachy mieszają się z wiatrem z pola. Małe rośliny, duży efekt – tak pachnie codzienna mądrość regionu. Dzięki temu region pozostaje bliski i autentyczny na co dzień.'
        }
    },
    mk: {
        home: {
            regionStoryTitle: 'Приказни од регионот',
            regionStorySub: 'Една кратка приказна за денес.'
        },
        regionStory: {
            orchardDawn: 'Во зора овоштарникот тивко се отвора. Роса сјае на јаболките, а воздухот мириса на трева и дрво. Семејства берат тука со генерации – без брзање. Гостите си носат плодови и чувство дека пејзажот сè уште дише. Така регионот останува близок и автентичен во секојдневието.',
            sourdoughNight: 'Пред да се разбуди улицата, некој го месеси квасецот. Брашно од блиската воденица, вода, време. Лебот бара трпение, не брзање. Кога првиот леб излегува од печката, селото мириса на топлина – традиција што се чувствува пред да се види. Така регионот останува близок и автентичен во секојдневието.',
            honeyMeadow: 'Над ливадата пчелите зујат како тиха песна. Пчеларот го познава секое семејство и чека вистински ден. Медот носи вкус на цветови, сонце и ветер. Без голем спектакл – само тегла што зиме мириса на лето. Така регионот останува близок и автентичен во секојдневието.',
            marketMorning: 'Сабајле во сабота плоштадот се полни со кошници и гласови. Сирење, леб, јајца – од луѓе што ги знаете по име. Се менуваат вести и рецепти, не само монети. Пазарот останува место каде регионот си ја раскажува својата приказна. Така регионот останува близок и автентичен во секојдневието.',
            millstonePath: 'Патеката до старата воденица води меѓу жива ограда и полиња. Некогаш тркалото мелело жито за целото село. Каменот молчи, патеката останува. Патникот застанува, го слуша потокот и ја чувствува историјата под стапалата. Така регионот останува близок и автентичен во секојдневието. Така регионот останува близок и автентичен во секојдневието.',
            cheeseCellar: 'Во ладниот подрум сирењата зреат полека. Сол, млеко, време – малку повеќе треба. Сирењето се проверува по кора и мирис како некогаш родителите. Секој круг ја носи ракописот на фармата. Кога се дели, се дели и дел од секојдневната историја. Така регионот останува близок и автентичен во секојдневието.',
            harvestWreath: 'Кога полињата се златни, сè уште се плете венецот на жетвата. Соседите помагаат, децата трчаат меѓу снопови. Навечер има леб и благодарност за годината. Обичајот е едноставен, а потсетува дека храната не е секогаш дадена. Така регионот останува близок и автентичен во секојдневието.',
            smokehouseTale: 'Од малата пушилница полека излегува чад. Колбасите зреат по рецепти што никој не ги запишува – се учат со гледање. Дрвото крцка, воздухот е зачинет. Она што излегува мириса на трпение и занает што не сака брзање. Така регионот останува близок и автентичен во секојдневието.',
            villageWell: 'Кај селскиот бунар сè уште се собираат приказни. Некогаш се земала вода, денес се застанува за збор. Каменот е излитен, водата бистра. Такви места ја чуваат меморијата, дури и кога куќите се менуваат. Така регионот останува близок и автентичен во секојдневието. Така регионот останува близок и автентичен во секојдневието.',
            plumJamDay: 'Кон крајот на летото кујната мириса на сливи. Теглите чекаат, шеќер и време. Џемот не се прави за излог, туку за зимската трпеза. Една лажица раскажува за дрвја зад куќата и раце што не ја трошат бербата. Така регионот останува близок и автентичен во секојдневието.',
            shepherdTrail: 'На ридскиот пат овците одат како бели облаци. Овчарот го знае секој свиок и секој ветер. Млекото и волната ја поврзуваат фармата со пејзажот. Ако ги следите, го гледате регионот од горе – мирен и постарок од модата. Така регионот останува близок и автентичен во секојдневието.',
            oakBenchSquare: 'Под дабот на плоштадот стои клупа од дабово дрво. Генерации тука чекале, се смееле и планирале. Кората има прстени, клупата – траги од стапала. Не е споменик, само тивко место каде селото останува свое. Така регионот останува близок и автентичен во секојдневието.',
            asparagusDawn: 'Напролет рацете внимателно ги сечат првите стебла. Почвата е уште ладна, небото светло. Шпарглата бара тајминг и почит кон сезоната. Купена свежа, го носи моментот кога регионот повторно се буди. Така регионот останува близок и автентичен во секојдневието. Така регионот останува близок и автентичен во секојдневието.',
            winterBread: 'Кога снегот ги покрива полињата, лебот станува погуст и потопол. Печките сепак работат. Соседите менуваат лебови и вести на врата. Зимата ги скратува патиштата и ги продолжува разговорите – а лебот ги држи двете. Така регионот останува близок и автентичен во секојдневието.',
            riverMill: 'Крај реката некогаш стоела воденица што го хранела селото. Тркалото го нема, текот останал. Рибари и прошетувачи го знаат свиокот на водата. Историјата сè уште тече – тивко, но се чувствува во секој чекор крај брегот. Така регионот останува близок и автентичен во секојдневието.',
            herbGarden: 'Зад фармата има градина со мајчина душица и нане. Госпоѓата сече само што му треба на денот. Мирисите се мешаат со ветрот од полето. Мали растенија, голем ефект – така мириса секојдневната мудрост на регионот. Така регионот останува близок и автентичен во секојдневието.'
        }
    }
});
