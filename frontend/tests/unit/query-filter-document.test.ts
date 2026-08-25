import { describe, expect, it } from "vitest";
import {
  buildValidatedQueryFilterDocumentSchema,
  parseQueryFilterDocument,
  serializeQueryFilterDocument,
} from "@/app/data/query/models/QueryFilterDocument";
import { appI18n } from "@/app/ui/localization/app-i18n";

const validatedDocumentSchema = buildValidatedQueryFilterDocumentSchema(appI18n.getFixedT("en", "entityQueryFilters"));

const activeFilter = {
  entity: "ITEM" as const,
  rows: [
    {
      kind: "leaf" as const,
      path: "status",
      operator: "EQUALS" as const,
      value: "ACTIVE",
      parameterized: false as const,
      selectedOptions: [],
    },
  ],
};

describe("query filter document", () => {
  it("serializes a validated document deterministically", () => {
    expect(serializeQueryFilterDocument(activeFilter, "ITEM")).toBe(
      '{"entity":"ITEM","rows":[{"kind":"leaf","operator":"EQUALS","parameterized":false,"path":"status","selectedOptions":[],"value":"ACTIVE"}]}',
    );
  });

  it("normalizes an empty document to null", () => {
    expect(parseQueryFilterDocument({ entity: "ITEM", rows: [] }, "ITEM")).toBeNull();
  });

  it("rejects a document for another entity before transport", () => {
    expect(() => parseQueryFilterDocument(activeFilter, "SAVED_FILTER")).toThrow(/Expected SAVED_FILTER/);
  });

  it("rejects parameterized, incomplete, and duplicate rules", () => {
    expect(
      validatedDocumentSchema.safeParse({
        entity: "ITEM",
        rows: [{ ...activeFilter.rows[0], parameterized: true }],
      }).success,
    ).toBe(false);
    expect(
      validatedDocumentSchema.safeParse({
        entity: "ITEM",
        rows: [{ ...activeFilter.rows[0], value: "" }],
      }).success,
    ).toBe(false);
    expect(
      validatedDocumentSchema.safeParse({
        entity: "ITEM",
        rows: [activeFilter.rows[0], activeFilter.rows[0]],
      }).success,
    ).toBe(false);
  });
});
