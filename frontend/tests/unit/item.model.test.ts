import { describe, expect, it } from "vitest";
import { buildValidatedItemSchema, Item } from "@/features/item/models/Item";
import { appI18n } from "@/app/ui/localization/app-i18n";

describe("item contracts", () => {
  it("accepts a complete item form value", () => {
    expect(
      buildValidatedItemSchema(appI18n.getFixedT("en", "item")).parse({
        id: 0,
        name: "Design system audit",
        description: "Review Vireo usage.",
        quantity: 2,
        status: "ACTIVE",
      }),
    ).toEqual({
      id: 0,
      name: "Design system audit",
      description: "Review Vireo usage.",
      quantity: 2,
      status: "ACTIVE",
    });
  });

  it("rejects invalid quantities before an API request", () => {
    expect(() =>
      buildValidatedItemSchema(appI18n.getFixedT("en", "item")).parse({
        id: 0,
        name: "Audit",
        description: "",
        quantity: -1,
        status: "DRAFT",
      }),
    ).toThrow();
  });

  it("normalizes nullable API descriptions", () => {
    const item = Item.parse({
      id: 1,
      name: "Audit",
      description: null,
      quantity: 0,
      status: "DRAFT",
    });
    expect(item.description).toBe("");
  });
});
