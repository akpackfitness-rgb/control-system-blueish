import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { LogIn, Search, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { MemberStatus } from "../../data/mockData";
import { useActor } from "../../hooks/useActor";
import { useMembers } from "../../hooks/useGymData";
import type { GymMember } from "../../hooks/useGymData";

function StatusDot({ status }: { status: MemberStatus }) {
  const map: Record<MemberStatus, string> = {
    active: "bg-success",
    expiring: "bg-warning",
    expired: "bg-destructive",
  };
  return (
    <span className={`w-2 h-2 rounded-full ${map[status]} flex-shrink-0`} />
  );
}

function StatusBadge({ status }: { status: MemberStatus }) {
  const map: Record<MemberStatus, { label: string; text: string }> = {
    active: { label: "Active", text: "text-success" },
    expiring: { label: "Expiring", text: "text-warning" },
    expired: { label: "Expired", text: "text-destructive" },
  };
  const s = map[status];
  return (
    <span
      className={`text-[10px] font-semibold uppercase tracking-wide ${s.text}`}
    >
      {s.label}
    </span>
  );
}

function MemberCard({ member, index }: { member: GymMember; index: number }) {
  const { actor } = useActor();

  const handleCheckIn = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!actor) return;
    try {
      const result = await actor.checkIn(member.membershipId);
      toast.success(result || `${member.clientName} checked in!`);
    } catch {
      toast.error(`Failed to check in ${member.clientName}`);
    }
  };

  const initials = member.clientName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <div
      className="glass-card rounded-xl p-3 flex flex-col items-center gap-2 hover:border-primary/30 transition-colors text-center"
      style={{ minHeight: "140px" }}
      data-ocid={`members.item.${index}`}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
        <span className="font-bold text-xs text-primary font-mono">
          {initials}
        </span>
      </div>

      {/* Name + ID */}
      <div className="flex-1 min-w-0 w-full">
        <p
          className="font-semibold text-sm leading-tight truncate"
          title={member.clientName}
        >
          {member.clientName}
        </p>
        <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
          #{member.membershipId}
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-1.5">
        <StatusDot status={member.status} />
        <StatusBadge status={member.status} />
      </div>

      {/* Check-in button */}
      <Button
        data-ocid={`members.checkin.button.${index}`}
        variant="ghost"
        size="sm"
        className="w-full h-7 text-[11px] border border-primary/30 text-primary hover:bg-primary/10 rounded-lg px-2"
        onClick={handleCheckIn}
        disabled={member.status === "expired"}
      >
        <LogIn className="w-3 h-3 mr-1" />
        Check In
      </Button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="glass-card rounded-xl p-3 flex flex-col items-center gap-2"
      style={{ minHeight: "140px" }}
    >
      <Skeleton className="w-10 h-10 rounded-full mt-1" />
      <Skeleton className="w-3/4 h-4 rounded" />
      <Skeleton className="w-1/2 h-3 rounded" />
      <Skeleton className="w-full h-7 rounded-lg" />
    </div>
  );
}

export default function MembersPage() {
  const [query, setQuery] = useState("");
  const { data: members = [], isLoading, error } = useMembers();

  const filtered = members.filter(
    (m) =>
      query.trim() === "" ||
      m.clientName.toLowerCase().includes(query.toLowerCase()) ||
      m.membershipId.includes(query.trim()),
  );

  return (
    <div className="p-4 md:p-6 space-y-5" data-ocid="members.page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Members</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isLoading ? "Loading..." : `${members.length} total members`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-ocid="members.search_input"
          placeholder="Search by name or Membership ID..."
          className="pl-9 bg-input border-border"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Error state */}
      {error && (
        <div
          className="glass-card rounded-2xl p-6 text-center"
          data-ocid="members.error_state"
        >
          <p className="text-destructive font-medium">Failed to load members</p>
          <p className="text-sm text-muted-foreground mt-1">
            Check your connection and try again
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Cards grid */}
      {!isLoading &&
        !error &&
        (filtered.length === 0 ? (
          <div
            className="glass-card rounded-2xl p-12 text-center"
            data-ocid="members.empty_state"
          >
            <User className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="font-medium text-muted-foreground">
              No members found
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Try a different search
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
            data-ocid="members.list"
          >
            {filtered.map((member, idx) => (
              <MemberCard
                key={member.membershipId}
                member={member}
                index={idx + 1}
              />
            ))}
          </div>
        ))}
    </div>
  );
}
