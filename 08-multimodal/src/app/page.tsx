"use client";

import { useState, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { ToolResultRenderer } from "@/components/tool-results";

interface PendingFile {
  type: "file";
  url: string;
  mediaType: string;
}

export default function Chat() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && pendingFiles.length === 0) return;

    // Send message with files if any
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

    // Validate it's an image
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Convert to base64 data URL
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

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      <header className="p-4 border-b bg-white">
        <h1 className="text-xl font-semibold">AI SDK Assistant (Multimodal)</h1>
        <p className="text-sm text-gray-500">
          Upload images and ask questions about them
        </p>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <p>Start a conversation...</p>
            <p className="text-sm mt-2">
              Try uploading an image and asking &quot;What&apos;s in this
              image?&quot;
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

                // Display files/images in messages
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
                          className="max-w-full rounded-lg max-h-64 object-contain"
                        />
                      </div>
                    );
                  }
                }

                // Tool invocations
                if (part.type.startsWith("tool-")) {
                  const toolName = part.type.replace("tool-", "");
                  const state = "state" in part ? part.state : null;
                  const result = "result" in part ? part.result : null;

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

                  if (
                    (state === "output-available" || state === "done") &&
                    result !== null
                  ) {
                    return (
                      <div key={i}>
                        <ToolResultRenderer result={result} />
                      </div>
                    );
                  }

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

                  return (
                    <div
                      key={i}
                      className="text-xs bg-gray-100 rounded p-2 my-1"
                    >
                      <span className="font-mono text-gray-600">{toolName}</span>
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

      {/* File preview */}
      {pendingFiles.length > 0 && (
        <div className="px-4 py-2 border-t bg-gray-50">
          <div className="flex gap-2 overflow-x-auto">
            {pendingFiles.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={file.url}
                  alt="File preview"
                  className="h-20 w-20 object-cover rounded-lg border"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={status === "streaming"}
            className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              pendingFiles.length > 0
                ? "Ask about the image..."
                : "Type a message or upload an image..."
            }
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={status === "streaming"}
          />
          <button
            type="submit"
            disabled={
              status === "streaming" ||
              (!input.trim() && pendingFiles.length === 0)
            }
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
