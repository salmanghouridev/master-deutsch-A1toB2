import { getVocabData } from "@/lib/vocab";
import VocabView from "@/components/VocabView";

export const metadata = {
  title: "German A1 Vocabulary Flashcards (Topics 2–44) | Study Atelier",
  description:
    "Active-recall German A1 vocabulary cards with visual image icons, 1–2 letter memory hints, native speech audio, and 43 topic collections.",
};

export default function VocabPage() {
  const vocabData = getVocabData();

  return <VocabView vocabData={vocabData} />;
}
