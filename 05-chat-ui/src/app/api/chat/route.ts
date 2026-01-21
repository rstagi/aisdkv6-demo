import { createAgentUIStreamResponse } from "ai";
import { researchAgent } from "@/lib/agent";

export async function POST(req: Request) {
  const { messages } = await req.json();

  return createAgentUIStreamResponse({
    agent: researchAgent,
    uiMessages: messages,
  });
}
