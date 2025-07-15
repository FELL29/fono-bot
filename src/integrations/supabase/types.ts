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
      children: {
        Row: {
          child_age: number
          child_name: string
          child_profile: Database["public"]["Enums"]["child_profile"]
          comprehension_level:
            | Database["public"]["Enums"]["comprehension_level"]
            | null
          created_at: string
          id: string
          speech_level: Database["public"]["Enums"]["speech_level"] | null
          track_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          child_age: number
          child_name: string
          child_profile: Database["public"]["Enums"]["child_profile"]
          comprehension_level?:
            | Database["public"]["Enums"]["comprehension_level"]
            | null
          created_at?: string
          id?: string
          speech_level?: Database["public"]["Enums"]["speech_level"] | null
          track_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          child_age?: number
          child_name?: string
          child_profile?: Database["public"]["Enums"]["child_profile"]
          comprehension_level?:
            | Database["public"]["Enums"]["comprehension_level"]
            | null
          created_at?: string
          id?: string
          speech_level?: Database["public"]["Enums"]["speech_level"] | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_track_for_child: {
        Args: {
          p_child_profile: Database["public"]["Enums"]["child_profile"]
          p_child_age: number
        }
        Returns: string
      }
    }
    Enums: {
      child_profile: "Típico" | "TEA" | "Down" | "Atraso"
      comprehension_level:
        | "Entende tudo"
        | "Ordens simples"
        | "Pouco"
        | "Só pistas visuais"
      speech_level:
        | "Não verbal"
        | "Palavras isoladas"
        | "Frases curtas"
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
      child_profile: ["Típico", "TEA", "Down", "Atraso"],
      comprehension_level: [
        "Entende tudo",
        "Ordens simples",
        "Pouco",
        "Só pistas visuais",
      ],
      speech_level: [
        "Não verbal",
        "Palavras isoladas",
        "Frases curtas",
        "Frases completas",
      ],
      subscription_plan: ["TRIAL", "ESSENCIAL", "AVANCADO", "PREMIUM"],
      user_role: ["parent", "therapist", "admin"],
    },
  },
} as const
