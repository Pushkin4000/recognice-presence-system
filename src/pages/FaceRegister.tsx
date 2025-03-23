
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { LoaderCircle, User, Camera, CheckCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import FaceDetection from "@/components/FaceDetection";
import { registerFace } from "@/services/faceRegistration";

const FaceRegister = () => {
  const { isAuthenticated, user } = useAuth();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleCapture = (image: string) => {
    setCapturedImage(image);
  };

  const handleReset = () => {
    setCapturedImage(null);
    setIsComplete(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!capturedImage) {
      toast({
        title: "Error",
        description: "Please capture a face image first",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create a temporary image element for processing
      const img = new Image();
      img.src = capturedImage;
      
      // Wait for image to load
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      const userId = user?.id || Math.random().toString(36).substring(2, 9);
      const name = user?.name || "Unknown User";
      
      // Register face in Supabase
      const success = await registerFace(img, userId, name, employeeId, department);
      
      if (success) {
        toast({
          title: "Success",
          description: "Face registered successfully",
        });
        
        setIsComplete(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to register face",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error registering face:", error);
      toast({
        title: "Error",
        description: "Failed to register face",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold tracking-tight">Face Registration</h1>
        <p className="text-muted-foreground">
          Register your face for attendance recognition
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Face Capture</CardTitle>
            <CardDescription>
              Position your face in the center of the frame
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isComplete ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-medium mb-2">Registration Complete</h3>
                <p className="text-center text-muted-foreground mb-6">
                  Your face has been successfully registered for attendance recognition.
                </p>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Register Another Face
                </Button>
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
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Retake Photo
                </Button>
              </div>
            ) : (
              <FaceDetection
                mode="register"
                onCapture={handleCapture}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registration Details</CardTitle>
            <CardDescription>
              Fill in your information for face registration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-xl">
                    {user?.name.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg">{user?.name}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  placeholder="e.g. EMP001"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="e.g. Engineering"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={!capturedImage || isSubmitting || isComplete}
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4" />
                    Register Face
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FaceRegister;
