import { itemApi } from "./item.api.online";
import type { ItemFilters } from "./item.api";
import { createVireoPagedSearchQueries } from "@vireocodedev/ui/tanstack-query";
import type { PageableResponse } from "@vireocodedev/infrastructure";
import type { Item } from "../models/Item";

const ITEM_SEARCH_QUERY_POLICY = {
  staleTime: 20_000,
  refetchOnMount: true,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
} as const;

export const ItemQueryKeys = {
  all: ["items"] as const,
} as const;

export const ItemMutationKeys = {
  create: [...ItemQueryKeys.all, "create"] as const,
  update: [...ItemQueryKeys.all, "update"] as const,
  delete: [...ItemQueryKeys.all, "delete"] as const,
} as const;

const searchQueries = createVireoPagedSearchQueries<ItemFilters, PageableResponse<Item>>({
  queryKeyRoot: ItemQueryKeys.all[0],
  searchFn: (pagination, filters, request) => itemApi.search(pagination, filters, request),
  policy: ITEM_SEARCH_QUERY_POLICY,
});

/** Reusable Item query-option factories for hooks, prefetching and route loaders. */
export const ItemQuery = {
  keys: ItemQueryKeys,
  ...searchQueries,
} as const;
