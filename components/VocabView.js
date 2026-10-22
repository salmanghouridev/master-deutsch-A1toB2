"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Volume2Icon,
  StarIcon,
  PlayIcon,
  PauseIcon,
  ShuffleIcon,
  MaximizeIcon,
  MinimizeIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  RotateCcwIcon,
  LightbulbIcon,
  CheckIcon,
  SearchIcon,
  BookOpenIcon,
} from "./Icons";
import { generateHint } from "@/lib/vocab";

function playGermanPronunciation(text) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const clean = text
      .replace(/,\s*[-–—\wäöüÄÖÜß]+.*$/i, "")
      .replace(/\s*\([^)]*\)/g, "")
      .trim();
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = "de-DE";
    utter.rate = 0.88;
    window.speechSynthesis.speak(utter);
  } catch (err) {
    console.warn("Speech synthesis error:", err);
  }
}

export default function VocabView({ vocabData }) {
  const { topics = [], allWords = [] } = vocabData || {};

  // Persistence State
  const [starredIds, setStarredIds] = useState([]);
  const [masteredIds, setMasteredIds] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Deck Selection & Filters
  const [selectedTopicNum, setSelectedTopicNum] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [activeTab, setActiveTab] = useState("flashcards"); // 'flashcards' | 'directory' | 'list'

  // Flashcard Deck State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hintLevel, setHintLevel] = useState(2); // default 2-letter hint as requested!
  const [guessInput, setGuessInput] = useState("");
  const [guessFeedback, setGuessFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const autoPlayTimerRef = useRef(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const sStored = localStorage.getItem("a1_vocab_starred_v1");
      if (sStored) {
        const parsed = JSON.parse(sStored);
        if (Array.isArray(parsed)) setStarredIds(parsed);
      }
      const mStored = localStorage.getItem("a1_vocab_mastered_v1");
      if (mStored) {
        const parsed = JSON.parse(mStored);
        if (Array.isArray(parsed)) setMasteredIds(parsed);
      }
    } catch (e) {
      console.warn("Failed to read localStorage:", e);
    }
    setIsHydrated(true);
  }, []);

  // Save Starred to localStorage
  const toggleStar = useCallback((id) => {
    setStarredIds((prev) => {
      const isStarred = prev.includes(id);
      const next = isStarred ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("a1_vocab_starred_v1", JSON.stringify(next));
      } catch (e) {
        console.warn("Failed to save starred:", e);
      }
      return next;
    });
  }, []);

  // Save Mastered to localStorage
  const toggleMastered = useCallback((id) => {
    setMasteredIds((prev) => {
      const isMastered = prev.includes(id);
      const next = isMastered ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("a1_vocab_mastered_v1", JSON.stringify(next));
      } catch (e) {
        console.warn("Failed to save mastered:", e);
      }
      return next;
    });
  }, []);

  // Filter words for the deck
  const activeDeck = useMemo(() => {
    let list = allWords;

    if (selectedTopicNum !== "all") {
      const tNum = parseInt(selectedTopicNum, 10);
      list = list.filter((w) => w.topicNumber === tNum);
    } else if (selectedCategory !== "All") {
      list = list.filter((w) => w.category === selectedCategory);
    }

    if (onlyStarred) {
      const sSet = new Set(starredIds);
      list = list.filter((w) => sSet.has(w.id));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (w) =>
          w.german.toLowerCase().includes(q) ||
          w.english.toLowerCase().includes(q) ||
          w.cleanGerman.toLowerCase().includes(q)
      );
    }

    if (isShuffled) {
      // Deterministic-ish shuffle or clone
      const shuffled = [...list];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }

    return list;
  }, [allWords, selectedTopicNum, selectedCategory, onlyStarred, searchQuery, isShuffled, starredIds]);

  // Current Card
  const currentCard = activeDeck[currentIndex] || activeDeck[0] || null;
  const isStarred = currentCard && starredIds.includes(currentCard.id);
  const isMastered = currentCard && masteredIds.includes(currentCard.id);

  // Reset card state when moving to next/prev card
  const resetCardInteractions = useCallback(() => {
    setIsFlipped(false);
    setHintLevel(2);
    setGuessInput("");
    setGuessFeedback(null);
  }, []);

  // Next / Prev Handlers
  const handleNext = useCallback(() => {
    if (activeDeck.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % activeDeck.length);
    resetCardInteractions();
  }, [activeDeck.length, resetCardInteractions]);

  const handlePrev = useCallback(() => {
    if (activeDeck.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + activeDeck.length) % activeDeck.length);
    resetCardInteractions();
  }, [activeDeck.length, resetCardInteractions]);

  // Auto-play interval
  useEffect(() => {
    if (!isAutoPlaying) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      // Flip first, then advance
      setIsFlipped((flipped) => {
        if (!flipped) {
          // Play speech on flip
          if (currentCard) playGermanPronunciation(currentCard.cleanGerman);
          return true;
        } else {
          handleNext();
          return false;
        }
      });
    }, 3800);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlaying, currentCard, handleNext]);

  // Check user answer
  const handleCheckAnswer = (e) => {
    if (e) e.preventDefault();
    if (!currentCard || !guessInput.trim()) return;

    const inputClean = guessInput.trim().toLowerCase();
    const deClean = currentCard.cleanGerman.toLowerCase();
    const baseClean = currentCard.baseWord.toLowerCase();

    // Check with or without article
    const isCorrect =
      inputClean === deClean ||
      inputClean === baseClean ||
      inputClean === currentCard.german.toLowerCase();

    if (isCorrect) {
      setGuessFeedback("correct");
      playGermanPronunciation(currentCard.cleanGerman);
      if (!isMastered) toggleMastered(currentCard.id);
      setTimeout(() => {
        setIsFlipped(true);
      }, 400);
    } else {
      setGuessFeedback("wrong");
    }
  };

  // Keyboard navigation
  useEffect(() => {
    function onKeyDown(e) {
      if (activeTab !== "flashcards") return;
      // Don't intercept if user is typing in the input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        if (e.key === "Enter") {
          handleCheckAnswer(e);
        }
        return;
      }

      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        setIsFlipped((v) => !v);
      } else if (e.key === "ArrowRight" || e.key === "j" || e.key === "J") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "k" || e.key === "K") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        if (currentCard) playGermanPronunciation(currentCard.cleanGerman);
      } else if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        if (currentCard) toggleStar(currentCard.id);
      } else if (e.key === "h" || e.key === "H") {
        e.preventDefault();
        setHintLevel((prev) => (prev >= 4 ? 1 : prev + 1));
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeTab, currentCard, handleNext, handlePrev, toggleStar, isMastered]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Categories list
  const categories = ["All", ...new Set(topics.map((t) => t.category))];

  // Current Hint Text
  const currentHintText = useMemo(() => {
    if (!currentCard) return "";
    return generateHint(currentCard.german, currentCard.article, hintLevel);
  }, [currentCard, hintLevel]);

  // Selected topic object (if any)
  const selectedTopic = useMemo(() => {
    if (selectedTopicNum === "all") return null;
    const num = parseInt(selectedTopicNum, 10);
    return topics.find((t) => t.number === num) || null;
  }, [topics, selectedTopicNum]);

  // Progress stats
  const totalCards = allWords.length;
  const masteredCount = isHydrated ? masteredIds.length : 0;
  const starredCount = isHydrated ? starredIds.length : 0;
  const progressPct = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;

  return (
    <div
      ref={containerRef}
      className={`vocab-shell ${isFullscreen ? "vocab-fullscreen-mode" : ""}`}
    >
      {/* ── Top Header Card ────────────────────────────────────── */}
      <div className="vocab-header-card">
        <div className="vocab-header-meta-row">
          <span className="level-badge level-badge-a1">A1 Vocabulary Library</span>
          <span className="meta-muted">43 Topics · {totalCards} Essential Words</span>
          {onlyStarred && (
            <span className="vocab-filter-active-pill">⭐ Starred ({starredCount})</span>
          )}
        </div>

        <h1 className="vocab-main-title">German A1 Vocabulary Flashcards</h1>
        <p className="vocab-main-sub">
          Master essential German words with visual memory cards, 1–2 letter recall hints, native German speech, and spaced repetition.
        </p>

        {/* Live Mastery Bar */}
        <div className="vocab-progress-card">
          <div className="vocab-progress-header">
            <div className="vocab-progress-info">
              <span className="vocab-progress-label">Overall Mastery:</span>
              <span className="vocab-progress-stats">
                <strong>{masteredCount}</strong> of <strong>{totalCards}</strong> words mastered ({progressPct}%)
              </span>
              <span className="meta-dot">·</span>
              <span className="vocab-starred-stat">⭐ {starredCount} starred</span>
            </div>
            {masteredCount > 0 && (
              <button
                type="button"
                className="vocab-reset-btn"
                onClick={() => {
                  if (window.confirm("Reset all mastered vocabulary progress?")) {
                    setMasteredIds([]);
                    localStorage.removeItem("a1_vocab_mastered_v1");
                  }
                }}
              >
                Reset Progress
              </button>
            )}
          </div>
          <div className="vocab-progress-track">
            <div
              className="vocab-progress-fill"
              style={{ width: `${progressPct}%` }}
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </div>
      </div>

      {/* ── Section Mode Tabs: Flashcards | Topic Directory | Word List ──── */}
      <div className="vocab-mode-tabs-bar">
        <div className="vocab-mode-tabs">
          <button
            type="button"
            className={`vocab-mode-btn ${activeTab === "flashcards" ? "active" : ""}`}
            onClick={() => setActiveTab("flashcards")}
          >
            <span>🗂️ Flashcard Deck</span>
            <span className="tab-count-badge">{activeDeck.length}</span>
          </button>
          <button
            type="button"
            className={`vocab-mode-btn ${activeTab === "directory" ? "active" : ""}`}
            onClick={() => setActiveTab("directory")}
          >
            <span>📚 43 Topic Collections</span>
          </button>
          <button
            type="button"
            className={`vocab-mode-btn ${activeTab === "list" ? "active" : ""}`}
            onClick={() => setActiveTab("list")}
          >
            <span>📖 Word Directory</span>
          </button>
        </div>

        {/* Starred Quick Toggle */}
        <button
          type="button"
          className={`vocab-starred-toggle-btn ${onlyStarred ? "active" : ""}`}
          onClick={() => {
            setOnlyStarred((v) => !v);
            setCurrentIndex(0);
            resetCardInteractions();
          }}
          title={onlyStarred ? "Show all cards" : "Show only starred cards"}
        >
          <StarIcon size={16} filled={onlyStarred} />
          <span>{onlyStarred ? "Showing Starred" : `Starred (${starredCount})`}</span>
        </button>
      </div>

      {/* ── Controls: Topic Selector, Search & Category Filter ── */}
      <div className="vocab-controls-panel">
        <div className="vocab-controls-row">
          {/* Topic Select Dropdown */}
          <div className="vocab-select-wrap">
            <label htmlFor="vocab-topic-select" className="vocab-select-label">
              Topic:
            </label>
            <select
              id="vocab-topic-select"
              className="vocab-topic-select"
              value={selectedTopicNum}
              onChange={(e) => {
                setSelectedTopicNum(e.target.value);
                setCurrentIndex(0);
                resetCardInteractions();
              }}
            >
              <option value="all">🌟 All 43 Topics ({totalCards} words)</option>
              {topics.map((t) => (
                <option key={t.number} value={t.number}>
                  {t.emoji} {t.number}. {t.title} ({t.wordCount} words)
                </option>
              ))}
            </select>
          </div>

          {/* Quick Search */}
          <div className="level-search-wrap vocab-search-wrap">
            <SearchIcon size={15} className="level-search-icon" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentIndex(0);
                resetCardInteractions();
              }}
              placeholder="Search words (e.g. Brot, bread, coffee)..."
              className="level-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Pills (when in All Topics mode) */}
        {selectedTopicNum === "all" && (
          <div className="vocab-category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`vocab-category-pill ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentIndex(0);
                  resetCardInteractions();
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          VIEW 1: FLASHCARDS DECK MODE (Matching User's Screenshots)
      ════════════════════════════════════════════════════════════ */}
      {activeTab === "flashcards" && (
        <div className="vocab-flashcards-stage">
          {activeDeck.length === 0 ? (
            <div className="empty-box vocab-empty-box">
              <p className="empty-box-title">No cards found</p>
              <p className="empty-box-sub">
                {onlyStarred
                  ? "You haven't starred any cards yet. Click the star icon (★) on any card to save it here!"
                  : "Try clearing your search query or selecting another topic."}
              </p>
              {onlyStarred && (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ marginTop: 16 }}
                  onClick={() => setOnlyStarred(false)}
                >
                  Show All Cards
                </button>
              )}
            </div>
          ) : (
            <div className="vocab-card-arena">
              {/* ── THE CARD ────────────────────────────────────────── */}
              <div
                className={`vocab-flip-card ${isFlipped ? "flipped" : ""} ${
                  isMastered ? "card-is-mastered" : ""
                }`}
                onClick={(e) => {
                  // Only flip if not clicking an interactive button or input
                  if (
                    e.target.closest("button") ||
                    e.target.closest("input") ||
                    e.target.closest(".vocab-guess-box")
                  ) {
                    return;
                  }
                  setIsFlipped((v) => !v);
                }}
                role="button"
                tabIndex={0}
                aria-label={isFlipped ? "Card flipped: click to see front" : "Click to flip card"}
              >
                {/* ── CARD FRONT (Question & 1-2 Letter Hint) ── */}
                <div className="vocab-card-side vocab-card-front">
                  {/* Card Top Actions: Topic pill + Star */}
                  <div className="vocab-card-topbar">
                    <div className="vocab-card-topic-tag">
                      <span className="vocab-card-emoji">{currentCard.visualEmoji}</span>
                      <span className="vocab-card-topic-title">
                        {currentCard.topicTitle}
                      </span>
                      {currentCard.article && (
                        <span
                          className={`vocab-gender-pill gender-${currentCard.gender || currentCard.article}`}
                        >
                          {currentCard.article}
                        </span>
                      )}
                    </div>

                    <div className="vocab-card-top-actions">
                      <button
                        type="button"
                        className={`vocab-star-btn ${isStarred ? "starred" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(currentCard.id);
                        }}
                        title={isStarred ? "Remove star" : "Star card for review"}
                        aria-label="Star card"
                      >
                        <StarIcon size={20} filled={isStarred} />
                      </button>
                    </div>
                  </div>

                  {/* Visual Image / Artwork Frame (Matching Image 1) */}
                  <div className="vocab-visual-frame">
                    <span className="vocab-visual-glyph" role="img" aria-label={currentCard.english}>
                      {currentCard.visualEmoji}
                    </span>
                  </div>

                  {/* English Meaning Prompt */}
                  <div className="vocab-prompt-section">
                    <span className="vocab-prompt-label">German word for:</span>
                    <h2 className="vocab-english-word">{currentCard.english}</h2>
                  </div>

                  {/* ── The 1-2 Letter Hint (Requested by User!) ── */}
                  <div
                    className="vocab-hint-container"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="vocab-hint-header">
                      <div className="vocab-hint-badge">
                        <LightbulbIcon size={14} />
                        <span>Memory Hint ({hintLevel} letters):</span>
                      </div>
                      <div className="vocab-hint-stepper">
                        <button
                          type="button"
                          className={`hint-step-btn ${hintLevel === 1 ? "active" : ""}`}
                          onClick={() => setHintLevel(1)}
                        >
                          1 Letter
                        </button>
                        <button
                          type="button"
                          className={`hint-step-btn ${hintLevel === 2 ? "active" : ""}`}
                          onClick={() => setHintLevel(2)}
                        >
                          2 Letters
                        </button>
                        <button
                          type="button"
                          className={`hint-step-btn ${hintLevel === 3 ? "active" : ""}`}
                          onClick={() => setHintLevel(3)}
                        >
                          3 Letters
                        </button>
                      </div>
                    </div>

                    {/* Hint Text Display: e.g. "die An _ _ _ _" */}
                    <div className="vocab-hint-display">
                      <code className="vocab-hint-code">{currentHintText}</code>
                    </div>
                  </div>

                  {/* Interactive Guess Input */}
                  <div
                    className="vocab-guess-box"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <form
                      onSubmit={handleCheckAnswer}
                      className="vocab-guess-form"
                    >
                      <input
                        ref={inputRef}
                        type="text"
                        value={guessInput}
                        onChange={(e) => {
                          setGuessInput(e.target.value);
                          if (guessFeedback) setGuessFeedback(null);
                        }}
                        placeholder={`Type German word (e.g. ${currentCard.article ? currentCard.article + " " : ""}${currentCard.baseWord.slice(0, 2)}...)...`}
                        className={`vocab-guess-input ${guessFeedback || ""}`}
                      />
                      <button type="submit" className="vocab-guess-btn">
                        Check
                      </button>
                    </form>

                    {guessFeedback === "correct" && (
                      <div className="vocab-feedback-msg correct">
                        <CheckIcon size={14} />
                        <span>Richtig! Correct!</span>
                      </div>
                    )}
                    {guessFeedback === "wrong" && (
                      <div className="vocab-feedback-msg wrong">
                        <span>Not quite — click flip or increase hint!</span>
                      </div>
                    )}
                  </div>

                  {/* Flip Prompt Footer */}
                  <div className="vocab-card-footer-prompt">
                    <span className="vocab-flip-instruction">
                      Click card or press <strong>Space</strong> to reveal answer
                    </span>
                  </div>
                </div>

                {/* ── CARD BACK (Revealed German Word & Audio - Matching Image 2) ── */}
                <div className="vocab-card-side vocab-card-back">
                  {/* Card Top Actions: Speaker + Star */}
                  <div className="vocab-card-topbar">
                    <div className="vocab-card-topic-tag">
                      <span className="vocab-card-emoji">{currentCard.visualEmoji}</span>
                      <span className="vocab-card-topic-title">
                        {currentCard.topicTitle}
                      </span>
                    </div>

                    <div className="vocab-card-top-actions">
                      <button
                        type="button"
                        className="vocab-speaker-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          playGermanPronunciation(currentCard.cleanGerman);
                        }}
                        title="Listen to native German pronunciation (A)"
                        aria-label="Listen to pronunciation"
                      >
                        <Volume2Icon size={20} />
                      </button>

                      <button
                        type="button"
                        className={`vocab-star-btn ${isStarred ? "starred" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(currentCard.id);
                        }}
                        title={isStarred ? "Remove star" : "Star card"}
                        aria-label="Star card"
                      >
                        <StarIcon size={20} filled={isStarred} />
                      </button>
                    </div>
                  </div>

                  {/* Big Visual Glyph & German Word Display */}
                  <div className="vocab-back-main">
                    <div className="vocab-back-emoji-ring">
                      <span className="vocab-back-emoji">{currentCard.visualEmoji}</span>
                    </div>

                    <div className="vocab-back-word-group">
                      <h2 className="vocab-german-word">
                        {currentCard.cleanGerman}
                        {currentCard.plural && (
                          <span className="vocab-plural-suffix">
                            , {currentCard.plural}
                          </span>
                        )}
                      </h2>

                      {currentCard.article && (
                        <div className="vocab-gender-pill-row">
                          <span
                            className={`vocab-gender-pill gender-${currentCard.gender || currentCard.article}`}
                          >
                            Article: <strong>{currentCard.article}</strong> ({currentCard.gender || "noun"})
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="vocab-back-meaning">
                      <span className="vocab-back-meaning-en">
                        {currentCard.english}
                      </span>
                      <span className="vocab-back-type-label">
                        {currentCard.wordTypeLabel}
                      </span>
                    </div>

                    {/* Listen Audio Big Button */}
                    <button
                      type="button"
                      className="vocab-audio-pill-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        playGermanPronunciation(currentCard.cleanGerman);
                      }}
                    >
                      <Volume2Icon size={16} />
                      <span>Listen: "{currentCard.cleanGerman}"</span>
                    </button>
                  </div>

                  {/* Mastery Rating Buttons */}
                  <div
                    className="vocab-mastery-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className={`vocab-rate-btn rate-practice ${!isMastered ? "active" : ""}`}
                      onClick={() => {
                        if (isMastered) toggleMastered(currentCard.id);
                        handleNext();
                      }}
                    >
                      <span>🔄 Still Learning</span>
                    </button>
                    <button
                      type="button"
                      className={`vocab-rate-btn rate-mastered ${isMastered ? "active" : ""}`}
                      onClick={() => {
                        if (!isMastered) toggleMastered(currentCard.id);
                        handleNext();
                      }}
                    >
                      <CheckIcon size={15} />
                      <span>{isMastered ? "Mastered ✓" : "I Know This!"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ── BOTTOM TOOLBAR (Matching User's Screenshot Exactly) ── */}
              <div className="vocab-deck-toolbar">
                {/* Left Controls: Play/Pause, Shuffle */}
                <div className="vocab-toolbar-left">
                  <button
                    type="button"
                    className={`vocab-tool-btn ${isAutoPlaying ? "active" : ""}`}
                    onClick={() => setIsAutoPlaying((v) => !v)}
                    title={isAutoPlaying ? "Pause auto-play" : "Start auto-play"}
                    aria-label="Auto-play"
                  >
                    {isAutoPlaying ? <PauseIcon size={17} /> : <PlayIcon size={17} />}
                  </button>

                  <button
                    type="button"
                    className={`vocab-tool-btn ${isShuffled ? "active" : ""}`}
                    onClick={() => {
                      setIsShuffled((v) => !v);
                      setCurrentIndex(0);
                      resetCardInteractions();
                    }}
                    title={isShuffled ? "Turn off shuffle" : "Shuffle card deck"}
                    aria-label="Shuffle"
                  >
                    <ShuffleIcon size={17} />
                  </button>
                </div>

                {/* Center Controls: Prev, Counter, Next */}
                <div className="vocab-toolbar-center">
                  <button
                    type="button"
                    className="vocab-nav-btn prev"
                    onClick={handlePrev}
                    title="Previous card (Left Arrow / K)"
                    aria-label="Previous card"
                  >
                    <ArrowLeftIcon size={18} />
                  </button>

                  <div className="vocab-counter-badge">
                    <span className="vocab-counter-current">
                      {currentIndex + 1}
                    </span>
                    <span className="vocab-counter-sep">/</span>
                    <span className="vocab-counter-total">
                      {activeDeck.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="vocab-nav-btn next"
                    onClick={handleNext}
                    title="Next card (Right Arrow / J)"
                    aria-label="Next card"
                  >
                    <ArrowRightIcon size={18} />
                  </button>
                </div>

                {/* Right Controls: Flip toggle & Fullscreen */}
                <div className="vocab-toolbar-right">
                  <button
                    type="button"
                    className="vocab-tool-btn flip"
                    onClick={() => setIsFlipped((v) => !v)}
                    title="Flip card (Spacebar)"
                    aria-label="Flip card"
                  >
                    <RotateCcwIcon size={16} />
                  </button>

                  <button
                    type="button"
                    className={`vocab-tool-btn ${isFullscreen ? "active" : ""}`}
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen mode"}
                    aria-label="Fullscreen"
                  >
                    {isFullscreen ? <MinimizeIcon size={16} /> : <MaximizeIcon size={16} />}
                  </button>
                </div>
              </div>

              {/* Keyboard Shortcuts Hint Bar */}
              <div className="vocab-keyboard-hints no-print">
                <span>Keyboard:</span>
                <kbd>Space</kbd> Flip
                <span className="meta-dot">·</span>
                <kbd>→</kbd> Next
                <span className="meta-dot">·</span>
                <kbd>←</kbd> Prev
                <span className="meta-dot">·</span>
                <kbd>H</kbd> Hint
                <span className="meta-dot">·</span>
                <kbd>A</kbd> Audio
                <span className="meta-dot">·</span>
                <kbd>S</kbd> Star
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          VIEW 2: TOPIC COLLECTIONS DIRECTORY (43 Topics)
      ════════════════════════════════════════════════════════════ */}
      {activeTab === "directory" && (
        <div className="vocab-directory-grid">
          {topics.map((t) => {
            const topicMastered = t.vocabulary.filter((w) =>
              masteredIds.includes(w.id)
            ).length;
            const topicPct = Math.round((topicMastered / t.wordCount) * 100);

            return (
              <div
                key={t.number}
                className="vocab-topic-card"
                onClick={() => {
                  setSelectedTopicNum(String(t.number));
                  setActiveTab("flashcards");
                  setCurrentIndex(0);
                  resetCardInteractions();
                }}
              >
                <div className="vocab-topic-card-header">
                  <span className="vocab-topic-card-emoji">{t.emoji}</span>
                  <span className="vocab-topic-num-badge">Topic {t.number}</span>
                </div>

                <h3 className="vocab-topic-card-title">{t.title}</h3>
                <span className="vocab-topic-card-de">{t.germanTitle}</span>

                <div className="vocab-topic-card-meta">
                  <span className="vocab-topic-count">
                    {t.wordCount} words
                  </span>
                  <span className="vocab-topic-mastered">
                    {topicMastered} mastered ({topicPct}%)
                  </span>
                </div>

                <div className="vocab-topic-mini-track">
                  <div
                    className="vocab-topic-mini-fill"
                    style={{ width: `${topicPct}%` }}
                  />
                </div>

                <button
                  type="button"
                  className="vocab-topic-study-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTopicNum(String(t.number));
                    setActiveTab("flashcards");
                    setCurrentIndex(0);
                    resetCardInteractions();
                  }}
                >
                  <span>Practice Deck →</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          VIEW 3: WORD LIST TABLE (Search and Listen to All Words)
      ════════════════════════════════════════════════════════════ */}
      {activeTab === "list" && (
        <div className="vocab-list-table-container">
          <div className="vocab-list-stats-bar">
            <span>Showing {activeDeck.length} words</span>
          </div>

          <div className="vocab-table-wrap">
            <table className="vocab-table">
              <thead>
                <tr>
                  <th style={{ width: 44 }}>Icon</th>
                  <th>German Word</th>
                  <th>English Translation</th>
                  <th>Topic</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeDeck.map((w) => {
                  const isWordMastered = masteredIds.includes(w.id);
                  const isWordStarred = starredIds.includes(w.id);

                  return (
                    <tr
                      key={w.id}
                      className={isWordMastered ? "is-mastered-row" : ""}
                    >
                      <td className="vocab-table-emoji-cell">
                        <span className="vocab-table-emoji">{w.visualEmoji}</span>
                      </td>
                      <td className="vocab-table-german-cell">
                        <div className="vocab-table-german-line">
                          {w.article && (
                            <span
                              className={`vocab-gender-pill gender-${w.gender || w.article}`}
                            >
                              {w.article}
                            </span>
                          )}
                          <strong className="vocab-table-word">{w.cleanGerman}</strong>
                          {w.plural && (
                            <span className="vocab-table-plural">, {w.plural}</span>
                          )}
                        </div>
                      </td>
                      <td className="vocab-table-english-cell">{w.english}</td>
                      <td className="vocab-table-topic-cell">
                        <span className="vocab-table-topic-pill">
                          {w.topicTitle}
                        </span>
                      </td>
                      <td className="vocab-table-actions-cell">
                        <div className="vocab-table-btn-group">
                          <button
                            type="button"
                            className="vocab-table-action-btn"
                            onClick={() => playGermanPronunciation(w.cleanGerman)}
                            title="Listen"
                          >
                            <Volume2Icon size={15} />
                          </button>
                          <button
                            type="button"
                            className={`vocab-table-action-btn ${isWordStarred ? "starred" : ""}`}
                            onClick={() => toggleStar(w.id)}
                            title={isWordStarred ? "Unstar" : "Star"}
                          >
                            <StarIcon size={15} filled={isWordStarred} />
                          </button>
                          <button
                            type="button"
                            className={`vocab-table-action-btn ${isWordMastered ? "mastered" : ""}`}
                            onClick={() => toggleMastered(w.id)}
                            title={isWordMastered ? "Unmark" : "Mark Mastered"}
                          >
                            <CheckIcon size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
