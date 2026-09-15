import type { ReservationView } from "../domain/reservation-view";
import type { GiftReservationPort } from "../ports";

const MESSAGE = "La prenotazione regalo richiede il cloud configurato su questa installazione.";

/**
 * Not a stub that pretends to work — used when Supabase isn't configured
 * (see apps/web's container.ts), so the UI can wire against
 * GiftReservationPort unconditionally and get a clear, intentional error
 * instead of a missing module. SupabaseGiftReservationPort is the real
 * implementation once the cloud layer is set up.
 */
export class NotImplementedGiftReservationPort implements GiftReservationPort {
  async reserve(): Promise<void> {
    throw new Error(MESSAGE);
  }

  async cancel(): Promise<void> {
    throw new Error(MESSAGE);
  }

  async getView(): Promise<ReservationView> {
    throw new Error(MESSAGE);
  }
}
