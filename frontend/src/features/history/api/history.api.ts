import type {
  HistoryEntityKind,
  HistoryRecord,
  HistorySnapshot,
  HistoryTimestamp,
} from "@vireocodedev/starter-history";
import type { z } from "zod";

export interface HistoryApi {
  find<TSnapshot extends HistorySnapshot, TEntityKind extends HistoryEntityKind, TTimestamp extends HistoryTimestamp>(
    schema: z.ZodType<HistoryRecord<TSnapshot, TEntityKind, TTimestamp>>,
    entity: TEntityKind,
    entityId: string | number,
    signal?: AbortSignal,
  ): Promise<HistoryRecord<TSnapshot, TEntityKind, TTimestamp>[]>;
}
