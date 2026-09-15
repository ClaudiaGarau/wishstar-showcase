import type { Id } from "@wishstar/core";
import type { ReservationView } from "@wishstar/gifting";
import { useEffect, useState } from "react";
import { giftingService } from "../services/container";

interface ReserveButtonProps {
  productId: Id;
}

/**
 * The owner viewing their own shared link always sees "available" here
 * (get_reservation_view masks the real status for them) and reserve_product
 * rejects self-reservation server-side — the owner can never learn which
 * gift was taken, only that *something* was, via the generic notification
 * from OwnerNotificationService.
 */
export function ReserveButton({ productId }: ReserveButtonProps) {
  const [view, setView] = useState<ReservationView | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh(): Promise<void> {
    try {
      setView(await giftingService.getView(productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function handleReserve(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await giftingService.reserve(productId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await giftingService.cancel(productId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setBusy(false);
    }
  }

  if (!view) {
    return error ? <p className="error">{error}</p> : null;
  }

  return (
    <div className="reserve-control">
      {view.status === "available" && (
        <button type="button" onClick={() => void handleReserve()} disabled={busy}>
          🎁 Lo prendo io
        </button>
      )}
      {view.status === "reserved" && view.reservedByMe && (
        <>
          <span className="badge badge-reserved">Prenotato da te ✅</span>
          <button type="button" onClick={() => void handleCancel()} disabled={busy}>
            Ho cambiato idea
          </button>
        </>
      )}
      {view.status === "reserved" && !view.reservedByMe && (
        <span className="badge badge-reserved">Già prenotato 🎁</span>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
