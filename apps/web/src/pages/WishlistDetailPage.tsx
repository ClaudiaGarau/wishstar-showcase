import { money, type Id } from "@wishstar/core";
import type { Priority, Product, Wishlist } from "@wishstar/wishlist";
import { type ChangeEvent, type CSSProperties, type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShareCard } from "../components/ShareCard";
import { useIsRegistered } from "../hooks/useIsRegistered";
import { marketplaceService, productService, wishlistService } from "../services/container";
import { getCategoryEmoji } from "../utils/categoryEmoji";
import { formatMoney } from "../utils/formatMoney";
import { readFileAsDataUrl } from "../utils/readFileAsDataUrl";

const PRIORITY_LABELS: Record<Priority, string> = { low: "Bassa", medium: "Media", high: "Alta" };

export function WishlistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const wishlistId = id as Id;
  const registered = useIsRegistered();

  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPriority, setEditPriority] = useState<Priority>("medium");
  const [editBudgetAmount, setEditBudgetAmount] = useState("");
  const [editBudgetCurrency, setEditBudgetCurrency] = useState("EUR");
  const [editNotes, setEditNotes] = useState("");
  const [editDonationLink, setEditDonationLink] = useState("");
  const [editSaved, setEditSaved] = useState(false);

  const [title, setTitle] = useState("");
  const [store, setStore] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [priceAmount, setPriceAmount] = useState("");
  const [priceCurrency, setPriceCurrency] = useState("EUR");
  const [priority, setPriority] = useState<Priority>("medium");
  const [notes, setNotes] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [detectMessage, setDetectMessage] = useState<string | null>(null);
  const [detectedPhotoUrl, setDetectedPhotoUrl] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);

  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  const [pendingThemeColor, setPendingThemeColor] = useState("#ff8fab");
  const [pendingCoverImage, setPendingCoverImage] = useState<string | null>(null);
  const [customizeSaved, setCustomizeSaved] = useState(false);

  async function refresh(): Promise<void> {
    const [loadedWishlist, items] = await Promise.all([
      wishlistService.get(wishlistId),
      productService.listByWishlist(wishlistId),
    ]);
    setWishlist(loadedWishlist);
    setProducts(items);
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!wishlist) {
      return;
    }
    setEditTitle(wishlist.title);
    setEditDescription(wishlist.description);
    setEditCategory(wishlist.category);
    setEditPriority(wishlist.priority);
    setEditBudgetAmount(wishlist.budget ? String(wishlist.budget.amountMinor / 100).replace(".", ",") : "");
    setEditBudgetCurrency(wishlist.budget?.currency ?? "EUR");
    setEditNotes(wishlist.notes);
    setEditDonationLink(wishlist.donationLink ?? "");
    setPendingThemeColor(wishlist.themeColor ?? "#ff8fab");
    setPendingCoverImage(wishlist.coverImage);
    // Deliberately keyed on the id, not the whole object: refresh() re-fetches
    // the wishlist after every product add/remove too, and re-syncing on
    // every one of those would wipe out an in-progress edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishlist?.id]);

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) {
      setPhotoDataUrl(null);
      return;
    }
    setPhotoDataUrl(await readFileAsDataUrl(file));
  }

  async function handleDetectLink(): Promise<void> {
    if (!linkUrl.trim()) {
      return;
    }
    setDetecting(true);
    setDetectMessage(null);
    const draft = await marketplaceService.importFromUrl(linkUrl.trim(), linkText.trim() || undefined);
    setDetecting(false);
    if (draft.title) {
      setTitle(draft.title);
    }
    setStore(draft.store);
    setOriginalUrl(draft.originalUrl);
    if (draft.brand) {
      setBrand(draft.brand);
    }
    if (draft.price) {
      setPriceAmount(String(draft.price.amountMinor / 100).replace(".", ","));
      setPriceCurrency(draft.price.currency);
    }
    if (draft.photos[0]) {
      setDetectedPhotoUrl(draft.photos[0]);
    }
    const attributeHints = [
      draft.color ? `Colore: ${draft.color}` : null,
      draft.size ? `Taglia: ${draft.size}` : null,
    ].filter((hint): hint is string => hint !== null);
    if (attributeHints.length > 0 && !notes.trim()) {
      setNotes(attributeHints.join(", "));
    }

    const foundParts = [
      draft.price ? `prezzo ${formatMoney(draft.price)}` : null,
      draft.photos[0] ? "una foto" : null,
      draft.color ? `colore ${draft.color}` : null,
      draft.size ? `taglia ${draft.size}` : null,
      draft.brand ? `marca ${draft.brand}` : null,
    ].filter((part): part is string => part !== null);
    setDetectMessage(
      foundParts.length > 0
        ? `Rilevato ${draft.store || "negozio sconosciuto"} — ${foundParts.join(", ")}. Controlla i campi qui sotto (restano tutti modificabili) prima di salvare.`
        : `Rilevato negozio: ${draft.store || "sconosciuto"}. Non riesco a leggere altro da qui — completa gli altri campi a mano, oppure incolla anche un pezzo di testo copiato dalla pagina (titolo, prezzo, colore, taglia...).`,
    );
  }

  async function handleAddProduct(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!title.trim() || !wishlist) {
      return;
    }
    const parsedAmount = priceAmount.trim() ? Number.parseFloat(priceAmount.replace(",", ".")) : null;
    const price = parsedAmount !== null && !Number.isNaN(parsedAmount)
      ? money(Math.round(parsedAmount * 100), priceCurrency)
      : null;

    await productService.add({
      wishlistId,
      title,
      store,
      brand,
      category: category.trim() || wishlist.category,
      priority,
      notes,
      photos: photoDataUrl ? [photoDataUrl] : detectedPhotoUrl ? [detectedPhotoUrl] : [],
      price,
      originalUrl,
      ownerId: null,
    });

    setTitle("");
    setStore("");
    setBrand("");
    setCategory("");
    setPriceAmount("");
    setNotes("");
    setPhotoDataUrl(null);
    setDetectedPhotoUrl(null);
    setOriginalUrl(null);
    setLinkUrl("");
    setLinkText("");
    setDetectMessage(null);
    await refresh();
  }

  async function handleRemove(productId: Id): Promise<void> {
    await productService.remove(productId);
    await refresh();
  }

  async function handleSaveDetails(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!editTitle.trim()) {
      return;
    }
    const parsedBudget = editBudgetAmount.trim()
      ? Number.parseFloat(editBudgetAmount.replace(",", "."))
      : null;
    const updated = await wishlistService.update(wishlistId, {
      title: editTitle,
      description: editDescription,
      category: editCategory,
      priority: editPriority,
      notes: editNotes,
      donationLink: editDonationLink.trim() || null,
      budget:
        parsedBudget !== null && !Number.isNaN(parsedBudget)
          ? money(Math.round(parsedBudget * 100), editBudgetCurrency)
          : null,
    });
    setWishlist(updated);
    setEditSaved(true);
  }

  async function handleDeleteWishlist(): Promise<void> {
    if (!wishlist) {
      return;
    }
    if (!window.confirm(`Eliminare "${wishlist.title}" e tutti i suoi prodotti? Non si può annullare.`)) {
      return;
    }
    await wishlistService.delete(wishlistId);
    navigate("/");
  }

  function handleThemeColorChange(color: string): void {
    setPendingThemeColor(color);
    setCustomizeSaved(false);
  }

  async function handleCoverImageChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setPendingCoverImage(await readFileAsDataUrl(file));
    setCustomizeSaved(false);
  }

  async function handleSaveCustomization(): Promise<void> {
    const updated = await wishlistService.update(wishlistId, {
      themeColor: pendingThemeColor,
      coverImage: pendingCoverImage,
    });
    setWishlist(updated);
    setCustomizeSaved(true);
  }

  if (!wishlist) {
    return <p>Caricamento…</p>;
  }

  const themeStyle = wishlist.themeColor
    ? ({ "--color-primary": wishlist.themeColor, "--color-primary-strong": wishlist.themeColor } as CSSProperties)
    : undefined;

  return (
    <section style={themeStyle}>
      {wishlist.coverImage && <img src={wishlist.coverImage} alt="" className="wishlist-cover" />}
      <h1>
        {getCategoryEmoji(wishlist.category)} {wishlist.title}
      </h1>
      <p>
        <span className="badge">{wishlist.category}</span>
      </p>
      {wishlist.description && <p>{wishlist.description}</p>}

      <ShareCard wishlistId={wishlist.id} />

      {products.length === 0 ? (
        <p className="empty-state">Nessun prodotto ancora 🎁</p>
      ) : (
        <ul className="product-list">
          {products.map((product) => (
            <li key={product.id} className="card">
              <div className="product-info">
                {product.photos[0] ? (
                  <img className="product-photo" src={product.photos[0]} alt="" />
                ) : (
                  <span className="category-emoji">{getCategoryEmoji(product.category)}</span>
                )}
                <div>
                  <strong>{product.title}</strong>
                  {product.brand && <span className="badge">{product.brand}</span>}
                  {product.store && <span className="badge">{product.store}</span>}
                  {product.price && <span className="badge badge-price">{formatMoney(product.price)}</span>}
                  <span className={`badge badge-priority-${product.priority}`}>
                    Priorità {PRIORITY_LABELS[product.priority]}
                  </span>
                  {product.originalUrl && (
                    <a href={product.originalUrl} target="_blank" rel="noreferrer" className="badge">
                      Vai al negozio ↗
                    </a>
                  )}
                </div>
              </div>
              <button onClick={() => void handleRemove(product.id)} aria-label="Rimuovi prodotto">
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <button type="button" className="section-toggle" onClick={() => setShowAddProduct((value) => !value)}>
        {showAddProduct ? "▲ Chiudi" : "➕ Aggiungi un articolo"}
      </button>

      {showAddProduct && (
        <>
          <div className="card">
            <h2>🔗 Incolla un link</h2>
            <p className="empty-state">
              Provo a leggere la pagina da sola (titolo, prezzo, foto, marca) — funziona sulla maggior parte
              dei negozi, ma alcuni (Amazon, Temu in particolare) bloccano la lettura automatica dai server e
              restituiscono solo il nome del negozio. In quel caso incolla anche un pezzo di testo copiato
              dalla pagina (titolo, prezzo): da lì riesco comunque a leggere prezzo, colore e taglia, se
              presenti.
            </p>
            <div className="form-stack">
              <input
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                placeholder="https://…"
              />
              <textarea
                value={linkText}
                onChange={(event) => setLinkText(event.target.value)}
                placeholder="Testo copiato dalla pagina (opzionale)"
              />
              <button type="button" onClick={() => void handleDetectLink()} disabled={detecting}>
                {detecting ? "Leggo la pagina…" : "Rileva"}
              </button>
              {detectedPhotoUrl && !photoDataUrl && (
                <div className="customize-preview">
                  <img className="wishlist-cover" src={detectedPhotoUrl} alt="Foto rilevata" />
                  <button type="button" onClick={() => setDetectedPhotoUrl(null)}>
                    Rimuovi foto rilevata
                  </button>
                </div>
              )}
            </div>
            {detectMessage && <p className="success">{detectMessage}</p>}
          </div>

          <form onSubmit={(event) => void handleAddProduct(event)} className="card form-stack">
            <div className="form-row">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Nome prodotto"
              />
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder={`Categoria (es. ${wishlist.category})`}
              />
            </div>
            <div className="form-row">
              <input value={store} onChange={(event) => setStore(event.target.value)} placeholder="Negozio" />
              <input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Marca" />
            </div>
            <div className="form-row">
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
            <label>
              Foto (opzionale)
              <input type="file" accept="image/*" onChange={(event) => void handlePhotoChange(event)} />
            </label>
            {photoDataUrl && <img className="wishlist-cover" src={photoDataUrl} alt="Anteprima foto prodotto" />}
            <button type="submit">Aggiungi prodotto</button>
          </form>
        </>
      )}

      <button type="button" className="section-toggle" onClick={() => setShowEditForm((value) => !value)}>
        {showEditForm ? "▲ Chiudi" : "✏️ Modifica lista"}
      </button>

      {showEditForm && (
        <>
      <div className="card">
        <h2>✏️ Modifica lista</h2>
        <form onSubmit={(event) => void handleSaveDetails(event)} className="form-stack">
          <div className="form-row">
            <input
              value={editTitle}
              onChange={(event) => {
                setEditTitle(event.target.value);
                setEditSaved(false);
              }}
              placeholder="Titolo"
            />
            <input
              value={editCategory}
              onChange={(event) => {
                setEditCategory(event.target.value);
                setEditSaved(false);
              }}
              placeholder="Categoria"
            />
          </div>
          <textarea
            value={editDescription}
            onChange={(event) => {
              setEditDescription(event.target.value);
              setEditSaved(false);
            }}
            placeholder="Descrizione"
          />
          <div className="form-row">
            <input
              value={editBudgetAmount}
              onChange={(event) => {
                setEditBudgetAmount(event.target.value);
                setEditSaved(false);
              }}
              placeholder="Budget (es. 200,00)"
              inputMode="decimal"
            />
            <select
              value={editBudgetCurrency}
              onChange={(event) => {
                setEditBudgetCurrency(event.target.value);
                setEditSaved(false);
              }}
            >
              <option value="EUR">EUR €</option>
              <option value="USD">USD $</option>
              <option value="GBP">GBP £</option>
            </select>
            <select
              value={editPriority}
              onChange={(event) => {
                setEditPriority(event.target.value as Priority);
                setEditSaved(false);
              }}
            >
              {(Object.keys(PRIORITY_LABELS) as Priority[]).map((option) => (
                <option key={option} value={option}>
                  Priorità {PRIORITY_LABELS[option]}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={editNotes}
            onChange={(event) => {
              setEditNotes(event.target.value);
              setEditSaved(false);
            }}
            placeholder="Messaggio per chi visita la lista (opzionale) — es. le tue esigenze, taglie, preferenze…"
          />
          {registered === false ? (
            <p className="empty-state">
              🔒 Per impostare un link e ricevere contributi devi registrarti (email o Google, dal
              Profilo) — resta gratuito. Puoi comunque contribuire alle liste degli altri senza
              registrarti.
            </p>
          ) : (
            registered === true && (
              <input
                value={editDonationLink}
                onChange={(event) => {
                  setEditDonationLink(event.target.value);
                  setEditSaved(false);
                }}
                placeholder="Link per contribuire (Revolut.me, IBAN...) — opzionale"
              />
            )
          )}
          <div className="form-inline">
            <button type="submit">Salva modifiche</button>
            <button type="button" onClick={() => void handleDeleteWishlist()} className="danger-button">
              Elimina lista
            </button>
          </div>
          {editSaved && <p className="success">Lista aggiornata.</p>}
        </form>
      </div>

      <div className="card">
        <h2>🎨 Personalizza questa lista</h2>
        <div className="form-row">
          <label>
            Colore
            <input
              type="color"
              value={pendingThemeColor}
              onChange={(event) => handleThemeColorChange(event.target.value)}
            />
          </label>
          <label>
            Immagine di copertina
            <input type="file" accept="image/*" onChange={(event) => void handleCoverImageChange(event)} />
          </label>
        </div>
        <div className="customize-preview">
          <span className="color-dot" style={{ background: pendingThemeColor }} />
          {pendingCoverImage && (
            <img className="wishlist-cover" src={pendingCoverImage} alt="Anteprima copertina" />
          )}
        </div>
        <button type="button" onClick={() => void handleSaveCustomization()}>
          Salva modifiche
        </button>
        {customizeSaved && <p className="success">Personalizzazione aggiornata.</p>}
      </div>
        </>
      )}
    </section>
  );
}
