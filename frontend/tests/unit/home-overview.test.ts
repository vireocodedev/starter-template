import { describe, expect, it } from "vitest";
import type { Item } from "@/features/item/public";
import { buildHomeOverviewSnapshot, selectHomeAttentionItems } from "@/pages/home/home-overview";

const items: Item[] = [
  { id: 1, name: "Scanners", description: "", quantity: 18, status: "ACTIVE" },
  { id: 2, name: "Labels", description: "", quantity: 4, status: "ACTIVE" },
  { id: 3, name: "Inspection kits", description: "", quantity: 2, status: "DRAFT" },
  { id: 4, name: "Old tablets", description: "", quantity: 0, status: "ARCHIVED" },
];

describe("home overview projection", () => {
  it("summarizes the inventory snapshot", () => {
    expect(buildHomeOverviewSnapshot(items, 12)).toEqual({
      activeCount: 2,
      archivedCount: 1,
      draftCount: 1,
      lowStockCount: 2,
      statusCounts: { ACTIVE: 2, ARCHIVED: 1, DRAFT: 1 },
      totalItems: 12,
      totalUnits: 24,
    });
  });

  it("prioritizes actionable stock by quantity", () => {
    expect(selectHomeAttentionItems(items).map(item => item.name)).toEqual(["Inspection kits", "Labels"]);
  });
});
