
import { supabase } from '@/lib/supabase';

export const getAttendanceSummary = async (): Promise<{
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
}> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get total employees
    const { count: totalEmployees, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      throw countError;
    }
    
    // Get today's attendance
    const { data: todayAttendance, error: attendanceError } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', today);
    
    if (attendanceError) {
      throw attendanceError;
    }
    
    // Calculate statistics
    const presentToday = todayAttendance?.filter(record => record.status === 'present').length || 0;
    const lateToday = todayAttendance?.filter(record => record.status === 'late').length || 0;
    const absentToday = (totalEmployees || 0) - (presentToday + lateToday);
    
    return {
      totalEmployees: totalEmployees || 0,
      presentToday,
      absentToday: absentToday > 0 ? absentToday : 0,
      lateToday
    };
  } catch (error) {
    console.error('Error getting attendance summary:', error);
    return {
      totalEmployees: 0,
      presentToday: 0,
      absentToday: 0,
      lateToday: 0
    };
  }
};

export const getRecentAttendance = async (limit = 20): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        id,
        date,
        time_in,
        status,
        location,
        notes,
        profiles (
          user_id,
          name
        )
      `)
      .order('date', { ascending: false })
      .limit(limit);
    
    if (error || !data) {
      throw error;
    }
    
    return data.map(record => ({
      id: record.id,
      userId: record.profiles?.user_id || null,
      userName: record.profiles?.name || null,
      date: new Date(record.date),
      timeIn: record.time_in,
      status: record.status,
      location: record.location,
      notes: record.notes
    })) || [];
  } catch (error) {
    console.error('Error getting recent attendance:', error);
    return [];
  }
};

export const getTodayAttendance = async (): Promise<any[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        id,
        date,
        time_in,
        status,
        location,
        notes,
        profiles (
          user_id,
          name
        )
      `)
      .eq('date', today);
    
    if (error || !data) {
      throw error;
    }
    
    return data.map(record => ({
      id: record.id,
      userId: record.profiles?.user_id || null,
      userName: record.profiles?.name || null,
      date: new Date(record.date),
      timeIn: record.time_in,
      status: record.status,
      location: record.location,
      notes: record.notes
    })) || [];
  } catch (error) {
    console.error('Error getting today\'s attendance:', error);
    return [];
  }
};
