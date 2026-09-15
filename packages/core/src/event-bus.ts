import type { Unsubscribe } from "./types";

/**
 * Empty by design. Each module augments this interface via declaration
 * merging to register its own event names/payloads, e.g.:
 *
 *   declare module "@wishstar/core" {
 *     interface WishStarEventMap {
 *       "wishlist.product_added": { wishlistId: Id; productId: Id };
 *     }
 *   }
 *
 * This lets modules publish and subscribe to each other's events with full
 * type safety while Core never imports from Wishlist, Marketplace, etc.
 * The same event shapes are what a future push-notification adapter or a
 * social/cloud relay would forward, so no redesign is needed to go from
 * local-only events to cross-user ones.
 */
export interface WishStarEventMap {}

export type EventName = keyof WishStarEventMap;
export type EventPayload<K extends EventName> = WishStarEventMap[K];
export type EventListener<K extends EventName> = (payload: EventPayload<K>) => void;

type AnyListener = (payload: any) => void;

export class EventBus {
  // Untyped internally (EventName is `never` until a module augments the
  // map); the public methods below are what actually enforce type safety.
  private readonly listeners = new Map<PropertyKey, Set<AnyListener>>();

  on<K extends EventName>(event: K, listener: EventListener<K>): Unsubscribe {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener);
    return () => {
      set.delete(listener);
    };
  }

  emit<K extends EventName>(event: K, payload: EventPayload<K>): void {
    const set = this.listeners.get(event);
    if (!set || set.size === 0) return;
    for (const listener of [...set]) {
      listener(payload);
    }
  }

  off<K extends EventName>(event: K, listener: EventListener<K>): void {
    this.listeners.get(event)?.delete(listener);
  }
}

/** Shared bus instance for modules that don't need an isolated one (e.g. tests). */
export const globalEventBus = new EventBus();
