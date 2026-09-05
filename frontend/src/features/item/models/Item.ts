import { z } from "zod";
import type { ValidatedSchemaFactory } from "@/app/ui/localization/validated-schema";
import { AppFormMode } from "@/app/ui/forms/models/AppFormMode";

export const ItemStatus = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]);
export type ItemStatus = z.infer<typeof ItemStatus>;

export const Item = z.object({
  id: z.uuid(),
  version: z.number().int().nonnegative(),
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
    id: crypto.randomUUID(),
    version: 0,
    name: "",
    description: "",
    quantity: 0,
    status: "DRAFT",
  };
}

export type ItemFormValidationContext = Readonly<{
  nameMinimumLength: number;
}>;

export type ItemValidatedSchemaContext = ItemFormValidationContext &
  Readonly<{
    mode: AppFormMode;
  }>;

export const DEFAULT_ITEM_FORM_VALIDATION_CONTEXT: ItemFormValidationContext = Object.freeze({
  nameMinimumLength: 2,
});

export const buildValidatedItemSchema: ValidatedSchemaFactory<Item, "item", ItemValidatedSchemaContext> = (
  t,
  context,
) => {
  if (context.mode === AppFormMode.enum.READ) return Item as z.ZodType<Item, Item>;

  return Item.extend({
    name: Item.shape.name
      .trim()
      .min(context.nameMinimumLength, t("validation.name.min", { minimum: context.nameMinimumLength })),
    description: Item.shape.description.refine(value => value.length <= 2000, {
      message: t("validation.description.max"),
    }),
    quantity: Item.shape.quantity
      .int(t("validation.quantity.integer"))
      .nonnegative(t("validation.quantity.nonnegative")),
  }) as z.ZodType<Item, Item>;
};
