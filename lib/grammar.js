import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export const LEVELS = [
  {
    id: "A1",
    number: 1,
    name: "Beginner Foundations",
    shortName: "Foundations",
    description:
      "Core articles, pronouns, verbs (sein & haben), Nominativ & Akkusativ cases, and basic sentence building blocks.",
  },
  {
    id: "A2",
    number: 2,
    name: "Elementary Expression",
    shortName: "Elementary",
    description:
      "Conversational past tense (Perfekt), two-way spatial prepositions, and everyday communication structures.",
  },
  {
    id: "B1",
    number: 3,
    name: "Intermediate Mastery",
    shortName: "Intermediate",
    description:
      "Subordinate clauses (Nebensätze), process passive voice (Vorgangspassiv), and connected discourse.",
  },
];

function stripMarkdown(str = "") {
  return String(str).replace(/\*\*|\*/g, "");
}

// Safely parses a .json file even if it contains Python wrapper code
function safeParseJsonFile(rawContent, filePath) {
  const trimmed = rawContent.trim();
  try {
    return JSON.parse(trimmed);
  } catch (firstErr) {
    // 1. Try regex to extract `data = { ... }` up to the matching closing bracket
    const match = trimmed.match(/data\s*=\s*(\{[\s\S]*?\n\})/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch {}
    }

    // 2. Try slicing from first `{` to occurrences of `\n}`
    const firstBrace = trimmed.indexOf("{");
    if (firstBrace !== -1) {
      const candidates = [];
      let pos = trimmed.indexOf("\n}", firstBrace);
      while (pos !== -1) {
        candidates.push(pos + 2);
        pos = trimmed.indexOf("\n}", pos + 1);
      }
      for (let i = candidates.length - 1; i >= 0; i--) {
        const candidate = trimmed.slice(firstBrace, candidates[i]);
        try {
          return JSON.parse(candidate);
        } catch {}
      }
    }
    console.error(`Failed to parse JSON in ${filePath}:`, firstErr.message);
    return null;
  }
}

function normalizeTopic(parsed, fileName, levelMeta, stat) {
  const slug = fileName.replace(/\.json$/i, "");

  const displayTitle = parsed.german_title || parsed.title || slug;
  const displayTitleEn = parsed.german_title
    ? parsed.title || parsed.titleEn || ""
    : parsed.titleEn || "";

  // Summary & Definition
  const summary =
    parsed.summary ||
    (typeof parsed.definition === "string"
      ? parsed.definition
      : parsed.definition?.english || "") ||
    parsed.purpose ||
    "";

  let definitionExamples = [];
  if (parsed.definition) {
    if (Array.isArray(parsed.definition.examples)) {
      definitionExamples = parsed.definition.examples.map((ex) => ({
        de: ex.german || ex.de || "",
        en: ex.english || ex.en || "",
        verb: ex.verb || "",
      }));
    } else if (parsed.definition.example) {
      definitionExamples = [
        {
          de: parsed.definition.example.german || parsed.definition.example.de || "",
          en: parsed.definition.example.english || parsed.definition.example.en || "",
        },
      ];
    }
  }
  if (definitionExamples.length === 0 && Array.isArray(parsed.definition_examples)) {
    definitionExamples = parsed.definition_examples.map((ex) => ({
      de: ex.german || ex.de || "",
      en: ex.english || ex.en || "",
      verb: ex.verb || "",
    }));
  }

  // Conjugation tables & unified main table
  let table = parsed.table || null;
  let conjugationTables = null;
  if (parsed.conjugation && typeof parsed.conjugation === "object") {
    conjugationTables = Object.entries(parsed.conjugation).map(([verb, list]) => ({
      verb,
      headers: ["Pronoun", `Form (${verb})`, "Example Sentence", "English"],
      rows: Array.isArray(list)
        ? list.map((item) => [
            item.pronoun || "",
            `**${item.form || ""}**`,
            item.example || "",
            item.english || "",
          ])
        : [],
    }));

    if (!table) {
      const allPronouns = new Set();
      Object.values(parsed.conjugation).forEach((arr) => {
        if (Array.isArray(arr)) arr.forEach((x) => x.pronoun && allPronouns.add(x.pronoun));
      });
      const verbs = Object.keys(parsed.conjugation);
      const headers = ["Pronoun", ...verbs.map((v) => `Form (${v})`)];
      const rows = Array.from(allPronouns).map((pronoun) => {
        const row = [pronoun];
        verbs.forEach((v) => {
          const found = (parsed.conjugation[v] || []).find((x) => x.pronoun === pronoun);
          row.push(found ? `**${found.form}**` : "—");
        });
        return row;
      });
      table = { headers, rows };
    }
  } else if (!table && Array.isArray(parsed.pronouns) && parsed.pronouns.length > 0) {
    table = {
      headers: ["Person", "Pronoun (German)", "English", "Usage"],
      rows: parsed.pronouns.map((p) => [
        p.person || "",
        `**${p.german || ""}**`,
        p.english || "",
        p.usage || "",
      ]),
    };
  }

  // Conjugation rule (steps + standard endings e.g. Topic 1.3)
  const conjugationRule = parsed.conjugation_rule || null;
  if (!table && conjugationRule && Array.isArray(conjugationRule.endings)) {
    table = {
      headers: ["Subject Pronoun", "Present Ending", "Stem + Ending Example"],
      rows: conjugationRule.endings.map((e) => [
        e.pronoun || "",
        `**${e.ending || ""}**`,
        e.example || "",
      ]),
    };
  }

  // Conjugation examples (verbs with 6 forms and sample sentences e.g. Topic 1.3)
  const conjugationExamples = Array.isArray(parsed.conjugation_examples)
    ? parsed.conjugation_examples
    : null;
  if (!conjugationTables && conjugationExamples) {
    conjugationTables = conjugationExamples.map((ce) => ({
      verb: `${ce.infinitive}${ce.english ? ` (${ce.english})` : ""}`,
      headers: ["Pronoun", "Conjugated Form"],
      rows: (ce.forms || []).map((f) => [f.pronoun || "", `**${f.form || ""}**`]),
      sentences: (ce.sentences || []).map((s) => ({
        de: s.german || s.de || "",
        en: s.english || s.en || "",
      })),
    }));
  }

  // Spelling Rules (e.g. verbs ending in -d/-t or -s/-z/-ß in Topic 1.3)
  const spellingRules = Array.isArray(parsed.spelling_rules)
    ? parsed.spelling_rules.map((sr) => ({
        title: sr.title || "",
        rule: sr.rule || "",
        examples: Array.isArray(sr.examples)
          ? sr.examples.map((ex) => ({
              infinitive: ex.infinitive || "",
              de: ex.german || ex.de || "",
              en: ex.english || ex.en || "",
            }))
          : [],
      }))
    : [];

  // Common Regular Verbs list (Topic 1.3)
  const commonRegularVerbs = Array.isArray(parsed.common_regular_verbs)
    ? parsed.common_regular_verbs.map((crv) => ({
        infinitive: crv.infinitive || "",
        english: crv.english || "",
      }))
    : [];

  // Important Rule box (Topic 1.4: du and er/sie/es vowel shift rule)
  const importantRule = parsed.important_rule || null;

  // Verb Groups (Topic 1.4: Core irregulars, e->i, e->ie, a->ä, au->äu)
  const verbGroups = Array.isArray(parsed.verb_groups)
    ? parsed.verb_groups.map((vg) => ({
        group: vg.group || "",
        rule: vg.rule || "",
        verbs: Array.isArray(vg.verbs)
          ? vg.verbs.map((v) => ({
              infinitive: v.infinitive || "",
              english: v.english || "",
              forms: Array.isArray(v.forms) ? v.forms : [],
              example: v.example
                ? {
                    de: v.example.german || v.example.de || "",
                    en: v.example.english || v.example.en || "",
                  }
                : null,
            }))
          : [],
      }))
    : [];

  // Synthesize bird-eye overview table for irregular verbs if no table yet
  if (!table && verbGroups.length > 0) {
    const summaryRows = [];
    verbGroups.forEach((g) => {
      g.verbs.forEach((v) => {
        const duForm = (v.forms || []).find((f) => f.pronoun === "du")?.form || "—";
        const erForm = (v.forms || []).find((f) => f.pronoun === "er/sie/es")?.form || "—";
        summaryRows.push([
          `**${v.infinitive}**`,
          v.english || "",
          g.group.replace(/ vowel change/i, "").replace(/Core irregular verbs/i, "Core Irregular"),
          `**${duForm}**`,
          `**${erForm}**`,
        ]);
      });
    });
    if (summaryRows.length > 0) {
      table = {
        headers: [
          "Infinitive",
          "English",
          "Pattern / Category",
          "du (2nd Sing.)",
          "er/sie/es (3rd Sing.)",
        ],
        rows: summaryRows,
      };
    }
  }

  // Definite Articles Overview Table (Topic 1.5)
  if (!table && ((slug.includes("definite_articles") && !slug.includes("indefinite")) || parsed.german_title === "Bestimmte Artikel")) {
    table = {
      headers: ["Gender / Number", "Definite Article", "German Example", "English Meaning"],
      rows: [
        ["Masculine (maskulin)", "**der**", "der Mann, der Tisch", "the man, the table"],
        ["Feminine (feminin)", "**die**", "die Frau, die Lampe", "the woman, the lamp"],
        ["Neuter (neutral)", "**das**", "das Kind, das Buch", "the child, the book"],
        ["Plural (alle Genera)", "**die**", "die Kinder, die Bücher", "the children, the books"],
      ],
    };
  }

  // Indefinite Articles Overview Table (Topic 1.6)
  if (!table && parsed.comparison && Array.isArray(parsed.comparison.nominative_forms)) {
    table = {
      headers: ["Gender / Number", "Definite (the)", "Indefinite (a / an)", "Transformation Example"],
      rows: parsed.comparison.nominative_forms.map((nf) => [
        nf.gender || "",
        `**${nf.definite || ""}**`,
        `**${nf.indefinite || ""}**`,
        nf.example || "",
      ]),
    };
  }

  // Topic 1.7: Noun Gender and Plural Overview Table
  if (!table && (slug.includes("noun_gender") || parsed.german_title === "Nomen: Genus und Plural")) {
    table = {
      headers: ["Plural Suffix / Pattern", "Transformation Example", "Typical Gender Clues & Notes"],
      rows: [
        ["-(e)n", "**die Frau → die Frauen**", "~90% of feminine nouns, nouns in -ung, -heit, -keit, -schaft"],
        ["-e (often with Umlaut)", "**der Tisch → die Tische**", "Common for masculine & neuter nouns (der Stuhl → die Stühle)"],
        ["-er (usually with Umlaut)", "**das Kind → die Kinder**", "Mostly neuter nouns (das Buch → die Bücher, das Bild → die Bilder)"],
        ["-s", "**das Auto → die Autos**", "Foreign words, abbreviations, and nouns ending in full vowels"],
        ["no ending (sometimes Umlaut)", "**der Lehrer → die Lehrer**", "Masculine/neuter nouns ending in -el, -en, -er (der Apfel → die Äpfel)"],
      ],
    };
  }

  // Topic 1.8: Possessive Articles Overview Table (Nominative Matrix)
  if (!table && (slug.includes("possessive") || parsed.german_title === "Possessivartikel")) {
    table = {
      headers: ["Pronoun (Owner)", "Masculine (der)", "Feminine (die)", "Neuter (das)", "Plural (die)"],
      rows: [
        ["ich (I)", "**mein** Vater", "**meine** Mutter", "**mein** Kind", "**meine** Freunde"],
        ["du (you, informal)", "**dein** Vater", "**deine** Mutter", "**dein** Kind", "**deine** Freunde"],
        ["er / es (he / it)", "**sein** Vater", "**seine** Mutter", "**sein** Kind", "**seine** Freunde"],
        ["sie (she)", "**ihr** Vater", "**ihre** Mutter", "**ihr** Kind", "**ihre** Freunde"],
        ["wir (we)", "**unser** Vater", "**unsere** Mutter", "**unser** Kind", "**unsere** Freunde"],
        ["ihr (you all)", "**euer** Vater", "**eure** Mutter", "**euer** Kind", "**eure** Freunde"],
        ["sie / Sie (they / Formal)", "**ihr / Ihr** Vater", "**ihre / Ihre** Mutter", "**ihr / Ihr** Kind", "**ihre / Ihre** Freunde"],
      ],
    };
  }

  // Topic 1.9: Negation nicht und kein
  if (!table && (slug.includes("nicht_and_kein") || parsed.german_title === "Negation: nicht und kein")) {
    table = {
      headers: ["Negation Element", "What It Negates", "German Example", "English Translation"],
      rows: [
        ["**kein / keine**", "Nouns with ein/eine or no article", "Ich habe **kein** Auto.", "I don't have a car."],
        ["**nicht**", "Verbs (actions)", "Ich arbeite heute **nicht**.", "I am not working today."],
        ["**nicht**", "Adjectives & Adverbs", "Das ist **nicht** teuer.", "That is not expensive."],
        ["**nicht**", "Specific / possessive nouns", "Das ist **nicht mein** Hund.", "That is not my dog."],
        ["**nicht ..., sondern ...**", "Contrastive elements", "**Nicht** heute, **sondern** morgen.", "Not today, but tomorrow."],
      ],
    };
  }

  // Topic 1.10: W-Questions
  if (!table && (slug.includes("w_questions") || parsed.german_title === "W-Fragen")) {
    table = {
      headers: ["Question Word", "English Meaning", "Function / Asks About", "German Example Sentence"],
      rows: [
        ["**Wer**", "who", "Person (subject)", "Wer ist das? (Who is that?)"],
        ["**Was**", "what", "Thing / Action", "Was machst du? (What are you doing?)"],
        ["**Wo**", "where", "Location (stationary)", "Wo wohnst du? (Where do you live?)"],
        ["**Wohin**", "where to", "Destination (direction)", "Wohin fährst du? (Where are you going?)"],
        ["**Woher**", "where from", "Origin (source)", "Woher kommst du? (Where are you from?)"],
        ["**Wann**", "when", "Time / Schedule", "Wann beginnt der Kurs? (When does the course begin?)"],
        ["**Warum**", "why", "Reason / Cause", "Warum lernst du Deutsch? (Why are you learning German?)"],
        ["**Wie**", "how", "Manner / Condition", "Wie geht es dir? (How are you?)"],
        ["**Wie viel**", "how much", "Price / Quantity", "Wie viel kostet das? (How much does that cost?)"],
        ["**Wie lange**", "how long", "Duration of time", "Wie lange bleibst du? (How long are you staying?)"],
        ["**Welcher**", "which", "Specific selection", "Welcher Bus fährt zum Bahnhof? (Which bus goes?)"],
      ],
    };
  }

  // Topic 1.11: Yes/No Questions
  if (!table && (slug.includes("yes_no") || parsed.german_title === "Ja-/Nein-Fragen")) {
    table = {
      headers: ["Context / Question Type", "Position 1 (First)", "Position 2 (Second)", "Position 3 / Rest", "Example Sentence"],
      rows: [
        ["Yes/No Question", "**Verb (conjugated)**", "Subject", "Complement / Object", "**Kommst** du heute?"],
        ["Answering (Ja)", "**Ja,**", "Subject", "Verb + Complement", "Ja, ich **komme**."],
        ["Answering (Nein)", "**Nein,**", "Subject", "Verb + Negation", "Nein, ich **komme nicht**."],
        ["Answering (Doch)", "**Doch!**", "Subject", "Verb (affirming negative)", "Doch, ich **komme**!"],
        ["With Modal Verb", "**Modal Verb**", "Subject", "Object ... **Infinitive**", "**Kannst** du heute **kommen**?"],
        ["With Separable Verb", "**Verb Stem**", "Subject", "Object ... **Prefix**", "**Kommst** du **mit**?"],
      ],
    };
  }

  // Topic 1.12: Sentence Structure (Satzbau)
  if (!table && (slug.includes("sentence_structure") || parsed.german_title === "Satzbau")) {
    table = {
      headers: ["Sentence Pattern", "Position 1", "Position 2 (Verb!)", "Position 3", "End Position (Satzende)", "Complete German Example"],
      rows: [
        ["Standard Statement", "Subject (*Ich*)", "**lerne**", "Time (*heute*)", "Object (*Deutsch*)", "Ich **lerne** heute Deutsch."],
        ["Time Element First", "Time (*Heute*)", "**lerne**", "Subject (*ich*)", "Object (*Deutsch*)", "Heute **lerne** ich Deutsch."],
        ["Yes/No Question", "**Lernst** (Verb)", "Subject (*du*)", "Time (*heute*)", "Object (*Deutsch?*)", "**Lernst** du heute Deutsch?"],
        ["W-Question", "W-Word (*Wann*)", "**lernst**", "Subject (*du*)", "Object (*Deutsch?*)", "Wann **lernst** du Deutsch?"],
        ["With Modal Verb", "Subject (*Ich*)", "**kann** (Modal)", "Time / Object", "**lernen** (Infinitive)", "Ich **kann** heute Deutsch **lernen**."],
      ],
    };
  }

  // Topic 1.13: Main Clauses and Verb Position
  if (!table && (slug.includes("main_clauses") || parsed.german_title === "Hauptsätze und Verbposition")) {
    table = {
      headers: ["Clause Pattern", "Position 0 (Conjunction)", "Position 1 (First Element)", "Position 2 (Conjugated Verb)", "Sentence Bracket (End)"],
      rows: [
        ["Subject First", "—", "Subject (*Ich*)", "**wohne**", "in Berlin."],
        ["Adverb / Time First", "—", "Time (*Morgen*)", "**fahre**", "ich nach Berlin."],
        ["ADUSO Conjunction (und)", "**und** (Pos. 0)", "Subject (*er*)", "**arbeitet**", "bei Siemens."],
        ["ADUSO Conjunction (aber)", "**aber** (Pos. 0)", "Subject (*ich*)", "**habe**", "keine Zeit."],
        ["Sentence Bracket (Klammer)", "—", "Subject (*Ich*)", "**muss** (Modal)", "morgen **arbeiten** (Inf.)."],
      ],
    };
  }

  // Topic 1.14: Modal Verbs Matrix Table
  if (!table && (slug.includes("modal_verbs") || parsed.german_title === "Modalverben")) {
    if (parsed.comparison && Array.isArray(parsed.comparison.conjugation)) {
      table = {
        headers: ["Modal Verb", "English Meaning", "ich", "du", "er / sie / es", "wir / sie / Sie", "ihr"],
        rows: parsed.comparison.conjugation.map((c) => {
          const meanings = {
            können: "can / to be able to",
            müssen: "must / to have to",
            wollen: "to want to",
            dürfen: "may / to be allowed to",
            sollen: "should / to be supposed to",
            mögen: "to like",
            möchten: "would like to",
          };
          return [
            `**${c.verb}**`,
            meanings[c.verb] || "",
            `**${c.ich}**`,
            `**${c.du}**`,
            `**${c.er_sie_es}**`,
            c.wir || c.verb,
            c.ihr,
          ];
        }),
      };
    }
  }

  // Topic 1.15: Separable Verbs Table
  if (!table && (slug.includes("separable_verbs") || parsed.german_title === "Trennbare Verben")) {
    table = {
      headers: ["Sentence Context", "Position 1", "Position 2 (Verb)", "Middle Element", "End Position (Satzende)"],
      rows: [
        ["Simple Present Main Clause", "Subject (*Ich*)", "**stehe** (Stem)", "jeden Morgen um 7 Uhr", "**auf**. (Prefix)"],
        ["With Object Complement", "Subject (*Er*)", "**ruft** (Stem)", "seine Mutter", "**an**. (Prefix)"],
        ["Yes/No Question", "**Machst** (Stem)", "Subject (*du*)", "bitte das Fenster", "**zu**? (Prefix)"],
        ["W-Question", "W-Word (*Wann*)", "**fährt** (Stem)", "der Zug", "**ab**? (Prefix)"],
        ["With Modal Verb", "Subject (*Ich*)", "**muss** (Modal)", "morgen früh", "**aufstehen**. (Together at End)"],
      ],
    };
  }

  // Topic 1.16: Imperative Sentences Table
  if (!table && (slug.includes("imperative") || parsed.german_title === "Imperativ")) {
    table = {
      headers: ["Target Person / Form of Address", "Formation Rule", "Standard (kommen)", "Stem-Change (sprechen)", "Irregular (sein)"],
      rows: [
        ["**du** (informal singular)", "Verb stem (omit -st & pronoun du)", "**Komm!**", "**Sprich!** (e → i)", "**Sei!**"],
        ["**ihr** (informal plural)", "Present ihr form (omit pronoun ihr)", "**Kommt!**", "**Sprecht!** (regular)", "**Seid!**"],
        ["**Sie** (formal singular & plural)", "Infinitive + Sie (inverted)", "**Kommen Sie!**", "**Sprechen Sie!**", "**Seien Sie!**"],
        ["**wir** (Let's ... suggestion)", "Infinitive + wir (inverted)", "**Gehen wir!**", "**Sprechen wir!**", "**Seien wir!**"],
      ],
    };
  }

  // Topic 1.17: Accusative Case Article Changes Table
  if (!table && parsed.comparison && Array.isArray(parsed.comparison.article_changes)) {
    table = {
      headers: ["Gender / Number", "Nominative (Subject)", "Accusative (Direct Object)", "Example Sentence Pair"],
      rows: parsed.comparison.article_changes.map((ac) => [
        ac.gender,
        ac.nominative,
        `**${ac.accusative}**`,
        ac.example,
      ]),
    };
  }

  // Topic 1.18: Dative Basics Table (Definite & Indefinite)
  if (!table && parsed.comparison && Array.isArray(parsed.comparison.definite_articles)) {
    table = {
      headers: ["Gender / Number", "Definite Dative", "Indefinite Dative", "Dative Example"],
      rows: parsed.comparison.definite_articles.map((da, i) => {
        const ia = (parsed.comparison.indefinite_articles || [])[i] || {};
        return [
          da.gender,
          `**${da.dative}** (Nom: ${da.nominative})`,
          `**${ia.dative || ""}** (Nom: ${ia.nominative || ""})`,
          da.example,
        ];
      }),
    };
  }

  // Topic 1.19: Nominative Case Articles Table
  if (!table && parsed.comparison && Array.isArray(parsed.comparison.articles)) {
    table = {
      headers: ["Gender / Number", "Definite Article", "Indefinite Article", "Negative (kein-)", "Nominative Example"],
      rows: parsed.comparison.articles.map((a) => [
        a.gender,
        `**${a.definite}**`,
        `**${a.indefinite}**`,
        `**${a.negative}**`,
        a.example,
      ]),
    };
  }

  // Topic 1.20: Accusative and Dative Pronouns Table
  if (!table && parsed.comparison && Array.isArray(parsed.comparison.pronoun_table)) {
    table = {
      headers: ["Person / Pronoun", "Accusative (Akkusativ)", "Dative (Dativ)", "Memory Clue"],
      rows: parsed.comparison.pronoun_table.map((p) => {
        let clue = "";
        if (p.person === "ich") clue = "mich (Akk) vs. mir (Dat)";
        else if (p.person === "du") clue = "dich (Akk) vs. dir (Dat)";
        else if (p.person === "wir" || p.person === "ihr") clue = "Identical form in Akk and Dat";
        else if (p.person.includes("sie / Sie")) clue = "Capitalized Ihnen for formal address";
        else clue = "Pronoun ending mirrors der/dem or das/dem";
        return [`**${p.person}**`, `**${p.accusative}**`, `**${p.dative}**`, clue];
      }),
    };
  }

  // Topic 1.21: Prepositions of Place (Two-Way Prepositions)
  if (!table && parsed.comparison && parsed.comparison.two_way_rule) {
    table = {
      headers: ["Question / Action", "Grammar Case", "Explanation & Meaning", "Example Sentence"],
      rows: [
        ["Wo? (Position / Rest)", "**Dativ**", "Static location where an object is located", "Das Glas steht **auf dem Tisch**."],
        ["Wohin? (Direction / Movement)", "**Akkusativ**", "Movement toward a new location / destination", "Ich stelle das Glas **auf den Tisch**."],
        ["9 Two-Way Prepositions (Wechselpräpositionen)", "**Akkusativ or Dativ**", "Choice strictly depends on *Wo?* vs *Wohin?*", (parsed.comparison.two_way_prepositions || []).join(", ")],
      ],
    };
  }

  // Topic 1.22: Prepositions of Time Quick Reference Table
  if (!table && parsed.comparison && Array.isArray(parsed.comparison.quick_reference)) {
    table = {
      headers: ["Temporal Preposition", "When to Use", "German Example", "English Meaning"],
      rows: parsed.comparison.quick_reference.map((qr) => [
        `**${qr.preposition}**`,
        qr.use,
        `**${qr.example}**`,
        qr.preposition === "am" ? "on Tuesday" :
        qr.preposition === "um" ? "at eight o'clock" :
        qr.preposition === "im" ? "in October; in winter" :
        qr.preposition.includes("von") ? "from 9 to 5" :
        qr.preposition === "ab" ? "starting tomorrow" :
        qr.preposition === "seit" ? "for a year" : "before class; after work",
      ]),
    };
  }

  // Topic 1.23: Accusative & Dative Prepositions
  if (!table && parsed.comparison && Array.isArray(parsed.comparison.accusative) && Array.isArray(parsed.comparison.dative)) {
    table = {
      headers: ["Preposition Category", "Case Required", "Prepositions Included", "Key Rule / Mnemonic"],
      rows: [
        ["Accusative Only", "**Akkusativ**", `**${parsed.comparison.accusative.join(", ")}**`, "Mnemonic: DOGFU — always takes accusative"],
        ["Dative Only", "**Dativ**", `**${parsed.comparison.dative.join(", ")}**`, "Always takes dative regardless of direction"],
        ["Two-Way (Wechsel)", "**Akkusativ or Dativ**", `**${(parsed.comparison.two_way || []).join(", ")}**`, "Wohin? (Destination) → Akkusativ | Wo? (Location) → Dativ"],
      ],
    };
  }

  // Topic 1.24: Conjunctions Table
  if (!table && parsed.comparison && Array.isArray(parsed.comparison.normal_word_order)) {
    table = {
      headers: ["Conjunction Category", "Conjunctions", "Verb Position", "German Example Sentence"],
      rows: [
        ["Coordinating (ADUSO / Position 0)", `**${parsed.comparison.normal_word_order.join(", ")}**`, "Position 2 (normal statement order)", "Ich lerne Deutsch, **denn** ich wohne in Deutschland."],
        ["Subordinating (Position End)", `**${(parsed.comparison.verb_at_end || []).join(", ")}**`, "Verb kicked to the very end of clause", "Ich lerne Deutsch, **weil** ich in Deutschland **wohne**."],
        ["Adverbial Connector (Position 1)", `**${(parsed.comparison.verb_second_after_adverb || []).join(", ")}**`, "Verb immediately follows (Position 2 inversion)", "Ich wohne in Deutschland, **deshalb lerne** ich Deutsch."],
      ],
    };
  }

  // Topic 1.25: Adjectives and Descriptions
  if (!table && parsed.comparison && parsed.comparison.after_sein && parsed.comparison.before_noun) {
    table = {
      headers: ["Adjective Position", "Syntactic Function", "Ending Rule", "German Example", "English Meaning"],
      rows: [
        ["Predicative (after sein / werden / bleiben)", "Predicate adjective", "**No ending added** (base form)", "Das Zimmer ist **sauber**.", "The room is clean."],
        ["Attributive (directly before a noun)", "Noun modifier", "**Adds adjective ending** (-es, -e, -er, -en)", "Das ist ein **sauberes** Zimmer.", "That is a clean room."],
      ],
    };
  }

  // Topic 1.26: Demonstrative Articles
  if (!table && parsed.comparison && Array.isArray(parsed.comparison.nominative) && Array.isArray(parsed.comparison.accusative)) {
    table = {
      headers: ["Gender / Number", "Nominative Form", "Accusative Form", "Signal Ending Rule"],
      rows: parsed.comparison.nominative.map((nom, i) => {
        const akk = parsed.comparison.accusative[i] || {};
        return [
          nom.gender,
          `**${nom.form}**`,
          `**${akk.form || ""}**`,
          nom.gender === "Masculine" ? "dies- + **-er** (Nom) → **-en** (Akk)" :
          nom.gender === "Feminine" ? "dies- + **-e** (unchanged)" :
          nom.gender === "Neuter" ? "dies- + **-es** (unchanged)" : "dies- + **-e** (unchanged)",
        ];
      }),
    };
  }

  // Topic 1.27: Time Expressions and Clock Times
  if (!table && parsed.comparison && parsed.comparison.formal && parsed.comparison.informal) {
    table = {
      headers: ["Time Style", "Structure & Usage", "German Example", "English Meaning"],
      rows: [
        ["Official / Formal (24h)", "Hour + **Uhr** + Minutes (news, train stations, work)", "Es ist **siebzehn Uhr fünfundvierzig**.", "It is 17:45."],
        ["Everyday / Informal (12h)", "Minutes + **vor / nach / halb** + Hour (conversational)", "Es ist **Viertel vor sechs**.", "It is a quarter to six (5:45)."],
      ],
    };
  }

  // Topic 1.28: Dates and Ordinal Numbers
  if (!table && parsed.comparison && parsed.comparison.written_date && parsed.comparison.spoken_date) {
    table = {
      headers: ["Date Expression", "Grammar Rule & Suffix", "German Example", "Pronunciation / Meaning"],
      rows: [
        ["Written Date", "Day.Month.Year (dots represent ordinal numbers)", parsed.comparison.written_date, "22nd of October, 2026"],
        ["Nominative Date (der)", "**der** + stem + **-te** (1-19) / **-ste** (20+)", `**${parsed.comparison.spoken_date}**`, "the twenty-second of October"],
        ["Dative Date (am)", "**am** + stem + **-ten** (1-19) / **-sten** (20+)", `**${parsed.comparison.with_am || ""}**`, "on the twenty-second of October"],
      ],
    };
  }

  // Topic 1.29: Frequency Words
  if (!table && parsed.comparison && Array.isArray(parsed.comparison.frequency_scale)) {
    const scaleDetails = {
      "immer": { pct: "100%", en: "always", ex: "Ich trinke **immer** Kaffee am Morgen." },
      "fast immer": { pct: "90%", en: "almost always", ex: "Er kommt **fast immer** pünktlich." },
      "oft / häufig": { pct: "70%", en: "often / frequently", ex: "Wir kochen **oft** zusammen." },
      "manchmal": { pct: "50%", en: "sometimes", ex: "Ich gehe **manchmal** ins Museum." },
      "selten": { pct: "20%", en: "rarely / seldom", ex: "Sie isst **selten** Fast Food." },
      "fast nie": { pct: "5%", en: "almost never", ex: "Wir sehen **fast nie** fern." },
      "nie": { pct: "0%", en: "never", ex: "Er raucht **nie**." },
    };
    table = {
      headers: ["Frequency %", "German Adverb", "English Meaning", "German Example Sentence"],
      rows: parsed.comparison.frequency_scale.map((word) => {
        const item = scaleDetails[word] || { pct: "—", en: "", ex: "" };
        return [item.pct, `**${word}**`, item.en, item.ex];
      }),
    };
  }

  // Topic 1.30: Comparatives
  if (!table && parsed.comparison && Array.isArray(parsed.comparison.base_comparative)) {
    table = {
      headers: ["Base Form (Positiv)", "Comparative Form (Komparativ)", "Formation Pattern", "Example Sentence"],
      rows: parsed.comparison.base_comparative.map((bc) => [
        `**${bc.base}**`,
        `**${bc.comparative}**`,
        bc.base === "gut" || bc.base === "viel" || bc.base === "gern" ? "Irregular stem change" :
        bc.base === "alt" ? "Adds Umlaut (a → ä) + -er" : "Regular stem + -er",
        `Das neue Modell ist **${bc.comparative}** als das alte.`,
      ]),
    };
  }

  // Topic 1.31: Everyday Activities in Present Tense
  if (!table && parsed.comparison && Array.isArray(parsed.comparison.useful_verbs)) {
    const verbData = {
      "aufstehen": { type: "Separable", ich: "stehe auf", er: "steht auf", ex: "Ich **stehe** um 7 Uhr **auf**." },
      "duschen": { type: "Regular", ich: "dusche", er: "duscht", ex: "Er **duscht** jeden Morgen." },
      "frühstücken": { type: "Regular", ich: "frühstücke", er: "frühstückt", ex: "Wir **frühstücken** um 8 Uhr." },
      "fahren": { type: "Stem-changing (a→ä)", ich: "fahre", er: "fährt", ex: "Sie **fährt** mit dem Bus zur Arbeit." },
      "arbeiten": { type: "Stem in -t (+e-)", ich: "arbeite", er: "arbeitet", ex: "Ich **arbeite** von 9 bis 17 Uhr." },
      "kochen": { type: "Regular", ich: "koche", er: "kocht", ex: "Am Abend **koche** ich das Essen." },
      "einkaufen": { type: "Separable", ich: "kaufe ein", er: "kauft ein", ex: "Er **kauft** im Supermarkt **ein**." },
      "fernsehen": { type: "Separable (e→ie)", ich: "sehe fern", er: "sieht fern", ex: "Wir **sehen** am Abend **fern**." },
      "schlafen": { type: "Stem-changing (a→ä)", ich: "schlafe", er: "schläft", ex: "Das Kind **schläft** 8 Stunden." },
      "treffen": { type: "Stem-changing (e→i)", ich: "treffe", er: "trifft", ex: "Ich **treffe** meine Freunde." },
      "ins Bett gehen": { type: "Phrase", ich: "gehe ins Bett", er: "geht ins Bett", ex: "Ich **gehe** um 23 Uhr **ins Bett**." },
      "lernen": { type: "Regular", ich: "lerne", er: "lernt", ex: "Ich **lerne** Deutsch." },
    };
    table = {
      headers: ["Daily Routine Verb", "Verb Type", "ich-Form", "er/sie/es-Form", "Example Sentence"],
      rows: parsed.comparison.useful_verbs.map((v) => {
        const d = verbData[v] || { type: "Regular", ich: v, er: v, ex: "" };
        return [`**${v}**`, d.type, d.ich, `**${d.er}**`, d.ex];
      }),
    };
  }

  // Topic 1.32: Perfect Tense
  if (!table && parsed.comparison && parsed.comparison.structure && parsed.comparison.haben) {
    table = {
      headers: ["Perfekt Element", "Rule / Auxiliary Choice", "German Example Sentence", "English Translation"],
      rows: [
        ["Basic Structure", "Auxiliary in Pos. 2 + Partizip II at end", "Ich **habe** gestern **gearbeitet**.", "I worked yesterday."],
        ["Verbs with haben", "Transitive verbs, stationary actions, habits", "Ich **habe** Suppe **gekocht**.", "I cooked soup."],
        ["Verbs with sein", "Change of location (A→B) or change of state", "Ich **bin** nach Hause **gegangen**.", "I went home."],
        ["Sentence Bracket (Satzklammer)", "Partizip II stands at the very end of clause", "Wir **haben** gestern im Park Deutsch **gelernt**.", "We studied German in the park yesterday."],
      ],
    };
  }

  // Topic 1.33: mögen, gern, lieber, am liebsten
  if (!table && parsed.comparison && parsed.comparison.like && parsed.comparison.prefer) {
    table = {
      headers: ["Preference Level", "Construction", "Grammatical Role", "German Example", "English Translation"],
      rows: [
        ["Basic Like", "**gern** (or verb **mögen**)", "Adverb modifying verb", "Ich spiele **gern** Fußball.", "I like playing soccer."],
        ["Preference (Comparative)", "**lieber**", "Comparative of gern", "Ich spiele **lieber** Tennis.", "I prefer playing tennis."],
        ["Top Preference (Superlative)", "**am liebsten**", "Superlative of gern", "**Am liebsten** spiele ich Basketball.", "Most of all, I like playing basketball."],
        ["Noun Preference (mögen)", "**mögen** (ich mag, du magst...)", "Conjugated verb + direct object", "Ich **mag** Schokolade.", "I like chocolate."],
      ],
    };
  }

  // Topic 1.34: Fixed-Preposition Verbs
  if (!table && parsed.comparison && Array.isArray(parsed.comparison.verb_preposition_pairs)) {
    table = {
      headers: ["Verb + Fixed Preposition", "Required Case", "Question Word (Things / People)", "German Example Sentence"],
      rows: parsed.comparison.verb_preposition_pairs.map((vp) => [
        `**${vp.pair}**`,
        vp.pair.includes("Akkusativ") ? "**Akkusativ**" : "**Dativ**",
        vp.pair.includes("warten auf") ? "Worauf? / Auf wen?" :
        vp.pair.includes("denken an") ? "Woran? / An wen?" :
        vp.pair.includes("sprechen mit") ? "Womit? / Mit wem?" :
        vp.pair.includes("sprechen über") ? "Worüber? / Über wen?" : "Wofür? / Für wen?",
        vp.example,
      ]),
    };
  }

  // Sentence structure section
  const sentenceStructure =
    parsed.sentence_structure && typeof parsed.sentence_structure === "object"
      ? Object.entries(parsed.sentence_structure).map(([typeKey, val]) => ({
          type: typeKey.replace(/_/g, " "),
          rule: val.rule || "",
          examples: Array.isArray(val.examples)
            ? val.examples.map((ex) => ({
                de: ex.german || ex.de || "",
                en: ex.english || ex.en || "",
              }))
            : [],
        }))
      : [];

  // Comparison table (du vs ihr vs Sie, or definite vs indefinite)
  let comparisonTable = null;
  if (Array.isArray(parsed.comparison) && parsed.comparison.length > 0) {
    const first = parsed.comparison[0];
    if (first.meaning || first.german_verb) {
      comparisonTable = {
        headers: ["Meaning / Usage", "German Verb", "Example", "English"],
        rows: parsed.comparison.map((c) => [
          c.meaning || "",
          `**${c.german_verb || ""}**`,
          c.example || "",
          c.english || "",
        ]),
      };
    } else {
      comparisonTable = {
        headers: ["Situation", "Pronoun"],
        rows: parsed.comparison.map((c) => [
          c.situation || "",
          `**${c.pronoun || ""}**`,
        ]),
      };
    }
  } else if (parsed.comparison && typeof parsed.comparison === "object") {
    if (parsed.comparison.definite_vs_indefinite) {
      const dList = parsed.comparison.definite_vs_indefinite.definite || [];
      const iList = parsed.comparison.definite_vs_indefinite.indefinite || [];
      const maxLen = Math.max(dList.length, iList.length);
      const rows = [];
      for (let i = 0; i < maxLen; i++) {
        const d = dList[i] || {};
        const ind = iList[i] || {};
        rows.push([
          `**${d.german || ""}** (${d.english || ""})`,
          `**${ind.german || ""}** (${ind.english || ""})`,
        ]);
      }
      comparisonTable = {
        headers: ["Definite Article (Specific)", "Indefinite Article (General / Non-specific)"],
        rows,
      };
    } else if (parsed.comparison.quick_choice) {
      comparisonTable = {
        headers: ["Meaning / What to Negate", "Word to Use", "German Example"],
        rows: parsed.comparison.quick_choice.map((qc) => [
          qc.meaning || "",
          `**${qc.word || ""}**`,
          qc.example || "",
        ]),
      };
    } else if (parsed.comparison.question_word_order) {
      comparisonTable = {
        headers: ["Question Type", "Word Order Pattern", "German Example Sentence"],
        rows: parsed.comparison.question_word_order.map((qwo) => [
          qwo.pattern?.includes("Yes/no") ? "Yes/No Question (Ja/Nein-Frage)" : "W-Question (W-Frage)",
          `**${qwo.pattern || ""}**`,
          qwo.example || "",
        ]),
      };
    } else if (parsed.comparison.yes_no && parsed.comparison.w_question) {
      comparisonTable = {
        headers: ["Question Type", "Word Order Pattern", "German Example"],
        rows: [
          ["Yes/No Question (Ja-/Nein-Frage)", `**${parsed.comparison.yes_no.pattern}**`, parsed.comparison.yes_no.example],
          ["W-Question (W-Frage)", `**${parsed.comparison.w_question.pattern}**`, parsed.comparison.w_question.example],
        ],
      };
    } else if (parsed.comparison.statement && parsed.comparison.time_first) {
      comparisonTable = {
        headers: ["Sentence Variation", "Position 1 Focus", "Complete Example Sentence"],
        rows: [
          ["Standard Statement", "Subject (Ich)", parsed.comparison.statement],
          ["Time/Adverb First (Inversion)", "Time (Heute) → Verb stays in Position 2!", parsed.comparison.time_first],
          ["Yes/No Question", "Verb in Position 1", parsed.comparison.yes_no_question],
          ["W-Question", "W-Word in Position 1", parsed.comparison.w_question],
        ],
      };
    } else if (parsed.comparison.main_clause && parsed.comparison.with_modal) {
      comparisonTable = {
        headers: ["Clause Pattern", "Word Order Rule", "German Example"],
        rows: [
          ["Simple Main Clause", `**${parsed.comparison.main_clause.pattern}**`, parsed.comparison.main_clause.example],
          ["With Modal Verb", `**${parsed.comparison.with_modal.pattern}**`, parsed.comparison.with_modal.example],
        ],
      };
    } else if (Array.isArray(parsed.comparison.forms)) {
      comparisonTable = {
        headers: ["Person / Address", "Formation Rule", "Imperative Example"],
        rows: parsed.comparison.forms.map((f) => [
          `**${f.person}**`,
          f.pattern || "",
          `**${f.example}**`,
        ]),
      };
    } else if (Array.isArray(parsed.comparison.nominative_vs_accusative)) {
      comparisonTable = {
        headers: ["Sentence Role", "Case Required", "Question to Identify", "Example Sentence"],
        rows: parsed.comparison.nominative_vs_accusative.map((nva) => [
          `**${nva.role}**`,
          `**${nva.case}**`,
          nva.case === "Nominative" ? "Wer? / Was?" : "Wen? / Was?",
          nva.example,
        ]),
      };
    } else if (Array.isArray(parsed.comparison.questions)) {
      comparisonTable = {
        headers: ["Question Word", "English Meaning", "Function / Case Identified"],
        rows: parsed.comparison.questions.map((q) => [
          `**${q.question}**`,
          q.meaning,
          q.use,
        ]),
      };
    }
  }

  // Usage rules (structured sections with their own examples & notes)
  // Supports both parsed.usage_rules and parsed.rules (objects with title, explanation, examples)
  const rawRules = Array.isArray(parsed.usage_rules)
    ? parsed.usage_rules
    : Array.isArray(parsed.rules) && parsed.rules.length > 0 && typeof parsed.rules[0] === "object"
    ? parsed.rules
    : [];

  const usageRules = rawRules.map((ur) => ({
    title: ur.title || "",
    rule: ur.rule || ur.explanation || "",
    note: ur.note || "",
    examples: Array.isArray(ur.examples)
      ? ur.examples.map((ex) => ({
          noun: ex.noun || "",
          pronoun: ex.pronoun || "",
          de: ex.german || ex.de || "",
          en: ex.english || ex.en || "",
          note: ex.note || "",
        }))
      : [],
  }));

  // Simple rules (array of strings, e.g. in A2 / B1 topics)
  const simpleRules =
    Array.isArray(parsed.rules) && typeof parsed.rules[0] === "string"
      ? parsed.rules
      : [];

  // Common mistakes: support commonMistakes, common_mistakes, and wrong key
  const rawMistakes = parsed.commonMistakes || parsed.common_mistakes || [];
  const commonMistakes = rawMistakes.map((m) => ({
    incorrect: m.incorrect || m.wrong || m.incorrect_context || "",
    isContext: Boolean(!m.incorrect && !m.wrong && m.incorrect_context),
    correct: m.correct || "",
    explanation: m.explanation || "",
  }));

  // Memorization list (normalized across pronouns, regular endings, and irregular verb stems)
  const memorizationList = Array.isArray(parsed.memorization_list)
    ? parsed.memorization_list.map((item) => {
        if (typeof item === "string") {
          const colonIdx = item.indexOf(":");
          if (colonIdx !== -1) {
            return {
              german: item.slice(0, colonIdx).trim(),
              english: item.slice(colonIdx + 1).trim(),
              note: "",
            };
          }
          return { german: item, english: "", note: "" };
        }

        let german = item.german || item.de || "";
        let english = item.english || item.en || "";
        let note = item.example || item.note || "";

        if (!german && item.pattern) {
          german = item.pattern;
          english = item.ending ? `${item.ending}${item.example ? ` (${item.example})` : ""}` : "";
        } else if (!german && item.infinitive) {
          german = item.infinitive;
          english = item.key_forms || "";
        }

        return {
          german,
          english,
          note,
        };
      })
    : [];

  // Mastery goals (supports array or string in mastery_goal / mastery_goals)
  const masteryGoals = Array.isArray(parsed.mastery_goal)
    ? parsed.mastery_goal
    : typeof parsed.mastery_goal === "string" && parsed.mastery_goal.trim()
    ? [parsed.mastery_goal.trim()]
    : Array.isArray(parsed.mastery_goals)
    ? parsed.mastery_goals
    : [];

  // Inferred ordering
  const filePrefixMatch = fileName.match(/^(\d+)[-_]/);
  const inferredOrder = filePrefixMatch ? Number(filePrefixMatch[1]) : null;
  const order =
    inferredOrder !== null
      ? inferredOrder
      : typeof parsed.order === "number"
      ? parsed.order
      : 999;

  const sections = Array.isArray(parsed.sections)
    ? parsed.sections.map((sec) => {
        let table = sec.table || null;
        if (Array.isArray(table) && table.length > 0 && typeof table[0] === "object") {
          const keys = Object.keys(table[0]);
          const headers = keys.map((k) =>
            k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
          );
          const rows = table.map((row) => keys.map((k) => String(row[k] || "")));
          table = { headers, rows };
        } else if (Array.isArray(sec.article_table) && sec.article_table.length > 0) {
          const keys = Object.keys(sec.article_table[0] || {});
          const headers = keys.map((k) =>
            k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
          );
          const rows = sec.article_table.map((row) =>
            keys.map((k) => String(row[k] || ""))
          );
          table = { headers, rows };
        }

        const heading = sec.topic || sec.heading || sec.title || "";
        const text =
          sec.core_difference || sec.text || sec.explanation || sec.rule || "";

        return {
          ...sec,
          heading,
          text,
          table,
        };
      })
    : [];

  const studyStrategy = Array.isArray(parsed.study_strategy)
    ? parsed.study_strategy
    : parsed.study_strategy && typeof parsed.study_strategy === "object"
    ? Object.values(parsed.study_strategy)
    : [];

  return {
    ...parsed,
    id: slug,
    slug,
    fileName,
    order,
    topicNumber: parsed.topic_number || null,
    title: displayTitle,
    titleEn: displayTitleEn,
    category:
      parsed.category ||
      (levelMeta.id === "A1"
        ? order <= 17
          ? "Grammar Foundations"
          : "Applying Grammar"
        : "Grammar"),
    level: levelMeta.id,
    levelName: levelMeta.name,
    folderPath: `data/${levelMeta.id}/${fileName}`,
    updatedAtMs: stat.mtimeMs,
    summary,
    plainSummary: stripMarkdown(summary),
    definitionExamples,
    table,
    conjugationRule,
    conjugationExamples,
    conjugationTables,
    sentenceStructure,
    comparisonTable,
    spellingRules,
    commonRegularVerbs,
    importantRule,
    verbGroups,
    rules: simpleRules,
    usageRules,
    sections,
    studyStrategy,
    commonMistakes,
    memorizationList,
    masteryGoals,
    nextTopicMeta: parsed.next_topic || null,
  };
}

function estimateReadingMinutes(topic) {
  const parts = [
    topic.title,
    topic.titleEn,
    topic.summary,
    topic.explanation,
    ...(topic.rules || []),
    ...(topic.usageRules || []).map(
      (u) =>
        `${u.title} ${u.rule} ${u.note} ${u.examples
          .map((e) => `${e.de} ${e.en}`)
          .join(" ")}`
    ),
    ...(topic.examples || []).map((e) => `${e.de} ${e.en}`),
    ...(topic.commonMistakes || []).map(
      (m) => `${m.incorrect} ${m.correct} ${m.explanation}`
    ),
    ...(topic.memorizationList || []).map((m) => `${m.german} ${m.english}`),
    ...(topic.masteryGoals || []),
    topic.note,
  ];
  if (topic.table && topic.table.rows) {
    for (const row of topic.table.rows) {
      parts.push(row.join(" "));
    }
  }
  const words = parts
    .filter(Boolean)
    .join(" ")
    .trim()
    .split(/\s+/).length;

  return Math.max(2, Math.ceil(words / 110));
}

export function getFolderTopics(levelId) {
  const levelMeta = LEVELS.find(
    (l) => l.id.toLowerCase() === String(levelId).toLowerCase()
  );
  if (!levelMeta) return null;

  const folderPath = path.join(DATA_DIR, levelMeta.id);
  if (!fs.existsSync(folderPath)) {
    return { ...levelMeta, topics: [] };
  }

  const files = fs
    .readdirSync(folderPath)
    .filter((f) => !f.startsWith(".") && (f.endsWith(".json") || !f.includes(".")));

  const rawTopics = [];
  let verbCompendium = null;

  for (const fileName of files) {
    const fullPath = path.join(folderPath, fileName);
    const stat = fs.statSync(fullPath);
    const raw = fs.readFileSync(fullPath, "utf8");
    const parsed = safeParseJsonFile(raw, fullPath);
    if (!parsed) continue;

    // Check if this is a grouped verb conjugation compendium
    if (
      fileName.includes("verbs_grouped_by_conjugation_pattern") ||
      (parsed.groups && Array.isArray(parsed.all_verbs))
    ) {
      verbCompendium = {
        ...parsed,
        id: fileName.replace(/\.json$/i, ""),
        slug: fileName.replace(/\.json$/i, ""),
        fileName,
        level: levelMeta.id,
      };
    } else {
      const normalized = normalizeTopic(parsed, fileName, levelMeta, stat);
      normalized.readingMinutes = estimateReadingMinutes(normalized);
      rawTopics.push(normalized);
    }
  }

  rawTopics.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.fileName.localeCompare(b.fileName);
  });

  const topics = rawTopics.map((t, index) => ({
    ...t,
    number:
      t.order === 0
        ? `${levelMeta.number}.0`
        : `${levelMeta.number}.${t.order !== 999 ? t.order : index + 1}`,
  }));

  return {
    ...levelMeta,
    topics,
    verbCompendium,
  };
}

export function getAllFolders() {
  return LEVELS.map((level) => getFolderTopics(level.id));
}

export function getAllTopicsFlat() {
  const folders = getAllFolders();
  return folders.flatMap((f) => f.topics);
}

export function getSearchIndex() {
  return getAllTopicsFlat().map((t) => ({
    slug: t.slug,
    level: t.level,
    number: t.number,
    title: t.title,
    titleEn: t.titleEn || "",
    category: t.category || "Grammar",
    fileName: t.fileName,
    readingMinutes: t.readingMinutes,
    plainSummary: t.plainSummary,
    searchWords: [
      t.title,
      t.titleEn,
      t.plainSummary,
      ...(t.examples || []).map((e) => `${e.de} ${e.en}`),
      ...(t.usageRules || []).flatMap((u) => [
        u.title,
        u.rule,
        ...u.examples.map((e) => `${e.noun} ${e.pronoun} ${e.de} ${e.en}`),
      ]),
      ...(t.memorizationList || []).map((m) => `${m.german} ${m.english}`),
      ...(t.vocabulary || []).map((v) => `${v.word} ${v.meaning}`),
      ...(t.verbs || []).map((v) => `${v.infinitive} ${v.english} ${v.pattern_or_note || ""}`),
    ]
      .filter(Boolean)
      .join(" "),
  }));
}

export function getTopicFile(levelId, topicSlug) {
  const folder = getFolderTopics(levelId);
  if (!folder) return null;

  const targetSlug = decodeURIComponent(String(topicSlug)).toLowerCase();

  // If this is the verb compendium
  const isVerbCompendiumSlug =
    folder.verbCompendium &&
    (folder.verbCompendium.slug.toLowerCase() === targetSlug ||
      folder.verbCompendium.id.toLowerCase() === targetSlug ||
      targetSlug === "verbpattern" ||
      targetSlug === "verbpatterns" ||
      targetSlug === "verb-pattern" ||
      targetSlug === "verb-patterns");

  if (isVerbCompendiumSlug) {
    return {
      folder,
      topic: {
        ...folder.verbCompendium,
        id: folder.verbCompendium.slug,
        slug: folder.verbCompendium.slug,
        title: folder.verbCompendium.title || "A1 German Verbs Grouped by Pattern",
        titleEn: folder.verbCompendium.purpose || "115 A1 Verbs Grouped for Easy Learning",
        category: "Verb Patterns",
        number: `${folder.number}.V`,
        readingMinutes: 10,
        isVerbCompendium: true,
      },
      prevTopic: folder.topics[folder.topics.length - 1] || null,
      nextTopic: null,
      relatedTopics: folder.topics.slice(0, 3),
    };
  }

  const idx = folder.topics.findIndex(
    (t) => t.slug.toLowerCase() === targetSlug
  );
  if (idx === -1) return null;

  const topic = folder.topics[idx];
  const allTopics = getAllTopicsFlat();

  const relatedTopics = allTopics
    .filter(
      (t) =>
        !(t.level === topic.level && t.slug === topic.slug) &&
        (t.level === topic.level || t.category === topic.category)
    )
    .slice(0, 3);

  return {
    folder,
    topic,
    prevTopic: idx > 0 ? folder.topics[idx - 1] : null,
    nextTopic: idx < folder.topics.length - 1 ? folder.topics[idx + 1] : null,
    relatedTopics,
  };
}
