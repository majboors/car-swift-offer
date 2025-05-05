
export interface Listing {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  created_at: string;
  user_id: string;
  user_email?: string;
  description?: string;
  // Additional fields for expanded edit functionality
  mileage?: number | null;
  color?: string | null;
  transmission?: string | null;
  fuel_type?: string | null;
  body_type?: string | null;
  location?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  features?: any;
  images?: string[] | null;
}

// Add User interface for AdminUsers component
export interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin: boolean;
}

// Parameter types for each RPC function
export interface AdminUserIdParams {
  user_id_input: string;
}

// Custom generic type for RPC function responses
export interface RpcResponse<T> {
  data: T;
  error: Error | null;
}
