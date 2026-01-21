# 01 - Simple Agent

## What this demonstrates

- `ToolLoopAgent` class - the v6 agent abstraction
- `tool()` function with `inputSchema` (Zod schema)
- Automatic tool loop execution

## Key concept

`ToolLoopAgent` wraps `generateText` and handles the tool loop:
1. LLM decides to call a tool
2. Tool executes
3. Result goes back to LLM
4. Repeat until done (default: up to 20 steps)

```ts
const agent = new ToolLoopAgent({
  model,
  instructions: "...",
  tools: { myTool },
});

const { text } = await agent.generate({ prompt: "..." });
```

## Run

```bash
ln -sf ../.env .env
pnpm install
pnpm dev
```

## Expected output

```
=== Research Agent Demo ===

Prompt: What are the new features in AI SDK v6?

  [Tool] Searching: "AI SDK v6 new features"

=== Agent Response ===

Based on my search, AI SDK v6 introduces...
```

## Speaker notes

- Agent is a class you instantiate once, reuse many times
- Tools have a description (for LLM) and inputSchema (for validation)
- The execute function does the actual work
- Notice how we see the tool call in the console - great for debugging
- Transition: "But what if we want the agent to have real knowledge?"
