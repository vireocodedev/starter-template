import { historyApi } from "./history.api.online";
import type {
  HistoryEntityKind,
  HistoryRecord,
  HistorySnapshot,
  HistoryTimestamp,
} from "@vireocodedev/starter-history";
import { queryOptions } from "@tanstack/react-query";
import type { z } from "zod";

export const HistoryQueryKeys = {
  all: ["history"] as const,
  entity: (entity: HistoryEntityKind, entityId: string | number) =>
    [...HistoryQueryKeys.all, entity, String(entityId)] as const,
};

export const HistoryQuery = {
  keys: HistoryQueryKeys,
  entity: <
    TSnapshot extends HistorySnapshot,
    TEntityKind extends HistoryEntityKind,
    TTimestamp extends HistoryTimestamp,
  >(
    schema: z.ZodType<HistoryRecord<TSnapshot, TEntityKind, TTimestamp>>,
    entity: TEntityKind,
    entityId: string | number,
  ) =>
    queryOptions({
      queryKey: HistoryQueryKeys.entity(entity, entityId),
      queryFn: ({ signal }) => historyApi.find(schema, entity, entityId, signal),
    }),
} as const;
