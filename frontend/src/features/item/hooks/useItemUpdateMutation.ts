import { ItemMutationKeys, ItemQueryKeys } from "../api/item.query";
import { itemApi } from "../api/item.api.online";
import type { Item } from "../models/Item";
import { useQueryClient } from "@tanstack/react-query";
import { useVireoMutation } from "@vireocodedev/starter-ui/tanstack-query";
import { useItemTranslation } from "../localization/use-item-translation";

type UpdateItemVariables = {
  id: number;
  value: Item;
};

export function useItemUpdateMutation() {
  const { t } = useItemTranslation();
  const queryClient = useQueryClient();

  return useVireoMutation<Item, Error, UpdateItemVariables>({
    mutationKey: ItemMutationKeys.update,
    mutationFn: ({ id, value }: UpdateItemVariables) => itemApi.update(id, value),
    successMessage: t("messages.updated"),
    errorMessage: t("messages.updateFailed"),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ItemQueryKeys.all });
    },
  });
}
