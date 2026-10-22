"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useStudy } from "./StudyProvider";
import VerbCompendiumView from "./VerbCompendiumView";
import {
  SearchIcon,
  BookmarkIcon,
  CheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  BookOpenIcon,
} from "./Icons";

export default function LevelCollectionView({ folder, allLevels = [] }) {
  const { bookmarks, reviewed, toggleBookmark } = useStudy();
  const isA1 = folder.id === "A1";
  const [activeTab, setActiveTab] = useState(isA1 ? "foundations" : "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const foundationsCount = useMemo(
    () => folder.topics.filter((t) => t.order <= 17).length,
    [folder.topics]
  );
  const applyingCount = useMemo(
    () => folder.topics.filter((t) => t.order >= 18).length,
    [folder.topics]
  );

  // Derive available categories from actual topics in this level
  const categories = useMemo(() => {
    const set = new Set();
    for (const t of folder.topics) {
      if (t.category) set.add(t.category);
    }
    return ["All", ...Array.from(set)];
  }, [folder.topics]);

  const filteredTopics = useMemo(() => {
    return folder.topics.filter((t) => {
      // Tab filter for A1
      if (isA1) {
        if (activeTab === "foundations" && t.order > 17) return false;
        if (activeTab === "applying" && t.order < 18) return false;
      }
      // Category sub-pill filter
      if (selectedCategory !== "All" && t.category !== selectedCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      const haystack = [
        t.title,
        t.titleEn,
        t.plainSummary,
        t.category,
        t.fileName,
        ...(t.examples || []).map((e) => `${e.de} ${e.en}`),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [folder.topics, isA1, activeTab, selectedCategory, searchQuery]);

  const reviewedInLevel = folder.topics.filter((t) =>
    reviewed.includes(`${folder.id}/${t.slug}`)
  ).length;

  return (
    <div className="collection-container">
      {/* Top Breadcrumb & Level Switcher */}
      <div className="level-topbar">
        <Link href="/" className="back-collection-link">
          <ArrowLeftIcon size={14} />
          <span>Collection</span>
        </Link>

        <div className="level-pills-switch" aria-label="Switch level">
          {allLevels.map((lvl) => (
            <Link
              key={lvl.id}
              href={`/${lvl.id}`}
              className={`level-switch-btn ${
                lvl.id === folder.id ? "active" : ""
              }`}
            >
              {lvl.id}
            </Link>
          ))}
        </div>
      </div>

      {/* Level Editorial Header */}
      <header className="level-hero">
        <div className="level-hero-meta">
          <span
            className={`level-badge level-badge-${folder.id.toLowerCase()}`}
          >
            CEFR {folder.id}
          </span>
          <span className="meta-dot">·</span>
          <span className="meta-muted">
            {folder.topics.length}{" "}
            {folder.topics.length === 1 ? "study note" : "study notes"}
          </span>
          {reviewedInLevel > 0 && (
            <>
              <span className="meta-dot">·</span>
              <span className="meta-reviewed">
                {reviewedInLevel} of {folder.topics.length} reviewed
              </span>
            </>
          )}
        </div>

        <h1 className="level-hero-title">
          {folder.id} — {folder.name}
        </h1>
        <p className="level-hero-desc">{folder.description}</p>
      </header>

      {/* Level Section Tabs (Foundations vs Applying vs Verbs) */}
      <div className="level-section-tabs" role="tablist">
        {isA1 ? (
          <>
            <button
              type="button"
              className={`section-tab-btn ${
                activeTab === "foundations" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("foundations");
                setSelectedCategory("All");
              }}
            >
              <BookOpenIcon size={16} />
              <span>Grammar Foundations (0–17)</span>
              <span className="tab-count-badge">{foundationsCount}</span>
            </button>

            <button
              type="button"
              className={`section-tab-btn ${
                activeTab === "applying" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("applying");
                setSelectedCategory("All");
              }}
            >
              <span>🚀 Applying Grammar (18–34)</span>
              <span className="tab-count-badge">{applyingCount}</span>
            </button>

            <button
              type="button"
              className={`section-tab-btn ${
                activeTab === "all" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("all");
                setSelectedCategory("All");
              }}
            >
              <span>All Topics</span>
              <span className="tab-count-badge">{folder.topics.length}</span>
            </button>

            {folder.verbCompendium && (
              <button
                type="button"
                className={`section-tab-btn ${
                  activeTab === "verbs" ? "active" : ""
                }`}
                onClick={() => setActiveTab("verbs")}
              >
                <span>⚡ Verb Patterns</span>
                <span className="tab-count-badge">115</span>
              </button>
            )}
          </>
        ) : (
          <>
            <button
              type="button"
              className={`section-tab-btn ${
                activeTab === "all" ? "active" : ""
              }`}
              onClick={() => setActiveTab("all")}
            >
              <BookOpenIcon size={16} />
              <span>Grammar Topics</span>
              <span className="tab-count-badge">{folder.topics.length}</span>
            </button>

            {folder.verbCompendium && (
              <button
                type="button"
                className={`section-tab-btn ${
                  activeTab === "verbs" ? "active" : ""
                }`}
                onClick={() => setActiveTab("verbs")}
              >
                <span>⚡ Verb Conjugation Patterns</span>
                <span className="tab-count-badge">115</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Tab 2: Verb Conjugation Patterns */}
      {activeTab === "verbs" && folder.verbCompendium && (
        <VerbCompendiumView compendium={folder.verbCompendium} />
      )}

      {/* Tab 1: Grammar Topics (Foundations, Applying, or All) */}
      {activeTab !== "verbs" && (
        <>
          {/* Informational Guidance Banner for A1 Tab Sections */}
          {isA1 && activeTab === "foundations" && (
            <div
              className="tab-banner"
              style={{
                background: "var(--surface-main, #ffffff)",
                border: "1px solid var(--border-color, #e5e7eb)",
                borderRadius: "8px",
                padding: "14px 18px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "14px",
              }}
            >
              <div>
                <strong style={{ fontSize: "0.98rem", color: "var(--text-primary, #111)" }}>
                  Part 1: Grammar Foundations (Topics 0 to 17)
                </strong>
                <p style={{ margin: "4px 0 0", fontSize: "0.88rem", color: "var(--text-secondary, #666)", lineHeight: 1.5 }}>
                  The essential core rules: pronouns, present tense, articles, cases (Nominativ & Akkusativ), negation, sentence structure, modal verbs, and imperative.
                </p>
              </div>
              <span className="level-badge level-badge-a1" style={{ whiteSpace: "nowrap" }}>
                18 Topics
              </span>
            </div>
          )}

          {isA1 && activeTab === "applying" && (
            <div
              className="tab-banner"
              style={{
                background: "var(--surface-main, #ffffff)",
                border: "1px solid var(--border-color, #e5e7eb)",
                borderRadius: "8px",
                padding: "14px 18px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "14px",
              }}
            >
              <div>
                <strong style={{ fontSize: "0.98rem", color: "var(--text-primary, #111)" }}>
                  Part 2: Applying Grammar (Topics 18 to 34)
                </strong>
                <p style={{ margin: "4px 0 0", fontSize: "0.88rem", color: "var(--text-secondary, #666)", lineHeight: 1.5 }}>
                  Real-world application: Dativ case, prepositions of place and time, conjunctions, adjective endings, demonstratives, frequency, daily routines, and Perfekt past tense.
                </p>
              </div>
              <span className="level-badge level-badge-a1" style={{ whiteSpace: "nowrap" }}>
                17 Topics
              </span>
            </div>
          )}

          {/* Level Search & Category Filters */}
          <div className="level-controls">
            <div className="level-search-wrap">
              <SearchIcon size={16} className="level-search-icon" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search within ${folder.id} notes...`}
                className="level-search-input"
                aria-label={`Search within ${folder.id} notes`}
              />
            </div>

            {activeTab === "all" && categories.length > 1 && (
              <div
                className="category-pills"
                role="tablist"
                aria-label="Filter by category"
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`category-pill ${
                      selectedCategory === cat ? "active" : ""
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Topic Cards Grid / List */}
          {filteredTopics.length === 0 ? (
            <div className="empty-box">
              <p className="empty-box-title">No study notes match your filter</p>
              <p className="empty-box-sub">
                Try clearing your search query or selecting another category.
              </p>
            </div>
          ) : (
            <div className="topic-cards-grid">
              {filteredTopics.map((topic) => {
                const key = `${folder.id}/${topic.slug}`;
                const isSaved = bookmarks.includes(key);
                const isDone = reviewed.includes(key);

                return (
                  <article key={topic.slug} className="topic-card">
                    <div className="topic-card-top">
                      <div className="topic-card-badges">
                        <span className="section-tag">§ {topic.number}</span>
                        <span className="category-tag">{topic.category}</span>
                        {isDone && (
                          <span className="reviewed-pill">
                            <CheckIcon size={12} /> Reviewed
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleBookmark(key)}
                        className={`bookmark-icon-btn ${isSaved ? "saved" : ""}`}
                        aria-label={isSaved ? "Remove bookmark" : "Bookmark note"}
                        title={isSaved ? "Saved" : "Save note"}
                      >
                        <BookmarkIcon size={15} filled={isSaved} />
                      </button>
                    </div>

                    <Link
                      href={`/${folder.id}/${topic.slug}`}
                      className="topic-card-body"
                    >
                      <h2 className="topic-card-title">{topic.title}</h2>
                      {topic.titleEn && (
                        <p className="topic-card-subtitle">{topic.titleEn}</p>
                      )}
                      <p className="topic-card-summary">{topic.plainSummary}</p>

                      <div className="topic-card-footer">
                        <div className="topic-card-meta">
                          <span>{topic.readingMinutes} min read</span>
                          <span className="meta-dot">·</span>
                          <code className="meta-filename">{topic.fileName}</code>
                        </div>

                        <span className="topic-card-cta">
                          Read note <ArrowRightIcon size={14} />
                        </span>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
