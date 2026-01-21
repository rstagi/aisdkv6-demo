import { ToolLoopAgent, tool, embed } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { query } from "./db";
import {
  remember as redisRemember,
  recall as redisRecall,
  listMemories as redisListMemories,
} from "./redis";

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
    const results = await query<{
      title: string;
      content: string;
    }>(
      `SELECT title, content FROM documents ORDER BY embedding <-> $1 LIMIT 3`,
      [JSON.stringify(embedding)]
    );
    return {
      type: "search-results" as const,
      query: searchQuery,
      documents: results.map((doc, i) => ({
        id: i + 1,
        title: doc.title,
        content: doc.content,
        relevance: Math.round((1 - i * 0.15) * 100),
      })),
    };
  },
});

// Memory tools
const remember = tool({
  description:
    "Remember information for later (user preferences, facts, context)",
  inputSchema: z.object({
    key: z.string().describe("Short identifier for this memory"),
    value: z.string().describe("The information to remember"),
  }),
  execute: async ({ key, value }) => {
    await redisRemember(key, value);
    return {
      type: "memory-saved" as const,
      key,
      value,
      timestamp: new Date().toISOString(),
    };
  },
});

const recall = tool({
  description: "Recall a previously stored memory by key",
  inputSchema: z.object({
    key: z.string().describe("The identifier of the memory"),
  }),
  execute: async ({ key }) => {
    const value = await redisRecall(key);
    return value
      ? { type: "memory-recalled" as const, found: true, key, value }
      : { type: "memory-recalled" as const, found: false, key };
  },
});

const listMemories = tool({
  description: "List all stored memories",
  inputSchema: z.object({}),
  execute: async () => {
    const memories = await redisListMemories();
    return {
      type: "memory-list" as const,
      memories: Object.entries(memories).map(([key, value]) => ({
        key,
        value,
      })),
    };
  },
});

// Weather tool
const getWeather = tool({
  description: "Get the current weather for a location",
  inputSchema: z.object({
    location: z.string().describe("The city or location to get weather for"),
  }),
  execute: async ({ location }) => {
    const conditions = ["Sunny", "Cloudy", "Rainy", "Partly Cloudy"];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const temp = Math.floor(Math.random() * 30) + 10;

    return {
      type: "weather" as const,
      location,
      temperature: temp,
      unit: "°C",
      condition,
      humidity: Math.floor(Math.random() * 50) + 30,
      windSpeed: Math.floor(Math.random() * 20) + 5,
      forecast: [
        { day: "Tomorrow", temp: temp + Math.floor(Math.random() * 5) - 2 },
        { day: "Day After", temp: temp + Math.floor(Math.random() * 5) - 2 },
      ],
    };
  },
});

// Stock price tool
const getStockPrice = tool({
  description: "Get the current stock price for a ticker symbol",
  inputSchema: z.object({
    symbol: z.string().describe("The stock ticker symbol (e.g., AAPL, GOOGL)"),
  }),
  execute: async ({ symbol }) => {
    const price = Math.floor(Math.random() * 500) + 50;
    const change = (Math.random() * 10 - 5).toFixed(2);
    const changePercent = ((parseFloat(change) / price) * 100).toFixed(2);

    return {
      type: "stock-price" as const,
      symbol: symbol.toUpperCase(),
      price,
      currency: "USD",
      change: parseFloat(change),
      changePercent: parseFloat(changePercent),
      volume: Math.floor(Math.random() * 10000000),
      marketCap: `${Math.floor(Math.random() * 500) + 100}B`,
    };
  },
});

// Export the agent (multimodal-capable with Gemini)
export const researchAgent = new ToolLoopAgent({
  model,
  instructions: `You are a helpful AI assistant with vision capabilities.

Available tools:
- searchKnowledge: Search documentation for AI SDK info
- remember: Store user preferences and facts
- recall: Retrieve stored information
- listMemories: See all stored memories
- getWeather: Get current weather for a location
- getStockPrice: Get stock price for a ticker symbol

You can also analyze images! When users upload an image, describe what you see and answer any questions about it.

Be helpful and use tools when appropriate.`,
  tools: {
    searchKnowledge,
    remember,
    recall,
    listMemories,
    getWeather,
    getStockPrice,
  },
});
