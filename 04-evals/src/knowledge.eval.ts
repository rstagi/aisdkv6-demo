import "dotenv/config";
import { evalite } from "evalite";
import { generateText, embed } from "ai";
import { google } from "@ai-sdk/google";
import { query, close } from "./db.js";

const model = google("gemini-2.5-flash");
const embeddingModel = google.textEmbeddingModel("text-embedding-004");

// Search knowledge base (same as step 02)
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

// RAG-based answering
async function answerWithKnowledge(question: string): Promise<string> {
  const context = await searchKnowledge(question);

  const { text } = await generateText({
    model,
    system: `You are a helpful AI SDK documentation assistant.
Answer the question based ONLY on the provided documentation.
Be concise and accurate.`,
    prompt: `Documentation:\n${context}\n\nQuestion: ${question}`,
  });

  return text;
}

// Register cleanup
process.on("exit", () => close());

evalite("Knowledge Retrieval", {
  data: () => [
    {
      input: "How do I stream text in AI SDK?",
      expected: "streamText",
    },
    {
      input: "How do I generate structured output in v6?",
      expected: "Output.object",
    },
    {
      input: "What is the agent class in AI SDK v6?",
      expected: "ToolLoopAgent",
    },
    {
      input: "How do I define a tool?",
      expected: "inputSchema",
    },
    {
      input: "How do I get embeddings?",
      expected: "embed",
    },
  ],

  task: async (input) => {
    return answerWithKnowledge(input);
  },

  scorers: [
    {
      name: "Contains Expected",
      scorer: ({ output, expected }) => {
        const contains = output.toLowerCase().includes(expected.toLowerCase());
        return contains ? 1 : 0;
      },
    },
    {
      name: "Has Code Example",
      scorer: ({ output }) => {
        const hasCode = output.includes("```") || output.includes("`");
        return hasCode ? 1 : 0;
      },
    },
    {
      name: "Reasonable Length",
      scorer: ({ output }) => {
        const len = output.length;
        // Good answer: 100-500 chars
        if (len >= 100 && len <= 500) return 1;
        if (len >= 50 && len <= 800) return 0.5;
        return 0;
      },
    },
  ],
});
