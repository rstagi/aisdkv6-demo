# 07 - Generative UI

## What this demonstrates

- Tool results rendered as rich UI components
- Conditional rendering based on tool output type
- Progressive UI that builds as data streams in
- Custom cards for different data types (weather, stocks, search results)

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

## Key code patterns

### Structured tool output with type discriminator

```ts
// In agent.ts - tools return typed data
const getWeather = tool({
  description: "Get weather for a location",
  inputSchema: z.object({ location: z.string() }),
  execute: async ({ location }) => ({
    type: "weather" as const,  // Discriminator field
    location,
    temperature: 22,
    condition: "Sunny",
    // ... more structured data
  }),
});
```

### Component renderer switching on type

```tsx
// In tool-results.tsx
export function ToolResultRenderer({ result }) {
  switch (result.type) {
    case "weather":
      return <WeatherCard data={result} />;
    case "stock-price":
      return <StockCard data={result} />;
    case "search-results":
      return <SearchResultsCard data={result} />;
    default:
      return <pre>{JSON.stringify(result)}</pre>;
  }
}
```

### Rendering in message parts

```tsx
// In page.tsx
{message.parts?.map((part, i) => {
  if (part.type.startsWith("tool-")) {
    const state = "state" in part ? part.state : null;
    const result = "result" in part ? part.result : null;

    if (state === "output-available" && result) {
      return <ToolResultRenderer result={result} />;
    }
  }
})}
```

## Try these prompts

1. "What's the weather in Tokyo?" → Weather card with temp, humidity, forecast
2. "Get the stock price for AAPL" → Stock card with price, change, volume
3. "Search for streaming in AI SDK" → Search results with relevance scores
4. "Remember my favorite color is blue" → Memory saved card
5. "List all my memories" → Memory list card

## Expected behavior

1. User sends message
2. Agent decides which tool to call
3. Tool runs, returns structured data with `type` field
4. UI renders appropriate card component based on type
5. Rich, colorful cards appear instead of raw JSON

## Speaker notes

- "Same tools, but now with rich typed output"
- "Each tool returns an object with a `type` discriminator"
- "The UI switches rendering based on that type"
- "Weather gets a weather card, stocks get a stock card"
- "This is generative UI — the model's choices drive the UI"
- "Notice the loading spinners while tools execute"
- Transition: "Now let's add multimodal input — images..."
