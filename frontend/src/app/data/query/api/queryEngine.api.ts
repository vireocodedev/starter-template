import { createQueryEngineApi, type QueryEngineApi } from "@vireocodedev/query";
import { createVireoQueryEngineQueries } from "@vireocodedev/ui/tanstack-query";
import { AppQueryEngineHttpClient } from "@/app/data/query/clients/AppQueryEngineHttpClient";
import { AppQueryEntityKeySchema } from "@/app/data/query/models/AppQueryEntityKey";
import { createAdapterSlot } from "@/app/adapters/createAdapterSlot";

const queryEngineApiSlot = createAdapterSlot<QueryEngineApi>(
  createQueryEngineApi(new AppQueryEngineHttpClient(), {
    entityKeySchema: AppQueryEntityKeySchema,
  }),
);

export const queryEngineApi = queryEngineApiSlot.adapter;
export const configureQueryEngineApi = queryEngineApiSlot.configure;

export const QueryEngineQuery = createVireoQueryEngineQueries(queryEngineApi);
