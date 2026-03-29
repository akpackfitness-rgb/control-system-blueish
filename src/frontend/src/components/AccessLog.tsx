import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Filter, ScrollText } from "lucide-react";
import { useState } from "react";
import type { PackId } from "../backend";
import { useGetAccessLog, useGetAllPacks } from "../hooks/useQueries";

function formatTime(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleString();
}

export default function AccessLog() {
  const [filterPackId, setFilterPackId] = useState<PackId | null>(null);
  const { data: packs } = useGetAllPacks();
  const { data: logs, isLoading } = useGetAccessLog(filterPackId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold">Access Log</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {logs?.length ?? 0} event{logs?.length !== 1 ? "s" : ""} recorded
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select
            value={filterPackId?.toString() ?? "all"}
            onValueChange={(val) =>
              setFilterPackId(val === "all" ? null : BigInt(val))
            }
          >
            <SelectTrigger
              data-ocid="access_log.select"
              className="w-44 bg-input border-border"
            >
              <SelectValue placeholder="Filter by pack" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Packs</SelectItem>
              {packs?.map((p) => (
                <SelectItem key={p.id.toString()} value={p.id.toString()}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div data-ocid="access_log.loading_state" className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded" />
          ))}
        </div>
      ) : logs && logs.length > 0 ? (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <Table data-ocid="access_log.table">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-mono text-muted-foreground">
                  PACK ID
                </TableHead>
                <TableHead className="text-xs font-mono text-muted-foreground">
                  USER
                </TableHead>
                <TableHead className="text-xs font-mono text-muted-foreground">
                  ACTION
                </TableHead>
                <TableHead className="text-xs font-mono text-muted-foreground">
                  TIMESTAMP
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((event, idx) => (
                <TableRow
                  key={`${event.packId.toString()}-${event.userId.toString()}-${idx}`}
                  data-ocid={`access_log.row.${idx + 1}`}
                  className="border-border hover:bg-muted/30"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {event.packId.toString()}
                  </TableCell>
                  <TableCell className="font-mono text-xs max-w-[200px] truncate">
                    {event.userId.toString()}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-sm">
                      {event.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatTime(event.timestamp)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div
          data-ocid="access_log.empty_state"
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-14 h-14 rounded-lg bg-muted border border-border flex items-center justify-center mb-4">
            <ScrollText className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="font-display font-semibold mb-1">No log entries</h3>
          <p className="text-muted-foreground text-sm">
            Access events will appear here once recorded.
          </p>
        </div>
      )}
    </div>
  );
}
