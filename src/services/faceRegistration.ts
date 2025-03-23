
import * as faceapi from 'face-api.js';
import { supabase } from '@/lib/supabase';
import { detectFace } from './faceRecognition';

// Register face data to database
export const registerFace = async (
  image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  userId: string,
  userName: string,
  employeeId: string,
  department: string
): Promise<boolean> => {
  try {
    // Detect face and get descriptors
    const detections = await detectFace(image);
    
    if (!detections || detections.length === 0) {
      console.error('No face detected for registration');
      return false;
    }

    // Extract descriptors as regular arrays for storage
    const descriptorsArray = detections.map(detection => 
      Array.from(detection.descriptor)
    );

    // Check if user profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Create or update profile
    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          name: userName,
          email: `${userId}@example.com`, // Placeholder
          employee_id: employeeId,
          department: department,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return false;
      }
    }

    // Check if face data exists
    const { data: existingFaceData } = await supabase
      .from('face_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Store face descriptors
    if (existingFaceData) {
      // Update existing face data
      const { error: updateError } = await supabase
        .from('face_data')
        .update({
          descriptors: descriptorsArray,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating face data:', updateError);
        return false;
      }
    } else {
      // Insert new face data
      const { error: insertError } = await supabase
        .from('face_data')
        .insert({
          user_id: userId,
          descriptors: descriptorsArray,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error inserting face data:', insertError);
        return false;
      }
    }

    console.log('Face registered successfully');
    return true;
  } catch (error) {
    console.error('Error registering face:', error);
    return false;
  }
};
