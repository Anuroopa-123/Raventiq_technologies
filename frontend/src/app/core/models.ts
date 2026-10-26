export type Role = 'student' | 'admin' | 'superadmin';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  college?: string | null;
  role: Role;
  is_active: boolean;
  has_password: boolean;
  has_google: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  college?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Poster {
  id: number;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AdminStats {
  students: number;
  admins: number;
  posters: number;
  contact_messages: number;
}

export interface ContactMessageRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  message: string;
  email_status: string;
  created_at: string;
}
