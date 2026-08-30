import React from "react";
import { Alert, Autocomplete, Button, MenuItem, Select, Stack, TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import type { QueryEngineRelationOption } from "@vireocodedev/query";
import { VireoLabelBox, VireoLoadingRegion } from "@vireocodedev/ui";
import { queryEngineApi } from "@/app/data/query/api/queryEngine.api";
import type { AppQueryEntityKey } from "@/app/data/query/models/AppQueryEntityKey";
import { VireoContainerGrid } from "@/app/ui/toolkit/components/layout/VireoContainerGrid";
import type { QueryFilterCandidate, QueryFilterRuleDraft } from "../models/EntityQueryFilters";
import { useEntityQueryFiltersTranslation } from "../localization/use-entity-query-filters-translation";

type QueryFilterValueEditorProps = {
  entityKey: AppQueryEntityKey;
  candidate: QueryFilterCandidate;
  rule: QueryFilterRuleDraft;
  onChange: (value: QueryFilterRuleDraft["value"]) => void;
};

export function QueryFilterValueEditor({ entityKey, candidate, rule, onChange }: QueryFilterValueEditorProps) {
  const { t } = useEntityQueryFiltersTranslation();
  if (rule.value.kind === "none") return null;
  if (rule.value.kind === "relation") {
    return (
      <RelationValueEditor
        entityKey={entityKey}
        candidate={candidate}
        value={rule.value.options}
        onChange={options => onChange({ kind: "relation", options })}
        searchPlaceholder={t("form.searchOptions")}
        valueLabel={t("form.value")}
      />
    );
  }
  if (rule.value.kind === "boolean") {
    return (
      <VireoLabelBox label={t("form.value")}>
        <Select
          fullWidth
          displayEmpty
          value={rule.value.value == null ? "" : String(rule.value.value)}
          onChange={event =>
            onChange({ kind: "boolean", value: event.target.value === "" ? null : event.target.value === "true" })
          }
        >
          <MenuItem value="">{t("form.any")}</MenuItem>
          <MenuItem value="true">{t("form.yes")}</MenuItem>
          <MenuItem value="false">{t("form.no")}</MenuItem>
        </Select>
      </VireoLabelBox>
    );
  }
  if (rule.value.kind === "multiple") {
    return (
      <VireoLabelBox label={t("form.values")}>
        <Select
          fullWidth
          multiple
          value={rule.value.values}
          onChange={event => onChange({ kind: "multiple", values: event.target.value as string[] })}
        >
          {candidate.enumValues.map(value => (
            <MenuItem key={value} value={value}>
              {candidate.enumLabels[value] ?? readableEnum(value)}
            </MenuItem>
          ))}
        </Select>
      </VireoLabelBox>
    );
  }
  if (rule.value.kind === "dateRange") {
    const dateRange = rule.value;
    return (
      <VireoContainerGrid container spacing={1}>
        <VireoContainerGrid size={{ xs: 12, sm: 6 }}>
          <VireoLabelBox label={t("form.from")}>
            <TextField
              fullWidth
              type="date"
              value={dateRange.from}
              onChange={event => onChange({ ...dateRange, from: event.target.value })}
            />
          </VireoLabelBox>
        </VireoContainerGrid>
        <VireoContainerGrid size={{ xs: 12, sm: 6 }}>
          <VireoLabelBox label={t("form.to")}>
            <TextField
              fullWidth
              type="date"
              value={dateRange.to}
              onChange={event => onChange({ ...dateRange, to: event.target.value })}
            />
          </VireoLabelBox>
        </VireoContainerGrid>
      </VireoContainerGrid>
    );
  }

  if (candidate.type === "ENUM") {
    return (
      <VireoLabelBox label={t("form.value")}>
        <Select
          fullWidth
          displayEmpty
          value={rule.value.value}
          onChange={event => onChange({ kind: "scalar", value: event.target.value })}
        >
          <MenuItem disabled value="">
            {t("form.chooseValue")}
          </MenuItem>
          {candidate.enumValues.map(value => (
            <MenuItem key={value} value={value}>
              {candidate.enumLabels[value] ?? readableEnum(value)}
            </MenuItem>
          ))}
        </Select>
      </VireoLabelBox>
    );
  }

  return (
    <VireoLabelBox label={t("form.value")}>
      <TextField
        fullWidth
        type={candidate.type === "NUMBER" ? "number" : candidate.type === "DATE" ? "date" : "text"}
        value={rule.value.value}
        onChange={event => onChange({ kind: "scalar", value: event.target.value })}
      />
    </VireoLabelBox>
  );
}

type RelationValueEditorProps = {
  entityKey: AppQueryEntityKey;
  candidate: QueryFilterCandidate;
  value: QueryEngineRelationOption[];
  onChange: (value: QueryEngineRelationOption[]) => void;
  searchPlaceholder: string;
  valueLabel: string;
};

function RelationValueEditor({
  entityKey,
  candidate,
  value,
  onChange,
  searchPlaceholder,
  valueLabel,
}: RelationValueEditorProps) {
  const { t } = useEntityQueryFiltersTranslation();
  const [inputValue, setInputValue] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  React.useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(inputValue.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [inputValue]);

  const options = useQuery({
    queryKey: ["queryengineRelationOptions", entityKey, candidate.path, debouncedSearch],
    queryFn: ({ signal }) => queryEngineApi.listRelationOptions(entityKey, candidate.path, debouncedSearch, { signal }),
  });

  return (
    <VireoLoadingRegion loading={options.isFetching} loadingLabel={t("form.loadingOptions")}>
      <Stack
        spacing={1}
        data-relation-options-state={options.isError ? (options.data ? "stale-error" : "error") : "ready"}
      >
        <VireoLabelBox label={valueLabel}>
          <Autocomplete
            multiple={candidate.multiple}
            options={options.data ?? []}
            value={candidate.multiple ? value : (value[0] ?? null)}
            inputValue={inputValue}
            loading={options.isFetching}
            loadingText={t("form.loadingOptions")}
            noOptionsText={options.isError ? t("form.optionsLoadError") : t("form.noOptions")}
            getOptionKey={option => option.value}
            getOptionLabel={option => option.label}
            isOptionEqualToValue={(option, selected) => option.value === selected.value}
            onInputChange={(_, next) => setInputValue(next)}
            onChange={(_, next) => onChange(Array.isArray(next) ? next : next ? [next] : [])}
            renderInput={params => <TextField {...params} placeholder={searchPlaceholder} />}
          />
        </VireoLabelBox>
        {options.isError ? (
          <Alert
            severity={options.data ? "warning" : "error"}
            action={<Button onClick={() => void options.refetch()}>{t("form.retryOptions")}</Button>}
          >
            {options.data ? t("form.optionsRefreshError") : t("form.optionsLoadError")}
          </Alert>
        ) : null}
      </Stack>
    </VireoLoadingRegion>
  );
}

function readableEnum(value: string): string {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^./, character => character.toUpperCase());
}
