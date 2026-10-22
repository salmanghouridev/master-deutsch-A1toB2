"use client";

import { useState, useMemo } from "react";
import { SearchIcon, BookOpenIcon, CheckIcon } from "./Icons";

const GROUP_LABELS = {
  all: "All Verbs",
  memorize_first_irregular: "1. Memorize First",
  stem_changing: "2. Stem-Changing (e→i, a→ä)",
  regular_present_tense: "3. Regular Present Tense",
  separable_verbs: "4. Separable Verbs",
  modal_verbs_and_moechten: "5. Modal Verbs & möchten",
  reflexive_verbs: "6. Reflexive Verbs",
  pronunciation_spelling_adjustment: "7. Spelling Adjustments",
};

export default function VerbCompendiumView({ compendium }) {
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLearningOrder, setShowLearningOrder] = useState(false);

  const groups = compendium?.groups || {};

  // Flatten all verbs with their group key
  const allVerbsWithGroup = useMemo(() => {
    const list = [];
    for (const [groupKey, verbs] of Object.entries(groups)) {
      if (Array.isArray(verbs)) {
        for (const v of verbs) {
          list.push({ ...v, groupKey, groupName: GROUP_LABELS[groupKey] || groupKey });
        }
      }
    }
    return list;
  }, [groups]);

  // Filter verbs based on selected group & search query
  const filteredVerbs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allVerbsWithGroup.filter((v) => {
      if (selectedGroup !== "all" && v.groupKey !== selectedGroup) {
        return false;
      }
      if (!q) return true;
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
  }, [allVerbsWithGroup, selectedGroup, searchQuery]);

  return (
    <div className="verbs-compendium-shell">
      {/* Header Info */}
      <div className="verbs-header-card">
        <div className="verbs-header-badge-row">
          <span className="level-badge level-badge-a1">A1 Reference Library</span>
          <span className="meta-muted">{allVerbsWithGroup.length} Essential Verbs</span>
        </div>
        <h2 className="verbs-compendium-title">{compendium?.title || "A1 German Verbs by Pattern"}</h2>
        <p className="verbs-compendium-purpose">
          {compendium?.purpose || "Learn verbs by conjugation pattern instead of memorising 115 unrelated tables."}
        </p>

        {/* Regular Endings Quick Reference Strip */}
        {compendium?.regular_endings && (
          <div className="regular-endings-strip">
            <span className="endings-strip-label">Regular Endings:</span>
            <div className="endings-chips">
              {compendium.regular_endings.map((re) => (
                <span key={re.pronoun} className="ending-chip">
                  <span className="ending-pronoun">{re.pronoun}</span>
                  <strong className="ending-suffix">{re.ending}</strong>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Toggleable Learning Order */}
        {compendium?.recommended_learning_order && (
          <div className="learning-order-container">
            <button
              type="button"
              className="toggle-order-btn"
              onClick={() => setShowLearningOrder((prev) => !prev)}
            >
              <BookOpenIcon size={14} />
              <span>{showLearningOrder ? "Hide Recommended Learning Order" : "Show 7-Step Recommended Learning Order"}</span>
            </button>
            {showLearningOrder && (
              <ol className="learning-order-list">
                {compendium.recommended_learning_order.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>

      {/* Controls: Search and Group Filter Tabs */}
      <div className="verbs-controls">
        <div className="level-search-wrap">
          <SearchIcon size={16} className="level-search-icon" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 115 verbs (e.g. kommen, to speak, bin)..."
            className="level-search-input"
          />
        </div>

        <div className="verbs-group-tabs">
          <button
            type="button"
            className={`verbs-group-btn ${selectedGroup === "all" ? "active" : ""}`}
            onClick={() => setSelectedGroup("all")}
          >
            All ({allVerbsWithGroup.length})
          </button>
          {Object.entries(groups).map(([gKey, gVerbs]) => (
            <button
              key={gKey}
              type="button"
              className={`verbs-group-btn ${selectedGroup === gKey ? "active" : ""}`}
              onClick={() => setSelectedGroup(gKey)}
            >
              {GROUP_LABELS[gKey] || gKey} ({gVerbs.length})
            </button>
          ))}
        </div>
      </div>

      {/* Verbs Count Status */}
      <div className="verbs-results-count">
        <span>Showing {filteredVerbs.length} of {allVerbsWithGroup.length} verbs</span>
        {searchQuery && (
          <button type="button" className="clear-search-btn" onClick={() => setSearchQuery("")}>
            Clear search
          </button>
        )}
      </div>

      {/* Verbs Grid */}
      {filteredVerbs.length === 0 ? (
        <div className="empty-box">
          <p className="empty-box-title">No verbs matched your search</p>
          <p className="empty-box-sub">Try searching for another verb or clearing the filter.</p>
        </div>
      ) : (
        <div className="verbs-grid">
          {filteredVerbs.map((verb, idx) => (
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

              {/* 6-form Conjugation Table */}
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
      )}
    </div>
  );
}
