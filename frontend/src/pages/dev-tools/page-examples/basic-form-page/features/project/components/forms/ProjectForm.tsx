import { APP_PAGES } from "@/app/app.pages";
import { Alert, Button } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { BASIC_FORM_TRANSLATION_NAMESPACE } from "@/app/app.localization";
import {
  buildValidatedProjectFormSchema,
  deliveryModels,
  departments,
  environments,
  getDefaultProjectFormValue,
  type ProjectFormValue,
} from "../../models/ProjectForm";

export function ProjectForm() {
  const navigate = useNavigate();
  const { t } = useTranslation(BASIC_FORM_TRANSLATION_NAMESPACE);
  const [savedProject, setSavedProject] = React.useState<ProjectFormValue | null>(null);
  const defaultValues = React.useMemo(getDefaultProjectFormValue, []);
  const departmentOptions = React.useMemo(
    () => departments.map(value => ({ value, label: t(`departments.${value}`) })),
    [t],
  );
  const environmentOptions = React.useMemo(
    () => environments.map(value => ({ value, label: t(`environments.${value}`) })),
    [t],
  );
  const deliveryModelOptions = React.useMemo(
    () => deliveryModels.map(value => ({ value, label: t(`deliveryModels.${value}`) })),
    [t],
  );
  const form = useVireoForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: buildValidatedProjectFormSchema(t) },
    onSubmit: async ({ value }) => {
      await new Promise(resolve => window.setTimeout(resolve, 400));
      setSavedProject(value);
    },
  });

  return (
    <form.Form layoutWidth="wide" unsavedChangesGuard>
      {savedProject && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {t("success", { name: savedProject.projectName })}
        </Alert>
      )}

      <form.Section
        label={t("sections.identity.title")}
        description={t("sections.identity.description")}
        maxColumns={2}
        variant="plain"
      >
        <form.Field name="projectName">
          {field => (
            <VireoLabelBox label={t("fields.projectName.label")} required>
              <field.TextField label={null} autoFocus placeholder={t("fields.projectName.placeholder")} />
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
                slotProps={{ htmlInput: { autoComplete: "email" } }}
              />
            </VireoLabelBox>
          )}
        </form.Field>

        <form.Field name="department">
          {field => (
            <VireoLabelBox label={t("fields.department.label")} required>
              <field.SelectField
                label={null}
                options={departmentOptions}
                getOptionValue={option => option.value}
                renderOption={option => option.label}
                placeholder={t("fields.department.placeholder")}
              />
            </VireoLabelBox>
          )}
        </form.Field>

        <form.Field name="teamSize">
          {field => (
            <VireoLabelBox label={t("fields.teamSize.label")} required>
              <field.CounterField aria-label={t("fields.teamSize.label")} min={1} max={20} />
            </VireoLabelBox>
          )}
        </form.Field>
      </form.Section>

      <form.Section
        label={t("sections.delivery.title")}
        description={t("sections.delivery.description")}
        maxColumns={2}
        variant="plain"
      >
        <form.Field name="environments">
          {field => (
            <VireoLabelBox label={t("fields.environments.label")} required>
              <field.SelectMultipleField
                label={null}
                options={environmentOptions}
                getOptionValue={option => option.value}
                renderOption={option => option.label}
                placeholder={t("fields.environments.placeholder")}
              />
            </VireoLabelBox>
          )}
        </form.Field>

        <form.Field name="deliveryModel">
          {field => (
            <VireoLabelBox label={t("fields.deliveryModel.label")} required>
              <field.RadioGroupField
                aria-label={t("fields.deliveryModel.label")}
                options={deliveryModelOptions}
                getOptionValue={option => option.value}
                renderOption={option => option.label}
                row
              />
            </VireoLabelBox>
          )}
        </form.Field>

        <form.SectionItem span="full">
          <form.Field name="summary">
            {field => (
              <VireoLabelBox label={t("fields.summary.label")} required>
                <field.TextField label={null} multiline minRows={4} placeholder={t("fields.summary.placeholder")} />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.SectionItem>

        <form.SectionItem span="full">
          <form.Field name="acknowledged">
            {field => <field.CheckboxField label={t("fields.acknowledged")} />}
          </form.Field>
        </form.SectionItem>

        <form.SectionItem span="full">
          <form.Actions>
            <Button onClick={() => navigate(APP_PAGES.devTools)}>{t("actions.cancel")}</Button>
            <form.SubmitButton variant="contained">{t("actions.submit")}</form.SubmitButton>
          </form.Actions>
        </form.SectionItem>
      </form.Section>
    </form.Form>
  );
}
