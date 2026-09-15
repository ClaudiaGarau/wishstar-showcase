import { describe, expect, it } from "vitest";
import { createSyncMeta, touch, type BaseEntity } from "../src/entity";
import { generateId } from "../src/id";

function makeEntity(status: BaseEntity["sync"]["status"] = "local-only"): BaseEntity {
  return {
    id: generateId(),
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ownerId: null,
    sync: { ...createSyncMeta(), status },
  };
}

describe("touch", () => {
  it("bumps updatedAt and revision", () => {
    const entity = makeEntity();
    const touched = touch(entity);
    expect(touched.sync.revision).toBe(entity.sync.revision + 1);
    expect(new Date(touched.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(entity.updatedAt).getTime(),
    );
  });

  it("keeps local-only entities local-only", () => {
    const entity = makeEntity("local-only");
    expect(touch(entity).sync.status).toBe("local-only");
  });

  it("marks previously synced entities dirty again", () => {
    const entity = makeEntity("synced");
    expect(touch(entity).sync.status).toBe("dirty");
  });
});
