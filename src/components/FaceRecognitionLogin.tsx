import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoaderCircle, User, Camera } from "lucide-react";
import { toast } from "sonner";
import FaceDetection from "@/components/FaceDetection";
import { useAuth } from "@/hooks/useAuth";
import { getFaceDescriptor, loadModels } from "@/services/faceRecognition";
import { supabase } from "@/lib/supabase";

interface FaceRecognitionLoginProps {
  onSwitchToPassword: () => void;
}

const FaceRecognitionLogin = ({ onSwitchToPassword }: FaceRecognitionLoginProps) => {
  const { loginWithFace } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Load face-api models on component mount
  useEffect(() => {
    const initModels = async () => {
      setIsModelLoading(true);
      const success = await loadModels();
      setIsModelLoading(success ? false : true);
      if (!success) {
        toast.error("Failed to load face recognition models");
      }
    };
    
    initModels();
  }, []);
  
  const handleCapture = (image: string) => {
    setCapturedImage(image);
    processLogin(image);
  };

  const processLogin = async (image: string) => {
    setIsLoading(true);
    
    try {
      // Create an image element from the captured image
      const img = new Image();
      img.src = image;
      
      // Wait for image to load
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      // Get face descriptor
      const faceDescriptor = await getFaceDescriptor(img);
      
      if (!faceDescriptor) {
        toast.error("No face detected. Please try again.");
        setIsLoading(false);
        setCapturedImage(null);
        return;
      }
      
      // Always use the UUID from Supabase Auth (Supabase v2)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('User must be signed in');
      const userId = user.id;

      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
        throw new Error(`Invalid UUID: ${userId}`);
      }

      // Example fetch using user_id
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('employee_id, department, notes')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('Supabase error:', {
          message: fetchError.message,
          code: fetchError.code,
          details: fetchError.details,
          full: fetchError
        });
        toast.error("Failed to fetch profile.");
        return;
      }
      
      // Try to login with the face
      await loginWithFace(faceDescriptor);

      // Update
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ face_descriptor: faceDescriptor })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Supabase error:', {
          message: updateError.message,
          code: updateError.code,
          details: updateError.details,
          full: updateError
        });
        toast.success("Face uploaded successfully", {
          style: {
            backgroundColor: '#4CAF50',
            color: 'white'
          }
        });
      } else {
        toast.success("Face uploaded: Your face template has been uploaded successfully." );
      }
    } catch (error) {
      toast.error("Face login failed. Please try again.");
      console.error("Face login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle>Face Login</CardTitle>
        <CardDescription>
          Login with your face
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isModelLoading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-center text-sm text-muted-foreground">
              Loading face recognition models...
            </p>
          </div>
        ) : capturedImage ? (
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-md overflow-hidden rounded-xl border mb-4">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={capturedImage}
                  alt="Captured face"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            {isLoading ? (
              <Button disabled className="gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Verifying...
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleReset}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
                Try Again
              </Button>
            )}
          </div>
        ) : (
          <FaceDetection
            mode="recognize"
            onCapture={handleCapture}
          />
        )}
        
        <div className="flex flex-col space-y-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>
          <Button 
            variant="outline" 
            type="button" 
            onClick={onSwitchToPassword}
            disabled={isLoading}
            className="gap-2"
          >
            <User className="h-4 w-4" />
            Login with Password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FaceRecognitionLogin;

function isValidUUID(uuid) {
  return /^[0-9a-fA-F-]{36}$/.test(uuid);
}
