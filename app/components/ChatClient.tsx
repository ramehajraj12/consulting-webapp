"use client";

import { useMemo, useState } from "react";
import { ApiError, fetchJsonWithTimeout } from "../../lib/fetchJsonWithTimeout";
import type { ChatMessage, DocumentContext, ChatResponseBody } from "../../types/chat";
import { DocumentUploader } from "./DocumentUploader";

const EMPTY_DOCUMENT: DocumentContext = {
  enabled: false,
  docName: "",
  docType: "",
  text: "",
  notes: undefined,
  size: undefined,
};

const defaultSystemMessage: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I am SPSS TALK. Ask me anything about SPSS, research design, or upload a file so I can ground my guidance.",
};

function mapErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return "The chat endpoint was not found. Ensure /api/chat exists and redeploy.";
    }
    if (error.status === 401 || error.status === 403) {
      return "Authentication failed. Add your OPENAI_API_KEY in the environment and redeploy.";
    }
    if (error.status === 500 && error.message.includes("OPENAI_API_KEY")) {
      return "Server is missing OPENAI_API_KEY. Add it in Vercel/Env and redeploy.";
    }
    if (error.status === 429) {
      return "You are sending requests too quickly. Please slow down and try again in a moment.";
    }
    if (error.category === "timeout") {
      return "The request timed out. Please try again or check your connection.";
    }
    if (error.category === "network") {
      return "Network error. Check your connection and try again.";
    }
    if (error.status && error.status >= 500) {
      return "The server hit an internal error. Please retry or review server logs.";
    }
    return error.message || "Unexpected error while contacting SPSS TALK.";
  }

  return "Something went wrong. Please try again.";
}

function formatBytes(size?: number) {
  if (!size) return "";
  const units = ["B", "KB", "MB", "GB"];
  let current = size;
  let unitIndex = 0;
  while (current >= 1024 && unitIndex < units.length - 1) {
    current /= 1024;
    unitIndex += 1;
  }
  return `${current.toFixed(1)} ${units[unitIndex]}`;
}

export function ChatClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([defaultSystemMessage]);
  const [input, setInput] = useState("");
  const [documentContext, setDocumentContext] = useState<DocumentContext>(EMPTY_DOCUMENT);
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    setErrorBanner(null);

    try {
      const { data } = await fetchJsonWithTimeout<ChatResponseBody>("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, documentContext }),
        timeoutMs: 30000,
        retries: 1,
      });

      const reply = data.reply || "I wasn't able to generate a response.";
      setMessages([...nextMessages, { role: "assistant", content: reply }]);
    } catch (error) {
      const friendly = mapErrorMessage(error);
      setErrorBanner(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  const removeDocument = () => setDocumentContext(EMPTY_DOCUMENT);

  const documentChip = useMemo(() => {
    if (!documentContext.enabled) return null;

    return (
      <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-800">
        <span className="truncate" title={documentContext.docName}>
          Current document: {documentContext.docName}
          {documentContext.size ? ` (${formatBytes(documentContext.size)})` : ""}
        </span>
        <button
          type="button"
          className="rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300"
          onClick={removeDocument}
        >
          Remove
        </button>
      </div>
    );
  }, [documentContext]);

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-4 px-4 py-8 sm:px-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">SPSS TALK</h1>
          <p className="text-sm text-slate-600">
            Document-aware SPSS methodology assistant. Upload a file to ground the conversation.
          </p>
        </div>
      </header>

      <DocumentUploader onDocumentReady={setDocumentContext} />

      {documentChip}

      {errorBanner && (
        <div className="flex items-start gap-3 rounded-md bg-red-50 p-3 text-sm text-red-800">
          <div className="mt-0.5">⚠️</div>
          <div className="flex-1">
            <p className="font-semibold">Request failed</p>
            <p>{errorBanner}</p>
          </div>
          <button
            type="button"
            className="text-red-700 underline"
            onClick={() => setErrorBanner(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      <main className="flex flex-1 flex-col gap-4 rounded-lg bg-white p-4 shadow-sm">
        <div className="flex-1 space-y-3 overflow-y-auto rounded border border-slate-100 bg-slate-50 p-3">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`fade-in rounded-md border bg-white p-3 shadow-sm ${
                message.role === "assistant"
                  ? "border-blue-100 text-slate-900"
                  : message.role === "user"
                    ? "border-slate-200 text-slate-900"
                    : "border-slate-100 text-slate-700"
              }`}
            >
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {message.role === "assistant" ? "SPSS TALK" : message.role}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="h-2 w-2 animate-ping rounded-full bg-blue-500" />
              <span>SPSS TALK is thinking...</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="flex-1 resize-none rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 shadow-inner focus:border-blue-500 focus:outline-none"
              rows={3}
              placeholder="Ask about SPSS, upload a file for grounded answers, or request syntax help..."
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
            />
            <button
              type="button"
              className="self-end rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              onClick={() => void sendMessage()}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
          {documentContext.notes && (
            <p className="text-xs text-slate-500">Document note: {documentContext.notes}</p>
          )}
        </div>
      </main>
    </div>
  );
}
