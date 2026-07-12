import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl, getSupabasePublishableKey } from "../env";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_conversation_messages",
  title: "List messages in a conversation",
  description: "List messages from a conversation the signed-in user has access to, oldest to newest.",
  inputSchema: {
    conversation_id: z.string().uuid().describe("The UUID of the conversation."),
    limit: z.number().int().min(1).max(100).default(50).describe("Max messages to return (1-100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ conversation_id, limit }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = createClient(
      getSupabaseUrl(),
      getSupabasePublishableKey(),
      {
        global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
    const { data, error } = await supabase
      .from("messages")
      .select("id, conversation_id, role, sender_name, content, message_type, created_at, parent_id")
      .eq("conversation_id", conversation_id)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(limit);
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { messages: data ?? [] },
    };
  },
});