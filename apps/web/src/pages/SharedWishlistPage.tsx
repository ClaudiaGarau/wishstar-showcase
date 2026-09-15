import type { SharedWishlistView } from "@wishstar/sharing";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DonationNoteForm } from "../components/DonationNoteForm";
import { ReserveButton } from "../components/ReserveButton";
import { isCloudConfigured, sharingService } from "../services/container";

/**
 * A PayPal.me or Revolut.me link is a normal https:// URL, so it already
 * gets a clickable button below — only a raw IBAN (or similar non-URL
 * text) needs its own action, since there's nothing to "go to".
 */
function DonationCopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(): Promise<void> {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" onClick={() => void handleCopy()}>
      {copied ? "Copiato! ✅" : "Copia"}
    </button>
  );
}

/** What a visitor sees when they open a shared link/QR — read-only, no edit or add capability. */
export function SharedWishlistPage() {
  const { token } = useParams<{ token: string }>();
  const [view, setView] = useState<SharedWishlistView | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token || !sharingService) {
      return;
    }
    void sharingService.view(token).then((result) => {
      if (result) {
        setView(result);
      } else {
        setNotFound(true);
      }
    });
  }, [token]);

  if (!isCloudConfigured) {
    return <p className="empty-state">La condivisione non è configurata su questa installazione.</p>;
  }
  if (notFound) {
    return <p className="empty-state">Questo link non esiste più o è stato revocato dal proprietario.</p>;
  }
  if (!view) {
    return <p>Caricamento…</p>;
  }

  return (
    <section>
      <h1>{view.wishlist.title}</h1>
      <p>
        <span className="badge">{view.wishlist.category}</span>
      </p>
      {view.wishlist.description && <p>{view.wishlist.description}</p>}

      {view.wishlist.notes && (
        <div className="letter-card">
          <span className="letter-card-seal">💌</span>
          <p className="letter-card-text">{view.wishlist.notes}</p>
        </div>
      )}

      {view.wishlist.donationLink && (
        <div className="card">
          <h2>🎁 Vuoi contribuire?</h2>
          {/^https?:\/\//i.test(view.wishlist.donationLink) ? (
            <a href={view.wishlist.donationLink} target="_blank" rel="noreferrer">
              <button type="button">Vai al link per contribuire ↗</button>
            </a>
          ) : (
            <div className="donation-copy-row">
              <p className="donation-text">{view.wishlist.donationLink}</p>
              <DonationCopyButton value={view.wishlist.donationLink} />
            </div>
          )}
          <DonationNoteForm wishlistId={view.wishlist.id} />
        </div>
      )}

      {view.products.length === 0 ? (
        <p className="empty-state">Questa lista non ha ancora prodotti.</p>
      ) : (
        <ul className="product-list">
          {view.products.map((product) => (
            <li key={product.id} className="card">
              <div>
                <strong>{product.title}</strong>
                {product.store && <span className="badge">{product.store}</span>}
              </div>
              <ReserveButton productId={product.id} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
