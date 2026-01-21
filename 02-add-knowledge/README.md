# 02 - Add Knowledge (RAG)

## What this demonstrates

- `embed` / `embedMany` - generating embeddings
- pgvector - vector similarity search
- RAG pattern - retrieval augmented generation

## Prerequisites

```bash
# Start Docker containers (Postgres with pgvector)
docker compose up -d  # from root
```

## Run

```bash
ln -sf ../.env .env
pnpm install
pnpm seed    # Generate embeddings and populate database
pnpm dev     # Run the RAG agent
```

## How it works

1. **Seed**: Embeds documentation snippets, stores in pgvector
2. **Query**: User asks a question
3. **Retrieve**: Agent searches similar documents via vector similarity
4. **Generate**: Agent answers using retrieved context

## Expected output

```
=== RAG Agent Demo ===

Prompt: How do I generate structured output in AI SDK v6?

  [Tool] Searching knowledge: "structured output AI SDK v6"
  [Tool] Found 3 relevant docs

=== Agent Response ===

In AI SDK v6, use Output.object with generateText...
[Code example from retrieved docs]
```

## Speaker notes

- Show the seed script - "We're creating real embeddings"
- Explain vector similarity - "Closest meaning, not keyword match"
- Point out the tool returns actual documentation
- "Now the agent has real, accurate knowledge"
- Transition: "But it forgets everything between requests..."
