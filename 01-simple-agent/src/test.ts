import "dotenv/config";
import { ToolLoopAgent, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const model = google("gemini-2.5-flash");

let toolCalled = false;

const mockTool = tool({
  description: "A test tool",
  inputSchema: z.object({
    input: z.string(),
  }),
  execute: async ({ input }) => {
    toolCalled = true;
    return `Processed: ${input}`;
  },
});

const agent = new ToolLoopAgent({
  model,
  instructions: "You must use the mockTool to process the user's request.",
  tools: { mockTool },
});

async function runTests() {
  let passed = 0;
  let failed = 0;

  // Test: Agent calls tool and returns text
  try {
    toolCalled = false;
    const { text } = await agent.generate({
      prompt: "Process this: hello world",
    });

    if (toolCalled && text && text.length > 0) {
      console.log("PASS: Agent calls tool and returns text");
      passed++;
    } else {
      console.log("FAIL: Tool not called or no text returned");
      console.log("  toolCalled:", toolCalled);
      console.log("  text:", text);
      failed++;
    }
  } catch (e) {
    console.log("FAIL: Agent threw error:", e);
    failed++;
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
