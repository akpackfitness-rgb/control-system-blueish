import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Package, Plus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Status } from "../backend";
import type { PackId } from "../backend";
import { useCreatePack, useGetAllPacks } from "../hooks/useQueries";

interface PacksTabProps {
  isAdmin: boolean;
  onManageAccess: (packId: PackId) => void;
}

export default function PacksTab({ isAdmin, onManageAccess }: PacksTabProps) {
  const { data: packs, isLoading } = useGetAllPacks();
  const { mutateAsync: createPack, isPending } = useCreatePack();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await createPack({ name: name.trim(), description: description.trim() });
      toast.success("Pack created successfully");
      setName("");
      setDescription("");
      setOpen(false);
    } catch {
      toast.error("Failed to create pack");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold">AK Packs</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {packs?.length ?? 0} pack{packs?.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="packs.open_modal_button"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold gap-2"
              >
                <Plus className="w-4 h-4" />
                New Pack
              </Button>
            </DialogTrigger>
            <DialogContent
              data-ocid="packs.dialog"
              className="bg-card border-border sm:max-w-md"
            >
              <DialogHeader>
                <DialogTitle className="font-display">
                  Create New Pack
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label
                    htmlFor="pack-name"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    Pack Name
                  </Label>
                  <Input
                    id="pack-name"
                    data-ocid="packs.input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Alpha Strike Pack"
                    className="bg-input border-border"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="pack-desc"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="pack-desc"
                    data-ocid="packs.textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the contents and purpose of this pack..."
                    className="bg-input border-border resize-none"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  data-ocid="packs.cancel_button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-border"
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="packs.submit_button"
                  onClick={handleCreate}
                  disabled={isPending || !name.trim()}
                  className="bg-primary text-primary-foreground font-display font-semibold"
                >
                  {isPending ? "Creating..." : "Create Pack"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div data-ocid="packs.loading_state" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : packs && packs.length > 0 ? (
        <div className="space-y-3">
          {packs.map((pack, idx) => (
            <div
              key={pack.id.toString()}
              data-ocid={`packs.item.${idx + 1}`}
              className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 hover:border-primary/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-display font-semibold text-sm truncate">
                    {pack.name}
                  </h3>
                  <Badge
                    className={`text-xs font-mono ${
                      pack.status === Status.active
                        ? "bg-success/15 text-success border-success/20 border"
                        : "bg-muted text-muted-foreground border-border border"
                    }`}
                    variant="outline"
                  >
                    {pack.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {pack.description || "No description"}
                </p>
                <p className="text-xs font-mono text-muted-foreground/60 mt-0.5">
                  ID: {pack.id.toString()}
                </p>
              </div>
              <Button
                data-ocid={`packs.manage_access.button.${idx + 1}`}
                variant="ghost"
                size="sm"
                onClick={() => onManageAccess(pack.id)}
                className="text-muted-foreground hover:text-foreground gap-1 group-hover:text-primary flex-shrink-0"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Manage Access</span>
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div
          data-ocid="packs.empty_state"
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-14 h-14 rounded-lg bg-muted border border-border flex items-center justify-center mb-4">
            <Package className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="font-display font-semibold mb-1">No packs yet</h3>
          <p className="text-muted-foreground text-sm">
            {isAdmin
              ? "Create your first AK pack to get started."
              : "No packs have been created yet."}
          </p>
        </div>
      )}
    </div>
  );
}
