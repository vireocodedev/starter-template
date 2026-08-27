import { AppAxiosHttpClient } from "@/app/data/network/clients/AppAxiosClient";
import type { HistoryApi } from "./history.api";
import type { HistoryEntityKind, HistoryRecord, HistorySnapshot, HistoryTimestamp } from "@vireocodedev/history";
import { z } from "zod";

class HistoryApiOnline extends AppAxiosHttpClient implements HistoryApi {
  constructor() {
    super("history");
  }

  find<TSnapshot extends HistorySnapshot, TEntityKind extends HistoryEntityKind, TTimestamp extends HistoryTimestamp>(
    schema: z.ZodType<HistoryRecord<TSnapshot, TEntityKind, TTimestamp>>,
    entity: TEntityKind,
    entityId: string | number,
    signal?: AbortSignal,
  ) {
    return this.httpGet(z.array(schema))("", {
      params: { entity, entityId: String(entityId) },
      signal,
    });
  }
}

export const historyApi = new HistoryApiOnline();
