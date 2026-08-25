import type { QueryFilterDocument } from "@/app/data/query/models/QueryFilterDocument";
import type { EntityQueryFilterPresentation } from "../models/EntityQueryFilters";
import { formatQueryFilterRowSummary } from "../services/entityQueryFilters";
import { Chip, Stack } from "@mui/material";
import { useEntityQueryFiltersTranslation } from "../localization/use-entity-query-filters-translation";

export type EntityQueryFilterSummaryProps = {
  value: QueryFilterDocument;
  presentation?: EntityQueryFilterPresentation;
  onRemove: (index: number) => void;
  singleLine?: boolean;
};

export function EntityQueryFilterSummary({
  value,
  presentation,
  onRemove,
  singleLine = false,
}: EntityQueryFilterSummaryProps) {
  const { t } = useEntityQueryFiltersTranslation();
  return (
    <Stack
      aria-label={t("summary.ariaLabel")}
      direction="row"
      role="list"
      sx={{
        flexWrap: singleLine ? "nowrap" : "wrap",
        gap: 0.75,
        minWidth: singleLine ? "max-content" : 0,
        width: singleLine ? "max-content" : undefined,
      }}
    >
      {value.rows.map((row, index) => {
        const label = formatQueryFilterRowSummary(row, t, presentation);
        return (
          <Chip
            key={`${row.kind}:${row.path}:${index}`}
            label={label}
            onDelete={() => onRemove(index)}
            role="listitem"
            title={label}
            variant="outlined"
            sx={{
              bgcolor: "action.hover",
              maxWidth: singleLine ? 240 : "100%",
              "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
            }}
          />
        );
      })}
    </Stack>
  );
}
