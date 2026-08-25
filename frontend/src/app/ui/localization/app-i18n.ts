import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_APP_LOCALE } from "@/app/ui/localization/app-locales";
import {
  APP_LOCALIZATION_RESOURCES,
  APP_TRANSLATION_NAMESPACE,
  APP_TRANSLATION_NAMESPACES,
} from "@/app/app.localization";

export const appI18n = createInstance();

void appI18n.use(initReactI18next).init({
  defaultNS: APP_TRANSLATION_NAMESPACE,
  fallbackLng: DEFAULT_APP_LOCALE,
  initAsync: false,
  interpolation: { escapeValue: false },
  lng: DEFAULT_APP_LOCALE,
  ns: APP_TRANSLATION_NAMESPACES,
  react: { useSuspense: false },
  resources: APP_LOCALIZATION_RESOURCES,
  supportedLngs: Object.keys(APP_LOCALIZATION_RESOURCES),
});
