import { describe, expect, it, vi } from "vitest";
import { EventBus } from "../src/event-bus";

// Mirrors how a real module (e.g. Wishlist) registers its own events into
// the shared map without Core knowing about it.
declare module "../src/event-bus" {
  interface WishStarEventMap {
    "test.ping": { count: number };
  }
}

describe("EventBus", () => {
  it("delivers the payload to a subscribed listener", () => {
    const bus = new EventBus();
    const listener = vi.fn();
    bus.on("test.ping", listener);

    bus.emit("test.ping", { count: 1 });

    expect(listener).toHaveBeenCalledWith({ count: 1 });
  });

  it("stops delivering events after unsubscribe", () => {
    const bus = new EventBus();
    const listener = vi.fn();
    const unsubscribe = bus.on("test.ping", listener);

    unsubscribe();
    bus.emit("test.ping", { count: 1 });

    expect(listener).not.toHaveBeenCalled();
  });

  it("does not throw when emitting to an event with no listeners", () => {
    const bus = new EventBus();
    expect(() => bus.emit("test.ping", { count: 1 })).not.toThrow();
  });

  it("keeps listeners isolated between separate bus instances", () => {
    const busA = new EventBus();
    const busB = new EventBus();
    const listenerA = vi.fn();
    busA.on("test.ping", listenerA);

    busB.emit("test.ping", { count: 1 });

    expect(listenerA).not.toHaveBeenCalled();
  });
});
