import { apiGet, apiPost } from "@/lib/api";
import { routes } from "@/lib/routes";

export type ChatLite = { 
  id: string; 
  name: string; 
  updatedAt?: string; 
  lastMessagePreview?: string;
  dify_conversation_id?: string;
  forked_from_chat?: string;
};

export async function fetchChats(): Promise<ChatLite[]> {
  const json = await apiGet<any>(routes.chats);
  // Support both formats: {items:[…]} or just […]
  const arr = Array.isArray(json) ? json : Array.isArray(json.items) ? json.items : [];
  return arr.map((x: any) => ({
    id: String(x.id),
    name: String(x.name ?? x.title ?? "Без названия"),
    updatedAt: x.updatedAt ?? x.updated_at ?? x.mtime ?? null,
    lastMessagePreview: x.lastMessagePreview ?? x.preview ?? "",
    dify_conversation_id: x.dify_conversation_id,
    forked_from_chat: x.forked_from_chat,
  }));
}

export async function createChat(name: string): Promise<ChatLite> {
  return await apiPost<ChatLite>(routes.chats, { name });
}