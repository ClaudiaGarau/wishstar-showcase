import { EventBus, generateId } from "@wishstar/core";
import { describe, expect, it, vi } from "vitest";
import { OwnerNotificationService } from "../../src/application/owner-notification-service";
import type { OwnerNotification } from "../../src/domain/owner-notification";
import type { OwnerNotificationPort } from "../../src/ports";

class FakeOwnerNotificationPort implements OwnerNotificationPort {
  queued: OwnerNotification[] = [];
  submittedNotes: Array<{ wishlistId: string; note: string }> = [];

  async fetchAndClear(): Promise<OwnerNotification[]> {
    const result = this.queued;
    this.queued = [];
    return result;
  }

  async submitDonationNote(wishlistId: string, note: string): Promise<void> {
    this.submittedNotes.push({ wishlistId, note });
  }
}

describe("OwnerNotificationService", () => {
  it("re-emits fetched notifications on the event bus and clears them", async () => {
    const events = new EventBus();
    const listener = vi.fn();
    events.on("gifting.owner_notification", listener);
    const port = new FakeOwnerNotificationPort();
    const notification: OwnerNotification = {
      id: generateId(),
      kind: "gift_reserved",
      message: "Qualcuno ha prenotato un regalo per te! 🎁",
      createdAt: new Date().toISOString(),
    };
    port.queued = [notification];
    const service = new OwnerNotificationService(port, events);

    const stop = service.start(1_000_000);
    await Promise.resolve();
    await Promise.resolve();

    expect(listener).toHaveBeenCalledWith(notification);
    await expect(port.fetchAndClear()).resolves.toEqual([]);
    stop();
  });

  it("forwards a donation note to the port unchanged", async () => {
    const events = new EventBus();
    const port = new FakeOwnerNotificationPort();
    const service = new OwnerNotificationService(port, events);
    const wishlistId = generateId();

    await service.submitDonationNote(wishlistId, "Grazie per tutto!");

    expect(port.submittedNotes).toEqual([{ wishlistId, note: "Grazie per tutto!" }]);
  });
});
