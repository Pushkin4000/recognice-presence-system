
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, UserCheck, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import * as faceapi from 'face-api.js';
import { loadModels, detectFace, getAllFaceData, recognizeFace } from "@/services/faceRecognition";

interface FaceDetectionProps {
  mode: "register" | "recognize";
  onCapture?: (image: string) => void;
  onDetection?: (userId: string, userName: string) => void;
  className?: string;
}

const FaceDetection = ({ mode, onCapture, onDetection, className }: FaceDetectionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const initFaceApi = async () => {
      const loaded = await loadModels();
      setModelsLoaded(loaded);
    };

    initFaceApi();
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
          setHasPermission(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasPermission(false);
        toast.error("Camera access denied. Please enable camera permissions.");
      }
    };

    if (modelsLoaded) {
      startCamera();
    }

    return () => {
      // Clean up the video stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [modelsLoaded]);

  // Real face detection
  useEffect(() => {
    if (!isStreaming || !hasPermission || !modelsLoaded) return;
    
    let faceDetectionInterval: number;
    
    const detectFaces = async () => {
      if (!videoRef.current) return;
      
      try {
        const detections = await faceapi
          .detectAllFaces(videoRef.current)
          .withFaceLandmarks();
          
        setFaceDetected(detections.length > 0);
      } catch (error) {
        console.error("Error in face detection:", error);
        setFaceDetected(false);
      }
    };
    
    faceDetectionInterval = window.setInterval(detectFaces, 500);
    
    return () => {
      clearInterval(faceDetectionInterval);
    };
  }, [isStreaming, hasPermission, modelsLoaded]);

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing || !modelsLoaded) return;
    
    setIsProcessing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    if (!context) {
      setIsProcessing(false);
      return;
    }
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to data URL
    const imageData = canvas.toDataURL("image/png");
    
    if (mode === "register" && onCapture) {
      onCapture(imageData);
      toast.success("Face image captured");
      setIsProcessing(false);
    } else if (mode === "recognize" && onDetection) {
      // Process face detection and recognition
      try {
        // Create an image element from the canvas data
        const img = new Image();
        img.src = imageData;
        
        // Wait for image to load
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        
        // Detect face
        const detections = await detectFace(img);
        
        if (!detections || detections.length === 0) {
          toast.error("No face detected");
          setIsProcessing(false);
          return;
        }
        
        // Get all registered face data
        const faceDataList = await getAllFaceData();
        
        if (faceDataList.length === 0) {
          toast.error("No registered faces found in the system");
          setIsProcessing(false);
          return;
        }
        
        // Recognize face
        const recognizedFace = await recognizeFace(detections[0].descriptor, faceDataList);
        
        if (recognizedFace) {
          onDetection(recognizedFace.userId, recognizedFace.userName);
          toast.success(`Recognized: ${recognizedFace.userName}`);
        } else {
          toast.error("Face not recognized");
        }
      } catch (error) {
        console.error("Recognition error:", error);
        toast.error("Recognition failed");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (hasPermission === false) {
    return (
      <Card className={`p-6 flex flex-col items-center justify-center ${className}`}>
        <Camera className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-center text-muted-foreground">
          Camera access is required for face detection.
          <br />
          Please enable camera permissions and reload.
        </p>
      </Card>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border bg-background">
        <div className="aspect-video relative overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`h-full w-full object-cover transition-all duration-300 ${
              faceDetected ? "scale-105" : "scale-100"
            }`}
            style={{ transform: faceDetected ? "scale(1.02)" : "scale(1)" }}
          />
          
          {isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-48 h-48 rounded-full border-2 transition-all duration-300 ${
                  faceDetected
                    ? "border-green-500 border-opacity-70"
                    : "border-white border-opacity-30"
                }`}
              />
            </div>
          )}
          
          {faceDetected && (
            <div className="absolute right-3 top-3 flex h-6 items-center rounded-md bg-green-500/20 px-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
              <span className="ml-1 text-xs font-medium text-green-500">Face Detected</span>
            </div>
          )}
          
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
            </div>
          )}
        </div>
        
        <div className="p-4 flex justify-center">
          <Button
            onClick={captureImage}
            disabled={!faceDetected || isProcessing}
            className="px-4 gap-2"
          >
            {isProcessing ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : mode === "register" ? (
              <Camera className="h-4 w-4" />
            ) : (
              <UserCheck className="h-4 w-4" />
            )}
            {mode === "register" ? "Capture Face" : "Take Attendance"}
          </Button>
        </div>
      </div>
      
      {/* Hidden canvas for capturing images */}
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default FaceDetection;
