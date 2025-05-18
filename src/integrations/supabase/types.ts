export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      car_listings: {
        Row: {
          body_type: string | null
          car_name: string | null
          color: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          featured: boolean | null
          features: Json | null
          fuel_type: string | null
          id: string
          images: Json | null
          location: string | null
          make: string
          mileage: number | null
          model: string
          nearby_notification_sent: boolean | null
          package_expires_at: string | null
          package_level: number | null
          price: number
          showcase: boolean | null
          status: string
          title: string
          top_search: boolean | null
          transmission: string | null
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          body_type?: string | null
          car_name?: string | null
          color?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          features?: Json | null
          fuel_type?: string | null
          id?: string
          images?: Json | null
          location?: string | null
          make: string
          mileage?: number | null
          model: string
          nearby_notification_sent?: boolean | null
          package_expires_at?: string | null
          package_level?: number | null
          price: number
          showcase?: boolean | null
          status?: string
          title: string
          top_search?: boolean | null
          transmission?: string | null
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          body_type?: string | null
          car_name?: string | null
          color?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          features?: Json | null
          fuel_type?: string | null
          id?: string
          images?: Json | null
          location?: string | null
          make?: string
          mileage?: number | null
          model?: string
          nearby_notification_sent?: boolean | null
          package_expires_at?: string | null
          package_level?: number | null
          price?: number
          showcase?: boolean | null
          status?: string
          title?: string
          top_search?: boolean | null
          transmission?: string | null
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      listing_packages: {
        Row: {
          active: boolean | null
          created_at: string | null
          duration_days: number
          features: Json
          id: string
          level: number
          name: string
          price: number
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          duration_days: number
          features?: Json
          id?: string
          level: number
          name: string
          price: number
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          duration_days?: number
          features?: Json
          id?: string
          level?: number
          name?: string
          price?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          id: string
          inserted_at: string
          listing_id: string
          read: boolean
          receiver_id: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          id?: string
          inserted_at?: string
          listing_id: string
          read?: boolean
          receiver_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          id?: string
          inserted_at?: string
          listing_id?: string
          read?: boolean
          receiver_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "car_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_global: boolean | null
          message: string
          target_locations: string[] | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_global?: boolean | null
          message: string
          target_locations?: string[] | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_global?: boolean | null
          message?: string
          target_locations?: string[] | null
          title?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          notification_id: string | null
          read: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notification_id?: string | null
          read?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notification_id?: string | null
          read?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          id: string
          location: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          location?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_admin: {
        Args: { user_id_input: string }
        Returns: undefined
      }
      admin_approve_listing: {
        Args: { listing_id: string }
        Returns: boolean
      }
      admin_reject_listing: {
        Args: { listing_id: string }
        Returns: boolean
      }
      admin_toggle_featured: {
        Args: { listing_id: string; featured_value: boolean }
        Returns: boolean
      }
      admin_toggle_showcase: {
        Args: { listing_id: string; showcase_value: boolean }
        Returns: boolean
      }
      create_missing_user_profiles: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      delete_notification: {
        Args: { p_notification_id: string; p_admin_id: string }
        Returns: boolean
      }
      ensure_user_profile: {
        Args: { user_id_input: string }
        Returns: undefined
      }
      get_all_notifications: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          message: string
          created_at: string
          expires_at: string
          is_global: boolean
          target_locations: string[]
          admin_email: string
        }[]
      }
      get_all_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          created_at: string
          last_sign_in_at: string
          is_admin: boolean
        }[]
      }
      get_car_listings_with_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          year: number
          price: number
          mileage: number
          images: Json
          created_at: string
          updated_at: string
          features: Json
          transmission: string
          fuel_type: string
          body_type: string
          description: string
          location: string
          title: string
          make: string
          model: string
          contact_email: string
          contact_phone: string
          car_name: string
          color: string
          user_email: string
        }[]
      }
      get_unread_message_count: {
        Args: { user_id: string }
        Returns: {
          listing_id: string
          unread_count: number
        }[]
      }
      get_unread_notification_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_user_email: {
        Args: { user_id_input: string }
        Returns: string
      }
      get_user_notifications: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          notification_id: string
          title: string
          message: string
          created_at: string
          read: boolean
          expires_at: string
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      mark_messages_as_read: {
        Args: {
          p_listing_id: string
          p_sender_id: string
          p_receiver_id: string
        }
        Returns: undefined
      }
      mark_notification_read: {
        Args: { p_user_id: string; p_notification_id: string }
        Returns: undefined
      }
      remove_admin: {
        Args: { user_id_input: string }
        Returns: undefined
      }
      send_notification_to_users: {
        Args:
          | {
              p_title: string
              p_message: string
              p_target_locations: string[]
              p_is_global: boolean
              p_admin_id: string
            }
          | {
              p_title: string
              p_message: string
              p_target_locations: string[]
              p_is_global: boolean
              p_admin_id: string
              p_duration_hours?: number
            }
        Returns: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
