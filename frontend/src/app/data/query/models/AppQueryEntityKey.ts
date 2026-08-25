import { z } from "zod";

export const AppQueryEntityKeySchema = z.enum(["ITEM", "SAVED_FILTER"]);

export type AppQueryEntityKey = z.infer<typeof AppQueryEntityKeySchema>;

export const APP_QUERY_ENTITY = {
  item: "ITEM",
  savedFilter: "SAVED_FILTER",
} as const satisfies Record<string, AppQueryEntityKey>;
