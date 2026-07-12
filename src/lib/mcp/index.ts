import { auth, defineMcp } from "@lovable.dev/mcp-js";
import whoAmITool from "./tools/who-am-i";
import listMyConversationsTool from "./tools/list-my-conversations";
import listConversationMessagesTool from "./tools/list-conversation-messages";
import sendMessageTool from "./tools/send-message";
import listMyTasksTool from "./tools/list-my-tasks";

// The OAuth issuer MUST be the direct Supabase host, built from the project
// ref (which Vite inlines at build time). Keep this import-safe — no runtime
// env reads or throws at module top level.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "microdao-mcp",
  title: "MicroDAO / ЖОС",
  version: "0.1.0",
  instructions:
    "Tools for the ЖОС MicroDAO app. Use who_am_i to confirm the signed-in user, list_my_conversations to browse chats, list_conversation_messages to read a chat, send_message to post a message as the user, and list_my_tasks to see kanban tasks assigned to the user. All tools respect row-level security and act as the authenticated user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    whoAmITool,
    listMyConversationsTool,
    listConversationMessagesTool,
    sendMessageTool,
    listMyTasksTool,
  ],
});