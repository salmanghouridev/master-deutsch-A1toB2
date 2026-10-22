"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Rich from "./Rich";
import { useStudy } from "./StudyProvider";
import VerbCompendiumView from "./VerbCompendiumView";
import {
  CheckIcon,
  LightbulbIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  SearchIcon,
} from "./Icons";

function TopicVerbsSection({ verbs }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    if (!query.trim()) return verbs;
    const q = query.trim().toLowerCase();
    return verbs.filter((v) => {
      const haystack = [
        v.infinitive,
        v.english,
        v.pattern_or_note,
        ...(v.conjugation || []).map((c) => `${c.pronoun} ${c.form}`),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [verbs, query]);

  return (
    <section className="study-section">
      <div className="study-section-head-row">
        <h2 className="study-section-heading">Verb Conjugation Directory ({verbs.length} Verbs)</h2>
        <span className="self-test-hint no-print">Showing {filtered.length} of {verbs.length}</span>
      </div>

      <div className="level-search-wrap" style={{ maxWidth: "340px", marginBottom: "16px" }}>
        <SearchIcon size={16} className="level-search-icon" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search verbs in this topic..."
          className="level-search-input"
        />
      </div>

      <div className="verbs-grid">
        {filtered.map((verb, idx) => (
          <div key={`${verb.infinitive}-${idx}`} className="verb-card">
            <div className="verb-card-header">
              <div>
                <h3 className="verb-infinitive">{verb.infinitive}</h3>
                <span className="verb-english">{verb.english}</span>
              </div>
              {verb.pattern_or_note && (
                <span className="verb-pattern-pill" title={verb.pattern_or_note}>
                  {verb.pattern_or_note}
                </span>
              )}
            </div>

            <div className="verb-conjugation-table">
              {verb.conjugation?.map((c) => (
                <div key={c.pronoun} className="verb-form-row">
                  <span className="verb-pronoun">{c.pronoun}</span>
                  <strong className="verb-form">{c.form}</strong>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function GrammarTable({ table }) {
  if (!table || !table.headers || !table.rows) return null;
  return (
    <div className="study-table-wrap">
      <table className="study-table">
        <thead>
          <tr>
            {table.headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c}>
                  <Rich text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StudyNoteView({
  folder,
  topic,
  prevTopic,
  nextTopic,
  relatedTopics = [],
}) {
  const noteKey = `${topic.level}/${topic.slug}`;
  const {
    reviewed,
    toggleReviewed,
    recordNoteOpened,
  } = useStudy();

  const [revealedExercises, setRevealedExercises] = useState({});

  useEffect(() => {
    recordNoteOpened(topic.level, topic.slug);
  }, [topic.level, topic.slug, recordNoteOpened]);

  const isReviewed = reviewed.includes(noteKey);

  function toggleExercise(idx) {
    setRevealedExercises((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  if (topic.isVerbCompendium) {
    return (
      <div className="study-page-shell">
        <div className="study-topbar no-print">
          <nav className="study-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/" className="crumb">
              Collection
            </Link>
            <ChevronRightIcon size={13} className="crumb-divider" />
            <Link href={`/${folder.id}`} className="crumb">
              {folder.id}
            </Link>
            <ChevronRightIcon size={13} className="crumb-divider" />
            <span className="crumb-active">Verb Conjugation Patterns</span>
          </nav>
          <div className="study-toolbar">
            <button
              type="button"
              onClick={() => toggleReviewed(noteKey)}
              className={`complete-toggle-btn ${isReviewed ? "completed" : ""}`}
              aria-pressed={isReviewed}
              title={isReviewed ? "Mark topic as incomplete" : "Mark topic as complete"}
            >
              <span className={`custom-checkbox ${isReviewed ? "checked" : ""}`}>
                {isReviewed && <CheckIcon size={12} />}
              </span>
              <span>{isReviewed ? "Completed" : "Mark as Complete"}</span>
            </button>
          </div>
        </div>
        <VerbCompendiumView compendium={topic} />
      </div>
    );
  }

  return (
    <div className="study-page-shell">
      <article className="study-article">
        {/* Top Breadcrumb & Action Bar */}
        <div className="study-topbar no-print">
          <nav className="study-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/" className="crumb">
              Collection
            </Link>
            <ChevronRightIcon size={13} className="crumb-divider" />
            <Link href={`/${folder.id}`} className="crumb">
              {folder.id}
            </Link>
            <ChevronRightIcon size={13} className="crumb-divider" />
            <span className="crumb-active">{topic.category || "Grammar"}</span>
          </nav>

          <div className="study-toolbar">
            <button
              type="button"
              onClick={() => toggleReviewed(noteKey)}
              className={`complete-toggle-btn ${isReviewed ? "completed" : ""}`}
              aria-pressed={isReviewed}
              title={isReviewed ? "Mark topic as incomplete" : "Mark topic as complete"}
            >
              <span className={`custom-checkbox ${isReviewed ? "checked" : ""}`}>
                {isReviewed && <CheckIcon size={12} />}
              </span>
              <span>{isReviewed ? "Completed" : "Mark as Complete"}</span>
            </button>
          </div>
        </div>

        {/* Textbook Note Header */}
        <header className="study-header">
          <div className="study-meta-row">
            <span className="section-tag">§ {topic.number}</span>
            {topic.topicNumber && (
              <span className="category-tag">Topic #{topic.topicNumber}</span>
            )}
            <span
              className={`level-badge level-badge-${topic.level.toLowerCase()}`}
            >
              {topic.level}
            </span>
            {topic.category && (
              <span className="category-tag">{topic.category}</span>
            )}
            <span className="meta-dot">·</span>
            <span className="meta-muted">{topic.readingMinutes} min read</span>
            {topic.fileName && (
              <>
                <span className="meta-dot">·</span>
                <code className="meta-filename">{topic.fileName}</code>
              </>
            )}
          </div>

          <h1 className="study-title">{topic.title}</h1>

          {topic.titleEn && (
            <p className="study-subtitle-en">{topic.titleEn}</p>
          )}

          {topic.summary && (
            <p className="study-overview">
              <Rich text={topic.summary} />
            </p>
          )}

          {topic.definitionExamples && topic.definitionExamples.length > 0 && (
            <div className="definition-examples-stack">
              {topic.definitionExamples.map((ex, dIdx) => (
                <div key={dIdx} className="definition-example-box">
                  {ex.verb && <span className="definition-verb-tag">{ex.verb}</span>}
                  <span className="definition-example-de">{ex.de}</span>
                  {ex.en && (
                    <span className="definition-example-en"> — {ex.en}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {!topic.definitionExamples && topic.definitionExample && (
            <div className="definition-example-box">
              <span className="definition-example-label">Example:</span>
              <span className="definition-example-de">
                {topic.definitionExample.de}
              </span>
              {topic.definitionExample.en && (
                <span className="definition-example-en">
                  {" "}
                  — {topic.definitionExample.en}
                </span>
              )}
            </div>
          )}
        </header>

        {/* Important Rule: Golden Rule for Irregular Verbs */}
        {topic.importantRule && (
          <aside className="important-rule-callout" aria-label="Crucial grammar rule">
            <div className="important-rule-header">
              <span className="important-rule-badge">Golden Rule</span>
              <h3 className="important-rule-title">Stem Vowel Changes in Present Tense</h3>
            </div>
            <p className="important-rule-text">
              <Rich text={topic.importantRule.english} />
            </p>
            {topic.importantRule.examples && topic.importantRule.examples.length > 0 && (
              <div className="important-rule-examples">
                {topic.importantRule.examples.map((ex, exIdx) => (
                  <div key={exIdx} className="important-rule-ex-card">
                    <strong className="important-rule-verb">{ex.infinitive}:</strong>
                    <span className="important-rule-forms">{ex.forms}</span>
                  </div>
                ))}
              </div>
            )}
          </aside>
        )}

        {/* Step-by-Step Conjugation Formation (e.g. Regular Verbs) */}
        {topic.conjugationRule && topic.conjugationRule.steps && (
          <section className="study-section">
            <h2 className="study-section-heading">How to Conjugate (Step-by-Step)</h2>
            <div className="conjugation-steps-grid">
              {topic.conjugationRule.steps.map((step, sIdx) => (
                <div key={sIdx} className="conjugation-step-card">
                  <span className="step-num-badge">Step {sIdx + 1}</span>
                  <p className="step-text">
                    <Rich text={step} />
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 1. Meaning & Explanation */}
        {topic.explanation && (
          <section className="study-section">
            <h2 className="study-section-heading">Meaning & Explanation</h2>
            <p className="study-prose">
              <Rich text={topic.explanation} />
            </p>
          </section>
        )}

        {/* 2. Main Grammar / Pronouns Overview Table */}
        {topic.table && (
          <section className="study-section">
            <h2 className="study-section-heading">Overview Table</h2>
            <GrammarTable table={topic.table} />
          </section>
        )}

        {/* Irregular Verbs Grouped by Pattern */}
        {topic.verbGroups && topic.verbGroups.length > 0 && (
          <section className="study-section">
            <div className="study-section-head-row">
              <h2 className="study-section-heading">Conjugation Patterns & Verb Catalog</h2>
              <span className="self-test-hint no-print">
                {topic.verbGroups.reduce((acc, g) => acc + g.verbs.length, 0)} verbs catalogued
              </span>
            </div>

            <div className="verb-groups-container">
              {topic.verbGroups.map((group, gIdx) => (
                <div key={gIdx} className="verb-group-block">
                  <div className="verb-group-header">
                    <h3 className="verb-group-title">
                      <span className="verb-group-badge">{gIdx + 1}</span> {group.group}
                    </h3>
                    {group.rule && <p className="verb-group-rule">{group.rule}</p>}
                  </div>

                  <div className="verb-group-cards-grid">
                    {group.verbs.map((v, vIdx) => (
                      <div key={vIdx} className="verb-mini-card">
                        <div className="verb-mini-header">
                          <strong className="verb-mini-infinitive">{v.infinitive}</strong>
                          <span className="verb-mini-english">{v.english}</span>
                        </div>

                        {v.forms && v.forms.length > 0 && (
                          <div className="verb-mini-forms-grid">
                            {v.forms.map((f, fIdx) => {
                              const isShift = f.pronoun === "du" || f.pronoun === "er/sie/es";
                              return (
                                <div
                                  key={fIdx}
                                  className={`verb-mini-form-cell ${
                                    isShift ? "verb-form-highlight" : ""
                                  }`}
                                >
                                  <span className="mini-form-pronoun">{f.pronoun}</span>
                                  <strong className="mini-form-val">{f.form}</strong>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {v.example && (
                          <div className="verb-mini-example">
                            <p className="verb-mini-ex-de">{v.example.de}</p>
                            {v.example.en && (
                              <p className="verb-mini-ex-en">{v.example.en}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Detailed Conjugation Tables if present */}
        {topic.conjugationTables && topic.conjugationTables.length > 0 && (
          <section className="study-section">
            <h2 className="study-section-heading">Detailed Conjugation & Examples</h2>
            <div className="conjugation-tables-stack">
              {topic.conjugationTables.map((ct, ctIdx) => (
                <div key={ctIdx} className="conjugation-verb-card">
                  <h3 className="conjugation-verb-title">
                    Verb: <em>{ct.verb}</em>
                  </h3>
                  <GrammarTable table={ct} />
                  {ct.sentences && ct.sentences.length > 0 && (
                    <div className="example-stack" style={{ marginTop: "14px" }}>
                      {ct.sentences.map((sent, sIdx) => (
                        <div key={sIdx} className="example-block">
                          <p className="example-de">
                            <Rich text={sent.de} />
                          </p>
                          {sent.en && (
                            <p className="example-en">{sent.en}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Spelling Rules & Exceptions */}
        {topic.spellingRules && topic.spellingRules.length > 0 && (
          <section className="study-section">
            <h2 className="study-section-heading">Spelling & Pronunciation Exceptions</h2>
            <div className="spelling-rules-stack">
              {topic.spellingRules.map((sr, srIdx) => (
                <div key={srIdx} className="spelling-rule-card">
                  <h3 className="spelling-rule-title">
                    <span className="spelling-rule-dot">●</span> {sr.title}
                  </h3>
                  <p className="spelling-rule-desc">
                    <Rich text={sr.rule} />
                  </p>
                  {sr.examples && sr.examples.length > 0 && (
                    <div className="spelling-rule-examples">
                      {sr.examples.map((ex, exIdx) => (
                        <div key={exIdx} className="spelling-ex-row">
                          <strong className="spelling-ex-inf">{ex.infinitive}</strong>
                          <span className="spelling-ex-de">{ex.de}</span>
                          {ex.en && (
                            <span className="spelling-ex-en"> — {ex.en}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sentence Structure section if present */}
        {topic.sentenceStructure && topic.sentenceStructure.length > 0 && (
          <section className="study-section">
            <h2 className="study-section-heading">Sentence Structure</h2>
            <div className="sentence-structure-stack">
              {topic.sentenceStructure.map((ss, sIdx) => (
                <div key={sIdx} className="structure-card">
                  <h3 className="structure-card-type">{ss.type}</h3>
                  <p className="structure-card-rule">
                    <Rich text={ss.rule} />
                  </p>
                  {ss.examples && ss.examples.length > 0 && (
                    <div className="example-stack">
                      {ss.examples.map((ex, eIdx) => (
                        <div key={eIdx} className="example-block">
                          <p className="example-de">
                            <Rich text={ex.de} />
                          </p>
                          {ex.en && <p className="example-en">{ex.en}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. Key Rules & Patterns (Simple List) */}
        {topic.rules &&
          topic.rules.length > 0 &&
          typeof topic.rules[0] === "string" && (
            <section className="study-section">
              <h2 className="study-section-heading">Key Rules & Patterns</h2>
              <ul className="study-rules-list">
                {topic.rules.map((rule, idx) => (
                  <li key={idx}>
                    <Rich text={rule} />
                  </li>
                ))}
              </ul>
            </section>
          )}

        {/* 4. Structured Usage Rules (with per-rule examples & notes) */}
        {topic.usageRules && topic.usageRules.length > 0 && (
          <section className="study-section">
            <h2 className="study-section-heading">Usage Rules & Examples</h2>

            <div className="usage-rules-stack">
              {topic.usageRules.map((ur, uIdx) => (
                <div key={uIdx} className="usage-rule-block">
                  <h3 className="usage-rule-title">
                    <span className="usage-rule-num">{uIdx + 1}.</span>{" "}
                    {ur.title}
                  </h3>
                  {ur.rule && (
                    <p className="usage-rule-desc">
                      <Rich text={ur.rule} />
                    </p>
                  )}

                  {ur.examples && ur.examples.length > 0 && (
                    <div className="example-stack">
                      {ur.examples.map((ex, eIdx) => (
                        <div key={eIdx} className="example-block">
                          {(ex.noun || ex.pronoun) && (
                            <div className="example-noun-map">
                              {ex.noun && (
                                <span className="noun-chip">{ex.noun}</span>
                              )}
                              {ex.noun && ex.pronoun && (
                                <span className="noun-arrow">→</span>
                              )}
                              {ex.pronoun && (
                                <strong className="pronoun-chip">
                                  {ex.pronoun}
                                </strong>
                              )}
                            </div>
                          )}
                          <p className="example-de">
                            <Rich text={ex.de} />
                          </p>
                          {ex.en && (
                            <p className="example-en">{ex.en}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {ur.note && (
                    <div className="remember-callout remember-callout-compact">
                      <div className="remember-icon">
                        <LightbulbIcon size={16} />
                      </div>
                      <div className="remember-content">
                        <span className="remember-title">Note</span>
                        <p>
                          <Rich text={ur.note} />
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Situation Comparison Table (e.g. du vs ihr vs Sie) */}
        {topic.comparisonTable && (
          <section className="study-section">
            <h2 className="study-section-heading">Situation Comparison</h2>
            <GrammarTable table={topic.comparisonTable} />
          </section>
        )}

        {/* Common Regular Verbs Reference */}
        {topic.commonRegularVerbs && topic.commonRegularVerbs.length > 0 && (
          <section className="study-section">
            <div className="study-section-head-row">
              <h2 className="study-section-heading">
                Top Regular Verbs in A1 ({topic.commonRegularVerbs.length})
              </h2>
              <span className="self-test-hint no-print">Essential Daily Verbs</span>
            </div>
            <div className="common-verbs-grid">
              {topic.commonRegularVerbs.map((crv, cIdx) => (
                <div key={cIdx} className="common-verb-chip">
                  <strong className="common-verb-inf">{crv.infinitive}</strong>
                  <span className="common-verb-en">{crv.english}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Optional Extra Subsections / Deep-Dive Comparison Sections */}
        {topic.sections &&
          topic.sections.map((sec, idx) => (
            <section key={idx} className="study-section">
              {sec.heading && (
                <h2 className="study-section-heading">{sec.heading}</h2>
              )}

              {sec.core_difference && (
                <div className="note-card note-card-blue" style={{ marginBottom: "1rem" }}>
                  <span className="note-badge">Core Difference</span>
                  <p className="note-text">
                    <Rich text={sec.core_difference} />
                  </p>
                </div>
              )}

              {sec.why_use_it && (
                <p className="study-prose" style={{ marginBottom: "1rem" }}>
                  <strong>Why use it:</strong> <Rich text={sec.why_use_it} />
                </p>
              )}

              {sec.text && !sec.core_difference && (
                <p className="study-prose">
                  <Rich text={sec.text} />
                </p>
              )}

              {sec.rule_of_thumb && (
                <div className="note-card note-card-yellow" style={{ marginBottom: "1rem" }}>
                  <span className="note-badge">Rule of Thumb</span>
                  <p className="note-text">
                    <Rich text={sec.rule_of_thumb} />
                  </p>
                </div>
              )}

              {(sec.important_warning || sec.important_difference || sec.important) && (
                <div className="note-card note-card-yellow" style={{ marginBottom: "1rem" }}>
                  <span className="note-badge">Important Note</span>
                  <p className="note-text">
                    <Rich text={sec.important_warning || sec.important_difference || sec.important} />
                  </p>
                </div>
              )}

              <GrammarTable table={sec.table} />

              {/* sec.comparison Card Grid */}
              {Array.isArray(sec.comparison) && sec.comparison.length > 0 && (
                <div
                  className="study-comparison-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "1rem",
                    marginTop: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  {sec.comparison.map((item, ci) => {
                    const label =
                      item.term ||
                      item.choice ||
                      item.case ||
                      item.type ||
                      item.question ||
                      item.form ||
                      item.structure ||
                      item.word ||
                      item.position ||
                      item.tense ||
                      `Item ${ci + 1}`;
                    const desc =
                      item.what ||
                      item.meaning ||
                      item.when ||
                      item.use ||
                      item.rule ||
                      item.job;
                    const identify =
                      item.how_to_identify ||
                      item.identify ||
                      item.recognize;

                    return (
                      <div
                        key={ci}
                        className="study-card"
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          padding: "1.25rem",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.6rem",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span
                            className="level-badge level-badge-a1"
                            style={{ fontSize: "0.95rem", padding: "4px 10px", fontWeight: 700 }}
                          >
                            {label}
                          </span>
                        </div>

                        {desc && (
                          <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.5, color: "#111827", fontWeight: 500 }}>
                            <Rich text={desc} />
                          </p>
                        )}

                        {item.why && (
                          <p style={{ margin: 0, fontSize: "0.9rem", color: "#374151", lineHeight: 1.5 }}>
                            <strong style={{ color: "#111" }}>Why: </strong>
                            <Rich text={item.why} />
                          </p>
                        )}

                        {identify && (
                          <div
                            style={{
                              background: "#f9fafb",
                              borderLeft: "3px solid #3b82f6",
                              padding: "6px 10px",
                              borderRadius: "4px",
                              fontSize: "0.88rem",
                              color: "#1f2937",
                            }}
                          >
                            <span style={{ fontWeight: 600, color: "#1d4ed8" }}>How to recognize: </span>
                            <Rich text={identify} />
                          </div>
                        )}

                        {item.article_clue && (
                          <div
                            style={{
                              background: "#eff6ff",
                              padding: "6px 10px",
                              borderRadius: "4px",
                              fontSize: "0.88rem",
                              color: "#1e40af",
                            }}
                          >
                            <strong>Article clue: </strong>
                            <Rich text={item.article_clue} />
                          </div>
                        )}

                        {item.pattern && (
                          <div
                            style={{
                              background: "#f3f4f6",
                              padding: "6px 10px",
                              borderRadius: "4px",
                              fontSize: "0.88rem",
                              fontFamily: "monospace",
                              color: "#111",
                            }}
                          >
                            <strong>Pattern: </strong>
                            {item.pattern}
                          </div>
                        )}

                        {item.example && (
                          <div
                            style={{
                              background: "#fdf8f6",
                              border: "1px solid #fee2e2",
                              padding: "8px 10px",
                              borderRadius: "6px",
                            }}
                          >
                            <div style={{ fontWeight: 600, color: "#991b1b", fontSize: "0.92rem" }}>
                              {item.example}
                            </div>
                            {item.english && (
                              <div style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "2px" }}>
                                {item.english}
                              </div>
                            )}
                          </div>
                        )}

                        {item.trick && (
                          <div
                            style={{
                              background: "#fffbeb",
                              borderLeft: "3px solid #f59e0b",
                              padding: "6px 10px",
                              borderRadius: "4px",
                              fontSize: "0.88rem",
                              color: "#92400e",
                              marginTop: "auto",
                            }}
                          >
                            💡 <strong>Trick: </strong>
                            <Rich text={item.trick} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* sec.same_sentence */}
              {sec.same_sentence && (
                <div className="note-card note-card-blue" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                  <span className="note-badge">Sentence Case Breakdown</span>
                  <p style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0.4rem 0", color: "#1e3a8a" }}>
                    {sec.same_sentence.german}
                  </p>
                  {sec.same_sentence.english && (
                    <p style={{ fontSize: "0.95rem", color: "#475569", margin: "0 0 0.5rem 0" }}>
                      {sec.same_sentence.english}
                    </p>
                  )}
                  {sec.same_sentence.analysis && (
                    <div
                      style={{
                        background: "#ffffff",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontSize: "0.9rem",
                        color: "#1e293b",
                        border: "1px solid #bfdbfe",
                      }}
                    >
                      <strong>Analysis: </strong>
                      <Rich text={sec.same_sentence.analysis} />
                    </div>
                  )}
                </div>
              )}

              {/* sec.quick_comparison */}
              {Array.isArray(sec.quick_comparison) && sec.quick_comparison.length > 0 && (
                <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Quick Comparison
                  </h3>
                  <div className="example-stack">
                    {sec.quick_comparison.map((qc, qci) => (
                      <div key={qci} className="example-card">
                        <span className="example-card-num">{qci + 1}</span>
                        <div className="example-card-content">
                          <p className="example-de">{qc.german}</p>
                          {qc.english && <p className="example-en">{qc.english}</p>}
                          {qc.why && (
                            <p style={{ fontSize: "0.85rem", color: "#4b5563", marginTop: "4px" }}>
                              💡 <strong>Why: </strong>
                              <Rich text={qc.why} />
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* sec.quick_test */}
              {sec.quick_test && (
                <div className="note-card note-card-yellow" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                  <span className="note-badge">Quick Test</span>
                  <p className="note-text" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                    <Rich text={sec.quick_test} />
                  </p>
                </div>
              )}

              {/* sec.common_mistake (singular) */}
              {sec.common_mistake && (
                <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Common Mistake to Avoid
                  </h3>
                  <div className="mistake-grid">
                    <div className="mistake-card">
                      <div className="mistake-row mistake-wrong">
                        <span className="mistake-tag tag-wrong">✕ Wrong</span>
                        <span className="mistake-text">{sec.common_mistake.wrong}</span>
                      </div>
                      <div className="mistake-row mistake-right">
                        <span className="mistake-tag tag-right">✓ Correct</span>
                        <span className="mistake-text">{sec.common_mistake.correct}</span>
                      </div>
                      {sec.common_mistake.why && (
                        <p className="mistake-why">{sec.common_mistake.why}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* sec.trick (section-level memory trick) */}
              {sec.trick && (
                <div className="note-card note-card-yellow" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                  <span className="note-badge">💡 Memory Trick</span>
                  <p className="note-text">
                    <Rich text={sec.trick} />
                  </p>
                </div>
              )}

              {/* sec.memory_pairs */}
              {Array.isArray(sec.memory_pairs) && sec.memory_pairs.length > 0 && (
                <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Key Memory Pairs
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {sec.memory_pairs.map((pair, pi) => (
                      <span
                        key={pi}
                        style={{
                          background: "#ebf3ff",
                          color: "#1e3a8a",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          fontFamily: "monospace",
                        }}
                      >
                        {pair}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* sec.steps */}
              {Array.isArray(sec.steps) && sec.steps.length > 0 && (
                <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Action Checklist
                  </h3>
                  <ol className="study-rules-list">
                    {sec.steps.map((step, si) => (
                      <li key={si} style={{ marginBottom: "0.5rem" }}>
                        <Rich text={step} />
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* sec.worked_example */}
              {sec.worked_example && (
                <div className="note-card note-card-blue" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                  <span className="note-badge">Worked Example Walkthrough</span>
                  <p style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0.4rem 0", color: "#1e3a8a" }}>
                    {sec.worked_example.german}
                  </p>
                  {sec.worked_example.english && (
                    <p style={{ fontSize: "0.95rem", color: "#475569", margin: "0 0 0.5rem 0" }}>
                      {sec.worked_example.english}
                    </p>
                  )}
                  {sec.worked_example.analysis && (
                    <div
                      style={{
                        background: "#ffffff",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontSize: "0.9rem",
                        color: "#1e293b",
                        border: "1px solid #bfdbfe",
                      }}
                    >
                      <strong>Analysis: </strong>
                      <Rich text={sec.worked_example.analysis} />
                    </div>
                  )}
                </div>
              )}

              {Array.isArray(sec.patterns) && sec.patterns.length > 0 && (
                <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Sentence & Word Order Patterns
                  </h3>
                  <div className="example-stack">
                    {sec.patterns.map((pat, pi) => (
                      <div key={pi} className="example-card">
                        <span className="example-card-num">{pi + 1}</span>
                        <div className="example-card-content">
                          <p className="example-de">
                            <Rich text={pat.pattern || ""} />
                          </p>
                          {pat.example && (
                            <p className="example-de" style={{ fontWeight: 600 }}>
                              {pat.example}
                            </p>
                          )}
                          {pat.meaning && (
                            <p className="example-en">
                              <Rich text={pat.meaning} />
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(sec.examples) && sec.examples.length > 0 && (
                <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Key Examples
                  </h3>
                  <ul className="study-rules-list">
                    {sec.examples.map((ex, ei) => (
                      <li key={ei}>
                        {typeof ex === "string" ? (
                          <Rich text={ex} />
                        ) : (
                          <span>
                            <strong>{ex.german || ex.de || ex.pair || ""}</strong>
                            {(ex.english || ex.en) && ` — ${ex.english || ex.en}`}
                            {ex.note && ` (${ex.note})`}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(sec.common_mistakes) && sec.common_mistakes.length > 0 && (
                <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Common Pitfalls to Avoid
                  </h3>
                  <div className="mistake-grid">
                    {sec.common_mistakes.map((m, mi) => (
                      <div key={mi} className="mistake-card">
                        <div className="mistake-row mistake-wrong">
                          <span className="mistake-tag tag-wrong">✕ Wrong</span>
                          <span className="mistake-text">{m.wrong || m.incorrect}</span>
                        </div>
                        <div className="mistake-row mistake-right">
                          <span className="mistake-tag tag-right">✓ Correct</span>
                          <span className="mistake-text">{m.correct}</span>
                        </div>
                        {(m.why || m.explanation) && (
                          <p className="mistake-why">{m.why || m.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sec.rules && sec.rules.length > 0 && (
                <ul className="study-rules-list">
                  {sec.rules.map((r, ri) => (
                    <li key={ri}>
                      <Rich text={r} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

        {/* 6. Standalone Bilingual Example Sentences */}
        {topic.examples && topic.examples.length > 0 && (
          <section className="study-section">
            <h2 className="study-section-heading">Examples in Context</h2>

            <div className="example-stack">
              {topic.examples.map((ex, idx) => (
                <div key={idx} className="example-block">
                  <p className="example-de">
                    <Rich text={ex.de} />
                  </p>
                  {ex.en && (
                    <p className="example-en">{ex.en}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. Memorization List (Quick Reference) */}
        {topic.memorizationList && topic.memorizationList.length > 0 && (
          <section className="study-section">
            <h2 className="study-section-heading">Quick Memorization List</h2>

            <div className="memo-grid">
              {topic.memorizationList.map((item, idx) => (
                <div key={idx} className="memo-item">
                  <strong className="memo-de">{item.german}</strong>
                  <span className="memo-en">{item.english}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. Vocabulary List (when present) */}
        {topic.vocabulary && topic.vocabulary.length > 0 && (
          <section className="study-section">
            <h2 className="study-section-heading">Essential Vocabulary</h2>

            <div className="vocab-list">
              {topic.vocabulary.map((item, idx) => (
                <div key={idx} className="vocab-row">
                  <div className="vocab-main">
                    <div className="vocab-word-line">
                      {item.article && (
                        <span className="vocab-article">{item.article}</span>
                      )}
                      <strong className="vocab-word">{item.word}</strong>
                      {item.plural && (
                        <span className="vocab-plural">({item.plural})</span>
                      )}
                    </div>
                    <div className="vocab-meaning">{item.meaning}</div>
                  </div>

                  {(item.exampleDe || item.synonym) && (
                    <div className="vocab-sub">
                      {item.exampleDe && (
                        <span className="vocab-ex-de">{item.exampleDe}</span>
                      )}
                      {item.exampleEn && (
                        <span className="vocab-ex-en">
                          {" "}
                          — {item.exampleEn}
                        </span>
                      )}
                      {item.synonym && (
                        <span className="vocab-synonym">
                          Synonym: {item.synonym}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 9. Common Mistakes Comparison */}
        {topic.commonMistakes && topic.commonMistakes.length > 0 && (
          <section className="study-section">
            <h2 className="study-section-heading">Common Mistakes</h2>
            <div className="mistakes-list">
              {topic.commonMistakes.map((m, idx) => (
                <div key={idx} className="mistake-card">
                  <div className="mistake-compare">
                    <div className="mistake-row mistake-incorrect">
                      <span className="mistake-label">
                        {m.isContext ? "Avoid" : "Incorrect"}
                      </span>
                      <span
                        className={
                          m.isContext
                            ? "mistake-context-text"
                            : "mistake-sentence"
                        }
                      >
                        {m.incorrect}
                      </span>
                    </div>
                    <div className="mistake-row mistake-correct">
                      <span className="mistake-label">Correct</span>
                      <span className="mistake-sentence">{m.correct}</span>
                    </div>
                  </div>
                  {m.explanation && (
                    <p className="mistake-reason">{m.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 10. Memory Callout ("Remember") */}
        {topic.note && (
          <aside className="remember-callout" aria-label="Memory tip">
            <div className="remember-icon">
              <LightbulbIcon size={18} />
            </div>
            <div className="remember-content">
              <span className="remember-title">Remember</span>
              <p>
                <Rich text={topic.note} />
              </p>
            </div>
          </aside>
        )}

        {/* 11. Mastery Goals Checklist */}
        {topic.masteryGoals && topic.masteryGoals.length > 0 && (
          <section className="study-section">
            <h2 className="study-section-heading">Mastery Goals</h2>
            <ul className="mastery-goals-list">
              {topic.masteryGoals.map((goal, idx) => (
                <li key={idx} className="mastery-goal-item">
                  <span className="mastery-check">
                    <CheckIcon size={14} />
                  </span>
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Study Strategy / Actionable Advice */}
        {topic.studyStrategy && topic.studyStrategy.length > 0 && (
          <section className="study-section">
            <h2 className="study-section-heading">Recommended Study Strategy</h2>
            <ol className="study-rules-list">
              {topic.studyStrategy.map((strat, idx) => (
                <li key={idx} style={{ marginBottom: "0.5rem" }}>
                  <Rich text={strat} />
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* 12. Full Verb Conjugation Directory (if topic has a verbs collection) */}
        {topic.verbs && topic.verbs.length > 0 && (
          <TopicVerbsSection verbs={topic.verbs} />
        )}

        {/* 12. Practice Exercises */}
        {topic.exercises && topic.exercises.length > 0 && (
          <section className="study-section no-print">
            <h2 className="study-section-heading">Quick Self-Check</h2>
            <div className="exercise-list">
              {topic.exercises.map((ex, idx) => {
                const isShown = !!revealedExercises[idx];
                return (
                  <div key={idx} className="exercise-item">
                    <div className="exercise-prompt-row">
                      <span className="exercise-num">{idx + 1}.</span>
                      <p className="exercise-prompt">{ex.prompt}</p>
                      <button
                        type="button"
                        onClick={() => toggleExercise(idx)}
                        className="exercise-reveal-btn"
                      >
                        {isShown ? "Hide Answer" : "Check Answer"}
                      </button>
                    </div>

                    {isShown && (
                      <div className="exercise-solution">
                        <strong>Answer: {ex.answer}</strong>
                        {ex.hint && <span> — {ex.hint}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Curriculum Next Topic Hint if present in JSON */}
        {topic.nextTopicMeta && (
          <div className="curriculum-next-banner">
            <span className="curriculum-next-label">Up Next in Curriculum</span>
            <strong>
              Topic #{topic.nextTopicMeta.number}: {topic.nextTopicMeta.title}
            </strong>
          </div>
        )}

        {/* Mark Topic Complete Banner */}
        <div className="study-complete-banner no-print">
          <button
            type="button"
            onClick={() => toggleReviewed(noteKey)}
            className={`complete-toggle-btn ${isReviewed ? "completed" : ""}`}
            style={{ fontSize: "15px", padding: "10px 22px" }}
            aria-pressed={isReviewed}
            title={isReviewed ? "Mark topic as incomplete" : "Mark topic as complete"}
          >
            <span
              className={`custom-checkbox ${isReviewed ? "checked" : ""}`}
              style={{ width: "20px", height: "20px" }}
            >
              {isReviewed && <CheckIcon size={13} />}
            </span>
            <span>{isReviewed ? "Topic Completed ✓" : "Mark Topic as Complete"}</span>
          </button>
        </div>

        {/* Prev / Next Topic Navigation */}
        <nav className="study-pager no-print" aria-label="Topic navigation">
          {prevTopic ? (
            <Link
              href={`/${folder.id}/${prevTopic.slug}`}
              className="study-pager-card"
            >
              <span className="study-pager-dir">
                <ArrowLeftIcon size={14} /> Previous in {folder.id}
              </span>
              <strong className="study-pager-title">{prevTopic.title}</strong>
              {prevTopic.titleEn && (
                <span className="study-pager-sub">{prevTopic.titleEn}</span>
              )}
            </Link>
          ) : (
            <div />
          )}

          {nextTopic ? (
            <Link
              href={`/${folder.id}/${nextTopic.slug}`}
              className="study-pager-card study-pager-next"
            >
              <span className="study-pager-dir">
                Next in {folder.id} <ArrowRightIcon size={14} />
              </span>
              <strong className="study-pager-title">{nextTopic.title}</strong>
              {nextTopic.titleEn && (
                <span className="study-pager-sub">{nextTopic.titleEn}</span>
              )}
            </Link>
          ) : (
            <div />
          )}
        </nav>

        {/* Related Topics */}
        {relatedTopics.length > 0 && (
          <section className="related-section no-print">
            <h2 className="related-heading">Related Study Notes</h2>
            <div className="related-grid">
              {relatedTopics.map((rel) => (
                <Link
                  key={`${rel.level}/${rel.slug}`}
                  href={`/${rel.level}/${rel.slug}`}
                  className="related-card"
                >
                  <div className="related-card-top">
                    <span
                      className={`level-badge level-badge-${rel.level.toLowerCase()}`}
                    >
                      {rel.level}
                    </span>
                    <span className="related-cat">{rel.category}</span>
                  </div>
                  <strong className="related-title">{rel.title}</strong>
                  {rel.titleEn && (
                    <span className="related-sub">{rel.titleEn}</span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
