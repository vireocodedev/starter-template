import { ItemQuery } from "../api/item.query";
import type { ItemFilters } from "../api/item.api";
import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { PageableParams, PageableResponse } from "@vireocodedev/starter-infrastructure";
import { useVireoPageLayout } from "@vireocodedev/starter-ui";
import type { Item } from "../models/Item";

export function useItemSearchQuery(pagination: PageableParams, filters: ItemFilters) {
  const { isCompact } = useVireoPageLayout();
  const paged = useQuery({
    ...ItemQuery.search(pagination, filters),
    enabled: !isCompact,
    placeholderData: keepPreviousData,
  });
  const infinite = useInfiniteQuery({
    ...ItemQuery.searchInfinite({ ...pagination, page: 0 }, filters),
    enabled: isCompact,
    placeholderData: keepPreviousData,
  });
  const infiniteData = mergeItemSearchPages(infinite.data?.pages);
  const active = isCompact ? infinite : paged;

  return {
    data: isCompact ? (infiniteData ?? paged.data) : (paged.data ?? infiniteData),
    hasNextPage: isCompact ? infinite.hasNextPage : undefined,
    isError: active.isError,
    isFetchingNextPage: isCompact ? infinite.isFetchingNextPage : undefined,
    isRefreshing: active.isFetching && !active.isLoading && !(isCompact && infinite.isFetchingNextPage),
    isLoading: active.isLoading,
    layout: isCompact ? ("mobile" as const) : ("desktop" as const),
    onLoadNextPage: isCompact ? infinite.fetchNextPage : undefined,
  };
}

export function mergeItemSearchPages(
  pages: readonly PageableResponse<Item>[] | undefined,
): PageableResponse<Item> | undefined {
  if (!pages?.length) return undefined;
  const lastPage = pages.at(-1)!;
  const content = pages.flatMap(page => page.content);
  return { ...lastPage, content, size: content.length };
}
