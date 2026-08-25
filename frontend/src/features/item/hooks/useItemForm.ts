import { revalidateLogic } from "@tanstack/react-form";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { buildValidatedItemSchema, getDefaultItem, type Item } from "../models/Item";
import { useItemTranslation } from "../localization/use-item-translation";

export function useItemForm(item: Item | undefined, onSubmit: (value: Item) => Promise<void>) {
  const { t } = useItemTranslation();

  return useVireoForm({
    defaultValues: item ?? getDefaultItem(),
    validationLogic: revalidateLogic(),
    validators: { onDynamic: buildValidatedItemSchema(t) },
    onSubmit: ({ value }) => onSubmit(value),
  });
}

export type ItemFormApi = ReturnType<typeof useItemForm>;
