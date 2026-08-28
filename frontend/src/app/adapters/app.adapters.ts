import type { QueryEngineApi } from "@vireocodedev/query";
import type { AppAuthApi } from "@/app/data/network/api/app-auth.api";
import { configureAppAuthApi } from "@/app/data/network/api/app-auth.api.online";
import { configureQueryEngineApi } from "@/app/data/query/api/queryEngine.api";
import { configureHistoryApi, type HistoryApi } from "@/features/history/public";
import { configureItemApi, type ItemApi } from "@/features/item/public";

export type AppAdapters = {
  auth: AppAuthApi;
  history: HistoryApi;
  items: ItemApi;
  query: QueryEngineApi;
};

/** Configure only the adapters owned by this application. Omitted adapters keep their current implementation. */
export function configureAppAdapters(adapters: Partial<AppAdapters>): void {
  if (adapters.auth) configureAppAuthApi(adapters.auth);
  if (adapters.history) configureHistoryApi(adapters.history);
  if (adapters.items) configureItemApi(adapters.items);
  if (adapters.query) configureQueryEngineApi(adapters.query);
}
