import type { HistoryResources, PlatformResources, QueryEngineResources } from "@vireocodedev/localization";
import type {
  AppTranslationResources,
  BasicFormTranslationResources,
  BasicPageTranslationResources,
  DevToolsTranslationResources,
  DevToolsExamplesTranslationResources,
  EntityQueryFiltersExampleTranslationResources,
  EntityQueryFiltersTranslationResources,
  ForbiddenTranslationResources,
  HomeTranslationResources,
  ItemTranslationResources,
  ItemsTranslationResources,
  LoginTranslationResources,
  MultiStepFormTranslationResources,
  NotFoundTranslationResources,
  RelatedRecordCreationTranslationResources,
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
      devTools: DevToolsTranslationResources;
      devToolsExamples: DevToolsExamplesTranslationResources;
      items: ItemsTranslationResources;
      entityQueryFilters: EntityQueryFiltersTranslationResources;
      basicPage: BasicPageTranslationResources;
      basicForm: BasicFormTranslationResources;
      entityQueryFiltersExample: EntityQueryFiltersExampleTranslationResources;
      multiStepForm: MultiStepFormTranslationResources;
      relatedRecordCreation: RelatedRecordCreationTranslationResources;
      platform: PlatformResources;
      queryengine: QueryEngineResources;
    };
  }
}
