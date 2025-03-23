import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatCard from "@/components/StatCard";
import AttendanceTable, { AttendanceRecord as AttendanceTableRecord } from "@/components/AttendanceTable";
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
import { getAttendanceSummary, getRecentAttendance, getTodayAttendance } from "@/services/face";

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const [attendanceData, setAttendanceData] = useState<AttendanceTableRecord[]>([]);
  const [todayData, setTodayData] = useState<AttendanceTableRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Get attendance summary
        const summary = await getAttendanceSummary();
        setStats(summary);
        
        // Get recent attendance records
        const recentAttendance = await getRecentAttendance(20);
        setAttendanceData(recentAttendance);
        
        // Get today's attendance records
        const todayAttendance = await getTodayAttendance();
        setTodayData(todayAttendance);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Calculate present percentage
  const presentPercentage = stats.totalEmployees 
    ? Math.round((stats.presentToday / stats.totalEmployees) * 100) 
    : 0;

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
          value={stats.totalEmployees}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Present Today"
          value={`${stats.presentToday} (${presentPercentage}%)`}
          icon={<CheckCircle className="h-4 w-4" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Absent Today"
          value={stats.absentToday}
          icon={<XCircle className="h-4 w-4" />}
        />
        <StatCard
          title="Late Today"
          value={stats.lateToday}
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
              data={attendanceData}
              title="Recent Attendance Records"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
