import type { SupabaseClient } from "@wishstar/cloud";
import type { Id } from "@wishstar/core";
import type { OwnerNotification } from "../domain/owner-notification";
import type { OwnerNotificationPort } from "../ports";

/**
 * Thin wrapper around the two RPC functions from
 * supabase/migrations/0004_owner_notifications.sql — no direct table
 * access exists for the `authenticated` role, same pattern as the
 * reservation functions. No generated Supabase types yet (see
 * supabase-social-gateway.ts), rows are mapped by hand.
 */
export class SupabaseOwnerNotificationPort implements OwnerNotificationPort {
  constructor(private readonly client: SupabaseClient) {}

  async fetchAndClear(): Promise<OwnerNotification[]> {
    const { data, error } = await this.client.rpc("fetch_and_clear_notifications");
    if (error) {
      throw new Error(`Impossibile leggere le notifiche: ${error.message}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data ?? []) as any[]).map((row) => ({
      id: row.id,
      kind: row.kind,
      message: row.message,
      createdAt: row.created_at,
    }));
  }

  async submitDonationNote(wishlistId: Id, note: string): Promise<void> {
    const { error } = await this.client.rpc("submit_donation_note", {
      wishlist_id: wishlistId,
      note,
    });
    if (error) {
      throw new Error(`Impossibile inviare il messaggio: ${error.message}`);
    }
  }
}
