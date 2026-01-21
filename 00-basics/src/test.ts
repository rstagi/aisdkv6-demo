import "dotenv/config";
import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const model = google("gemini-2.5-flash");

async function runTests() {
  let passed = 0;
  let failed = 0;

  // Test 1: Basic generation returns text
  try {
    const { text } = await generateText({
      model,
      prompt: "Say hello",
    });
    if (text && text.length > 0) {
      console.log("PASS: Basic generation returns text");
      passed++;
    } else {
      console.log("FAIL: Basic generation returned empty");
      failed++;
    }
  } catch (e) {
    console.log("FAIL: Basic generation threw error:", e);
    failed++;
  }

  // Test 2: Structured output returns valid object
  try {
    const { output } = await generateText({
      model,
      prompt: "Generate a person with name John and age 30",
      output: Output.object({
        schema: z.object({
          name: z.string(),
          age: z.number(),
        }),
      }),
    });
    if (output && typeof output.name === "string" && typeof output.age === "number") {
      console.log("PASS: Structured output returns valid object");
      passed++;
    } else {
      console.log("FAIL: Structured output invalid:", output);
      failed++;
    }
  } catch (e) {
    console.log("FAIL: Structured output threw error:", e);
    failed++;
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
