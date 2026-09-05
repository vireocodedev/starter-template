import type { PageableParams, PageableResponse } from "@vireocodedev/infrastructure";
import type { Item } from "../models/Item";
import type { ItemFilters } from "../models/ItemFilters";

export type { ItemFilters } from "../models/ItemFilters";

export type ItemRequestOptions = {
  signal?: AbortSignal;
};

export interface ItemApi {
  search(
    pagination: PageableParams,
    filters: ItemFilters,
    request?: ItemRequestOptions,
  ): Promise<PageableResponse<Item>>;
  create(value: Item): Promise<Item>;
  update(id: string, value: Item): Promise<Item>;
  delete(id: string, version: number): Promise<void>;
}
