import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

import type { ChatMessage, ChatRequestBody, ChatResponseBody, DocumentContext } from "../../../types/chat";

export const runtime = "nodejs";
export const maxRequestBodySize = "5mb";

const MAX_DOCUMENT_TEXT = 50000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

const rateLimitState = new Map<string, { count: number; windowStart: number }>();

let openaiClient: OpenAI | null = null;

class HttpError extends Error {
  status: number;
  category?: string;

  constructor(status: number, message: string, category?: string) {
    super(message);
    this.status = status;
    this.category = category;
  }
}

function log(message: string, meta: Record<string, string | number | boolean | undefined>) {
  const { requestId, ...rest } = meta;
  console.log(`[api/chat][${requestId}] ${message} |`, rest);
}

function getIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim();
  return (request as unknown as { ip?: string }).ip || "unknown";
}

function enforceRateLimit(ip: string) {
  const now = Date.now();
  const entry = rateLimitState.get(ip);
  if (!entry) {
    rateLimitState.set(ip, { count: 1, windowStart: now });
    return;
  }

  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitState.set(ip, { count: 1, windowStart: now });
    return;
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) {
    throw new HttpError(429, "Rate limit exceeded. Please wait a moment and try again.", "rate_limit");
  }

  rateLimitState.set(ip, entry);
}

function validateEnv(requestId: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    log("Missing OPENAI_API_KEY", { requestId, category: "config" });
    throw new HttpError(500, "Missing OPENAI_API_KEY", "config");
  }

  const model = (process.env.OPENAI_MODEL || "gpt-4.1-mini").trim();
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }

  return { apiKey, model };
}

function sanitizeDocumentContext(raw?: DocumentContext): DocumentContext {
  if (!raw) {
    return {
      enabled: false,
      docName: "",
      docType: "",
      text: "",
      notes: undefined,
    };
  }

  return {
    enabled: Boolean(raw.enabled),
    docName: raw.docName || "",
    docType: raw.docType || "",
    text: (raw.text || "").slice(0, MAX_DOCUMENT_TEXT),
    notes: raw.notes,
  };
}

function validateMessages(messages: ChatMessage[]) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new HttpError(400, "Request must include at least one message.");
  }

  const sanitized = messages.map((msg) => {
    if (!msg?.role || !msg?.content) {
      throw new HttpError(400, "Each message requires a role and content.");
    }
    return { role: msg.role, content: String(msg.content).slice(0, 8000) } as ChatMessage;
  });

  return sanitized;
}

async function getAssistantReply(
  messages: ChatMessage[],
  documentContext: DocumentContext,
  model: string,
  requestId: string,
) {
  if (!openaiClient) {
    throw new HttpError(500, "OpenAI client not initialized", "config");
  }

  const startedAt = Date.now();
  const systemPrompt = `You are "SPSS TALK", an assistant specialized in SPSS analysis, research methodology, hypothesis formulation, variable operationalization, statistics, interpretation, and reporting.
- Provide structured answers with step-by-step guidance, SPSS menu paths, syntax suggestions, output interpretation, and common pitfalls.
- If documentContext.enabled is true, prioritize the document content. Never invent results and state assumptions.
- Ask up to 2 targeted follow-up questions only if necessary to clarify the document or task.`;

  const docPrompt = documentContext.enabled
    ? `Document provided: ${documentContext.docName || "Unnamed"} (${documentContext.docType || "unknown"}).
Use this content (trimmed to ${MAX_DOCUMENT_TEXT} characters) as the primary reference:
${documentContext.text || "[No readable text provided]"}
${documentContext.notes ? `Notes: ${documentContext.notes}` : ""}`
    : "No document was provided; act as a general SPSS & methodology assistant.";

  const openAiMessages = [
    { role: "system", content: systemPrompt },
    { role: "system", content: docPrompt },
    ...messages,
  ] as ChatMessage[];

  let completion;
  try {
    completion = await openaiClient.chat.completions.create({
      model,
      messages: openAiMessages,
      temperature: 0.2,
    });
  } catch (error) {
    throw new HttpError(502, "Upstream model request failed. Check OPENAI_API_KEY and network access.", "model_request");
  }

  const reply = completion.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new HttpError(502, "No response generated from model", "model_response");
  }

  log("Assistant reply generated", { requestId, category: "success", durationMs: Date.now() - startedAt });
  return reply;
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  const ip = getIp(request);

  try {
    enforceRateLimit(ip);
    const { model } = validateEnv(requestId);

    const body = (await request.json()) as ChatRequestBody;
    const messages = validateMessages(body?.messages || []);
    const documentContext = sanitizeDocumentContext(body?.documentContext);

    const reply = await getAssistantReply(messages, documentContext, model, requestId);

    const responseBody: ChatResponseBody = { reply };
    log("Request completed", { requestId, category: "ok", durationMs: Date.now() - startedAt });
    return NextResponse.json(responseBody);
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    if (error instanceof HttpError) {
      log("Handled error", {
        requestId,
        category: error.category || "handled_error",
        status: error.status,
        durationMs,
      });
      const statusCode = error.status;
      const message = error.message || "Unexpected error";
      const errorPayload = error.message === "Missing OPENAI_API_KEY" ? "Missing OPENAI_API_KEY" : message;
      return NextResponse.json({ error: errorPayload }, { status: statusCode });
    }

    log("Unhandled error", { requestId, category: "unhandled", durationMs, error: (error as Error)?.message });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
