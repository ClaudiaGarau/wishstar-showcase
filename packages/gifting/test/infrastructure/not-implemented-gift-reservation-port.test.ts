import { generateId } from "@wishstar/core";
import { describe, expect, it } from "vitest";
import { NotImplementedGiftReservationPort } from "../../src/infrastructure/not-implemented-gift-reservation-port";

describe("NotImplementedGiftReservationPort", () => {
  const port = new NotImplementedGiftReservationPort();
  const productId = generateId();

  it("rejects reserve() with an explanatory message", async () => {
    await expect(port.reserve(productId)).rejects.toThrow(/cloud/i);
  });

  it("rejects cancel() with an explanatory message", async () => {
    await expect(port.cancel(productId)).rejects.toThrow(/cloud/i);
  });

  it("rejects getView() with an explanatory message", async () => {
    await expect(port.getView(productId)).rejects.toThrow(/cloud/i);
  });
});
