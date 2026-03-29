import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Principal } from "@icp-sdk/core/principal";
import { ShieldCheck, UserCog } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend";
import { useAssignUserRole } from "../hooks/useQueries";

export default function UserManagement() {
  const [principalInput, setPrincipalInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.user);
  const [principalError, setPrincipalError] = useState("");
  const { mutateAsync: assignRole, isPending } = useAssignUserRole();

  const handleAssign = async () => {
    setPrincipalError("");
    let user: Principal;
    try {
      user = Principal.fromText(principalInput.trim());
    } catch {
      setPrincipalError("Invalid principal ID format");
      return;
    }
    try {
      await assignRole({ user, role: selectedRole });
      toast.success(`Role '${selectedRole}' assigned to user`);
      setPrincipalInput("");
    } catch {
      toast.error("Failed to assign role");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold">User Management</h2>
        <p className="text-muted-foreground text-sm mt-0.5">
          Assign roles to users by their principal ID
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 max-w-xl">
        <div className="flex items-center gap-2 mb-5">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold">Assign Role</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label
              htmlFor="user-principal"
              className="text-xs font-mono text-muted-foreground mb-1.5 block"
            >
              USER PRINCIPAL ID
            </Label>
            <Input
              id="user-principal"
              data-ocid="user_mgmt.input"
              value={principalInput}
              onChange={(e) => {
                setPrincipalInput(e.target.value);
                setPrincipalError("");
              }}
              placeholder="aaaaa-aa..."
              className="bg-input border-border font-mono text-sm"
            />
            {principalError && (
              <p
                data-ocid="user_mgmt.error_state"
                className="text-destructive text-xs mt-1"
              >
                {principalError}
              </p>
            )}
          </div>

          <div>
            <Label className="text-xs font-mono text-muted-foreground mb-1.5 block">
              ROLE
            </Label>
            <Select
              value={selectedRole}
              onValueChange={(val) => setSelectedRole(val as UserRole)}
            >
              <SelectTrigger
                data-ocid="user_mgmt.select"
                className="bg-input border-border"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value={UserRole.admin}>
                  <span className="font-mono">admin</span>
                </SelectItem>
                <SelectItem value={UserRole.user}>
                  <span className="font-mono">user</span>
                </SelectItem>
                <SelectItem value={UserRole.guest}>
                  <span className="font-mono">guest</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            data-ocid="user_mgmt.submit_button"
            onClick={handleAssign}
            disabled={isPending || !principalInput.trim()}
            className="w-full bg-primary text-primary-foreground font-display font-semibold"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                Assigning...
              </>
            ) : (
              <>
                <UserCog className="w-4 h-4 mr-2" />
                Assign Role
              </>
            )}
          </Button>
        </div>

        <div className="mt-6 pt-5 border-t border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-mono text-primary">admin</span> — Full system
            access including pack creation and user management.
            <br />
            <span className="font-mono text-foreground/70">user</span> — Can
            view packs they have access to.
            <br />
            <span className="font-mono text-muted-foreground">guest</span> —
            Limited read-only access.
          </p>
        </div>
      </div>
    </div>
  );
}
