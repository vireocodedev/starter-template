import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { APP_PAGES } from "@/app/app.pages";
import { ItemQuery } from "@/features/item/public";
import { AppPageHomeView } from "./AppPageHomeView";

export function AppPageHome() {
  const navigate = useNavigate();
  const result = useQuery(
    ItemQuery.search(
      { page: 0, rowsPerPage: 100, sortBy: "quantity", sortDirection: "asc" },
      { queryFilters: null, searchText: "" },
    ),
  );

  return (
    <AppPageHomeView
      error={result.isError}
      items={result.data?.content}
      loading={result.isPending}
      onOpenItems={() => void navigate(APP_PAGES.items)}
      onRetry={() => void result.refetch()}
      totalItems={result.data?.totalElements}
    />
  );
}
