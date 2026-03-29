import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Pack, PackId, UserProfile, UserRole } from "../backend";
import { useActor } from "./useActor";

export function useGetAllPacks() {
  const { actor, isFetching } = useActor();
  return useQuery<Pack[]>({
    queryKey: ["packs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPacks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

// Stub types for components that reference these (backend support not yet wired)
export interface AccessEvent {
  packId: PackId;
  userId: Principal;
  action: string;
  timestamp: bigint;
}

export function useGetUsersWithAccess(_packId: PackId | null) {
  return useQuery<Principal[]>({
    queryKey: ["usersWithAccess", _packId?.toString()],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetAccessLog(_packId: PackId | null) {
  return useQuery<AccessEvent[]>({
    queryKey: ["accessLog", _packId?.toString() ?? "all"],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useCreatePack() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
    }: { name: string; description: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.createPack(name, description);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["packs"] }),
  });
}

export function useGrantAccess() {
  const qc = useQueryClient();
  return useMutation<void, Error, { packId: PackId; userId: Principal }>({
    mutationFn: async ({ packId: _packId, userId: _userId }) => {
      throw new Error("grantAccess not implemented");
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ["usersWithAccess", vars.packId.toString()],
      });
    },
  });
}

export function useRevokeAccess() {
  const qc = useQueryClient();
  return useMutation<void, Error, { packId: PackId; userId: Principal }>({
    mutationFn: async ({ packId: _packId, userId: _userId }) => {
      throw new Error("revokeAccess not implemented");
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ["usersWithAccess", vars.packId.toString()],
      });
    },
  });
}

export function useAssignUserRole() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error("No actor");
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerRole"] }),
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("No actor");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUserProfile"] }),
  });
}
