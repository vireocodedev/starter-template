import { createQueryEngineApi } from "@vireocodedev/query";
import { createVireoQueryEngineQueries } from "@vireocodedev/ui/tanstack-query";
import { AppQueryEngineHttpClient } from "@/app/data/query/clients/AppQueryEngineHttpClient";
import { AppQueryEntityKeySchema } from "@/app/data/query/models/AppQueryEntityKey";

export const queryEngineApi = createQueryEngineApi(new AppQueryEngineHttpClient(), {
  entityKeySchema: AppQueryEntityKeySchema,
});

export const QueryEngineQuery = createVireoQueryEngineQueries(queryEngineApi);
