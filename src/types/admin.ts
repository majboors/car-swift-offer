
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

export interface RpcListing {
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
  [key: string]: any;
}

export interface RpcUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  [key: string]: any;
}

export type AdminUserIdParams = {
  user_id_input: string;
};

// Empty params type for RPC calls that don't require parameters
export type EmptyParams = Record<string, never>;
