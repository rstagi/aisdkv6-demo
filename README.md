# AI SDK v6 Demo

Progressive demo building a Research Assistant agent, from basics to full Next.js app.

## Quick Start

```bash
# Start infrastructure
docker compose up -d

# Each project is independent - cd into folder and:
pnpm install
pnpm dev
```

## Structure

| Step | Type | What it demonstrates |
|------|------|---------------------|
| 00-basics | Node.js | generateText, streamText, Output.object |
| 01-simple-agent | Node.js | ToolLoopAgent with mock tool |
| 02-add-knowledge | Node.js | pgvector RAG |
| 03-add-memory | Node.js | Redis persistent memory |
| 04-evals | Node.js | Evalite evaluation |
| 05-chat-ui | Next.js | useChat + agent |
| 06-human-in-the-loop | Next.js | needsApproval flow |
| 07-generative-ui | Next.js | Streaming components |
| 08-multimodal | Next.js | Image upload |
| 09-final | Next.js | Polished showcase |

## Requirements

- Node.js 20+
- pnpm
- Docker

## Environment

Root `.env` contains `GOOGLE_GENERATIVE_AI_API_KEY`. Each project symlinks to it.
