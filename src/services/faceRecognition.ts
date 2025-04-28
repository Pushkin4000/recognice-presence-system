
import * as faceapi from 'face-api.js';

// Path to models directory (relative to public)
const MODEL_URL = '/models';

// Face matching threshold - lower values are more strict
export const FACE_MATCH_THRESHOLD = 0.6;

// Initialize face-api.js models
export const loadModels = async () => {
  try {
    console.log('Loading face-api models from:', MODEL_URL);
    
    // Create a test request to see if models exist
    try {
      const testRequest = await fetch(`${MODEL_URL}/ssd_mobilenetv1_model-weights_manifest.json`);
      if (!testRequest.ok) {
        throw new Error(`Models not found (status: ${testRequest.status})`);
      }
      console.log('Model manifests exist, proceeding with loading');
    } catch (error) {
      console.error('Error checking for models:', error);
      throw new Error('Face model files not found. Please follow the setup instructions in README.md');
    }
    
    // Continue with loading models
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    
    console.log('Face-api models loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading face-api models:', error);
    return false;
  }
};

// Get face descriptor from an image element
export const getFaceDescriptor = async (imageElement: HTMLImageElement | HTMLVideoElement): Promise<Float32Array | null> => {
  try {
    const detections = await faceapi
      .detectSingleFace(imageElement)
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (!detections) {
      return null;
    }
    
    return detections.descriptor;
  } catch (error) {
    console.error('Error getting face descriptor:', error);
    return null;
  }
};

// Compare two face descriptors and return the distance (lower is more similar)
export const compareFaceDescriptors = (
  descriptor1: Float32Array,
  descriptor2: Float32Array | string
): number => {
  // If descriptor2 is a string (from database), convert it to Float32Array
  const descriptor2Array = typeof descriptor2 === 'string' 
    ? new Float32Array(JSON.parse(descriptor2))
    : descriptor2;
  
  return faceapi.euclideanDistance(descriptor1, descriptor2Array);
};

// Check if two faces match based on threshold
export const doFacesMatch = (
  descriptor1: Float32Array,
  descriptor2: Float32Array | string
): boolean => {
  const distance = compareFaceDescriptors(descriptor1, descriptor2);
  return distance < FACE_MATCH_THRESHOLD;
};

// Convert Float32Array to string for storage
export const descriptorToString = (descriptor: Float32Array): string => {
  return JSON.stringify(Array.from(descriptor));
};
