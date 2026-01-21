import "dotenv/config";
import { evalite } from "evalite";
import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { close } from "./db.js";
import { answerWithKnowledge } from "./agent.js";

const model = google("gemini-2.5-flash");

const gradeScale = { A: 1.0, B: 0.75, C: 0.5, D: 0.25, E: 0.0 } as const;

const judgeSchema = z.object({
  grade: z.enum(["A", "B", "C", "D", "E"]),
  reasoning: z.string(),
});

function createLLMJudge(
  name: string,
  buildPrompt: (input: string, output: string, expected?: string) => string
) {
  return {
    name,
    scorer: async ({
      input,
      output,
      expected,
    }: {
      input: string;
      output: string;
      expected?: string;
    }) => {
      const { output: judgment } = await generateText({
        model,
        prompt: buildPrompt(input, output, expected),
        output: Output.object({ schema: judgeSchema }),
      });
      return {
        score: gradeScale[judgment.grade],
        metadata: { grade: judgment.grade, reasoning: judgment.reasoning },
      };
    },
  };
}

// Register cleanup
process.on("exit", () => close());

evalite("Knowledge Retrieval", {
  data: () => [
    {
      input: "How do I stream text in AI SDK?",
      expected: "streamText",
    },
    {
      input: "How do I generate structured output in v6?",
      expected: "Output.object",
    },
    {
      input: "What is the agent class in AI SDK v6?",
      expected: "ToolLoopAgent",
    },
    {
      input: "How do I define a tool?",
      expected: "inputSchema",
    },
    {
      input: "How do I get embeddings?",
      expected: "embed",
    },
  ],

  task: async (input) => {
    return answerWithKnowledge(input);
  },

  scorers: [
    {
      name: "Contains Expected",
      scorer: ({ output, expected }) => {
        if (!expected) return 0;
        const contains = output.toLowerCase().includes(expected.toLowerCase());
        return contains ? 1 : 0;
      },
    },
    {
      name: "Has Code Example",
      scorer: ({ output }) => {
        const hasCode = output.includes("```") || output.includes("`");
        return hasCode ? 1 : 0;
      },
    },
    {
      name: "Reasonable Length",
      scorer: ({ output }) => {
        const len = (output as string).length;
        // Good answer: 100-500 chars
        if (len >= 100 && len <= 500) return 1;
        if (len >= 50 && len <= 800) return 0.5;
        return 0;
      },
    },
    createLLMJudge(
      "Answer Relevance",
      (input, output) => `You are evaluating an AI assistant's answer about the Vercel AI SDK.

Question: ${input}

Answer: ${output}

Grade the answer's relevance (A-E):
- A: Directly answers the question with accurate, specific information
- B: Mostly answers the question with minor gaps
- C: Partially relevant but missing key information
- D: Tangentially related, doesn't really answer the question
- E: Completely irrelevant or wrong

Provide your grade and brief reasoning.`
    ),
    createLLMJudge(
      "Helpfulness",
      (input, output) => `You are evaluating how helpful an AI assistant's answer is for a developer learning the Vercel AI SDK.

Question: ${input}

Answer: ${output}

Grade the helpfulness (A-E):
- A: Extremely helpful - clear, actionable, with good examples
- B: Helpful - provides useful guidance
- C: Somewhat helpful - has useful info but could be clearer
- D: Minimally helpful - vague or hard to apply
- E: Not helpful - confusing or unusable

Provide your grade and brief reasoning.`
    ),
  ],
});
