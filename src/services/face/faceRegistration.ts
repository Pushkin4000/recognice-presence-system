
import { supabase } from '@/lib/supabase';
import { createFaceDescriptor } from './faceRecognition';

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
