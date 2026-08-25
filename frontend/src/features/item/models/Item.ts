import { z } from "zod";
import type { ValidatedSchemaFactory } from "@/app/ui/localization/validated-schema";

export const ItemStatus = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]);
export type ItemStatus = z.infer<typeof ItemStatus>;

export const Item = z.object({
  id: z.number(),
  name: z.string(),
  description: z
    .string()
    .nullable()
    .transform(value => value ?? ""),
  quantity: z.number().int().nonnegative(),
  status: ItemStatus,
});

export type Item = z.infer<typeof Item>;

export function getDefaultItem(): Item {
  return {
    id: 0,
    name: "",
    description: "",
    quantity: 0,
    status: "DRAFT",
  };
}

export const buildValidatedItemSchema: ValidatedSchemaFactory<Item, "item"> = t =>
  Item.extend({
    name: Item.shape.name.trim().min(2, t("validation.name.min")),
    description: Item.shape.description.refine(value => value.length <= 2000, {
      message: t("validation.description.max"),
    }),
    quantity: Item.shape.quantity
      .int(t("validation.quantity.integer"))
      .nonnegative(t("validation.quantity.nonnegative")),
  }) as z.ZodType<Item, Item>;
