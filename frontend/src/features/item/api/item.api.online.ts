import { AppAxiosHttpClient, postAppPagedSearch } from "@/app/data/network/clients/AppAxiosClient";
import { withId } from "@/app/data/network/services/object-mappers";
import type { ItemApi, ItemFilters, ItemRequestOptions } from "./item.api";
import { Item } from "../models/Item";
import type { PageableParams } from "@vireocodedev/infrastructure";
import { z } from "zod";
import { APP_QUERY_ENTITY } from "@/app/data/query/models/AppQueryEntityKey";
import { serializeQueryFilterDocument } from "@/app/data/query/models/QueryFilterDocument";
import { createAdapterSlot } from "@/app/adapters/createAdapterSlot";

export class ItemApiOnline extends AppAxiosHttpClient implements ItemApi {
  constructor() {
    super("items");
  }

  async search(pageable: PageableParams, { searchText, queryFilters }: ItemFilters, request?: ItemRequestOptions) {
    return postAppPagedSearch({
      endpointName: "items",
      schema: Item,
      pageable,
      filters: {
        searchText,
        queryFiltersJson: serializeQueryFilterDocument(queryFilters, APP_QUERY_ENTITY.item),
      },
      config: { signal: request?.signal },
    });
  }

  async create(value: Item) {
    return this.httpPost(Item)("", ItemApiOnline.mapper(value));
  }

  async update(id: number, value: Item) {
    return this.httpPut(Item)(String(id), ItemApiOnline.mapper(value, id));
  }

  async delete(id: number): Promise<void> {
    await this.httpDelete(z.unknown())(String(id));
  }

  static mapper(value: Item, id: number | null = null): unknown {
    return withId(value, "id", id);
  }
}

const itemApiSlot = createAdapterSlot<ItemApi>(new ItemApiOnline());

export const itemApi = itemApiSlot.adapter;
export const configureItemApi = itemApiSlot.configure;
