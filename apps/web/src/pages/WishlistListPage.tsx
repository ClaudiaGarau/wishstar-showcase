import type { Id } from "@wishstar/core";
import { SUGGESTED_WISHLIST_CATEGORIES, type Wishlist } from "@wishstar/wishlist";
import { type FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { wishlistService } from "../services/container";
import { getCategoryEmoji } from "../utils/categoryEmoji";

export function WishlistListPage() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(SUGGESTED_WISHLIST_CATEGORIES[0]);

  async function refresh(): Promise<void> {
    const all = await wishlistService.list();
    setWishlists(all.filter((wishlist) => !wishlist.archived));
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleCreate(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }
    await wishlistService.create({ title, category, ownerId: null });
    setTitle("");
    await refresh();
  }

  async function handleDelete(id: Id, wishlistTitle: string): Promise<void> {
    if (!window.confirm(`Eliminare "${wishlistTitle}" e tutti i suoi prodotti? Non si può annullare.`)) {
      return;
    }
    await wishlistService.delete(id);
    await refresh();
  }

  if (loading) {
    return <p>Caricamento…</p>;
  }

  return (
    <section>
      <h1>✨ Le mie wishlist</h1>

      <form onSubmit={handleCreate} className="card form-inline">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Nome della lista (es. Compleanno di Marco)"
        />
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {SUGGESTED_WISHLIST_CATEGORIES.map((suggested) => (
            <option key={suggested} value={suggested}>
              {suggested}
            </option>
          ))}
        </select>
        <button type="submit">Crea lista</button>
      </form>

      {wishlists.length === 0 ? (
        <p className="empty-state">Non c'è ancora nessuna lista qui 🎀 Creane una qui sopra!</p>
      ) : (
        <ul className="wishlist-grid">
          {wishlists.map((wishlist) => (
            <li key={wishlist.id} className="card wishlist-row">
              <Link to={`/wishlists/${wishlist.id}`}>
                <span className="category-emoji">{getCategoryEmoji(wishlist.category)}</span>
                <span>
                  <strong>{wishlist.title}</strong>
                  <span className="badge">{wishlist.category}</span>
                  {wishlist.themeColor && (
                    <span className="color-dot" style={{ background: wishlist.themeColor }} />
                  )}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => void handleDelete(wishlist.id, wishlist.title)}
                aria-label="Elimina lista"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
