"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { ToolResultRenderer } from "@/components/tool-results";

export default function Chat() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      <header className="p-4 border-b bg-white">
        <h1 className="text-xl font-semibold">
          AI SDK Assistant (Generative UI)
        </h1>
        <p className="text-sm text-gray-500">
          Tool results render as rich UI components
        </p>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <p>Start a conversation...</p>
            <p className="text-sm mt-2">
              Try: &quot;What&apos;s the weather in Tokyo?&quot; or
              &quot;Get me the stock price for AAPL&quot;
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border shadow-sm"
              }`}
            >
              {message.parts?.map((part, i) => {
                if (part.type === "text") {
                  return (
                    <div key={i} className="whitespace-pre-wrap">
                      {part.text}
                    </div>
                  );
                }

                // Tool invocations
                if (part.type.startsWith("tool-")) {
                  const toolName = part.type.replace("tool-", "");
                  const state = "state" in part ? part.state : null;
                  const output = "output" in part ? part.output : null;

                  // Show loading state (streaming or input phases)
                  if (
                    state === "streaming" ||
                    state === "input-streaming" ||
                    state === "input-available"
                  ) {
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-gray-500 my-2"
                      >
                        <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
                        <span className="text-sm">Running {toolName}...</span>
                      </div>
                    );
                  }

                  // Show result with rich UI
                  if (state === "output-available" && output !== null) {
                    return (
                      <div key={i}>
                        <ToolResultRenderer result={output} />
                      </div>
                    );
                  }

                  // Handle error state
                  if (state === "output-error") {
                    return (
                      <div
                        key={i}
                        className="text-xs bg-red-50 border border-red-200 rounded p-2 my-1"
                      >
                        <span className="font-mono text-red-600">
                          {toolName} failed
                        </span>
                      </div>
                    );
                  }

                  // Fallback for other states
                  return (
                    <div
                      key={i}
                      className="text-xs bg-gray-100 rounded p-2 my-1"
                    >
                      <span className="font-mono text-gray-600">
                        {toolName}
                      </span>
                      {state && (
                        <span className="ml-2 text-gray-400">({state})</span>
                      )}
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        ))}

        {status === "streaming" && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about weather, stocks, or search the knowledge base..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={status === "streaming"}
          />
          <button
            type="submit"
            disabled={status === "streaming" || !input.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
