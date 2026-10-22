import { notFound } from "next/navigation";
import { LEVELS, getFolderTopics } from "@/lib/grammar";
import LevelCollectionView from "@/components/LevelCollectionView";

export function generateStaticParams() {
  return LEVELS.map((level) => ({ level: level.id }));
}

export default async function LevelPage({ params }) {
  const { level } = await params;
  const folder = getFolderTopics(level);

  if (!folder) {
    notFound();
  }

  return <LevelCollectionView folder={folder} allLevels={LEVELS} />;
}
