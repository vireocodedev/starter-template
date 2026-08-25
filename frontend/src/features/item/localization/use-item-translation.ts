import { useTranslation } from "react-i18next";
import { ITEM_TRANSLATION_NAMESPACE } from "@/app/app.localization";

export function useItemTranslation() {
  return useTranslation(ITEM_TRANSLATION_NAMESPACE);
}
