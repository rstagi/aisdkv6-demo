# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Progressive demo building a Research Assistant agent using Vercel AI SDK v6, from Node.js basics to full Next.js app.

## Commands

**Infrastructure:**
```bash
docker compose up -d  # Start Postgres (pgvector) and Redis
```

**Each project is independent - cd into folder first:**
```bash
pnpm install
pnpm dev         # Run Node.js demos or Next.js dev server
pnpm test        # Run tests (evals in 04, Playwright E2E in Next.js projects)
```

**Project-specific:**
```bash
# 04-evals
pnpm eval:dev    # Evalite watch mode
pnpm eval:run    # Run evaluations once

# Next.js projects (05-09)
pnpm test:e2e    # Run Playwright E2E tests
```

**Database seeding (02-add-knowledge):**
```bash
cd 02-add-knowledge && pnpm tsx src/seed.ts
```

## Architecture

**Project progression:**
- `00-basics` - Core AI SDK: `generateText`, `streamText`, `Output.object` with Zod
- `01-simple-agent` - `ToolLoopAgent` with mock tools
- `02-add-knowledge` - pgvector RAG via `embed()` + vector similarity search
- `03-add-memory` - Redis persistence for agent memory
- `04-evals` - Evalite-based LLM evaluations with custom scorers
- `05-chat-ui` - Next.js with `useChat` + `createAgentUIStreamResponse`
- `06-human-in-the-loop` - `needsApproval` on tools
- `07-generative-ui` - Streaming components with structured tool output
- `08-multimodal` - Image upload handling
- `09-final` - Complete polished app

**Key patterns:**

Agent creation (v6):
```typescript
const agent = new ToolLoopAgent({
  model: google("gemini-2.5-flash"),
  instructions: "...",
  tools: { searchKnowledge, remember, recall },
});
```

Tool definition:
```typescript
const myTool = tool({
  description: "...",
  inputSchema: z.object({ query: z.string() }),
  needsApproval: true,  // Optional human-in-the-loop
  execute: async ({ query }) => ({ result: "..." }),
});
```

Next.js API route:
```typescript
export async function POST(req: Request) {
  const { messages } = await req.json();
  return createAgentUIStreamResponse({ agent, uiMessages: messages });
}
```

**Infrastructure:**
- Postgres with pgvector @ localhost:5432 (user: demo, db: ai_demo)
- Redis @ localhost:6379
- Root `.env` contains `GOOGLE_GENERATIVE_AI_API_KEY`, symlinked by projects

**Shared modules across projects:**
- `db.ts` - Postgres connection pool
- `redis.ts` - Redis memory storage (remember/recall/listMemories)
- `agent.ts` - ToolLoopAgent configuration with tools
