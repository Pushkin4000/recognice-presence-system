
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, X, Calendar, Clock, MapPin, Info } from "lucide-react";

export type AttendanceRecord = {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  date: Date;
  timeIn: string;
  status: "present" | "absent" | "late";
  location?: string;
  notes?: string;
};

interface AttendanceTableProps {
  data: AttendanceRecord[];
  title?: string;
}

const AttendanceTable = ({ data, title }: AttendanceTableProps) => {
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const getStatusBadge = (status: AttendanceRecord["status"]) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-500 hover:bg-green-600">Present</Badge>;
      case "absent":
        return <Badge variant="destructive">Absent</Badge>;
      case "late":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Late</Badge>;
      default:
        return null;
    }
  };

  const handleRowClick = (record: AttendanceRecord) => {
    setSelectedRecord(record);
  };

  return (
    <div className="rounded-md border">
      {title && (
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  No attendance records found
                </TableCell>
              </TableRow>
            ) : (
              data.map((record) => (
                <TableRow 
                  key={record.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(record)}
                >
                  <TableCell>
                    {record.status === "present" ? (
                      <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="h-3 w-3 text-green-500" />
                      </div>
                    ) : record.status === "absent" ? (
                      <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <X className="h-3 w-3 text-red-500" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Clock className="h-3 w-3 text-yellow-500" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={record.userAvatar} alt={record.userName} />
                      <AvatarFallback className="text-xs">
                        {record.userName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{record.userName}</span>
                  </TableCell>
                  <TableCell>{formatDate(record.date)}</TableCell>
                  <TableCell>{record.timeIn}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(record);
                      }}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Attendance Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedRecord.userAvatar} alt={selectedRecord.userName} />
                  <AvatarFallback className="text-lg">
                    {selectedRecord.userName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedRecord.userName}</h3>
                  {getStatusBadge(selectedRecord.status)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(selectedRecord.date)}</span>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedRecord.timeIn}</span>
                </div>
              </div>
              
              {selectedRecord.location && (
                <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedRecord.location}</span>
                </div>
              )}
              
              {selectedRecord.notes && (
                <div className="rounded-md border p-3">
                  <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                  <p className="text-sm">{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceTable;
