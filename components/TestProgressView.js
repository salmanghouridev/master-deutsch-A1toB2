"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ClockIcon,
  CheckIcon,
  ArrowRightIcon,
  RotateCcwIcon,
} from "./Icons";

const HISTORY_STORAGE_KEY = "a1_foundation_test_history_v1";

function isToday(timestamp) {
  const d = new Date(timestamp);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function formatDate(timestamp) {
  const d = new Date(timestamp);
  const now = new Date();
  const isSameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (isSameDay) {
    return `Today at ${timeStr}`;
  }
  return `${d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} at ${timeStr}`;
}

export default function TestProgressView() {
  const [history, setHistory] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [filter, setFilter] = useState("all"); // "all" | "today" | "passed"
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setHistory(parsed);
      }
    } catch (e) {
      console.error("Failed to load test history:", e);
    }
    setHydrated(true);
  }, []);

  function handleClearHistory() {
    if (confirm("Are you sure you want to clear your test history and progress cards?")) {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      setHistory([]);
    }
  }

  // Today calculations
  const todayAttempts = useMemo(() => {
    return history.filter((a) => isToday(a.timestamp));
  }, [history]);

  const todayQuestionsDone = useMemo(() => {
    return todayAttempts.reduce((acc, a) => acc + (a.totalQuestions || 12), 0);
  }, [todayAttempts]);

  const todayMarksEarned = useMemo(() => {
    return todayAttempts.reduce((acc, a) => acc + (a.score || 0), 0);
  }, [todayAttempts]);

  const todayPercent =
    todayQuestionsDone > 0
      ? Math.round((todayMarksEarned / todayQuestionsDone) * 100)
      : 0;

  const todayBestScore = useMemo(() => {
    if (todayAttempts.length === 0) return 0;
    return Math.max(...todayAttempts.map((a) => a.score || 0));
  }, [todayAttempts]);

  // All-time calculations
  const totalQuestionsDone = useMemo(() => {
    return history.reduce((acc, a) => acc + (a.totalQuestions || 12), 0);
  }, [history]);

  const totalMarksEarned = useMemo(() => {
    return history.reduce((acc, a) => acc + (a.score || 0), 0);
  }, [history]);

  const overallAccuracy =
    totalQuestionsDone > 0
      ? Math.round((totalMarksEarned / totalQuestionsDone) * 100)
      : 0;

  // Filtered attempts list
  const filteredHistory = useMemo(() => {
    if (filter === "today") return todayAttempts;
    if (filter === "passed") return history.filter((a) => a.passed);
    return history;
  }, [history, todayAttempts, filter]);

  return (
    <div className="collection-container">
      {/* Test Section Header & Subnavigation Tabs */}
      <div className="test-nav-header">
        <div>
          <span className="library-eyebrow">TEST PERFORMANCE & HISTORY</span>
          <h1 className="test-page-title">Your Progress Cards</h1>
          <p className="test-page-desc">
            Detailed breakdown of questions answered, marks earned, and study sessions.
          </p>
        </div>

        <div className="test-subnav-tabs">
          <Link href="/test" className="test-subnav-btn">
            Take Test
          </Link>
          <Link href="/test/progress" className="test-subnav-btn active">
            Progress Cards
            {todayQuestionsDone > 0 && (
              <span className="tab-count-badge">{todayQuestionsDone} today</span>
            )}
          </Link>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. TODAY'S PROGRESS STATS DASHBOARD                        */}
      {/* ────────────────────────────────────────────────────────── */}
      <section className="progress-metrics-section" aria-label="Today's Performance">
        <h2 className="progress-section-title">Today&apos;s Summary</h2>

        <div className="progress-stats-grid">
          {/* Card 1: Questions Solved Today */}
          <div className="progress-stat-card highlighted">
            <span className="progress-stat-label">Questions Solved Today</span>
            <div className="progress-stat-val-row">
              <strong className="progress-stat-number">{todayQuestionsDone}</strong>
              <span className="progress-stat-unit">questions</span>
            </div>
            <p className="progress-stat-note">
              {todayAttempts.length}{" "}
              {todayAttempts.length === 1 ? "test session" : "test sessions"} completed today
            </p>
          </div>

          {/* Card 2: Marks Earned Today */}
          <div className="progress-stat-card">
            <span className="progress-stat-label">Today&apos;s Marks</span>
            <div className="progress-stat-val-row">
              <strong className="progress-stat-number">
                {todayMarksEarned} / {todayQuestionsDone}
              </strong>
              <span className="progress-stat-unit">({todayPercent}%)</span>
            </div>
            <p className="progress-stat-note">
              {todayAttempts.length > 0
                ? `Best test today: ${todayBestScore} / 12 marks`
                : "No tests taken today yet"}
            </p>
          </div>

          {/* Card 3: Tests Completed Today */}
          <div className="progress-stat-card">
            <span className="progress-stat-label">Tests Completed Today</span>
            <div className="progress-stat-val-row">
              <strong className="progress-stat-number">{todayAttempts.length}</strong>
              <span className="progress-stat-unit">tests</span>
            </div>
            <p className="progress-stat-note">12 randomized questions per test</p>
          </div>

          {/* Card 4: All-Time Overall Accuracy */}
          <div className="progress-stat-card">
            <span className="progress-stat-label">All-Time Accuracy</span>
            <div className="progress-stat-val-row">
              <strong className="progress-stat-number">{overallAccuracy}%</strong>
            </div>
            <p className="progress-stat-note">
              {totalMarksEarned} / {totalQuestionsDone} marks across {history.length} tests
            </p>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. PROGRESS CARDS LIST                                     */}
      {/* ────────────────────────────────────────────────────────── */}
      <section className="progress-history-section" aria-label="Test History Cards">
        <div className="progress-history-header">
          <div className="progress-filter-tabs">
            <button
              type="button"
              className={`simple-tab ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All Attempts ({history.length})
            </button>
            <button
              type="button"
              className={`simple-tab ${filter === "today" ? "active" : ""}`}
              onClick={() => setFilter("today")}
            >
              Today Only ({todayAttempts.length})
            </button>
            <button
              type="button"
              className={`simple-tab ${filter === "passed" ? "active" : ""}`}
              onClick={() => setFilter("passed")}
            >
              Passed ({history.filter((a) => a.passed).length})
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link href="/test" className="test-primary-btn" style={{ fontSize: "13px", padding: "6px 14px" }}>
              Take New Test
            </Link>

            {history.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="progress-clear-btn"
                title="Reset all test history"
              >
                Clear History
              </button>
            )}
          </div>
        </div>

        {/* Empty state */}
        {filteredHistory.length === 0 && (
          <div className="empty-box" style={{ marginTop: "20px" }}>
            <p className="empty-box-title">
              {filter === "today"
                ? "No test sessions recorded today yet"
                : "No progress cards found"}
            </p>
            <p className="empty-box-sub">
              Take a timed 12-question quiz to test your A1 grammar foundation and earn your first progress card!
            </p>
            <Link
              href="/test"
              className="test-primary-btn"
              style={{ marginTop: "14px", display: "inline-flex" }}
            >
              Start 12-Question Test
            </Link>
          </div>
        )}

        {/* Cards Stack */}
        {filteredHistory.length > 0 && (
          <div className="progress-cards-stack">
            {filteredHistory.map((attempt) => {
              const isExpanded = expandedId === attempt.id;
              const isTodayAttempt = isToday(attempt.timestamp);

              return (
                <div key={attempt.id} className="progress-card-item">
                  <div className="progress-card-main-row">
                    <div className="progress-card-left">
                      <div className="progress-card-meta">
                        <span className={`progress-date-pill ${isTodayAttempt ? "today" : ""}`}>
                          {formatDate(attempt.timestamp)}
                        </span>
                        <span className="category-tag">{attempt.testName}</span>
                        <span className={`test-status-pill ${attempt.passed ? "correct" : "incorrect"}`}>
                          {attempt.passed ? "Passed ✓" : "Needs Practice"}
                        </span>
                      </div>

                      <h3 className="progress-card-title">
                        Scored {attempt.score} of {attempt.totalQuestions} Marks ({attempt.percentage}%)
                      </h3>

                      <div className="progress-card-details">
                        <span>
                          <CheckIcon size={13} /> {attempt.score} correct
                        </span>
                        <span>·</span>
                        <span>
                          {attempt.totalQuestions - attempt.score} incorrect
                        </span>
                        <span>·</span>
                        <span>
                          <ClockIcon size={13} /> Time:{" "}
                          {Math.floor(attempt.timeSpentSeconds / 60)}m{" "}
                          {attempt.timeSpentSeconds % 60}s
                        </span>
                      </div>
                    </div>

                    <div className="progress-card-right">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : attempt.id)}
                        className="progress-expand-btn"
                      >
                        {isExpanded ? "Hide Questions ▲" : "Review Questions ▼"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded 12 Question Breakdown */}
                  {isExpanded && attempt.questions && (
                    <div className="progress-card-expanded">
                      <h4 className="expanded-review-title">
                        12 Questions Breakdown for this Test Attempt
                      </h4>

                      <div className="expanded-q-grid">
                        {attempt.questions.map((q, idx) => (
                          <div
                            key={idx}
                            className={`expanded-q-card ${q.isCorrect ? "correct" : "incorrect"}`}
                          >
                            <div className="expanded-q-top">
                              <span className="expanded-q-num">Q{idx + 1}</span>
                              <span className="category-tag">{q.section}</span>
                              <span className={`expanded-q-badge ${q.isCorrect ? "correct" : "incorrect"}`}>
                                {q.isCorrect ? "✓ +1" : "✕ 0"}
                              </span>
                            </div>

                            <p className="expanded-q-text">{q.question}</p>

                            <div className="expanded-q-answers">
                              <div>
                                <span className="expanded-ans-label">Answer: </span>
                                <strong className={q.isCorrect ? "correct-text" : "incorrect-text"}>
                                  {q.userAnswer ? q.userAnswer : "(Blank)"}
                                </strong>
                              </div>
                              {!q.isCorrect && (
                                <div>
                                  <span className="expanded-ans-label">Correct: </span>
                                  <strong className="correct-text">{q.correctAnswer}</strong>
                                </div>
                              )}
                            </div>

                            {q.explanation && (
                              <p className="expanded-q-exp">
                                💡 {q.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
