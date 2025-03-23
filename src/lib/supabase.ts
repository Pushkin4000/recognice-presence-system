
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type UserProfile = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  employee_id?: string;
  department?: string;
  face_encoding?: string;
  created_at: string;
};

export type AttendanceRecord = {
  id: string;
  user_id: string;
  date: string;
  time_in: string;
  time_out?: string;
  status: 'present' | 'absent' | 'late';
  location?: string;
  notes?: string;
  created_at: string;
};
