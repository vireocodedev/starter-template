import { useTranslation } from "react-i18next";
import { ENTITY_QUERY_FILTERS_TRANSLATION_NAMESPACE } from "@/app/app.localization";

export function useEntityQueryFiltersTranslation() {
  return useTranslation(ENTITY_QUERY_FILTERS_TRANSLATION_NAMESPACE);
}
