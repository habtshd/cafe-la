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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      business_settings: {
        Row: {
          about: string
          accepting_orders: boolean
          address: string
          cafe_name: string
          delivery_fee: number
          email: string
          facebook_url: string
          id: number
          instagram_url: string
          map_url: string
          offers_delivery: boolean
          offers_dine_in: boolean
          offers_pickup: boolean
          offers_reservations: boolean
          opening_hours: string
          phone: string
          prep_time_minutes: number
          tagline: string
          telegram_url: string
          tiktok_url: string
          updated_at: string
        }
        Insert: {
          about?: string
          accepting_orders?: boolean
          address?: string
          cafe_name?: string
          delivery_fee?: number
          email?: string
          facebook_url?: string
          id?: number
          instagram_url?: string
          map_url?: string
          offers_delivery?: boolean
          offers_dine_in?: boolean
          offers_pickup?: boolean
          offers_reservations?: boolean
          opening_hours?: string
          phone?: string
          prep_time_minutes?: number
          tagline?: string
          telegram_url?: string
          tiktok_url?: string
          updated_at?: string
        }
        Update: {
          about?: string
          accepting_orders?: boolean
          address?: string
          cafe_name?: string
          delivery_fee?: number
          email?: string
          facebook_url?: string
          id?: number
          instagram_url?: string
          map_url?: string
          offers_delivery?: boolean
          offers_dine_in?: boolean
          offers_pickup?: boolean
          offers_reservations?: boolean
          opening_hours?: string
          phone?: string
          prep_time_minutes?: number
          tagline?: string
          telegram_url?: string
          tiktok_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      menu_categories: {
        Row: {
          archived: boolean
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          archived?: boolean
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          archived?: boolean
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          archived: boolean
          available: boolean
          category_id: string | null
          created_at: string
          description: string
          featured: boolean
          id: string
          image_path: string | null
          name: string
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          archived?: boolean
          available?: boolean
          category_id?: string | null
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          image_path?: string | null
          name: string
          price: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          archived?: boolean
          available?: boolean
          category_id?: string | null
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          image_path?: string | null
          name?: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          item_name: string
          menu_item_id: string | null
          note: string | null
          order_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          id?: string
          item_name: string
          menu_item_id?: string | null
          note?: string | null
          order_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          id?: string
          item_name?: string
          menu_item_id?: string | null
          note?: string | null
          order_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string | null
          delivery_fee: number
          id: string
          note: string | null
          order_number: string
          order_type: Database["public"]["Enums"]["order_type"]
          pickup_time: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          table_number: string | null
          total: number
          tracking_token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivery_address?: string | null
          delivery_fee?: number
          id?: string
          note?: string | null
          order_number?: string
          order_type: Database["public"]["Enums"]["order_type"]
          pickup_time?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          table_number?: string | null
          total: number
          tracking_token?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_address?: string | null
          delivery_fee?: number
          id?: string
          note?: string | null
          order_number?: string
          order_type?: Database["public"]["Enums"]["order_type"]
          pickup_time?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          table_number?: string | null
          total?: number
          tracking_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          created_at: string
          customer_name: string
          customer_phone: string
          guests: number
          id: string
          reservation_date: string
          reservation_time: string
          special_request: string | null
          status: Database["public"]["Enums"]["reservation_status"]
        }
        Insert: {
          created_at?: string
          customer_name: string
          customer_phone: string
          guests: number
          id?: string
          reservation_date: string
          reservation_time: string
          special_request?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
        }
        Update: {
          created_at?: string
          customer_name?: string
          customer_phone?: string
          guests?: number
          id?: string
          reservation_date?: string
          reservation_time?: string
          special_request?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "staff"
      order_status:
        | "received"
        | "confirmed"
        | "preparing"
        | "ready"
        | "out_for_delivery"
        | "completed"
        | "cancelled"
      order_type: "pickup" | "delivery" | "dine_in"
      reservation_status: "pending" | "confirmed" | "completed" | "cancelled"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "staff"],
      order_status: [
        "received",
        "confirmed",
        "preparing",
        "ready",
        "out_for_delivery",
        "completed",
        "cancelled",
      ],
      order_type: ["pickup", "delivery", "dine_in"],
      reservation_status: ["pending", "confirmed", "completed", "cancelled"],
    },
  },
} as const
