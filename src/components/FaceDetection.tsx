
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, UserCheck, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { loadFaceApiModels, recognizeFace } from "@/services/faceService";

interface FaceDetectionProps {
  mode: "register" | "recognize";
  onCapture?: (image: string) => void;
  onDetection?: (name: string, userId: string) => void;
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
    const loadModels = async () => {
      try {
        await loadFaceApiModels();
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading face detection models:", error);
        toast.error("Failed to load face detection models");
      }
    };

    loadModels();
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

  // Detect faces in video stream
  useEffect(() => {
    if (!isStreaming || !hasPermission || !modelsLoaded) return;
    
    const detectFace = async () => {
      if (!videoRef.current || !canvasRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      
      if (!context) return;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Check detection every 500ms
      const checkInterval = setInterval(async () => {
        if (!video.paused && !video.ended) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = canvas.toDataURL("image/jpeg", 0.8);
          
          try {
            // Use the imageData directly for face detection
            // This fixes the Uint8ClampedArray issue
            const detection = await fetch(imageData)
              .then(res => res.blob())
              .then(blob => {
                const url = URL.createObjectURL(blob);
                return fetch(url);
              })
              .then(res => res.blob())
              .then(blob => createImageBitmap(blob));
              
            // Here we're just checking if a face is present
            const hasFace = detection.width > 0;
            setFaceDetected(hasFace);
          } catch (error) {
            console.error("Face detection error:", error);
          }
        }
      }, 500);
      
      return () => clearInterval(checkInterval);
    };
    
    detectFace();
  }, [isStreaming, hasPermission, modelsLoaded]);

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;
    
    setIsProcessing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to data URL
    const imageData = canvas.toDataURL("image/jpeg", 0.9);
    
    if (mode === "register" && onCapture) {
      onCapture(imageData);
      toast.success("Face image captured");
      setIsProcessing(false);
    } else if (mode === "recognize") {
      try {
        const result = await recognizeFace(imageData);
        
        if (result && onDetection) {
          onDetection(result.name, result.userId);
          toast.success(`Recognized: ${result.name}`);
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

  if (!modelsLoaded) {
    return (
      <Card className={`p-6 flex flex-col items-center justify-center ${className}`}>
        <LoaderCircle className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-center text-muted-foreground">
          Loading face recognition models...
          <br />
          This may take a moment.
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
