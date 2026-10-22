// Renders a string and turns **text** into <strong> and *text* into <em>.
export default function Rich({ text }) {
  if (!text) return null;
  const rawStr =
    typeof text === "string"
      ? text
      : typeof text === "object"
      ? text.text || text.explanation || text.rule || text.title || text.german || ""
      : String(text);

  if (!rawStr) return null;
  const tokens = rawStr.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return tokens.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
