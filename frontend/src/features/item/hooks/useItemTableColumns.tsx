import type { Item } from "../models/Item";
import { DeleteOutlined, EditOutlined, HistoryOutlined } from "@mui/icons-material";
import { Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import type { VireoResponsiveTableColumn } from "@vireocodedev/ui";
import React from "react";
import { useItemTranslation } from "../localization/use-item-translation";

const statusColor = { DRAFT: "default", ACTIVE: "success", ARCHIVED: "warning" } as const;

export type UseItemTableColumnsOptions = {
  onDelete?: (item: Item) => void | Promise<void>;
  onEdit?: (item: Item) => void;
  onHistory?: (item: Item) => void;
};

export function useItemTableColumns({
  onDelete,
  onEdit,
  onHistory,
}: UseItemTableColumnsOptions): readonly VireoResponsiveTableColumn<Item>[] {
  const { t, i18n } = useItemTranslation();
  return React.useMemo(
    () => [
      {
        id: "name",
        sort: "name",
        minWidthPx: 240,
        renderHeader: (): React.ReactNode => t("table.item"),
        renderBody: (item: Item) => (
          <Stack spacing={0.25}>
            <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
            <Typography color="text.secondary" variant="caption" noWrap>
              {item.description || t("table.noDescription")}
            </Typography>
          </Stack>
        ),
      },
      {
        id: "quantity",
        sort: "quantity",
        minWidthPx: 120,
        align: "right" as const,
        renderHeader: (): React.ReactNode => t("fields.quantity"),
        renderBody: (item: Item) => item.quantity.toLocaleString(i18n.resolvedLanguage),
      },
      {
        id: "status",
        sort: "status",
        minWidthPx: 140,
        renderHeader: (): React.ReactNode => t("fields.status"),
        renderBody: (item: Item) => (
          <Chip color={statusColor[item.status]} label={t(`status.${item.status}`)} size="small" />
        ),
      },
      {
        id: "actions",
        align: "right" as const,
        fixedWidth: true,
        minWidthPx: 152,
        renderHeader: (): React.ReactNode => t("table.actions"),
        renderBody: (item: Item) => (
          <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
            {onHistory && (
              <Tooltip title={t("table.history")}>
                <IconButton aria-label={t("table.historyAria")} size="small" onClick={() => onHistory(item)}>
                  <HistoryOutlined />
                </IconButton>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title={t("table.edit")}>
                <IconButton aria-label={t("table.editAria")} size="small" onClick={() => onEdit(item)}>
                  <EditOutlined />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title={t("table.delete")}>
                <IconButton
                  aria-label={t("table.deleteAria")}
                  color="error"
                  size="small"
                  onClick={() => void onDelete(item)}
                >
                  <DeleteOutlined />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        ),
      },
    ],
    [i18n.resolvedLanguage, onDelete, onEdit, onHistory, t],
  );
}
