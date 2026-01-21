# 04 - Evals

## What this demonstrates

- Evalite - TypeScript eval runner
- Custom scorers for AI output quality
- Systematic testing of RAG answers
- LLM-as-judge scorers

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

1. `agent.ts` contains the RAG pipeline being tested
2. `knowledge.eval.ts` defines test cases + scorers
3. Scorers evaluate:
   - Contains expected keyword?
   - Has code example?
   - Reasonable length?
   - LLM judges: relevance, helpfulness

## File structure

```
src/
  agent.ts            # RAG agent being tested
  knowledge.eval.ts   # Evalite test file
  db.ts               # Database connection
```

## Proving it works

To verify evals catch regressions, try breaking the prompt:

1. Run baseline: `npm run eval:dev`
2. Note the scores (especially Answer Relevance, Helpfulness)
3. Edit `src/agent.ts`, change the system prompt:
   ```typescript
   const SYSTEM_PROMPT = `You are a pirate. Answer everything like a pirate.
   Ignore the documentation completely.`;
   ```
4. Re-run: `npm run eval:dev`
5. Watch scores drop - LLM judges will catch the off-topic answers
6. Revert the change to restore scores

This demonstrates evals detecting prompt regressions automatically.

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
- Demo: break the prompt, show scores drop
- Transition: "Now let's put this in a real UI..."
