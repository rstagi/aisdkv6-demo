# 03 - Add Memory

## What this demonstrates

- Persistent state with Redis
- Memory tools: remember, recall, listMemories
- Agent that learns user preferences

## Prerequisites

```bash
docker compose up -d  # from root
cd ../02-add-knowledge && pnpm seed  # need knowledge base
```

## Run

```bash
ln -sf ../.env .env
pnpm install
pnpm dev
```

## How it works

1. User tells agent their name/preferences
2. Agent stores in Redis via `remember` tool
3. Later requests use `recall` to personalize responses
4. State persists across sessions

## Expected output

```
=== Memory Agent Demo ===

--- Turn 1: Storing a preference ---
User: My name is Alice and I prefer TypeScript examples.

  [Tool] Remembering: name = "Alice"
  [Tool] Remembering: preference = "TypeScript examples"

Agent: Nice to meet you, Alice! I've noted your preference...

--- Turn 2: Using the memory ---
User: What's my name and how do I use streamText?

  [Tool] Recalling: name
  [Tool] Searching knowledge: "streamText"

Agent: Alice, here's how to use streamText...
```

## Speaker notes

- "The agent now has long-term memory"
- Show Redis: `docker exec -it ai-demo-redis redis-cli KEYS 'memory:*'`
- Memory persists even if you restart the script
- "Great for personalization, user preferences, session context"
- Transition: "How do we know this actually works? Let's add evals..."
