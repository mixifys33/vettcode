/** Normalize seller/shop id from API shapes (string, ObjectId, populated doc). */
export function resolveSellerId(item: Record<string, unknown> | null | undefined): string {
  if (!item) return "";
  const raw =
    item.sellerId ??
    item.shopId ??
    (item.Seller as Record<string, unknown> | undefined)?.id ??
    (item.Seller as Record<string, unknown> | undefined)?._id ??
    (item.seller as Record<string, unknown> | undefined)?.id ??
    (item.seller as Record<string, unknown> | undefined)?._id ??
    (item.Shop as Record<string, unknown> | undefined)?.id ??
    (item.Shop as Record<string, unknown> | undefined)?._id;

  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && raw !== null) {
    const doc = raw as Record<string, unknown>;
    return String(doc._id ?? doc.id ?? "");
  }
  return String(raw);
}
