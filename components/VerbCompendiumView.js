"use client";

import { useState, useMemo, useEffect } from "react";
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
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'unlearned' | 'learned'
  const [showLearningOrder, setShowLearningOrder] = useState(false);
  const [learnedVerbs, setLearnedVerbs] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

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

  // Load learned verbs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("a1_learned_verbs_v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setLearnedVerbs(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load learned verbs from localStorage", e);
    }
    setIsHydrated(true);
  }, []);

  // Toggle learned status for a verb
  const toggleLearned = (infinitive) => {
    setLearnedVerbs((prev) => {
      const isAlready = prev.includes(infinitive);
      const next = isAlready
        ? prev.filter((item) => item !== infinitive)
        : [...prev, infinitive];
      try {
        localStorage.setItem("a1_learned_verbs_v1", JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save learned verbs to localStorage", e);
      }
      return next;
    });
  };

  const handleResetProgress = () => {
    if (typeof window !== "undefined" && window.confirm("Reset your learned verbs progress?")) {
      setLearnedVerbs([]);
      try {
        localStorage.removeItem("a1_learned_verbs_v1");
      } catch (e) {
        console.error("Failed to clear learned verbs from localStorage", e);
      }
    }
  };

  const learnedSet = useMemo(() => new Set(learnedVerbs), [learnedVerbs]);

  const totalCount = allVerbsWithGroup.length;
  const learnedCount = useMemo(() => {
    return allVerbsWithGroup.filter((v) => learnedSet.has(v.infinitive)).length;
  }, [allVerbsWithGroup, learnedSet]);
  const unlearnedCount = totalCount - learnedCount;
  const percentLearned = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

  // Filter verbs based on selected group, status filter & search query
  const filteredVerbs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allVerbsWithGroup.filter((v) => {
      if (selectedGroup !== "all" && v.groupKey !== selectedGroup) {
        return false;
      }
      const isLearned = learnedSet.has(v.infinitive);
      if (statusFilter === "learned" && !isLearned) return false;
      if (statusFilter === "unlearned" && isLearned) return false;

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
  }, [allVerbsWithGroup, selectedGroup, statusFilter, learnedSet, searchQuery]);

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
          {compendium?.purpose ||
            `Learn verbs by conjugation pattern instead of memorising ${allVerbsWithGroup.length} unrelated tables.`}
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

        {/* Learning Progress Card */}
        <div className="verbs-progress-card">
          <div className="verbs-progress-header">
            <div className="verbs-progress-info">
              <span className="verbs-progress-label">Learning Progress</span>
              <span className="verbs-progress-stats">
                <strong>{isHydrated ? learnedCount : 0}</strong> of <strong>{totalCount}</strong> verbs learned ({isHydrated ? percentLearned : 0}%)
              </span>
            </div>
            {isHydrated && learnedCount > 0 && (
              <button
                type="button"
                className="verbs-reset-btn"
                onClick={handleResetProgress}
                title="Reset all learned verbs"
              >
                Reset Progress
              </button>
            )}
          </div>
          <div className="verbs-progress-track">
            <div
              className="verbs-progress-fill"
              style={{ width: `${isHydrated ? percentLearned : 0}%` }}
              role="progressbar"
              aria-valuenow={isHydrated ? percentLearned : 0}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </div>
      </div>

      {/* Controls: Search and Group Filter Tabs */}
      <div className="verbs-controls">
        <div className="level-search-wrap">
          <SearchIcon size={16} className="level-search-icon" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${allVerbsWithGroup.length} verbs (e.g. kommen, to speak, bin)...`}
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

      {/* Verbs Count Status & Status Filter */}
      <div className="verbs-results-count">
        <div className="verbs-count-left">
          <span>
            Showing {filteredVerbs.length} of {allVerbsWithGroup.length} verbs
          </span>
          {searchQuery && (
            <button type="button" className="clear-search-btn" onClick={() => setSearchQuery("")}>
              Clear search
            </button>
          )}
        </div>

        {/* Quick Filter: All | To Learn | Learned */}
        <div className="verbs-status-filters" role="group" aria-label="Filter by learning status">
          <button
            type="button"
            className={`verbs-status-filter-btn ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            className={`verbs-status-filter-btn ${statusFilter === "unlearned" ? "active" : ""}`}
            onClick={() => setStatusFilter("unlearned")}
          >
            To Learn ({isHydrated ? unlearnedCount : totalCount})
          </button>
          <button
            type="button"
            className={`verbs-status-filter-btn ${statusFilter === "learned" ? "active" : ""}`}
            onClick={() => setStatusFilter("learned")}
          >
            Learned ({isHydrated ? learnedCount : 0})
          </button>
        </div>
      </div>

      {/* Verbs Grid */}
      {filteredVerbs.length === 0 ? (
        <div className="empty-box">
          <p className="empty-box-title">No verbs matched your filter</p>
          <p className="empty-box-sub">
            {statusFilter === "learned"
              ? "You haven't marked any verbs as learned yet in this view. Check off verbs as you learn them!"
              : "Try adjusting your search or switching group filters."}
          </p>
        </div>
      ) : (
        <div className="verbs-grid">
          {filteredVerbs.map((verb, idx) => {
            const isLearned = isHydrated && learnedSet.has(verb.infinitive);
            return (
              <div
                key={`${verb.infinitive}-${idx}`}
                className={`verb-card ${isLearned ? "is-learned" : ""}`}
              >
                <div className="verb-card-header">
                  <div className="verb-card-top-row">
                    <h3 className="verb-infinitive">{verb.infinitive}</h3>
                    <button
                      type="button"
                      onClick={() => toggleLearned(verb.infinitive)}
                      className={`verb-check-btn ${isLearned ? "checked" : ""}`}
                      title={isLearned ? `Mark "${verb.infinitive}" as not learned` : `Mark "${verb.infinitive}" as learned`}
                      aria-label={isLearned ? `Mark "${verb.infinitive}" as not learned` : `Mark "${verb.infinitive}" as learned`}
                    >
                      <span className={`custom-checkbox ${isLearned ? "checked" : ""}`}>
                        {isLearned && <CheckIcon size={12} />}
                      </span>
                      <span className="verb-check-label">{isLearned ? "Done" : "Learn"}</span>
                    </button>
                  </div>

                  <div className="verb-card-sub-row">
                    <span className="verb-english">{verb.english}</span>
                  </div>

                  {verb.pattern_or_note && (
                    <div className="verb-pattern-row">
                      <span className="verb-pattern-pill" title={verb.pattern_or_note}>
                        {verb.pattern_or_note}
                      </span>
                    </div>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
