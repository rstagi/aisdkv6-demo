import "dotenv/config";
import { generateText, streamText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const model = google("gemini-2.5-flash");

// 1. Simple text generation
async function basicGeneration() {
  console.log("\n=== Basic Text Generation ===\n");

  const { text } = await generateText({
    model,
    prompt: "What is Vercel AI SDK in one sentence?",
  });

  console.log(text);
}

// 2. Streaming text
async function streamingExample() {
  console.log("\n=== Streaming Text ===\n");

  const result = streamText({
    model,
    prompt: "Tell me the recipe of tiramisu.",
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
  console.log("\n");
}

// 3. Structured output with Output.object (v6 pattern)
async function structuredOutput() {
  console.log("\n=== Structured Output (v6) ===\n");

  const { output } = await generateText({
    model,
    prompt: "Generate a user profile for a software engineer",
    output: Output.object({
      schema: z.object({
        name: z.string(),
        age: z.number(),
        role: z.string(),
        skills: z.array(z.string()),
      }),
    }),
  });

  console.log(JSON.stringify(output, null, 2));
}

// Run all examples
async function main() {
  try {
    await basicGeneration();
    // await streamingExample();
    // await structuredOutput();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
