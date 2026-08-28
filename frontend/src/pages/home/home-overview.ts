import type { Item, ItemStatus } from "@/features/item/public";

export type HomeOverviewSnapshot = {
  activeCount: number;
  archivedCount: number;
  draftCount: number;
  lowStockCount: number;
  statusCounts: Record<ItemStatus, number>;
  totalItems: number;
  totalUnits: number;
};

export const HOME_LOW_STOCK_THRESHOLD = 5;

export function buildHomeOverviewSnapshot(items: readonly Item[], totalItems = items.length): HomeOverviewSnapshot {
  const statusCounts: Record<ItemStatus, number> = { ACTIVE: 0, ARCHIVED: 0, DRAFT: 0 };

  for (const item of items) statusCounts[item.status] += 1;

  return {
    activeCount: statusCounts.ACTIVE,
    archivedCount: statusCounts.ARCHIVED,
    draftCount: statusCounts.DRAFT,
    lowStockCount: items.filter(item => item.status !== "ARCHIVED" && item.quantity <= HOME_LOW_STOCK_THRESHOLD).length,
    statusCounts,
    totalItems,
    totalUnits: items.reduce((total, item) => total + item.quantity, 0),
  };
}

export function selectHomeAttentionItems(items: readonly Item[], limit = 4): Item[] {
  return [...items]
    .filter(
      item => item.status !== "ARCHIVED" && (item.quantity <= HOME_LOW_STOCK_THRESHOLD || item.status === "DRAFT"),
    )
    .sort((left, right) => left.quantity - right.quantity || left.name.localeCompare(right.name))
    .slice(0, limit);
}
