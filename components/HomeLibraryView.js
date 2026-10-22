"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useStudy } from "./StudyProvider";
import {
  BookOpenIcon,
  FolderIcon,
  GraduationCapIcon,
  ArrowRightIcon,
  CheckIcon,
} from "./Icons";

function LevelIcon({ levelId }) {
  if (levelId === "A1") return <BookOpenIcon size={18} />;
  if (levelId === "A2") return <FolderIcon size={18} />;
  return <GraduationCapIcon size={18} />;
}

export default function HomeLibraryView({ folders = [] }) {
  const { hydrated, reviewed, toggleReviewed } = useStudy();
  const [activeTab, setActiveTab] = useState("all");

  const a1Folder = folders.find((f) => f.id === "A1") || { topics: [] };
  const a1Topics = a1Folder.topics || [];

  const a1ReviewedCount = hydrated
    ? a1Topics.filter((t) => reviewed.includes(`A1/${t.slug}`)).length
    : 0;

  const displayedTopics = useMemo(() => {
    if (activeTab === "foundations") {
      return a1Topics.filter((t) => t.order <= 17);
    }
    if (activeTab === "applying") {
      return a1Topics.filter((t) => t.order >= 18);
    }
    return a1Topics;
  }, [a1Topics, activeTab]);

  return (
    <div className="collection-container">
      {/* 1. Hero Header */}
      <header className="library-hero">
        <p className="library-eyebrow">GERMAN GRAMMAR ATELIER</p>
        <h1 className="library-title">A little progress, every day.</h1>
        <p className="library-lead">
          A calm, structured study space for German grammar, core vocabulary,
          and topic-by-topic mastery.
        </p>
      </header>

      {/* 2. Level Overview Cards (A1, A2, B1) */}
      <section className="library-section" aria-label="Study Levels">
        <div className="level-cards-grid">
          {folders.map((folder) => {
            const levelKey = folder.id.toLowerCase();
            const reviewedCount = hydrated
              ? folder.topics.filter((t) =>
                  reviewed.includes(`${folder.id}/${t.slug}`)
                ).length
              : 0;

            return (
              <Link
                key={folder.id}
                href={`/${folder.id}`}
                className={`level-collection-card level-card-${levelKey}`}
              >
                <div className="level-card-top">
                  <span className={`level-badge level-badge-${levelKey}`}>
                    Level {folder.id}
                  </span>
                  <span className={`level-icon-badge level-icon-${levelKey}`}>
                    <LevelIcon levelId={folder.id} />
                  </span>
                </div>

                <h2 className="level-card-title">{folder.name}</h2>
                <p className="level-card-desc">{folder.description}</p>

                <div className="level-card-bottom">
                  <div className="level-card-stats">
                    <span className="level-topic-count">
                      {folder.topics.length} topics
                    </span>
                    {reviewedCount > 0 && (
                      <span className="level-reviewed-stat">
                        · {reviewedCount} completed
                      </span>
                    )}
                  </div>

                  <span className="level-browse-action">
                    Browse <ArrowRightIcon size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Test Portal Quick Access */}
      <div className="home-test-card">
        <div className="home-test-card-content">
          <div className="home-test-card-badge-row">
            <span className="level-badge level-badge-a1">Timed Test</span>
            <span className="category-tag">12 Random Questions from 250</span>
          </div>
          <h3 className="home-test-card-title">Master A1 Foundation 1 to 17</h3>
          <p className="home-test-card-desc">
            Test your knowledge with 12 randomized questions, get instant marks upon submission, and track your daily progress cards.
          </p>
        </div>
        <div className="home-test-card-actions">
          <Link href="/test" className="test-primary-btn" style={{ fontSize: "13.5px" }}>
            Take Test Now <ArrowRightIcon size={14} />
          </Link>
          <Link href="/test/progress" className="test-secondary-btn" style={{ fontSize: "13.5px" }}>
            View Progress Cards
          </Link>
        </div>
      </div>

      {/* 3. Simple A1 Topics Checklist */}
      <section className="simple-topics-section" aria-label="A1 Study Topics">
        <div className="simple-list-header">
          <h2 className="simple-list-title">
            <span>A1 Topics</span>
            <span className="simple-list-sub">
              {a1ReviewedCount} of {a1Topics.length} completed
            </span>
          </h2>

          <div className="simple-tabs">
            <button
              type="button"
              className={`simple-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All ({a1Topics.length})
            </button>
            <button
              type="button"
              className={`simple-tab ${activeTab === "foundations" ? "active" : ""}`}
              onClick={() => setActiveTab("foundations")}
            >
              Foundations (0–17)
            </button>
            <button
              type="button"
              className={`simple-tab ${activeTab === "applying" ? "active" : ""}`}
              onClick={() => setActiveTab("applying")}
            >
              Applying (18–34)
            </button>
          </div>
        </div>

        <div className="simple-topic-list">
          {displayedTopics.map((topic) => {
            const noteKey = `A1/${topic.slug}`;
            const isDone = hydrated && reviewed.includes(noteKey);

            return (
              <div
                key={topic.slug}
                className={`simple-topic-row ${isDone ? "is-done" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => toggleReviewed(noteKey)}
                  className="simple-checkbox-btn"
                  title={isDone ? "Mark as incomplete" : "Mark as complete"}
                  aria-label={isDone ? "Mark as incomplete" : "Mark as complete"}
                >
                  <span className={`custom-checkbox ${isDone ? "checked" : ""}`}>
                    {isDone && <CheckIcon size={12} />}
                  </span>
                </button>

                <Link href={`/A1/${topic.slug}`} className="simple-topic-link">
                  <span className="simple-topic-num">{topic.order}.</span>
                  <span className="simple-topic-title">{topic.title}</span>
                  {topic.titleEn && (
                    <span className="simple-topic-en">
                      — {topic.titleEn}
                    </span>
                  )}
                </Link>

                <span className={`simple-status-tag ${isDone ? "done" : "pending"}`}>
                  {isDone ? "Completed" : "Incomplete"}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
