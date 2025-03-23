
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  // Provide fallback values for development to prevent crashes
  // This should be removed in production
}

// Use non-nullable assertion as we've verified the values or provided defaults
export const supabase = createClient(
  supabaseUrl as string, 
  supabaseAnonKey as string
);

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
