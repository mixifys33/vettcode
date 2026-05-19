/** Normalize seller/shop id from API shapes (string, ObjectId, populated doc). */
export function resolveSellerId(item: unknown): string {
  if (!item || typeof item !== "object") return "";
  const obj = item as Record<string, unknown>;
  const raw =
    obj.sellerId ??
    obj.shopId ??
    (obj.Seller as Record<string, unknown> | undefined)?.id ??
    (obj.Seller as Record<string, unknown> | undefined)?._id ??
    (obj.seller as Record<string, unknown> | undefined)?.id ??
    (obj.seller as Record<string, unknown> | undefined)?._id ??
    (obj.Shop as Record<string, unknown> | undefined)?.id ??
    (obj.Shop as Record<string, unknown> | undefined)?._id;

  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && raw !== null) {
    const doc = raw as Record<string, unknown>;
    return String(doc._id ?? doc.id ?? "");
  }
  return String(raw);
}
