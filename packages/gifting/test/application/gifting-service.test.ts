import { EventBus, generateId } from "@wishstar/core";
import { describe, expect, it, vi } from "vitest";
import { GiftingService } from "../../src/application/gifting-service";
import type { ReservationView } from "../../src/domain/reservation-view";
import type { GiftReservationPort } from "../../src/ports";

class FakeGiftReservationPort implements GiftReservationPort {
  view: ReservationView = { status: "available", reservedByMe: false };

  async reserve(): Promise<void> {
    this.view = { status: "reserved", reservedByMe: true };
  }

  async cancel(): Promise<void> {
    this.view = { status: "available", reservedByMe: false };
  }

  async getView(): Promise<ReservationView> {
    return this.view;
  }
}

describe("GiftingService", () => {
  it("reserves a product and emits gifting.reserved", async () => {
    const events = new EventBus();
    const listener = vi.fn();
    events.on("gifting.reserved", listener);
    const service = new GiftingService(new FakeGiftReservationPort(), events);
    const productId = generateId();

    await service.reserve(productId);

    expect(listener).toHaveBeenCalledWith({ productId });
    await expect(service.getView(productId)).resolves.toEqual({ status: "reserved", reservedByMe: true });
  });

  it("cancels a reservation and emits gifting.cancelled", async () => {
    const events = new EventBus();
    const listener = vi.fn();
    events.on("gifting.cancelled", listener);
    const port = new FakeGiftReservationPort();
    const service = new GiftingService(port, events);
    const productId = generateId();
    await service.reserve(productId);

    await service.cancel(productId);

    expect(listener).toHaveBeenCalledWith({ productId });
    await expect(service.getView(productId)).resolves.toEqual({ status: "available", reservedByMe: false });
  });
});
