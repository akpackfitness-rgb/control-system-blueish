import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  LogIn,
  LogOut,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAttendance, useMembers } from "../../hooks/useGymData";

function getTodayIST(): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

function parseHour(timeStr: string): number {
  // e.g. "6:30 AM", "11:00 PM"
  if (!timeStr) return -1;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return -1;
  let hour = Number.parseInt(match[1], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return hour;
}

const HOUR_SLOTS = [
  { label: "6AM", hour: 6 },
  { label: "7AM", hour: 7 },
  { label: "8AM", hour: 8 },
  { label: "9AM", hour: 9 },
  { label: "10AM", hour: 10 },
  { label: "11AM", hour: 11 },
  { label: "12PM", hour: 12 },
  { label: "1PM", hour: 13 },
  { label: "2PM", hour: 14 },
  { label: "3PM", hour: 15 },
  { label: "4PM", hour: 16 },
  { label: "5PM", hour: 17 },
  { label: "6PM", hour: 18 },
  { label: "7PM", hour: 19 },
  { label: "8PM", hour: 20 },
  { label: "9PM", hour: 21 },
  { label: "10PM", hour: 22 },
];

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getDayLabel(dateStr: string): string {
  // dateStr format: "21 Mar 2026"
  try {
    const d = new Date(dateStr);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[d.getDay()];
  } catch {
    return "";
  }
}

export default function DashboardPage() {
  const { data: members = [], isLoading: membersLoading } = useMembers();
  const { data: attendance = [], isLoading: attendanceLoading } =
    useAttendance();

  const isLoading = membersLoading || attendanceLoading;
  const todayIST = getTodayIST();

  // Today attendance
  const todayRecords = attendance.filter((a) => a.date === todayIST);
  const todayCheckIns = todayRecords.filter(
    (a) => a.checkInTime && a.checkInTime !== "-",
  ).length;
  const todayCheckOuts = todayRecords.filter(
    (a) => a.checkOutTime && a.checkOutTime !== "-",
  ).length;
  const currentlyInside = todayRecords.filter(
    (a) =>
      a.checkInTime &&
      a.checkInTime !== "-" &&
      (!a.checkOutTime || a.checkOutTime === "-"),
  ).length;

  // Member stats
  const activeMembers = members.filter((m) => m.status === "active").length;
  const expiringMembers = members.filter((m) => m.status === "expiring").length;
  const expiredMembers = members.filter((m) => m.status === "expired").length;

  const statsCards = [
    {
      label: "Today Check Ins",
      value: isLoading ? null : String(todayCheckIns),
      icon: LogIn,
      color: "text-cyan",
      bg: "bg-cyan/10",
    },
    {
      label: "Today Check Outs",
      value: isLoading ? null : String(todayCheckOuts),
      icon: LogOut,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Currently Inside",
      value: isLoading ? null : String(currentlyInside),
      icon: UserCheck,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Active Members",
      value: isLoading ? null : String(activeMembers),
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Expiring Soon",
      value: isLoading ? null : String(expiringMembers),
      icon: AlertTriangle,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Expired",
      value: isLoading ? null : String(expiredMembers),
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
  ];

  // Weekly chart: group by day label
  const weeklyMap: Record<string, number> = {};
  for (const day of WEEK_DAYS) weeklyMap[day] = 0;
  for (const rec of attendance) {
    const day = getDayLabel(rec.date);
    if (day && weeklyMap[day] !== undefined) {
      weeklyMap[day]++;
    }
  }
  const weeklyData = WEEK_DAYS.map((day) => ({
    day,
    checkins: weeklyMap[day],
  }));

  // Peak hours chart
  const hourMap: Record<number, number> = {};
  for (const { hour } of HOUR_SLOTS) hourMap[hour] = 0;
  for (const rec of attendance) {
    const h = parseHour(rec.checkInTime);
    if (h !== -1 && hourMap[h] !== undefined) {
      hourMap[h]++;
    }
  }
  const peakHoursData = HOUR_SLOTS.map(({ label, hour }) => ({
    hour: label,
    count: hourMap[hour],
  }));

  return (
    <div className="p-4 md:p-6 space-y-6" data-ocid="dashboard.page">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of gym activity
        </p>
      </div>

      {/* Stats Grid */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
        data-ocid="dashboard.stats.section"
      >
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="glass-card rounded-2xl p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {card.label}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}
                >
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              {card.value === null ? (
                <Skeleton className="h-9 w-16 rounded" />
              ) : (
                <p className={`text-3xl font-display font-bold ${card.color}`}>
                  {card.value}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div
        className="grid grid-cols-1 xl:grid-cols-2 gap-4"
        data-ocid="dashboard.charts.section"
      >
        {/* Weekly Attendance */}
        <div className="glass-card rounded-2xl p-4 mb-3">
          <h2 className="font-display font-semibold text-sm mb-4">
            Weekly Attendance
          </h2>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart
              data={weeklyData}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(1 0 0 / 0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fill: "oklch(0.55 0.02 90)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "oklch(0.55 0.02 90)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.14 0.04 265)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
                labelStyle={{ color: "oklch(0.93 0.01 90)" }}
                cursor={{ fill: "oklch(1 0 0 / 0.04)" }}
              />
              <Bar
                dataKey="checkins"
                fill="oklch(0.72 0.15 200)"
                radius={[4, 4, 0, 0]}
                name="Check Ins"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Hours */}
        <div className="glass-card rounded-2xl p-4 mb-3">
          <h2 className="font-display font-semibold text-sm mb-4">
            Peak Gym Hours
          </h2>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart
              data={peakHoursData}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(1 0 0 / 0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="hour"
                tick={{ fill: "oklch(0.55 0.02 90)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fill: "oklch(0.55 0.02 90)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.14 0.04 265)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
                labelStyle={{ color: "oklch(0.93 0.01 90)" }}
                cursor={{ fill: "oklch(1 0 0 / 0.04)" }}
              />
              <Bar
                dataKey="count"
                fill="oklch(0.72 0.18 145)"
                radius={[4, 4, 0, 0]}
                name="Members"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
