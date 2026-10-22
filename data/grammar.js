// ─────────────────────────────────────────────────────────────
//  German Grammar data — add new topics here.
//
//  Each topic supports these fields (only id, level, title are required):
//    id        unique slug, used for the #anchor link
//    level     "A1" | "A2" | "B1"
//    title     topic heading
//    summary   short explanation (use **text** for bold)
//    table     { headers: [...], rows: [[...], [...]] }
//    examples  [{ de: "German sentence", en: "English translation" }]
//    note      a highlighted tip / rule box
// ─────────────────────────────────────────────────────────────

export const levels = [
  { id: "A1", name: "Beginner", description: "Foundations and basic sentences" },
  { id: "A2", name: "Elementary", description: "Past tense and everyday structures" },
  { id: "B1", name: "Intermediate", description: "Complex sentences and passive voice" },
];

export const topics = [
  // ───────────── A1 ─────────────
  {
    id: "word-order-v2",
    level: "A1",
    title: "Sentence Structure — The V2 Rule",
    summary:
      "In a main clause the conjugated verb is **always in position 2**. Position 1 can be the subject, a time word, or a question word.",
    table: {
      headers: ["Position 1", "Verb (2)", "Rest", "End"],
      rows: [
        ["Ich", "**lerne**", "heute", "Deutsch."],
        ["Heute", "**lerne**", "ich", "Deutsch."],
        ["Was", "**lernst**", "du", "heute?"],
      ],
    },
    note: "If the sentence starts with something other than the subject, the subject moves **right after the verb**.",
  },
  {
    id: "articles-nom-akk",
    level: "A1",
    title: "Articles — Nominativ & Akkusativ",
    summary:
      "Nominativ = subject, Akkusativ = direct object. Only the **masculine** article changes: der → den, ein → einen.",
    table: {
      headers: ["Case", "Masc.", "Fem.", "Neut.", "Plural"],
      rows: [
        ["Nominativ", "der / ein", "die / eine", "das / ein", "die / –"],
        ["Akkusativ", "**den / einen**", "die / eine", "das / ein", "die / –"],
      ],
    },
    examples: [
      { de: "**Der Hund** sucht **den Ball**.", en: "The dog is looking for the ball." },
      { de: "Ich kaufe **einen Apfel**.", en: "I am buying an apple." },
    ],
  },

  // ───────────── A2 ─────────────
  {
    id: "perfekt",
    level: "A2",
    title: "Das Perfekt — haben or sein",
    summary:
      "Spoken past tense: **haben / sein** in position 2 + **Partizip II** at the end.",
    table: {
      headers: ["Auxiliary", "Used for", "Example"],
      rows: [
        ["**sein**", "movement A → B, change of state, sein / bleiben", "Ich **bin** nach Berlin **gefahren**."],
        ["**haben**", "most other verbs, reflexive verbs", "Ich **habe** Deutsch **gelernt**."],
      ],
    },
    note: "Tip: if you can't decide — most verbs use **haben**.",
  },

  // ───────────── B1 ─────────────
  {
    id: "nebensaetze",
    level: "B1",
    title: "Subordinate Clauses — weil, dass, obwohl",
    summary:
      "After a subordinating conjunction the conjugated verb goes to the **end** of the clause.",
    examples: [
      { de: "Ich bleibe zu Hause, **weil** ich krank **bin**.", en: "I'm staying home because I'm sick." },
      { de: "Ich weiß, **dass** du Deutsch **lernst**.", en: "I know that you are learning German." },
      { de: "**Obwohl** es **regnet**, gehe ich spazieren.", en: "Although it's raining, I'm going for a walk." },
    ],
    note: "If the sentence starts with the subordinate clause → verb, verb: „Weil ich krank **bin**, **bleibe** ich zu Hause.“",
  },
];
