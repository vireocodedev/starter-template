import type { ValidatedSchemaFactory } from "@/app/ui/localization/validated-schema";
import { z } from "zod";

export const Invoice = z.object({
  invoiceNumber: z.string(),
  buyerId: z.number().nullable(),
  issueDate: z.string(),
  total: z.number(),
  note: z.string(),
});
export type Invoice = z.infer<typeof Invoice>;

export function getDefaultInvoice(): Invoice {
  return {
    invoiceNumber: "INV-2026-0042",
    buyerId: null,
    issueDate: "2026-08-24",
    total: 1250,
    note: "",
  };
}

export const buildValidatedInvoiceSchema: ValidatedSchemaFactory<Invoice, "relatedRecordCreation"> = t =>
  Invoice.extend({
    invoiceNumber: Invoice.shape.invoiceNumber.trim().min(3, t("invoice.validation.number")),
    buyerId: Invoice.shape.buyerId.refine(value => value !== null, t("invoice.validation.buyer")),
    issueDate: Invoice.shape.issueDate.min(1, t("invoice.validation.issueDate")),
    total: Invoice.shape.total.positive(t("invoice.validation.total")),
    note: Invoice.shape.note.trim().max(300, t("invoice.validation.note")),
  });
