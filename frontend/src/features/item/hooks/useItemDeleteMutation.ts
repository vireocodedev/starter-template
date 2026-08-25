import { ItemMutationKeys, ItemQueryKeys } from "../api/item.query";
import { itemApi } from "../api/item.api.online";
import { useQueryClient } from "@tanstack/react-query";
import { useVireoMutation } from "@vireocodedev/starter-ui/tanstack-query";
import { useItemTranslation } from "../localization/use-item-translation";

export function useItemDeleteMutation() {
  const { t } = useItemTranslation();
  const queryClient = useQueryClient();

  return useVireoMutation({
    mutationKey: ItemMutationKeys.delete,
    mutationFn: (id: number) => itemApi.delete(id),
    successMessage: t("messages.deleted"),
    errorMessage: t("messages.deleteFailed"),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ItemQueryKeys.all });
    },
  });
}
