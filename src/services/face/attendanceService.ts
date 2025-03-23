
import { supabase } from '@/lib/supabase';

export const recordAttendance = async (userId: string, location?: string): Promise<boolean> => {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeStr = today.toTimeString().split(' ')[0];
    
    // Check if already registered today
    const { data: existing } = await supabase
      .from('attendance')
      .select('id')
      .eq('user_id', userId)
      .eq('date', dateStr)
      .single();
    
    if (existing) {
      console.log('Attendance already recorded today');
      return true;
    }
    
    // Calculate status based on time
    let status: 'present' | 'late' = 'present';
    const hour = today.getHours();
    const minute = today.getMinutes();
    
    // If after 9:30 AM, mark as late
    if (hour > 9 || (hour === 9 && minute > 30)) {
      status = 'late';
    }
    
    // Record new attendance
    const { error } = await supabase
      .from('attendance')
      .insert({
        user_id: userId,
        date: dateStr,
        time_in: timeStr,
        status,
        location: location || 'Main Office'
      });
    
    if (error) {
      console.error('Error recording attendance:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in recordAttendance:', error);
    return false;
  }
};
