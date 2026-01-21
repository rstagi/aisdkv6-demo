import "dotenv/config";
import { embedMany } from "ai";
import { google } from "@ai-sdk/google";
import { pool, query, close } from "./db.js";
import { documents } from "./documents.js";

const embeddingModel = google.textEmbeddingModel("text-embedding-004");

async function seed() {
  console.log("Setting up database...\n");

  // Enable pgvector extension
  await pool.query("CREATE EXTENSION IF NOT EXISTS vector");

  // Drop and recreate table (idempotent)
  await pool.query("DROP TABLE IF EXISTS documents");
  await pool.query(`
    CREATE TABLE documents (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      embedding vector(768)
    )
  `);

  console.log(`Generating embeddings for ${documents.length} documents...`);

  // Generate embeddings for all documents
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: documents.map((d) => `${d.title}\n\n${d.content}`),
  });

  console.log("Inserting documents...\n");

  // Insert documents with embeddings
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    const embedding = embeddings[i];

    await query(
      `INSERT INTO documents (title, content, embedding) VALUES ($1, $2, $3)`,
      [doc.title, doc.content, JSON.stringify(embedding)]
    );

    console.log(`  [${i + 1}/${documents.length}] ${doc.title}`);
  }

  console.log("\nSeed complete!");
  await close();
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
