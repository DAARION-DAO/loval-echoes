export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agent_memberships: {
        Row: {
          active: boolean
          agent_id: string
          conversation_id: string | null
          id: string
          joined_at: string
          project_id: string | null
          role: Database["public"]["Enums"]["agent_role"]
          scopes: string[]
          task_id: string | null
        }
        Insert: {
          active?: boolean
          agent_id: string
          conversation_id?: string | null
          id?: string
          joined_at?: string
          project_id?: string | null
          role?: Database["public"]["Enums"]["agent_role"]
          scopes?: string[]
          task_id?: string | null
        }
        Update: {
          active?: boolean
          agent_id?: string
          conversation_id?: string | null
          id?: string
          joined_at?: string
          project_id?: string | null
          role?: Database["public"]["Enums"]["agent_role"]
          scopes?: string[]
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_memberships_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_memberships_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_memberships_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_memberships_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "kanban_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          avatar_url: string | null
          connection_type: Database["public"]["Enums"]["agent_connection_type"]
          created_at: string
          description: string | null
          endpoint_url: string | null
          id: string
          is_preset: boolean | null
          name: string
          owner_user_id: string
          public_key: string | null
          status: Database["public"]["Enums"]["agent_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          connection_type?: Database["public"]["Enums"]["agent_connection_type"]
          created_at?: string
          description?: string | null
          endpoint_url?: string | null
          id?: string
          is_preset?: boolean | null
          name: string
          owner_user_id: string
          public_key?: string | null
          status?: Database["public"]["Enums"]["agent_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          connection_type?: Database["public"]["Enums"]["agent_connection_type"]
          created_at?: string
          description?: string | null
          endpoint_url?: string | null
          id?: string
          is_preset?: boolean | null
          name?: string
          owner_user_id?: string
          public_key?: string | null
          status?: Database["public"]["Enums"]["agent_status"]
          updated_at?: string
        }
        Relationships: []
      }
      ai_agent_permissions: {
        Row: {
          can_delete: boolean | null
          can_read: boolean | null
          can_tag: boolean | null
          can_write: boolean | null
          created_at: string
          folder_id: string | null
          id: string
          project_id: string | null
          scope: Database["public"]["Enums"]["file_scope"]
          updated_at: string
        }
        Insert: {
          can_delete?: boolean | null
          can_read?: boolean | null
          can_tag?: boolean | null
          can_write?: boolean | null
          created_at?: string
          folder_id?: string | null
          id?: string
          project_id?: string | null
          scope: Database["public"]["Enums"]["file_scope"]
          updated_at?: string
        }
        Update: {
          can_delete?: boolean | null
          can_read?: boolean | null
          can_tag?: boolean | null
          can_write?: boolean | null
          created_at?: string
          folder_id?: string | null
          id?: string
          project_id?: string | null
          scope?: Database["public"]["Enums"]["file_scope"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_permissions_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agent_permissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          created_at: string | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      approval_inconsistencies: {
        Row: {
          approval_count: number | null
          approved_by: string[] | null
          created_at: string | null
          display_name: string | null
          id: string
          profile_status: string | null
          rejected_by: string[] | null
          rejection_count: number | null
          request_status: string | null
          required_approvals: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          approval_count?: number | null
          approved_by?: string[] | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          profile_status?: string | null
          rejected_by?: string[] | null
          rejection_count?: number | null
          request_status?: string | null
          required_approvals?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          approval_count?: number | null
          approved_by?: string[] | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          profile_status?: string | null
          rejected_by?: string[] | null
          rejection_count?: number | null
          request_status?: string | null
          required_approvals?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_inconsistencies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      chat_action_logs: {
        Row: {
          action: string
          chat_id: string
          created_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action: string
          chat_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          chat_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_action_logs_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          auto_generated_name: boolean | null
          avatar_url: string | null
          created_at: string
          description: string | null
          dify_conversation_id: string | null
          docs_folder_id: string | null
          id: string
          is_archived: boolean
          is_group_chat: boolean | null
          is_pinned: boolean | null
          name: string
          pinned_at: string | null
          status: string
          type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          auto_generated_name?: boolean | null
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          dify_conversation_id?: string | null
          docs_folder_id?: string | null
          id?: string
          is_archived?: boolean
          is_group_chat?: boolean | null
          is_pinned?: boolean | null
          name: string
          pinned_at?: string | null
          status?: string
          type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          auto_generated_name?: boolean | null
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          dify_conversation_id?: string | null
          docs_folder_id?: string | null
          id?: string
          is_archived?: boolean
          is_group_chat?: boolean | null
          is_pinned?: boolean | null
          name?: string
          pinned_at?: string | null
          status?: string
          type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      file_tags: {
        Row: {
          added_by: string | null
          auto_generated: boolean | null
          created_at: string
          file_id: string
          id: string
          tag: string
        }
        Insert: {
          added_by?: string | null
          auto_generated?: boolean | null
          created_at?: string
          file_id: string
          id?: string
          tag: string
        }
        Update: {
          added_by?: string | null
          auto_generated?: boolean | null
          created_at?: string
          file_id?: string
          id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_tags_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      file_versions: {
        Row: {
          change_note: string | null
          created_at: string
          file_id: string
          id: string
          size_bytes: number
          storage_path: string
          uploaded_by: string
          version_number: number
        }
        Insert: {
          change_note?: string | null
          created_at?: string
          file_id: string
          id?: string
          size_bytes: number
          storage_path: string
          uploaded_by: string
          version_number: number
        }
        Update: {
          change_note?: string | null
          created_at?: string
          file_id?: string
          id?: string
          size_bytes?: number
          storage_path?: string
          uploaded_by?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "file_versions_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          dify_file_id: string | null
          file_type: Database["public"]["Enums"]["file_type"]
          folder_id: string | null
          id: string
          is_knowledge_base: boolean | null
          mime_type: string | null
          name: string
          project_id: string | null
          scope: Database["public"]["Enums"]["file_scope"]
          size_bytes: number
          storage_path: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          dify_file_id?: string | null
          file_type?: Database["public"]["Enums"]["file_type"]
          folder_id?: string | null
          id?: string
          is_knowledge_base?: boolean | null
          mime_type?: string | null
          name: string
          project_id?: string | null
          scope?: Database["public"]["Enums"]["file_scope"]
          size_bytes: number
          storage_path: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          dify_file_id?: string | null
          file_type?: Database["public"]["Enums"]["file_type"]
          folder_id?: string | null
          id?: string
          is_knowledge_base?: boolean | null
          mime_type?: string | null
          name?: string
          project_id?: string | null
          scope?: Database["public"]["Enums"]["file_scope"]
          size_bytes?: number
          storage_path?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          parent_id: string | null
          project_id: string | null
          scope: Database["public"]["Enums"]["file_scope"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          parent_id?: string | null
          project_id?: string | null
          scope?: Database["public"]["Enums"]["file_scope"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          parent_id?: string | null
          project_id?: string | null
          scope?: Database["public"]["Enums"]["file_scope"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_cards: {
        Row: {
          assignee_id: string | null
          column_type: Database["public"]["Enums"]["kanban_column"]
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          position: number
          project_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          column_type?: Database["public"]["Enums"]["kanban_column"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number
          project_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          column_type?: Database["public"]["Enums"]["kanban_column"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number
          project_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_cards_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          message_type: string | null
          role: string
          sender_name: string | null
          transcription: string | null
          voice_duration: number | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          message_type?: string | null
          role: string
          sender_name?: string | null
          transcription?: string | null
          voice_duration?: number | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          message_type?: string | null
          role?: string
          sender_name?: string | null
          transcription?: string | null
          voice_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      news_feed: {
        Row: {
          author_id: string | null
          created_at: string | null
          id: string
          is_agent: boolean | null
          reply_to_id: string | null
          text: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          created_at?: string | null
          id?: string
          is_agent?: boolean | null
          reply_to_id?: string | null
          text: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          created_at?: string | null
          id?: string
          is_agent?: boolean | null
          reply_to_id?: string | null
          text?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_feed_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "news_feed"
            referencedColumns: ["id"]
          },
        ]
      }
      news_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          news_id: string
          read: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          news_id: string
          read?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          news_id?: string
          read?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_notifications_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news_feed"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_agent_chats: {
        Row: {
          agent_id: string
          conversation_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          agent_id: string
          conversation_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          conversation_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_agent_chats_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_agent_chats_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approval_status: string | null
          avatar_url: string | null
          created_at: string
          display_name: string
          email: string | null
          id: string
          news_push_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_status?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name: string
          email?: string | null
          id?: string
          news_push_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_status?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          id?: string
          news_push_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          attempts: number | null
          blocked_until: string | null
          created_at: string | null
          id: string
          identifier: string
          window_start: string | null
        }
        Insert: {
          action: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier: string
          window_start?: string | null
        }
        Update: {
          action?: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier?: string
          window_start?: string | null
        }
        Relationships: []
      }
      refresh_tokens: {
        Row: {
          created_at: string | null
          device_id: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          last_used_at: string | null
          revoked_at: string | null
          token_hash: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          last_used_at?: string | null
          revoked_at?: string | null
          token_hash: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          last_used_at?: string | null
          revoked_at?: string | null
          token_hash?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      task_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          task_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          task_id: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          task_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "kanban_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      task_telemetry: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          project_id: string | null
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          project_id?: string | null
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          project_id?: string | null
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_approval_requests: {
        Row: {
          approved_by: string[] | null
          created_at: string | null
          id: string
          rejected_by: string[] | null
          requested_at: string | null
          status: string
          total_existing_users: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_by?: string[] | null
          created_at?: string | null
          id?: string
          rejected_by?: string[] | null
          requested_at?: string | null
          status?: string
          total_existing_users?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_by?: string[] | null
          created_at?: string | null
          id?: string
          rejected_by?: string[] | null
          requested_at?: string | null
          status?: string
          total_existing_users?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_approval_requests_user_id"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_approval_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_approvals: {
        Row: {
          approver_id: string
          created_at: string | null
          decision: string
          id: string
          notes: string | null
          request_id: string | null
        }
        Insert: {
          approver_id: string
          created_at?: string | null
          decision: string
          id?: string
          notes?: string | null
          request_id?: string | null
        }
        Update: {
          approver_id?: string
          created_at?: string | null
          decision?: string
          id?: string
          notes?: string | null
          request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_approvals_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "user_approval_requests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_required_approvals: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      check_enhanced_rate_limit: {
        Args: {
          p_action: string
          p_block_duration_minutes?: number
          p_identifier: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_action: string
          p_identifier: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_expired_refresh_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_task_notification: {
        Args: {
          p_message: string
          p_metadata?: Json
          p_task_id: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      detect_approval_inconsistencies: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      enhanced_log_security_event: {
        Args: {
          p_event_data?: Json
          p_event_type: string
          p_ip_address?: unknown
          p_severity?: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: undefined
      }
      fix_approval_inconsistencies: {
        Args: Record<PropertyKey, never>
        Returns: {
          fixed_user_id: string
          new_status: string
          old_status: string
        }[]
      }
      get_ai_agent_permissions: {
        Args: {
          p_folder_id?: string
          p_project_id?: string
          p_scope: Database["public"]["Enums"]["file_scope"]
        }
        Returns: {
          can_delete: boolean
          can_read: boolean
          can_tag: boolean
          can_write: boolean
        }[]
      }
      get_conversation_participant_profiles: {
        Args: { requesting_user_id: string }
        Returns: {
          user_id: string
        }[]
      }
      get_user_approval_status: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_conversations: {
        Args: { user_id: string }
        Returns: {
          conversation_id: string
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { conversation_id: string; user_id: string }
        Returns: boolean
      }
      is_moderator: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_user_admin_simple: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_user_approved: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          p_event_data?: Json
          p_event_type: string
          p_ip_address?: unknown
          p_user_agent?: string
          p_user_id: string
        }
        Returns: undefined
      }
      log_task_event: {
        Args: {
          p_event_type: string
          p_metadata?: Json
          p_project_id?: string
          p_task_id?: string
          p_user_id?: string
        }
        Returns: string
      }
      revoke_user_refresh_tokens: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      validate_file_upload_security: {
        Args: {
          p_file_name: string
          p_file_size: number
          p_file_type: string
          p_user_id?: string
        }
        Returns: Json
      }
    }
    Enums: {
      agent_connection_type: "webhook" | "websocket" | "msp"
      agent_role: "assistant" | "observer" | "manager"
      agent_status: "active" | "paused" | "disconnected"
      file_scope: "community" | "project"
      file_type: "document" | "image" | "code" | "data" | "other"
      kanban_column: "backlog" | "todo" | "progress" | "review" | "done"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agent_connection_type: ["webhook", "websocket", "msp"],
      agent_role: ["assistant", "observer", "manager"],
      agent_status: ["active", "paused", "disconnected"],
      file_scope: ["community", "project"],
      file_type: ["document", "image", "code", "data", "other"],
      kanban_column: ["backlog", "todo", "progress", "review", "done"],
    },
  },
} as const
