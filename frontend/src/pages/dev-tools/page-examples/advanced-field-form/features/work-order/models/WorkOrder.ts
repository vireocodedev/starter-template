import type { TFunction } from "i18next";
import { z } from "zod";
import type { DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE } from "@/app/app.localization";

export const WORK_ORDER_PRIORITIES = ["LOW", "NORMAL", "HIGH"] as const;

export const WorkOrder = z.object({
  title: z.string(),
  ownerId: z.string().nullable(),
  budget: z.number(),
  startsAt: z.string().nullable(),
  priority: z.enum(WORK_ORDER_PRIORITIES),
  attachment: z.custom<File>().nullable(),
  notifyOwner: z.boolean(),
});

export type WorkOrder = z.infer<typeof WorkOrder>;

export function getDefaultWorkOrder(): WorkOrder {
  return {
    title: "",
    ownerId: null,
    budget: 2500,
    startsAt: null,
    priority: "NORMAL",
    attachment: null,
    notifyOwner: true,
  };
}

export function buildValidatedWorkOrderSchema(t: TFunction<typeof DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE>) {
  return WorkOrder.extend({
    title: WorkOrder.shape.title.trim().min(3, t("validation.minimum", { count: 3 })),
    ownerId: WorkOrder.shape.ownerId.refine(value => value !== null, t("validation.required")),
    budget: WorkOrder.shape.budget.min(100, t("validation.minimumValue", { count: 100 })),
    startsAt: WorkOrder.shape.startsAt.refine(value => value !== null, t("validation.required")),
  });
}
