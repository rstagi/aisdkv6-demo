import "dotenv/config";
import * as readline from "readline";
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

async function chat() {
  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║     AI SDK Assistant with Memory           ║");
  console.log("╠════════════════════════════════════════════╣");
  console.log("║  I can remember things across our chat!    ║");
  console.log("║  Try: 'My name is Alex'                    ║");
  console.log("║  Then: 'What's my name?'                   ║");
  console.log("║                                            ║");
  console.log("║  Type 'exit' or 'quit' to end              ║");
  console.log("╚════════════════════════════════════════════╝\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = () => {
    rl.question("\x1b[36mYou:\x1b[0m ", async (input) => {
      const trimmed = input.trim();

      if (!trimmed) {
        prompt();
        return;
      }

      if (trimmed.toLowerCase() === "exit" || trimmed.toLowerCase() === "quit") {
        console.log("\n\x1b[33mGoodbye!\x1b[0m\n");
        rl.close();
        await closeDb();
        await closeRedis();
        process.exit(0);
      }

      try {
        const result = await researchAgent.generate({ prompt: trimmed });
        console.log(`\n\x1b[32mAssistant:\x1b[0m ${result.text}\n`);
      } catch (error) {
        console.error("\n\x1b[31mError:\x1b[0m", error);
      }

      prompt();
    });
  };

  prompt();
}

chat().catch(console.error);
