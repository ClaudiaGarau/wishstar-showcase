const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Branded UUID. Generated locally but globally unique, so entities created
 * offline never collide once a future sync target is introduced.
 */
export type Id = string & { readonly __brand: "Id" };

export function generateId(): Id {
  return crypto.randomUUID() as Id;
}

export function isId(value: unknown): value is Id {
  return typeof value === "string" && UUID_PATTERN.test(value);
}
