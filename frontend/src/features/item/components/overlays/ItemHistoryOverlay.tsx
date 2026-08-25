import { useAppPreferences } from "@/app/ui/preferences/hooks/useAppPreferences";
import { useItemHistory } from "../../hooks/useItemHistory";
import type { Item } from "../../models/Item";
import { createItemHistoryDefinition } from "../../models/ItemHistory";
import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import { VireoHistoryEntry, VireoOverlayHeader, VireoResponsiveOverlayFrame } from "@vireocodedev/starter-ui";
import { useItemTranslation } from "../../localization/use-item-translation";
import React from "react";

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
    >
      <VireoOverlayHeader
        title={t("history.title", { name: item.name })}
        closeLabel={t("history.close")}
        onClose={onClose}
      />
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", bgcolor: "surface.sunken", p: 2 }}>
        {history.isPending ? (
          <Box sx={{ minHeight: 240, display: "grid", placeItems: "center" }}>
            <CircularProgress aria-label={t("history.loading")} />
          </Box>
        ) : history.isError ? (
          <Alert severity="error">{t("history.loadError")}</Alert>
        ) : history.data.length === 0 ? (
          <Alert severity="info">{t("history.empty")}</Alert>
        ) : (
          <Stack spacing={2}>
            <Typography color="text.secondary" variant="body2">
              {t("history.description")}
            </Typography>
            {history.data.map(record => (
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
        )}
      </Box>
    </VireoResponsiveOverlayFrame>
  );
}
