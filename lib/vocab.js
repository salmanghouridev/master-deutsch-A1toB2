import rawVocabData from "@/data/cards/german_a1_vocabulary_topics_2_to_44_with_icons.json";

// Comprehensive visual emoji & icon dictionary for German A1 vocabulary
export const WORD_EMOJIS = {
  // Food & Drink (Topics 17, 18, 21, 22)
  brot: "🍞", brötchen: "🥖", butter: "🧈", käse: "🧀", ei: "🥚", milch: "🥛",
  joghurt: "🥣", fleisch: "🥩", fisch: "🐟", hähnchen: "🍗", wurst: "🌭", schinken: "🥓",
  apfel: "🍎", banane: "🍌", orange: "🍊", ananas: "🍍", zitrone: "🍋", erdbeere: "🍓",
  kartoffel: "🥔", tomate: "🍅", zwiebel: "🧅", gurke: "🥒", salat: "🥗", suppe: "🍲",
  reis: "🍚", nudeln: "🍝", pizza: "🍕", kuchen: "🍰", schokolade: "🍫", eis: "🍦",
  wasser: "💧", saft: "🧃", kaffee: "☕", tee: "🍵", bier: "🍺", wein: "🍷",
  zucker: "🧂", salz: "🧂", pfeffer: "🌶️", öl: "🫒", obst: "🍎", gemüse: "🥦",
  essen: "🍽️", trinken: "🥤", hunger: "😋", durst: "🥤", frühstück: "🥐",
  mittagessen: "🍲", abendessen: "🍽️", mahlzeit: "🍽️", kochen: "🍳", backen: "🥖",
  braten: "🍳", rezept: "📜", topf: "🍲", pfanne: "🍳", messer: "🔪", gabel: "🍴",
  löffel: "🥄", teller: "🍽️", tasse: "☕", glas: "🥛", flasche: "🍾",
  speisekarte: "📋", kellner: "👨‍🍳", kellnerin: "👩‍🍳", rechnung: "🧾", trinkgeld: "🪙",

  // Clothes & Colours (Topic 19)
  hemd: "👔", tshirt: "👕", hose: "👖", kleid: "👗", rock: "👗", jacke: "🧥",
  mantel: "🧥", pullover: "🧥", schuhe: "👟", stiefel: "👢", socken: "🧦",
  mütze: "🧢", hut: "👒", schal: "🧣", handschuhe: "🧤", brille: "👓",
  sonnenbrille: "🕶️", tasche: "👜", rucksack: "🎒", krawatte: "👔", gürtel: "👔",
  anzug: "🤵", kostüm: "👗", badeanzug: "🩱", badehose: "🩳",
  rot: "🔴", blau: "🔵", grün: "🟢", gelb: "🟡", schwarz: "⚫", weiß: "⚪",
  braun: "🟤", grau: "🔘", rosa: "🌸", lila: "🟣",

  // Transport & Travel (Topics 24, 25, 26, 27)
  auto: "🚗", wagen: "🚗", bus: "🚌", zug: "🚆", bahn: "🚆", "s-bahn": "🚊",
  "u-bahn": "🚇", straßenbahn: "🚋", tram: "🚋", fahrrad: "🚲", rad: "🚲",
  motorrad: "🏍️", flugzeug: "✈️", schiff: "🚢", boot: "⛵", taxi: "🚕",
  bahnhof: "🚉", flughafen: "🛫", haltestelle: "🚏", gleis: "🛤️", fahrkarte: "🎫",
  ticket: "🎫", gepäck: "🧳", koffer: "🧳", reise: "🧳", urlaub: "🏖️", hotel: "🏨",
  zimmer: "🛏️", schlüssel: "🔑", rezeption: "🛎️", strand: "🏖️", meer: "🌊",
  see: "🏞️", berg: "🏔️", wandern: "🥾", fliegen: "✈️", fahren: "🚗", abfahrt: "🛫",
  ankunft: "🛬", pass: "🛂", reisepass: "🛂", visum: "🛂",

  // Family, People & Relationships (Topics 3, 4, 7, 8, 44)
  vater: "👨", mutter: "👩", eltern: "👨‍👩‍👧", sohn: "👦", tochter: "👧",
  bruder: "👦", schwester: "👧", großvater: "👴", opa: "👴", großmutter: "👵", oma: "👵",
  baby: "👶", kind: "🧒", kinder: "👨‍👩‍👧‍👦", mann: "👨", frau: "👩", herr: "👔",
  freund: "🤝", freundin: "🤝", kollege: "💼", kollegin: "💼", familie: "👨‍👩‍👧",
  nachbar: "🏡", nachbarin: "🏡", junge: "👦", mädchen: "👧", leute: "👥",
  name: "🏷️", vorname: "🏷️", nachname: "🏷️", alter: "🎂", geburtstag: "🎂",

  // Home, Furniture & Household (Topics 15, 16, 40)
  haus: "🏠", wohnung: "🏢", zimmer: "🚪", küche: "🍳", bad: "🛁",
  badezimmer: "🛁", schlafzimmer: "🛏️", wohnzimmer: "🛋️", balkon: "🪴", garten: "🏡",
  tisch: "🪑", stuhl: "🪑", bett: "🛏️", sofa: "🛋️", sessel: "🛋️",
  schrank: "🗄️", regal: "📚", lampe: "💡", tür: "🚪", fenster: "🪟",
  kühlschrank: "🧊", herd: "🍳", waschmaschine: "🫧", fernseher: "📺",
  spiegel: "🪞", teppich: "🧶", bild: "🖼️", staubsauger: "🧹", putzen: "🧽",
  müll: "🗑️",

  // City, Places & Services (Topics 20, 23, 36, 37, 38)
  stadt: "🏙️", dorf: "🏘️", straße: "🛣️", platz: "🏛️", park: "🌳",
  brücke: "🌉", kirche: "⛪", museum: "🏛️", supermarkt: "🛒", geschäft: "🛍️",
  laden: "🛍️", bank: "🏦", geld: "💶", euro: "💶", post: "📮", brief: "✉️",
  briefmarke: "📮", paket: "📦", karte: "🗺️", schule: "🏫", universität: "🎓",
  bibliothek: "📚", café: "☕", restaurant: "🍽️", bäckerei: "🥖", metzgerei: "🥩",
  kino: "🍿", theater: "🎭", rathaus: "🏛️", polizei: "👮", feuerwehr: "🚒",

  // Nature, Animals & Weather (Topics 28, 39)
  hund: "🐕", katze: "🐈", vogel: "🐦", pferd: "🐎", kuh: "🐄", schwein: "🐖",
  schaf: "🐑", fisch: "🐟", maus: "🐁", bär: "🐻", elefant: "🐘", löwe: "🦁",
  baum: "🌳", blume: "🌸", pflanze: "🌱", wald: "🌲", sonne: "☀️",
  mond: "🌙", sterne: "⭐", wolke: "☁️", regen: "🌧️", schnee: "❄️", wind: "💨",
  gewitter: "⛈️", wetter: "🌤️", temperatur: "🌡️", warm: "🌡️", kalt: "🥶",

  // Body, Health & Pharmacy (Topics 29, 30)
  kopf: "👤", auge: "👁️", ohr: "👂", nase: "👃", mund: "👄", zahn: "🦷",
  haar: "💇", hals: "🧣", brust: "🫁", bauch: "🫄", rücken: "🧍", hand: "✋",
  finger: "👆", arm: "💪", bein: "🦵", fuß: "🦶", herz: "❤️", arzt: "👨‍⚕️",
  ärztin: "👩‍⚕️", krankenhaus: "🏥", apotheke: "💊", medikament: "💊", tablette: "💊",
  pflaster: "🩹", fieber: "🤒", schmerzen: "🤕", krank: "🤒", gesund: "💪",

  // Tech, Communication & Free Time (Topics 9, 31, 32, 33, 34, 35)
  telefon: "☎️", handy: "📱", smartphone: "📱", computer: "💻", laptop: "💻",
  internet: "🌐", "e-mail": "📧", nachricht: "💬", buch: "📖", zeitung: "📰",
  musik: "🎵", lied: "🎶", radio: "📻", film: "🎬", sport: "🏅",
  fußball: "⚽", tennis: "🎾", schwimmen: "🏊", laufen: "🏃", spielen: "🎮",
  tanzen: "💃", singen: "🎤", lesen: "📖", schreiben: "✍️", fotografieren: "📷",
  kamera: "📷", foto: "📸", party: "🎉", fest: "🥳", geburtstag: "🎂",
  geschenk: "🎁", einladung: "💌",

  // Time, Dates, Numbers & Work (Topics 5, 6, 10, 11, 12, 13, 14)
  uhr: "⏰", zeit: "⏳", minute: "⏱️", stunde: "⏳", woche: "📅",
  monat: "🗓️", jahr: "📆", heute: "📍", gestern: "⏮️", morgen: "⏭️",
  kalender: "📅", montag: "1️⃣", dienstag: "2️⃣", mittwoch: "3️⃣", donnerstag: "4️⃣",
  freitag: "5️⃣", samstag: "6️⃣", sonntag: "7️⃣", frühling: "🌱", sommer: "☀️",
  herbst: "🍂", winter: "❄️", arbeit: "💼", beruf: "💼", chef: "👔", büro: "🏢",
  lehrer: "👨‍🏫", lehrerin: "👩‍🏫", student: "🎓", studentin: "🎓",

  // Greetings & Core Expressions (Topic 2, 42, 43)
  hallo: "👋", "guten morgen": "🌅", "guten tag": "☀️", "guten abend": "🌆",
  "gute nacht": "🌙", "auf wiedersehen": "🤝", tschüss: "👋", danke: "🙏",
  bitte: "🤲", entschuldigung: "🙇", willkommen: "✨", ja: "✅", nein: "❌"
};

// Topic category metadata
export const TOPIC_CATEGORIES = {
  "Daily Life & Basics": [2, 3, 4, 6, 10, 11, 12, 42, 43],
  "People & Society": [5, 7, 8, 13, 14, 44],
  "Food & Dining": [17, 18, 21, 22],
  "Home, Living & Shopping": [15, 16, 19, 20, 40],
  "City, Travel & Transport": [23, 24, 25, 26, 27, 36, 37, 38, 41],
  "Health & Body": [29, 30],
  "Leisure, Media & Nature": [9, 28, 31, 32, 33, 34, 35, 39]
};

export const TOPIC_EMOJIS = {
  2: "👋", 3: "🤝", 4: "📋", 5: "🌍", 6: "🔢", 7: "👨‍👩‍👧", 8: "👥", 9: "🎨",
  10: "⏰", 11: "📅", 12: "⏱️", 13: "💼", 14: "🎓", 15: "🏠", 16: "🛋️",
  17: "🍽️", 18: "🛒", 19: "👕", 20: "🛍️", 21: "🍕", 22: "🍳", 23: "🏙️",
  24: "🧭", 25: "🚆", 26: "✈️", 27: "🏨", 28: "🌤️", 29: "🩺", 30: "💊",
  31: "⚽", 32: "🎬", 33: "📱", 34: "🎂", 35: "🎟️", 36: "🏛️", 37: "✉️",
  38: "💶", 39: "🐾", 40: "🧹", 41: "🪧", 42: "🆘", 43: "❤️", 44: "✨"
};

function getTopicCategory(topicNum) {
  for (const [catName, topicNums] of Object.entries(TOPIC_CATEGORIES)) {
    if (topicNums.includes(topicNum)) return catName;
  }
  return "General";
}

function cleanGermanWord(raw = "") {
  return raw
    .replace(/,\s*[-–—\wäöüÄÖÜß]+.*$/i, "") // strip plural note e.g. ", -e"
    .replace(/\s*\([^)]*\)/g, "") // strip notes in parens
    .trim();
}

function extractArticle(german = "", explicitArticle = null) {
  if (explicitArticle) return explicitArticle.toLowerCase();
  const m = german.match(/^(der|die|das)\b/i);
  return m ? m[1].toLowerCase() : null;
}

function extractPlural(german = "") {
  const m = german.match(/,\s*([-–—\wäöüÄÖÜß]+.*)$/i);
  return m ? m[1].trim() : null;
}

function getVisualEmoji(german = "", english = "", topicNum = 2) {
  const de = german.toLowerCase();
  const en = english.toLowerCase();

  // Try direct keyword lookup in WORD_EMOJIS
  for (const [key, emoji] of Object.entries(WORD_EMOJIS)) {
    if (de.includes(key) || en.includes(key)) {
      return emoji;
    }
  }

  // Fallback to topic emoji
  return TOPIC_EMOJIS[topicNum] || "📖";
}

/**
 * Generate 1-2 letter hint for active recall study
 * E.g.
 * "die Ananas" (level 2) -> "die An _ _ _ _"
 * "das Brot, -e" (level 2) -> "das Br _ _"
 * "Guten Morgen" (level 2) -> "Gu _ _ _   Mo _ _ _ _"
 */
export function generateHint(german = "", article = null, hintLevel = 2) {
  const clean = cleanGermanWord(german);
  let prefix = "";
  let target = clean;

  const actualArticle = extractArticle(german, article);
  if (actualArticle && clean.toLowerCase().startsWith(actualArticle + " ")) {
    prefix = actualArticle + " ";
    target = clean.slice(actualArticle.length + 1).trim();
  }

  // Split target into individual words
  const words = target.split(/\s+/);
  const hintedWords = words.map((w) => {
    const letters = w.split("");
    const revealCount = Math.min(hintLevel, letters.length);
    const revealed = letters.slice(0, revealCount).join("");
    const blanks = letters
      .slice(revealCount)
      .map((ch) => (/[a-zA-ZäöüÄÖÜß]/.test(ch) ? "_" : ch))
      .join(" ");

    return blanks.length > 0 ? `${revealed} ${blanks}` : revealed;
  });

  return `${prefix}${hintedWords.join("   ")}`.trim();
}

let cachedVocabData = null;

export function getVocabData() {
  if (cachedVocabData) {
    return cachedVocabData;
  }

  try {
    const data = rawVocabData;
    const allWords = [];
    const topics = (data.topics || []).map((t) => {
      const topicNum = t.number;
      const topicTitle = t.title;
      const category = getTopicCategory(topicNum);
      const topicEmoji = TOPIC_EMOJIS[topicNum] || "📖";

      const vocabList = (t.vocabulary || []).map((v, idx) => {
        const article = extractArticle(v.german, v.article);
        const clean = cleanGermanWord(v.german);
        const plural = extractPlural(v.german);
        const emoji = getVisualEmoji(v.german, v.english, topicNum);

        // Core base word without article for comparison
        let baseWord = clean;
        if (article && clean.toLowerCase().startsWith(article + " ")) {
          baseWord = clean.slice(article.length + 1).trim();
        }

        const wordItem = {
          id: `t${topicNum}-w${idx}`,
          topicNumber: topicNum,
          topicTitle: topicTitle,
          topicGermanTitle: t.german_title || topicTitle,
          category,
          german: v.german,
          cleanGerman: clean,
          baseWord,
          plural,
          english: v.english,
          wordType: v.word_type || "word",
          wordTypeLabel: v.word_type_label || "Word",
          article,
          gender: v.gender || (article === "der" ? "masculine" : article === "die" ? "feminine" : article === "das" ? "neuter" : null),
          visualEmoji: emoji,
          iconName: v.icon || "text",
        };

        allWords.push(wordItem);
        return wordItem;
      });

      return {
        number: topicNum,
        title: topicTitle,
        germanTitle: t.german_title || topicTitle,
        category,
        emoji: topicEmoji,
        wordCount: vocabList.length,
        vocabulary: vocabList,
      };
    });

    cachedVocabData = {
      title: data.title || "German A1 Vocabulary",
      language: data.language || "German",
      level: data.level || "A1",
      description: data.description || "Essential A1 vocabulary organized by 43 topics with visual icons and active recall hints.",
      topicCount: topics.length,
      totalWords: allWords.length,
      topics,
      allWords,
    };

    return cachedVocabData;
  } catch (err) {
    console.error("Failed to parse vocabulary data:", err);
    return { title: "A1 Vocabulary", topicCount: 0, totalWords: 0, topics: [], allWords: [] };
  }
}
