
import * as faceapi from 'face-api.js';
import { supabase } from '@/lib/supabase';
import { loadFaceApiModels } from './faceModels';

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
