
import * as faceapi from 'face-api.js';
import { supabase } from '@/lib/supabase';
import { FaceDescriptor, FaceData } from './faceModels';

// Load face-api models
export const loadModels = async () => {
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models')
    ]);
    console.log('Face models loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading face-api models:', error);
    return false;
  }
};

// Detect face and get descriptors from image
export const detectFace = async (image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>>[] | null> => {
  try {
    const detections = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();
    
    if (detections.length === 0) {
      console.log('No face detected');
      return null;
    }

    return detections;
  } catch (error) {
    console.error('Error detecting face:', error);
    return null;
  }
};

// Get all registered face data from database
export const getAllFaceData = async (): Promise<FaceData[]> => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        *,
        face_data(*)
      `);
    
    if (error) {
      console.error('Error fetching face data:', error);
      return [];
    }

    if (!profiles || profiles.length === 0) {
      console.log('No face data found');
      return [];
    }

    const faceData: FaceData[] = profiles
      .filter(profile => profile.face_data)
      .map(profile => {
        const descriptorsArray = profile.face_data?.descriptors as number[][] || [];
        return {
          userId: profile.user_id,
          userName: profile.name,
          descriptors: descriptorsArray.map(arr => new Float32Array(arr))
        };
      });

    return faceData;
  } catch (error) {
    console.error('Error processing face data:', error);
    return [];
  }
};

// Recognize face from descriptors
export const recognizeFace = async (
  faceDescriptor: Float32Array,
  faceDataList: FaceData[]
): Promise<{ userId: string; userName: string } | null> => {
  try {
    if (faceDataList.length === 0) {
      console.log('No face data to compare with');
      return null;
    }

    const labeledDescriptors = faceDataList.map(
      faceData => new faceapi.LabeledFaceDescriptors(
        faceData.userId,
        faceData.descriptors
      )
    );

    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
    const match = faceMatcher.findBestMatch(faceDescriptor);

    if (match.label === 'unknown') {
      console.log('Face not recognized');
      return null;
    }

    const matchedFaceData = faceDataList.find(data => data.userId === match.label);
    if (!matchedFaceData) {
      console.log('Matched face data not found');
      return null;
    }

    return {
      userId: matchedFaceData.userId,
      userName: matchedFaceData.userName
    };
  } catch (error) {
    console.error('Error recognizing face:', error);
    return null;
  }
};
