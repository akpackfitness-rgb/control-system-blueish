export type MemberStatus = "active" | "expiring" | "expired";

export interface Member {
  id: string;
  clientNo: string;
  membershipId: string;
  name: string;
  package: string;
  validityDate: string;
  phone: string;
  status: MemberStatus;
}

export interface AttendanceRecord {
  id: string;
  clientName: string;
  membershipId: string;
  checkInTime: string;
  checkOutTime: string;
  package: string;
  validity: string;
  status: MemberStatus;
}

export const mockMembers: Member[] = [
  {
    id: "1",
    clientNo: "C001",
    membershipId: "1",
    name: "Arjun Sharma",
    package: "Premium Monthly",
    validityDate: "2026-04-15",
    phone: "9876543210",
    status: "active",
  },
  {
    id: "2",
    clientNo: "C002",
    membershipId: "2",
    name: "Priya Patel",
    package: "Basic Monthly",
    validityDate: "2026-03-23",
    phone: "8765432109",
    status: "expiring",
  },
  {
    id: "3",
    clientNo: "C003",
    membershipId: "3",
    name: "Rahul Verma",
    package: "Quarterly Pack",
    validityDate: "2026-06-30",
    phone: "7654321098",
    status: "active",
  },
  {
    id: "4",
    clientNo: "C004",
    membershipId: "4",
    name: "Sneha Reddy",
    package: "Annual Pack",
    validityDate: "2026-01-10",
    phone: "6543210987",
    status: "expired",
  },
];

export const mockAttendance: AttendanceRecord[] = [
  {
    id: "1",
    clientName: "Arjun Sharma",
    membershipId: "1",
    checkInTime: "6:30 AM",
    checkOutTime: "8:00 AM",
    package: "Premium Monthly",
    validity: "15 Apr 2026",
    status: "active",
  },
  {
    id: "2",
    clientName: "Priya Patel",
    membershipId: "2",
    checkInTime: "7:15 AM",
    checkOutTime: "-",
    package: "Basic Monthly",
    validity: "23 Mar 2026",
    status: "expiring",
  },
];

export const weeklyData = [
  { day: "Mon", checkins: 0 },
  { day: "Tue", checkins: 0 },
  { day: "Wed", checkins: 0 },
  { day: "Thu", checkins: 0 },
  { day: "Fri", checkins: 0 },
  { day: "Sat", checkins: 0 },
  { day: "Sun", checkins: 0 },
];

export const peakHoursData = [
  { hour: "6AM", count: 0 },
  { hour: "7AM", count: 0 },
  { hour: "8AM", count: 0 },
  { hour: "9AM", count: 0 },
  { hour: "10AM", count: 0 },
  { hour: "11AM", count: 0 },
  { hour: "12PM", count: 0 },
  { hour: "1PM", count: 0 },
  { hour: "2PM", count: 0 },
  { hour: "3PM", count: 0 },
  { hour: "4PM", count: 0 },
  { hour: "5PM", count: 0 },
  { hour: "6PM", count: 0 },
  { hour: "7PM", count: 0 },
  { hour: "8PM", count: 0 },
  { hour: "9PM", count: 0 },
  { hour: "10PM", count: 0 },
];
