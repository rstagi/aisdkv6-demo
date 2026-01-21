import "dotenv/config";
import { ToolLoopAgent, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const model = google("gemini-2.5-flash");

// Define a mock web search tool
const searchWeb = tool({
  description: "Search the web for information",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query }) => {
    console.log(`  [Tool] Searching: "${query}"`);
    // Mock results - in real app this would call a search API
    return {
      results: [
        `AI SDK v6 introduces ToolLoopAgent for ${query}`,
        `The Output.object pattern replaces generateObject in v6`,
        `Streaming is supported via streamText for ${query}`,
      ],
    };
  },
});

// Create agent with the tool
const researchAgent = new ToolLoopAgent({
  model,
  instructions: `You are a helpful research assistant.
When asked a question, use the searchWeb tool to find information.
Provide a concise answer based on the search results.`,
  tools: { searchWeb },
});

async function main() {
  console.log("=== Research Agent Demo ===\n");
  console.log("Prompt: What are the new features in AI SDK v6?\n");

  const { text } = await researchAgent.generate({
    prompt: "What are the new features in AI SDK v6?",
  });

  console.log("\n=== Agent Response ===\n");
  console.log(text);
}

main().catch(console.error);
