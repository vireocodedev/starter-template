import type { ItemFormApi } from "../../hooks/useItemForm";
import { useItemTranslation } from "../../localization/use-item-translation";
import { ItemStatus } from "../../models/Item";
import { Button } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { usePlatformTranslation } from "@vireocodedev/starter-ui/react-i18next";

export type ItemFormProps = {
  form: ItemFormApi;
};

export type ItemFormActionsProps = ItemFormProps & {
  editing: boolean;
  onCancel: () => void;
};

export function ItemForm({ form }: ItemFormProps) {
  const { t } = useItemTranslation();
  const statuses = ItemStatus.options.map(value => ({ value, label: t(`status.${value}`) }));

  return (
    <form.Section label={t("form.section")} description={t("form.description")} maxColumns={2}>
      <form.Field name="name">
        {field => (
          <VireoLabelBox label={t("fields.name")} required>
            <field.TextField
              label={null}
              autoFocus
              placeholder={t("form.namePlaceholder")}
              slotProps={{ htmlInput: { "aria-label": t("fields.name") } }}
            />
          </VireoLabelBox>
        )}
      </form.Field>
      <form.Field name="status">
        {field => (
          <VireoLabelBox label={t("fields.status")} required>
            <field.SelectField
              label={null}
              disableClearable
              options={statuses}
              getOptionValue={option => option.value}
              renderOption={option => option.label}
              slotProps={{ htmlInput: { "aria-label": t("fields.status") } }}
            />
          </VireoLabelBox>
        )}
      </form.Field>
      <form.Field name="quantity">
        {field => (
          <VireoLabelBox label={t("fields.quantity")} required>
            <field.NumberField
              label={null}
              min={0}
              placeholder="0"
              slotProps={{ htmlInput: { "aria-label": t("fields.quantity") } }}
            />
          </VireoLabelBox>
        )}
      </form.Field>
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
    </form.Section>
  );
}

export function ItemFormActions({ editing, form, onCancel }: ItemFormActionsProps) {
  const { t } = usePlatformTranslation();
  const { t: tItem } = useItemTranslation();

  return (
    <form.Actions>
      <Button onClick={onCancel}>{t("common.cancel")}</Button>
      <form.SubmitButton variant="contained">{editing ? tItem("form.update") : tItem("form.create")}</form.SubmitButton>
    </form.Actions>
  );
}
