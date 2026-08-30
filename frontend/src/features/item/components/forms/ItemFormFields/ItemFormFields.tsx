import { AppFormMode } from "@/app/ui/forms/models/AppFormMode";
import { VireoContainerGrid } from "@/app/ui/toolkit/components/layout/VireoContainerGrid";
import { VireoLabelBox } from "@vireocodedev/ui";
import { type ItemFormApi } from "../../../hooks/useItemForm";
import { useItemTranslation } from "../../../localization/use-item-translation";
import { ItemStatus } from "../../../models/Item";

export type ItemFormFieldsProps = {
  form: ItemFormApi;
  mode: AppFormMode;
};

/** Renders the field content and container-aware layout for an Item form. */
export function ItemFormFields({ form, mode }: ItemFormFieldsProps) {
  const { t } = useItemTranslation();
  const readOnly = mode === AppFormMode.enum.READ;

  return (
    <VireoContainerGrid container spacing={1}>
      <VireoContainerGrid size={{ xs: 12, sm: 6 }}>
        <form.Field name="name">
          {field => (
            <VireoLabelBox label={t("fields.name")} required={!readOnly}>
              <field.TextField
                label={null}
                autoFocus={mode === AppFormMode.enum.CREATE}
                placeholder={t("form.namePlaceholder")}
                slotProps={{ htmlInput: { "aria-label": t("fields.name") } }}
              />
            </VireoLabelBox>
          )}
        </form.Field>
      </VireoContainerGrid>

      <VireoContainerGrid size={{ xs: 12, sm: 6 }}>
        <form.Field name="status">
          {field => (
            <VireoLabelBox label={t("fields.status")} required={!readOnly}>
              <field.SelectField
                label={null}
                disableClearable
                options={ItemStatus.options}
                getOptionValue={option => option}
                renderOption={option => t(`status.${option}`)}
                slotProps={{ htmlInput: { "aria-label": t("fields.status") } }}
              />
            </VireoLabelBox>
          )}
        </form.Field>
      </VireoContainerGrid>

      <VireoContainerGrid size={{ xs: 12, sm: 6 }}>
        <form.Field name="quantity">
          {field => (
            <VireoLabelBox label={t("fields.quantity")} required={!readOnly}>
              <field.NumberField
                label={null}
                min={0}
                placeholder="0"
                slotProps={{ htmlInput: { "aria-label": t("fields.quantity") } }}
              />
            </VireoLabelBox>
          )}
        </form.Field>
      </VireoContainerGrid>

      <VireoContainerGrid size={{ xs: 12, sm: 6 }}>
        <form.Field name="description">
          {field => (
            <VireoLabelBox label={t("fields.description")}>
              <field.TextField
                label={null}
                multiline
                minRows={4}
                placeholder={t("form.descriptionPlaceholder")}
                slotProps={{ htmlInput: { "aria-label": t("fields.description") } }}
              />
            </VireoLabelBox>
          )}
        </form.Field>
      </VireoContainerGrid>
    </VireoContainerGrid>
  );
}
