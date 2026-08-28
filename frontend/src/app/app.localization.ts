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
import itemsEn from "@/pages/items/localization/resources/items.en";
import itemsHr from "@/pages/items/localization/resources/items.hr";
import entityQueryFiltersEn from "@/features/entity-query-filters/localization/resources/entity-query-filters.en";
import entityQueryFiltersHr from "@/features/entity-query-filters/localization/resources/entity-query-filters.hr";
import { VIREO_GENERATED_CAPABILITIES } from "@/generated/vireo.capabilities";
import type { VireoGeneratedCapability } from "@/app/generated/VireoGeneratedCapability";

export const APP_TRANSLATION_NAMESPACE = "app" as const;
export const ITEM_TRANSLATION_NAMESPACE = "item" as const;
export const HOME_TRANSLATION_NAMESPACE = "home" as const;
export const LOGIN_TRANSLATION_NAMESPACE = "login" as const;
export const FORBIDDEN_TRANSLATION_NAMESPACE = "forbidden" as const;
export const NOT_FOUND_TRANSLATION_NAMESPACE = "notFound" as const;
export const SETTINGS_TRANSLATION_NAMESPACE = "settings" as const;
export const ITEMS_TRANSLATION_NAMESPACE = "items" as const;
export const ENTITY_QUERY_FILTERS_TRANSLATION_NAMESPACE = "entityQueryFilters" as const;

export type AppTranslationResources = WidenLeaves<typeof en>;
export type ItemTranslationResources = WidenLeaves<typeof itemEn>;
export type HomeTranslationResources = WidenLeaves<typeof homeEn>;
export type LoginTranslationResources = WidenLeaves<typeof loginEn>;
export type ForbiddenTranslationResources = WidenLeaves<typeof forbiddenEn>;
export type NotFoundTranslationResources = WidenLeaves<typeof notFoundEn>;
export type SettingsTranslationResources = WidenLeaves<typeof settingsEn>;
export type ItemsTranslationResources = WidenLeaves<typeof itemsEn>;
export type EntityQueryFiltersTranslationResources = WidenLeaves<typeof entityQueryFiltersEn>;

const starterResources = createStarterResources({ locales: APP_LOCALES });
const generatedCapabilities: readonly VireoGeneratedCapability[] = VIREO_GENERATED_CAPABILITIES;
const generatedResources = Object.fromEntries(
  APP_LOCALES.map(locale => [
    locale,
    Object.fromEntries(generatedCapabilities.map(capability => [capability.namespace, capability.resources[locale]])),
  ]),
) as Record<AppLocale, Record<string, Record<string, unknown>>>;
type AppLocaleResources = StarterNamespaceResources & {
  app: AppTranslationResources;
  item: ItemTranslationResources;
  home: HomeTranslationResources;
  login: LoginTranslationResources;
  forbidden: ForbiddenTranslationResources;
  notFound: NotFoundTranslationResources;
  settings: SettingsTranslationResources;
  items: ItemsTranslationResources;
  entityQueryFilters: EntityQueryFiltersTranslationResources;
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
    items: itemsEn,
    entityQueryFilters: entityQueryFiltersEn,
    ...generatedResources.en,
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
    items: itemsHr,
    entityQueryFilters: entityQueryFiltersHr,
    ...generatedResources.hr,
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
  ITEMS_TRANSLATION_NAMESPACE,
  ENTITY_QUERY_FILTERS_TRANSLATION_NAMESPACE,
  ...generatedCapabilities.map(capability => capability.namespace),
  ...STARTER_TRANSLATION_NAMESPACES,
];
