import type { EventBus, Id, Unsubscribe } from "@wishstar/core";
import "../events";
import type { OwnerNotificationPort } from "../ports";

/**
 * Cross-device notification delivery with no push infra: a device learns
 * about a reservation or donation note made on another device only by
 * polling. Each fetched row is re-emitted on the EventBus so
 * @wishstar/notifications (which never imports this module directly, only
 * its event types) can turn it into a NotificationMessage — same one-way
 * dependency pattern as every other producer it listens to.
 */
export class OwnerNotificationService {
  constructor(
    private readonly port: OwnerNotificationPort,
    private readonly events: EventBus,
  ) {}

  async submitDonationNote(wishlistId: Id, note: string): Promise<void> {
    await this.port.submitDonationNote(wishlistId, note);
  }

  private async poll(): Promise<void> {
    const notifications = await this.port.fetchAndClear();
    for (const notification of notifications) {
      this.events.emit("gifting.owner_notification", notification);
    }
  }

  /** Polls immediately, then on an interval. Returns a teardown that stops it. */
  start(intervalMs = 60_000): Unsubscribe {
    void this.poll();
    const handle = setInterval(() => void this.poll(), intervalMs);
    return () => clearInterval(handle);
  }
}
