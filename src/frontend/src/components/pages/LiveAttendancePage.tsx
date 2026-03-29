import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, RefreshCw, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { MemberStatus } from "../../data/mockData";
import { useAttendance } from "../../hooks/useGymData";
import type { GymAttendance } from "../../hooks/useGymData";

function StatusDot({ status }: { status: MemberStatus }) {
  const map: Record<MemberStatus, string> = {
    active: "bg-success",
    expiring: "bg-warning",
    expired: "bg-destructive",
  };
  return (
    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${map[status]}`} />
  );
}

function StatusPill({ status }: { status: MemberStatus }) {
  const map: Record<MemberStatus, { label: string; className: string }> = {
    active: {
      label: "Active",
      className: "bg-success/15 text-success border-success/25",
    },
    expiring: {
      label: "Expiring",
      className: "bg-warning/15 text-warning border-warning/25",
    },
    expired: {
      label: "Expired",
      className: "bg-destructive/15 text-destructive border-destructive/25",
    },
  };
  const { label, className } = map[status];
  return (
    <Badge
      variant="outline"
      className={`text-[10px] px-1.5 py-0 h-5 ${className}`}
    >
      {label}
    </Badge>
  );
}

function AttendanceRow({ rec, idx }: { rec: GymAttendance; idx: number }) {
  return (
    <div
      className="flex items-center gap-3 py-2.5 px-4 hover:bg-white/[0.025] transition-colors border-b border-border/20 last:border-0"
      data-ocid={`attendance.item.${idx + 1}`}
    >
      <StatusDot status={rec.status} />

      {/* Name */}
      <span
        className="font-medium text-sm min-w-0 truncate flex-[2]"
        title={rec.clientName}
      >
        {rec.clientName}
      </span>

      {/* ID */}
      <span className="font-mono text-xs text-muted-foreground w-14 flex-shrink-0 hidden sm:block">
        #{rec.membershipId}
      </span>

      {/* Check-in time */}
      <span className="text-xs text-foreground/70 flex-1 flex-shrink-0">
        {rec.checkInTime}
      </span>

      {/* Check-out time */}
      <span className="text-xs text-muted-foreground flex-1 flex-shrink-0">
        {rec.checkOutTime && rec.checkOutTime !== "-" ? (
          rec.checkOutTime
        ) : (
          <span className="text-border">—</span>
        )}
      </span>

      {/* Status pill */}
      <StatusPill status={rec.status} />
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2.5 px-4 border-b border-border/20">
      <Skeleton className="w-2 h-2 rounded-full flex-shrink-0" />
      <Skeleton className="h-4 flex-[2] rounded" />
      <Skeleton className="h-4 w-14 rounded hidden sm:block" />
      <Skeleton className="h-4 flex-1 rounded" />
      <Skeleton className="h-4 flex-1 rounded" />
      <Skeleton className="h-5 w-16 rounded" />
    </div>
  );
}

export default function LiveAttendancePage() {
  const {
    data: attendance = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useAttendance();

  const lastRefresh = new Date();

  const formatRefresh = (d: Date) =>
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(d);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast.success("Live feed URL copied to clipboard!");
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-5" data-ocid="attendance.page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Live Attendance Feed
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Last updated: {formatRefresh(lastRefresh)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className="bg-success/10 text-success border-success/30"
            data-ocid="attendance.autofresh.toggle"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5 inline-block animate-pulse" />
            Auto-refresh 30s
          </Badge>
          <Button
            data-ocid="attendance.refresh.secondary_button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-border h-7 text-xs"
          >
            <RefreshCw
              className={`w-3 h-3 mr-1.5 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            data-ocid="attendance.share.secondary_button"
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="border-primary/50 text-primary hover:bg-primary/10 h-7 text-xs"
          >
            <Share2 className="w-3 h-3 mr-1.5" />
            Share
          </Button>
        </div>
      </div>

      {/* List container */}
      <div
        className="glass-card rounded-2xl overflow-hidden"
        data-ocid="attendance.table"
      >
        {/* Column headers */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border/40 bg-white/[0.02]">
          <span className="w-2 flex-shrink-0" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex-[2]">
            Client Name
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-14 flex-shrink-0 hidden sm:block">
            ID
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex-1">
            Check In
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex-1">
            Check Out
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-16 flex-shrink-0">
            Status
          </span>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div data-ocid="attendance.loading_state">
            {Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
              <RowSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div
            className="py-12 flex flex-col items-center gap-2 text-muted-foreground"
            data-ocid="attendance.error_state"
          >
            <p className="text-destructive font-medium">
              Failed to load attendance
            </p>
            <p className="text-sm">Try refreshing</p>
          </div>
        )}

        {/* Rows */}
        {!isLoading && !error && attendance.length === 0 ? (
          <div
            className="py-16 flex flex-col items-center gap-2 text-muted-foreground"
            data-ocid="attendance.empty_state"
          >
            <Activity className="w-8 h-8 opacity-30" />
            <p className="font-medium">No attendance records</p>
            <p className="text-sm">Check-ins will appear here automatically</p>
          </div>
        ) : (
          !isLoading &&
          !error &&
          attendance.map((rec, idx) => (
            <AttendanceRow
              key={`${rec.membershipId}-${rec.date}-${rec.checkInTime}`}
              rec={rec}
              idx={idx}
            />
          ))
        )}
      </div>
    </div>
  );
}
