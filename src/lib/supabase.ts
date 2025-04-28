
// Import necessary types
import { createClient } from '@supabase/supabase-js';

// Get environment variables if available, otherwise use fallback values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://luogdfsyddhxfnibqbug.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1b2dkZnN5ZGRoeGZuaWJxYnVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NTcxOTcsImV4cCI6MjA1ODMzMzE5N30.17KCITBaAzFenvhMydhKHDRoXMwp_yc3I5pAe10Qn9U';

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Add a helper function to check if we're using environment variables or fallbacks
export const isUsingEnvironmentVariables = () => {
  return (
    !!import.meta.env.VITE_SUPABASE_URL && 
    !!import.meta.env.VITE_SUPABASE_ANON_KEY
  );
};
