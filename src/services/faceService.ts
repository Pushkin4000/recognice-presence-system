
import { supabase } from '@/lib/supabase';
import * as faceapi from 'face-api.js';

// Make sure models are loaded only once
let modelsLoaded = false;

export const loadFaceApiModels = async () => {
  if (modelsLoaded) return;
  
  try {
    await Promise.all([
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
    ]);
    modelsLoaded = true;
    console.log('Face-api models loaded');
  } catch (error) {
    console.error('Error loading face-api models:', error);
    throw error;
  }
};

export const createFaceDescriptor = async (imageData: string): Promise<Float32Array | null> => {
  try {
    await loadFaceApiModels();
    
    // Create HTML image element from data URL
    const img = await faceapi.fetchImage(imageData);
    
    // Detect faces with landmarks
    const detections = await faceapi.detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (!detections) {
      console.error('No face detected in the image');
      return null;
    }
    
    return detections.descriptor;
  } catch (error) {
    console.error('Error creating face descriptor:', error);
    return null;
  }
};

export const registerFace = async (userId: string, imageData: string): Promise<boolean> => {
  try {
    const descriptor = await createFaceDescriptor(imageData);
    
    if (!descriptor) {
      return false;
    }
    
    // Convert Float32Array to string for storage
    const descriptorString = JSON.stringify(Array.from(descriptor));
    
    // Update user profile with face descriptor
    const { error } = await supabase
      .from('profiles')
      .update({ face_encoding: descriptorString })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error saving face descriptor:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error registering face:', error);
    return false;
  }
};

export const recognizeFace = async (imageData: string): Promise<{ userId: string; name: string } | null> => {
  try {
    await loadFaceApiModels();
    
    // Get all registered faces from the database
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, name, face_encoding')
      .not('face_encoding', 'is', null);
    
    if (error || !profiles || profiles.length === 0) {
      console.error('Error fetching face data or no registered faces:', error);
      return null;
    }
    
    // Create face matcher with the registered faces
    const labeledDescriptors = profiles.map(profile => {
      // Make sure face_encoding is defined before parsing
      if (!profile.face_encoding) {
        console.warn(`Profile ${profile.user_id} has no face encoding`);
        return null;
      }
      
      try {
        const descriptorArray = JSON.parse(profile.face_encoding);
        return new faceapi.LabeledFaceDescriptors(
          profile.user_id, 
          [new Float32Array(descriptorArray)]
        );
      } catch (e) {
        console.error(`Error parsing face encoding for ${profile.user_id}:`, e);
        return null;
      }
    }).filter(Boolean) as faceapi.LabeledFaceDescriptors[]; // Filter out null values
    
    if (labeledDescriptors.length === 0) {
      console.error('No valid face descriptors found');
      return null;
    }
    
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6); // 0.6 is the matching threshold
    
    // Detect face in the current image
    const img = await faceapi.fetchImage(imageData);
    const detection = await faceapi.detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (!detection) {
      console.error('No face detected in the image');
      return null;
    }
    
    // Try to match with registered faces
    const match = faceMatcher.findBestMatch(detection.descriptor);
    
    if (match.label === 'unknown') {
      console.log('Face not recognized');
      return null;
    }
    
    // Find the matched profile
    const matchedProfile = profiles.find(p => p.user_id === match.label);
    
    if (!matchedProfile) {
      console.error('Matched profile not found');
      return null;
    }
    
    return {
      userId: matchedProfile.user_id,
      name: matchedProfile.name
    };
  } catch (error) {
    console.error('Error recognizing face:', error);
    return null;
  }
};

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
      userId: record.profiles ? record.profiles.user_id : null,
      userName: record.profiles ? record.profiles.name : null,
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
      userId: record.profiles ? record.profiles.user_id : null,
      userName: record.profiles ? record.profiles.name : null,
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
