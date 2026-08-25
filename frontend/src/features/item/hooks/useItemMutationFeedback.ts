import { ItemMutationKeys } from "../api/item.query";
import { useMutationState } from "@tanstack/react-query";

export function usePendingItemUpdateId(): number | null {
  const ids = useMutationState<number>({
    filters: { mutationKey: ItemMutationKeys.update, status: "pending" },
    select: mutation => {
      const variables = mutation.state.variables as { id?: unknown } | undefined;
      return typeof variables?.id === "number" ? variables.id : -1;
    },
  });
  return ids.filter(id => id >= 0).at(-1) ?? null;
}
