import type { ValidatedSchemaFactory } from "@/app/ui/localization/validated-schema";
import { z } from "zod";

export const Department = z.enum(["DESIGN", "ENGINEERING", "OPERATIONS"]);
export type Department = z.infer<typeof Department>;
export const Environment = z.enum(["DEVELOPMENT", "STAGING", "PRODUCTION"]);
export type Environment = z.infer<typeof Environment>;
export const DeliveryModel = z.enum(["REMOTE", "HYBRID", "OFFICE"]);
export type DeliveryModel = z.infer<typeof DeliveryModel>;

export const departments = Department.options;
export const environments = Environment.options;
export const deliveryModels = DeliveryModel.options;

export const ProjectFormValue = z.object({
  projectName: z.string(),
  ownerEmail: z.string(),
  department: Department.nullable(),
  environments: z.array(Environment),
  deliveryModel: DeliveryModel,
  teamSize: z.number(),
  summary: z.string(),
  acknowledged: z.boolean(),
});
export type ProjectFormValue = z.infer<typeof ProjectFormValue>;

export function getDefaultProjectFormValue(): ProjectFormValue {
  return {
    projectName: "",
    ownerEmail: "",
    department: null,
    environments: [],
    deliveryModel: "HYBRID",
    teamSize: 3,
    summary: "",
    acknowledged: false,
  };
}

export const buildValidatedProjectFormSchema: ValidatedSchemaFactory<ProjectFormValue, "basicForm"> = t =>
  ProjectFormValue.extend({
    projectName: ProjectFormValue.shape.projectName.trim().min(3, t("validation.projectName")),
    ownerEmail: ProjectFormValue.shape.ownerEmail.pipe(z.email(t("validation.ownerEmail"))),
    department: ProjectFormValue.shape.department.refine(value => value !== null, t("validation.department")),
    environments: ProjectFormValue.shape.environments.min(1, t("validation.environments")),
    teamSize: ProjectFormValue.shape.teamSize
      .int(t("validation.wholeNumber"))
      .min(1, t("validation.teamSizeMin"))
      .max(20, t("validation.teamSizeMax")),
    summary: ProjectFormValue.shape.summary
      .trim()
      .min(20, t("validation.summaryMin"))
      .max(300, t("validation.summaryMax")),
    acknowledged: ProjectFormValue.shape.acknowledged.refine(Boolean, t("validation.acknowledged")),
  });
