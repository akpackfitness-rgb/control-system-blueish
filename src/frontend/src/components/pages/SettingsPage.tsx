import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dumbbell,
  Eye,
  EyeOff,
  Info,
  Lock,
  RotateCcw,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const CORRECT_PIN = "1234";
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 2 * 60; // 2 minutes in seconds

function PinNumpad({
  pin,
  onChange,
}: {
  pin: string;
  onChange: (p: string) => void;
}) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"];

  const handleKey = (key: string) => {
    if (key === "⌫") {
      onChange(pin.slice(0, -1));
    } else if (key === "C") {
      onChange("");
    } else if (pin.length < 4) {
      onChange(pin + key);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
      {keys.map((key) => (
        <button
          type="button"
          key={key}
          data-ocid={`settings.pin_${key}.button`}
          onClick={() => handleKey(key)}
          className={`
            h-12 rounded-xl font-display font-semibold text-base
            transition-all duration-150 active:scale-95
            ${
              key === "C"
                ? "bg-muted/50 text-muted-foreground hover:bg-muted"
                : key === "⌫"
                  ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
                  : "glass text-foreground hover:bg-white/10"
            }
          `}
        >
          {key}
        </button>
      ))}
    </div>
  );
}

function PinDots({ length }: { length: number }) {
  return (
    <div className="flex gap-3 justify-center">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full transition-all duration-200 ${
            i < length
              ? "bg-primary scale-110 shadow-glow-cyan"
              : "bg-muted border border-border"
          }`}
        />
      ))}
    </div>
  );
}

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!lockedUntil) return;
    const tick = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setAttempts(0);
        setCountdown(0);
        clearInterval(tick);
      } else {
        setCountdown(remaining);
      }
    }, 500);
    return () => clearInterval(tick);
  }, [lockedUntil]);

  const handlePinChange = (newPin: string) => {
    setPin(newPin);
    if (newPin.length === 4) {
      if (newPin === CORRECT_PIN) {
        onUnlock();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPin("");
        if (newAttempts >= MAX_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCKOUT_DURATION * 1000);
          toast.error("Too many wrong attempts. Locked for 2 minutes.");
        } else {
          toast.error(
            `Wrong PIN. ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining.`,
          );
        }
      }
    }
  };

  const isLocked = !!lockedUntil;

  return (
    <div
      className="flex items-center justify-center min-h-[70vh]"
      data-ocid="settings.pin.modal"
    >
      <div className="glass-card rounded-3xl p-8 w-full max-w-sm space-y-7 mx-auto text-center">
        <div className="space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto glow-cyan">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h2 className="font-display font-bold text-xl">Unlock Settings</h2>
          <p className="text-muted-foreground text-sm">
            Enter your 4-digit PIN to continue
          </p>
        </div>

        {isLocked ? (
          <div data-ocid="settings.lockout.error_state" className="space-y-3">
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
              <p className="text-destructive font-medium text-sm">
                Account locked
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Try again in {Math.floor(countdown / 60)}:
                {String(countdown % 60).padStart(2, "0")}
              </p>
            </div>
          </div>
        ) : (
          <>
            <PinDots length={pin.length} />
            <PinNumpad pin={pin} onChange={handlePinChange} />
            {attempts > 0 && (
              <p
                className="text-destructive text-sm"
                data-ocid="settings.pin_attempts.error_state"
              >
                {MAX_ATTEMPTS - attempts} attempt(s) remaining
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              Default PIN:{" "}
              <code className="font-mono bg-muted/40 px-1.5 py-0.5 rounded">
                1234
              </code>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function SettingsContent() {
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const handleChangePin = () => {
    if (currentPin !== CORRECT_PIN) {
      toast.error("Current PIN is incorrect");
      return;
    }
    if (newPin.length !== 4) {
      toast.error("New PIN must be 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }
    toast.success("PIN changed successfully! (Mock — not persisted)");
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
  };

  return (
    <div
      className="p-4 md:p-6 max-w-2xl mx-auto space-y-6"
      data-ocid="settings.page"
    >
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          System configuration and preferences
        </p>
      </div>

      {/* Change PIN */}
      <section
        className="glass-card rounded-2xl p-5 space-y-4"
        data-ocid="settings.pin.section"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <h2 className="font-display font-semibold">Change PIN</h2>
        </div>
        <Separator className="opacity-30" />

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="current-pin" className="text-sm">
              Current PIN
            </Label>
            <div className="relative">
              <Input
                id="current-pin"
                data-ocid="settings.current_pin.input"
                type={showCurrentPin ? "text" : "password"}
                placeholder="Enter current PIN"
                maxLength={4}
                value={currentPin}
                onChange={(e) =>
                  setCurrentPin(e.target.value.replace(/\D/g, ""))
                }
                className="bg-input border-border pr-9"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPin((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPin ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-pin" className="text-sm">
              New PIN
            </Label>
            <div className="relative">
              <Input
                id="new-pin"
                data-ocid="settings.new_pin.input"
                type={showNewPin ? "text" : "password"}
                placeholder="Enter new 4-digit PIN"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                className="bg-input border-border pr-9"
              />
              <button
                type="button"
                onClick={() => setShowNewPin((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPin ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-pin" className="text-sm">
              Confirm New PIN
            </Label>
            <div className="relative">
              <Input
                id="confirm-pin"
                data-ocid="settings.confirm_pin.input"
                type={showConfirmPin ? "text" : "password"}
                placeholder="Confirm new PIN"
                maxLength={4}
                value={confirmPin}
                onChange={(e) =>
                  setConfirmPin(e.target.value.replace(/\D/g, ""))
                }
                className="bg-input border-border pr-9"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPin((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPin ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            data-ocid="settings.change_pin.submit_button"
            onClick={handleChangePin}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save New PIN
          </Button>
        </div>
      </section>

      {/* Gym Info */}
      <section
        className="glass-card rounded-2xl p-5 space-y-4"
        data-ocid="settings.gym_info.section"
      >
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-primary" />
          <h2 className="font-display font-semibold">Gym Information</h2>
        </div>
        <Separator className="opacity-30" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Gym Name", value: "AK Pack Fitness", id: "gym-name" },
            {
              label: "Address",
              value: "123 Fitness Street, Mumbai",
              id: "gym-address",
            },
            { label: "Phone", value: "+91 98765 43210", id: "gym-phone" },
            { label: "Email", value: "info@akpack.in", id: "gym-email" },
          ].map((field) => (
            <div key={field.id} className="space-y-1.5">
              <Label htmlFor={field.id} className="text-sm">
                {field.label}
              </Label>
              <Input
                id={field.id}
                data-ocid={`settings.${field.id}.input`}
                defaultValue={field.value}
                readOnly
                className="bg-muted/30 border-border text-muted-foreground cursor-not-allowed"
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Gym info is read-only. Contact support to update.
        </p>
      </section>

      {/* System Info */}
      <section
        className="glass-card rounded-2xl p-5 space-y-4"
        data-ocid="settings.system_info.section"
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          <h2 className="font-display font-semibold">System Info</h2>
        </div>
        <Separator className="opacity-30" />

        <div className="space-y-2">
          {[
            { label: "Version", value: "v1.0.0" },
            { label: "Last Sync", value: "—" },
            { label: "Backend", value: "Internet Computer (ICP)" },
            { label: "Timezone", value: "Asia/Kolkata (IST, UTC+5:30)" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex justify-between items-center py-1.5 border-b border-border/20 last:border-0"
            >
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span className="text-sm font-mono font-medium">{row.value}</span>
            </div>
          ))}
        </div>

        <Button
          data-ocid="settings.sync.secondary_button"
          variant="outline"
          size="sm"
          className="border-primary/40 text-primary hover:bg-primary/10"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-2" />
          Sync Now (Mock)
        </Button>
      </section>
    </div>
  );
}

export default function SettingsPage() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return <PinGate onUnlock={() => setUnlocked(true)} />;
  }

  return <SettingsContent />;
}
