import { APP_QUERY_ENTITY } from "@/app/data/query/models/AppQueryEntityKey";
import { countQueryFilterRules, type QueryFilterDocument } from "@/app/data/query/models/QueryFilterDocument";
import {
  EntityQueryFiltersOverlay,
  EntityQueryFilterSummary,
  formatQueryResultCount,
  readEntityListState,
  useDebouncedSearchText,
  writeEntityListState,
  type EntityQueryFilterPresentation,
} from "@/features/entity-query-filters/public";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { useAppPreferences } from "@/app/ui/preferences/hooks/useAppPreferences";
import { useAppAuth } from "@/app/shell/hooks/useAppAuth";
import {
  ItemFormOverlay,
  ItemHistoryOverlay,
  useItemDeleteMutation,
  usePendingItemUpdateId,
  useItemSearchQuery,
  useItemTableColumns,
  type Item,
} from "@/features/item/public";
import { AddRounded, CloseRounded, FilterAltOutlined, SearchRounded } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Collapse,
  IconButton,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  PageOverlay,
  useGuardedOverlayModeSwitch,
  usePageOverlayModes,
  useVireoConfirmation,
  VireoResponsiveTable,
  type OverlayRenderers,
  type VireoResponsiveTableFilters,
  type VireoResponsiveTableLabels,
} from "@vireocodedev/starter-ui";
import React from "react";
import { useTranslation } from "react-i18next";
import { ITEMS_TRANSLATION_NAMESPACE } from "@/app/app.localization";
import { APP_THEME_TOKENS } from "@/app/ui/theme/config/theme.tokens";

type ItemOverlayModes = {
  form: { item?: Item };
  history: { item: Item };
  filters: Record<string, never>;
};

const ITEM_LIST_STATE_KEY = "items";
const ITEM_TABLE_LAYERS = { stickyToolbar: 4, stickyRowHeader: 3 } as const;
const ITEM_TABLE_SX = { flex: 1, height: "100%", minHeight: 0 } as const;
const DEFAULT_TABLE_FILTERS: VireoResponsiveTableFilters = {
  page: 0,
  rowsPerPage: 10,
  sortBy: "name",
  sortDirection: "asc",
};

function getItemRowKey(item: Item) {
  return item.id;
}
type ItemListContentProps = {
  canManage: boolean;
  filters: VireoResponsiveTableFilters;
  onFiltersChange: React.Dispatch<React.SetStateAction<VireoResponsiveTableFilters>>;
  queryFilters: QueryFilterDocument | null;
  search: ReturnType<typeof useDebouncedSearchText>;
  structuredFilterCount: number;
  tableSize: "small" | "medium";
  presentation: EntityQueryFilterPresentation;
  onClearQueryFilters: () => void;
  onClearAllFilters: () => void;
  onRemoveQueryFilter: (index: number) => void;
  onOpenEdit: (item: Item) => void;
  onOpenCreate: () => void;
  onOpenFilters: () => void;
  onOpenHistory: (item: Item) => void;
  onRequestDelete: (item: Item) => Promise<void>;
};

const ItemListContent = React.memo(function ItemListContent({
  canManage,
  filters,
  onFiltersChange,
  queryFilters,
  search,
  structuredFilterCount,
  tableSize,
  presentation,
  onClearQueryFilters,
  onClearAllFilters,
  onRemoveQueryFilter,
  onOpenEdit,
  onOpenCreate,
  onOpenFilters,
  onOpenHistory,
  onRequestDelete,
}: ItemListContentProps) {
  const { t, i18n } = useTranslation(ITEMS_TRANSLATION_NAMESPACE);
  const labels = React.useMemo<VireoResponsiveTableLabels>(
    () => ({
      table: t("table.table"),
      loadingTable: t("table.loadingTable"),
      noData: t("table.noData"),
      showMore: t("table.showMore"),
      showLess: t("table.showLess"),
      rowsPerPage: t("table.rowsPerPage"),
      paginationMoreThan: (from, to) => t("table.paginationMoreThan", { from, to }),
      paginationRange: (from, to, count) => t("table.paginationRange", { from, to, count }),
      paginationItem: type => t("table.paginationItem", { type }),
      filters: t("table.filters"),
      clearFilters: t("table.clearFilters"),
      filtersDone: t("table.filtersDone"),
      sortBy: t("table.sortBy"),
      sortDirection: t("table.sortDirection"),
      ascending: t("table.ascending"),
      descending: t("table.descending"),
      ascendingSortDirection: t("table.ascendingSortDirection"),
      descendingSortDirection: t("table.descendingSortDirection"),
    }),
    [t],
  );
  const result = useItemSearchQuery(filters, { searchText: search.committed, queryFilters });
  const pendingUpdateId = usePendingItemUpdateId();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const totalResults = result.data?.totalElements;
  const hasActiveConstraints = search.committed.length > 0 || queryFilters !== null;
  const columns = useItemTableColumns({
    onHistory: onOpenHistory,
    onEdit: canManage ? onOpenEdit : undefined,
    onDelete: canManage ? onRequestDelete : undefined,
  });
  const getRowSx = React.useCallback(
    (
      item: Item,
      _rowIndex: number,
      layout: "mobile" | "desktop",
    ): Record<
      string,
      { backgroundColor: string; transition: string; "@media (prefers-reduced-motion: reduce)": { transition: string } }
    > => {
      const feedback = {
        backgroundColor: item.id === pendingUpdateId ? "action.selected" : "surface.raised",
        transition: `background-color ${APP_THEME_TOKENS.motion.duration.emphasized}ms ${APP_THEME_TOKENS.motion.easing.standard}`,
        "@media (prefers-reduced-motion: reduce)": { transition: "none" },
      };
      return layout === "desktop" ? { "& > td": feedback } : { "& .MuiAccordionSummary-root": feedback };
    },
    [pendingUpdateId],
  );

  return (
    <Stack spacing={2} sx={{ flex: 1, height: "100%", minHeight: 0, overflow: "hidden" }}>
      <Box sx={{ flex: "0 0 auto", px: { xs: 2, sm: 0 }, pt: { xs: 2, sm: 0 } }}>
        <Stack spacing={1}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { sm: "center" } }}>
            <TextField
              fullWidth
              value={search.input}
              onChange={event => search.setInput(event.target.value)}
              onKeyDown={event => {
                if (event.key === "Enter") search.commitNow();
              }}
              placeholder={t("search.placeholder")}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded />
                    </InputAdornment>
                  ),
                  endAdornment: search.input ? (
                    <InputAdornment position="end">
                      <IconButton aria-label={t("search.clear")} edge="end" onClick={search.clear}>
                        <CloseRounded />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                },
              }}
              sx={{ maxWidth: 520 }}
            />
            <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center" }}>
              <Button size="large" startIcon={<FilterAltOutlined />} variant="outlined" onClick={onOpenFilters}>
                {t("filters.open")}
                {structuredFilterCount > 0 ? ` (${structuredFilterCount})` : ""}
              </Button>
              {structuredFilterCount > 0 && (
                <Button size="large" onClick={onClearQueryFilters}>
                  {t("filters.clearAll")}
                </Button>
              )}
            </Stack>
            {totalResults != null && (
              <Typography
                color="text.secondary"
                variant="body2"
                sx={{ display: { xs: "none", sm: "block" }, ml: { sm: "auto !important" }, whiteSpace: "nowrap" }}
              >
                {t("results", {
                  count: totalResults,
                  formattedCount: totalResults.toLocaleString(i18n.resolvedLanguage),
                })}
              </Typography>
            )}
          </Stack>
          <Box
            sx={{
              display: { xs: "grid", sm: "none" },
              gridTemplateColumns: "minmax(0, 1fr) auto",
              columnGap: 0.5,
              minWidth: 0,
              alignItems: "center",
            }}
          >
            <ButtonGroup size="large" variant="outlined" sx={{ gridColumn: 1, justifySelf: "start" }}>
              <Button startIcon={<FilterAltOutlined />} onClick={onOpenFilters}>
                {t("filters.open")}
                {structuredFilterCount > 0 ? ` (${structuredFilterCount})` : ""}
              </Button>
              {structuredFilterCount > 0 && (
                <Tooltip title={t("filters.clearAllLabel")}>
                  <Button
                    aria-label={t("filters.clearAllLabel")}
                    onClick={onClearQueryFilters}
                    sx={{ minWidth: 44, px: 1 }}
                  >
                    <CloseRounded />
                  </Button>
                </Tooltip>
              )}
            </ButtonGroup>
            {totalResults != null && (
              <Typography
                color="text.secondary"
                variant="body2"
                sx={{ gridColumn: 2, minWidth: 0, textAlign: "right", whiteSpace: "nowrap" }}
              >
                {t("results", {
                  count: totalResults,
                  formattedCount: formatQueryResultCount(totalResults, i18n.resolvedLanguage),
                })}
              </Typography>
            )}
          </Box>
          {queryFilters && (
            <Box
              sx={{
                display: { xs: "block", sm: "none" },
                minWidth: 0,
                overflowX: "auto",
                overscrollBehaviorX: "contain",
                scrollbarWidth: "none",
                touchAction: "pan-x",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              <EntityQueryFilterSummary
                value={queryFilters}
                presentation={presentation}
                onRemove={onRemoveQueryFilter}
                singleLine
              />
            </Box>
          )}
          {queryFilters && (
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <EntityQueryFilterSummary
                value={queryFilters}
                presentation={presentation}
                onRemove={onRemoveQueryFilter}
              />
            </Box>
          )}
        </Stack>
      </Box>
      <Collapse
        in={result.isError}
        timeout={
          reducedMotion
            ? 0
            : { enter: APP_THEME_TOKENS.motion.duration.enter, exit: APP_THEME_TOKENS.motion.duration.exit }
        }
        unmountOnExit
      >
        <Alert
          severity="error"
          action={
            queryFilters ? (
              <Stack direction="row">
                <Button color="inherit" onClick={onOpenFilters}>
                  {t("error.edit")}
                </Button>
                <Button color="inherit" onClick={onClearQueryFilters}>
                  {t("error.clear")}
                </Button>
              </Stack>
            ) : undefined
          }
        >
          {t("error.message")}
        </Alert>
      </Collapse>
      <Box sx={{ display: "flex", flex: 1, minHeight: 0, position: "relative" }}>
        {result.isRefreshing && (
          <LinearProgress
            aria-label={t("table.refreshing")}
            variant={reducedMotion ? "determinate" : "indeterminate"}
            value={reducedMotion ? 100 : undefined}
            sx={{
              position: "absolute",
              top: result.layout === "desktop" ? 24 : 0,
              insetInline: 0,
              height: 2,
              zIndex: 5,
            }}
          />
        )}
        <VireoResponsiveTable
          layout={result.layout}
          columns={columns}
          data={result.data?.content ?? []}
          filters={filters}
          onFiltersChange={onFiltersChange}
          labels={labels}
          layers={ITEM_TABLE_LAYERS}
          getRowKey={getItemRowKey}
          getRowSx={getRowSx}
          totalCount={result.data?.totalElements ?? 0}
          skeleton={result.isLoading}
          titleColumn="name"
          titleEndAdornmentColumn="status"
          actionsColumn="actions"
          hasNextPage={result.hasNextPage}
          isFetchingNextPage={result.isFetchingNextPage}
          onLoadNextPage={result.onLoadNextPage}
          size={tableSize}
          sx={ITEM_TABLE_SX}
          renderEmptyState={() => (
            <Stack spacing={1} sx={{ alignItems: "center", py: 1 }}>
              <Typography color="text.secondary">
                {hasActiveConstraints ? t("empty.filtered") : t(canManage ? "empty.first" : "empty.none")}
              </Typography>
              {hasActiveConstraints ? (
                <Button size="small" onClick={onClearAllFilters}>
                  {t("empty.clear")}
                </Button>
              ) : canManage ? (
                <Button size="small" variant="contained" onClick={onOpenCreate}>
                  {t("empty.create")}
                </Button>
              ) : null}
            </Stack>
          )}
        />
      </Box>
    </Stack>
  );
});

export function AppPageItems() {
  const { t } = useTranslation(ITEMS_TRANSLATION_NAMESPACE);
  const { user } = useAppAuth();
  const { preferences } = useAppPreferences();
  const canManage = user?.role === "SUPERADMIN";
  const confirm = useVireoConfirmation();
  const { mutateAsync: deleteItem } = useItemDeleteMutation();
  const initialState = React.useMemo(() => readEntityListState<VireoResponsiveTableFilters>(ITEM_LIST_STATE_KEY), []);
  const search = useDebouncedSearchText(initialState?.searchText ?? "");
  const [queryFilters, setQueryFilters] = React.useState<QueryFilterDocument | null>(initialState?.filters ?? null);
  const [filters, setFilters] = React.useState<VireoResponsiveTableFilters>(
    initialState?.table ?? DEFAULT_TABLE_FILTERS,
  );
  const presentation = React.useMemo<EntityQueryFilterPresentation>(
    () => ({
      fields: {
        name: { label: t("filterFields.name") },
        description: { label: t("filterFields.description") },
        quantity: { label: t("filterFields.quantity") },
        status: {
          label: t("filterFields.status"),
          enumLabels: {
            DRAFT: t("filterFields.statusValues.DRAFT"),
            ACTIVE: t("filterFields.statusValues.ACTIVE"),
            ARCHIVED: t("filterFields.statusValues.ARCHIVED"),
          },
        },
      },
    }),
    [t],
  );
  const overlayRenderers = React.useMemo<OverlayRenderers<ItemOverlayModes>>(
    () => ({
      form: (overlayProps, payload) => (
        <ItemFormOverlay key={payload.item?.id ?? "new"} {...overlayProps} item={payload.item} />
      ),
      history: (overlayProps, payload) => <ItemHistoryOverlay {...overlayProps} item={payload.item} />,
      filters: overlayProps => (
        <EntityQueryFiltersOverlay
          {...overlayProps}
          entityKey={APP_QUERY_ENTITY.item}
          title={t("filters.title")}
          value={queryFilters}
          presentation={presentation}
          onApply={value => {
            setQueryFilters(value);
            setFilters(current => ({ ...current, page: 0 }));
          }}
          onClear={() => {
            setQueryFilters(null);
            setFilters(current => ({ ...current, page: 0 }));
          }}
        />
      ),
    }),
    [presentation, queryFilters, t],
  );
  const overlays = usePageOverlayModes<ItemOverlayModes>(overlayRenderers);
  const openOverlay = useGuardedOverlayModeSwitch<ItemOverlayModes>(overlays.overlay.open, overlays.open);

  const openCreate = React.useCallback(() => {
    openOverlay("form", {});
  }, [openOverlay]);
  const openEdit = React.useCallback(
    (item: Item) => {
      openOverlay("form", { item });
    },
    [openOverlay],
  );
  const openHistory = React.useCallback((item: Item) => openOverlay("history", { item }), [openOverlay]);
  const openFilters = React.useCallback(() => openOverlay("filters", {}), [openOverlay]);
  const structuredFilterCount = countQueryFilterRules(queryFilters);

  const clearQueryFilters = React.useCallback(() => {
    setQueryFilters(null);
    setFilters(current => ({ ...current, page: 0 }));
  }, []);

  const clearAllFilters = React.useCallback(() => {
    search.clear();
    setQueryFilters(null);
    setFilters(current => ({ ...current, page: 0 }));
  }, [search]);

  const removeQueryFilter = React.useCallback((index: number) => {
    setQueryFilters(current => {
      if (!current) return null;
      const rows = current.rows.filter((_, rowIndex) => rowIndex !== index);
      return rows.length > 0 ? { ...current, rows } : null;
    });
    setFilters(current => ({ ...current, page: 0 }));
  }, []);

  React.useEffect(() => {
    setFilters(current => (current.page === 0 ? current : { ...current, page: 0 }));
  }, [search.committed]);

  React.useEffect(() => {
    writeEntityListState(ITEM_LIST_STATE_KEY, {
      searchText: search.input,
      filters: queryFilters,
      table: filters,
    });
  }, [filters, queryFilters, search.input]);
  const requestDelete = React.useCallback(
    async (item: Item) => {
      const accepted = await confirm({
        title: t("delete.title"),
        message: <>{t("delete.message", { name: item.name })}</>,
        confirmLabel: t("delete.confirm"),
        confirmColor: "error",
      });
      if (!accepted) return;
      await deleteItem(item);
    },
    [confirm, deleteItem, t],
  );

  return (
    <AppPageLayout
      paddingOnCompact={false}
      scrollMode="contained"
      header={
        <AppPageHeader
          title={t("header.title")}
          description={t("header.description")}
          primaryAction={
            canManage ? { icon: <AddRounded />, label: t("header.create"), onClick: openCreate } : undefined
          }
        />
      }
    >
      <ItemListContent
        canManage={canManage}
        filters={filters}
        onFiltersChange={setFilters}
        queryFilters={queryFilters}
        search={search}
        structuredFilterCount={structuredFilterCount}
        tableSize={preferences.tableSize}
        presentation={presentation}
        onClearQueryFilters={clearQueryFilters}
        onClearAllFilters={clearAllFilters}
        onRemoveQueryFilter={removeQueryFilter}
        onOpenEdit={openEdit}
        onOpenCreate={openCreate}
        onOpenFilters={openFilters}
        onOpenHistory={openHistory}
        onRequestDelete={requestDelete}
      />
      <PageOverlay
        overlayKey="item"
        open={overlays.overlay.open}
        onRequestClose={overlays.close}
        render={overlays.overlay.render}
      />
    </AppPageLayout>
  );
}
