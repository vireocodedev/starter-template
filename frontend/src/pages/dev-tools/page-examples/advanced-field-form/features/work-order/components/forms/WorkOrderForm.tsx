import { Alert, Button } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { APP_PAGES } from "@/app/app.pages";
import { DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE } from "@/app/app.localization";
import { buildValidatedWorkOrderSchema, getDefaultWorkOrder, type WorkOrder } from "../../models/WorkOrder";

const owners = [
  { id: "maya", label: "Maya Chen", team: "Platform" },
  { id: "niko", label: "Niko Barić", team: "Design" },
  { id: "sora", label: "Sora Tanaka", team: "Operations" },
] as const;

const priorities = [
  { value: "LOW", label: "Low" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "High" },
] as const;

export function WorkOrderForm() {
  const navigate = useNavigate();
  const { t } = useTranslation(DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE);
  const [saved, setSaved] = React.useState<WorkOrder | null>(null);
  const form = useVireoForm({
    defaultValues: getDefaultWorkOrder(),
    validationLogic: revalidateLogic(),
    validators: { onDynamic: buildValidatedWorkOrderSchema(t) },
    onSubmit: async ({ value }) => {
      await new Promise(resolve => window.setTimeout(resolve, 350));
      setSaved(value);
    },
  });

  return (
    <form.Form layoutWidth="wide" unsavedChangesGuard>
      {saved && (
        <Alert severity="success">
          Saved {saved.title} for {saved.ownerId}.
        </Alert>
      )}
      <form.Section
        label={t("advancedForm.section.title")}
        description={t("advancedForm.section.description")}
        maxColumns={2}
        variant="plain"
      >
        <form.Field name="title">
          {field => (
            <VireoLabelBox label="Title" required>
              <field.TextField label={null} autoFocus />
            </VireoLabelBox>
          )}
        </form.Field>
        <form.Field name="ownerId">
          {field => (
            <VireoLabelBox label="Owner" required>
              <field.AutocompleteField
                label={null}
                options={owners}
                getOptionValue={option => option.id}
                getOptionLabel={option => option.label}
                renderOption={option => `${option.label} · ${option.team}`}
                placeholder="Search people"
              />
            </VireoLabelBox>
          )}
        </form.Field>
        <form.Field name="budget">
          {field => (
            <VireoLabelBox label="Budget" required>
              <field.NumberField label={null} min={0} />
            </VireoLabelBox>
          )}
        </form.Field>
        <form.Field name="startsAt">
          {field => (
            <VireoLabelBox label="Starts at" required>
              <field.TemporalField mode="date-time" precision="minute" />
            </VireoLabelBox>
          )}
        </form.Field>
        <form.SectionItem span="full">
          <form.Field name="priority">
            {field => (
              <VireoLabelBox label="Priority">
                <field.ToggleButtonGroupField options={priorities} aria-label="Priority" />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.SectionItem>
        <form.SectionItem span="full">
          <form.Field name="attachment">
            {field => (
              <VireoLabelBox label="Brief">
                <field.FileField accept=".pdf,application/pdf" />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.SectionItem>
        <form.SectionItem span="full">
          <form.Field name="notifyOwner">{field => <field.SwitchField label="Notify owner after save" />}</form.Field>
        </form.SectionItem>
        <form.SectionItem span="full">
          <form.Actions>
            <Button onClick={() => navigate(APP_PAGES.devTools)}>{t("common.cancel")}</Button>
            <form.SubmitButton variant="contained">{t("common.save")}</form.SubmitButton>
          </form.Actions>
        </form.SectionItem>
      </form.Section>
    </form.Form>
  );
}
