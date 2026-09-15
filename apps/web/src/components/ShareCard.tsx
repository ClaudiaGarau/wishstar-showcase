import type { Id } from "@wishstar/core";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { isCloudConfigured, sharingService } from "../services/container";

interface ShareCardProps {
  wishlistId: Id;
}

/** Hides itself entirely when Supabase isn't configured — Sharing is opt-in cloud, never required to use the app. */
export function ShareCard({ wishlistId }: ShareCardProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh(): Promise<void> {
    if (!sharingService) {
      return;
    }
    const link = await sharingService.getLink(wishlistId);
    if (!link) {
      setShareUrl(null);
      setQrDataUrl(null);
      return;
    }
    const url = buildShareUrl(link.token);
    setShareUrl(url);
    setQrDataUrl(await QRCode.toDataURL(url, { margin: 1, width: 220 }));
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishlistId]);

  async function handleShare(): Promise<void> {
    if (!sharingService) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await sharingService.share(wishlistId, null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setBusy(false);
    }
  }

  async function handleUnshare(): Promise<void> {
    if (!sharingService) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await sharingService.unshare(wishlistId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setBusy(false);
    }
  }

  if (!isCloudConfigured) {
    return null;
  }

  return (
    <div className="card">
      <h2>Condivisione</h2>
      {shareUrl ? (
        <>
          <p>
            Questa lista è condivisa: il link resta sempre aggiornato, non serve rigenerarlo dopo ogni
            modifica.
          </p>
          <div className="share-link-row">
            <input readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} />
            {qrDataUrl && <img src={qrDataUrl} alt="QR code della lista condivisa" width={120} height={120} />}
          </div>
          <button type="button" onClick={() => void handleUnshare()} disabled={busy}>
            Smetti di condividere
          </button>
        </>
      ) : (
        <button type="button" onClick={() => void handleShare()} disabled={busy}>
          {busy ? "Condivisione…" : "Condividi"}
        </button>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

function buildShareUrl(token: string): string {
  return `${window.location.origin}/s/${token}`;
}
