import "dotenv/config";
import { embed } from "ai";
import { google } from "@ai-sdk/google";
import { query, close } from "./db.js";

const embeddingModel = google.textEmbeddingModel("text-embedding-004");

async function runTests() {
  let passed = 0;
  let failed = 0;

  // Test 1: Documents exist in database
  try {
    const docs = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM documents"
    );
    const count = parseInt(docs[0].count, 10);

    if (count > 0) {
      console.log(`PASS: Database has ${count} documents`);
      passed++;
    } else {
      console.log("FAIL: Database is empty - run pnpm seed first");
      failed++;
    }
  } catch (e) {
    console.log("FAIL: Could not query database:", e);
    failed++;
  }

  // Test 2: Vector search returns results
  try {
    const { embedding } = await embed({
      model: embeddingModel,
      value: "How to use generateText",
    });

    const results = await query<{ title: string }>(
      `SELECT title FROM documents ORDER BY embedding <-> $1 LIMIT 3`,
      [JSON.stringify(embedding)]
    );

    if (results.length === 3) {
      console.log("PASS: Vector search returns results");
      console.log(`  Top result: ${results[0].title}`);
      passed++;
    } else {
      console.log("FAIL: Vector search returned", results.length, "results");
      failed++;
    }
  } catch (e) {
    console.log("FAIL: Vector search error:", e);
    failed++;
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  await close();
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
