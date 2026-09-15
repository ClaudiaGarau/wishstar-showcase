import type { Id } from "@wishstar/core";
import type { OwnerNotification } from "./domain/owner-notification";
import type { ReservationView } from "./domain/reservation-view";

/**
 * The contract a backend-backed implementation satisfies. Real anonymity
 * (the owner never learns who reserved their gift) is enforced by the
 * server, not the client — see supabase/migrations/0002_gift_reservations.sql
 * and SupabaseGiftReservationPort. No viewerToken parameter: identity comes
 * from the caller's authenticated session (@wishstar/cloud), never
 * something the client passes in and could fake.
 */
export interface GiftReservationPort {
  reserve(productId: Id): Promise<void>;
  cancel(productId: Id): Promise<void>;
  getView(productId: Id): Promise<ReservationView>;
}

/**
 * Cross-device delivery for the owner-facing notifications created by
 * reserve_product/submit_donation_note (see 0004_owner_notifications.sql).
 * No realtime/push infra exists, so fetchAndClear is meant to be polled.
 */
export interface OwnerNotificationPort {
  fetchAndClear(): Promise<OwnerNotification[]>;
  submitDonationNote(wishlistId: Id, note: string): Promise<void>;
}
