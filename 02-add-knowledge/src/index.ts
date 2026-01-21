import "dotenv/config";
import { ToolLoopAgent, tool, embed } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { query, close } from "./db.js";

const model = google("gemini-2.5-flash");
const embeddingModel = google.embeddingModel("text-embedding-004");

// RAG tool: searches knowledge base using vector similarity
const searchKnowledge = tool({
  description:
    "Search the AI SDK documentation knowledge base for relevant information",
  inputSchema: z.object({
    query: z.string().describe("The search query about AI SDK"),
  }),
  execute: async ({ query: searchQuery }) => {
    console.log(`  [Tool] Searching knowledge: "${searchQuery}"`);

    // Generate embedding for the query
    const { embedding } = await embed({
      model: embeddingModel,
      value: searchQuery,
    });


    // Vector similarity search
    const results = await query<{ title: string; content: string }>(
      `SELECT title, content
       FROM documents
       ORDER BY embedding <-> $1
       LIMIT 3`,
      [JSON.stringify(embedding)]
    );

    console.log(`  [Tool] Found ${results.length} relevant docs`);

    return {
      documents: results.map((r) => ({
        title: r.title,
        content: r.content,
      })),
    };
  },
});

// Create agent with RAG capability
const researchAgent = new ToolLoopAgent({
  model,
  instructions: `You are a helpful AI SDK documentation assistant.
When asked a question, use the searchKnowledge tool to find relevant documentation.
Provide accurate answers based on the retrieved documentation.
Include code examples when available.`,
  tools: { searchKnowledge },
});

async function main() {
  console.log("=== RAG Agent Demo ===\n");
  console.log("Prompt: How do I generate structured output in AI SDK v6?\n");

  const { text } = await researchAgent.generate({
    prompt: "How do I generate structured output in AI SDK v6?",
  });

  console.log("\n=== Agent Response ===\n");
  console.log(text);

  await close();
}

main().catch(console.error);
