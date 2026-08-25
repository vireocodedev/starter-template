import { APP_PAGES } from "@/app/app.pages";
import { DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE } from "@/app/app.localization";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { useTranslation } from "react-i18next";
import { WorkOrderForm } from "./features/work-order/components/forms/WorkOrderForm";

export function AppPageAdvancedFieldForm() {
  const { t } = useTranslation(DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE);
  return (
    <AppPageLayout
      header={
        <AppPageHeader
          backTo={APP_PAGES.devTools}
          backLabel={t("common.back")}
          title={t("advancedForm.header.title")}
          description={t("advancedForm.header.description")}
        />
      }
    >
      <WorkOrderForm />
    </AppPageLayout>
  );
}
