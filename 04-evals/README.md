# 04 - Evals

## What this demonstrates

- Evalite - TypeScript eval runner
- Custom scorers for AI output quality
- Systematic testing of RAG answers

## Prerequisites

```bash
docker compose up -d  # from root
cd ../02-add-knowledge && pnpm seed  # need knowledge base
```

## Run

```bash
ln -sf ../.env .env
npm install       # npm for native module (better-sqlite3)
npm run eval:dev  # Opens UI at localhost:3006
```

## How it works

1. Define test cases with input + expected keywords
2. Task runs the RAG pipeline on each input
3. Scorers evaluate the output:
   - Contains expected keyword?
   - Has code example?
   - Reasonable length?

## File structure

```
src/
  knowledge.eval.ts   # Evalite test file
```

## Expected output

```
evalite v0.11.0

  Knowledge Retrieval
    ✓ How do I stream text... (1.2s) [0.83]
    ✓ How do I generate... (0.9s) [1.00]
    ...

Open localhost:3006 to see detailed results
```

## Speaker notes

- "Test your AI like you test your code"
- Show the UI - traces, scores, inputs/outputs
- Explain scorers: "Not just pass/fail - quality metrics"
- Run it twice: "Second run is faster - caching!"
- "In CI, set score thresholds to fail builds"
- Transition: "Now let's put this in a real UI..."
