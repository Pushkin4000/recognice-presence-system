
import { supabase } from '@/lib/supabase';
import { AttendanceRecord, AttendanceWithProfile } from './faceModels';

// Get attendance statistics
export const getAttendanceStats = async () => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Get total employees
    const { count: totalEmployees, error: countError } = await supabase
      .from('profiles')
      .count();

    if (countError) {
      console.error('Error counting employees:', countError);
      return {
        totalEmployees: 0,
        presentToday: 0,
        absentToday: 0,
        lateToday: 0,
        presentPercentage: 0
      };
    }

    // Get today's attendance
    const { data: todayRecords, error: attendanceError } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', today);

    if (attendanceError) {
      console.error('Error fetching today\'s attendance:', attendanceError);
      return {
        totalEmployees: totalEmployees || 0,
        presentToday: 0,
        absentToday: 0,
        lateToday: 0,
        presentPercentage: 0
      };
    }

    const presentToday = todayRecords ? todayRecords.filter(record => record.status === 'present').length : 0;
    const lateToday = todayRecords ? todayRecords.filter(record => record.status === 'late').length : 0;
    const totalPresent = presentToday + lateToday;
    const absentToday = (totalEmployees || 0) - totalPresent;
    const presentPercentage = totalEmployees ? Math.round((totalPresent / totalEmployees) * 100) : 0;

    return {
      totalEmployees: totalEmployees || 0,
      presentToday,
      absentToday,
      lateToday,
      presentPercentage
    };
  } catch (error) {
    console.error('Error getting attendance stats:', error);
    return {
      totalEmployees: 0,
      presentToday: 0,
      absentToday: 0,
      lateToday: 0,
      presentPercentage: 0
    };
  }
};

// Get today's attendance
export const getTodayAttendance = async (): Promise<AttendanceRecord[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        profiles:user_id(user_id, name)
      `)
      .eq('date', today);

    if (error) {
      console.error('Error fetching today\'s attendance:', error);
      return [];
    }

    return (data || []).map((record: any) => ({
      id: record.id,
      userId: record.user_id,
      userName: record.profiles?.name || 'Unknown',
      date: new Date(record.date),
      timeIn: record.time_in,
      timeOut: record.time_out || undefined,
      status: record.status,
      location: record.location,
      notes: record.notes || undefined
    }));
  } catch (error) {
    console.error('Error in getTodayAttendance:', error);
    return [];
  }
};

// Get recent attendance
export const getRecentAttendance = async (limit: number = 30): Promise<AttendanceRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        profiles:user_id(user_id, name)
      `)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent attendance:', error);
      return [];
    }

    return (data || []).map((record: any) => ({
      id: record.id,
      userId: record.user_id,
      userName: record.profiles?.name || 'Unknown',
      date: new Date(record.date),
      timeIn: record.time_in,
      timeOut: record.time_out || undefined,
      status: record.status,
      location: record.location,
      notes: record.notes || undefined
    }));
  } catch (error) {
    console.error('Error in getRecentAttendance:', error);
    return [];
  }
};
