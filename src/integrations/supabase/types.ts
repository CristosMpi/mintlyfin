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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          created_at: string
          criteria: string | null
          description: string | null
          event_id: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          criteria?: string | null
          description?: string | null
          event_id: string
          icon?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          criteria?: string | null
          description?: string | null
          event_id?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          currency_name: string
          currency_symbol: string
          duration_hours: number
          exchange_rate: number
          expires_at: string
          id: string
          is_active: boolean
          name: string
          organizer_id: string
          starting_balance: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency_name: string
          currency_symbol?: string
          duration_hours?: number
          exchange_rate?: number
          expires_at: string
          id?: string
          is_active?: boolean
          name: string
          organizer_id: string
          starting_balance?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency_name?: string
          currency_symbol?: string
          duration_hours?: number
          exchange_rate?: number
          expires_at?: string
          id?: string
          is_active?: boolean
          name?: string
          organizer_id?: string
          starting_balance?: number
          updated_at?: string
        }
        Relationships: []
      }
      participant_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          participant_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          participant_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          participant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participant_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participant_badges_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          event_id: string
          id: string
          join_code: string
          joined_at: string
          name: string
          user_id: string | null
        }
        Insert: {
          event_id: string
          id?: string
          join_code: string
          joined_at?: string
          name: string
          user_id?: string | null
        }
        Update: {
          event_id?: string
          id?: string
          join_code?: string
          joined_at?: string
          name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          event_id: string
          from_wallet_id: string | null
          id: string
          to_wallet_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          vendor_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          event_id: string
          from_wallet_id?: string | null
          id?: string
          to_wallet_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          event_id?: string
          from_wallet_id?: string | null
          id?: string
          to_wallet_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_from_wallet_id_fkey"
            columns: ["from_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_wallet_id_fkey"
            columns: ["to_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          created_at: string
          event_id: string
          id: string
          name: string
          total_earnings: number
          updated_at: string
          user_id: string | null
          vendor_code: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          name: string
          total_earnings?: number
          updated_at?: string
          user_id?: string | null
          vendor_code: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          name?: string
          total_earnings?: number
          updated_at?: string
          user_id?: string | null
          vendor_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          event_id: string
          id: string
          participant_id: string
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          event_id: string
          id?: string
          participant_id: string
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          event_id?: string
          id?: string
          participant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallets_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: true
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      join_event_secure: {
        Args: {
          p_event_id: string
          p_join_code: string
          p_participant_name: string
        }
        Returns: Json
      }
      process_payment_secure: {
        Args: {
          p_amount: number
          p_description?: string
          p_vendor_id: string
          p_wallet_id: string
        }
        Returns: string
      }
      send_reward_secure: {
        Args: {
          p_amount: number
          p_description?: string
          p_event_id: string
          p_participant_id: string
        }
        Returns: string
      }
      transfer_funds_secure: {
        Args: {
          p_amount: number
          p_description?: string
          p_from_wallet_id: string
          p_to_wallet_id: string
        }
        Returns: string
      }
    }
    Enums: {
      transaction_type: "payment" | "transfer" | "reward" | "refund"
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
      transaction_type: ["payment", "transfer", "reward", "refund"],
    },
  },
} as const
