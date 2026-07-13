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
      appointments: {
        Row: {
          created_at: string
          customer_id: string | null
          end_time: string
          id: string
          notes: string | null
          start_time: string
          status: string | null
          tenant_id: string
          title: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          end_time: string
          id?: string
          notes?: string | null
          start_time: string
          status?: string | null
          tenant_id: string
          title?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          start_time?: string
          status?: string | null
          tenant_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      business_settings: {
        Row: {
          ai_avatar: string | null
          ai_prompt: string | null
          ai_rules: string | null
          ai_tokens_used: number | null
          ai_tone: string | null
          brand_tagline: string | null
          closing_time: string
          created_at: string
          font: string | null
          groq_api_key: string | null
          hero_image: string | null
          id: string
          latitude: number | null
          longitude: number | null
          opening_time: string
          services_json: Json | null
          setup_fee_paid: boolean | null
          system_status: string | null
          tenant_id: string
          theme: string | null
          trial_ends_at: string | null
          unlocked_modules: Json | null
          use_calendar: boolean | null
          whatsapp_number: string | null
        }
        Insert: {
          ai_avatar?: string | null
          ai_prompt?: string | null
          ai_rules?: string | null
          ai_tokens_used?: number | null
          ai_tone?: string | null
          brand_tagline?: string | null
          closing_time?: string
          created_at?: string
          font?: string | null
          groq_api_key?: string | null
          hero_image?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          opening_time?: string
          services_json?: Json | null
          setup_fee_paid?: boolean | null
          system_status?: string | null
          tenant_id: string
          theme?: string | null
          trial_ends_at?: string | null
          unlocked_modules?: Json | null
          use_calendar?: boolean | null
          whatsapp_number?: string | null
        }
        Update: {
          ai_avatar?: string | null
          ai_prompt?: string | null
          ai_rules?: string | null
          ai_tokens_used?: number | null
          ai_tone?: string | null
          brand_tagline?: string | null
          closing_time?: string
          created_at?: string
          font?: string | null
          groq_api_key?: string | null
          hero_image?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          opening_time?: string
          services_json?: Json | null
          setup_fee_paid?: boolean | null
          system_status?: string | null
          tenant_id?: string
          theme?: string | null
          trial_ends_at?: string | null
          unlocked_modules?: Json | null
          use_calendar?: boolean | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          role: string
        }
        Insert: {
          id: string
          role?: string
        }
        Update: {
          id?: string
          role?: string
        }
        Relationships: []
      }
      stripe_events: {
        Row: {
          created_at: string | null
          id: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          type?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          active_modules: Json | null
          ai_token_limit: number | null
          ai_tokens_used: number | null
          available_rewards: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          last_active: string | null
          name: string
          owner_id: string | null
          payment_method: string | null
          payment_status: string | null
          referral_code: string | null
          referrals_count: number | null
          referred_by: string | null
          setup_advance_paid: boolean | null
          setup_fee_paid: boolean | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subdomain: string
          trial_ends_at: string | null
        }
        Insert: {
          active_modules?: Json | null
          ai_token_limit?: number | null
          ai_tokens_used?: number | null
          available_rewards?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_active?: string | null
          name: string
          owner_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          referral_code?: string | null
          referrals_count?: number | null
          referred_by?: string | null
          setup_advance_paid?: boolean | null
          setup_fee_paid?: boolean | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subdomain: string
          trial_ends_at?: string | null
        }
        Update: {
          active_modules?: Json | null
          ai_token_limit?: number | null
          ai_tokens_used?: number | null
          available_rewards?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_active?: string | null
          name?: string
          owner_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          referral_code?: string | null
          referrals_count?: number | null
          referred_by?: string | null
          setup_advance_paid?: boolean | null
          setup_fee_paid?: boolean | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subdomain?: string
          trial_ends_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount_mxn: number
          created_at: string
          id: string
          status: string | null
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          tenant_id: string
          tokens_added: number | null
          transaction_type: string
        }
        Insert: {
          amount_mxn: number
          created_at?: string
          id?: string
          status?: string | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          tenant_id: string
          tokens_added?: number | null
          transaction_type: string
        }
        Update: {
          amount_mxn?: number
          created_at?: string
          id?: string
          status?: string | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          tenant_id?: string
          tokens_added?: number | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_stripe_token_purchase: {
        Args: {
          p_amount: number
          p_event_id: string
          p_event_type: string
          p_tenant_id: string
        }
        Returns: boolean
      }
      increment_tokens_used: {
        Args: { p_amount?: number; p_tenant_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
