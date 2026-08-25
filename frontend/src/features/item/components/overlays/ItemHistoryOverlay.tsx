import { useAppPreferences } from "@/app/ui/preferences/hooks/useAppPreferences";
import { useItemHistory } from "../../hooks/useItemHistory";
import type { Item } from "../../models/Item";
import { createItemHistoryDefinition } from "../../models/ItemHistory";
import { HistoryOutlined } from "@mui/icons-material";
import { Alert, Box, Fade, Skeleton, Stack, Typography, useMediaQuery } from "@mui/material";
import {
  VireoDelayedRender,
  VireoHistoryEntry,
  VireoOverlayHeader,
  VireoResponsiveOverlayFrame,
} from "@vireocodedev/starter-ui";
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
        {history.isPending ? (
          <Box aria-label={t("history.loading")} role="status" sx={{ minHeight: 240 }}>
            <VireoDelayedRender delay={APP_THEME_TOKENS.motion.duration.exit}>
              <Stack aria-hidden spacing={2}>
                <Skeleton height={20} variant="rounded" width="55%" />
                <Skeleton height={112} variant="rounded" />
                <Skeleton height={112} variant="rounded" />
              </Stack>
            </VireoDelayedRender>
          </Box>
        ) : history.isError && records.length === 0 ? (
          <Alert severity="error">{t("history.loadError")}</Alert>
        ) : records.length === 0 ? (
          <Stack role="status" spacing={1} sx={{ minHeight: 240, alignItems: "center", justifyContent: "center" }}>
            <HistoryOutlined color="disabled" fontSize="large" />
            <Typography color="text.secondary" sx={{ textAlign: "center" }}>
              {t("history.empty")}
            </Typography>
          </Stack>
        ) : (
          <Fade appear in timeout={reducedMotion ? 0 : APP_THEME_TOKENS.motion.duration.enter}>
            <Stack spacing={2}>
              {history.isError && <Alert severity="warning">{t("history.staleError")}</Alert>}
              <Typography color="text.secondary" variant="body2">
                {t("history.description")}
              </Typography>
              {records.map(record => (
                <VireoHistoryEntry
                  key={record.id}
                  aria-label={t("history.entryAria", { name: item.name })}
                  definition={definition}
                  previous={record.snapshotPrevious}
                  current={record.snapshotCurrent}
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
    </VireoResponsiveOverlayFrame>
  );
}
