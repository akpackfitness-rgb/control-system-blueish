import { useQueryClient } from "@tanstack/react-query";
import { Delete, LogIn, LogOut, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../../hooks/useActor";
import { useMembers } from "../../hooks/useGymData";

type ActiveBox = "checkin" | "checkout" | null;

/** Parse the Apps Script response and return a human-readable message. */
function parseApiMessage(
  raw: string,
  fallback: string,
): { ok: boolean; msg: string } {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      const msg = String(
        parsed.message ?? parsed.msg ?? parsed.result ?? parsed.status ?? "",
      );
      const ok =
        parsed.success === true ||
        parsed.success === "true" ||
        parsed.status === "success";
      if (msg) return { ok, msg };
    }
  } catch {
    // raw string response
  }
  if (raw && raw.length < 200) return { ok: true, msg: raw };
  return { ok: true, msg: fallback };
}

function NumberPad({
  value,
  onChange,
  onSubmit,
  accentClass,
  submitLabel,
  loading,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  accentClass: string;
  submitLabel: string;
  loading: boolean;
}) {
  const handleDigit = (d: string) => {
    if (value.length < 10) onChange(value + d);
  };
  const handleBackspace = () => onChange(value.slice(0, -1));

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const digitKeys = ["d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9"];

  return (
    <div className="mt-4 space-y-3">
      <div className="bg-black/20 rounded-xl px-4 py-3 text-center">
        <span className="font-mono text-2xl font-bold tracking-[0.3em] text-foreground">
          {value.length === 0 ? (
            <span className="text-muted-foreground tracking-widest">— — —</span>
          ) : (
            value
          )}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {digits.map((d, i) => (
          <button
            key={digitKeys[i]}
            type="button"
            onClick={() => handleDigit(d)}
            disabled={loading}
            className="glass rounded-xl h-12 text-lg font-semibold text-foreground hover:bg-white/10 active:scale-95 transition-all disabled:opacity-40"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          onClick={handleBackspace}
          disabled={loading}
          className="glass rounded-xl h-12 flex items-center justify-center text-muted-foreground hover:bg-white/10 active:scale-95 transition-all disabled:opacity-40"
        >
          <Delete className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => handleDigit("0")}
          disabled={loading}
          className="glass rounded-xl h-12 text-lg font-semibold text-foreground hover:bg-white/10 active:scale-95 transition-all disabled:opacity-40"
        >
          0
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={value.length === 0 || loading}
          className={`rounded-xl h-12 text-sm font-bold active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${accentClass}`}
        >
          {loading ? "..." : submitLabel}
        </button>
      </div>
    </div>
  );
}

/** Member info card shown after successful check-in/out */
function MemberInfoCard({
  membershipId,
  type,
}: {
  membershipId: string;
  type: "checkin" | "checkout";
}) {
  const { data: members = [] } = useMembers();
  const member = members.find(
    (m) => String(m.membershipId).trim() === String(membershipId).trim(),
  );

  if (!member) return null;

  const isIn = type === "checkin";
  const borderColor = isIn ? "border-success/40" : "border-destructive/40";
  const textColor = isIn ? "text-success" : "text-destructive";
  const bgColor = isIn ? "bg-success/10" : "bg-destructive/10";

  const statusColors: Record<string, string> = {
    active: "text-success",
    expiring: "text-warning",
    expired: "text-destructive",
  };

  return (
    <div
      className={`mt-4 rounded-xl border ${borderColor} ${bgColor} px-4 py-3 space-y-1`}
    >
      <div className="flex items-center gap-2 mb-2">
        <User className={`w-4 h-4 ${textColor}`} />
        <span className={`text-sm font-bold ${textColor}`}>
          {isIn ? "Checked In" : "Checked Out"}
        </span>
      </div>
      <p className="font-semibold text-foreground text-base">
        {member.clientName}
      </p>
      <p className="text-xs text-muted-foreground">
        ID: #{member.membershipId}
      </p>
      {member.packageName && (
        <p className="text-xs text-muted-foreground">{member.packageName}</p>
      )}
      {member.packageValidity && (
        <p className="text-xs text-muted-foreground">
          Valid till: {member.packageValidity}
        </p>
      )}
      {member.clientNo && (
        <p className="text-xs text-muted-foreground">
          Mobile: {member.clientNo}
        </p>
      )}
      <p
        className={`text-xs font-medium ${statusColors[member.status] ?? "text-muted-foreground"}`}
      >
        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
      </p>
    </div>
  );
}

export default function CheckInOutPage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [activeBox, setActiveBox] = useState<ActiveBox>(null);
  const [checkinValue, setCheckinValue] = useState("");
  const [checkoutValue, setCheckoutValue] = useState("");
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [lastCheckinId, setLastCheckinId] = useState<string | null>(null);
  const [lastCheckoutId, setLastCheckoutId] = useState<string | null>(null);

  const handleCheckIn = async () => {
    const id = checkinValue.trim();
    if (!id || !actor) return;
    setCheckinLoading(true);
    try {
      const raw = await actor.checkIn(id);
      const { ok, msg } = parseApiMessage(
        raw,
        `Member ${id} checked in successfully!`,
      );
      if (ok) {
        toast.success(msg);
        setLastCheckinId(id);
        // Refresh live feed immediately
        queryClient.invalidateQueries({ queryKey: ["attendance"] });
      } else {
        toast.error(msg);
      }
      setCheckinValue("");
    } catch (err) {
      toast.error(
        `Check-in failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setCheckinLoading(false);
    }
  };

  const handleCheckOut = async () => {
    const id = checkoutValue.trim();
    if (!id || !actor) return;
    setCheckoutLoading(true);
    try {
      const raw = await actor.checkOut(id);
      const { ok, msg } = parseApiMessage(
        raw,
        `Member ${id} checked out successfully!`,
      );
      if (ok) {
        toast.success(msg);
        setLastCheckoutId(id);
        // Refresh live feed immediately
        queryClient.invalidateQueries({ queryKey: ["attendance"] });
      } else {
        toast.error(msg);
      }
      setCheckoutValue("");
    } catch (err) {
      toast.error(
        `Check-out failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div
      className="p-4 md:p-6 max-w-4xl mx-auto space-y-6"
      data-ocid="checkin.page"
    >
      <div>
        <h1 className="font-display text-2xl font-bold">Check In / Out</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Tap a box to open the number pad, then enter a Membership ID
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* CHECK IN BOX */}
        <div
          data-ocid="checkin.checkin.panel"
          className={`glass-card rounded-2xl p-5 transition-all duration-200 ${
            activeBox === "checkin"
              ? "border border-success/50 shadow-[0_0_24px_oklch(0.72_0.18_145/0.18)]"
              : "border border-white/10"
          }`}
        >
          <button
            type="button"
            className="w-full flex items-center gap-3 mb-1 text-left"
            onClick={() => {
              setActiveBox(activeBox === "checkin" ? null : "checkin");
              setLastCheckinId(null);
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center flex-shrink-0">
              <LogIn className="w-5 h-5 text-success" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-success">
                Check In
              </h2>
              <p className="text-muted-foreground text-xs">
                {activeBox === "checkin"
                  ? "Enter member ID below"
                  : "Tap to open pad"}
              </p>
            </div>
          </button>

          {activeBox === "checkin" && (
            <>
              <NumberPad
                value={checkinValue}
                onChange={(v) => {
                  setCheckinValue(v);
                  setLastCheckinId(null);
                }}
                onSubmit={handleCheckIn}
                accentClass="bg-success/25 text-success border border-success/50 hover:bg-success/35"
                submitLabel="Check In"
                loading={checkinLoading}
              />
              {lastCheckinId && (
                <MemberInfoCard membershipId={lastCheckinId} type="checkin" />
              )}
            </>
          )}
        </div>

        {/* CHECK OUT BOX */}
        <div
          data-ocid="checkin.checkout.panel"
          className={`glass-card rounded-2xl p-5 transition-all duration-200 ${
            activeBox === "checkout"
              ? "border border-destructive/50 shadow-[0_0_24px_oklch(0.58_0.22_25/0.18)]"
              : "border border-white/10"
          }`}
        >
          <button
            type="button"
            className="w-full flex items-center gap-3 mb-1 text-left"
            onClick={() => {
              setActiveBox(activeBox === "checkout" ? null : "checkout");
              setLastCheckoutId(null);
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-destructive">
                Check Out
              </h2>
              <p className="text-muted-foreground text-xs">
                {activeBox === "checkout"
                  ? "Enter member ID below"
                  : "Tap to open pad"}
              </p>
            </div>
          </button>

          {activeBox === "checkout" && (
            <>
              <NumberPad
                value={checkoutValue}
                onChange={(v) => {
                  setCheckoutValue(v);
                  setLastCheckoutId(null);
                }}
                onSubmit={handleCheckOut}
                accentClass="bg-destructive/25 text-destructive border border-destructive/50 hover:bg-destructive/35"
                submitLabel="Check Out"
                loading={checkoutLoading}
              />
              {lastCheckoutId && (
                <MemberInfoCard membershipId={lastCheckoutId} type="checkout" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
