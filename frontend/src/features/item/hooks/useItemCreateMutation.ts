import { ItemMutationKeys, ItemQueryKeys } from "../api/item.query";
import { itemApi } from "../api/item.api.online";
import { useQueryClient } from "@tanstack/react-query";
import { useVireoMutation } from "@vireocodedev/starter-ui/tanstack-query";
import { useItemTranslation } from "../localization/use-item-translation";
import type { Item } from "../models/Item";

export function useItemCreateMutation() {
  const { t } = useItemTranslation();
  const queryClient = useQueryClient();

  return useVireoMutation<Item, Error, Item>({
    mutationKey: ItemMutationKeys.create,
    mutationFn: itemApi.create.bind(itemApi),
    successMessage: t("messages.created"),
    errorMessage: t("messages.createFailed"),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ItemQueryKeys.all });
    },
  });
}
