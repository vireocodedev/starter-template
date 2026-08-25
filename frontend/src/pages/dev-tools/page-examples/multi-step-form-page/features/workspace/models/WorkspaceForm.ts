import type { ValidatedSchemaFactory } from "@/app/ui/localization/validated-schema";
import type { TFunction } from "i18next";
import { z } from "zod";

export const WorkspaceType = z.enum(["PRODUCT", "AGENCY", "INTERNAL"]);
export type WorkspaceType = z.infer<typeof WorkspaceType>;
export const Visibility = z.enum(["PRIVATE", "ORGANIZATION"]);
export type Visibility = z.infer<typeof Visibility>;

export const workspaceTypes = WorkspaceType.options;
export const visibilityOptions = Visibility.options;

export const WorkspaceFormValue = z.object({
  workspaceName: z.string(),
  ownerEmail: z.string(),
  workspaceType: WorkspaceType.nullable(),
  teamSize: z.number(),
  visibility: Visibility,
  weeklyDigest: z.boolean(),
  notes: z.string(),
  confirmed: z.boolean(),
});
export type WorkspaceFormValue = z.infer<typeof WorkspaceFormValue>;

export function getDefaultWorkspaceFormValue(): WorkspaceFormValue {
  return {
    workspaceName: "",
    ownerEmail: "",
    workspaceType: null,
    teamSize: 5,
    visibility: "PRIVATE",
    weeklyDigest: true,
    notes: "",
    confirmed: false,
  };
}

export const buildValidatedWorkspaceFormSchema: ValidatedSchemaFactory<WorkspaceFormValue, "multiStepForm"> = t =>
  WorkspaceFormValue.extend({
    workspaceName: WorkspaceFormValue.shape.workspaceName.trim().min(3, t("validation.workspaceName")),
    ownerEmail: WorkspaceFormValue.shape.ownerEmail.pipe(z.email(t("validation.ownerEmail"))),
    workspaceType: WorkspaceFormValue.shape.workspaceType.refine(
      value => value !== null,
      t("validation.workspaceType"),
    ),
    teamSize: WorkspaceFormValue.shape.teamSize
      .int(t("validation.wholeNumber"))
      .min(1, t("validation.teamSize"))
      .max(100),
    notes: WorkspaceFormValue.shape.notes.trim().max(240, t("validation.notes")),
  });

export function buildWorkspaceSteps(t: TFunction<"multiStepForm">) {
  return [
    { id: "details", label: t("steps.details"), fields: ["workspaceName", "ownerEmail", "workspaceType", "teamSize"] },
    { id: "preferences", label: t("steps.preferences"), fields: ["visibility", "weeklyDigest", "notes"] },
    { id: "review", label: t("steps.review"), fields: ["confirmed"] },
  ] as const;
}
