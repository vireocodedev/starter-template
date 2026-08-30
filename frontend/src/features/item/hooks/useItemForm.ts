import { type AppFormMode } from "@/app/ui/forms/models/AppFormMode";
import { revalidateLogic } from "@tanstack/react-form";
import { useVireoForm } from "@vireocodedev/ui/forms";
import React from "react";
import { buildValidatedItemSchema, getDefaultItem, type Item, type ItemFormValidationContext } from "../models/Item";
import { useItemTranslation } from "../localization/use-item-translation";

export type UseItemFormOptions = {
  initialValue?: Item;
  mode: AppFormMode;
  onSubmit: (value: Item) => Promise<void>;
  validationContext: ItemFormValidationContext;
};

export function useItemForm({ initialValue, mode, onSubmit, validationContext }: UseItemFormOptions) {
  const { t } = useItemTranslation();
  const defaultValues = React.useMemo(() => initialValue ?? getDefaultItem(), [initialValue]);
  const schema = React.useMemo(
    () => buildValidatedItemSchema(t, { mode, nameMinimumLength: validationContext.nameMinimumLength }),
    [mode, t, validationContext.nameMinimumLength],
  );

  const form = useVireoForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schema },
    onSubmit: ({ value }) => onSubmit(value),
  });

  React.useEffect(() => {
    if (form.state.submissionAttempts === 0) return;
    void form.validate("submit");
  }, [form, schema]);

  return form;
}

export type ItemFormApi = ReturnType<typeof useItemForm>;
