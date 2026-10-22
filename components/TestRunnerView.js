"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ClockIcon,
  CheckIcon,
  RotateCcwIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
} from "./Icons";

const TEST_DURATION_SECONDS = 12 * 60; // 12 minutes
const HISTORY_STORAGE_KEY = "a1_foundation_test_history_v1";

function pickRandomTwelve(all) {
  if (!all || all.length === 0) return [];
  const copy = [...all];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, 12);
}

function checkIsCorrect(userAns, correctAns) {
  if (!userAns) return false;
  const cleanUser = String(userAns).trim().toLowerCase();
  const cleanCorrect = String(correctAns).trim().toLowerCase();
  return cleanUser === cleanCorrect;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TestRunnerView({ allQuestions = [] }) {
  const [screen, setScreen] = useState("ready"); // "ready" | "testing" | "results"
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const [result, setResult] = useState(null);
  const [todaySummary, setTodaySummary] = useState({ count: 0, marks: 0 });

  const inputRef = useRef(null);

  // Load today's quick summary from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (raw) {
        const history = JSON.parse(raw);
        if (Array.isArray(history)) {
          const now = new Date();
          const todayAttempts = history.filter((a) => {
            const d = new Date(a.timestamp);
            return (
              d.getFullYear() === now.getFullYear() &&
              d.getMonth() === now.getMonth() &&
              d.getDate() === now.getDate()
            );
          });
          const count = todayAttempts.reduce((acc, a) => acc + (a.totalQuestions || 12), 0);
          const marks = todayAttempts.reduce((acc, a) => acc + (a.score || 0), 0);
          setTodaySummary({ count, marks });
        }
      }
    } catch {}
  }, [screen]);

  // Start new test
  const startNewTest = useCallback(() => {
    const selected = pickRandomTwelve(allQuestions);
    setQuestions(selected);
    setCurrentIdx(0);
    setAnswers({});
    setTimeLeft(TEST_DURATION_SECONDS);
    setTimerActive(true);
    setResult(null);
    setScreen("testing");
  }, [allQuestions]);

  // Submit test and compute marks
  const submitTest = useCallback(() => {
    setTimerActive(false);
    const elapsed = TEST_DURATION_SECONDS - timeLeft;

    let score = 0;
    const reviewedQuestions = questions.map((q) => {
      const userAns = answers[q.id] || "";
      const isCorrect = checkIsCorrect(userAns, q.answer);
      if (isCorrect) score += 1;
      return {
        id: q.id,
        section: q.section,
        type: q.type,
        question: q.question,
        options: q.options || [],
        userAnswer: userAns,
        correctAnswer: q.answer,
        isCorrect,
        explanation: q.explanation || "",
      };
    });

    const percentage = Math.round((score / questions.length) * 100);
    const attemptRecord = {
      id: "attempt-" + Date.now(),
      timestamp: Date.now(),
      dateStr: new Date().toISOString().split("T")[0],
      testName: "Master A1 Foundation 1 to 17",
      totalQuestions: questions.length,
      score,
      percentage,
      timeSpentSeconds: elapsed > 0 ? elapsed : 1,
      passed: score >= 8,
      questions: reviewedQuestions,
    };

    // Save to localStorage
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      const history = raw ? JSON.parse(raw) : [];
      localStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify([attemptRecord, ...history])
      );
    } catch (e) {
      console.error("Failed to save test attempt to localStorage:", e);
    }

    setResult(attemptRecord);
    setScreen("results");
  }, [questions, answers, timeLeft]);

  // Timer interval
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, submitTest]);

  // Autofocus input on question change
  useEffect(() => {
    if (screen === "testing" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIdx, screen]);

  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(answers).filter((k) => !!answers[k]?.trim()).length;

  function handleSelectOption(opt) {
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: opt }));
  }

  function handleInsertChar(char) {
    if (!currentQ) return;
    const current = answers[currentQ.id] || "";
    setAnswers((prev) => ({ ...prev, [currentQ.id]: current + char }));
    if (inputRef.current) inputRef.current.focus();
  }

  return (
    <div className="collection-container">
      {/* Test Section Header & Subnavigation Tabs */}
      <div className="test-nav-header">
        <div>
          <span className="library-eyebrow">A1 PRACTICE & MASTERY</span>
          <h1 className="test-page-title">Master A1 Foundation 1 to 17</h1>
          <p className="test-page-desc">
            Timed 12-question quiz selected at random from the 250 master test bank.
          </p>
        </div>

        <div className="test-subnav-tabs">
          <Link href="/test" className="test-subnav-btn active">
            Take Test
          </Link>
          <Link href="/test/progress" className="test-subnav-btn">
            Progress Cards
            {todaySummary.count > 0 && (
              <span className="tab-count-badge">{todaySummary.count} today</span>
            )}
          </Link>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. READY SCREEN                                            */}
      {/* ────────────────────────────────────────────────────────── */}
      {screen === "ready" && (
        <div className="test-ready-card">
          <div className="test-ready-badge-row">
            <span className="level-badge level-badge-a1">12 Questions</span>
            <span className="level-badge" style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
              <ClockIcon size={13} /> 12:00 Minutes
            </span>
            <span className="level-badge" style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>
              Pool: 250 Questions
            </span>
          </div>

          <h2 className="test-ready-heading">Ready to test your German foundation?</h2>
          <p className="test-ready-lead">
            Every test generates <strong>12 unique, randomized questions</strong> covering Personal Pronouns, Cases (Nominativ, Akkusativ, Dativ), Articles, Negation, Prepositions, and Verb Conjugations (Topics 0 to 17).
          </p>

          <div className="test-rules-grid">
            <div className="test-rule-item">
              <strong>⏱ Timed Countdown</strong>
              <span>You have 12 minutes (1 min per question) to complete your test.</span>
            </div>
            <div className="test-rule-item">
              <strong>🎲 250 Question Bank</strong>
              <span>Every attempt pulls a completely random mix of MCQs and Fill-in-the-blank questions.</span>
            </div>
            <div className="test-rule-item">
              <strong>📊 Instant Marks & Solutions</strong>
              <span>Get your exact score immediately upon submission with grammar explanations for every question.</span>
            </div>
            <div className="test-rule-item">
              <strong>📈 Daily Progress Tracking</strong>
              <span>Every test is saved to your progress card page so you can track how many questions you solved today.</span>
            </div>
          </div>

          <div className="test-ready-actions">
            <button
              type="button"
              onClick={startNewTest}
              className="test-primary-btn"
            >
              Start 12-Question Test Now
            </button>
            <Link href="/test/progress" className="test-secondary-btn">
              View Previous Progress Cards
            </Link>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. LIVE TESTING SCREEN                                     */}
      {/* ────────────────────────────────────────────────────────── */}
      {screen === "testing" && currentQ && (
        <div className="test-live-container">
          {/* Top Sticky Test Control Bar */}
          <div className="test-control-bar">
            <div className="test-control-left">
              <span className="test-q-counter">
                Question <strong>{currentIdx + 1}</strong> of {questions.length}
              </span>
              <span className="test-answered-pill">
                {answeredCount} / {questions.length} answered
              </span>
            </div>

            <div className={`test-timer-badge ${timeLeft <= 180 ? "warning" : ""} ${timeLeft <= 60 ? "danger" : ""}`}>
              <ClockIcon size={15} />
              <span>{formatTime(timeLeft)} remaining</span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (answeredCount < questions.length) {
                  if (confirm(`You have answered ${answeredCount} of ${questions.length} questions. Submit now and calculate marks?`)) {
                    submitTest();
                  }
                } else {
                  submitTest();
                }
              }}
              className="test-submit-header-btn"
            >
              Submit Test
            </button>
          </div>

          {/* Question Dots / Quick Navigator */}
          <div className="test-nav-dots" role="tablist" aria-label="Questions list">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id]?.trim();
              const isCurrent = idx === currentIdx;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  className={`test-nav-dot ${isCurrent ? "current" : ""} ${isAnswered ? "answered" : ""}`}
                  title={`Question ${idx + 1}${isAnswered ? " (Answered)" : " (Unanswered)"}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Active Question Box */}
          <div className="test-question-box">
            <div className="test-question-meta">
              <span className="category-tag">{currentQ.section}</span>
              <span className="meta-muted">
                {currentQ.type === "mcq" ? "Multiple Choice" : "Fill in the blank"}
              </span>
            </div>

            <h3 className="test-question-text">{currentQ.question}</h3>

            {/* MCQ Choices */}
            {currentQ.type === "mcq" && (
              <div className="test-mcq-options">
                {currentQ.options?.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isSelected = answers[currentQ.id] === opt;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(opt)}
                      className={`test-option-btn ${isSelected ? "selected" : ""}`}
                    >
                      <span className="test-option-letter">{letter}</span>
                      <span className="test-option-text">{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Fill-in-the-blank Input */}
            {currentQ.type === "fill_blank" && (
              <div className="test-fill-wrap">
                <input
                  ref={inputRef}
                  type="text"
                  value={answers[currentQ.id] || ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))
                  }
                  placeholder="Type missing word in German..."
                  className="test-fill-input"
                  autoComplete="off"
                  spellCheck="false"
                />

                {/* Umlaut quick keys helper */}
                <div className="test-umlaut-bar">
                  <span className="test-umlaut-label">Quick insert:</span>
                  {["ä", "ö", "ü", "Ä", "Ö", "Ü", "ß"].map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => handleInsertChar(ch)}
                      className="test-umlaut-btn"
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Pager Controls */}
          <div className="test-pager-bar">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((prev) => prev - 1)}
              className="test-nav-action-btn"
            >
              <ArrowLeftIcon size={14} /> Previous
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIdx((prev) => prev + 1)}
                className="test-nav-action-btn primary"
              >
                Next <ArrowRightIcon size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={submitTest}
                className="test-nav-action-btn submit"
              >
                Submit Test & View Marks
              </button>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. TEST RESULTS & MARKS SCREEN                             */}
      {/* ────────────────────────────────────────────────────────── */}
      {screen === "results" && result && (
        <div className="test-results-container">
          {/* Big Score / Marks Banner */}
          <div className="test-score-banner">
            <div className="test-score-left">
              <span className="test-score-badge">
                {result.passed ? "Test Passed ✓" : "Review Needed"}
              </span>
              <h2 className="test-score-heading">
                {result.score >= 10
                  ? "Outstanding Performance!"
                  : result.score >= 8
                  ? "Great job! Foundation solid."
                  : "Keep practicing!"}
              </h2>
              <p className="test-score-sub">
                You scored <strong>{result.score}</strong> out of <strong>{result.totalQuestions}</strong> marks ({result.percentage}%).
              </p>
            </div>

            <div className="test-score-right">
              <div className="test-score-circle">
                <span className="test-score-num">{result.score}</span>
                <span className="test-score-denom">/ {result.totalQuestions}</span>
              </div>
              <span className="test-time-spent">
                <ClockIcon size={13} /> Completed in {Math.floor(result.timeSpentSeconds / 60)}m {result.timeSpentSeconds % 60}s
              </span>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="test-results-actions">
            <button
              type="button"
              onClick={startNewTest}
              className="test-primary-btn"
            >
              <RotateCcwIcon size={15} /> Take Another Test (12 New Questions)
            </button>

            <Link href="/test/progress" className="test-secondary-btn">
              View All Progress Cards →
            </Link>
          </div>

          {/* Detailed Question Review */}
          <div className="test-review-section">
            <h3 className="test-review-heading">
              Detailed Question Review ({result.questions.length} Questions)
            </h3>

            <div className="test-review-list">
              {result.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className={`test-review-card ${q.isCorrect ? "correct" : "incorrect"}`}
                >
                  <div className="test-review-header">
                    <span className="test-review-num">Question {idx + 1}</span>
                    <span className="category-tag">{q.section}</span>
                    <span className={`test-status-pill ${q.isCorrect ? "correct" : "incorrect"}`}>
                      {q.isCorrect ? "Correct (+1 mark)" : "Incorrect (0 marks)"}
                    </span>
                  </div>

                  <p className="test-review-q-text">{q.question}</p>

                  <div className="test-review-answers-box">
                    <div className="test-review-answer-row">
                      <span className="test-ans-label">Your answer:</span>
                      <strong className={`test-ans-val ${q.isCorrect ? "correct" : "incorrect"}`}>
                        {q.userAnswer ? q.userAnswer : "(No answer provided)"}
                      </strong>
                    </div>

                    {!q.isCorrect && (
                      <div className="test-review-answer-row">
                        <span className="test-ans-label">Correct answer:</span>
                        <strong className="test-ans-val correct">{q.correctAnswer}</strong>
                      </div>
                    )}
                  </div>

                  {q.explanation && (
                    <div className="test-review-explanation">
                      <strong>💡 Explanation: </strong>
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
