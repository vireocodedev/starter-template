import { APP_PAGES } from "@/app/app.pages";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { ProjectForm } from "./features/project/components/forms/ProjectForm";
import { BASIC_FORM_TRANSLATION_NAMESPACE } from "@/app/app.localization";
import { useTranslation } from "react-i18next";

export function AppPageBasicFormPage() {
  const { t } = useTranslation(BASIC_FORM_TRANSLATION_NAMESPACE);
  return (
    <AppPageLayout
      header={
        <AppPageHeader
          backLabel={t("header.back")}
          backTo={APP_PAGES.devTools}
          title={t("header.title")}
          description={t("header.description")}
        />
      }
    >
      <ProjectForm />
    </AppPageLayout>
  );
}
