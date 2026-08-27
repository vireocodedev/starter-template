import {
  ArrowForwardRounded,
  DescriptionOutlined,
  FactCheckOutlined,
  LockRounded,
  PersonAddAltOutlined,
  TravelExploreRounded,
  FilterAltOutlined,
  ViewWeekOutlined,
} from "@mui/icons-material";
import { Button } from "@mui/material";
import { VireoPreferencePanel, type VireoPreferenceSectionDefinition } from "@vireocodedev/ui";
import { Link } from "react-router";
import { APP_PAGES } from "@/app/app.pages";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { useTranslation } from "react-i18next";
import { DEV_TOOLS_TRANSLATION_NAMESPACE } from "@/app/app.localization";
import type { TFunction } from "i18next";

function getSections(t: TFunction<typeof DEV_TOOLS_TRANSLATION_NAMESPACE>): VireoPreferenceSectionDefinition[] {
  return [
    {
      id: "page-examples",
      title: t("sections.examples"),
      items: [
        {
          id: "basic-page",
          icon: <LockRounded fontSize="small" />,
          title: t("pages.basic.title"),
          description: t("pages.basic.description"),
          control: (
            <Button
              aria-label={t("pages.basic.open")}
              component={Link}
              endIcon={<ArrowForwardRounded />}
              to={APP_PAGES.devToolsBasicPage}
            >
              {t("actions.openExample")}
            </Button>
          ),
        },
        {
          id: "basic-form-page",
          icon: <FactCheckOutlined fontSize="small" />,
          title: t("pages.form.title"),
          description: t("pages.form.description"),
          control: (
            <Button
              aria-label={t("pages.form.open")}
              component={Link}
              endIcon={<ArrowForwardRounded />}
              to={APP_PAGES.devToolsBasicFormPage}
            >
              {t("actions.openExample")}
            </Button>
          ),
        },
        {
          id: "entity-query-filters",
          icon: <FilterAltOutlined fontSize="small" />,
          title: t("pages.filters.title"),
          description: t("pages.filters.description"),
          control: (
            <Button
              aria-label={t("pages.filters.open")}
              component={Link}
              endIcon={<ArrowForwardRounded />}
              to={APP_PAGES.devToolsEntityQueryFilters}
            >
              {t("actions.openExample")}
            </Button>
          ),
        },
        {
          id: "related-record-creation",
          icon: <PersonAddAltOutlined fontSize="small" />,
          title: t("pages.related.title"),
          description: t("pages.related.description"),
          control: (
            <Button
              aria-label={t("pages.related.open")}
              component={Link}
              endIcon={<ArrowForwardRounded />}
              to={APP_PAGES.devToolsRelatedRecordCreation}
            >
              {t("actions.openExample")}
            </Button>
          ),
        },
        {
          id: "multi-step-form-page",
          icon: <ViewWeekOutlined fontSize="small" />,
          title: t("pages.multiStep.title"),
          description: t("pages.multiStep.description"),
          control: (
            <Button
              aria-label={t("pages.multiStep.open")}
              component={Link}
              endIcon={<ArrowForwardRounded />}
              to={APP_PAGES.devToolsMultiStepFormPage}
            >
              {t("actions.openExample")}
            </Button>
          ),
        },
        {
          id: "advanced-field-form",
          icon: <FactCheckOutlined fontSize="small" />,
          title: t("pages.advancedFieldForm.title"),
          description: t("pages.advancedFieldForm.description"),
          control: (
            <Button
              aria-label={t("pages.advancedFieldForm.open")}
              component={Link}
              endIcon={<ArrowForwardRounded />}
              to={APP_PAGES.devToolsAdvancedFieldForm}
            >
              {t("actions.openExample")}
            </Button>
          ),
        },
        {
          id: "url-synchronized-state",
          icon: <TravelExploreRounded fontSize="small" />,
          title: t("pages.urlState.title"),
          description: t("pages.urlState.description"),
          control: (
            <Button
              aria-label={t("pages.urlState.open")}
              component={Link}
              endIcon={<ArrowForwardRounded />}
              to={APP_PAGES.devToolsUrlSynchronizedState}
            >
              {t("actions.openExample")}
            </Button>
          ),
        },
        {
          id: "async-data-states",
          icon: <DescriptionOutlined fontSize="small" />,
          title: t("pages.asyncStates.title"),
          description: t("pages.asyncStates.description"),
          control: (
            <Button
              aria-label={t("pages.asyncStates.open")}
              component={Link}
              endIcon={<ArrowForwardRounded />}
              to={APP_PAGES.devToolsAsyncDataStates}
            >
              {t("actions.openExample")}
            </Button>
          ),
        },
        {
          id: "offline-crud",
          icon: <FactCheckOutlined fontSize="small" />,
          title: t("pages.offlineCrud.title"),
          description: t("pages.offlineCrud.description"),
          control: (
            <Button
              aria-label={t("pages.offlineCrud.open")}
              component={Link}
              endIcon={<ArrowForwardRounded />}
              to={APP_PAGES.devToolsOfflineCrud}
            >
              {t("actions.openExample")}
            </Button>
          ),
        },
        {
          id: "realtime-updates",
          icon: <TravelExploreRounded fontSize="small" />,
          title: t("pages.realtime.title"),
          description: t("pages.realtime.description"),
          control: (
            <Button
              aria-label={t("pages.realtime.open")}
              component={Link}
              endIcon={<ArrowForwardRounded />}
              to={APP_PAGES.devToolsRealtimeUpdates}
            >
              {t("actions.openExample")}
            </Button>
          ),
        },
        {
          id: "drag-drop-board",
          icon: <ViewWeekOutlined fontSize="small" />,
          title: t("pages.dragDrop.title"),
          description: t("pages.dragDrop.description"),
          control: (
            <Button
              aria-label={t("pages.dragDrop.open")}
              component={Link}
              endIcon={<ArrowForwardRounded />}
              to={APP_PAGES.devToolsDragDropBoard}
            >
              {t("actions.openExample")}
            </Button>
          ),
        },
        {
          id: "infinite-canvas",
          icon: <ViewWeekOutlined fontSize="small" />,
          title: t("pages.canvas.title"),
          description: t("pages.canvas.description"),
          control: (
            <Button
              aria-label={t("pages.canvas.open")}
              component={Link}
              endIcon={<ArrowForwardRounded />}
              to={APP_PAGES.devToolsInfiniteCanvas}
            >
              {t("actions.openExample")}
            </Button>
          ),
        },
        {
          id: "regional-formatting",
          icon: <DescriptionOutlined fontSize="small" />,
          title: t("pages.regional.title"),
          description: t("pages.regional.description"),
          control: (
            <Button
              aria-label={t("pages.regional.open")}
              component={Link}
              endIcon={<ArrowForwardRounded />}
              to={APP_PAGES.devToolsRegionalFormatting}
            >
              {t("actions.openExample")}
            </Button>
          ),
        },
        {
          id: "browser-capabilities",
          icon: <TravelExploreRounded fontSize="small" />,
          title: t("pages.browser.title"),
          description: t("pages.browser.description"),
          control: (
            <Button
              aria-label={t("pages.browser.open")}
              component={Link}
              endIcon={<ArrowForwardRounded />}
              to={APP_PAGES.devToolsBrowserCapabilities}
            >
              {t("actions.openExample")}
            </Button>
          ),
        },
        {
          id: "initialization-readiness",
          icon: <LockRounded fontSize="small" />,
          title: t("pages.initialization.title"),
          description: t("pages.initialization.description"),
          control: (
            <Button
              aria-label={t("pages.initialization.open")}
              component={Link}
              endIcon={<ArrowForwardRounded />}
              to={APP_PAGES.devToolsInitializationReadiness}
            >
              {t("actions.openExample")}
            </Button>
          ),
        },
      ],
    },
    {
      id: "error-pages",
      title: t("sections.errors"),
      items: [
        {
          id: "forbidden",
          icon: <TravelExploreRounded fontSize="small" />,
          title: t("pages.forbidden.title"),
          description: t("pages.forbidden.description"),
          control: (
            <Button
              aria-label={t("pages.forbidden.open")}
              component={Link}
              endIcon={<ArrowForwardRounded />}
              to={APP_PAGES.forbidden}
            >
              {t("actions.openPage")}
            </Button>
          ),
        },
        {
          id: "not-found",
          icon: <DescriptionOutlined fontSize="small" />,
          title: t("pages.notFound.title"),
          description: t("pages.notFound.description"),
          control: (
            <Button
              aria-label={t("pages.notFound.open")}
              component={Link}
              endIcon={<ArrowForwardRounded />}
              to={APP_PAGES.notFound}
            >
              {t("actions.openPage")}
            </Button>
          ),
        },
      ],
    },
  ];
}

export function AppPageDevTools() {
  const { t } = useTranslation(DEV_TOOLS_TRANSLATION_NAMESPACE);
  const sections = getSections(t);
  return (
    <AppPageLayout
      paddingOnCompact={false}
      header={<AppPageHeader title={t("header.title")} description={t("header.description")} />}
    >
      <VireoPreferencePanel
        defaultExpandedSectionIds={["page-examples", "error-pages"]}
        emptyState={t("empty")}
        sections={sections}
        sx={{ bgcolor: "surface.base" }}
        slotProps={{
          section: { sx: { bgcolor: "surface.base" } },
          sectionHeader: { sx: { bgcolor: "surface.raised" } },
          item: { sx: { bgcolor: "surface.sunken" } },
        }}
      />
    </AppPageLayout>
  );
}
