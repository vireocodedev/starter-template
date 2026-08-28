import type {
  QueryEngineApi,
  QueryEngineEntityDefinition,
  QueryEngineEntitySummary,
  QueryEngineRelationOption,
} from "@vireocodedev/query";
import { configureAppAdapters, type AppAdapters } from "../app.adapters";
import type { AppAuthApi } from "@/app/data/network/api/app-auth.api";
import type { AuthUser } from "@/app/data/network/models/AuthUser";
import type { HistoryApi } from "@/features/history/public";
import type { Item, ItemApi } from "@/features/item/public";
import type { HistoryEntityKind, HistoryRecord, HistorySnapshot, HistoryTimestamp } from "@vireocodedev/history";
import type { PageableParams, PageableResponse } from "@vireocodedev/infrastructure";
import type { z } from "zod";

const initialItems: Item[] = [
  {
    id: 1,
    name: "Prepare quarterly review",
    description: "Mock-backed frontend workflow",
    quantity: 3,
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Validate field operations",
    description: "Runs without a backend service",
    quantity: 8,
    status: "DRAFT",
  },
  {
    id: 3,
    name: "Archive completed request",
    description: "Replace this adapter with the company API",
    quantity: 1,
    status: "ARCHIVED",
  },
];

class MockAuthApi implements AppAuthApi {
  private user: AuthUser | null = null;

  async login(username: string, password: string) {
    if (username !== "demo" || password !== "demo123") throw new Error("Use demo / demo123 in mock mode.");
    this.user = { username, role: "SUPERADMIN" };
    return { username, message: "Authenticated by the frontend mock adapter." };
  }

  async logout(): Promise<void> {
    this.user = null;
  }

  async me(): Promise<AuthUser> {
    if (!this.user) throw new Error("No mock session.");
    return this.user;
  }
}

class MockItemApi implements ItemApi {
  private items = initialItems.map(item => ({ ...item }));
  private nextId = Math.max(...this.items.map(item => item.id)) + 1;

  async search(pageable: PageableParams, filters: Parameters<ItemApi["search"]>[1]): Promise<PageableResponse<Item>> {
    const search = filters.searchText.trim().toLocaleLowerCase();
    const filtered = this.items.filter(item =>
      search ? `${item.name} ${item.description} ${item.status}`.toLocaleLowerCase().includes(search) : true,
    );
    const sorted = [...filtered].sort((left, right) => {
      const leftValue = left[pageable.sortBy as keyof Item];
      const rightValue = right[pageable.sortBy as keyof Item];
      const comparison = String(leftValue).localeCompare(String(rightValue), undefined, { numeric: true });
      return pageable.sortDirection === "desc" ? -comparison : comparison;
    });
    const start = pageable.page * pageable.rowsPerPage;
    return {
      content: sorted.slice(start, start + pageable.rowsPerPage),
      number: pageable.page,
      size: pageable.rowsPerPage,
      totalElements: sorted.length,
      totalPages: Math.ceil(sorted.length / pageable.rowsPerPage),
    };
  }

  async create(value: Item): Promise<Item> {
    const created = { ...value, id: this.nextId++ };
    this.items.push(created);
    return { ...created };
  }

  async update(id: number, value: Item): Promise<Item> {
    const index = this.items.findIndex(item => item.id === id);
    if (index < 0) throw new Error(`Mock item ${id} does not exist.`);
    const updated = { ...value, id };
    this.items[index] = updated;
    return { ...updated };
  }

  async delete(id: number): Promise<void> {
    this.items = this.items.filter(item => item.id !== id);
  }
}

class MockHistoryApi implements HistoryApi {
  async find<
    TSnapshot extends HistorySnapshot,
    TEntityKind extends HistoryEntityKind,
    TTimestamp extends HistoryTimestamp,
  >(
    _schema: z.ZodType<HistoryRecord<TSnapshot, TEntityKind, TTimestamp>>,
    _entity: TEntityKind,
    _entityId: string | number,
    _signal?: AbortSignal,
  ): Promise<HistoryRecord<TSnapshot, TEntityKind, TTimestamp>[]> {
    return [];
  }
}

const itemDefinition: QueryEngineEntityDefinition = {
  key: "ITEM",
  title: "Items",
  fields: [
    {
      path: "name",
      label: "Name",
      type: "STRING",
      enumType: null,
      enumValues: [],
      operators: ["CONTAINS", "EQUALS", "STARTS_WITH"],
      relation: false,
      relationEntityKey: null,
      relationMode: "CHILD",
      multiple: false,
      relationSelectionLabelFields: [],
      expandable: false,
      maxDepth: 0,
      children: [],
    },
    {
      path: "status",
      label: "Status",
      type: "ENUM",
      enumType: "ItemStatus",
      enumValues: ["DRAFT", "ACTIVE", "ARCHIVED"],
      operators: ["EQUALS", "NOT_EQUALS", "IN"],
      relation: false,
      relationEntityKey: null,
      relationMode: "CHILD",
      multiple: false,
      relationSelectionLabelFields: [],
      expandable: false,
      maxDepth: 0,
      children: [],
    },
  ],
};

class MockQueryEngineApi implements QueryEngineApi {
  async listEntities(): Promise<QueryEngineEntitySummary[]> {
    return [{ key: itemDefinition.key, filterableFieldCount: itemDefinition.fields.length }];
  }

  async describeEntity(entityKey: string): Promise<QueryEngineEntityDefinition> {
    if (entityKey !== itemDefinition.key) return { key: entityKey, title: entityKey, fields: [] };
    return itemDefinition;
  }

  async listRelationOptions(): Promise<QueryEngineRelationOption[]> {
    return [];
  }
}

export function createMockAppAdapters(): AppAdapters {
  return {
    auth: new MockAuthApi(),
    history: new MockHistoryApi(),
    items: new MockItemApi(),
    query: new MockQueryEngineApi(),
  };
}

export function installMockAppAdapters(): void {
  configureAppAdapters(createMockAppAdapters());
}
