import { useTranslation } from "react-i18next";
import { APP_TRANSLATION_NAMESPACE } from "@/app/app.localization";

export function useAppTranslation() {
  return useTranslation<typeof APP_TRANSLATION_NAMESPACE>(APP_TRANSLATION_NAMESPACE);
}
