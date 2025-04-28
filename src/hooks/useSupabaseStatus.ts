
import { useEffect } from 'react';
import { toast } from 'sonner';
import { isUsingEnvironmentVariables } from '@/lib/supabase';

export const useSupabaseStatus = () => {
  useEffect(() => {
    if (!isUsingEnvironmentVariables()) {
      console.warn(
        'Using demo Supabase credentials. For local development, set up the .env file with your own credentials.'
      );
      
      toast.warning(
        'Using demo Supabase credentials', 
        {
          description: 'See README.md for instructions on setting up local development.',
          duration: 6000,
        }
      );
    }
  }, []);
};
