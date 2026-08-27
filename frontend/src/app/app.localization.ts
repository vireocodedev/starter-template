import {
  createStarterResources,
  STARTER_TRANSLATION_NAMESPACES,
  type StarterNamespaceResources,
  type WidenLeaves,
} from "@vireocodedev/localization";
import { APP_LOCALES, type AppLocale } from "@/app/ui/localization/app-locales";
import en from "@/app/ui/localization/resources/app.en";
import hr from "@/app/ui/localization/resources/app.hr";
import itemEn from "@/features/item/localization/resources/item.en";
import itemHr from "@/features/item/localization/resources/item.hr";
import homeEn from "@/pages/home/localization/resources/home.en";
import homeHr from "@/pages/home/localization/resources/home.hr";
import loginEn from "@/pages/login/localization/resources/login.en";
import loginHr from "@/pages/login/localization/resources/login.hr";
import forbiddenEn from "@/pages/forbidden/localization/resources/forbidden.en";
import forbiddenHr from "@/pages/forbidden/localization/resources/forbidden.hr";
import notFoundEn from "@/pages/not-found/localization/resources/not-found.en";
import notFoundHr from "@/pages/not-found/localization/resources/not-found.hr";
import settingsEn from "@/pages/settings/localization/resources/settings.en";
import settingsHr from "@/pages/settings/localization/resources/settings.hr";
import devToolsEn from "@/pages/dev-tools/localization/resources/dev-tools.en";
import devToolsHr from "@/pages/dev-tools/localization/resources/dev-tools.hr";
import itemsEn from "@/pages/items/localization/resources/items.en";
import itemsHr from "@/pages/items/localization/resources/items.hr";
import entityQueryFiltersEn from "@/features/entity-query-filters/localization/resources/entity-query-filters.en";
import entityQueryFiltersHr from "@/features/entity-query-filters/localization/resources/entity-query-filters.hr";
import basicPageEn from "@/pages/dev-tools/page-examples/basic-page/localization/resources/basic-page.en";
import basicPageHr from "@/pages/dev-tools/page-examples/basic-page/localization/resources/basic-page.hr";
import basicFormEn from "@/pages/dev-tools/page-examples/basic-form-page/localization/resources/basic-form.en";
import basicFormHr from "@/pages/dev-tools/page-examples/basic-form-page/localization/resources/basic-form.hr";
import entityQueryFiltersExampleEn from "@/pages/dev-tools/page-examples/entity-query-filters/localization/resources/entity-query-filters-example.en";
import entityQueryFiltersExampleHr from "@/pages/dev-tools/page-examples/entity-query-filters/localization/resources/entity-query-filters-example.hr";
import multiStepFormEn from "@/pages/dev-tools/page-examples/multi-step-form-page/localization/resources/multi-step-form.en";
import multiStepFormHr from "@/pages/dev-tools/page-examples/multi-step-form-page/localization/resources/multi-step-form.hr";
import relatedRecordCreationEn from "@/pages/dev-tools/page-examples/related-record-creation/localization/resources/related-record-creation.en";
import relatedRecordCreationHr from "@/pages/dev-tools/page-examples/related-record-creation/localization/resources/related-record-creation.hr";
import devToolsExamplesEn from "@/pages/dev-tools/page-examples/localization/resources/dev-tools-examples.en";
import devToolsExamplesHr from "@/pages/dev-tools/page-examples/localization/resources/dev-tools-examples.hr";

export const APP_TRANSLATION_NAMESPACE = "app" as const;
export const ITEM_TRANSLATION_NAMESPACE = "item" as const;
export const HOME_TRANSLATION_NAMESPACE = "home" as const;
export const LOGIN_TRANSLATION_NAMESPACE = "login" as const;
export const FORBIDDEN_TRANSLATION_NAMESPACE = "forbidden" as const;
export const NOT_FOUND_TRANSLATION_NAMESPACE = "notFound" as const;
export const SETTINGS_TRANSLATION_NAMESPACE = "settings" as const;
export const DEV_TOOLS_TRANSLATION_NAMESPACE = "devTools" as const;
export const ITEMS_TRANSLATION_NAMESPACE = "items" as const;
export const ENTITY_QUERY_FILTERS_TRANSLATION_NAMESPACE = "entityQueryFilters" as const;
export const BASIC_PAGE_TRANSLATION_NAMESPACE = "basicPage" as const;
export const BASIC_FORM_TRANSLATION_NAMESPACE = "basicForm" as const;
export const ENTITY_QUERY_FILTERS_EXAMPLE_TRANSLATION_NAMESPACE = "entityQueryFiltersExample" as const;
export const MULTI_STEP_FORM_TRANSLATION_NAMESPACE = "multiStepForm" as const;
export const RELATED_RECORD_CREATION_TRANSLATION_NAMESPACE = "relatedRecordCreation" as const;
export const DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE = "devToolsExamples" as const;

export type AppTranslationResources = WidenLeaves<typeof en>;
export type ItemTranslationResources = WidenLeaves<typeof itemEn>;
export type HomeTranslationResources = WidenLeaves<typeof homeEn>;
export type LoginTranslationResources = WidenLeaves<typeof loginEn>;
export type ForbiddenTranslationResources = WidenLeaves<typeof forbiddenEn>;
export type NotFoundTranslationResources = WidenLeaves<typeof notFoundEn>;
export type SettingsTranslationResources = WidenLeaves<typeof settingsEn>;
export type DevToolsTranslationResources = WidenLeaves<typeof devToolsEn>;
export type ItemsTranslationResources = WidenLeaves<typeof itemsEn>;
export type EntityQueryFiltersTranslationResources = WidenLeaves<typeof entityQueryFiltersEn>;
export type BasicPageTranslationResources = WidenLeaves<typeof basicPageEn>;
export type BasicFormTranslationResources = WidenLeaves<typeof basicFormEn>;
export type EntityQueryFiltersExampleTranslationResources = WidenLeaves<typeof entityQueryFiltersExampleEn>;
export type MultiStepFormTranslationResources = WidenLeaves<typeof multiStepFormEn>;
export type RelatedRecordCreationTranslationResources = WidenLeaves<typeof relatedRecordCreationEn>;
export type DevToolsExamplesTranslationResources = WidenLeaves<typeof devToolsExamplesEn>;

const starterResources = createStarterResources({ locales: APP_LOCALES });
type AppLocaleResources = StarterNamespaceResources & {
  app: AppTranslationResources;
  item: ItemTranslationResources;
  home: HomeTranslationResources;
  login: LoginTranslationResources;
  forbidden: ForbiddenTranslationResources;
  notFound: NotFoundTranslationResources;
  settings: SettingsTranslationResources;
  devTools: DevToolsTranslationResources;
  items: ItemsTranslationResources;
  entityQueryFilters: EntityQueryFiltersTranslationResources;
  basicPage: BasicPageTranslationResources;
  basicForm: BasicFormTranslationResources;
  entityQueryFiltersExample: EntityQueryFiltersExampleTranslationResources;
  multiStepForm: MultiStepFormTranslationResources;
  relatedRecordCreation: RelatedRecordCreationTranslationResources;
  devToolsExamples: DevToolsExamplesTranslationResources;
};

export const APP_LOCALIZATION_RESOURCES = {
  en: {
    app: en,
    item: itemEn,
    home: homeEn,
    login: loginEn,
    forbidden: forbiddenEn,
    notFound: notFoundEn,
    settings: settingsEn,
    devTools: devToolsEn,
    items: itemsEn,
    entityQueryFilters: entityQueryFiltersEn,
    basicPage: basicPageEn,
    basicForm: basicFormEn,
    entityQueryFiltersExample: entityQueryFiltersExampleEn,
    multiStepForm: multiStepFormEn,
    relatedRecordCreation: relatedRecordCreationEn,
    devToolsExamples: devToolsExamplesEn,
    ...starterResources.en,
  },
  hr: {
    app: hr,
    item: itemHr,
    home: homeHr,
    login: loginHr,
    forbidden: forbiddenHr,
    notFound: notFoundHr,
    settings: settingsHr,
    devTools: devToolsHr,
    items: itemsHr,
    entityQueryFilters: entityQueryFiltersHr,
    basicPage: basicPageHr,
    basicForm: basicFormHr,
    entityQueryFiltersExample: entityQueryFiltersExampleHr,
    multiStepForm: multiStepFormHr,
    relatedRecordCreation: relatedRecordCreationHr,
    devToolsExamples: devToolsExamplesHr,
    ...starterResources.hr,
  },
} satisfies Record<AppLocale, AppLocaleResources>;

export const APP_TRANSLATION_NAMESPACES = [
  APP_TRANSLATION_NAMESPACE,
  ITEM_TRANSLATION_NAMESPACE,
  HOME_TRANSLATION_NAMESPACE,
  LOGIN_TRANSLATION_NAMESPACE,
  FORBIDDEN_TRANSLATION_NAMESPACE,
  NOT_FOUND_TRANSLATION_NAMESPACE,
  SETTINGS_TRANSLATION_NAMESPACE,
  DEV_TOOLS_TRANSLATION_NAMESPACE,
  ITEMS_TRANSLATION_NAMESPACE,
  ENTITY_QUERY_FILTERS_TRANSLATION_NAMESPACE,
  BASIC_PAGE_TRANSLATION_NAMESPACE,
  BASIC_FORM_TRANSLATION_NAMESPACE,
  ENTITY_QUERY_FILTERS_EXAMPLE_TRANSLATION_NAMESPACE,
  MULTI_STEP_FORM_TRANSLATION_NAMESPACE,
  RELATED_RECORD_CREATION_TRANSLATION_NAMESPACE,
  DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE,
  ...STARTER_TRANSLATION_NAMESPACES,
] as const;
