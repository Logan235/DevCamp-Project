export type ChatRole = "user" | "model";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}
