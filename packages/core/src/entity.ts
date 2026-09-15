import type { Id } from "./id";

export type SyncStatus = "local-only" | "dirty" | "synced";

/**
 * Present on every entity from v1 even though nothing reads it yet, so a
 * future sync engine is an addition (read dirty records, push, mark synced)
 * rather than a data migration.
 */
export interface SyncMeta {
  status: SyncStatus;
  revision: number;
  lastSyncedAt?: string;
}

export interface BaseEntity {
  id: Id;
  createdAt: string;
  updatedAt: string;
  ownerId: Id | null;
  sync: SyncMeta;
}

export function createSyncMeta(): SyncMeta {
  return { status: "local-only", revision: 0 };
}

/**
 * Bumps updatedAt/revision and flags the entity dirty for a future sync
 * pass, unless it has never left the device (local-only stays local-only).
 */
export function touch<T extends BaseEntity>(entity: T): T {
  return {
    ...entity,
    updatedAt: new Date().toISOString(),
    sync: {
      ...entity.sync,
      status: entity.sync.status === "local-only" ? "local-only" : "dirty",
      revision: entity.sync.revision + 1,
    },
  };
}
