import { notFound } from "next/navigation";
import { getAllFolders, getTopicFile, LEVELS, getFolderTopics } from "@/lib/grammar";
import StudyNoteView from "@/components/StudyNoteView";
import LevelCollectionView from "@/components/LevelCollectionView";

export function generateStaticParams() {
  const folders = getAllFolders();
  const params = [];

  for (const folder of folders) {
    for (const topic of folder.topics) {
      params.push({
        level: folder.id,
        topic: topic.slug,
      });
    }
    if (folder.verbCompendium) {
      params.push({
        level: folder.id,
        topic: "verbpattern",
      });
      params.push({
        level: folder.id,
        topic: "verbpatterns",
      });
      params.push({
        level: folder.id,
        topic: "verb-pattern",
      });
      params.push({
        level: folder.id,
        topic: folder.verbCompendium.slug,
      });
    }
  }

  return params;
}

export default async function TopicFilePage({ params }) {
  const { level, topic: topicSlug } = await params;
  const targetSlug = decodeURIComponent(String(topicSlug)).toLowerCase();

  // If this is verbpattern or verb compendium, render LevelCollectionView with initialTab="verbs"
  if (
    targetSlug === "verbpattern" ||
    targetSlug === "verbpatterns" ||
    targetSlug === "verb-pattern" ||
    targetSlug === "verb-patterns" ||
    targetSlug === "german_a1_verbs_grouped_by_conjugation_pattern"
  ) {
    const folder = getFolderTopics(level);
    if (!folder || !folder.verbCompendium) {
      notFound();
    }
    return (
      <LevelCollectionView
        folder={folder}
        allLevels={LEVELS}
        initialTab="verbs"
      />
    );
  }

  const data = getTopicFile(level, topicSlug);
  if (!data) {
    notFound();
  }

  return (
    <StudyNoteView
      folder={data.folder}
      topic={data.topic}
      prevTopic={data.prevTopic}
      nextTopic={data.nextTopic}
      relatedTopics={data.relatedTopics}
    />
  );
}
