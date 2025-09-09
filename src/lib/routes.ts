const API_BASE = ""; // Same domain

const createRoute = (path: string) => `${API_BASE}/functions/v1/chat-api${path}`;

export const routes = {
  // Chat routes
  chats: createRoute(""),
  chat: (id: string) => createRoute(`/${id}`),
  chatName: (id: string) => createRoute(`/${id}/name`),
  chatHistory: (id: string) => createRoute(`/${id}/history`),
  chatSend: (id: string) => createRoute(`/${id}/send`),
  chatStop: (id: string) => createRoute(`/${id}/stop`),
  
  // File routes (TODO: implement file-api edge function)
  filesUpload: "/functions/v1/file-api/upload",
  
  // Other routes (TODO: implement when needed)
  projects: "/api/projects",
  meetings: "/api/meetings",
} as const;
