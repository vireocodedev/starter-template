import type { EntityListState } from "../models/EntityQueryFilters";

const entityListState = new Map<string, EntityListState<unknown>>();

export function readEntityListState<TTableState>(key: string): EntityListState<TTableState> | null {
  return (entityListState.get(key) as EntityListState<TTableState> | undefined) ?? null;
}

export function writeEntityListState<TTableState>(key: string, state: EntityListState<TTableState>): void {
  entityListState.set(key, state as EntityListState<unknown>);
}

export function clearEntityListState(key: string): void {
  entityListState.delete(key);
}
