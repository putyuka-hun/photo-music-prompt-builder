(() => {
  "use strict";

  const STORAGE_KEY = "terrain_portrait_pages_v1";
  const CHARACTER_STORAGE_KEY = "terrain_portrait_characters_v1";
  const HISTORY_STORAGE_KEY = "terrain_portrait_history_v1";
  const PHOTO_MUSIC_SOURCE_KEY = "photo_music_source_v1";
  const HISTORY_LIMIT = 30;
  const PAGE = document.body.dataset.page || "face";
  const LEGACY_MINOR_AGES = new Set(["Fiatal", "Gyerek", "Kamasz", "Serdülő"]);
  const MAKEUP_KEYS = new Set(["szemfestes", "borsmink", "ajakszin"]);
  const FACE_CARD_SHORT_LABELS = {
    hajszin: [null, null, null, ["Ősz haj", "Grey hair"]],
    hajstilus: {
      "Hosszú, egyenes, enyhén rétegezett szőke haj, laza oldalválasztékkal, kicsit kócos, természetes hatású frizura": ["Hosszú réteges haj", "Long layered hair"],
      "Középhosszú, réteges frizura lágy hullámokkal és légies volumen­nel": ["Lágy hullámos réteges", "Soft layered waves"],
      "Laza, magas konty kiengedett tincsekkel, bohém stílusban": ["Bohém magas konty", "Bohemian high bun"],
      "Laza, romantikus konty, enyhén tupírozott tövekkel, finoman kiengedett tincsekkel": ["Romantikus konty", "Romantic updo"],
      "Rövid, réteges bob, laza hullámokkal és enyhe volumen­nel": ["Hullámos rövid bob", "Short wavy bob"],
      "Rövid, réteges pixie frizura": ["Réteges pixie", "Layered pixie"],
      "Rövid, tépett shag frizura": ["Tépett shag", "Choppy shag"],
      "Vállig érő, dús göndör frizura, természetes volumen­nel": ["Dús vállig érő göndör", "Voluminous shoulder curls"],
      "Oldalra söpört hosszú haj": ["Oldalra söpört hosszú", "Long side-swept hair"],
      "Precíz állig érő bob egyenes frufruval": ["Precíz frufrus bob", "Precise fringe bob"],
      "Aszimmetrikus réteges bob oldalfrufruval": ["Aszimmetrikus bob", "Asymmetrical bob"],
      "Rövid texturált pixie hosszú oldalfrufruval": ["Oldalfrufrus pixie", "Side-fringe pixie"],
      "Középhosszú hullámos shag ritka frufruval": ["Hullámos középhosszú shag", "Medium wavy shag"],
      "Rövid oldalra söpört texturált haj": ["Oldalra söpört rövid", "Short side-swept cut"],
      "Középhosszú kócos hátrafésült haj": ["Kócos hátrafésült", "Tousled swept-back hair"],
      "Modern quiff oldalt rövidítve": ["Modern quiff", "Modern quiff"]
    },
    szemfestes: [
      ["Arany csillámos", "Sparkling gold"],
      ["Smink nélkül", "No makeup"],
      ["Grafikus fekete", "Graphic black"],
      ["Füstös", "Smoky"],
      ["Réz–bronz", "Copper–bronze"],
      ["Metálos türkiz–zöld", "Metallic turquoise–green"],
      ["Világoskék–ezüst", "Light blue–silver"],
      ["Világoszöld–ezüst", "Light green–silver"]
    ]
  };
  const ESSENTIAL_PROMPT_FACE_KEYS = new Set([
    "bortonus", "koponya", "jaromcsont", "allkapocs", "szemforma", "ajkak",
    "orr", "fogak", "szemszin", "hajszin", "hajhossz", "hajsuruseg", "hajstilus",
    "tekintet", "arckifejezes"
  ]);
  const ALT_TYPE_DEFAULT_LINK_TABLES = {
    bortonus: "tbl_altipus_bortonus"
  };
  const POSITION_FIELD = ["position", "Pozíció", "tbl_position", "position_id", "position_prompt"];

  const FACE_GROUPS = [
    {
      title: "Személy karaktere",
      note: "alapkarakter és arányok",
      fields: [
        ["altipus", "Karakter arctípusa", "tbl_altipusok", "altipus_id", "altipus_prompt"],
        ["eletkor", "Életkor", "tbl_eletkor", "eletkor_id", "eletkor_prompt"],
        ["identitas", "Identitás", "tbl_identitas", "identitas_id", "identitas_prompt"],
        ["testalkat", "Testalkat", "tbl_testalkatok", "testalkat_id", "testalkat_prompt"],
        ["koponya", "Koponya", "tbl_koponya", "koponya_id", "koponya_prompt", "tbl_altipus_koponya"],
        ["jaromcsont", "Járomcsont", "tbl_jaromcsont", "jaromcsont_id", "jaromcsont_prompt", "tbl_altipus_jaromcsont"],
        ["allkapocs", "Állkapocs", "tbl_allkapocs", "allkapocs_id", "allkapocs_prompt", "tbl_altipus_allkapocs"],
        ["bortonus", "Bőrtónus", "tbl_bortonus", "bortonus_id", "bortonus_prompt"],
        ["szemforma", "Szemforma", "tbl_szemforma", "szemforma_id", "szemforma_prompt", "tbl_altipus_szemforma"],
        ["ajkak", "Ajkak", "tbl_ajkak", "ajaktipus_id", "ajak_prompt", "tbl_altipus_ajak"]
      ]
    },
    {
      title: "Szem részletei",
      note: "szemöldök, írisz és szempilla",
      fields: [
        ["homlok", "Homlok", "tbl_homlok", "homlok_id", "homlok_prompt"],
        ["szemoldokForma", "Szemöldök formája", "tbl_szemoldok_forma", "szemoldokforma_id", "szemoldokforma_prompt"],
        ["szemoldokSuruseg", "Szemöldök sűrűsége", "tbl_szemoldok_suruseg", "szemoldok_suruseg_id", "szemoldok_suruseg_prompt"],
        ["szempilla", "Szempilla", "tbl_szempilla", "szempilla_id", "szempilla_prompt"],
        ["szemszin", "Szemszín", "tbl_szemszin", "szemszin_id", "szemszin_prompt"],
        ["irisz", "Írisz", "tbl_irisz", "irisz_id", "irisz_prompt"]
      ]
    },
    {
      title: "Fülek, orr és fogak",
      note: "önálló arc-részletek",
      fields: [
        ["fulek", "Fülek", "tbl_fultipus", "fultipus_id", "fultipus_prompt"],
        ["orr", "Orr", "tbl_orrtipus", "orrtipus_id", "orrtipus_prompt"],
        ["fogak", "Fogak", "tbl_fogak", "fogstilus_id", "fogstilus_prompt"]
      ]
    },
    {
      key: "makeup",
      title: "Bőr és smink",
      note: "arcjegyek, bőrrészletek és smink",
      fields: [
        ["arcjegyek", "Arcjegyek", "tbl_arcjegyek", "arcjegyek_id", "arcjegyek_prompt"],
        ["bortextura", "Bőrtextúra", "tbl_bortextura", "bortextura_id", "bortextura_prompt"],
        ["szemfestes", "Szemfestés", "tbl_szemfestes", "szemfestes_id", "szemfestes_prompt"],
        ["borsmink", "Bőr alapozása", "tbl_borsmink", "borsmink_id", "borsmink_prompt"],
        ["ajakszin", "Ajak színe / rúzs", "tbl_ajakszinek", "ajakszin_id", "ajakszin_prompt"]
      ]
    },
    {
      title: "Haj és részletek",
      note: "frizura és arcszőrzet",
      fields: [
        ["hajszin", "Hajszín", "tbl_hajszin", "hajszin_id", "hajszin_prompt"],
        ["hajhossz", "Hajhossz", "tbl_hajhossz", "hajhossz_id", "hajhossz_propmt"],
        ["hajsuruseg", "Haj sűrűsége", "tbl_hajsuruseg", "hajsuruseg_id", "hajsuruseg_prompt"],
        ["hajstilus", "Hajstílus", "tbl_hajstilus", "hajstilus_id", "hajstilus_prompt"],
        ["arcszorzet", "Arcszőrzet", "tbl_arcszorzet", "arcszorzet_id", "arcszorzet_prompt"]
      ]
    },
    {
      title: "Tekintet és mimika",
      note: "nézésirány és arckifejezés",
      fields: [
        ["tekintet", "Tekintet", "tbl_tekintet", "tekintet_id", "tekintet_prompt"],
        ["arckifejezes", "Arckifejezés", "tbl_arckifejezes", "arckifejezes_id", "arckifejezes_prompt"]
      ]
    }
  ];

  const FACE_FIELDS = [POSITION_FIELD, ...FACE_GROUPS.flatMap((group) => group.fields)];
  const DEPENDENT_FIELDS = FACE_FIELDS.filter((field) => field[5] || ALT_TYPE_DEFAULT_LINK_TABLES[field[0]]);
  const FACE_SELECT_GROUPS = {
    altipus: [
      {
        label: "Észak-Amerika",
        image: "north_america_v2.png",
        values: ["Amerikai őslakos", "Inuit"]
      },
      {
        label: "Dél-Amerika",
        image: "south_america_v2.png",
        values: ["Karibi-néger"]
      },
      {
        label: "Afrika",
        image: "africa_v2.png",
        values: ["Dél-afrikai", "Kelet-afrikai", "Közép-afrikai", "Nyugat-afrikai", "Yoruba"]
      },
      {
        label: "Ázsia",
        image: "asia_v2.png",
        values: ["Arab", "Dél-ázsiai", "Délkelet-ázsiai", "Vietnami", "Japán", "Kínai", "Koreai", "Közép-ázsiai", "Közel-keleti", "Török"]
      },
      {
        label: "Európa",
        image: "europe_v2.png",
        values: ["Dél-európai", "Mediterrán", "Balkáni", "Észak-európai", "Skandináv", "Baltikumi", "Kelet-európai", "Ukrán", "Szláv", "Közép-európai", "Kaukázusi", "Grúz", "Örmény"]
      },
      {
        label: "Óceánia",
        image: "australia_v2.png",
        values: ["Ausztrál őslakos", "Melanéziai", "Micronéziai", "Pápuai", "Polinéziai"]
      }
    ]
  };
  const FACE_IMAGE_ASSETS = {
    altipus: {
      folder: "karakter_arctipus",
      aspectRatio: "character-type",
      order: [
        "Amerikai őslakos",
        "Arab",
        "Ausztrál őslakos",
        "Dél-afrikai",
        "Dél-ázsiai",
        "Dél-európai",
        "Délkelet-ázsiai",
        "Észak-európai",
        "Inuit",
        "Japán",
        "Karibi-néger",
        "Kaukázusi",
        "Kelet-afrikai",
        "Kelet-európai",
        "Kínai",
        "Koreai",
        "Közel-keleti",
        "Közép-afrikai",
        "Közép-ázsiai",
        "Közép-európai",
        "Mediterrán",
        "Micronéziai",
        "Nyugat-afrikai",
        "Pápuai",
        "Polinéziai",
        "Skandináv",
        "Szláv",
        "Török",
        "Ukrán",
        "Vietnami",
        "Yoruba",
        "Balkáni",
        "Baltikumi",
        "Grúz",
        "Örmény"
      ],
      files: {
        "Amerikai őslakos": "rassz_amerikai_oslakos_v2.png",
        "Arab": "rassz_arab_v2.png",
        "Ausztrál őslakos": "rassz_ausztral_oslakos_v2.png",
        "Dél-afrikai": "rassz_del_afrikai_v2.png",
        "Dél-ázsiai": "rassz_del_azsiai_v2.png",
        "Dél-európai": "rassz_del_europai_v2.png",
        "Délkelet-ázsiai": "rassz_delkelet_azsiai_v2.png",
        "Észak-európai": "rassz_eszak_europai_v2.png",
        "Inuit": "rassz_inuit_v2.png",
        "Japán": "rassz_japan_v2.png",
        "Karibi-néger": "rassz_karib_neger_v2.png",
        "Kaukázusi": "rassz_kaukazusi_v2.png",
        "Kelet-afrikai": "rassz_kelet_afrikai_v2.png",
        "Kelet-európai": "rassz_kelet_europai_v2.png",
        "Kínai": "rassz_kinai_v2.png",
        "Koreai": "rassz_koreai_v2.png",
        "Közel-keleti": "rassz_kozel_keleti_v2.png",
        "Közép-afrikai": "rassz_kozep_afrikai_v2.png",
        "Közép-ázsiai": "rassz_kozep_azsiai_v2.png",
        "Közép-európai": "rassz_kozep_europai_v2.png",
        "Mediterrán": "rassz_mediterran_v2.png",
        "Micronéziai": "rassz_microneziai_v2.png",
        "Nyugat-afrikai": "rassz_nyugat_afrikai_v2.png",
        "Pápuai": "rassz_papua_v2.png",
        "Polinéziai": "rassz_polineziai_v2.png",
        "Skandináv": "rassz_skandinav_v2.png",
        "Szláv": "rassz_szlav_v2.png",
        "Török": "rassz_torok_v2.png",
        "Ukrán": "rassz_ukran_v2.png",
        "Vietnami": "rassz_vietnami_v2.png",
        "Yoruba": "rassz_yoruba_v2.png",
        "Balkáni": "rassz_balkani_v2.png",
        "Baltikumi": "rassz_baltikumi_v2.png",
        "Grúz": "rassz_gruz_v2.png",
        "Örmény": "rassz_ormeny_v2.png"
      }
    },
    bortonus: {
      folder: "bortonus",
      order: [
        "Középbarna",
        "Nagyon sötét",
        "Nagyon világos",
        "Olívás / kreol",
        "Sötétbarna",
        "Világos",
        "Világos olívás",
        "Ébenfekete"
      ],
      files: {
        "Középbarna": "bortonus_kozepbarna_v2.png",
        "Nagyon sötét": "bortonus_nagyon_sotet_v2.png",
        "Nagyon világos": "bortonus_nagyon_vilagos_v2.png",
        "Olívás / kreol": "bortonus_olivas_kreol_v2.png",
        "Sötétbarna": "bortonus_sotetbarna_v2.png",
        "Világos": "bortonus_vilagos_v2.png",
        "Világos olívás": "bortonus_vilagos_olivas_v2.png",
        "Ébenfekete": "bortonus_ebenfekete_v2.png"
      }
    },
    testalkat: {
      folder: "testalkat",
      aspectRatio: "body-type",
      order: [
        "Alacsony, zömök",
        "Alma alak",
        "Erősebb testalkat",
        "Homokóra",
        "Izmos",
        "Karcsú / vékony",
        "Körte alak",
        "Magas, erőteljes",
        "Magas, vékony",
        "Molett",
        "Nagyon vékony",
        "Normál / átlagos",
        "Sportos",
        "Telt / dús idomú",
        "Testépítő"
      ],
      files: {
        "Alacsony, zömök": "testalkat_alacsony_zomok_v2.png",
        "Alma alak": "testalkat_alma_alak_v2.png",
        "Erősebb testalkat": "testalkat_erosebb_testalkat_v2.png",
        "Homokóra": "testalkat_homokora_v2.png",
        "Izmos": "testalkat_izmos_v2.png",
        "Karcsú / vékony": "testalkat_karcsu_vekony_v2.png",
        "Körte alak": "testalkat_korte_alak_v2.png",
        "Magas, erőteljes": "testalkat_magas_eroteljes_v2.png",
        "Magas, vékony": "testalkat_magas_vekony_v2.png",
        "Molett": "testalkat_molett_v2.png",
        "Nagyon vékony": "testalkat_nagyon_vekony_v2.png",
        "Normál / átlagos": "testalkat_normal_atlagos_v2.png",
        "Sportos": "testalkat_sportos_v2.png",
        "Telt / dús idomú": "testalkat_telt_dus_idomu_v2.png",
        "Testépítő": "testalkat_testepito_v2.png"
      }
    },
    koponya: {
      folder: "koponya",
      aspectRatio: "skull",
      order: [
        "Gyémánt alakú",
        "Háromszög",
        "Hosszúkás",
        "Kerek",
        "Ovális",
        "Szív alakú",
        "Szögletes"
      ],
      files: {
        "Gyémánt alakú": "koponya_gyemant_alaku_v2.png",
        "Háromszög": "koponya_haromszog_v2.png",
        "Hosszúkás": "koponya_hosszukas_v2.png",
        "Kerek": "koponya_kerek_v2.png",
        "Ovális": "koponya_ovalis_v2.png",
        "Szív alakú": "koponya_sziv_alaku_v2.png",
        "Szögletes": "koponya_szogletes_v2.png"
      }
    },
    jaromcsont: {
      folder: "jaromcsont",
      aspectRatio: "cheekbone",
      order: [
        "Almaarc (teltebb felső orcák)",
        "Élesen definiált járomív",
        "Előreugró járomív",
        "Enyhén kiugró járomcsont",
        "Erősen kiugró járomcsont",
        "Lágy, kerek arcél",
        "Magas, kiugró járomcsont",
        "Széles járomív"
      ],
      files: {
        "Almaarc (teltebb felső orcák)": "jaromcsont_almaarc_v2.png",
        "Élesen definiált járomív": "jaromcsont_elesen_definialt_jaromiv_v2.png",
        "Előreugró járomív": "jaromcsont_elore_ugro_jaromiv_v2.png",
        "Enyhén kiugró járomcsont": "jaromcsont_enyhen_kiugro_v2.png",
        "Erősen kiugró járomcsont": "jaromcsont_erosen_kiugro_v2.png",
        "Lágy, kerek arcél": "jaromcsont_lagy_kerek_arcel_v2.png",
        "Magas, kiugró járomcsont": "jaromcsont_magas_kiugro_v2.png",
        "Széles járomív": "jaromcsont_szeles_jaromiv_v2.png"
      }
    },
    allkapocs: {
      folder: "allkapocs",
      aspectRatio: "jaw",
      order: [
        "Gödrös áll (gödröcskés)",
        "Hegyes áll",
        "Hosszú áll",
        "Jól definiált, éles állkapocs",
        "Kerek áll",
        "Keskeny állkapocs",
        "Kifejezett állkapocsszöglet",
        "Lágy, kevésbé definiált állkapocs",
        "Lágyan kerek állkapocs",
        "Széles állkapocs",
        "Szögletes állkapocs"
      ],
      files: {
        "Gödrös áll (gödröcskés)": "allkapocs_godros_all_v2.png",
        "Hegyes áll": "allkapocs_hegyes_all_v2.png",
        "Hosszú áll": "allkapocs_hosszu_all_v2.png",
        "Jól definiált, éles állkapocs": "allkapocs_jol_definialt_eles_v2.png",
        "Kerek áll": "allkapocs_kerek_all_v2.png",
        "Keskeny állkapocs": "allkapocs_keskeny_v2.png",
        "Kifejezett állkapocsszöglet": "allkapocs_kifejezett_allkapocsszoglet_v2.png",
        "Lágy, kevésbé definiált állkapocs": "allkapocs_lagy_kevesbe_definialt_v2.png",
        "Lágyan kerek állkapocs": "allkapocs_lagyan_kerek_v2.png",
        "Széles állkapocs": "allkapocs_szeles_v2.png",
        "Szögletes állkapocs": "allkapocs_szogletes_v2.png"
      }
    },
    position: {
      folder: "pozicio",
      aspectRatio: "position",
      order: [
        "Álló, teljes alak",
        "Derékig",
        "Dinamikus álló",
        "Fekvő",
        "Háromnegyedes alak",
        "Háttal álló",
        "Interakció tárggyal",
        "Mozgás közben",
        "Portré fej-nyak vállal",
        "Portré extrém közeli",
        "Portré közeli",
        "Profil portré",
        "Térdelő",
        "Ülő, teljes alak",
        "Félalak",
        "Mellkép közel",
        "Portré (fej/fej-közeli)"
      ],
      files: {
        "Álló, teljes alak": "pozicio_allo_teljes_alak_v2.png",
        "Derékig": "pozicio_derekig_v2.png",
        "Dinamikus álló": "pozicio_dinamikus_allo_v2.png",
        "Félalak": "pozicio_felalak_v2.png",
        "Fekvő": "pozicio_fekvo_v2.png",
        "Háromnegyedes alak": "pozicio_haromnegyedes_alak_v2.png",
        "Háttal álló": "pozicio_hattal_allo_v2.png",
        "Interakció tárggyal": "pozicio_interakcio_targgyal_v2.png",
        "Mozgás közben": "pozicio_mozgas_kozben_v2.png",
        "Mellkép közel": "pozicio_mellkep_kozel_v2.png",
        "Portré (fej/fej-közeli)": "pozicio_fej_fej_vallal_v2.png",
        "Portré fej-nyak vállal": "pozicio_portre_fej-nyak_vallal_v2.png",
        "Portré extrém közeli": "pozicio_portre_extrem_kozel_v2.png",
        "Portré közeli": "pozicio_portre_kozeli_v2.png",
        "Profil portré": "pozicio_profil_portre_v2.png",
        "Térdelő": "pozicio_terdelo_v2.png",
        "Ülő, teljes alak": "pozicio_ulo_teljes_alak_v2.png"
      }
    },
    eletkor: {
      folder: "eletkor",
      aspectRatio: "age",
      order: [
        "Felnőtt",
        "Fiatal felnőtt",
        "Középkorú",
        "Öreg",
        "Vén"
      ],
      files: {
        "Felnőtt": "eletkor_felnott_v2.png",
        "Fiatal felnőtt": "eletkor_fiatal_felnott_v2.png",
        "Középkorú": "eletkor_kozepkoru_v2.png",
        "Öreg": "eletkor_oreg_v2.png",
        "Vén": "eletkor_ven_v2.png"
      }
    },
    identitas: {
      folder: "identitas",
      aspectRatio: "identity",
      order: [
        "Férfi",
        "Nő"
      ],
      files: {
        "Férfi": "male_v2.png",
        "Nő": "female_v2.png"
      }
    },
    homlok: {
      folder: "homlok",
      order: [
        "Magas homlok",
        "Függőleges homlok",
        "Ívelt homlok",
        "Közepes magasságú homlok",
        "Sima homlok, ráncok nélkül",
        "Széles homlok a halántéknál"
      ],
      files: {
        "Függőleges homlok": "homlok_fuggoleges_v2.png",
        "Ívelt homlok": "homlok_ivelt_v2.png",
        "Közepes magasságú homlok": "homlok_kozepes_magassagu_v2.png",
        "Magas homlok": "homlok_magas_v2.png",
        "Sima homlok, ráncok nélkül": "homlok_sima_rancok_nelkul_v2.png",
        "Széles homlok a halántéknál": "homlok_szeles_a_halanteknal_v2.png"
      }
    },
    fulek: {
      folder: "fultipusok",
      order: [
        "Csatolt fülcimpa", "Elálló fül", "Enyhén felfelé hajló felső porcív",
        "Enyhén hegyes felső porcív", "Enyhén lefelé hajló felső porcív", "Fejhez simuló fül",
        "Kerek felső porcív", "Kicsi fül", "Lapos antihelix ív", "Mély kagyló",
        "Sekély / lapos kagyló", "Szabad fülcimpa", "Vastag fülcimpa", "Vékony fülcimpa"
      ],
      files: {
        "Csatolt fülcimpa": "fultipus_csatolt_fulcimpa_v3.png",
        "Elálló fül": "fultipus_elallo_ful_v3.png",
        "Enyhén felfelé hajló felső porcív": "fultipus_felfele_hajlo_felso_porci_v3.png",
        "Enyhén hegyes felső porcív": "fultipus_hegyes_felso_porci_v3.png",
        "Enyhén lefelé hajló felső porcív": "fultipus_lefele_hajlo_felso_porci_v3.png",
        "Fejhez simuló fül": "fultipus_fejhez_simulo_ful_v3.png",
        "Kerek felső porcív": "fultipus_kerek_felso_porci_v3.png",
        "Kicsi fül": "fultipus_kicsi_ful_v3.png",
        "Lapos antihelix ív": "fultipus_lapos_antihelix_iv_v3.png",
        "Mély kagyló": "fultipus_mely_kagylo_v3.png",
        "Sekély / lapos kagyló": "fultipus_sekely_lapos_kagylo_v3.png",
        "Szabad fülcimpa": "fultipus_szabad_fulcimpa_v3.png",
        "Vastag fülcimpa": "fultipus_vastag_fulcimpa_v3.png",
        "Vékony fülcimpa": "fultipus_vekony_fulcimpa_v3.png"
      }
    },
    orr: {
      folder: "orr",
      order: [
        "Egyenes orr", "Egyenes orrnyereg", "Egyenetlen orrnyereg", "Éles orrcsúcs",
        "Felhajló orr", "Görbe orr", "Horgas orr", "Hosszú orr", "Kerek orrcsúcs",
        "Keskeny orr", "Kicsi orr", "Lapos orr", "Lejtős orr", "Nagy orr", "Pisze orr",
        "Rövid orr", "Sasorr", "Széles orr", "Széles orrcsúcs", "Vékony orrcsúcs"
      ],
      files: {
        "Egyenes orr": "orr_egyenes_v2.png", "Egyenes orrnyereg": "orr_egyenes_orrnyereg_v2.png",
        "Egyenetlen orrnyereg": "orr_egyenetlen_orrnyereg_v2.png", "Éles orrcsúcs": "orr_eles_orrcsucs_v2.png",
        "Felhajló orr": "orr_felhajlo_v2.png", "Görbe orr": "orr_gorbe_v2.png", "Horgas orr": "orr_horgas_v2.png",
        "Hosszú orr": "orr_hosszu_v2.png", "Kerek orrcsúcs": "orr_kerek_orrcsucs_v2.png",
        "Keskeny orr": "orr_keskeny_v2.png", "Kicsi orr": "orr_kicsi_v2.png", "Lapos orr": "orr_lapos_v2.png",
        "Lejtős orr": "orr_lejtos_v2.png", "Nagy orr": "orr_nagy_v2.png", "Pisze orr": "orr_pisze_v2.png",
        "Rövid orr": "orr_rovid_v2.png", "Sasorr": "orr_sasorr_v2.png", "Széles orr": "orr_szeles_v2.png",
        "Széles orrcsúcs": "orr_szeles_orrcsucs_v2.png", "Vékony orrcsúcs": "orr_vekony_orrcsucs_v2.png"
      }
    },
    fogak: {
      folder: "fogak",
      order: [
        "Apró fogak", "Arany fog", "Átlátszó fogszabályzó", "Csorba fog", "Előreálló fogak",
        "Enyhén szabálytalan", "Ezüst fog", "Fehérített fogak", "Fekete / lyukas fog",
        "Fém fogszabályzó", "Fog nélküli", "Íny domináns mosoly", "Normál", "Rés a fogak között",
        "Részben látható fogak", "Sárgás árnyalat", "Széles fogsor", "Szorosan zárt fogak",
        "Természetesen fehér", "Tökéletes fogsor"
      ],
      files: {
        "Apró fogak": "fogak_apro_v2.png", "Arany fog": "fogak_arany_fog_v2.png",
        "Átlátszó fogszabályzó": "fogak_atlatszo_fogszabalyzo_v2.png", "Csorba fog": "fogak_csorba_v2.png",
        "Előreálló fogak": "fogak_eloreallo_v2.png", "Enyhén szabálytalan": "fogak_enyhen_szabalytalan_v2.png",
        "Ezüst fog": "fogak_ezust_fog_v2.png", "Fehérített fogak": "fogak_feheritett_v2.png",
        "Fekete / lyukas fog": "fogak_fekete_lyukas_v2.png", "Fém fogszabályzó": "fogak_fem_fogszabalyzo_v2.png",
        "Fog nélküli": "fogak_fog_nelkuli_v2.png", "Íny domináns mosoly": "fogak_iny_dominans_v2.png",
        "Normál": "fogak_normal_v2.png", "Rés a fogak között": "fogak_res_v2.png",
        "Részben látható fogak": "fogak_reszben_lathato_v2.png", "Sárgás árnyalat": "fogak_sargas_v2.png",
        "Széles fogsor": "fogak_szeles_fogsor_v2.png", "Szorosan zárt fogak": "fogak_szorosan_zart_v2.png",
        "Természetesen fehér": "fogak_termeszetesen_feher_v2.png", "Tökéletes fogsor": "fogak_tokeletes_v2.png"
      }
    },
    arcjegyek: {
      folder: "arcjegyek",
      order: ["Anyajegy az arcon","Arcfestés","Arctetoválás","Égési nyom","Egy apró anyajegy az ajak fölött","Enyhe bőrpirosodás az orron","Enyhe szem alatti karikák","Finom mosolyvonalak","Gödröcskés orca","Halvány hegvonal az arcon","Halvány szarkalábak","Pár apró anyajegy","Szeplős orr- és arctáj","Szépségpötty az arcon","Természetes pír az orcákon"],
      files: {
        "Anyajegy az arcon":"arcjegy_anyajegy_v2.png","Arcfestés":"arcjegy_arcfestes_v2.png","Arctetoválás":"arcjegy_arctetovalas_v2.png","Égési nyom":"arcjegy_egesi_nyom_v2.png","Egy apró anyajegy az ajak fölött":"arcjegy_anyajegy_ajak_folott_v2.png","Enyhe bőrpirosodás az orron":"arcjegy_piros_orr_v2.png","Enyhe szem alatti karikák":"arcjegy_szem_alatti_karikak_v2.png","Finom mosolyvonalak":"arcjegy_mosolyvonalak_v2.png","Gödröcskés orca":"arcjegy_godrocskes_orca_v2.png","Halvány hegvonal az arcon":"arcjegy_halvany_hegvonal_v2.png","Halvány szarkalábak":"arcjegy_szarkalabak_v2.png","Pár apró anyajegy":"arcjegy_par_anyajegy_v2.png","Szeplős orr- és arctáj":"arcjegy_szeplos_orr_arc_v2.png","Szépségpötty az arcon":"arcjegy_szepsegpotty_v2.png","Természetes pír az orcákon":"arcjegy_termeszetes_pir_v2.png"
      }
    },
    bortextura: {
      folder: "bortextura",
      order: ["Heges","Pattanásos","Pigmentfoltos","Ráncos","Sebhelyes","Sima","Szeplős"],
      files: {"Heges":"bortextura_heges_v2.png","Pattanásos":"bortextura_pattanasos_v2.png","Pigmentfoltos":"bortextura_pigmentfoltos_v2.png","Ráncos":"bortextura_rancos_v2.png","Sebhelyes":"bortextura_sebhelyes_v2.png","Sima":"bortextura_sima_v2.png","Szeplős":"bortextura_szeplos_v2.png"}
    },
    szemfestes: {
      folder: "szemfestes",
      order: [
        "Arany csillámos szemhéjpúder a mozgó szemhéjon, barnás satírral a mélyítővonalban, fekete tus vonal a felső szempillák tövében, enyhén kihúzott cicaszem formában",
        "Default",
        "Erőteljes, grafikus szemsmink: fekete szemceruza a felső és alsó pillasor mentén, élesen megrajzolt külső és belső szemzug",
        "Füstös szemsmink: sötétszürke-fekete árnyalat a szempillavonalnál, finoman eldolgozva a szemhéj felé, enyhe fényes hatással, sötétszürke tus az alsó és felső pillasoron, vastagon festett felső szempillák, letisztult szemöldök",
        "Meleg réz- és bronzszemhéjpúder, arany fény a belső szemzugban, lágy árnyalás az alsó pillasoron, hosszú szempillák",
        "Metálos türkiz–zöld szemsmink arany belső szemzuggal, a külső szemzugnál sötétszürke-barna satírozással, az alsó pillasoron is árnyalva; természetes, formázott szemöldök és díszes ezüst-fekete homlokékszer egészíti ki a látványt",
        "Világoskék–ezüst szemhéjpúder, finoman sötétített külső szemzuggal, az alsó pillasoron is kék árnyalással; fekete tus a felső szempillák tövében, hangsúlyos szempillák, a szemöldök alatt enyhe fényes highlighter",
        "Világoszöld–ezüst szemhéjpúder, finoman sötétített külső szemzuggal, az alsó pillasoron is kék árnyalással; fekete tus a felső szempillák tövében, hangsúlyos szempillák, a szemöldök alatt enyhe fényes highlighter"
      ],
      files: {
        "Arany csillámos szemhéjpúder a mozgó szemhéjon, barnás satírral a mélyítővonalban, fekete tus vonal a felső szempillák tövében, enyhén kihúzott cicaszem formában":"szemfestes_arany_csillamos_v2.png",
        "Default":"szemfestes_default_v3.png",
        "Erőteljes, grafikus szemsmink: fekete szemceruza a felső és alsó pillasor mentén, élesen megrajzolt külső és belső szemzug":"szemfestes_grafikus_fekete_v2.png",
        "Füstös szemsmink: sötétszürke-fekete árnyalat a szempillavonalnál, finoman eldolgozva a szemhéj felé, enyhe fényes hatással, sötétszürke tus az alsó és felső pillasoron, vastagon festett felső szempillák, letisztult szemöldök":"szemfestes_fustos_v2.png",
        "Meleg réz- és bronzszemhéjpúder, arany fény a belső szemzugban, lágy árnyalás az alsó pillasoron, hosszú szempillák":"szemfestes_rez_bronz_v2.png",
        "Metálos türkiz–zöld szemsmink arany belső szemzuggal, a külső szemzugnál sötétszürke-barna satírozással, az alsó pillasoron is árnyalva; természetes, formázott szemöldök és díszes ezüst-fekete homlokékszer egészíti ki a látványt":"szemfestes_turkiz_zold_v2.png",
        "Világoskék–ezüst szemhéjpúder, finoman sötétített külső szemzuggal, az alsó pillasoron is kék árnyalással; fekete tus a felső szempillák tövében, hangsúlyos szempillák, a szemöldök alatt enyhe fényes highlighter":"szemfestes_vilagoskek_ezust_v2.png",
        "Világoszöld–ezüst szemhéjpúder, finoman sötétített külső szemzuggal, az alsó pillasoron is kék árnyalással; fekete tus a felső szempillák tövében, hangsúlyos szempillák, a szemöldök alatt enyhe fényes highlighter":"szemfestes_vilagoszold_ezust_v2.png"
      }
    },
    borsmink: {
      folder: "borsmink",
      order: ["Bronzosító","Default","Enyhe pír","Highlighter","Matt alapozás","Natúr alapozás"],
      files: {"Bronzosító":"borsmink_bronzosito_v2.png","Default":"borsmink_default_v3.png","Enyhe pír":"borsmink_enyhe_pir_v2.png","Highlighter":"borsmink_highlighter_v2.png","Matt alapozás":"borsmink_matt_alapozas_v2.png","Natúr alapozás":"borsmink_natur_alapozas_v3.png"}
    },
    ajakszin: {
      folder: "ajakszin",
      order: ["Ajakceruza kontúr","Átlátszó szájfény","Áttetsző nude gloss","Bogyós vörös szatén","Bordó vinil fény","Default","Klasszikus matt vörös","Klasszikus piros fény","Natúr rózsás nude","Piros lakkfény","Rózsás nude balzsam","Rózsás nude fény"],
      files: {"Ajakceruza kontúr":"ajakszin_ajakceruza_v2.png","Átlátszó szájfény":"ajakszin_atlatszo_szajfeny_v2.png","Áttetsző nude gloss":"ajakszin_nude_gloss_v2.png","Bogyós vörös szatén":"ajakszin_bogyos_voros_v2.png","Bordó vinil fény":"ajakszin_bordo_vinil_v2.png","Default":"ajakszin_default_v2.png","Klasszikus matt vörös":"ajakszin_matt_voros_v2.png","Klasszikus piros fény":"ajakszin_piros_feny_v2.png","Natúr rózsás nude":"ajakszin_rozsas_nude_v2.png","Piros lakkfény":"ajakszin_piros_lakk_v2.png","Rózsás nude balzsam":"ajakszin_nude_balzsam_v2.png","Rózsás nude fény":"ajakszin_nude_feny_v2.png"}
    },
    hajszin: {
      folder: "hajszin",
      generatedFiles: true,
      versionedGeneratedFiles: {
        barna: "hajszin_barna_v2.png",
        fekete: "hajszin_fekete_v2.png",
        festett_voros: "hajszin_festett_voros_v2.png",
        osz: "hajszin_osz_v2.png",
        pasztell_kek: "hajszin_pasztell_kek_v2.png",
        pasztell_rozsaszin: "hajszin_pasztell_rozsaszin_v2.png",
        platinaszoke: "hajszin_platinaszoke_v2.png",
        rezvoros: "hajszin_rezvoros_v2.png",
        szoke: "hajszin_szoke_v2.png",
        szokesbarna: "hajszin_szokesbarna_v2.png",
        voros: "hajszin_voros_v2.png",
        vorosesbarna: "hajszin_vorosesbarna_v2.png",
        melirozott_tobbszinu: "hajszin_melirozott_tobbszinu_v2.png"
      },
      order: [
            "Barna",
            "Fekete",
            "Festett vĂ¶rĂ¶s",
            "Ĺsz",
            "Pasztell kĂ©k",
            "Pasztell rĂłzsaszĂ­n",
            "PlatinaszĹ‘ke",
            "RĂ©zvĂ¶rĂ¶s",
            "SzĹ‘ke",
            "SzĹ‘kĂ©sbarna",
            "VĂ¶rĂ¶s",
            "VĂ¶rĂ¶sesbarna"
      ],
      files: {
            "Barna": "hajszin_barna.png",
            "Fekete": "hajszin_fekete.png",
            "Festett vĂ¶rĂ¶s": "hajszin_festett_voros.png",
            "Ĺsz": "hajszin_osz.png",
            "Pasztell kĂ©k": "hajszin_pasztell_kek.png",
            "Pasztell rĂłzsaszĂ­n": "hajszin_pasztell_rozsaszin.png",
            "PlatinaszĹ‘ke": "hajszin_platinaszoke.png",
            "RĂ©zvĂ¶rĂ¶s": "hajszin_rezvoros.png",
            "SzĹ‘ke": "hajszin_szoke.png",
            "SzĹ‘kĂ©sbarna": "hajszin_szokesbarna.png",
            "VĂ¶rĂ¶s": "hajszin_voros.png",
            "VĂ¶rĂ¶sesbarna": "hajszin_vorosesbarna.png"
      }
    },
    hajhossz: {
      folder: "hajhossz",
      generatedFiles: true,
      versionedGeneratedFiles: {
        extra_hosszu: "hajhossz_extra_hosszu_v2.png",
        feloldalas_oldalt_felnyirt: "hajhossz_feloldalas_oldalt_felnyirt_v2.png",
        hosszu: "hajhossz_hosszu_v2.png",
        kozepes: "hajhossz_kozepes_v2.png",
        nagyon_rovid: "hajhossz_nagyon_rovid_v2.png",
        rovid: "hajhossz_rovid_v2.png"
      },
      order: [
            "Extra hosszĂş",
            "FĂ©loldalas / oldalt felnyĂ­rt",
            "HosszĂş",
            "KĂ¶zepes",
            "Nagyon rĂ¶vid",
            "RĂ¶vid"
      ],
      files: {
            "Extra hosszĂş": "hajhossz_extra_hosszu.png",
            "FĂ©loldalas / oldalt felnyĂ­rt": "hajhossz_feloldalas_oldalt_felnyirt.png",
            "HosszĂş": "hajhossz_hosszu.png",
            "KĂ¶zepes": "hajhossz_kozepes.png",
            "Nagyon rĂ¶vid": "hajhossz_nagyon_rovid.png",
            "RĂ¶vid": "hajhossz_rovid.png"
      }
    },
    hajsuruseg: {
      folder: "hajsuruseg",
      generatedFiles: true,
      versionedGeneratedFiles: {
        ritka: "hajsuruseg_ritka_v2.png",
        dus: "hajsuruseg_dus_v2.png",
        extra_dus: "hajsuruseg_extra_dus_v2.png",
        normal: "hajsuruseg_normal_v2.png"
      },
      order: [
            "DĂşs",
            "Extra dĂşs",
            "NormĂˇl",
            "Ritka"
      ],
      files: {
            "DĂşs": "hajsuruseg_dus.png",
            "Extra dĂşs": "hajsuruseg_extra_dus.png",
            "NormĂˇl": "hajsuruseg_normal.png",
            "Ritka": "hajsuruseg_ritka.png"
      }
    },
    hajstilus: {
      folder: "hajstilus",
      generatedFiles: true,
      versionedGeneratedFiles: {
        afro: "hajstilus_afro_v2.png",
        azott_vizes: "hajstilus_azott_vizes_v2.png",
        bob_frizura: "hajstilus_bob_frizura_v2.png",
        copf: "hajstilus_copf_v2.png",
        egyenes: "hajstilus_egyenes_v2.png",
        felso_konty_top_knot: "hajstilus_felso_konty_top_knot_v2.png",
        fonatok_braids: "hajstilus_fonatok_braids_v2.png",
        gondor: "hajstilus_gondor_v2.png",
        hosszu_egyenes_enyhen_retegezett_szoke_haj_laza_oldalvalasztekkal_kicsit_kocos_termeszetes_hatasu_frizura: "hajstilus_hosszu_egyenes_enyhen_retegezett_szoke_haj_laza_oldalvalasztekkal_kicsit_kocos_termeszetes_hatasu_frizura_v2.png",
        hullamos: "hajstilus_hullamos_v2.png",
        konty: "hajstilus_konty_v2.png",
        kopasz: "hajstilus_kopasz_v2.png",
        kopasz_borotvalt: "hajstilus_kopasz_borotvalt_v2.png",
        kopasz_geppel_nyirt: "hajstilus_kopasz_geppel_nyirt_v2.png",
        kozephosszu_reteges_frizura_lagy_hullamokkal_es_legies_volumennel: "hajstilus_kozephosszu_reteges_frizura_lagy_hullamokkal_es_legies_volumennel_v2.png",
        laza_magas_konty_kiengedett_tincsekkel_bohem_stilusban: "hajstilus_laza_magas_konty_kiengedett_tincsekkel_bohem_stilusban_v2.png",
        laza_romantikus_konty_enyhen_tupirozott_tovekkel_finoman_kiengedett_tincsekkel: "hajstilus_laza_romantikus_konty_enyhen_tupirozott_tovekkel_finoman_kiengedett_tincsekkel_v2.png",
        lenyirt_buzz_cut: "hajstilus_lenyirt_buzz_cut_v2.png",
        mohawk: "hajstilus_mohawk_v2.png",
        pixie_vagas: "hajstilus_pixie_vagas_v2.png",
        raszta: "hajstilus_raszta_v2.png",
        rovid_reteges_bob_laza_hullamokkal_es_enyhe_volumennel: "hajstilus_rovid_reteges_bob_laza_hullamokkal_es_enyhe_volumennel_v2.png",
        rovid_reteges_pixie_frizura: "hajstilus_rovid_reteges_pixie_frizura_v2.png",
        rovid_tepett_shag_frizura: "hajstilus_rovid_tepett_shag_frizura_v2.png",
        vallig_ero_dus_gondor_frizura_termeszetes_volumennel: "hajstilus_vallig_ero_dus_gondor_frizura_termeszetes_volumennel_v2.png",
        klasszikus_oldalvalasztek: "hajstilus_klasszikus_oldalvalasztek_v2.png",
        texturalt_crop: "hajstilus_texturalt_crop_v2.png",
        crew_cut: "hajstilus_crew_cut_v2.png",
        alacsony_fade: "hajstilus_alacsony_fade_v2.png",
        pompadour: "hajstilus_pompadour_v2.png",
        slick_back: "hajstilus_slick_back_v2.png",
        undercut: "hajstilus_undercut_v2.png",
        francia_bob: "hajstilus_francia_bob_v2.png",
        lob_hosszu_bob: "hajstilus_lob_hosszu_bob_v2.png",
        old_hollywood_hullamok: "hajstilus_old_hollywood_hullamok_v2.png",
        felkonty: "hajstilus_felkonty_v2.png",
        holland_fonat: "hajstilus_holland_fonat_v2.png",
        oldalra_soport_hosszu_haj: "hajstilus_oldalra_soport_hosszu_haj_v2.png",
        volumenes_blowout: "hajstilus_volumenes_blowout_v2.png",
        wolf_cut: "hajstilus_wolf_cut_v2.png",
        mullet: "hajstilus_mullet_v2.png",
        aszimmetrikus_rovid_frizura: "hajstilus_aszimmetrikus_rovid_frizura_v2.png",
        vallig_ero_egyenes_haj: "hajstilus_vallig_ero_egyenes_haj_v2.png",
        preciz_allig_ero_bob_egyenes_frufruval: "hajstilus_preciz_allig_ero_bob_egyenes_frufruval_v2.png",
        aszimmetrikus_reteges_bob_oldalfrufruval: "hajstilus_aszimmetrikus_reteges_bob_oldalfrufruval_v2.png",
        rovid_texturalt_pixie_hosszu_oldalfrufruval: "hajstilus_rovid_texturalt_pixie_hosszu_oldalfrufruval_v2.png",
        kozephosszu_hullamos_shag_ritka_frufruval: "hajstilus_kozephosszu_hullamos_shag_ritka_frufruval_v2.png",
        rovid_oldalra_soport_texturalt_haj: "hajstilus_rovid_oldalra_soport_texturalt_haj_v2.png",
        kozephosszu_kocos_hatrafesult_haj: "hajstilus_kozephosszu_kocos_hatrafesult_haj_v2.png",
        modern_quiff_oldalt_roviditve: "hajstilus_modern_quiff_oldalt_roviditve_v2.png",
        bundesliga_frizura: "hajstilus_bundesliga_frizura_v2.png"
      },
      order: [
            "Afro",
            "Ăzott/vizes",
            "Bob frizura",
            "Copf",
            "Egyenes",
            "FelsĹ‘ konty (top knot)",
            "Fonatok (braids)",
            "GĂ¶ndĂ¶r",
            "HosszĂş, egyenes, enyhĂ©n rĂ©tegezett szĹ‘ke haj, laza oldalvĂˇlasztĂ©kkal, kicsit kĂłcos, termĂ©szetes hatĂˇsĂş frizura",
            "HullĂˇmos",
            "Konty",
            "Kopasz",
            "Kopasz, borotvĂˇlt",
            "Kopasz, gĂ©ppel nyĂ­rt",
            "KĂ¶zĂ©phosszĂş, rĂ©teges frizura lĂˇgy hullĂˇmokkal Ă©s lĂ©gies volumenÂ­nel",
            "Laza, magas konty kiengedett tincsekkel, bohĂ©m stĂ­lusban",
            "Laza, romantikus konty, enyhĂ©n tupĂ­rozott tĂ¶vekkel, finoman kiengedett tincsekkel",
            "LenyĂ­rt (buzz cut)",
            "Mohawk",
            "Pixie vĂˇgĂˇs",
            "Raszta",
            "RĂ¶vid, rĂ©teges bob, laza hullĂˇmokkal Ă©s enyhe volumenÂ­nel",
            "RĂ¶vid, rĂ©teges pixie frizura",
            "RĂ¶vid, tĂ©pett shag frizura",
            "VĂˇllig Ă©rĹ‘, dĂşs gĂ¶ndĂ¶r frizura, termĂ©szetes volumenÂ­nel",
            "Klasszikus oldalvĂˇlasztĂ©k",
            "TexturĂˇlt crop",
            "Crew cut",
            "Alacsony fade",
            "Pompadour",
            "Slick back",
            "Undercut",
            "Francia bob",
            "Lob / hosszĂş bob",
            "Old Hollywood hullĂˇmok",
            "FĂ©lkonty",
            "Holland fonat",
            "Oldalra sĂ¶pĂ¶rt hosszĂş haj",
            "Volumenes blowout",
            "Wolf cut",
            "Mullet",
            "Aszimmetrikus rĂ¶vid frizura",
            "VĂˇllig Ă©rĹ‘ egyenes haj"
      ],
      files: {
            "Afro": "hajstilus_afro.png",
            "Ăzott/vizes": "hajstilus_azott_vizes.png",
            "Bob frizura": "hajstilus_bob_frizura.png",
            "Copf": "hajstilus_copf.png",
            "Egyenes": "hajstilus_egyenes.png",
            "FelsĹ‘ konty (top knot)": "hajstilus_felso_konty_top_knot.png",
            "Fonatok (braids)": "hajstilus_fonatok_braids.png",
            "GĂ¶ndĂ¶r": "hajstilus_gondor.png",
            "HosszĂş, egyenes, enyhĂ©n rĂ©tegezett szĹ‘ke haj, laza oldalvĂˇlasztĂ©kkal, kicsit kĂłcos, termĂ©szetes hatĂˇsĂş frizura": "hajstilus_hosszu_egyenes_enyhen_retegezett_szoke_haj_laza_oldalvalasztekkal_kicsit_kocos_termeszetes_hatasu_frizura.png",
            "HullĂˇmos": "hajstilus_hullamos.png",
            "Konty": "hajstilus_konty.png",
            "Kopasz": "hajstilus_kopasz.png",
            "Kopasz, borotvĂˇlt": "hajstilus_kopasz_borotvalt.png",
            "Kopasz, gĂ©ppel nyĂ­rt": "hajstilus_kopasz_geppel_nyirt.png",
            "KĂ¶zĂ©phosszĂş, rĂ©teges frizura lĂˇgy hullĂˇmokkal Ă©s lĂ©gies volumenÂ­nel": "hajstilus_kozephosszu_reteges_frizura_lagy_hullamokkal_es_legies_volumennel.png",
            "Laza, magas konty kiengedett tincsekkel, bohĂ©m stĂ­lusban": "hajstilus_laza_magas_konty_kiengedett_tincsekkel_bohem_stilusban.png",
            "Laza, romantikus konty, enyhĂ©n tupĂ­rozott tĂ¶vekkel, finoman kiengedett tincsekkel": "hajstilus_laza_romantikus_konty_enyhen_tupirozott_tovekkel_finoman_kiengedett_tincsekkel.png",
            "LenyĂ­rt (buzz cut)": "hajstilus_lenyirt_buzz_cut.png",
            "Mohawk": "hajstilus_mohawk.png",
            "Pixie vĂˇgĂˇs": "hajstilus_pixie_vagas.png",
            "Raszta": "hajstilus_raszta.png",
            "RĂ¶vid, rĂ©teges bob, laza hullĂˇmokkal Ă©s enyhe volumenÂ­nel": "hajstilus_rovid_reteges_bob_laza_hullamokkal_es_enyhe_volumennel.png",
            "RĂ¶vid, rĂ©teges pixie frizura": "hajstilus_rovid_reteges_pixie_frizura.png",
            "RĂ¶vid, tĂ©pett shag frizura": "hajstilus_rovid_tepett_shag_frizura.png",
            "VĂˇllig Ă©rĹ‘, dĂşs gĂ¶ndĂ¶r frizura, termĂ©szetes volumenÂ­nel": "hajstilus_vallig_ero_dus_gondor_frizura_termeszetes_volumennel.png",
            "Klasszikus oldalvĂˇlasztĂ©k": "hajstilus_klasszikus_oldalvalasztek.png",
            "TexturĂˇlt crop": "hajstilus_texturalt_crop.png",
            "Crew cut": "hajstilus_crew_cut.png",
            "Alacsony fade": "hajstilus_alacsony_fade.png",
            "Pompadour": "hajstilus_pompadour.png",
            "Slick back": "hajstilus_slick_back.png",
            "Undercut": "hajstilus_undercut.png",
            "Francia bob": "hajstilus_francia_bob.png",
            "Lob / hosszĂş bob": "hajstilus_lob_hosszu_bob.png",
            "Old Hollywood hullĂˇmok": "hajstilus_old_hollywood_hullamok.png",
            "FĂ©lkonty": "hajstilus_felkonty.png",
            "Holland fonat": "hajstilus_holland_fonat.png",
            "Oldalra sĂ¶pĂ¶rt hosszĂş haj": "hajstilus_oldalra_soport_hosszu_haj.png",
            "Volumenes blowout": "hajstilus_volumenes_blowout.png",
            "Wolf cut": "hajstilus_wolf_cut.png",
            "Mullet": "hajstilus_mullet.png",
            "Aszimmetrikus rĂ¶vid frizura": "hajstilus_aszimmetrikus_rovid_frizura.png",
            "VĂˇllig Ă©rĹ‘ egyenes haj": "hajstilus_vallig_ero_egyenes_haj.png"
      }
    },
    arcszorzet: {
      folder: "arcszorzet",
      generatedFiles: true,
      order: [
            "Bajusz",
            "Enyhe borosta",
            "ErĹ‘s borosta",
            "HosszĂş szakĂˇll",
            "KecskeszakĂˇll",
            "Kockabajusz",
            "KĂ¶rszakĂˇll",
            "KĂ¶zepes borosta",
            "Nincs",
            "Pajesz",
            "Soul patch",
            "Teljes szakĂˇll",
            "TisztĂˇra borotvĂˇlt"
      ],
      files: {
            "Bajusz": "arcszorzet_bajusz.png",
            "Enyhe borosta": "arcszorzet_enyhe_borosta.png",
            "ErĹ‘s borosta": "arcszorzet_eros_borosta.png",
            "HosszĂş szakĂˇll": "arcszorzet_hosszu_szakall.png",
            "KecskeszakĂˇll": "arcszorzet_kecskeszakall.png",
            "Kockabajusz": "arcszorzet_kockabajusz.png",
            "KĂ¶rszakĂˇll": "arcszorzet_korszakall.png",
            "KĂ¶zepes borosta": "arcszorzet_kozepes_borosta.png",
            "Nincs": "arcszorzet_nincs.png",
            "Pajesz": "arcszorzet_pajesz.png",
            "Soul patch": "arcszorzet_soul_patch.png",
            "Teljes szakĂˇll": "arcszorzet_teljes_szakall.png",
            "TisztĂˇra borotvĂˇlt": "arcszorzet_tisztara_borotvalt.png"
      }
    },
    szemforma: {
      folder: "szemforma",
      aspectRatio: "eye-shape",
      order: [
        "Finom epikantikus redő",
        "Kettős szemhéj",
        "Kifejezett epikantikus redő",
        "Mandula alakú szemek",
        "Mélyen ülő szemek",
        "Monolid szemek"
      ],
      files: {
        "Finom epikantikus redő": "szemforma_finom_epikantikus_redo_v3.png",
        "Kettős szemhéj": "szemforma_kettos_szemhej_v3.png",
        "Kifejezett epikantikus redő": "szemforma_kifejezett_epikantikus_redo_v3.png",
        "Mandula alakú szemek": "szemforma_mandula_alaku_szemek_v3.png",
        "Mélyen ülő szemek": "szemforma_melyen_ulo_szemek_v3.png",
        "Monolid szemek": "szemforma_monolid_szemek_v3.png"
      }
    },
    szemoldokForma: {
      folder: "szemoldok",
      order: [
        "Egyenes",
        "Erősen ívelt",
        "Ívelt",
        "Kerek",
        "Lágyan ívelt",
        "S-alakú",
        "Szögletes",
        "Szögletes (lágyított)"
      ],
      files: {
        "Egyenes": "szemoldok_egyenes_v2.png",
        "Erősen ívelt": "szemoldok_erosen_ivelt_v2.png",
        "Ívelt": "szemoldok_ivelt_v2.png",
        "Kerek": "szemoldok_kerek_v2.png",
        "Lágyan ívelt": "szemoldok_lagyan_ivelt_v2.png",
        "S-alakú": "szemoldok_s_alaku_v2.png",
        "Szögletes": "szemoldok_szogletes_v2.png",
        "Szögletes (lágyított)": "szemoldok_szogletes_lagyitott_v2.png"
      }
    },
    szemoldokSuruseg: {
      folder: "szemoldok_suruseg",
      aspectRatio: "eye-detail",
      order: [
        "Bozontos",
        "Feathered",
        "Gondozott",
        "Közepes",
        "Tetovált",
        "Vastag",
        "Vékony"
      ],
      files: {
        "Bozontos": "szemoldok_bozontos_v2.png",
        "Feathered": "szemoldok_feathered_v2.png",
        "Gondozott": "szemoldok_gondozott_v2.png",
        "Közepes": "szemoldok_kozepes_v2.png",
        "Tetovált": "szemoldok_tetovalt_v2.png",
        "Vastag": "szemoldok_vastag_v2.png",
        "Vékony": "szemoldok_vekony_v2.png"
      }
    },
    szempilla: {
      folder: "szempilla",
      aspectRatio: "eye-detail",
      order: [
        "Alsó gyenge",
        "Alsó hangsúlyos",
        "Hosszú, dús",
        "Hosszú, ívelt",
        "Közepes, natúr",
        "Közepes, spirálozott",
        "Rövid, ritkás",
        "Rövid, sűrű"
      ],
      files: {
        "Alsó gyenge": "szempilla_also_gyenge_v2.png",
        "Alsó hangsúlyos": "szempilla_also_hangsulyos_v2.png",
        "Hosszú, dús": "szempilla_hosszu_dus_v2.png",
        "Hosszú, ívelt": "szempilla_hosszu_ivelt_v2.png",
        "Közepes, natúr": "szempilla_kozepes_natur_v2.png",
        "Közepes, spirálozott": "szempilla_kozepes_spiralozott_v2.png",
        "Rövid, ritkás": "szempilla_rovid_ritkas_v2.png",
        "Rövid, sűrű": "szempilla_rovid_suru_v2.png"
      }
    },
    szemszin: {
      folder: "szem",
      aspectRatio: "landscape",
      order: [
        "Borostyán",
        "Centrális heterokrómiás",
        "Heterokrómiás (két különböző szín)",
        "Kék",
        "Középbarna",
        "Mogyoróbarna (hazel)",
        "Nagyon sötét barna (majdnem fekete)",
        "Sötétbarna",
        "Sötétkék",
        "Sötétzöld",
        "Szektorális heterokrómiás",
        "Szürke",
        "Világosbarna",
        "Világoskék",
        "Világoszöld",
        "Zöld"
      ],
      files: {
        "Borostyán": "szem_borostyan_v2.png",
        "Centrális heterokrómiás": "szem_centralis_heterokromia_v2.png",
        "Heterokrómiás (két különböző szín)": "szem_heterokromia_v2.png",
        "Kék": "szem_kek_v2.png",
        "Középbarna": "szem_kozepbarna_v2.png",
        "Mogyoróbarna (hazel)": "szem_mogyorobarna_v2.png",
        "Nagyon sötét barna (majdnem fekete)": "szem_nagyon_sotet_barna_v2.png",
        "Sötétbarna": "szem_sotetbarna_v2.png",
        "Sötétkék": "szem_sotetkek_v2.png",
        "Sötétzöld": "szem_sotetzold_v2.png",
        "Szektorális heterokrómiás": "szem_szektoralis_heterokromia_v2.png",
        "Szürke": "szem_szurke_v2.png",
        "Világosbarna": "szem_vilagosbarna_v2.png",
        "Világoskék": "szem_vilagoskek_v2.png",
        "Világoszöld": "szem_vilagoszold_v2.png",
        "Zöld": "szem_zold_v2.png"
      }
    },
    irisz: {
      folder: "irisz",
      aspectRatio: "iris",
      order: [
        "Albínó halvány",
        "Arany pöttyös",
        "Egyszínű pigmentált",
        "Heterochromia",
        "Körgyűrűs",
        "Márványos / pettyes",
        "Sektorális hetero",
        "Sugaras mintázat"
      ],
      files: {
        "Albínó halvány": "irisz_albino_halvany_v2.png",
        "Arany pöttyös": "irisz_arany_pottyos_v2.png",
        "Egyszínű pigmentált": "irisz_egyszinu_pigmentalt_v2.png",
        "Heterochromia": "irisz_heterochromia_v2.png",
        "Körgyűrűs": "irisz_korgyurus_v2.png",
        "Márványos / pettyes": "irisz_marvanyos_pettyes_v2.png",
        "Sektorális hetero": "irisz_szektoralis_hetero_v2.png",
        "Sugaras mintázat": "irisz_sugaras_mintazat_v2.png"
      }
    },
    ajkak: {
      folder: "ajak",
      order: [
        "Ámorív",
        "Szív alakú",
        "Teltebb felső ajak",
        "Egyenetlen ajkak",
        "Teltebb alsó ajak",
        "Kerek ajkak",
        "Lefelé ívelő ajkak",
        "Szögletes (lágyított)",
        "Széles ajkak",
        "Teljes ajak"
      ],
      files: {
        "Ámorív": "ajak_amoriv_v2.png",
        "Szív alakú": "ajak_sziv_alaku_v2.png",
        "Teltebb felső ajak": "ajak_teltebb_felso_ajak_v2.png",
        "Egyenetlen ajkak": "ajak_egyenetlen_ajkak_v2.png",
        "Teltebb alsó ajak": "ajak_teltebb_also_anyag_v2.png",
        "Kerek ajkak": "ajak_kerek_ajkak_v2.png",
        "Lefelé ívelő ajkak": "ajak_lefele_ivelo_ajkak_v2.png",
        "Szögletes (lágyított)": "ajak_szogletes_lagyitott_v2.png",
        "Széles ajkak": "ajak_szeles_ajkak_v2.png",
        "Teljes ajak": "ajak_teljes_ajkak_v2.png"
      }
    },
    tekintet: {
      folder: "tekintet",
      generatedFiles: true
    },
    arckifejezes: {
      folder: "arckifejezes",
      generatedFiles: true
    }
  };
  const MULTI_FACE_KEYS = new Set(["arcjegyek"]);
  const FACE_VALUE_CONFLICTS = {
    arcjegyek: [
      ["Anyajegy az arcon", "Pár apró anyajegy"]
    ]
  };

  function faceValuesConflict(key, first, second) {
    return (FACE_VALUE_CONFLICTS[key] || []).some((pair) => pair.includes(first) && pair.includes(second));
  }

  function compatibleFaceValues(key, values) {
    return values.reduce((result, value) => {
      const filtered = result.filter((item) => !faceValuesConflict(key, item, value));
      filtered.push(value);
      return filtered;
    }, []);
  }

  const LOCAL_DATABASE_ROWS = {
    tbl_altipusok: [
      { altipus_id: "Mediterrán", altipus_prompt: "mediterranean" },
      { altipus_id: "Skandináv", altipus_prompt: "scandinavian" },
      { altipus_id: "Szláv", altipus_prompt: "slavic" },
      { altipus_id: "Török", altipus_prompt: "turkish" },
      { altipus_id: "Ukrán", altipus_prompt: "ukrainian" },
      { altipus_id: "Vietnami", altipus_prompt: "vietnamese" },
      { altipus_id: "Yoruba", altipus_prompt: "yoruba" },
      { altipus_id: "Balkáni", altipus_prompt: "balkan" },
      { altipus_id: "Baltikumi", altipus_prompt: "baltic" },
      { altipus_id: "Grúz", altipus_prompt: "georgian" },
      { altipus_id: "Örmény", altipus_prompt: "armenian" }
    ],
    tbl_position: [
      { position_id: "Félalak", position_prompt: "half-length portrait" },
      { position_id: "Mellkép közel", position_prompt: "close bust portrait" },
      { position_id: "Portré fej-nyak vállal", position_prompt: "head and shoulders portrait including neck and shoulders" }
    ],
    tbl_szemoldok_forma: [
      {
        szemoldokforma_id: "Szögletes (lágyított)",
        szemoldokforma_prompt: "softened angular eyebrows"
      }
    ],
    tbl_ajkak: [
      { ajaktipus_id: "Ámorív", ajak_prompt: "Cupid's bow lips" },
      { ajaktipus_id: "Szív alakú", ajak_prompt: "heart-shaped lips" },
      { ajaktipus_id: "Teltebb felső ajak", ajak_prompt: "fuller upper lip, thinner lower lip" },
      { ajaktipus_id: "Egyenetlen ajkak", ajak_prompt: "uneven lips, asymmetrical lips" },
      { ajaktipus_id: "Teltebb alsó ajak", ajak_prompt: "thin upper lip, fuller lower lip" },
      { ajaktipus_id: "Kerek ajkak", ajak_prompt: "round lips" },
      { ajaktipus_id: "Lefelé ívelő ajkak", ajak_prompt: "downturned lips" },
      { ajaktipus_id: "Szögletes (lágyított)", ajak_prompt: "softened angular lips" },
      { ajaktipus_id: "Széles ajkak", ajak_prompt: "wide lips" },
      { ajaktipus_id: "Teljes ajak", ajak_prompt: "full lips, plump lips" }
    ],
    tbl_idojaras: [
      { weather_key: "snow_shower", label: "Hózápor", ev_modifier: -3, prompt: "localized intense snow shower with wind-driven flakes and rapidly changing visibility" },
      { weather_key: "fog", label: "Köd", ev_modifier: -4, prompt: "dense ground fog with strongly reduced visibility, softened depth and diffuse low-contrast light" },
      { weather_key: "mist", label: "Pára", ev_modifier: -2, prompt: "light atmospheric mist hovering close to the terrain, gentle aerial perspective and retained natural detail" },
      { weather_key: "rime", label: "Zúzmara", ev_modifier: -1.5, prompt: "cold rime frost coating exposed vegetation and surfaces, pale reflected winter light" },
      { weather_key: "sandstorm", label: "Homokvihar", ev_modifier: -6, prompt: "powerful wind-driven sandstorm, ochre airborne dust, strongly reduced visibility and physically plausible desert atmosphere" },
      { weather_key: "tornado", label: "Tornádó", ev_modifier: -7, prompt: "physically plausible tornado beneath a severe rotating thunderstorm, visible condensation funnel connected to the cloud base, localized airborne debris and dramatically reduced visibility" },
      { weather_key: "dust_devil", label: "Porördög", ev_modifier: -1, prompt: "small physically plausible dust devil over a hot dry surface, narrow rotating column of lifted dust under otherwise fair daylight" },
      { weather_key: "waterspout", label: "Víztölcsér", ev_modifier: -5, prompt: "physically plausible waterspout connected to a convective cloud base above open water, visible spray ring and darkened maritime atmosphere" },
      { weather_key: "blowing_snow", label: "Hófúvás", ev_modifier: -5, prompt: "strong wind-driven blowing snow close to the ground, drifting snow streamers, sharply reduced visibility and realistic cold storm conditions" },
      { weather_key: "aurora", label: "Sarki fény", ev_modifier: -8, prompt: "physically plausible aurora borealis across a clear dark northern night sky, natural green and violet curtains" },
      { weather_key: "rainbow", label: "Szivárvány", ev_modifier: -0.5, prompt: "natural rainbow in moisture-rich air after rainfall, sunlight breaking through retreating clouds" },
      { weather_key: "hail", label: "Jégeső", ev_modifier: -5, prompt: "intense hail shower with visible ice pellets, dark convective cloud and wet reflective ground" },
      { weather_key: "sleet", label: "Havas eső", ev_modifier: -4, prompt: "mixed rain and wet snow falling in near-freezing air, cold wet surfaces and muted light" },
      { weather_key: "mirage", label: "Délibáb", ev_modifier: -0.5, prompt: "realistic heat shimmer and distant inferior mirage above a sun-baked arid surface" }
    ],
    tbl_filmtipus: [
      {
        filmtipus_id: "CineStill 50D",
        filmtipus_hun: "nappali mozifilm finom szemcsével, természetes bőrtónussal és széles tónustartománnyal",
        ajanlott_jelenetek: "Napos kültér, természet, építészet, filmes portré",
        filmtipus_prompt: "daylight-balanced cinematic color negative, fine grain, broad dynamic range, natural skin tones, gently luminous highlights, CineStill 50D film stock"
      },
      {
        filmtipus_id: "Fujifilm Acros 100 II",
        filmtipus_hun: "finomszemcsés fekete-fehér film tiszta részletekkel és gazdag középtónusokkal",
        ajanlott_jelenetek: "Tájkép, építészet, tárgyfotó, nyugodt portré",
        filmtipus_prompt: "fine-grain black and white photography, rich midtones, clean highlights, deep controlled blacks, high resolving detail, Fujifilm Acros 100 II film stock"
      },
      {
        filmtipus_id: "Ilford FP4 Plus 125",
        filmtipus_hun: "klasszikus finomszemcsés fekete-fehér film lágy tónuslépcsőkkel",
        ajanlott_jelenetek: "Nappali portré, tájkép, dokumentarista részletek",
        filmtipus_prompt: "classic fine-grain black and white photography, smooth tonal gradation, restrained contrast, crisp natural detail, Ilford FP4 Plus 125 film stock"
      },
      {
        filmtipus_id: "Kodak Gold 200",
        filmtipus_hun: "meleg, napfényes, nosztalgikus színes negatív film",
        ajanlott_jelenetek: "Utazás, családi pillanat, nyári táj, aranyóra",
        filmtipus_prompt: "warm nostalgic color negative, sunlit golden tones, lively but natural colors, gentle contrast, visible fine grain, Kodak Gold 200 film stock"
      },
      {
        filmtipus_id: "Kodak T-Max 100",
        filmtipus_hun: "nagyon finomszemcsés, modern fekete-fehér film nagy részletességgel",
        ajanlott_jelenetek: "Részletgazdag tájkép, stúdióportré, építészet, makró",
        filmtipus_prompt: "ultra-fine-grain black and white photography, high acutance, long smooth tonal scale, precise micro-detail, Kodak T-Max 100 film stock"
      },
      {
        filmtipus_id: "Lomography Color Negative 800",
        filmtipus_hun: "karakteres nagy érzékenységű színes film élénk színekkel és látható szemcsével",
        ajanlott_jelenetek: "Alkonyat, éjszakai utca, koncert, hangulatos beltér",
        filmtipus_prompt: "high-speed color negative photography, vivid imperfect colors, warm highlights, cool shadow shifts, expressive visible grain, Lomography Color Negative 800 film stock"
      }
    ]
  };

  const DERIVED_ALTIPUS_LINK_SOURCES = {
    "Mediterrán": "Dél-európai",
    "Balkáni": "Dél-európai",
    "Skandináv": "Észak-európai",
    "Baltikumi": "Észak-európai",
    "Szláv": "Kelet-európai",
    "Ukrán": "Kelet-európai",
    "Grúz": "Kaukázusi",
    "Örmény": "Kaukázusi",
    "Török": "Közel-keleti",
    "Vietnami": "Délkelet-ázsiai",
    "Yoruba": "Nyugat-afrikai"
  };

  const PHOTO_FIELDS = [
    ["film", "Filmtípus", "tbl_filmtipus", "filmtipus_id", "filmtipus_prompt"],
    ["objektiv", "Objektív", "tbl_objektiv", "objektiv", "leiras"],
    ["stilus", "Képi stílus", "tbl_stilus", "stilus", "leiras"]
  ];

  const MAX_LENS_EFFECTS = 1;
  const LENS_LIGHT_EFFECTS = [
    { key: "lens_flare", labelHu: "Lens flare", labelEn: "Lens flare", hintHu: "Természetes lencsebecsillanás látható vagy egyértelműen indokolt erős fényforrásból.", hintEn: "Natural lens flare from a visible or strongly motivated bright light source.", prompt: "subtle physically plausible lens flare from a visible or strongly motivated light source, controlled contrast, no oversized artificial flare" },
    { key: "anamorphic_flare", labelHu: "Anamorf flare", labelEn: "Anamorphic flare", hintHu: "Visszafogott vízszintes filmes fénycsík erős gyakorlati fények mentén.", hintEn: "Restrained horizontal cinematic light streak aligned with bright practical lights.", prompt: "restrained horizontal anamorphic lens flare aligned with bright practical lights, cinematic optical streak, no excessive science-fiction glow" },
    { key: "sunstar", labelHu: "Fénycsillag", labelEn: "Sunstar", hintHu: "Csillagszerű diffrakciós sugarak kis, intenzív fényforrásokon.", hintEn: "Star-shaped diffraction rays on small, intense light sources.", prompt: "natural aperture starburst on small intense light sources, crisp diffraction rays, physically plausible exposure" },
    { key: "light_leak", labelHu: "Fényszivárgás", labelEn: "Light leak", hintHu: "Finom analóg fényszivárgás a kép egyik szélén, meleg organikus elszíneződéssel.", hintEn: "Subtle analogue light leak near one frame edge with warm organic colour bleed.", prompt: "subtle analogue film light leak near one frame edge, organic warm colour bleed, restrained coverage" },
    { key: "halation", labelHu: "Halation", labelEn: "Halation", hintHu: "Finom vöröses filmes fényudvar az erős csúcsfények körül.", hintEn: "Subtle warm reddish film halo around intense highlights.", prompt: "subtle film halation around intense highlights, fine warm reddish glow without loss of detail" },
    { key: "bloom", labelHu: "Bloom", labelEn: "Bloom", hintHu: "Lágyan ragyogó csúcsfények, megőrzött középtónusokkal és részletekkel.", hintEn: "Softly glowing highlights with preserved midtones and critical detail.", prompt: "gentle highlight bloom with soft luminous roll-off, preserved midtone contrast and critical subject detail" },
    { key: "ghosting", labelHu: "Optikai ghosting", labelEn: "Optical ghosting", hintHu: "Kevés, áttetsző lencsetag-tükröződés egy indokolt erős fényforrásból.", hintEn: "Sparse translucent lens-element reflections from a motivated bright source.", prompt: "subtle lens-element ghosting from a motivated bright source, sparse translucent reflections, physically plausible placement" },
    { key: "soft_diffusion", labelHu: "Lágy diffúzió", labelEn: "Soft diffusion", hintHu: "Enyhe diffúziós szűrőhatás, lágyabb csúcsfényekkel, de megmaradó fontos részletekkel.", hintEn: "Mild diffusion-filter effect with softer highlights while retaining critical detail.", prompt: "mild optical diffusion filter effect, softened highlight roll-off and gentle skin rendering while retaining critical detail" },
    { key: "dreamy_glow", labelHu: "Álomszerű ragyogás", labelEn: "Dreamy glow", hintHu: "Álomszerű, fátyolos ragyogás lágy kontraszttal és megőrzött arcrészletekkel.", hintEn: "Dreamy veiled glow with soft contrast while preserving facial detail.", prompt: "dreamy veiled optical glow, soft luminous atmosphere and gently lowered contrast while preserving facial and subject detail" },
    { key: "chromatic_aberration", labelHu: "Kromatikus aberráció", labelEn: "Chromatic aberration", hintHu: "Nagyon enyhe színhiba kizárólag a képszéli, kontrasztos éleken.", hintEn: "Very subtle colour fringing confined to high-contrast frame edges.", prompt: "very subtle lateral chromatic aberration confined to high-contrast frame edges, natural optical imperfection" },
    { key: "vignette", labelHu: "Vignetta", labelEn: "Vignette", hintHu: "Finom, természetes optikai peremsötétedés a téma visszafogott kiemelésére.", hintEn: "Subtle natural corner darkening for unobtrusive subject emphasis.", prompt: "subtle natural optical vignetting toward the frame corners, unobtrusive subject emphasis" },
    { key: "bokeh_highlights", labelHu: "Bokeh fények", labelEn: "Bokeh highlights", hintHu: "Az objektívhez és rekeszhez illő, organikus életlen fényfoltok.", hintEn: "Organic defocused highlights shaped by the selected lens and aperture.", prompt: "organic optical bokeh highlights shaped by the selected lens and aperture, varied size and natural depth" },
    { key: "volumetric_rays", labelHu: "Volumetrikus sugarak", labelEn: "Volumetric light rays", hintHu: "A fényiránnyal egyező sugarak kizárólag indokolt ködben, párában vagy porban.", hintEn: "Light rays coherent with the selected direction, visible only in plausible haze, mist or dust.", prompt: "soft volumetric light rays visible only through plausible haze, dust or mist, coherent with the selected light direction" },
    { key: "rainbow_flare", labelHu: "Szivárvány flare", labelEn: "Rainbow flare", hintHu: "Finom szivárványszerű prizmahatás egy indokolt erős fényforrás közelében.", hintEn: "Subtle rainbow-like prism effect near a motivated bright light source.", prompt: "subtle rainbow prism lens flare near a motivated bright light source, restrained spectral separation, physically plausible optics" }
  ];

  const FILM_PREVIEW_SOURCE = "assets/film/film_reference.png";
  const FILM_PREVIEW_SOURCES = {
    "Fuji Provia 100F": "assets/film/stocks/fuji-provia-100f.png",
    "Fuji Superia 400": "assets/film/stocks/fuji-superia-400.png",
    "Fuji Velvia 50": "assets/film/stocks/fuji-velvia-50.png",
    "Ilford HP5 Plus 400": "assets/film/stocks/ilford-hp5-plus-400.png",
    "Kodak Ektar 100": "assets/film/stocks/kodak-ektar-100.png",
    "Kodak Portra 400": "assets/film/stocks/kodak-portra-400.png",
    "Kodak Tri-X 400": "assets/film/stocks/kodak-tri-x-400.png"
  };
  const LENS_PREVIEW_SOURCES = {
    "Halszemoptika": "assets/film/lenses/fisheye.png",
    "Halszemoptika fekete kerettel": "assets/film/lenses/fisheye-framed.png",
    "Makró": "assets/film/lenses/macro.png",
    "Nagylátószögű": "assets/film/lenses/wide-angle.png",
    "Portré": "assets/film/lenses/portrait.png",
    "Prime": "assets/film/lenses/prime.png",
    "Standard": "assets/film/lenses/standard.png",
    "Szupertele": "assets/film/lenses/supertele.png",
    "Teleobjektív": "assets/film/lenses/telephoto.png",
    "Tilt-shift": "assets/film/lenses/tilt-shift.png",
    "Zoom": "assets/film/lenses/zoom.png"
  };
  const LENS_APERTURE_TARGETS = {
    "Halszemoptika": 8,
    "Halszemoptika fekete kerettel": 8,
    "Makró": 8,
    "Nagylátószögű": 11,
    "Portré": 4,
    "Prime": 5.6,
    "Standard": 8,
    "Szupertele": 8,
    "Teleobjektív": 5.6,
    "Tilt-shift": 8,
    "Zoom": 5.6
  };
  const LENS_BASE_PROMPTS = {
    "Halszemoptika": "full-frame fisheye lens, approximately 12mm",
    "Halszemoptika fekete kerettel": "circular fisheye lens, approximately 8mm, natural black image circle",
    "Makró": "true 1:1 macro lens, approximately 100mm",
    "Nagylátószögű": "rectilinear ultra-wide-angle lens, approximately 16mm",
    "Portré": "portrait lens, approximately 85mm",
    "Prime": "high-quality prime lens, approximately 50mm",
    "Standard": "standard lens, approximately 50mm",
    "Szupertele": "supertelephoto lens, approximately 600mm",
    "Teleobjektív": "telephoto lens, approximately 200mm",
    "Tilt-shift": "perspective-control tilt-shift lens, approximately 45mm",
    "Zoom": "professional 24-70mm zoom lens, photographed near 55mm"
  };
  const LENS_RENDERING_PROFILES = {
    "Halszemoptika": "authentic fisheye projection, deep depth of field, crisp foreground and clearly resolved distant background, natural optical edge softness",
    "Halszemoptika fekete kerettel": "authentic circular fisheye projection inside a natural black image circle, deep depth of field, detailed foreground and background",
    "Makró": "true macro magnification, critical subject detail, naturally shallow depth of field caused by close focus, organic optical bokeh with believable background texture",
    "Nagylátószögű": "deep focus wide-angle rendering, sharp foreground, midground and distant landscape, realistic atmospheric perspective, no artificial background blur",
    "Portré": "natural portrait perspective, eyes critically sharp, moderate depth of field with a recognizable and realistically detailed background, gentle optical separation rather than extreme blur",
    "Prime": "natural prime-lens microcontrast, crisp focal subject, moderate depth of field, realistic background detail and restrained optical bokeh",
    "Standard": "human-eye perspective, balanced foreground-to-background sharpness, realistic medium depth of field and natural edge rendering",
    "Szupertele": "strong telephoto compression, critically sharp distant subject, controlled natural background defocus with retained organic texture, no synthetic blur",
    "Teleobjektív": "realistic telephoto compression, sharp subject and readable environmental layers, moderate natural background separation",
    "Tilt-shift": "optically corrected vertical lines, physically plausible selective focus plane, sharp detail within the focus band and natural gradual falloff",
    "Zoom": "realistic modern zoom-lens rendering, balanced microcontrast, moderate depth of field and clearly readable background structure"
  };
  const PHOTO_REALISM_PROMPT = "photorealistic optical rendering, lifelike natural microcontrast, fine organic surface texture, realistic skin pores and material response, restrained sharpening, smooth natural tonal transitions, no waxy or plastic skin, no over-smoothing, no synthetic bokeh, no CGI look, no artificial HDR halos";
  const NATURE_REALISM_PROMPT = "photorealistic optical rendering, lifelike natural microcontrast, fine organic surface and material texture, physically plausible light response, restrained sharpening, smooth natural tonal transitions, no waxy or plastic surfaces, no over-smoothing, no synthetic bokeh, no CGI look, no artificial HDR halos";
  const ARTWORK_QUALITY_PROMPT = "coherent composition, intentional material texture, controlled edges, consistent light direction, clear focal hierarchy, no generic plastic 3D finish, no accidental photorealistic skin";
  const PHOTOGRAPHIC_STYLE_NAMES = new Set(["Cinematic", "Fotó-realisztikus B/W", "Noir", "Retro / Vintage"]);
  const STYLE_PROMPTS = {
    "Akvarell+vonal": "transparent watercolor washes over confident hand-drawn ink contours, visible cold-pressed paper grain, selective color blooms, varied line weight, reserved highlights, airy negative space",
    "Barokk festmény": "17th-century baroque oil painting, theatrical chiaroscuro, deep warm shadows, luminous flesh and fabric, rich umber and gold palette, layered glazing, dynamic diagonal composition, ornate but believable detail",
    "Ceruza": "observational graphite drawing, precise contour construction, layered hatching and cross-hatching, soft graphite gradients, visible tooth of drawing paper, controlled highlights lifted with an eraser",
    "Cinematic": "cinematic live-action frame, motivated practical lighting, natural production design, controlled color grade, realistic contrast roll-off, deliberate blocking and composition, subtle filmic halation, framing consistent with the selected aspect ratio",
    "Concept Art": "professional production concept art, clearly resolved environment and subject design, painterly value grouping, readable silhouette, atmospheric depth, purposeful color script, presentation-ready keyframe rather than a rough draft",
    "Cyberpunk": "grounded cyberpunk visual language, rain-wet urban materials, layered neon signage glow, cyan-magenta light separation, dense lived-in technology, volumetric haze, high contrast without crushed detail",
    "Digitális festmény": "high-end digital painting, natural textured brushes, layered painterly edges, hand-shaped color transitions, controlled detail density, subtle canvas-like surface, no airbrushed plastic finish",
    "Fantasy Art": "epic fantasy illustration, believable materials and anatomy, mythic atmosphere, grand environmental scale, dramatic but coherent light, richly designed costumes and architecture, intricate focal detail with restrained background detail",
    "Fotó-realisztikus B/W": "photorealistic black and white photography, full tonal range, crisp natural detail, luminous midtones, controlled deep blacks, authentic silver-gelatin grain, realistic optical contrast",
    "Futurista": "optimistic high-design science-fiction aesthetic, streamlined forms, advanced materials, clean architectural geometry, luminous interfaces, cool controlled palette, physically believable reflections and lighting",
    "Gouache": "opaque gouache painting, matte mineral color, visible layered brushwork, crisp shape design beside softly feathered passages, simplified but dimensional values, textured watercolor paper",
    "GTA V": "stylized contemporary crime-game promotional illustration, bold cinematic framing, sharp graphic shapes, sun-baked urban palette, slightly exaggerated anatomy, painted realism, punchy controlled contrast",
    "Impresszionizmus": "late-19th-century impressionist painting, broken color brushstrokes, optical color mixing, fleeting natural light, lively atmospheric vibration, softened contours, visible woven canvas, shadows built from color rather than black",
    "Leonardo Davinci": "Italian Renaissance study aesthetic, delicate sfumato transitions, restrained earth-tone palette, precise anatomical observation, subtle chiaroscuro, fine metalpoint-like hatching, aged parchment atmosphere, balanced contemplative composition",
    "Linómetszet": "hand-carved linocut print, bold black-and-paper shapes, expressive gouged marks, varied carved line rhythm, simplified high-contrast forms, slight handmade registration irregularity, real ink-on-paper texture",
    "Low-poly 3D": "intentional low-poly 3D art, clearly faceted geometry, economical polygon silhouettes, flat and softly stepped shading, disciplined color palette, clean ambient occlusion, no glossy plastic material unless physically appropriate",
    "Marker": "professional alcohol-marker rendering, visible overlapping strokes, controlled ink bleed, layered translucent color, confident contour accents, cool-grey shadow markers, smooth marker paper texture",
    "Minimalista": "minimalist visual design, reduced essential shapes, generous negative space, disciplined two-to-four-color palette, precise alignment, strong silhouette, one unambiguous focal point",
    "Noir": "classic film noir photography, black and white, hard motivated key light, venetian-blind or architectural shadow patterns where plausible, deep blacks with preserved texture, smoky atmosphere, tense asymmetrical framing",
    "Olajfesték": "traditional oil painting, layered wet-on-wet and glazed passages, visible bristle marks, rich pigment depth, selective impasto on highlights, convincing canvas texture, carefully modeled form",
    "Pasztell": "soft pastel drawing, velvety dry pigment, broken color layering, blended gradients beside crisp pastel accents, toned paper showing through, powdery edge texture, luminous matte color",
    "Pixel art": "hand-authored pixel art, deliberate limited palette, crisp pixel clusters, readable silhouette, selective dithering, consistent sprite-scale detail, no anti-aliasing, no vector-smooth edges",
    "Retro / Vintage": "authentic mid-century analog photograph, era-appropriate muted palette, gently faded dyes, modest contrast, organic film grain, slight lens softness and halation, believable age without heavy fake damage",
    "Rézkarc / metszet": "traditional copperplate etching and engraving, dense precise cross-hatching, tapered burin lines, fine stippled transitions, ivory rag-paper texture, antique ink impression, disciplined tonal construction",
    "South Park": "flat paper-cutout television-cartoon aesthetic, simple geometric characters, bold black outlines, minimal flat shading, bright limited colors, deliberately crude layered-paper construction, simplified background shapes",
    "Stippling": "hand-drawn stippling illustration, form modeled entirely with varied dot density, crisp contour restraint, clean white paper, patient high-detail tonal transitions, no smeared shading",
    "Szénrajz": "expressive charcoal drawing, compressed black masses, broad vine-charcoal gestures, smudged atmospheric gradients, sharp compressed-charcoal accents, visible paper tooth, kneaded-eraser highlights",
    "Szürrealista": "surrealist fine-art composition, dreamlike but precisely rendered objects, impossible spatial relationships, symbolic visual logic, quiet uncanny atmosphere, coherent light across the impossible scene",
    "Tusrajz": "expressive black ink drawing, confident brush-and-pen linework, varied dry-brush texture, controlled ink washes, strong black-white balance, absorbent paper edges, economical marks",
    "Vektor grafika": "clean vector illustration, mathematically precise paths, intentional flat and gradient fills, consistent stroke system, scalable geometric construction, crisp negative space, no raster texture",
    "Vízfesték": "pure transparent watercolor painting, luminous layered washes, soft capillary edges, pigment granulation, preserved paper-white highlights, subtle backruns, natural cold-pressed paper texture"
  };

  const TERRAIN_LENS_GROUPS = {
    expansive: ["Halszemoptika", "Nagylátószögű", "Portré", "Prime", "Standard", "Szupertele", "Teleobjektív", "Tilt-shift", "Zoom"],
    natural: ["Makró", "Nagylátószögű", "Portré", "Prime", "Standard", "Szupertele", "Teleobjektív", "Zoom"],
    extreme: ["Nagylátószögű", "Portré", "Prime", "Standard", "Szupertele", "Teleobjektív", "Zoom"],
    confined: ["Makró", "Portré", "Prime", "Standard", "Teleobjektív", "Zoom"],
    dramatic: ["Halszemoptika", "Halszemoptika fekete kerettel", "Makró", "Nagylátószögű", "Portré", "Prime", "Standard", "Szupertele", "Teleobjektív", "Zoom"]
  };
  const TERRAIN_LENS_GROUP = {
    high_mountain: "extreme", desert: "dramatic", plain: "expansive", coast: "dramatic", river: "natural",
    glacier: "extreme", hills: "natural", mid_mountain: "natural", jungle: "confined", savanna: "natural",
    taiga: "natural", tundra: "extreme", steppe: "expansive", deciduous_forest: "confined", wetland: "natural",
    lake_shore: "natural", mediterranean: "natural", karst: "dramatic", volcanic: "dramatic", plateau: "expansive",
    mangrove: "confined", monsoon_forest: "confined", heath_moor: "natural", canyon: "dramatic", salt_lake: "expansive",
    badland: "dramatic", tropical_island: "dramatic", fjord: "extreme", rocky_coast: "dramatic",
    river_delta: "expansive", tidal_flat: "expansive", lagoon_atoll: "dramatic", oasis: "natural",
    sand_sea_erg: "expansive", rock_desert_hamada: "expansive", temperate_rainforest: "confined",
    cloud_forest: "confined", montane_conifer_forest: "natural", alpine_meadow: "extreme",
    geothermal_field: "dramatic", lava_field: "dramatic", polar_ice_sheet: "extreme", natural_cave: "confined"
  };
  const FILM_PREVIEW_PROFILES = {
    "CineStill 50D": { saturation: 1.04, contrast: 1.02, gamma: 1.01, channels: [1.04, 1.01, 0.97], offsets: [3, 1, -1], grain: 1.6, vignette: 0.11 },
    "Cinestill 800T": { saturation: 1.08, contrast: 1.16, gamma: 0.96, channels: [1.1, 0.98, 1.04], offsets: [6, -2, 5], grain: 7, vignette: 0.25 },
    "Fujifilm Acros 100 II": { monochrome: true, saturation: 0, contrast: 1.12, gamma: 1.01, channels: [1, 1, 1], offsets: [0, 0, 0], grain: 1.4, vignette: 0.12 },
    "Fuji Provia 100F": { saturation: 1.18, contrast: 1.12, gamma: 0.98, channels: [0.98, 1.03, 1.08], offsets: [-2, 1, 4], grain: 2, vignette: 0.12 },
    "Fuji Superia 400": { saturation: 1.16, contrast: 1.06, gamma: 1, channels: [0.98, 1.07, 1.03], offsets: [0, 2, 1], grain: 4.5, vignette: 0.16 },
    "Fuji Velvia 50": { saturation: 1.38, contrast: 1.18, gamma: 0.96, channels: [1.01, 1.08, 1.1], offsets: [0, 2, 3], grain: 1.4, vignette: 0.16 },
    "Ilford Delta 3200": { monochrome: true, saturation: 0, contrast: 1.28, gamma: 0.94, channels: [1, 1, 1], offsets: [0, 0, 0], grain: 11, vignette: 0.3 },
    "Ilford FP4 Plus 125": { monochrome: true, saturation: 0, contrast: 1.08, gamma: 1.03, channels: [1, 1, 1], offsets: [0, 0, 0], grain: 2.2, vignette: 0.13 },
    "Ilford HP5 Plus 400": { monochrome: true, saturation: 0, contrast: 1.16, gamma: 1.01, channels: [1, 1, 1], offsets: [0, 0, 0], grain: 6.5, vignette: 0.22 },
    "Kodak Ektar 100": { saturation: 1.3, contrast: 1.14, gamma: 0.97, channels: [1.08, 1.01, 0.96], offsets: [3, 0, -2], grain: 1.8, vignette: 0.14 },
    "Kodak Gold 200": { saturation: 1.13, contrast: 1.02, gamma: 1.03, channels: [1.09, 1.03, 0.91], offsets: [6, 2, -4], grain: 3.2, vignette: 0.16 },
    "Kodak Portra 400": { saturation: 0.98, contrast: 0.96, gamma: 1.04, channels: [1.06, 1.01, 0.94], offsets: [5, 2, -2], grain: 3, vignette: 0.12 },
    "Kodak Portra 800": { saturation: 1.01, contrast: 0.99, gamma: 1.03, channels: [1.08, 1, 0.92], offsets: [7, 1, -3], grain: 5, vignette: 0.18 },
    "Kodak T-Max 100": { monochrome: true, saturation: 0, contrast: 1.18, gamma: 0.99, channels: [1, 1, 1], offsets: [0, 0, 0], grain: 1.2, vignette: 0.1 },
    "Kodak Tri-X 400": { monochrome: true, saturation: 0, contrast: 1.3, gamma: 0.95, channels: [1, 1, 1], offsets: [0, 0, 0], grain: 7.5, vignette: 0.25 },
    "Lomography Color Negative 800": { saturation: 1.2, contrast: 1.09, gamma: 0.99, channels: [1.1, 0.99, 1.04], offsets: [7, -1, 4], grain: 7, vignette: 0.24 }
  };
  const STYLE_PREVIEW_PROFILES = {
    "Akvarell+vonal": { saturation: 1.08, contrast: 0.88, gamma: 1.08, posterize: 34, edgeStrength: 0.52, grain: 1.2, vignette: 0.02 },
    "Barokk festmény": { saturation: 0.92, contrast: 1.34, gamma: 0.9, channels: [1.16, 1.02, 0.78], offsets: [8, 0, -12], grain: 2.2, vignette: 0.32 },
    "Ceruza": { monochrome: true, contrast: 1.05, gamma: 1.06, edgeMode: "light", edgeStrength: 4.2, grain: 2.8, vignette: 0.03 },
    "Cinematic": { saturation: 0.96, contrast: 1.16, gamma: 0.96, channels: [1.06, 1.0, 1.08], offsets: [2, -2, 3], grain: 2.4, vignette: 0.2 },
    "Concept Art": { saturation: 1.02, contrast: 1.12, gamma: 0.98, posterize: 28, edgeStrength: 0.35, grain: 1.4, vignette: 0.12 },
    "Cyberpunk": { saturation: 1.48, contrast: 1.3, gamma: 0.9, channels: [1.14, 0.9, 1.3], offsets: [8, -8, 14], grain: 3.2, vignette: 0.3 },
    "Digitális festmény": { saturation: 1.05, contrast: 1.06, gamma: 1.02, posterize: 48, edgeStrength: 0.18, grain: 0.8, vignette: 0.08 },
    "Fantasy Art": { saturation: 1.24, contrast: 1.2, gamma: 0.94, channels: [1.12, 1.03, 1.1], offsets: [5, 0, 5], grain: 1.8, vignette: 0.23 },
    "Fotó-realisztikus B/W": { monochrome: true, contrast: 1.22, gamma: 0.97, grain: 3.8, vignette: 0.2 },
    "Futurista": { saturation: 0.92, contrast: 1.2, gamma: 0.96, channels: [0.96, 1.08, 1.18], offsets: [-2, 4, 8], posterize: 54, grain: 0.6, vignette: 0.12 },
    "Gouache": { saturation: 1.1, contrast: 1.06, gamma: 1.02, posterize: 20, edgeStrength: 0.22, grain: 1.8, vignette: 0.04 },
    "GTA V": { saturation: 1.28, contrast: 1.25, gamma: 0.94, posterize: 30, edgeStrength: 0.42, grain: 1.2, vignette: 0.18 },
    "Impresszionizmus": { saturation: 1.2, contrast: 0.96, gamma: 1.08, posterize: 26, grain: 2.4, vignette: 0.05 },
    "Leonardo Davinci": { saturation: 0.28, contrast: 1.08, gamma: 1.02, channels: [1.14, 1.02, 0.78], offsets: [10, 4, -8], edgeStrength: 0.28, grain: 3.2, vignette: 0.2 },
    "Linómetszet": { monochrome: true, contrast: 1.5, gamma: 0.9, posterize: 3, edgeMode: "light", edgeStrength: 5.2, grain: 1.2, vignette: 0.06 },
    "Low-poly 3D": { saturation: 1.08, contrast: 1.12, gamma: 1.0, posterize: 11, edgeStrength: 0.18, grain: 0, vignette: 0.1 },
    "Marker": { saturation: 1.2, contrast: 1.08, gamma: 1.04, posterize: 24, edgeStrength: 0.38, grain: 1.2, vignette: 0.03 },
    "Minimalista": { saturation: 1.05, contrast: 1.18, gamma: 1.02, posterize: 6, edgeStrength: 0.2, grain: 0, vignette: 0 },
    "Noir": { monochrome: true, contrast: 1.48, gamma: 0.86, grain: 4.8, vignette: 0.34 },
    "Olajfesték": { saturation: 1.12, contrast: 1.12, gamma: 0.98, posterize: 34, edgeStrength: 0.16, grain: 3.2, vignette: 0.14 },
    "Pasztell": { saturation: 0.82, contrast: 0.8, gamma: 1.16, channels: [1.06, 1.02, 1.08], offsets: [10, 8, 12], posterize: 30, grain: 2.2, vignette: 0.02 },
    "Pixel art": { saturation: 1.2, contrast: 1.22, gamma: 0.96, posterize: 12, pixelSize: 9, grain: 0, vignette: 0 },
    "Retro / Vintage": { saturation: 0.78, contrast: 0.92, gamma: 1.08, channels: [1.12, 1.03, 0.86], offsets: [8, 4, -5], grain: 4.5, vignette: 0.22 },
    "Rézkarc / metszet": { monochrome: true, contrast: 1.2, gamma: 1.02, channels: [1.12, 1.02, 0.82], offsets: [10, 5, -5], edgeMode: "light", edgeStrength: 4.8, grain: 2.2, vignette: 0.1 },
    "South Park": { saturation: 1.32, contrast: 1.18, gamma: 1, posterize: 7, edgeStrength: 0.58, grain: 0, vignette: 0 },
    "Stippling": { monochrome: true, contrast: 1.18, gamma: 1.04, edgeStrength: 0.46, grain: 8.5, vignette: 0.04 },
    "Szénrajz": { monochrome: true, contrast: 1.38, gamma: 0.92, edgeStrength: 0.72, grain: 7, vignette: 0.18 },
    "Szürrealista": { saturation: 1.42, contrast: 1.16, gamma: 0.94, channels: [1.18, 0.94, 1.2], offsets: [8, -4, 8], grain: 1.6, vignette: 0.22 },
    "Tusrajz": { monochrome: true, contrast: 1.44, gamma: 0.92, posterize: 5, edgeMode: "light", edgeStrength: 5.4, grain: 0.8, vignette: 0.04 },
    "Vektor grafika": { saturation: 1.2, contrast: 1.14, gamma: 1.0, posterize: 8, edgeStrength: 0.42, grain: 0, vignette: 0 },
    "Vízfesték": { saturation: 0.98, contrast: 0.82, gamma: 1.13, posterize: 38, grain: 1.6, vignette: 0.02 }
  };
  let filmPreviewImage = null;
  let loadedFilmPreviewSource = "";
  let renderedFilmPreviewKey = "";

  const FILM_ISO_VALUES = {
    "CineStill 50D": 50,
    "Cinestill 800T": 800,
    "Fuji Provia 100F": 100,
    "Fuji Superia 400": 400,
    "Fuji Velvia 50": 50,
    "Fujifilm Acros 100 II": 100,
    "Ilford Delta 3200": 3200,
    "Ilford FP4 Plus 125": 125,
    "Ilford HP5 Plus 400": 400,
    "Kodak Ektar 100": 100,
    "Kodak Gold 200": 200,
    "Kodak Portra 400": 400,
    "Kodak Portra 800": 800,
    "Kodak T-Max 100": 100,
    "Kodak Tri-X 400": 400,
    "Lomography Color Negative 800": 800
  };
  const APERTURES = [1.4, 1.8, 2, 2.8, 3.5, 4, 5.6, 8, 11, 16, 22];
  const SHUTTER_SPEEDS = [30, 15, 8, 4, 2, 1, 1 / 2, 1 / 4, 1 / 8, 1 / 15, 1 / 30, 1 / 60, 1 / 125, 1 / 250, 1 / 500, 1 / 1000, 1 / 2000, 1 / 4000];
  const WEATHER_ORDER = ["sun", "partly", "cloud", "rain", "storm", "snow", "snow_shower", "fog", "mist", "rime", "sandstorm", "aurora", "rainbow", "hail", "sleet", "mirage", "tornado", "dust_devil", "waterspout", "blowing_snow"];
  const BASIC_WEATHER_KEYS = new Set(["sun", "partly", "cloud", "rain", "storm", "snow"]);
  const PHOTO_STYLE_DEFAULTS = ["Cinematic", "Fotó-realisztikus B/W", "Noir", "Retro / Vintage"];
  const ENVIRONMENT_ELEMENT_MIN = 0;
  const ENVIRONMENT_ELEMENT_MAX = 4;

  const FALLBACK_SEASONS = [
    { season_key: "spring", label: "Tavasz", sunrise: 6, sunset: 18.5, max_sun_elevation: 45, max_ev: 15, prompt: "spring season" },
    { season_key: "summer", label: "Nyár", sunrise: 4.75, sunset: 20.5, max_sun_elevation: 65, max_ev: 15.5, prompt: "summer season" },
    { season_key: "autumn", label: "Ősz", sunrise: 6.5, sunset: 17.5, max_sun_elevation: 34, max_ev: 14.5, prompt: "autumn season" },
    { season_key: "winter", label: "Tél", sunrise: 7.5, sunset: 16, max_sun_elevation: 18, max_ev: 15, prompt: "winter season" }
  ];

  const FALLBACK_WEATHER = [
    { weather_key: "sun", label: "Derült", ev_modifier: 0, prompt: "clear weather" },
    { weather_key: "partly", label: "Részben felhős", ev_modifier: -1, prompt: "partly cloudy weather" },
    { weather_key: "cloud", label: "Borult", ev_modifier: -3.5, prompt: "overcast weather with diffuse light" },
    { weather_key: "rain", label: "Eső", ev_modifier: -5, prompt: "rainy weather" },
    { weather_key: "storm", label: "Zivatar", ev_modifier: -6, prompt: "stormy weather under a dark sky" },
    { weather_key: "snow", label: "Havazás", ev_modifier: -2, prompt: "snowfall with reflected ambient light" }
  ];

  const PHASES = {
    early: { label: "Eleje", prompt: "early-season phase", temp: { spring: -3, summer: -2, autumn: 2, winter: 1 } },
    mid: { label: "Közepe", prompt: "mid-season phase", temp: { spring: 0, summer: 2, autumn: 0, winter: -2 } },
    late: { label: "Vége", prompt: "late-season phase", temp: { spring: 3, summer: -1, autumn: -3, winter: 2 } }
  };

  const WEATHER_IMAGE_FOLDER = "assets/idojaras";
  const SEASON_VISUALS = {
    spring: { image: "evszak_tavasz.png", subtitle: "Újjáéledő természet", months: [[3, "Március"], [4, "Április"], [5, "Május"]] },
    summer: { image: "evszak_nyar.png", subtitle: "Hosszú, világos napok", months: [[6, "Június"], [7, "Július"], [8, "Augusztus"]] },
    autumn: { image: "evszak_osz.png", subtitle: "Meleg lombszínek", months: [[9, "Szeptember"], [10, "Október"], [11, "November"]] },
    winter: { image: "evszak_tel.png", subtitle: "Rövid, hideg napok", months: [[12, "December"], [1, "Január"], [2, "Február"]] }
  };
  const WEATHER_VISUALS = {
    sun: { image: "idojaras_derult.png", subtitle: "Tiszta ég, határozott fény" },
    partly: { image: "idojaras_reszben_felhos.png", subtitle: "Napfény és vonuló felhők" },
    cloud: { image: "idojaras_borult.png", subtitle: "Szórt, árnyékmentes fény" },
    rain: { image: "idojaras_eso.png", subtitle: "Nedves levegő és felületek" },
    storm: { image: "idojaras_zivatar.png", subtitle: "Sötét ég, drámai fény" },
    snow: { image: "idojaras_havazas.png", subtitle: "Hideg, visszavert derítés" }
  };
  Object.assign(WEATHER_VISUALS, {
    snow_shower: { image: "idojaras_hozapor.png", subtitle: "Rövid, intenzív hóesés" },
    fog: { image: "idojaras_kod.png", subtitle: "Sűrű, alacsony látótávolság" },
    mist: { image: "idojaras_para.png", subtitle: "Finom, lebegő nedvesség" },
    rime: { image: "idojaras_zuzmara.png", subtitle: "Fagyott pára a felületeken" },
    sandstorm: { image: "idojaras_homokvihar.png", subtitle: "Erős szél és sodródó homok" },
    tornado: { image: "idojaras_tornado.png", subtitle: "Forgó zivatar és tölcsérfelhő" },
    dust_devil: { image: "idojaras_porordog.png", subtitle: "Helyi porörvény száraz felszínen" },
    waterspout: { image: "idojaras_viztolcser.png", subtitle: "Légörvény nyílt vízfelszín felett" },
    blowing_snow: { image: "idojaras_hofujas.png", subtitle: "Erős szél és sodródó hó" },
    aurora: { image: "idojaras_sarki_feny.png", subtitle: "Tiszta északi éjszaka" },
    rainbow: { image: "idojaras_szivarvany.png", subtitle: "Napfény csapadék után" },
    hail: { image: "idojaras_jegeso.png", subtitle: "Heves zápor jégszemekkel" },
    sleet: { image: "idojaras_havas_eso.png", subtitle: "Eső és hó vegyesen" },
    mirage: { image: "idojaras_delibab.png", subtitle: "Forró levegő hőremegése" }
  });
  const LIGHT_DIRECTION_VISUALS = {
    front: "feny_szembol.png",
    front_left: "feny_jobb_45.png",
    front_right: "feny_jobb_45.png",
    side: "feny_oldal.png",
    back: "feny_hatulrol.png",
    top: "feny_felulrol.png"
  };

  const WIND_LEVELS = [
    { key: "calm", label: "Szélcsend", prompt: "still air, hair and clothing resting naturally, motionless foliage and calm water surface" },
    { key: "breeze", label: "Enyhe szellő", prompt: "gentle breeze, slight natural movement in loose hair and light fabric, subtly stirring leaves and grass" },
    { key: "moderate", label: "Mérsékelt szél", prompt: "moderate wind, clearly visible but controlled movement in hair, clothing, grass and foliage, lightly rippled water" },
    { key: "strong", label: "Erős szél", prompt: "strong wind, pronounced directional movement in hair and clothing, bending grasses and moving tree branches, wind-ruffled water" },
    { key: "gale", label: "Viharos szél", prompt: "gale-force wind, forceful directional hair and fabric movement, strongly bending vegetation, airborne leaves or spray, realistic braced posture" },
    { key: "hurricane", label: "Orkánerejű szél", prompt: "extreme hurricane-force wind, violent directional motion in clothing and hair, severely bent vegetation, airborne spray and debris, physically realistic struggle against the wind" }
  ];
  const WIND_DIRECTIONS = [
    { key: "left_to_right", label: "Balról jobbra", arrow: "→", prompt: "a single coherent wind field blowing from frame-left toward frame-right; hair, scarves, loose clothing, airborne particles and vegetation all stream consistently toward frame-right; no contradictory movement" },
    { key: "right_to_left", label: "Jobbról balra", arrow: "←", prompt: "a single coherent wind field blowing from frame-right toward frame-left; hair, scarves, loose clothing, airborne particles and vegetation all stream consistently toward frame-left; no contradictory movement" },
    { key: "front_left_to_back_right", label: "Bal előtérből jobb háttérbe", arrow: "↗", prompt: "a single coherent wind field blowing from the camera-left foreground toward the frame-right background; hair, scarves, loose clothing, airborne particles and vegetation all follow the same diagonal flow toward the frame-right background; no contradictory movement" },
    { key: "front_right_to_back_left", label: "Jobb előtérből bal háttérbe", arrow: "↖", prompt: "a single coherent wind field blowing from the camera-right foreground toward the frame-left background; hair, scarves, loose clothing, airborne particles and vegetation all follow the same diagonal flow toward the frame-left background; no contradictory movement" },
    { key: "back_left_to_front_right", label: "Bal háttérből jobb előtérbe", arrow: "↘", prompt: "a single coherent wind field blowing from the frame-left background toward the camera-right foreground; hair, scarves, loose clothing, airborne particles and vegetation all follow the same diagonal flow toward the camera-right foreground; no contradictory movement" },
    { key: "back_right_to_front_left", label: "Jobb háttérből bal előtérbe", arrow: "↙", prompt: "a single coherent wind field blowing from the frame-right background toward the camera-left foreground; hair, scarves, loose clothing, airborne particles and vegetation all follow the same diagonal flow toward the camera-left foreground; no contradictory movement" },
    { key: "background_to_camera", label: "Háttérből a kamera felé", arrow: "↓", prompt: "a single coherent wind field blowing from the background toward the camera; hair, scarves, loose clothing, airborne particles and vegetation all respond consistently toward the lens; no contradictory movement" },
    { key: "camera_to_background", label: "Kamerától a háttér felé", arrow: "↑", prompt: "a single coherent wind field blowing from the camera position toward the background; hair, scarves, loose clothing, airborne particles and vegetation all recede consistently away from the lens; no contradictory movement" }
  ];
  const WIND_VISUAL_FOLDER = "assets/szel";
  const CROWD_LEVELS = [
    { key: "contextual", label: "Nincsenek emberek", labelEn: "No people" },
    { key: "alone", label: "Egy személy", labelEn: "One person" },
    { key: "small_group", label: "Kis csoport", labelEn: "Small group" },
    { key: "community", label: "Közösség", labelEn: "Community" },
    { key: "crowd", label: "Tömeg", labelEn: "Crowd" }
  ];
  const LOCATION_POPULATION_PROMPTS = {
    christian_church: "local population appropriate to the exact denomination, architectural region and geographic setting of the church; do not assume a single ethnicity or default every church to Western Europe",
    mosque_exterior: "local population appropriate to the mosque's specific Islamic architectural region, which may be Middle Eastern, North African, Sub-Saharan African, Central Asian, South Asian, Southeast Asian or European; do not treat Muslim identity as a single ethnicity",
    synagogue_exterior: "the local Jewish community and surrounding regional population represented with historically and geographically credible diversity, respectful contemporary clothing and no costume stereotypes",
    eastern_temple: "local population matched to the temple's one specific Buddhist or Hindu tradition and geographic region; keep South Asian, East Asian, Southeast Asian and Himalayan identities architecturally coherent rather than mixing them generically",
    egyptian_pyramids: "contemporary Egyptian people and the wider locally plausible North African and Middle Eastern population form the primary local presence, with archaeologists, guides and international visitors only where natural",
    greco_roman_ruins: "contemporary local Mediterranean population matched to the exact country of the archaeological site, with historically plausible guides, researchers and visitors where natural",
    great_wall_china: "contemporary Chinese local population forms the primary human presence, with regionally plausible domestic and international visitors shown only where natural",
    machu_picchu: "contemporary Peruvian Andean population forms the primary local presence, including locally plausible Indigenous Quechua people represented naturally and respectfully, with guides and visitors where appropriate",
    colosseum_rome: "contemporary Roman and wider Italian local population forms the primary everyday presence, with the natural international diversity of visitors to central Rome",
    notre_dame_paris: "contemporary Parisian and wider French population forms the primary everyday presence, reflecting the real diversity of Paris, with visitors where natural",
    eiffel_tower: "contemporary Parisian and wider French population forms the primary everyday presence, reflecting the real diversity of Paris, with international visitors where natural"
  };

  const AI_PORTRAIT_ARCHETYPES = [
    {
      subject: "an elegant sentient android with a feminine human-inspired face",
      design: "precision white ceramic facial plates, exposed chrome neck mechanics, delicate blue status lights, refined synthetic anatomy",
      mood: "calm self-aware intelligence and subtle emotional presence"
    },
    {
      subject: "a sophisticated biomechanical cybernetic portrait",
      design: "human facial structure interwoven with micro-cables, brushed titanium cranial components, translucent neural conduits and restrained amber energy nodes",
      mood: "focused consciousness emerging from complex machinery"
    },
    {
      subject: "a futuristic humanoid droid with an expressive synthetic face",
      design: "streamlined silver and pearl armor, articulated neck assembly, seamless facial shell, luminous cyan irises and immaculate industrial design",
      mood: "quiet confidence, curiosity and advanced artificial awareness"
    },
    {
      subject: "an ornate cyber-fantasy machine muse",
      design: "filigree-like mechanical headpiece, polished cobalt metal, fine copper wiring, gemstone-like optical sensors and symmetrical engineered ornament",
      mood: "regal, enigmatic and technologically sublime"
    },
    {
      subject: "an ancient forest intelligence embodied as a humanlike fantasy portrait",
      design: "bark and moss integrated into lifelike skin, fine root filaments, leaf-vein patterns, small golden bioluminescent details and organic crown forms",
      mood: "watchful primordial wisdom and restrained supernatural power"
    },
    {
      subject: "a richly decorated techno-fantasy portrait",
      design: "turquoise and copper ornamental facial inlays, botanical geometry, sculpted metallic filigree, jewel accents and seamless integration with natural skin",
      mood: "poised, ceremonial and intensely individual"
    },
    {
      subject: "a crystalline synthetic avatar",
      design: "faceted porcelain and pale blue geometric surfaces forming the face, angular crystalline hair structure, precise polygonal transitions and subtle floating fragments",
      mood: "serene abstract intelligence with a clear human emotional core"
    },
    {
      subject: "an elemental autumn spirit with a lifelike human face",
      design: "layered red, amber and deep teal leaves merging into hair and skin, delicate leaf-vein mosaics, glowing turquoise eyes and tactile organic microtexture",
      mood: "vivid seasonal energy, mystery and natural elegance"
    },
    {
      subject: "a rugged masculine industrial android portrait",
      design: "dark titanium cranial armor, exposed precision actuators, weathered metal edges, amber optical sensors and robust mechanical neck anatomy",
      mood: "disciplined strength, experience and restrained synthetic emotion"
    },
    {
      subject: "an androgynous translucent neural entity",
      design: "smoky glass facial layers, visible luminous neural filaments, liquid-metal structural seams and subtle prismatic internal reflections",
      mood: "quiet analytical awareness and otherworldly serenity"
    },
    {
      subject: "an obsidian and gold cosmic machine oracle",
      design: "black ceramic facial planes, fine gold circuitry, celestial geometric engravings, deep violet optical glow and a halo-like mechanical crown",
      mood: "ancient intelligence, ceremonial gravity and cosmic mystery"
    },
    {
      subject: "a bio-synthetic aquatic guardian portrait",
      design: "pearl-like armor, translucent membrane details, coral-inspired mechanical structures, turquoise bioluminescence and flowing hydrodynamic forms",
      mood: "protective calm, fluid movement and luminous alien beauty"
    }
  ];

  const AI_PORTRAIT_FRAMINGS = [
    "tight head-and-shoulders portrait, the face is the unequivocal focal point",
    "close portrait from upper chest upward, centered facial hierarchy",
    "three-quarter facial angle with both eyes clearly readable and controlled negative space",
    "symmetrical frontal portrait with precise visual balance"
  ];

  const AI_PORTRAIT_LIGHTING = [
    "cinematic teal and warm amber rim lighting with soft frontal fill",
    "clean cool studio lighting with restrained cyan edge accents",
    "low-key futuristic lighting with luminous mechanical details and controlled shadows",
    "soft diffused portrait light with selective metallic highlights",
    "dramatic gallery lighting with warm highlights and deep blue-green shadow separation"
  ];

  const AI_PORTRAIT_BACKGROUNDS = [
    "minimal dark graphite studio background with subtle atmospheric depth",
    "soft futuristic bokeh background in teal, cobalt and warm amber",
    "clean pale architectural background with shallow depth separation",
    "deep cinematic environment reduced to abstract colored light",
    "dark organic background with restrained foliage and shadow texture"
  ];

  const AI_PORTRAIT_RENDERING = [
    "high-end photorealistic concept portrait, realistic material response, extremely fine mechanical and organic microdetail",
    "premium cinematic character-design photograph, lifelike optical rendering and physically plausible materials",
    "editorial science-fiction portrait, polished yet tactile surfaces, natural tonal transitions and controlled color grade",
    "museum-quality fantasy character portrait, intricate handcrafted detail and convincing dimensional depth"
  ];

  const AI_HYBRID_INTEGRATIONS = [
    "preserve the recognizable human facial proportions and expression while integrating synthetic components around the temples, cheekbones, jaw and neck",
    "an asymmetric transformation with one side predominantly human and the other revealing elegant internal machinery, joined by anatomically believable transitions",
    "subtle cybernetic augmentation beneath mostly natural facial features, fine luminous circuits, precision inlays and a mechanically articulated neck",
    "organic fantasy material gradually merging with the human skin and hair, preserving readable eyes, lips and individual facial structure",
    "a balanced human-machine fusion with approximately half natural anatomy and half engineered surface, no mask-like separation"
  ];
  const MODEL_THIRDS = [
    { key: "left", label: "Bal harmad", prompt: "selected model positioned on the left vertical third of the frame, natural visual balance and intentional negative space toward the right" },
    { key: "center", label: "Középső harmad", prompt: "selected model positioned in the central vertical third of the frame, balanced surrounding context and clear subject hierarchy" },
    { key: "right", label: "Jobb harmad", prompt: "selected model positioned on the right vertical third of the frame, natural visual balance and intentional negative space toward the left" }
  ];

  const TERRAIN_IMAGE_FOLDER = "assets/tajtipusok";
  const terrainImagePath = (terrainId) => `${TERRAIN_IMAGE_FOLDER}/tajtipus_${terrainId}.png`;

  const TERRAIN_PRESETS = [
    {
      id: "high_mountain",
      label: "Magashegység",
      short: "MH",
      prompt: "high mountain alpine environment, steep terrain, clear thin air",
      phenology: "alpesi",
      temp: -8,
      light: 0.2,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow"],
      outfit: "windproof mountain outer layer, insulated technical layers when cold, sturdy mountain boots",
      elements: [
        ["ridge", "Sziklás gerinc", "jagged rocky alpine ridge behind the subject"],
        ["scree", "Kőgörgeteg", "scree slope and weathered stone foreground"],
        ["meadow", "Alpesi rét", "small alpine meadow patches close to the camera"],
        ["snowline", "Hófoltok", "seasonally plausible snow patches above the vegetation line"],
        ["dwarf_pine", "Törpefenyő", "wind-shaped dwarf pine near the alpine vegetation line"],
        ["alpine_lake", "Tengerszem", "cold clear alpine tarn or small mountain lake"],
        ["moraine_boulders", "Morénakövek", "glacial boulders and old moraine texture"],
        ["cloud_shadow", "Felhőárnyék", "fast moving cloud shadows over exposed mountain slopes"]
      ]
    },
    {
      id: "desert",
      label: "Sivatag",
      short: "SV",
      prompt: "desert environment with arid air, sparse vegetation, open horizon",
      phenology: "sivatagi",
      temp: 9,
      light: 0.5,
      allowedWeather: ["sun", "partly", "cloud", "storm"],
      outfit: "sun-protective lightweight clothing, breathable fabric, head and neck shade where composition allows",
      elements: [
        ["dune", "Dűne", "wind-shaped sand dune forms"],
        ["wadi", "Száraz meder", "dry wadi bed and cracked sediment"],
        ["scrub", "Száraz cserjék", "sparse xerophyte shrubs without lush greenery"],
        ["stone", "Kőplató", "sun-baked stone plateau and gravel"],
        ["salt_pan", "Sókéreg", "white salt crust on dry desert flats"],
        ["yardang", "Szélvájta formák", "wind-eroded desert ridges and sculpted mineral surface"],
        ["oasis_edge", "Oázisszegély", "small oasis edge kept distant and not lush"],
        ["heat_haze", "Hőremegés", "visible heat shimmer above pale sand and stone"]
      ]
    },
    {
      id: "plain",
      label: "Alföld",
      short: "AF",
      prompt: "flat lowland plain, wide open horizon, broad sky",
      phenology: "füves síksági",
      temp: 1,
      light: 0.15,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow"],
      outfit: "practical everyday outdoor clothing adapted to wind and open-field weather",
      elements: [
        ["grass", "Füves tér", "open grassland foreground"],
        ["track", "Földút", "simple dirt track cutting through the plain"],
        ["tree_line", "Fasor", "distant shelterbelt or lone tree line"],
        ["field_edge", "Mezőszegély", "seasonal crop or meadow edge without visual clutter"],
        ["wheat_field", "Búzamező", "broad seasonal wheat field with natural golden grain"],
        ["sunflower_field", "Napraforgótábla", "seasonal sunflower field across the flat lowland"],
        ["hay_bales", "Bálák", "distant hay bales or straw rolls on open flat land"],
        ["ditch", "Vízelvezető árok", "shallow drainage ditch with low grass"],
        ["dust", "Poros levegő", "subtle dust lifted by wind over the plain"],
        ["low_clouds", "Alacsony felhők", "broad low cloud bank emphasizing the flat horizon"]
      ]
    },
    {
      id: "coast",
      label: "Tengerpart",
      short: "TE",
      prompt: "coastal seashore environment, salt air, open water horizon",
      phenology: "parti",
      temp: -1,
      light: 0.35,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm"],
      outfit: "coastal wind-ready clothing, layered top or breathable summer fabric depending on temperature",
      elements: [
        ["sand", "Nedves homok", "wet sand with subtle reflections near the subject"],
        ["dune_grass", "Dűnefű", "seasonal dune grass and low coastal plants"],
        ["rocks", "Parti kövek", "dark coastal rocks or pebbles"],
        ["waterline", "Vízvonal", "sea waterline visible in the background"],
        ["tidal_pool", "Árapálymedence", "small tidal pool reflecting coastal light"],
        ["seaweed", "Hínárnyomok", "washed seaweed traces and organic shore texture"],
        ["cliff", "Partfal", "coastal cliff or eroded shore wall"],
        ["spray", "Sós permet", "fine salt spray in the air without heavy fog"]
      ]
    },
    {
      id: "river",
      label: "Folyópart",
      short: "FP",
      prompt: "riverbank environment with riparian vegetation and wet ground",
      phenology: "folyóparti",
      temp: -1,
      light: -0.2,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow"],
      outfit: "water-edge practical clothing, closed shoes, rain layer when weather requires it",
      elements: [
        ["reed", "Nádas", "reed beds and riverbank grass close to the frame"],
        ["willow", "Fűzliget", "willow gallery vegetation along the bank"],
        ["pebbles", "Nedves kavics", "wet pebbles or muddy shore texture"],
        ["water", "Folyótükör", "calm or wind-ruffled river surface"],
        ["sandbar", "Homokpad", "low river sandbar or exposed silt ridge"],
        ["roots", "Parti gyökerek", "exposed roots gripping the damp riverbank"],
        ["driftwood", "Uszadékfa", "natural driftwood caught near the water edge"],
        ["backwater", "Holtág-sáv", "quiet backwater strip with darker reflections"]
      ]
    },
    {
      id: "glacier",
      label: "Gleccser",
      short: "GL",
      prompt: "glacier environment, blue ice, moraine gravel, cold reflected light",
      phenology: "gleccser",
      temp: -11,
      light: 0.55,
      allowedWeather: ["sun", "partly", "cloud", "snow", "storm"],
      outfit: "cold-weather technical layers, insulated jacket, gloves, boots, no exposed summer clothing",
      elements: [
        ["ice", "Jégfal", "safe distant blue glacier ice face"],
        ["moraine", "Moréna", "dark moraine gravel and angular stones"],
        ["meltwater", "Olvadékvíz", "small meltwater channel in the foreground"],
        ["snow", "Hómező", "seasonally plausible snow field around the ice"],
        ["crevasse", "Jéghasadék", "distant safe blue crevasse lines in the glacier"],
        ["polished_rock", "Csiszolt szikla", "glacially polished stone with cold sheen"],
        ["ice_cave_edge", "Jégbarlang pereme", "distant ice cave edge with blue reflected light"],
        ["cold_mist", "Hideg pára", "low cold mist above meltwater and ice"]
      ]
    },
    {
      id: "hills",
      label: "Dombság",
      short: "DB",
      prompt: "rolling hill country, soft slopes, rural vegetation",
      phenology: "dombsági",
      temp: 0,
      light: 0,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow"],
      outfit: "layered countryside outdoor clothing adapted to the current temperature",
      elements: [
        ["meadow", "Domboldali rét", "rolling meadow slope close to the camera"],
        ["orchard", "Gyümölcsös", "seasonal orchard rows on a gentle hill"],
        ["hedge", "Sövény", "hedgerow and field-edge vegetation"],
        ["path", "Földösvény", "narrow dirt path following the slope"],
        ["vineyard", "Szőlősor", "vineyard rows following the hillside contour"],
        ["terrace", "Teraszos lejtő", "old agricultural terraces on a gentle slope"],
        ["small_grove", "Kis facsoport", "small grove on the hill crest"],
        ["valley_fog", "Völgyi pára", "soft mist settled in the lower valley behind the subject"]
      ]
    },
    {
      id: "mid_mountain",
      label: "Középhegység",
      short: "KH",
      prompt: "temperate mid-mountain landscape, mixed forest, rocky outcrops",
      phenology: "középhegységi erdei",
      temp: -3,
      light: -0.4,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow"],
      outfit: "hiking-ready layered clothing, closed footwear, weatherproof layer when needed",
      elements: [
        ["forest", "Vegyes erdő", "mixed deciduous and coniferous forest edge"],
        ["rock", "Sziklakibúvás", "limestone or volcanic rocky outcrop"],
        ["trail", "Erdei ösvény", "narrow forest trail with natural ground texture"],
        ["clearing", "Gerinctisztás", "small ridge clearing with filtered light"],
        ["mossy_stone", "Mohás kövek", "moss-covered stones in a damp mid-mountain forest"],
        ["spring", "Forrás", "small mountain spring or seep line"],
        ["ravine", "Kis szurdok", "narrow wooded ravine with darker filtered light"],
        ["beech_trunks", "Bükktörzsek", "tall smooth beech trunks in layered forest depth"]
      ]
    },
    {
      id: "jungle",
      label: "Őserdő",
      short: "ŐE",
      prompt: "dense tropical rainforest, humid air, layered evergreen vegetation",
      phenology: "trópusi örökzöld",
      temp: 6,
      light: -1.3,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm"],
      outfit: "light breathable humid-weather clothing, rain-ready fabric, no heavy winter layers",
      elements: [
        ["canopy", "Zárt lombkorona", "dense canopy filtering most direct light"],
        ["wet_leaves", "Nedves levelek", "large glossy wet leaves near the subject"],
        ["roots", "Gyökérzet", "buttress roots and dark humid soil"],
        ["mist", "Párás háttér", "humid background haze between vegetation layers"],
        ["lianas", "Liánok", "hanging lianas and tangled vertical plant structure"],
        ["fern_layer", "Páfrányréteg", "dense fern and undergrowth layer"],
        ["stream", "Esőerdei patak", "small dark rainforest stream"],
        ["epiphytes", "Epifiták", "epiphytes and mosses on wet trunks"]
      ]
    },
    {
      id: "savanna",
      label: "Szavanna",
      short: "SZ",
      prompt: "savanna landscape, open grassland, reddish soil, scattered drought-tolerant trees",
      phenology: "szavannai",
      temp: 6,
      light: 0.35,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm"],
      outfit: "light sun-ready outdoor clothing, breathable fabric, practical shoes for dry grass and red soil",
      elements: [
        ["grass", "Szavannafű", "seasonal tall savanna grass"],
        ["red_soil", "Vörös talaj", "red soil and dusty ground texture"],
        ["tree", "Elszórt fák", "scattered flat-crowned drought-tolerant trees"],
        ["dry_creek", "Száraz vízmosás", "dry creek line or shallow erosion channel"],
        ["termite_mound", "Termeszvár", "distant termite mound as a small landscape detail"],
        ["thorn_scrub", "Tüskés bozót", "low thorn scrub adapted to dry heat"],
        ["burnt_grass", "Perzselt fű", "patches of dry or recently burnt grass"],
        ["storm_building", "Távoli viharfelhő", "distant convective storm cloud over open grassland"]
      ]
    },
    {
      id: "taiga",
      label: "Tajga",
      short: "TG",
      prompt: "boreal conifer forest, mossy ground, peat bogs, cool clear air",
      phenology: "tajgai tűlevelű",
      temp: -6,
      light: -0.6,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow"],
      outfit: "cool-weather forest clothing, insulating layers, water-resistant boots",
      elements: [
        ["spruce_forest", "Fenyves", "dense boreal spruce and pine forest edge"],
        ["moss_floor", "Mohás talaj", "thick mossy ground with needles and low plants"],
        ["peat_bog", "Tőzegláp", "dark peat bog pools and saturated moss"],
        ["fallen_logs", "Kidőlt fatörzsek", "fallen conifer logs with wet bark texture"],
        ["lichen_rocks", "Zuzmós kövek", "lichen-covered stones in cool forest light"],
        ["blackwater", "Sötét vízfolyás", "slow dark forest stream or bog channel"],
        ["sparse_birch", "Ritka nyírfa", "pale birch trunks mixed into conifers"],
        ["cold_haze", "Hideg pára", "thin cold haze between dark tree layers"]
      ]
    },
    {
      id: "tundra",
      label: "Tundra",
      short: "TU",
      prompt: "treeless subpolar plain, dwarf shrubs, lichen cover, permafrost ground",
      phenology: "tundrai",
      temp: -10,
      light: 0.25,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow"],
      outfit: "cold windproof clothing, insulated layers, boots suited to wet frozen ground",
      elements: [
        ["dwarf_shrubs", "Törpecserjék", "low dwarf shrubs hugging the ground"],
        ["lichen", "Zuzmómező", "pale lichen cover across stony tundra"],
        ["permafrost", "Fagyott talaj", "polygonal permafrost ground pattern"],
        ["melt_pools", "Olvadéktavak", "small seasonal meltwater pools"],
        ["rock_field", "Kőtenger", "flat scattered stones over open treeless land"],
        ["wind_grass", "Szélfútta fű", "short wind-combed tundra grasses"],
        ["snow_patches", "Hófoltok", "persistent snow patches in sheltered hollows"],
        ["low_horizon", "Alacsony horizont", "broad empty horizon under a low sky"]
      ]
    },
    {
      id: "steppe",
      label: "Sztyepp / Puszta",
      short: "ST",
      prompt: "temperate grassland, dry tall grasses, open horizon, sparse trees",
      phenology: "sztyeppi füves",
      temp: 2,
      light: 0.25,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow"],
      outfit: "wind-ready open-grassland clothing adapted to dry air and seasonal temperature",
      elements: [
        ["tall_grass", "Magas száraz fű", "dry tall grasses moving in open wind"],
        ["feather_grass", "Árvalányhaj", "fine feather grass texture catching low light"],
        ["open_horizon", "Nyílt horizont", "unbroken open horizon with very sparse trees"],
        ["dust_track", "Poros földút", "dusty track crossing the grassland"],
        ["sparse_trees", "Ritka fák", "rare isolated trees far behind the subject"],
        ["low_shrubs", "Alacsony cserjék", "low drought-tolerant shrubs among grass"],
        ["grazed_patch", "Legelt folt", "short grazed patch contrasting taller grass"],
        ["storm_front", "Távoli zivatarfront", "distant storm front over the flat grassland"]
      ]
    },
    {
      id: "deciduous_forest",
      label: "Lombhullató erdő",
      short: "LE",
      prompt: "temperate deciduous forest, layered canopy, seasonal understory, leaf litter",
      phenology: "lombhullató erdei",
      temp: 0,
      light: -0.7,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow"],
      outfit: "temperate forest outdoor clothing, layered and weather-appropriate",
      elements: [
        ["layered_canopy", "Rétegzett lombkorona", "layered deciduous canopy filtering natural light"],
        ["leaf_litter", "Avar", "seasonal leaf litter covering the forest floor"],
        ["understory", "Aljnövényzet", "seasonal understory plants and soft forest depth"],
        ["forest_path", "Erdei út", "narrow forest path with natural soil texture"],
        ["old_trunks", "Idős fatörzsek", "old deciduous trunks with varied bark texture"],
        ["ferns", "Páfrányok", "fern patches in damp filtered light"],
        ["moss_roots", "Mohás gyökerek", "mossy roots and damp roots near the frame"],
        ["small_clearing", "Kis tisztás", "small forest clearing with gentle overhead light"]
      ]
    },
    {
      id: "wetland",
      label: "Mocsár- és lápvidék",
      short: "ML",
      prompt: "wetland environment, reeds, shallow standing water, peat soil, humid air",
      phenology: "mocsári-lápi",
      temp: -1,
      light: -0.45,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow"],
      outfit: "waterproof wetland-ready clothing, practical boots, rain layer when needed",
      elements: [
        ["reeds", "Nádas", "dense reeds and wetland grasses close to the frame"],
        ["standing_water", "Sekély állóvíz", "shallow standing water with soft reflections"],
        ["peat_soil", "Tőzeges talaj", "dark wet peat soil and saturated ground"],
        ["cattails", "Gyékényes", "cattails and vertical marsh plants"],
        ["willow_scrub", "Fűzcserjés", "low willow scrub along wet edges"],
        ["hummocks", "Zsombékok", "raised wet grass hummocks in marsh ground"],
        ["dark_pools", "Sötét vízfoltok", "small dark pools between reeds"],
        ["humid_mist", "Párás levegő", "low humid mist close to the wet ground"]
      ]
    },
    {
      id: "lake_shore",
      label: "Tópart",
      short: "TP",
      prompt: "lake shoreline, reflective water, reeds or pebbles, open water horizon",
      phenology: "tóparti",
      temp: -1,
      light: 0.1,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow"],
      outfit: "lake-shore outdoor clothing, wind-ready layers and practical footwear",
      elements: [
        ["reflective_water", "Tükröződő víz", "calm reflective lake water behind the subject"],
        ["reeds", "Tavi nádas", "lake reeds and low shore vegetation"],
        ["pebbles", "Kavicsos part", "pebbled lake shoreline close to the camera"],
        ["open_horizon", "Nyílt vízhorizont", "open water horizon without ocean waves"],
        ["wooden_pier", "Fa stég", "simple weathered wooden pier as a small shore detail"],
        ["muddy_edge", "Iszapos perem", "soft muddy lake edge with wet texture"],
        ["water_plants", "Vízinövények", "floating or near-shore lake plants"],
        ["morning_mist", "Tavi pára", "thin mist hovering over calm lake water"]
      ]
    },
    {
      id: "mediterranean",
      label: "Mediterrán táj",
      short: "MT",
      prompt: "dry mediterranean scrubland, olive trees, pines, limestone ground, warm haze",
      phenology: "mediterrán száraz",
      temp: 4,
      light: 0.45,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm"],
      outfit: "warm-climate outdoor clothing, breathable layers, sun-ready styling",
      elements: [
        ["olive_trees", "Olajfák", "gnarled olive trees on dry ground"],
        ["pines", "Ernyős fenyők", "Mediterranean pine silhouettes in warm light"],
        ["limestone", "Mészköves talaj", "pale limestone ground and small rocks"],
        ["scrub", "Macchia", "dry aromatic mediterranean scrub"],
        ["herbs", "Kakukkfű-rozmaring", "low thyme and rosemary shrubs"],
        ["terrace", "Kőteraszos lejtő", "old stone terraces on a sun-baked slope"],
        ["dry_wall", "Száraz kőfal", "low dry-stone wall as a terrain detail"],
        ["warm_haze", "Meleg pára", "subtle warm haze softening distant hills"]
      ]
    },
    {
      id: "karst",
      label: "Karsztvidék",
      short: "KS",
      prompt: "limestone terrain, rocky grassland, dolines, cliffs, sparse scrub vegetation",
      phenology: "karsztos száraz gyep",
      temp: -1,
      light: 0.15,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow"],
      outfit: "rocky-terrain hiking clothing, sturdy footwear, layered weather-ready fabric",
      elements: [
        ["limestone_pavement", "Mészkőpadok", "limestone pavement with pale cracked rock surface"],
        ["dolines", "Töbrök", "karst dolines and rounded sinkhole depressions"],
        ["cliffs", "Sziklafalak", "limestone cliffs and bright rocky edges"],
        ["scrub", "Ritka cserjés", "sparse scrub vegetation between limestone rocks"],
        ["sinkhole", "Víznyelő", "dark karst sinkhole or swallow hole kept safely distant"],
        ["stalactite_cave", "Cseppkőbarlang", "limestone cave interior edge with stalactite formations"],
        ["cave_lake", "Tavas barlang", "still cave lake reflecting cool mineral light"],
        ["karst_spring", "Karsztforrás", "clear karst spring emerging from limestone"]
      ]
    },
    {
      id: "volcanic",
      label: "Vulkanikus táj",
      short: "VT",
      prompt: "basalt or volcanic rock formations, dark mineral soil, rugged terrain",
      phenology: "vulkanikus kopár",
      temp: 1,
      light: 0.25,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow"],
      outfit: "rugged rocky-terrain clothing, sturdy footwear, wind-ready layers",
      elements: [
        ["basalt_columns", "Bazaltoszlopok", "basalt column formations behind the subject"],
        ["dark_soil", "Sötét ásványi talaj", "dark volcanic mineral soil and ash texture"],
        ["lava_rock", "Lávakő", "rough porous lava rock foreground"],
        ["black_sand", "Fekete homok", "black volcanic sand or gravel surface"],
        ["crater_rim", "Kráterperem", "distant crater rim or volcanic ridge line"],
        ["ash_slope", "Hamulejtő", "loose ash slope with dark granular texture"],
        ["mineral_stains", "Ásványos elszíneződés", "subtle yellow or red mineral staining on rock"],
        ["rugged_ridge", "Zord gerinc", "rugged volcanic ridge with hard angular forms"]
      ]
    },
    {
      id: "plateau",
      label: "Fennsík",
      short: "FN",
      prompt: "elevated open plateau, wind-exposed grassland, broad distant horizon",
      phenology: "fennsíki füves",
      temp: -3,
      light: 0.25,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow"],
      outfit: "wind-exposed plateau clothing, layered outdoor fabric and practical footwear",
      elements: [
        ["open_grassland", "Nyílt fennsíki gyep", "elevated open grassland with short wind-combed plants"],
        ["broad_horizon", "Széles horizont", "broad distant horizon from elevated ground"],
        ["wind_edge", "Széljárta perem", "wind-exposed plateau edge with sparse grass"],
        ["cliff_drop", "Fennsíkperem", "distant plateau edge or cliff drop"],
        ["boulders", "Elszórt kövek", "scattered boulders on high open ground"],
        ["dry_turf", "Száraz gyep", "dry turf patches and shallow soil"],
        ["cloud_shadow", "Felhőárnyék", "large moving cloud shadows across the plateau"],
        ["low_scrub", "Alacsony cserjés", "low shrubs shaped by exposed wind"]
      ]
    },
    {
      id: "mangrove",
      label: "Mangrove",
      short: "MG",
      prompt: "tropical tidal mangrove zone, exposed roots, brackish water, humid air",
      phenology: "mangrove trópusi",
      temp: 5,
      light: -0.55,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm"],
      outfit: "humid tropical water-edge clothing, breathable fabric, practical waterproof footwear",
      elements: [
        ["prop_roots", "Támasztógyökerek", "mangrove prop roots rising from shallow water"],
        ["brackish_water", "Brakkvíz", "brackish tidal water with muddy reflections"],
        ["tidal_mud", "Árapályiszap", "dark tidal mud exposed between roots"],
        ["dense_canopy", "Sűrű lomb", "dense mangrove canopy filtering humid light"],
        ["pneumatophores", "Légzőgyökerek", "small vertical breathing roots in wet mud"],
        ["tidal_channel", "Keskeny csatorna", "narrow tidal channel through mangrove roots"],
        ["salt_pool", "Sós vízfolt", "small saltwater pool on the mudflat"],
        ["humid_haze", "Párás levegő", "warm humid haze among tangled roots"]
      ]
    },
    {
      id: "monsoon_forest",
      label: "Monzunerdő",
      short: "MO",
      prompt: "seasonally wet tropical monsoon forest, broad leaves, muddy ground, humid air",
      phenology: "monzunerdei",
      temp: 5,
      light: -0.9,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm"],
      outfit: "humid warm-weather forest clothing, rain-ready light fabric, no winter layers",
      elements: [
        ["broad_leaves", "Széles levelek", "large seasonal broad leaves in humid forest light"],
        ["muddy_track", "Sáros ösvény", "muddy monsoon forest track"],
        ["bamboo", "Bambuszfolt", "bamboo clump mixed into tropical forest"],
        ["dry_leaf_litter", "Száraz lombszőnyeg", "dry-season leaf litter under tropical trees"],
        ["wet_trunks", "Nedves törzsek", "dark wet tree trunks after rain"],
        ["lianas", "Liánok", "seasonal lianas and tangled climbing plants"],
        ["seasonal_stream", "Időszakos patak", "seasonal stream line through humid forest"],
        ["monsoon_haze", "Monzunpára", "humid monsoon haze between forest layers"]
      ]
    },
    {
      id: "heath_moor",
      label: "Hangás / lápos felföld",
      short: "HF",
      prompt: "windy heather moorland, boggy upland ground, low shrubs, cool mist",
      phenology: "hangás-lápos felföldi",
      temp: -4,
      light: -0.25,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow"],
      outfit: "cool windy upland clothing, waterproof layers, sturdy boots",
      elements: [
        ["heather", "Hangás", "heather-covered upland ground"],
        ["boggy_ground", "Lápos talaj", "boggy wet ground with peat and grass tussocks"],
        ["juniper", "Borókás", "low juniper shrubs on exposed upland"],
        ["mist", "Alacsony köd", "low mist moving across the moor"],
        ["peat_pool", "Tőzeges vízfolt", "small dark peat pools between grasses"],
        ["rock_hummocks", "Köves zsombékok", "rocky hummocks in exposed upland grass"],
        ["wind_grass", "Szélfésült fű", "grass combed flat by persistent wind"],
        ["distant_slope", "Távoli kopár lejtő", "distant bare upland slope under cool light"]
      ]
    },
    {
      id: "canyon",
      label: "Kanyon / szurdok",
      short: "KN",
      prompt: "narrow canyon or gorge, layered rock walls, strong shadows, constrained valley floor",
      phenology: "szurdokvölgyi",
      temp: -1,
      light: -0.8,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow"],
      outfit: "rocky canyon hiking clothing, sturdy footwear, layer suited to shaded terrain",
      elements: [
        ["layered_walls", "Rétegzett falak", "layered canyon rock walls rising close behind"],
        ["narrow_floor", "Keskeny völgytalp", "narrow valley floor with compressed depth"],
        ["strong_shadow", "Erős árnyékok", "strong vertical shadows from high rock walls"],
        ["dry_streambed", "Száraz patakmeder", "dry streambed with rounded stones"],
        ["cliff_ledges", "Sziklapárkányok", "small cliff ledges and angular rock shelves"],
        ["talus", "Törmeléklejtő", "talus slope at the base of the canyon wall"],
        ["slot_section", "Szűk szurdokrész", "slot canyon section with limited overhead light"],
        ["echoing_space", "Zárt térérzet", "enclosed canyon space without urban elements"]
      ]
    },
    {
      id: "salt_lake",
      label: "Sós tó / szikes puszta",
      short: "SÓ",
      prompt: "salt lake or alkali plain, white salt crust, shallow water, sparse vegetation",
      phenology: "szikes-sóstavi",
      temp: 2,
      light: 0.45,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow"],
      outfit: "open exposed plain clothing, sun-ready and wind-ready layers",
      elements: [
        ["salt_crust", "Fehér sókéreg", "white salt crust on flat ground"],
        ["shallow_water", "Sekély víz", "shallow reflective saline water"],
        ["cracked_clay", "Repedezett agyag", "cracked pale clay and alkali mud"],
        ["halophytes", "Sziki növényzet", "sparse salt-tolerant vegetation"],
        ["flat_horizon", "Lapos horizont", "very flat horizon with minimal vertical elements"],
        ["alkali_mud", "Szikes iszap", "pale alkali mud close to the frame"],
        ["dry_pan", "Kiszáradt tófenék", "dry lake bed with mineral crust texture"],
        ["mirror_patch", "Tükröző vízfolt", "small mirror-like water patch under bright sky"]
      ]
    },
    {
      id: "badland",
      label: "Homokkő / badland",
      short: "HB",
      prompt: "eroded sandstone and badland terrain, dry barren surface, gullies, ochre mineral tones",
      phenology: "kopár homokkő-badland",
      temp: 4,
      light: 0.35,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm"],
      outfit: "dry rocky-terrain clothing, sun-ready fabric, sturdy footwear",
      elements: [
        ["sandstone_forms", "Homokkőformák", "eroded sandstone formations in warm mineral tones"],
        ["clay_ridges", "Agyagbordák", "rilled clay ridges and dry sculpted slopes"],
        ["dry_gullies", "Száraz vízmosások", "dry gullies cut into barren ground"],
        ["ochre_slope", "Okker lejtő", "ochre and tan mineral slope textures"],
        ["hoodoos", "Kőgombák", "distant hoodoo-like eroded rock pillars"],
        ["sparse_scrub", "Ritka bozót", "rare dry scrub on eroded ground"],
        ["cracked_surface", "Repedezett felszín", "cracked sun-baked surface close to the camera"],
        ["dust_layer", "Poros réteg", "fine dust layer over dry sandstone terrain"]
      ]
    },
    {
      id: "tropical_island",
      label: "Trópusi sziget",
      short: "TS",
      prompt: "tropical island coast, palms, coral sand, lagoon water, warm humid air",
      phenology: "trópusi parti",
      temp: 5,
      light: 0.35,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm"],
      outfit: "warm humid island clothing, breathable fabric, sun-ready styling",
      elements: [
        ["palms", "Pálmák", "palm trees shaped by coastal wind"],
        ["coral_sand", "Korallhomok", "pale coral sand close to the frame"],
        ["lagoon", "Lagúna", "calm turquoise lagoon water"],
        ["reef_line", "Korallzátony-sáv", "distant reef line breaking the water horizon"],
        ["beach_rocks", "Parti sziklák", "dark beach rocks against pale sand"],
        ["sea_grape", "Parti cserjék", "tropical coastal shrubs near the sand"],
        ["rainforest_edge", "Erdőszegély", "rainforest edge meeting the beach"],
        ["humid_glow", "Párás fény", "warm humid glow over tropical island air"]
      ]
    },
    {
      id: "fjord",
      label: "Fjordvidék",
      short: "FJ",
      prompt: "deep glacial sea inlet, steep mountain walls, cold coastal water, rocky shoreline",
      phenology: "hűvös fjordparti",
      temp: -5,
      light: -0.25,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow", "fog"],
      outfit: "cold coastal clothing, windproof layered jacket, sturdy waterproof footwear",
      elements: [["fjord_water", "Mély fjordvíz", "deep cold sea inlet between mountain walls"], ["steep_walls", "Meredek hegyfalak", "steep glacial mountain walls rising from the water"], ["rocky_shore_fjord", "Sziklás part", "dark rocky fjord shoreline"], ["waterfall_fjord", "Vízesés", "narrow waterfall descending from a hanging valley"], ["glacial_valley", "Gleccservölgy", "U-shaped glacial valley geometry"], ["conifer_slopes", "Fenyves lejtők", "cool-climate conifers on lower slopes"], ["low_cloud_fjord", "Alacsony felhők", "low cloud layers around mountain shoulders"], ["distant_snow_fjord", "Távoli hómezők", "persistent snow patches on distant peaks"]]
    },
    {
      id: "rocky_coast",
      label: "Sziklás tengerpart",
      short: "SZ",
      prompt: "rugged rocky coastline, sea cliffs, wave-cut platforms, exposed maritime terrain",
      phenology: "sziklás tengeri parti",
      temp: -1,
      light: 0.15,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "fog"],
      outfit: "windproof maritime clothing, layered outerwear and slip-resistant footwear",
      elements: [["sea_cliffs", "Tengerparti sziklafal", "rugged sea cliffs above open water"], ["wave_platform", "Hullámtörte kőpad", "wave-cut rock platform near sea level"], ["sea_stacks", "Sziklatornyok", "offshore sea stacks shaped by erosion"], ["tide_pools", "Árapálymedencék", "clear tide pools among dark rocks"], ["surf_rocks", "Hullámverte sziklák", "breaking surf against exposed rocks"], ["coastal_grass", "Parti gyep", "salt- and wind-tolerant coastal grass"], ["rock_arch", "Sziklakapu", "natural sea arch in coherent scale"], ["spray_haze", "Tengeri permet", "fine sea-spray haze above the shoreline"]]
    },
    {
      id: "river_delta",
      label: "Folyódelta",
      short: "FD",
      prompt: "river delta landscape, branching channels, sediment islands, wetlands and shallow water",
      phenology: "deltavidéki vizes",
      temp: 0,
      light: 0,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "fog", "mist"],
      outfit: "humid wetland-ready clothing, lightweight rain layer and waterproof footwear",
      elements: [["branching_channels", "Elágazó csatornák", "branching distributary channels across the delta"], ["sediment_islands", "Hordalékszigetek", "low sediment islands between waterways"], ["delta_reeds", "Nádasok", "dense reeds along shallow channel margins"], ["mud_banks", "Iszappadok", "fresh muddy banks and deposited silt"], ["shallow_lagoons", "Sekély tavak", "shallow delta lagoons with soft reflections"], ["willow_delta", "Ártéri fűzes", "low floodplain willow vegetation"], ["channel_mouth", "Torkolati ág", "broad channel opening toward open water"], ["delta_haze", "Párás horizont", "humid atmospheric haze above the flat delta"]]
    },
    {
      id: "tidal_flat",
      label: "Árapály-síkság",
      short: "AS",
      prompt: "tidal flat environment, exposed mud and sand, shallow channels, salt-tolerant vegetation",
      phenology: "árapályos sós parti",
      temp: -1,
      light: 0.2,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "fog", "mist"],
      outfit: "wind-ready coastal clothing and waterproof boots suited to mud and shallow water",
      elements: [["exposed_mudflat", "Iszapos síkság", "broad exposed tidal mudflat"], ["sand_ripples", "Homokfodrok", "water-shaped ripples in wet sand"], ["tidal_creeks", "Árapálycsatornák", "shallow winding tidal creeks"], ["salt_marsh", "Sós mocsár", "salt-tolerant marsh vegetation"], ["shallow_mirror", "Sekély víztükör", "thin reflective water layer over the flat"], ["shell_beds", "Kagylópadok", "subtle natural shell deposits"], ["distant_tide", "Távoli vízvonal", "retreated tide visible on the horizon"], ["wet_silt", "Nedves hordalék", "fine wet silt texture in the foreground"]]
    },
    {
      id: "lagoon_atoll",
      label: "Lagúna / atoll",
      short: "LG",
      prompt: "shallow tropical lagoon, coral sand, reef-protected water, low coastal vegetation",
      phenology: "trópusi korallzátonyi",
      temp: 6,
      light: 0.45,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm"],
      outfit: "light tropical coastal clothing, sun protection and water-ready footwear",
      elements: [["turquoise_lagoon", "Türkiz lagúna", "clear shallow turquoise lagoon water"], ["coral_sand_atoll", "Korallhomok", "pale coral sand on a low atoll"], ["reef_barrier", "Zátonyperem", "reef barrier protecting the lagoon"], ["low_islets", "Alacsony szigetek", "low coral islets across the water"], ["palm_line", "Pálmasor", "sparse palms and low coastal vegetation"], ["sand_spit", "Homoknyelv", "narrow coral-sand spit extending into the lagoon"], ["shallow_ripples", "Sekély hullámok", "small wind ripples over transparent water"], ["reef_pass", "Zátonyátjáró", "deeper blue passage through the reef"]]
    },
    {
      id: "oasis",
      label: "Oázis",
      short: "OZ",
      prompt: "desert oasis, permanent water source, date palms, irrigated vegetation, arid surroundings",
      phenology: "oázisi öntözött",
      temp: 7,
      light: 0.35,
      allowedWeather: ["sun", "partly", "cloud", "storm", "sandstorm", "mirage"],
      outfit: "breathable desert clothing, strong sun protection and practical closed footwear",
      elements: [["oasis_pool", "Oázistó", "permanent clear water source in the desert"], ["date_palms", "Datolyapálmák", "mature date palms around the water"], ["irrigated_garden", "Öntözött kert", "small irrigated vegetation plots"], ["desert_edge", "Sivatagi perem", "abrupt transition from green oasis to arid terrain"], ["spring_channel", "Forráscsatorna", "narrow water channel feeding the oasis"], ["palm_shade", "Pálmaárnyék", "deep natural shade beneath palm crowns"], ["reeds_oasis", "Oázisnádas", "small reed fringe at the water edge"], ["dune_horizon", "Dűnehorizont", "distant dunes beyond the vegetation"]]
    },
    {
      id: "sand_sea_erg",
      label: "Homoktenger / erg",
      short: "ER",
      prompt: "vast sand dune field, wind-shaped dunes, minimal vegetation, open desert horizon",
      phenology: "növényzetmentes homoksivatagi",
      temp: 9,
      light: 0.6,
      allowedWeather: ["sun", "partly", "cloud", "storm", "sandstorm", "mirage"],
      outfit: "full desert sun protection, breathable layers, face covering and sand-ready footwear",
      elements: [["dune_ridges", "Dűnegerincek", "long wind-shaped dune ridges"], ["slip_faces", "Meredek dűneoldal", "steep smooth slip faces on tall dunes"], ["wind_ripples", "Szélfodrok", "fine wind ripples across dry sand"], ["interdune_basin", "Dűneközi mélyedés", "broad basin between dune chains"], ["sand_haze", "Homokpára", "fine airborne sand softening the horizon"], ["crescent_dunes", "Sarlódűnék", "repeating crescent-shaped dunes"], ["empty_horizon", "Üres horizont", "vast open desert horizon without structures"], ["dune_shadow", "Dűneárnyék", "strong natural shadow defining dune geometry"]]
    },
    {
      id: "rock_desert_hamada",
      label: "Sziklasivatag / hamada",
      short: "HM",
      prompt: "rocky desert plateau, exposed stone pavement, barren terrain, sparse desert vegetation",
      phenology: "hamada kopár",
      temp: 8,
      light: 0.45,
      allowedWeather: ["sun", "partly", "cloud", "storm", "sandstorm", "mirage"],
      outfit: "sun-protective rocky-desert clothing, layered breathable fabric and sturdy boots",
      elements: [["desert_pavement", "Sivatagi kőburkolat", "dense natural desert pavement of exposed stones"], ["rock_plateau", "Köves fennsík", "barren rocky plateau with broad scale"], ["dark_gravel", "Sötét kavics", "dark weathered desert gravel"], ["dry_wadi", "Száraz vádi", "shallow dry drainage channel"], ["isolated_boulders", "Elszigetelt sziklák", "scattered angular desert boulders"], ["sparse_desert_scrub", "Ritka sivatagi cserjék", "widely spaced drought-tolerant scrub"], ["mesa_edge", "Fennsíkperem", "eroded plateau or mesa edge"], ["heat_haze_hamada", "Hőremegés", "subtle heat shimmer above exposed stone"]]
    },
    {
      id: "temperate_rainforest",
      label: "Mérsékelt övi esőerdő",
      short: "ME",
      prompt: "temperate rainforest, giant moss-covered trees, ferns, dense humid understory",
      phenology: "mérsékelt övi esőerdei",
      temp: -1,
      light: -1.1,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow", "fog", "mist"],
      outfit: "waterproof temperate-rainforest clothing, layered fabric and mud-ready boots",
      elements: [["giant_trees", "Óriásfák", "massive old temperate rainforest trunks"], ["moss_drapes", "Mohazuhatagok", "thick moss covering branches and bark"], ["fern_understory", "Páfrányos aljnövényzet", "dense fern understory in humid shade"], ["fallen_nurse_log", "Korhadó fatörzs", "large fallen nurse log supporting new growth"], ["forest_stream_rain", "Erdei patak", "clear stream through mossy rocks"], ["wet_bark", "Nedves kéreg", "dark rain-wet bark texture"], ["canopy_mist", "Lombkoronapára", "fine mist beneath the high canopy"], ["root_network", "Gyökérhálózat", "exposed mossy roots across damp ground"]]
    },
    {
      id: "cloud_forest",
      label: "Köderdő",
      short: "KE",
      prompt: "tropical montane cloud forest, persistent mist, mossy branches, dense epiphytes",
      phenology: "trópusi hegyi köderdő",
      temp: -2,
      light: -1.25,
      allowedWeather: ["partly", "cloud", "rain", "storm", "fog", "mist"],
      outfit: "humid cool montane clothing, lightweight waterproof layers and secure footwear",
      elements: [["misty_canopy", "Ködös lombkorona", "persistent mist moving through the canopy"], ["epiphytes", "Epifiták", "dense epiphytes on trunks and branches"], ["mossy_branches", "Mohás ágak", "branches fully wrapped in wet moss"], ["tree_ferns", "Páfrányfák", "tree ferns in the humid understory"], ["orchids", "Vad orchideák", "small natural orchids among epiphytes"], ["steep_forest_slope", "Meredek erdőlejtő", "steep montane forest slope"], ["cloud_drip", "Ködcsapadék", "water droplets collecting on foliage"], ["obscured_depth", "Ködbe vesző mélység", "forest layers fading naturally into cloud"]]
    },
    {
      id: "montane_conifer_forest",
      label: "Hegyvidéki fenyves",
      short: "HFY",
      prompt: "montane conifer forest, steep forested slopes, rocky ground, cool mountain air",
      phenology: "hegyvidéki tűlevelű",
      temp: -5,
      light: -0.65,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow", "fog"],
      outfit: "cool mountain forest clothing, insulating layers and sturdy hiking boots",
      elements: [["mountain_conifers", "Hegyi fenyők", "dense spruce, fir and pine on steep terrain"], ["rocky_forest_floor", "Köves erdőtalaj", "rocky ground beneath conifers"], ["steep_wooded_slope", "Erdős hegyoldal", "steep forested mountain slope"], ["needle_floor", "Tűlevélszőnyeg", "thick natural needle litter"], ["granite_outcrops", "Gránitsziklák", "granite outcrops among tree roots"], ["mountain_stream", "Hegyi patak", "cold clear stream in the forest"], ["forest_snow", "Erdőszéli hófoltok", "persistent snow patches in shade"], ["cool_haze_conifer", "Hegyi pára", "cool haze between conifer layers"]]
    },
    {
      id: "alpine_meadow",
      label: "Alpesi rét",
      short: "AR",
      prompt: "high alpine meadow, low flowering vegetation, exposed slopes, mountain peaks nearby",
      phenology: "alpesi réti",
      temp: -7,
      light: 0.35,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow", "fog"],
      outfit: "windproof high-alpine clothing, warm layers and mountain-ready footwear",
      elements: [["alpine_grass", "Alpesi gyep", "short dense grass adapted to altitude"], ["wildflowers", "Hegyi vadvirágok", "low seasonal alpine wildflowers"], ["exposed_slope", "Kitett lejtő", "open wind-exposed mountain slope"], ["nearby_peaks", "Közeli hegycsúcsok", "rocky peaks rising close beyond the meadow"], ["snow_patch_alpine", "Hófoltok", "late-lying snow in shallow hollows"], ["alpine_stream", "Olvadékvíz", "small meltwater stream through the meadow"], ["rock_islands", "Sziklafoltok", "natural rock outcrops among low vegetation"], ["high_cloud_shadow", "Felhőárnyék", "moving cloud shadows over the high meadow"]]
    },
    {
      id: "geothermal_field",
      label: "Geotermikus mező",
      short: "GT",
      prompt: "geothermal field, steaming vents, mineral deposits, hot pools, barren volcanic ground",
      phenology: "geotermikus kopár",
      temp: 1,
      light: 0.1,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow", "fog"],
      outfit: "protective layered outdoor clothing and sturdy footwear kept safely away from hot ground",
      elements: [["steam_vents", "Gőzfeltörések", "natural steam vents rising from the ground"], ["hot_pools", "Hőforrások", "mineral-rich hot pools at a safe distance"], ["mineral_crust", "Ásványkéreg", "yellow, white and ochre mineral deposits"], ["barren_ground_geo", "Kopár talaj", "barren hydrothermally altered ground"], ["mud_pots", "Iszapfortyogók", "small bubbling mud pools"], ["sinter_terraces", "Mésztufateraszok", "natural sinter terraces shaped by hot water"], ["steam_haze_geo", "Gőzpára", "layered steam drifting across the field"], ["volcanic_ridge_geo", "Vulkanikus háttér", "dark volcanic ridge beyond the vents"]]
    },
    {
      id: "lava_field",
      label: "Lávamező",
      short: "LM",
      prompt: "extensive hardened lava field, fractured basalt surface, sparse pioneer vegetation",
      phenology: "lávamező pionír",
      temp: 2,
      light: 0.25,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow", "fog"],
      outfit: "rugged volcanic-terrain clothing, sturdy high-traction footwear and wind-ready layers",
      elements: [["pahoehoe", "Kötélláva", "smooth folded rope-like hardened lava"], ["aa_lava", "Törmelékes láva", "sharp blocky hardened lava surface"], ["basalt_fractures", "Bazalthasadékok", "deep natural fractures in black basalt"], ["lava_tubes", "Lávacsatornák", "collapsed lava-tube edges in safe distant context"], ["pioneer_moss", "Pionír moha", "sparse moss and lichen colonizing old lava"], ["cinder_patch", "Salakmező", "dark volcanic cinder patches"], ["volcanic_horizon", "Vulkáni horizont", "broad volcanic ridge beyond the field"], ["rain_darkened_lava", "Nedves lávakő", "rain-darkened porous lava texture"]]
    },
    {
      id: "polar_ice_sheet",
      label: "Sarki jégmező",
      short: "SJ",
      prompt: "polar ice sheet, wind-shaped snow surface, vast frozen horizon, minimal exposed rock",
      phenology: "sarki jégmező",
      temp: -15,
      light: 0.5,
      allowedWeather: ["sun", "partly", "cloud", "snow", "snow_shower", "fog", "blowing_snow"],
      outfit: "extreme polar expedition clothing, full insulation, face protection and ice-ready boots",
      elements: [["wind_sastrugi", "Szélbarázdák", "wind-shaped sastrugi across hard snow"], ["vast_ice", "Végtelen jégfelszín", "vast nearly featureless polar ice sheet"], ["blue_ice", "Kék jég", "small exposed blue-ice surfaces"], ["snow_ridges", "Hógerincek", "low wind-built snow ridges"], ["ice_cracks", "Jéghasadékok", "distant safely framed ice fractures"], ["minimal_rock", "Ritka szikla", "rare dark nunatak or exposed rock"], ["frozen_horizon", "Fagyott horizont", "vast frozen horizon beneath polar sky"], ["drifting_snow", "Hófúvás", "fine drifting snow close to the surface"]]
    },
    {
      id: "natural_cave",
      label: "Barlang / karsztbarlang",
      short: "BG",
      prompt: "natural limestone cave interior, large chambers, stalactites, damp rock surfaces, low natural entrance light",
      phenology: "barlangi növényzetmentes",
      temp: -4,
      light: -2,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow", "fog"],
      outfit: "cool damp cave clothing, protective layers, helmet-appropriate styling and high-traction footwear",
      elements: [["stalactites", "Cseppkövek", "natural stalactites descending from the cave ceiling"], ["stalagmites", "Állócseppkövek", "stalagmites rising from the chamber floor"], ["limestone_chamber", "Mészkőcsarnok", "large naturally eroded limestone chamber"], ["damp_rock", "Nedves sziklafal", "damp mineral rock surfaces with restrained reflections"], ["cave_pool", "Barlangi tó", "still clear cave pool"], ["entrance_light", "Bejárati fény", "soft natural daylight reaching from a distant entrance"], ["flowstone", "Cseppkőlefolyás", "layered flowstone formations"], ["rock_passage", "Sziklafolyosó", "narrow passage connecting larger chambers"]]
    }
  ];

  const LANDSCAPE_CATEGORIES = [
    ["mountain", "Hegyvidék", ["high_mountain", "mid_mountain", "hills", "plateau", "karst", "canyon", "fjord", "montane_conifer_forest", "alpine_meadow"]],
    ["forest", "Erdő és füves táj", ["plain", "savanna", "taiga", "tundra", "steppe", "deciduous_forest", "jungle", "monsoon_forest", "temperate_rainforest", "cloud_forest", "heath_moor"]],
    ["water", "Vízpart és vizes élőhely", ["coast", "rocky_coast", "river", "river_delta", "tidal_flat", "wetland", "lake_shore", "mangrove", "tropical_island", "lagoon_atoll"]],
    ["arid", "Száraz táj", ["desert", "oasis", "sand_sea_erg", "rock_desert_hamada", "salt_lake", "badland", "mediterranean"]],
    ["geology", "Jég és földtani táj", ["glacier", "volcanic", "geothermal_field", "lava_field", "polar_ice_sheet", "natural_cave"]]
  ].map(([id, label, presetIds]) => ({ id, label, presetIds }));

  const BUILT_ENVIRONMENT_PRESETS = [
    ["village", "Falu", "FL", "traditional village environment with human-scale streets and coherent regional architecture", [
      ["village_street", "Falusi utca", "quiet village street with coherent traditional facades"], ["farmhouses", "Lakóházak", "regional village houses with authentic materials"], ["village_church", "Falusi templom", "small village church as a natural landmark"], ["well", "Kút", "traditional public well or drinking fountain"], ["market_stalls", "Piaci standok", "small local market stalls without branding"], ["roadside_trees", "Utcai fasor", "mature roadside trees integrated with the settlement"]]],
    ["historic_town", "Történelmi város", "TV", "historic European townscape with layered architecture, walkable streets and preserved urban fabric", [
      ["old_street", "Óvárosi utca", "historic street with varied authentic facades"], ["arcade", "Árkádok", "stone or plaster arcades along the street"], ["town_gate", "Városkapu", "preserved historic town gate"], ["courtyard", "Belső udvar", "semi-public historic courtyard visible from the street"], ["clock_tower", "Óratorony", "clock tower integrated into the distant townscape"], ["cobblestone", "Kőburkolat", "aged stone paving with realistic wear"]]],
    ["modern_city", "Modern város", "MV", "contemporary city environment with coherent modern architecture and realistic public space", [
      ["office_towers", "Irodaházak", "modern office buildings with glass, steel and stone facades"], ["urban_plaza", "Városi tér", "open contemporary civic plaza"], ["transit", "Közösségi közlekedés", "integrated urban transit infrastructure without logos"], ["street_furniture", "Utca bútorai", "coherent benches, lighting and wayfinding structures"], ["green_roofs", "Városi zöld", "planned urban trees and planted terraces"], ["pedestrian_zone", "Sétálóövezet", "active pedestrian zone with realistic city scale"]]],
    ["castle_exterior", "Vár és erőd", "VÁ", "historic castle or fortified complex in a geographically plausible built setting", [
      ["fortress_wall", "Várfal", "massive historic defensive wall with authentic masonry"], ["gatehouse", "Kapuépület", "fortified gatehouse and passage"], ["tower", "Torony", "historic defensive or residential tower"], ["courtyard_outer", "Várudvar", "open castle courtyard with period-compatible surfaces"], ["battlements", "Párkány és bástya", "battlements and bastions with believable structure"], ["stone_bridge", "Kőhíd", "historic stone bridge approaching the fortified complex"]]],
    ["theatre_exterior", "Színház és opera", "SZ", "theatre or opera-house exterior with ceremonial civic architecture", [
      ["grand_stairs", "Díszlépcső", "broad ceremonial entrance stairs"], ["columned_front", "Oszlopos homlokzat", "architectural colonnade framing the entrance"], ["poster_cases", "Plakátvitrinek", "unbranded theatre display cases"], ["marquee", "Előtető", "elegant entrance canopy without readable text"], ["square_lights", "Esti térvilágítás", "architectural exterior lighting around the theatre"], ["sculptures", "Homlokzati szobrok", "integrated allegorical facade sculptures"]]],
    ["christian_church", "Keresztény templom", "KT", "Christian church exterior with denomination-appropriate architecture and respectful visual context", [
      ["bell_tower", "Harangtorony", "church bell tower with authentic proportions"], ["portal", "Főkapu", "ornamented church portal"], ["rose_window", "Rózsaablak", "stained or traceried rose window where architecturally appropriate"], ["church_square", "Templomtér", "quiet public square adjoining the church"], ["cloister", "Kerengő", "cloister arcade connected to the religious complex"], ["church_statue", "Vallási szobor", "respectfully placed religious sculpture"]]],
    ["mosque_exterior", "Mecset", "ME", "mosque exterior with regionally coherent Islamic architecture and respectful civic context", [
      ["minaret", "Minaret", "minaret with regionally authentic proportions"], ["courtyard_fountain", "Udvari kút", "ablution fountain in a calm courtyard"], ["domes", "Kupolák", "coherent dome structure over the prayer hall"], ["arcades", "Íves árkádok", "rhythmic Islamic architectural arcades"], ["geometric_screen", "Geometrikus rács", "decorative geometric stone or wood screens"], ["mosque_square", "Mecset előtti tér", "respectful pedestrian space around the mosque"]]],
    ["synagogue_exterior", "Zsinagóga", "ZS", "synagogue exterior with historically and regionally coherent architecture", [
      ["twin_towers", "Homlokzati tornyok", "symmetrical synagogue facade towers where appropriate"], ["arched_windows", "Íves ablakok", "tall arched windows with authentic tracery"], ["entrance_steps", "Bejárati lépcső", "formal entrance steps and portal"], ["brick_detail", "Tégladíszítés", "decorative brick and stone facade pattern"], ["memorial_court", "Emlékudvar", "quiet memorial courtyard adjoining the building"], ["street_context", "Városi környezet", "historically coherent surrounding street"]]],
    ["eastern_temple", "Keleti templom", "ET", "Buddhist or Hindu temple complex with tradition-specific architecture and respectful context", [
      ["temple_gate", "Díszkapu", "ceremonial temple gateway"], ["prayer_court", "Szent udvar", "quiet ceremonial courtyard"], ["roof_layers", "Rétegzett tetők", "tradition-specific layered roof forms"], ["carved_columns", "Faragott oszlopok", "ornamental carved columns and stonework"], ["prayer_flags", "Textilelemek", "context-appropriate ceremonial textiles without visual clutter"], ["water_garden", "Vízkert", "calm temple water garden where regionally appropriate"]]],
    ["public_square", "Tér és főtér", "FT", "major civic square or historic main square with coherent surrounding architecture", [
      ["town_hall", "Városháza", "prominent town hall facade anchoring the square"], ["fountain", "Szökőkút", "public fountain integrated into the plaza"], ["statue", "Köztéri szobor", "figurative or abstract public sculpture"], ["monument", "Emlékmű", "civic memorial with respectful spatial setting"], ["paving_pattern", "Térburkolat", "large-scale stone paving pattern"], ["cafe_terrace", "Teraszok", "subtle cafe terraces without branding"]]],
    ["bridge", "Híd", "HÍ", "architecturally significant bridge in a realistic urban or regional setting", [
      ["bridge_structure", "Hídszerkezet", "clearly readable bridge structure and engineering rhythm"], ["river_below", "Folyó", "river or waterway beneath the bridge"], ["approach", "Hídfő", "architecturally coherent bridge approach"], ["pedestrian_walk", "Gyalogos sáv", "pedestrian walkway integrated into the bridge"], ["city_silhouette", "Városi sziluett", "city skyline beyond the bridge"], ["bridge_lighting", "Díszvilágítás", "subtle architectural bridge lighting"]]],
    ["residential_district", "Lakónegyed", "LN", "coherent residential district with realistic housing density, public space and everyday architectural detail", [
      ["apartment_blocks", "Lakóépületek", "coherent apartment or townhouse facades"], ["courtyard_green", "Belső zöldterület", "shared planted courtyard or neighborhood green"], ["local_street", "Lakóutca", "calm human-scale residential street"], ["playground", "Játszótér", "small neighborhood playground without branding"], ["corner_shop", "Helyi üzlet", "subtle ground-floor neighborhood services"], ["cycle_path", "Kerékpárút", "integrated neighborhood cycling route"]]],
    ["urban_ghetto", "Gettó és sűrű városrész", "GE", "densely inhabited disadvantaged urban quarter shown with documentary realism, human dignity and coherent lived-in architecture, without sensationalism", [
      ["dense_housing", "Sűrű beépítés", "closely packed residential buildings with believable urban scale"], ["narrow_street", "Keskeny utca", "narrow active street between weathered facades"], ["repair_layers", "Javítások nyomai", "visible layers of practical repair and material ageing"], ["shared_courtyard", "Közös udvar", "lived-in shared courtyard with everyday circulation"], ["small_shops", "Helyi üzletek", "small unbranded neighborhood shops"], ["utility_lines", "Közműhálózat", "realistic overhead utilities and service infrastructure"], ["community_space", "Közösségi tér", "modest neighborhood gathering place"], ["street_activity", "Utcai élet", "natural everyday pedestrian and community activity"]]],
    ["garden_suburb", "Kertváros", "KV", "quiet garden suburb with detached homes, mature planting and coherent low-density residential streets", [
      ["detached_houses", "Családi házak", "varied detached houses with coherent regional architecture"], ["front_gardens", "Előkertek", "maintained front gardens and low boundaries"], ["tree_lined_street", "Fasoros utca", "mature tree-lined residential street"], ["sidewalks", "Járdák", "continuous pedestrian sidewalks and driveways"], ["hedges", "Sövények", "soft garden hedges defining property edges"], ["small_park", "Kis park", "local pocket park integrated into the neighborhood"], ["bus_stop", "Megálló", "subtle unbranded suburban transit stop"], ["bicycle_route", "Kerékpáros út", "calm bicycle-friendly residential route"]]],
    ["old_town_core", "Óváros", "ÓV", "compact preserved old-town core with layered historic facades, narrow streets and authentic pedestrian scale", [
      ["historic_facades", "Történelmi homlokzatok", "layered period facades with authentic materials"], ["narrow_lanes", "Sikátorok", "narrow pedestrian lanes with irregular alignment"], ["stone_paving", "Kőburkolat", "worn stone paving with natural variation"], ["arched_passage", "Boltíves átjáró", "historic arched passage between buildings"], ["small_square", "Kis tér", "intimate old-town square"], ["upper_balconies", "Erkélyek", "period-compatible balconies and shutters"], ["courtyard_gate", "Udvari kapu", "open gateway revealing a historic courtyard"], ["roofscape", "Tetősziluett", "coherent tiled historic roofscape"]]],
    ["urban_park", "Városi park", "PA", "large designed urban park embedded in a believable city, with mature landscape architecture and public life", [
      ["mature_trees", "Idős fák", "mature park trees forming a layered canopy"], ["promenade", "Sétány", "broad pedestrian promenade through the park"], ["park_lawn", "Gyep", "open public lawn with natural wear"], ["pond", "Parktó", "landscaped pond with controlled edges"], ["pavilion", "Pavilon", "small civic park pavilion without branding"], ["benches", "Padok", "coherent park seating along paths"], ["flower_beds", "Virágágyások", "restrained seasonal planting beds"], ["city_edge", "Városi háttér", "urban architecture visible beyond the trees"]]],
    ["bazaar_market", "Bazár és piac", "BZ", "lively traditional bazaar or covered market with regionally coherent architecture and dense merchant spaces", [
      ["market_arcade", "Piaci árkád", "shaded market arcade with authentic materials"], ["merchant_stalls", "Árusok standjai", "dense unbranded merchant stalls"], ["textile_canopies", "Textilárnyékolók", "layered fabric canopies above the market"], ["spice_display", "Fűszeres pult", "colorful spice and dry-goods display"], ["craft_goods", "Kézműves áruk", "regionally appropriate handmade goods"], ["market_passage", "Piaci átjáró", "narrow pedestrian passage through the bazaar"]]],
    ["airport", "Repülőtér", "RP", "modern international airport exterior with believable terminal architecture and transport infrastructure", [
      ["terminal_facade", "Terminál", "large contemporary passenger terminal facade"], ["control_tower", "Irányítótorony", "airport control tower in plausible position"], ["apron", "Forgalmi előtér", "organized aircraft apron without airline branding"], ["jet_bridge", "Utasbeszállító híd", "passenger boarding bridges connected to the terminal"], ["service_road", "Szervizút", "marked airport service road"], ["runway_lights", "Pályafények", "subtle runway and taxiway lighting"]]],
    ["historic_station", "Történelmi vasútállomás", "TVÁ", "historic railway station exterior with preserved period architecture and active rail context", [
      ["station_hall", "Állomásépület", "grand historic station hall facade"], ["iron_canopy", "Vas perontető", "period iron and glass platform canopy"], ["platform_clock", "Állomási óra", "traditional station clock without readable branding"], ["rail_tracks", "Vágányok", "parallel railway tracks with realistic engineering"], ["stone_platform", "Kőperon", "aged stone passenger platform"], ["signal_box", "Jelzőtorony", "historic signal box or mechanical signal"]]],
    ["modern_station", "Modern pályaudvar", "MP", "contemporary railway station with large-span architecture, integrated platforms and clear passenger circulation", [
      ["glass_concourse", "Üvegcsarnok", "large glazed passenger concourse"], ["platform_roof", "Perontető", "modern long-span platform roof"], ["high_speed_track", "Vasúti pálya", "clean electrified railway tracks"], ["pedestrian_bridge", "Gyalogoshíd", "station footbridge connecting platforms"], ["transit_plaza", "Állomási tér", "urban arrival plaza outside the station"], ["wayfinding_forms", "Tájékoztató elemek", "non-readable architectural wayfinding structures"]]],
    ["port", "Kikötő", "KI", "working passenger or commercial port with realistic waterfront infrastructure and maritime scale", [
      ["quay", "Rakpart", "stone or concrete working quay"], ["harbor_cranes", "Kikötői daruk", "large harbor cranes in coherent scale"], ["terminal_shed", "Kikötői csarnok", "port terminal or warehouse building"], ["moored_vessels", "Kikötött hajók", "unbranded vessels moored along the waterfront"], ["breakwater", "Hullámtörő", "protective breakwater defining the harbor"], ["harbor_lights", "Kikötői fények", "functional maritime lighting"]]],
    ["industrial_district", "Ipari terület", "IP", "realistic industrial district with coherent production buildings, infrastructure and material weathering", [
      ["factory_hall", "Gyárcsarnok", "large functional production hall"], ["service_pipes", "Csővezetékek", "organized exterior industrial pipework"], ["loading_yard", "Rakodótér", "working loading yard without logos"], ["silos", "Silók", "industrial storage silos in realistic scale"], ["rail_siding", "Iparvágány", "freight rail siding integrated into the site"], ["utility_tower", "Műszaki torony", "industrial utility or cooling structure"]]],
    ["government_building", "Kormányzati épület", "KH", "formal government or civic administration building with dignified public architecture and secure urban setting", [
      ["ceremonial_entrance", "Díszbejárat", "formal civic entrance and broad steps"], ["civic_columns", "Oszlopsor", "monumental but coherent civic colonnade"], ["flag_poles", "Zászlórudak", "unmarked flagpoles without readable symbols"], ["public_forecourt", "Előtér", "open formal forecourt"], ["security_edges", "Biztonsági tér", "subtle integrated perimeter design"], ["administrative_wing", "Hivatali szárny", "secondary administrative building wing"]]],
    ["university_campus", "Egyetem", "EG", "university campus with coherent academic architecture, pedestrian spaces and a believable institutional setting", [
      ["main_building", "Főépület", "prominent university main building"], ["library_exterior", "Könyvtár", "academic library facade"], ["campus_walk", "Sétány", "tree-lined pedestrian campus route"], ["lecture_hall", "Előadóépület", "modern lecture-hall building"], ["courtyard_lawn", "Egyetemi udvar", "shared academic courtyard and lawn"], ["campus_bridge", "Összekötő híd", "architectural walkway connecting campus buildings"]]],
    ["stadium", "Stadion", "ST", "large sports stadium exterior with realistic structural rhythm, crowd circulation and urban context", [
      ["grandstand_shell", "Lelátószerkezet", "clearly readable stadium bowl exterior"], ["entrance_gates", "Bejáratok", "organized public entrance gates without branding"], ["roof_structure", "Tetőszerkezet", "large-span stadium roof"], ["concourse", "Körüljáró", "broad exterior spectator concourse"], ["floodlight_masts", "Fényárbócok", "stadium floodlight structures"], ["arrival_plaza", "Érkezési tér", "large pedestrian arrival plaza"]]],
    ["monument_memorial", "Emlékmű és szobor", "EM", "major public monument or memorial composition with respectful spatial design and coherent civic surroundings", [
      ["central_monument", "Központi emlékmű", "dominant sculptural memorial element"], ["memorial_wall", "Emlékfal", "architectural memorial wall without readable inscriptions"], ["processional_path", "Felvezető út", "formal pedestrian approach"], ["reflecting_pool", "Víztükör", "restrained reflecting pool"], ["ceremonial_steps", "Díszlépcső", "broad ceremonial stone steps"], ["memorial_grove", "Emlékliget", "quiet planted memorial grove"]]],
    ["egyptian_pyramids", "Piramisok és ókori Egyiptom", "PE", "ancient Egyptian pyramid complex in a geographically plausible desert archaeological landscape", [
      ["great_pyramid", "Nagy piramis", "monumental ancient stone pyramid"], ["temple_ruins", "Halotti templom", "archaeological temple remains near the pyramid"], ["causeway", "Felvezető út", "ancient ceremonial causeway"], ["weathered_blocks", "Kőtömbök", "weathered limestone blocks in the foreground"], ["desert_plateau", "Sivatagi fennsík", "dry rocky desert plateau"], ["excavation_edge", "Régészeti terület", "subtle protected excavation area without modern clutter"]]],
    ["greco_roman_ruins", "Görög–római romok", "GR", "ancient Greek or Roman archaeological site with historically coherent masonry, columns and landscape context", [
      ["classical_columns", "Oszlopcsarnok", "standing classical stone columns"], ["temple_pediment", "Templomrom", "fragmentary temple facade and pediment"], ["amphitheatre", "Amfiteátrum", "ancient theatre or amphitheatre remains"], ["mosaic_floor", "Mozaikpadló", "protected fragment of ancient mosaic pavement"], ["stone_road", "Kövezett út", "worn ancient stone street"], ["archaeological_wall", "Feltárt falak", "layered excavated masonry foundations"]]],
    ["great_wall_china", "Kínai nagy fal", "KN", "the Great Wall of China following a mountainous ridge, historically coherent masonry and watchtowers in its authentic landscape", [
      ["ridge_wall", "Hegyi falszakasz", "stone wall following the mountain ridge"], ["watchtower", "Őrtorony", "historic watchtower in believable scale"], ["stone_steps", "Kőlépcsők", "steep worn stone steps along the wall"], ["battlements_wall", "Mellvédek", "rhythmic defensive parapets"], ["mountain_layers", "Hegyláncok", "layered mountain ridges beyond the wall"], ["restored_section", "Helyreállított szakasz", "carefully restored masonry beside older surfaces"], ["wild_section", "Vad falszakasz", "weathered unrestored section integrated with vegetation"], ["gate_pass", "Hágókapu", "fortified gate controlling a mountain pass"]]],
    ["machu_picchu", "Machu Picchu", "MPH", "Machu Picchu archaeological sanctuary in the Peruvian Andes, precise Inca stonework, agricultural terraces and geographically authentic mountain setting", [
      ["inca_terraces", "Inka teraszok", "stepped agricultural terraces with stone retaining walls"], ["dry_stone_walls", "Inka falazat", "precisely fitted dry-stone masonry"], ["temple_sector", "Templomnegyed", "recognizable ceremonial stone structures"], ["mountain_peak", "Huayna Picchu", "steep Huayna Picchu peak in the background"], ["stone_steps_inca", "Kőlépcsők", "historic stone stairways between terraces"], ["grass_courts", "Füves terek", "maintained grassy courts within the ruins"], ["cloud_forest", "Felhőerdő", "humid Andean cloud-forest vegetation"], ["mountain_mist", "Hegyi pára", "light mountain mist preserving site visibility"]]],
    ["colosseum_rome", "Colosseum", "CO", "the Roman Colosseum in Rome shown with archaeologically and architecturally accurate scale, stone arches and urban context", [
      ["outer_arcades", "Külső árkádsor", "stacked monumental Roman arcades"], ["arena_bowl", "Arénatér", "interior amphitheatre bowl and seating structure"], ["hypogeum", "Hypogeum", "exposed underground service passages"], ["travertine", "Travertin kő", "weathered travertine masonry texture"], ["roman_paving", "Római burkolat", "stone pedestrian approach around the monument"], ["arch_detail", "Ívrészletek", "repeating classical arch proportions"], ["conservation", "Restaurált részek", "subtle conservation structures without clutter"], ["rome_context", "Római környezet", "coherent central Rome urban surroundings"]]],
    ["notre_dame_paris", "Notre-Dame", "ND", "Notre-Dame Cathedral in Paris with accurate French Gothic architecture and respectful Île de la Cité context", [
      ["west_facade", "Nyugati homlokzat", "recognizable twin-tower Gothic west facade"], ["rose_windows", "Rózsaablakok", "large traceried Gothic rose windows"], ["flying_buttresses", "Támpillérek", "structurally accurate flying buttresses"], ["gothic_portals", "Gótikus kapuk", "sculpted ceremonial entrance portals"], ["twin_towers_nd", "Ikertornyok", "balanced square bell towers"], ["seine_edge", "Szajna-part", "riverside context of the Île de la Cité"], ["cathedral_square", "Katedrális tér", "open public forecourt"], ["gargoyles", "Vízköpők", "restrained authentic Gothic roof sculpture"]]],
    ["eiffel_tower", "Eiffel-torony", "EF", "the Eiffel Tower in Paris with accurate iron lattice structure, monumental scale and coherent Champ de Mars urban landscape", [
      ["iron_lattice", "Vasszerkezet", "precise riveted iron lattice geometry"], ["tower_arch", "Alsó ív", "monumental curved base arch"], ["observation_levels", "Kilátószintek", "clearly readable observation platforms"], ["champ_de_mars", "Mars-mező", "formal lawns and axial paths"], ["trocadero_view", "Trocadéro nézet", "recognizable elevated Parisian viewpoint"], ["seine_context", "Szajna környezete", "river and bridge context near the tower"], ["paris_roofs", "Párizsi tetők", "coherent Paris roofscape beyond the landmark"], ["architectural_lighting", "Díszvilágítás", "restrained structural illumination without text"]]]
  ].map(([id, label, short, prompt, elements]) => ({ id, label, short, prompt, elements, phenology: "urban", temp: 0, light: 0.15, lensGroup: "dramatic", allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow"], outfit: "location-appropriate urban clothing and practical footwear" }));

  BUILT_ENVIRONMENT_PRESETS.forEach((preset) => preset.elements.push(
    ["foreground_material", "Előtér anyaga", "location-appropriate paving, ground and edge materials clearly visible in the foreground"],
    ["access_route", "Megközelítés", "believable entrance route, path or circulation connection leading into the location"],
    ["architectural_lighting_detail", "Építészeti világítás", "subtle location-appropriate exterior lighting fixtures without branding"],
    ["background_context", "Környezeti háttér", "coherent surrounding urban or regional context extending beyond the main subject"]
  ));

  const BUILT_ENVIRONMENT_CATEGORIES = [
    ["settlement", "Település", ["village", "historic_town", "modern_city", "public_square", "residential_district", "bazaar_market", "urban_ghetto", "garden_suburb", "old_town_core", "urban_park"]],
    ["transport", "Közlekedés", ["airport", "historic_station", "modern_station", "port", "bridge", "industrial_district"]],
    ["civic", "Középület", ["castle_exterior", "theatre_exterior", "government_building", "university_campus", "stadium", "monument_memorial"]],
    ["heritage", "Történelmi örökség", ["christian_church", "mosque_exterior", "synagogue_exterior", "eastern_temple", "egyptian_pyramids", "greco_roman_ruins", "great_wall_china", "machu_picchu", "colosseum_rome", "notre_dame_paris", "eiffel_tower"]]
  ].map(([id, label, presetIds]) => ({ id, label, presetIds }));

  Object.assign(BUILT_ENVIRONMENT_PRESETS.find((item) => item.id === "egyptian_pyramids"), {
    phenology: "sivatagi",
    temp: 8,
    allowedWeather: ["sun", "partly", "cloud", "storm"],
    outfit: "desert-appropriate breathable clothing, sun protection and practical closed footwear"
  });

  const INTERIOR_PRESETS = [
    ["modern_office_interior", "Modern irodaház", "IR", "interior of a contemporary office building with realistic professional architecture", [["glass_partitions", "Üvegfalak", "clean glass partitions with controlled reflections"], ["meeting_area", "Tárgyaló", "modern meeting area with coherent furniture"], ["workstations", "Munkaállomások", "orderly professional workstations without visible logos"], ["atrium", "Átrium", "multi-level office atrium with architectural depth"], ["stairs", "Lépcső", "sculptural internal staircase"], ["indoor_plants", "Beltéri növények", "restrained architectural indoor planting"]]],
    ["photo_studio", "Fotóstúdió", "FS", "professional photography studio interior with controllable production space", [["cyclorama", "Cikloráma", "seamless studio cyclorama"], ["softboxes", "Softboxok", "professional softboxes and light stands"], ["backdrops", "Hátterek", "rolled paper and textile backdrops"], ["camera_station", "Kameraállás", "camera and tethering station without branding"], ["flags", "Fényformálók", "flags, reflectors and diffusion frames"], ["makeup_corner", "Sminksarok", "organized makeup and preparation corner"]]],
    ["school_interior", "Iskola", "IS", "contemporary school interior with functional, age-appropriate educational architecture", [["classroom", "Tanterem", "bright classroom with orderly desks"], ["corridor", "Folyosó", "long school corridor with repeating doors"], ["library", "Könyvtár", "school library with accessible shelves"], ["laboratory", "Labor", "educational science laboratory without readable labels"], ["assembly_hall", "Aula", "large school assembly hall"], ["stairwell", "Lépcsőház", "functional school stairwell with daylight"]]],
    ["castle_interior", "Várbelső", "VB", "historic castle interior with authentic materials and layered architectural history", [["great_hall", "Lovagterem", "large historic great hall"], ["stone_corridor", "Kőfolyosó", "vaulted stone corridor"], ["spiral_stair", "Csigalépcső", "narrow historic spiral staircase"], ["tapestries", "Falikárpitok", "period-appropriate wall tapestries"], ["fireplace", "Kandalló", "monumental stone fireplace"], ["arched_windows", "Íves ablakok", "deep-set arched castle windows"]]],
    ["swimming_pool", "Uszoda", "US", "indoor swimming pool with humid air, reflective water and realistic sports architecture", [["competition_pool", "Versenymedence", "lane-marked competition pool"], ["pool_deck", "Medencetér", "non-slip pool deck with realistic wet reflections"], ["starting_blocks", "Rajtkövek", "competition starting blocks without branding"], ["spectator_seats", "Lelátó", "modest indoor spectator seating"], ["high_windows", "Magas ablakok", "high windows admitting diffused daylight"], ["steam_haze", "Párás levegő", "subtle humid atmospheric haze above warm water"]]],
    ["theatre_interior", "Színházbelső", "SB", "theatre or opera interior with stage, auditorium and ceremonial architectural detail", [["stage", "Színpad", "theatre stage with controlled production lighting"], ["auditorium", "Nézőtér", "tiered auditorium seating"], ["balconies", "Páholyok", "ornamented theatre balconies"], ["curtain", "Függöny", "heavy stage curtain with realistic textile folds"], ["foyer", "Előcsarnok", "formal theatre foyer"], ["backstage", "Kulisszák", "organized backstage wing and rigging context"]]],
    ["church_interior", "Templombelső", "TB", "Christian church interior with denomination-appropriate sacred architecture and respectful atmosphere", [["nave", "Hajó", "long church nave with rhythmic columns"], ["altar", "Oltártér", "respectfully framed altar or sanctuary"], ["stained_glass", "Üvegablakok", "colored stained-glass window light"], ["organ", "Orgona", "large pipe organ integrated into the architecture"], ["vaulting", "Boltozat", "historic vaulted ceiling"], ["pews", "Padsorok", "orderly rows of wooden pews"]]],
    ["mosque_interior", "Mecsetbelső", "MB", "mosque prayer-hall interior with respectful Islamic architectural detail", [["prayer_hall", "Imatér", "open carpeted prayer hall"], ["mihrab", "Mihráb", "architecturally integrated mihrab"], ["dome_interior", "Kupolabelső", "ornamented dome interior"], ["calligraphy", "Díszítő felületek", "non-readable decorative calligraphic and geometric surfaces"], ["screen_light", "Szűrt fény", "patterned daylight through architectural screens"], ["columns", "Oszlopsor", "rhythmic column structure"]]],
    ["synagogue_interior", "Zsinagógabelső", "ZB", "synagogue interior with respectful liturgical arrangement and historically coherent architecture", [["ark", "Tóraszekrény", "respectfully framed Torah ark"], ["bimah", "Bima", "central or frontal bimah according to tradition"], ["gallery", "Karzat", "architectural gallery level"], ["decorative_ceiling", "Díszmennyezet", "ornamented historic ceiling"], ["tall_windows", "Magas ablakok", "tall windows with soft daylight"], ["seating", "Padsorok", "orderly synagogue seating"]]],
    ["museum_gallery", "Múzeum és galéria", "MÚ", "museum or gallery interior with controlled exhibition architecture", [["white_gallery", "Kiállítótér", "clean gallery space with restrained walls"], ["display_cases", "Vitrinek", "museum display cases without readable labels"], ["sculpture_hall", "Szoborcsarnok", "spacious sculpture gallery"], ["museum_stairs", "Díszlépcső", "large museum staircase"], ["track_lighting", "Sínvilágítás", "controlled exhibition track lighting"], ["atrium_roof", "Üvegtető", "daylit museum atrium roof"]]],
    ["railway_carriage", "Vasúti kocsi", "VK", "interior of a realistic passenger railway carriage with coherent seating, circulation and travel atmosphere", [["seat_rows", "Üléssorok", "repeating passenger seats with realistic spacing"], ["carriage_aisle", "Közlekedő", "central aisle through the carriage"], ["train_windows", "Ablakok", "large railway windows with passing exterior context"], ["luggage_racks", "Csomagtartók", "overhead luggage racks without branding"], ["vestibule", "Előtér", "carriage vestibule and connecting doors"], ["table_bay", "Asztalos ülés", "facing seat bay with a small table"], ["handrails", "Kapaszkodók", "functional rails and handles"], ["carriage_lighting", "Kocsivilágítás", "integrated linear interior lighting"]]],
    ["aircraft_cabin", "Repülőgép", "RG", "interior of a modern passenger aircraft cabin with accurate proportions and unbranded aviation details", [["cabin_seats", "Üléssorok", "aligned aircraft passenger seating"], ["central_aisle", "Folyosó", "narrow central cabin aisle"], ["overhead_bins", "Csomagtartók", "closed overhead luggage bins"], ["aircraft_windows", "Repülőablakok", "small oval windows with exterior sky"], ["cabin_lights", "Kabinvilágítás", "soft integrated ceiling illumination"], ["galley", "Konyharész", "compact aircraft galley without branding"], ["bulkhead", "Válaszfal", "clean cabin bulkhead and door area"], ["seat_details", "Ülésrészletek", "believable belts, trays and upholstery"]]],
    ["pub_interior", "Kocsma", "KO", "lived-in traditional pub interior with warm materials, social atmosphere and no visible branding", [["wooden_bar", "Fa söntés", "worn wooden bar counter"], ["bar_stools", "Bárszékek", "mixed stools along the counter"], ["pub_tables", "Asztalok", "small sturdy social tables"], ["shelved_glassware", "Pohárpolc", "organized glassware without labels"], ["warm_lamps", "Meleg lámpák", "low warm practical lighting"], ["booth_seating", "Boxok", "cozy upholstered booth seating"], ["weathered_walls", "Patinás falak", "aged plaster or timber wall surfaces"], ["pub_corner", "Közösségi sarok", "natural gathering area for patrons"]]],
    ["coffeehouse_interior", "Kávéház", "KÁ", "elegant lived-in coffeehouse interior with believable service layout, seating and warm social atmosphere", [["coffee_counter", "Kávépult", "unbranded service counter and coffee equipment"], ["cafe_tables", "Kávéházi asztalok", "small tables arranged for conversation"], ["window_seats", "Ablak melletti helyek", "daylit seating beside tall windows"], ["display_case_cafe", "Süteményes vitrin", "restrained pastry display without text"], ["pendant_lights", "Függőlámpák", "warm pendant lighting"], ["banquette", "Fali ülőpad", "continuous upholstered banquette"], ["coat_area", "Ruhatár", "small practical coat area"], ["street_view", "Utcai kilátás", "coherent city street visible through windows"]]],
    ["car_driver_seat", "Autó vezetőülés", "AV", "realistic modern car interior photographed from the front cabin, driver position as the primary spatial context", [["driver_seat", "Vezetőülés", "ergonomic driver seat with realistic materials"], ["steering_wheel", "Kormány", "unbranded steering wheel and controls"], ["dashboard", "Műszerfal", "coherent dashboard without readable logos"], ["center_console", "Középkonzol", "functional center console and controls"], ["windshield_view", "Szélvédő", "exterior road context through the windshield"], ["side_mirror", "Oldaltükör", "side mirror integrated into the framing"], ["seatbelt", "Biztonsági öv", "naturally positioned safety belt"], ["cabin_light", "Utastérfény", "subtle daylight or practical cabin illumination"]]],
    ["art_gallery", "Képtár", "KP", "fine-art picture gallery interior with controlled museum lighting and respectfully displayed framed works without readable text", [["framed_art", "Festmények", "varied framed artworks presented without legible labels"], ["gallery_walls", "Kiállítófalak", "restrained gallery wall colors"], ["picture_lighting", "Képfények", "controlled directional artwork lighting"], ["gallery_bench", "Pad", "central viewing bench"], ["enfilade", "Teremsor", "aligned doorways revealing successive rooms"], ["parquet_floor", "Parketta", "quiet polished parquet flooring"], ["ornate_ceiling", "Díszmennyezet", "period-compatible gallery ceiling detail"], ["curatorial_spacing", "Képelrendezés", "balanced professional artwork spacing"]]],
    ["cinema_interior", "Mozi", "MO", "cinema interior with realistic auditorium geometry, screen, circulation and subdued practical lighting", [["cinema_screen", "Vászon", "large blank cinema screen without text"], ["seat_rows_cinema", "Nézőtéri ülések", "raked rows of upholstered cinema seats"], ["aisle_lights", "Folyosófények", "low safety lighting along the aisles"], ["projection_booth", "Vetítőfülke", "subtle projection booth opening"], ["acoustic_walls", "Akusztikai falak", "dark sound-treated wall surfaces"], ["cinema_foyer", "Mozi előcsarnok", "clean foyer without readable posters"], ["ticket_counter", "Jegypénztár", "unbranded ticket counter"], ["exit_passage", "Kijárati folyosó", "dim practical circulation passage"]]]
  ].map(([id, label, short, prompt, elements]) => ({ id, label, short, prompt, elements, phenology: "interior", temp: 0, light: 0, lensGroup: "confined", allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow", "fog"], outfit: "indoor-appropriate clothing suited to the function and formality of the location" }));

  INTERIOR_PRESETS.forEach((preset) => preset.elements.push(
    ["floor_surface", "Padlófelület", "function-appropriate floor material with natural wear and realistic reflections"],
    ["ceiling_structure", "Mennyezet", "architecturally coherent ceiling structure and integrated services"],
    ["doorway_depth", "Térkapcsolat", "doorway, passage or opening that gives the interior believable spatial depth"],
    ["functional_objects", "Használati tárgyak", "restrained function-specific objects arranged naturally without branding or readable text"]
  ));

  const INTERIOR_LIGHT_PICKERS = [
    { stateKey: "interiorLightSource", elementKey: "interiorLightSource", gridKey: "interiorLightSourceGrid", headingKey: "interiorLightSourceHeading", label: "Fő fényforrás", folder: "source", items: [["window", "Ablakon érkező természetes fény"], ["ceiling", "Mennyezeti általános világítás"], ["studio", "Stúdiófény / softbox"], ["practical", "Lámpák és praktikus fényforrások"], ["mixed", "Kevert természetes és mesterséges fény"]] },
    { stateKey: "interiorLightCharacter", elementKey: "interiorLightCharacter", gridKey: "interiorLightCharacterGrid", headingKey: "interiorLightCharacterHeading", label: "Fénykarakter", folder: "character", items: [["soft", "Lágy, szórt"], ["even", "Világos, egyenletes"], ["directional", "Határozott, irányított"], ["low_key", "Drámai, low-key"]] },
    { stateKey: "interiorColorTemperature", elementKey: "interiorColorTemperature", gridKey: "interiorColorTemperatureGrid", headingKey: "interiorColorTemperatureHeading", label: "Színhőmérséklet", folder: "temperature", items: [["daylight", "Nappali, 5600 K"], ["neutral", "Semleges, 4000 K"], ["warm", "Meleg, 3200 K"], ["mixed", "Kevert színhőmérséklet"]] },
    { stateKey: "interiorLightDirection", elementKey: "interiorLightDirection", gridKey: "interiorLightDirectionGrid", headingKey: "interiorLightDirectionHeading", label: "Ablak / főfény iránya", folder: "direction", items: [["side", "Oldalról"], ["front", "Szemből"], ["back", "Hátulról"], ["top", "Felülről"], ["none", "Nincs meghatározó ablakfény"]] }
  ];

  const byId = (id) => document.getElementById(id);
  const ENVIRONMENT_ENGLISH_LABELS = {
    castle_exterior: "Castle and fortress", theatre_exterior: "Theatre and opera house",
    christian_church: "Christian church", mosque_exterior: "Mosque", synagogue_exterior: "Synagogue",
    eastern_temple: "Eastern temple", urban_ghetto: "Dense urban quarter",
    monument_memorial: "Monument and memorial", egyptian_pyramids: "Pyramids and ancient Egypt",
    greco_roman_ruins: "Greco-Roman ruins", great_wall_china: "Great Wall of China",
    machu_picchu: "Machu Picchu", colosseum_rome: "Colosseum", notre_dame_paris: "Notre-Dame",
    eiffel_tower: "Eiffel Tower", historic_station: "Historic railway station",
    modern_station: "Modern railway station", government_building: "Government building",
    university_campus: "University campus", photo_studio: "Photo studio",
    castle_interior: "Castle interior", theatre_interior: "Theatre interior",
    church_interior: "Church interior", mosque_interior: "Mosque interior",
    synagogue_interior: "Synagogue interior", railway_carriage: "Railway carriage",
    aircraft_cabin: "Aircraft cabin", pub_interior: "Pub", coffeehouse_interior: "Coffeehouse",
    car_driver_seat: "Car driver's seat", cinema_interior: "Cinema",
    merchant_stalls: "Vendor stalls", textile_canopies: "Fabric canopies", spice_display: "Spice stall",
    craft_goods: "Handcrafted goods", foreground_material: "Foreground material",
    access_route: "Approach", architectural_lighting_detail: "Architectural lighting",
    background_context: "Environmental background", floor_surface: "Floor surface",
    ceiling_structure: "Ceiling", doorway_depth: "Spatial connection", functional_objects: "Functional objects"
  };
  const environmentDisplayLabel = (id, fallback) => {
    if (window.I18N?.language !== "en") return fallback;
    if (ENVIRONMENT_ENGLISH_LABELS[id]) return ENVIRONMENT_ENGLISH_LABELS[id];
    return String(id || fallback || "")
      .split("_")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };
  const elements = {
    dataStatus: byId("dataStatus"),
    compositionGrid: byId("compositionGrid"),
    modelThirdControl: byId("modelThirdControl"),
    modelThirdOptions: byId("modelThirdOptions"),
    faceBackgroundButtons: Array.from(document.querySelectorAll("[data-face-background]")),
    positionField: byId("positionField"),
    faceGroups: byId("faceGroups"),
    terrainGrid: byId("terrainGrid"),
    environmentElements: byId("environmentElements"),
    environmentModeTabs: byId("environmentModeTabs"),
    landscapeCategoryTabs: byId("landscapeCategoryTabs"),
    landscapeCategoryOptions: byId("landscapeCategoryOptions"),
    builtCategoryTabs: byId("builtCategoryTabs"),
    randomEnvironment: byId("randomEnvironment"),
    builtEnvironmentOptions: byId("builtEnvironmentOptions"),
    interiorLightingOptions: byId("interiorLightingOptions"),
    customLocation: byId("customLocation"),
    interiorLightSource: byId("interiorLightSource"),
    interiorLightCharacter: byId("interiorLightCharacter"),
    interiorColorTemperature: byId("interiorColorTemperature"),
    interiorLightDirection: byId("interiorLightDirection"),
    interiorLightSourceGrid: byId("interiorLightSourceGrid"),
    interiorLightCharacterGrid: byId("interiorLightCharacterGrid"),
    interiorColorTemperatureGrid: byId("interiorColorTemperatureGrid"),
    interiorLightDirectionGrid: byId("interiorLightDirectionGrid"),
    interiorLightSourceHeading: byId("interiorLightSourceHeading"),
    interiorLightCharacterHeading: byId("interiorLightCharacterHeading"),
    interiorColorTemperatureHeading: byId("interiorColorTemperatureHeading"),
    interiorLightDirectionHeading: byId("interiorLightDirectionHeading"),
    outdoorLightPanel: byId("outdoorLightPanel"),
    macroShot: byId("macroShot"),
    superteleShot: byId("superteleShot"),
    macroShotOption: byId("macroShotOption"),
    superteleShotOption: byId("superteleShotOption"),
    specialShotHint: byId("specialShotHint"),
    specialShotSubject: byId("specialShotSubject"),
    crowdPresenceOptions: byId("crowdPresenceOptions"),
    includeChildren: byId("includeChildren"),
    seasonSelect: byId("seasonSelect"),
    seasonGrid: byId("seasonGrid"),
    seasonHeading: byId("seasonHeading"),
    phaseSelect: byId("phaseSelect"),
    phaseCalendar: byId("phaseCalendar"),
    phaseHeading: byId("phaseHeading"),
    weatherSelect: byId("weatherSelect"),
    weatherGrid: byId("weatherGrid"),
    weatherHeading: byId("weatherHeading"),
    specialWeatherGrid: byId("specialWeatherGrid"),
    specialWeatherHeading: byId("specialWeatherHeading"),
    windPanel: byId("windPanel"),
    windGrid: byId("windGrid"),
    windHeading: byId("windHeading"),
    windDirectionPanel: byId("windDirectionPanel"),
    windDirectionGrid: byId("windDirectionGrid"),
    windDirectionHeading: byId("windDirectionHeading"),
    timeSlider: byId("timeSlider"),
    timePanel: byId("timePanel"),
    timeLabel: byId("timeLabel"),
    sunLabel: byId("sunLabel"),
    lightDirectionSelect: byId("lightDirectionSelect"),
    lightDirectionGrid: byId("lightDirectionGrid"),
    lightHeading: byId("lightHeading"),
    temperatureOffset: byId("temperatureOffset"),
    averageTemperatureLabel: byId("averageTemperatureLabel"),
    temperatureValue: byId("temperatureValue"),
    temperatureCorrectionLabel: byId("temperatureCorrectionLabel"),
    customOutfit: byId("customOutfit"),
    photoFields: byId("photoFields"),
    lensEffectGrid: byId("lensEffectGrid"),
    lensEffectCount: byId("lensEffectCount"),
    lensEffectDialog: byId("lensEffectDialog"),
    lensEffectDialogTitle: byId("lensEffectDialogTitle"),
    lensEffectDialogText: byId("lensEffectDialogText"),
    filmPreviewCanvas: byId("filmPreviewCanvas"),
    filmPreviewLeft: byId("filmPreviewLeft"),
    filmPreviewRight: byId("filmPreviewRight"),
    filmPreviewLabel: byId("filmPreviewLabel"),
    scenePreview: byId("scenePreview"),
    sceneImage: byId("sceneImage"),
    scenePlaceholder: byId("scenePlaceholder"),
    scenePlaceholderTitle: byId("scenePlaceholderTitle"),
    summaryGrid: byId("summaryGrid"),
    characterName: byId("characterName"),
    saveCharacter: byId("saveCharacter"),
    savedCharacterSelect: byId("savedCharacterSelect"),
    savedCharacterStatus: byId("savedCharacterStatus"),
    loadCharacter: byId("loadCharacter"),
    updateCharacter: byId("updateCharacter"),
    deleteCharacter: byId("deleteCharacter"),
    hairColorDialog: byId("hairColorDialog"),
    hairBaseColor: byId("hairBaseColor"),
    hairHighlightColor: byId("hairHighlightColor"),
    applyHairColors: byId("applyHairColors"),
    aiPortraitPromptBox: byId("aiPortraitPromptPanel"),
    aiPortraitPromptTitle: byId("aiPortraitPromptTitle"),
    aiPortraitPrompt: byId("aiPortraitPrompt"),
    aiPortraitPromptStats: byId("aiPortraitPromptStats"),
    copyAiPortraitPrompt: byId("copyAiPortraitPrompt"),
    pagePrompt: byId("pagePrompt"),
    fullPrompt: byId("fullPrompt"),
    landscapePhotoPrompt: byId("landscapePhotoPrompt"),
    landscapePhotoPromptTitle: byId("landscapePhotoPromptTitle"),
    promptStats: byId("promptStats"),
    fullPromptStats: byId("fullPromptStats"),
    landscapePhotoPromptStats: byId("landscapePhotoPromptStats"),
    copyPrompt: byId("copyPrompt"),
    copyFullPrompt: byId("copyFullPrompt"),
    copyLandscapePhotoPrompt: byId("copyLandscapePhotoPrompt"),
    exportLandscapePhotoTxt: byId("exportLandscapePhotoTxt"),
    exportLandscapePhotoPdf: byId("exportLandscapePhotoPdf"),
    exportPromptTxt: byId("exportPromptTxt"),
    exportPromptPdf: byId("exportPromptPdf"),
    toast: byId("toast")
  };

  let database = {};
  let toastTimer = 0;
  let state = mergeState(loadState());
  let historyData = loadHistoryData();
  let historyApplying = false;
  let historyTimer = 0;
  const faceImageGroupState = {};
  const acknowledgedRequiredPanels = new Set();
  let promptDiagnostics = { duplicates: 0, conflicts: 0 };

  function defaultState() {
    return {
      face: {},
      photo: { effects: [] },
      orientation: "Portré / álló (4:5)",
      modelThird: "center",
      faceBackground: "",
      environmentMode: "landscape",
      landscapeCategory: "mountain",
      builtCategory: "settlement",
      terrainId: "mid_mountain",
      environmentElementIds: [],
      customLocation: "",
      interiorLightSource: "window",
      interiorLightCharacter: "soft",
      interiorColorTemperature: "daylight",
      interiorLightDirection: "side",
      specialShotMode: "",
      specialShotSubject: "",
      seasonKey: "summer",
      phaseKey: "mid",
      weatherKey: "sun",
      windKey: "calm",
      windDirectionKey: "right_to_left",
      timeHour: 12,
      lightDirectionKey: "front",
      temperatureOffset: 0,
      customOutfit: "",
      crowdLevel: "contextual",
      includeChildren: false,
      lockedFields: {}
    };
  }

  function mergeState(value = {}) {
    const base = defaultState();
    return {
      ...base,
      ...value,
      face: {
        ...base.face,
        ...(value.face || {}),
        arcjegyek: compatibleFaceValues("arcjegyek", Array.isArray(value.face?.arcjegyek)
          ? value.face.arcjegyek
          : value.face?.arcjegyek ? [value.face.arcjegyek] : [])
      },
      photo: {
        ...base.photo,
        ...(value.photo || {}),
        effects: Array.isArray(value.photo?.effects)
          ? value.photo.effects.filter((key) => LENS_LIGHT_EFFECTS.some((effect) => effect.key === key)).slice(0, MAX_LENS_EFFECTS)
          : []
      },
      environmentElementIds: Array.isArray(value.environmentElementIds) ? value.environmentElementIds : base.environmentElementIds,
      lockedFields: value.lockedFields && typeof value.lockedFields === "object" ? { ...value.lockedFields } : {}
    };
  }

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
    } catch {
      return {};
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadHistoryData() {
    try {
      const stored = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || "{}");
      const entries = Array.isArray(stored.entries) ? stored.entries.filter((item) => typeof item === "string") : [];
      const trimmedEntries = entries.slice(-HISTORY_LIMIT);
      const removedCount = entries.length - trimmedEntries.length;
      const storedIndex = Number(stored.index ?? entries.length - 1) - removedCount;
      const index = Math.max(-1, Math.min(storedIndex, trimmedEntries.length - 1));
      return { entries: trimmedEntries, index };
    } catch {
      return { entries: [], index: -1 };
    }
  }

  function saveHistoryData() {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyData));
  }

  function historySnapshot() {
    return JSON.stringify(state);
  }

  function recordHistoryState() {
    if (historyApplying) return;
    const snapshot = historySnapshot();
    if (historyData.entries[historyData.index] === snapshot) return;
    if (historyData.index < historyData.entries.length - 1) historyData.entries = historyData.entries.slice(0, historyData.index + 1);
    historyData.entries.push(snapshot);
    if (historyData.entries.length > HISTORY_LIMIT) historyData.entries.shift();
    historyData.index = historyData.entries.length - 1;
    saveHistoryData();
  }

  function scheduleHistoryRecord() {
    if (historyApplying) return;
    clearTimeout(historyTimer);
    historyTimer = setTimeout(() => {
      historyTimer = 0;
      recordHistoryState();
      renderWorkflowTools();
    }, 320);
  }

  function flushHistoryRecord() {
    if (!historyTimer) return;
    clearTimeout(historyTimer);
    historyTimer = 0;
    recordHistoryState();
  }

  function restoreHistory(index) {
    if (!Number.isInteger(index) || index < 0 || index >= historyData.entries.length || index === historyData.index) return;
    const previousIndex = historyData.index;
    historyApplying = true;
    try {
      historyData.index = index;
      state = mergeState(JSON.parse(historyData.entries[index]));
      saveHistoryData();
      renderCurrentPage();
      updateAll({ save: true, history: false });
      showToast("Korábbi állapot betöltve");
    } catch {
      historyData.index = previousIndex;
      showToast("Az előzmény nem tölthető be");
    } finally {
      historyApplying = false;
    }
  }

  function undoHistory() {
    flushHistoryRecord();
    restoreHistory(historyData.index - 1);
  }

  function redoHistory() {
    restoreHistory(historyData.index + 1);
  }

  function isFieldLocked(key) {
    return Boolean(state.lockedFields?.[key]);
  }

  function toggleFieldLock(key) {
    state.lockedFields = { ...(state.lockedFields || {}), [key]: !isFieldLocked(key) };
    if (!state.lockedFields[key]) delete state.lockedFields[key];
    updateAll();
    showToast(isFieldLocked(key) ? "Mező zárolva" : "Zárolás feloldva");
  }

  function pageLockDefinitions() {
    if (PAGE === "face") return FACE_FIELDS.map(([key, label]) => ({ key: `face.${key}`, label }));
    if (PAGE === "environment") return [
      { key: "environment.terrain", label: "Helyszín" },
      { key: "environment.elements", label: "Helyszín részletei" },
      { key: "environment.specialShot", label: "Közeli fotó módja" },
      { key: "environment.crowd", label: "Emberi jelenlét" }
    ];
    if (PAGE === "weather") return [
      { key: "weather.season", label: "Évszak" },
      { key: "weather.phase", label: "Évszak szakasza" },
      { key: "weather.weather", label: "Időjárás" },
      { key: "weather.wind", label: "Szél és légmozgás" },
      { key: "weather.windDirection", label: "Szélirány" },
      { key: "weather.time", label: "Napszak" },
      { key: "weather.light", label: "Fényirány" },
      { key: "weather.temperature", label: "Hőérzet korrekció" },
      { key: "weather.outfit", label: "Egyéni öltözet" }
    ];
    if (PAGE === "photo") return PHOTO_FIELDS.map(([key, label]) => ({ key: `photo.${key}`, label }));
    return [];
  }

  function ensureWorkflowTools() {
    const main = document.querySelector("main.app-shell");
    if (!main || byId("workflowTools")) return;
    const section = document.createElement("section");
    section.className = "workflow-tools";
    section.id = "workflowTools";
    section.innerHTML = `
      <div class="history-controls" aria-label="Előzmények">
        <button class="workflow-button" type="button" data-history-action="undo" title="Előző állapot">← Vissza</button>
        <button class="workflow-button" type="button" data-history-action="redo" title="Következő állapot">Előre →</button>
        <select class="history-select" id="historySelect" aria-label="Korábbi állapot kiválasztása"></select>
        <span id="historyStatus">0 állapot</span>
      </div>
      <details class="workflow-details lock-manager">
        <summary><strong>Zárolások</strong><span id="lockCount">0</span></summary>
        <p class="workflow-help">A zárolt mezőket a véletlenszerű generálás nem módosítja. Kézzel továbbra is átállíthatók.</p>
        <div class="lock-grid" id="lockGrid"></div>
      </details>
      <details class="workflow-details consistency-manager">
        <summary><strong>Következetesség</strong><span id="consistencyCount">Ellenőrzés</span></summary>
        <p class="workflow-help">Élő ellenőrzés az arc, a környezet, az időjárás és a fotóbeállítások között.</p>
        <div class="consistency-list" id="consistencyList"></div>
      </details>`;
    main.prepend(section);
    section.addEventListener("click", (event) => {
      const historyButton = event.target.closest("[data-history-action]");
      if (historyButton?.dataset.historyAction === "undo") undoHistory();
      if (historyButton?.dataset.historyAction === "redo") redoHistory();
      const lockButton = event.target.closest("[data-lock-key]");
      if (lockButton) toggleFieldLock(lockButton.dataset.lockKey);
    });
    section.addEventListener("change", (event) => {
      if (event.target.id === "historySelect") {
        flushHistoryRecord();
        restoreHistory(Number(event.target.value));
      }
    });
  }

  function consistencyReport() {
    const items = [];
    const add = (type, title, detail) => items.push({ type, title, detail });
    const selectedElements = selectedEnvironmentElements();
    const temperature = automaticTemperatureC();
    const camera = computeCameraSettings();
    const terrainWeatherAllowed = new Set(allowedWeatherKeys());

    if (faceBackgroundConflictReason()) add("warning", "Háttérütközés", faceBackgroundConflictReason());
    if (!selectedElements.length) add("warning", "Hiányzó környezeti részlet", "Legalább egy helyszínrészlet kiválasztása ajánlott.");
    if (!terrainWeatherAllowed.has(state.weatherKey)) add("warning", "Nem kompatibilis időjárás", isFieldLocked("weather.weather")
      ? "A zárolt időjárás nem illik a jelenlegi helyszínhez vagy évszakhoz. Oldd fel a zárolást, vagy módosítsd a környezetet."
      : "A kiválasztott időjárás nem illik a jelenlegi helyszínhez vagy évszakhoz; a rendszer kompatibilis értékre cseréli.");
    const minimumWindKey = minimumWindKeyForWeather();
    const minimumWindIndex = WIND_LEVELS.findIndex((item) => item.key === minimumWindKey);
    const currentWindIndex = WIND_LEVELS.findIndex((item) => item.key === state.windKey);
    if (minimumWindIndex >= 0 && currentWindIndex < minimumWindIndex) add("warning", "Időjárás és légmozgás", "A kiválasztott légmozgás túl gyenge ehhez a légköri jelenséghez.");
    if (state.environmentMode === "interior" && state.specialShotMode === "supertele") add("warning", "Beltéri objektívütközés", "A szupertele mód beltérben nem használható, ezért automatikusan kikapcsol.");
    if (state.photo.objektiv && !allowedLensNamesForTerrain().has(state.photo.objektiv)) add("warning", "Objektívütközés", "A kiválasztott objektív nem illik a jelenlegi helyszínhez.");
    if (!state.photo.objektiv) add("info", "Automatikus objektívjavaslat", `A helyszínhez ajánlott tartományból választható objektív; számított expozíció: ${camera.prompt}.`);

    const outfitText = normalizePromptText(state.customOutfit);
    if (temperature >= 28 && /coat|jacket|warm layer|teli kabat|vastag kabat/.test(outfitText)) add("warning", "Öltözet és hőmérséklet", `${temperature > 0 ? "+" : ""}${temperature} °C mellett a megadott öltözet túl meleg lehet.`);
    if (temperature <= 0 && /shorts|t shirt|summer|rovidnadrag|polo/.test(outfitText)) add("warning", "Öltözet és hőmérséklet", `${temperature} °C mellett a megadott öltözet nem biztosít megfelelő hidegvédelmet.`);

    if (promptDiagnostics.conflicts) add("fixed", "Automatikus ütközésszűrés", `${promptDiagnostics.conflicts} ellentmondó promptrész kimaradt az összefűzött változatból.`);
    if (promptDiagnostics.duplicates) add("fixed", "Ismétlések összevonása", `${promptDiagnostics.duplicates} ismétlődő vagy azonos jelentésű rész összevonva.`);

    add("info", "Fizikai hőmérséklet-logika", `A jelenet számított hőmérséklete ${temperature > 0 ? "+" : ""}${temperature} °C; ez vezérli a testreakciót és az automatikus öltözetet.`);
    add("info", "Évszak és növényállapot", `${activeSeason().label}, ${PHASES[state.phaseKey]?.label || "közepe"}; a növényzet ehhez és a helyszín éghajlatához igazodik.`);
    if (!items.some((item) => item.type === "warning")) add("success", "Nincs aktív ellentmondás", "A jelenlegi arc, környezet, időjárás és fotóbeállítás együtt használható.");
    return items;
  }

  function renderWorkflowTools() {
    ensureWorkflowTools();
    const lockDefinitions = pageLockDefinitions();
    const lockGrid = byId("lockGrid");
    if (lockGrid) lockGrid.innerHTML = lockDefinitions.map(({ key, label }) => {
      const locked = isFieldLocked(key);
      return `<button class="lock-chip${locked ? " locked" : ""}" type="button" data-lock-key="${key}" aria-pressed="${locked}"><span aria-hidden="true">${locked ? "■" : "□"}</span>${label}</button>`;
    }).join("");
    const lockedCount = lockDefinitions.filter(({ key }) => isFieldLocked(key)).length;
    if (byId("lockCount")) byId("lockCount").textContent = `${lockedCount}/${lockDefinitions.length}`;

    const undo = document.querySelector('[data-history-action="undo"]');
    const redo = document.querySelector('[data-history-action="redo"]');
    if (undo) undo.disabled = historyData.index <= 0;
    if (redo) redo.disabled = historyData.index < 0 || historyData.index >= historyData.entries.length - 1;
    if (byId("historyStatus")) byId("historyStatus").textContent = historyData.entries.length
      ? `${historyData.index + 1}/${historyData.entries.length} állapot`
      : "0 állapot";
    const historySelect = byId("historySelect");
    if (historySelect) {
      historySelect.innerHTML = historyData.entries.map((entry, index) => `<option value="${index}">${index + 1}. állapot${index === historyData.entries.length - 1 ? " · legújabb" : ""}</option>`).join("");
      historySelect.disabled = historyData.entries.length < 2;
      if (historyData.index >= 0) historySelect.value = String(historyData.index);
    }

    const report = consistencyReport();
    const warnings = report.filter((item) => item.type === "warning").length;
    if (byId("consistencyCount")) byId("consistencyCount").textContent = warnings ? `${warnings} figyelmeztetés` : "Rendben";
    const list = byId("consistencyList");
    if (list) list.innerHTML = report.map((item) => `<article class="consistency-item ${item.type}"><i aria-hidden="true"></i><div><strong>${item.title}</strong><p>${item.detail}</p></div></article>`).join("");
  }

  function loadSavedCharacters() {
    try {
      const value = JSON.parse(localStorage.getItem(CHARACTER_STORAGE_KEY) || "[]");
      return Array.isArray(value)
        ? value.filter((item) => item && typeof item === "object" && item.face && typeof item.face === "object")
        : [];
    } catch {
      return [];
    }
  }

  function saveSavedCharacters(items) {
    localStorage.setItem(CHARACTER_STORAGE_KEY, JSON.stringify(items));
  }

  function characterId() {
    return window.crypto?.randomUUID ? window.crypto.randomUUID() : `character-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function faceSnapshot() {
    const snapshot = {};
    FACE_FIELDS.forEach(([key]) => {
      const value = state.face[key];
      if (Array.isArray(value)) {
        if (value.length) snapshot[key] = [...value];
      } else if (value) {
        snapshot[key] = value;
      }
    });
    if (state.face.hajszin === "Melírozott / többszínű") {
      snapshot.hajAlapszin = state.face.hajAlapszin || "#3b2416";
      snapshot.hajMelirszin = state.face.hajMelirszin || "#b55239";
    }
    return snapshot;
  }

  function defaultCharacterName() {
    return clean([state.face.altipus, state.face.eletkor, state.face.identitas].filter(Boolean).join(" ")) || "Karakter";
  }

  function characterSummary(character) {
    const face = character.face || {};
    const parts = [face.altipus, face.eletkor, face.identitas, face.bortonus, face.hajstilus].filter(Boolean);
    return parts.length ? parts.join(" · ") : "Nincs kitöltött arcmező";
  }

  function characterDateLabel(value) {
    const date = new Date(value || Date.now());
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("hu-HU", { dateStyle: "short", timeStyle: "short" });
  }

  function renderSavedCharacters() {
    if (!elements.savedCharacterSelect) return;
    const characters = loadSavedCharacters().sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)));
    const selectedId = elements.savedCharacterSelect.value;
    elements.savedCharacterSelect.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = characters.length ? "- Mentett karakter kiválasztása -" : "- Még nincs mentett karakter -";
    elements.savedCharacterSelect.appendChild(placeholder);
    characters.forEach((character) => {
      const option = document.createElement("option");
      option.value = character.id;
      option.textContent = `${character.name || "Névtelen karakter"} · ${characterDateLabel(character.updatedAt || character.createdAt)}`;
      elements.savedCharacterSelect.appendChild(option);
    });
    elements.savedCharacterSelect.value = characters.some((item) => item.id === selectedId) ? selectedId : "";
    updateSavedCharacterControls();
  }

  function selectedSavedCharacter() {
    const id = elements.savedCharacterSelect?.value;
    return id ? loadSavedCharacters().find((item) => item.id === id) : null;
  }

  function updateSavedCharacterControls() {
    const character = selectedSavedCharacter();
    [elements.loadCharacter, elements.updateCharacter, elements.deleteCharacter].forEach((button) => {
      if (button) button.disabled = !character;
    });
    if (elements.savedCharacterStatus) {
      elements.savedCharacterStatus.hidden = !character;
      elements.savedCharacterStatus.textContent = character
        ? `${character.orientation || "Képkivágás nélkül"} · ${characterSummary(character)}`
        : "";
    }
  }

  function saveCurrentCharacter() {
    readFaceControlsToState();
    const face = faceSnapshot();
    if (!Object.keys(face).length) {
      showToast("Még nincs menthető karakter");
      return;
    }
    const now = new Date().toISOString();
    const requestedName = clean(elements.characterName?.value) || defaultCharacterName();
    const characters = loadSavedCharacters();
    const character = {
      id: characterId(),
      name: requestedName,
      createdAt: now,
      updatedAt: now,
      orientation: state.orientation,
      modelThird: state.modelThird,
      faceBackground: state.faceBackground,
      face: JSON.parse(JSON.stringify(face)),
      prompt: generatedFacePrompt()
    };
    saveSavedCharacters([character, ...characters]);
    if (elements.characterName) elements.characterName.value = requestedName;
    renderSavedCharacters();
    elements.savedCharacterSelect.value = character.id;
    updateSavedCharacterControls();
    showToast("Karakter mentve");
  }

  function updateSavedCharacter() {
    const existing = selectedSavedCharacter();
    if (!existing) return;
    readFaceControlsToState();
    const updated = {
      ...existing,
      name: clean(elements.characterName?.value) || existing.name || defaultCharacterName(),
      updatedAt: new Date().toISOString(),
      orientation: state.orientation,
      modelThird: state.modelThird,
      faceBackground: state.faceBackground,
      face: JSON.parse(JSON.stringify(faceSnapshot())),
      prompt: generatedFacePrompt()
    };
    saveSavedCharacters(loadSavedCharacters().map((item) => item.id === existing.id ? updated : item));
    renderSavedCharacters();
    elements.savedCharacterSelect.value = updated.id;
    updateSavedCharacterControls();
    showToast("Karakter módosítva");
  }

  function loadSavedCharacter(id) {
    const character = loadSavedCharacters().find((item) => item.id === id);
    if (!character) {
      showToast("A karakter nem található");
      renderSavedCharacters();
      return;
    }
    state.orientation = character.orientation || defaultState().orientation;
    state.modelThird = character.modelThird || defaultState().modelThird;
    state.faceBackground = character.faceBackground || "";
    state.face = {};
    FACE_FIELDS.forEach(([key]) => {
      const value = character.face?.[key];
      state.face[key] = Array.isArray(value) ? [...value] : value || "";
    });
    state.face.hajAlapszin = character.face?.hajAlapszin || "#3b2416";
    state.face.hajMelirszin = character.face?.hajMelirszin || "#b55239";
    if (elements.characterName) elements.characterName.value = character.name || "";
    renderCompositionGrid();
    renderFaceBackgroundButtons();
    populateFaceControls();
    updateAll();
    renderSavedCharacters();
    elements.savedCharacterSelect.value = character.id;
    updateSavedCharacterControls();
    showToast("Karakter betöltve");
  }

  function deleteSavedCharacter(id) {
    const next = loadSavedCharacters().filter((item) => item.id !== id);
    saveSavedCharacters(next);
    renderSavedCharacters();
    showToast("Karakter törölve");
  }

  function clean(value) {
    return String(value ?? "").replace(/\s+/g, " ").trim();
  }

  function normalizePromptText(value) {
    return clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  const PROMPT_SEMANTIC_FAMILIES = [
    ["cinematic-lighting", /\bcinematic light(?:ing)?\b/i],
    ["film-look", /\b(?:analog|analogue|cinematic)?\s*film look\b/i],
    ["natural-atmosphere", /\bnatural atmosphere\b/i],
    ["realistic-environment", /\brealistic environment\b/i],
    ["shallow-depth", /\bshallow depth of field\b/i],
    ["portrait-photo", /\bportrait photography\b/i],
    ["thermal-response", /\b(?:visible condensed breath|cool-weather body response|cool skin tone|mild warmth|visible but realistic perspiration|realistic heat stress|extreme heat response)\b/i],
    ["weather-outfit", /\bweather-appropriate (?:rain|winter|layered transitional|lightweight summer|outdoor) clothing\b/i]
  ];

  function promptClauseConflict(clause) {
    const text = clause.toLowerCase();
    const normalized = normalizePromptText(clause);
    const elevation = sunElevation();
    const temperature = automaticTemperatureC();
    const weather = state.weatherKey;
    const season = state.seasonKey;

    if (state.orientation.startsWith("Portré") && /landscape orientation|horizontal 16:9|wide aspect ratio/.test(text)) return true;
    if (state.orientation.startsWith("Tájkép") && /portrait orientation|vertical 4:5/.test(text)) return true;

    if (elevation < 0 && /bright daylight|direct sunlight|direct noon sunlight|high midday sun|strong high sun|clear facial shadow logic/.test(text)) return true;
    if (elevation >= 0 && /very low night exposure|natural starlight|full moonlight|dark night sky/.test(text)) return true;

    if (weather !== "sun" && /^clear weather\b/.test(text)) return true;
    if (weather !== "partly" && /^partly cloudy weather\b/.test(text)) return true;
    if (weather !== "cloud" && /^overcast weather\b/.test(text)) return true;
    if (!["rain", "storm"].includes(weather) && /\b(?:rainy weather|heavy rain|wet hair strands|water droplets on skin|damp fabric|waterproof outer layer)\b/.test(text)) return true;
    if (weather !== "storm" && /\b(?:stormy weather|thunderstorm|lightning flash)\b/.test(text)) return true;
    if (weather !== "snow" && /\b(?:snowfall|snow-reflected ambient light|bright ground bounce)\b/.test(text)) return true;

    if (season !== "spring" && /\bspring season\b/.test(text)) return true;
    if (season !== "summer" && /\bsummer season\b/.test(text)) return true;
    if (season !== "autumn" && /\bautumn season\b/.test(text)) return true;
    if (season !== "winter" && /\bwinter season\b/.test(text)) return true;

    if (temperature > 0 && /\b(?:visible condensed breath|freezing temperature|against freezing|freezing air|frosted breath)\b/.test(text)) return true;
    if (temperature <= 18 && /\b(?:extreme heat response|realistic heat stress|heat shimmer|stronger perspiration|visible but realistic perspiration|dehydration signs)\b/.test(text)) return true;
    if (temperature >= 28 && /\b(?:cool-weather body response|chilly air|against cold|winter clothing|insulated coat|warm layers|gloves where visible)\b/.test(text)) return true;
    if (temperature <= 0 && /\b(?:lightweight summer clothing|breathable fabrics|heat-adapted styling)\b/.test(text)) return true;

    if (["cloud", "rain", "storm"].includes(weather) && /\b(?:hard crisp shadows|strong high sun|high-contrast shadows|clear facial shadow logic)\b/.test(text)) return true;
    if (/\bbaby-smooth\b|\bhigh micro-detail\b/.test(text)) return true;
    if (/summer-green canopy|green leaf bounce|soft green reflections/.test(normalized) && season === "winter") return true;

    return false;
  }

  function sanitizePrompt(parts, track = false) {
    const clauses = (Array.isArray(parts) ? parts : [parts])
      .flat(Infinity)
      .flatMap((part) => clean(part).split(/\s*,\s*/))
      .map((part) => clean(part).replace(/^[,.;]+|[,.;]+$/g, ""))
      .filter(Boolean);
    const kept = [];
    const exact = new Set();
    const familyIndex = new Map();
    let duplicates = 0;
    let conflicts = 0;

    clauses.forEach((clause) => {
      if (promptClauseConflict(clause)) {
        conflicts += 1;
        return;
      }
      const canonical = normalizePromptText(clause).replace(/[^a-z0-9]+/g, " ").trim();
      if (!canonical || exact.has(canonical)) {
        duplicates += 1;
        return;
      }
      const family = PROMPT_SEMANTIC_FAMILIES.find(([, pattern]) => pattern.test(clause))?.[0];
      if (family && familyIndex.has(family)) {
        const previousIndex = familyIndex.get(family);
        if (clause.length > kept[previousIndex].length) kept[previousIndex] = clause;
        duplicates += 1;
        exact.add(canonical);
        return;
      }
      if (family) familyIndex.set(family, kept.length);
      exact.add(canonical);
      kept.push(clause);
    });

    if (track) promptDiagnostics = { duplicates, conflicts };
    return kept.join(", ");
  }

  function environmentPresets(mode = state.environmentMode) {
    if (mode === "landscape") {
      const category = LANDSCAPE_CATEGORIES.find((item) => item.id === state.landscapeCategory) || LANDSCAPE_CATEGORIES[0];
      return category.presetIds.map((id) => TERRAIN_PRESETS.find((item) => item.id === id)).filter(Boolean);
    }
    if (mode === "built") {
      const category = BUILT_ENVIRONMENT_CATEGORIES.find((item) => item.id === state.builtCategory) || BUILT_ENVIRONMENT_CATEGORIES[0];
      return category.presetIds.map((id) => BUILT_ENVIRONMENT_PRESETS.find((item) => item.id === id)).filter(Boolean);
    }
    if (mode === "interior") return INTERIOR_PRESETS;
    return TERRAIN_PRESETS;
  }

  function terrain() {
    const presets = environmentPresets();
    return presets.find((item) => item.id === state.terrainId) || presets[0];
  }

  function ensureEnvironmentElements() {
    const current = terrain();
    const available = new Set(current.elements.map(([id]) => id));
    const seen = new Set();
    state.environmentElementIds = state.environmentElementIds.filter((id) => {
      if (!available.has(id) || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    if (state.environmentElementIds.length > ENVIRONMENT_ELEMENT_MAX) {
      state.environmentElementIds = state.environmentElementIds.slice(0, ENVIRONMENT_ELEMENT_MAX);
    }
    if (state.environmentElementIds.length < ENVIRONMENT_ELEMENT_MIN) {
      const selected = new Set(state.environmentElementIds);
      current.elements.forEach(([id]) => {
        if (selected.size < ENVIRONMENT_ELEMENT_MAX) selected.add(id);
      });
      state.environmentElementIds = Array.from(selected);
    }
  }

  function selectedEnvironmentElements() {
    ensureEnvironmentElements();
    const selected = new Set(state.environmentElementIds);
    return terrain().elements.filter(([id]) => selected.has(id));
  }

  function seasonRows() {
    return database.tbl_evszak?.length ? database.tbl_evszak : FALLBACK_SEASONS;
  }

  function weatherRows() {
    const rows = database.tbl_idojaras?.length ? database.tbl_idojaras : FALLBACK_WEATHER;
    return rows.slice().sort((a, b) => WEATHER_ORDER.indexOf(a.weather_key) - WEATHER_ORDER.indexOf(b.weather_key));
  }

  function activeSeason() {
    return seasonRows().find((row) => row.season_key === state.seasonKey) || seasonRows()[1] || FALLBACK_SEASONS[1];
  }

  function activeWeather() {
    return weatherRows().find((row) => row.weather_key === state.weatherKey) || weatherRows()[0] || FALLBACK_WEATHER[0];
  }

  function minimumWindKeyForWeather(weatherKey = state.weatherKey) {
    return ({ sandstorm: "gale", tornado: "hurricane", dust_devil: "moderate", waterspout: "strong", blowing_snow: "strong" })[weatherKey] || "";
  }

  function normalizeWindForWeather() {
    if (!WIND_LEVELS.some((item) => item.key === state.windKey)) state.windKey = "calm";
    const minimumKey = minimumWindKeyForWeather();
    const minimumIndex = WIND_LEVELS.findIndex((item) => item.key === minimumKey);
    const currentIndex = WIND_LEVELS.findIndex((item) => item.key === state.windKey);
    if (state.windKey && minimumIndex >= 0 && currentIndex < minimumIndex && !isFieldLocked("weather.wind")) state.windKey = minimumKey;
  }

  function activeWind() {
    normalizeWindForWeather();
    return WIND_LEVELS.find((item) => item.key === state.windKey) || WIND_LEVELS[0];
  }

  function activeWindDirection() {
    if (state.windDirectionKey && !WIND_DIRECTIONS.some((item) => item.key === state.windDirectionKey)) state.windDirectionKey = "right_to_left";
    return WIND_DIRECTIONS.find((item) => item.key === state.windDirectionKey) || WIND_DIRECTIONS[1];
  }

  function windDirectionPrompt() {
    return state.windKey === "calm" ? "" : activeWindDirection().prompt;
  }

  function crowdPresencePrompt({ standalone = false } = {}) {
    const level = CROWD_LEVELS.some((item) => item.key === state.crowdLevel) ? state.crowdLevel : "contextual";
    const locationPopulation = LOCATION_POPULATION_PROMPTS[state.terrainId] || "population composition inferred from the selected geographic location, architecture and setting";
    const localPopulation = `${standalone ? "all visible people" : "all background people other than the explicitly selected primary model"} are demographically, culturally and historically plausible for the selected location; ${locationPopulation}; locally credible appearance, age distribution, clothing and everyday behavior, natural individual variation, no stereotypes or tokenistic casting${standalone ? "" : ", do not alter the explicitly selected primary model's identity"}`;
    const children = state.includeChildren && !["contextual", "alone"].includes(level)
      ? "adults and children both present as natural secondary figures, locally plausible age mix, age-appropriate everyday activity, children remain incidental and fully clothed"
      : "";
    const anatomicalIntegrity = "every visible person has one coherent anatomically correct body with a single head, one torso, two arms, two hands, two legs and two feet, natural joint articulation and believable weight-bearing posture; no fused or intersecting bodies, no merged limbs, no duplicated people or faces, no extra or missing limbs, hands, fingers or facial features, no disembodied body parts";
    const backgroundSafety = "secondary people remain smaller midground or distant-background figures with natural spacing and clear silhouettes; use believable partial occlusion only, keep background faces and hands below close-up detail scale, and avoid large edge-cropped bystanders near the camera";
    if (level === "contextual") return standalone ? "no people, no human subject, no model" : "";
    if (standalone) {
      if (level === "alone") return sanitizePrompt(["one anonymous location-appropriate person as a natural environmental figure, no designated model and no portrait-style subject emphasis", localPopulation, anatomicalIntegrity]);
      if (level === "small_group") return sanitizePrompt(["two to five anonymous people as secondary environmental figures, natural interaction, no designated primary person", localPopulation, children, anatomicalIntegrity, backgroundSafety]);
      if (level === "community") return sanitizePrompt(["several anonymous people forming believable community activity, varied faces, poses and clothing, no duplicated people, no designated primary person", localPopulation, children, anatomicalIntegrity, backgroundSafety]);
      if (level === "crowd") return sanitizePrompt(["a moderately dense realistic crowd distributed across the midground and distant background as part of the environment, varied human activity, distinct non-duplicated people at coherent scale, no designated primary person", localPopulation, children, anatomicalIntegrity, backgroundSafety]);
    }
    if (level === "alone") return sanitizePrompt(["the selected model is the only visible person, no background people", anatomicalIntegrity]);
    if (level === "small_group") return sanitizePrompt(["the selected model is naturally accompanied by a small group of two to five distinct people, believable interaction, the selected model remains clearly identifiable as the primary subject", localPopulation, children, anatomicalIntegrity, backgroundSafety]);
    if (level === "community") return sanitizePrompt(["the selected model is naturally embedded in a visible community, several distinct people interacting believably around the model, varied faces, poses and clothing, no duplicated people, the selected model remains the primary subject", localPopulation, children, anatomicalIntegrity, backgroundSafety]);
    if (level === "crowd") return sanitizePrompt(["the selected model remains isolated and visually readable in the foreground while a moderately dense realistic crowd is distributed across the midground and distant background, varied human activity, distinct non-duplicated people at coherent scale", localPopulation, children, anatomicalIntegrity, backgroundSafety]);
    return "";
  }

  function lightDirectionRows() {
    return database.tbl_fenyirany?.length ? database.tbl_fenyirany : [
      { direction_key: "front", label: "Szemből", prompt: "soft frontal light, evenly illuminated face", exposure_compensation: 0 },
      { direction_key: "front_left", label: "Bal 45°", prompt: "three-quarter key light from camera-left, sculpted facial depth", exposure_compensation: 0.3 },
      { direction_key: "front_right", label: "Jobb 45°", prompt: "three-quarter key light from camera-right, sculpted facial depth", exposure_compensation: 0.3 },
      { direction_key: "side", label: "Oldalfény", prompt: "side light creating split facial illumination", exposure_compensation: 0.7 },
      { direction_key: "back", label: "Hátulról", prompt: "backlight with rim light, face naturally falling into shadow", exposure_compensation: 1.5 },
      { direction_key: "top", label: "Felülről", prompt: "top light with defined eye-socket, nose and chin shadows", exposure_compensation: 0.5 }
    ];
  }

  function activeDirection() {
    return lightDirectionRows().find((row) => row.direction_key === state.lightDirectionKey) || lightDirectionRows()[0];
  }

  function standaloneEnvironmentLightDirectionPrompt() {
    return ({
      front: "soft environmental light arriving from behind the camera, even illumination across the terrain",
      front_left: "directional environmental light from camera-left, natural depth across landforms and architecture",
      front_right: "directional environmental light from camera-right, natural depth across landforms and architecture",
      side: "side light revealing terrain relief, architectural form and material texture",
      back: "environmental backlight with controlled rim separation on landscape and architectural edges",
      top: "high overhead environmental light with physically plausible ground and structural shadows"
    })[state.lightDirectionKey] || "soft environmental light arriving from behind the camera";
  }

  function faceSelect(key) {
    return byId(`face-${key}`);
  }

  function faceImagePicker(key) {
    return byId(`face-images-${key}`);
  }

  function faceImagePanel(key) {
    return byId(`face-image-panel-${key}`);
  }

  function faceImageSummary(key) {
    return byId(`face-image-summary-${key}`);
  }

  function photoSelect(key) {
    return byId(`photo-${key}`);
  }

  function faceValue(key) {
    if (MULTI_FACE_KEYS.has(key)) return Array.isArray(state.face[key]) ? state.face[key] : [];
    const select = faceSelect(key);
    return select ? select.value : (state.face[key] || "");
  }

  function photoValue(key) {
    const select = photoSelect(key);
    return select ? select.value : (state.photo[key] || "");
  }

  function findRow(field, value) {
    if (!value) return null;
    const [, , table, valueKey] = field;
    return (database[table] || []).find((row) => String(row[valueKey]) === String(value)) || null;
  }

  function optionLabel(field, row, type = "face") {
    const [key, , , valueKey, labelKey] = field;
    if (type === "face") return clean(row[valueKey]);
    if (key === "film") return clean(row.filmtipus_id);
    if (key === "objektiv") return clean(row.objektiv);
    if (key === "stilus") return clean(row.stilus);
    return clean(row[labelKey] || row[valueKey]);
  }

  function orderedFaceRows(field, rows) {
    const [key, , , valueKey] = field;
    const order = FACE_IMAGE_ASSETS[key]?.order;
    if (!order?.length) return rows;
    const rank = new Map(order.map((value, index) => [value, index]));
    return [...rows].sort((a, b) => {
      const aRank = rank.get(String(a[valueKey])) ?? Number.MAX_SAFE_INTEGER;
      const bRank = rank.get(String(b[valueKey])) ?? Number.MAX_SAFE_INTEGER;
      return aRank - bRank;
    });
  }

  function groupedSelectRows(field, rows) {
    const [key, , , valueKey] = field;
    const groups = FACE_SELECT_GROUPS[key];
    if (!groups?.length) return null;
    const rowByValue = new Map(rows.map((row) => [String(row[valueKey]), row]));
    const used = new Set();
    const grouped = groups.map((group) => {
      const groupRows = group.values
        .map((value) => rowByValue.get(value))
        .filter(Boolean);
      groupRows.forEach((row) => used.add(String(row[valueKey])));
      return { label: group.label, image: group.image, images: group.images, rows: groupRows };
    }).filter((group) => group.rows.length);
    const ungrouped = rows.filter((row) => !used.has(String(row[valueKey])));
    if (ungrouped.length) grouped.push({ label: "Egyéb", rows: ungrouped });
    return grouped;
  }

  function appendSelectOption(parent, field, row, type) {
    const [key, , , valueKey] = field;
    const option = document.createElement("option");
    option.value = String(row[valueKey]);
    option.textContent = optionLabel(field, row, type);
    option.title = option.textContent;
    if (type === "photo" && key === "film") option.dataset.i18nSkip = "";
    parent.appendChild(option);
  }

  function populateSelect(select, field, rows, selectedValue = "", type = "face") {
    if (!select) return;
    const [key, label, , valueKey] = field;
    const rowsForControl = type === "face" && FACE_IMAGE_ASSETS[key]
      ? rows.filter((row) => faceImageFile(field, row))
      : rows;
    const orderedRows = type === "face" ? orderedFaceRows(field, rowsForControl) : rowsForControl;
    const isMulti = type === "face" && MULTI_FACE_KEYS.has(key);
    select.multiple = isMulti;
    select.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = `- ${label} választása -`;
    if (!isMulti) select.appendChild(placeholder);
    const groupedRows = type === "face" ? groupedSelectRows(field, orderedRows) : null;
    if (groupedRows) {
      groupedRows.forEach((group) => {
        const optgroup = document.createElement("optgroup");
        optgroup.label = group.label;
        group.rows.forEach((row) => appendSelectOption(optgroup, field, row, type));
        select.appendChild(optgroup);
      });
    } else {
      orderedRows.forEach((row) => appendSelectOption(select, field, row, type));
    }
    select.disabled = orderedRows.length === 0;
    if (isMulti) {
      const selectedValues = new Set(Array.isArray(selectedValue) ? selectedValue.map(String) : selectedValue ? [String(selectedValue)] : []);
      Array.from(select.options).forEach((option) => { option.selected = selectedValues.has(option.value); });
    } else {
      select.value = Array.from(select.options).some((option) => option.value === String(selectedValue)) ? String(selectedValue) : "";
    }
    if (type === "face") renderFaceImagePicker(field, orderedRows);
  }

  function selectHasValue(select, value) {
    return Boolean(select && Array.from(select.options).some((option) => option.value === String(value)));
  }

  function faceImageFile(field, row) {
    const [key, , , valueKey] = field;
    const config = FACE_IMAGE_ASSETS[key];
    if (!config) return "";
    const value = String(row[valueKey]);
    if (config.generatedFiles) {
      const fileSlug = value.normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\u00ad/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      if (config.versionedGeneratedFiles?.[fileSlug]) return config.versionedGeneratedFiles[fileSlug];
      return `${key}_${fileSlug}.png`;
    }
    return config.files[value] || "";
  }

  function createFaceImageButton(field, row) {
    const [key, , , valueKey] = field;
    const config = FACE_IMAGE_ASSETS[key];
    const file = faceImageFile(field, row);
    if (!config || !file) return null;
    const value = String(row[valueKey]);
    const button = document.createElement("button");
    button.className = "face-image-button";
    button.type = "button";
    button.dataset.faceImageKey = key;
    button.dataset.faceImageValue = value;
    button.dataset.faceImageRatio = config.aspectRatio || "portrait";
    button.setAttribute("aria-label", value);
    button.title = value;
    button.setAttribute("aria-pressed", "false");

    const image = document.createElement("img");
    image.src = `assets/${config.folder}/${file}`;
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    image.loading = "lazy";

    const caption = document.createElement("span");
    caption.className = "visual-card-label";
    const captionText = document.createElement("strong");
    const shortLabels = FACE_CARD_SHORT_LABELS[key];
    const orderIndex = config.order?.indexOf(value) ?? -1;
    const shortLabel = (Array.isArray(shortLabels) ? shortLabels?.[orderIndex] : shortLabels?.[value])?.[0];
    captionText.textContent = shortLabel || value;
    if (key === "hajszin" && shortLabel) {
      button.title = shortLabel;
      button.setAttribute("aria-label", shortLabel);
    }
    caption.appendChild(captionText);

    button.appendChild(image);
    button.appendChild(caption);
    return button;
  }

  function faceImageGroupFiles(group) {
    return group.images || (group.image ? [group.image] : []);
  }

  function createFaceImageGroupButton(key, group, active) {
    const button = document.createElement("button");
    button.className = "face-image-group-button";
    button.type = "button";
    button.dataset.faceImageGroupKey = key;
    button.dataset.faceImageGroupLabel = group.label;
    button.title = group.label;
    button.setAttribute("aria-label", group.label);
    button.setAttribute("aria-pressed", active ? "true" : "false");
    if (active) button.classList.add("selected");

    const imageFiles = faceImageGroupFiles(group);
    if (imageFiles.length) {
      const imageWrap = document.createElement("div");
      imageWrap.className = "face-image-group-maps";
      imageFiles.forEach((file) => {
        const image = document.createElement("img");
        image.src = `assets/continents/${file}`;
        image.alt = "";
        image.setAttribute("aria-hidden", "true");
        image.loading = "lazy";
        imageWrap.appendChild(image);
      });
      button.appendChild(imageWrap);
    }

    return button;
  }

  function createFaceImageGroupTabs(key, groupedRows, activeGroup) {
    const tabs = document.createElement("div");
    tabs.className = "face-image-group-tabs";
    groupedRows.forEach((group) => {
      tabs.appendChild(createFaceImageGroupButton(key, group, group.label === activeGroup.label));
    });
    return tabs;
  }

  function activeFaceImageGroup(field, groupedRows) {
    const [key, , , valueKey] = field;
    const stored = groupedRows.find((group) => group.label === faceImageGroupState[key]);
    if (stored) return stored;
    const selectedValue = faceValue(key) || state.face[key] || "";
    const selectedGroup = groupedRows.find((group) => group.rows.some((row) => String(row[valueKey]) === String(selectedValue)));
    const activeGroup = selectedGroup || groupedRows[0];
    if (activeGroup) faceImageGroupState[key] = activeGroup.label;
    return activeGroup;
  }

  function rowsFromSelectOptions(field, select) {
    return Array.from(select?.options || [])
      .map((option) => findRow(field, option.value))
      .filter(Boolean);
  }

  function syncFaceImageGroupFromValue(field, select) {
    const [key, , , valueKey] = field;
    const rows = orderedFaceRows(field, rowsFromSelectOptions(field, select));
    const groupedRows = groupedSelectRows(field, rows);
    const selectedGroup = groupedRows?.find((group) => group.rows.some((row) => String(row[valueKey]) === String(select.value)));
    if (selectedGroup) faceImageGroupState[key] = selectedGroup.label;
    renderFaceImagePicker(field, rows);
  }

  function renderFaceImagePicker(field, rows) {
    const [key] = field;
    const config = FACE_IMAGE_ASSETS[key];
    const picker = faceImagePicker(key);
    if (!config || !picker) return;
    picker.innerHTML = "";
    const appendImageButton = (parent, row) => {
      const button = createFaceImageButton(field, row);
      if (button) parent.appendChild(button);
    };
    const groupedRows = groupedSelectRows(field, rows);
    picker.classList.toggle("has-group-tabs", Boolean(groupedRows));
    if (groupedRows) {
      const activeGroup = activeFaceImageGroup(field, groupedRows);
      picker.appendChild(createFaceImageGroupTabs(key, groupedRows, activeGroup));
      const cardGrid = document.createElement("div");
      cardGrid.className = "face-image-card-grid";
      activeGroup.rows.forEach((row) => appendImageButton(cardGrid, row));
      picker.appendChild(cardGrid);
    } else {
      rows.forEach((row) => appendImageButton(picker, row));
    }
    const itemCount = picker.querySelectorAll(".face-image-button").length;
    picker.dataset.itemCount = String(itemCount);
    picker.hidden = itemCount === 0;
    syncFaceImagePickerState(key);
  }

  function syncFaceImagePickerState(key) {
    const select = faceSelect(key);
    const picker = faceImagePicker(key);
    if (!select || !picker) return;
    const disabled = select.disabled;
    const panel = faceImagePanel(key);
    const summary = faceImageSummary(key);
    const labelText = summary?.dataset.label || "";
    const selectedValues = MULTI_FACE_KEYS.has(key)
      ? new Set(Array.isArray(state.face[key]) ? state.face[key].map(String) : [])
      : new Set(select.value ? [select.value] : []);
    if (panel) {
      panel.classList.toggle("has-value", selectedValues.size > 0);
      panel.classList.toggle("is-disabled", disabled);
      panel.setAttribute("aria-disabled", String(disabled));
    }
    if (summary) {
      const selectedText = Array.from(selectedValues).join(", ");
      const colorText = key === "hajszin" && selectedValues.has("Melírozott / többszínű")
        ? ` – alap: ${state.face.hajAlapszin || "#3b2416"}, melír: ${state.face.hajMelirszin || "#b55239"}`
        : "";
      summary.textContent = selectedValues.size ? `${labelText} (${selectedText}${colorText})` : labelText;
    }
    picker.classList.toggle("is-disabled", disabled);
    picker.querySelectorAll("[data-face-image-group-key]").forEach((button) => {
      button.disabled = disabled;
    });
    picker.querySelectorAll("[data-face-image-value]").forEach((button) => {
      const value = button.dataset.faceImageValue;
      const option = Array.from(select.options).find((item) => item.value === value);
      const unavailable = disabled || Boolean(option?.disabled);
      const selected = selectedValues.has(value);
      const conflicts = !selected && Array.from(selectedValues).some((item) => faceValuesConflict(key, item, value));
      button.classList.toggle("selected", selected);
      button.classList.toggle("has-conflict", conflicts);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
      button.disabled = unavailable;
      button.classList.toggle("is-unavailable", Boolean(option?.disabled));
      if (conflicts) button.title = `${value} – kiválasztásakor az ellentmondó arcjegy kikapcsol`;
    });
  }

  function syncFaceImagePickers() {
    Object.keys(FACE_IMAGE_ASSETS).forEach(syncFaceImagePickerState);
  }

  function renderCompositionGrid() {
    if (!elements.compositionGrid) return;
    const sourceRows = database.tbl_kepformatum?.length ? database.tbl_kepformatum : [
      { formatum_id: "Portré / álló (4:5)", formatum_prompt: "portrait orientation, vertical 4:5 composition" },
      { formatum_id: "Tájkép / fekvő (16:9)", formatum_prompt: "landscape orientation, horizontal 16:9 composition" }
    ];
    const rows = sourceRows.some((row) => row.formatum_id.includes("1:1"))
      ? sourceRows
      : [...sourceRows, { formatum_id: "Négyzet (1:1)", formatum_prompt: "square 1:1 composition, balanced framing" }];
    if (!rows.some((row) => row.formatum_id === state.orientation)) state.orientation = rows[0]?.formatum_id || state.orientation;
    elements.compositionGrid.innerHTML = rows.map((row) => `
      <button class="format-button${row.formatum_id === state.orientation ? " selected" : ""}" type="button" data-orientation="${row.formatum_id}" aria-pressed="${row.formatum_id === state.orientation}">
        <i aria-hidden="true"></i>
        <span><strong>${row.formatum_id.includes("16:9") ? "Tájkép" : row.formatum_id.includes("1:1") ? "Négyzet" : "Portré"}</strong><small>${row.formatum_id}</small></span>
      </button>
    `).join("");
  }

  function renderModelThirdOptions() {
    const landscapeOrientation = state.orientation.includes("16:9");
    if (elements.modelThirdControl) elements.modelThirdControl.hidden = !landscapeOrientation;
    if (!elements.modelThirdOptions) return;
    if (!MODEL_THIRDS.some((item) => item.key === state.modelThird)) state.modelThird = "center";
    elements.modelThirdOptions.innerHTML = MODEL_THIRDS.map((item) => {
      const selected = item.key === state.modelThird;
      return `<button class="model-third-button${selected ? " selected" : ""}" type="button" role="radio" data-model-third="${item.key}" aria-checked="${selected}">
        <i class="thirds-guide thirds-guide-${item.key}" aria-hidden="true"><b></b><b></b><b></b></i>
        <span>${item.label}</span>
      </button>`;
    }).join("");
  }

  function renderFaceBackgroundButtons() {
    elements.faceBackgroundButtons.forEach((button) => {
      const conflictReason = faceBackgroundConflictReason(button.dataset.faceBackground);
      const conflicts = Boolean(conflictReason);
      const selected = button.dataset.faceBackground === state.faceBackground;
      button.disabled = false;
      button.classList.toggle("is-conflicting", conflicts);
      button.setAttribute("aria-disabled", conflicts ? "true" : "false");
      button.title = conflicts ? conflictReason : "";
      button.setAttribute("aria-pressed", selected && !conflicts ? "true" : "false");
    });
  }

  function renderSpecialShotControls() {
    if (!elements.macroShot && !elements.superteleShot) return;
    const interior = state.environmentMode === "interior";
    if (interior && state.specialShotMode === "supertele") {
      state.specialShotMode = "";
      if (state.photo.objektiv === "Szupertele") state.photo.objektiv = "";
    }
    if (elements.superteleShotOption) elements.superteleShotOption.hidden = interior;
    if (elements.specialShotHint) {
      elements.specialShotHint.textContent = interior
        ? "Opcionális – beltéri tárgy, anyag vagy építészeti részlet."
        : "Opcionális – a két mód egymást kizárja.";
    }
    if (elements.macroShot) elements.macroShot.checked = state.specialShotMode === "macro";
    if (elements.superteleShot) elements.superteleShot.checked = state.specialShotMode === "supertele";
    if (elements.specialShotSubject) {
      elements.specialShotSubject.disabled = !state.specialShotMode;
      elements.specialShotSubject.value = state.specialShotSubject || "";
      elements.specialShotSubject.placeholder = interior
        ? "Téma angolul, pl. carved stone ornament"
        : "Téma angolul, pl. a honeybee on lavender";
    }
  }

  function makeFaceField(field) {
    const [key, label] = field;
    const wrapper = document.createElement("div");
    const hasImages = Boolean(FACE_IMAGE_ASSETS[key]);
    wrapper.className = `field${hasImages ? " image-field" : ""}`;
    if (hasImages) {
      wrapper.innerHTML = `
        <details class="image-picker-panel" id="face-image-panel-${key}">
          <summary><span id="face-image-summary-${key}" data-label="${label}">${label}</span></summary>
          <label class="visually-hidden" for="face-${key}">${label}</label>
          <select id="face-${key}" data-face-key="${key}"></select>
          <div class="face-image-grid" id="face-images-${key}" data-face-image-picker="${key}"></div>
        </details>
      `;
      const panel = wrapper.querySelector(".image-picker-panel");
      const summary = panel?.querySelector(":scope > summary");
      summary?.addEventListener("click", (event) => {
        event.preventDefault();
        const select = panel?.querySelector(`[data-face-key="${key}"]`);
        if (select?.disabled) {
          panel.open = false;
          showToast(facePanelUnavailableReason(key));
          return;
        }
        panel.open = !panel.open;
      });
    } else {
      wrapper.innerHTML = `<label for="face-${key}">${label}</label><select id="face-${key}" data-face-key="${key}"></select>`;
    }
    return wrapper;
  }

  function facePanelUnavailableReason(key) {
    if (MAKEUP_KEYS.includes(key) && faceValue("identitas") !== "Nő") {
      return "Ez a mező csak női identitásnál használható.";
    }
    if (key === "arcszorzet" && faceValue("identitas") === "Nő") {
      return "Az arcszőrzet csak férfi identitásnál használható.";
    }
    const hairStyle = faceValue("hajstilus");
    if (["hajszin", "hajhossz", "hajsuruseg"].includes(key) && hairStyle.startsWith("Kopasz")) {
      return "Kopasz frizuránál ez a hajmező nem használható.";
    }
    if (key === "hajhossz" && (hairStyle.includes("géppel nyírt") || hairStyle.includes("buzz cut"))) {
      return "Géppel nyírt frizuránál a hajhossz automatikus.";
    }
    if (!faceValue("altipus") && DEPENDENT_FIELDS.some(([fieldKey]) => fieldKey === key)) {
      return "Előbb válassz embertípust.";
    }
    return "A panel a jelenlegi beállításokkal nem használható.";
  }

  function renderFaceGroups() {
    if (!elements.faceGroups) return;
    elements.faceGroups.innerHTML = "";
    if (!Object.keys(database).length) {
      elements.faceGroups.innerHTML = `<div class="load-error">Az adatcsomag nem tölthető be. Ellenőrizd, hogy a js/prompt-data.js fájl az oldal mellett van.</div>`;
      return;
    }
    FACE_GROUPS.forEach((group, index) => {
      const details = document.createElement("details");
      details.className = "field-group";
      details.dataset.groupIndex = String(index);
      details.dataset.groupKey = group.key || `face-group-${index}`;
      details.open = false;
      details.addEventListener("toggle", () => {
        if (!details.open) return;
        elements.faceGroups.querySelectorAll(":scope > details.field-group[open]").forEach((item) => {
          if (item !== details) item.open = false;
        });
      });
      details.addEventListener("click", () => {
        acknowledgedRequiredPanels.add(details.dataset.groupKey);
        updateRequiredPanelWarnings();
      });
      details.innerHTML = `<summary><strong><span class="group-number">${String(index + 1).padStart(2, "0")}</span><span class="group-title">${group.title}</span><em>${group.note}</em></strong></summary>`;
      const grid = document.createElement("div");
      grid.className = "fields-grid";
      if (group.key === "makeup") {
        const note = document.createElement("div");
        note.className = "identity-note";
        note.textContent = "A sminkmezők csak női identitásnál aktívak; az arcjegyek és bőrtextúra mindig használható.";
        grid.appendChild(note);
      }
      group.fields.forEach((field) => grid.appendChild(makeFaceField(field)));
      details.appendChild(grid);
      elements.faceGroups.appendChild(details);
    });
  }

  function renderPositionField() {
    if (!elements.positionField) return;
    elements.positionField.innerHTML = "";
    elements.positionField.appendChild(makeFaceField(POSITION_FIELD));
  }

  function rowsForDependentField(field, altipus) {
    const [, , table, idKey] = field;
    const linkTable = defaultLinkTableForField(field);
    if (!altipus) return [];
    const allowed = new Set((database[linkTable] || [])
      .filter((link) => String(link.altipus_id) === String(altipus))
      .map((link) => String(link[idKey])));
    return (database[table] || []).filter((row) => allowed.has(String(row[idKey])));
  }

  function defaultLinkTableForField(field) {
    const [key, , , , , linkTable] = field;
    return linkTable || ALT_TYPE_DEFAULT_LINK_TABLES[key] || "";
  }

  function defaultValueForAltType(field, altipus) {
    const [key, , , idKey] = field;
    const linkTable = defaultLinkTableForField(field);
    if (!altipus || !linkTable) return "";
    const link = (database[linkTable] || [])
      .find((row) => String(row.altipus_id) === String(altipus) && row[idKey]);
    if (!link) return "";
    const value = String(link[idKey]);
    return selectHasValue(faceSelect(key), value) ? value : "";
  }

  function resetFaceForAltType(altipus) {
    FACE_FIELDS.forEach(([key]) => {
      const value = key === "altipus" ? altipus : "";
      state.face[key] = value;
      const select = faceSelect(key);
      if (select) select.value = value;
    });
  }

  function applyAltTypeDefaults(altipus) {
    let applied = 0;
    FACE_FIELDS.forEach((field) => {
      const [key] = field;
      if (key === "altipus") return;
      const value = defaultValueForAltType(field, altipus);
      const select = faceSelect(key);
      if (!value || !select || select.disabled) return;
      select.value = value;
      state.face[key] = value;
      applied += 1;
    });
    return applied;
  }

  function applyAltTypeSelection(altipus) {
    acknowledgedRequiredPanels.clear();
    resetFaceForAltType(altipus);
    updateFaceDependents();
    updateHairStyleChoices();
    updateMakeupAvailability({ clearDisabled: true });
    updateBiologicalLogic({ clearDisabled: true });
    const applied = applyAltTypeDefaults(altipus);
    readFaceControlsToState();
    updateRequiredPanelWarnings();
    return applied;
  }

  function missingEssentialKeysForGroup(group) {
    return group.fields
      .map(([key]) => key)
      .filter((key) => ESSENTIAL_PROMPT_FACE_KEYS.has(key))
      .filter((key) => {
        const select = faceSelect(key);
        return select && !select.disabled && !select.value;
      });
  }

  function updateRequiredPanelWarnings() {
    if (!elements.faceGroups) return;
    elements.faceGroups.querySelectorAll(":scope > details.field-group").forEach((details) => {
      const group = FACE_GROUPS[Number(details.dataset.groupIndex)];
      if (!group) return;
      const missingKeys = missingEssentialKeysForGroup(group);
      const acknowledged = acknowledgedRequiredPanels.has(details.dataset.groupKey);
      details.classList.toggle("has-required-missing", missingKeys.length > 0 && !acknowledged);
      details.dataset.requiredMissing = missingKeys.join(",");
    });
  }

  function updateFaceDependents() {
    const altipus = faceValue("altipus");
    DEPENDENT_FIELDS.forEach((field) => {
      const [key] = field;
      const select = faceSelect(key);
      populateSelect(select, field, rowsForDependentField(field, altipus), state.face[key] || "", "face");
      if (select && state.face[key] && !select.value) state.face[key] = "";
    });
  }

  const HAIR_STYLE_COMPATIBILITY = Object.fromEntries([
    ["Afro", ["Rövid", "Közepes", "Hosszú", "Extra hosszú"], ["Dús", "Extra dús"]],
    ["Ázott/vizes", ["Nagyon rövid", "Rövid", "Közepes", "Hosszú", "Extra hosszú"], ["Ritka", "Normál", "Dús", "Extra dús"]],
    ["Bob frizura", ["Rövid", "Közepes"], ["Normál", "Dús", "Extra dús"]],
    ["Copf", ["Közepes", "Hosszú", "Extra hosszú"], ["Normál", "Dús", "Extra dús"]],
    ["Egyenes", ["Rövid", "Közepes", "Hosszú", "Extra hosszú"], ["Ritka", "Normál", "Dús", "Extra dús"]],
    ["Felső konty (top knot)", ["Közepes", "Hosszú", "Extra hosszú"], ["Normál", "Dús", "Extra dús"]],
    ["Fonatok (braids)", ["Közepes", "Hosszú", "Extra hosszú"], ["Normál", "Dús", "Extra dús"]],
    ["Göndör", ["Rövid", "Közepes", "Hosszú", "Extra hosszú"], ["Ritka", "Normál", "Dús", "Extra dús"]],
    ["Hosszú, egyenes, enyhén rétegezett szőke haj, laza oldalválasztékkal, kicsit kócos, természetes hatású frizura", ["Hosszú", "Extra hosszú"], ["Normál", "Dús"]],
    ["Hullámos", ["Rövid", "Közepes", "Hosszú", "Extra hosszú"], ["Ritka", "Normál", "Dús", "Extra dús"]],
    ["Konty", ["Közepes", "Hosszú", "Extra hosszú"], ["Normál", "Dús", "Extra dús"]],
    ["Kopasz", [], []],
    ["Kopasz, borotvált", ["Nagyon rövid"], ["Ritka", "Normál", "Dús", "Extra dús"]],
    ["Kopasz, géppel nyírt", ["Nagyon rövid"], ["Ritka", "Normál", "Dús", "Extra dús"]],
    ["Középhosszú, réteges frizura lágy hullámokkal és légies volumen­nel", ["Közepes"], ["Normál", "Dús", "Extra dús"]],
    ["Laza, magas konty kiengedett tincsekkel, bohém stílusban", ["Hosszú", "Extra hosszú"], ["Normál", "Dús", "Extra dús"]],
    ["Laza, romantikus konty, enyhén tupírozott tövekkel, finoman kiengedett tincsekkel", ["Közepes", "Hosszú", "Extra hosszú"], ["Normál", "Dús", "Extra dús"]],
    ["Lenyírt (buzz cut)", ["Nagyon rövid"], ["Ritka", "Normál", "Dús", "Extra dús"]],
    ["Mohawk", ["Rövid", "Közepes", "Féloldalas / oldalt felnyírt"], ["Normál", "Dús", "Extra dús"]],
    ["Pixie vágás", ["Nagyon rövid", "Rövid"], ["Ritka", "Normál", "Dús", "Extra dús"]],
    ["Raszta", ["Közepes", "Hosszú", "Extra hosszú"], ["Normál", "Dús", "Extra dús"]],
    ["Rövid, réteges bob, laza hullámokkal és enyhe volumen­nel", ["Rövid"], ["Normál", "Dús", "Extra dús"]],
    ["Rövid, réteges pixie frizura", ["Nagyon rövid", "Rövid"], ["Ritka", "Normál", "Dús", "Extra dús"]],
    ["Rövid, tépett shag frizura", ["Rövid", "Közepes"], ["Normál", "Dús", "Extra dús"]],
    ["Vállig érő, dús göndör frizura, természetes volumen­nel", ["Közepes"], ["Dús", "Extra dús"]],
    ["Klasszikus oldalválaszték", ["Nagyon rövid", "Rövid"], ["Ritka", "Normál", "Dús"]],
    ["Texturált crop", ["Nagyon rövid", "Rövid"], ["Normál", "Dús", "Extra dús"]],
    ["Crew cut", ["Nagyon rövid", "Rövid"], ["Ritka", "Normál", "Dús"]],
    ["Alacsony fade", ["Nagyon rövid", "Rövid", "Féloldalas / oldalt felnyírt"], ["Normál", "Dús", "Extra dús"]],
    ["Pompadour", ["Rövid", "Közepes", "Féloldalas / oldalt felnyírt"], ["Normál", "Dús", "Extra dús"]],
    ["Slick back", ["Rövid", "Közepes", "Hosszú"], ["Normál", "Dús", "Extra dús"]],
    ["Undercut", ["Rövid", "Közepes", "Féloldalas / oldalt felnyírt"], ["Normál", "Dús", "Extra dús"]],
    ["Francia bob", ["Rövid", "Közepes"], ["Normál", "Dús"]],
    ["Lob / hosszú bob", ["Közepes"], ["Normál", "Dús", "Extra dús"]],
    ["Old Hollywood hullámok", ["Közepes", "Hosszú", "Extra hosszú"], ["Normál", "Dús", "Extra dús"]],
    ["Félkonty", ["Közepes", "Hosszú", "Extra hosszú"], ["Normál", "Dús", "Extra dús"]],
    ["Holland fonat", ["Közepes", "Hosszú", "Extra hosszú"], ["Normál", "Dús", "Extra dús"]],
    ["Oldalra söpört hosszú haj", ["Hosszú", "Extra hosszú"], ["Normál", "Dús", "Extra dús"]],
    ["Volumenes blowout", ["Közepes", "Hosszú", "Extra hosszú"], ["Dús", "Extra dús"]],
    ["Wolf cut", ["Rövid", "Közepes", "Hosszú"], ["Normál", "Dús", "Extra dús"]],
    ["Mullet", ["Rövid", "Közepes"], ["Normál", "Dús", "Extra dús"]],
    ["Aszimmetrikus rövid frizura", ["Nagyon rövid", "Rövid"], ["Ritka", "Normál", "Dús", "Extra dús"]],
    ["Vállig érő egyenes haj", ["Közepes"], ["Ritka", "Normál", "Dús", "Extra dús"]],
    ["Precíz állig érő bob egyenes frufruval", ["Rövid", "Közepes"], ["Normál", "Dús"]],
    ["Aszimmetrikus réteges bob oldalfrufruval", ["Rövid", "Közepes"], ["Normál", "Dús", "Extra dús"]],
    ["Rövid texturált pixie hosszú oldalfrufruval", ["Nagyon rövid", "Rövid", "Féloldalas / oldalt felnyírt"], ["Normál", "Dús", "Extra dús"]],
    ["Középhosszú hullámos shag ritka frufruval", ["Közepes"], ["Normál", "Dús", "Extra dús"]],
    ["Rövid oldalra söpört texturált haj", ["Rövid", "Féloldalas / oldalt felnyírt"], ["Ritka", "Normál", "Dús", "Extra dús"]],
    ["Középhosszú kócos hátrafésült haj", ["Közepes"], ["Normál", "Dús", "Extra dús"]],
    ["Modern quiff oldalt rövidítve", ["Rövid", "Közepes", "Féloldalas / oldalt felnyírt"], ["Normál", "Dús", "Extra dús"]],
    ["Bundesliga frizura", ["Rövid", "Közepes"], ["Normál", "Dús", "Extra dús"]]
  ].map(([style, lengths, densities]) => [normalizePromptText(style), {
    lengths: lengths.map(normalizePromptText),
    densities: densities.map(normalizePromptText),
  }]));

  function updateHairStyleChoices() {
    const select = faceSelect("hajstilus");
    if (!select) return;
    const identity = faceValue("identitas");
    const hairLength = faceValue("hajhossz");
    const hairDensity = faceValue("hajsuruseg");
    const field = FACE_FIELDS.find(([key]) => key === "hajstilus");
    const links = database.tbl_hajstilus_identitas || [];
    const rows = database.tbl_hajstilus || [];
    populateSelect(select, field, rows, state.face.hajstilus || "", "face");
    Array.from(select.options).forEach((option) => {
      if (!option.value) return;
      const constraints = links.filter((link) => String(link.hajstilus_id) === option.value);
      const wrongIdentity = Boolean(identity && links.length && constraints.length > 0 && !constraints.some((link) => link.identitas_id === identity));
      option.disabled = wrongIdentity || !hairStyleMatchesSelections(option.value, hairLength, hairDensity);
    });
    if (select.selectedOptions[0]?.disabled) {
      select.value = "";
      state.face.hajstilus = "";
    }
    renderFaceImagePicker(field, orderedFaceRows(field, rows));
  }

  function hairStyleMatchesSelections(style, length, density) {
    if (!style) return true;
    const rule = HAIR_STYLE_COMPATIBILITY[normalizePromptText(style)];
    if (!rule) return true;
    if (length && !rule.lengths.includes(normalizePromptText(length))) return false;
    if (density && !rule.densities.includes(normalizePromptText(density))) return false;
    return true;
  }

  function updateMakeupAvailability({ clearDisabled = true } = {}) {
    const enabled = faceValue("identitas") === "Nő";
    const group = document.querySelector('[data-group-key="makeup"]');
    group?.classList.toggle("is-available", enabled);
    MAKEUP_KEYS.forEach((key) => {
      const select = faceSelect(key);
      if (!select) return;
      select.disabled = !enabled;
      if (!enabled && clearDisabled) {
        select.value = "";
        state.face[key] = "";
      }
    });
  }

  function updateBiologicalLogic({ clearDisabled = true } = {}) {
    const hairStyle = faceValue("hajstilus");
    const hairless = hairStyle.startsWith("Kopasz");
    const buzzCut = hairStyle.includes("géppel nyírt") || hairStyle.includes("buzz cut");
    [
      ["hajszin", hairless],
      ["hajhossz", hairless || buzzCut],
      ["hajsuruseg", hairless]
    ].forEach(([key, disabled]) => {
      const select = faceSelect(key);
      if (!select) return;
      select.disabled = disabled;
      if (disabled && clearDisabled) {
        select.value = "";
        state.face[key] = "";
      }
    });

    const facialHairSelect = faceSelect("arcszorzet");
    const femaleIdentity = faceValue("identitas") === "Nő";
    if (facialHairSelect) {
      facialHairSelect.disabled = femaleIdentity;
      if (femaleIdentity && clearDisabled) {
        facialHairSelect.value = "";
        state.face.arcszorzet = "";
      }
    }
  }

  function normalizeAdultAge(value) {
    return LEGACY_MINOR_AGES.has(value) ? "Fiatal felnőtt" : value;
  }

  function populateFaceControls() {
    if (!elements.faceGroups && !elements.positionField) return;
    state.face.eletkor = normalizeAdultAge(state.face.eletkor);
    FACE_FIELDS.filter((field) => !field[5]).forEach((field) => {
      populateSelect(faceSelect(field[0]), field, database[field[2]] || [], state.face[field[0]] || "", "face");
    });
    updateFaceDependents();
    updateHairStyleChoices();
    updateMakeupAvailability({ clearDisabled: true });
    updateBiologicalLogic({ clearDisabled: true });
    readFaceControlsToState();
  }

  function readFaceControlsToState() {
    FACE_FIELDS.forEach(([key]) => {
      const select = faceSelect(key);
      if (select) state.face[key] = MULTI_FACE_KEYS.has(key)
        ? compatibleFaceValues(key, Array.from(select.selectedOptions).map((option) => option.value))
        : select.value;
    });
    syncFaceImagePickers();
    updateRequiredPanelWarnings();
  }

  function renderTerrainGrid() {
    if (!elements.terrainGrid) return;
    elements.terrainGrid.dataset.environmentMode = state.environmentMode;
    elements.terrainGrid.innerHTML = environmentPresets().map((item) => `
      <button class="terrain-card${item.id === state.terrainId ? " selected" : ""}" type="button" data-terrain-id="${item.id}" aria-pressed="${item.id === state.terrainId}">
        <img src="${state.environmentMode === "landscape" ? terrainImagePath(item.id) : `assets/environment/${state.environmentMode}/${item.id}.webp`}" alt="" loading="lazy" decoding="async">
        <header><strong>${environmentDisplayLabel(item.id, item.label)}</strong><span>${item.short}</span></header>
        <small>${item.prompt}</small>
      </button>
    `).join("");
  }

  function renderBuiltCategoryTabs() {
    if (!elements.builtCategoryTabs) return;
    const category = BUILT_ENVIRONMENT_CATEGORIES.find((item) => item.id === state.builtCategory) || BUILT_ENVIRONMENT_CATEGORIES[0];
    state.builtCategory = category.id;
    elements.builtCategoryTabs.querySelectorAll("[data-built-category]").forEach((button) => {
      const selected = button.dataset.builtCategory === category.id;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
  }

  function renderLandscapeCategoryTabs() {
    if (!elements.landscapeCategoryTabs) return;
    const category = LANDSCAPE_CATEGORIES.find((item) => item.id === state.landscapeCategory) || LANDSCAPE_CATEGORIES[0];
    state.landscapeCategory = category.id;
    elements.landscapeCategoryTabs.querySelectorAll("[data-landscape-category]").forEach((button) => {
      const selected = button.dataset.landscapeCategory === category.id;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
  }

  function renderInteriorLightPickers() {
    INTERIOR_LIGHT_PICKERS.forEach((picker) => {
      const select = elements[picker.elementKey];
      const grid = elements[picker.gridKey];
      const heading = elements[picker.headingKey];
      const selectedValue = state[picker.stateKey];
      const selectedItem = selectedValue ? picker.items.find(([value]) => value === selectedValue) : null;
      if (select) select.value = selectedItem?.[0] || "";
      if (heading) heading.textContent = selectedItem ? `${picker.label} (${selectedItem[1]})` : picker.label;
      if (!grid) return;
      grid.innerHTML = picker.items.map(([value, label], index) => `
        <button class="interior-light-card${value === selectedItem?.[0] ? " selected" : ""}" type="button" data-interior-light-key="${picker.stateKey}" data-interior-light-value="${value}" aria-pressed="${value === selectedItem?.[0]}">
          <img src="assets/interior-lighting/${picker.folder}/${value}.webp" alt="" loading="lazy" decoding="async">
          <span>${index + 1}. ${label}</span>
        </button>
      `).join("");
    });
  }

  function renderEnvironmentModeUi() {
    const mode = ["landscape", "built", "interior"].includes(state.environmentMode) ? state.environmentMode : "landscape";
    state.environmentMode = mode;
    let presets = environmentPresets(mode);
    if (mode === "landscape" && !presets.some((item) => item.id === state.terrainId)) {
      const matchingCategory = LANDSCAPE_CATEGORIES.find((category) => category.presetIds.includes(state.terrainId));
      if (matchingCategory) {
        state.landscapeCategory = matchingCategory.id;
        presets = environmentPresets(mode);
      }
    }
    if (!presets.some((item) => item.id === state.terrainId)) {
      state.terrainId = presets[0].id;
      state.environmentElementIds = [];
    }
    elements.environmentModeTabs?.querySelectorAll("[data-environment-mode]").forEach((button) => {
      const selected = button.dataset.environmentMode === mode;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    if (elements.landscapeCategoryOptions) elements.landscapeCategoryOptions.hidden = mode !== "landscape";
    if (elements.builtEnvironmentOptions) elements.builtEnvironmentOptions.hidden = mode !== "built";
    renderLandscapeCategoryTabs();
    renderBuiltCategoryTabs();
    if (elements.interiorLightingOptions) elements.interiorLightingOptions.hidden = mode !== "interior";
    if (elements.outdoorLightPanel) elements.outdoorLightPanel.hidden = false;
    if (elements.windPanel) elements.windPanel.hidden = false;
    if (elements.customLocation) elements.customLocation.value = state.customLocation || "";
    if (elements.interiorLightSource) elements.interiorLightSource.value = state.interiorLightSource;
    if (elements.interiorLightCharacter) elements.interiorLightCharacter.value = state.interiorLightCharacter;
    if (elements.interiorColorTemperature) elements.interiorColorTemperature.value = state.interiorColorTemperature;
    if (elements.interiorLightDirection) elements.interiorLightDirection.value = state.interiorLightDirection;
    renderInteriorLightPickers();
    if (elements.randomEnvironment) elements.randomEnvironment.textContent = mode === "landscape"
      ? "Véletlenszerű táj generálása"
      : mode === "built" ? "Véletlenszerű épített helyszín" : "Véletlenszerű beltér";
  }

  function renderEnvironmentElements() {
    if (!elements.environmentElements) return;
    ensureEnvironmentElements();
    elements.environmentElements.innerHTML = terrain().elements.map(([id, label, prompt]) => {
      const selected = state.environmentElementIds.includes(id);
      const locked = !selected && state.environmentElementIds.length >= ENVIRONMENT_ELEMENT_MAX;
      return `
        <button class="element-card${selected ? " selected" : ""}" type="button" data-element-id="${id}" aria-pressed="${selected}"${locked ? " disabled" : ""}>
          <header><strong>${environmentDisplayLabel(id, label)}</strong><small>${selected ? "aktív" : locked ? "max 4" : "kihagyva"}</small></header>
          <small>${prompt}</small>
        </button>`;
    }).join("");
  }

  function renderSeasonSelect() {
    if (!elements.seasonSelect) return;
    elements.seasonSelect.innerHTML = seasonRows().map((row) => `<option value="${row.season_key}">${row.label}</option>`).join("");
    elements.seasonSelect.value = state.seasonKey;
    if (elements.phaseSelect) elements.phaseSelect.value = state.phaseKey;
    renderSeasonVisuals();
    renderPhaseCalendar();
  }

  function renderSeasonVisuals() {
    if (!elements.seasonGrid) return;
    if (elements.seasonHeading) elements.seasonHeading.textContent = `Évszak (${activeSeason().label})`;
    elements.seasonGrid.innerHTML = seasonRows().map((row) => {
      const visual = SEASON_VISUALS[row.season_key] || SEASON_VISUALS.spring;
      const selected = row.season_key === state.seasonKey;
      return `<button class="weather-image-card season-image-card${selected ? " selected" : ""}" type="button" data-season-key="${row.season_key}" aria-pressed="${selected}">
        <img src="${WEATHER_IMAGE_FOLDER}/${visual.image}" alt="" loading="lazy" decoding="async">
        <span><strong>${row.label}</strong></span>
      </button>`;
    }).join("");
  }

  function renderPhaseCalendar() {
    if (!elements.phaseCalendar) return;
    const visual = SEASON_VISUALS[state.seasonKey] || SEASON_VISUALS.spring;
    const phaseKeys = ["early", "mid", "late"];
    const activeIndex = Math.max(0, phaseKeys.indexOf(state.phaseKey));
    if (elements.phaseHeading) elements.phaseHeading.textContent = `Évszak szakasza · hónapok (${visual.months[activeIndex]?.[1] || PHASES[state.phaseKey]?.label || ""})`;
    elements.phaseCalendar.innerHTML = visual.months.map(([number, month], index) => {
      const phaseKey = phaseKeys[index];
      const selected = phaseKey === state.phaseKey;
      return `<button class="month-card${selected ? " selected" : ""}" type="button" data-phase-key="${phaseKey}" aria-pressed="${selected}">
        <span class="month-number">${number}</span><strong>${month}</strong><small>${PHASES[phaseKey].label}</small>
      </button>`;
    }).join("");
  }

  function allowedWeatherKeys() {
    const keys = new Set(terrain().allowedWeather);
    if (state.environmentMode === "interior") return WEATHER_ORDER.filter((key) => keys.has(key));
    const coldTerrain = ["high_mountain", "glacier", "taiga", "tundra", "fjord", "montane_conifer_forest", "alpine_meadow", "polar_ice_sheet"].includes(state.terrainId);
    const aridTerrain = ["desert", "salt_lake", "badland", "egyptian_pyramids", "oasis", "sand_sea_erg", "rock_desert_hamada"].includes(state.terrainId);
    const wetTerrain = ["coast", "river", "lake", "wetland", "mangrove", "jungle", "monsoon_forest", "temperate_forest", "taiga", "fjord", "rocky_coast", "river_delta", "tidal_flat", "lagoon_atoll", "temperate_rainforest", "cloud_forest"].includes(state.terrainId);
    const waterTerrain = ["coast", "river", "lake", "wetland", "mangrove", "tropical_island", "port", "bridge", "fjord", "rocky_coast", "river_delta", "tidal_flat", "lagoon_atoll"].includes(state.terrainId);
    const highLatitude = ["glacier", "taiga", "tundra", "high_mountain", "fjord", "polar_ice_sheet"].includes(state.terrainId);
    const permanentIce = ["glacier", "polar_ice_sheet"].includes(state.terrainId);
    const transitionalColdMonth = coldTerrain && (
      (state.seasonKey === "autumn" && state.phaseKey === "late")
      || (state.seasonKey === "spring" && state.phaseKey === "early")
    );
    const coldPhase = state.seasonKey === "winter" || transitionalColdMonth || permanentIce;
    const daylight = sunElevation() > -6;
    if (!coldPhase) keys.delete("snow");
    if (coldPhase) {
      keys.add("snow_shower");
      keys.add("sleet");
      if (!aridTerrain) keys.add("blowing_snow");
    } else {
      keys.delete("snow_shower");
      keys.delete("sleet");
      keys.delete("blowing_snow");
    }
    if (coldPhase && !aridTerrain) keys.add("rime");
    if (!aridTerrain && (wetTerrain || ["spring", "autumn", "winter"].includes(state.seasonKey))) keys.add("fog");
    if (!aridTerrain && (wetTerrain || state.weatherKey === "rain" || state.phaseKey !== "mid")) keys.add("mist");
    if (!aridTerrain && daylight && state.seasonKey !== "winter") keys.add("rainbow");
    if (!aridTerrain && ["spring", "summer", "autumn"].includes(state.seasonKey)) keys.add("hail");
    if (aridTerrain) {
      keys.add("sandstorm");
      if (daylight) keys.add("dust_devil");
      if (daylight && ["spring", "summer", "autumn"].includes(state.seasonKey)) keys.add("mirage");
      keys.delete("fog");
      keys.delete("rime");
      keys.delete("sleet");
      keys.delete("snow_shower");
    } else {
      keys.delete("dust_devil");
    }
    if (!permanentIce && state.seasonKey !== "winter") keys.add("tornado");
    else keys.delete("tornado");
    if (waterTerrain) keys.add("waterspout");
    else keys.delete("waterspout");
    if (highLatitude && !daylight) keys.add("aurora");
    else keys.delete("aurora");
    return WEATHER_ORDER.filter((key) => keys.has(key));
  }

  function renderWeatherSelect() {
    if (!elements.weatherSelect) return;
    const allowed = new Set(allowedWeatherKeys());
    const rows = weatherRows();
    if (state.weatherKey && !allowed.has(state.weatherKey) && !isFieldLocked("weather.weather")) state.weatherKey = rows.find((row) => allowed.has(row.weather_key))?.weather_key || "sun";
    elements.weatherSelect.innerHTML = rows.map((row) => `<option value="${row.weather_key}"${allowed.has(row.weather_key) ? "" : " disabled"}>${row.label}</option>`).join("");
    elements.weatherSelect.value = state.weatherKey;
    renderWeatherVisuals(rows, allowed);
    renderWindControls();
  }

  function renderWeatherVisuals(rows = weatherRows(), allowed = new Set(allowedWeatherKeys())) {
    if (!elements.weatherGrid && !elements.specialWeatherGrid) return;
    const cardHtml = (row) => {
      const visual = WEATHER_VISUALS[row.weather_key] || WEATHER_VISUALS.sun;
      const selected = row.weather_key === state.weatherKey;
      const disabled = !allowed.has(row.weather_key);
      return `<button class="weather-image-card weather-state-card${selected ? " selected" : ""}" type="button" data-weather-key="${row.weather_key}" aria-pressed="${selected}"${disabled ? " disabled title=\"A kiválasztott tájhoz, hónaphoz vagy napszakhoz nem illik.\"" : ""}>
        <img src="${WEATHER_IMAGE_FOLDER}/${visual.image}" alt="" loading="lazy" decoding="async">
        <span><strong>${row.label}</strong></span>
      </button>`;
    };
    const basicRows = rows.filter((row) => BASIC_WEATHER_KEYS.has(row.weather_key));
    const specialRows = rows.filter((row) => !BASIC_WEATHER_KEYS.has(row.weather_key));
    if (elements.weatherGrid) elements.weatherGrid.innerHTML = basicRows.map(cardHtml).join("");
    if (elements.specialWeatherGrid) elements.specialWeatherGrid.innerHTML = specialRows.map(cardHtml).join("");
    if (elements.weatherHeading) elements.weatherHeading.textContent = `Időjárás (${activeWeather().label})`;
    if (elements.specialWeatherHeading) {
      elements.specialWeatherHeading.textContent = BASIC_WEATHER_KEYS.has(state.weatherKey)
        ? "Speciális légköri jelenségek"
        : `Speciális légköri jelenségek (${activeWeather().label})`;
    }
  }

  function renderWindControls() {
    normalizeWindForWeather();
    if (elements.windHeading) elements.windHeading.textContent = `Szél és légmozgás (${activeWind().label})`;
    renderWindDirectionControls();
    if (!elements.windGrid) return;
    const minimumIndex = WIND_LEVELS.findIndex((item) => item.key === minimumWindKeyForWeather());
    elements.windGrid.innerHTML = WIND_LEVELS.map((item, index) => {
      const selected = item.key === state.windKey;
      const disabled = minimumIndex >= 0 && index < minimumIndex;
      return `<button class="weather-image-card wind-image-card${selected ? " selected" : ""}" type="button" data-wind-key="${item.key}" aria-pressed="${selected}"${disabled ? ` disabled title="A kiválasztott légköri jelenség legalább ${WIND_LEVELS[minimumIndex].label.toLowerCase()} erősséget igényel."` : ""}>
        <img src="${WIND_VISUAL_FOLDER}/szel_${item.key}.webp" alt="" loading="lazy" decoding="async">
        <span><strong>${item.label}</strong></span>
      </button>`;
    }).join("");
  }

  function renderWindDirectionControls() {
    const active = activeWindDirection();
    const disabled = state.windKey === "calm";
    if (elements.windDirectionHeading) {
      elements.windDirectionHeading.textContent = disabled ? "Szélirány (szélcsendnél nem aktív)" : `Szélirány (${active.label})`;
    }
    if (elements.windDirectionPanel) {
      elements.windDirectionPanel.classList.toggle("wind-direction-disabled", disabled);
      elements.windDirectionPanel.setAttribute("aria-disabled", String(disabled));
    }
    if (!elements.windDirectionGrid) return;
    elements.windDirectionGrid.innerHTML = WIND_DIRECTIONS.map((item, index) => {
      const selected = item.key === state.windDirectionKey;
      return `<button class="wind-direction-button${selected ? " selected" : ""}" type="button" role="radio" data-wind-direction-key="${item.key}" aria-checked="${selected}"${disabled ? " disabled" : ""}>
        <span class="wind-direction-arrow" aria-hidden="true">${item.arrow}</span>
        <span><b>${index + 1}. ${item.label}</b><small>A légáramlás iránya</small></span>
      </button>`;
    }).join("");
  }

  function renderCrowdPresenceOptions() {
    if (!elements.crowdPresenceOptions) return;
    if (!CROWD_LEVELS.some((item) => item.key === state.crowdLevel)) state.crowdLevel = "contextual";
    elements.crowdPresenceOptions.innerHTML = CROWD_LEVELS.map((item, index) => {
      const selected = item.key === state.crowdLevel;
      const label = window.I18N?.language === "en" ? item.labelEn : item.label;
      return `<button class="crowd-presence-button${selected ? " selected" : ""}" type="button" role="radio" data-crowd-level="${item.key}" aria-checked="${selected}"><span>${String(index + 1).padStart(2, "0")}</span>${label}</button>`;
    }).join("");
    if (elements.includeChildren) {
      const disabled = ["contextual", "alone"].includes(state.crowdLevel);
      if (disabled) state.includeChildren = false;
      elements.includeChildren.disabled = disabled;
      elements.includeChildren.checked = Boolean(state.includeChildren);
    }
  }

  function renderLightDirectionSelect() {
    if (!elements.lightDirectionSelect) return;
    const rows = lightDirectionRows();
    if (state.lightDirectionKey && !rows.some((row) => row.direction_key === state.lightDirectionKey)) state.lightDirectionKey = rows[0]?.direction_key || "front";
    elements.lightDirectionSelect.innerHTML = rows.map((row) => `<option value="${row.direction_key}">${row.label}</option>`).join("");
    elements.lightDirectionSelect.value = state.lightDirectionKey;
    renderLightDirectionVisuals(rows);
  }

  function renderLightDirectionVisuals(rows = lightDirectionRows()) {
    if (!elements.lightDirectionGrid) return;
    if (elements.lightHeading) elements.lightHeading.textContent = `Fényirány (${activeDirection().label})`;
    elements.lightDirectionGrid.innerHTML = rows.map((row) => {
      const selected = row.direction_key === state.lightDirectionKey;
      const image = LIGHT_DIRECTION_VISUALS[row.direction_key] || LIGHT_DIRECTION_VISUALS.front;
      return `<button class="weather-image-card light-image-card light-direction-${row.direction_key}${selected ? " selected" : ""}" type="button" data-light-direction-key="${row.direction_key}" aria-pressed="${selected}">
        <img src="${WEATHER_IMAGE_FOLDER}/${image}" alt="" loading="lazy" decoding="async">
        <span><strong>${row.label}</strong></span>
      </button>`;
    }).join("");
  }

  function availableFilmRows() {
    return database.tbl_filmtipus || [];
  }

  function allowedLensNamesForTerrain() {
    if (state.specialShotMode === "macro") return new Set(["Makró"]);
    if (state.specialShotMode === "supertele") return new Set(["Szupertele"]);
    const group = terrain().lensGroup || TERRAIN_LENS_GROUP[state.terrainId] || "natural";
    return new Set(TERRAIN_LENS_GROUPS[group] || TERRAIN_LENS_GROUPS.natural);
  }

  function compatibleLensName(value = state.photo.objektiv) {
    return allowedLensNamesForTerrain().has(value) ? value : "";
  }

  function renderPhotoFields() {
    if (!elements.photoFields) return;
    elements.photoFields.innerHTML = "";
    PHOTO_FIELDS.forEach((field) => {
      const [key, label] = field;
      if (key === "stilus") {
        const effectWrapper = document.createElement("div");
        effectWrapper.id = "lensEffectGrid";
        effectWrapper.className = "lens-effect-grid";
        elements.photoFields.appendChild(effectWrapper);
        elements.lensEffectGrid = effectWrapper;
      }
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `<label class="field-label" for="photo-${key}">${label}</label><select id="photo-${key}" data-photo-key="${key}"></select>${key === "objektiv" ? '<small class="control-help">A tájhoz nem illő objektívek inaktívak.</small>' : ""}`;
      elements.photoFields.appendChild(wrapper);
    });
    renderPhotoSelects();
    renderLensEffects();
  }

  function renderPhotoSelects() {
    if (!elements.photoFields) return;
    const filmField = PHOTO_FIELDS.find(([key]) => key === "film");
    populateSelect(photoSelect("film"), filmField, availableFilmRows(), state.photo.film || "", "photo");
    PHOTO_FIELDS.filter(([key]) => key !== "film").forEach((field) => {
      const selectedValue = field[0] === "objektiv"
        ? (isFieldLocked("photo.objektiv") ? state.photo.objektiv : compatibleLensName(state.photo.objektiv))
        : state.photo[field[0]] || "";
      populateSelect(photoSelect(field[0]), field, database[field[2]] || [], selectedValue, "photo");
      if (field[0] === "objektiv") {
        const allowed = allowedLensNamesForTerrain();
        Array.from(photoSelect("objektiv")?.options || []).forEach((option) => {
          option.disabled = Boolean(option.value) && !allowed.has(option.value);
          option.title = option.disabled ? "Ehhez a tájtípushoz nem ajánlott." : "";
        });
        if (!compatibleLensName(state.photo.objektiv) && !isFieldLocked("photo.objektiv")) state.photo.objektiv = "";
      }
    });
    readPhotoControlsToState();
  }

  function readPhotoControlsToState() {
    PHOTO_FIELDS.forEach(([key]) => {
      const select = photoSelect(key);
      if (select) state.photo[key] = select.value;
    });
  }

  function selectedLensEffects() {
    const selected = Array.isArray(state.photo.effects) ? state.photo.effects : [];
    return selected
      .map((key) => LENS_LIGHT_EFFECTS.find((effect) => effect.key === key))
      .filter(Boolean)
      .slice(0, MAX_LENS_EFFECTS);
  }

  function renderLensEffects() {
    if (!elements.lensEffectGrid) return;
    const isEnglish = window.I18N?.language === "en";
    const selected = selectedLensEffects();
    const emptyLabel = isEnglish ? "No optical effect" : "Nincs optikai effektus";
    const options = LENS_LIGHT_EFFECTS.map((effect) => {
      const label = isEnglish ? effect.labelEn : effect.labelHu;
      return `<option value="${effect.key}">${label}</option>`;
    }).join("");
    const fieldLabel = isEnglish ? "Optical effect" : "Optikai effektus";
    const infoLabel = isEnglish ? "Effect details" : "Effektus magyarázata";
    elements.lensEffectGrid.innerHTML = `<label class="field-label" for="photo-optical-effect" data-i18n-skip>${fieldLabel}</label><div class="lens-effect-input-row"><select id="photo-optical-effect" data-lens-effect-slot="0"><option value="">${emptyLabel}</option>${options}</select><button class="lens-effect-info" type="button" data-lens-effect-info aria-label="${infoLabel}" title="${infoLabel}">?</button></div>`;
    elements.lensEffectGrid.querySelectorAll("[data-lens-effect-slot]").forEach((select, slot) => {
      select.value = selected[slot]?.key || "";
    });
  }

  function showLensEffectInfo() {
    if (!elements.lensEffectDialog || !elements.lensEffectDialogTitle || !elements.lensEffectDialogText) return;
    const isEnglish = window.I18N?.language === "en";
    const effect = selectedLensEffects()[0];
    elements.lensEffectDialogTitle.textContent = effect
      ? (isEnglish ? effect.labelEn : effect.labelHu)
      : (isEnglish ? "No optical effect" : "Nincs optikai effektus");
    elements.lensEffectDialogText.textContent = effect
      ? (isEnglish ? effect.hintEn : effect.hintHu)
      : (isEnglish ? "Natural, clean optical rendering without flare, light leaks, ghosting, or artificial glow." : "Természetes, tiszta optikai kép becsillanás, fényszivárgás, ghosting és mesterséges ragyogás nélkül.");
    elements.lensEffectDialog.showModal();
  }

  function filmPreviewProfile(filmName) {
    return FILM_PREVIEW_PROFILES[filmName] || {
      saturation: 1,
      contrast: 1,
      gamma: 1,
      channels: [1, 1, 1],
      offsets: [0, 0, 0],
      grain: 2.5,
      vignette: 0.12
    };
  }

  function stylePreviewProfile(styleName) {
    return {
      saturation: 1,
      contrast: 1,
      gamma: 1,
      channels: [1, 1, 1],
      offsets: [0, 0, 0],
      grain: 0,
      vignette: 0,
      posterize: 0,
      edgeStrength: 0,
      edgeMode: "darken",
      pixelSize: 0,
      ...(STYLE_PREVIEW_PROFILES[styleName] || {})
    };
  }

  function activeFilmPreviewSource() {
    return LENS_PREVIEW_SOURCES[compatibleLensName()]
      || FILM_PREVIEW_SOURCES[state.photo.film]
      || FILM_PREVIEW_SOURCE;
  }

  function updateFilmPreviewLabel() {
    if (!elements.filmPreviewLabel) return;
    const filmName = state.photo.film || "";
    const lensName = compatibleLensName();
    const styleName = state.photo.stilus || "";
    elements.filmPreviewLabel.replaceChildren();
    if (filmName) {
      const filmLine = document.createElement("span");
      filmLine.className = "film-label-stock";
      filmLine.textContent = filmName;
      elements.filmPreviewLabel.appendChild(filmLine);
    }
    if (lensName) {
      const lensLine = document.createElement("span");
      lensLine.className = "film-label-lens";
      lensLine.textContent = lensName;
      elements.filmPreviewLabel.appendChild(lensLine);
    }
    if (styleName) {
      const styleLine = document.createElement("span");
      styleLine.className = "film-label-style";
      styleLine.textContent = styleName;
      elements.filmPreviewLabel.appendChild(styleLine);
    }
    if (!elements.filmPreviewLabel.childElementCount) {
      const placeholderLine = document.createElement("span");
      placeholderLine.className = "film-label-stock";
      placeholderLine.textContent = "Előnézet";
      elements.filmPreviewLabel.appendChild(placeholderLine);
    }
  }

  function renderFilmPreviewImage() {
    const canvas = elements.filmPreviewCanvas;
    if (!canvas || !filmPreviewImage?.complete || !filmPreviewImage.naturalWidth) return;
    const filmName = state.photo.film || "";
    const styleName = state.photo.stilus || "";
    const previewKey = `${filmName}|${compatibleLensName()}|${styleName}|${selectedLensEffects().map((effect) => effect.key).join(",")}|${loadedFilmPreviewSource}`;
    if (renderedFilmPreviewKey === previewKey) return;
    renderedFilmPreviewKey = previewKey;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    const width = canvas.width;
    const height = canvas.height;
    const imageRatio = filmPreviewImage.naturalWidth / filmPreviewImage.naturalHeight;
    const canvasRatio = width / height;
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = filmPreviewImage.naturalWidth;
    let sourceHeight = filmPreviewImage.naturalHeight;
    if (imageRatio > canvasRatio) {
      sourceWidth = sourceHeight * canvasRatio;
      sourceX = (filmPreviewImage.naturalWidth - sourceWidth) / 2;
    } else {
      sourceHeight = sourceWidth / canvasRatio;
      sourceY = (filmPreviewImage.naturalHeight - sourceHeight) / 2;
    }
    context.clearRect(0, 0, width, height);
    context.drawImage(filmPreviewImage, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);

    const profile = filmPreviewProfile(filmName);
    const styleProfile = stylePreviewProfile(styleName);
    const imageData = context.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    const originalPixels = styleProfile.edgeStrength ? new Uint8ClampedArray(pixels) : null;
    const seed = Array.from(`${filmName}|${styleName}`).reduce((sum, character) => sum + character.charCodeAt(0), 0);
    const clampChannel = (value) => Math.max(0, Math.min(255, value));
    for (let index = 0; index < pixels.length; index += 4) {
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
      let nextRed = profile.monochrome ? luminance : luminance + (red - luminance) * profile.saturation;
      let nextGreen = profile.monochrome ? luminance : luminance + (green - luminance) * profile.saturation;
      let nextBlue = profile.monochrome ? luminance : luminance + (blue - luminance) * profile.saturation;
      nextRed = ((nextRed - 128) * profile.contrast + 128) * profile.channels[0] + profile.offsets[0];
      nextGreen = ((nextGreen - 128) * profile.contrast + 128) * profile.channels[1] + profile.offsets[1];
      nextBlue = ((nextBlue - 128) * profile.contrast + 128) * profile.channels[2] + profile.offsets[2];
      nextRed = 255 * Math.pow(clampChannel(nextRed) / 255, 1 / profile.gamma);
      nextGreen = 255 * Math.pow(clampChannel(nextGreen) / 255, 1 / profile.gamma);
      nextBlue = 255 * Math.pow(clampChannel(nextBlue) / 255, 1 / profile.gamma);
      const styledLuminance = nextRed * 0.2126 + nextGreen * 0.7152 + nextBlue * 0.0722;
      nextRed = styleProfile.monochrome ? styledLuminance : styledLuminance + (nextRed - styledLuminance) * styleProfile.saturation;
      nextGreen = styleProfile.monochrome ? styledLuminance : styledLuminance + (nextGreen - styledLuminance) * styleProfile.saturation;
      nextBlue = styleProfile.monochrome ? styledLuminance : styledLuminance + (nextBlue - styledLuminance) * styleProfile.saturation;
      nextRed = ((nextRed - 128) * styleProfile.contrast + 128) * styleProfile.channels[0] + styleProfile.offsets[0];
      nextGreen = ((nextGreen - 128) * styleProfile.contrast + 128) * styleProfile.channels[1] + styleProfile.offsets[1];
      nextBlue = ((nextBlue - 128) * styleProfile.contrast + 128) * styleProfile.channels[2] + styleProfile.offsets[2];
      nextRed = 255 * Math.pow(clampChannel(nextRed) / 255, 1 / styleProfile.gamma);
      nextGreen = 255 * Math.pow(clampChannel(nextGreen) / 255, 1 / styleProfile.gamma);
      nextBlue = 255 * Math.pow(clampChannel(nextBlue) / 255, 1 / styleProfile.gamma);
      if (styleProfile.posterize > 1) {
        const step = 255 / (styleProfile.posterize - 1);
        nextRed = Math.round(nextRed / step) * step;
        nextGreen = Math.round(nextGreen / step) * step;
        nextBlue = Math.round(nextBlue / step) * step;
      }
      if (originalPixels && styleProfile.edgeStrength) {
        const pixelNumber = index / 4;
        const x = pixelNumber % width;
        const rightIndex = x < width - 1 ? index + 4 : index;
        const lowerIndex = index + width * 4 < originalPixels.length ? index + width * 4 : index;
        const sourceLuminance = originalPixels[index] * 0.2126 + originalPixels[index + 1] * 0.7152 + originalPixels[index + 2] * 0.0722;
        const rightLuminance = originalPixels[rightIndex] * 0.2126 + originalPixels[rightIndex + 1] * 0.7152 + originalPixels[rightIndex + 2] * 0.0722;
        const lowerLuminance = originalPixels[lowerIndex] * 0.2126 + originalPixels[lowerIndex + 1] * 0.7152 + originalPixels[lowerIndex + 2] * 0.0722;
        const edge = Math.min(255, Math.abs(sourceLuminance - rightLuminance) + Math.abs(sourceLuminance - lowerLuminance));
        if (styleProfile.edgeMode === "light") {
          const paperTone = clampChannel(248 - edge * styleProfile.edgeStrength - (255 - sourceLuminance) * 0.1);
          nextRed = paperTone * styleProfile.channels[0] + styleProfile.offsets[0];
          nextGreen = paperTone * styleProfile.channels[1] + styleProfile.offsets[1];
          nextBlue = paperTone * styleProfile.channels[2] + styleProfile.offsets[2];
        } else {
          nextRed -= edge * styleProfile.edgeStrength;
          nextGreen -= edge * styleProfile.edgeStrength;
          nextBlue -= edge * styleProfile.edgeStrength;
        }
      }
      const noiseUnit = (((index / 4 * 37 + seed * 53) % 101) / 100) - 0.5;
      const grain = noiseUnit * (profile.grain + styleProfile.grain) * 2;
      pixels[index] = clampChannel(nextRed + grain);
      pixels[index + 1] = clampChannel(nextGreen + grain);
      pixels[index + 2] = clampChannel(nextBlue + grain);
    }
    context.putImageData(imageData, 0, 0);

    if (styleProfile.pixelSize > 1) {
      const pixelCanvas = document.createElement("canvas");
      pixelCanvas.width = Math.max(1, Math.round(width / styleProfile.pixelSize));
      pixelCanvas.height = Math.max(1, Math.round(height / styleProfile.pixelSize));
      const pixelContext = pixelCanvas.getContext("2d");
      if (pixelContext) {
        pixelContext.imageSmoothingEnabled = true;
        pixelContext.drawImage(canvas, 0, 0, pixelCanvas.width, pixelCanvas.height);
        context.clearRect(0, 0, width, height);
        context.imageSmoothingEnabled = false;
        context.drawImage(pixelCanvas, 0, 0, pixelCanvas.width, pixelCanvas.height, 0, 0, width, height);
        context.imageSmoothingEnabled = true;
      }
    }

    renderLensEffectPreview(context, width, height);

    const vignette = context.createRadialGradient(width / 2, height / 2, height * 0.18, width / 2, height / 2, width * 0.72);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, `rgba(0,0,0,${Math.min(0.72, profile.vignette + styleProfile.vignette)})`);
    context.fillStyle = vignette;
    context.fillRect(0, 0, width, height);

    [elements.filmPreviewLeft, elements.filmPreviewRight].forEach((sideCanvas) => {
      if (!sideCanvas) return;
      const sideContext = sideCanvas.getContext("2d");
      if (!sideContext) return;
      sideContext.clearRect(0, 0, sideCanvas.width, sideCanvas.height);
      sideContext.drawImage(canvas, 0, 0, sideCanvas.width, sideCanvas.height);
    });
  }

  function renderLensEffectPreview(context, width, height) {
    const effects = new Set(selectedLensEffects().map((effect) => effect.key));
    if (!effects.size) return;
    const radialFill = (x, y, radius, inner, outer) => {
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, inner);
      gradient.addColorStop(1, outer);
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    };
    context.save();
    if (effects.has("soft_diffusion") || effects.has("bloom") || effects.has("dreamy_glow")) {
      const copy = document.createElement("canvas");
      copy.width = width;
      copy.height = height;
      copy.getContext("2d")?.drawImage(context.canvas, 0, 0);
      context.save();
      context.globalCompositeOperation = "screen";
      context.globalAlpha = effects.has("dreamy_glow") ? 0.24 : effects.has("bloom") ? 0.18 : 0.11;
      context.filter = effects.has("dreamy_glow") ? "blur(12px)" : "blur(7px)";
      context.drawImage(copy, 0, 0);
      context.restore();
    }
    if (effects.has("lens_flare")) {
      radialFill(width * 0.78, height * 0.22, width * 0.25, "rgba(255,244,200,.62)", "rgba(255,190,100,0)");
    }
    if (effects.has("anamorphic_flare")) {
      const gradient = context.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "rgba(35,120,255,0)");
      gradient.addColorStop(0.5, "rgba(110,190,255,.42)");
      gradient.addColorStop(1, "rgba(35,120,255,0)");
      context.fillStyle = gradient;
      context.fillRect(0, height * 0.33, width, 3);
    }
    if (effects.has("sunstar")) {
      const x = width * 0.78;
      const y = height * 0.2;
      context.strokeStyle = "rgba(255,250,220,.72)";
      context.lineWidth = 1.5;
      for (let index = 0; index < 8; index += 1) {
        const angle = index * Math.PI / 4;
        context.beginPath();
        context.moveTo(x - Math.cos(angle) * width * 0.09, y - Math.sin(angle) * width * 0.09);
        context.lineTo(x + Math.cos(angle) * width * 0.09, y + Math.sin(angle) * width * 0.09);
        context.stroke();
      }
    }
    if (effects.has("light_leak")) {
      const gradient = context.createLinearGradient(0, 0, width * 0.34, 0);
      gradient.addColorStop(0, "rgba(255,80,25,.48)");
      gradient.addColorStop(0.55, "rgba(255,175,65,.16)");
      gradient.addColorStop(1, "rgba(255,120,40,0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width * 0.42, height);
    }
    if (effects.has("halation")) radialFill(width * 0.75, height * 0.25, width * 0.32, "rgba(255,95,45,.22)", "rgba(180,20,10,0)");
    if (effects.has("ghosting")) {
      [[0.65, 0.32, 0.07], [0.48, 0.48, 0.045], [0.34, 0.62, 0.025]].forEach(([x, y, r]) => {
        radialFill(width * x, height * y, width * r, "rgba(120,210,185,.18)", "rgba(80,150,130,0)");
      });
    }
    if (effects.has("chromatic_aberration")) {
      context.fillStyle = "rgba(255,0,90,.18)";
      context.fillRect(0, 0, 3, height);
      context.fillStyle = "rgba(0,190,255,.18)";
      context.fillRect(width - 3, 0, 3, height);
    }
    if (effects.has("vignette")) {
      const gradient = context.createRadialGradient(width / 2, height / 2, height * 0.22, width / 2, height / 2, width * 0.7);
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, "rgba(0,0,0,.42)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    }
    if (effects.has("bokeh_highlights")) {
      [[0.15, 0.25, 18], [0.28, 0.18, 10], [0.84, 0.42, 15], [0.72, 0.16, 8]].forEach(([x, y, r]) => {
        radialFill(width * x, height * y, r, "rgba(255,235,180,.34)", "rgba(255,210,130,0)");
      });
    }
    if (effects.has("volumetric_rays")) {
      const gradient = context.createLinearGradient(width, 0, width * 0.35, height);
      gradient.addColorStop(0, "rgba(255,245,210,.24)");
      gradient.addColorStop(1, "rgba(255,245,210,0)");
      context.fillStyle = gradient;
      context.beginPath();
      context.moveTo(width * 0.72, 0);
      context.lineTo(width, 0);
      context.lineTo(width * 0.55, height);
      context.lineTo(width * 0.35, height);
      context.closePath();
      context.fill();
    }
    if (effects.has("rainbow_flare")) {
      const gradient = context.createLinearGradient(width * 0.42, 0, width * 0.72, height);
      ["255,50,50", "255,180,40", "80,220,100", "50,150,255", "155,80,255"].forEach((colour, index, colours) => {
        gradient.addColorStop(index / (colours.length - 1), `rgba(${colour},.2)`);
      });
      context.fillStyle = gradient;
      context.fillRect(width * 0.42, 0, width * 0.3, height);
    }
    context.restore();
  }

  function updateFilmPreview() {
    if (!elements.filmPreviewCanvas) return;
    updateFilmPreviewLabel();
    const source = activeFilmPreviewSource();
    if (!filmPreviewImage || loadedFilmPreviewSource !== source) {
      const nextImage = new Image();
      filmPreviewImage = nextImage;
      loadedFilmPreviewSource = source;
      nextImage.decoding = "async";
      nextImage.addEventListener("load", () => {
        if (filmPreviewImage !== nextImage || loadedFilmPreviewSource !== source) return;
        renderedFilmPreviewKey = "";
        renderFilmPreviewImage();
      }, { once: true });
      nextImage.src = source;
      return;
    }
    renderFilmPreviewImage();
  }

  function formatTime(hour) {
    const whole = Math.floor(Number(hour));
    const minutes = Math.round((Number(hour) - whole) * 60);
    return `${String(whole).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  function solarWindow() {
    const season = activeSeason();
    let sunrise = Number(season.sunrise || 6);
    let sunset = Number(season.sunset || 18);
    let maxElevation = Number(season.max_sun_elevation || 50);
    const tropicalIds = new Set(["jungle", "mangrove", "monsoon_forest", "tropical_island", "savanna"]);
    const highLatitudeIds = new Set(["taiga", "tundra", "glacier"]);
    if (tropicalIds.has(state.terrainId)) {
      sunrise = 5.8;
      sunset = 18.2;
      maxElevation = state.seasonKey === "winter" ? 68 : 82;
    } else if (highLatitudeIds.has(state.terrainId)) {
      const highLatitude = {
        spring: [5.2, 19.8, 38], summer: [3.2, 22.3, 54],
        autumn: [6.8, 17.1, 25], winter: [9.2, 14.8, 9]
      }[state.seasonKey] || [6, 18, 35];
      [sunrise, sunset, maxElevation] = highLatitude;
    } else if (["desert", "salt_lake", "badland"].includes(state.terrainId)) {
      maxElevation += 7;
    } else if (state.terrainId === "mediterranean") {
      sunrise -= 0.2;
      sunset += 0.25;
      maxElevation += 4;
    } else if (["high_mountain", "mid_mountain", "plateau", "canyon"].includes(state.terrainId)) {
      sunrise += 0.2;
      sunset -= 0.2;
      maxElevation -= 2;
    }
    if (!tropicalIds.has(state.terrainId) && !highLatitudeIds.has(state.terrainId)) {
      const phaseShift = {
        spring: { early: 0.65, mid: 0, late: -0.65 },
        summer: { early: 0.15, mid: 0, late: 0.45 },
        autumn: { early: -0.45, mid: 0, late: 0.75 },
        winter: { early: -0.25, mid: 0, late: -0.55 }
      }[state.seasonKey]?.[state.phaseKey] || 0;
      sunrise += phaseShift;
      sunset -= phaseShift;
    }
    return { sunrise, sunset, maxElevation: Math.max(4, maxElevation + phaseSunAdjustment()) };
  }

  function daypartForTime(hour = state.timeHour) {
    const { sunrise, sunset } = solarWindow();
    const noon = (sunrise + sunset) / 2;
    let key = "night";
    if (hour < sunrise - 1.5 || hour >= sunset + 1.5) key = "night";
    else if (hour < sunrise) key = "dawn";
    else if (hour < sunrise + 1) key = "golden_morning";
    else if (hour < noon - 1) key = "morning";
    else if (hour <= noon + 1) key = "noon";
    else if (hour < sunset - 1) key = "afternoon";
    else if (hour < sunset) key = "golden_evening";
    else key = "twilight";
    const labels = {
      dawn: "Hajnal",
      golden_morning: "Reggeli aranyóra",
      morning: "Délelőtt",
      noon: "Déli fény",
      afternoon: "Délután",
      golden_evening: "Esti aranyóra",
      twilight: "Alkonyat",
      night: "Éjszaka"
    };
    const prompts = {
      dawn: "pre-dawn blue light",
      golden_morning: "low-angle warm morning golden-hour light",
      morning: "clean directional morning light",
      noon: "high midday sun",
      afternoon: "directional afternoon daylight",
      golden_evening: "low-angle warm evening golden-hour light",
      twilight: "cool blue-hour twilight",
      night: "nighttime ambient light"
    };
    return { key, label: labels[key], prompt: prompts[key] };
  }

  function phaseSunAdjustment() {
    const table = {
      spring: { early: -8, mid: 0, late: 8 },
      summer: { early: -3, mid: 2, late: -7 },
      autumn: { early: 5, mid: 0, late: -8 },
      winter: { early: 2, mid: -2, late: 4 }
    };
    return table[state.seasonKey]?.[state.phaseKey] || 0;
  }

  function sunElevation(hour = state.timeHour) {
    const { sunrise, sunset, maxElevation } = solarWindow();
    if (hour >= sunrise && hour <= sunset) {
      const progress = (hour - sunrise) / Math.max(1, sunset - sunrise);
      return maxElevation * Math.sin(progress * Math.PI);
    }
    const beforeSunrise = (sunrise - hour + 24) % 24;
    const afterSunset = (hour - sunset + 24) % 24;
    return -Math.min(24, Math.min(beforeSunrise, afterSunset) * 6);
  }

  function naturalBaseEv(elevation = sunElevation()) {
    if (elevation >= 45) return 15.5;
    if (elevation >= 20) return 14.5;
    if (elevation >= 8) return 12.5;
    if (elevation >= 0) return 8.5;
    if (elevation >= -6) return 5.5;
    if (elevation >= -12) return 1.5;
    if (elevation >= -18) return -2;
    return -6;
  }

  function lightPrompt() {
    const elevation = sunElevation();
    if (elevation < -12) return "very low night exposure, no direct solar key light";
    if (elevation < 0) return "blue-hour or twilight ambient light, no direct solar key light";
    if (["cloud", "rain", "storm", "fog", "mist", "hail", "sleet", "snow_shower", "sandstorm", "tornado", "waterspout", "blowing_snow"].includes(state.weatherKey)) return "weather-softened diffuse light, muted shadows, lower contrast on the face";
    if (["snow", "rime"].includes(state.weatherKey)) return "snow-reflected ambient light, bright ground bounce, cool highlights";
    if (state.weatherKey === "aurora") return "low natural auroral glow in a dark sky, no direct solar key light";
    if (daypartForTime().key.includes("golden")) return "warm low-angle golden-hour key light, long coherent shadows";
    if (elevation > 45) return "strong high sun with clear facial shadow logic";
    return "natural directional daylight with coherent shadows";
  }

  function foregroundWeatherInteractionPrompt() {
    const prompts = {
      sandstorm: "wind-driven fine sand and ochre dust visibly cross the foreground and pass in front of the model's face and clothing in coherent directional streaks; partial natural atmospheric occlusion with the eyes and defining facial features still readable, no clean cutout around the subject",
      rain: "rain streaks occupy the foreground and pass naturally in front of the model's face and clothing; realistic wet skin and fabric response with the eyes still readable",
      storm: "wind-driven rain and fine atmospheric spray cross the foreground and partially pass in front of the model's face, with physically coherent direction and retained facial readability",
      snow: "snowflakes appear across foreground, subject plane and background, including flakes naturally passing in front of the model's face without hiding the eyes",
      snow_shower: "dense wind-driven snow crosses the foreground and subject plane, with some flakes visibly passing in front of the model's face and clothing while key facial features remain readable",
      blowing_snow: "streaming snow and fine ice crystals pass through the foreground and across the model's face and clothing in the same coherent wind direction, creating partial but realistic atmospheric occlusion",
      hail: "visible hail and rain occupy the foreground and pass across the subject plane, with physically plausible motion and no artificial clear zone around the model",
      sleet: "mixed rain and wet snow pass through the foreground and in front of the model's face and clothing, retaining natural facial readability",
      fog: "foreground fog softly overlaps the model's lower silhouette and partially veils the face at very low density, with eyes and facial identity retained",
      mist: "thin foreground mist overlaps the subject naturally instead of stopping behind the model, preserving clear facial identity"
    };
    return prompts[state.weatherKey] || "";
  }

  function standaloneForegroundWeatherInteractionPrompt() {
    const prompts = {
      sandstorm: "wind-driven fine sand and ochre dust cross the foreground and partially veil terrain and architecture in coherent directional streaks, while key environmental forms remain readable",
      rain: "rain streaks occupy the foreground and create physically plausible wet ground, vegetation and architectural surfaces",
      storm: "wind-driven rain and fine atmospheric spray cross the foreground with a physically coherent direction and natural partial environmental occlusion",
      snow: "snowflakes occupy foreground, middle distance and background with coherent depth and natural accumulation on exposed surfaces",
      snow_shower: "dense wind-driven snow crosses the foreground and middle distance while key environmental forms remain readable",
      blowing_snow: "streaming snow and fine ice crystals pass through the foreground in one coherent wind direction, creating realistic partial environmental occlusion",
      hail: "visible hail and rain occupy the foreground with physically plausible motion, wet surfaces and no artificial clear zone",
      sleet: "mixed rain and wet snow pass through the foreground with natural depth, wet surfaces and coherent motion",
      fog: "foreground fog overlaps terrain and architecture naturally, softening depth while preserving the main environmental forms",
      mist: "thin foreground mist overlaps the environment naturally instead of stopping behind foreground objects"
    };
    return prompts[state.weatherKey] || "";
  }

  function standaloneWindPrompt() {
    if (state.crowdLevel !== "contextual") return activeWind().prompt;
    return ({
      calm: "still air, motionless foliage and calm water surfaces",
      breeze: "gentle breeze, subtly stirring leaves, grass and loose environmental materials",
      moderate: "moderate wind, controlled movement in grass and foliage, lightly rippled water and moving loose environmental materials",
      strong: "strong wind, bending grasses, moving tree branches, wind-ruffled water and clearly directional airborne particles",
      gale: "gale-force wind, strongly bending vegetation with airborne leaves, dust or spray and physically coherent environmental motion",
      hurricane: "extreme hurricane-force wind, severely bent vegetation, airborne spray and debris and physically realistic environmental stress"
    })[state.windKey] || activeWind().prompt;
  }

  function standaloneWindDirectionPrompt() {
    return windDirectionPrompt().replace(/hair, scarves, loose clothing,\s*/gi, state.crowdLevel === "contextual" ? "loose environmental materials, " : "visible people's hair, scarves and loose clothing, ");
  }

  function standaloneLightPrompt() {
    return lightPrompt()
      .replace(/on the face/gi, "across the scene")
      .replace(/facial shadow logic/gi, "environmental shadow logic");
  }

  function averageTemperatureC() {
    if (state.environmentMode === "interior") return 22;
    const seasonalBases = {
      tropical: { spring: 27, summer: 27, autumn: 27, winter: 25 },
      savanna: { spring: 27, summer: 29, autumn: 27, winter: 23 },
      desert: { spring: 25, summer: 38, autumn: 28, winter: 16 },
      mediterranean: { spring: 18, summer: 30, autumn: 22, winter: 12 },
      temperate: { spring: 12, summer: 27, autumn: 10, winter: -4 }
    };
    const climate = ["jungle", "mangrove", "monsoon_forest", "tropical_island"].includes(state.terrainId) ? "tropical"
      : state.terrainId === "savanna" ? "savanna"
        : ["desert", "salt_lake", "badland", "egyptian_pyramids", "oasis", "sand_sea_erg", "rock_desert_hamada"].includes(state.terrainId) ? "desert"
          : state.terrainId === "mediterranean" ? "mediterranean" : "temperate";
    const base = seasonalBases[climate][state.seasonKey] ?? 15;
    const terrainOffset = climate === "temperate" ? terrain().temp : 0;
    const phase = PHASES[state.phaseKey]?.temp?.[state.seasonKey] || 0;
    const daypart = ({ dawn: -4, golden_morning: -2, morning: 0, noon: 3, afternoon: 2, golden_evening: 0, twilight: -2, night: -5 }[daypartForTime().key] ?? 0);
    const weather = ({ sun: 2, partly: 0, cloud: -2, rain: -4, storm: -6, snow: -7, snow_shower: -7, fog: -3, mist: -1, rime: -6, sandstorm: -2, aurora: -7, rainbow: 0, hail: -6, sleet: -6, mirage: 4, tornado: -5, dust_devil: 3, waterspout: -4, blowing_snow: -8 }[state.weatherKey] ?? 0);
    return Math.max(-35, Math.min(48, Math.round(base + phase + terrainOffset + daypart + weather)));
  }

  function automaticTemperatureC() {
    return Math.max(-35, Math.min(48, averageTemperatureC() + Number(state.temperatureOffset || 0)));
  }

  function formatTemperature(value) {
    const rounded = Math.round(Number(value) || 0);
    return `${rounded > 0 ? "+" : ""}${rounded} °C`;
  }

  function temperatureDescriptor(temperature = automaticTemperatureC()) {
    if (temperature <= -15) return "extrém hideg";
    if (temperature <= 0) return "fagyos";
    if (temperature <= 8) return "hideg";
    if (temperature <= 18) return "hűvös";
    if (temperature <= 27) return "enyhe meleg";
    if (temperature <= 34) return "meleg";
    if (temperature <= 39) return "hőterhelés";
    return "extrém hőség";
  }

  function temperatureDescriptorEn(temperature = automaticTemperatureC()) {
    if (temperature <= -15) return "extreme cold";
    if (temperature <= 0) return "freezing conditions";
    if (temperature <= 8) return "cold conditions";
    if (temperature <= 18) return "cool conditions";
    if (temperature <= 27) return "mild warmth";
    if (temperature <= 34) return "warm conditions";
    if (temperature <= 39) return "high heat load";
    return "extreme heat";
  }

  function bodyReactionProfile() {
    const temperature = automaticTemperatureC();
    if (state.environmentMode === "interior") return {
      label: "Stabil beltéri komfort",
      prompt: "thermally comfortable indoor body response, natural matte skin, no weather exposure, no rain or snow on the subject"
    };
    if (["rain", "storm"].includes(state.weatherKey)) return {
      label: "Nedves haj, vízcseppek, tapadó textúrák",
      prompt: "wet hair strands, realistic water droplets on skin, damp fabric texture reacting to rain"
    };
    if (state.weatherKey === "snow" || temperature <= 0) return {
      label: "Látható párás lehelet, hidegpír",
      prompt: "visible condensed breath in cold air, naturally reddened cheeks and nose, subtle physical tension against freezing temperature"
    };
    if (temperature <= 8) return {
      label: "Hűvös bőrtónus, enyhe lehelet",
      prompt: "cool skin tone, faint breath in chilly air, subtle tension against cold"
    };
    if (temperature <= 18) return {
      label: "Hűvös reakciók, réteges komfort",
      prompt: "cool-weather body response, calm matte skin, no visible sweat, posture and styling suited to layered clothing"
    };
    if (temperature >= 40) return {
      label: "Extrém hőség, dehidratációs jelek",
      prompt: "extreme heat response, visible dehydration signs, stronger perspiration, heat shimmer in the air, flushed skin, dry slightly cracked lips"
    };
    if (temperature >= 35 || state.terrainId === "desert") return {
      label: "Hőterhelés, erősebb izzadás",
      prompt: "realistic heat stress, stronger perspiration along the hairline and temples, warm flushed skin, dry lips, slightly strained heat response"
    };
    if (temperature >= 28) return {
      label: "Látható izzadás és kipirulás",
      prompt: "visible but realistic perspiration, lightly flushed warm skin, breathable light-clothing heat response"
    };
    return {
      label: "Enyhe meleg, természetes bőrfény",
      prompt: "mild warmth, natural healthy skin glow, relaxed thermally comfortable appearance"
    };
  }

  function resolvedOutfit() {
    const custom = clean(state.customOutfit);
    if (custom) return { label: "Egyéni", prompt: `custom outfit: ${custom}` };
    if (state.environmentMode === "interior") return {
      label: "Beltéri",
      prompt: `indoor-appropriate clothing suited to the function and formality of the location, ${terrain().outfit}`
    };
    const temperature = automaticTemperatureC();
    let base = "";
    if (["rain", "storm"].includes(state.weatherKey)) base = "weather-appropriate rain clothing, waterproof outer layer, damp fabric behavior";
    else if (state.weatherKey === "snow" || temperature <= 0) base = "weather-appropriate winter clothing, insulated coat, warm layers, gloves where visible, no exposed summer clothing";
    else if (temperature <= 18) base = "weather-appropriate layered transitional clothing, medium-weight jacket, long trousers, closed shoes";
    else if (temperature >= 28) base = "weather-appropriate lightweight summer clothing, breathable fabrics, heat-adapted styling";
    else base = "comfortable weather-appropriate outdoor clothing, natural fabric movement";
    return { label: "Automatikus", prompt: `${base}, ${terrain().outfit}` };
  }

  function vegetationState() {
    if (state.environmentMode === "interior") return {
      hu: "beltéri környezet, a külső évszak csak az ablakon át érzékelhető",
      en: "interior environment, exterior season visible only through windows or entrances, no outdoor vegetation inside unless architecturally intended"
    };
    if (state.environmentMode === "built") return {
      hu: state.terrainId === "egyptian_pyramids"
        ? "sivatagi régészeti környezet, csak természetesen előforduló gyér növényzettel"
        : "épített környezet, helyszínhez és évszakhoz illő visszafogott városi növényzet",
      en: state.terrainId === "egyptian_pyramids"
        ? "desert archaeological environment with only sparse naturally occurring vegetation"
        : "built environment with restrained location-appropriate urban vegetation in a seasonally plausible state"
    };
    const phase = PHASES[state.phaseKey]?.label.toLowerCase() || "közepe";
    const season = activeSeason().label.toLowerCase();
    const type = terrain().phenology;
    const typeEn = ({
      "alpesi": "alpine",
      "dombsági": "rolling-hill countryside",
      "fennsíki füves": "plateau grassland",
      "folyóparti": "riparian",
      "füves síksági": "lowland grassland",
      "gleccser": "glacial",
      "hangás-lápos felföldi": "heather moorland and upland wetland",
      "karsztos száraz gyep": "dry karst grassland",
      "kopár homokkő-badland": "sparse sandstone badland",
      "középhegységi erdei": "temperate mid-mountain forest",
      "lombhullató erdei": "temperate deciduous forest",
      "mangrove trópusi": "tropical mangrove",
      "mediterrán száraz": "dry Mediterranean",
      "mocsári-lápi": "marsh and peatland",
      "monzunerdei": "monsoon forest",
      "parti": "coastal",
      "sivatagi": "desert",
      "szavannai": "savanna",
      "szikes-sóstavi": "salt-lake and alkali plain",
      "sztyeppi füves": "temperate steppe grassland",
      "szurdokvölgyi": "gorge and canyon-valley",
      "tajgai tűlevelű": "boreal conifer",
      "tóparti": "lakeshore",
      "trópusi örökzöld": "tropical evergreen rainforest",
      "trópusi parti": "tropical island coast",
      "tundrai": "tundra",
      "vulkanikus kopár": "sparse volcanic terrain"
    })[type] || "native";
    const phaseEn = ({ early: "early", mid: "peak", late: "late" })[state.phaseKey] || "peak";
    const climateSeasonEn = (() => {
      const tropicalEvergreen = ["jungle", "mangrove", "tropical_island"];
      if (tropicalEvergreen.includes(state.terrainId)) {
        const cycle = {
          spring: "pre-monsoon tropical transition with active evergreen growth",
          summer: "tropical wet season with lush evergreen growth and high humidity",
          autumn: "late tropical wet season with saturated foliage and receding rainfall",
          winter: "tropical dry season with the evergreen canopy fully retained"
        };
        return `${phaseEn} ${cycle[state.seasonKey]}`;
      }
      if (state.terrainId === "monsoon_forest") {
        const cycle = {
          spring: "pre-monsoon warming phase with rapidly developing foliage",
          summer: "monsoon wet season with dense fresh foliage and saturated ground",
          autumn: "retreating monsoon phase with mature foliage and declining rainfall",
          winter: "tropical dry season with seasonally reduced foliage and drier ground"
        };
        return `${phaseEn} ${cycle[state.seasonKey]}`;
      }
      if (state.terrainId === "savanna") {
        const cycle = {
          spring: "savanna pre-rain transition with new grass growth",
          summer: "savanna wet season with tall green grasses and active growth",
          autumn: "savanna drying transition with fading grasses and ripening seed heads",
          winter: "savanna dry season with sun-cured grasses and sparse green growth"
        };
        return `${phaseEn} ${cycle[state.seasonKey]}`;
      }
      if (["desert", "salt_lake", "badland", "egyptian_pyramids", "oasis", "sand_sea_erg", "rock_desert_hamada"].includes(state.terrainId)) {
        const cycle = {
          spring: "arid spring growth window following rare moisture",
          summer: "hyper-arid desert hot season with dormant drought-adapted vegetation",
          autumn: "arid cooling transition with sparse persistent scrub",
          winter: "cool arid season with minimal drought-adapted plant activity"
        };
        return `${phaseEn} ${cycle[state.seasonKey]}`;
      }
      if (state.terrainId === "mediterranean") {
        const cycle = {
          spring: "Mediterranean spring growth and flowering season",
          summer: "Mediterranean hot dry season with sun-cured grasses and drought-adapted evergreen foliage",
          autumn: "Mediterranean first-rain recovery with renewed low vegetation",
          winter: "Mediterranean cool wet growing season with evergreen structure retained"
        };
        return `${phaseEn} ${cycle[state.seasonKey]}`;
      }
      if (["high_mountain", "glacier", "taiga", "tundra"].includes(state.terrainId)) {
        const zone = state.terrainId === "taiga" ? "boreal" : state.terrainId === "tundra" ? "subpolar" : "alpine and glacial";
        return `${phaseEn} ${state.seasonKey} season in a ${zone} climate, locally plausible plant and snow state`;
      }
      return `${phaseEn} ${state.seasonKey} season in a temperate regional climate, seasonally plausible plant state`;
    })();
    const hu = `${type} növényzet, ${season} ${phase}, a táj éghajlatához igazodó állapotban`;
    const en = `${typeEn} vegetation, ${climateSeasonEn}`;
    return { hu, en };
  }

  function selectedFilmIso() {
    if (FILM_ISO_VALUES[state.photo.film]) return FILM_ISO_VALUES[state.photo.film];
    const match = (state.photo.film || "").match(/(\d{2,4})(?:T)?$/i);
    return match ? Number(match[1]) : null;
  }

  function formatShutter(seconds) {
    if (seconds >= 1) return `${Number(seconds.toFixed(1)).toLocaleString("hu-HU")} s`;
    return `1/${Math.round(1 / seconds)} s`;
  }

  function computeCameraSettings() {
    const weather = activeWeather();
    const direction = activeDirection();
    const interiorSourceEv = ({ window: naturalBaseEv() - 1, ceiling: 7, studio: 10, practical: 5, mixed: 8 })[state.interiorLightSource] ?? 7;
    const interiorCharacterModifier = ({ soft: -0.5, even: 0.5, directional: 0, low_key: -2 })[state.interiorLightCharacter] ?? 0;
    const exteriorWeatherInfluence = ["window", "mixed"].includes(state.interiorLightSource) ? Number(weather.ev_modifier || 0) * 0.5 : 0;
    const ev = state.environmentMode === "interior"
      ? Math.max(-8, Math.min(16, interiorSourceEv + interiorCharacterModifier + exteriorWeatherInfluence))
      : Math.max(-8, Math.min(16, naturalBaseEv() + Number(weather.ev_modifier || 0) + terrain().light - Number(direction.exposure_compensation || 0)));
    const iso = selectedFilmIso() || (ev < 0 ? 1600 : ev < 7 ? 800 : ev < 12 ? 400 : 100);
    const automaticAperture = ev >= 14 ? 8 : ev >= 11 ? 5.6 : ev >= 8 ? 4 : ev >= 5 ? 2.8 : ev >= 1 ? 2 : 1.8;
    const preferredAperture = LENS_APERTURE_TARGETS[compatibleLensName()] || automaticAperture;
    const targetAperture = ev < 5 ? Math.min(preferredAperture, 2.8) : ev < 9 ? Math.min(preferredAperture, 4) : preferredAperture;
    const exactSeconds = (targetAperture ** 2) / ((2 ** ev) * (iso / 100));
    const seconds = SHUTTER_SPEEDS.reduce((closest, value) => Math.abs(value - exactSeconds) < Math.abs(closest - exactSeconds) ? value : closest);
    const rawAperture = Math.sqrt(seconds * (2 ** ev) * (iso / 100));
    const aperture = APERTURES.reduce((closest, value) => Math.abs(value - rawAperture) < Math.abs(closest - rawAperture) ? value : closest);
    const daypart = daypartForTime().key;
    const kelvin = state.environmentMode === "interior"
      ? ({ warm: 3200, neutral: 4000, daylight: 5600, mixed: 4300 })[state.interiorColorTemperature] || 5600
      : daypart.includes("golden") ? 4800
      : daypart === "twilight" ? 7500
        : daypart === "night" ? 4100
          : ["rain", "storm"].includes(state.weatherKey) ? 7200
            : state.weatherKey === "cloud" ? 6800
              : state.weatherKey === "snow" ? 6800 : 5600;
    return { ev, iso, shutter: formatShutter(seconds), aperture, kelvin, prompt: `${formatShutter(seconds)}, f/${aperture}, ISO ${iso}, ${kelvin} K white balance` };
  }

  function orientationPrompt() {
    const row = (database.tbl_kepformatum || []).find((item) => item.formatum_id === state.orientation);
    return clean(row?.formatum_prompt || (state.orientation.includes("16:9")
      ? "landscape orientation, horizontal 16:9 composition"
      : state.orientation.includes("1:1") ? "square 1:1 composition, balanced framing" : "portrait orientation, vertical 4:5 composition"));
  }

  function modelThirdPrompt() {
    if (!state.orientation.includes("16:9")) return "";
    return MODEL_THIRDS.find((item) => item.key === state.modelThird)?.prompt || MODEL_THIRDS[1].prompt;
  }

  function fieldPrompt(field, value) {
    if (Array.isArray(value)) return value.map((item) => fieldPrompt(field, item)).filter(Boolean);
    const row = findRow(field, value);
    return row ? clean(row[field[4]]) : "";
  }

  function faceBackgroundConflictsWithEyes(background = state.faceBackground) {
    const eyeColor = normalizePromptText(state.face.szemszin || "");
    if (background === "green") return eyeColor.includes("zold");
    if (background === "blue") return eyeColor.includes("kek");
    return false;
  }

  function faceBackgroundConflictsWithOutfit(background = state.faceBackground) {
    const outfitText = normalizePromptText([state.customOutfit, resolvedOutfit()?.prompt].filter(Boolean).join(" "));
    if (background === "green") return /\b(?:green|zold|olive|oliva|lime|emerald|smaragd)\b/.test(outfitText);
    if (background === "blue") return /\b(?:blue|kek|cyan|cian|navy|tengereszkek|turquoise|turkiz)\b/.test(outfitText);
    return false;
  }

  function faceBackgroundConflictReason(background = state.faceBackground) {
    if (faceBackgroundConflictsWithEyes(background)) return "Az azonos színű szem miatt ez a háttér nem használható.";
    if (faceBackgroundConflictsWithOutfit(background)) return "Az öltözet azonos vagy közeli színe miatt ez a háttér nem használható.";
    return "";
  }

  function faceBackgroundPrompt() {
    if (faceBackgroundConflictReason()) return "";
    if (state.faceBackground === "green") {
      return "evenly lit chroma key green screen background, seamless uniform pure green backdrop, clean subject-edge separation, no cast shadow on the backdrop, no green spill on skin or hair, no green or green-adjacent clothing or accessories";
    }
    if (state.faceBackground === "blue") {
      return "evenly lit chroma key blue screen background, seamless uniform pure blue backdrop, clean subject-edge separation, no cast shadow on the backdrop, no blue spill on skin or hair, no blue or blue-adjacent clothing or accessories";
    }
    return "";
  }

  function strictBodyFramingPrompt() {
    if (state.specialShotMode) return "";
    const selectedPositionPrompt = normalizePromptText(fieldPrompt(POSITION_FIELD, state.face.position));
    if (!/three[- ]quarter length/.test(selectedPositionPrompt)) return "";
    return "strict composition requirement: three-quarter-length portrait framing, the subject is continuously visible from the top of the head to approximately mid-thigh, with head, shoulders, torso, hips and upper legs all inside the frame; camera pulled back far enough to preserve this exact head-to-mid-thigh crop; do not crop at the chest or waist, and do not show the full body";
  }

  function generatedFacePrompt() {
    const ageField = FACE_FIELDS.find(([key]) => key === "eletkor");
    const identityField = FACE_FIELDS.find(([key]) => key === "identitas");
    const agePrompt = fieldPrompt(ageField, state.face.eletkor);
    const identityPrompt = fieldPrompt(identityField, state.face.identitas);
    const parts = FACE_FIELDS.map((field) => {
      const [key] = field;
      if (key === "hajstilus" && !hairStyleMatchesSelections(state.face.hajstilus, state.face.hajhossz, state.face.hajsuruseg)) return "";
      if (key === "hajszin" && state.face.hajszin === "Melírozott / többszínű") {
        return `two-tone highlighted hair, base color ${state.face.hajAlapszin || "#3b2416"}, dyed highlight color ${state.face.hajMelirszin || "#b55239"}`;
      }
      const prompt = fieldPrompt(field, state.face[key]);
      if (Array.isArray(prompt)) return prompt;
      if (!prompt) return "";
      if (key === "eletkor" && prompt === "young adult") return `young adult ${identityPrompt === "female" ? "woman" : identityPrompt === "male" ? "man" : "person"}`;
      if (key === "identitas" && agePrompt === "young adult") return "";
      if (key === "altipus") return `${prompt} facial features`;
      return prompt;
    });
    return sanitizePrompt([orientationPrompt(), modelThirdPrompt(), ...parts, faceBackgroundPrompt(), strictBodyFramingPrompt()]).toLowerCase();
  }

  function randomArrayItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function selectedHumanIdentityPrompt() {
    const identityKeys = new Set([
      "altipus", "eletkor", "identitas", "testalkat", "koponya", "jaromcsont", "allkapocs", "bortonus",
      "szemforma", "ajkak", "homlok", "szemoldokForma", "szemoldokSuruseg", "szemszin", "irisz", "orr",
      "arcjegyek", "bortextura", "hajszin", "hajhossz", "hajsuruseg", "hajstilus", "tekintet", "arckifejezes"
    ]);
    return sanitizePrompt(FACE_FIELDS
      .filter(([key]) => identityKeys.has(key))
      .map((field) => fieldPrompt(field, state.face[field[0]])));
  }

  function generateAiPortrait({ hybrid = false } = {}) {
    const archetype = randomArrayItem(AI_PORTRAIT_ARCHETYPES);
    const prompt = sanitizePrompt([
      hybrid
        ? "original human-AI hybrid character portrait combining the currently selected human identity with a speculative synthetic or fantasy transformation"
        : "original standalone artificial-intelligence character portrait",
      hybrid ? `selected human identity: ${selectedHumanIdentityPrompt()}` : archetype.subject,
      hybrid ? randomArrayItem(AI_HYBRID_INTEGRATIONS) : archetype.design,
      hybrid ? `AI or fantasy design language: ${archetype.design}` : archetype.mood,
      hybrid ? "retain an emotionally readable human gaze and individual facial identity beneath the transformation" : "coherent engineered or organic anatomy, no costume pretending to be a robot",
      randomArrayItem(AI_PORTRAIT_FRAMINGS),
      randomArrayItem(AI_PORTRAIT_LIGHTING),
      randomArrayItem(AI_PORTRAIT_BACKGROUNDS),
      randomArrayItem(AI_PORTRAIT_RENDERING),
      "sharp expressive eyes, refined facial hierarchy, believable depth and material transitions",
      "no readable text, no logo, no watermark, no duplicated facial features, no extra eyes, no malformed mechanics"
    ]);
    if (elements.aiPortraitPrompt) elements.aiPortraitPrompt.value = prompt;
    if (elements.aiPortraitPromptTitle) elements.aiPortraitPromptTitle.textContent = hybrid
      ? "Önálló ember + AI portré prompt"
      : "Önálló AI portré prompt";
    if (elements.aiPortraitPromptStats) elements.aiPortraitPromptStats.textContent = promptStatsText(prompt);
    byId("aiPortraitPromptTab")?.click();
    showToast(hybrid ? "Ember + AI portré prompt elkészült" : "AI portré prompt elkészült");
  }

  function specialShotPrompt({ standalone = false } = {}) {
    const customSubject = clean(state.specialShotSubject);
    const subject = customSubject || (standalone ? "a location-appropriate environmental detail" : "the selected model");
    if (state.specialShotMode === "macro") {
      const context = state.environmentMode === "interior"
        ? "interior material, object or architectural detail in its spatially coherent indoor context"
        : "terrain-specific natural microhabitat";
      return `true macro detail photograph of ${subject}, life-size or greater magnification, critical focal detail on the subject, ${context}, physically natural shallow depth of field`;
    }
    if (state.specialShotMode === "supertele") {
      if (!customSubject) return standalone
        ? "supertelephoto environmental photograph of a location-appropriate distant detail, compressed background layers, no designated primary person"
        : "supertelephoto environmental portrait of the selected model, face and eyes as the unequivocal primary focus, tack-sharp natural facial detail, compressed terrain background with controlled organic separation";
      return `supertelephoto close view of ${subject}, distant subject framed within the selected terrain, strong but realistic perspective compression, critical detail on the subject, natural atmospheric layers`;
    }
    return "";
  }

  function customLocationPrompt() {
    const location = clean(state.customLocation);
    return state.environmentMode === "built" && location
      ? `specific real-world settlement or location reference: ${location}, preserve recognizable geographic and architectural character without adding readable text`
      : "";
  }

  function interiorLightingPrompt() {
    const source = ({
      window: "natural window light as the primary interior source",
      ceiling: "architectural ceiling lighting as the primary interior source",
      studio: "controlled professional studio lighting with softbox shaping",
      practical: "visible practical lamps motivating the interior illumination",
      mixed: "balanced mixture of natural window light and artificial architectural lighting"
    })[state.interiorLightSource] || "natural window light as the primary interior source";
    const character = ({
      soft: "soft diffused light with gentle physically coherent shadows",
      even: "bright even illumination with controlled contrast",
      directional: "clearly directional interior light with readable shadow logic",
      low_key: "dramatic low-key interior lighting with preserved material detail"
    })[state.interiorLightCharacter] || "soft diffused light with gentle physically coherent shadows";
    const temperature = ({
      daylight: "daylight-balanced 5600 K color temperature",
      neutral: "neutral 4000 K architectural color temperature",
      warm: "warm 3200 K tungsten-like color temperature",
      mixed: "realistic mixed color temperature with locally coherent light sources"
    })[state.interiorColorTemperature] || "daylight-balanced 5600 K color temperature";
    const direction = ({
      side: "key illumination arriving from the side",
      front: "key illumination arriving from the camera-facing direction",
      back: "backlit interior composition with controlled rim separation",
      top: "top-directed architectural illumination",
      none: "no dominant window direction, illumination motivated by interior fixtures"
    })[state.interiorLightDirection] || "key illumination arriving from the side";
    return sanitizePrompt([source, character, temperature, direction, "realistic bounce light and material reflections appropriate to the room"]);
  }

  function generatedEnvironmentLayerPrompt() {
    const selected = selectedEnvironmentElements().map(([, , prompt]) => prompt);
    return sanitizePrompt([
      terrain().prompt,
      customLocationPrompt(),
      selected,
      vegetationState().en,
      specialShotPrompt(),
      crowdPresencePrompt(),
      state.environmentMode === "interior" ? "camera-facing interior architecture with believable room scale" : "camera-facing location elements, not a whole landscape panorama",
      "selected environmental elements are logically compatible"
    ]);
  }

  function generatedEnvironmentPrompt({ standalone = false } = {}) {
    const selected = selectedEnvironmentElements().map(([, , prompt]) => clean(prompt)
      .replace(/close to the camera/gi, "in the foreground")
      .replace(/behind the subject/gi, "across the distant background"));
    return sanitizePrompt([
      standalone
        ? state.environmentMode === "interior"
          ? "photorealistic architectural interior photograph, wide establishing view, no designated primary person"
          : state.environmentMode === "built"
            ? "photorealistic built-environment and architectural photograph, wide establishing view, no designated primary person"
            : "photorealistic landscape photograph, wide establishing view, no designated primary person"
        : state.environmentMode === "interior"
        ? "photorealistic architectural interior photograph, wide establishing view"
        : state.environmentMode === "built"
          ? "photorealistic built-environment and architectural photograph, wide establishing view"
          : state.specialShotMode === "supertele" && !clean(state.specialShotSubject)
            ? "photorealistic environmental portrait, landscape-oriented frame, selected model as the primary subject"
            : state.specialShotMode ? "photorealistic nature photograph" : "photorealistic landscape, wide establishing view",
      orientationPrompt(),
      terrain().prompt,
      customLocationPrompt(),
      selected,
      vegetationState().en,
      specialShotPrompt({ standalone }),
      crowdPresencePrompt({ standalone }),
      state.environmentMode === "interior" ? "coherent near, middle and far architectural depth, believable room proportions and circulation" : state.specialShotMode ? "selected environmental elements retained as believable habitat context" : "coherent foreground, midground and background, strong natural depth, clearly readable horizon",
      state.specialShotMode ? "natural subject scale and physically plausible camera distance" : "selected environmental elements naturally integrated into one continuous landscape",
      state.environmentMode === "interior" ? "realistic architectural scale, materials, acoustics and functional spatial organization" : "realistic terrain and architectural scale, geographically and seasonally plausible context",
      "no text, no watermark"
    ]);
  }

  function generatedWeatherPrompt({ standalone = false } = {}) {
    const daypart = daypartForTime();
    const elevation = Math.round(sunElevation());
    const temperature = automaticTemperatureC();
    const body = bodyReactionProfile();
    const outfit = resolvedOutfit();
    const climateSeason = vegetationState().en.replace(/^[^,]+ vegetation,\s*/i, "");
    if (state.environmentMode === "interior") return sanitizePrompt([
      `interior light layer for ${terrain().prompt}`,
      `${formatTime(state.timeHour)} local time; exterior ${daypart.prompt}`,
      `${activeWeather().prompt} visible or implied only outside windows and entrances, no outdoor precipitation inside`,
      `${standalone ? standaloneWindPrompt() : activeWind().prompt} visible only in exterior vegetation, precipitation or the view beyond openings${standalone ? "" : ", indoor occupants and fabrics unaffected by outdoor wind"}`,
      windDirectionPrompt() ? `${standalone ? standaloneWindDirectionPrompt() : windDirectionPrompt()} applies only to the exterior wind field` : "",
      interiorLightingPrompt(),
      `conditioned indoor temperature approximately ${temperature} degrees Celsius, thermally comfortable interior`,
      standalone ? "" : body.prompt,
      standalone ? "" : outfit.prompt
    ]);
    if (state.terrainId === "natural_cave") return sanitizePrompt([
      `sheltered cave light layer for ${terrain().prompt}`,
      `${formatTime(state.timeHour)} local time; exterior ${daypart.prompt}`,
      `${activeWeather().prompt} visible or implied only beyond the cave entrance, no precipitation inside the cave chamber`,
      `${standalone ? standaloneWindPrompt() : activeWind().prompt} affects only the landscape outside the cave entrance, the cave chamber remains sheltered`,
      windDirectionPrompt() ? `${standalone ? standaloneWindDirectionPrompt() : windDirectionPrompt()} applies only beyond the cave entrance` : "",
      "low natural entrance light with physically plausible falloff into the cave, damp rock highlights remain controlled",
      "stable cool cave temperature approximately 12 degrees Celsius",
      standalone ? "" : "calm cool-weather body response without outdoor wind exposure",
      standalone ? "" : outfit.prompt
    ]);
    return sanitizePrompt([
      `weather and light layer for ${terrain().prompt}`,
      climateSeason,
      `${formatTime(state.timeHour)} local time, ${daypart.prompt}`,
      `sun altitude approximately ${elevation} degrees`,
      activeWeather().prompt,
      state.specialShotMode ? "" : standalone ? standaloneForegroundWeatherInteractionPrompt() : foregroundWeatherInteractionPrompt(),
      standalone ? standaloneWindPrompt() : activeWind().prompt,
      standalone ? standaloneWindDirectionPrompt() : windDirectionPrompt(),
      standalone ? standaloneLightPrompt() : lightPrompt(),
      standalone
        ? standaloneEnvironmentLightDirectionPrompt()
        : state.specialShotMode ? "natural terrain-consistent light direction on the chosen subject" : activeDirection().prompt,
      `air temperature approximately ${temperature} degrees Celsius, ${temperatureDescriptorEn(temperature)}`,
      standalone || state.specialShotMode ? "" : body.prompt,
      standalone || state.specialShotMode ? "" : outfit.prompt
    ]);
  }

  function generatedPhotoPrompt({ modelFocus = false, standalone = false } = {}) {
    const camera = computeCameraSettings();
    const film = findRow(PHOTO_FIELDS.find(([key]) => key === "film"), state.photo.film);
    const lensName = compatibleLensName();
    const lens = findRow(PHOTO_FIELDS.find(([key]) => key === "objektiv"), lensName);
    const style = findRow(PHOTO_FIELDS.find(([key]) => key === "stilus"), state.photo.stilus);
    const stylePrompt = STYLE_PROMPTS[state.photo.stilus] || style?.leiras;
    const finishPrompt = PHOTOGRAPHIC_STYLE_NAMES.has(state.photo.stilus) || !state.photo.stilus
      ? standalone || state.specialShotMode ? NATURE_REALISM_PROMPT : PHOTO_REALISM_PROMPT
      : ARTWORK_QUALITY_PROMPT;
    const lensRendering = lensName === "Szupertele" && modelFocus
      ? "strong telephoto compression, selected model as the unequivocal primary focus, tack-sharp eyes and natural facial detail, controlled background defocus with retained organic terrain texture, no synthetic blur"
      : LENS_RENDERING_PROFILES[lensName];
    const effectPrompts = selectedLensEffects().map((effect) => effect.prompt);
    if (!effectPrompts.length) effectPrompts.push("natural clean optical rendering, no lens flare, no light leak, no optical ghosting, no artificial glow");
    return sanitizePrompt([
      camera.prompt,
      film?.filmtipus_prompt,
      LENS_BASE_PROMPTS[lensName] || lens?.leiras,
      lensRendering,
      ...effectPrompts,
      stylePrompt,
      finishPrompt
    ]);
  }

  function prompts() {
    return {
      face: generatedFacePrompt(),
      environment: generatedEnvironmentPrompt(),
      landscapeEnvironment: generatedEnvironmentPrompt({ standalone: true }),
      environmentLayer: generatedEnvironmentLayerPrompt(),
      weather: generatedWeatherPrompt(),
      landscapeWeather: generatedWeatherPrompt({ standalone: true }),
      photo: generatedPhotoPrompt({ modelFocus: state.photo.objektiv === "Szupertele" }),
      landscapePhoto: generatedPhotoPrompt({ modelFocus: false, standalone: true })
    };
  }

  function promptForPage(all = prompts()) {
    return all[PAGE] || all.face;
  }

  function chromaScreenActive() {
    return ["green", "blue"].includes(state.faceBackground) && !faceBackgroundConflictReason();
  }

  function fullPromptText(all = prompts()) {
    if (chromaScreenActive()) return sanitizePrompt([all.face, strictBodyFramingPrompt()], true);
    if (state.photo.objektiv === "Szupertele") {
      return sanitizePrompt([all.face, all.environmentLayer || all.environment, all.weather, all.photo, strictBodyFramingPrompt()], true);
    }
    return state.specialShotMode
      ? sanitizePrompt([all.environment, all.weather, all.photo], true)
      : sanitizePrompt([all.face, all.environmentLayer || all.environment, all.weather, all.photo, strictBodyFramingPrompt()], true);
  }

  function landscapePhotoPromptText(all = prompts()) {
    if (chromaScreenActive()) return sanitizePrompt([faceBackgroundPrompt()], true);
    return sanitizePrompt([all.landscapeEnvironment || all.environment, all.landscapeWeather || all.weather, all.landscapePhoto || all.photo], true);
  }

  function promptStatsText(prompt, diagnostics = null) {
    const words = clean(prompt).split(/\s+/).filter(Boolean).length;
    const removed = diagnostics ? diagnostics.duplicates + diagnostics.conflicts : 0;
    const suffix = removed ? ` - ${diagnostics.duplicates} ismétlés, ${diagnostics.conflicts} ellentmondás szűrve` : "";
    return `${words} szó - ${prompt.length} karakter${suffix}`;
  }

  function selectedCount(values) {
    return Object.values(values || {}).filter(Boolean).length;
  }

  function renderSummary() {
    if (!elements.summaryGrid) return;
    const camera = computeCameraSettings();
    const t = (value) => window.I18N?.t(value) || value;
    const crowd = CROWD_LEVELS.find((item) => item.key === state.crowdLevel) || CROWD_LEVELS[0];
    const crowdLabel = window.I18N?.language === "en" ? crowd.labelEn : crowd.label;
    const cards = [
      [t("Arc"), t(`${selectedCount(state.face)} mező kitöltve`)],
      [t("Környezet"), `${t(state.environmentMode === "landscape" ? "Tájkép" : state.environmentMode === "built" ? "Épített" : "Beltér")}: ${environmentDisplayLabel(terrain().id, terrain().label)}${state.environmentMode === "built" && clean(state.customLocation) ? ` · ${clean(state.customLocation)}` : ""} - ${selectedEnvironmentElements().map(([id, label]) => environmentDisplayLabel(id, label)).join(", ")} · ${crowdLabel}${state.includeChildren ? ` · ${t("Gyerekekkel")}` : ""}`],
      [t("Időjárás"), `${t(activeSeason().label)} ${t(PHASES[state.phaseKey]?.label).toLowerCase()} - ${t(activeWeather().label)}${state.windKey === "calm" ? "" : ` - ${t(activeWind().label)}, ${t(activeWindDirection().label)}`} - ${formatTemperature(automaticTemperatureC())}`],
      [t("Fotó"), `${camera.shutter}, f/${camera.aperture}, ISO ${camera.iso}`]
    ];
    elements.summaryGrid.innerHTML = cards.map(([label, value]) => `
      <article><span>${label}</span><strong>${value || "-"}</strong></article>
    `).join("");
  }

  function updateScenePreview() {
    if (!elements.scenePreview) return;
    elements.scenePreview.dataset.terrain = state.terrainId;
    elements.scenePreview.dataset.environmentMode = state.environmentMode;
    elements.scenePreview.dataset.weather = state.weatherKey;
    elements.scenePreview.dataset.wind = state.windKey;
    elements.scenePreview.dataset.windDirection = state.windDirectionKey;
    elements.scenePreview.dataset.time = daypartForTime().key === "night" ? "night" : "day";
    const showEmptyPreview = () => {
      if (elements.sceneImage) {
        elements.sceneImage.hidden = true;
        elements.sceneImage.alt = "";
      }
      if (elements.scenePlaceholder) elements.scenePlaceholder.hidden = false;
      if (elements.scenePlaceholderTitle) elements.scenePlaceholderTitle.textContent = "Nincs téma kiválasztva";
    };
    if (!elements.sceneImage || !state.terrainId) {
      showEmptyPreview();
      return;
    }
    const previewSource = state.environmentMode === "landscape"
      ? terrainImagePath(state.terrainId)
      : `assets/environment/${state.environmentMode}/${state.terrainId}.webp`;
    elements.sceneImage.onload = () => {
      elements.sceneImage.hidden = false;
      elements.sceneImage.alt = state.environmentMode === "landscape"
        ? `${terrain().label} tájkép`
        : `${terrain().label} helyszín-előnézet`;
      if (elements.scenePlaceholder) elements.scenePlaceholder.hidden = true;
    };
    elements.sceneImage.onerror = showEmptyPreview;
    elements.sceneImage.hidden = true;
    if (elements.scenePlaceholder) elements.scenePlaceholder.hidden = false;
    if (elements.scenePlaceholderTitle) elements.scenePlaceholderTitle.textContent = "Nincs téma kiválasztva";
    elements.sceneImage.src = previewSource;
  }

  function updateTimeUi() {
    if (elements.timeSlider) elements.timeSlider.value = String(state.timeHour);
    if (elements.timeLabel) elements.timeLabel.textContent = formatTime(state.timeHour);
    const solar = solarWindow();
    if (elements.timePanel) {
      const daylight = Math.max(0, 1 - Math.abs(Number(state.timeHour) - 12) / 12);
      const night = [7, 22, 48];
      const day = [190, 146, 54];
      const rgb = night.map((value, index) => Math.round(value + (day[index] - value) * daylight));
      const darker = rgb.map((value) => Math.round(value * 0.52));
      elements.timePanel.style.background = `radial-gradient(circle at ${Math.max(8, Math.min(92, Number(state.timeHour) / 24 * 100))}% 18%, rgba(${rgb.join(",")}, 0.96), rgba(${darker.join(",")}, 0.98) 72%)`;
    }
    if (elements.sunLabel) elements.sunLabel.textContent = `${daypartForTime().label} · napmagasság ${Math.round(sunElevation())}° · napkelte ${formatTime(solar.sunrise)} · napnyugta ${formatTime(solar.sunset)}`;
    if (elements.temperatureOffset) elements.temperatureOffset.value = String(state.temperatureOffset);
    if (elements.averageTemperatureLabel) elements.averageTemperatureLabel.textContent = `Környezeti átlag: ${formatTemperature(averageTemperatureC())}`;
    if (elements.temperatureValue) elements.temperatureValue.textContent = formatTemperature(automaticTemperatureC());
    if (elements.temperatureCorrectionLabel) {
      const correction = Number(state.temperatureOffset || 0);
      elements.temperatureCorrectionLabel.textContent = `Korrekció: ${correction > 0 ? "+" : ""}${correction} °C · ${temperatureDescriptor()}`;
    }
    if (elements.customOutfit) elements.customOutfit.value = state.customOutfit || "";
  }

  function updatePromptUi() {
    const all = prompts();
    const prompt = promptForPage(all);
    const fullPrompt = fullPromptText(all);
    const landscapePrompt = landscapePhotoPromptText(all);
    if (elements.pagePrompt) elements.pagePrompt.value = prompt;
    if (elements.fullPrompt) elements.fullPrompt.value = fullPrompt;
    if (elements.landscapePhotoPrompt) elements.landscapePhotoPrompt.value = landscapePrompt;
    if (elements.landscapePhotoPromptTitle) {
      elements.landscapePhotoPromptTitle.textContent = chromaScreenActive()
        ? `${state.faceBackground === "green" ? "Green Screen" : "Blue Screen"} felülírás aktív`
        : "Környezet + időjárás + fotó · önálló tájkép prompt";
    }
    if (elements.promptStats) elements.promptStats.textContent = promptStatsText(prompt);
    if (elements.fullPromptStats) elements.fullPromptStats.textContent = promptStatsText(fullPrompt, promptDiagnostics);
    if (elements.landscapePhotoPromptStats) elements.landscapePhotoPromptStats.textContent = promptStatsText(landscapePrompt);
    if (PAGE === "photo") {
      const ready = clean(fullPrompt).length >= 200;
      if (ready) {
        localStorage.setItem(PHOTO_MUSIC_SOURCE_KEY, JSON.stringify({
          prompt: fullPrompt,
          state: JSON.parse(JSON.stringify(state)),
          savedAt: Date.now()
        }));
      } else {
        localStorage.removeItem(PHOTO_MUSIC_SOURCE_KEY);
      }
    }
  }

  function updateAll({ save = true, history = true } = {}) {
    ensureEnvironmentElements();
    if (faceBackgroundConflictReason()) state.faceBackground = "";
    renderFaceBackgroundButtons();
    updateTimeUi();
    updateScenePreview();
    updateFilmPreview();
    renderSummary();
    updatePromptUi();
    if (save) saveState();
    if (history === "immediate") {
      flushHistoryRecord();
      recordHistoryState();
    } else if (history) {
      scheduleHistoryRecord();
    }
    renderWorkflowTools();
  }

  function selectRandom(select, preferredValues = []) {
    if (!select || select.disabled) return;
    const preferred = preferredValues
      .map((value) => Array.from(select.options).find((option) => option.value === value && !option.disabled))
      .filter(Boolean);
    const pool = preferred.length ? preferred : Array.from(select.options).filter((option) => option.value && !option.disabled);
    if (!pool.length) return;
    select.value = pool[Math.floor(Math.random() * pool.length)].value;
  }

  function randomizeFace() {
    flushHistoryRecord();
    acknowledgedRequiredPanels.clear();
    if (!isFieldLocked("face.position")) selectRandom(faceSelect("position"));
    if (!isFieldLocked("face.altipus")) selectRandom(faceSelect("altipus"));
    readFaceControlsToState();
    updateFaceDependents();
    if (!isFieldLocked("face.eletkor")) selectRandom(faceSelect("eletkor"), ["Fiatal felnőtt", "Felnőtt"]);
    if (!isFieldLocked("face.identitas")) selectRandom(faceSelect("identitas"));
    readFaceControlsToState();
    updateHairStyleChoices();
    updateMakeupAvailability({ clearDisabled: true });
    FACE_FIELDS.filter(([key]) => !["position", "altipus", "eletkor", "identitas", "hajstilus"].includes(key) && !isFieldLocked(`face.${key}`)).forEach(([key]) => selectRandom(faceSelect(key)));
    if (!isFieldLocked("face.hajstilus")) selectRandom(faceSelect("hajstilus"));
    readFaceControlsToState();
    updateBiologicalLogic({ clearDisabled: true });
    updateAll({ history: "immediate" });
  }

  function randomizeEnvironment() {
    flushHistoryRecord();
    const presets = environmentPresets();
    if (!isFieldLocked("environment.terrain") && !isFieldLocked("environment.elements")) {
      state.terrainId = presets[Math.floor(Math.random() * presets.length)].id;
    }
    if (!isFieldLocked("environment.elements")) {
      const shuffled = terrain().elements.map(([id]) => id).sort(() => Math.random() - 0.5);
      state.environmentElementIds = shuffled.slice(0, Math.random() < 0.5 ? 3 : 4);
    }
    renderTerrainGrid();
    renderEnvironmentElements();
    renderWeatherSelect();
    updateAll({ history: "immediate" });
  }

  function randomizeWeather() {
    flushHistoryRecord();
    const seasons = seasonRows();
    if (!isFieldLocked("weather.season")) state.seasonKey = seasons[Math.floor(Math.random() * seasons.length)]?.season_key || "summer";
    const phases = Object.keys(PHASES);
    if (!isFieldLocked("weather.phase")) state.phaseKey = phases[Math.floor(Math.random() * phases.length)];
    if (!isFieldLocked("weather.time")) state.timeHour = Math.floor(Math.random() * 48) / 2;
    const directions = lightDirectionRows();
    if (!isFieldLocked("weather.light")) state.lightDirectionKey = directions[Math.floor(Math.random() * directions.length)]?.direction_key || "front";
    if (!isFieldLocked("weather.temperature")) state.temperatureOffset = [-4, -2, 0, 0, 0, 2, 4][Math.floor(Math.random() * 7)];
    if (!isFieldLocked("weather.outfit")) state.customOutfit = "";
    renderSeasonSelect();
    renderWeatherSelect();
    const allowed = Array.from(elements.weatherSelect?.options || []).filter((option) => option.value && !option.disabled).map((option) => option.value);
    if (!isFieldLocked("weather.weather")) state.weatherKey = allowed[Math.floor(Math.random() * allowed.length)] || "sun";
    if (!isFieldLocked("weather.wind")) state.windKey = ["calm", "breeze", "breeze", "moderate", "strong", "gale"][Math.floor(Math.random() * 6)];
    if (!isFieldLocked("weather.windDirection")) state.windDirectionKey = WIND_DIRECTIONS[Math.floor(Math.random() * WIND_DIRECTIONS.length)].key;
    renderWeatherSelect();
    renderWindControls();
    renderLightDirectionSelect();
    updateAll({ history: "immediate" });
  }

  function randomizePhoto() {
    flushHistoryRecord();
    renderPhotoSelects();
    if (!isFieldLocked("photo.film")) selectRandom(photoSelect("film"));
    if (!isFieldLocked("photo.objektiv")) selectRandom(photoSelect("objektiv"), ["Portré", "Nagylátószögű", "Prime objektív"]);
    if (!isFieldLocked("photo.stilus")) selectRandom(photoSelect("stilus"), PHOTO_STYLE_DEFAULTS);
    readPhotoControlsToState();
    state.photo.effects = [];
    if (Math.random() < 0.65) {
      const shuffled = [...LENS_LIGHT_EFFECTS].sort(() => Math.random() - 0.5);
      state.photo.effects = shuffled.slice(0, 1).map((effect) => effect.key);
    }
    renderLensEffects();
    updateAll({ history: "immediate" });
  }

  function resetAll() {
    flushHistoryRecord();
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PHOTO_MUSIC_SOURCE_KEY);
    acknowledgedRequiredPanels.clear();
    state = defaultState();
    renderCurrentPage();
    updateAll();
  }

  function showToast(message) {
    if (!elements.toast) return;
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add("show");
    toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 1500);
  }

  async function copyText(text) {
    if (!clean(text)) {
      showToast("Még nincs másolható prompt");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }
    showToast("Másolva");
  }

  function exportPromptText() {
    return clean(elements.fullPrompt?.value || elements.pagePrompt?.value || "");
  }

  function exportDateStamp() {
    const date = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
  }

  function exportFilename(extension, prefix = "taj-portre-prompt") {
    return `${prefix}-${exportDateStamp()}.${extension}`;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportNamedPromptTxt(text, heading, prefix) {
    if (!text) {
      showToast("Még nincs exportálható prompt");
      return;
    }
    const content = [
      heading,
      `Export: ${new Date().toLocaleString("hu-HU")}`,
      "",
      text
    ].join("\n");
    downloadBlob(new Blob([content], { type: "text/plain;charset=utf-8" }), exportFilename("txt", prefix));
    showToast("TXT letöltve");
  }

  function exportPromptTxt() {
    exportNamedPromptTxt(exportPromptText(), "PHOTO PROMPT BUILDER - TELJES PROMPT", "photo-prompt-builder");
  }

  function exportLandscapePhotoTxt() {
    exportNamedPromptTxt(clean(elements.landscapePhotoPrompt?.value || ""), "PHOTO PROMPT BUILDER - KÖRNYEZET + IDŐJÁRÁS + FOTÓ", "photo-prompt");
  }

  function wrapCanvasText(ctx, text, maxWidth) {
    const lines = [];
    String(text).split(/\n/).forEach((paragraph) => {
      const words = paragraph.split(/\s+/).filter(Boolean);
      if (!words.length) {
        lines.push("");
        return;
      }
      let line = "";
      words.forEach((word) => {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width <= maxWidth) {
          line = test;
          return;
        }
        if (line) lines.push(line);
        line = word;
        while (ctx.measureText(line).width > maxWidth && line.length > 1) {
          let chunk = "";
          for (const char of Array.from(line)) {
            if (ctx.measureText(chunk + char).width > maxWidth && chunk) break;
            chunk += char;
          }
          lines.push(chunk);
          line = line.slice(chunk.length);
        }
      });
      if (line) lines.push(line);
    });
    return lines;
  }

  function promptPdfCanvases(text) {
    const title = "Photo Prompt Builder - teljes prompt";
    const meta = `Export: ${new Date().toLocaleString("hu-HU")}`;
    const pageWidth = 595;
    const pageHeight = 842;
    const scale = 2;
    const margin = 42 * scale;
    const maxWidth = (pageWidth - 84) * scale;
    const bottom = (pageHeight - 48) * scale;
    const bodyLineHeight = 18 * scale;
    const pages = [];
    let canvas = null;
    let ctx = null;
    let y = 0;

    const drawPageFrame = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#202020";
      ctx.font = `${20 * scale}px Arial, sans-serif`;
      ctx.fillText(title, margin, 42 * scale);
      ctx.fillStyle = "#666666";
      ctx.font = `${9 * scale}px Arial, sans-serif`;
      ctx.fillText(meta, margin, 61 * scale);
      ctx.strokeStyle = "#dddddd";
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(margin, 74 * scale);
      ctx.lineTo((pageWidth * scale) - margin, 74 * scale);
      ctx.stroke();
      ctx.fillStyle = "#777777";
      ctx.font = `${9 * scale}px Arial, sans-serif`;
      ctx.fillText(`Oldal ${pages.length + 1}`, margin, (pageHeight - 25) * scale);
    };

    const newPage = () => {
      canvas = document.createElement("canvas");
      canvas.width = pageWidth * scale;
      canvas.height = pageHeight * scale;
      ctx = canvas.getContext("2d");
      pages.push(canvas);
      drawPageFrame();
      y = 96 * scale;
    };

    newPage();
    ctx.font = `${12 * scale}px Arial, sans-serif`;
    const lines = wrapCanvasText(ctx, text, maxWidth);
    lines.forEach((line) => {
      if (y + bodyLineHeight > bottom) {
        newPage();
        ctx.font = `${12 * scale}px Arial, sans-serif`;
      }
      ctx.fillStyle = "#202020";
      ctx.fillText(line || " ", margin, y);
      y += line ? bodyLineHeight : bodyLineHeight * 0.65;
    });
    return pages;
  }

  function dataUrlBytes(dataUrl) {
    const binary = atob(dataUrl.split(",")[1] || "");
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  function buildImagePdf(canvases) {
    const encoder = new TextEncoder();
    const pageWidth = 595;
    const pageHeight = 842;
    const objectCount = 2 + canvases.length * 3;
    const offsets = Array(objectCount + 1).fill(0);
    const chunks = [];
    let length = 0;
    const add = (chunk) => {
      chunks.push(chunk);
      length += chunk.length;
    };
    const addText = (text) => add(encoder.encode(text));
    const startObject = (id) => {
      offsets[id] = length;
      addText(`${id} 0 obj\n`);
    };
    const endObject = () => addText("endobj\n");
    const pageObjectIds = canvases.map((_, index) => 3 + index * 3);

    addText("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n");
    startObject(1);
    addText("<< /Type /Catalog /Pages 2 0 R >>\n");
    endObject();

    startObject(2);
    addText(`<< /Type /Pages /Count ${canvases.length} /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] >>\n`);
    endObject();

    canvases.forEach((canvas, index) => {
      const pageId = 3 + index * 3;
      const imageId = pageId + 1;
      const contentId = pageId + 2;
      const imageName = `Im${index + 1}`;
      const jpeg = dataUrlBytes(canvas.toDataURL("image/jpeg", 0.92));
      const content = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/${imageName} Do\nQ\n`;

      startObject(pageId);
      addText(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /${imageName} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>\n`);
      endObject();

      startObject(imageId);
      addText(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
      add(jpeg);
      addText("\nendstream\n");
      endObject();

      startObject(contentId);
      addText(`<< /Length ${content.length} >>\nstream\n${content}endstream\n`);
      endObject();
    });

    const xrefOffset = length;
    addText(`xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`);
    for (let id = 1; id <= objectCount; id += 1) {
      addText(`${String(offsets[id]).padStart(10, "0")} 00000 n \n`);
    }
    addText(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

    const output = new Uint8Array(length);
    let offset = 0;
    chunks.forEach((chunk) => {
      output.set(chunk, offset);
      offset += chunk.length;
    });
    return new Blob([output], { type: "application/pdf" });
  }

  function exportNamedPromptPdf(text, prefix) {
    if (!text) {
      showToast("Még nincs exportálható prompt");
      return;
    }
    try {
      downloadBlob(buildImagePdf(promptPdfCanvases(text)), exportFilename("pdf", prefix));
      showToast("PDF letöltve");
    } catch (error) {
      console.error(error);
      showToast("PDF export nem sikerült");
    }
  }

  function exportPromptPdf() {
    exportNamedPromptPdf(exportPromptText(), "taj-portre-prompt");
  }

  function exportLandscapePhotoPdf() {
    exportNamedPromptPdf(clean(elements.landscapePhotoPrompt?.value || ""), "tajkep-prompt");
  }

  function handleFaceImageClick(event) {
    const groupButton = event.target.closest("[data-face-image-group-key]");
    if (groupButton && !groupButton.disabled) {
      const key = groupButton.dataset.faceImageGroupKey;
      faceImageGroupState[key] = groupButton.dataset.faceImageGroupLabel;
      const field = FACE_FIELDS.find(([fieldKey]) => fieldKey === key);
      const select = faceSelect(key);
      if (field && select) {
        const rows = Array.from(select.options)
          .map((option) => findRow(field, option.value))
          .filter(Boolean);
        renderFaceImagePicker(field, orderedFaceRows(field, rows));
      }
      return;
    }
    const button = event.target.closest("[data-face-image-value]");
    if (!button || button.disabled) return;
    const select = faceSelect(button.dataset.faceImageKey);
    if (!select || select.disabled) return;
    const group = button.closest(".face-image-grid")?.querySelector(".face-image-group-button.selected");
    if (group) faceImageGroupState[button.dataset.faceImageKey] = group.dataset.faceImageGroupLabel;
    const key = button.dataset.faceImageKey;
    const value = button.dataset.faceImageValue;
    if (MULTI_FACE_KEYS.has(key)) {
      const current = Array.isArray(state.face[key]) ? state.face[key] : [];
      state.face[key] = current.includes(value)
        ? current.filter((item) => item !== value)
        : compatibleFaceValues(key, [...current, value]);
      const selected = new Set(state.face[key]);
      Array.from(select.options).forEach((option) => { option.selected = selected.has(option.value); });
    } else {
      const alreadySelected = String(state.face[key] || select.value || "") === value;
      select.value = alreadySelected ? "" : value;
    }
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function scrollImagePanelIntoView(panel) {
    requestAnimationFrame(() => {
      const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      const stickyHeader = document.querySelector(".topbar");
      const headerHeight = stickyHeader?.getBoundingClientRect().height || 0;
      const panelTop = window.scrollY + panel.getBoundingClientRect().top;
      window.scrollTo({
        top: Math.max(0, panelTop - headerHeight - 12),
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }

  function handleImagePanelToggle(event) {
    const panel = event.target;
    if (!panel?.matches?.(".image-picker-panel") || !panel.open) return;
    document.querySelectorAll(".image-picker-panel[open]").forEach((item) => {
      if (item !== panel) item.open = false;
    });
    scrollImagePanelIntoView(panel);
  }

  function setSpecialShotMode(mode, checked) {
    const previousMode = state.specialShotMode;
    state.specialShotMode = checked ? mode : (state.specialShotMode === mode ? "" : state.specialShotMode);
    if (state.specialShotMode === "macro") state.photo.objektiv = "Makró";
    if (state.specialShotMode === "supertele") state.photo.objektiv = "Szupertele";
    if (!state.specialShotMode && ["macro", "supertele"].includes(previousMode)) state.photo.objektiv = "";
    renderSpecialShotControls();
    renderPhotoSelects();
    updateAll();
  }

  function bindPromptTabs() {
    const tabSets = Array.from(document.querySelectorAll("[data-prompt-tabs]"));
    tabSets.forEach((tabSet) => {
      const tabs = Array.from(tabSet.querySelectorAll('[role="tab"]'));
      if (!tabs.length) return;

      const activateTab = (activeTab, moveFocus = false) => {
        tabs.forEach((tab) => {
          const selected = tab === activeTab;
          const panel = document.getElementById(tab.getAttribute("aria-controls"));
          tab.classList.toggle("selected", selected);
          tab.setAttribute("aria-selected", String(selected));
          tab.tabIndex = selected ? 0 : -1;
          if (panel) panel.hidden = !selected;
        });
        if (moveFocus) activeTab.focus();
      };

      tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => activateTab(tab));
        tab.addEventListener("keydown", (event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          let nextIndex = index;
          if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
          if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
          if (event.key === "Home") nextIndex = 0;
          if (event.key === "End") nextIndex = tabs.length - 1;
          activateTab(tabs[nextIndex], true);
        });
      });

      activateTab(tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0]);
    });
  }

  function bindEvents() {
    bindPromptTabs();
    document.addEventListener("toggle", handleImagePanelToggle, true);

    elements.compositionGrid?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-orientation]");
      if (!button) return;
      state.orientation = button.dataset.orientation;
      renderCompositionGrid();
      renderModelThirdOptions();
      updateAll();
    });

    elements.modelThirdOptions?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-model-third]");
      if (!button) return;
      state.modelThird = button.dataset.modelThird;
      renderModelThirdOptions();
      updateAll();
    });

    elements.faceBackgroundButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const value = button.dataset.faceBackground;
        const conflictReason = faceBackgroundConflictReason(value);
        if (conflictReason) {
          showToast(conflictReason);
          return;
        }
        state.faceBackground = state.faceBackground === value ? "" : value;
        renderFaceBackgroundButtons();
        updateAll();
      });
    });

    elements.faceGroups?.addEventListener("click", handleFaceImageClick);
    elements.faceGroups?.addEventListener("change", (event) => {
      const key = event.target.dataset.faceKey;
      if (!key) return;
      state.face[key] = MULTI_FACE_KEYS.has(key)
        ? compatibleFaceValues(key, Array.from(event.target.selectedOptions).map((option) => option.value))
        : event.target.value;
      if (key === "hajszin" && event.target.value === "Melírozott / többszínű") {
        if (elements.hairBaseColor) elements.hairBaseColor.value = state.face.hajAlapszin || "#3b2416";
        if (elements.hairHighlightColor) elements.hairHighlightColor.value = state.face.hajMelirszin || "#b55239";
        elements.hairColorDialog?.showModal();
      }
      if (FACE_IMAGE_ASSETS[key]) {
        const field = FACE_FIELDS.find(([fieldKey]) => fieldKey === key);
        if (field) syncFaceImageGroupFromValue(field, event.target);
      }
      if (key === "altipus") {
        applyAltTypeSelection(event.target.value);
      } else {
        if (key === "identitas") {
          updateHairStyleChoices();
          updateMakeupAvailability({ clearDisabled: true });
        }
        if (["hajhossz", "hajsuruseg"].includes(key)) updateHairStyleChoices();
        if (["hajstilus", "eletkor", "identitas"].includes(key)) updateBiologicalLogic({ clearDisabled: true });
        if (key === "hajstilus") updateHairStyleChoices();
        readFaceControlsToState();
      }
      if (key === "szemszin" && faceBackgroundConflictsWithEyes()) state.faceBackground = "";
      renderFaceBackgroundButtons();
      updateAll();
    });

    elements.positionField?.addEventListener("click", handleFaceImageClick);
    elements.positionField?.addEventListener("change", (event) => {
      const key = event.target.dataset.faceKey;
      if (!key) return;
      state.face[key] = event.target.value;
      if (FACE_IMAGE_ASSETS[key]) {
        const field = FACE_FIELDS.find(([fieldKey]) => fieldKey === key);
        if (field) syncFaceImageGroupFromValue(field, event.target);
      }
      updateAll();
    });

    elements.terrainGrid?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-terrain-id]");
      if (!button) return;
      state.terrainId = state.terrainId === button.dataset.terrainId ? "" : button.dataset.terrainId;
      state.environmentElementIds = [];
      if (!compatibleLensName() && !isFieldLocked("photo.objektiv")) state.photo.objektiv = "";
      renderTerrainGrid();
      renderEnvironmentElements();
      renderWeatherSelect();
      updateAll();
    });

    elements.environmentModeTabs?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-environment-mode]");
      if (!button) return;
      state.environmentMode = button.dataset.environmentMode;
      state.terrainId = environmentPresets()[0].id;
      state.environmentElementIds = [];
      renderSpecialShotControls();
      if (!compatibleLensName() && !isFieldLocked("photo.objektiv")) state.photo.objektiv = "";
      renderEnvironmentModeUi();
      renderTerrainGrid();
      renderEnvironmentElements();
      renderWeatherSelect();
      updateAll();
    });

    elements.environmentModeTabs?.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      const tabs = Array.from(elements.environmentModeTabs.querySelectorAll("[data-environment-mode]"));
      const index = tabs.indexOf(event.target.closest("[data-environment-mode]"));
      if (index < 0) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      tabs[nextIndex].focus();
      tabs[nextIndex].click();
    });

    elements.landscapeCategoryTabs?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-landscape-category]");
      if (!button || button.dataset.landscapeCategory === state.landscapeCategory) return;
      state.landscapeCategory = button.dataset.landscapeCategory;
      state.terrainId = environmentPresets("landscape")[0].id;
      state.environmentElementIds = [];
      if (!compatibleLensName() && !isFieldLocked("photo.objektiv")) state.photo.objektiv = "";
      renderLandscapeCategoryTabs();
      renderTerrainGrid();
      renderEnvironmentElements();
      renderWeatherSelect();
      updateAll();
    });

    elements.landscapeCategoryTabs?.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      const tabs = Array.from(elements.landscapeCategoryTabs.querySelectorAll("[data-landscape-category]"));
      const index = tabs.indexOf(event.target.closest("[data-landscape-category]"));
      if (index < 0) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      tabs[nextIndex].focus();
      tabs[nextIndex].click();
    });

    elements.builtCategoryTabs?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-built-category]");
      if (!button || button.dataset.builtCategory === state.builtCategory) return;
      state.builtCategory = button.dataset.builtCategory;
      state.terrainId = environmentPresets("built")[0].id;
      state.environmentElementIds = [];
      if (!compatibleLensName() && !isFieldLocked("photo.objektiv")) state.photo.objektiv = "";
      renderBuiltCategoryTabs();
      renderTerrainGrid();
      renderEnvironmentElements();
      renderWeatherSelect();
      updateAll();
    });

    elements.builtCategoryTabs?.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      const tabs = Array.from(elements.builtCategoryTabs.querySelectorAll("[data-built-category]"));
      const index = tabs.indexOf(event.target.closest("[data-built-category]"));
      if (index < 0) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      tabs[nextIndex].focus();
      tabs[nextIndex].click();
    });

    elements.customLocation?.addEventListener("input", () => {
      state.customLocation = elements.customLocation.value;
      updateAll();
    });

    [elements.interiorLightSource, elements.interiorLightCharacter, elements.interiorColorTemperature, elements.interiorLightDirection].forEach((control) => {
      control?.addEventListener("change", () => {
        state.interiorLightSource = elements.interiorLightSource?.value || "window";
        state.interiorLightCharacter = elements.interiorLightCharacter?.value || "soft";
        state.interiorColorTemperature = elements.interiorColorTemperature?.value || "daylight";
        state.interiorLightDirection = elements.interiorLightDirection?.value || "side";
        renderInteriorLightPickers();
        updateAll();
      });
    });

    const interiorLightPanels = Array.from(document.querySelectorAll(".interior-light-picker-panel"));
    interiorLightPanels.forEach((panel) => {
      panel.open = false;
      panel.addEventListener("toggle", () => {
        if (!panel.open) return;
        interiorLightPanels.forEach((otherPanel) => {
          if (otherPanel !== panel) otherPanel.open = false;
        });
      });
    });

    elements.interiorLightingOptions?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-interior-light-key][data-interior-light-value]");
      if (!button) return;
      const picker = INTERIOR_LIGHT_PICKERS.find((item) => item.stateKey === button.dataset.interiorLightKey);
      if (!picker || !picker.items.some(([value]) => value === button.dataset.interiorLightValue)) return;
      state[picker.stateKey] = state[picker.stateKey] === button.dataset.interiorLightValue ? "" : button.dataset.interiorLightValue;
      renderInteriorLightPickers();
      updateAll();
    });

    elements.macroShot?.addEventListener("change", () => setSpecialShotMode("macro", elements.macroShot.checked));
    elements.superteleShot?.addEventListener("change", () => setSpecialShotMode("supertele", elements.superteleShot.checked));
    elements.specialShotSubject?.addEventListener("input", () => {
      state.specialShotSubject = elements.specialShotSubject.value;
      updateAll();
    });

    elements.crowdPresenceOptions?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-crowd-level]");
      if (!button) return;
      state.crowdLevel = state.crowdLevel === button.dataset.crowdLevel ? "" : button.dataset.crowdLevel;
      renderCrowdPresenceOptions();
      updateAll();
    });

    elements.includeChildren?.addEventListener("change", () => {
      state.includeChildren = elements.includeChildren.checked;
      updateAll();
    });

    elements.environmentElements?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-element-id]");
      if (!button) return;
      const id = button.dataset.elementId;
      if (state.environmentElementIds.includes(id)) {
        if (state.environmentElementIds.length <= ENVIRONMENT_ELEMENT_MIN) {
          showToast(`Legalább ${ENVIRONMENT_ELEMENT_MIN} környezeti elem maradjon aktív`);
          return;
        }
        state.environmentElementIds = state.environmentElementIds.filter((item) => item !== id);
      } else {
        if (state.environmentElementIds.length >= ENVIRONMENT_ELEMENT_MAX) {
          showToast(`Legfeljebb ${ENVIRONMENT_ELEMENT_MAX} elem kombinálható`);
          return;
        }
        state.environmentElementIds = [...state.environmentElementIds, id];
      }
      renderEnvironmentElements();
      updateAll();
    });

    elements.seasonGrid?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-season-key]");
      if (!button) return;
      state.seasonKey = state.seasonKey === button.dataset.seasonKey ? "" : button.dataset.seasonKey;
      renderSeasonSelect();
      renderWeatherSelect();
      updateAll();
    });

    elements.phaseCalendar?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-phase-key]");
      if (!button) return;
      state.phaseKey = state.phaseKey === button.dataset.phaseKey ? "" : button.dataset.phaseKey;
      if (elements.phaseSelect) elements.phaseSelect.value = state.phaseKey;
      renderPhaseCalendar();
      renderWeatherSelect();
      updateAll();
    });

    const handleWeatherVisualClick = (event) => {
      const button = event.target.closest("[data-weather-key]");
      if (!button || button.disabled) return;
      state.weatherKey = state.weatherKey === button.dataset.weatherKey ? "" : button.dataset.weatherKey;
      renderWeatherSelect();
      updateAll();
    };
    elements.weatherGrid?.addEventListener("click", handleWeatherVisualClick);
    elements.specialWeatherGrid?.addEventListener("click", handleWeatherVisualClick);

    elements.windGrid?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-wind-key]");
      if (!button || button.disabled) return;
      state.windKey = state.windKey === button.dataset.windKey ? "" : button.dataset.windKey;
      renderWindControls();
      updateAll();
    });

    elements.windDirectionGrid?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-wind-direction-key]");
      if (!button || button.disabled) return;
      state.windDirectionKey = state.windDirectionKey === button.dataset.windDirectionKey ? "" : button.dataset.windDirectionKey;
      renderWindDirectionControls();
      updateAll();
    });

    elements.lightDirectionGrid?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-light-direction-key]");
      if (!button) return;
      state.lightDirectionKey = state.lightDirectionKey === button.dataset.lightDirectionKey ? "" : button.dataset.lightDirectionKey;
      renderLightDirectionSelect();
      updateAll();
    });

    elements.seasonSelect?.addEventListener("change", () => {
      state.seasonKey = elements.seasonSelect.value;
      renderSeasonSelect();
      renderWeatherSelect();
      updateAll();
    });

    elements.phaseSelect?.addEventListener("change", () => {
      state.phaseKey = elements.phaseSelect.value;
      renderPhaseCalendar();
      renderWeatherSelect();
      updateAll();
    });

    elements.weatherSelect?.addEventListener("change", () => {
      state.weatherKey = elements.weatherSelect.value;
      renderWeatherSelect();
      updateAll();
    });

    elements.timeSlider?.addEventListener("input", () => {
      state.timeHour = Number(elements.timeSlider.value);
      renderWeatherSelect();
      updateAll();
    });

    elements.lightDirectionSelect?.addEventListener("change", () => {
      state.lightDirectionKey = elements.lightDirectionSelect.value;
      renderLightDirectionSelect();
      updateAll();
    });

    elements.temperatureOffset?.addEventListener("input", () => {
      state.temperatureOffset = Number(elements.temperatureOffset.value);
      updateAll();
    });

    elements.customOutfit?.addEventListener("input", () => {
      state.customOutfit = elements.customOutfit.value;
      updateAll();
    });

    elements.photoFields?.addEventListener("change", (event) => {
      if (event.target.matches("[data-lens-effect-slot]")) {
        state.photo.effects = event.target.value ? [event.target.value] : [];
        renderLensEffects();
        updateAll();
        return;
      }
      const key = event.target.dataset.photoKey;
      if (!key) return;
      state.photo[key] = event.target.value;
      updateAll();
    });

    elements.photoFields?.addEventListener("click", (event) => {
      if (event.target.closest("[data-lens-effect-info]")) showLensEffectInfo();
    });

    byId("randomAiPortrait")?.addEventListener("click", () => generateAiPortrait({ hybrid: false }));
    byId("randomHybridPortrait")?.addEventListener("click", () => generateAiPortrait({ hybrid: true }));
    byId("randomFace")?.addEventListener("click", randomizeFace);
    byId("randomEnvironment")?.addEventListener("click", randomizeEnvironment);
    byId("randomWeather")?.addEventListener("click", randomizeWeather);
    byId("randomPhoto")?.addEventListener("click", randomizePhoto);
    byId("resetAll")?.addEventListener("click", resetAll);
    elements.saveCharacter?.addEventListener("click", saveCurrentCharacter);
    elements.savedCharacterSelect?.addEventListener("change", () => {
      const character = selectedSavedCharacter();
      if (character && elements.characterName) elements.characterName.value = character.name || "";
      updateSavedCharacterControls();
    });
    elements.loadCharacter?.addEventListener("click", () => {
      const id = elements.savedCharacterSelect?.value;
      if (id) loadSavedCharacter(id);
    });
    elements.updateCharacter?.addEventListener("click", updateSavedCharacter);
    elements.deleteCharacter?.addEventListener("click", () => {
      const id = elements.savedCharacterSelect?.value;
      if (id) deleteSavedCharacter(id);
    });
    elements.applyHairColors?.addEventListener("click", (event) => {
      const base = elements.hairBaseColor?.value || "#3b2416";
      const highlight = elements.hairHighlightColor?.value || "#b55239";
      if (base.toLowerCase() === highlight.toLowerCase()) {
        event.preventDefault();
        showToast("Az alapszín és a melírszín legyen eltérő");
        return;
      }
      state.face.hajAlapszin = base;
      state.face.hajMelirszin = highlight;
      elements.hairColorDialog?.close();
      syncFaceImagePickerState("hajszin");
      updateAll();
    });
    elements.copyPrompt?.addEventListener("click", () => copyText(elements.pagePrompt?.value || ""));
    elements.copyAiPortraitPrompt?.addEventListener("click", () => copyText(elements.aiPortraitPrompt?.value || ""));
    elements.copyFullPrompt?.addEventListener("click", () => copyText(elements.fullPrompt?.value || ""));
    elements.copyLandscapePhotoPrompt?.addEventListener("click", () => copyText(elements.landscapePhotoPrompt?.value || ""));
    elements.exportPromptTxt?.addEventListener("click", exportPromptTxt);
    elements.exportPromptPdf?.addEventListener("click", exportPromptPdf);
    elements.exportLandscapePhotoTxt?.addEventListener("click", exportLandscapePhotoTxt);
    elements.exportLandscapePhotoPdf?.addEventListener("click", exportLandscapePhotoPdf);
  }

  function renderCurrentPage() {
    renderCompositionGrid();
    renderModelThirdOptions();
    renderFaceBackgroundButtons();
    renderPositionField();
    renderFaceGroups();
    populateFaceControls();
    renderEnvironmentModeUi();
    renderTerrainGrid();
    renderEnvironmentElements();
    renderSpecialShotControls();
    renderCrowdPresenceOptions();
    renderSeasonSelect();
    renderWeatherSelect();
    renderWindControls();
    renderWindDirectionControls();
    renderLightDirectionSelect();
    renderPhotoFields();
    renderLensEffects();
    renderSavedCharacters();
  }

  function addLocalDatabaseRow(table, row) {
    database[table] = Array.isArray(database[table]) ? database[table] : [];
    const idKeys = Object.keys(row).filter((key) => key.endsWith("_id") || key.endsWith("_key"));
    if (!idKeys.length) return;
    const exists = database[table].some((item) => idKeys.every((key) => String(item[key]) === String(row[key])));
    if (!exists) database[table].push(row);
  }

  function applyAjakImageLinks() {
    const imageValues = FACE_IMAGE_ASSETS.ajkak?.order || [];
    const ajakRows = database.tbl_ajkak || [];
    const available = imageValues.filter((value) => ajakRows.some((row) => String(row.ajaktipus_id) === value));
    (database.tbl_altipusok || []).forEach((altipus) => {
      available.forEach((ajaktipus_id) => {
        addLocalDatabaseRow("tbl_altipus_ajak", {
          altipus_id: altipus.altipus_id,
          ajaktipus_id
        });
      });
    });
  }

  function applyDerivedAltipusLinks() {
    const linkTables = DEPENDENT_FIELDS.map(defaultLinkTableForField).filter(Boolean);
    Object.entries(DERIVED_ALTIPUS_LINK_SOURCES).forEach(([target, source]) => {
      linkTables.forEach((table) => {
        (database[table] || [])
          .filter((row) => String(row.altipus_id) === source)
          .forEach((row) => addLocalDatabaseRow(table, { ...row, altipus_id: target }));
      });
    });
  }

  function applyLocalDatabaseRows() {
    Object.entries(LOCAL_DATABASE_ROWS).forEach(([table, rows]) => {
      rows.forEach((row) => addLocalDatabaseRow(table, row));
    });
    applyDerivedAltipusLinks();
    applyAjakImageLinks();
  }

  function embeddedDatabase() {
    return window.PROMPT_GENERATOR_DATA && typeof window.PROMPT_GENERATOR_DATA === "object"
      ? window.PROMPT_GENERATOR_DATA
      : null;
  }

  async function loadDatabase() {
    const embedded = embeddedDatabase();
    try {
      const response = await fetch("../promptGenerator.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return {
        data: await response.json(),
        source: "JSON"
      };
    } catch (error) {
      if (embedded) {
        return {
          data: embedded,
          source: "beépített adatcsomag"
        };
      }
      throw error;
    }
  }

  async function initialize() {
    bindEvents();
    window.addEventListener("promptbuilder:languagechange", () => {
      renderTerrainGrid();
      renderEnvironmentElements();
      renderCrowdPresenceOptions();
      renderLensEffects();
      renderSummary();
      window.I18N?.apply(document.body);
    });
    try {
      const loaded = await loadDatabase();
      database = loaded.data;
      applyLocalDatabaseRows();
      elements.dataStatus?.classList.add("ready");
      if (elements.dataStatus) elements.dataStatus.lastChild.textContent = ` ${Object.keys(database).length} tábla - ${loaded.source}`;
    } catch (error) {
      if (elements.dataStatus) elements.dataStatus.lastChild.textContent = " Az adatcsomag nem tölthető be";
      database = {};
      console.error(error);
    }
    renderCurrentPage();
    updateAll({ save: false, history: "immediate" });
  }

  initialize();
})();
