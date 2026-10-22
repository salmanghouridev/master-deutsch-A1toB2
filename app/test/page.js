import { getGrandTestBank } from "@/lib/testBank";
import TestRunnerView from "@/components/TestRunnerView";

export const metadata = {
  title: "Master A1 Foundation 1 to 17 Test | German Study Atelier",
  description:
    "Timed 12-question quiz selected at random from the 250 master test bank covering German A1 Foundations 1 to 17.",
};

export default function TestPage() {
  const bank = getGrandTestBank();
  return <TestRunnerView allQuestions={bank.questions} />;
}
