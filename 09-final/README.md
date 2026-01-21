# 09 - Final Showcase

## What this demonstrates

This is the polished, complete version integrating everything we built:

- Text generation with Gemini 2.5 Flash
- ToolLoopAgent for autonomous tool use
- RAG with pgvector for knowledge search
- Redis for persistent memory
- Generative UI with rich tool result cards
- Multimodal image analysis
- Clean, responsive design

## Prerequisites

```bash
docker compose up -d  # from root
cd ../02-add-knowledge && pnpm seed  # seed knowledge base
```

## Run

```bash
ln -sf ../.env .env
pnpm install
pnpm dev  # Opens at http://localhost:3000
```

## Features showcase

### Tools available

1. **searchKnowledge** - RAG over AI SDK documentation
2. **remember** - Store information in Redis
3. **recall** - Retrieve stored memories
4. **listMemories** - See all memories
5. **getWeather** - Get weather for any location
6. **getStockPrice** - Get stock prices

### UI Features

- Gradient header with branding
- Suggested prompts on empty state
- Smooth message animations
- Rich tool result cards
- Image upload with preview
- Loading states and error handling
- Auto-scroll to latest message

## Demo script

1. **Start fresh**: Show the welcome screen with suggestions
2. **Try a suggestion**: Click "What's the weather in San Francisco?"
3. **Show tool execution**: Watch the loading spinner, then the weather card
4. **Try stocks**: "Get the stock price for GOOGL"
5. **Show RAG**: "Search for streaming in AI SDK"
6. **Demo memory**: "Remember my favorite framework is Next.js"
7. **Recall memory**: "What's my favorite framework?"
8. **Upload image**: Click image icon, select a photo, ask about it

## What we built in 30 minutes

Starting from scratch, we progressively added:

1. Basic text generation (00)
2. Agent with tool loop (01)
3. Vector database RAG (02)
4. Persistent memory (03)
5. Eval testing (04)
6. Chat UI (05)
7. Human approval (06)
8. Generative UI (07)
9. Multimodal (08)
10. This polished showcase (09)

## Speaker notes

- "This is everything together - one polished application"
- "Let's walk through what it can do..."
- "Notice how the tools render as cards, not JSON"
- "The same agent handles text, tools, and images"
- "We built this progressively - each step added one feature"
- "AI SDK v6 makes this straightforward"
- Final: "Questions?"

## Key takeaways

1. **AI SDK v6 patterns**: generateText, streamText, Output.object, ToolLoopAgent
2. **Tool definition**: Zod schemas, needsApproval, structured output
3. **UI integration**: useChat hook, message parts, streaming
4. **RAG**: embeddings + vector search
5. **Memory**: simple key-value with Redis
6. **Multimodal**: same API for text and images
