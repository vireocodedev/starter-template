import { ItemMutationKeys, ItemQueryKeys } from "../api/item.query";
import { itemApi } from "../api/item.api.online";
import { useQueryClient } from "@tanstack/react-query";
import { useVireoMutation } from "@vireocodedev/ui/tanstack-query";
import { useItemTranslation } from "../localization/use-item-translation";
import type { Item } from "../models/Item";
import { insertItemIntoUnfilteredSearchQueries } from "../services/itemQueryCache";

export function useItemCreateMutation() {
  const { t } = useItemTranslation();
  const queryClient = useQueryClient();

  return useVireoMutation<Item, Error, Item>({
    mutationKey: ItemMutationKeys.create,
    mutationFn: itemApi.create.bind(itemApi),
    successMessage: item => t("messages.created", { name: item.name }),
    errorMessage: t("messages.createFailed"),
    onSuccess: item => {
      insertItemIntoUnfilteredSearchQueries(queryClient, item);
      if (!(item as Item & { pending?: boolean }).pending) {
        void queryClient.invalidateQueries({ queryKey: ItemQueryKeys.all });
      }
    },
  });
}
