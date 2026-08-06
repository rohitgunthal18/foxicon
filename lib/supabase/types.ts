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
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_seen_at: string | null
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          last_seen_at?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          last_seen_at?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
        }
        Relationships: []
      }
      agreement_items: {
        Row: {
          agreement_id: string
          created_at: string
          detail: string | null
          id: string
          kind: Database["public"]["Enums"]["agreement_item_kind"]
          label: string
          qty: number
          sort_order: number
          unit_inr: number
        }
        Insert: {
          agreement_id: string
          created_at?: string
          detail?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["agreement_item_kind"]
          label: string
          qty?: number
          sort_order?: number
          unit_inr?: number
        }
        Update: {
          agreement_id?: string
          created_at?: string
          detail?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["agreement_item_kind"]
          label?: string
          qty?: number
          sort_order?: number
          unit_inr?: number
        }
        Relationships: [
          {
            foreignKeyName: "agreement_items_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "agreements"
            referencedColumns: ["id"]
          },
        ]
      }
      agreement_templates: {
        Row: {
          client_duties: string
          confidentiality: string
          created_at: string
          delivery: string
          dispute: string
          id: string
          intro: string
          is_default: boolean
          liability: string
          name: string
          ownership: string
          payment_terms: string
          revisions: string
          scope: string
          signing_text: string
          support: string
          termination: string
          updated_at: string
        }
        Insert: {
          client_duties?: string
          confidentiality?: string
          created_at?: string
          delivery?: string
          dispute?: string
          id?: string
          intro?: string
          is_default?: boolean
          liability?: string
          name: string
          ownership?: string
          payment_terms?: string
          revisions?: string
          scope?: string
          signing_text?: string
          support?: string
          termination?: string
          updated_at?: string
        }
        Update: {
          client_duties?: string
          confidentiality?: string
          created_at?: string
          delivery?: string
          dispute?: string
          id?: string
          intro?: string
          is_default?: boolean
          liability?: string
          name?: string
          ownership?: string
          payment_terms?: string
          revisions?: string
          scope?: string
          signing_text?: string
          support?: string
          termination?: string
          updated_at?: string
        }
        Relationships: []
      }
      agreements: {
        Row: {
          client_address: string | null
          client_company: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          content: Json
          content_hash: string | null
          created_at: string
          created_by: string | null
          currency: string
          delivery_days: number
          discount_inr: number
          expires_at: string | null
          id: string
          installments: Json
          lead_id: string | null
          plan_slug: string | null
          project_title: string
          reference: string
          revisions_included: number
          sent_at: string | null
          service_slug: string | null
          signed_at: string | null
          status: Database["public"]["Enums"]["agreement_status"]
          subtotal_inr: number
          support_months: number
          tax_percent: number
          token_hash: string | null
          total_inr: number
          updated_at: string
          void_reason: string | null
          voided_at: string | null
        }
        Insert: {
          client_address?: string | null
          client_company?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          content?: Json
          content_hash?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          delivery_days?: number
          discount_inr?: number
          expires_at?: string | null
          id?: string
          installments?: Json
          lead_id?: string | null
          plan_slug?: string | null
          project_title?: string
          reference: string
          revisions_included?: number
          sent_at?: string | null
          service_slug?: string | null
          signed_at?: string | null
          status?: Database["public"]["Enums"]["agreement_status"]
          subtotal_inr?: number
          support_months?: number
          tax_percent?: number
          token_hash?: string | null
          total_inr?: number
          updated_at?: string
          void_reason?: string | null
          voided_at?: string | null
        }
        Update: {
          client_address?: string | null
          client_company?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          content?: Json
          content_hash?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          delivery_days?: number
          discount_inr?: number
          expires_at?: string | null
          id?: string
          installments?: Json
          lead_id?: string | null
          plan_slug?: string | null
          project_title?: string
          reference?: string
          revisions_included?: number
          sent_at?: string | null
          service_slug?: string | null
          signed_at?: string | null
          status?: Database["public"]["Enums"]["agreement_status"]
          subtotal_inr?: number
          support_months?: number
          tax_percent?: number
          token_hash?: string | null
          total_inr?: number
          updated_at?: string
          void_reason?: string | null
          voided_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agreements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agreements_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agreements_plan_slug_fkey"
            columns: ["plan_slug"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "agreements_service_slug_fkey"
            columns: ["service_slug"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["slug"]
          },
        ]
      }
      bonuses: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          is_active: boolean
          min_plan_sort: number
          sort_order: number
          title: string
          updated_at: string
          worth_inr: number
        }
        Insert: {
          created_at?: string
          description: string
          icon: string
          id?: string
          is_active?: boolean
          min_plan_sort?: number
          sort_order?: number
          title: string
          updated_at?: string
          worth_inr: number
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          min_plan_sort?: number
          sort_order?: number
          title?: string
          updated_at?: string
          worth_inr?: number
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_active: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_active?: boolean
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      lead_activities: {
        Row: {
          author_id: string | null
          body: string | null
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["activity_kind"]
          lead_id: string
          meta: Json
        }
        Insert: {
          author_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["activity_kind"]
          lead_id: string
          meta?: Json
        }
        Update: {
          author_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["activity_kind"]
          lead_id?: string
          meta?: Json
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          admin_notes: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          ip_hash: string | null
          last_contacted_at: string | null
          message: string | null
          name: string
          next_follow_up_at: string | null
          owner_id: string | null
          phone: string | null
          priority: Database["public"]["Enums"]["lead_priority"]
          service_slug: string | null
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          user_agent: string | null
          value_inr: number | null
        }
        Insert: {
          admin_notes?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ip_hash?: string | null
          last_contacted_at?: string | null
          message?: string | null
          name: string
          next_follow_up_at?: string | null
          owner_id?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["lead_priority"]
          service_slug?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          user_agent?: string | null
          value_inr?: number | null
        }
        Update: {
          admin_notes?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ip_hash?: string | null
          last_contacted_at?: string | null
          message?: string | null
          name?: string
          next_follow_up_at?: string | null
          owner_id?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["lead_priority"]
          service_slug?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          user_agent?: string | null
          value_inr?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_service_slug_fkey"
            columns: ["service_slug"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["slug"]
          },
        ]
      }
      login_attempts: {
        Row: {
          created_at: string
          id: string
          ip_hash: string
          succeeded: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          ip_hash: string
          succeeded?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          ip_hash?: string
          succeeded?: boolean
        }
        Relationships: []
      }
      plan_features: {
        Row: {
          id: string
          included: boolean
          plan_id: string
          sort_order: number
          text: string
        }
        Insert: {
          id?: string
          included?: boolean
          plan_id: string
          sort_order?: number
          text: string
        }
        Update: {
          id?: string
          included?: boolean
          plan_id?: string
          sort_order?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_features_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          delivery_label: string
          id: string
          is_active: boolean
          is_featured: boolean
          name: string
          price_inr: number
          slug: string
          sort_order: number
          tagline: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_label: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name: string
          price_inr: number
          slug: string
          sort_order?: number
          tagline: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_label?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name?: string
          price_inr?: number
          slug?: string
          sort_order?: number
          tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
      process_steps: {
        Row: {
          created_at: string
          day_label: string
          description: string
          id: string
          is_active: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_label: string
          description: string
          id?: string
          is_active?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_label?: string
          description?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string
          author_role: string | null
          body: string
          created_at: string
          id: string
          ip_hash: string | null
          is_featured: boolean
          rating: number
          sort_order: number
          status: Database["public"]["Enums"]["review_status"]
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          author_name: string
          author_role?: string | null
          body: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          is_featured?: boolean
          rating: number
          sort_order?: number
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          author_name?: string
          author_role?: string | null
          body?: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          is_featured?: boolean
          rating?: number
          sort_order?: number
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          is_active: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          icon: string
          id?: string
          is_active?: boolean
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      signature_events: {
        Row: {
          accepted_terms: boolean
          agreement_id: string
          content_hash: string
          id: string
          ip_hash: string | null
          signed_at: string
          signer_email: string | null
          signer_name: string
          user_agent: string | null
        }
        Insert: {
          accepted_terms: boolean
          agreement_id: string
          content_hash: string
          id?: string
          ip_hash?: string | null
          signed_at?: string
          signer_email?: string | null
          signer_name: string
          user_agent?: string | null
        }
        Update: {
          accepted_terms?: boolean
          agreement_id?: string
          content_hash?: string
          id?: string
          ip_hash?: string | null
          signed_at?: string
          signer_email?: string | null
          signer_name?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signature_events_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: true
            referencedRelation: "agreements"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          label: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          label: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          label?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_active_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      prune_login_attempts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      activity_kind:
        | "note"
        | "status_change"
        | "agreement_sent"
        | "agreement_signed"
        | "payment_recorded"
        | "field_update"
      admin_role: "owner" | "admin" | "staff"
      agreement_item_kind: "service" | "addon" | "discount"
      agreement_status: "draft" | "sent" | "signed" | "voided"
      lead_priority: "low" | "normal" | "high"
      lead_source: "contact_form" | "quote_modal"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "agreement"
        | "development"
        | "delivered"
        | "paid"
        | "closed"
        | "lost"
        | "rejected"
        | "follow_up"
      review_status: "pending" | "approved" | "rejected"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      activity_kind: [
        "note",
        "status_change",
        "agreement_sent",
        "agreement_signed",
        "payment_recorded",
        "field_update",
      ],
      admin_role: ["owner", "admin", "staff"],
      agreement_item_kind: ["service", "addon", "discount"],
      agreement_status: ["draft", "sent", "signed", "voided"],
      lead_priority: ["low", "normal", "high"],
      lead_source: ["contact_form", "quote_modal"],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "agreement",
        "development",
        "delivered",
        "paid",
        "closed",
        "lost",
        "rejected",
        "follow_up",
      ],
      review_status: ["pending", "approved", "rejected"],
    },
  },
} as const
