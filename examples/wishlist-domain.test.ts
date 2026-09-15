import { canView, reserveItem, Wishlist } from './wishlist-domain';

describe('wishlist privacy and reservations', () => {
  const list: Wishlist = { ownerId: 'owner', visibility: 'friends', items: [{ id: 'gift-1', url: 'https://example.test/gift', title: 'Gift' }] };

  it('allows the owner and friends, but not strangers', () => {
    expect(canView(list, 'owner', false)).toBe(true);
    expect(canView(list, 'friend', true)).toBe(true);
    expect(canView(list, 'stranger', false)).toBe(false);
  });

  it('does not overwrite an existing reservation', () => {
    const reserved = reserveItem(list, 'gift-1', 'friend');
    expect(reserveItem(reserved, 'gift-1', 'another-friend').items[0].reservedBy).toBe('friend');
  });
});
