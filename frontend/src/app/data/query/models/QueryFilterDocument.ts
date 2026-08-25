import {
  QueryEngineOperatorSchema,
  QueryEngineRelationOptionSchema,
  type QueryEngineOperator,
  type QueryEngineRelationOption,
} from "@vireocodedev/starter-queryengine";
import { z } from "zod";
import type { TFunction } from "i18next";
import { AppQueryEntityKeySchema, type AppQueryEntityKey } from "./AppQueryEntityKey";
import type { ENTITY_QUERY_FILTERS_TRANSLATION_NAMESPACE } from "@/app/app.localization";

export const QueryFilterLeafRowSchema = z.object({
  kind: z.literal("leaf"),
  path: z.string().trim().min(1),
  operator: QueryEngineOperatorSchema,
  value: z.string().default(""),
  parameterized: z.literal(false).default(false),
  selectedOptions: z.array(QueryEngineRelationOptionSchema).default([]),
});

export const QueryFilterRelationRowSchema = z.object({
  kind: z.literal("relation"),
  path: z.string().trim().min(1),
  operator: z.null().default(null),
  value: z.string().default(""),
  parameterized: z.literal(false).default(false),
  selectedOptions: z.array(QueryEngineRelationOptionSchema).min(1),
});

export const QueryFilterRowSchema = z.discriminatedUnion("kind", [
  QueryFilterLeafRowSchema,
  QueryFilterRelationRowSchema,
]);

const nullaryOperators = new Set<QueryEngineOperator>(["IS_NULL", "IS_NOT_NULL"]);

export const QueryFilterDocumentSchema = z.object({
  entity: AppQueryEntityKeySchema,
  javaType: z.string().trim().min(1).nullable().optional(),
  rows: z.array(QueryFilterRowSchema),
});

export function buildValidatedQueryFilterDocumentSchema(
  t: TFunction<typeof ENTITY_QUERY_FILTERS_TRANSLATION_NAMESPACE>,
) {
  return QueryFilterDocumentSchema.superRefine((document, context) => {
    const signatures = new Set<string>();
    document.rows.forEach((row, index) => {
      if (row.kind === "leaf" && !nullaryOperators.has(row.operator) && !row.value.trim()) {
        context.addIssue({
          code: "custom",
          message: t("validation.value"),
          path: ["rows", index, "value"],
        });
      }

      const signature = stableStringify({
        kind: row.kind,
        operator: row.operator,
        path: row.path,
        selectedOptions: row.selectedOptions.map(option => option.value).sort(),
        value: row.value.trim(),
      });
      if (signatures.has(signature)) {
        context.addIssue({
          code: "custom",
          message: t("validation.duplicate"),
          path: ["rows", index],
        });
      }
      signatures.add(signature);
    });
  });
}

export type QueryFilterLeafRow = z.infer<typeof QueryFilterLeafRowSchema>;
export type QueryFilterRelationRow = z.infer<typeof QueryFilterRelationRowSchema>;
export type QueryFilterRow = z.infer<typeof QueryFilterRowSchema>;
export type QueryFilterDocument = z.infer<typeof QueryFilterDocumentSchema>;
export type QueryFilterRelationOption = QueryEngineRelationOption;

export function parseQueryFilterDocument(
  value: unknown,
  expectedEntity?: AppQueryEntityKey,
): QueryFilterDocument | null {
  if (value == null) return null;
  const parsed = QueryFilterDocumentSchema.parse(value);
  if (expectedEntity && parsed.entity !== expectedEntity) {
    throw new Error(`Invalid filter entity. Expected ${expectedEntity}, received ${parsed.entity}.`);
  }
  return parsed.rows.length === 0 ? null : parsed;
}

export function serializeQueryFilterDocument(
  value: QueryFilterDocument | null,
  expectedEntity: AppQueryEntityKey,
): string | null {
  const parsed = parseQueryFilterDocument(value, expectedEntity);
  return parsed ? stableStringify(parsed) : null;
}

export function countQueryFilterRules(value: QueryFilterDocument | null): number {
  return value?.rows.length ?? 0;
}

function stableStringify(value: unknown): string {
  if (value == null || typeof value !== "object") return JSON.stringify(value) ?? String(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => item !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(",")}}`;
}
