/**
 * Portfolio-safe domain excerpt: wishlist privacy and gift reservation rules.
 * Persistence, auth and production integrations are intentionally omitted.
 */
export type Visibility = 'private' | 'friends' | 'public';

export interface WishlistItem {
  id: string;
  url: string;
  title: string;
  reservedBy?: string;
}

export interface Wishlist {
  ownerId: string;
  visibility: Visibility;
  items: WishlistItem[];
}

export function canView(list: Wishlist, viewerId: string, isFriend: boolean): boolean {
  if (list.ownerId === viewerId) return true;
  if (list.visibility === 'public') return true;
  return list.visibility === 'friends' && isFriend;
}

export function reserveItem(list: Wishlist, itemId: string, reserverId: string): Wishlist {
  return {
    ...list,
    items: list.items.map(item =>
      item.id === itemId && !item.reservedBy ? { ...item, reservedBy: reserverId } : item,
    ),
  };
}
