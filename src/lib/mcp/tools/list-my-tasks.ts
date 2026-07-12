import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_my_tasks",
  title: "List my tasks",
  description: "List kanban tasks assigned to the signed-in user.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).default(50).describe("Max tasks to return (1-100)."),
    column_type: z
      .string()
      .nullable()
      .default(null)
      .describe("Optional kanban column filter (e.g. 'todo', 'in_progress', 'done'). Null returns all."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, column_type }, ctx: ToolContext) => {
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
      .from("kanban_cards")
      .select("id, project_id, title, description, column_type, due_date, created_at, updated_at")
      .eq("assignee_id", ctx.getUserId())
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (column_type) query = query.eq("column_type", column_type);
    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { tasks: data ?? [] },
    };
  },
});