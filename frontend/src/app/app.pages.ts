import type { ComponentType } from "react";

export type AppPageAccess = "PUBLIC" | "AUTHENTICATED";
export type AppNavigationIcon = "OVERVIEW" | "ITEMS" | "SETTINGS" | "DEV_TOOLS";
export type AppPageModule = { default: ComponentType };

type AppPageDefinition = {
  access: AppPageAccess;
  buildPath: () => string;
  load: () => Promise<AppPageModule>;
  navigation?: { icon: AppNavigationIcon; labelKey: AppNavigationIcon; order: number };
  path: string;
};

function page<const T extends AppPageDefinition>(definition: T): T {
  return definition;
}

export const APP_PAGE_REGISTRY = {
  home: page({
    access: "AUTHENTICATED",
    path: "/",
    buildPath: () => "/",
    navigation: { icon: "OVERVIEW", labelKey: "OVERVIEW", order: 10 },
    load: async () => ({ default: (await import("@/pages/home/AppPageHome")).AppPageHome }),
  }),
  items: page({
    access: "AUTHENTICATED",
    path: "/items",
    buildPath: () => "/items",
    navigation: { icon: "ITEMS", labelKey: "ITEMS", order: 20 },
    load: async () => ({ default: (await import("@/pages/items/AppPageItems")).AppPageItems }),
  }),
  settings: page({
    access: "AUTHENTICATED",
    path: "/settings",
    buildPath: () => "/settings",
    navigation: { icon: "SETTINGS", labelKey: "SETTINGS", order: 30 },
    load: async () => ({ default: (await import("@/pages/settings/AppPageSettings")).AppPageSettings }),
  }),
  devTools: page({
    access: "AUTHENTICATED",
    path: "/dev-tools",
    buildPath: () => "/dev-tools",
    navigation: { icon: "DEV_TOOLS", labelKey: "DEV_TOOLS", order: 40 },
    load: async () => ({ default: (await import("@/pages/dev-tools/AppPageDevTools")).AppPageDevTools }),
  }),
  devToolsBasicPage: page({
    access: "AUTHENTICATED",
    path: "/dev-tools/page-examples/basic-page",
    buildPath: () => "/dev-tools/page-examples/basic-page",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/basic-page/AppPageBasicPage")).AppPageBasicPage,
    }),
  }),
  devToolsBasicFormPage: page({
    access: "AUTHENTICATED",
    path: "/dev-tools/page-examples/basic-form-page",
    buildPath: () => "/dev-tools/page-examples/basic-form-page",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/basic-form-page/AppPageBasicFormPage"))
        .AppPageBasicFormPage,
    }),
  }),
  devToolsMultiStepFormPage: page({
    access: "AUTHENTICATED",
    path: "/dev-tools/page-examples/multi-step-form-page",
    buildPath: () => "/dev-tools/page-examples/multi-step-form-page",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/multi-step-form-page/AppPageMultiStepFormPage"))
        .AppPageMultiStepFormPage,
    }),
  }),
  devToolsRelatedRecordCreation: page({
    access: "AUTHENTICATED",
    path: "/dev-tools/page-examples/related-record-creation",
    buildPath: () => "/dev-tools/page-examples/related-record-creation",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/related-record-creation/AppPageRelatedRecordCreation"))
        .AppPageRelatedRecordCreation,
    }),
  }),
  devToolsEntityQueryFilters: page({
    access: "AUTHENTICATED",
    path: "/dev-tools/page-examples/entity-query-filters",
    buildPath: () => "/dev-tools/page-examples/entity-query-filters",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/entity-query-filters/AppPageEntityQueryFilters"))
        .AppPageEntityQueryFilters,
    }),
  }),
  devToolsAdvancedFieldForm: page({
    access: "AUTHENTICATED",
    path: "/dev-tools/page-examples/advanced-field-form",
    buildPath: () => "/dev-tools/page-examples/advanced-field-form",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/advanced-field-form/AppPageAdvancedFieldForm"))
        .AppPageAdvancedFieldForm,
    }),
  }),
  devToolsUrlSynchronizedState: page({
    access: "AUTHENTICATED",
    path: "/dev-tools/page-examples/url-synchronized-state",
    buildPath: () => "/dev-tools/page-examples/url-synchronized-state",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/url-synchronized-state/AppPageUrlSynchronizedState"))
        .AppPageUrlSynchronizedState,
    }),
  }),
  devToolsAsyncDataStates: page({
    access: "AUTHENTICATED",
    path: "/dev-tools/page-examples/async-data-states",
    buildPath: () => "/dev-tools/page-examples/async-data-states",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/async-data-states/AppPageAsyncDataStates"))
        .AppPageAsyncDataStates,
    }),
  }),
  devToolsOfflineCrud: page({
    access: "AUTHENTICATED",
    path: "/dev-tools/page-examples/offline-crud",
    buildPath: () => "/dev-tools/page-examples/offline-crud",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/offline-crud/AppPageOfflineCrud")).AppPageOfflineCrud,
    }),
  }),
  devToolsRealtimeUpdates: page({
    access: "AUTHENTICATED",
    path: "/dev-tools/page-examples/realtime-updates",
    buildPath: () => "/dev-tools/page-examples/realtime-updates",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/realtime-updates/AppPageRealtimeUpdates"))
        .AppPageRealtimeUpdates,
    }),
  }),
  devToolsDragDropBoard: page({
    access: "AUTHENTICATED",
    path: "/dev-tools/page-examples/drag-drop-board",
    buildPath: () => "/dev-tools/page-examples/drag-drop-board",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/drag-drop-board/AppPageDragDropBoard"))
        .AppPageDragDropBoard,
    }),
  }),
  devToolsInfiniteCanvas: page({
    access: "AUTHENTICATED",
    path: "/dev-tools/page-examples/infinite-canvas",
    buildPath: () => "/dev-tools/page-examples/infinite-canvas",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/infinite-canvas/AppPageInfiniteCanvas"))
        .AppPageInfiniteCanvas,
    }),
  }),
  devToolsRegionalFormatting: page({
    access: "AUTHENTICATED",
    path: "/dev-tools/page-examples/regional-formatting",
    buildPath: () => "/dev-tools/page-examples/regional-formatting",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/regional-formatting/AppPageRegionalFormatting"))
        .AppPageRegionalFormatting,
    }),
  }),
  devToolsBrowserCapabilities: page({
    access: "AUTHENTICATED",
    path: "/dev-tools/page-examples/browser-capabilities",
    buildPath: () => "/dev-tools/page-examples/browser-capabilities",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/browser-capabilities/AppPageBrowserCapabilities"))
        .AppPageBrowserCapabilities,
    }),
  }),
  devToolsInitializationReadiness: page({
    access: "AUTHENTICATED",
    path: "/dev-tools/page-examples/initialization-readiness",
    buildPath: () => "/dev-tools/page-examples/initialization-readiness",
    load: async () => ({
      default: (await import("@/pages/dev-tools/page-examples/initialization-readiness/AppPageInitializationReadiness"))
        .AppPageInitializationReadiness,
    }),
  }),
  forbidden: page({
    access: "AUTHENTICATED",
    path: "/forbidden",
    buildPath: () => "/forbidden",
    load: async () => ({ default: (await import("@/pages/forbidden/AppPageForbidden")).AppPageForbidden }),
  }),
  notFound: page({
    access: "AUTHENTICATED",
    path: "/not-found",
    buildPath: () => "/not-found",
    load: async () => ({ default: (await import("@/pages/not-found/AppPageNotFound")).AppPageNotFound }),
  }),
  login: page({
    access: "PUBLIC",
    path: "/login",
    buildPath: () => "/login",
    load: async () => ({ default: (await import("@/pages/login/AppPageLogin")).AppPageLogin }),
  }),
} as const;

export type AppPageId = keyof typeof APP_PAGE_REGISTRY;

export const APP_PAGES = Object.fromEntries(
  Object.entries(APP_PAGE_REGISTRY).map(([id, definition]) => [id, definition.path]),
) as { [K in AppPageId]: (typeof APP_PAGE_REGISTRY)[K]["path"] };

export const APP_NAVIGATION_PAGES = Object.entries(APP_PAGE_REGISTRY)
  .flatMap(([id, definition]) =>
    "navigation" in definition ? [{ id: id as AppPageId, path: definition.path, ...definition.navigation }] : [],
  )
  .sort((left, right) => left.order - right.order);
