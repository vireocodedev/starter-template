import { useAppPreferences } from "@/app/ui/preferences/hooks/useAppPreferences";
import { useItemHistory } from "../../hooks/useItemHistory";
import type { Item } from "../../models/Item";
import { createItemHistoryDefinition } from "../../models/ItemHistory";
import { HistoryOutlined } from "@mui/icons-material";
import { Alert, Box, Button, Fade, LinearProgress, Stack, Typography, useMediaQuery } from "@mui/material";
import {
  VireoHistoryEntry,
  VireoLoadingRegion,
  VireoOverlayHeader,
  VireoResponsiveOverlayFrame,
  type VireoHistoryEntryLabels,
} from "@vireocodedev/ui";
import { useItemTranslation } from "../../localization/use-item-translation";
import React from "react";
import { APP_THEME_TOKENS } from "@/app/ui/theme/config/theme.tokens";

export type ItemHistoryOverlayProps = {
  item: Item;
  open: boolean;
  onClose: () => void;
  onExited?: () => void;
};

function formatHistoryMeta(
  timestamp: string | number,
  dateTimeFormatter: Intl.DateTimeFormat,
  systemActor: string,
  actorLabel?: string,
) {
  const date = new Date(timestamp);
  const formattedTimestamp = Number.isNaN(date.getTime()) ? String(timestamp) : dateTimeFormatter.format(date);
  return `${formattedTimestamp} · ${actorLabel ?? systemActor}`;
}

export function ItemHistoryOverlay({ item, open, onClose, onExited }: ItemHistoryOverlayProps) {
  const { t, i18n } = useItemTranslation();
  const { preferences } = useAppPreferences();
  const history = useItemHistory(item.id, open);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const records = history.data ?? [];
  const locale = i18n.resolvedLanguage;
  const dateTimeFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }),
    [locale],
  );
  const definition = React.useMemo(() => createItemHistoryDefinition(t, locale), [locale, t]);
  const historyLabels = React.useMemo<Partial<VireoHistoryEntryLabels>>(
    () => ({
      added: t("history.labels.added"),
      changes: count => (count === 1 ? t("history.labels.change", { count }) : t("history.labels.changes", { count })),
      collapseSection: t("history.labels.collapseSection"),
      current: t("history.labels.current"),
      expandSection: t("history.labels.expandSection"),
      field: t("history.labels.field"),
      hideUnchanged: t("history.labels.hideUnchanged"),
      moved: t("history.labels.moved"),
      notPresent: t("history.labels.notPresent"),
      previous: t("history.labels.previous"),
      removed: t("history.labels.removed"),
      showLess: t("history.labels.showLess"),
      showMore: t("history.labels.showMore"),
      showUnchanged: t("history.labels.showUnchanged"),
      unchanged: t("history.labels.unchanged"),
      updated: t("history.labels.updated"),
      value: t("history.labels.value"),
    }),
    [t],
  );
  const initialLoading = history.isPending && records.length === 0;
  const refreshing = history.isFetching && records.length > 0;
  const retry = React.useCallback(() => void history.refetch(), [history]);

  return (
    <VireoResponsiveOverlayFrame
      open={open}
      onClose={onClose}
      onExited={onExited}
      desktopSurface={preferences.desktopSurface}
      allowSidePanelResize={preferences.allowSidePanelResize}
      desktopNavWidth={preferences.navigationMode === "compact" ? 80 : preferences.navigationWidth}
      desktopSidePanelWidth={720}
      maxWidth="lg"
      mobileHeight="92dvh"
      mobileSurface="bottomDrawer"
    >
      <VireoOverlayHeader
        title={t("history.title", { name: item.name })}
        closeLabel={t("history.close")}
        onClose={onClose}
      />
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", bgcolor: "surface.sunken", p: 2 }}>
        <VireoLoadingRegion loading={initialLoading || refreshing} loadingLabel={t("history.loading")}>
          {({ loadingVisible }) => (
            <Box
              data-item-history-state={initialLoading ? "loading" : refreshing ? "refreshing" : "settled"}
              sx={{ minHeight: 0, position: "relative" }}
            >
              {refreshing && loadingVisible ? (
                <LinearProgress
                  aria-hidden
                  sx={{ height: 2, insetInline: 0, position: "absolute", top: 0, zIndex: 1 }}
                />
              ) : null}
              {initialLoading ? (
                <Stack spacing={2} sx={{ minHeight: 240 }}>
                  <Typography color="text.secondary" variant="body2">
                    {t("history.description")}
                  </Typography>
                  <VireoHistoryEntry
                    definition={definition}
                    labels={historyLabels}
                    loading
                    loadingVisible={loadingVisible}
                  />
                </Stack>
              ) : history.isError && records.length === 0 ? (
                <Alert
                  severity="error"
                  action={<Button onClick={retry}>{t("history.retry")}</Button>}
                  sx={{ minHeight: 96 }}
                >
                  {t("history.loadError")}
                </Alert>
              ) : records.length === 0 ? (
                <Stack
                  role="status"
                  spacing={1}
                  sx={{ minHeight: 240, alignItems: "center", justifyContent: "center" }}
                >
                  <HistoryOutlined color="disabled" fontSize="large" />
                  <Typography color="text.secondary" sx={{ textAlign: "center" }}>
                    {t("history.empty")}
                  </Typography>
                </Stack>
              ) : (
                <Fade appear in timeout={reducedMotion ? 0 : APP_THEME_TOKENS.motion.duration.enter}>
                  <Stack spacing={2}>
                    {history.isError ? (
                      <Alert severity="warning" action={<Button onClick={retry}>{t("history.retry")}</Button>}>
                        {t("history.staleError")}
                      </Alert>
                    ) : null}
                    <Typography color="text.secondary" variant="body2">
                      {t("history.description")}
                    </Typography>
                    {records.map(record => (
                      <VireoHistoryEntry
                        key={record.id}
                        aria-label={t("history.entryAria", { name: item.name })}
                        current={record.snapshotCurrent}
                        definition={definition}
                        labels={historyLabels}
                        previous={record.snapshotPrevious}
                        rootMeta={formatHistoryMeta(
                          record.timestamp,
                          dateTimeFormatter,
                          t("history.systemActor"),
                          record.actor?.label,
                        )}
                      />
                    ))}
                  </Stack>
                </Fade>
              )}
            </Box>
          )}
        </VireoLoadingRegion>
      </Box>
    </VireoResponsiveOverlayFrame>
  );
}
