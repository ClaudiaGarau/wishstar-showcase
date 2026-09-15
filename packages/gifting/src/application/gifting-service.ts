import type { EventBus, Id } from "@wishstar/core";
import "../events";
import type { ReservationView } from "../domain/reservation-view";
import type { GiftReservationPort } from "../ports";

export class GiftingService {
  constructor(
    private readonly port: GiftReservationPort,
    private readonly events: EventBus,
  ) {}

  async reserve(productId: Id): Promise<void> {
    await this.port.reserve(productId);
    this.events.emit("gifting.reserved", { productId });
  }

  async cancel(productId: Id): Promise<void> {
    await this.port.cancel(productId);
    this.events.emit("gifting.cancelled", { productId });
  }

  async getView(productId: Id): Promise<ReservationView> {
    return this.port.getView(productId);
  }
}
