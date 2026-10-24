import { getVocabData } from "@/lib/vocab";
import VocabView from "@/components/VocabView";

export const metadata = {
  title: "German Vocabulary Flashcards (A1 & A2) | Study Atelier",
  description:
    "Active-recall German A1 and A2 vocabulary cards with visual image icons, 1–2 letter memory hints, native speech audio, and 66 topic collections.",
};

export default function VocabPage() {
  const a1Data = getVocabData("A1");
  const a2Data = getVocabData("A2");

  return <VocabView a1Data={a1Data} a2Data={a2Data} />;
}
