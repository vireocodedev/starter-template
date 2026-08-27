import { describe, expect, it } from "vitest";
import type { QueryEngineEntityDefinition } from "@vireocodedev/query";
import {
  createQueryFilterCandidates,
  createQueryFilterRule,
  formatQueryFilterRowSummary,
  formatQueryResultCount,
  validateQueryFilterDraft,
} from "@/features/entity-query-filters/services/entityQueryFilters";
import { appI18n } from "@/app/ui/localization/app-i18n";

const t = appI18n.getFixedT("en", "entityQueryFilters");

const definition: QueryEngineEntityDefinition = {
  key: "ITEM",
  title: "item.title",
  fields: [
    {
      path: "name",
      label: "item.fields.name",
      type: "STRING",
      enumType: null,
      enumValues: [],
      operators: ["CONTAINS", "EQUALS"],
      relation: false,
      relationEntityKey: null,
      relationMode: "CHILD",
      multiple: false,
      relationSelectionLabelFields: [],
      expandable: false,
      maxDepth: 0,
      children: [],
    },
  ],
};

describe("entity query filter draft", () => {
  it("derives candidates from backend metadata and presentation overrides", () => {
    const candidates = createQueryFilterCandidates({
      entityKey: "ITEM",
      definition,
      presentation: { fields: { name: { label: "Item name" } } },
    });
    expect(candidates).toMatchObject([{ id: "leaf:name", label: "Item name", operators: ["CONTAINS", "EQUALS"] }]);
  });

  it("preserves incomplete rows and blocks Apply until they are valid", () => {
    const candidates = createQueryFilterCandidates({ entityKey: "ITEM", definition });
    const rule = createQueryFilterRule(candidates[0], "rule-1");
    const invalid = validateQueryFilterDraft("ITEM", [rule], candidates, t);
    expect(invalid.document).toBeNull();
    expect(invalid.errors[rule.id]).toBe("Enter a filter value.");

    const valid = validateQueryFilterDraft(
      "ITEM",
      [{ ...rule, value: { kind: "scalar", value: "audit" } }],
      candidates,
      t,
    );
    expect(valid.errors).toEqual({});
    expect(valid.document?.rows[0]).toMatchObject({ path: "name", operator: "CONTAINS", value: "audit" });
  });

  it("formats active rules with presentation and enum labels", () => {
    expect(
      formatQueryFilterRowSummary(
        {
          kind: "leaf",
          path: "status",
          operator: "EQUALS",
          value: "ARCHIVED",
          parameterized: false,
          selectedOptions: [],
        },
        t,
        { fields: { status: { label: "Status", enumLabels: { ARCHIVED: "Archived" } } } },
      ),
    ).toBe("Status · is · Archived");
  });

  it("keeps four-digit result counts exact and compacts larger totals", () => {
    expect(formatQueryResultCount(9_999)).toBe((9_999).toLocaleString());
    expect(formatQueryResultCount(10_000)).toBe("10k+");
    expect(formatQueryResultCount(12_345_678_912_345)).toBe("12.3T+");
  });
});
