"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStudy } from "./StudyProvider";
import {
  BookOpenIcon,
  SearchIcon,
  BookmarkIcon,
  MenuIcon,
  CloseIcon,
  ChevronRightIcon,
} from "./Icons";

function stripMd(text = "") {
  return String(text).replace(/\*\*|\*/g, "");
}

function getExcerpt(topic, query) {
  if (!query.trim()) {
    return stripMd(topic.plainSummary || topic.summary || "");
  }
  const q = query.trim().toLowerCase();

  // Check examples first for a concrete bilingual match
  if (topic.examples) {
    for (const ex of topic.examples) {
      const cleanDe = stripMd(ex.de);
      const cleanEn = stripMd(ex.en || "");
      if (
        cleanDe.toLowerCase().includes(q) ||
        cleanEn.toLowerCase().includes(q)
      ) {
        return `${cleanDe} — "${cleanEn}"`;
      }
    }
  }

  // Check vocabulary
  if (topic.vocabulary) {
    for (const v of topic.vocabulary) {
      if (
        v.word.toLowerCase().includes(q) ||
        v.meaning.toLowerCase().includes(q)
      ) {
        return `${v.article ? v.article + " " : ""}${v.word} — ${v.meaning}`;
      }
    }
  }

  // Check rules
  if (Array.isArray(topic.rules)) {
    for (const r of topic.rules) {
      if (typeof r !== "string") continue;
      const cleanRule = stripMd(r);
      if (cleanRule.toLowerCase().includes(q)) {
        return cleanRule;
      }
    }
  }

  // Check usage rules
  if (Array.isArray(topic.usageRules)) {
    for (const ur of topic.usageRules) {
      const cleanRule = stripMd(ur.rule || ur.title || "");
      if (cleanRule.toLowerCase().includes(q)) {
        return cleanRule;
      }
    }
  }

  return stripMd(topic.plainSummary || topic.summary || "");
}

function matchesTopic(topic, query) {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();

  if (topic.searchWords && topic.searchWords.toLowerCase().includes(q)) {
    return true;
  }

  const fields = [
    topic.title,
    topic.titleEn,
    topic.category,
    topic.fileName,
    topic.plainSummary,
    topic.summary,
  ];

  return fields.some((f) => f && String(f).toLowerCase().includes(q));
}

export default function Navbar() {
  const pathname = usePathname();
  const {
    allTopics,
    bookmarks,
    searchOpen,
    setSearchOpen,
  } = useStudy();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const filteredResults = useMemo(() => {
    return allTopics.filter((t) => {
      if (levelFilter === "BOOKMARKED") {
        if (!bookmarks.includes(`${t.level}/${t.slug}`)) return false;
      } else if (levelFilter !== "ALL" && t.level !== levelFilter) {
        return false;
      }
      return matchesTopic(t, searchQuery);
    });
  }, [allTopics, bookmarks, levelFilter, searchQuery]);

  const isCollectionActive = pathname === "/";
  const isTestActive = pathname.startsWith("/test");
  const isVocabActive = pathname.startsWith("/vocab");
  const activeLevel =
    pathname.startsWith("/A1")
      ? "A1"
      : pathname.startsWith("/A2")
      ? "A2"
      : pathname.startsWith("/B1")
      ? "B1"
      : null;

  return (
    <>
      <header className="site-nav">
        <div className="site-nav-inner">
          {/* Left: Brand & Optional Breadcrumb */}
          <div className="site-nav-left">
            <Link
              href="/"
              className="site-brand"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="site-brand-icon">
                <BookOpenIcon size={17} />
              </span>
              <span className="site-brand-name">Study Atelier</span>
            </Link>

            {activeLevel && (
              <div className="nav-crumb-inline" aria-label="Current section">
                <ChevronRightIcon size={14} className="nav-crumb-sep" />
                <Link href={`/${activeLevel}`} className="nav-crumb-level">
                  {activeLevel}
                </Link>
              </div>
            )}
          </div>

          {/* Right: Desktop Navigation */}
          <nav className="site-nav-links" aria-label="Main navigation">
            <Link
              href="/"
              className={`nav-item ${isCollectionActive ? "nav-item-active" : ""}`}
            >
              Collection
            </Link>

            <Link
              href="/A1"
              className={`nav-item ${activeLevel === "A1" ? "nav-item-active" : ""}`}
            >
              <span className="level-dot level-dot-a1" />
              A1
            </Link>

            <Link
              href="/A2"
              className={`nav-item ${activeLevel === "A2" ? "nav-item-active" : ""}`}
            >
              <span className="level-dot level-dot-a2" />
              A2
            </Link>

            <Link
              href="/B1"
              className={`nav-item ${activeLevel === "B1" ? "nav-item-active" : ""}`}
            >
              <span className="level-dot level-dot-b1" />
              B1
            </Link>

            <Link
              href="/vocab"
              className={`nav-item ${isVocabActive ? "nav-item-active" : ""}`}
            >
              Vocabulary
            </Link>

            <Link
              href="/test"
              className={`nav-item ${isTestActive ? "nav-item-active" : ""}`}
            >
              Tests
            </Link>

            <button
              type="button"
              className="nav-search-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search study notes"
            >
              <SearchIcon size={15} />
              <span>Search</span>
              <kbd className="nav-kbd">⌘K</kbd>
            </button>
          </nav>

          {/* Mobile Controls */}
          <div className="site-nav-mobile-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search study notes"
            >
              <SearchIcon size={17} />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Collapsible Drawer */}
        {mobileMenuOpen && (
          <>
            <div
              className="mobile-drawer-backdrop"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <nav className="mobile-drawer" aria-label="Mobile navigation">
              <Link
                href="/"
                className={`mobile-nav-link ${isCollectionActive ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Collection
              </Link>
              <Link
                href="/A1"
                className={`mobile-nav-link ${activeLevel === "A1" ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="level-dot level-dot-a1" /> A1 — Beginner Foundations
              </Link>
              <Link
                href="/A2"
                className={`mobile-nav-link ${activeLevel === "A2" ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="level-dot level-dot-a2" /> A2 — Elementary Expression
              </Link>
              <Link
                href="/B1"
                className={`mobile-nav-link ${activeLevel === "B1" ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="level-dot level-dot-b1" /> B1 — Intermediate Mastery
              </Link>
              <Link
                href="/vocab"
                className={`mobile-nav-link ${isVocabActive ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                🗂️ Vocabulary Cards (A1 Topics 2–44)
              </Link>
              <Link
                href="/test"
                className={`mobile-nav-link ${isTestActive ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Tests & Progress Cards
              </Link>
            </nav>
          </>
        )}
      </header>

      {/* Global Search Modal */}
      {searchOpen && (
        <div
          className="search-backdrop"
          onClick={() => setSearchOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Search study library"
        >
          <div
            className="search-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="search-input-bar">
              <SearchIcon size={18} className="search-input-icon" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search German words, English meanings, titles, or example sentences..."
                className="search-dialog-input"
              />
              <button
                type="button"
                className="search-close-btn"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                <span className="search-close-desktop">Esc</span>
                <span className="search-close-mobile"><CloseIcon size={16} /></span>
              </button>
            </div>

            <div className="search-filter-bar">
              {["ALL", "A1", "A2", "B1", "BOOKMARKED"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevelFilter(lvl)}
                  className={`search-filter-pill ${
                    levelFilter === lvl ? "active" : ""
                  }`}
                >
                  {lvl === "ALL"
                    ? "All Levels"
                    : lvl === "BOOKMARKED"
                    ? `Saved (${bookmarks.length})`
                    : lvl}
                </button>
              ))}
            </div>

            <div className="search-results-area">
              {filteredResults.length === 0 ? (
                <div className="search-empty">
                  <p className="search-empty-title">No matching notes found</p>
                  <p className="search-empty-sub">
                    Try searching for a German word (e.g. <em>weil</em>,{" "}
                    <em>den</em>), an English concept (e.g. <em>passive</em>,{" "}
                    <em>past</em>), or switch level filters.
                  </p>
                </div>
              ) : (
                <ul className="search-results-list">
                  {filteredResults.map((item) => (
                    <li key={`${item.level}/${item.slug}`}>
                      <Link
                        href={`/${item.level}/${item.slug}`}
                        className="search-result-item"
                        onClick={() => setSearchOpen(false)}
                      >
                        <div className="search-result-top">
                          <span
                            className={`level-badge level-badge-${item.level.toLowerCase()}`}
                          >
                            {item.level}
                          </span>
                          <span className="search-result-cat">
                            {item.category}
                          </span>
                          <span className="search-result-num">
                            § {item.number}
                          </span>
                        </div>
                        <div className="search-result-title">
                          <strong>{item.title}</strong>
                          {item.titleEn && (
                            <span className="search-result-subtitle">
                              {" "}
                              — {item.titleEn}
                            </span>
                          )}
                        </div>
                        <p className="search-result-excerpt">
                          {getExcerpt(item, searchQuery)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
