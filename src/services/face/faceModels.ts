
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
