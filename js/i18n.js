(() => {
  "use strict";

  const STORAGE_KEY = "photo_prompt_builder_language";
  const SUPPORTED = new Set(["hu", "en"]);
  const sourceNodes = new WeakMap();
  const sourceAttributes = new WeakMap();
  let language = SUPPORTED.has(localStorage.getItem(STORAGE_KEY)) ? localStorage.getItem(STORAGE_KEY) : "hu";
  let applying = false;
  let changingLanguage = false;

  const EN = {
    "Időjárás és fény": "Weather and light", "Mellkép közel": "Close bust portrait", "Portré fej-nyak vállal": "Head-and-shoulders portrait", "Félalak": "Half-length portrait", "Ez a mező csak női identitásnál használható.": "This field is available only for a female identity.", "Az arcszőrzet csak férfi identitásnál használható.": "Facial hair is available only for a male identity.", "Kopasz frizuránál ez a hajmező nem használható.": "This hair field is unavailable with a bald hairstyle.", "Géppel nyírt frizuránál a hajhossz automatikus.": "Hair length is automatic with a buzz cut.", "Előbb válassz embertípust.": "Select a person type first.", "A panel a jelenlegi beállításokkal nem használható.": "This panel is unavailable with the current settings.",
    "Arc": "Face", "Környezet": "Environment", "Időjárás": "Weather", "Fotó": "Photo", "Zene (Suno)": "Music (Suno)", "Portré": "Portrait", "Négyzet": "Square", "Nincs téma kiválasztva": "No subject selected",
    "Önálló prompt": "Standalone prompt", "Arc generálása": "Face generator", "Környezet kiválasztása": "Environment selection",
    "Időjárás, fény, emberi hatás": "Weather, light and human impact", "Fotó beállítások": "Photo settings",
    "Karakter és portré alap": "Character and portrait foundation", "Helyszíntípus és elemek": "Location type and elements",
    "Évszak, napállás, emberi reakció": "Season, sun position and human response", "Film, objektív, stílus": "Film, lens and style",
    "Minden történet": "Every story begins", "egyetlen képpel és hangjeggyel": "with a single image and note...", "kezdődik...": "...",
    "Ősz haj": "Grey hair", "Arany csillámos": "Sparkling gold", "Smink nélkül": "No makeup", "Grafikus fekete": "Graphic black", "Füstös": "Smoky", "Réz–bronz": "Copper–bronze", "Metálos türkiz–zöld": "Metallic turquoise–green", "Világoskék–ezüst": "Light blue–silver", "Világoszöld–ezüst": "Light green–silver",
    "Hosszú réteges haj": "Long layered hair", "Lágy hullámos réteges": "Soft layered waves", "Bohém magas konty": "Bohemian high bun", "Romantikus konty": "Romantic updo", "Hullámos rövid bob": "Short wavy bob", "Réteges pixie": "Layered pixie", "Tépett shag": "Choppy shag", "Dús vállig érő göndör": "Voluminous shoulder curls", "Oldalra söpört hosszú": "Long side-swept hair", "Precíz frufrus bob": "Precise fringe bob", "Aszimmetrikus bob": "Asymmetrical bob", "Oldalfrufrus pixie": "Side-fringe pixie", "Hullámos középhosszú shag": "Medium wavy shag", "Oldalra söpört rövid": "Short side-swept cut", "Kócos hátrafésült": "Tousled swept-back hair", "Modern quiff": "Modern quiff",
    "Arany csillámos szemhéjpúder a mozgó szemhéjon, barnás satírral a mélyítővonalban, fekete tus vonal a felső szempillák tövében, enyhén kihúzott cicaszem formában": "Sparkling gold eyeshadow on the lid, brown shading in the crease and a subtle black cat-eye liner",
    "Erőteljes, grafikus szemsmink: fekete szemceruza a felső és alsó pillasor mentén, élesen megrajzolt külső és belső szemzug": "Bold graphic black liner along both lash lines with sharply defined inner and outer corners",
    "Füstös szemsmink: sötétszürke-fekete árnyalat a szempillavonalnál, finoman eldolgozva a szemhéj felé, enyhe fényes hatással, sötétszürke tus az alsó és felső pillasoron, vastagon festett felső szempillák, letisztult szemöldök": "Smoky charcoal-black eye makeup blended from the lash line, with subtle sheen, dark liner, full upper lashes and clean brows",
    "Meleg réz- és bronzszemhéjpúder, arany fény a belső szemzugban, lágy árnyalás az alsó pillasoron, hosszú szempillák": "Warm copper and bronze eyeshadow with a gold inner-corner highlight, softly shaded lower lash line and long lashes",
    "Metálos türkiz–zöld szemsmink arany belső szemzuggal, a külső szemzugnál sötétszürke-barna satírozással, az alsó pillasoron is árnyalva; természetes, formázott szemöldök és díszes ezüst-fekete homlokékszer egészíti ki a látványt": "Metallic turquoise-green eye makeup with a gold inner corner, charcoal-brown outer shading, lower-lash color, shaped brows and a silver-black forehead jewel",
    "Világoskék–ezüst szemhéjpúder, finoman sötétített külső szemzuggal, az alsó pillasoron is kék árnyalással; fekete tus a felső szempillák tövében, hangsúlyos szempillák, a szemöldök alatt enyhe fényes highlighter": "Light blue-silver eyeshadow with a softly darkened outer corner, blue lower-lash shading, black upper liner, defined lashes and a subtle brow highlight",
    "Világoszöld–ezüst szemhéjpúder, finoman sötétített külső szemzuggal, az alsó pillasoron is kék árnyalással; fekete tus a felső szempillák tövében, hangsúlyos szempillák, a szemöldök alatt enyhe fényes highlighter": "Light green-silver eyeshadow with a softly darkened outer corner, cool lower-lash shading, black upper liner, defined lashes and a subtle brow highlight",
    "Építs részletgazdag portrét az arctól és a környezettől az időjáráson át egészen a kész fotóbeállításig, és zenésítsd meg.": "Build a detailed portrait from face and environment through weather to the final camera setup, then give it music.",
    "Kezdés az arccal": "Start with the face",
    "Marad a meglévő arc-logika: arctípus, kompatibilis anatómiai mezők, haj, smink, mimika és képkivágás.": "Use the established face logic: archetype, compatible anatomy, hair, makeup, expression and framing.",
    "Tájkép, épített környezet vagy beltér választható, helyszínenként 3-4 egymással összeillő elemmel és fizikailag következetes fényviszonyokkal.": "Choose a landscape, built environment or interior with 3–4 compatible details and physically consistent lighting.",
    "Évszak, eleje-közepe-vége, napállás, időjárás, hőérzet, testreakció és öltözet egy külön promptban.": "Season, seasonal phase, sun position, weather, perceived temperature, body response and clothing in one prompt.",
    "A meglévő film, objektív és képi stílus logikája, automatikus záridő-rekesz-ISO javaslattal.": "Film, lens and visual-style controls with automatic shutter, aperture and ISO suggestions.",
    "Véletlenszerű AI portré": "Random AI portrait", "Ember + AI portré": "Human + AI portrait", "Véletlenszerű arc generálása": "Generate random face",
    "Véletlenszerű táj generálása": "Generate random environment", "Véletlenszerű időjárás generálása": "Generate random weather", "Véletlenszerű fotó generálása": "Generate random photo",
    "Képformátum kiválasztása": "Select image format", "Modell helye a képen": "Subject position in frame", "Kompozíció a harmadolási szabály szerint.": "Composition based on the rule of thirds.",
    "Személy karaktere": "Character profile", "alapkarakter és arányok": "core character and proportions", "Szem részletei": "Eye details", "szemöldök, írisz és szempilla": "eyebrows, iris and eyelashes",
    "Fülek, orr és fogak": "Ears, nose and teeth", "önálló arc-részletek": "individual facial details", "Bőr és smink": "Skin and makeup", "arcjegyek, bőrrészletek és smink": "facial marks, skin details and makeup",
    "Haj és részletek": "Hair and details", "frizura és arcszőrzet": "hairstyle and facial hair", "Tekintet és mimika": "Gaze and expression", "nézésirány és arckifejezés": "gaze direction and facial expression",
    "Karakter arctípusa": "Character archetype", "Életkor": "Age", "Identitás": "Identity", "Testalkat": "Body type", "Koponya": "Face shape", "Járomcsont": "Cheekbones", "Állkapocs": "Jaw", "Bőrtónus": "Skin tone", "Szemforma": "Eye shape", "Ajkak": "Lips",
    "Homlok": "Forehead", "Szemöldök formája": "Eyebrow shape", "Szemöldök sűrűsége": "Eyebrow density", "Szempilla": "Eyelashes", "Szemszín": "Eye color", "Írisz": "Iris",
    "Fülek": "Ears", "Orr": "Nose", "Fogak": "Teeth", "Arcjegyek": "Facial features", "Bőrtextúra": "Skin texture", "Szemfestés": "Eye makeup", "Bőr alapozása": "Foundation", "Ajak színe / rúzs": "Lip color / lipstick", "Almaarc (teltebb felső orcák)": "Apple cheeks (full upper cheeks)", "Járomcsont (Almaarc (teltebb felső orcák))": "Cheekbones (Apple cheeks (full upper cheeks))", "Gödröcskés orca": "Cheek dimples", "Szeplős orr- és arctáj": "Freckles across nose and cheeks", "Gödröcskés orca, Szeplős orr- és arctáj": "Cheek dimples, Freckles across nose and cheeks", "Arcjegyek (Gödröcskés orca, Szeplős orr- és arctáj)": "Facial features (Cheek dimples, Freckles across nose and cheeks)", "Útmutató": "Guide", "Olvass el": "Read more", "Öt egymásra épülő szerkesztő egy koherens fotóprompt és egy hozzá illő instrumentális zenei terv elkészítéséhez.": "Five connected editors for creating one coherent photography prompt and a matching instrumental music plan.",
    "Hajszín": "Hair color", "Hajhossz": "Hair length", "Haj sűrűsége": "Hair density", "Hajstílus": "Hairstyle", "Arcszőrzet": "Facial hair", "Tekintet": "Gaze", "Arckifejezés": "Expression", "Pozíció": "Pose",
    "Férfi": "Male", "Nő": "Female", "Mentett karakterek": "Saved characters", "Karakter neve": "Character name", "Mentés": "Save", "Betöltés": "Load", "Módosítás": "Update", "Törlés": "Delete",
    "Mentett karakter kiválasztása": "Select saved character", "- Mentett karakter kiválasztása -": "- Select saved character -", "Még nincs mentett karakter": "No saved characters yet", "Eredeti arc prompt": "Original face prompt", "AI portré prompt": "AI portrait prompt", "Önálló AI portré prompt": "Standalone AI portrait prompt",
    "A Véletlenszerű AI portré vagy az Ember + AI portré gombbal készíthetsz önálló promptot.": "Use Random AI portrait or Human + AI portrait to create a standalone prompt.",
    "Állapot": "Status", "Másolás": "Copy", "Másolva": "Copied", "Alaphelyzet": "Reset", "Tovább": "Next", "Vissza": "Back", "← Vissza": "← Back", "Előre": "Forward", "Előre →": "Forward →", "Alkalmazás": "Apply", "Mégse": "Cancel",
    "Melírozott haj színei": "Highlighted hair colors", "Válassz külön alapszínt és festett/melírszínt.": "Choose separate base and highlight colors.", "Alapszín": "Base color", "Festett / melírszín": "Highlight color",
    "Tájkép": "Landscape", "Épített": "Built", "Épített környezet": "Built environment", "Beltér": "Interior", "Környezettípus": "Environment type", "Tájkép kategóriája": "Landscape category", "Épített környezet kategóriája": "Built-environment category",
    "Hegyvidék": "Mountains", "Erdő és füves táj": "Forest and grassland", "Vízpart és vizes élőhely": "Coasts and wetlands", "Száraz táj": "Arid landscape", "Jég és földtani táj": "Ice and geology",
    "Település": "Settlement", "Közlekedés": "Transport", "Középület": "Civic building", "Történelmi örökség": "Historic heritage", "Konkrét település vagy helyszín": "Specific settlement or location",
    "Pl. Budapest, Várnegyed vagy Pécs, Széchenyi tér": "E.g. Budapest Castle District or Pécs, Széchenyi Square", "Beltéri fényviszonyok": "Interior lighting", "A külső időjárás csak az ablakfényre és a kinti háttérre hat.": "Outdoor weather affects only window light and the exterior background.",
    "Fő fényforrás": "Main light source", "Ablakon érkező természetes fény": "Natural window light", "Mennyezeti általános világítás": "General ceiling light", "Stúdiófény / softbox": "Studio light / softbox", "Lámpák és praktikus fényforrások": "Practical lamps and fixtures", "Kevert természetes és mesterséges fény": "Mixed natural and artificial light",
    "Fénykarakter": "Light character", "Lágy, szórt": "Soft and diffuse", "Világos, egyenletes": "Bright and even", "Határozott, irányított": "Defined and directional", "Drámai, low-key": "Dramatic low-key",
    "Színhőmérséklet": "Color temperature", "Nappali, 5600 K": "Daylight, 5600 K", "Semleges, 4000 K": "Neutral, 4000 K", "Meleg, 3200 K": "Warm, 3200 K", "Kevert színhőmérséklet": "Mixed color temperature",
    "Ablak / főfény iránya": "Window / key-light direction", "Ablak vagy főfény iránya": "Window or key-light direction", "Oldalról": "From the side", "Szemből": "From the front", "Hátulról": "From behind", "Felülről": "From above", "Nincs meghatározó ablakfény": "No dominant window light",
    "Tájtípus kiválasztása": "Select landscape type", "Helyszín részletei": "Location details", "Egyszerre 0–4 részlet választható.": "Select 0–4 details at a time.", "Környezeti elemek": "Environmental details",
    "Közeli fotó témája": "Close-up subject", "Opcionális – a két mód egymást kizárja.": "Optional — the two modes are mutually exclusive.", "Makró közeli": "Macro close-up", "Szupertele közeli": "Supertelephoto close-up", "Téma angolul, pl. a honeybee on lavender": "Subject in English, e.g. a honeybee on lavender",
    "Emberi jelenlét": "Human presence", "A modell körüli közösségi élet és háttérszereplők sűrűsége.": "Density of social activity and background people around the subject.", "Helyszín előnézet": "Location preview", "HELYSZÍN": "LOCATION",
    "Évszak": "Season", "Évszak szakasza · hónapok": "Seasonal phase · months", "Évszak szakasza": "Seasonal phase", "Eleje": "Early", "Közepe": "Mid", "Vége": "Late", "Tavasz": "Spring", "Nyár": "Summer", "Ősz": "Autumn", "Tél": "Winter",
    "Speciális légköri jelenségek": "Special atmospheric phenomena", "Szél és légmozgás": "Wind and air movement", "Szélirány": "Wind direction", "Szélirány (szélcsendnél nem aktív)": "Wind direction (inactive in calm conditions)", "szélcsendnél nem aktív": "inactive in calm conditions", "A légáramlás iránya": "Airflow direction", "Napszak · 0–24 óra": "Time of day · 0–24 hours", "Napállás számítása": "Calculating sun position", "Napszak beállítása": "Set time of day",
    "Fényirány": "Light direction", "Hőérzet korrekció": "Perceived-temperature correction", "Környezeti átlag: –": "Environmental average: –", "Korrekció: 0 °C": "Adjustment: 0 °C", "átlag": "average", "Egyéni öltözet": "Custom clothing", "Automatikus, ha üres": "Automatic when empty", "Fény előnézet": "Light preview",
    "Filmtípus": "Film stock", "Objektív": "Lens", "Képi stílus": "Visual style", "Lencse- és fényeffektusok": "Lens and light effects", "Lencse- és fényeffektus": "Lens and light effect", "Bezárás": "Close", "A kiválasztott filmtípus vizuális előnézete": "Visual preview of the selected film stock", "Filmtípus szerint színezett hegyvidéki referenciafotó": "Mountain reference photo graded to the selected film stock", "Előnézet": "Preview",
    "Prompt változatok": "Prompt variants", "Teljes prompt": "Full prompt", "Önálló tájkép prompt": "Standalone landscape prompt", "Teljes összefűzött prompt": "Complete combined prompt", "Környezet + időjárás + fotó · önálló tájkép prompt": "Environment + weather + photo · standalone landscape prompt",
    "Előzmények": "History", "Előző állapot": "Previous state", "Következő állapot": "Next state", "Korábbi állapot kiválasztása": "Select previous state", "Zárolások": "Locks", "Lezárások": "Locks", "Következetesség": "Consistency", "Rendben": "All good",
    "állapot": "state", "legújabb": "latest", "Portré / álló (4:5)": "Portrait orientation (4:5)", "Tájkép / fekvő (16:9)": "Landscape orientation (16:9)", "Négyzet (1:1)": "Square (1:1)",
    "Középbarna": "Medium brown", "Sötétbarna": "Dark brown", "Világos": "Light", "Egyenes": "Straight", "Kerek": "Round", "Ívelt": "Arched", "Normál": "Normal", "Default": "Default",
    "Extra hosszú": "Extra long", "Féloldalas / oldalt felnyírt": "Side-shaved", "Hosszú": "Long", "Közepes": "Medium length", "Nagyon rövid": "Very short", "Rövid": "Short",
    "Dél-európai": "Southern European", "Mediterrán": "Mediterranean", "Balkáni": "Balkan", "Észak-európai": "Northern European", "Skandináv": "Scandinavian", "Baltikumi": "Baltic", "Kelet-európai": "Eastern European", "Ukrán": "Ukrainian", "Szláv": "Slavic", "Közép-európai": "Central European", "Kaukázusi": "Caucasus region", "Grúz": "Georgian", "Görög": "Greek", "Örmény": "Armenian",
    "Dél-ázsiai": "South Asian", "Délkelet-ázsiai": "Southeast Asian", "Közép-ázsiai": "Central Asian", "Közel-keleti": "Middle Eastern", "Vietnami": "Vietnamese", "Japán": "Japanese", "Kínai": "Chinese", "Koreai": "Korean", "Török": "Turkish",
    "Bal 45°": "Front-left 45°", "Jobb 45°": "Front-right 45°", "Oldalfény": "Side light",
    "Halszemoptika": "Fisheye lens", "Halszemoptika fekete kerettel": "Circular fisheye with black frame", "Makró": "Macro", "Nagylátószögű": "Wide-angle", "Portré": "Portrait", "Szupertele": "Supertelephoto", "Teleobjektív": "Telephoto lens",
    "Akvarell+vonal": "Watercolor + linework", "Barokk festmény": "Baroque painting", "Ceruza": "Pencil drawing", "Digitális festmény": "Digital painting", "Fotó-realisztikus B/W": "Photorealistic B&W", "Futurista": "Futuristic", "Impresszionizmus": "Impressionism", "Leonardo Davinci": "Leonardo da Vinci", "Linómetszet": "Linocut", "Minimalista": "Minimalist", "Olajfesték": "Oil painting", "Pasztell": "Pastel", "Rézkarc / metszet": "Etching / engraving", "Szénrajz": "Charcoal drawing", "Szépia": "Sepia", "Szürrealista": "Surrealist", "Tusrajz": "Ink drawing", "Vektor grafika": "Vector graphics", "Vízfesték": "Watercolor",
    "Csak instrumentális zenetervező": "Instrumental music designer", "Történetből zenei dramaturgia.": "Turn a story into musical dramaturgy.", "A műtípus, a téma és a hangulat együtt alakítja a szerkezetet, a hangszerelést és a produkciós karaktert.": "Project type, theme and mood jointly shape the structure, orchestration and production character.",
    "Műveletek": "Actions", "Véletlenszerű zene generálása": "Generate random music", "Fotóból zene": "Music from photo", "Előbb készítsd el a teljes fotópromptot a Fotó oldalon.": "Complete the full photo prompt on the Photo page first.", "TXT mentése": "Save TXT", "PDF mentése": "Save PDF", "Automatikusan mentve": "Saved automatically",
    "Zenei mű típusa": "Music project type", "Műfaj és zenei nyelv": "Genre and musical language", "A műtípushoz ajánlott műfajok": "Genres recommended for the project type", "Ajánlottak": "Recommended", "Narratív téma": "Narrative theme", "Hangulati ív": "Mood arc", "Témához illesztett felépítés": "Theme-adapted structure", "Automatikus dramaturgia": "Automatic dramaturgy",
    "Hangszerelés és hangzás": "Orchestration and sound", "Több hangszerelési réteg is választható.": "Multiple orchestration layers can be selected.", "Együttes felállása": "Ensemble", "Automatikus zenei beállítások": "Automatic music settings", "A műfaj, a téma, a hangulat és a hangszerek alapján.": "Based on genre, theme, mood and instruments.", "Bekapcsolva": "Enabled",
    "Milyen gyors legyen?": "How fast should it be?", "Nyugodt, jól követhető tempó.": "A calm, easy-to-follow tempo.", "Hogyan lüktessen?": "What should the pulse feel like?", "Milyen legyen az alaphangulata?": "What should its tonal mood be?", "Milyen hosszú legyen?": "How long should it be?", "Legyen kiemelt hangszeres szóló?": "Feature an instrumental solo?",
    "Produkció és tér": "Production and space", "Közönséghangulat": "Audience atmosphere", "Egyéni rendezői megjegyzés": "Custom direction note", "Például: a főmotívum a végén csak zongorán térjen vissza…": "For example: let the main theme return only on piano at the end…",
    "JAVASOLT DALCÍM": "SUGGESTED SONG TITLE", "SUNO BEÁLLÍTÁSOK": "SUNO SETTINGS", "Automatikus javaslat": "Automatic recommendation", "Új cím": "New title", "Javasolt kezelőfelületi értékek · nem részei a promptnak.": "Suggested interface values · not part of the prompt.", "ENERGIAÍV": "ENERGY ARC",
    "Lyrics · Instrumental Structure": "Lyrics · Instrumental Structure", "Suno Style Prompt": "Suno Style Prompt", "Zenei szerkezet": "Musical structure", "Felépítés": "Structure", "Ritmikai karakter": "Rhythmic character", "Hangnemi karakter": "Tonal character", "Időtartam": "Duration",
    "0 szó": "0 words", "0 karakter": "0 characters", "szó": "words", "karakter": "characters", "kiválasztva": "selected", "aktív": "active", "Nincs kiválasztva": "Not selected",

    "Vak": "Blind / unfocused gaze", "Nincs": "None", "Nincsenek emberek": "No people", "Egyedül": "Alone", "Egy személy": "One person", "Kis csoport": "Small group", "Közösség": "Community", "Tömeg": "Crowd", "Gyerekek is legyenek": "Include children", "Gyerekekkel": "With children",
    "Bal harmad": "Left third", "Középső harmad": "Center third", "Jobb harmad": "Right third",
    "Január": "January", "Február": "February", "Március": "March", "Április": "April", "Május": "May", "Június": "June", "Július": "July", "Augusztus": "August", "Szeptember": "September", "Október": "October", "November": "November", "December": "December",
    "Derült": "Clear", "Részben felhős": "Partly cloudy", "Borult": "Overcast", "Eső": "Rain", "Zivatar": "Thunderstorm", "Havazás": "Snowfall", "Hózápor": "Snow shower", "Köd": "Fog", "Pára": "Mist", "Zúzmara": "Rime frost", "Homokvihar": "Sandstorm", "Sarki fény": "Aurora", "Szivárvány": "Rainbow", "Jégeső": "Hail", "Havas eső": "Sleet", "Délibáb": "Mirage", "Tornádó": "Tornado", "Porördög": "Dust devil", "Víztölcsér": "Waterspout", "Hófúvás": "Blowing snow",
    "Szélcsend": "Calm", "Enyhe szellő": "Light breeze", "Mérsékelt szél": "Moderate wind", "Erős szél": "Strong wind", "Viharos szél": "Gale-force wind", "Orkánerejű szél": "Hurricane-force wind",
    "Balról jobbra": "Left to right", "Jobbról balra": "Right to left", "Bal előtérből jobb háttérbe": "Left foreground to right background", "Jobb előtérből bal háttérbe": "Right foreground to left background", "Bal háttérből jobb előtérbe": "Left background to right foreground", "Jobb háttérből bal előtérbe": "Right background to left foreground", "Háttérből a kamera felé": "Background toward camera", "Kamerától a háttér felé": "Camera toward background",
    "Terminál": "Terminal", "Irányítótorony": "Control tower", "Forgalmi előtér": "Airport apron", "Utasbeszállító híd": "Jet bridge", "Szervizút": "Service road", "Pályafények": "Runway lights", "Előtér anyaga": "Apron surface", "Megközelítés": "Approach", "Építészeti világítás": "Architectural lighting", "Környezeti háttér": "Environmental background", "kihagyva": "skipped",
    "Amorív": "Cupid's bow", "Ámorív": "Cupid's bow", "Szív alakú": "Heart-shaped", "Teltebb felső ajak": "Fuller upper lip", "Egyenetlen ajkak": "Uneven lips", "Teltebb alsó ajak": "Fuller lower lip", "Kerek ajkak": "Round lips", "Lefelé ívelő ajkak": "Downturned lips", "Szögletes (lágyított)": "Softened angular", "Széles ajkak": "Wide lips", "Teljes ajak": "Full lips",
    "Falu": "Village", "Történelmi város": "Historic town", "Modern város": "Modern city", "Tér és főtér": "Square and main plaza", "Lakónegyed": "Residential district", "Bazár és piac": "Bazaar and market",
    "Piaci árkád": "Market arcade", "Árusok standjai": "Vendor stalls", "Textilárnyékolók": "Fabric canopies", "Fűszeres pult": "Spice stall", "Kézműves áruk": "Handcrafted goods", "Piaci átjáró": "Market passage"
  };

  const auto = new Map();
  const cleanPromptLabel = (value) => {
    const first = String(value || "").split(/[;,]/)[0].replace(/\([^)]*\)/g, "").trim();
    if (!first) return "";
    return first.charAt(0).toUpperCase() + first.slice(1);
  };

  const buildAutoDictionary = () => {
    const data = window.PROMPT_GENERATOR_DATA || {};
    Object.values(data).forEach((rows) => {
      if (!Array.isArray(rows)) return;
      rows.forEach((row) => {
        if (!row || typeof row !== "object") return;
        const entries = Object.entries(row);
        const source = entries.find(([key, value]) => typeof value === "string" && (key.endsWith("_id") || key === "label" || key === "nev"));
        const prompt = entries.find(([key, value]) => typeof value === "string" && (key.endsWith("_prompt") || key === "prompt" || key === "leiras"));
        if (source && prompt && source[1] !== prompt[1]) auto.set(source[1], cleanPromptLabel(prompt[1]));
      });
    });
  };

  const translate = (value) => {
    const text = String(value ?? "");
    if (language === "hu" || !text.trim()) return text;
    if (EN[text]) return EN[text];
    if (auto.has(text)) return auto.get(text);
    const dashedSection = text.match(/^(\d+[A-Z]?)\s*-\s*(.+)$/);
    if (dashedSection) return `${dashedSection[1]} - ${translate(dashedSection[2])}`;
    const historyStatus = text.match(/^(\d+)\/(\d+) állapot$/);
    if (historyStatus) return `${historyStatus[1]}/${historyStatus[2]} states`;
    const historyEntry = text.match(/^(\d+)\. állapot(?:\s*·\s*legújabb)?$/);
    if (historyEntry) return `${historyEntry[1]}. state${text.includes("legújabb") ? " · latest" : ""}`;
    const numbered = text.match(/^(\d+[A-Z]?)\s*[.]\s*(.+)$/);
    if (numbered) return `${numbered[1]} · ${translate(numbered[2])}`;
    const promptTitle = text.match(/^Prompt (\d+) - (.+)$/);
    if (promptTitle) return `Prompt ${promptTitle[1]} - ${translate(promptTitle[2])}`;
    const fieldContext = text.match(/^(.+) \((.+)\)$/);
    if (fieldContext) return `${translate(fieldContext[1])} (${translate(fieldContext[2])})`;
    const count = text.match(/^(\d+) szó(?:\s*[·-]\s*(\d+) karakter)?(?:\s*-\s*(\d+) ismétlés,\s*(\d+) ellentmondás szűrve)?$/);
    if (count) return `${count[1]} words${count[2] ? ` · ${count[2]} characters` : ""}${count[3] ? ` · ${count[3]} repetitions and ${count[4]} conflicts filtered` : ""}`;
    const completed = text.match(/^(\d+) mező kitöltve$/);
    if (completed) return `${completed[1]} fields completed`;
    const selection = text.match(/^- (.+) választása -$/);
    if (selection) return `- Select ${translate(selection[1]).toLowerCase()} -`;
    return text;
  };

  const shouldSkip = (node) => node.parentElement?.closest("script, style, textarea, [data-i18n-skip]");

  const applyTextNode = (node) => {
    if (shouldSkip(node)) return;
    if (!sourceNodes.has(node)) sourceNodes.set(node, node.nodeValue);
    let source = sourceNodes.get(node);
    const rendered = language === "hu" ? source : (() => {
      const leading = source.match(/^\s*/)?.[0] || "";
      const trailing = source.match(/\s*$/)?.[0] || "";
      return `${leading}${translate(source.trim())}${trailing}`;
    })();
    if (!changingLanguage && node.nodeValue !== source && node.nodeValue !== rendered) {
      source = node.nodeValue;
      sourceNodes.set(node, source);
    }
    const leading = source.match(/^\s*/)?.[0] || "";
    const trailing = source.match(/\s*$/)?.[0] || "";
    const core = source.trim();
    const next = core ? `${leading}${translate(core)}${trailing}` : source;
    if (node.nodeValue !== next) node.nodeValue = next;
  };

  const applyAttributes = (element) => {
    const names = ["aria-label", "title", "placeholder", "alt"];
    let sources = sourceAttributes.get(element);
    if (!sources) { sources = {}; sourceAttributes.set(element, sources); }
    names.forEach((name) => {
      if (!element.hasAttribute(name)) return;
      if (!(name in sources)) sources[name] = element.getAttribute(name);
      const next = translate(sources[name]);
      if (element.getAttribute(name) !== next) element.setAttribute(name, next);
    });
  };

  const apply = (root = document.body) => {
    if (!root || applying) return;
    applying = true;
    try {
      if (root.nodeType === Node.TEXT_NODE) applyTextNode(root);
      if (root.nodeType === Node.ELEMENT_NODE) {
        applyAttributes(root);
        root.querySelectorAll("*").forEach(applyAttributes);
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) applyTextNode(walker.currentNode);
      }
      document.documentElement.lang = language;
      document.querySelectorAll("[data-language]").forEach((button) => {
        const selected = button.dataset.language === language;
        button.classList.toggle("selected", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
    } finally { applying = false; }
  };

  const setLanguage = (next) => {
    if (!SUPPORTED.has(next) || next === language) return;
    language = next;
    localStorage.setItem(STORAGE_KEY, language);
    changingLanguage = true;
    try {
      apply(document.body);
      window.dispatchEvent(new CustomEvent("promptbuilder:languagechange", { detail: { language } }));
    } finally { changingLanguage = false; }
  };

  const mountSwitcher = () => {
    const host = document.querySelector(".topbar") || document.body;
    if (document.querySelector(".language-switcher")) return;
    const switcher = document.createElement("div");
    switcher.className = "language-switcher";
    switcher.setAttribute("role", "group");
    switcher.setAttribute("aria-label", "Nyelv / Language");
    switcher.innerHTML = '<button type="button" data-language="hu" aria-label="Magyar"><img src="assets/ui/flag-hu.svg" alt="" aria-hidden="true"><span>HU</span></button><button type="button" data-language="en" aria-label="English"><img src="assets/ui/flag-en.svg" alt="" aria-hidden="true"><span>EN</span></button><a class="guide-link" href="readme.html" aria-label="Olvass el"><span aria-hidden="true">?</span><strong>Olvass el</strong></a>';
    switcher.addEventListener("click", (event) => {
      const button = event.target.closest("[data-language]");
      if (button) setLanguage(button.dataset.language);
    });
    host.appendChild(switcher);
  };

  const start = () => {
    buildAutoDictionary();
    mountSwitcher();
    apply(document.body);
    const observer = new MutationObserver((mutations) => {
      if (applying) return;
      mutations.forEach((mutation) => {
        if (mutation.type === "characterData") apply(mutation.target);
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) apply(node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  };

  window.I18N = { get language() { return language; }, t: translate, apply, setLanguage };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
