import "dotenv/config";
import { generateText, embed } from "ai";
import { google } from "@ai-sdk/google";
import { query } from "./db.js";

const model = google("gemini-2.5-flash");
const embeddingModel = google.textEmbeddingModel("text-embedding-004");

const SYSTEM_PROMPT = `You are a helpful AI SDK documentation assistant.
Answer the question based ONLY on the provided documentation.
Be concise and accurate.`;

export { SYSTEM_PROMPT };

async function searchKnowledge(searchQuery: string): Promise<string> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: searchQuery,
  });

  const results = await query<{ title: string; content: string }>(
    `SELECT title, content FROM documents ORDER BY embedding <-> $1 LIMIT 3`,
    [JSON.stringify(embedding)]
  );

  return results.map((r) => `## ${r.title}\n${r.content}`).join("\n\n");
}

export async function answerWithKnowledge(
  question: string,
  systemPrompt = SYSTEM_PROMPT
): Promise<string> {
  const context = await searchKnowledge(question);

  const { text } = await generateText({
    model,
    system: systemPrompt,
    prompt: `Documentation:\n${context}\n\nQuestion: ${question}`,
  });

  return text;
}
