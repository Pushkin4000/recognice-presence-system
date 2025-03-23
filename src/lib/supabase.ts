
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials. Please check your environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Create the Supabase client with fallback values to prevent runtime errors
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type UserProfile = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  avatar?: string; // Added to match usage in components
  employee_id?: string;
  department?: string;
  face_encoding?: string;
  notes?: string;
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
