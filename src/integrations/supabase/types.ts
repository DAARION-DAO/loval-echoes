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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      access_requests: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          requested_tier: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          use_case: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          requested_tier?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          use_case?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          requested_tier?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          use_case?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      agent_action_logs: {
        Row: {
          action_payload: Json | null
          action_type: string
          agent_id: string | null
          approved_by: string | null
          community_id: string | null
          created_at: string | null
          executed_at: string | null
          id: string
          requested_by: string | null
          status: string | null
        }
        Insert: {
          action_payload?: Json | null
          action_type: string
          agent_id?: string | null
          approved_by?: string | null
          community_id?: string | null
          created_at?: string | null
          executed_at?: string | null
          id?: string
          requested_by?: string | null
          status?: string | null
        }
        Update: {
          action_payload?: Json | null
          action_type?: string
          agent_id?: string | null
          approved_by?: string | null
          community_id?: string | null
          created_at?: string | null
          executed_at?: string | null
          id?: string
          requested_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_action_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_action_logs_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
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
      agent_permissions: {
        Row: {
          agent_id: string | null
          can_approve_members: boolean | null
          can_create_summaries: boolean | null
          can_create_tasks: boolean | null
          can_delete_community: boolean | null
          can_invite_guests: boolean | null
          can_make_admins: boolean | null
          can_remove_members: boolean | null
          can_send_welcome_messages: boolean | null
          can_suggest_roles: boolean | null
          community_id: string | null
          created_at: string | null
          id: string
          requires_human_approval_for_sensitive_actions: boolean | null
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          can_approve_members?: boolean | null
          can_create_summaries?: boolean | null
          can_create_tasks?: boolean | null
          can_delete_community?: boolean | null
          can_invite_guests?: boolean | null
          can_make_admins?: boolean | null
          can_remove_members?: boolean | null
          can_send_welcome_messages?: boolean | null
          can_suggest_roles?: boolean | null
          community_id?: string | null
          created_at?: string | null
          id?: string
          requires_human_approval_for_sensitive_actions?: boolean | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          can_approve_members?: boolean | null
          can_create_summaries?: boolean | null
          can_create_tasks?: boolean | null
          can_delete_community?: boolean | null
          can_invite_guests?: boolean | null
          can_make_admins?: boolean | null
          can_remove_members?: boolean | null
          can_send_welcome_messages?: boolean | null
          can_suggest_roles?: boolean | null
          community_id?: string | null
          created_at?: string | null
          id?: string
          requires_human_approval_for_sensitive_actions?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_permissions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_permissions_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_prompt_versions: {
        Row: {
          agent_id: string | null
          community_id: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          prompt_type: string
          updated_at: string
          version_name: string
        }
        Insert: {
          agent_id?: string | null
          community_id: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          prompt_type: string
          updated_at?: string
          version_name: string
        }
        Update: {
          agent_id?: string | null
          community_id?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          prompt_type?: string
          updated_at?: string
          version_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_prompt_versions_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          agent_type: string
          avatar_url: string | null
          community_id: string | null
          connection_type: Database["public"]["Enums"]["agent_connection_type"]
          created_at: string
          description: string | null
          endpoint_url: string | null
          id: string
          is_preset: boolean | null
          memory_scope: string | null
          name: string
          owner_user_id: string | null
          personality: Json | null
          public_key: string | null
          scope: string | null
          status: Database["public"]["Enums"]["agent_status"]
          system_prompt: string | null
          updated_at: string
        }
        Insert: {
          agent_type?: string
          avatar_url?: string | null
          community_id?: string | null
          connection_type?: Database["public"]["Enums"]["agent_connection_type"]
          created_at?: string
          description?: string | null
          endpoint_url?: string | null
          id?: string
          is_preset?: boolean | null
          memory_scope?: string | null
          name: string
          owner_user_id?: string | null
          personality?: Json | null
          public_key?: string | null
          scope?: string | null
          status?: Database["public"]["Enums"]["agent_status"]
          system_prompt?: string | null
          updated_at?: string
        }
        Update: {
          agent_type?: string
          avatar_url?: string | null
          community_id?: string | null
          connection_type?: Database["public"]["Enums"]["agent_connection_type"]
          created_at?: string
          description?: string | null
          endpoint_url?: string | null
          id?: string
          is_preset?: boolean | null
          memory_scope?: string | null
          name?: string
          owner_user_id?: string | null
          personality?: Json | null
          public_key?: string | null
          scope?: string | null
          status?: Database["public"]["Enums"]["agent_status"]
          system_prompt?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      billing_plan_configs: {
        Row: {
          accepted_assets: string[]
          created_at: string
          daar_purchase_url: string | null
          daar_usdt_rate: number
          effective_from: string
          id: string
          is_active: boolean
          payment_network: string
          plan_key: string
          price_daar: number
          price_usd: number
          treasury_address: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          accepted_assets?: string[]
          created_at?: string
          daar_purchase_url?: string | null
          daar_usdt_rate: number
          effective_from?: string
          id?: string
          is_active?: boolean
          payment_network?: string
          plan_key: string
          price_daar: number
          price_usd: number
          treasury_address: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          accepted_assets?: string[]
          created_at?: string
          daar_purchase_url?: string | null
          daar_usdt_rate?: number
          effective_from?: string
          id?: string
          is_active?: boolean
          payment_network?: string
          plan_key?: string
          price_daar?: number
          price_usd?: number
          treasury_address?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
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
      communities: {
        Row: {
          avatar_url: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string | null
          slug: string | null
          type: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id?: string | null
          slug?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          slug?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_members: {
        Row: {
          community_id: string
          created_at: string
          id: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          id?: string
          role: string
          status: string
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          id?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_setup_sessions: {
        Row: {
          answers: Json | null
          community_id: string | null
          created_agent_id: string | null
          created_at: string | null
          current_step: string | null
          generated_summary: Json | null
          id: string
          leader_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          answers?: Json | null
          community_id?: string | null
          created_agent_id?: string | null
          created_at?: string | null
          current_step?: string | null
          generated_summary?: Json | null
          id?: string
          leader_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          answers?: Json | null
          community_id?: string | null
          created_agent_id?: string | null
          created_at?: string | null
          current_step?: string | null
          generated_summary?: Json | null
          id?: string
          leader_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_setup_sessions_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_setup_sessions_created_agent_id_fkey"
            columns: ["created_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
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
          created_at: string
          created_by: string | null
          description: string | null
          dify_conversation_id: string | null
          forked_from_chat: string | null
          forked_from_message_id: string | null
          id: string
          is_archived: boolean | null
          is_group_chat: boolean | null
          is_pinned: boolean | null
          name: string
          pinned_at: string | null
          status: string | null
          type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          auto_generated_name?: boolean | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dify_conversation_id?: string | null
          forked_from_chat?: string | null
          forked_from_message_id?: string | null
          id?: string
          is_archived?: boolean | null
          is_group_chat?: boolean | null
          is_pinned?: boolean | null
          name: string
          pinned_at?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          auto_generated_name?: boolean | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dify_conversation_id?: string | null
          forked_from_chat?: string | null
          forked_from_message_id?: string | null
          id?: string
          is_archived?: boolean | null
          is_group_chat?: boolean | null
          is_pinned?: boolean | null
          name?: string
          pinned_at?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_forked_from_chat_fkey"
            columns: ["forked_from_chat"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_payment_intents: {
        Row: {
          amount_crypto: number | null
          amount_usd: number | null
          block_number: number | null
          chain: string | null
          chain_id: number | null
          confirmations: number | null
          confirmed_at: string | null
          created_at: string | null
          crypto_asset: string
          expires_at: string | null
          id: string
          onchain_amount: number | null
          status: string
          subscription_id: string | null
          token_contract: string | null
          tx_from: string | null
          tx_hash: string | null
          tx_to: string | null
          user_id: string
          verification_checked_at: string | null
          verification_error: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
          wallet_from: string | null
          wallet_to: string | null
        }
        Insert: {
          amount_crypto?: number | null
          amount_usd?: number | null
          block_number?: number | null
          chain?: string | null
          chain_id?: number | null
          confirmations?: number | null
          confirmed_at?: string | null
          created_at?: string | null
          crypto_asset: string
          expires_at?: string | null
          id?: string
          onchain_amount?: number | null
          status?: string
          subscription_id?: string | null
          token_contract?: string | null
          tx_from?: string | null
          tx_hash?: string | null
          tx_to?: string | null
          user_id: string
          verification_checked_at?: string | null
          verification_error?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          wallet_from?: string | null
          wallet_to?: string | null
        }
        Update: {
          amount_crypto?: number | null
          amount_usd?: number | null
          block_number?: number | null
          chain?: string | null
          chain_id?: number | null
          confirmations?: number | null
          confirmed_at?: string | null
          created_at?: string | null
          crypto_asset?: string
          expires_at?: string | null
          id?: string
          onchain_amount?: number | null
          status?: string
          subscription_id?: string | null
          token_contract?: string | null
          tx_from?: string | null
          tx_hash?: string | null
          tx_to?: string | null
          user_id?: string
          verification_checked_at?: string | null
          verification_error?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          wallet_from?: string | null
          wallet_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crypto_payment_intents_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "microdao_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      document_chunks: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          file_id: string | null
          folder_id: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          file_id?: string | null
          folder_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          file_id?: string | null
          folder_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_chunks_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
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
          indexing_status: string | null
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
          indexing_status?: string | null
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
          indexing_status?: string | null
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
      invitation_codes: {
        Row: {
          access_tier: string | null
          code: string
          community_id: string | null
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          role_to_grant: string | null
          scope: string
          updated_at: string | null
          used_count: number | null
        }
        Insert: {
          access_tier?: string | null
          code: string
          community_id?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          role_to_grant?: string | null
          scope?: string
          updated_at?: string | null
          used_count?: number | null
        }
        Update: {
          access_tier?: string | null
          code?: string
          community_id?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          role_to_grant?: string | null
          scope?: string
          updated_at?: string | null
          used_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invitation_codes_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
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
          dify_message_id: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          message_type: string | null
          parent_id: string | null
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
          dify_message_id?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          message_type?: string | null
          parent_id?: string | null
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
          dify_message_id?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          message_type?: string | null
          parent_id?: string | null
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
          {
            foreignKeyName: "messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      microdao_subscriptions: {
        Row: {
          accepted_assets: string[] | null
          community_id: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          owner_user_id: string
          plan: string
          price_daar: number | null
          price_usd: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          accepted_assets?: string[] | null
          community_id?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          owner_user_id: string
          plan?: string
          price_daar?: number | null
          price_usd?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          accepted_assets?: string[] | null
          community_id?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          owner_user_id?: string
          plan?: string
          price_daar?: number | null
          price_usd?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "microdao_subscriptions_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
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
      platform_admin_invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invite_token: string
          invited_by: string | null
          invited_role: string
          revoked_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invite_token: string
          invited_by?: string | null
          invited_role?: string
          revoked_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invite_token?: string
          invited_by?: string | null
          invited_role?: string
          revoked_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          access_tier: string | null
          approval_status: string | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          news_push_enabled: boolean | null
          role: string | null
          telegram_user_id: string | null
          telegram_username: string | null
          updated_at: string
          user_id: string
          wallet_address: string | null
          wallet_verified_at: string | null
        }
        Insert: {
          access_tier?: string | null
          approval_status?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          news_push_enabled?: boolean | null
          role?: string | null
          telegram_user_id?: string | null
          telegram_username?: string | null
          updated_at?: string
          user_id: string
          wallet_address?: string | null
          wallet_verified_at?: string | null
        }
        Update: {
          access_tier?: string | null
          approval_status?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          news_push_enabled?: boolean | null
          role?: string | null
          telegram_user_id?: string | null
          telegram_username?: string | null
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
          wallet_verified_at?: string | null
        }
        Relationships: []
      }
      push_notification_settings: {
        Row: {
          chat_notifications: string[] | null
          created_at: string | null
          id: string
          news_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chat_notifications?: string[] | null
          created_at?: string | null
          id?: string
          news_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chat_notifications?: string[] | null
          created_at?: string | null
          id?: string
          news_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          device_id: string
          endpoint: string
          expires_at: string | null
          id: string
          p256dh: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          device_id: string
          endpoint: string
          expires_at?: string | null
          id?: string
          p256dh: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          device_id?: string
          endpoint?: string
          expires_at?: string | null
          id?: string
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
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
        Relationships: []
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
      user_integrations: {
        Row: {
          config: Json | null
          connected: boolean | null
          created_at: string | null
          enabled: boolean | null
          id: string
          last_sync: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          config?: Json | null
          connected?: boolean | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          last_sync?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          config?: Json | null
          connected?: boolean | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          last_sync?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          revoked_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          revoked_at?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_platform_admin_invite: {
        Args: { p_invite_token: string }
        Returns: undefined
      }
      activate_prompt_version: {
        Args: { p_version_id: string }
        Returns: undefined
      }
      admin_approve_crypto_payment_intent: {
        Args: { intent_id: string }
        Returns: undefined
      }
      admin_create_platform_admin_invite: {
        Args: { invited_email: string; invited_role: string }
        Returns: {
          invite_id: string
          invite_token: string
        }[]
      }
      admin_get_subscription_stats: { Args: never; Returns: Json }
      admin_reject_crypto_payment_intent: {
        Args: { intent_id: string; reason: string }
        Returns: undefined
      }
      admin_revoke_platform_admin_invite: {
        Args: { invite_id: string }
        Returns: undefined
      }
      admin_set_approval_status: {
        Args: { p_status: string; p_user_id: string }
        Returns: undefined
      }
      admin_update_billing_plan_config: {
        Args: {
          p_accepted_assets: string[]
          p_daar_purchase_url: string
          p_daar_usdt_rate: number
          p_payment_network: string
          p_plan_key: string
          p_price_daar: number
          p_price_usd: number
          p_treasury_address: string
        }
        Returns: string
      }
      calculate_required_approvals: { Args: never; Returns: number }
      check_is_platform_admin: { Args: never; Returns: undefined }
      check_rate_limit: {
        Args: {
          p_action: string
          p_identifier: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_expired_refresh_tokens: { Args: never; Returns: undefined }
      create_microdao_with_spirit_agent: {
        Args: {
          p_agent_name: string
          p_autonomy_level: string
          p_description: string
          p_goal_30_days: string
          p_mission: string
          p_name: string
          p_setup_answers: Json
          p_setup_session_id?: string
          p_type: string
          p_values_rules: string
        }
        Returns: Json
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
      fix_approval_inconsistencies: { Args: never; Returns: undefined }
      get_active_billing_plan_config: {
        Args: { p_plan_key?: string }
        Returns: {
          accepted_assets: string[]
          daar_purchase_url: string
          daar_usdt_rate: number
          effective_from: string
          id: string
          is_active: boolean
          payment_network: string
          plan_key: string
          price_daar: number
          price_usd: number
          treasury_address: string
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
        Args: { p_requesting_user_id: string }
        Returns: {
          user_id: string
        }[]
      }
      get_platform_admin_access_requests: {
        Args: never
        Returns: {
          created_at: string
          display_name: string
          email: string
          id: string
          requested_tier: string
          reviewed_at: string
          reviewed_by: string
          status: string
          use_case: string
          user_id: string
        }[]
      }
      get_platform_admin_agent_ops: { Args: never; Returns: Json }
      get_platform_admin_microdaos: {
        Args: never
        Returns: {
          agent_status: string
          created_at: string
          has_spirit_agent: boolean
          id: string
          member_count: number
          name: string
          owner_email: string
          owner_id: string
          owner_name: string
          slug: string
          type: string
        }[]
      }
      get_platform_admin_overview: { Args: never; Returns: Json }
      get_platform_admin_users: {
        Args: never
        Returns: {
          access_tier: string
          approval_status: string
          created_at: string
          display_name: string
          email: string
          id: string
          microdao_count: number
          role: string
          user_id: string
        }[]
      }
      get_public_profiles: {
        Args: { p_user_ids: string[] }
        Returns: {
          avatar_url: string
          display_name: string
          user_id: string
        }[]
      }
      get_user_approval_status: { Args: { p_user_id: string }; Returns: string }
      get_user_conversations: {
        Args: { p_user_id: string }
        Returns: {
          conversation_id: string
        }[]
      }
      grant_admin_role: {
        Args: { p_granted_by?: string; p_user_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { p_user_id: string }; Returns: boolean }
      is_community_admin: {
        Args: { p_community_id: string; p_user_id: string }
        Returns: boolean
      }
      is_community_member: {
        Args: { p_community_id: string; p_user_id: string }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { p_conversation_id: string; p_user_id: string }
        Returns: boolean
      }
      is_moderator: { Args: { p_user_id: string }; Returns: boolean }
      is_user_approved: { Args: { p_user_id: string }; Returns: boolean }
      join_community_by_code: { Args: { p_code: string }; Returns: Json }
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
      match_document_chunks: {
        Args: {
          filter_file_ids?: string[]
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          content: string
          file_id: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      revoke_admin_role: { Args: { p_user_id: string }; Returns: undefined }
      revoke_user_refresh_tokens: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      soft_delete_message: {
        Args: { p_message_id: string }
        Returns: undefined
      }
      validate_invitation_code: { Args: { p_code: string }; Returns: Json }
    }
    Enums: {
      agent_connection_type: "webhook" | "websocket" | "msp"
      agent_role: "assistant" | "observer" | "manager"
      agent_status: "active" | "paused" | "disconnected"
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
      file_scope: ["community", "project"],
      file_type: ["document", "image", "code", "data", "other"],
      kanban_column: ["backlog", "todo", "progress", "review", "done"],
    },
  },
} as const
