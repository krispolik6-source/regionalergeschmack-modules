/**
 * Etap 3 – treści UI: polecane produkty, historie, przepisy (DE/EN/PL + wybrane języki).
 * Merge do TRANSLATIONS w translations.js. Pozostałe języki dostają fallback EN.
 */

/** @type {Record<string, { name: string, ingredients: Record<string, string> }>} */
const RECIPES_DE = {
    bauernfruehstueck: {
        name: 'Bauernfrühstück',
        ingredients: {
            potatoesHof: 'Kartoffeln vom Hof Müller',
            freeEggs: 'Freilandeier',
            onion: 'Zwiebel',
            regionalButter: 'Regionale Butter',
            chives: 'Schnittlauch'
        }
    },
    kartoffelsalat: {
        name: 'Kartoffelsalat',
        ingredients: {
            bioPotatoes: 'Bio-Kartoffeln',
            vegStock: 'Gemüsebrühe',
            appleVinegar: 'Apfelessig',
            rapeseedOil: 'Rapsöl',
            mustard: 'Senf'
        }
    },
    flammkuchen: {
        name: 'Flammkuchen',
        ingredients: {
            dough: 'Flammkuchenteig',
            sourCream: 'Schmand',
            onions: 'Zwiebeln',
            baconBerg: 'Speck von Metzgerei Berg',
            chives: 'Schnittlauch'
        }
    },
    kaesekuchen: {
        name: 'Käsekuchen',
        ingredients: {
            quark: 'Quark / Frischkäse von der Molkerei',
            eggs: 'Eier',
            butter: 'Butter',
            sugar: 'Zucker',
            vanilla: 'Vanille'
        }
    },
    apfelstrudel: {
        name: 'Apfelstrudel',
        ingredients: {
            applesHof: 'Äpfel vom Hof Müller',
            pastry: 'Blätterteig oder Strudelteig',
            butter: 'Butter',
            cinnamon: 'Zimt',
            raisins: 'Rosinen'
        }
    },
    spargelsuppe: {
        name: 'Spargelsuppe',
        ingredients: {
            asparagus: 'Spargel / saisonales Gemüse',
            stock: 'Brühe',
            creamMilk: 'Sahne oder Milch regional',
            butter: 'Butter',
            chives: 'Schnittlauch'
        }
    },
    bratkartoffeln: {
        name: 'Bratkartoffeln',
        ingredients: {
            boiledPotatoes: 'Gekochte Kartoffeln',
            onion: 'Zwiebel',
            butterOil: 'Butter oder Öl',
            saltPepper: 'Salz und Pfeffer',
            baconOptional: 'Optional: Speckwürfel'
        }
    },
    brotzeit: {
        name: 'Brotzeit',
        ingredients: {
            farmBread: 'Bauernbrot von Schmidt',
            butter: 'Butter',
            cheeseSausage: 'Käse oder Wurst',
            cucumberRadish: 'Gurke / Radieschen',
            mustard: 'Senf'
        }
    }
};

const RECIPES_EN = {
    bauernfruehstueck: {
        name: "Farmer's breakfast",
        ingredients: {
            potatoesHof: 'Potatoes from Hof Müller',
            freeEggs: 'Free-range eggs',
            onion: 'Onion',
            regionalButter: 'Regional butter',
            chives: 'Chives'
        }
    },
    kartoffelsalat: {
        name: 'Potato salad',
        ingredients: {
            bioPotatoes: 'Organic potatoes',
            vegStock: 'Vegetable stock',
            appleVinegar: 'Apple cider vinegar',
            rapeseedOil: 'Rapeseed oil',
            mustard: 'Mustard'
        }
    },
    flammkuchen: {
        name: 'Flammkuchen',
        ingredients: {
            dough: 'Flammkuchen dough',
            sourCream: 'Sour cream',
            onions: 'Onions',
            baconBerg: 'Bacon from Metzgerei Berg',
            chives: 'Chives'
        }
    },
    kaesekuchen: {
        name: 'Cheesecake',
        ingredients: {
            quark: 'Quark / fresh cheese from the dairy',
            eggs: 'Eggs',
            butter: 'Butter',
            sugar: 'Sugar',
            vanilla: 'Vanilla'
        }
    },
    apfelstrudel: {
        name: 'Apple strudel',
        ingredients: {
            applesHof: 'Apples from Hof Müller',
            pastry: 'Puff pastry or strudel dough',
            butter: 'Butter',
            cinnamon: 'Cinnamon',
            raisins: 'Raisins'
        }
    },
    spargelsuppe: {
        name: 'Asparagus soup',
        ingredients: {
            asparagus: 'Asparagus / seasonal vegetables',
            stock: 'Stock',
            creamMilk: 'Regional cream or milk',
            butter: 'Butter',
            chives: 'Chives'
        }
    },
    bratkartoffeln: {
        name: 'Fried potatoes',
        ingredients: {
            boiledPotatoes: 'Boiled potatoes',
            onion: 'Onion',
            butterOil: 'Butter or oil',
            saltPepper: 'Salt and pepper',
            baconOptional: 'Optional: diced bacon'
        }
    },
    brotzeit: {
        name: 'Bread platter',
        ingredients: {
            farmBread: 'Farmhouse bread from Schmidt',
            butter: 'Butter',
            cheeseSausage: 'Cheese or sausage',
            cucumberRadish: 'Cucumber / radish',
            mustard: 'Mustard'
        }
    }
};

const RECIPES_PL = {
    bauernfruehstueck: {
        name: 'Chłopskie śniadanie',
        ingredients: {
            potatoesHof: 'Ziemniaki z Hof Müller',
            freeEggs: 'Jaja od kur z wolnego wybiegu',
            onion: 'Cebula',
            regionalButter: 'Masło regionalne',
            chives: 'Szczypiorek'
        }
    },
    kartoffelsalat: {
        name: 'Sałatka ziemniaczana',
        ingredients: {
            bioPotatoes: 'Ziemniaki bio',
            vegStock: 'Bulion warzywny',
            appleVinegar: 'Ocet jabłkowy',
            rapeseedOil: 'Olej rzepakowy',
            mustard: 'Musztarda'
        }
    },
    flammkuchen: {
        name: 'Placek alzacki',
        ingredients: {
            dough: 'Ciasto na placek alzacki',
            sourCream: 'Śmietana',
            onions: 'Cebula',
            baconBerg: 'Boczek z Metzgerei Berg',
            chives: 'Szczypiorek'
        }
    },
    kaesekuchen: {
        name: 'Sernik',
        ingredients: {
            quark: 'Twaróg / ser świeży z mleczarni',
            eggs: 'Jaja',
            butter: 'Masło',
            sugar: 'Cukier',
            vanilla: 'Wanilia'
        }
    },
    apfelstrudel: {
        name: 'Strudel jabłkowy',
        ingredients: {
            applesHof: 'Jabłka z Hof Müller',
            pastry: 'Ciasto francuskie lub na strudel',
            butter: 'Masło',
            cinnamon: 'Cynamon',
            raisins: 'Rodzynki'
        }
    },
    spargelsuppe: {
        name: 'Zupa szparagowa',
        ingredients: {
            asparagus: 'Szparagi / sezonowe warzywa',
            stock: 'Bulion',
            creamMilk: 'Regionalna śmietana lub mleko',
            butter: 'Masło',
            chives: 'Szczypiorek'
        }
    },
    bratkartoffeln: {
        name: 'Ziemniaki smażone',
        ingredients: {
            boiledPotatoes: 'Ugotowane ziemniaki',
            onion: 'Cebula',
            butterOil: 'Masło lub olej',
            saltPepper: 'Sól i pieprz',
            baconOptional: 'Opcjonalnie: kostka boczku'
        }
    },
    brotzeit: {
        name: 'Deska wiejska',
        ingredients: {
            farmBread: 'Chleb wiejski od Schmidt',
            butter: 'Masło',
            cheeseSausage: 'Ser lub kiełbasa',
            cucumberRadish: 'Ogórek / rzodkiewka',
            mustard: 'Musztarda'
        }
    }
};

const RECIPES_FR = {
    bauernfruehstueck: {
        name: 'Petit-déjeuner paysan',
        ingredients: {
            potatoesHof: 'Pommes de terre de la ferme Müller',
            freeEggs: 'Œufs de poules élevées en plein air',
            onion: 'Oignon',
            regionalButter: 'Beurre régional',
            chives: 'Ciboulette'
        }
    },
    kartoffelsalat: {
        name: 'Salade de pommes de terre',
        ingredients: {
            bioPotatoes: 'Pommes de terre bio',
            vegStock: 'Bouillon de légumes',
            appleVinegar: 'Vinaigre de cidre',
            rapeseedOil: 'Huile de colza',
            mustard: 'Moutarde'
        }
    },
    flammkuchen: {
        name: 'Tarte flambée',
        ingredients: {
            dough: 'Pâte à flammkuchen',
            sourCream: 'Crème fraîche',
            onions: 'Oignons',
            baconBerg: 'Lard de la Metzgerei Berg',
            chives: 'Ciboulette'
        }
    },
    kaesekuchen: {
        name: 'Gâteau au fromage blanc',
        ingredients: {
            quark: 'Fromage blanc de la laiterie',
            eggs: 'Œufs',
            butter: 'Beurre',
            sugar: 'Sucre',
            vanilla: 'Vanille'
        }
    },
    apfelstrudel: {
        name: 'Strudel aux pommes',
        ingredients: {
            applesHof: 'Pommes de la ferme Müller',
            pastry: 'Pâte feuilletée ou à strudel',
            butter: 'Beurre',
            cinnamon: 'Cannelle',
            raisins: 'Raisins secs'
        }
    },
    spargelsuppe: {
        name: 'Soupe d’asperges',
        ingredients: {
            asparagus: 'Asperges / légumes de saison',
            stock: 'Bouillon',
            creamMilk: 'Crème ou lait régional',
            butter: 'Beurre',
            chives: 'Ciboulette'
        }
    },
    bratkartoffeln: {
        name: 'Pommes de terre sautées',
        ingredients: {
            boiledPotatoes: 'Pommes de terre cuites',
            onion: 'Oignon',
            butterOil: 'Beurre ou huile',
            saltPepper: 'Sel et poivre',
            baconOptional: 'En option : dés de lard'
        }
    },
    brotzeit: {
        name: 'Assiette de pain',
        ingredients: {
            farmBread: 'Pain de campagne de Schmidt',
            butter: 'Beurre',
            cheeseSausage: 'Fromage ou saucisse',
            cucumberRadish: 'Concombre / radis',
            mustard: 'Moutarde'
        }
    }
};

const RECIPES_ES = {
    bauernfruehstueck: {
        name: 'Desayuno campesino',
        ingredients: {
            potatoesHof: 'Patatas de Hof Müller',
            freeEggs: 'Huevos de gallinas camperas',
            onion: 'Cebolla',
            regionalButter: 'Mantequilla regional',
            chives: 'Cebollino'
        }
    },
    kartoffelsalat: {
        name: 'Ensalada de patatas',
        ingredients: {
            bioPotatoes: 'Patatas ecológicas',
            vegStock: 'Caldo de verduras',
            appleVinegar: 'Vinagre de manzana',
            rapeseedOil: 'Aceite de colza',
            mustard: 'Mostaza'
        }
    },
    flammkuchen: {
        name: 'Flammkuchen',
        ingredients: {
            dough: 'Masa de flammkuchen',
            sourCream: 'Nata agria',
            onions: 'Cebollas',
            baconBerg: 'Bacon de Metzgerei Berg',
            chives: 'Cebollino'
        }
    },
    kaesekuchen: {
        name: 'Tarta de queso',
        ingredients: {
            quark: 'Requesón / queso fresco de la lechería',
            eggs: 'Huevos',
            butter: 'Mantequilla',
            sugar: 'Azúcar',
            vanilla: 'Vainilla'
        }
    },
    apfelstrudel: {
        name: 'Strudel de manzana',
        ingredients: {
            applesHof: 'Manzanas de Hof Müller',
            pastry: 'Hojaldre o masa de strudel',
            butter: 'Mantequilla',
            cinnamon: 'Canela',
            raisins: 'Pasas'
        }
    },
    spargelsuppe: {
        name: 'Sopa de espárragos',
        ingredients: {
            asparagus: 'Espárragos / verduras de temporada',
            stock: 'Caldo',
            creamMilk: 'Nata o leche regional',
            butter: 'Mantequilla',
            chives: 'Cebollino'
        }
    },
    bratkartoffeln: {
        name: 'Patatas fritas caseras',
        ingredients: {
            boiledPotatoes: 'Patatas cocidas',
            onion: 'Cebolla',
            butterOil: 'Mantequilla o aceite',
            saltPepper: 'Sal y pimienta',
            baconOptional: 'Opcional: bacon en dados'
        }
    },
    brotzeit: {
        name: 'Tabla de pan',
        ingredients: {
            farmBread: 'Pan de campo de Schmidt',
            butter: 'Mantequilla',
            cheeseSausage: 'Queso o embutido',
            cucumberRadish: 'Pepino / rábano',
            mustard: 'Mostaza'
        }
    }
};

const RECIPES_IT = {
    bauernfruehstueck: {
        name: 'Colazione contadina',
        ingredients: {
            potatoesHof: 'Patate di Hof Müller',
            freeEggs: 'Uova di galline allevate all’aperto',
            onion: 'Cipolla',
            regionalButter: 'Burro regionale',
            chives: 'Erba cipollina'
        }
    },
    kartoffelsalat: {
        name: 'Insalata di patate',
        ingredients: {
            bioPotatoes: 'Patate biologiche',
            vegStock: 'Brodo vegetale',
            appleVinegar: 'Aceto di mele',
            rapeseedOil: 'Olio di colza',
            mustard: 'Senape'
        }
    },
    flammkuchen: {
        name: 'Flammkuchen',
        ingredients: {
            dough: 'Pasta per flammkuchen',
            sourCream: 'Panna acida',
            onions: 'Cipolle',
            baconBerg: 'Speck di Metzgerei Berg',
            chives: 'Erba cipollina'
        }
    },
    kaesekuchen: {
        name: 'Torta al formaggio',
        ingredients: {
            quark: 'Quark / formaggio fresco del caseificio',
            eggs: 'Uova',
            butter: 'Burro',
            sugar: 'Zucchero',
            vanilla: 'Vaniglia'
        }
    },
    apfelstrudel: {
        name: 'Strudel di mele',
        ingredients: {
            applesHof: 'Mele di Hof Müller',
            pastry: 'Pasta sfoglia o per strudel',
            butter: 'Burro',
            cinnamon: 'Cannella',
            raisins: 'Uvetta'
        }
    },
    spargelsuppe: {
        name: 'Zuppa di asparagi',
        ingredients: {
            asparagus: 'Asparagi / verdure di stagione',
            stock: 'Brodo',
            creamMilk: 'Panna o latte regionale',
            butter: 'Burro',
            chives: 'Erba cipollina'
        }
    },
    bratkartoffeln: {
        name: 'Patate fritte in padella',
        ingredients: {
            boiledPotatoes: 'Patate lessate',
            onion: 'Cipolla',
            butterOil: 'Burro o olio',
            saltPepper: 'Sale e pepe',
            baconOptional: 'Opzionale: cubetti di pancetta'
        }
    },
    brotzeit: {
        name: 'Tagliere di pane',
        ingredients: {
            farmBread: 'Pane di campagna di Schmidt',
            butter: 'Burro',
            cheeseSausage: 'Formaggio o salsiccia',
            cucumberRadish: 'Cetriolo / ravanello',
            mustard: 'Senape'
        }
    }
};

const RECIPES_NL = {
    bauernfruehstueck: {
        name: 'Boerenontbijt',
        ingredients: {
            potatoesHof: 'Aardappelen van Hof Müller',
            freeEggs: 'Vrije-uitloopeieren',
            onion: 'Ui',
            regionalButter: 'Regionale boter',
            chives: 'Bieslook'
        }
    },
    kartoffelsalat: {
        name: 'Aardappelsalade',
        ingredients: {
            bioPotatoes: 'Bio-aardappelen',
            vegStock: 'Groentebouillon',
            appleVinegar: 'Appelazijn',
            rapeseedOil: 'Koolzaadolie',
            mustard: 'Mosterd'
        }
    },
    flammkuchen: {
        name: 'Flammkuchen',
        ingredients: {
            dough: 'Flammkuchendeeg',
            sourCream: 'Zure room',
            onions: 'Uien',
            baconBerg: 'Spek van Metzgerei Berg',
            chives: 'Bieslook'
        }
    },
    kaesekuchen: {
        name: 'Kwarktaart',
        ingredients: {
            quark: 'Kwark / verse kaas van de zuivelboerderij',
            eggs: 'Eieren',
            butter: 'Boter',
            sugar: 'Suiker',
            vanilla: 'Vanille'
        }
    },
    apfelstrudel: {
        name: 'Appelstrudel',
        ingredients: {
            applesHof: 'Appels van Hof Müller',
            pastry: 'Bladerdeeg of strudeldeeg',
            butter: 'Boter',
            cinnamon: 'Kaneel',
            raisins: 'Rozijnen'
        }
    },
    spargelsuppe: {
        name: 'Aspergesoep',
        ingredients: {
            asparagus: 'Asperges / seizoensgroenten',
            stock: 'Bouillon',
            creamMilk: 'Regionale room of melk',
            butter: 'Boter',
            chives: 'Bieslook'
        }
    },
    bratkartoffeln: {
        name: 'Gebakken aardappelen',
        ingredients: {
            boiledPotatoes: 'Gekookte aardappelen',
            onion: 'Ui',
            butterOil: 'Boter of olie',
            saltPepper: 'Zout en peper',
            baconOptional: 'Optioneel: spekblokjes'
        }
    },
    brotzeit: {
        name: 'Broodplank',
        ingredients: {
            farmBread: 'Boerenbrood van Schmidt',
            butter: 'Boter',
            cheeseSausage: 'Kaas of worst',
            cucumberRadish: 'Komkommer / radijs',
            mustard: 'Mosterd'
        }
    }
};

const RECIPES_RU = {
    bauernfruehstueck: {
        name: 'Крестьянский завтрак',
        ingredients: {
            potatoesHof: 'Картофель с фермы Hof Müller',
            freeEggs: 'Яйца свободного выгула',
            onion: 'Лук',
            regionalButter: 'Региональное масло',
            chives: 'Зелёный лук'
        }
    },
    kartoffelsalat: {
        name: 'Картофельный салат',
        ingredients: {
            bioPotatoes: 'Био-картофель',
            vegStock: 'Овощной бульон',
            appleVinegar: 'Яблочный уксус',
            rapeseedOil: 'Рапсовое масло',
            mustard: 'Горчица'
        }
    },
    flammkuchen: {
        name: 'Фламмкухен',
        ingredients: {
            dough: 'Тесто для фламмкухена',
            sourCream: 'Сметана',
            onions: 'Лук',
            baconBerg: 'Бекон от Metzgerei Berg',
            chives: 'Зелёный лук'
        }
    },
    kaesekuchen: {
        name: 'Творожный пирог',
        ingredients: {
            quark: 'Творог / свежий сыр с молочной фермы',
            eggs: 'Яйца',
            butter: 'Масло',
            sugar: 'Сахар',
            vanilla: 'Ваниль'
        }
    },
    apfelstrudel: {
        name: 'Яблочный штрудель',
        ingredients: {
            applesHof: 'Яблоки с фермы Hof Müller',
            pastry: 'Слоеное или штрудельное тесто',
            butter: 'Масло',
            cinnamon: 'Корица',
            raisins: 'Изюм'
        }
    },
    spargelsuppe: {
        name: 'Спаржевый суп',
        ingredients: {
            asparagus: 'Спаржа / сезонные овощи',
            stock: 'Бульон',
            creamMilk: 'Региональные сливки или молоко',
            butter: 'Масло',
            chives: 'Зелёный лук'
        }
    },
    bratkartoffeln: {
        name: 'Жареный картофель',
        ingredients: {
            boiledPotatoes: 'Варёный картофель',
            onion: 'Лук',
            butterOil: 'Масло или растительное масло',
            saltPepper: 'Соль и перец',
            baconOptional: 'По желанию: кубики бекона'
        }
    },
    brotzeit: {
        name: 'Хлебная тарелка',
        ingredients: {
            farmBread: 'Деревенский хлеб от Schmidt',
            butter: 'Масло',
            cheeseSausage: 'Сыр или колбаса',
            cucumberRadish: 'Огурец / редис',
            mustard: 'Горчица'
        }
    }
};

const RECIPES_TR = {
    bauernfruehstueck: {
        name: 'Köylü kahvaltısı',
        ingredients: {
            potatoesHof: 'Hof Müller’den patates',
            freeEggs: 'Gezen tavuk yumurtası',
            onion: 'Soğan',
            regionalButter: 'Yöresel tereyağı',
            chives: 'Frenk soğanı'
        }
    },
    kartoffelsalat: {
        name: 'Patates salatası',
        ingredients: {
            bioPotatoes: 'Organik patates',
            vegStock: 'Sebze suyu',
            appleVinegar: 'Elma sirkesi',
            rapeseedOil: 'Kanola yağı',
            mustard: 'Hardal'
        }
    },
    flammkuchen: {
        name: 'Flammkuchen',
        ingredients: {
            dough: 'Flammkuchen hamuru',
            sourCream: 'Ekşi krema',
            onions: 'Soğan',
            baconBerg: 'Metzgerei Berg’den pastırma',
            chives: 'Frenk soğanı'
        }
    },
    kaesekuchen: {
        name: 'Peynirli kek',
        ingredients: {
            quark: 'Süt çiftliğinden quark / taze peynir',
            eggs: 'Yumurta',
            butter: 'Tereyağı',
            sugar: 'Şeker',
            vanilla: 'Vanilya'
        }
    },
    apfelstrudel: {
        name: 'Elmalı strudel',
        ingredients: {
            applesHof: 'Hof Müller’den elma',
            pastry: 'Milföy veya strudel hamuru',
            butter: 'Tereyağı',
            cinnamon: 'Tarçın',
            raisins: 'Kuru üzüm'
        }
    },
    spargelsuppe: {
        name: 'Kuşkonmaz çorbası',
        ingredients: {
            asparagus: 'Kuşkonmaz / mevsim sebzeleri',
            stock: 'Et veya sebze suyu',
            creamMilk: 'Yöresel krema veya süt',
            butter: 'Tereyağı',
            chives: 'Frenk soğanı'
        }
    },
    bratkartoffeln: {
        name: 'Kızarmış patates',
        ingredients: {
            boiledPotatoes: 'Haşlanmış patates',
            onion: 'Soğan',
            butterOil: 'Tereyağı veya yağ',
            saltPepper: 'Tuz ve biber',
            baconOptional: 'İsteğe bağlı: pastırma küpleri'
        }
    },
    brotzeit: {
        name: 'Ekmek tabağı',
        ingredients: {
            farmBread: 'Schmidt’ten köy ekmeği',
            butter: 'Tereyağı',
            cheeseSausage: 'Peynir veya sucuk',
            cucumberRadish: 'Salatalık / turp',
            mustard: 'Hardal'
        }
    }
};

function recipesBlock(title, intro, timeMin, openProducer, easy, medium, hard, items) {
    return {
        title,
        intro,
        timeMin,
        openProducer,
        difficultyEasy: easy,
        difficultyMedium: medium,
        difficultyHard: hard,
        items
    };
}

function featured(lang) {
    const map = {
        de: {
            'feat-apples': { name: 'Bio-Äpfel', desc: 'Frisch vom Hof Müller – knackig und regional.' },
            'feat-bread': { name: 'Bauernbrot', desc: 'Sauerteigbrot aus der Bäckerei Schmidt.' },
            'feat-cheese': { name: 'Regionaler Käse', desc: 'Reifung über dem Rhein – mild und aromatisch.' },
            'feat-sausage': { name: 'Hausmacherwurst', desc: 'Nach Familienrezept von Metzgerei Berg.' },
            'feat-honey': { name: 'Blütenhonig', desc: 'Von der Imkerei Sonne aus der Rheinebene.' },
            'feat-yogurt': { name: 'Naturjoghurt', desc: 'Mild und cremig – ohne Zusatzstoffe.' },
            'feat-eggs': { name: 'Freilandeier', desc: 'Von Hühnern mit Auslauf auf dem Hof Müller.' },
            'feat-daily': { name: 'Tagesgericht', desc: 'Saisonal zubereitet im Gasthof Eifelblick.' }
        },
        en: {
            'feat-apples': { name: 'Organic apples', desc: 'Fresh from Hof Müller – crisp and regional.' },
            'feat-bread': { name: 'Farmhouse bread', desc: 'Sourdough from Bäckerei Schmidt.' },
            'feat-cheese': { name: 'Regional cheese', desc: 'Aged by the Rhine – mild and aromatic.' },
            'feat-sausage': { name: 'Homemade sausage', desc: 'Family recipe from Metzgerei Berg.' },
            'feat-honey': { name: 'Blossom honey', desc: 'From Imkerei Sonne in the Rhine plain.' },
            'feat-yogurt': { name: 'Natural yogurt', desc: 'Mild and creamy – no additives.' },
            'feat-eggs': { name: 'Free-range eggs', desc: 'From hens with outdoor access at Hof Müller.' },
            'feat-daily': { name: 'Dish of the day', desc: 'Seasonal cooking at Gasthof Eifelblick.' }
        },
        pl: {
            'feat-apples': { name: 'Jabłka bio', desc: 'Prosto z Hof Müller – chrupiące i regionalne.' },
            'feat-bread': { name: 'Chleb wiejski', desc: 'Na zakwasie z Bäckerei Schmidt.' },
            'feat-cheese': { name: 'Ser regionalny', desc: 'Dojrzewający nad Renem – łagodny i aromatyczny.' },
            'feat-sausage': { name: 'Kiełbasa domowa', desc: 'Według rodzinnej receptury Metzgerei Berg.' },
            'feat-honey': { name: 'Miód kwiatowy', desc: 'Z Imkerei Sonne z Niziny Nadreńskiej.' },
            'feat-yogurt': { name: 'Jogurt naturalny', desc: 'Łagodny i kremowy – bez dodatków.' },
            'feat-eggs': { name: 'Jaja od kur z wolnego wybiegu', desc: 'Z Hof Müller – kury z dostępem do wybiegów.' },
            'feat-daily': { name: 'Danie dnia', desc: 'Sezonowe danie w Gasthof Eifelblick.' }
        }
    };
    return map[lang] || map.en;
}

function storyTitle(lang) {
    const map = {
        de: 'Unsere Geschichte',
        en: 'Our story',
        pl: 'Nasza historia',
        fr: 'Notre histoire',
        es: 'Nuestra historia',
        it: 'La nostra storia',
        nl: 'Ons verhaal',
        ru: 'Наша история',
        tr: 'Hikâyemiz'
    };
    return map[lang] || map.en;
}

function pack(lang, recipesUi, recipeItems) {
    return {
        home: { featuredItems: featured(lang === 'de' || lang === 'en' || lang === 'pl' ? lang : 'en') },
        producer: { storyTitle: storyTitle(lang) },
        recipes: recipesBlock(
            recipesUi.title,
            recipesUi.intro,
            recipesUi.timeMin,
            recipesUi.openProducer,
            recipesUi.easy,
            recipesUi.medium,
            recipesUi.hard,
            recipeItems
        )
    };
}

export const CONTENT_I18N = {
    de: pack('de', {
        title: 'Lokale Rezepte',
        intro: 'Klassiker der Region – mit Zutaten von lokalen Erzeugern.',
        timeMin: '{min} Min.',
        openProducer: 'Zum Erzeuger',
        easy: 'Einfach',
        medium: 'Mittel',
        hard: 'Schwer'
    }, RECIPES_DE),
    en: pack('en', {
        title: 'Local recipes',
        intro: 'Regional classics – with ingredients from local producers.',
        timeMin: '{min} min',
        openProducer: 'Open producer',
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard'
    }, RECIPES_EN),
    pl: pack('pl', {
        title: 'Lokalne przepisy',
        intro: 'Klasyka regionu – ze składnikami od lokalnych producentów.',
        timeMin: '{min} min',
        openProducer: 'Otwórz producenta',
        easy: 'Łatwy',
        medium: 'Średni',
        hard: 'Trudny'
    }, RECIPES_PL),
    fr: pack('fr', {
        title: 'Recettes locales',
        intro: 'Classiques de la région – avec des ingrédients de producteurs locaux.',
        timeMin: '{min} min',
        openProducer: 'Ouvrir le producteur',
        easy: 'Facile',
        medium: 'Moyen',
        hard: 'Difficile'
    }, RECIPES_FR),
    es: pack('es', {
        title: 'Recetas locales',
        intro: 'Clásicos de la región – con ingredientes de productores locales.',
        timeMin: '{min} min',
        openProducer: 'Abrir productor',
        easy: 'Fácil',
        medium: 'Medio',
        hard: 'Difícil'
    }, RECIPES_ES),
    it: pack('it', {
        title: 'Ricette locali',
        intro: 'Classici della regione – con ingredienti di produttori locali.',
        timeMin: '{min} min',
        openProducer: 'Apri produttore',
        easy: 'Facile',
        medium: 'Medio',
        hard: 'Difficile'
    }, RECIPES_IT),
    nl: pack('nl', {
        title: 'Lokale recepten',
        intro: 'Klassiekers uit de regio – met ingrediënten van lokale producenten.',
        timeMin: '{min} min',
        openProducer: 'Open producent',
        easy: 'Makkelijk',
        medium: 'Gemiddeld',
        hard: 'Moeilijk'
    }, RECIPES_NL),
    ru: pack('ru', {
        title: 'Местные рецепты',
        intro: 'Классика региона – с ингредиентами от местных производителей.',
        timeMin: '{min} мин',
        openProducer: 'Открыть производителя',
        easy: 'Лёгкий',
        medium: 'Средний',
        hard: 'Сложный'
    }, RECIPES_RU),
    tr: pack('tr', {
        title: 'Yerel tarifler',
        intro: 'Bölgenin klasikleri – yerel üreticilerden malzemelerle.',
        timeMin: '{min} dk',
        openProducer: 'Üreticiyi aç',
        easy: 'Kolay',
        medium: 'Orta',
        hard: 'Zor'
    }, RECIPES_TR)
};

export default CONTENT_I18N;
