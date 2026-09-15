import { money, type Id } from "@wishstar/core";
import type { Priority, Wishlist } from "@wishstar/wishlist";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { marketplaceService, productService, wishlistService } from "../services/container";
import { getCategoryEmoji } from "../utils/categoryEmoji";

const PRIORITY_LABELS: Record<Priority, string> = { low: "Bassa", medium: "Media", high: "Alta" };

/**
 * Landing page for the "Aggiungi a WishStar" bookmarklet (see SettingsPage).
 * The bookmarklet reads the product page in the user's own browser — where
 * it isn't blocked the way our server is — and redirects here with the
 * extracted title/price/image already folded into `text`, reusing the same
 * marketplaceService.importFromUrl pipeline as the in-list paste-a-link flow.
 */
export function QuickAddPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const url = searchParams.get("url") ?? "";
  const text = searchParams.get("text") ?? "";
  const pageTitle = searchParams.get("title") ?? "";

  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [wishlistId, setWishlistId] = useState<string>("");
  const [detecting, setDetecting] = useState(true);
  const [detectMessage, setDetectMessage] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [store, setStore] = useState("");
  const [brand, setBrand] = useState("");
  const [priceAmount, setPriceAmount] = useState("");
  const [priceCurrency, setPriceCurrency] = useState("EUR");
  const [priority, setPriority] = useState<Priority>("medium");
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void wishlistService.list().then((all) => {
      const active = all.filter((wishlist) => !wishlist.archived);
      setWishlists(active);
      if (active[0]) {
        setWishlistId(active[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!url) {
      setDetecting(false);
      return;
    }
    void marketplaceService.importFromUrl(url, text || undefined, pageTitle || undefined).then((draft) => {
      if (draft.title) {
        setTitle(draft.title);
      }
      setStore(draft.store);
      if (draft.brand) {
        setBrand(draft.brand);
      }
      if (draft.price) {
        setPriceAmount(String(draft.price.amountMinor / 100).replace(".", ","));
        setPriceCurrency(draft.price.currency);
      }
      if (draft.photos[0]) {
        setPhotoUrl(draft.photos[0]);
      }
      const attributeHints = [
        draft.color ? `Colore: ${draft.color}` : null,
        draft.size ? `Taglia: ${draft.size}` : null,
      ].filter((hint): hint is string => hint !== null);
      if (attributeHints.length > 0) {
        setNotes(attributeHints.join(", "));
      }
      const foundParts = [
        draft.price ? "prezzo" : null,
        draft.photos[0] ? "una foto" : null,
        draft.brand ? "marca" : null,
      ].filter((part): part is string => part !== null);
      setDetectMessage(
        foundParts.length > 0
          ? `Letto da ${draft.store || "questa pagina"}: ${foundParts.join(", ")}. Controlla i campi prima di salvare.`
          : `Rilevato solo il negozio (${draft.store || "sconosciuto"}) — completa gli altri campi a mano.`,
      );
      setDetecting(false);
    });
  }, [url, text, pageTitle]);

  async function handleAdd(): Promise<void> {
    if (!title.trim() || !wishlistId) {
      return;
    }
    const parsedAmount = priceAmount.trim() ? Number.parseFloat(priceAmount.replace(",", ".")) : null;
    const price =
      parsedAmount !== null && !Number.isNaN(parsedAmount) ? money(Math.round(parsedAmount * 100), priceCurrency) : null;
    const wishlist = wishlists.find((item) => item.id === wishlistId);

    await productService.add({
      wishlistId: wishlistId as Id,
      title,
      store,
      brand,
      category: wishlist?.category ?? "",
      priority,
      notes,
      photos: photoUrl ? [photoUrl] : [],
      price,
      originalUrl: url || null,
      ownerId: null,
    });
    setSaved(true);
    setTimeout(() => navigate(`/wishlists/${wishlistId}`), 800);
  }

  if (!url) {
    return (
      <section>
        <h1>➕ Aggiungi rapido</h1>
        <p className="empty-state">
          Questa pagina si apre dalla scorciatoia "Aggiungi a WishStar" mentre navighi su un negozio — vai su{" "}
          <Link to="/settings">Impostazioni</Link> per attivarla.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h1>➕ Aggiungi rapido</h1>
      {detecting ? (
        <p className="empty-state">Leggo la pagina…</p>
      ) : (
        detectMessage && <p className="success">{detectMessage}</p>
      )}

      {wishlists.length === 0 ? (
        <p className="empty-state">
          Non hai ancora nessuna lista — <Link to="/">creane una</Link> prima di aggiungere un articolo.
        </p>
      ) : (
        <div className="card form-stack">
          <label>
            Aggiungi alla lista
            <select value={wishlistId} onChange={(event) => setWishlistId(event.target.value)}>
              {wishlists.map((wishlist) => (
                <option key={wishlist.id} value={wishlist.id}>
                  {getCategoryEmoji(wishlist.category)} {wishlist.title}
                </option>
              ))}
            </select>
          </label>

          {photoUrl && <img className="wishlist-cover" src={photoUrl} alt="Anteprima foto prodotto" />}

          <div className="form-row">
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Nome prodotto" />
            <input value={store} onChange={(event) => setStore(event.target.value)} placeholder="Negozio" />
          </div>
          <div className="form-row">
            <input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Marca" />
            <input
              value={priceAmount}
              onChange={(event) => setPriceAmount(event.target.value)}
              placeholder="Prezzo (es. 29,99)"
              inputMode="decimal"
            />
            <select value={priceCurrency} onChange={(event) => setPriceCurrency(event.target.value)}>
              <option value="EUR">EUR €</option>
              <option value="USD">USD $</option>
              <option value="GBP">GBP £</option>
            </select>
          </div>
          <div className="form-row">
            <select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
              {(Object.keys(PRIORITY_LABELS) as Priority[]).map((option) => (
                <option key={option} value={option}>
                  Priorità {PRIORITY_LABELS[option]}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Note (taglia, colore, link...)"
          />
          <button type="button" onClick={() => void handleAdd()} disabled={!title.trim()}>
            Aggiungi alla lista
          </button>
          {saved && <p className="success">Aggiunto! Ti riporto alla lista…</p>}
        </div>
      )}
    </section>
  );
}
