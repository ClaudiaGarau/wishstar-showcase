import type { Id } from "@wishstar/core";

export type OwnerNotificationKind = "gift_reserved" | "donation";

/**
 * What an owner is told about something happening on their shared list.
 * Deliberately generic: never carries a product id or a visitor's
 * identity, matching the anonymity guarantee in
 * supabase/migrations/0002_gift_reservations.sql.
 */
export interface OwnerNotification {
  id: Id;
  kind: OwnerNotificationKind;
  message: string;
  createdAt: string;
}
