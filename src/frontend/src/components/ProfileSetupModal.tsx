import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveUserProfile } from "../hooks/useQueries";

export default function ProfileSetupModal() {
  const [name, setName] = useState("");
  const { mutateAsync, isPending } = useSaveUserProfile();

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      await mutateAsync({ name: name.trim() });
      toast.success("Profile saved");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  return (
    <Dialog open>
      <DialogContent
        data-ocid="profile_setup.dialog"
        className="sm:max-w-md bg-card border-border"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <User className="w-5 h-5 text-primary" />
            <DialogTitle className="font-display">
              Set Up Your Profile
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Enter your name to complete setup. This will be shown across the
            system.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label
            htmlFor="profile-name"
            className="text-sm font-medium mb-2 block"
          >
            Display Name
          </Label>
          <Input
            id="profile-name"
            data-ocid="profile_setup.input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="Enter your name..."
            className="bg-input border-border"
          />
        </div>

        <DialogFooter>
          <Button
            data-ocid="profile_setup.submit_button"
            onClick={handleSave}
            disabled={isPending || !name.trim()}
            className="bg-primary text-primary-foreground font-display font-semibold"
          >
            {isPending ? "Saving..." : "Save Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
