
import { supabase } from "@/lib/supabase";

export const getAttendanceStats = async () => {
  // Get total employees count (profiles)
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('*');
  
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    return { totalEmployees: 0 };
  }
  
  // Calculate total employees from the returned data array length
  const totalEmployees = profilesData ? profilesData.length : 0;
  
  // Return the stats
  return {
    totalEmployees
  };
};

export const getAttendanceRecords = async (dateFrom?: Date, dateTo?: Date, userId?: string) => {
  let query = supabase
    .from('attendance_records')
    .select('*');
  
  // Apply date filters if provided
  if (dateFrom) {
    query = query.gte('date', dateFrom.toISOString().split('T')[0]);
  }
  
  if (dateTo) {
    query = query.lte('date', dateTo.toISOString().split('T')[0]);
  }
  
  // Apply user filter if provided
  if (userId && userId !== 'all') {
    query = query.eq('user_id', userId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching attendance records:', error);
    return [];
  }
  
  return data || [];
};
