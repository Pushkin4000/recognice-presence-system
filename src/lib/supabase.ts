
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://luogdfsyddhxfnibqbug.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1b2dkZnN5ZGRoeGZuaWJxYnVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NTcxOTcsImV4cCI6MjA1ODMzMzE5N30.17KCITBaAzFenvhMydhKHDRoXMwp_yc3I5pAe10Qn9U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
