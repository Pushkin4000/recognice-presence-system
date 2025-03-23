
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, UserCheck, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

interface FaceDetectionProps {
  mode: "register" | "recognize";
  onCapture?: (image: string) => void;
  onDetection?: (name: string) => void;
  className?: string;
}

// This is a mock function to simulate face recognition
// In a real app, you would use a library like face-api.js or tensorflow.js
const mockRecognizeFace = (image: string): Promise<string | null> => {
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      // In a real app, this would return the recognized person's name or null
      // For demo, return a random result
      const mockNames = ["John Doe", "Jane Smith", "Robert Johnson"];
      const randomSuccess = Math.random() > 0.3; // 70% success rate
      
      if (randomSuccess) {
        const randomIndex = Math.floor(Math.random() * mockNames.length);
        resolve(mockNames[randomIndex]);
      } else {
        resolve(null);
      }
    }, 1500);
  });
};

const FaceDetection = ({ mode, onCapture, onDetection, className }: FaceDetectionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);

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

    startCamera();

    return () => {
      // Clean up the video stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  // Simulate face detection
  useEffect(() => {
    if (!isStreaming || !hasPermission) return;
    
    let faceDetectionInterval: number;
    
    // In a real app, this would use a face detection library
    // We're simulating face detection for demo purposes
    const simulateFaceDetection = () => {
      // Random detection with higher probability of success (80%)
      const detected = Math.random() > 0.2;
      setFaceDetected(detected);
    };
    
    faceDetectionInterval = window.setInterval(simulateFaceDetection, 500);
    
    return () => {
      clearInterval(faceDetectionInterval);
    };
  }, [isStreaming, hasPermission]);

  const captureImage = () => {
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
    const imageData = canvas.toDataURL("image/png");
    
    if (mode === "register" && onCapture) {
      onCapture(imageData);
      toast.success("Face image captured");
      setIsProcessing(false);
    } else if (mode === "recognize") {
      // Simulate face recognition
      mockRecognizeFace(imageData)
        .then((name) => {
          if (name && onDetection) {
            onDetection(name);
            toast.success(`Recognized: ${name}`);
          } else {
            toast.error("Face not recognized");
          }
          setIsProcessing(false);
        })
        .catch((error) => {
          console.error("Recognition error:", error);
          toast.error("Recognition failed");
          setIsProcessing(false);
        });
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
