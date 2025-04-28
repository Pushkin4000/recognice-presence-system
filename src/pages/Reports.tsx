import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Download, Users, Filter, BarChart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from "recharts";
import AttendanceTable, { AttendanceRecord } from "@/components/AttendanceTable";
import { DateRange } from "react-day-picker";

const generateMockAttendanceData = (days: number): AttendanceRecord[] => {
  const statuses: ("present" | "absent" | "late")[] = ["present", "present", "present", "late", "absent"];
  const names = [
    "Pushkin Ranjan",
    "Pushkin Ranjan",
    "Pushkin Ranjan",
    "Pushkin Ranjan",
    "Pushkin Ranjan",
    "Pushkin Ranjan",
    "Pushkin Ranjan",
    "Pushkin Ranjan",
    "Pushkin Ranjan",
    "Pushkin Ranjan"
  ];

  const result: AttendanceRecord[] = [];

  for (let day = 0; day < days; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);

    for (let i = 0; i < 10; i++) {
      if (Math.random() > 0.9) continue;

      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      result.push({
        id: `attendance-${day}-${i}`,
        userId: `user-${i}`,
        userName: names[i],
        date: new Date(date),
        timeIn: `${Math.floor(Math.random() * 3) + 8}:${Math.floor(Math.random() * 60).toString().padStart(2, "0")} AM`,
        status,
        location: "Main Office",
      });
    }
  }

  return result;
};

const generateChartData = (data: AttendanceRecord[]) => {
  const grouped: Record<string, { date: string; present: number; absent: number; late: number }> = {};

  data.forEach(record => {
    const dateStr = format(record.date, "MMM dd");
    if (!grouped[dateStr]) {
      grouped[dateStr] = { date: dateStr, present: 0, absent: 0, late: 0 };
    }
    
    grouped[dateStr][record.status]++;
  });

  return Object.values(grouped);
};

const Reports = () => {
  const { isAuthenticated } = useAuth();
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = generateMockAttendanceData(30);
      setAttendanceData(mockData);
      setFilteredData(mockData);
      setChartData(generateChartData(mockData));
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (attendanceData.length === 0) return;
    
    let filtered = [...attendanceData];
    
    if (dateRange?.from) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate >= dateRange.from!;
      });
    }
    
    if (dateRange?.to) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate <= dateRange.to!;
      });
    }
    
    if (selectedEmployee !== "all") {
      filtered = filtered.filter(record => record.userId === selectedEmployee);
    }
    
    if (selectedStatus !== "all") {
      filtered = filtered.filter(record => record.status === selectedStatus);
    }
    
    setFilteredData(filtered);
    setChartData(generateChartData(filtered));
  }, [dateRange, selectedEmployee, selectedStatus, attendanceData]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const employees = Array.from(new Set(attendanceData.map(record => record.userId))).map(userId => {
    const record = attendanceData.find(r => r.userId === userId);
    return { id: userId, name: record?.userName || "Unknown" };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold tracking-tight">Attendance Reports</h1>
        <p className="text-muted-foreground">
          View and analyze attendance records
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter attendance data by date, employee, and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Employee</label>
              <Select
                value={selectedEmployee}
                onValueChange={setSelectedEmployee}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button className="gap-2 w-full">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="chart" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chart" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Charts</span>
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Detailed Report</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
              <CardDescription>
                Visualization of attendance trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading chart data...</p>
                  </div>
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Filter className="h-10 w-10 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No data for the selected filters</p>
                  </div>
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="present" name="Present" fill="#10b981" />
                      <Bar dataKey="late" name="Late" fill="#f59e0b" />
                      <Bar dataKey="absent" name="Absent" fill="#ef4444" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Attendance Records</CardTitle>
              <CardDescription>
                Complete list of attendance records based on your filters
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading attendance data...</p>
                  </div>
                </div>
              ) : (
                <AttendanceTable data={filteredData} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
