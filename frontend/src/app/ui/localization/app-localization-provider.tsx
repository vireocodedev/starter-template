import React, { type PropsWithChildren } from "react";
import { I18nextProvider } from "react-i18next";
import { VireoTemporalLocalizationProvider } from "@vireocodedev/starter-ui/localization";
import { appI18n } from "@/app/ui/localization/app-i18n";
import { useAppPreferences } from "@/app/ui/preferences/hooks/useAppPreferences";

export function AppLocalizationProvider({ children }: PropsWithChildren) {
  const {
    preferences: { locale },
  } = useAppPreferences();

  React.useEffect(() => {
    document.documentElement.lang = locale;

    if (appI18n.resolvedLanguage !== locale) {
      void appI18n.changeLanguage(locale);
    }
  }, [locale]);

  return (
    <I18nextProvider i18n={appI18n}>
      <VireoTemporalLocalizationProvider locale={locale}>{children}</VireoTemporalLocalizationProvider>
    </I18nextProvider>
  );
}
