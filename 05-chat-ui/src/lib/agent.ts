import { ToolLoopAgent, tool, embed } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { query } from "./db";
import { remember as redisRemember, recall as redisRecall, listMemories as redisListMemories } from "./redis";

const model = google("gemini-2.5-flash");
const embeddingModel = google.textEmbeddingModel("text-embedding-004");

// RAG tool
const searchKnowledge = tool({
  description: "Search the AI SDK documentation knowledge base",
  inputSchema: z.object({
    query: z.string().describe("The search query about AI SDK"),
  }),
  execute: async ({ query: searchQuery }) => {
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

// Memory tools
const remember = tool({
  description: "Remember information for later (user preferences, facts, context)",
  inputSchema: z.object({
    key: z.string().describe("Short identifier for this memory"),
    value: z.string().describe("The information to remember"),
  }),
  execute: async ({ key, value }) => {
    await redisRemember(key, value);
    return { success: true, message: `Remembered "${key}"` };
  },
});

const recall = tool({
  description: "Recall a previously stored memory by key",
  inputSchema: z.object({
    key: z.string().describe("The identifier of the memory"),
  }),
  execute: async ({ key }) => {
    const value = await redisRecall(key);
    return value ? { found: true, value } : { found: false };
  },
});

const listMemories = tool({
  description: "List all stored memories",
  inputSchema: z.object({}),
  execute: async () => {
    const memories = await redisListMemories();
    return { memories };
  },
});

// Export the agent
export const researchAgent = new ToolLoopAgent({
  model,
  instructions: `You are a helpful AI SDK documentation assistant with memory.

Available tools:
- searchKnowledge: Search documentation for AI SDK info
- remember: Store user preferences and facts
- recall: Retrieve stored information
- listMemories: See all stored memories

Be helpful, concise, and use tools when appropriate.`,
  tools: { searchKnowledge, remember, recall, listMemories },
});
