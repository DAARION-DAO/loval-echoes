import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl, getSupabasePublishableKey } from "../env";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "send_message",
  title: "Send message",
  description: "Send a message from the signed-in user into a conversation they participate in.",
  inputSchema: {
    conversation_id: z.string().uuid().describe("The UUID of the conversation to post into."),
    content: z.string().min(1).max(5000).describe("Message text (1-5000 chars)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ conversation_id, content }, ctx: ToolContext) => {
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
      .insert({
        conversation_id,
        content,
        role: "user",
        message_type: "text",
      })
      .select("id, conversation_id, created_at")
      .single();
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Message sent (id: ${data.id})` }],
      structuredContent: { message: data },
    };
  },
});