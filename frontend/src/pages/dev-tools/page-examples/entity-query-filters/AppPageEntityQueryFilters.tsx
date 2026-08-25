import React from "react";
import { FilterAltOutlined } from "@mui/icons-material";
import { Badge, Button, Paper, Stack, Typography } from "@mui/material";
import { PageOverlay } from "@vireocodedev/starter-ui";
import { APP_PAGES } from "@/app/app.pages";
import { APP_QUERY_ENTITY } from "@/app/data/query/models/AppQueryEntityKey";
import { countQueryFilterRules, type QueryFilterDocument } from "@/app/data/query/models/QueryFilterDocument";
import { EntityQueryFiltersOverlay } from "@/features/entity-query-filters/public";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { ENTITY_QUERY_FILTERS_EXAMPLE_TRANSLATION_NAMESPACE } from "@/app/app.localization";
import { useTranslation } from "react-i18next";

export function AppPageEntityQueryFilters() {
  const { t } = useTranslation(ENTITY_QUERY_FILTERS_EXAMPLE_TRANSLATION_NAMESPACE);
  const [open, setOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<QueryFilterDocument | null>(null);
  const count = countQueryFilterRules(filters);

  return (
    <AppPageLayout
      header={
        <AppPageHeader
          backLabel={t("header.back")}
          backTo={APP_PAGES.devTools}
          title={t("header.title")}
          description={t("header.description")}
          primaryAction={{ icon: <FilterAltOutlined />, label: t("header.edit"), onClick: () => setOpen(true) }}
        />
      }
    >
      <Stack spacing={2}>
        <Paper variant="outlined" sx={{ bgcolor: "surface.base", p: 3 }}>
          <Stack spacing={1.5} sx={{ alignItems: "flex-start" }}>
            <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
              {t("content.title")}
            </Typography>
            <Typography color="text.secondary">{t("content.description")}</Typography>
            <Badge badgeContent={count} color="primary">
              <Button startIcon={<FilterAltOutlined />} variant="outlined" onClick={() => setOpen(true)}>
                {t("content.filters")}
              </Button>
            </Badge>
            <Paper
              component="pre"
              variant="outlined"
              sx={{ alignSelf: "stretch", bgcolor: "surface.sunken", m: 0, overflowX: "auto", p: 2 }}
            >
              {filters ? JSON.stringify(filters, null, 2) : "null"}
            </Paper>
          </Stack>
        </Paper>
      </Stack>
      <PageOverlay
        overlayKey="dev-query-filters"
        open={open}
        onRequestClose={() => setOpen(false)}
        render={
          <EntityQueryFiltersOverlay
            entityKey={APP_QUERY_ENTITY.item}
            title={t("content.overlayTitle")}
            open={open}
            value={filters}
            onApply={setFilters}
            onClear={() => setFilters(null)}
            onClose={() => setOpen(false)}
          />
        }
      />
    </AppPageLayout>
  );
}
