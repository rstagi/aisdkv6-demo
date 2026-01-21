"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { ToolResultRenderer } from "@/components/tool-results";

interface PendingFile {
  type: "file";
  url: string;
  mediaType: string;
}

export default function Chat() {
  const { messages, sendMessage, status, error } = useChat();
  const [input, setInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && pendingFiles.length === 0) return;

    sendMessage({
      text: input || "What's in this image?",
      files: pendingFiles.length > 0 ? pendingFiles : undefined,
    });

    setInput("");
    setPendingFiles([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPendingFiles([
        {
          type: "file",
          url: result,
          mediaType: file.type,
        },
      ]);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const suggestedPrompts = [
    "What's the weather in San Francisco?",
    "Get the stock price for TSLA",
    "Search for streaming in AI SDK",
    "Remember my name is Alex",
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="gradient-header text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">AI SDK v6 Research Assistant</h1>
          <p className="text-purple-100 text-sm mt-1">
            Powered by Gemini 2.5 Flash with RAG, Memory, and Vision
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="text-6xl mb-4">AI</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Welcome to the AI Research Assistant
              </h2>
              <p className="text-gray-500 mb-6">
                I can search documentation, remember things, check weather,
                stocks, and analyze images.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(prompt)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 hover:border-purple-300 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
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
                className={`message-bubble max-w-[85%] rounded-2xl p-4 ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white"
                    : "bg-white border border-gray-200 shadow-sm"
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

                  if (part.type === "file") {
                    const url = "url" in part ? part.url : null;
                    const mediaType =
                      "mediaType" in part ? part.mediaType : null;

                    if (url && mediaType?.startsWith("image/")) {
                      return (
                        <div key={i} className="my-2">
                          <img
                            src={url}
                            alt="Uploaded"
                            className="max-w-full rounded-xl max-h-64 object-contain"
                          />
                        </div>
                      );
                    }
                  }

                  if (part.type.startsWith("tool-")) {
                    const toolName = part.type.replace("tool-", "");
                    const state = "state" in part ? part.state : null;
                    const output = "output" in part ? part.output : null;

                    if (
                      state === "streaming" ||
                      state === "input-streaming" ||
                      state === "input-available"
                    ) {
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-gray-500 my-3"
                        >
                          <div className="animate-spin w-5 h-5 border-2 border-purple-200 border-t-purple-600 rounded-full" />
                          <span className="text-sm font-medium">
                            Using {toolName}...
                          </span>
                        </div>
                      );
                    }

                    if (state === "output-available" && output !== null) {
                      return (
                        <div key={i} className="my-2">
                          <ToolResultRenderer result={output} />
                        </div>
                      );
                    }

                    if (state === "output-error") {
                      return (
                        <div
                          key={i}
                          className="text-sm bg-red-50 border border-red-200 rounded-lg p-3 my-2"
                        >
                          <span className="font-medium text-red-600">
                            {toolName} encountered an error
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={i}
                        className="text-xs bg-gray-100 rounded-lg p-2 my-1"
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

          {status === "streaming" && messages.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <span
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                <strong>Error:</strong> {error.message}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* File preview */}
      {pendingFiles.length > 0 && (
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="max-w-4xl mx-auto flex gap-3">
            {pendingFiles.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={file.url}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded-xl border-2 border-purple-200"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={status === "streaming"}
              className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Upload image"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  pendingFiles.length > 0
                    ? "Ask about the image..."
                    : "Ask me anything..."
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={status === "streaming"}
              />
            </div>

            <button
              type="submit"
              disabled={
                status === "streaming" ||
                (!input.trim() && pendingFiles.length === 0)
              }
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
