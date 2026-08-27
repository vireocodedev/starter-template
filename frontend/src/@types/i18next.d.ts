import type { HistoryResources, PlatformResources, QueryEngineResources } from "@vireocodedev/localization";
import type {
  AppTranslationResources,
  EntityQueryFiltersTranslationResources,
  ForbiddenTranslationResources,
  HomeTranslationResources,
  ItemTranslationResources,
  ItemsTranslationResources,
  LoginTranslationResources,
  NotFoundTranslationResources,
  SettingsTranslationResources,
} from "@/app/app.localization";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "app";
    strictKeyChecks: true;
    resources: {
      app: AppTranslationResources;
      history: HistoryResources;
      item: ItemTranslationResources;
      home: HomeTranslationResources;
      login: LoginTranslationResources;
      forbidden: ForbiddenTranslationResources;
      notFound: NotFoundTranslationResources;
      settings: SettingsTranslationResources;
      items: ItemsTranslationResources;
      entityQueryFilters: EntityQueryFiltersTranslationResources;
      platform: PlatformResources;
      queryengine: QueryEngineResources;
    };
  }
}
