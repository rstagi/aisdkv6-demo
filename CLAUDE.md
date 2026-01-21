# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Progressive demo for Vercel AI SDK v6 conference talk. 10 independent projects building a Research Assistant agent from basics to full Next.js app.

## Commands

### Infrastructure
```bash
docker compose up -d          # Start Postgres (pgvector) + Redis
docker compose down           # Stop containers
```

### Node.js projects (00-04)
```bash
cd <project-folder>
pnpm install
pnpm dev                      # Run main script
pnpm test                     # Run assertions
pnpm seed                     # (02 only) Seed knowledge base
pnpm eval:dev                 # (04 only) Evalite UI at localhost:3006
```

### Next.js projects (05-09)
```bash
cd <project-folder>
pnpm install
pnpm dev                      # Next.js at localhost:3000
pnpm test:e2e                 # Playwright tests
```

## Architecture

### Project Progression
- **00-04**: Node.js terminal demos using `tsx`
- **05-09**: Next.js 15 apps with App Router + Tailwind

### Shared Infrastructure
- PostgreSQL 16 + pgvector on port 5432 (user: demo, password: demo, db: ai_demo)
- Redis 7 on port 6379
- Root `.env` symlinked into each project (contains `GOOGLE_GENERATIVE_AI_API_KEY`)

### AI SDK v6 Patterns Used
- `generateText`, `streamText` with `Output.object` for structured output (not `generateObject`)
- `ToolLoopAgent` class for agent loops
- `tool()` with `inputSchema` (Zod) and optional `needsApproval: true`
- `embed`/`embedMany` for vector embeddings
- `createAgentUIStreamResponse` for Next.js API routes
- `useChat` from `@ai-sdk/react` for chat UI

### Key Shared Code (05-09)
- `src/lib/agent.ts` - ToolLoopAgent with tools (searchKnowledge, remember, recall, listMemories)
- `src/lib/db.ts` - Postgres connection + query helper
- `src/lib/redis.ts` - Redis memory operations
- `src/app/api/chat/route.ts` - POST handler using `createAgentUIStreamResponse`

### Database Schema (02-add-knowledge)
```sql
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(768)
);
```

## Dependencies
- Model: Google Gemini (`gemini-2.5-flash`) via `@ai-sdk/google`
- Embedding: `text-embedding-004`
- Evals: `evalite` (step 04)
- Testing: Playwright (steps 05-09)
