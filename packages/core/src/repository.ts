import type { BaseEntity } from "./entity";
import type { Id } from "./id";
import type { Unsubscribe } from "./types";

export type ChangeType = "created" | "updated" | "deleted";

export interface ChangeEvent<T> {
  type: ChangeType;
  entity: T;
}

/**
 * The port every module implements for its own entities. Domain and
 * application code depend only on this interface; swapping the concrete
 * adapter (IndexedDB today, a cloud store tomorrow) never touches them.
 */
export interface Repository<T extends BaseEntity> {
  getAll(): Promise<T[]>;
  getById(id: Id): Promise<T | null>;
  create(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  delete(id: Id): Promise<void>;
  onChange(listener: (event: ChangeEvent<T>) => void): Unsubscribe;
}
