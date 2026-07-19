(() => {
  "use strict";

  const STORAGE_KEY = "terrain_portrait_generator_v1";
  const LEGACY_MINOR_AGES = new Set(["Fiatal", "Gyerek", "Kamasz", "Serdülő"]);
  const MAKEUP_KEYS = new Set(["szemfestes", "borsmink", "ajakszin"]);
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
      gatedFields: ["szemfestes", "borsmink", "ajakszin"],
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
  const DEPENDENT_FIELDS = FACE_FIELDS.filter((field) => field[5]);

  const PHOTO_FIELDS = [
    ["film", "Filmtípus", "tbl_filmtipus", "filmtipus_id", "filmtipus_prompt"],
    ["objektiv", "Objektív", "tbl_objektiv", "objektiv", "leiras"],
    ["stilus", "Képi stílus", "tbl_stilus", "stilus", "leiras"]
  ];

  const APERTURES = [1.4, 1.8, 2, 2.8, 3.5, 4, 5.6, 8, 11, 16, 22];
  const SHUTTER_SPEEDS = [30, 15, 8, 4, 2, 1, 1 / 2, 1 / 4, 1 / 8, 1 / 15, 1 / 30, 1 / 60, 1 / 125, 1 / 250, 1 / 500, 1 / 1000, 1 / 2000, 1 / 4000];
  const WEATHER_ORDER = ["sun", "partly", "cloud", "rain", "storm", "snow"];
  const PHOTO_STYLE_DEFAULTS = ["Cinematic", "Fotó-realisztikus B/W", "Noir", "Retro / Vintage"];

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
    early: { label: "Eleje", temp: { spring: -3, summer: -2, autumn: 2, winter: 1 } },
    mid: { label: "Közepe", temp: { spring: 0, summer: 2, autumn: 0, winter: -2 } },
    late: { label: "Vége", temp: { spring: 3, summer: -1, autumn: -3, winter: 2 } }
  };

  const PHENOLOGY = {
    alpine: {
      spring: {
        early: ["késői hófoltok, olvadó alpesi rétek, törpefenyő még tompa zöldben", "late snow patches, thawing alpine meadow, muted dwarf pine and wet rock"],
        mid: ["friss alpesi fű, apró hegyi virágok, nedves sziklaperemek", "fresh alpine grass, small mountain flowers, damp rock ledges"],
        late: ["rövid, sűrű alpesi növényzet, tiszta réti zöldek, visszahúzódó hó", "short dense alpine vegetation, clean meadow greens, retreating snowfields"]
      },
      summer: {
        early: ["teljes alpesi rét, erős UV-fény, szél formálta fűcsomók", "full alpine meadow, strong UV light, wind-shaped grass tussocks"],
        mid: ["szárazabb hegyi rét, kőgörgetegek, napégette növényzet", "drier mountain meadow, scree slopes, sun-stressed alpine plants"],
        late: ["maghozó hegyi füvek, fakuló virágok, hűvösebb magaslati tónus", "seed-bearing alpine grasses, fading flowers, cooler high-altitude tone"]
      },
      autumn: {
        early: ["rozsdásodó alpesi fű, hideg reggeli harmat, éles levegő", "rusting alpine grass, cold morning dew, crisp mountain air"],
        mid: ["sárgás törpecserjék, fagycsípett rét, kontrasztos szikla", "yellowing dwarf shrubs, frost-touched meadow, contrasty rock texture"],
        late: ["első hónyomok, ritkuló növényzet, szürke kő és hideg szél", "first traces of snow, thinning vegetation, grey stone and cold wind"]
      },
      winter: {
        early: ["keményre fagyott rét, vékony hó, sötét sziklakibukkanások", "frozen alpine ground, thin snow cover, dark rock outcrops"],
        mid: ["összefüggő hó, jeges szél, növényzet alig látható", "continuous snow cover, icy wind, vegetation mostly buried"],
        late: ["tömörödő hó, olvadó peremek, előbukkanó törpe növényzet", "compacted snow, melting edges, emerging dwarf vegetation"]
      }
    },
    arid: {
      spring: {
        early: ["ritka eső utáni sivatagi hajtások, apró efemer növények", "rare post-rain desert shoots, tiny ephemeral plants among sand and stone"],
        mid: ["szórt szárazságtűrő cserjék, rövid zöld fellángolás", "scattered xerophyte shrubs, brief seasonal green flush"],
        late: ["gyorsan száradó növényzet, poros kavicsfelszín, fakó zöldek", "rapidly drying vegetation, dusty gravel surface, muted green tones"]
      },
      summer: {
        early: ["ritka száraz cserje, kemény fény, száraz homokkéreg", "sparse scrub, hard light, dry sand crust"],
        mid: ["perzselő homok, alig aktív növényzet, hőremegés", "scorched sand, barely active vegetation, heat shimmer"],
        late: ["poros cserjék, napégette kövek, vízhiányos tónus", "dusty shrubs, sun-baked stones, water-stressed tones"]
      },
      autumn: {
        early: ["enyhülő hő, száraz fűmaradványok, tiszta horizont", "easing heat, dry grass remnants, clean open horizon"],
        mid: ["ritka bokrok, hűvösebb árnyékok, poros szélbarázdák", "sparse shrubs, cooler shadows, dusty wind-carved lines"],
        late: ["hidegebb sivatagi reggel, alacsony növényzet, kemény talaj", "colder desert morning, low vegetation, hard ground crust"]
      },
      winter: {
        early: ["hűvös sivatagi levegő, száraz bokrok, tompább nap", "cool desert air, dry shrubs, softer low sun"],
        mid: ["hideg éjszakák nyoma, sápadt homok, szélcsiszolt kövek", "traces of cold desert nights, pale sand, wind-polished stones"],
        late: ["tavasz előtti szárazság, ritka új hajtások, tiszta fény", "pre-spring dryness, rare new shoots, clear desert light"]
      }
    },
    grassland: {
      spring: {
        early: ["nedves friss fű, sarjadó mező, puha talaj", "wet fresh grass, emerging field growth, soft soil"],
        mid: ["dús zöld gyep, vadvirágos foltok, tiszta alacsony horizont", "lush green grassland, wildflower patches, clean low horizon"],
        late: ["magasabb fű, erősödő nap, telt mezőségi zöldek", "taller grass, stronger sun, full plain-land greens"]
      },
      summer: {
        early: ["magas fű, gabonaszegély, nyitott sík tér", "tall grass, crop-field edge, open flat space"],
        mid: ["szárazodó fű, poros út, kemény déli fény", "drying grass, dusty track, hard midday light"],
        late: ["arany szalmaszín, maghozó fű, learatott foltok", "golden straw tones, seed heads, harvested patches"]
      },
      autumn: {
        early: ["sárguló mező, párás reggelek, puha földszínek", "yellowing field, misty mornings, soft earth tones"],
        mid: ["alacsony nap, nedves tarló, rozsdás fű", "low sun, damp stubble, rusty grass"],
        late: ["csupaszabb táj, sáros foltok, hideg nyílt szél", "barer plain, muddy patches, cold open wind"]
      },
      winter: {
        early: ["deres fű, lapos fény, nyílt hideg tér", "frosted grass, flat low light, open cold space"],
        mid: ["hófoltos alföld, tompa horizont, ritka növényi textúra", "snow-patched plain, muted horizon, sparse plant texture"],
        late: ["olvadó talaj, szürkés fű, tavasz előtti nedvesség", "thawing soil, grey grass, pre-spring moisture"]
      }
    },
    coast: {
      spring: {
        early: ["sós szél, éledő dűnefű, nedves parti homok", "salt wind, reviving dune grass, wet coastal sand"],
        mid: ["zöldülő dűnefű, tiszta tengeri levegő, fényes víztükör", "greening dune grass, clean sea air, bright water surface"],
        late: ["erős parti zöldek, melegebb homok, tiszta horizont", "strong coastal greens, warmer sand, clean horizon"]
      },
      summer: {
        early: ["szárazabb dűnefű, ragyogó parti fény, meleg homok", "drier dune grass, bright coastal light, warm sand"],
        mid: ["napégette homok, kemény csillanások, sós pára", "sun-baked sand, hard glints, salty haze"],
        late: ["fakuló dűnefű, szeles part, hosszabb délutáni fény", "fading dune grass, windy coast, longer afternoon light"]
      },
      autumn: {
        early: ["szeles part, nedves hínárnyomok, tompuló nap", "windy shore, wet seaweed traces, softer sun"],
        mid: ["viharosabb part, sötétebb víz, lapos fény", "stormier coast, darker water, low flat light"],
        late: ["hideg part, nedves kövek, ritka dűnenövényzet", "cold shore, wet stones, sparse dune vegetation"]
      },
      winter: {
        early: ["hideg sós szél, sápadt homok, visszafogott növényzet", "cold salt wind, pale sand, restrained vegetation"],
        mid: ["zord part, erős hullámfény, kopár dűne", "harsh coast, strong wave highlights, bare dune"],
        late: ["enyhülő parti fény, nedves homok, új dűnefű-hajtások", "softening coastal light, wet sand, new dune grass shoots"]
      }
    },
    river: {
      spring: {
        early: ["duzzadó vízpart, friss fűz- és nádkezdemények, sáros perem", "swollen riverbank, fresh willow and reed growth, muddy edge"],
        mid: ["zöld folyóparti sáv, puha lomb, nedves kavics", "green riparian strip, soft foliage, wet pebbles"],
        late: ["sűrű nád, árnyas vízpart, élénk levélzöld", "dense reeds, shaded riverbank, vivid leaf greens"]
      },
      summer: {
        early: ["dús parti növényzet, párás vízszél, meleg zöld árnyék", "lush riverbank vegetation, humid water edge, warm green shade"],
        mid: ["sűrű lomb, lassú vízcsillanás, nedves iszap", "dense foliage, slow water glints, damp silt"],
        late: ["maghozó nád, melegebb vízpart, porosabb ösvény", "seed-bearing reeds, warm river edge, dustier path"]
      },
      autumn: {
        early: ["sárguló fűzfák, párás reggel, nedves levélszőnyeg", "yellowing willows, misty morning, damp leaf litter"],
        mid: ["rozsdás parti lomb, hidegebb víztükör, sáros talaj", "rusty riverbank foliage, colder water surface, muddy ground"],
        late: ["ritkuló ágak, sötét víz, ázott levelek", "thinning branches, dark water, soaked leaves"]
      },
      winter: {
        early: ["deres nádszálak, hideg víz, csupasz ágak", "frosted reeds, cold water, bare branches"],
        mid: ["jégperemek, hófoltos part, tompa visszaverődés", "ice rims, snow-patched bank, muted reflections"],
        late: ["olvadó part, saras ösvény, első rügyek", "thawing riverbank, muddy path, first buds"]
      }
    },
    glacier: {
      spring: {
        early: ["kemény hó és kékes jég, növényzet nélkül, zord moréna", "hard snow and blue ice, no visible vegetation, harsh moraine"],
        mid: ["olvadékvíz, nedves moréna, ritka zuzmó a köveken", "meltwater, wet moraine, rare lichen on rocks"],
        late: ["jégperemek, kavicsos hordalék, hideg tiszta levegő", "glacier edges, gravelly till, cold clear air"]
      },
      summer: {
        early: ["nyitott jégfelszín, olvadékpatak, sötét morénacsíkok", "open ice surface, meltwater stream, dark moraine bands"],
        mid: ["erős jégcsillanás, kék hasadékok, növényzet alig", "strong ice glare, blue crevasses, barely any vegetation"],
        late: ["szennyezettebb jégperem, kavicsos olvadékzóna, hideg pára", "darker ice edge, gravelly melt zone, cold mist"]
      },
      autumn: {
        early: ["visszahűlő jég, nedves moréna, ritka moha", "cooling ice, wet moraine, rare moss"],
        mid: ["új fagy, matt jég, szürke kőfelület", "new frost, matte ice, grey stone surface"],
        late: ["friss hópor, lezáródó olvadékvíz, kopár környezet", "fresh snow dusting, freezing meltwater, barren surroundings"]
      },
      winter: {
        early: ["növekvő hótakaró, kemény szél, fehér-kék tónus", "growing snow cover, hard wind, white-blue palette"],
        mid: ["mély hó, jeges felszín, növényzet nincs", "deep snow, icy surface, no visible vegetation"],
        late: ["tömör hó, fényes jégperemek, lassú olvadás kezdete", "compacted snow, bright ice edges, early thaw beginning"]
      }
    },
    hills: {
      spring: {
        early: ["rügyező sövények, nedves domboldal, friss talaj", "budding hedgerows, damp hillside, fresh soil"],
        mid: ["zöld rétek, gyümölcsfák virága, puha dombfény", "green meadows, orchard blossom, soft hill light"],
        late: ["telt lomb, magas fű, virágos mezsgyék", "full leaves, tall grass, flowering field edges"]
      },
      summer: {
        early: ["dús kaszáló, zöld sövény, meleg lejtő", "lush hay meadow, green hedgerow, warm slope"],
        mid: ["szárazabb fű, poros út, napos gyümölcsös", "drier grass, dusty path, sunny orchard"],
        late: ["arany kaszáló, érő gyümölcsös, hosszú árnyékok", "golden hay meadow, ripening orchard, long shadows"]
      },
      autumn: {
        early: ["színeződő gyümölcsös, párás völgy, puha földszínek", "turning orchard colors, misty valley, soft earth tones"],
        mid: ["rozsdás lomb, nedves avar, alacsony nap", "rusty leaves, damp leaf litter, low sun"],
        late: ["ritkuló lomb, sáros lejtő, hideg szél", "thinning leaves, muddy slope, cold wind"]
      },
      winter: {
        early: ["deres domboldal, kopár sövény, tompa fény", "frosted hillside, bare hedgerow, muted light"],
        mid: ["hófoltos dombság, csupasz ágak, csendes talaj", "snow-patched hills, bare branches, quiet ground"],
        late: ["olvadó hó, nedves földút, első rügyek", "melting snow, wet dirt road, first buds"]
      }
    },
    midmountain: {
      spring: {
        early: ["nedves erdei avar, rügyek, mohás kövek", "wet forest leaf litter, buds, mossy stones"],
        mid: ["friss lombszűrte fény, erdei virágok, párás ösvény", "fresh leaf-filtered light, woodland flowers, humid trail"],
        late: ["zárt lombkorona, élénk zöld visszaverődés, sziklás perem", "closed canopy, vivid green bounce, rocky edge"]
      },
      summer: {
        early: ["sűrű erdő, meleg árnyék, párafátyol", "dense forest, warm shade, light humidity"],
        mid: ["mély lombárnyék, szárazabb ösvény, erős fényfoltok", "deep canopy shade, drier trail, strong light patches"],
        late: ["sötétebb zöldek, maghozó aljnövényzet, hűvösebb gerinc", "darker greens, seed-bearing understory, cooler ridge"]
      },
      autumn: {
        early: ["kezdődő lombszín, párás völgy, nedves kövek", "early leaf color, misty valley, wet stones"],
        mid: ["színes lombkorona, avarszőnyeg, alacsony nap", "colored canopy, leaf-litter carpet, low sun"],
        late: ["csupaszodó ágak, sötét avar, hideg szikla", "baring branches, dark leaf litter, cold rock"]
      },
      winter: {
        early: ["deres erdő, kopár ágak, mohás kő", "frosted forest, bare branches, mossy stone"],
        mid: ["havas erdei ösvény, tompa fény, sötét fatörzsek", "snowy forest trail, muted light, dark tree trunks"],
        late: ["olvadó hó, nedves avar, első zöld hajtások", "melting snow, wet leaf litter, first green shoots"]
      }
    },
    tropical: {
      spring: {
        early: ["örökzöld lomb, friss hajtások, nedves aljnövényzet", "evergreen canopy, fresh shoots, wet understory"],
        mid: ["sűrű lomb, magas páratartalom, fényfoltos levelek", "dense canopy, high humidity, spotted leaf highlights"],
        late: ["dús zöld rétegek, csillogó levelek, párás háttér", "lush green layers, glossy leaves, humid background"]
      },
      summer: {
        early: ["telt esőerdei lomb, nedves levéltextúra, diffúz fény", "full rainforest canopy, wet leaf texture, diffuse light"],
        mid: ["mély zöld árnyék, vastag aljnövényzet, fülledt levegő", "deep green shade, thick understory, heavy humid air"],
        late: ["sűrű, esőáztatta növényzet, sötét fatörzsek", "dense rain-soaked vegetation, dark tree trunks"]
      },
      autumn: {
        early: ["örökzöld lomb, több száraz levél a talajon, szűrt fény", "evergreen canopy, more dry leaves on the ground, filtered light"],
        mid: ["párás lomb, fényes levelek, mély árnyék", "humid foliage, glossy leaves, deep shade"],
        late: ["zárt növényfal, nedves talaj, tompa égfény", "closed vegetation wall, wet soil, muted sky glow"]
      },
      winter: {
        early: ["meleg örökzöld környezet, kevesebb direkt nap, nedves textúrák", "warm evergreen setting, less direct sun, damp textures"],
        mid: ["sűrű trópusi árnyék, párás levegő, csillogó levelek", "dense tropical shade, humid air, glossy leaves"],
        late: ["frissülő zöld hajtások, eső utáni felületek, puha fény", "renewing green shoots, post-rain surfaces, soft light"]
      }
    },
    savanna: {
      spring: {
        early: ["frissülő fű, vöröses talaj, elszórt szárazságtűrő fák", "renewing grass, reddish soil, scattered drought-tolerant trees"],
        mid: ["zöldebb szavannafű, puha felhős fény, nedves talajfoltok", "greener savanna grass, soft cloudy light, damp soil patches"],
        late: ["magasabb fű, meleg levegő, nyitott horizont", "taller grass, warm air, open horizon"]
      },
      summer: {
        early: ["teltebb fű, erős nap, vörös por", "fuller grass, strong sun, red dust"],
        mid: ["szárazodó szavanna, arany fű, hőremegés", "drying savanna, golden grass, heat shimmer"],
        late: ["fakó magas fű, poros szél, kemény árnyék", "pale tall grass, dusty wind, hard shadows"]
      },
      autumn: {
        early: ["aranybarna füvek, tiszta levegő, hosszabb árnyékok", "golden-brown grasses, clear air, longer shadows"],
        mid: ["száraz fűcsomók, vörös talaj, alacsonyabb nap", "dry grass clumps, red soil, lower sun"],
        late: ["ritkuló fű, poros nyílt tér, hűvösebb hajnal", "thinning grass, dusty open space, cooler dawn"]
      },
      winter: {
        early: ["száraz arany fű, tiszta ég, hűvösebb reggel", "dry golden grass, clear sky, cooler morning"],
        mid: ["nyugalmi növényzet, poros talaj, visszafogott zöldek", "dormant vegetation, dusty soil, restrained greens"],
        late: ["első friss hajtások nyoma, melegedő fény, nyitott tér", "first traces of new shoots, warming light, open space"]
      }
    }
  };

  const TERRAIN_PRESETS = [
    {
      id: "high_mountain",
      label: "Magashegység",
      short: "MH",
      summary: "alpesi gerinc, szikla, ritka magaslati növényzet",
      prompt: "high mountain alpine environment, steep terrain, clear thin air",
      phenology: "alpine",
      temp: -8,
      light: 0.2,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow"],
      outfit: "windproof mountain outer layer, insulated technical layers when cold, sturdy mountain boots",
      elements: [
        ["ridge", "Sziklás gerinc", "jagged rocky alpine ridge behind the subject"],
        ["scree", "Kőgörgeteg", "scree slope and weathered stone foreground"],
        ["meadow", "Alpesi rét", "small alpine meadow patches close to the camera"],
        ["snowline", "Hófoltok", "seasonally plausible snow patches above the vegetation line"]
      ]
    },
    {
      id: "desert",
      label: "Sivatag",
      short: "SV",
      summary: "homok, kő, vízhiányos növényzet",
      prompt: "desert environment with arid air, sparse vegetation, open horizon",
      phenology: "arid",
      temp: 9,
      light: 0.5,
      allowedWeather: ["sun", "partly", "cloud", "storm"],
      outfit: "sun-protective lightweight clothing, breathable fabric, head and neck shade where composition allows",
      elements: [
        ["dune", "Dűne", "wind-shaped sand dune forms"],
        ["wadi", "Száraz meder", "dry wadi bed and cracked sediment"],
        ["scrub", "Száraz cserjék", "sparse xerophyte shrubs without lush greenery"],
        ["stone", "Kőplató", "sun-baked stone plateau and gravel"]
      ]
    },
    {
      id: "plain",
      label: "Alföld",
      short: "AF",
      summary: "nyílt horizont, füves vagy mezőgazdasági tér",
      prompt: "flat lowland plain, wide open horizon, broad sky",
      phenology: "grassland",
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
        ["sunflower_field", "Napraforgótábla", "seasonal sunflower field across the flat lowland"]
      ]
    },
    {
      id: "coast",
      label: "Tengerpart",
      short: "TP",
      summary: "parti homok, szél, vízfelület",
      prompt: "coastal seashore environment, salt air, open water horizon",
      phenology: "coast",
      temp: -1,
      light: 0.35,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm"],
      outfit: "coastal wind-ready clothing, layered top or breathable summer fabric depending on temperature",
      elements: [
        ["sand", "Nedves homok", "wet sand with subtle reflections near the subject"],
        ["dune_grass", "Dűnefű", "seasonal dune grass and low coastal plants"],
        ["rocks", "Parti kövek", "dark coastal rocks or pebbles"],
        ["waterline", "Vízvonal", "sea waterline visible in the background"]
      ]
    },
    {
      id: "river",
      label: "Folyópart",
      short: "FP",
      summary: "vízpart, nád, fűz, nedves talaj",
      prompt: "riverbank environment with riparian vegetation and wet ground",
      phenology: "river",
      temp: -1,
      light: -0.2,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow"],
      outfit: "water-edge practical clothing, closed shoes, rain layer when weather requires it",
      elements: [
        ["reed", "Nádas", "reed beds and riverbank grass close to the frame"],
        ["willow", "Fűzliget", "willow gallery vegetation along the bank"],
        ["pebbles", "Nedves kavics", "wet pebbles or muddy shore texture"],
        ["water", "Folyótükör", "calm or wind-ruffled river surface"]
      ]
    },
    {
      id: "glacier",
      label: "Gleccser",
      short: "GL",
      summary: "jég, moréna, olvadékvíz",
      prompt: "glacier environment, blue ice, moraine gravel, cold reflected light",
      phenology: "glacier",
      temp: -11,
      light: 0.55,
      allowedWeather: ["sun", "partly", "cloud", "snow", "storm"],
      outfit: "cold-weather technical layers, insulated jacket, gloves, boots, no exposed summer clothing",
      elements: [
        ["ice", "Jégfal", "safe distant blue glacier ice face"],
        ["moraine", "Moréna", "dark moraine gravel and angular stones"],
        ["meltwater", "Olvadékvíz", "small meltwater channel in the foreground"],
        ["snow", "Hómező", "seasonally plausible snow field around the ice"]
      ]
    },
    {
      id: "hills",
      label: "Dombság",
      short: "DB",
      summary: "domboldal, gyümölcsös, sövény",
      prompt: "rolling hill country, soft slopes, rural vegetation",
      phenology: "hills",
      temp: 0,
      light: 0,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow"],
      outfit: "layered countryside outdoor clothing adapted to the current temperature",
      elements: [
        ["meadow", "Domboldali rét", "rolling meadow slope close to the camera"],
        ["orchard", "Gyümölcsös", "seasonal orchard rows on a gentle hill"],
        ["hedge", "Sövény", "hedgerow and field-edge vegetation"],
        ["path", "Földösvény", "narrow dirt path following the slope"]
      ]
    },
    {
      id: "mid_mountain",
      label: "Középhegység",
      short: "KH",
      summary: "erdei ösvény, szikla, lombszűrt fény",
      prompt: "temperate mid-mountain landscape, mixed forest, rocky outcrops",
      phenology: "midmountain",
      temp: -3,
      light: -0.4,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm", "snow"],
      outfit: "hiking-ready layered clothing, closed footwear, weatherproof layer when needed",
      elements: [
        ["forest", "Vegyes erdő", "mixed deciduous and coniferous forest edge"],
        ["rock", "Sziklakibúvás", "limestone or volcanic rocky outcrop"],
        ["trail", "Erdei ösvény", "narrow forest trail with natural ground texture"],
        ["clearing", "Gerinctisztás", "small ridge clearing with filtered light"]
      ]
    },
    {
      id: "jungle",
      label: "Őserdő",
      short: "ŐE",
      summary: "zárt lomb, párás levegő, nedves felületek",
      prompt: "dense tropical rainforest, humid air, layered evergreen vegetation",
      phenology: "tropical",
      temp: 6,
      light: -1.3,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm"],
      outfit: "light breathable humid-weather clothing, rain-ready fabric, no heavy winter layers",
      elements: [
        ["canopy", "Zárt lombkorona", "dense canopy filtering most direct light"],
        ["wet_leaves", "Nedves levelek", "large glossy wet leaves near the subject"],
        ["roots", "Gyökérzet", "buttress roots and dark humid soil"],
        ["mist", "Párás háttér", "humid background haze between vegetation layers"]
      ]
    },
    {
      id: "savanna",
      label: "Szavanna",
      short: "SZ",
      summary: "nyílt füves tér, vörös talaj, elszórt fák",
      prompt: "savanna landscape, open grassland, reddish soil, scattered drought-tolerant trees",
      phenology: "savanna",
      temp: 6,
      light: 0.35,
      allowedWeather: ["sun", "partly", "cloud", "rain", "storm"],
      outfit: "light sun-ready outdoor clothing, breathable fabric, practical shoes for dry grass and red soil",
      elements: [
        ["grass", "Szavannafű", "seasonal tall savanna grass"],
        ["red_soil", "Vörös talaj", "red soil and dusty ground texture"],
        ["tree", "Elszórt fák", "scattered flat-crowned drought-tolerant trees"],
        ["dry_creek", "Száraz vízmosás", "dry creek line or shallow erosion channel"]
      ]
    }
  ];

  const elements = {
    dataStatus: document.getElementById("dataStatus"),
    compositionGrid: document.getElementById("compositionGrid"),
    faceGroups: document.getElementById("faceGroups"),
    terrainGrid: document.getElementById("terrainGrid"),
    environmentElements: document.getElementById("environmentElements"),
    seasonSelect: document.getElementById("seasonSelect"),
    phaseSelect: document.getElementById("phaseSelect"),
    weatherSelect: document.getElementById("weatherSelect"),
    timeSlider: document.getElementById("timeSlider"),
    timeLabel: document.getElementById("timeLabel"),
    sunLabel: document.getElementById("sunLabel"),
    lightDirectionSelect: document.getElementById("lightDirectionSelect"),
    temperatureOffset: document.getElementById("temperatureOffset"),
    customOutfit: document.getElementById("customOutfit"),
    photoFields: document.getElementById("photoFields"),
    scenePreview: document.getElementById("scenePreview"),
    vegetationReadout: document.getElementById("vegetationReadout"),
    bodyReadout: document.getElementById("bodyReadout"),
    outfitReadout: document.getElementById("outfitReadout"),
    cameraReadout: document.getElementById("cameraReadout"),
    facePrompt: document.getElementById("facePrompt"),
    environmentPrompt: document.getElementById("environmentPrompt"),
    photoPrompt: document.getElementById("photoPrompt"),
    finalPrompt: document.getElementById("finalPrompt"),
    promptStats: document.getElementById("promptStats"),
    randomAll: document.getElementById("randomAll"),
    randomFace: document.getElementById("randomFace"),
    randomPhoto: document.getElementById("randomPhoto"),
    resetAll: document.getElementById("resetAll"),
    copyFinal: document.getElementById("copyFinal"),
    toast: document.getElementById("toast")
  };

  let database = {};
  let activeOrientation = "Portré / álló (4:5)";
  let activeTerrainId = "mid_mountain";
  let selectedElementIds = [];
  let activeSeasonKey = "summer";
  let activePhaseKey = "mid";
  let activeWeatherKey = "sun";
  let activeTimeHour = 12;
  let activeLightDirectionKey = "front";
  let temperatureOffset = 0;
  let computedCamera = null;
  let toastTimer = 0;

  function clean(value) {
    return String(value ?? "").replace(/\s+/g, " ").trim();
  }

  function normalizeText(value) {
    return clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function sanitizePrompt(parts) {
    const clauses = (Array.isArray(parts) ? parts : [parts])
      .flat(Infinity)
      .flatMap((part) => clean(part).split(/\s*,\s*/))
      .map((clause) => clean(clause).replace(/^[,.;]+|[,.;]+$/g, ""))
      .filter(Boolean);
    const seen = new Set();
    return clauses.filter((clause) => {
      const key = clause.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).join(", ");
  }

  function terrain() {
    return TERRAIN_PRESETS.find((item) => item.id === activeTerrainId) || TERRAIN_PRESETS[0];
  }

  function selectedEnvironmentElements() {
    const current = terrain();
    return current.elements.filter(([id]) => selectedElementIds.includes(id));
  }

  function faceSelect(key) {
    return document.getElementById(`face-${key}`);
  }

  function photoSelect(key) {
    return document.getElementById(`photo-${key}`);
  }

  function seasonRows() {
    return database.tbl_evszak?.length ? database.tbl_evszak : FALLBACK_SEASONS;
  }

  function weatherRows() {
    const rows = database.tbl_idojaras?.length ? database.tbl_idojaras : FALLBACK_WEATHER;
    return rows.slice().sort((a, b) => WEATHER_ORDER.indexOf(a.weather_key) - WEATHER_ORDER.indexOf(b.weather_key));
  }

  function activeSeason() {
    return seasonRows().find((row) => row.season_key === activeSeasonKey) || seasonRows()[1] || FALLBACK_SEASONS[1];
  }

  function activeWeather() {
    return weatherRows().find((row) => row.weather_key === activeWeatherKey) || weatherRows()[0] || FALLBACK_WEATHER[0];
  }

  function activeDirection() {
    const rows = database.tbl_fenyirany || [];
    return rows.find((row) => row.direction_key === activeLightDirectionKey) || rows[0] || {
      direction_key: "front",
      label: "Szemből",
      exposure_compensation: 0,
      prompt: "soft frontal light, evenly illuminated face"
    };
  }

  function formatTime(hour) {
    const whole = Math.floor(Number(hour));
    const minutes = Math.round((Number(hour) - whole) * 60);
    return `${String(whole).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  function formatTemperature(value) {
    const rounded = Math.round(Number(value) || 0);
    return `${rounded > 0 ? "+" : ""}${rounded} °C`;
  }

  function optionLabel(field, row, mode = "face") {
    const [key, , , valueKey, labelKey] = field;
    if (mode === "face") return clean(row[valueKey]);
    if (key === "film") return clean(row.filmtipus_id);
    if (key === "objektiv") return clean(row.objektiv);
    if (key === "stilus") return clean(row.stilus);
    return clean(row[labelKey] || row[valueKey]);
  }

  function populateSelect(select, field, rows, selectedValue = "", mode = "face") {
    if (!select) return;
    const [, label, , valueKey] = field;
    select.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = `- ${label} választása -`;
    select.appendChild(placeholder);
    rows.forEach((row) => {
      const option = document.createElement("option");
      option.value = String(row[valueKey]);
      option.textContent = optionLabel(field, row, mode);
      option.title = option.textContent;
      select.appendChild(option);
    });
    select.disabled = rows.length === 0;
    select.value = Array.from(select.options).some((option) => option.value === String(selectedValue))
      ? String(selectedValue)
      : "";
  }

  function makeFaceField(field) {
    const [key, label] = field;
    const wrapper = document.createElement("div");
    wrapper.className = "field";
    wrapper.innerHTML = `
      <label for="face-${key}">${label}</label>
      <select id="face-${key}" data-face-key="${key}"></select>
    `;
    return wrapper;
  }

  function renderFaceGroups() {
    elements.faceGroups.innerHTML = "";
    FACE_GROUPS.forEach((group, index) => {
      const details = document.createElement("details");
      details.className = "field-group";
      if (group.key) details.dataset.groupKey = group.key;
      details.open = index === 0;
      const note = group.note ? ` <em>${group.note}</em>` : "";
      details.innerHTML = `<summary><strong>${String(index + 1).padStart(2, "0")} - ${group.title}${note}</strong></summary>`;
      const grid = document.createElement("div");
      grid.className = "fields-grid";
      if (group.key === "makeup") {
        const noteNode = document.createElement("div");
        noteNode.className = "identity-note";
        noteNode.textContent = "A sminkmezők csak női identitásnál aktívak; az arcjegyek és bőrtextúra mindig használható.";
        grid.appendChild(noteNode);
      }
      group.fields.forEach((field) => grid.appendChild(makeFaceField(field)));
      details.appendChild(grid);
      elements.faceGroups.appendChild(details);
    });
  }

  function renderCompositionGrid() {
    const rows = database.tbl_kepformatum?.length
      ? database.tbl_kepformatum
      : [
        { formatum_id: "Portré / álló (4:5)", formatum_prompt: "portrait orientation, vertical 4:5 composition" },
        { formatum_id: "Tájkép / fekvő (16:9)", formatum_prompt: "landscape orientation, horizontal 16:9 composition" }
      ];
    if (!rows.some((row) => row.formatum_id === activeOrientation)) activeOrientation = rows[0]?.formatum_id || activeOrientation;
    elements.compositionGrid.innerHTML = rows.map((row) => `
      <button class="format-button${row.formatum_id === activeOrientation ? " selected" : ""}" type="button" data-orientation="${row.formatum_id}" aria-pressed="${row.formatum_id === activeOrientation}">
        <i aria-hidden="true"></i>
        <span><strong>${row.formatum_id.includes("16:9") ? "Tájkép" : "Portré"}</strong><small>${row.formatum_id}</small></span>
      </button>
    `).join("");
  }

  function rowsForDependentField(field, altipus) {
    const [, , table, idKey, , linkTable] = field;
    if (!altipus) return [];
    const allowed = new Set((database[linkTable] || [])
      .filter((link) => String(link.altipus_id) === String(altipus))
      .map((link) => String(link[idKey])));
    return (database[table] || []).filter((row) => allowed.has(String(row[idKey])));
  }

  function updateFaceDependents(saved = {}) {
    const altipus = faceSelect("altipus")?.value || "";
    DEPENDENT_FIELDS.forEach((field) => {
      populateSelect(faceSelect(field[0]), field, rowsForDependentField(field, altipus), saved[field[0]] || "", "face");
    });
  }

  function updateMakeupAvailability({ clearDisabled = true } = {}) {
    const identity = faceSelect("identitas")?.value || "";
    const enabled = identity === "Nő";
    const group = document.querySelector('[data-group-key="makeup"]');
    group?.classList.toggle("is-available", enabled);
    MAKEUP_KEYS.forEach((key) => {
      const select = faceSelect(key);
      if (!select) return;
      select.disabled = !enabled;
      if (!enabled && clearDisabled) select.value = "";
    });
  }

  function updateHairStyleChoices(saved = {}) {
    const identity = faceSelect("identitas")?.value || "";
    const field = FACE_FIELDS.find(([key]) => key === "hajstilus");
    const links = database.tbl_hajstilus_identitas || [];
    const rows = (database.tbl_hajstilus || []).filter((style) => {
      if (!identity || !links.length) return true;
      const constraints = links.filter((link) => String(link.hajstilus_id) === String(style.hajstilus_id));
      return !constraints.length || constraints.some((link) => link.identitas_id === identity);
    });
    const current = saved.hajstilus || faceSelect("hajstilus")?.value || "";
    populateSelect(faceSelect("hajstilus"), field, rows, current, "face");
  }

  function setFaceFieldLogic(key, disabled, clearDisabled = true) {
    const select = faceSelect(key);
    if (!select) return;
    select.disabled = disabled;
    if (disabled && clearDisabled) select.value = "";
  }

  function updateBiologicalLogic({ clearDisabled = true } = {}) {
    const hairStyle = faceSelect("hajstilus")?.value || "";
    const hairless = hairStyle.startsWith("Kopasz");
    const buzzCut = hairStyle.includes("géppel nyírt") || hairStyle.includes("buzz cut");
    setFaceFieldLogic("hajszin", hairless, clearDisabled);
    setFaceFieldLogic("hajhossz", hairless || buzzCut, clearDisabled);
    setFaceFieldLogic("hajsuruseg", hairless, clearDisabled);
  }

  function normalizeAdultAge(value) {
    return LEGACY_MINOR_AGES.has(value) ? "Fiatal felnőtt" : value;
  }

  function populateFace(saved = {}) {
    const normalizedSaved = { ...saved, eletkor: normalizeAdultAge(saved.eletkor) };
    FACE_FIELDS.filter((field) => !field[5]).forEach((field) => {
      const [key, , table] = field;
      populateSelect(faceSelect(key), field, database[table] || [], normalizedSaved[key] || "", "face");
    });
    updateFaceDependents(normalizedSaved);
    updateHairStyleChoices(normalizedSaved);
    updateMakeupAvailability({ clearDisabled: true });
    updateBiologicalLogic({ clearDisabled: true });
  }

  function renderPhotoFields() {
    elements.photoFields.innerHTML = "";
    PHOTO_FIELDS.forEach((field) => {
      const [key, label] = field;
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <label class="field-label" for="photo-${key}">${label}</label>
        <select id="photo-${key}" data-photo-key="${key}"></select>
      `;
      elements.photoFields.appendChild(wrapper);
    });
  }

  function daypartForTime(hour = activeTimeHour) {
    const season = activeSeason();
    const sunrise = Number(season.sunrise || 6);
    const sunset = Number(season.sunset || 18);
    const solarNoon = (sunrise + sunset) / 2;
    let key = "night";
    if (hour < sunrise - 1.5 || hour >= sunset + 1.5) key = "night";
    else if (hour < sunrise) key = "dawn";
    else if (hour >= sunrise && hour < sunrise + 1) key = "golden_morning";
    else if (hour >= sunrise + 1 && hour < solarNoon - 1) key = "morning";
    else if (hour >= solarNoon - 1 && hour <= solarNoon + 1) key = "noon";
    else if (hour > solarNoon + 1 && hour < sunset - 1) key = "afternoon";
    else if (hour >= sunset - 1 && hour < sunset) key = "golden_evening";
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
    return table[activeSeasonKey]?.[activePhaseKey] || 0;
  }

  function sunElevation(hour = activeTimeHour) {
    const season = activeSeason();
    const sunrise = Number(season.sunrise || 6);
    const sunset = Number(season.sunset || 18);
    const maxElevation = Math.max(4, Number(season.max_sun_elevation || 50) + phaseSunAdjustment());
    const numericHour = Number(hour);
    if (numericHour >= sunrise && numericHour <= sunset) {
      const daylightProgress = (numericHour - sunrise) / Math.max(1, sunset - sunrise);
      return maxElevation * Math.sin(daylightProgress * Math.PI);
    }
    const hoursBeforeSunrise = (sunrise - numericHour + 24) % 24;
    const hoursAfterSunset = (numericHour - sunset + 24) % 24;
    return -Math.min(24, Math.min(hoursBeforeSunrise, hoursAfterSunset) * 6);
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
    const weather = activeWeatherKey;
    const daypart = daypartForTime();
    if (elevation < -12) return "very low night exposure, no direct solar key light";
    if (elevation < 0) return "blue-hour or twilight ambient light, no direct solar key light";
    if (["cloud", "rain", "storm"].includes(weather)) return "weather-softened diffuse light, muted shadows, lower contrast on the face";
    if (weather === "snow") return "snow-reflected ambient light, bright ground bounce, cool highlights";
    if (daypart.key.includes("golden")) return "warm low-angle golden-hour key light, long coherent shadows";
    if (elevation > 45) return "strong high sun with clear facial shadow logic";
    return "natural directional daylight with coherent shadows";
  }

  function terrainWeatherAllowed() {
    const current = terrain();
    let keys = [...current.allowedWeather];
    if (activeWeatherKey === "snow" && !keys.includes("snow")) activeWeatherKey = keys[0];
    if (activeSeasonKey !== "winter" && !["high_mountain", "glacier"].includes(current.id)) {
      keys = keys.filter((key) => key !== "snow");
    }
    if (current.id === "desert" && activeSeasonKey === "winter") {
      keys = keys.filter((key) => key !== "storm");
    }
    return keys;
  }

  function renderSeasonSelect() {
    elements.seasonSelect.innerHTML = seasonRows().map((row) => `
      <option value="${row.season_key}">${row.label}</option>
    `).join("");
    elements.seasonSelect.value = activeSeasonKey;
    elements.phaseSelect.value = activePhaseKey;
  }

  function renderWeatherSelect() {
    const allowed = new Set(terrainWeatherAllowed());
    const rows = weatherRows().filter((row) => allowed.has(row.weather_key));
    if (!rows.some((row) => row.weather_key === activeWeatherKey)) activeWeatherKey = rows[0]?.weather_key || "sun";
    elements.weatherSelect.innerHTML = rows.map((row) => `
      <option value="${row.weather_key}">${row.label}</option>
    `).join("");
    elements.weatherSelect.value = activeWeatherKey;
  }

  function renderLightDirectionSelect() {
    const rows = database.tbl_fenyirany?.length ? database.tbl_fenyirany : [
      { direction_key: "front", label: "Szemből", prompt: "soft frontal light, evenly illuminated face", exposure_compensation: 0 },
      { direction_key: "front_left", label: "Bal 45°", prompt: "three-quarter key light from camera-left, sculpted facial depth", exposure_compensation: 0.3 },
      { direction_key: "front_right", label: "Jobb 45°", prompt: "three-quarter key light from camera-right, sculpted facial depth", exposure_compensation: 0.3 },
      { direction_key: "side", label: "Oldalfény", prompt: "side light creating split facial illumination", exposure_compensation: 0.7 },
      { direction_key: "back", label: "Hátulról", prompt: "backlight with rim light, face naturally falling into shadow", exposure_compensation: 1.5 },
      { direction_key: "top", label: "Felülről", prompt: "top light with defined eye-socket, nose and chin shadows", exposure_compensation: 0.5 }
    ];
    if (!rows.some((row) => row.direction_key === activeLightDirectionKey)) activeLightDirectionKey = rows[0].direction_key;
    elements.lightDirectionSelect.innerHTML = rows.map((row) => `
      <option value="${row.direction_key}">${row.label}</option>
    `).join("");
    elements.lightDirectionSelect.value = activeLightDirectionKey;
  }

  function renderTerrainGrid() {
    elements.terrainGrid.innerHTML = TERRAIN_PRESETS.map((item) => `
      <button class="terrain-card${item.id === activeTerrainId ? " selected" : ""}" type="button" data-terrain-id="${item.id}" aria-pressed="${item.id === activeTerrainId}">
        <header><strong>${item.label}</strong><span>${item.short}</span></header>
        <small>${item.summary}</small>
      </button>
    `).join("");
  }

  function renderEnvironmentElements() {
    const current = terrain();
    if (!selectedElementIds.length || !selectedElementIds.every((id) => current.elements.some(([elementId]) => elementId === id))) {
      selectedElementIds = current.elements.slice(0, 4).map(([id]) => id);
    }
    elements.environmentElements.innerHTML = current.elements.map(([id, label, prompt]) => {
      const selected = selectedElementIds.includes(id);
      return `
        <button class="element-card${selected ? " selected" : ""}" type="button" data-element-id="${id}" aria-pressed="${selected}">
          <header><strong>${label}</strong><small>${selected ? "aktív" : "kihagyva"}</small></header>
          <small>${prompt}</small>
        </button>
      `;
    }).join("");
  }

  function renderPhotoSelects(saved = {}) {
    const filmField = PHOTO_FIELDS.find(([key]) => key === "film");
    const filmRows = filteredFilmRows();
    populateSelect(photoSelect("film"), filmField, filmRows, saved.film || photoSelect("film")?.value || "", "photo");
    PHOTO_FIELDS.filter(([key]) => key !== "film").forEach((field) => {
      const [key, , table] = field;
      populateSelect(photoSelect(key), field, database[table] || [], saved[key] || photoSelect(key)?.value || "", "photo");
    });
  }

  function filteredFilmRows() {
    const rows = database.tbl_filmtipus || [];
    const links = database.tbl_idojaras_film || [];
    if (!links.length) return rows;
    const idsForKey = (key) => new Set(links.filter((row) => row.weather_key === key).map((row) => String(row.filmtipus_id)));
    const daypart = daypartForTime().key;
    const weatherKey = ({ partly: "cloud", storm: "rain" }[activeWeatherKey] || activeWeatherKey);
    const timeKey = daypart === "night" ? "night"
      : ["dawn", "twilight"].includes(daypart) ? "twilight"
        : ["golden_morning", "golden_evening"].includes(daypart) ? "golden" : "";
    let allowed = idsForKey(weatherKey);
    if (timeKey) {
      const timeIds = idsForKey(timeKey);
      const intersection = new Set([...timeIds].filter((id) => allowed.has(id)));
      allowed = intersection.size ? intersection : timeIds;
    }
    const filtered = rows.filter((row) => allowed.has(String(row.filmtipus_id)));
    return filtered.length ? filtered : rows;
  }

  function selectedFilmIso() {
    const name = photoSelect("film")?.value || "";
    const match = name.match(/(\d{2,4})(?:T)?$/i);
    return match ? Number(match[1]) : null;
  }

  function formatShutter(seconds) {
    if (seconds >= 1) return `${Number(seconds.toFixed(1)).toLocaleString("hu-HU")} s`;
    return `1/${Math.round(1 / seconds)} s`;
  }

  function computeCameraSettings() {
    const weather = activeWeather();
    const direction = activeDirection();
    const elevation = sunElevation();
    const ev = Math.max(-8, Math.min(16, naturalBaseEv(elevation)
      + Number(weather.ev_modifier || 0)
      + terrain().light
      - Number(direction.exposure_compensation || 0)));
    const iso = selectedFilmIso() || (ev < 0 ? 1600 : ev < 7 ? 800 : ev < 12 ? 400 : 100);
    const targetAperture = ev >= 14 ? 8 : ev >= 11 ? 5.6 : ev >= 8 ? 4 : ev >= 5 ? 2.8 : ev >= 1 ? 2 : 1.8;
    const exactSeconds = (targetAperture ** 2) / ((2 ** ev) * (iso / 100));
    const seconds = SHUTTER_SPEEDS.reduce((closest, value) => Math.abs(value - exactSeconds) < Math.abs(closest - exactSeconds) ? value : closest);
    const rawAperture = Math.sqrt(seconds * (2 ** ev) * (iso / 100));
    const aperture = APERTURES.reduce((closest, value) => Math.abs(value - rawAperture) < Math.abs(closest - rawAperture) ? value : closest);
    const daypart = daypartForTime().key;
    const kelvin = daypart.includes("golden") ? 4800
      : daypart === "twilight" ? 7500
        : daypart === "night" ? 4100
          : activeWeatherKey === "rain" || activeWeatherKey === "storm" ? 7200
            : activeWeatherKey === "cloud" ? 6800
              : activeWeatherKey === "snow" ? 6800 : 5600;
    return {
      ev,
      iso,
      shutter: formatShutter(seconds),
      aperture,
      kelvin,
      prompt: `${formatShutter(seconds)}, f/${aperture}, ISO ${iso}, ${kelvin} K white balance`
    };
  }

  function automaticTemperatureC() {
    const base = { spring: 12, summer: 27, autumn: 10, winter: -4 }[activeSeasonKey] ?? 15;
    const phase = PHASES[activePhaseKey]?.temp?.[activeSeasonKey] || 0;
    const daypart = daypartForTime().key;
    const daypartModifier = ({ dawn: -4, golden_morning: -2, morning: 0, noon: 3, afternoon: 2, golden_evening: 0, twilight: -2, night: -5 }[daypart] ?? 0);
    const weatherModifier = ({ sun: 2, partly: 0, cloud: -2, rain: -4, storm: -6, snow: -7 }[activeWeatherKey] ?? 0);
    return Math.max(-35, Math.min(48, Math.round(base + phase + terrain().temp + daypartModifier + weatherModifier + temperatureOffset)));
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

  function bodyReactionProfile() {
    const temperature = automaticTemperatureC();
    if (["rain", "storm"].includes(activeWeatherKey)) {
      return {
        label: "Nedves haj, vízcseppek, tapadó textúrák",
        prompt: "wet hair strands, realistic water droplets on skin, damp fabric texture reacting to rain"
      };
    }
    if (activeWeatherKey === "snow" || temperature <= 0) {
      return {
        label: "Látható párás lehelet, hidegpír",
        prompt: "visible condensed breath in cold air, naturally reddened cheeks and nose, subtle physical tension against freezing temperature"
      };
    }
    if (temperature <= 8) {
      return {
        label: "Hűvös bőrtónus, enyhe lehelet",
        prompt: "cool skin tone, faint breath in chilly air, subtle tension against cold"
      };
    }
    if (temperature <= 18) {
      return {
        label: "Hűvös reakciók, réteges komfort",
        prompt: "cool-weather body response, calm matte skin, no visible sweat, posture and styling suited to layered clothing"
      };
    }
    if (temperature >= 40) {
      return {
        label: "Extrém hőség, dehidratációs jelek",
        prompt: "extreme heat response, visible dehydration signs, stronger perspiration, heat shimmer in the air, flushed skin, dry slightly cracked lips"
      };
    }
    if (temperature >= 35 || activeTerrainId === "desert") {
      return {
        label: "Hőterhelés, erősebb izzadás",
        prompt: "realistic heat stress, stronger perspiration along the hairline and temples, warm flushed skin, dry lips, slightly strained heat response"
      };
    }
    if (temperature >= 28) {
      return {
        label: "Látható izzadás és kipirulás",
        prompt: "visible but realistic perspiration, lightly flushed warm skin, breathable light-clothing heat response"
      };
    }
    return {
      label: "Enyhe meleg, természetes bőrfény",
      prompt: "mild warmth, natural healthy skin glow, relaxed thermally comfortable appearance"
    };
  }

  function resolvedOutfit() {
    const custom = clean(elements.customOutfit.value);
    if (custom) return { label: "Egyéni öltözet", prompt: `custom outfit: ${custom}` };
    const temperature = automaticTemperatureC();
    let base = "";
    if (activeWeatherKey === "rain" || activeWeatherKey === "storm") {
      base = "weather-appropriate rain clothing, waterproof outer layer, damp fabric behavior, no exposed summer styling in cold rain";
    } else if (activeWeatherKey === "snow" || temperature <= 0) {
      base = "weather-appropriate winter clothing, insulated coat, warm layers, gloves where visible, no exposed summer clothing";
    } else if (temperature <= 18) {
      base = "weather-appropriate layered transitional clothing, medium-weight jacket, long trousers, closed shoes";
    } else if (temperature >= 28) {
      base = "weather-appropriate lightweight summer clothing, breathable fabrics, heat-adapted styling";
    } else {
      base = "comfortable weather-appropriate outdoor clothing, natural fabric movement";
    }
    return { label: "Automatikus", prompt: `${base}, ${terrain().outfit}` };
  }

  function vegetationState() {
    const profile = PHENOLOGY[terrain().phenology]?.[activeSeasonKey]?.[activePhaseKey];
    return {
      hu: profile?.[0] || "évszakhoz igazított természetes növényzet",
      en: profile?.[1] || "seasonally accurate natural vegetation"
    };
  }

  function findSelectedRow(select, field) {
    if (!select?.value) return null;
    const [, , table, valueKey] = field;
    return (database[table] || []).find((row) => String(row[valueKey]) === String(select.value)) || null;
  }

  function selectedPromptForFace(field) {
    const row = findSelectedRow(faceSelect(field[0]), field);
    if (!row) return "";
    return clean(row[field[4]]);
  }

  function orientationPrompt() {
    const row = (database.tbl_kepformatum || []).find((item) => item.formatum_id === activeOrientation);
    return clean(row?.formatum_prompt || (activeOrientation.includes("16:9") ? "landscape orientation, horizontal 16:9 composition" : "portrait orientation, vertical 4:5 composition"));
  }

  function generatedFacePrompt() {
    const ageField = FACE_FIELDS.find(([key]) => key === "eletkor");
    const identityField = FACE_FIELDS.find(([key]) => key === "identitas");
    const agePrompt = clean(findSelectedRow(faceSelect("eletkor"), ageField)?.[ageField[4]] || "");
    const identityPrompt = clean(findSelectedRow(faceSelect("identitas"), identityField)?.[identityField[4]] || "");
    const parts = FACE_FIELDS.map((field) => {
      const prompt = selectedPromptForFace(field);
      if (!prompt) return "";
      if (field[0] === "eletkor" && prompt === "young adult") {
        return `young adult ${identityPrompt === "female" ? "woman" : identityPrompt === "male" ? "man" : "person"}`;
      }
      if (field[0] === "identitas" && agePrompt === "young adult") return "";
      if (field[0] === "altipus") return `${prompt} facial features`;
      return prompt;
    });
    return sanitizePrompt([orientationPrompt(), ...parts]).toLowerCase();
  }

  function generatedEnvironmentPrompt() {
    const currentTerrain = terrain();
    const season = activeSeason();
    const phase = PHASES[activePhaseKey]?.label || "";
    const weather = activeWeather();
    const daypart = daypartForTime();
    const elevation = Math.round(sunElevation());
    const vegetation = vegetationState();
    const selectedElements = selectedEnvironmentElements().map(([, , prompt]) => prompt);
    const temperature = automaticTemperatureC();
    const body = bodyReactionProfile();
    const outfit = resolvedOutfit();
    return sanitizePrompt([
      currentTerrain.prompt,
      selectedElements,
      vegetation.en,
      `${season.prompt || season.label} (${phase.toLowerCase()} phase)`,
      `${formatTime(activeTimeHour)} local time, ${daypart.prompt}`,
      `sun altitude approximately ${elevation} degrees`,
      weather.prompt,
      lightPrompt(),
      activeDirection().prompt,
      `air temperature approximately ${temperature} degrees Celsius, ${temperatureDescriptor(temperature)}`,
      body.prompt,
      outfit.prompt
    ]);
  }

  function generatedPhotoPrompt() {
    const filmField = PHOTO_FIELDS.find(([key]) => key === "film");
    const lensField = PHOTO_FIELDS.find(([key]) => key === "objektiv");
    const styleField = PHOTO_FIELDS.find(([key]) => key === "stilus");
    const film = findSelectedRow(photoSelect("film"), filmField);
    const lens = findSelectedRow(photoSelect("objektiv"), lensField);
    const style = findSelectedRow(photoSelect("stilus"), styleField);
    return sanitizePrompt([
      computedCamera?.prompt,
      film?.filmtipus_prompt,
      lens?.leiras,
      style?.leiras
    ]);
  }

  function saveState() {
    const face = Object.fromEntries(FACE_FIELDS.map(([key]) => [key, faceSelect(key)?.value || ""]));
    const photo = Object.fromEntries(PHOTO_FIELDS.map(([key]) => [key, photoSelect(key)?.value || ""]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      face,
      photo,
      activeOrientation,
      activeTerrainId,
      selectedElementIds,
      activeSeasonKey,
      activePhaseKey,
      activeWeatherKey,
      activeTimeHour,
      activeLightDirectionKey,
      temperatureOffset,
      customOutfit: elements.customOutfit.value
    }));
  }

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
    } catch {
      return {};
    }
  }

  function updatePrompts() {
    computedCamera = computeCameraSettings();
    const vegetation = vegetationState();
    const body = bodyReactionProfile();
    const outfit = resolvedOutfit();
    elements.facePrompt.value = generatedFacePrompt();
    elements.environmentPrompt.value = generatedEnvironmentPrompt();
    elements.photoPrompt.value = generatedPhotoPrompt();
    elements.finalPrompt.value = sanitizePrompt([elements.facePrompt.value, elements.environmentPrompt.value, elements.photoPrompt.value]);
    elements.vegetationReadout.textContent = vegetation.hu;
    elements.bodyReadout.textContent = `${body.label} - ${formatTemperature(automaticTemperatureC())}`;
    elements.outfitReadout.textContent = `${outfit.label}: ${outfit.prompt}`;
    elements.cameraReadout.textContent = computedCamera ? `${computedCamera.shutter}, f/${computedCamera.aperture}, ISO ${computedCamera.iso}, EV ${computedCamera.ev.toFixed(1)}` : "-";
    const words = clean(elements.finalPrompt.value).split(/\s+/).filter(Boolean).length;
    elements.promptStats.textContent = `${words} szó - ${elements.finalPrompt.value.length} karakter`;
    elements.timeLabel.textContent = formatTime(activeTimeHour);
    elements.sunLabel.textContent = `${daypartForTime().label} - napmagasság ${Math.round(sunElevation())}° - ${activeWeather().label}`;
    elements.temperatureOffset.value = String(temperatureOffset);
    elements.scenePreview.dataset.terrain = activeTerrainId.replace("high_mountain", "high").replace("mid_mountain", "mid");
    elements.scenePreview.dataset.weather = activeWeatherKey;
    elements.scenePreview.dataset.time = daypartForTime().key === "night" ? "night" : "day";
    saveState();
  }

  function refreshEnvironment() {
    renderTerrainGrid();
    renderEnvironmentElements();
    renderWeatherSelect();
    renderPhotoSelects();
    updatePrompts();
  }

  function refreshTimeWeather() {
    renderWeatherSelect();
    renderPhotoSelects();
    updatePrompts();
  }

  function selectRandom(select, preferredValues = []) {
    if (!select || select.disabled) return;
    const preferred = preferredValues
      .map((value) => Array.from(select.options).find((option) => option.value === value))
      .filter(Boolean);
    const pool = preferred.length ? preferred : Array.from(select.options).filter((option) => option.value);
    if (!pool.length) return;
    select.value = pool[Math.floor(Math.random() * pool.length)].value;
  }

  function randomizeFace() {
    selectRandom(faceSelect("position"));
    selectRandom(faceSelect("altipus"));
    updateFaceDependents({});
    selectRandom(faceSelect("eletkor"), ["Fiatal felnőtt", "Felnőtt"]);
    selectRandom(faceSelect("identitas"));
    updateHairStyleChoices({});
    updateMakeupAvailability({ clearDisabled: true });
    FACE_FIELDS
      .filter(([key]) => !["position", "altipus", "eletkor", "identitas", "hajstilus"].includes(key))
      .forEach(([key]) => selectRandom(faceSelect(key)));
    selectRandom(faceSelect("hajstilus"));
    updateBiologicalLogic({ clearDisabled: true });
    updatePrompts();
  }

  function randomizePhoto() {
    renderPhotoSelects();
    selectRandom(photoSelect("film"));
    selectRandom(photoSelect("objektiv"), ["Portré", "Nagylátószögű", "Prime objektív"]);
    selectRandom(photoSelect("stilus"), PHOTO_STYLE_DEFAULTS);
    updatePrompts();
  }

  function randomizeAll() {
    activeTerrainId = TERRAIN_PRESETS[Math.floor(Math.random() * TERRAIN_PRESETS.length)].id;
    selectedElementIds = [];
    activeSeasonKey = seasonRows()[Math.floor(Math.random() * seasonRows().length)]?.season_key || "summer";
    activePhaseKey = Object.keys(PHASES)[Math.floor(Math.random() * Object.keys(PHASES).length)];
    activeTimeHour = Math.floor(Math.random() * 48) / 2;
    activeWeatherKey = "sun";
    renderSeasonSelect();
    renderWeatherSelect();
    const allowed = Array.from(elements.weatherSelect.options).map((option) => option.value).filter(Boolean);
    activeWeatherKey = allowed[Math.floor(Math.random() * allowed.length)] || "sun";
    elements.weatherSelect.value = activeWeatherKey;
    const directions = Array.from(elements.lightDirectionSelect.options).map((option) => option.value).filter(Boolean);
    activeLightDirectionKey = directions[Math.floor(Math.random() * directions.length)] || "front";
    elements.lightDirectionSelect.value = activeLightDirectionKey;
    temperatureOffset = [-4, -2, 0, 0, 0, 2, 4][Math.floor(Math.random() * 7)];
    elements.customOutfit.value = "";
    renderEnvironmentElements();
    randomizeFace();
    randomizePhoto();
    refreshEnvironment();
  }

  function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    activeOrientation = "Portré / álló (4:5)";
    activeTerrainId = "mid_mountain";
    selectedElementIds = [];
    activeSeasonKey = "summer";
    activePhaseKey = "mid";
    activeWeatherKey = "sun";
    activeTimeHour = 12;
    activeLightDirectionKey = "front";
    temperatureOffset = 0;
    elements.customOutfit.value = "";
    populateFace({});
    renderCompositionGrid();
    renderSeasonSelect();
    renderLightDirectionSelect();
    renderPhotoSelects({});
    refreshEnvironment();
  }

  function showToast(message) {
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

  function bindEvents() {
    elements.compositionGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-orientation]");
      if (!button) return;
      activeOrientation = button.dataset.orientation;
      renderCompositionGrid();
      updatePrompts();
    });

    elements.faceGroups.addEventListener("change", (event) => {
      if (event.target.id === "face-altipus") updateFaceDependents({});
      if (event.target.id === "face-identitas") {
        updateHairStyleChoices({});
        updateMakeupAvailability({ clearDisabled: true });
      }
      if (["face-hajstilus", "face-eletkor", "face-identitas"].includes(event.target.id)) {
        updateBiologicalLogic({ clearDisabled: true });
      }
      updatePrompts();
    });

    elements.terrainGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-terrain-id]");
      if (!button) return;
      activeTerrainId = button.dataset.terrainId;
      selectedElementIds = [];
      refreshEnvironment();
    });

    elements.environmentElements.addEventListener("click", (event) => {
      const button = event.target.closest("[data-element-id]");
      if (!button) return;
      const id = button.dataset.elementId;
      if (selectedElementIds.includes(id)) {
        if (selectedElementIds.length <= 3) {
          showToast("Legalább 3 környezeti elem maradjon aktív");
          return;
        }
        selectedElementIds = selectedElementIds.filter((item) => item !== id);
      } else {
        if (selectedElementIds.length >= 4) {
          showToast("Legfeljebb 4 elem kombinálható");
          return;
        }
        selectedElementIds = [...selectedElementIds, id];
      }
      renderEnvironmentElements();
      updatePrompts();
    });

    elements.seasonSelect.addEventListener("change", () => {
      activeSeasonKey = elements.seasonSelect.value;
      refreshTimeWeather();
    });

    elements.phaseSelect.addEventListener("change", () => {
      activePhaseKey = elements.phaseSelect.value;
      refreshTimeWeather();
    });

    elements.weatherSelect.addEventListener("change", () => {
      activeWeatherKey = elements.weatherSelect.value;
      renderPhotoSelects();
      updatePrompts();
    });

    elements.timeSlider.addEventListener("input", () => {
      activeTimeHour = Number(elements.timeSlider.value);
      renderPhotoSelects();
      updatePrompts();
    });

    elements.lightDirectionSelect.addEventListener("change", () => {
      activeLightDirectionKey = elements.lightDirectionSelect.value;
      updatePrompts();
    });

    elements.temperatureOffset.addEventListener("input", () => {
      temperatureOffset = Number(elements.temperatureOffset.value);
      updatePrompts();
    });

    elements.customOutfit.addEventListener("input", updatePrompts);

    elements.photoFields.addEventListener("change", updatePrompts);
    elements.randomFace.addEventListener("click", randomizeFace);
    elements.randomPhoto.addEventListener("click", randomizePhoto);
    elements.randomAll.addEventListener("click", randomizeAll);
    elements.resetAll.addEventListener("click", resetAll);
    elements.copyFinal.addEventListener("click", () => copyText(elements.finalPrompt.value));
    document.querySelectorAll("[data-copy]").forEach((button) => {
      button.addEventListener("click", () => copyText(document.getElementById(button.dataset.copy)?.value || ""));
    });
  }

  function applyLoadedState(saved) {
    activeOrientation = saved.activeOrientation || activeOrientation;
    activeTerrainId = TERRAIN_PRESETS.some((item) => item.id === saved.activeTerrainId) ? saved.activeTerrainId : activeTerrainId;
    selectedElementIds = Array.isArray(saved.selectedElementIds) ? saved.selectedElementIds : [];
    activeSeasonKey = seasonRows().some((row) => row.season_key === saved.activeSeasonKey) ? saved.activeSeasonKey : activeSeasonKey;
    activePhaseKey = PHASES[saved.activePhaseKey] ? saved.activePhaseKey : activePhaseKey;
    activeWeatherKey = saved.activeWeatherKey || activeWeatherKey;
    activeTimeHour = Number.isFinite(Number(saved.activeTimeHour)) ? Number(saved.activeTimeHour) : activeTimeHour;
    activeLightDirectionKey = saved.activeLightDirectionKey || activeLightDirectionKey;
    temperatureOffset = Number.isFinite(Number(saved.temperatureOffset)) ? Number(saved.temperatureOffset) : temperatureOffset;
    elements.customOutfit.value = saved.customOutfit || "";
  }

  async function initialize() {
    renderFaceGroups();
    renderPhotoFields();
    bindEvents();
    try {
      const response = await fetch("../promptGenerator.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      database = await response.json();
      const saved = loadState();
      applyLoadedState(saved);
      renderCompositionGrid();
      populateFace(saved.face || {});
      renderSeasonSelect();
      renderLightDirectionSelect();
      renderPhotoSelects(saved.photo || {});
      elements.timeSlider.value = String(activeTimeHour);
      refreshEnvironment();
      elements.dataStatus.classList.add("ready");
      elements.dataStatus.lastChild.textContent = ` ${Object.keys(database).length} tábla - gyors generátor kész`;
    } catch (error) {
      elements.dataStatus.lastChild.textContent = " Az adatbázis nem tölthető be";
      elements.faceGroups.innerHTML = `<div class="load-error">A promptGenerator.json nem érhető el. Nyisd meg az oldalt a helyi webszerveren keresztül.</div>`;
      console.error(error);
    }
  }

  initialize();
})();
