import type { ComponentType } from "react";
import { AppPageHome } from "@/pages/home/AppPageHome";
import { AppPageHomeView } from "@/pages/home/AppPageHomeView";
import { VIREO_GENERATED_CAPABILITIES } from "@/generated/vireo.capabilities";
import type { VireoGeneratedCapability } from "@/app/generated/VireoGeneratedCapability";

export type AppPageAccess = "PUBLIC" | "AUTHENTICATED";
export type AppNavigationIcon = "OVERVIEW" | "ITEMS" | "SETTINGS" | "GENERATED";
export type AppPageModule = { default: ComponentType };

export const APP_ROUTE_SKELETON_COMPOSITIONS = {
  overview: AppPageHomeView,
} as const satisfies Record<string, ComponentType<{ loading?: boolean }>>;

export type AppRouteSkeletonComposition = keyof typeof APP_ROUTE_SKELETON_COMPOSITIONS;

export type AppRouteLoadingHeader = {
  backLabelKey?: string;
  backTo?: string;
  descriptionKey: string;
  namespace: string;
  titleKey: string;
};

export type AppRouteLoadingPolicy =
  | { policy: "none" }
  | { policy: "retain" }
  | { policy: "progress"; frame: "application" | "page"; header?: AppRouteLoadingHeader }
  | { policy: "skeleton"; composition: AppRouteSkeletonComposition };

type AppPageDefinitionBase = {
  access: AppPageAccess;
  buildPath: () => string;
  loading: AppRouteLoadingPolicy;
  navigation?:
    | {
        icon: Exclude<AppNavigationIcon, "GENERATED">;
        labelKey: Exclude<AppNavigationIcon, "GENERATED">;
        order: number;
      }
    | { icon: "GENERATED"; labels: { en: string; hr: string }; order: number };
  path: string;
};

type AppPageDefinition = AppPageDefinitionBase &
  ({ render: "eager"; component: ComponentType } | { render: "lazy"; load: () => Promise<AppPageModule> });

function eagerPage<const T extends AppPageDefinitionBase & { component: ComponentType }>(definition: T) {
  return { ...definition, render: "eager" as const };
}

function lazyPage<const T extends AppPageDefinitionBase & { load: () => Promise<AppPageModule> }>(definition: T) {
  return { ...definition, render: "lazy" as const };
}

function pageProgress(
  namespace: string,
  titleKey = "header.title",
  descriptionKey = "header.description",
  backTo?: string,
  backLabelKey?: string,
) {
  return {
    policy: "progress",
    frame: "page",
    header: { backLabelKey, backTo, descriptionKey, namespace, titleKey },
  } as const satisfies AppRouteLoadingPolicy;
}

const APPLICATION_PROGRESS = { policy: "progress", frame: "application" } as const satisfies AppRouteLoadingPolicy;
const APP_BUILT_IN_PAGE_REGISTRY = {
  home: eagerPage({
    access: "AUTHENTICATED",
    component: AppPageHome,
    loading: { policy: "none" },
    path: "/",
    buildPath: () => "/",
    navigation: { icon: "OVERVIEW", labelKey: "OVERVIEW", order: 10 },
  }),
  items: lazyPage({
    access: "AUTHENTICATED",
    loading: pageProgress("items"),
    path: "/items",
    buildPath: () => "/items",
    navigation: { icon: "ITEMS", labelKey: "ITEMS", order: 20 },
    load: async () => ({ default: (await import("@/pages/items/AppPageItems")).AppPageItems }),
  }),
  settings: lazyPage({
    access: "AUTHENTICATED",
    loading: pageProgress("settings"),
    path: "/settings",
    buildPath: () => "/settings",
    navigation: { icon: "SETTINGS", labelKey: "SETTINGS", order: 30 },
    load: async () => ({ default: (await import("@/pages/settings/AppPageSettings")).AppPageSettings }),
  }),
  forbidden: lazyPage({
    access: "AUTHENTICATED",
    loading: pageProgress("forbidden"),
    path: "/forbidden",
    buildPath: () => "/forbidden",
    load: async () => ({ default: (await import("@/pages/forbidden/AppPageForbidden")).AppPageForbidden }),
  }),
  notFound: lazyPage({
    access: "AUTHENTICATED",
    loading: pageProgress("notFound"),
    path: "/not-found",
    buildPath: () => "/not-found",
    load: async () => ({ default: (await import("@/pages/not-found/AppPageNotFound")).AppPageNotFound }),
  }),
  login: lazyPage({
    access: "PUBLIC",
    loading: APPLICATION_PROGRESS,
    path: "/login",
    buildPath: () => "/login",
    load: async () => ({ default: (await import("@/pages/login/AppPageLogin")).AppPageLogin }),
  }),
} as const satisfies Record<string, AppPageDefinition>;

const generatedCapabilities: readonly VireoGeneratedCapability[] = VIREO_GENERATED_CAPABILITIES;
const APP_GENERATED_PAGE_REGISTRY = Object.fromEntries(
  generatedCapabilities.map(capability => [
    capability.id,
    lazyPage({
      access: "AUTHENTICATED",
      loading: pageProgress(capability.namespace),
      path: capability.path,
      buildPath: () => capability.path,
      navigation: { icon: "GENERATED", labels: capability.navigationLabels, order: capability.navigationOrder },
      load: capability.load,
    }),
  ]),
) satisfies Record<string, AppPageDefinition>;

export const APP_PAGE_REGISTRY = {
  ...APP_BUILT_IN_PAGE_REGISTRY,
  ...APP_GENERATED_PAGE_REGISTRY,
} as typeof APP_BUILT_IN_PAGE_REGISTRY & Record<string, AppPageDefinition>;

export type AppPageId = string;

const pageModuleCache = new Map<AppPageId, Promise<AppPageModule>>();

/** Loads each route module once and reuses the promise for intent prefetch and React.lazy. */
export function loadAppPage(id: AppPageId): Promise<AppPageModule> {
  const definition = APP_PAGE_REGISTRY[id];
  if (definition.render === "eager") return Promise.resolve({ default: definition.component });

  const cached = pageModuleCache.get(id);
  if (cached) return cached;

  const pending = definition.load();
  pageModuleCache.set(id, pending);
  void pending.catch(() => pageModuleCache.delete(id));
  return pending;
}

/** Warms a route chunk from navigation intent without delaying navigation. */
export function preloadAppPage(path: string): void {
  const match = Object.entries(APP_PAGE_REGISTRY).find(([, definition]) => definition.path === path);
  if (match?.[1].render === "lazy") void loadAppPage(match[0] as AppPageId);
}

export const APP_PAGES = Object.fromEntries(
  Object.entries(APP_PAGE_REGISTRY).map(([id, definition]) => [id, definition.path]),
) as Record<AppPageId, string> & {
  [K in keyof typeof APP_BUILT_IN_PAGE_REGISTRY]: (typeof APP_BUILT_IN_PAGE_REGISTRY)[K]["path"];
};

export const APP_NAVIGATION_PAGES = Object.entries(APP_PAGE_REGISTRY)
  .flatMap(([id, definition]) =>
    "navigation" in definition && definition.navigation
      ? [{ id: id as AppPageId, path: definition.path, ...definition.navigation }]
      : [],
  )
  .sort((left, right) => left.order - right.order);
