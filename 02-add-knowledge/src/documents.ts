// AI SDK v6 documentation snippets for RAG demo
export const documents = [
  {
    title: "generateText - Core Function",
    content: `generateText is the primary function for generating text with AI SDK v6. It supports prompts, system messages, tools, and structured output via the output parameter. Use it for one-shot generation when you don't need streaming.

Example:
const { text } = await generateText({
  model: google('gemini-2.5-flash'),
  prompt: 'Explain quantum computing',
});`,
  },
  {
    title: "streamText - Streaming Generation",
    content: `streamText returns a stream of text chunks as they're generated. Perfect for chat UIs where you want to show responses as they arrive. Access the stream via result.textStream.

Example:
const result = streamText({
  model,
  prompt: 'Write a story',
});
for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}`,
  },
  {
    title: "Output.object - Structured Output",
    content: `In AI SDK v6, generateObject is unified into generateText with Output.object. This allows combining tool calls with structured output generation. Define your schema with Zod and access the result via the output property.

Example:
const { output } = await generateText({
  model,
  prompt: 'Generate a recipe',
  output: Output.object({
    schema: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
    }),
  }),
});`,
  },
  {
    title: "Output.array - Array Generation",
    content: `Output.array generates arrays of structured objects. Useful for generating lists, collections, or multiple items at once. Each item in the array conforms to the provided schema.

Example:
const { output } = await generateText({
  model,
  prompt: 'List 5 programming languages',
  output: Output.array({
    schema: z.object({
      name: z.string(),
      paradigm: z.string(),
    }),
  }),
});`,
  },
  {
    title: "ToolLoopAgent - Agent Class",
    content: `ToolLoopAgent is the v6 agent abstraction. It encapsulates model, instructions, and tools in a reusable class. By default it runs up to 20 steps, controlled by stopWhen. Use generate() for full response or stream() for streaming.

Example:
const agent = new ToolLoopAgent({
  model,
  instructions: 'You are a helpful assistant',
  tools: { search, calculate },
});
const { text } = await agent.generate({ prompt: 'Help me plan a trip' });`,
  },
  {
    title: "tool() - Defining Tools",
    content: `The tool() function creates a tool with description, inputSchema (Zod), and execute function. The description helps the LLM decide when to use it. inputSchema validates inputs. execute performs the action.

Example:
const calculator = tool({
  description: 'Perform math calculations',
  inputSchema: z.object({
    expression: z.string(),
  }),
  execute: async ({ expression }) => eval(expression),
});`,
  },
  {
    title: "needsApproval - Human in the Loop",
    content: `Add needsApproval to a tool to require user confirmation before execution. Set to true for always requiring approval, or an async function for conditional approval based on the input.

Example:
const deleteFile = tool({
  description: 'Delete a file',
  inputSchema: z.object({ path: z.string() }),
  needsApproval: true, // always ask
  execute: async ({ path }) => fs.unlinkSync(path),
});

// Or conditional:
needsApproval: async ({ path }) => path.includes('important')`,
  },
  {
    title: "useChat - React Hook",
    content: `useChat from @ai-sdk/react manages chat state in React apps. It handles messages, input, loading state, and streaming. Connect to your API route that returns an agent stream.

Example:
const { messages, input, handleInputChange, handleSubmit } = useChat({
  api: '/api/chat',
});`,
  },
  {
    title: "createAgentUIStreamResponse - API Route",
    content: `createAgentUIStreamResponse connects your ToolLoopAgent to the frontend. Call it in your Next.js API route, passing the agent and messages. It returns a streaming response compatible with useChat.

Example:
export async function POST(req: Request) {
  const { messages } = await req.json();
  return createAgentUIStreamResponse({
    agent: myAgent,
    messages,
  });
}`,
  },
  {
    title: "embed - Generate Embeddings",
    content: `The embed function generates a single embedding vector for text. Use it for similarity search and RAG. Combine with embedMany for batch processing.

Example:
import { embed } from 'ai';
const { embedding } = await embed({
  model: google.textEmbeddingModel('text-embedding-004'),
  value: 'Hello world',
});`,
  },
  {
    title: "embedMany - Batch Embeddings",
    content: `embedMany generates embeddings for multiple texts in a single call. More efficient than calling embed repeatedly. Returns an array of embedding vectors.

Example:
const { embeddings } = await embedMany({
  model: google.textEmbeddingModel('text-embedding-004'),
  values: ['First doc', 'Second doc', 'Third doc'],
});`,
  },
  {
    title: "Provider Abstraction",
    content: `AI SDK v6 supports multiple providers through a unified interface. Switch between OpenAI, Anthropic, Google, and others by changing the model parameter. Provider-specific features are available via provider namespaces.

Example:
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';

// Same code, different providers:
const model = google('gemini-2.5-flash');
const model = openai('gpt-4o');
const model = anthropic('claude-sonnet-4-5');`,
  },
  {
    title: "stopWhen - Control Agent Loops",
    content: `stopWhen controls when a ToolLoopAgent stops executing. Use stepCountIs(n) to limit steps. The default is 20 steps. Can also use custom functions for more complex stop conditions.

Example:
import { ToolLoopAgent, stepCountIs } from 'ai';

const agent = new ToolLoopAgent({
  model,
  tools: { ... },
  stopWhen: stepCountIs(10), // Max 10 tool calls
});`,
  },
  {
    title: "prepareStep - Customize Agent Steps",
    content: `prepareStep runs before each agent step. Use it for logging, injecting context, or modifying behavior. Receives the current state and can return modified options.

Example:
const agent = new ToolLoopAgent({
  model,
  prepareStep: async ({ step, messages }) => {
    console.log('Step', step, 'starting');
    return {}; // Return modified options or empty
  },
});`,
  },
  {
    title: "Error Handling and Retries",
    content: `AI SDK provides typed errors for different failure modes. Use try-catch to handle API errors, rate limits, and validation failures. Configure retries at the provider level.

Example:
try {
  const { text } = await generateText({ model, prompt });
} catch (error) {
  if (error.name === 'APICallError') {
    console.log('API call failed:', error.message);
  }
}`,
  },
];
