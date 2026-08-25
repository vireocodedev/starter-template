import type { QueryFilterDocument } from "@/app/data/query/models/QueryFilterDocument";

export type ItemFilters = {
  searchText: string;
  queryFilters: QueryFilterDocument | null;
};
