
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { loadModels, getFaceDescriptor } from '@/services/faceRecognition';

interface UseFaceRecognitionOptions {
  autoLoadModels?: boolean;
}

export const useFaceRecognition = (options: UseFaceRecognitionOptions = {}) => {
  const { autoLoadModels = true } = options;
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Automatically load models if requested
  useEffect(() => {
    if (autoLoadModels) {
      initModels();
    }
  }, [autoLoadModels]);

  const initModels = async () => {
    if (isModelsLoaded) return true;
    
    setIsModelLoading(true);
    const success = await loadModels();
    setIsModelsLoaded(success);
    setIsModelLoading(false);
    
    if (!success) {
      toast.error("Failed to load face recognition models");
    }
    
    return success;
  };

  const processFace = async (imageElement: HTMLImageElement | HTMLVideoElement) => {
    if (!isModelsLoaded) {
      const success = await initModels();
      if (!success) return null;
    }
    
    setIsProcessing(true);
    try {
      const descriptor = await getFaceDescriptor(imageElement);
      return descriptor;
    } catch (error) {
      console.error("Error processing face:", error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isModelLoading,
    isModelsLoaded,
    isProcessing,
    initModels,
    processFace,
  };
};
