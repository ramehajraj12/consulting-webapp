export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface DocumentContext {
  enabled: boolean;
  docName: string;
  docType: string;
  text: string;
  notes?: string;
  size?: number;
}

export interface ChatRequestBody {
  messages: ChatMessage[];
  documentContext: DocumentContext;
}

export interface ChatResponseBody {
  reply: string;
  error?: string;
}
