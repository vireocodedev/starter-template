import type { ComponentType } from "react";
import { AppPageHomeView } from "@/pages/home/AppPageHomeView";

export type AppPageAccess = "PUBLIC" | "AUTHENTICATED";
export type AppNavigationIcon = "OVERVIEW" | "ITEMS" | "SETTINGS" | "DEV_TOOLS";
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

type AppPageDefinition = {
  access: AppPageAccess;
  buildPath: () => string;
  load: () => Promise<AppPageModule>;
  loading: AppRouteLoadingPolicy;
  navigation?: { icon: AppNavigationIcon; labelKey: AppNavigationIcon; order: number };
  path: string;
};

function page<const T extends AppPageDefinition>(definition: T): T {
  return definition;
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
const OVERVIEW_SKELETON = { policy: "skeleton", composition: "overview" } as const satisfies AppRouteLoadingPolicy;

export const APP_PAGE_REGISTRY = {
  home: page({
    access: "AUTHENTICATED",
    loading: OVERVIEW_SKELETON,
    path: "/",
    buildPath: () => "/",
    navigation: { icon: "OVERVIEW", labelKey: "OVERVIEW", order: 10 },
    load: async () => ({ default: (await import("@/pages/home/AppPageHome")).AppPageHome }),
  }),
  items: page({
    access: "AUTHENTICATED",
    loading: pageProgress("items"),
    path: "/items",
    buildPath: () => "/items",
    navigation: { icon: "ITEMS", labelKey: "ITEMS", order: 20 },
    load: async () => ({ default: (await import("@/pages/items/AppPageItems")).AppPageItems }),
  }),
  settings: page({
    access: "AUTHENTICATED",
    loading: pageProgress("settings"),
    path: "/settings",
    buildPath: () => "/settings",
    navigation: { icon: "SETTINGS", labelKey: "SETTINGS", order: 30 },
    load: async () => ({ default: (await import("@/pages/settings/AppPageSettings")).AppPageSettings }),
  }),
  devTools: page({
    access: "AUTHENTICATED",
    loading: pageProgress("devTools"),
    path: "/dev-tools",
    buildPath: () => "/dev-tools",
    navigation: { icon: "DEV_TOOLS", labelKey: "DEV_TOOLS", order: 40 },
    load: async () => ({ default: (await import("@/pages/dev-tools/AppPageDevTools")).AppPageDevTools }),
  }),
  devToolsBasicPage: page({
    access: "AUTHENTICATED",
    loading: pageProgress("basicPage", "header.title", "header.description", "/dev-tools", "header.back"),
    path: "/dev-tools/page-examples/basic-page",
    buildPath: () => "/dev-tools/page-examples/basic-page",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/basic-page/AppPageBasicPage")).AppPageBasicPage,
    }),
  }),
  devToolsBasicFormPage: page({
    access: "AUTHENTICATED",
    loading: pageProgress("basicForm", "header.title", "header.description", "/dev-tools", "header.back"),
    path: "/dev-tools/page-examples/basic-form-page",
    buildPath: () => "/dev-tools/page-examples/basic-form-page",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/basic-form-page/AppPageBasicFormPage"))
        .AppPageBasicFormPage,
    }),
  }),
  devToolsMultiStepFormPage: page({
    access: "AUTHENTICATED",
    loading: pageProgress("multiStepForm", "header.title", "header.description", "/dev-tools", "header.back"),
    path: "/dev-tools/page-examples/multi-step-form-page",
    buildPath: () => "/dev-tools/page-examples/multi-step-form-page",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/multi-step-form-page/AppPageMultiStepFormPage"))
        .AppPageMultiStepFormPage,
    }),
  }),
  devToolsRelatedRecordCreation: page({
    access: "AUTHENTICATED",
    loading: pageProgress(
      "relatedRecordCreation",
      "header.invoiceTitle",
      "header.invoiceDescription",
      "/dev-tools",
      "header.backDevTools",
    ),
    path: "/dev-tools/page-examples/related-record-creation",
    buildPath: () => "/dev-tools/page-examples/related-record-creation",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/related-record-creation/AppPageRelatedRecordCreation"))
        .AppPageRelatedRecordCreation,
    }),
  }),
  devToolsEntityQueryFilters: page({
    access: "AUTHENTICATED",
    loading: pageProgress(
      "entityQueryFiltersExample",
      "header.title",
      "header.description",
      "/dev-tools",
      "header.back",
    ),
    path: "/dev-tools/page-examples/entity-query-filters",
    buildPath: () => "/dev-tools/page-examples/entity-query-filters",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/entity-query-filters/AppPageEntityQueryFilters"))
        .AppPageEntityQueryFilters,
    }),
  }),
  devToolsAdvancedFieldForm: page({
    access: "AUTHENTICATED",
    loading: pageProgress(
      "devToolsExamples",
      "advancedForm.header.title",
      "advancedForm.header.description",
      "/dev-tools",
      "common.back",
    ),
    path: "/dev-tools/page-examples/advanced-field-form",
    buildPath: () => "/dev-tools/page-examples/advanced-field-form",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/advanced-field-form/AppPageAdvancedFieldForm"))
        .AppPageAdvancedFieldForm,
    }),
  }),
  devToolsUrlSynchronizedState: page({
    access: "AUTHENTICATED",
    loading: pageProgress(
      "devToolsExamples",
      "urlState.header.title",
      "urlState.header.description",
      "/dev-tools",
      "common.back",
    ),
    path: "/dev-tools/page-examples/url-synchronized-state",
    buildPath: () => "/dev-tools/page-examples/url-synchronized-state",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/url-synchronized-state/AppPageUrlSynchronizedState"))
        .AppPageUrlSynchronizedState,
    }),
  }),
  devToolsAsyncDataStates: page({
    access: "AUTHENTICATED",
    loading: pageProgress(
      "devToolsExamples",
      "asyncStates.header.title",
      "asyncStates.header.description",
      "/dev-tools",
      "common.back",
    ),
    path: "/dev-tools/page-examples/async-data-states",
    buildPath: () => "/dev-tools/page-examples/async-data-states",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/async-data-states/AppPageAsyncDataStates"))
        .AppPageAsyncDataStates,
    }),
  }),
  devToolsOfflineCrud: page({
    access: "AUTHENTICATED",
    loading: pageProgress(
      "devToolsExamples",
      "offlineCrud.header.title",
      "offlineCrud.header.description",
      "/dev-tools",
      "common.back",
    ),
    path: "/dev-tools/page-examples/offline-crud",
    buildPath: () => "/dev-tools/page-examples/offline-crud",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/offline-crud/AppPageOfflineCrud")).AppPageOfflineCrud,
    }),
  }),
  devToolsRealtimeUpdates: page({
    access: "AUTHENTICATED",
    loading: pageProgress(
      "devToolsExamples",
      "realtime.header.title",
      "realtime.header.description",
      "/dev-tools",
      "common.back",
    ),
    path: "/dev-tools/page-examples/realtime-updates",
    buildPath: () => "/dev-tools/page-examples/realtime-updates",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/realtime-updates/AppPageRealtimeUpdates"))
        .AppPageRealtimeUpdates,
    }),
  }),
  devToolsDragDropBoard: page({
    access: "AUTHENTICATED",
    loading: pageProgress(
      "devToolsExamples",
      "dragDrop.header.title",
      "dragDrop.header.description",
      "/dev-tools",
      "common.back",
    ),
    path: "/dev-tools/page-examples/drag-drop-board",
    buildPath: () => "/dev-tools/page-examples/drag-drop-board",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/drag-drop-board/AppPageDragDropBoard"))
        .AppPageDragDropBoard,
    }),
  }),
  devToolsInfiniteCanvas: page({
    access: "AUTHENTICATED",
    loading: pageProgress(
      "devToolsExamples",
      "canvas.header.title",
      "canvas.header.description",
      "/dev-tools",
      "common.back",
    ),
    path: "/dev-tools/page-examples/infinite-canvas",
    buildPath: () => "/dev-tools/page-examples/infinite-canvas",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/infinite-canvas/AppPageInfiniteCanvas"))
        .AppPageInfiniteCanvas,
    }),
  }),
  devToolsRegionalFormatting: page({
    access: "AUTHENTICATED",
    loading: pageProgress(
      "devToolsExamples",
      "regional.header.title",
      "regional.header.description",
      "/dev-tools",
      "common.back",
    ),
    path: "/dev-tools/page-examples/regional-formatting",
    buildPath: () => "/dev-tools/page-examples/regional-formatting",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/regional-formatting/AppPageRegionalFormatting"))
        .AppPageRegionalFormatting,
    }),
  }),
  devToolsBrowserCapabilities: page({
    access: "AUTHENTICATED",
    loading: pageProgress(
      "devToolsExamples",
      "browser.header.title",
      "browser.header.description",
      "/dev-tools",
      "common.back",
    ),
    path: "/dev-tools/page-examples/browser-capabilities",
    buildPath: () => "/dev-tools/page-examples/browser-capabilities",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/browser-capabilities/AppPageBrowserCapabilities"))
        .AppPageBrowserCapabilities,
    }),
  }),
  devToolsInitializationReadiness: page({
    access: "AUTHENTICATED",
    loading: pageProgress(
      "devToolsExamples",
      "initialization.header.title",
      "initialization.header.description",
      "/dev-tools",
      "common.back",
    ),
    path: "/dev-tools/page-examples/initialization-readiness",
    buildPath: () => "/dev-tools/page-examples/initialization-readiness",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/initialization-readiness/AppPageInitializationReadiness"))
        .AppPageInitializationReadiness,
    }),
  }),
  forbidden: page({
    access: "AUTHENTICATED",
    loading: pageProgress("forbidden"),
    path: "/forbidden",
    buildPath: () => "/forbidden",
    load: async () => ({ default: (await import("@/pages/forbidden/AppPageForbidden")).AppPageForbidden }),
  }),
  notFound: page({
    access: "AUTHENTICATED",
    loading: pageProgress("notFound"),
    path: "/not-found",
    buildPath: () => "/not-found",
    load: async () => ({ default: (await import("@/pages/not-found/AppPageNotFound")).AppPageNotFound }),
  }),
  login: page({
    access: "PUBLIC",
    loading: APPLICATION_PROGRESS,
    path: "/login",
    buildPath: () => "/login",
    load: async () => ({ default: (await import("@/pages/login/AppPageLogin")).AppPageLogin }),
  }),
} as const;

export type AppPageId = keyof typeof APP_PAGE_REGISTRY;

const pageModuleCache = new Map<AppPageId, Promise<AppPageModule>>();

/** Loads each route module once and reuses the promise for intent prefetch and React.lazy. */
export function loadAppPage(id: AppPageId): Promise<AppPageModule> {
  const cached = pageModuleCache.get(id);
  if (cached) return cached;

  const pending = APP_PAGE_REGISTRY[id].load();
  pageModuleCache.set(id, pending);
  void pending.catch(() => pageModuleCache.delete(id));
  return pending;
}

/** Warms a route chunk from navigation intent without delaying navigation. */
export function preloadAppPage(path: string): void {
  const match = Object.entries(APP_PAGE_REGISTRY).find(([, definition]) => definition.path === path);
  if (match) void loadAppPage(match[0] as AppPageId);
}

export const APP_PAGES = Object.fromEntries(
  Object.entries(APP_PAGE_REGISTRY).map(([id, definition]) => [id, definition.path]),
) as { [K in AppPageId]: (typeof APP_PAGE_REGISTRY)[K]["path"] };

export const APP_NAVIGATION_PAGES = Object.entries(APP_PAGE_REGISTRY)
  .flatMap(([id, definition]) =>
    "navigation" in definition ? [{ id: id as AppPageId, path: definition.path, ...definition.navigation }] : [],
  )
  .sort((left, right) => left.order - right.order);
