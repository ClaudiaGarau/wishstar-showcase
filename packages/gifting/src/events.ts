import type { Id } from "@wishstar/core";
import type { OwnerNotification } from "./domain/owner-notification";

declare module "@wishstar/core" {
  interface WishStarEventMap {
    "gifting.reserved": { productId: Id };
    "gifting.cancelled": { productId: Id };
    "gifting.owner_notification": OwnerNotification;
  }
}
