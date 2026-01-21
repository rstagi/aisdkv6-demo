# 06 - Human-in-the-Loop

## What this demonstrates

- `needsApproval: true` on tools
- `addToolResult` to respond to approval requests
- Safety guardrails for dangerous operations

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

## Key code changes from 05

```ts
// In agent.ts - add needsApproval to a tool
const executeCode = tool({
  description: "Execute JavaScript code",
  inputSchema: z.object({ code: z.string() }),
  needsApproval: true, // <-- This is new!
  execute: async ({ code }) => eval(code),
});
```

```tsx
// In page.tsx - handle approval UI
const { addToolResult } = useChat();

// When tool state is "requires-approval", show buttons
if (state === "requires-approval") {
  return (
    <div>
      <button onClick={() => addToolResult({ toolCallId, result: "approved" })}>
        Approve
      </button>
      <button onClick={() => addToolResult({ toolCallId, result: "denied" })}>
        Deny
      </button>
    </div>
  );
}
```

## Expected behavior

1. Ask: "Calculate 2 + 2 with code"
2. Agent proposes to run `executeCode` with `"2 + 2"`
3. Yellow approval dialog appears
4. Click Approve - agent executes and shows result
5. Click Deny - agent acknowledges denial

## Speaker notes

- "One line changes everything: `needsApproval: true`"
- "The agent pauses, waits for human decision"
- "Perfect for dangerous ops: deletions, payments, external calls"
- "Can also be conditional: `needsApproval: (input) => input.includes('rm')`"
- Transition: "Now let's make tool results look better..."
