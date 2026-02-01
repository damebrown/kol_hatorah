import { Chunk } from "./types";
import { Config } from "./config";

export function buildRagPrompt(question: string, chunks: Chunk[]): { instructions: string; input: string } {
  const context = chunks
    .map((chunk) => `Source: ${chunk.work}, Ref: ${chunk.ref}\nText: ${chunk.text}`)
    .join("\n\n");

  const instructions = `אתה עוזר. השב רק על בסיס המידע שסופק בהקשר. צטט את המקורות על ידי ציון העבודה וההפניה (לדוגמה: [בראשית 1:1]). אם המידע המסופק אינו מספיק או סותר, אמור שאינך יודע. השב בעברית.`;

  const input = `שאלה: ${question}\n\nהקשר:\n${context}`; 

  return { instructions, input };
}

export function shouldAnswer(chunks: Chunk[], scores: number[], config: Config): boolean {
  if (chunks.length < config.rag.minSources) {
    return false;
  }

  // RAG_MIN_SCORE is truly optional. If undefined in config, skip this check.
  if (config.rag.minScore !== undefined && config.rag.minScore !== null) {
    const minScore = config.rag.minScore;
    const relevantScores = scores.slice(0, config.rag.minSources); // Check only the top K for min sources
    if (relevantScores.some(score => score < minScore)) {
      return false;
    }
  }

  return true;
}
