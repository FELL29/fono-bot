export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string
          day_index: number
          id: string
          instructions: string
          media_url: string | null
          title: string
          track_id: string
        }
        Insert: {
          created_at?: string
          day_index: number
          id?: string
          instructions: string
          media_url?: string | null
          title: string
          track_id: string
        }
        Update: {
          created_at?: string
          day_index?: number
          id?: string
          instructions?: string
          media_url?: string | null
          title?: string
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          risk_level: string
          session_id: string | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          risk_level?: string
          session_id?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          risk_level?: string
          session_id?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      children: {
        Row: {
          articulation_issue: string[] | null
          child_age: number
          child_name: string
          created_at: string
          follow_commands: string | null
          frequency_pref: string | null
          hearing_ok: string | null
          home_language: string | null
          id: string
          joint_attention: string | null
          oral_motor: string[] | null
          parent_name: string | null
          screen_time: number | null
          sensory_issue: string[] | null
          tag_joint_attention: boolean | null
          tag_motricidade: boolean | null
          tag_noise: boolean | null
          tag_oral_motor: boolean | null
          track_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          articulation_issue?: string[] | null
          child_age: number
          child_name: string
          created_at?: string
          follow_commands?: string | null
          frequency_pref?: string | null
          hearing_ok?: string | null
          home_language?: string | null
          id?: string
          joint_attention?: string | null
          oral_motor?: string[] | null
          parent_name?: string | null
          screen_time?: number | null
          sensory_issue?: string[] | null
          tag_joint_attention?: boolean | null
          tag_motricidade?: boolean | null
          tag_noise?: boolean | null
          tag_oral_motor?: boolean | null
          track_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          articulation_issue?: string[] | null
          child_age?: number
          child_name?: string
          created_at?: string
          follow_commands?: string | null
          frequency_pref?: string | null
          hearing_ok?: string | null
          home_language?: string | null
          id?: string
          joint_attention?: string | null
          oral_motor?: string[] | null
          parent_name?: string | null
          screen_time?: number | null
          sensory_issue?: string[] | null
          tag_joint_attention?: boolean | null
          tag_motricidade?: boolean | null
          tag_noise?: boolean | null
          tag_oral_motor?: boolean | null
          track_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      completions: {
        Row: {
          activity_id: string
          child_id: string
          completed_at: string
          id: string
        }
        Insert: {
          activity_id: string
          child_id: string
          completed_at?: string
          id?: string
        }
        Update: {
          activity_id?: string
          child_id?: string
          completed_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "completions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          parent_name: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          role: Database["public"]["Enums"]["user_role"]
          stripe_customer_id: string | null
          trial_end: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          id: string
          parent_name: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          role?: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          trial_end?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          parent_name?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          role?: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          trial_end?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      rate_limit_attempts: {
        Row: {
          blocked: boolean | null
          created_at: string
          id: string
          ip_address: unknown | null
          key: string
          metadata: Json | null
          type: string
          user_id: string | null
        }
        Insert: {
          blocked?: boolean | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          key: string
          metadata?: Json | null
          type: string
          user_id?: string | null
        }
        Update: {
          blocked?: boolean | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          key?: string
          metadata?: Json | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tracks: {
        Row: {
          age_range: string
          created_at: string
          id: string
          name: string
          profile: string
        }
        Insert: {
          age_range: string
          created_at?: string
          id?: string
          name: string
          profile: string
        }
        Update: {
          age_range?: string
          created_at?: string
          id?: string
          name?: string
          profile?: string
        }
        Relationships: []
      }
      user_backups: {
        Row: {
          backup_data: Json
          backup_type: string
          checksum: string
          created_at: string
          encryption_method: string
          expires_at: string | null
          file_size: number | null
          id: string
          user_id: string
        }
        Insert: {
          backup_data: Json
          backup_type?: string
          checksum: string
          created_at?: string
          encryption_method?: string
          expires_at?: string | null
          file_size?: number | null
          id?: string
          user_id: string
        }
        Update: {
          backup_data?: Json
          backup_type?: string
          checksum?: string
          created_at?: string
          encryption_method?: string
          expires_at?: string | null
          file_size?: number | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_backups: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_rate_limit_attempts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      detect_suspicious_activity: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      insert_audit_log: {
        Args: {
          p_user_id: string
          p_event_type: string
          p_details?: Json
          p_ip_address?: unknown
          p_user_agent?: string
          p_session_id?: string
          p_success?: boolean
          p_risk_level?: string
        }
        Returns: string
      }
      should_cleanup_logs: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      child_profile:
        | "Criança típica"
        | "Atraso ou disfunção de fala"
        | "TEA"
        | "Síndrome de Down"
      comprehension_level:
        | "Entende quase tudo"
        | "Entende ordens simples"
        | "Entende muito pouco"
        | "Responde só a pistas visuais"
      speech_level:
        | "Não verbal"
        | "Emite sons / sílabas"
        | "Fala 10‑50 palavras"
        | "Frases de 2‑3 palavras"
        | "Frases completas"
      subscription_plan: "TRIAL" | "ESSENCIAL" | "AVANCADO" | "PREMIUM"
      user_role: "parent" | "therapist" | "admin"
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
      child_profile: [
        "Criança típica",
        "Atraso ou disfunção de fala",
        "TEA",
        "Síndrome de Down",
      ],
      comprehension_level: [
        "Entende quase tudo",
        "Entende ordens simples",
        "Entende muito pouco",
        "Responde só a pistas visuais",
      ],
      speech_level: [
        "Não verbal",
        "Emite sons / sílabas",
        "Fala 10‑50 palavras",
        "Frases de 2‑3 palavras",
        "Frases completas",
      ],
      subscription_plan: ["TRIAL", "ESSENCIAL", "AVANCADO", "PREMIUM"],
      user_role: ["parent", "therapist", "admin"],
    },
  },
} as const
