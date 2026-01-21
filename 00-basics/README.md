# 00 - Basics

## What this demonstrates

- `generateText` - one-shot text generation
- `streamText` - streaming token by token
- `Output.object` - structured output (v6 pattern, replaces `generateObject`)

## Key v6 change

`generateObject` is unified into `generateText` with `output` parameter:

```ts
// Old (v5)
const { object } = await generateObject({ model, schema, prompt });

// New (v6)
const { output } = await generateText({
  model,
  prompt,
  output: Output.object({ schema }),
});
```

## Run

```bash
ln -sf ../.env .env  # symlink root .env
pnpm install
pnpm dev
```

## Expected output

```
=== Basic Text Generation ===
[One sentence about AI SDK]

=== Streaming Text ===
[Bullet points streamed token by token]

=== Structured Output (v6) ===
{
  "name": "...",
  "age": ...,
  "role": "...",
  "skills": [...]
}
```

## Speaker notes

- Start here to show the foundation
- Emphasize: same `generateText` function, different `output` options
- Stream shows real-time token generation - great for UX
- Structured output is type-safe thanks to Zod
- Transition: "Now let's make it do things with tools..."
