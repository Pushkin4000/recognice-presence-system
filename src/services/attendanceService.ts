
import { supabase } from '@/lib/supabase';
import { AttendanceRecord } from './faceModels';

// Record attendance
export const recordAttendance = async (
  userId: string,
  userName: string,
  location: string = 'Main Office',
  notes?: string
): Promise<AttendanceRecord | null> => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Check if user already has attendance record for today
    const { data: existingRecord } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (existingRecord) {
      console.log('Attendance already recorded for today');
      return {
        id: existingRecord.id,
        userId: existingRecord.user_id,
        userName, // Use passed userName since it may not be in the record
        date: new Date(existingRecord.date),
        timeIn: existingRecord.time_in,
        timeOut: existingRecord.time_out || undefined,
        status: existingRecord.status,
        location: existingRecord.location,
        notes: existingRecord.notes || undefined
      };
    }

    // Determine status based on time
    let status: 'present' | 'late' | 'absent' = 'present';
    const hour = now.getHours();
    if (hour >= 9 && hour < 12) {
      status = 'late';
    } else if (hour >= 12) {
      status = 'late';
    }

    // Insert new attendance record
    const { data: newRecord, error } = await supabase
      .from('attendance')
      .insert({
        user_id: userId,
        date: today,
        time_in: currentTime,
        status,
        location,
        notes: notes || null,
        created_at: now.toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording attendance:', error);
      return null;
    }

    console.log('Attendance recorded successfully');
    return {
      id: newRecord.id,
      userId: newRecord.user_id,
      userName,
      date: new Date(newRecord.date),
      timeIn: newRecord.time_in,
      timeOut: newRecord.time_out || undefined,
      status: newRecord.status,
      location: newRecord.location,
      notes: newRecord.notes || undefined
    };
  } catch (error) {
    console.error('Error in recordAttendance:', error);
    return null;
  }
};
