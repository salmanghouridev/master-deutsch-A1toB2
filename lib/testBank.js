import fs from "fs";
import path from "path";

const TEST_FILE_PATH = path.join(
  process.cwd(),
  "data",
  "A1_test",
  "german_A1_A2_foundations_grand_test_250.json"
);

export function getGrandTestBank() {
  try {
    if (!fs.existsSync(TEST_FILE_PATH)) {
      console.error("Test file does not exist at:", TEST_FILE_PATH);
      return { title: "Grand Test", questions: [] };
    }
    const raw = fs.readFileSync(TEST_FILE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return {
      title: parsed.title || "German A1–A2 Foundations Grand Test",
      germanTitle: parsed.german_title || "Großer Grammatiktest",
      totalQuestions: parsed.total_questions || (parsed.questions ? parsed.questions.length : 0),
      instructions: parsed.instructions || [],
      topicsCovered: parsed.topics_covered || [],
      questions: parsed.questions || [],
    };
  } catch (err) {
    console.error("Failed to load test bank:", err);
    return { title: "Grand Test", questions: [] };
  }
}
