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
          features: Json | null
          fuel_type: string | null
          id: string
          images: Json | null
          location: string | null
          make: string
          mileage: number | null
          model: string
          price: number
          status: string
          title: string
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
          features?: Json | null
          fuel_type?: string | null
          id?: string
          images?: Json | null
          location?: string | null
          make: string
          mileage?: number | null
          model: string
          price: number
          status?: string
          title: string
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
          features?: Json | null
          fuel_type?: string | null
          id?: string
          images?: Json | null
          location?: string | null
          make?: string
          mileage?: number | null
          model?: string
          price?: number
          status?: string
          title?: string
          transmission?: string | null
          updated_at?: string
          user_id?: string
          year?: number
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_admin: {
        Args: { user_id_input: string }
        Returns: undefined
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
      remove_admin: {
        Args: { user_id_input: string }
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
