(() => {
  "use strict";

  const STORAGE_KEY = "suno-prompt-builder-state-v1";
  const PHOTO_MUSIC_SOURCE_KEY = "photo_music_source_v1";
  const INSTRUMENTAL_LOCK = "instrumental only, no vocals, no choir, no spoken words";
  const STYLE_PROMPT_MAX_LENGTH = 1000;

  const PROJECTS = [
    { key: "film", label: "Filmzene", hint: "Jelenetközpontú dramaturgia", prompt: "cinematic film score" },
    { key: "trailer", label: "Trailerzene", hint: "Gyors, monumentális építkezés", prompt: "epic cinematic trailer score" },
    { key: "game", label: "Játékzene", hint: "Ismételhető, világépítő forma", prompt: "immersive video game soundtrack" },
    { key: "rock", label: "Instrumentális rock", hint: "Riff, szóló és dinamikai ív", prompt: "instrumental rock composition" },
    { key: "electronic", label: "Elektronikus klubzene", hint: "Build-up, breakdown és drop", prompt: "instrumental electronic club track" },
    { key: "classical", label: "Klasszikus zenemű", hint: "Tematikus fejlesztés", prompt: "contemporary classical composition" },
    { key: "piano_concerto", label: "Zongoraverseny", hint: "Szólózongora és zenekar párbeszéde", prompt: "instrumental piano concerto for solo concert piano and symphony orchestra" },
    { key: "symphonic", label: "Szimfonikus költemény", hint: "Történetmesélő zenekari mű", prompt: "programmatic symphonic poem" },
    { key: "oratorio", label: "Oratóriumszerű zenekari mű", hint: "Monumentális, de ének nélkül", prompt: "monumental oratorio-inspired orchestral work without voices" },
    { key: "ambient", label: "Ambient hangkép", hint: "Tér, textúra és lassú változás", prompt: "instrumental ambient soundscape" },
    { key: "experimental", label: "Kísérleti kompozíció", hint: "Szokatlan forma és hangszínek", prompt: "experimental instrumental composition" },
    { key: "world", label: "Nép- és világzenei darab", hint: "Hagyományos stílus és hiteles felállás", prompt: "instrumental traditional and world-music composition" }
  ];

  const GENRES = [
    { key: "cinematic", label: "Cinematic orchestral", prompt: "cinematic orchestral language" },
    { key: "hybrid", label: "Hybrid orchestral", prompt: "hybrid orchestral production with acoustic and electronic layers" },
    { key: "romantic", label: "Romantikus klasszikus", prompt: "late-Romantic classical language" },
    { key: "minimal", label: "Minimalista", prompt: "modern minimalist writing with evolving repetition" },
    { key: "progressive", label: "Progressive rock", prompt: "progressive instrumental rock" },
    { key: "postrock", label: "Post-rock", prompt: "atmospheric instrumental post-rock" },
    { key: "fastrock", label: "Gyors rock", prompt: "fast driving instrumental rock" },
    { key: "rockballad", label: "Rockballada", prompt: "slow-building emotional instrumental rock ballad" },
    { key: "hardrock", label: "Hard rock", prompt: "guitar-driven instrumental hard rock" },
    { key: "metal", label: "Heavy metal", prompt: "classic heavy instrumental metal" },
    { key: "speedmetal", label: "Speed metal", prompt: "fast precise instrumental speed metal" },
    { key: "symphonicmetal", label: "Symphonic metal", prompt: "instrumental symphonic metal with integrated orchestra and metal band" },
    { key: "industrialmetal", label: "Industrial metal", prompt: "instrumental industrial metal with machine-tight guitar riffs, hybrid acoustic and electronic percussion, cold synthesis and mechanical sound design" },
    { key: "violinmetal", label: "Virtuóz violin metal", prompt: "instrumental virtuoso violin metal led by amplified solo violin, expressive solo cello and concert piano, with an original memorable melodic identity, neoclassical development, distinct melodic violin and electric-guitar solos and a powerful metal rhythm section" },
    { key: "techno", label: "Melodic techno", prompt: "melodic techno with detailed evolving synthesis" },
    { key: "industrial", label: "Industrial techno", prompt: "dark industrial techno" },
    { key: "synthwave", label: "Synthwave", prompt: "cinematic retro synthwave" },
    { key: "darkambient", label: "Dark ambient", prompt: "dark cinematic ambient" },
    { key: "world", label: "Világzenei fúzió", prompt: "organic world-music fusion" },
    { key: "flamenco", label: "Flamenco", prompt: "instrumental Andalusian flamenco with authentic compás" },
    { key: "csardas", label: "Csárdás", prompt: "instrumental Hungarian csárdás moving from slow lassú to fast friss" },
    { key: "tango", label: "Argentin tangó", prompt: "instrumental Argentine tango in authentic orquesta típica language" },
    { key: "chanson", label: "Instrumentális francia sanzon", prompt: "instrumental French chanson with intimate Parisian acoustic character" },
    { key: "sirtaki", label: "Görög szirtaki", prompt: "instrumental Greek sirtaki moving from slow 4/4 hasapiko into fast 2/4 hasaposerviko" },
    { key: "arabic", label: "Arab instrumentális zene", prompt: "instrumental Arabic classical music shaped by maqam-based melodic development and clear iqa rhythmic cycles" },
    { key: "polka", label: "Polka", prompt: "lively instrumental Central European polka in buoyant 2/4 meter" },
    { key: "military", label: "Katonazene", prompt: "ceremonial instrumental military march for wind band with disciplined forward motion" },
    { key: "russian_folk", label: "Orosz népies zene", prompt: "instrumental Russian folk-orchestra music with authentic plucked-string and button-accordion character" },
    { key: "israeli_folk", label: "Izraeli népzene", prompt: "instrumental Israeli folk-dance music with communal circle-dance energy and Mediterranean acoustic color" },
    { key: "italian_folk", label: "Olasz népzene / tarantella", prompt: "instrumental southern Italian folk and tarantella music with vivid acoustic dance character" },
    { key: "serbian_folk", label: "Szerb népzene / kolo", prompt: "instrumental Serbian folk kolo with fast communal circle-dance energy and authentic Balkan acoustic character" }
  ];

  const THEMES = [
    { key: "journey", label: "Hősi utazás", prompt: "a determined heroic journey through escalating trials", motif: "ascending resilient main motif" },
    { key: "discovery", label: "Felfedezés", prompt: "the wonder and uncertainty of discovering an unknown world", motif: "curious expanding discovery motif" },
    { key: "homecoming", label: "Hazatérés", prompt: "a long-awaited return home shaped by memory and change", motif: "warm homecoming motif with a trace of distance" },
    { key: "battle", label: "Harc és győzelem", prompt: "a relentless struggle that culminates in hard-earned victory", motif: "bold rhythmic conflict motif" },
    { key: "loss", label: "Veszteség", prompt: "grief, absence and the slow acceptance of irreversible loss", motif: "fragile descending lament motif" },
    { key: "rebirth", label: "Újjászületés", prompt: "renewal emerging from collapse and exhaustion", motif: "small motif gradually transformed into a confident theme" },
    { key: "nature", label: "Ember és természet", prompt: "human vulnerability within immense natural forces", motif: "organic wide-interval landscape motif" },
    { key: "storm", label: "Vihar és természeti erők", prompt: "violent natural forces moving from distant warning to full impact", motif: "turbulent cyclical storm motif" },
    { key: "ancient", label: "Ősi civilizáció", prompt: "the ruins, rituals and forgotten knowledge of an ancient civilization", motif: "modal ancient-world motif" },
    { key: "mystery", label: "Rejtély és nyomozás", prompt: "a layered mystery revealed through clues, doubt and hidden danger", motif: "questioning chromatic motif" },
    { key: "dystopia", label: "Disztópia", prompt: "life under a vast dehumanizing dystopian system", motif: "cold mechanical motif resisting harmonic pressure" },
    { key: "technology", label: "Gépek és technológia", prompt: "the tension between human intention and autonomous machinery", motif: "precise interlocking machine motif" },
    { key: "space", label: "Űrutazás", prompt: "solitary travel across an immense and unfamiliar cosmos", motif: "slowly unfolding cosmic motif" },
    { key: "spiritual", label: "Spirituális felemelkedés", prompt: "an inward passage toward clarity and transcendence", motif: "luminous rising contemplative motif" },
    { key: "love", label: "Szerelem", prompt: "the intimacy, longing, vulnerability and transformative power of love", motif: "tender two-phrase love motif whose answering lines draw closer with every return" },
    { key: "celebration", label: "Ünneplés", prompt: "collective celebration, motion and shared release", motif: "bright rhythmic communal motif" },
    { key: "time", label: "Az idő múlása", prompt: "the passage of time, memory and inevitable transformation", motif: "repeating clock-like motif that changes with every return" }
  ];

  const MOODS = [
    { key: "dark_hope", label: "Sötétből reményteljesbe", prompt: "begin dark and restrained, then move toward cautious hope", energy: [18, 26, 39, 62, 78, 66] },
    { key: "calm_epic", label: "Nyugodtból monumentálisba", prompt: "begin spacious and calm, then grow into monumental scale", energy: [12, 20, 34, 57, 96, 72] },
    { key: "mystery_threat", label: "Titokzatosból fenyegetőbe", prompt: "evolve from mystery into a threatening climax, then leave a tense atmospheric aftermath", energy: [22, 27, 38, 54, 90, 58] },
    { key: "melancholy_uplift", label: "Melankolikusból felemelőbe", prompt: "transform melancholy into emotional uplift without becoming sentimental", energy: [24, 22, 36, 52, 76, 84] },
    { key: "tension_release", label: "Feszültségből feloldásba", prompt: "accumulate controlled tension before a clear emotional release", energy: [35, 46, 61, 82, 95, 38] },
    { key: "descending", label: "Folyamatosan sötétedő", prompt: "grow progressively darker, heavier and less stable", energy: [38, 45, 55, 68, 82, 91] },
    { key: "waves", label: "Hullámzó intenzitás", prompt: "move through several waves of expansion and retreat", energy: [28, 62, 34, 77, 46, 88] },
    { key: "hypnotic", label: "Hipnotikus energia", prompt: "maintain hypnotic momentum through subtle continuous evolution", energy: [48, 55, 59, 56, 64, 61] },
    { key: "tragic", label: "Tragikus, feloldás nélkül", prompt: "build toward tragedy and end without harmonic resolution", energy: [25, 39, 55, 73, 91, 44] },
    { key: "triumphant", label: "Diadalmas", prompt: "sustain confident triumphant energy with a larger final statement", energy: [58, 68, 72, 66, 86, 100] },
    { key: "hymnic", label: "Himnikus, nagyívű", prompt: "build a broad hymn-like instrumental theme toward noble large-scale grandeur, strictly without choir or vocals", energy: [36, 46, 58, 72, 88, 100] },
    { key: "epic", label: "Epikus, monumentális", prompt: "sustain cinematic epic scale with a bold recurring motif, powerful rhythmic propulsion, escalating instrumental weight and a decisive climax, strictly without choir or vocals", energy: [42, 55, 68, 80, 95, 100] }
  ];

  const INSTRUMENTS = [
    { key: "strings", label: "Vonószenekar", prompt: "expressive orchestral strings" },
    { key: "brass", label: "Rézfúvósok", prompt: "powerful controlled brass" },
    { key: "woodwinds", label: "Fafúvósok", prompt: "detailed solo and ensemble woodwinds" },
    { key: "clarinet", label: "Klarinét", prompt: "ornamented expressive clarinet" },
    { key: "piano", label: "Zongora", prompt: "natural concert piano" },
    { key: "viola", label: "Brácsa", prompt: "warm rhythmic viola" },
    { key: "double_bass", label: "Nagybőgő", prompt: "resonant acoustic double bass" },
    { key: "harp", label: "Hárfa", prompt: "natural orchestral harp" },
    { key: "cimbalom", label: "Cimbalom", prompt: "virtuosic Hungarian concert cimbalom (hammered dulcimer)" },
    { key: "percussion", label: "Zenekari ütősök", prompt: "orchestral percussion with timpani, cymbals and concert bass drum" },
    { key: "cinematic_percussion", label: "Mozis ütősök", prompt: "deep cinematic percussion and impact drums" },
    { key: "acoustic_guitar", label: "Akusztikus gitár", prompt: "natural steel-string acoustic guitar" },
    { key: "flamenco_guitar", label: "Flamencogitár", prompt: "dry percussive nylon-string flamenco guitar with rasgueado and picado articulation" },
    { key: "palmas_cajon", label: "Palmas és cajón", prompt: "authentic flamenco palmas handclaps and restrained cajón patterns" },
    { key: "bandoneon", label: "Bandoneon", prompt: "expressive Argentine bandoneon with breath-like bellows phrasing" },
    { key: "accordion", label: "Harmonika", prompt: "warm French musette accordion" },
    { key: "bouzouki", label: "Buzuki", prompt: "bright articulate Greek bouzouki" },
    { key: "baglamas", label: "Görög baglamas", prompt: "small Greek baglamas providing crisp rhythmic chordal support" },
    { key: "oud", label: "Úd", prompt: "warm expressive Arabic oud with detailed plectrum articulation" },
    { key: "qanun", label: "Kánun", prompt: "shimmering Arabic qanun with precise ornamented plucked patterns" },
    { key: "ney", label: "Ney", prompt: "breathy expressive Arabic ney flute" },
    { key: "arabic_violin", label: "Arab hegedű", prompt: "expressive Arabic violin with maqam ornamentation and flexible intonation" },
    { key: "arabic_percussion", label: "Darbuka és riq", prompt: "authentic Arabic percussion with darbuka and riq articulating clear iqa cycles" },
    { key: "balalaika", label: "Balalajka", prompt: "bright Russian prima and alto balalaikas with crisp tremolo and rhythmic strumming" },
    { key: "domra", label: "Domra", prompt: "brilliant Russian domra section with precise plectrum articulation" },
    { key: "bayan", label: "Baján / orosz harmonika", prompt: "rich Russian bayan button accordion with broad bellows phrasing" },
    { key: "folk_bass", label: "Basszus- és kontrabasszus-balalajka", prompt: "deep Russian bass and contrabass balalaikas anchoring the folk ensemble" },
    { key: "military_woodwinds", label: "Katonai fafúvós szekció", prompt: "marching woodwinds with piccolo, flutes, clarinets and saxophones" },
    { key: "military_brass", label: "Katonai rézfúvós szekció", prompt: "ceremonial brass with trumpets, horns, trombones, euphoniums and tuba" },
    { key: "marching_percussion", label: "Menetdob és nagydob", prompt: "disciplined marching percussion with snare drum, bass drum and restrained cymbal accents" },
    { key: "polka_percussion", label: "Polkadob és cintányér", prompt: "light acoustic polka percussion with snare, bass drum and restrained cymbal accents" },
    { key: "mandolin", label: "Mandolin", prompt: "bright acoustic mandolin with crisp tremolo and articulated plectrum phrasing" },
    { key: "classical_guitar", label: "Klasszikus gitár", prompt: "warm nylon-string classical guitar with natural acoustic resonance" },
    { key: "organetto", label: "Olasz organetto", prompt: "lively Italian diatonic button accordion with short breathing phrases" },
    { key: "tamburello", label: "Tamburello", prompt: "authentic southern Italian tamburello frame drum with agile articulated accents" },
    { key: "israeli_accordion", label: "Izraeli harmonika", prompt: "lively acoustic accordion with clear Israeli folk-dance phrasing" },
    { key: "chalil", label: "Chalil és fuvola", prompt: "bright chalil recorder and wooden flute with direct pastoral phrasing" },
    { key: "israeli_percussion", label: "Darbuka és tamburin", prompt: "restrained darbuka, hand drum and tambourine supporting Israeli folk-dance motion" },
    { key: "frula", label: "Frula", prompt: "bright Serbian frula wooden flute with agile ornamented folk phrasing" },
    { key: "tamburica", label: "Tamburica-szekció", prompt: "crisp Serbian tamburica section with articulated plectrum accompaniment" },
    { key: "serbian_accordion", label: "Szerb harmonika", prompt: "virtuosic Serbian accordion with rapid ornamented kolo phrasing" },
    { key: "tapan", label: "Goč / tapan", prompt: "deep Serbian goč and tapan-style double-headed drum with clear dance accents" },
    { key: "brushed_drums", label: "Seprűs dob", prompt: "subtle acoustic brushed drums" },
    { key: "guitars", label: "Elektromos gitárok", prompt: "layered expressive electric guitars" },
    { key: "bass_guitar", label: "Basszusgitár", prompt: "warm articulate electric bass guitar" },
    { key: "rockdrums", label: "Akusztikus dob", prompt: "dynamic live rock drums" },
    { key: "doublekick_drums", label: "Duplázó lábdobos dob", prompt: "powerful acoustic metal drum kit with twin bass drums and precise double-kick patterns" },
    { key: "keyboards", label: "Billentyűs hangszerek", prompt: "vintage keyboards and expressive organ" },
    { key: "hammond", label: "Hammond-orgona", prompt: "warm overdriven Hammond organ" },
    { key: "synths", label: "Analóg szintetizátor", prompt: "evolving analog synthesizers" },
    { key: "electronic", label: "Dobgép", prompt: "precise electronic drum-machine programming" },
    { key: "sounddesign", label: "Hangdizájn", prompt: "cinematic sound-design textures" },
    { key: "worldperc", label: "Világzenei ütősök", prompt: "organic world percussion" },
    { key: "solo_cello", label: "Szóló cselló", prompt: "intimate solo cello" },
    { key: "solo_violin", label: "Szóló hegedű", prompt: "virtuosic expressive solo violin" }
  ];

  const PRODUCTIONS = [
    { key: "cinematic", label: "Mozis, széles tér", prompt: "wide cinematic mix, deep front-to-back perspective and controlled low end" },
    { key: "concert", label: "Élő koncertterem", prompt: "natural concert-hall acoustics, realistic ensemble placement and performance dynamics" },
    { key: "studio", label: "Modern stúdió", prompt: "polished modern studio production, precise transient detail and balanced stereo field" },
    { key: "raw", label: "Nyers élő előadás", prompt: "raw live performance energy with natural imperfections and minimal processing" },
    { key: "club", label: "Klubrendszerre keverve", prompt: "club-focused production with firm sub-bass, clean punch and controlled loudness" },
    { key: "analog", label: "Meleg analóg karakter", prompt: "warm analog character, gentle saturation and smooth high-frequency roll-off" },
    { key: "immersive", label: "Magával ragadó tér", prompt: "immersive spatial production with moving depth and detailed atmospheric layers" },
    { key: "minimal", label: "Intim, minimalista", prompt: "intimate close production with ample silence and restrained processing" }
  ];

  const TITLE_SUGGESTIONS = {
    journey: ["The Long Ascent", "Road Beyond Dawn", "Unbroken Miles", "Where the Horizon Calls"],
    discovery: ["Uncharted Light", "Beyond the Known", "The First Horizon", "Atlas of Wonder"],
    homecoming: ["The Road Remembers", "Home Through Rain", "A Familiar Distance", "Return to the Quiet"],
    battle: ["Iron Resolve", "The Last Advance", "Victory Has a Price", "Unbroken Standard"],
    loss: ["What Remains", "The Empty Chair", "After Your Echo", "A Name in the Rain"],
    rebirth: ["From the Ashes", "Second Sunrise", "Begin Again", "The Shape of Renewal"],
    nature: ["Beneath an Endless Sky", "The Mountain Breathes", "Wild Geometry", "Where the Earth Speaks"],
    storm: ["Eye of the Tempest", "When the Sky Breaks", "Stormline", "The Weight of Thunder"],
    ancient: ["Ruins Remember", "The Forgotten Crown", "Temple Without Time", "Dust of an Empire"],
    mystery: ["The Hidden Pattern", "Nocturne for a Secret", "The Unanswered Door", "Clues in the Dark"],
    dystopia: ["City Without Dawn", "The Silent Regime", "Concrete Horizon", "System Failure"],
    technology: ["Ghost in the Circuit", "Machine Intent", "Synthetic Memory", "The Last Protocol"],
    space: ["Between Silent Stars", "Orbit of Solitude", "The Far Signal", "Beyond the Event Horizon"],
    spiritual: ["Inner Light", "The Quiet Ascension", "Beyond the Self", "A Door of Stillness"],
    love: ["The Space Between Us", "Closer With Every Return", "When Two Themes Meet", "Written in Your Rhythm"],
    celebration: ["All Lights Rising", "The Common Pulse", "Bright Together", "Night of Open Hands"],
    time: ["The Clock Forgets", "Years Between Notes", "Everything Returns Changed", "A Measure of Time"]
  };

  const PROJECT_SETTING_DEFAULTS = {
    film: { weirdness: 46, influence: 68 },
    trailer: { weirdness: 42, influence: 72 },
    game: { weirdness: 50, influence: 65 },
    rock: { weirdness: 48, influence: 68 },
    electronic: { weirdness: 54, influence: 66 },
    classical: { weirdness: 42, influence: 72 },
    piano_concerto: { weirdness: 40, influence: 78 },
    symphonic: { weirdness: 44, influence: 72 },
    oratorio: { weirdness: 43, influence: 72 },
    ambient: { weirdness: 58, influence: 60 },
    experimental: { weirdness: 70, influence: 54 },
    world: { weirdness: 48, influence: 74 }
  };

  const PROJECT_STYLE_FAMILY = {
    film: "orchestral", trailer: "orchestral", game: "hybrid", rock: "rock",
    electronic: "electronic", classical: "orchestral", piano_concerto: "orchestral", symphonic: "orchestral",
    oratorio: "orchestral", ambient: "electronic", experimental: "experimental", world: "world"
  };

  const GENRE_STYLE_FAMILY = {
    cinematic: "orchestral", hybrid: "hybrid", romantic: "orchestral", minimal: "experimental",
    progressive: "rock", postrock: "rock", fastrock: "rock", rockballad: "rock", hardrock: "rock", metal: "rock", speedmetal: "rock", symphonicmetal: "rock", industrialmetal: "rock", violinmetal: "rock", techno: "electronic",
    industrial: "electronic", synthwave: "electronic", darkambient: "electronic", world: "world",
    flamenco: "world", csardas: "world", tango: "world", chanson: "world", sirtaki: "world", arabic: "world",
    polka: "world", military: "world", russian_folk: "world", israeli_folk: "world", italian_folk: "world", serbian_folk: "world"
  };

  const RECOMMENDED_GENRES_BY_PROJECT = {
    film: ["cinematic", "hybrid", "romantic", "minimal", "darkambient", "world"],
    trailer: ["hybrid", "cinematic", "industrial", "industrialmetal", "symphonicmetal", "violinmetal", "metal"],
    game: ["hybrid", "cinematic", "techno", "darkambient", "world"],
    rock: ["progressive", "postrock", "fastrock", "rockballad", "hardrock", "metal", "speedmetal", "symphonicmetal", "industrialmetal", "violinmetal"],
    electronic: ["techno", "industrial", "synthwave", "darkambient"],
    classical: ["romantic", "minimal"],
    piano_concerto: ["romantic", "cinematic", "minimal"],
    symphonic: ["cinematic", "romantic", "minimal", "world", "symphonicmetal", "violinmetal"],
    oratorio: ["romantic", "cinematic", "minimal"],
    ambient: ["darkambient", "minimal", "world"],
    experimental: ["minimal", "industrial", "darkambient", "hybrid", "world"],
    world: ["flamenco", "csardas", "tango", "chanson", "sirtaki", "arabic", "polka", "russian_folk", "israeli_folk", "italian_folk", "serbian_folk", "military", "world", "romantic"]
  };

  const MOOD_STYLE_TAGS = {
    dark_hope: "dark and restrained, gradually cautiously hopeful",
    calm_epic: "spacious and calm, rising to monumental scale",
    mystery_threat: "mysterious, increasingly threatening",
    melancholy_uplift: "melancholic, gradually uplifting, unsentimental",
    tension_release: "controlled tension, decisive emotional release",
    descending: "progressively darker, heavier and unstable",
    waves: "wave-like expansion and retreat",
    hypnotic: "hypnotic momentum, subtly evolving",
    tragic: "tragic, unresolved ending",
    triumphant: "confident, triumphant, expansive finale",
    hymnic: "hymn-like instrumental grandeur, broad noble theme, massed harmonies, strictly no choir",
    epic: "cinematic epic scale, bold recurring motif, powerful rhythmic drive, massive instrumental climax, strictly no choir"
  };

  const PRODUCTION_STYLE_TAGS = {
    cinematic: "wide cinematic mix, deep perspective, controlled low end",
    concert: "natural concert-hall acoustics, realistic ensemble placement",
    studio: "polished modern studio production, precise transients",
    raw: "raw live dynamics, natural imperfections, minimal processing",
    club: "club-focused mix, firm sub-bass, clean punch",
    analog: "warm analog saturation, smooth high-frequency roll-off",
    immersive: "immersive spatial depth, detailed atmospheric layers",
    minimal: "intimate close mix, ample silence, restrained processing"
  };

  const RHYTHMS = [
    ["steady", "Stabil, egyenletes", "steady controlled pulse", "Steady and even"],
    ["driving", "Hajtó, előremozgó", "driving forward rhythmic momentum", "Driving and forward-moving"],
    ["syncopated", "Szinkópált", "syncopated rhythm with shifting accents", "Syncopated"],
    ["polyrhythmic", "Poliritmikus", "layered polyrhythmic motion", "Polyrhythmic"],
    ["free", "Szabad, lebegő", "free-flowing pulse without a rigid beat", "Free and floating"],
    ["ritual", "Rituális", "ceremonial repeating rhythmic pattern", "Ritual"],
    ["accelerating", "Fokozatosan gyorsuló", "gradually accelerating dance pulse", "Gradually accelerating"],
    ["iqa", "Arab iqa ciklus", "cyclical Arabic iqa rhythmic pattern with clear ornamental accents", "Arabic iqa cycle"],
    ["polka", "Polka 2/4", "buoyant 2/4 polka pulse with clear bass-note and offbeat-chord motion", "Polka 2/4"],
    ["march", "Fegyelmezett induló", "disciplined duple military march pulse with crisp snare articulation", "Disciplined march"],
    ["hora", "Hóra tánclüktetés", "buoyant communal Israeli circle-dance pulse with clear forward motion", "Hora dance pulse"],
    ["tarantella", "Tarantella 6/8", "rapid lilting 6/8 tarantella pulse with agile tamburello accents", "Tarantella 6/8"],
    ["kolo", "Szerb kolo 2/4", "fast buoyant Serbian kolo pulse in clear duple meter with agile Balkan accents", "Serbian kolo 2/4"]
  ];
  const TONALITIES = [
    ["minor", "Moll · sötétebb", "minor-key harmonic language", "Minor · darker"],
    ["major", "Dúr · világosabb", "major-key harmonic language", "Major · brighter"],
    ["modal", "Modális · időtlen", "modal harmony with an ancient timeless quality", "Modal · timeless"],
    ["ambiguous", "Lebegő · kétértelmű", "tonally ambiguous harmony that avoids obvious resolution", "Floating · ambiguous"],
    ["chromatic", "Kromatikus · feszült", "chromatic harmony with controlled dissonance", "Chromatic · tense"],
    ["evolving", "Változó hangnem", "harmonic language that transforms with the emotional arc", "Evolving tonality"]
  ];
  const DURATIONS = [["short", "1–2 perc", "a concise 1–2 minute form", "1–2 minutes"], ["medium", "3–4 perc", "a developed 3–4 minute form", "3–4 minutes"], ["long", "5–7 perc", "an expansive 5–7 minute form", "5–7 minutes"], ["extended", "8+ perc", "an extended multi-stage form longer than 8 minutes", "8+ minutes"]];
  const SOLO_OPTIONS = [
    ["auto", "Automatikus", "", "Automatic"],
    ["none", "Nincs kiemelt szóló", "", "No featured solo"],
    ["guitar", "Elektromosgitár-szóló", "Expressive electric guitar solo"],
    ["flamenco_guitar", "Flamencogitár-szóló", "Virtuosic flamenco guitar solo with picado, arpeggio and rasgueado contrast"],
    ["bandoneon", "Bandoneonszóló", "Expressive bandoneon solo with dramatic bellows phrasing"],
    ["accordion", "Harmonikaszóló", "Lyrical French accordion solo"],
    ["bouzouki", "Buzukiszóló", "Virtuosic Greek bouzouki solo with rapid articulated picking"],
    ["oud", "Údszóló", "Expressive Arabic oud taqsim with detailed maqam ornamentation"],
    ["qanun", "Kánunszóló", "Virtuosic Arabic qanun solo with precise ornamented runs"],
    ["ney", "Neyszóló", "Breathy expressive Arabic ney solo"],
    ["balalaika", "Balalajkaszóló", "Virtuosic Russian balalaika solo with rapid tremolo and articulated strumming"],
    ["bayan", "Bajánszóló", "Expressive Russian bayan button-accordion solo"],
    ["clarinet", "Klarinétszóló", "Lively ornamented clarinet solo"],
    ["trumpet", "Trombitaszóló", "Clear ceremonial trumpet solo"],
    ["mandolin", "Mandolinszóló", "Virtuosic acoustic mandolin solo with rapid tremolo and articulated plectrum runs"],
    ["organetto", "Organettoszóló", "Lively Italian organetto solo with breathing dance phrases"],
    ["chalil", "Chalil- és fuvolaszóló", "Bright pastoral chalil recorder and wooden-flute solo"],
    ["frula", "Frulaszóló", "Virtuosic Serbian frula solo with agile ornamented folk phrasing"],
    ["drums", "Dobszóló", "Dynamic drum solo"],
    ["piano", "Zongoraszóló", "Expressive piano solo"],
    ["cello", "Csellószóló", "Emotional solo cello passage"],
    ["violin", "Hegedűszóló", "Virtuosic expressive violin solo"],
    ["hammond", "Hammond-orgona-szóló", "Expressive Hammond organ solo"],
    ["synth", "Szintetizátorszóló", "Evolving analog synthesizer solo"],
    ["woodwind", "Fafúvós szóló", "Expressive solo woodwind passage"]
  ];
  const AUDIENCE_OPTIONS = [
    ["auto", "Automatikus", "", "Automatic"],
    ["none", "Nincs közönség", "", "No audience"],
    ["hall", "Koncertterem", "", "Concert hall"],
    ["club", "Rockklub", "", "Rock club"],
    ["arena", "Nagyszínpad / aréna", "", "Main stage / arena"]
  ];
  const ENSEMBLES = [
    { key: "auto", label: "Automatikus", help: "A műtípus és a műfaj alapján választ felállást.", prompt: "" },
    { key: "custom", label: "Egyéni összeállítás", help: "A kézzel kiválasztott hangszerek maradnak aktívak.", prompt: "custom instrumental ensemble" },
    { key: "rock_band", label: "Rockzenekar", help: "Gitár, basszus, dob és billentyű; gyors rockhoz vagy balladához eltérő szerepekkel.", prompt: "live rock band with electric guitar, bass guitar, acoustic drum kit and keyboards", instruments: ["guitars", "bass_guitar", "rockdrums", "keyboards"] },
    { key: "metal_band", label: "Metalzenekar", help: "Elektromos gitár, basszus és precíz duplázó lábdob.", prompt: "metal power trio with electric guitars, bass guitar and twin-bass-drum acoustic kit", instruments: ["guitars", "bass_guitar", "doublekick_drums"] },
    { key: "industrial_metal_band", label: "Industrial metal zenekar", help: "Gépiesen feszes gitár és basszus, duplázó lábdob, elektronikus dobtriggerek, szintetizátor és ipari hangdizájn.", prompt: "industrial metal ensemble with down-tuned electric guitars, electric bass, twin-bass-drum acoustic kit, synchronized electronic drum triggers, cold synthesizers and mechanical sound design", instruments: ["guitars", "bass_guitar", "doublekick_drums", "electronic", "synths", "sounddesign"] },
    { key: "violin_metal_band", label: "Virtuóz hegedű-metal zenekar", help: "Vezető hegedű, szóló cselló, zongora, elektromos gitár, basszusgitár és precíz duplázó lábdobos dob; neoklasszikus hangszeres párbeszéddel.", prompt: "virtuoso violin-metal ensemble with lead amplified solo violin, expressive solo cello, concert piano, electric guitar, electric bass and precise twin-bass-drum acoustic kit", instruments: ["solo_violin", "solo_cello", "piano", "guitars", "bass_guitar", "doublekick_drums"] },
    { key: "techno_rig", label: "Techno setup", help: "Dobgép és szintetizátor; kevés, folyamatosan változó réteg.", prompt: "hardware techno setup built from drum machine and analog synthesizer", instruments: ["electronic", "synths"] },
    { key: "string_quartet", label: "Vonósnégyes", help: "Két hegedű, egy brácsa és egy cselló, négy önálló szólammal.", prompt: "acoustic string quartet: two violins, one viola and one cello", instruments: ["solo_violin", "viola", "solo_cello"] },
    { key: "chamber_orchestra", label: "Kamarazenekar", help: "Kisebb vonóskar és válogatott fafúvósok; az ütősszekció opcionális.", prompt: "small chamber orchestra with compact strings, selected woodwinds and optional restrained percussion", instruments: ["strings", "woodwinds"] },
    { key: "symphony_orchestra", label: "Szimfonikus nagyzenekar", help: "Teljes vonós-, fafúvós-, rézfúvós- és ütősszekció, opcionális hárfával.", prompt: "full symphony orchestra with strings, woodwinds, brass and percussion, optional orchestral harp", instruments: ["strings", "woodwinds", "brass", "percussion", "harp"] },
    { key: "gypsy_orchestra", label: "Hagyományos cigányzenekar", help: "Prímás, brácsa, cselló, bőgő, klarinét és cimbalom.", prompt: "traditional Hungarian Gypsy orchestra led by a primas violin with viola, cello, double bass, clarinet and Hungarian cimbalom (hammered dulcimer)", instruments: ["solo_violin", "viola", "solo_cello", "double_bass", "clarinet", "cimbalom"] },
    { key: "hundred_gypsy_orchestra", label: "Száztagú cigányzenekar", help: "Nagy létszámú Gypsy orchestra: tömeges hegedűkar, brácsák, csellók, nagybőgők, klarinétok és cimbalomszekció, vezető prímással.", prompt: "large-scale 100-member Hungarian Gypsy orchestra with massed violins, violas, cellos and double basses, featured primas violin, clarinet section and Hungarian cimbalom (hammered dulcimer) section", instruments: ["strings", "solo_violin", "viola", "solo_cello", "double_bass", "clarinet", "cimbalom"] }
    ,{ key: "flamenco_ensemble", label: "Flamenco együttes", help: "Flamencogitár, palmas és cajón; a gitár vezeti a compást és a hangszeres dramaturgiát.", prompt: "instrumental flamenco ensemble led by nylon-string flamenco guitar with authentic palmas and restrained cajón", instruments: ["flamenco_guitar", "palmas_cajon"] }
    ,{ key: "tango_orchestra", label: "Argentin tangózenekar", help: "Orquesta típica: bandoneon, hegedű, zongora és nagybőgő, opcionális brácsa és cselló.", prompt: "Argentine tango orquesta típica with bandoneon, violin, concert piano and double bass, supported by viola and cello", instruments: ["bandoneon", "solo_violin", "piano", "double_bass", "viola", "solo_cello"] }
    ,{ key: "chanson_ensemble", label: "Francia sanzonegyüttes", help: "Harmonika, zongora, hegedű, nagybőgő és finom seprűs dob, kizárólag instrumentálisan.", prompt: "intimate instrumental French chanson ensemble with musette accordion, piano, violin, double bass and subtle brushed drums", instruments: ["accordion", "piano", "solo_violin", "double_bass", "brushed_drums"] }
    ,{ key: "piano_concerto_orchestra", label: "Zongoraverseny: szólista és zenekar", help: "Koncertzongora áll szemben a teljes szimfonikus zenekarral, zenekari expozícióval és kadenciával.", prompt: "solo concert grand piano in dramatic dialogue with full symphony orchestra: strings, woodwinds, brass and orchestral percussion", instruments: ["piano", "strings", "woodwinds", "brass", "percussion"] }
    ,{ key: "sirtaki_ensemble", label: "Görög szirtaki együttes", help: "Buzuki, görög baglamas, akusztikus gitár, nagybőgő és visszafogott kézi ütősök; lassúból gyorsuló táncíven.", prompt: "instrumental Greek sirtaki ensemble with lead bouzouki, Greek baglamas, acoustic guitar, double bass and restrained hand percussion", instruments: ["bouzouki", "baglamas", "acoustic_guitar", "double_bass", "worldperc"] }
    ,{ key: "arabic_takht", label: "Arab takht együttes", help: "Úd, kánun, ney, arab hegedű, darbuka és riq; maqam-alapú dallamokkal és iqa ritmusciklusokkal.", prompt: "traditional instrumental Arabic takht ensemble with oud, qanun, ney, Arabic violin, riq and darbuka", instruments: ["oud", "qanun", "ney", "arabic_violin", "arabic_percussion"] }
    ,{ key: "polka_ensemble", label: "Polkazenekar", help: "Harmonika, klarinét, rézfúvósok, nagybőgő és könnyű akusztikus dob; lendületes 2/4-es tánclüktetéssel.", prompt: "lively Central European polka ensemble with accordion, clarinet, bright brass, double bass and light acoustic drums", instruments: ["accordion", "clarinet", "brass", "double_bass", "polka_percussion"] }
    ,{ key: "military_band", label: "Katonazenekar", help: "Piccolo, fuvolák, klarinétok, szaxofonok, trombiták, kürtök, harsonák, eufónium, tuba, menetdob és nagydob.", prompt: "full ceremonial military wind band with piccolo, flutes, clarinets, saxophones, trumpets, horns, trombones, euphoniums, tuba, snare drum, bass drum and restrained cymbals", instruments: ["military_woodwinds", "military_brass", "marching_percussion"] }
    ,{ key: "russian_folk_orchestra", label: "Orosz népi zenekar", help: "Balalajka- és domraszólamok, basszus-balalajka, baján és népi ütősök; ének nélkül.", prompt: "instrumental Russian folk orchestra with balalaika and domra sections, bass and contrabass balalaikas, Russian bayan button accordion and restrained folk percussion", instruments: ["balalaika", "domra", "folk_bass", "bayan", "worldperc"] }
    ,{ key: "israeli_folk_ensemble", label: "Izraeli népzenei együttes", help: "Harmonika, chalil/fuvola, mandolin, akusztikus gitár, darbuka és tamburin; közösségi hóra-karakterrel.", prompt: "instrumental Israeli folk-dance ensemble with accordion, chalil recorder and flute, mandolin, acoustic guitar, darbuka, hand drum and tambourine", instruments: ["israeli_accordion", "chalil", "mandolin", "acoustic_guitar", "israeli_percussion"] }
    ,{ key: "italian_folk_ensemble", label: "Olasz tarantellaegyüttes", help: "Mandolin, organetto, klasszikus gitár, hegedű és tamburello; dél-olasz tánczenei karakterrel.", prompt: "instrumental southern Italian tarantella ensemble with mandolin, organetto, nylon-string guitar, violin and tamburello", instruments: ["mandolin", "organetto", "classical_guitar", "solo_violin", "tamburello"] }
    ,{ key: "serbian_kolo_ensemble", label: "Szerb koloegyüttes", help: "Harmonika, frula, hegedű, tamburica, nagybőgő és goč/tapan; gyors, közösségi körtánc-karakterrel.", prompt: "instrumental Serbian kolo ensemble with accordion, frula wooden flute, violin, tamburica section, upright bass and goč or tapan-style double-headed drum", instruments: ["serbian_accordion", "frula", "solo_violin", "tamburica", "double_bass", "tapan"] }
  ];

  const CONTROL_HELP = {
    rhythm: {
      steady: "Egyenletesen viszi előre a zenét, könnyen követhető.",
      driving: "Erős előremozgás és fokozódó lendület.",
      syncopated: "Játékos, váratlan hangsúlyokkal mozog.",
      polyrhythmic: "Több ritmus rétegződik egymásra; összetettebb hatás.",
      free: "Lebegő, szabad mozgás, határozott dobütés nélkül.",
      ritual: "Ismétlődő, szertartásos lüktetés.",
      accelerating: "Lassú tánclépésből fokozatosan gyors, sodró mozgássá válik.",
      iqa: "Jellegzetes arab ritmusciklus, darbuka- és riq-hangsúlyokkal."
      ,polka: "Könnyed, pattogó 2/4: basszushang az erős, akkord a gyenge ütésen."
      ,march: "Feszes páros lüktetés, pontos menetdobbal és határozott lépésérzettel."
      ,hora: "Közösségi körtáncérzet: könnyen követhető, lendületes és fokozható."
      ,tarantella: "Gyors, ringó 6/8-os dél-olasz tánclüktetés, élénk tamburellóval."
      ,kolo: "Gyors, páros szerb körtánclüktetés, mozgékony balkáni hangsúlyokkal."
    },
    tonality: {
      minor: "Komorabb, drámaibb vagy melankolikusabb színezet.",
      major: "Világosabb, nyitottabb és bizakodóbb színezet.",
      modal: "Ősi, időtlen vagy népzenei érzet.",
      ambiguous: "Lebegő, titokzatos; nem egyértelműen vidám vagy szomorú.",
      chromatic: "Feszült, nyugtalan és kiszámíthatatlanabb hangzás.",
      evolving: "A hangulat a történettel együtt fokozatosan átalakul."
    },
    duration: {
      short: "Rövid, lényegre törő zenei ív.",
      medium: "Teljesen kibontott, átlagos hosszúságú darab.",
      long: "Több idő jut a témák és a hangszerek fejlődésére.",
      extended: "Hosszú, több szakaszból álló kompozíció."
    },
    solo: {
      auto: "A generátor a műfajhoz és a kiválasztott hangszerekhez illőt választ.",
      none: "Nem emel ki külön hangszert; az együttes marad a középpontban.",
      guitar: "A csúcspont közelében elektromosgitár-szóló lép elő.",
      drums: "A csúcspont közelében a dob kap önálló szólórészt.",
      piano: "A csúcspont közelében zongoraszóló lép elő.",
      cello: "A csúcspont közelében érzelmes csellószóló lép elő.",
      violin: "A csúcspont közelében virtuóz hegedűszóló lép elő.",
      hammond: "A csúcspont közelében Hammond-orgona-szóló lép elő.",
      synth: "A csúcspont közelében szintetizátorszóló lép elő.",
      woodwind: "A csúcspont közelében fafúvós szóló lép elő."
      ,bouzouki: "A szirtaki csúcspontját virtuóz buzukiszóló vezeti."
      ,oud: "Az arab darabot szabad, maqam-alapú úd-takszim nyitja vagy emeli ki."
      ,qanun: "A kánun gyors, díszített futamokkal kerül előtérbe."
      ,ney: "A ney levegős, hajlékony szólama kerül előtérbe."
      ,balalaika: "A csúcspont közelében virtuóz balalajkaszóló lép elő."
      ,bayan: "A baján széles, karakteres harmonikaszólammal kerül előtérbe."
      ,clarinet: "A polka dallamát díszített klarinétszóló emeli ki."
      ,trumpet: "A katonazene ünnepélyes csúcspontját trombitaszóló jelöli."
      ,mandolin: "A mandolin gyors tremolóval és pengetett futamokkal lép előtérbe."
      ,organetto: "Az olasz organetto rövid, lélegző táncfrázisokkal szólózik."
      ,chalil: "A chalil vagy fuvola világos, pásztori dallammal kerül előtérbe."
      ,frula: "A frula gyors, díszített szerb népzenei szólammal kerül előtérbe."
    },
    audience: {
      none: "Tiszta előadás közönséghangok nélkül.",
      hall: "Visszafogott teremzaj a kezdés előtt, természetes taps a végén.",
      club: "Közeli morajlás, ritmusra taps, spontán ováció és alkalmi rövid „óóó” reakció.",
      arena: "Nagy tömeg, taps, hangos ováció, alkalmi rövid „óóó” reakció és a főtéma közös visszaéneklése."
    }
  };

  const BASE_STRUCTURES = {
    film: ["Atmoszférikus nyitás", "Főmotívum", "Konfliktus", "Átalakulás", "Csúcspont", "Lezárás"],
    trailer: ["Texturális nyitás", "Pulzus", "Első emelkedés", "Törés", "Végső crescendo", "Záróütés"],
    game: ["Világépítő intro", "Felfedező loop", "Veszélyréteg", "Akcióvariáció", "Feloldás", "Loop-pont"],
    rock: ["Gitártéma", "Fő riff", "Variáció", "Dinamikai visszaesés", "Szóló", "Kibővített finálé"],
    electronic: ["DJ intro", "Groove", "Build-up", "Breakdown", "Fő drop", "Evolúciós outro"],
    classical: ["Expozíció", "Fejlesztés", "Kontrasztos középrész", "Tetőpont", "Repríz", "Kóda"],
    piano_concerto: ["Zenekari expozíció", "A zongoraszólista belépése", "Szólista-zenekar párbeszéd", "Lírai lassú tétel", "Virtuóz kadencia", "Finálé és zenekari tutti"],
    symphonic: ["Programnyitány", "Első téma", "Ellentéma", "Tematikus küzdelem", "Transzformáció", "Apoteózis"],
    oratorio: ["Ünnepélyes nyitány", "Recitativo-szerű zenekari rész", "Lírai meditáció", "Fúgaszerű építkezés", "Monumentális tetőpont", "Instrumentális áldás"],
    ambient: ["Alaptér", "Első textúra", "Finom motívum", "Sűrűsödés", "Tágulás", "Elhalás"],
    experimental: ["Hangforrás", "Töredezés", "Új szabály", "Kontraszt", "Telítődés", "Nyitott befejezés"],
    world: ["Jellegzetes nyitás", "Alapritmus és főtéma", "Hangszeres párbeszéd", "Tempó- vagy karakterváltás", "Virtuóz csúcspont", "Hagyományos zárás"]
  };

  const STAGE_PROMPTS = {
    "Atmoszférikus nyitás": "atmospheric opening",
    "Főmotívum": "main motif statement",
    "Konfliktus": "escalating conflict",
    "Átalakulás": "thematic transformation",
    "Csúcspont": "emotional climax",
    "Lezárás": "closing resolution",
    "Texturális nyitás": "textural opening",
    "Pulzus": "rhythmic pulse entry",
    "Első emelkedés": "first rise",
    "Törés": "dramatic break",
    "Végső crescendo": "final crescendo",
    "Záróütés": "decisive final hit",
    "Világépítő intro": "world-building introduction",
    "Felfedező loop": "exploration loop",
    "Veszélyréteg": "danger layer",
    "Akcióvariáció": "action variation",
    "Feloldás": "controlled release",
    "Loop-pont": "seamless loop point",
    "Gitártéma": "guitar theme",
    "Fő riff": "main riff",
    "Variáció": "thematic variation",
    "Dinamikai visszaesés": "dynamic pullback",
    "Szóló": "instrumental solo",
    "Kibővített finálé": "expanded finale",
    "DJ intro": "DJ-friendly intro",
    "Groove": "full groove entry",
    "Build-up": "layered build-up",
    "Breakdown": "atmospheric breakdown",
    "Fő drop": "main drop",
    "Evolúciós outro": "evolving DJ-friendly outro",
    "Expozíció": "thematic exposition",
    "Fejlesztés": "thematic development",
    "Kontrasztos középrész": "contrasting middle section",
    "Tetőpont": "structural climax",
    "Repríz": "transformed recapitulation",
    "Kóda": "coda",
    "Zenekari expozíció": "orchestral exposition before the soloist enters",
    "A zongoraszólista belépése": "solo piano entrance and first thematic statement",
    "Szólista-zenekar párbeszéd": "development through dialogue between solo piano and orchestra",
    "Lírai lassú tétel": "lyrical slow movement with transparent orchestral accompaniment",
    "Virtuóz kadencia": "extended virtuoso solo piano cadenza",
    "Finálé és zenekari tutti": "brilliant final movement and decisive orchestral tutti",
    "Programnyitány": "programmatic opening",
    "Első téma": "first theme",
    "Ellentéma": "contrasting second theme",
    "Tematikus küzdelem": "thematic confrontation",
    "Transzformáció": "thematic transformation",
    "Apoteózis": "orchestral apotheosis",
    "Ünnepélyes nyitány": "solemn orchestral opening",
    "Recitativo-szerű zenekari rész": "recitative-like orchestral passage without voices",
    "Lírai meditáció": "lyrical instrumental meditation",
    "Fúgaszerű építkezés": "fugue-like instrumental development",
    "Monumentális tetőpont": "monumental orchestral climax",
    "Instrumentális áldás": "serene instrumental benediction",
    "Alaptér": "foundational atmosphere",
    "Első textúra": "first evolving texture",
    "Finom motívum": "subtle motif emergence",
    "Sűrűsödés": "gradual textural accumulation",
    "Tágulás": "spatial expansion",
    "Elhalás": "slow dissolution",
    "Hangforrás": "primary sound source",
    "Töredezés": "fragmentation",
    "Új szabály": "emergence of a new musical rule",
    "Kontraszt": "strong formal contrast",
    "Telítődés": "textural saturation",
    "Nyitott befejezés": "open ending",
    "Jellegzetes nyitás": "style-defining instrumental opening",
    "Alapritmus és főtéma": "authentic rhythmic foundation and main theme",
    "Hangszeres párbeszéd": "dialogue between the characteristic lead instruments",
    "Tempó- vagy karakterváltás": "traditional change of tempo or musical character",
    "Virtuóz csúcspont": "virtuosic instrumental climax",
    "Hagyományos zárás": "stylistically authentic closing cadence",
    "Szabad flamencogitár-nyitás": "free flamenco guitar falseta introduction",
    "Compás és palmas belépése": "authentic compás established by guitar and palmas",
    "Gitár és cajón párbeszéde": "rhythmic dialogue between flamenco guitar and restrained cajón",
    "Silencio és újrafeszítés": "brief dramatic silencio followed by renewed rhythmic tension",
    "Virtuóz flamencogitár-csúcspont": "virtuosic flamenco guitar climax with precise picado and rasgueado",
    "Flamenco remate": "decisive flamenco remate ending in tight rhythmic unison",
    "Szabad prímásnyitány": "free-rubato primas violin introduction",
    "Lassú csárdás": "slow expressive lassú section",
    "Díszített átvezetés": "ornamented transition led by violin and cimbalom",
    "A friss kezdete": "clear transition into the fast friss section",
    "Gyorsuló friss": "accelerating virtuoso friss with full ensemble",
    "Virtuóz csárdászárás": "brilliant csárdás ending led by the primas",
    "Bandoneon-nyitás": "expressive solo bandoneon introduction",
    "Marcato tangótéma": "firm marcato tango main theme",
    "Bandoneon-hegedű párbeszéd": "dramatic dialogue between bandoneon and violin",
    "Lírai tangó-középrész": "lyrical tango middle section with piano and strings",
    "Arrastre és variáció": "intensifying variation with bandoneon arrastre gestures",
    "Határozott tangózárás": "decisive authentic tango cadence without percussion",
    "Harmonika-nyitás": "intimate French accordion introduction",
    "Sanzon-főtéma": "lyrical instrumental chanson main theme",
    "Hegedű és zongora válasza": "gentle response from violin and piano",
    "Intim párizsi középrész": "intimate Parisian middle section with sparse accompaniment",
    "Emelkedő repríz": "warmer expanded return of the main melody",
    "Gyengéd sanzonzárás": "soft instrumental chanson cadence led by accordion",
    "Szabad buzuki-nyitás": "free solo bouzouki introduction with spacious phrasing",
    "Lassú hasapiko": "slow measured 4/4 hasapiko section",
    "A táncpulzus felépítése": "Greek baglamas, acoustic guitar and double bass establish the dance pulse",
    "Fokozatos gyorsítás": "clear gradual acceleration and transition from 4/4 hasapiko into 2/4 hasaposerviko",
    "Gyors hasaposerviko": "fast driving 2/4 hasaposerviko with virtuosic bouzouki",
    "Virtuóz szirtakizárás": "tight virtuosic sirtaki finale in full-ensemble unison",
    "Úd-takszim": "free solo oud taqsim exploring the selected maqam without percussion",
    "Maqam-főtéma": "clear maqam-based main theme stated by oud and answered by qanun and ney",
    "Az iqa belépése": "riq and darbuka establish a clear Arabic iqa rhythmic cycle",
    "Takht-párbeszéd": "ornamented dialogue among oud, qanun, ney and Arabic violin",
    "Virtuóz takht-csúcspont": "full Arabic takht ensemble at a virtuosic instrumental climax",
    "Maqam-zárókadencia": "authentic maqam closing cadence led by oud and ney",
    "Polka felütés": "brief upbeat polka introduction led by accordion and clarinet",
    "Pattogó polkatéma": "buoyant 2/4 polka main theme with clear oom-pah accompaniment",
    "Klarinét-harmonika felelgetés": "playful call-and-response between clarinet and accordion",
    "Rézfúvós trió": "bright brass trio variation over a steady polka pulse",
    "Gyors polkavariáció": "faster virtuosic polka variation with full ensemble",
    "Polkazárás": "tight cheerful polka cadence with a decisive final accent",
    "Távoli trombitajel": "distant ceremonial trumpet call before the march begins",
    "Menetritmus": "disciplined duple march established by snare and bass drum",
    "Katonai indulótéma": "broad military march theme stated by brass and answered by woodwinds",
    "Triós középrész": "contrasting lyrical march trio led by clarinets and euphonium",
    "Díszmeneti visszatérés": "grand parade return of the principal march theme",
    "Ünnepélyes záróakkord": "ceremonial full-band cadence with precise final cutoff",
    "Szabad balalajka-nyitás": "free solo balalaika introduction with delicate tremolo",
    "Orosz népi főtéma": "clear Russian folk main theme led by balalaika and domra",
    "A baján belépése": "Russian bayan enters with rich harmonic and melodic support",
    "Balalajka-domra párbeszéd": "virtuosic dialogue between balalaika and domra sections",
    "Gyors népi táncrész": "fast Russian folk-dance variation over bass balalaika and percussion",
    "Széles orosz zárás": "broad Russian folk-orchestra finale led by balalaika and bayan",
    "Szabad chalil-nyitás": "free chalil recorder and flute introduction with open pastoral space",
    "Izraeli hóra-főtéma": "clear Israeli folk-dance theme led by accordion and mandolin",
    "Gitár és ütősök belépése": "acoustic guitar, darbuka and tambourine establish the communal dance pulse",
    "Chalil-harmonika párbeszéd": "playful call-and-response between chalil flute and accordion",
    "Körtánc-csúcspont": "full-ensemble Israeli circle-dance climax with increasing communal momentum",
    "Meleg izraeli zárás": "warm Israeli folk-dance cadence led by accordion, mandolin and flute",
    "Mandolin-előjáték": "free acoustic mandolin prelude with delicate tremolo",
    "Tarantella-főtéma": "lively southern Italian tarantella main theme in lilting 6/8",
    "Organetto és gitár belépése": "organetto and nylon-string guitar establish the dance accompaniment",
    "Mandolin-hegedű párbeszéd": "ornamented dialogue between mandolin and violin",
    "Gyors tamburello-csúcspont": "rapid full-ensemble tarantella climax driven by articulated tamburello",
    "Dél-olasz tánczárás": "decisive southern Italian dance cadence in tight acoustic unison",
    "Szabad frula-nyitás": "free solo Serbian frula introduction with agile ornamentation",
    "Szerb kolo-főtéma": "clear fast Serbian kolo main theme led by accordion and violin",
    "Tamburica és bőgő belépése": "tamburica section and upright bass establish the duple dance pulse",
    "Frula-harmonika párbeszéd": "virtuosic call-and-response between Serbian frula and accordion",
    "Gyors kolo-csúcspont": "full Serbian kolo ensemble at a fast communal circle-dance peak",
    "Virtuóz szerb zárás": "tight virtuosic Serbian kolo cadence led by frula, accordion and violin",
    "Nyomok és ellenmotívum": "clues and counter-motif",
    "A vihar teljes ereje": "the storm at full force",
    "Csendes, töredékes utóhang": "quiet fragmented aftermath",
    "Újjászületett főmotívum": "reborn main motif",
    "Megváltozott hazatérés-téma": "transformed homecoming theme",
    "Feloldatlan tragikus zárás": "unresolved tragic ending",
    "Diadalmas végső állítás": "triumphant final statement",
    "Himnikus apoteózis": "hymn-like instrumental apotheosis with broad noble harmonies, no choir",
    "Epikus finálé": "decisive large-scale instrumental finale with the full recurring motif, no choir",
    "Motívum bemutatása": "main motif introduction",
    "Fokozódó konfliktus": "escalating conflict",
    "Rövid visszaesés": "brief dramatic pullback",
    "Érzelmi csúcspont": "emotional climax",
    "Motívumtranszformáció": "final motif transformation",
    "Tematikus intro": "thematic introduction",
    "Első állítás": "first thematic statement",
    "Metrikai variáció": "metrical variation",
    "Virtuóz fejlesztés": "virtuosic development",
    "Kibővített visszatérés": "expanded thematic return",
    "Semleges belépés": "neutral loop-safe entry",
    "Alapmotívum": "core motif",
    "Rétegezés": "progressive layering",
    "Intenzív variáció": "high-intensity variation",
    "Visszabontás": "layered deconstruction",
    "Varratmentes loop-pont": "seamless loop point"
  };

  const STRUCTURE_MODES = [
    ["adaptive", "Automatikus · téma + hangulat", "", "Automatic · theme + mood"],
    ["compact", "Tömör", "", "Compact"],
    ["cinematic", "Mozis ív", "", "Cinematic arc"],
    ["progressive", "Progresszív", "", "Progressive"],
    ["loop", "Ismételhető", "", "Loopable"]
  ];

  const ENSEMBLE_LABELS_EN = {
    auto: "Automatic", custom: "Custom ensemble", rock_band: "Rock band", metal_band: "Metal band",
    industrial_metal_band: "Industrial metal band", violin_metal_band: "Virtuoso violin-metal band",
    techno_rig: "Techno setup", string_quartet: "String quartet", chamber_orchestra: "Chamber orchestra",
    symphony_orchestra: "Symphony orchestra", gypsy_orchestra: "Traditional Hungarian Gypsy orchestra",
    hundred_gypsy_orchestra: "100-member Hungarian Gypsy orchestra", flamenco_ensemble: "Flamenco ensemble",
    tango_orchestra: "Argentine tango orchestra", chanson_ensemble: "French chanson ensemble",
    piano_concerto_orchestra: "Piano soloist and orchestra", sirtaki_ensemble: "Greek sirtaki ensemble",
    arabic_takht: "Arabic takht ensemble", polka_ensemble: "Polka ensemble", military_band: "Military band",
    russian_folk_orchestra: "Russian folk orchestra", israeli_folk_ensemble: "Israeli folk ensemble",
    italian_folk_ensemble: "Italian folk ensemble", serbian_kolo_ensemble: "Serbian kolo ensemble"
  };
  ENSEMBLES.forEach((item) => { item.labelEn = ENSEMBLE_LABELS_EN[item.key] || item.label; });

  const SOLO_LABELS_EN = {
    auto: "Automatic", none: "No featured solo", guitar: "Electric guitar solo",
    flamenco_guitar: "Flamenco guitar solo", bandoneon: "Bandoneon solo", accordion: "Accordion solo",
    bouzouki: "Bouzouki solo", oud: "Oud solo", qanun: "Qanun solo", ney: "Ney solo",
    balalaika: "Balalaika solo", bayan: "Bayan solo", clarinet: "Clarinet solo", trumpet: "Trumpet solo",
    mandolin: "Mandolin solo", organetto: "Organetto solo", chalil: "Chalil and flute solo",
    frula: "Frula solo", drums: "Drum solo", piano: "Piano solo", cello: "Cello solo",
    violin: "Violin solo", hammond: "Hammond organ solo", synth: "Synthesizer solo", woodwind: "Woodwind solo"
  };

  const DEFAULTS_BY_PROJECT = {
    film: { genre: "cinematic", instruments: ["strings", "brass", "cinematic_percussion", "sounddesign"], tempo: 96, production: "cinematic" },
    trailer: { genre: "hybrid", instruments: ["strings", "brass", "cinematic_percussion", "sounddesign"], tempo: 118, production: "cinematic" },
    game: { genre: "hybrid", instruments: ["strings", "synths", "cinematic_percussion", "sounddesign"], tempo: 104, production: "immersive" },
    rock: { genre: "progressive", instruments: ["acoustic_guitar", "guitars", "rockdrums", "bass_guitar", "keyboards"], tempo: 126, production: "studio" },
    electronic: { genre: "techno", instruments: ["synths", "electronic"], tempo: 128, production: "club" },
    classical: { genre: "romantic", instruments: ["strings", "woodwinds", "piano"], tempo: 82, production: "concert" },
    piano_concerto: { genre: "romantic", instruments: ["piano", "strings", "woodwinds", "brass", "percussion"], tempo: 88, production: "concert" },
    symphonic: { genre: "cinematic", instruments: ["strings", "brass", "woodwinds", "percussion"], tempo: 90, production: "concert" },
    oratorio: { genre: "romantic", instruments: ["strings", "brass", "woodwinds", "percussion"], tempo: 76, production: "concert" },
    ambient: { genre: "darkambient", instruments: ["synths", "sounddesign", "solo_cello"], tempo: 58, production: "immersive" },
    experimental: { genre: "minimal", instruments: ["piano", "synths", "sounddesign"], tempo: 72, production: "minimal" },
    world: { genre: "flamenco", instruments: ["flamenco_guitar", "palmas_cajon"], tempo: 104, production: "raw" }
  };

  const DEFAULTS_BY_GENRE = {
    cinematic: { instruments: ["strings", "brass", "woodwinds", "cinematic_percussion"], tempo: 92, rhythm: "driving", production: "cinematic" },
    hybrid: { instruments: ["strings", "brass", "cinematic_percussion", "synths", "sounddesign"], tempo: 112, rhythm: "driving", production: "cinematic" },
    romantic: { instruments: ["strings", "woodwinds", "piano", "solo_cello"], tempo: 76, rhythm: "free", production: "concert" },
    minimal: { instruments: ["piano", "strings", "synths"], tempo: 68, rhythm: "steady", production: "minimal" },
    progressive: { instruments: ["acoustic_guitar", "guitars", "rockdrums", "bass_guitar", "keyboards"], tempo: 126, rhythm: "polyrhythmic", production: "studio" },
    postrock: { instruments: ["guitars", "rockdrums", "strings", "sounddesign"], tempo: 104, rhythm: "driving", production: "immersive" },
    fastrock: { instruments: ["guitars", "bass_guitar", "rockdrums", "hammond"], tempo: 148, rhythm: "driving", production: "raw" },
    rockballad: { instruments: ["acoustic_guitar", "guitars", "bass_guitar", "rockdrums", "piano"], tempo: 82, rhythm: "steady", production: "studio" },
    hardrock: { instruments: ["acoustic_guitar", "guitars", "bass_guitar", "rockdrums", "hammond"], tempo: 124, rhythm: "driving", production: "raw" },
    metal: { instruments: ["guitars", "bass_guitar", "doublekick_drums"], tempo: 145, rhythm: "driving", production: "studio" },
    speedmetal: { instruments: ["guitars", "bass_guitar", "doublekick_drums"], tempo: 178, rhythm: "driving", production: "studio" },
    symphonicmetal: { instruments: ["guitars", "bass_guitar", "doublekick_drums", "strings", "brass", "percussion"], tempo: 138, rhythm: "driving", production: "cinematic" },
    industrialmetal: { instruments: ["guitars", "bass_guitar", "doublekick_drums", "electronic", "synths", "sounddesign"], tempo: 132, rhythm: "driving", production: "studio" },
    violinmetal: { instruments: ["solo_violin", "solo_cello", "piano", "guitars", "bass_guitar", "doublekick_drums"], tempo: 156, rhythm: "driving", production: "studio" },
    techno: { instruments: ["synths", "electronic"], tempo: 128, rhythm: "steady", production: "club" },
    industrial: { instruments: ["synths", "electronic", "sounddesign", "percussion"], tempo: 132, rhythm: "driving", production: "club" },
    synthwave: { instruments: ["synths", "electronic", "guitars"], tempo: 112, rhythm: "steady", production: "analog" },
    darkambient: { instruments: ["synths", "sounddesign", "solo_cello"], tempo: 56, rhythm: "free", production: "immersive" },
    world: { instruments: ["woodwinds", "worldperc", "strings"], tempo: 100, rhythm: "ritual", production: "raw" },
    flamenco: { instruments: ["flamenco_guitar", "palmas_cajon"], tempo: 108, rhythm: "syncopated", production: "raw" },
    csardas: { instruments: ["solo_violin", "viola", "solo_cello", "double_bass", "clarinet", "cimbalom"], tempo: 132, rhythm: "driving", production: "raw" },
    tango: { instruments: ["bandoneon", "solo_violin", "piano", "double_bass", "viola", "solo_cello"], tempo: 124, rhythm: "syncopated", production: "concert" },
    chanson: { instruments: ["accordion", "piano", "solo_violin", "double_bass", "brushed_drums"], tempo: 88, rhythm: "steady", production: "analog" },
    sirtaki: { instruments: ["bouzouki", "baglamas", "acoustic_guitar", "double_bass", "worldperc"], tempo: 100, rhythm: "accelerating", production: "raw" },
    arabic: { instruments: ["oud", "qanun", "ney", "arabic_violin", "arabic_percussion"], tempo: 92, rhythm: "iqa", production: "concert" },
    polka: { instruments: ["accordion", "clarinet", "brass", "double_bass", "polka_percussion"], tempo: 124, rhythm: "polka", production: "raw" },
    military: { instruments: ["military_woodwinds", "military_brass", "marching_percussion"], tempo: 116, rhythm: "march", production: "concert" },
    russian_folk: { instruments: ["balalaika", "domra", "folk_bass", "bayan", "worldperc"], tempo: 112, rhythm: "driving", production: "raw" },
    israeli_folk: { instruments: ["israeli_accordion", "chalil", "mandolin", "acoustic_guitar", "israeli_percussion"], tempo: 116, rhythm: "hora", production: "raw" },
    italian_folk: { instruments: ["mandolin", "organetto", "classical_guitar", "solo_violin", "tamburello"], tempo: 132, rhythm: "tarantella", production: "raw" },
    serbian_folk: { instruments: ["serbian_accordion", "frula", "solo_violin", "tamburica", "double_bass", "tapan"], tempo: 128, rhythm: "kolo", production: "raw" }
  };

  const defaultState = () => ({ stateVersion: 2, project: "film", genre: "cinematic", genreFilter: true, theme: "journey", mood: "calm_epic", structureMode: "adaptive", ensemble: "auto", instruments: ["strings", "brass", "cinematic_percussion", "sounddesign"], autoControls: true, tempo: 96, rhythm: "driving", tonality: "evolving", duration: "medium", solo: "auto", audience: "none", production: "cinematic", customDirection: "", titleVariant: 0 });
  let state = loadState();
  let toastTimer = 0;

  const $ = (id) => document.getElementById(id);
  const find = (rows, key) => rows.find((item) => item.key === key) || rows[0];
  const tuple = (rows, key) => rows.find((item) => item[0] === key) || rows[0];
  const englishUi = () => window.I18N?.language === "en";
  const conciseEnglish = (value) => {
    const first = String(value || "").split(/[;,]/)[0].replace(/\([^)]*\)/g, "").trim();
    return first ? first.charAt(0).toUpperCase() + first.slice(1) : "";
  };
  const itemUiLabel = (item) => englishUi()
    ? (item.labelEn || conciseEnglish(item.prompt) || window.I18N?.t(item.label) || item.label)
    : item.label;
  const tupleUiLabel = (item) => englishUi()
    ? (item[3] || conciseEnglish(item[2]) || window.I18N?.t(item[1]) || item[1])
    : item[1];

  function loadState() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const defaults = defaultState();
      const needsAudienceMigration = Number(value.stateVersion || 0) < defaults.stateVersion;
      return {
        ...defaults,
        ...value,
        stateVersion: defaults.stateVersion,
        audience: needsAudienceMigration ? "none" : (value.audience || defaults.audience),
        instruments: Array.isArray(value.instruments) ? value.instruments : defaults.instruments
      };
    } catch { return defaultState(); }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    $("saveStatus").textContent = "Automatikusan mentve";
  }

  function clean(parts) {
    return parts.flat(Infinity).map((part) => String(part || "").trim().replace(/[.]+$/g, "")).filter(Boolean).join(", ") + ".";
  }

  function optionButton(item, selected, multi = false) {
    const hint = englishUi() ? (item.hintEn || "") : (item.hint || "");
    return `<button class="suno-option-button${selected ? " selected" : ""}" type="button" data-key="${item.key}" aria-pressed="${selected}"><strong>${itemUiLabel(item)}</strong>${hint ? `<small>${hint}</small>` : ""}</button>`;
  }

  function renderSingleGrid(id, rows, selectedKey, handler) {
    const grid = $(id);
    grid.innerHTML = rows.map((item) => optionButton(item, item.key === selectedKey)).join("");
    grid.onclick = (event) => {
      const button = event.target.closest("[data-key]");
      if (!button) return;
      handler(button.dataset.key);
      render();
    };
  }

  function projectChanged(key) {
    state.project = key;
    state.ensemble = "auto";
    const defaults = DEFAULTS_BY_PROJECT[key];
    state.genre = defaults.genre;
    state.instruments = [...defaults.instruments];
    if (state.autoControls) {
      state.tempo = defaults.tempo;
      state.rhythm = (DEFAULTS_BY_GENRE[defaults.genre] || {}).rhythm || state.rhythm;
    }
    state.production = defaults.production;
    if (state.autoControls) state.solo = "auto";
  }

  function genreChanged(key) {
    state.genre = key;
    state.ensemble = "auto";
    const defaults = DEFAULTS_BY_GENRE[key];
    if (!defaults) return;
    state.instruments = [...defaults.instruments];
    if (state.autoControls) {
      state.tempo = defaults.tempo;
      state.rhythm = defaults.rhythm;
    }
    state.production = defaults.production;
    if (state.autoControls) state.solo = "auto";
  }

  function resolvedEnsembleKey() {
    if (state.ensemble && state.ensemble !== "auto") return state.ensemble;
    if (state.project === "piano_concerto") return "piano_concerto_orchestra";
    if (state.genre === "flamenco") return "flamenco_ensemble";
    if (state.genre === "csardas") return "gypsy_orchestra";
    if (state.genre === "tango") return "tango_orchestra";
    if (state.genre === "chanson") return "chanson_ensemble";
    if (state.genre === "sirtaki") return "sirtaki_ensemble";
    if (state.genre === "arabic") return "arabic_takht";
    if (state.genre === "polka") return "polka_ensemble";
    if (state.genre === "military") return "military_band";
    if (state.genre === "russian_folk") return "russian_folk_orchestra";
    if (state.genre === "israeli_folk") return "israeli_folk_ensemble";
    if (state.genre === "italian_folk") return "italian_folk_ensemble";
    if (state.genre === "serbian_folk") return "serbian_kolo_ensemble";
    if (state.genre === "industrialmetal") return "industrial_metal_band";
    if (state.genre === "violinmetal") return "violin_metal_band";
    if (["metal", "speedmetal", "symphonicmetal"].includes(state.genre)) return "metal_band";
    if (["progressive", "postrock", "fastrock", "rockballad", "hardrock"].includes(state.genre)) return "rock_band";
    if (["techno", "industrial", "synthwave"].includes(state.genre)) return "techno_rig";
    if (state.project === "classical") return "chamber_orchestra";
    if (["symphonic", "oratorio"].includes(state.project)) return "symphony_orchestra";
    if (["cinematic", "hybrid", "romantic"].includes(state.genre) && ["film", "trailer", "game"].includes(state.project)) return "symphony_orchestra";
    return "custom";
  }

  function ensembleChanged(key) {
    state.ensemble = key;
    if (key === "auto") {
      const defaults = DEFAULTS_BY_GENRE[state.genre] || DEFAULTS_BY_PROJECT[state.project];
      if (defaults?.instruments) state.instruments = [...defaults.instruments];
      if (defaults?.production) state.production = defaults.production;
      return;
    }
    if (key === "custom") return;
    const ensemble = find(ENSEMBLES, key);
    if (ensemble.instruments) state.instruments = [...ensemble.instruments];
    const ensembleProduction = {
      rock_band: "raw", metal_band: "studio", industrial_metal_band: "studio", violin_metal_band: "studio", techno_rig: "club", string_quartet: "concert",
      chamber_orchestra: "concert", symphony_orchestra: "cinematic", gypsy_orchestra: "raw", hundred_gypsy_orchestra: "concert",
      flamenco_ensemble: "raw", tango_orchestra: "concert", chanson_ensemble: "analog", piano_concerto_orchestra: "concert",
      sirtaki_ensemble: "raw", arabic_takht: "concert", polka_ensemble: "raw", military_band: "concert", russian_folk_orchestra: "raw",
      israeli_folk_ensemble: "raw", italian_folk_ensemble: "raw", serbian_kolo_ensemble: "raw"
    };
    state.production = ensembleProduction[key] || state.production;
  }

  function applyAutomaticMusicalControls() {
    const genreDefaults = DEFAULTS_BY_GENRE[state.genre] || { tempo: 96, rhythm: "steady" };
    const ensembleKey = resolvedEnsembleKey();
    const ensembleTempo = { rock_band: 120, metal_band: 145, techno_rig: 128, string_quartet: 82, chamber_orchestra: 84, symphony_orchestra: 92, gypsy_orchestra: 108, hundred_gypsy_orchestra: 112, flamenco_ensemble: 108, tango_orchestra: 124, chanson_ensemble: 88, piano_concerto_orchestra: 88, sirtaki_ensemble: 100, arabic_takht: 92, polka_ensemble: 124, military_band: 116, russian_folk_orchestra: 112, israeli_folk_ensemble: 116, italian_folk_ensemble: 132, serbian_kolo_ensemble: 128 };
    const ensembleRhythm = { rock_band: "driving", metal_band: "driving", techno_rig: "steady", string_quartet: "free", chamber_orchestra: "free", symphony_orchestra: "driving", gypsy_orchestra: "driving", hundred_gypsy_orchestra: "driving", flamenco_ensemble: "syncopated", tango_orchestra: "syncopated", chanson_ensemble: "steady", piano_concerto_orchestra: "free", sirtaki_ensemble: "accelerating", arabic_takht: "iqa", polka_ensemble: "polka", military_band: "march", russian_folk_orchestra: "driving", israeli_folk_ensemble: "hora", italian_folk_ensemble: "tarantella", serbian_kolo_ensemble: "kolo" };
    const explicitEnsemble = (state.ensemble && !["auto", "custom"].includes(state.ensemble)) || state.project === "piano_concerto";
    const baseTempo = explicitEnsemble ? ensembleTempo[ensembleKey] : genreDefaults.tempo;
    const baseRhythm = explicitEnsemble ? ensembleRhythm[ensembleKey] : genreDefaults.rhythm;
    const projectDurations = {
      film: "medium", trailer: "short", game: "medium", rock: "medium", electronic: "medium",
      classical: "medium", piano_concerto: "long", symphonic: "long", oratorio: "long", ambient: "long", experimental: "medium", world: "medium"
    };
    const themeTempoShift = { battle: 10, storm: 8, celebration: 8, technology: 4, spiritual: -12, love: -4, loss: -10, space: -8, time: -4 };
    const moodTempoShift = { triumphant: 6, hymnic: 2, epic: 5, tension_release: 4, waves: 3, descending: 2, calm_epic: -4, melancholy_uplift: -5, tragic: -7 };
    const selectedInstruments = new Set(state.instruments);
    let instrumentTempoShift = 0;
    if (selectedInstruments.has("acoustic_guitar") && !["flamenco", "sirtaki", "israeli_folk"].includes(state.genre)) {
      const hasRockBand = selectedInstruments.has("guitars") || selectedInstruments.has("rockdrums") || selectedInstruments.has("doublekick_drums") || selectedInstruments.has("bass_guitar");
      instrumentTempoShift -= hasRockBand ? 8 : 18;
    }
    const hasRhythmSection = ["rockdrums", "doublekick_drums", "electronic", "percussion", "cinematic_percussion", "worldperc", "palmas_cajon", "brushed_drums", "arabic_percussion", "marching_percussion", "polka_percussion", "israeli_percussion", "tamburello", "tapan"].some((key) => selectedInstruments.has(key));
    if (!hasRhythmSection && !["csardas", "tango", "sirtaki", "arabic"].includes(state.genre) && (selectedInstruments.has("solo_cello") || selectedInstruments.has("solo_violin"))) instrumentTempoShift -= 6;
    state.tempo = Math.max(40, Math.min(190, baseTempo + (themeTempoShift[state.theme] || 0) + (moodTempoShift[state.mood] || 0) + instrumentTempoShift));

    state.rhythm = baseRhythm;
    if (["ancient", "spiritual"].includes(state.theme)) state.rhythm = "ritual";
    if (["battle", "storm"].includes(state.theme)) state.rhythm = "driving";
    if (state.theme === "mystery") state.rhythm = "syncopated";
    if (state.theme === "technology") state.rhythm = "polyrhythmic";
    if (state.mood === "hypnotic") state.rhythm = "steady";
    if (state.project === "ambient" && !["ancient", "spiritual"].includes(state.theme)) state.rhythm = "free";
    if (state.genre === "flamenco") state.rhythm = "syncopated";
    if (state.genre === "csardas") state.rhythm = "driving";
    if (state.genre === "tango") state.rhythm = "syncopated";
    if (state.genre === "chanson") state.rhythm = "steady";
    if (state.genre === "sirtaki") state.rhythm = "accelerating";
    if (state.genre === "arabic") state.rhythm = "iqa";
    if (state.genre === "polka") state.rhythm = "polka";
    if (state.genre === "military") state.rhythm = "march";
    if (state.genre === "russian_folk") state.rhythm = "driving";
    if (state.genre === "israeli_folk") state.rhythm = "hora";
    if (state.genre === "italian_folk") state.rhythm = "tarantella";
    if (state.genre === "serbian_folk") state.rhythm = "kolo";
    if (state.project === "piano_concerto") state.rhythm = "free";

    const themeTonality = {
      journey: "evolving", discovery: "modal", homecoming: "evolving", battle: "minor", loss: "minor",
      rebirth: "evolving", nature: "modal", storm: "minor", ancient: "modal", mystery: "ambiguous",
      dystopia: "chromatic", technology: "ambiguous", space: "ambiguous", spiritual: "modal", love: "evolving",
      celebration: "major", time: "evolving"
    };
    state.tonality = themeTonality[state.theme] || "evolving";
    if (["triumphant", "hymnic"].includes(state.mood)) state.tonality = "major";
    if (["tragic", "descending"].includes(state.mood)) state.tonality = "minor";
    if (state.mood === "mystery_threat") state.tonality = "ambiguous";

    state.duration = projectDurations[state.project] || "medium";
    state.solo = "auto";
  }

  function adaptiveStages() {
    let stages = [...(BASE_STRUCTURES[state.project] || BASE_STRUCTURES.film)];
    if (state.structureMode === "compact") stages = [stages[0], stages[1], stages[3], stages[4], stages[5]];
    if (state.structureMode === "cinematic") stages = ["Atmoszférikus nyitás", "Motívum bemutatása", "Fokozódó konfliktus", "Rövid visszaesés", "Érzelmi csúcspont", "Motívumtranszformáció"];
    if (state.structureMode === "progressive") stages = ["Tematikus intro", "Első állítás", "Metrikai variáció", "Kontrasztos középrész", "Virtuóz fejlesztés", "Kibővített visszatérés"];
    if (state.structureMode === "loop") stages = ["Semleges belépés", "Alapmotívum", "Rétegezés", "Intenzív variáció", "Visszabontás", "Varratmentes loop-pont"];
    if (state.structureMode === "adaptive") {
      if (state.genre === "flamenco") stages = ["Szabad flamencogitár-nyitás", "Compás és palmas belépése", "Gitár és cajón párbeszéde", "Silencio és újrafeszítés", "Virtuóz flamencogitár-csúcspont", "Flamenco remate"];
      if (state.genre === "csardas") stages = ["Szabad prímásnyitány", "Lassú csárdás", "Díszített átvezetés", "A friss kezdete", "Gyorsuló friss", "Virtuóz csárdászárás"];
      if (state.genre === "tango") stages = ["Bandoneon-nyitás", "Marcato tangótéma", "Bandoneon-hegedű párbeszéd", "Lírai tangó-középrész", "Arrastre és variáció", "Határozott tangózárás"];
      if (state.genre === "chanson") stages = ["Harmonika-nyitás", "Sanzon-főtéma", "Hegedű és zongora válasza", "Intim párizsi középrész", "Emelkedő repríz", "Gyengéd sanzonzárás"];
      if (state.genre === "sirtaki") stages = ["Szabad buzuki-nyitás", "Lassú hasapiko", "A táncpulzus felépítése", "Fokozatos gyorsítás", "Gyors hasaposerviko", "Virtuóz szirtakizárás"];
      if (state.genre === "arabic") stages = ["Úd-takszim", "Maqam-főtéma", "Az iqa belépése", "Takht-párbeszéd", "Virtuóz takht-csúcspont", "Maqam-zárókadencia"];
      if (state.genre === "polka") stages = ["Polka felütés", "Pattogó polkatéma", "Klarinét-harmonika felelgetés", "Rézfúvós trió", "Gyors polkavariáció", "Polkazárás"];
      if (state.genre === "military") stages = ["Távoli trombitajel", "Menetritmus", "Katonai indulótéma", "Triós középrész", "Díszmeneti visszatérés", "Ünnepélyes záróakkord"];
      if (state.genre === "russian_folk") stages = ["Szabad balalajka-nyitás", "Orosz népi főtéma", "A baján belépése", "Balalajka-domra párbeszéd", "Gyors népi táncrész", "Széles orosz zárás"];
      if (state.genre === "israeli_folk") stages = ["Szabad chalil-nyitás", "Izraeli hóra-főtéma", "Gitár és ütősök belépése", "Chalil-harmonika párbeszéd", "Körtánc-csúcspont", "Meleg izraeli zárás"];
      if (state.genre === "italian_folk") stages = ["Mandolin-előjáték", "Tarantella-főtéma", "Organetto és gitár belépése", "Mandolin-hegedű párbeszéd", "Gyors tamburello-csúcspont", "Dél-olasz tánczárás"];
      if (state.genre === "serbian_folk") stages = ["Szabad frula-nyitás", "Szerb kolo-főtéma", "Tamburica és bőgő belépése", "Frula-harmonika párbeszéd", "Gyors kolo-csúcspont", "Virtuóz szerb zárás"];
      if (state.theme === "mystery") stages[2] = "Nyomok és ellenmotívum";
      if (state.theme === "storm") stages[4] = "A vihar teljes ereje";
      if (state.theme === "loss") stages[5] = "Csendes, töredékes utóhang";
      if (state.theme === "rebirth") stages[5] = "Újjászületett főmotívum";
      if (state.theme === "homecoming") stages[5] = "Megváltozott hazatérés-téma";
      if (state.mood === "tragic") stages[5] = "Feloldatlan tragikus zárás";
      if (state.mood === "triumphant") stages[5] = "Diadalmas végső állítás";
      if (state.mood === "hymnic") stages[5] = "Himnikus apoteózis";
      if (state.mood === "epic") stages[5] = "Epikus finálé";
    }
    return stages;
  }

  function energyForStages(count) {
    const base = find(MOODS, state.mood).energy;
    return Array.from({ length: count }, (_, index) => base[Math.round(index * (base.length - 1) / Math.max(1, count - 1))]);
  }

  function suggestedSongTitle() {
    const titles = TITLE_SUGGESTIONS[state.theme] || TITLE_SUGGESTIONS.journey;
    const moodIndex = MOODS.findIndex((item) => item.key === state.mood);
    const projectIndex = PROJECTS.findIndex((item) => item.key === state.project);
    return titles[Math.abs(moodIndex + projectIndex + Number(state.titleVariant || 0)) % titles.length];
  }

  function suggestedSunoSettings() {
    const base = PROJECT_SETTING_DEFAULTS[state.project] || PROJECT_SETTING_DEFAULTS.film;
    let weirdness = base.weirdness;
    let influence = base.influence;
    if (["hypnotic", "waves"].includes(state.mood)) weirdness += 6;
    if (["mystery_threat", "descending"].includes(state.mood)) weirdness += 4;
    if (["triumphant", "calm_epic", "hymnic", "epic"].includes(state.mood)) influence += 3;
    if (state.genre === "minimal" || state.genre === "darkambient") weirdness += 5;
    if (state.genre === "romantic") influence += 3;
    if (PROJECT_STYLE_FAMILY[state.project] !== GENRE_STYLE_FAMILY[state.genre]) weirdness += 6;
    return { weirdness: Math.max(0, Math.min(100, weirdness)), influence: Math.max(0, Math.min(100, influence)) };
  }

  function renderStructure() {
    $("structureModeGrid").innerHTML = STRUCTURE_MODES.map((item) => `<button class="structure-mode-button${state.structureMode === item[0] ? " selected" : ""}" type="button" data-structure-mode="${item[0]}" aria-pressed="${state.structureMode === item[0]}">${tupleUiLabel(item)}</button>`).join("");
    $("structureModeGrid").onclick = (event) => {
      const button = event.target.closest("[data-structure-mode]");
      if (!button) return;
      state.structureMode = button.dataset.structureMode;
      render();
    };
    const stages = adaptiveStages();
    const energies = energyForStages(stages.length);
    $("structureTimeline").style.setProperty("--stage-count", stages.length);
    $("structureTimeline").innerHTML = stages.map((stage, index) => `<div class="structure-stage" style="--energy:${energies[index] / 100}"><span>${String(index + 1).padStart(2, "0")} · ${energies[index]}%</span><strong>${englishUi() ? conciseEnglish(STAGE_PROMPTS[stage] || stage) : stage}</strong></div>`).join("");
    const project = find(PROJECTS, state.project);
    const theme = find(THEMES, state.theme);
    const mood = find(MOODS, state.mood);
    $("structureExplanation").textContent = englishUi()
      ? `A structure for ${project.prompt}, shaped by ${theme.prompt}. Emotional arc: ${mood.prompt}.`
      : `A(z) „${find(THEMES, state.theme).label}” téma és a(z) „${find(MOODS, state.mood).label.toLowerCase()}” hangulati ív alapján létrehozott ${find(PROJECTS, state.project).label.toLowerCase()}-szerkezet.`;
  }

  function renderInstruments() {
    $("instrumentGrid").innerHTML = INSTRUMENTS.map((item) => optionButton(item, state.instruments.includes(item.key), true)).join("");
    $("instrumentGrid").onclick = (event) => {
      const button = event.target.closest("[data-key]");
      if (!button) return;
      const key = button.dataset.key;
      state.ensemble = "custom";
      state.instruments = state.instruments.includes(key) ? state.instruments.filter((item) => item !== key) : [...state.instruments, key];
      if (!state.instruments.length) state.instruments = [key];
      render();
    };
  }

  function fillSelect(id, rows, value) {
    const select = $(id);
    select.innerHTML = rows.map((item) => `<option value="${item[0]}"${item[0] === value ? " selected" : ""}>${tupleUiLabel(item)}</option>`).join("");
  }

  function tempoDescription(tempo) {
    if (tempo < 60) return ["nagyon lassú", "Tágas, meditatív vagy súlyos mozgás."];
    if (tempo < 85) return ["lassú", "Nyugodt, érzelmes vagy fokozatos építkezés."];
    if (tempo < 115) return ["közepes", "Nyugodt, jól követhető tempó."];
    if (tempo < 145) return ["gyors", "Energikus, határozott előremozgás."];
    return ["nagyon gyors", "Intenzív, sürgető és erőteljes mozgás."];
  }

  function stylePrompt() {
    const genre = find(GENRES, state.genre);
    const instruments = [...new Set(INSTRUMENTS.filter((item) => state.instruments.includes(item.key)).map((item) => item.prompt))];
    const ensembleKey = resolvedEnsembleKey();
    const ensemble = find(ENSEMBLES, ensembleKey);
    const projectFamily = PROJECT_STYLE_FAMILY[state.project];
    const genreFamily = GENRE_STYLE_FAMILY[state.genre];
    const isPhotoTranslation = state.customDirection.startsWith("Translate the completed photograph");
    const fusionDirection = projectFamily !== genreFamily
      ? (isPhotoTranslation
        ? `cinematic adaptation of the authentic ${genreFamily} instrumental language for the photographed scene`
        : `intentional ${genreFamily}-and-${projectFamily} fusion, ${genre.prompt} remains dominant`)
      : "";
    const audienceKey = resolvedAudienceKey();
    const audienceStyle = {
      none: "",
      hall: "natural live concert-hall audience, restrained pre-performance murmur and final applause",
      club: "intimate live club audience, close crowd murmur, rhythmic clapping, spontaneous cheers and occasional brief non-lyrical crowd oh reactions between sections, never a vocal melody",
      arena: "large live arena crowd, rhythmic clapping, loud cheers, occasional brief non-lyrical crowd oh reactions between sections, never a vocal melody, audience singalong on the main hook"
    }[audienceKey];
    const tempoStyle = state.genre === "sirtaki"
      ? `starts near ${Math.max(60, state.tempo - 20)} BPM in slow 4/4 hasapiko and accelerates gradually toward ${Math.min(190, state.tempo + 50)} BPM in fast 2/4 hasaposerviko`
      : `${state.tempo} BPM, ${tuple(RHYTHMS, state.rhythm)[2]}`;
    const parts = [
      genre.prompt,
      fusionDirection,
      ensembleKey === "custom" ? "" : ensemble.prompt,
      MOOD_STYLE_TAGS[state.mood],
      `featuring ${instruments.join(", ")}`,
      tempoStyle,
      PRODUCTION_STYLE_TAGS[state.production],
      audienceStyle
    ];
    const seen = new Set();
    const content = parts.filter(Boolean).filter((part) => {
      const normalized = part.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      if (!normalized || seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    }).join("; ").replace(/[.\s]+$/g, "");
    const performanceLock = audienceKey === "none"
      ? INSTRUMENTAL_LOCK
      : "instrumental performance, no lead singer, no choir, audience ambience only";
    const suffix = `, ${performanceLock}.`;
    if (content.length + suffix.length <= STYLE_PROMPT_MAX_LENGTH) return content + suffix;
    const budget = STYLE_PROMPT_MAX_LENGTH - suffix.length;
    let shortened = content.slice(0, budget);
    const lastSeparator = Math.max(shortened.lastIndexOf(", "), shortened.lastIndexOf(" "));
    if (lastSeparator > budget * 0.72) shortened = shortened.slice(0, lastSeparator);
    return shortened.replace(/[,;:\s]+$/g, "") + suffix;
  }

  function resolvedSoloKey() {
    if (state.solo && state.solo !== "auto") return state.solo;
    const selected = new Set(state.instruments);
    if (state.project === "piano_concerto" && selected.has("piano")) return "piano";
    if (state.genre === "flamenco" && selected.has("flamenco_guitar")) return "flamenco_guitar";
    if (state.genre === "tango" && selected.has("bandoneon")) return "bandoneon";
    if (state.genre === "chanson" && selected.has("accordion")) return "accordion";
    if (state.genre === "sirtaki" && selected.has("bouzouki")) return "bouzouki";
    if (state.genre === "arabic" && selected.has("oud")) return "oud";
    if (state.genre === "polka" && selected.has("clarinet")) return "clarinet";
    if (state.genre === "military" && selected.has("military_brass")) return "trumpet";
    if (state.genre === "russian_folk" && selected.has("balalaika")) return "balalaika";
    if (state.genre === "israeli_folk" && selected.has("chalil")) return "chalil";
    if (state.genre === "italian_folk" && selected.has("mandolin")) return "mandolin";
    if (state.genre === "serbian_folk" && selected.has("frula")) return "frula";
    if (state.genre === "violinmetal" && selected.has("solo_violin")) return "violin";
    if (state.project === "rock" && selected.has("guitars")) return "guitar";
    if (state.project === "trailer" && (selected.has("percussion") || selected.has("cinematic_percussion") || selected.has("rockdrums") || selected.has("doublekick_drums"))) return "drums";
    if (state.project === "electronic" && selected.has("synths")) return "synth";
    if (selected.has("solo_violin")) return "violin";
    if (selected.has("solo_cello")) return "cello";
    if (state.project === "classical" && selected.has("piano")) return "piano";
    if (selected.has("woodwinds")) return "woodwind";
    if (selected.has("guitars")) return "guitar";
    if (selected.has("piano")) return "piano";
    if (selected.has("synths")) return "synth";
    if (selected.has("hammond")) return "hammond";
    return "none";
  }

  function resolvedAudienceKey() {
    if (state.audience && state.audience !== "auto") return state.audience;
    if (state.project === "rock") {
      return ["hardrock", "metal", "speedmetal", "symphonicmetal", "industrialmetal", "violinmetal"].includes(state.genre) ? "arena" : "club";
    }
    if (["classical", "symphonic", "oratorio"].includes(state.project) && state.production === "concert") return "hall";
    if (state.project === "electronic" && state.production === "club") return "club";
    return "none";
  }

  function audienceArrangementPlan(stageIndex, stageCount) {
    const audienceKey = resolvedAudienceKey();
    if (audienceKey === "none") return [];
    const lines = [];
    if (stageIndex === 0) {
      lines.push(audienceKey === "hall" ? "Low concert-hall audience murmur before the first note" : "Live crowd murmur and anticipation before the first note");
    }
    if (stageIndex === 2 && audienceKey !== "hall") lines.push("Audience begins clapping in time with the established pulse");
    if (stageIndex === stageCount - 2 && audienceKey !== "hall") {
      lines.push("Audience Reaction: spontaneous cheers and occasional brief crowd oh shouts between instrumental phrases, non-lyrical and not melodic");
      if (["progressive", "hardrock", "metal", "speedmetal", "symphonicmetal", "industrialmetal", "violinmetal"].includes(state.genre)) {
        lines.push("Audience Singalong: crowd sings the main instrumental hook without a lead singer");
      }
    }
    if (stageIndex === stageCount - 1) {
      lines.push(audienceKey === "hall" ? "Natural concert-hall applause after the final note" : "Sustained applause and cheers after the final note");
    }
    return lines;
  }

  function instrumentalArrangementPlan(stageIndex, stageCount, energy) {
    const selectedItems = INSTRUMENTS.filter((item) => state.instruments.includes(item.key));
    const byKeys = (keys) => selectedItems.filter((item) => keys.includes(item.key));
    const leads = byKeys(["solo_violin", "solo_cello", "piano", "guitars", "acoustic_guitar", "classical_guitar", "flamenco_guitar", "bandoneon", "accordion", "organetto", "israeli_accordion", "serbian_accordion", "mandolin", "chalil", "frula", "tamburica", "bouzouki", "baglamas", "oud", "qanun", "ney", "arabic_violin", "balalaika", "domra", "bayan", "military_woodwinds", "military_brass", "hammond", "keyboards", "woodwinds", "synths", "strings"]);
    const rhythms = byKeys(["percussion", "cinematic_percussion", "rockdrums", "doublekick_drums", "electronic", "worldperc", "palmas_cajon", "brushed_drums", "arabic_percussion", "marching_percussion", "polka_percussion", "israeli_percussion", "tamburello", "tapan"]);
    const supports = selectedItems.filter((item) => !leads.includes(item) && !rhythms.includes(item));
    const lead = leads[0] || selectedItems[0];
    const secondLead = leads[1] || supports[0];
    const rhythm = rhythms[0];
    const lines = [];
    if (stageIndex === 0) {
      if (lead) lines.push(`Begin with ${lead.prompt}`);
      if (selectedItems.length > 1) lines.push("Keep the remaining instruments silent at first");
    }
    if (stageIndex === 1) {
      if (lead) lines.push(`Main motif led by ${lead.prompt}`);
      if (secondLead) lines.push(`Restrained supporting layer enters: ${secondLead.prompt}`);
    }
    if (stageIndex === 2 && rhythm) lines.push(`${rhythm.prompt} enters and establishes the pulse`);
    if (stageIndex === 3) {
      const newLayers = [...supports, ...rhythms.slice(1)].slice(0, 2);
      newLayers.forEach((item) => lines.push(`${item.prompt} enters and expands the arrangement`));
    }
    if (stageIndex === stageCount - 2) {
      lines.push("Full selected instrumental ensemble enters");
      const solo = tuple(SOLO_OPTIONS, resolvedSoloKey());
      if (solo[0] !== "none" && solo[2]) lines.push(`Instrumental Solo: ${solo[2]}`);
    }
    if (stageIndex === stageCount - 1) {
      if (energy >= 80) {
        lines.push("Sustain the full selected instrumental ensemble through the finale");
        if (lead) lines.push(`Final motif led by ${lead.prompt}`);
      } else {
        if (lead) lines.push(`Strip the arrangement back to ${lead.prompt}`);
        if (secondLead) lines.push(`Final response from ${secondLead.prompt}`);
      }
    }
    return lines;
  }

  function ensembleRolePlan(stageIndex, stageCount) {
    const ensembleKey = resolvedEnsembleKey();
    if (ensembleKey === "custom") return [];
    const selected = new Set(state.instruments);
    const isLast = stageIndex === stageCount - 1;
    const isPeak = stageIndex === stageCount - 2;
    const lines = [];

    if (ensembleKey === "rock_band") {
      if (state.genre === "rockballad") {
        if (stageIndex === 0) lines.push(selected.has("acoustic_guitar") ? "Acoustic guitar opens alone with spacious broken chords" : "Piano or clean electric guitar opens alone");
        if (stageIndex === 1) lines.push("Bass guitar enters sparsely on chord roots while clean electric guitar answers the main motif");
        if (stageIndex === 2) lines.push("Acoustic drums enter with a restrained half-time backbeat and soft cymbal work");
        if (stageIndex === 3) lines.push("Electric guitar adds sustained melodic lines while the rhythm section gradually widens");
        if (isPeak) lines.push("Full rock band crescendo with an expressive sustained guitar lead");
        if (isLast) lines.push(selected.has("acoustic_guitar") ? "Return to acoustic guitar and a softened final band cadence" : "Strip back to piano or clean guitar for the final cadence");
      } else {
        if (stageIndex === 0) lines.push("Electric guitar establishes the defining riff with a clear count-in feel");
        if (stageIndex === 1) lines.push("Bass guitar locks tightly to the kick drum and reinforces the guitar riff one octave below");
        if (stageIndex === 2) lines.push(state.genre === "progressive" ? "Drums establish an articulate odd-meter groove with controlled fills" : "Drums establish a strong rock backbeat with open driving hi-hat");
        if (stageIndex === 3 && selected.has("hammond")) lines.push("Hammond organ enters beneath the guitars with sustained harmonic weight");
        if (isPeak) lines.push("Full band at maximum drive with guitar or Hammond trading lead phrases");
        if (isLast) lines.push("Bass, drums and guitars land the final riff in tight unison");
      }
    }

    if (ensembleKey === "metal_band") {
      if (stageIndex === 0) lines.push("Electric guitars introduce the main palm-muted riff without orchestral masking");
      if (stageIndex === 1) lines.push("Bass guitar doubles the riff one octave below and locks to the twin bass drums");
      if (stageIndex === 2) lines.push("Twin bass drums establish precise double-kick propulsion while snare and cymbals mark the form");
      if (stageIndex === 3 && state.genre === "symphonicmetal") lines.push("Strings and brass enter as integrated counterpoint, leaving the metal rhythm section clearly defined");
      if (isPeak) lines.push("Full metal ensemble reaches the peak with a virtuosic electric guitar lead over controlled double-kick drive");
      if (isLast) lines.push("Guitars, bass and twin bass drums finish with a synchronized final figure");
    }

    if (ensembleKey === "industrial_metal_band") {
      if (stageIndex === 0) lines.push("A cold mechanical pulse and processed impact establish the tempo before the full band enters");
      if (stageIndex === 1) lines.push("Down-tuned guitars and electric bass enter in machine-tight unison with deliberate space between riff attacks");
      if (stageIndex === 2) lines.push("Twin bass drums lock precisely to electronic triggers, avoiding loose flam or competing rhythmic layers");
      if (stageIndex === 3) lines.push("Cold synthesizer and metallic sound-design textures expand the riff without obscuring guitar transients");
      if (isPeak) lines.push("Full industrial metal ensemble reaches a controlled mechanical peak with synchronized guitars, bass, double-kick drums and electronic impacts");
      if (isLast) lines.push("Strip back to the core machine pulse, then end with one synchronized distorted band impact");
    }

    if (ensembleKey === "violin_metal_band") {
      if (stageIndex === 0) lines.push("Concert piano opens with a precise neoclassical figure, then amplified solo violin states an original memorable main melody above it");
      if (stageIndex === 1) lines.push("Expressive solo cello enters with a dark lyrical counter-melody beneath the violin while piano develops the harmony and electric bass anchors the progression");
      if (stageIndex === 2) lines.push("Twin bass drums establish precise propulsion beneath agile violin sequences and palm-muted guitar rhythm");
      if (stageIndex === 3) lines.push("Solo cello bridges the sections with a rising cantabile line; solo violin then develops a distinctive melodic variation and lead electric guitar answers with a separate memorable melody while piano connects the ideas");
      if (isPeak) lines.push("Instrumental Violin Solo: original lyrical-to-virtuosic amplified violin solo with expressive bends, rapid neoclassical runs and a clear melodic arc");
      if (isPeak) lines.push("Instrumental Guitar Solo: distinct melodic electric-guitar answer with singing sustain, articulate alternate-picked runs and thematic references to the violin melody");
      if (isPeak) lines.push("Violin and electric guitar converge in a harmonized unison climax above rapid piano figures and controlled double-kick drive");
      if (isLast) lines.push("Piano recalls the opening figure while cello supports a broad final counter-line beneath the transformed high-register violin statement, before guitar, bass and drums land the closing figure");
    }

    if (ensembleKey === "techno_rig") {
      if (stageIndex === 0) lines.push("Drum machine begins with an isolated four-on-the-floor kick and filtered mechanical texture");
      if (stageIndex === 1) lines.push("Analog synthesizer introduces one repeating pattern that functions as both bassline and melodic seed");
      if (stageIndex === 2) lines.push("Closed and open hi-hat layers enter gradually while the kick remains steady");
      if (stageIndex === 3) lines.push("Automate filter, resonance and spatial depth instead of adding unrelated melodies");
      if (isPeak) lines.push("Full drum-machine groove and expanded synthesizer spectrum at the main peak");
      if (isLast) lines.push("Remove layers one by one, leaving the core kick or synth pulse for a clean mixable outro");
    }

    if (ensembleKey === "string_quartet") {
      if (stageIndex === 0) lines.push("First violin states the main motif; second violin, viola and cello remain sparse");
      if (stageIndex === 1) lines.push("Second violin develops rhythmic harmony while viola supplies the inner voice and cello anchors the bass line");
      if (stageIndex === 2) lines.push("Pass fragments of the motif between both violins, viola and cello as equal conversational voices");
      if (stageIndex === 3) lines.push("Cello introduces a countermelody while viola maintains harmonic continuity");
      if (isPeak) lines.push("All four independent string parts converge in full contrapuntal intensity without orchestral doubling");
      if (isLast) lines.push("Return the transformed motif to first violin over a restrained cello cadence");
    }

    if (ensembleKey === "chamber_orchestra") {
      if (stageIndex === 0) lines.push("Small string section presents the motif with transparent chamber-scale dynamics");
      if (stageIndex === 1) lines.push("Lower strings provide pulse and bass support while upper strings develop the theme");
      if (stageIndex === 2) lines.push("Selected woodwinds enter with exposed solo colors and short counter-motifs");
      if (stageIndex === 3) lines.push(selected.has("percussion") ? "Restrained percussion marks transitions without overpowering the acoustic ensemble" : "Lower strings deepen the pulse while woodwinds preserve transparent counterpoint");
      if (isPeak) lines.push("Compact full ensemble reaches a clear peak while preserving individual instrumental detail");
      if (isLast) lines.push("Reduce to strings and one answering woodwind for an intimate chamber ending");
    }

    if (ensembleKey === "symphony_orchestra") {
      if (stageIndex === 0) lines.push("Low strings and a single woodwind color establish depth; brass and percussion remain reserved");
      if (stageIndex === 1) lines.push("Violins carry the main motif while violas, cellos and double basses shape harmony and motion");
      if (stageIndex === 2) lines.push("Woodwinds introduce contrasting color and counter-motifs above the string foundation");
      if (stageIndex === 3) lines.push("French horns and low brass broaden the harmony; percussion articulates structural transitions");
      if (isPeak) lines.push(`Full strings, woodwinds, brass and percussion converge at symphonic scale${selected.has("harp") ? " with harp detail remaining audible" : ""}`);
      if (isLast) lines.push("Resolve through strings and woodwinds, reserving brass for the final structural statement");
    }

    if (ensembleKey === "gypsy_orchestra") {
      if (state.genre === "csardas") {
        if (stageIndex === 0) lines.push("Primas violin opens alone in free rubato with richly ornamented Hungarian phrasing");
        if (stageIndex === 1) lines.push("Viola, cello and double bass establish the slow lassú accompaniment while cimbalom adds restrained harmonic filigree");
        if (stageIndex === 2) lines.push("Clarinet and Hungarian cimbalom (hammered dulcimer) answer the primas without obscuring the violin lead");
        if (stageIndex === 3) lines.push("Make a clearly audible transition from lassú into the fast friss; establish the new driving dance pulse before accelerating");
        if (isPeak) lines.push("Accelerating friss: primas violin leads increasingly virtuosic variations over full cimbalom, viola, cello and double-bass accompaniment");
        if (isLast) lines.push("Finish the csárdás with a brilliant coordinated final flourish led by the primas and punctuated by cimbalom");
      } else {
        if (stageIndex === 0) lines.push("Primas violin opens freely and leads the melody with expressive ornamentation");
        if (stageIndex === 1) lines.push("Viola and cello establish rhythmic harmonic accompaniment while double bass anchors the pulse");
        if (stageIndex === 2) lines.push("Cimbalom enters with rhythmic chordal filigree and short ornamental responses");
        if (stageIndex === 3) lines.push("Clarinet answers the primas with an ornamented countermelody without replacing the violin lead");
        if (isPeak) lines.push("Primas violin and cimbalom exchange virtuosic phrases over accelerating full-ensemble accompaniment");
        if (isLast) lines.push("The primas controls a rubato final cadence answered by cimbalom, viola and double bass");
      }
    }

    if (ensembleKey === "hundred_gypsy_orchestra") {
      if (stageIndex === 0) lines.push("Featured primas violin opens in free rubato while the massed orchestra remains silent");
      if (stageIndex === 1) lines.push("Massed first and second violins take up the melody; violas and cellos build dense rhythmic harmony above the double-bass section");
      if (stageIndex === 2) lines.push("The cimbalom section adds brilliant rhythmic filigree while clarinets answer the primas with ornamented counter-melodies");
      if (stageIndex === 3) lines.push("Pass the main theme between featured primas violin, massed violins, clarinets and cimbaloms in increasingly broad waves");
      if (isPeak) lines.push("The complete 100-member Gypsy orchestra converges in a grand virtuosic tutti led by the primas, with every string section, clarinets and cimbaloms remaining distinct");
      if (isLast) lines.push("The massed ensemble withdraws in layers, leaving a rubato primas cadence answered by cimbalom and low strings");
    }

    if (ensembleKey === "flamenco_ensemble") {
      if (stageIndex === 0) lines.push("Flamenco guitar opens alone with a free falseta; no palmas or cajón yet");
      if (stageIndex === 1) lines.push("Establish authentic compás with dry guitar accents and precisely placed palmas");
      if (stageIndex === 2) lines.push("Restrained cajón enters beneath the guitar without replacing the palmas as the rhythmic reference");
      if (stageIndex === 3) lines.push("Drop to a brief silencio, then rebuild tension through rasgueado and increasingly dense palmas");
      if (isPeak) lines.push("Virtuosic flamenco guitar combines picado, arpeggio and rasgueado over intensified but controlled palmas and cajón");
      if (isLast) lines.push("Guitar, palmas and cajón land a tight decisive remate and stop together");
    }

    if (ensembleKey === "tango_orchestra") {
      if (stageIndex === 0) lines.push("Bandoneon opens alone with breath-like bellows phrasing and a restrained rubato gesture");
      if (stageIndex === 1) lines.push("Piano and double bass establish authentic tango marcato; do not add a drum kit or percussion");
      if (stageIndex === 2) lines.push("Violin takes the main melody while bandoneon answers with clipped rhythmic counter-phrases");
      if (stageIndex === 3) lines.push("Cello and viola deepen the middle register as piano, violin and bandoneon exchange the theme");
      if (isPeak) lines.push("Full orquesta típica reaches the climax through bandoneon arrastre, violin intensity and sharply coordinated rhythmic accents, still without drums");
      if (isLast) lines.push("Bandoneon, violin, piano and double bass close in a compact, decisive tango cadence");
    }

    if (ensembleKey === "chanson_ensemble") {
      if (stageIndex === 0) lines.push("French musette accordion introduces the melody alone with intimate breathing space");
      if (stageIndex === 1) lines.push("Piano and double bass enter softly beneath the accordion theme");
      if (stageIndex === 2) lines.push("Violin answers the accordion with a lyrical countermelody while brushed drums remain understated");
      if (stageIndex === 3) lines.push("Reduce to accordion and sparse piano for an intimate café-like middle section");
      if (isPeak) lines.push("Accordion, violin, piano, double bass and subtle brushed drums broaden the main theme without becoming orchestral or theatrical");
      if (isLast) lines.push("Return the melody to solo accordion and close with a gentle piano response");
    }

    if (ensembleKey === "sirtaki_ensemble") {
      if (stageIndex === 0) lines.push("Bouzouki opens alone with a free, spacious introduction; baglamas, guitar, bass and percussion remain silent");
      if (stageIndex === 1) lines.push("Acoustic guitar and Greek baglamas establish a measured slow 4/4 hasapiko beneath the bouzouki theme");
      if (stageIndex === 2) lines.push("Double bass anchors the dance steps while restrained hand percussion clarifies the pulse");
      if (stageIndex === 3) lines.push("Accelerate gradually and audibly, transitioning from slow 4/4 hasapiko into fast 2/4 hasaposerviko without an abrupt tempo jump");
      if (isPeak) lines.push("Full ensemble drives the fast 2/4 hasaposerviko while bouzouki develops increasingly virtuosic picked variations");
      if (isLast) lines.push("Bouzouki, baglamas, guitar, double bass and hand percussion finish with a tight coordinated sirtaki cadence");
    }

    if (ensembleKey === "arabic_takht") {
      if (stageIndex === 0) lines.push("Oud opens alone in a free taqsim, exploring one coherent maqam; qanun, ney, violin and percussion remain silent");
      if (stageIndex === 1) lines.push("Qanun and ney answer the oud in the same maqam with ornamented call-and-response phrasing");
      if (stageIndex === 2) lines.push("Riq and darbuka establish a clear iqa cycle while preserving space around the melodic phrases");
      if (stageIndex === 3) lines.push("Arabic violin enters with flexible maqam intonation and ornamented counter-lines, trading phrases with oud, qanun and ney");
      if (isPeak) lines.push("Full takht ensemble reaches a virtuosic instrumental peak with oud, qanun, ney and Arabic violin clearly articulated above riq and darbuka");
      if (isLast) lines.push("Percussion withdraws as oud and ney complete an authentic maqam closing cadence answered softly by qanun");
    }

    if (ensembleKey === "polka_ensemble") {
      if (stageIndex === 0) lines.push("Accordion gives a short upbeat introduction and clarinet answers; bass and percussion remain silent until the downbeat");
      if (stageIndex === 1) lines.push("Double bass establishes the bass note on the strong beat while accordion and brass place short offbeat chords in buoyant 2/4");
      if (stageIndex === 2) lines.push("Clarinet carries an ornamented polka melody while accordion answers with compact melodic phrases");
      if (stageIndex === 3) lines.push("Bright brass takes a concise trio variation while the rhythm section stays light and danceable");
      if (isPeak) lines.push("Full polka ensemble accelerates slightly into a virtuosic clarinet-led variation without becoming frantic");
      if (isLast) lines.push("Accordion, clarinet, brass, double bass and light percussion land a cheerful synchronized final accent");
    }

    if (ensembleKey === "military_band") {
      if (stageIndex === 0) lines.push("Solo trumpet gives a clear ceremonial call; the rest of the wind band and percussion remain silent");
      if (stageIndex === 1) lines.push("Snare drum establishes a disciplined march cadence, joined by bass drum on structural beats");
      if (stageIndex === 2) lines.push("Trumpets and upper brass state the march theme while clarinets, flutes and saxophones answer in precise counter-lines");
      if (stageIndex === 3) lines.push("Clarinets and euphonium lead a lyrical trio section above restrained marching percussion and tuba bass");
      if (isPeak) lines.push("Full woodwind, brass and percussion sections return in grand parade formation with clear internal balance and no orchestral strings");
      if (isLast) lines.push("The complete military band closes with a precise ceremonial cadence and an exact final cutoff");
    }

    if (ensembleKey === "russian_folk_orchestra") {
      if (stageIndex === 0) lines.push("Prima balalaika opens alone with delicate tremolo; domras, bayan, bass balalaikas and percussion remain silent");
      if (stageIndex === 1) lines.push("Domra section takes up the folk theme while prima and alto balalaikas provide crisp rhythmic strumming");
      if (stageIndex === 2) lines.push("Russian bayan enters with broad bellows phrasing as bass and contrabass balalaikas anchor the harmony");
      if (stageIndex === 3) lines.push("Balalaika and domra sections exchange increasingly ornamented plectrum phrases above restrained folk percussion");
      if (isPeak) lines.push("Full Russian folk orchestra reaches a fast virtuoso dance peak led by balalaika, answered by domra and reinforced by bayan");
      if (isLast) lines.push("Percussion withdraws as balalaika and bayan broaden the main theme into a resonant folk-orchestra cadence");
    }

    if (ensembleKey === "israeli_folk_ensemble") {
      if (stageIndex === 0) lines.push("Chalil recorder or wooden flute opens alone with a free pastoral phrase; all rhythm instruments remain silent");
      if (stageIndex === 1) lines.push("Accordion states the Israeli folk-dance theme while mandolin answers with short articulated phrases");
      if (stageIndex === 2) lines.push("Acoustic guitar establishes the harmonic pulse as darbuka, hand drum and tambourine begin a restrained communal dance groove");
      if (stageIndex === 3) lines.push("Chalil flute and accordion trade increasingly animated phrases above mandolin and guitar accompaniment");
      if (isPeak) lines.push("Full ensemble reaches an energetic Israeli circle-dance peak with clear melodic unison and increasing communal momentum");
      if (isLast) lines.push("Percussion softens as accordion, mandolin and chalil flute complete a warm coordinated folk-dance cadence");
    }

    if (ensembleKey === "italian_folk_ensemble") {
      if (stageIndex === 0) lines.push("Mandolin opens alone with delicate tremolo and a free southern Italian prelude; organetto, guitar, violin and tamburello remain silent");
      if (stageIndex === 1) lines.push("Organetto and nylon-string guitar establish a lilting 6/8 tarantella pulse beneath the mandolin theme");
      if (stageIndex === 2) lines.push("Tamburello enters with agile frame-drum accents while preserving the acoustic dance groove");
      if (stageIndex === 3) lines.push("Mandolin and violin exchange ornamented melodic phrases as organetto reinforces the dance harmony");
      if (isPeak) lines.push("Full southern Italian ensemble reaches a rapid tarantella peak led by mandolin and violin over articulated tamburello");
      if (isLast) lines.push("Mandolin, organetto, guitar, violin and tamburello land a tight decisive southern Italian dance cadence");
    }

    if (ensembleKey === "serbian_kolo_ensemble") {
      if (stageIndex === 0) lines.push("Serbian frula opens alone with a free ornamented phrase; accordion, violin, tamburicas, bass and drum remain silent");
      if (stageIndex === 1) lines.push("Accordion and violin state the fast kolo theme in clear duple meter while frula adds short answering ornaments");
      if (stageIndex === 2) lines.push("Tamburica section establishes crisp plectrum accompaniment as upright bass and goč drum anchor the dance steps");
      if (stageIndex === 3) lines.push("Frula and accordion trade increasingly virtuosic phrases while violin carries a continuous ornamented counter-line");
      if (isPeak) lines.push("Full Serbian kolo ensemble reaches a fast communal circle-dance peak with frula, accordion and violin clearly separated above tamburicas, bass and goč");
      if (isLast) lines.push("Frula, accordion, violin, tamburicas, bass and goč complete a tight accelerating kolo cadence in coordinated unison");
    }

    if (ensembleKey === "piano_concerto_orchestra") {
      if (stageIndex === 0) lines.push("Orchestra presents the principal theme before the solo piano enters; keep the concert piano completely silent");
      if (stageIndex === 1) lines.push("Solo concert piano enters with a distinct restatement and elaboration of the orchestral theme");
      if (stageIndex === 2) lines.push("Develop genuine dialogue: piano proposes, woodwinds answer, strings transform, brass and percussion articulate structural turns");
      if (stageIndex === 3) lines.push("Slow lyrical movement: transparent strings and selected woodwinds support an expressive cantabile piano line");
      if (isPeak) lines.push("Extended unaccompanied piano cadenza develops the principal motifs with virtuosity; orchestra remains silent until the final cue");
      if (isLast) lines.push("Final movement: piano and full orchestra reunite in brilliant dialogue and converge on a decisive tutti coda");
    }

    if (isPeak && ensembleKey !== "violin_metal_band") {
      const solo = tuple(SOLO_OPTIONS, resolvedSoloKey());
      if (solo[0] !== "none" && solo[2] && !lines.some((line) => line.toLowerCase().includes("lead"))) lines.push(`Instrumental Solo: ${solo[2]}`);
    }
    return lines;
  }

  function blueprintPrompt() {
    const genre = find(GENRES, state.genre);
    const theme = find(THEMES, state.theme);
    const mood = find(MOODS, state.mood);
    const stages = adaptiveStages();
    const energies = energyForStages(stages.length);
    const instruments = INSTRUMENTS.filter((item) => state.instruments.includes(item.key)).map((item) => item.prompt);
    const ensembleKey = resolvedEnsembleKey();
    const ensemble = find(ENSEMBLES, ensembleKey);
    const audienceKey = resolvedAudienceKey();
    const bracket = (text) => `[${String(text || "").replace(/[\[\]\r\n]+/g, " ").replace(/\s+/g, " ").trim()}]`;
    const lines = [
      "Instrumental",
      `Style foundation: ${genre.prompt}`,
      `Ensemble: ${ensemble.prompt || "custom instrumental ensemble"}`,
      `Narrative theme: ${theme.prompt}`,
      `Main motif: ${theme.motif}`,
      `Mood arc: ${mood.prompt}`,
      state.genre === "sirtaki"
        ? `Tempo arc: begin near ${Math.max(60, state.tempo - 20)} BPM in slow 4/4 hasapiko and accelerate gradually toward ${Math.min(190, state.tempo + 50)} BPM in fast 2/4 hasaposerviko`
        : `Tempo: ${state.tempo} BPM`,
      `Rhythm: ${tuple(RHYTHMS, state.rhythm)[2]}`,
      `Harmony: ${tuple(TONALITIES, state.tonality)[2]}`,
      `Instrumentation: ${instruments.join(", ")}`,
      audienceKey === "none" ? "No vocals, no choir, no spoken words" : "No lead singer, no choir, instrumental performance with audience ambience only"
    ];
    if (audienceKey !== "none") lines.push(`Live audience atmosphere: ${CONTROL_HELP.audience[audienceKey]}`);
    stages.forEach((stage, index) => {
      const isFirst = index === 0;
      const isLast = index === stages.length - 1;
      const sectionName = isFirst ? "Instrumental Intro" : isLast ? "Instrumental Outro" : `Instrumental Section ${index + 1}`;
      lines.push(`${sectionName}: ${STAGE_PROMPTS[stage] || stage}`);
      lines.push(`Energy level: ${energies[index]}%`);
      if (isFirst) lines.push("Sparse opening texture with clear space between musical events");
      else if (energies[index] > energies[index - 1] + 12) lines.push("Gradual rhythmic and harmonic build");
      else if (energies[index] < energies[index - 1] - 12) lines.push("Controlled breakdown with reduced instrumentation");
      else lines.push("Develop the established motif without introducing unrelated melodies");
      if (energies[index] >= 88 && index !== stages.length - 2 && index !== stages.length - 1) lines.push("Full instrumental ensemble at the strongest dynamic peak");
      if (index === 1) lines.push(`Introduce and clearly state the ${theme.motif}`);
      const ensembleRoles = ensembleRolePlan(index, stages.length);
      lines.push(...(ensembleRoles.length ? ensembleRoles : instrumentalArrangementPlan(index, stages.length, energies[index])));
      lines.push(...audienceArrangementPlan(index, stages.length));
      if (isLast) lines.push(state.mood === "tragic" ? "End unresolved with a fragmented final motif" : "Return to the main motif in a transformed final form");
    });
    if (state.customDirection) lines.push(`Additional direction: ${state.customDirection}`);
    return lines.filter(Boolean).map(bracket).join("\n");
  }

  function renderMeter() {
    const mood = find(MOODS, state.mood);
    const values = Array.from({ length: 28 }, (_, index) => {
      const position = index / 27 * (mood.energy.length - 1);
      const left = Math.floor(position);
      const right = Math.min(mood.energy.length - 1, left + 1);
      const mix = position - left;
      return mood.energy[left] * (1 - mix) + mood.energy[right] * mix;
    });
    $("energyMeter").innerHTML = values.map((value, index) => `<i style="--h:${Math.max(8, value)}%;--o:${0.55 + (index % 4) * 0.12}"></i>`).join("");
    $("energyLabel").textContent = itemUiLabel(mood);
  }

  function stats(text, maximum = 0) {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return maximum ? `${text.length} / ${maximum} karakter · ${words} szó` : `${words} szó · ${text.length} karakter`;
  }

  function photoMusicSource() {
    try {
      const source = JSON.parse(localStorage.getItem(PHOTO_MUSIC_SOURCE_KEY) || "null");
      if (typeof source?.prompt !== "string" || source.prompt.trim().length < 200 || !source?.state) return null;
      return source;
    } catch {
      return null;
    }
  }

  function updatePhotoMusicButton() {
    const button = $("photoToMusic");
    if (!button) return;
    const ready = Boolean(photoMusicSource());
    button.disabled = !ready;
    button.title = ready
      ? "A kész fotópromptból automatikus zenei terv készül."
      : "Előbb készítsd el a teljes fotópromptot a Fotó oldalon.";
  }

  function photoMusicProfile(source) {
    const photoState = source.state || {};
    const terrainId = String(photoState.terrainId || "");
    const weatherKey = String(photoState.weatherKey || "sun");
    const windKey = String(photoState.windKey || "calm");
    const environmentMode = String(photoState.environmentMode || "landscape");
    const timeHour = Number(photoState.timeHour ?? 12);
    const customLocation = String(photoState.customLocation || "");
    const environmentElementIds = Array.isArray(photoState.environmentElementIds)
      ? photoState.environmentElementIds.map(String)
      : [];
    // Music style must come from the place, not from the selected person's ethnicity.
    // The complete photo prompt intentionally stays out of this search because it also
    // contains face descriptors that used to turn a Central European person into polka.
    const searchable = [terrainId, environmentMode, customLocation, ...environmentElementIds]
      .join(" ")
      .replace(/_/g, " ")
      .toLowerCase();
    const containsAny = (terms) => terms.some((term) => searchable.includes(term));
    const sacredSetting = containsAny([
      "christian church", "church interior", "church", "templom", "cathedral", "katedrális",
      "notre dame", "synagogue", "zsinagóga", "mosque", "mecset", "eastern temple",
      "buddhist temple", "hindu temple", "prayer hall", "sanctuary", "altar", "oltár"
    ]);

    let genre = "cinematic";
    let culturalReason = "the visual setting and atmosphere";
    if (sacredSetting) {
      genre = "romantic";
      culturalReason = "the sacred architecture, acoustics and contemplative atmosphere of the location";
    } else if (containsAny(["arabian bazaar", "middle eastern bazaar", "cairo", "damascus", "baghdad", "arabian peninsula"])) {
      genre = "arabic";
      culturalReason = "the explicitly Middle Eastern geographic and architectural setting";
    } else if (containsAny(["serbian village", "serbian festival", "balkan folk festival", "balkáni népi", "szerb falu"])) {
      genre = "serbian_folk";
      culturalReason = "the explicit Serbian or Balkan folk setting";
    } else if (containsAny(["russian village", "ukrainian village", "slavic folk festival", "orosz falu", "ukrán falu"])) {
      genre = "russian_folk";
      culturalReason = "the explicit Eastern European folk setting";
    } else if (containsAny(["central european folk festival", "central european village dance", "polka festival", "közép európai népi fesztivál", "falusi polka"])) {
      genre = "polka";
      culturalReason = "the explicit Central European folk-dance setting";
    } else if (containsAny(["italian village", "tuscan festival", "sicilian festival", "southern italian celebration"])) {
      genre = "italian_folk";
      culturalReason = "the explicit Italian folk setting";
    } else if (["storm", "sandstorm", "tornado", "waterspout", "blowing_snow"].includes(weatherKey)) {
      genre = "hybrid";
    } else if (["fog", "mist", "aurora"].includes(weatherKey) || timeHour < 6 || timeHour >= 21) {
      genre = "darkambient";
    }

    let theme = environmentMode === "landscape" ? "nature" : "journey";
    if (sacredSetting) theme = "spiritual";
    else if (["storm", "sandstorm", "tornado", "waterspout", "blowing_snow", "hail"].includes(weatherKey)) theme = "storm";
    else if (containsAny(["ruin", "temple", "egyptian_pyramids", "ancient"])) theme = "ancient";
    else if (containsAny(["industrial", "laboratory", "technology", "neon"])) theme = "technology";
    else if (["fog", "mist"].includes(weatherKey) || timeHour < 6 || timeHour >= 21) theme = "mystery";

    let mood = "calm_epic";
    if (["storm", "sandstorm", "tornado", "waterspout", "blowing_snow"].includes(weatherKey)) mood = "mystery_threat";
    else if (["fog", "mist"].includes(weatherKey) || timeHour < 6 || timeHour >= 21) mood = "dark_hope";
    else if (["rain", "snow", "sleet", "rime"].includes(weatherKey)) mood = "melancholy_uplift";
    else if (["strong", "gale"].includes(windKey)) mood = "waves";

    const formatLocalTime = (value) => {
      const totalMinutes = Math.round((Number(value) || 0) * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    };
    const weatherCue = ({
      sandstorm: "a powerful wind-driven sandstorm with ochre airborne dust and strongly reduced visibility",
      storm: "a severe storm with turbulent air and rapidly shifting atmospheric pressure",
      tornado: "a violent rotating storm with an escalating sense of danger",
      waterspout: "a violent waterspout and turbulent spray-filled air",
      blowing_snow: "a severe wind-driven snowstorm with near-whiteout visibility",
      mirage: "extreme desert heat with visible heat shimmer and a distant inferior mirage",
      fog: "dense atmospheric fog with softened depth and obscured distance",
      mist: "soft atmospheric mist with layered depth",
      rain: "steady rainfall and a moisture-filled atmosphere",
      snow: "falling snow and a cold muted atmosphere",
      hail: "an intense hailstorm with sharp percussive impacts",
      sun: "clear directional sunlight"
    })[weatherKey] || `${String(weatherKey || "natural").replace(/_/g, " ")} atmospheric conditions`;
    const terrainCue = ({
      sand_sea_erg: "vast wind-shaped sand dune field",
      rock_desert_hamada: "vast rocky hamada desert",
      desert: "open arid desert landscape",
      oasis: "desert oasis landscape",
      egyptian_pyramids: "monumental Egyptian desert and pyramid setting",
      badland: "eroded arid badlands",
      salt_lake: "open salt-lake and alkali-flat landscape"
    })[terrainId] || `${String(terrainId || environmentMode).replace(/_/g, " ")} setting`;
    const visualCues = [
      terrainCue,
      customLocation ? `the specific location ${customLocation}` : "",
      weatherCue,
      windKey !== "calm" ? `${windKey} wind motion` : "",
      `${formatLocalTime(timeHour)} local-time light`
    ].filter(Boolean).join(", ");
    const weatherDramaturgy = weatherKey === "sandstorm"
      ? "Shape the musical arc like an approaching sandstorm: sparse dust-laden space, mounting rhythmic pressure, a turbulent full-ensemble crest, then a physically believable receding aftermath"
      : "";
    return { genre, theme, mood, culturalReason, visualCues, weatherDramaturgy };
  }

  function createMusicFromPhoto() {
    const source = photoMusicSource();
    if (!source) {
      updatePhotoMusicButton();
      showToast("Előbb készítsd el a fotópromptot");
      return;
    }
    const profile = photoMusicProfile(source);
    projectChanged("film");
    genreChanged(profile.genre);
    state.production = ["fog", "mist", "aurora"].includes(source.state?.weatherKey) ? "immersive" : "cinematic";
    state.theme = profile.theme;
    state.mood = profile.mood;
    state.structureMode = "adaptive";
    state.autoControls = true;
    state.audience = "none";
    state.customDirection = `Translate the completed photograph into instrumental music through ${profile.visualCues}; let ${profile.culturalReason} influence the musical language without turning it into a caricature.${profile.weatherDramaturgy ? ` ${profile.weatherDramaturgy}.` : ""}`;
    state.titleVariant = Number(source.savedAt || Date.now()) % 12;
    applyAutomaticMusicalControls();
    render();
    showToast("A fotópromptból elkészült a zenei terv");
  }

  function render() {
    if (state.autoControls) applyAutomaticMusicalControls();
    renderSingleGrid("projectGrid", PROJECTS, state.project, projectChanged);
    const recommendedGenreKeys = RECOMMENDED_GENRES_BY_PROJECT[state.project] || GENRES.map((item) => item.key);
    const visibleGenres = state.genreFilter
      ? GENRES.filter((item) => recommendedGenreKeys.includes(item.key) || item.key === state.genre)
      : GENRES;
    renderSingleGrid("genreGrid", visibleGenres, state.genre, (key) => {
      genreChanged(key);
      showToast("Hangszerelés a műfajhoz igazítva");
    });
    $("toggleGenreFilter").setAttribute("aria-pressed", String(state.genreFilter));
    $("toggleGenreFilter").textContent = englishUi() ? (state.genreFilter ? "Recommended" : "All genres") : (state.genreFilter ? "Ajánlottak" : "Minden műfaj");
    $("genreFilterInfo").textContent = englishUi()
      ? (state.genreFilter ? `${recommendedGenreKeys.length} genres naturally suit this project type` : "All genres visible · for intentional fusion")
      : (state.genreFilter ? `${recommendedGenreKeys.length} műfaj illik természetesen ehhez a műtípushoz` : "Minden műfaj látható · szándékos fúzióhoz");
    renderSingleGrid("themeGrid", THEMES, state.theme, (key) => { state.theme = key; });
    renderSingleGrid("moodGrid", MOODS, state.mood, (key) => { state.mood = key; });
    renderSingleGrid("productionGrid", PRODUCTIONS, state.production, (key) => { state.production = key; });
    renderStructure();
    renderInstruments();
    fillSelect("rhythmSelect", RHYTHMS, state.rhythm);
    fillSelect("tonalitySelect", TONALITIES, state.tonality);
    fillSelect("durationSelect", DURATIONS, state.duration);
    fillSelect("soloSelect", SOLO_OPTIONS.map((item) => [item[0], item[1], item[2], SOLO_LABELS_EN[item[0]]]), state.solo);
    fillSelect("audienceSelect", AUDIENCE_OPTIONS, state.audience);
    fillSelect("ensembleSelect", ENSEMBLES.map((item) => [item.key, item.label, item.prompt, ENSEMBLE_LABELS_EN[item.key]]), state.ensemble);
    const controlledInputs = [$("tempoRange"), $("rhythmSelect"), $("tonalitySelect"), $("durationSelect"), $("soloSelect")];
    controlledInputs.forEach((control) => { control.disabled = state.autoControls; });
    $("sunoControlGrid").classList.toggle("auto-mode", state.autoControls);
    $("toggleSoundAutomation").classList.toggle("selected", state.autoControls);
    $("toggleSoundAutomation").setAttribute("aria-pressed", String(state.autoControls));
    $("toggleSoundAutomation").textContent = englishUi() ? (state.autoControls ? "Enabled" : "Manual controls") : (state.autoControls ? "Bekapcsolva" : "Kézi beállítás");
    $("tempoRange").value = state.tempo;
    const tempoInfo = tempoDescription(state.tempo);
    $("tempoValue").textContent = `${state.tempo} BPM · ${englishUi() ? (state.tempo < 60 ? "very slow" : state.tempo < 85 ? "slow" : state.tempo < 115 ? "medium" : state.tempo < 145 ? "fast" : "very fast") : tempoInfo[0]}`;
    $("tempoHelp").textContent = englishUi() ? `${state.autoControls ? "Automatically refined from the arrangement." : "Manual tempo control."}` : `${tempoInfo[1]}${state.autoControls ? " Automatikusan finomítva a hangszerelés alapján." : ""}`;
    $("rhythmHelp").textContent = englishUi() ? (tuple(RHYTHMS, state.rhythm)[2] || "") : CONTROL_HELP.rhythm[state.rhythm];
    $("tonalityHelp").textContent = englishUi() ? (tuple(TONALITIES, state.tonality)[2] || "") : CONTROL_HELP.tonality[state.tonality];
    $("durationHelp").textContent = englishUi() ? (tuple(DURATIONS, state.duration)[2] || "") : CONTROL_HELP.duration[state.duration];
    $("soloHelp").textContent = englishUi() ? (tuple(SOLO_OPTIONS, state.solo)[2] || "") : CONTROL_HELP.solo[state.solo];
    const audienceKey = resolvedAudienceKey();
    $("audienceHelp").textContent = englishUi() ? (tuple(AUDIENCE_OPTIONS, audienceKey)[2] || "") : `${state.audience === "auto" ? "Automatikusan: " : ""}${CONTROL_HELP.audience[audienceKey]}`;
    const ensembleKey = resolvedEnsembleKey();
    const ensemble = find(ENSEMBLES, ensembleKey);
    $("ensembleHelp").textContent = englishUi() ? ensemble.prompt : `${state.ensemble === "auto" ? `Automatikusan: ${ensemble.label}. ` : ""}${ensemble.help}`;
    if (document.activeElement !== $("customDirection")) $("customDirection").value = state.customDirection;

    const project = find(PROJECTS, state.project);
    const genre = find(GENRES, state.genre);
    const theme = find(THEMES, state.theme);
    const mood = find(MOODS, state.mood);
    const production = find(PRODUCTIONS, state.production);
    $("projectSummary").textContent = itemUiLabel(project);
    $("genreSummary").textContent = itemUiLabel(genre);
    $("themeSummary").textContent = itemUiLabel(theme);
    $("moodSummary").textContent = itemUiLabel(mood);
    $("soundSummary").textContent = `${englishUi() ? (state.autoControls ? "Automatic" : "Manual") : (state.autoControls ? "Automatikus" : "Kézi")} · ${itemUiLabel(ensemble)} · ${state.instruments.length} ${englishUi() ? "layers" : "réteg"} · ${state.tempo} BPM`;
    const audienceLabel = tupleUiLabel(tuple(AUDIENCE_OPTIONS, audienceKey));
    $("productionSummary").textContent = audienceKey === "none" ? itemUiLabel(production) : `${itemUiLabel(production)} · ${audienceLabel}`;
    const suggestedSettings = suggestedSunoSettings();
    $("currentTitle").textContent = suggestedSongTitle();
    $("currentMeta").textContent = `${itemUiLabel(project)} · ${itemUiLabel(genre)} · ${state.tempo} BPM`;
    $("weirdnessValue").textContent = `${suggestedSettings.weirdness}%`;
    $("styleInfluenceValue").textContent = `${suggestedSettings.influence}%`;
    $("weirdnessBar").style.width = `${suggestedSettings.weirdness}%`;
    $("styleInfluenceBar").style.width = `${suggestedSettings.influence}%`;
    const style = stylePrompt();
    const blueprint = blueprintPrompt();
    $("stylePrompt").value = style;
    $("blueprintPrompt").value = blueprint;
    $("styleStats").textContent = stats(style, STYLE_PROMPT_MAX_LENGTH);
    $("blueprintStats").textContent = stats(blueprint);
    renderMeter();
    updatePhotoMusicButton();
    saveState();
  }

  function exportSnapshot() {
    const title = suggestedSongTitle();
    const ensemble = find(ENSEMBLES, resolvedEnsembleKey());
    const audience = tuple(AUDIENCE_OPTIONS, resolvedAudienceKey())[1];
    const soloKey = resolvedSoloKey();
    const soloLabel = tuple(SOLO_OPTIONS, soloKey)[1];
    const settings = suggestedSunoSettings();
    const instruments = INSTRUMENTS.filter((item) => state.instruments.includes(item.key)).map((item) => item.label).join(", ");
    return {
      title,
      created: new Date().toLocaleString("hu-HU"),
      rows: [
        ["Zenei mű típusa", find(PROJECTS, state.project).label],
        ["Műfaj és zenei nyelv", find(GENRES, state.genre).label],
        ["Narratív téma", find(THEMES, state.theme).label],
        ["Hangulati ív", find(MOODS, state.mood).label],
        ["Felépítés", tuple(STRUCTURE_MODES, state.structureMode)[1]],
        ["Együttes felállása", ensemble.label],
        ["Hangszerek", instruments],
        ["Automatikus zenei beállítás", state.autoControls ? "Bekapcsolva" : "Kézi"],
        ["Tempó", `${state.tempo} BPM · ${tempoDescription(state.tempo)[0]}`],
        ["Ritmikai karakter", tuple(RHYTHMS, state.rhythm)[1]],
        ["Hangnemi karakter", tuple(TONALITIES, state.tonality)[1]],
        ["Időtartam", tuple(DURATIONS, state.duration)[1]],
        ["Kiemelt szóló", state.solo === "auto" ? `Automatikus → ${soloLabel}` : soloLabel],
        ["Produkció és tér", find(PRODUCTIONS, state.production).label],
        ["Közönséghangulat", state.audience === "auto" ? `Automatikus → ${audience}` : audience],
        ["Weirdness", `${settings.weirdness}%`],
        ["Style Influence", `${settings.influence}%`],
        ["Egyéni rendezői megjegyzés", state.customDirection || "—"]
      ],
      lyrics: blueprintPrompt(),
      style: stylePrompt()
    };
  }

  function safeExportFileName(title) {
    const safe = String(title || "Suno dal").replace(/[<>:"/\\|?*\x00-\x1F]/g, "").replace(/\s+/g, " ").trim();
    return `${safe || "Suno dal"} - Suno beallitasok`;
  }

  function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportTextContent(snapshot) {
    const settings = snapshot.rows.map(([label, value]) => `${label}: ${value}`).join("\r\n");
    return [
      "PHOTO & MUSIC · PROMPT BUILDER 2026",
      `DALCÍM: ${snapshot.title}`,
      `MENTÉS IDEJE: ${snapshot.created}`,
      "",
      "SUNO BEÁLLÍTÁSOK",
      settings,
      "",
      "LYRICS · INSTRUMENTAL STRUCTURE",
      snapshot.lyrics,
      "",
      "SUNO STYLE PROMPT",
      snapshot.style,
      ""
    ].join("\r\n");
  }

  function wrapPdfText(text, maximum = 88) {
    const sourceLines = String(text ?? "").split(/\r?\n/);
    const result = [];
    sourceLines.forEach((source) => {
      const words = source.trim().split(/\s+/).filter(Boolean);
      if (!words.length) { result.push(""); return; }
      let line = "";
      words.forEach((word) => {
        if (!line) { line = word; return; }
        if (`${line} ${word}`.length <= maximum) line += ` ${word}`;
        else { result.push(line); line = word; }
      });
      if (line) result.push(line);
    });
    return result;
  }

  function normalizePdfText(value) {
    return String(value ?? "")
      .replace(/Ő/g, "O").replace(/ő/g, "o").replace(/Ű/g, "U").replace(/ű/g, "u")
      .replace(/[–—]/g, "-").replace(/→/g, "->").replace(/·/g, "-")
      .replace(/[„”]/g, '"').replace(/[’]/g, "'").replace(/…/g, "...")
      .replace(/[^\x20-\xFF]/g, "?");
  }

  function escapePdfText(value) {
    return normalizePdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  }

  function buildPdfBlob(snapshot) {
    const blocks = [
      { text: "PHOTO & MUSIC - PROMPT BUILDER 2026", size: 17, bold: true, gap: 0 },
      { text: snapshot.title, size: 15, bold: true, gap: 9 },
      { text: `Mentes ideje: ${snapshot.created}`, size: 9, bold: false, gap: 5 },
      { text: "SUNO BEALLITASOK", size: 12, bold: true, gap: 14 },
      ...snapshot.rows.map(([label, value]) => ({ text: `${label}: ${value}`, size: 9, bold: false, gap: 2 })),
      { text: "LYRICS - INSTRUMENTAL STRUCTURE", size: 12, bold: true, gap: 15 },
      ...snapshot.lyrics.split(/\r?\n/).map((text) => ({ text, size: 8.5, bold: false, gap: 1 })),
      { text: "SUNO STYLE PROMPT", size: 12, bold: true, gap: 15 },
      { text: snapshot.style, size: 9, bold: false, gap: 2 }
    ];
    const pages = [[]];
    let y = 800;
    blocks.forEach((block) => {
      y -= block.gap || 0;
      const maximum = block.size >= 14 ? 62 : block.size >= 11 ? 76 : block.size <= 8.5 ? 106 : 94;
      const lines = wrapPdfText(block.text, maximum);
      const leading = block.size + 3;
      lines.forEach((line) => {
        if (y < 46) { pages.push([]); y = 800; }
        pages[pages.length - 1].push({ text: line, x: 42, y, size: block.size, bold: block.bold });
        y -= leading;
      });
    });

    const objects = [];
    objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
    objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
    objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";
    const pageRefs = [];
    pages.forEach((page, index) => {
      const pageNumber = 5 + index * 2;
      const contentNumber = pageNumber + 1;
      pageRefs.push(`${pageNumber} 0 R`);
      const stream = page.map((line) => `BT /${line.bold ? "F2" : "F1"} ${line.size} Tf ${line.x} ${line.y} Td (${escapePdfText(line.text)}) Tj ET`).join("\n");
      objects[pageNumber] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentNumber} 0 R >>`;
      objects[contentNumber] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
    });
    objects[2] = `<< /Type /Pages /Count ${pages.length} /Kids [${pageRefs.join(" ")}] >>`;

    let pdf = "%PDF-1.4\n%âãÏÓ\n";
    const offsets = [0];
    for (let index = 1; index < objects.length; index += 1) {
      offsets[index] = pdf.length;
      pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
    }
    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
    for (let index = 1; index < objects.length; index += 1) pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
    pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return new Blob([Uint8Array.from(pdf, (character) => character.charCodeAt(0) & 255)], { type: "application/pdf" });
  }

  function exportSunoTxt() {
    const snapshot = exportSnapshot();
    const blob = new Blob(["\uFEFF", exportTextContent(snapshot)], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, `${safeExportFileName(snapshot.title)}.txt`);
    showToast("TXT mentve a dal címével");
  }

  function exportSunoPdf() {
    const snapshot = exportSnapshot();
    downloadBlob(buildPdfBlob(snapshot), `${safeExportFileName(snapshot.title)}.pdf`);
    showToast("PDF mentve a dal címével");
  }

  function randomItem(rows) { return rows[Math.floor(Math.random() * rows.length)]; }

  function randomize() {
    const project = randomItem(PROJECTS).key;
    projectChanged(project);
    state.theme = randomItem(THEMES).key;
    state.mood = randomItem(MOODS).key;
    state.structureMode = Math.random() < 0.68 ? "adaptive" : randomItem(STRUCTURE_MODES)[0];
    state.rhythm = randomItem(RHYTHMS)[0];
    state.tonality = randomItem(TONALITIES)[0];
    state.duration = randomItem(DURATIONS)[0];
    state.solo = "auto";
    state.tempo = Math.max(40, Math.min(190, state.tempo + Math.round((Math.random() - 0.5) * 22)));
    state.customDirection = "";
    state.titleVariant = Math.floor(Math.random() * 12);
    render();
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    $("toast").textContent = message;
    $("toast").classList.add("show");
    toastTimer = setTimeout(() => $("toast").classList.remove("show"), 1500);
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); showToast("Prompt másolva"); }
    catch { showToast("A másolás nem sikerült"); }
  }

  $("tempoRange").addEventListener("input", () => { state.tempo = Number($("tempoRange").value); render(); });
  $("rhythmSelect").addEventListener("change", () => { state.rhythm = $("rhythmSelect").value; render(); });
  $("tonalitySelect").addEventListener("change", () => { state.tonality = $("tonalitySelect").value; render(); });
  $("durationSelect").addEventListener("change", () => { state.duration = $("durationSelect").value; render(); });
  $("soloSelect").addEventListener("change", () => { state.solo = $("soloSelect").value; render(); });
  $("audienceSelect").addEventListener("change", () => { state.audience = $("audienceSelect").value; render(); });
  $("ensembleSelect").addEventListener("change", () => { ensembleChanged($("ensembleSelect").value); render(); });
  $("toggleSoundAutomation").addEventListener("click", () => {
    state.autoControls = !state.autoControls;
    render();
    showToast(state.autoControls ? "Automatikus zenei beállítások bekapcsolva" : "Kézi beállítások engedélyezve");
  });
  $("toggleGenreFilter").addEventListener("click", () => {
    state.genreFilter = !state.genreFilter;
    render();
    showToast(state.genreFilter ? "A műtípushoz ajánlott műfajok" : "Minden műfaj megjelenítve");
  });
  $("customDirection").addEventListener("input", () => { state.customDirection = $("customDirection").value.trim(); render(); });
  $("randomizeSuno").addEventListener("click", randomize);
  $("photoToMusic").addEventListener("click", createMusicFromPhoto);
  $("resetSuno").addEventListener("click", () => { state = defaultState(); render(); showToast("Alaphelyzet visszaállítva"); });
  $("exportSunoTxt").addEventListener("click", exportSunoTxt);
  $("exportSunoPdf").addEventListener("click", exportSunoPdf);
  $("copyStylePrompt").addEventListener("click", () => copyText($("stylePrompt").value));
  $("copyBlueprint").addEventListener("click", () => copyText($("blueprintPrompt").value));
  $("copySongTitle").addEventListener("click", () => copyText($("currentTitle").textContent));
  $("newSongTitle").addEventListener("click", () => { state.titleVariant = Number(state.titleVariant || 0) + 1; render(); });
  document.querySelectorAll(".suno-tabs a").forEach((link) => link.addEventListener("click", () => {
    document.querySelectorAll(".suno-tabs a").forEach((item) => item.classList.toggle("selected", item === link));
  }));
  window.addEventListener("storage", (event) => {
    if (event.key === PHOTO_MUSIC_SOURCE_KEY) updatePhotoMusicButton();
  });
  window.addEventListener("promptbuilder:languagechange", render);

  const accordionSections = Array.from(document.querySelectorAll(".suno-section"));
  function scrollSunoSectionIntoView(section) {
    const positionSection = (behavior) => {
      const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      const stickyHeader = document.querySelector(".topbar");
      const headerHeight = stickyHeader?.getBoundingClientRect().height || 0;
      section.style.scrollMarginTop = `${headerHeight + 12}px`;
      section.scrollIntoView({
        block: "start",
        behavior: prefersReducedMotion ? "auto" : behavior
      });
    };

    requestAnimationFrame(() => requestAnimationFrame(() => {
      positionSection("smooth");
      window.setTimeout(() => positionSection("auto"), 260);
    }));
  }

  accordionSections.forEach((section) => section.addEventListener("toggle", () => {
    if (!section.open) return;
    accordionSections.forEach((otherSection) => {
      if (otherSection !== section) otherSection.open = false;
    });
    scrollSunoSectionIntoView(section);
  }));

  render();
})();
