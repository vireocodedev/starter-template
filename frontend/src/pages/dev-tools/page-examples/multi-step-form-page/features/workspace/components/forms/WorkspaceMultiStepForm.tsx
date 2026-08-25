import React from "react";
import { Alert, Box, Divider, Stack, Typography } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoMultiStepForm } from "@vireocodedev/starter-ui/forms";
import { useTranslation } from "react-i18next";
import { MULTI_STEP_FORM_TRANSLATION_NAMESPACE } from "@/app/app.localization";
import {
  buildValidatedWorkspaceFormSchema,
  buildWorkspaceSteps,
  getDefaultWorkspaceFormValue,
  visibilityOptions,
  workspaceTypes,
  type WorkspaceFormValue,
} from "../../models/WorkspaceForm";

export function WorkspaceMultiStepForm() {
  const { t } = useTranslation(MULTI_STEP_FORM_TRANSLATION_NAMESPACE);
  const [savedWorkspace, setSavedWorkspace] = React.useState<WorkspaceFormValue | null>(null);
  const defaultValues = React.useMemo(getDefaultWorkspaceFormValue, []);
  const steps = React.useMemo(() => buildWorkspaceSteps(t), [t]);
  const workspaceTypeOptions = React.useMemo(
    () => workspaceTypes.map(value => ({ value, label: t(`workspaceTypes.${value}`) })),
    [t],
  );
  const visibilityOptionValues = React.useMemo(
    () => visibilityOptions.map(value => ({ value, label: t(`visibility.${value}`) })),
    [t],
  );
  const form = useVireoMultiStepForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await new Promise(resolve => window.setTimeout(resolve, 400));
      setSavedWorkspace(value);
    },
    steps,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: buildValidatedWorkspaceFormSchema(t) },
  });

  return (
    <form.Form layoutWidth="wide" unsavedChangesGuard>
      <form.MultiStep aria-label={t("aria")}>
        <Stack spacing={3}>
          {savedWorkspace && <Alert severity="success">{t("success", { name: savedWorkspace.workspaceName })}</Alert>}

          <form.StepProgress navigation="visited" />

          <form.Step id="details">
            <form.Section
              label={t("sections.details.title")}
              description={t("sections.details.description")}
              maxColumns={2}
              variant="plain"
            >
              <form.Field name="workspaceName">
                {field => (
                  <VireoLabelBox label={t("fields.workspaceName.label")} required>
                    <field.TextField
                      label={null}
                      autoFocus
                      placeholder={t("fields.workspaceName.placeholder")}
                      slotProps={{ htmlInput: { "aria-label": t("fields.workspaceName.label") } }}
                    />
                  </VireoLabelBox>
                )}
              </form.Field>

              <form.Field name="ownerEmail">
                {field => (
                  <VireoLabelBox label={t("fields.ownerEmail.label")} required>
                    <field.TextField
                      label={null}
                      placeholder={t("fields.ownerEmail.placeholder")}
                      type="email"
                      slotProps={{ htmlInput: { "aria-label": t("fields.ownerEmail.label"), autoComplete: "email" } }}
                    />
                  </VireoLabelBox>
                )}
              </form.Field>

              <form.Field name="workspaceType">
                {field => (
                  <VireoLabelBox label={t("fields.workspaceType.label")} required>
                    <field.SelectField
                      label={null}
                      options={workspaceTypeOptions}
                      getOptionValue={option => option.value}
                      renderOption={option => option.label}
                      placeholder={t("fields.workspaceType.placeholder")}
                      slotProps={{ select: { SelectDisplayProps: { "aria-label": t("fields.workspaceType.label") } } }}
                    />
                  </VireoLabelBox>
                )}
              </form.Field>

              <form.Field name="teamSize">
                {field => (
                  <VireoLabelBox label={t("fields.teamSize.label")} required>
                    <field.CounterField aria-label={t("fields.teamSize.label")} min={1} max={100} />
                  </VireoLabelBox>
                )}
              </form.Field>
            </form.Section>
          </form.Step>

          <form.Step id="preferences">
            <form.Section
              label={t("sections.preferences.title")}
              description={t("sections.preferences.description")}
              maxColumns={2}
              variant="plain"
            >
              <form.Field name="visibility">
                {field => (
                  <VireoLabelBox label={t("fields.visibility.label")} required>
                    <field.RadioGroupField
                      aria-label={t("fields.visibility.label")}
                      options={visibilityOptionValues}
                      getOptionValue={option => option.value}
                      renderOption={option => option.label}
                      row
                    />
                  </VireoLabelBox>
                )}
              </form.Field>

              <form.Field name="weeklyDigest">
                {field => <field.SwitchField label={t("fields.weeklyDigest")} />}
              </form.Field>

              <form.SectionItem span="full">
                <form.Field name="notes">
                  {field => (
                    <VireoLabelBox label={t("fields.notes.label")}>
                      <field.TextField
                        label={null}
                        multiline
                        minRows={4}
                        placeholder={t("fields.notes.placeholder")}
                        slotProps={{ htmlInput: { "aria-label": t("fields.notes.label") } }}
                      />
                    </VireoLabelBox>
                  )}
                </form.Field>
              </form.SectionItem>
            </form.Section>
          </form.Step>

          <form.Step id="review">
            <form.Section
              label={t("sections.review.title")}
              description={t("sections.review.description")}
              variant="plain"
            >
              <form.SectionItem span="full">
                <form.Subscribe selector={state => state.values}>
                  {values => (
                    <Stack divider={<Divider flexItem />} spacing={2}>
                      <ReviewValue
                        label={t("review.workspace")}
                        value={values.workspaceName || t("review.notProvided")}
                      />
                      <ReviewValue label={t("review.owner")} value={values.ownerEmail || t("review.notProvided")} />
                      <ReviewValue
                        label={t("review.type")}
                        value={
                          values.workspaceType ? t(`workspaceTypes.${values.workspaceType}`) : t("review.notSelected")
                        }
                      />
                      <ReviewValue
                        label={t("review.teamSize")}
                        value={t("review.people", { count: values.teamSize })}
                      />
                      <ReviewValue label={t("review.visibility")} value={t(`visibility.${values.visibility}`)} />
                      <ReviewValue
                        label={t("review.weeklyDigest")}
                        value={values.weeklyDigest ? t("review.enabled") : t("review.disabled")}
                      />
                      <ReviewValue
                        label={t("review.reviewStatus")}
                        value={values.confirmed ? t("review.confirmed") : t("review.notConfirmed")}
                      />
                    </Stack>
                  )}
                </form.Subscribe>
              </form.SectionItem>

              <form.SectionItem span="full">
                <form.Field name="confirmed">
                  {field => <field.CheckboxField label={t("fields.confirmed")} />}
                </form.Field>
              </form.SectionItem>
            </form.Section>
          </form.Step>

          <form.Actions>
            <form.PreviousStepButton />
            <form.NextStepButton />
            <form.SubmitButton variant="contained">{t("actions.submit")}</form.SubmitButton>
          </form.Actions>
        </Stack>
      </form.MultiStep>
    </form.Form>
  );
}

function ReviewValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: "grid", gap: 0.5, gridTemplateColumns: { xs: "1fr", sm: "minmax(9rem, 0.35fr) 1fr" } }}>
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <Typography>{value}</Typography>
    </Box>
  );
}
