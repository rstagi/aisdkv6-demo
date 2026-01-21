import "dotenv/config";
import {
  remember,
  recall,
  listMemories,
  clearMemories,
  closeRedis,
} from "./redis.js";

async function runTests() {
  let passed = 0;
  let failed = 0;

  // Clean up first
  await clearMemories();

  // Test 1: Remember and recall
  try {
    await remember("test-key", "test-value");
    const value = await recall("test-key");

    if (value === "test-value") {
      console.log("PASS: Remember and recall works");
      passed++;
    } else {
      console.log("FAIL: Recall returned", value);
      failed++;
    }
  } catch (e) {
    console.log("FAIL: Remember/recall error:", e);
    failed++;
  }

  // Test 2: List memories
  try {
    await remember("another-key", "another-value");
    const memories = await listMemories();

    if (memories.length >= 2) {
      console.log("PASS: List memories returns stored items");
      passed++;
    } else {
      console.log("FAIL: Expected at least 2 memories, got", memories.length);
      failed++;
    }
  } catch (e) {
    console.log("FAIL: List memories error:", e);
    failed++;
  }

  // Cleanup
  await clearMemories();
  await closeRedis();

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
