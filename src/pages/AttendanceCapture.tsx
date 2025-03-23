import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import FaceDetection from "@/components/FaceDetection";
import { Clock, MapPin, CheckCircle, RefreshCw, Calendar } from "lucide-react";
import { recordAttendance } from "@/services/attendanceService";

const AttendanceCapture = () => {
  const { isAuthenticated, user } = useAuth();
  const [detected, setDetected] = useState(false);
  const [recognizedName, setRecognizedName] = useState("");
  const [recognizedUserId, setRecognizedUserId] = useState("");
  const [captureTime, setCaptureTime] = useState("");
  const [attendanceRecord, setAttendanceRecord] = useState<any>(null);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePersonDetected = async (userId: string, name: string) => {
    setRecognizedUserId(userId);
    setRecognizedName(name);
    const now = new Date();
    setCaptureTime(formatTime(now));
    
    // Record attendance in Supabase
    const record = await recordAttendance(userId, name, "Main Office, Building A");
    
    if (record) {
      setAttendanceRecord(record);
      setDetected(true);
      toast.success(`Attendance recorded for ${name}`);
    } else {
      toast.error("Failed to record attendance");
    }
  };

  const handleReset = () => {
    setDetected(false);
    setRecognizedName("");
    setRecognizedUserId("");
    setCaptureTime("");
    setAttendanceRecord(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold tracking-tight">Take Attendance</h1>
        <p className="text-muted-foreground">
          Capture attendance using facial recognition
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Face Recognition</CardTitle>
            <CardDescription>
              Position your face in the center of the frame
            </CardDescription>
          </CardHeader>
          <CardContent>
            {detected ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-medium mb-2">Attendance Recorded</h3>
                <p className="text-center text-muted-foreground mb-6">
                  Your attendance has been successfully captured.
                </p>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Capture Another
                </Button>
              </div>
            ) : (
              <FaceDetection
                mode="recognize"
                onDetection={handlePersonDetected}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Details</CardTitle>
            <CardDescription>
              {detected
                ? "Attendance recorded successfully"
                : "Waiting for face recognition..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {detected ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xl">
                      {recognizedName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-lg">{recognizedName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Recognized Employee
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(new Date())}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">{captureTime}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      Main Office, Building A
                    </p>
                  </div>
                </div>

                <Card className="bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-400">
                        Successfully Recorded
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-500">
                        Attendance has been recorded for today
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="h-16 w-16 rounded-full border-4 border-muted border-t-primary animate-spin mb-4"></div>
                <p className="text-muted-foreground text-center">
                  Waiting for face recognition...
                  <br />
                  Please position your face in the camera.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceCapture;
