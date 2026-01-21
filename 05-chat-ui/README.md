# 05 - Chat UI

## What this demonstrates

- Next.js 15 with App Router
- `useChat` hook from @ai-sdk/react
- `createAgentUIStreamResponse` for streaming
- Tool invocations shown in UI

## Prerequisites

```bash
docker compose up -d  # from root
cd ../02-add-knowledge && pnpm seed  # need knowledge base
```

## Run

```bash
ln -sf ../.env .env
pnpm install
pnpm dev  # Opens at http://localhost:3000
```

## File structure

```
src/
  app/
    page.tsx        # Chat UI component
    api/chat/
      route.ts      # API route with agent
  lib/
    agent.ts        # ToolLoopAgent definition
    db.ts           # PostgreSQL connection
    redis.ts        # Redis memory
```

## Expected behavior

1. Chat interface with input and send button
2. Messages appear in bubbles (user right, assistant left)
3. Tool calls show as small badges (searchKnowledge, remember, etc.)
4. Streaming responses appear progressively

## Speaker notes

- "Same agent code, now in a UI"
- Open Network tab: show SSE streaming
- Point out the tool badges: "You can see the agent thinking"
- "useChat handles all the state management"
- Transition: "What if we need approval before running dangerous tools?"
