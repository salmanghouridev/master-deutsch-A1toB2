"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const STORAGE_KEY = "study_atelier_state_v1";

const StudyContext = createContext(null);

export function StudyProvider({ children, allTopics = [] }) {
  const [hydrated, setHydrated] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [reviewed, setReviewed] = useState([]);
  const [lastOpened, setLastOpened] = useState(null);
  const [hideTranslations, setHideTranslations] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Load persisted state from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.bookmarks)) setBookmarks(parsed.bookmarks);
        if (Array.isArray(parsed.reviewed)) setReviewed(parsed.reviewed);
        if (parsed.lastOpened) setLastOpened(parsed.lastOpened);
        if (typeof parsed.hideTranslations === "boolean") {
          setHideTranslations(parsed.hideTranslations);
        }
      }
    } catch {
      // Ignore storage errors
    }
    setHydrated(true);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          bookmarks,
          reviewed,
          lastOpened,
          hideTranslations,
        })
      );
    } catch {
      // Ignore storage errors
    }
  }, [hydrated, bookmarks, reviewed, lastOpened, hideTranslations]);

  // Global keyboard shortcut (Cmd/Ctrl + K) for search
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  const toggleBookmark = useCallback((noteKey) => {
    setBookmarks((prev) =>
      prev.includes(noteKey)
        ? prev.filter((k) => k !== noteKey)
        : [...prev, noteKey]
    );
  }, []);

  const toggleReviewed = useCallback((noteKey) => {
    setReviewed((prev) =>
      prev.includes(noteKey)
        ? prev.filter((k) => k !== noteKey)
        : [...prev, noteKey]
    );
  }, []);

  const recordNoteOpened = useCallback((level, slug) => {
    const key = `${level}/${slug}`;
    setLastOpened({
      key,
      level,
      slug,
      openedAt: Date.now(),
    });
  }, []);

  const toggleHideTranslations = useCallback(() => {
    setHideTranslations((prev) => !prev);
  }, []);

  return (
    <StudyContext.Provider
      value={{
        hydrated,
        allTopics,
        bookmarks,
        reviewed,
        lastOpened,
        hideTranslations,
        searchOpen,
        setSearchOpen,
        toggleBookmark,
        toggleReviewed,
        recordNoteOpened,
        toggleHideTranslations,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) {
    throw new Error("useStudy must be used inside a StudyProvider");
  }
  return ctx;
}
