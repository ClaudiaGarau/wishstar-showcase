import type { SupabaseClient } from "@wishstar/cloud";
import type { Id } from "@wishstar/core";
import type { ReservationView } from "../domain/reservation-view";
import type { GiftReservationPort } from "../ports";

/**
 * Thin wrapper around the three RPC functions from
 * supabase/migrations/0002_gift_reservations.sql. All the anonymity
 * enforcement lives server-side (SECURITY DEFINER functions, column
 * grants) — this class has no logic of its own beyond calling them and
 * translating errors. Not unit-tested against a live project, same as
 * the other Supabase adapters in this codebase.
 */
export class SupabaseGiftReservationPort implements GiftReservationPort {
  constructor(private readonly client: SupabaseClient) {}

  async reserve(productId: Id): Promise<void> {
    const { error } = await this.client.rpc("reserve_product", { product_id: productId });
    if (error) {
      throw new Error(`Impossibile prenotare questo regalo: ${error.message}`);
    }
  }

  async cancel(productId: Id): Promise<void> {
    const { error } = await this.client.rpc("cancel_reservation", { product_id: productId });
    if (error) {
      throw new Error(`Impossibile annullare la prenotazione: ${error.message}`);
    }
  }

  async getView(productId: Id): Promise<ReservationView> {
    const { data, error } = await this.client
      .rpc("get_reservation_view", { product_id: productId })
      .single();
    if (error) {
      throw new Error(`Impossibile leggere lo stato della prenotazione: ${error.message}`);
    }
    const row = data as { status: "available" | "reserved"; reserved_by_me: boolean };
    return { status: row.status, reservedByMe: row.reserved_by_me };
  }
}
