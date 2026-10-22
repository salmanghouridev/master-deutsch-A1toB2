import { notFound } from "next/navigation";
import { getAllFolders, getTopicFile } from "@/lib/grammar";
import StudyNoteView from "@/components/StudyNoteView";

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
        topic: folder.verbCompendium.slug,
      });
    }
  }

  return params;
}

export default async function TopicFilePage({ params }) {
  const { level, topic: topicSlug } = await params;
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
