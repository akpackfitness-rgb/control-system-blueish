import { useQuery } from "@tanstack/react-query";
import type { MemberStatus } from "../data/mockData";
import { useActor } from "./useActor";

export interface GymMember {
  membershipId: string;
  clientName: string;
  clientNo: string;
  packageName: string;
  packageValidity: string;
  status: MemberStatus;
}

export interface GymAttendance {
  membershipId: string;
  clientName: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  packageDetails: string;
  packageValidity: string;
  status: MemberStatus;
}

function normalizeStatus(raw: string): MemberStatus {
  const s = (raw || "").toLowerCase().trim();
  if (s === "active") return "active";
  if (s === "expiring soon" || s === "expiring") return "expiring";
  return "expired";
}

// Extract an array from various Google Apps Script response shapes:
// plain array, { data: [...] }, { members: [...] }, { success, data: [...] }, etc.
function extractArray(raw: string): Record<string, unknown>[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Record<string, unknown>[];
    if (parsed && typeof parsed === "object") {
      for (const key of [
        "data",
        "members",
        "attendance",
        "records",
        "result",
      ]) {
        if (Array.isArray((parsed as Record<string, unknown>)[key]))
          return (parsed as Record<string, unknown>)[key] as Record<
            string,
            unknown
          >[];
      }
    }
  } catch {
    // not parseable
  }
  return [];
}

/** Get a string value from an item, trying multiple possible field names. */
function getField(item: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null && item[key] !== "") {
      return String(item[key]);
    }
  }
  return "";
}

export function useMembers() {
  const { actor, isFetching } = useActor();

  return useQuery<GymMember[]>({
    queryKey: ["members"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // biome-ignore lint/suspicious/noExplicitAny: backend version mismatch
        const raw: string = await (
          actor as unknown as Record<
            string,
            (...args: unknown[]) => Promise<string>
          >
        ).getRawMembers();
        const arr = extractArray(raw);
        return arr.map(
          (item) =>
            ({
              // Apps Script returns fields with spaces: "Membership ID", "Client name", etc.
              membershipId: getField(
                item,
                "Membership ID",
                "membershipId",
                "MembershipId",
                "membership_id",
                "id",
              ),
              clientName: getField(
                item,
                "Client name",
                "clientName",
                "ClientName",
                "client_name",
                "name",
                "Name",
              ),
              clientNo: getField(
                item,
                "Contact no",
                "clientNo",
                "ClientNo",
                "mobile",
                "Mobile",
                "phone",
                "contact",
              ),
              packageName: getField(
                item,
                "Package Details",
                "packageName",
                "PackageName",
                "package",
                "Package",
              ),
              packageValidity: getField(
                item,
                "Package Validity",
                "packageValidity",
                "PackageValidity",
                "validity",
              ),
              status: normalizeStatus(
                getField(item, "Status", "status") || "active",
              ),
            }) as GymMember,
        );
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAttendance() {
  const { actor, isFetching } = useActor();

  return useQuery<GymAttendance[]>({
    queryKey: ["attendance"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // biome-ignore lint/suspicious/noExplicitAny: backend version mismatch
        const raw: string = await (
          actor as unknown as Record<
            string,
            (...args: unknown[]) => Promise<string>
          >
        ).getRawAttendance();
        const arr = extractArray(raw);
        return arr.map(
          (item) =>
            ({
              membershipId: getField(
                item,
                "Membership ID",
                "membershipId",
                "MembershipId",
                "id",
              ),
              clientName: getField(
                item,
                "Client name",
                "clientName",
                "ClientName",
                "name",
              ),
              date: getField(
                item,
                "Date",
                "date",
                "Check In Date",
                "Created On",
              ),
              checkInTime: getField(
                item,
                "Check In Time",
                "checkInTime",
                "CheckInTime",
                "checkIn",
                "Check In",
              ),
              checkOutTime: getField(
                item,
                "Check Out Time",
                "checkOutTime",
                "CheckOutTime",
                "checkOut",
                "Check Out",
              ),
              packageDetails: getField(
                item,
                "Package Details",
                "packageDetails",
                "PackageDetails",
                "packageName",
              ),
              packageValidity: getField(
                item,
                "Package Validity",
                "packageValidity",
                "PackageValidity",
              ),
              status: normalizeStatus(
                getField(item, "Status", "status") || "active",
              ),
            }) as GymAttendance,
        );
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}
