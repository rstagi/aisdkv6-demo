import "dotenv/config";
import { ToolLoopAgent, tool, embed } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { query, close as closeDb } from "./db.js";
import {
  remember as redisRemember,
  recall as redisRecall,
  listMemories as redisListMemories,
  closeRedis,
} from "./redis.js";

const model = google("gemini-2.5-flash");
const embeddingModel = google.textEmbeddingModel("text-embedding-004");

// RAG tool from step 02
const searchKnowledge = tool({
  description:
    "Search the AI SDK documentation knowledge base for relevant information",
  inputSchema: z.object({
    query: z.string().describe("The search query about AI SDK"),
  }),
  execute: async ({ query: searchQuery }) => {
    console.log(`  [Tool] Searching knowledge: "${searchQuery}"`);
    const { embedding } = await embed({
      model: embeddingModel,
      value: searchQuery,
    });
    const results = await query<{ title: string; content: string }>(
      `SELECT title, content FROM documents ORDER BY embedding <-> $1 LIMIT 3`,
      [JSON.stringify(embedding)]
    );
    return { documents: results };
  },
});

// Memory tools - new in step 03
const remember = tool({
  description: "Remember a piece of information for later. Use for user preferences, important facts, or context.",
  inputSchema: z.object({
    key: z.string().describe("A short identifier for this memory"),
    value: z.string().describe("The information to remember"),
  }),
  execute: async ({ key, value }) => {
    console.log(`  [Tool] Remembering: ${key} = "${value}"`);
    await redisRemember(key, value);
    return { success: true, message: `Remembered "${key}"` };
  },
});

const recall = tool({
  description: "Recall a previously stored piece of information by its key",
  inputSchema: z.object({
    key: z.string().describe("The identifier of the memory to recall"),
  }),
  execute: async ({ key }) => {
    console.log(`  [Tool] Recalling: ${key}`);
    const value = await redisRecall(key);
    if (value) {
      return { found: true, value };
    }
    return { found: false, message: `No memory found for "${key}"` };
  },
});

const listMemories = tool({
  description: "List all stored memories",
  inputSchema: z.object({}),
  execute: async () => {
    console.log(`  [Tool] Listing all memories`);
    const memories = await redisListMemories();
    return { memories };
  },
});

// Agent with knowledge + memory
const researchAgent = new ToolLoopAgent({
  model,
  instructions: `You are a helpful AI SDK assistant with persistent memory.

You can:
- Search documentation with searchKnowledge
- Remember information with remember (use for user preferences, names, etc.)
- Recall information with recall
- List all memories with listMemories

Always check memories first when answering personal questions.`,
  tools: { searchKnowledge, remember, recall, listMemories },
});

async function main() {
  console.log("=== Memory Agent Demo ===\n");

  // First interaction: store a preference
  console.log("--- Turn 1: Storing a preference ---\n");
  console.log("User: My name is Alice and I prefer TypeScript examples.\n");

  const turn1 = await researchAgent.generate({
    prompt: "My name is Alice and I prefer TypeScript examples.",
  });
  console.log("\nAgent:", turn1.text, "\n");

  // Second interaction: use the memory
  console.log("\n--- Turn 2: Using the memory ---\n");
  console.log("User: What's my name and how do I use streamText?\n");

  const turn2 = await researchAgent.generate({
    prompt: "What's my name and how do I use streamText?",
  });
  console.log("\nAgent:", turn2.text, "\n");

  // Cleanup
  await closeDb();
  await closeRedis();
}

main().catch(console.error);
