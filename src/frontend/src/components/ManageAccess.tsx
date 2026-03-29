import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Principal } from "@icp-sdk/core/principal";
import { ArrowLeft, Shield, Trash2, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { PackId } from "../backend";
import {
  useGetAllPacks,
  useGetUsersWithAccess,
  useGrantAccess,
  useRevokeAccess,
} from "../hooks/useQueries";

interface ManageAccessProps {
  packId: PackId;
  onBack: () => void;
  isAdmin: boolean;
}

export default function ManageAccess({
  packId,
  onBack,
  isAdmin,
}: ManageAccessProps) {
  const { data: packs } = useGetAllPacks();
  const { data: users, isLoading } = useGetUsersWithAccess(packId);
  const { mutateAsync: grantAccess, isPending: isGranting } = useGrantAccess();
  const { mutateAsync: revokeAccess, isPending: isRevoking } =
    useRevokeAccess();
  const [principalInput, setPrincipalInput] = useState("");
  const [principalError, setPrincipalError] = useState("");

  const pack = packs?.find((p) => p.id === packId);

  const handleGrant = async () => {
    setPrincipalError("");
    let userId: Principal;
    try {
      userId = Principal.fromText(principalInput.trim());
    } catch {
      setPrincipalError("Invalid principal ID format");
      return;
    }
    try {
      await grantAccess({ packId, userId });
      toast.success("Access granted");
      setPrincipalInput("");
    } catch {
      toast.error("Failed to grant access");
    }
  };

  const handleRevoke = async (userId: Principal) => {
    try {
      await revokeAccess({ packId, userId });
      toast.success("Access revoked");
    } catch {
      toast.error("Failed to revoke access");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          data-ocid="manage_access.back.button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="h-5 w-px bg-border" />
        <div>
          <h2 className="font-display text-xl font-bold">
            {pack?.name ?? "Pack"}
          </h2>
          <p className="text-muted-foreground text-xs font-mono">
            MANAGE ACCESS CONTROL
          </p>
        </div>
      </div>

      {/* Grant Access (admin only) */}
      {isAdmin && (
        <div className="bg-card border border-border rounded-lg p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">Grant Access</h3>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label
                htmlFor="grant-principal"
                className="text-xs text-muted-foreground mb-1.5 block"
              >
                USER PRINCIPAL ID
              </Label>
              <Input
                id="grant-principal"
                data-ocid="manage_access.input"
                value={principalInput}
                onChange={(e) => {
                  setPrincipalInput(e.target.value);
                  setPrincipalError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleGrant()}
                placeholder="aaaaa-aa..."
                className="bg-input border-border font-mono text-sm"
              />
              {principalError && (
                <p
                  data-ocid="manage_access.error_state"
                  className="text-destructive text-xs mt-1"
                >
                  {principalError}
                </p>
              )}
            </div>
            <div className="pt-6">
              <Button
                data-ocid="manage_access.primary_button"
                onClick={handleGrant}
                disabled={isGranting || !principalInput.trim()}
                className="bg-primary text-primary-foreground font-display font-semibold"
              >
                {isGranting ? "Granting..." : "Grant"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Users list */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-display font-semibold text-sm">
            Users with Access
            {users && (
              <span className="text-muted-foreground font-normal ml-2">
                ({users.length})
              </span>
            )}
          </h3>
        </div>

        {isLoading ? (
          <div data-ocid="manage_access.loading_state" className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : users && users.length > 0 ? (
          <div className="space-y-2">
            {users.map((user, idx) => (
              <div
                key={user.toString()}
                data-ocid={`manage_access.item.${idx + 1}`}
                className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="flex-1 text-sm font-mono text-foreground truncate">
                  {user.toString()}
                </p>
                {isAdmin && (
                  <Button
                    data-ocid={`manage_access.delete_button.${idx + 1}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevoke(user)}
                    disabled={isRevoking}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            data-ocid="manage_access.empty_state"
            className="bg-card border border-border rounded-lg py-12 flex flex-col items-center text-center"
          >
            <Users className="w-8 h-8 text-muted-foreground mb-3" />
            <p className="font-display font-medium text-sm">
              No users have access
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              {isAdmin
                ? "Grant access to users above."
                : "No users have been granted access."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
