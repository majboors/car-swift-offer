
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
}

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
