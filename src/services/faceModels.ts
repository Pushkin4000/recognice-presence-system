
import * as faceapi from 'face-api.js';
import { Database } from '@/types/supabase';

export type FaceDescriptor = Float32Array;

export interface FaceData {
  userId: string;
  userName: string;
  descriptors: FaceDescriptor[];
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: Date;
  timeIn: string;
  timeOut?: string;
  status: 'present' | 'absent' | 'late';
  location: string;
  notes?: string;
}

export type ProfileWithFaceData = Database['public']['Tables']['profiles']['Row'] & {
  face_data: Database['public']['Tables']['face_data']['Row'] | null;
};

export type AttendanceWithProfile = Database['public']['Tables']['attendance']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'];
};
