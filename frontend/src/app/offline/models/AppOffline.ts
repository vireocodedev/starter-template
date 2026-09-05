export enum ConnectivityStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
}

export enum SyncStatus {
  IDLE = "IDLE",
  SYNCING = "SYNCING",
  BLOCKED = "BLOCKED",
}

export enum CacheStatus {
  UNAVAILABLE = "UNAVAILABLE",
  HYDRATING = "HYDRATING",
  READY = "READY",
  STALE = "STALE",
}

export type AppSyncSummary = Readonly<{
  error: string | null;
  failed: number;
  pending: number;
  status: SyncStatus;
}>;

export type AppCacheReadiness = Readonly<{
  error: string | null;
  status: CacheStatus;
}>;

export type AppOfflineSimulation = Readonly<{
  enabled: boolean;
  failNextReplay: boolean;
}>;

export const DEFAULT_SYNC_SUMMARY: AppSyncSummary = Object.freeze({
  error: null,
  failed: 0,
  pending: 0,
  status: SyncStatus.IDLE,
});
export const DEFAULT_CACHE_READINESS: AppCacheReadiness = Object.freeze({
  error: null,
  status: CacheStatus.UNAVAILABLE,
});
export const DEFAULT_OFFLINE_SIMULATION: AppOfflineSimulation = Object.freeze({
  enabled: false,
  failNextReplay: false,
});
