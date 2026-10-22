import { getSearchIndex } from "@/lib/grammar";
import { StudyProvider } from "@/components/StudyProvider";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata = {
  title: "Study Atelier — German Grammar Library (A1–B1)",
  description:
    "Lightweight German language study notes for A1, A2, and B1 grammar.",
};

export default function RootLayout({ children }) {
  const searchIndex = getSearchIndex();

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Lora:ital,wght@0,500;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StudyProvider allTopics={searchIndex}>
          <div className="atelier-shell">
            <Navbar />
            <main className="atelier-main">{children}</main>
            <footer className="atelier-footer no-print">
              <div className="atelier-footer-inner">
                <span>Study Atelier · German Grammar (A1 – B1)</span>
                <span className="meta-dot">·</span>
                <span>⌘K to search</span>
              </div>
            </footer>
          </div>
        </StudyProvider>
      </body>
    </html>
  );
}
