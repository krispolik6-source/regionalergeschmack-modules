/**
 * Uzupełnienie Home / ambient / living region dla wszystkich języków
 * (wcześniej tylko DE/EN/PL/MK → EN fallback).
 */

/** @type {Record<string, object>} */
export const HOME_FILL_I18N = Object.freeze({
    de: {
        home: {
            ambientNaturePlay: 'Naturklänge einschalten',
            ambientNatureMute: 'Naturklänge ausschalten',
            regionalIntelLabel: 'Gastgeber der Region',
            livingRegionTitle: 'Die Region lebt',
            livingRegionSub: 'Kurze Stimmen aus der Nachbarschaft.'
        }
    },
    en: {
        home: {
            ambientNaturePlay: 'Turn on nature sounds',
            ambientNatureMute: 'Turn off nature sounds',
            regionalIntelLabel: 'Host of the region',
            livingRegionTitle: 'The region is alive',
            livingRegionSub: 'Short voices from the neighbourhood.'
        }
    },
    pl: {
        home: {
            ambientNaturePlay: 'Włącz odgłosy natury',
            ambientNatureMute: 'Wyłącz odgłosy natury',
            regionalIntelLabel: 'Gospodarz regionu',
            livingRegionTitle: 'Region żyje',
            livingRegionSub: 'Krótkie głosy z okolicy.'
        }
    },
    ru: {
        home: {
            ambientNaturePlay: 'Включить звуки природы',
            ambientNatureMute: 'Выключить звуки природы',
            regionalIntelLabel: 'Хозяин региона',
            livingRegionTitle: 'Регион живёт',
            livingRegionSub: 'Короткие голоса из округи.'
        }
    },
    tr: {
        home: {
            ambientNaturePlay: 'Doğa seslerini aç',
            ambientNatureMute: 'Doğa seslerini kapat',
            regionalIntelLabel: 'Bölgenin ev sahibi',
            livingRegionTitle: 'Bölge canlı',
            livingRegionSub: 'Mahalleden kısa sesler.'
        }
    },
    fr: {
        home: {
            ambientNaturePlay: 'Activer les sons de la nature',
            ambientNatureMute: 'Couper les sons de la nature',
            regionalIntelLabel: 'Hôte de la région',
            livingRegionTitle: 'La région vit',
            livingRegionSub: 'Courtes voix du voisinage.'
        }
    },
    es: {
        home: {
            ambientNaturePlay: 'Activar sonidos de la naturaleza',
            ambientNatureMute: 'Silenciar sonidos de la naturaleza',
            regionalIntelLabel: 'Anfitrión de la región',
            livingRegionTitle: 'La región está viva',
            livingRegionSub: 'Breves voces del vecindario.'
        }
    },
    it: {
        home: {
            ambientNaturePlay: 'Attiva i suoni della natura',
            ambientNatureMute: 'Disattiva i suoni della natura',
            regionalIntelLabel: 'Ospite della regione',
            livingRegionTitle: 'La regione è viva',
            livingRegionSub: 'Brevi voci dal vicinato.'
        }
    },
    nl: {
        home: {
            ambientNaturePlay: 'Natuurgeluiden aanzetten',
            ambientNatureMute: 'Natuurgeluiden uitzetten',
            regionalIntelLabel: 'Gastheer van de regio',
            livingRegionTitle: 'De regio leeft',
            livingRegionSub: 'Korte stemmen uit de buurt.'
        }
    },
    cs: {
        home: {
            ambientNaturePlay: 'Zapnout zvuky přírody',
            ambientNatureMute: 'Vypnout zvuky přírody',
            regionalIntelLabel: 'Hospodář regionu',
            livingRegionTitle: 'Region žije',
            livingRegionSub: 'Krátké hlasy z okolí.'
        }
    },
    sk: {
        home: {
            ambientNaturePlay: 'Zapnúť zvuky prírody',
            ambientNatureMute: 'Vypnúť zvuky prírody',
            regionalIntelLabel: 'Hospodár regiónu',
            livingRegionTitle: 'Región žije',
            livingRegionSub: 'Krátke hlasy z okolia.'
        }
    },
    hu: {
        home: {
            ambientNaturePlay: 'Természeti hangok bekapcsolása',
            ambientNatureMute: 'Természeti hangok kikapcsolása',
            regionalIntelLabel: 'A régió gazdája',
            livingRegionTitle: 'A régió él',
            livingRegionSub: 'Rövid hangok a környékről.'
        }
    },
    ro: {
        home: {
            ambientNaturePlay: 'Pornește sunetele naturii',
            ambientNatureMute: 'Oprește sunetele naturii',
            regionalIntelLabel: 'Gazda regiunii',
            livingRegionTitle: 'Regiunea trăiește',
            livingRegionSub: 'Voci scurte din cartier.'
        }
    },
    bg: {
        home: {
            ambientNaturePlay: 'Включи звуци от природата',
            ambientNatureMute: 'Изключи звуци от природата',
            regionalIntelLabel: 'Домакин на региона',
            livingRegionTitle: 'Регионът живее',
            livingRegionSub: 'Кратки гласове от квартала.'
        }
    },
    el: {
        home: {
            ambientNaturePlay: 'Ενεργοποίηση ήχων φύσης',
            ambientNatureMute: 'Απενεργοποίηση ήχων φύσης',
            regionalIntelLabel: 'Οικοδεσπότης της περιοχής',
            livingRegionTitle: 'Η περιοχή ζει',
            livingRegionSub: 'Σύντομες φωνές από τη γειτονιά.'
        }
    },
    hr: {
        home: {
            ambientNaturePlay: 'Uključi zvukove prirode',
            ambientNatureMute: 'Isključi zvukove prirode',
            regionalIntelLabel: 'Domaćin regije',
            livingRegionTitle: 'Regija živi',
            livingRegionSub: 'Kratki glasovi iz susjedstva.'
        }
    },
    sr: {
        home: {
            ambientNaturePlay: 'Укључи звуке природе',
            ambientNatureMute: 'Искључи звуке природе',
            regionalIntelLabel: 'Домаћин региона',
            livingRegionTitle: 'Регион живи',
            livingRegionSub: 'Кратки гласови из комшилука.'
        }
    },
    mk: {
        home: {
            ambientNaturePlay: 'Вклучи звуци од природата',
            ambientNatureMute: 'Исклучи звуци од природата',
            regionalIntelLabel: 'Домаќин на регионот',
            livingRegionTitle: 'Регионот живее',
            livingRegionSub: 'Кратки гласови од соседството.'
        }
    },
    sl: {
        home: {
            ambientNaturePlay: 'Vklopi zvoke narave',
            ambientNatureMute: 'Izklopi zvoke narave',
            regionalIntelLabel: 'Gostitelj regije',
            livingRegionTitle: 'Regija živi',
            livingRegionSub: 'Kratki glasovi iz soseske.'
        }
    },
    lt: {
        home: {
            ambientNaturePlay: 'Įjungti gamtos garsus',
            ambientNatureMute: 'Išjungti gamtos garsus',
            regionalIntelLabel: 'Regiono šeimininkas',
            livingRegionTitle: 'Regionas gyvas',
            livingRegionSub: 'Trumpi balsai iš kaimynystės.'
        }
    },
    lv: {
        home: {
            ambientNaturePlay: 'Ieslēgt dabas skaņas',
            ambientNatureMute: 'Izslēgt dabas skaņas',
            regionalIntelLabel: 'Reģiona saimnieks',
            livingRegionTitle: 'Reģions dzīvo',
            livingRegionSub: 'Īsas balsis no apkārtnes.'
        }
    },
    et: {
        home: {
            ambientNaturePlay: 'Lülita loodushääled sisse',
            ambientNatureMute: 'Lülita loodushääled välja',
            regionalIntelLabel: 'Piirkonna peremees',
            livingRegionTitle: 'Piirkond elab',
            livingRegionSub: 'Lühikesed hääled naabruskonnast.'
        }
    },
    fi: {
        home: {
            ambientNaturePlay: 'Ota luonnonäänet käyttöön',
            ambientNatureMute: 'Mykistä luonnonäänet',
            regionalIntelLabel: 'Alueen isäntä',
            livingRegionTitle: 'Alue elää',
            livingRegionSub: 'Lyhyitä ääniä naapurustosta.'
        }
    },
    sv: {
        home: {
            ambientNaturePlay: 'Slå på naturljud',
            ambientNatureMute: 'Stäng av naturljud',
            regionalIntelLabel: 'Regionens värd',
            livingRegionTitle: 'Regionen lever',
            livingRegionSub: 'Korta röster från grannskapet.'
        }
    },
    no: {
        home: {
            ambientNaturePlay: 'Slå på naturlyder',
            ambientNatureMute: 'Slå av naturlyder',
            regionalIntelLabel: 'Regionens vert',
            livingRegionTitle: 'Regionen lever',
            livingRegionSub: 'Korte stemmer fra nabolaget.'
        }
    },
    da: {
        home: {
            ambientNaturePlay: 'Tænd naturlyde',
            ambientNatureMute: 'Sluk naturlyde',
            regionalIntelLabel: 'Regionens vært',
            livingRegionTitle: 'Regionen lever',
            livingRegionSub: 'Korte stemmer fra nabolaget.'
        }
    },
    is: {
        home: {
            ambientNaturePlay: 'Kveikja á náttúruhljóðum',
            ambientNatureMute: 'Slökkva á náttúruhljóðum',
            regionalIntelLabel: 'Gestgjafi svæðisins',
            livingRegionTitle: 'Svæðið lifir',
            livingRegionSub: 'Stuttar raddir úr nágrenninu.'
        }
    },
    zh: {
        home: {
            ambientNaturePlay: '打开自然声音',
            ambientNatureMute: '关闭自然声音',
            regionalIntelLabel: '地区主人',
            livingRegionTitle: '地区生机勃勃',
            livingRegionSub: '来自邻里的短讯。'
        }
    },
    'zh-tw': {
        home: {
            ambientNaturePlay: '開啟自然聲音',
            ambientNatureMute: '關閉自然聲音',
            regionalIntelLabel: '地區主人',
            livingRegionTitle: '地區充滿生氣',
            livingRegionSub: '來自鄰里的短訊。'
        }
    },
    ja: {
        home: {
            ambientNaturePlay: '自然の音をオン',
            ambientNatureMute: '自然の音をオフ',
            regionalIntelLabel: '地域のホスト',
            livingRegionTitle: '地域は生きている',
            livingRegionSub: '近所からの短い声。'
        }
    },
    ko: {
        home: {
            ambientNaturePlay: '자연 소리 켜기',
            ambientNatureMute: '자연 소리 끄기',
            regionalIntelLabel: '지역의 주인',
            livingRegionTitle: '지역이 살아 있다',
            livingRegionSub: '동네에서 온 짧은 이야기.'
        }
    },
    vi: {
        home: {
            ambientNaturePlay: 'Bật âm thanh thiên nhiên',
            ambientNatureMute: 'Tắt âm thanh thiên nhiên',
            regionalIntelLabel: 'Chủ nhà vùng',
            livingRegionTitle: 'Vùng đất đang sống',
            livingRegionSub: 'Những tiếng nói ngắn từ hàng xóm.'
        }
    },
    ms: {
        home: {
            ambientNaturePlay: 'Hidupkan bunyi alam',
            ambientNatureMute: 'Matikan bunyi alam',
            regionalIntelLabel: 'Tuan rumah wilayah',
            livingRegionTitle: 'Wilayah hidup',
            livingRegionSub: 'Suara ringkas dari kejiranan.'
        }
    },
    id: {
        home: {
            ambientNaturePlay: 'Nyalakan suara alam',
            ambientNatureMute: 'Matikan suara alam',
            regionalIntelLabel: 'Tuan rumah wilayah',
            livingRegionTitle: 'Wilayah hidup',
            livingRegionSub: 'Suara singkat dari tetangga.'
        }
    },
    th: {
        home: {
            ambientNaturePlay: 'เปิดเสียงธรรมชาติ',
            ambientNatureMute: 'ปิดเสียงธรรมชาติ',
            regionalIntelLabel: 'เจ้าบ้านของภูมิภาค',
            livingRegionTitle: 'ภูมิภาคมีชีวิต',
            livingRegionSub: 'เสียงสั้นๆ จากละแวกบ้าน'
        }
    },
    hi: {
        home: {
            ambientNaturePlay: 'प्रकृति की आवाज़ें चालू करें',
            ambientNatureMute: 'प्रकृति की आवाज़ें बंद करें',
            regionalIntelLabel: 'क्षेत्र का मेज़बान',
            livingRegionTitle: 'क्षेत्र जीवंत है',
            livingRegionSub: 'पड़ोस से छोटी आवाज़ें।'
        }
    }
});
