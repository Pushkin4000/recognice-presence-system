
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatCard from "@/components/StatCard";
import AttendanceTable, { AttendanceRecord } from "@/components/AttendanceTable";
import { useAuth } from "@/hooks/useAuth";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  CalendarClock,
  Building,
  UserCheck,
} from "lucide-react";

// Mock data for the dashboard
const generateMockAttendanceData = (): AttendanceRecord[] => {
  const statuses: ("present" | "absent" | "late")[] = ["present", "present", "present", "late", "absent"];
  const names = [
    "John Smith",
    "Emily Johnson",
    "Michael Brown",
    "Jessica Davis",
    "Daniel Wilson",
    "Sarah Martinez",
    "Robert Taylor",
    "Jennifer Anderson",
    "David Thomas",
    "Lisa Garcia",
  ];

  const locations = [
    "Main Office",
    "West Wing",
    "East Building",
    "Conference Room",
    "Training Center",
  ];

  return Array.from({ length: 20 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      id: `attendance-${i}`,
      userId: `user-${i % 10}`,
      userName: names[i % names.length],
      date: date,
      timeIn: `${Math.floor(Math.random() * 3) + 8}:${Math.floor(Math.random() * 60).toString().padStart(2, "0")} AM`,
      status: randomStatus,
      location: locations[Math.floor(Math.random() * locations.length)],
      notes: randomStatus === "late" ? "Traffic delay" : undefined,
    };
  });
};

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [todayData, setTodayData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = generateMockAttendanceData();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayRecords = mockData.filter(record => {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === today.getTime();
      });
      
      setAttendanceData(mockData);
      setTodayData(todayRecords);
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Calculate statistics
  const totalEmployees = 10;
  const presentToday = todayData.filter(record => record.status === "present").length;
  const absentToday = todayData.filter(record => record.status === "absent").length;
  const lateToday = todayData.filter(record => record.status === "late").length;
  const presentPercentage = totalEmployees ? Math.round((presentToday / totalEmployees) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={totalEmployees}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Present Today"
          value={`${presentToday} (${presentPercentage}%)`}
          icon={<CheckCircle className="h-4 w-4" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Absent Today"
          value={absentToday}
          icon={<XCircle className="h-4 w-4" />}
        />
        <StatCard
          title="Late Today"
          value={lateToday}
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            <span>Today</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span>Recent Attendance</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="h-48 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading today's data...</p>
                </div>
              </CardContent>
            </Card>
          ) : todayData.length === 0 ? (
            <Card>
              <CardContent className="h-48 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Building className="h-10 w-10 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No attendance records for today</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <AttendanceTable data={todayData} title="Today's Attendance" />
          )}
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="h-48 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading attendance data...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <AttendanceTable
              data={attendanceData.sort((a, b) => b.date.getTime() - a.date.getTime())}
              title="Recent Attendance Records"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
