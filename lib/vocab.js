import rawA1VocabData from "@/data/cards/german_a1_vocabulary_topics_2_to_44_with_icons.json";
import rawA2VocabData from "@/data/cards/german_A2_unique_vocabulary_with_flashcard_icons.json";

// Comprehensive visual emoji & icon dictionary for German A1 & A2 vocabulary
export const WORD_EMOJIS = {
  // Food & Drink
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
  zutaten: "🥣", pfandflasche: "🍾", pfand: "🪙", kasse: "🛒", angebot: "🏷️",

  // Clothes & Colours
  hemd: "👔", tshirt: "👕", hose: "👖", kleid: "👗", rock: "👗", jacke: "🧥",
  mantel: "🧥", pullover: "🧥", schuhe: "👟", stiefel: "👢", socken: "🧦",
  mütze: "🧢", hut: "👒", schal: "🧣", handschuhe: "🧤", brille: "👓",
  sonnenbrille: "🕶️", tasche: "👜", rucksack: "🎒", krawatte: "👔", gürtel: "👔",
  anzug: "🤵", kostüm: "👗", badeanzug: "🩱", badehose: "🩳", umkleidekabine: "🚪",
  bequem: "🛋️", eng: "📏", zahnbürste: "🪥", zahnpasta: "🪥", rasieren: "🪒",
  rot: "🔴", blau: "🔵", grün: "🟢", gelb: "🟡", schwarz: "⚫", weiß: "⚪",
  braun: "🟤", grau: "🔘", rosa: "🌸", lila: "🟣",

  // Transport & Travel
  auto: "🚗", wagen: "🚗", bus: "🚌", zug: "🚆", bahn: "🚆", "s-bahn": "🚊",
  "u-bahn": "🚇", straßenbahn: "🚋", tram: "🚋", fahrrad: "🚲", rad: "🚲",
  motorrad: "🏍️", flugzeug: "✈️", schiff: "🚢", boot: "⛵", taxi: "🚕",
  bahnhof: "🚉", flughafen: "🛫", haltestelle: "🚏", gleis: "🛤️", fahrkarte: "🎫",
  ticket: "🎫", monatskarte: "🎟️", gepäck: "🧳", koffer: "🧳", reise: "🧳",
  urlaub: "🏖️", hotel: "🏨", zimmer: "🛏️", schlüssel: "🔑", rezeption: "🛎️",
  strand: "🏖️", meer: "🌊", see: "🏞️", berg: "🏔️", wandern: "🥾", fliegen: "✈️",
  fahren: "🚗", abfahrt: "🛫", ankunft: "🛬", pass: "🛂", reisepass: "🛂", visum: "🛂",

  // Family, People & Relationships
  vater: "👨", mutter: "👩", eltern: "👨‍👩‍👧", sohn: "👦", tochter: "👧",
  bruder: "👦", schwester: "👧", großvater: "👴", opa: "👴", großmutter: "👵", oma: "👵",
  baby: "👶", kind: "🧒", kinder: "👨‍👩‍👧‍👦", mann: "👨", frau: "👩", herr: "👔",
  freund: "🤝", freundin: "🤝", kollege: "💼", kollegin: "💼", familie: "👨‍👩‍👧",
  nachbar: "🏡", nachbarin: "🏡", junge: "👦", mädchen: "👧", leute: "👥",
  name: "🏷️", vorname: "🏷️", nachname: "🏷️", alter: "🎂", geburtstag: "🎂",

  // Home, Renting & Household
  haus: "🏠", wohnung: "🏢", zimmer: "🚪", küche: "🍳", bad: "🛁",
  badezimmer: "🛁", schlafzimmer: "🛏️", wohnzimmer: "🛋️", balkon: "🪴", garten: "🏡",
  tisch: "🪑", stuhl: "🪑", bett: "🛏️", sofa: "🛋️", sessel: "🛋️",
  schrank: "🗄️", regal: "📚", lampe: "💡", tür: "🚪", fenster: "🪟",
  kühlschrank: "🧊", herd: "🍳", waschmaschine: "🫧", fernseher: "📺",
  spiegel: "🪞", teppich: "🧶", bild: "🖼️", staubsauger: "🧹", putzen: "🧽", müll: "🗑️",
  mietvertrag: "📑", nebenkosten: "💡", kaution: "💰", heizung: "♨️", reparieren: "🔧",
  hausverwaltung: "🏢", kaputt: "⚠️",

  // City, Places, Services & Government
  stadt: "🏙️", innenstadt: "🏙️", dorf: "🏘️", straße: "🛣️", platz: "🏛️", park: "🌳",
  brücke: "🌉", kirche: "⛪", museum: "🏛️", supermarkt: "🛒", geschäft: "🛍️",
  laden: "🛍️", bank: "🏦", geld: "💶", euro: "💶", post: "📮", brief: "✉️",
  briefmarke: "📮", paket: "📦", packstation: "📦", lieferung: "🚚", sendungsverfolgung: "📍",
  karte: "🗺️", schule: "🏫", universität: "🎓", vorlesung: "🎓", seminar: "📚",
  bibliothek: "📚", café: "☕", restaurant: "🍽️", bäckerei: "🥖", metzgerei: "🥩",
  kino: "🍿", theater: "🎭", rathaus: "🏛️", polizei: "👮", feuerwehr: "🚒",
  anmeldung: "📝", ummeldung: "🔄", ausweis: "🪪", formular: "📋", antrag: "📝",
  bescheinigung: "📜", frist: "⏳", unterlagen: "📁", note: "📝",

  // Environment & Recycling
  umwelt: "🌱", mülltrennung: "♻️", restmüll: "🗑️", altpapier: "📦", biotonne: "🍏",
  verpackung: "📦", energie: "⚡",

  // Nature, Animals & Weather
  hund: "🐕", katze: "🐈", vogel: "🐦", pferd: "🐎", kuh: "🐄", schwein: "🐖",
  schaf: "🐑", fisch: "🐟", maus: "🐁", bär: "🐻", elefant: "🐘", löwe: "🦁",
  baum: "🌳", blume: "🌸", pflanze: "🌱", wald: "🌲", sonne: "☀️",
  mond: "🌙", sterne: "⭐", wolke: "☁️", regen: "🌧️", regenschauer: "🌧️",
  schnee: "❄️", wind: "💨", gewitter: "⛈️", wetter: "🌤️", jahreszeit: "🍂",
  temperatur: "🌡️", warm: "🌡️", kalt: "🥶", frieren: "🥶",

  // Body, Health & Doctor
  kopf: "👤", auge: "👁️", ohr: "👂", nase: "👃", mund: "👄", zahn: "🦷",
  haar: "💇", hals: "🧣", brust: "🫁", bauch: "🫄", rücken: "🧍", hand: "✋",
  finger: "👆", arm: "💪", bein: "🦵", fuß: "🦶", herz: "❤️", arzt: "👨‍⚕️",
  hausarzt: "👨‍⚕️", ärztin: "👩‍⚕️", krankenhaus: "🏥", apotheke: "💊", medikament: "💊",
  tablette: "💊", pflaster: "🩹", fieber: "🤒", schmerzen: "🤕", krank: "🤒",
  gesund: "💪", versicherungskarte: "💳", beschwerden: "🩺", erkältung: "🤧",

  // Work, Careers & Applications
  arbeit: "💼", beruf: "💼", stelle: "💼", chef: "👔", büro: "🏢",
  lebenslauf: "📄", vorstellungsgespräch: "🤝", arbeitsvertrag: "📝", stundenlohn: "💶",
  schicht: "⏱️", teilzeit: "⏱️", vollzeit: "⏰", lehrer: "👨‍🏫", lehrerin: "👩‍🏫",
  student: "🎓", studentin: "🎓",

  // Tech, Media, Feelings & Expressions
  telefon: "☎️", handy: "📱", smartphone: "📱", computer: "💻", laptop: "💻",
  internet: "🌐", "e-mail": "📧", nachricht: "💬", wlan: "📶", empfang: "📶",
  aufladen: "🔋", zurückrufen: "📞", buch: "📖", zeitung: "📰",
  musik: "🎵", lied: "🎶", radio: "📻", film: "🎬", sport: "🏅",
  fußball: "⚽", tennis: "🎾", schwimmen: "🏊", laufen: "🏃", spielen: "🎮",
  tanzen: "💃", singen: "🎤", lesen: "📖", schreiben: "✍️", fotografieren: "📷",
  kamera: "📷", foto: "📸", party: "🎉", fest: "🥳", geburtstag: "🎂",
  geschenk: "🎁", einladung: "💌", spaziergang: "🚶",
  zufrieden: "😊", enttäuscht: "😞", nervös: "😰", aufgeregt: "🤩",
  problem: "⚠️", lösung: "💡", regel: "📜", vorschrift: "📜",

  // Core Greetings & Basics
  hallo: "👋", "guten morgen": "🌅", "guten tag": "☀️", "guten abend": "🌆",
  "gute nacht": "🌙", "auf wiedersehen": "🤝", tschüss: "👋", danke: "🙏",
  bitte: "🤲", entschuldigung: "🙇", willkommen: "✨", ja: "✅", nein: "❌",
  uhr: "⏰", zeit: "⏳", minute: "⏱️", stunde: "⏳", woche: "📅",
  monat: "🗓️", jahr: "📆", heute: "📍", gestern: "⏮️", morgen: "⏭️",
  rechtzeitig: "⏰", sofort: "⚡"
};

// Category metadata
export const TOPIC_CATEGORIES_A1 = {
  "Daily Life & Basics": [2, 3, 4, 6, 10, 11, 12, 42, 43],
  "People & Society": [5, 7, 8, 13, 14, 44],
  "Food & Dining": [17, 18, 21, 22],
  "Home, Living & Shopping": [15, 16, 19, 20, 40],
  "City, Travel & Transport": [23, 24, 25, 26, 27, 36, 37, 38, 41],
  "Health & Body": [29, 30],
  "Leisure, Media & Nature": [9, 28, 31, 32, 33, 34, 35, 39]
};

export const TOPIC_CATEGORIES_A2 = {
  "Daily Routine & Home": [1, 2, 19],
  "Shopping, Food & Money": [3, 4, 11],
  "Travel, Town & Transport": [5, 6],
  "Appointments & Time": [7],
  "Health & Medical": [8, 13],
  "Work & Education": [9, 10],
  "Tech, Post & Offices": [12, 20, 21],
  "Feelings, Social & Rules": [14, 15, 16, 17, 18, 22, 23]
};

// Topic emojis
export const TOPIC_EMOJIS_A1 = {
  2: "👋", 3: "🤝", 4: "📋", 5: "🌍", 6: "🔢", 7: "👨‍👩‍👧", 8: "👥", 9: "🎨",
  10: "⏰", 11: "📅", 12: "⏱️", 13: "💼", 14: "🎓", 15: "🏠", 16: "🛋️",
  17: "🍽️", 18: "🛒", 19: "👕", 20: "🛍️", 21: "🍕", 22: "🍳", 23: "🏙️",
  24: "🧭", 25: "🚆", 26: "✈️", 27: "🏨", 28: "🌤️", 29: "🩺", 30: "💊",
  31: "⚽", 32: "🎬", 33: "📱", 34: "🎂", 35: "🎟️", 36: "🏛️", 37: "✉️",
  38: "💶", 39: "🐾", 40: "🧹", 41: "🪧", 42: "🆘", 43: "❤️", 44: "✨"
};

export const TOPIC_EMOJIS_A2 = {
  1: "⏰", 2: "🏠", 3: "🛒", 4: "🍽️", 5: "🚆", 6: "🧭", 7: "📅", 8: "🩺",
  9: "💼", 10: "🎓", 11: "💶", 12: "📱", 13: "👕", 14: "🌤️", 15: "🎉",
  16: "💭", 17: "⚠️", 18: "📜", 19: "♻️", 20: "📦", 21: "🏛️", 22: "🗣️", 23: "🔗"
};

function getCategoryForTopic(topicNum, level = "A1") {
  const map = level === "A2" ? TOPIC_CATEGORIES_A2 : TOPIC_CATEGORIES_A1;
  for (const [catName, topicNums] of Object.entries(map)) {
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

function getVisualEmoji(german = "", english = "", topicNum = 1, level = "A1") {
  const de = german.toLowerCase();
  const en = english.toLowerCase();

  // Try direct keyword lookup in WORD_EMOJIS
  for (const [key, emoji] of Object.entries(WORD_EMOJIS)) {
    if (de.includes(key) || en.includes(key)) {
      return emoji;
    }
  }

  // Fallback to topic emoji
  const topicMap = level === "A2" ? TOPIC_EMOJIS_A2 : TOPIC_EMOJIS_A1;
  return topicMap[topicNum] || (level === "A2" ? "📘" : "📖");
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

function processVocabDataset(data, level = "A1") {
  const allWords = [];
  const levelPrefix = level.toLowerCase();

  // Index synonym groups if available (A2)
  const synonymMap = {};
  if (Array.isArray(data.synonym_groups)) {
    for (const sg of data.synonym_groups) {
      synonymMap[sg.id] = sg;
    }
  }

  const topics = (data.topics || []).map((t) => {
    const topicNum = t.number;
    const topicTitle = t.title;
    const category = getCategoryForTopic(topicNum, level);
    const topicMap = level === "A2" ? TOPIC_EMOJIS_A2 : TOPIC_EMOJIS_A1;
    const topicEmoji = topicMap[topicNum] || (level === "A2" ? "📘" : "📖");

    const vocabList = (t.vocabulary || []).map((v, idx) => {
      const article = extractArticle(v.german, v.article);
      const clean = cleanGermanWord(v.german);
      const plural = extractPlural(v.german);
      const emoji = getVisualEmoji(v.german, v.english, topicNum, level);

      // Core base word without article for comparison
      let baseWord = clean;
      if (article && clean.toLowerCase().startsWith(article + " ")) {
        baseWord = clean.slice(article.length + 1).trim();
      }

      // Check for synonym info (A2)
      let synonymInfo = null;
      if (Array.isArray(v.synonym_groups) && v.synonym_groups.length > 0) {
        const found = synonymMap[v.synonym_groups[0]];
        if (found) {
          const otherWords = (found.words || []).filter(
            (w) => w.toLowerCase() !== v.german.toLowerCase() && w.toLowerCase() !== clean.toLowerCase()
          );
          synonymInfo = {
            meaning: found.meaning,
            otherWords,
            note: found.note,
          };
        }
      }

      const wordItem = {
        id: `${levelPrefix}-t${topicNum}-w${idx}`,
        level,
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
        wordTypeLabel: v.word_type_label || (v.word_type ? v.word_type.charAt(0).toUpperCase() + v.word_type.slice(1) : "Word"),
        article,
        gender: v.gender || (article === "der" ? "masculine" : article === "die" ? "feminine" : article === "das" ? "neuter" : null),
        visualEmoji: emoji,
        iconName: v.icon || "text",
        synonymInfo,
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

  return {
    title: data.title || `German ${level} Vocabulary`,
    language: data.language || "German",
    level,
    description: data.description || (
      level === "A2"
        ? "Essential A2 everyday vocabulary unique compared with A1 across 23 topics."
        : "Essential A1 vocabulary organized by 43 topics with visual icons and active recall hints."
    ),
    topicCount: topics.length,
    totalWords: allWords.length,
    topics,
    allWords,
    synonymGroups: data.synonym_groups || [],
  };
}

let cachedA1 = null;
let cachedA2 = null;

export function getVocabData(level = "A1") {
  const normLevel = String(level).toUpperCase();
  if (normLevel === "A2") {
    if (!cachedA2) cachedA2 = processVocabDataset(rawA2VocabData, "A2");
    return cachedA2;
  }
  if (!cachedA1) cachedA1 = processVocabDataset(rawA1VocabData, "A1");
  return cachedA1;
}

export function getAllVocabData() {
  return {
    A1: getVocabData("A1"),
    A2: getVocabData("A2"),
  };
}
