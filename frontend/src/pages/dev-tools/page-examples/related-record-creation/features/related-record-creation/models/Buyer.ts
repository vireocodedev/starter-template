import type { ValidatedSchemaFactory } from "@/app/ui/localization/validated-schema";
import { z } from "zod";

export const BuyerKind = z.enum(["COMPANY", "INDIVIDUAL"]);
export type BuyerKind = z.infer<typeof BuyerKind>;

export const Buyer = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  city: z.string(),
  kind: BuyerKind,
});
export type Buyer = z.infer<typeof Buyer>;

export function getDefaultBuyer(): Buyer {
  return {
    id: 0,
    name: "",
    email: "",
    city: "",
    kind: "COMPANY",
  };
}

export const buildValidatedBuyerSchema: ValidatedSchemaFactory<Buyer, "relatedRecordCreation"> = t =>
  Buyer.extend({
    name: Buyer.shape.name.trim().min(2, t("buyer.validation.name")),
    email: Buyer.shape.email.pipe(z.email(t("buyer.validation.email"))),
    city: Buyer.shape.city.trim().min(2, t("buyer.validation.city")),
  });
