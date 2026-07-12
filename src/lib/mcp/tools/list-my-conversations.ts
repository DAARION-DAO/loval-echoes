import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_my_conversations",
  title: "List my conversations",
  description: "List the signed-in user's chat conversations, most recently updated first.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(20).describe("Max conversations to return (1-50)."),
    include_archived: z.boolean().default(false).describe("Whether to include archived conversations."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, include_archived }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
    let query = supabase
      .from("conversations")
      .select("id, name, type, is_group_chat, is_pinned, is_archived, status, updated_at, created_at")
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (!include_archived) query = query.eq("is_archived", false);
    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { conversations: data ?? [] },
    };
  },
});