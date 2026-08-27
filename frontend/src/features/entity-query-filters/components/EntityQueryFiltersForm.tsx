import { AddRounded, DeleteOutlineRounded } from "@mui/icons-material";
import { Alert, Box, Button, IconButton, MenuItem, Select, Stack, Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import type { AppQueryEntityKey } from "@/app/data/query/models/AppQueryEntityKey";
import type { QueryFilterCandidate, QueryFilterRuleDraft } from "../models/EntityQueryFilters";
import {
  createQueryFilterRule,
  getQueryFilterOperatorLabel,
  updateQueryFilterRuleCandidate,
  updateQueryFilterRuleOperator,
} from "../services/entityQueryFilters";
import { QueryFilterValueEditor } from "./QueryFilterValueEditor";
import { useEntityQueryFiltersTranslation } from "../localization/use-entity-query-filters-translation";

type EntityQueryFiltersFormProps = {
  entityKey: AppQueryEntityKey;
  candidates: QueryFilterCandidate[];
  rules: QueryFilterRuleDraft[];
  errors: Record<string, string>;
  onChange: (rules: QueryFilterRuleDraft[]) => void;
};

export function EntityQueryFiltersForm({
  entityKey,
  candidates,
  rules,
  errors,
  onChange,
}: EntityQueryFiltersFormProps) {
  const { t } = useEntityQueryFiltersTranslation();
  const update = (id: string, updater: (rule: QueryFilterRuleDraft) => QueryFilterRuleDraft) =>
    onChange(rules.map(rule => (rule.id === id ? updater(rule) : rule)));

  if (candidates.length === 0) return <Alert severity="info">{t("form.noFields")}</Alert>;

  return (
    <Stack spacing={2}>
      {rules.length === 0 && <Alert severity="info">{t("form.noRules")}</Alert>}
      {rules.map((rule, index) => {
        const candidate = candidates.find(item => item.id === rule.candidateId);
        return (
          <Box
            key={rule.id}
            sx={{
              bgcolor: "surface.raised",
              border: 1,
              borderColor: errors[rule.id] ? "error.main" : "divider",
              borderRadius: 1,
              p: 2,
            }}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                <Typography sx={{ fontWeight: 700 }}>{t("form.rule", { number: index + 1 })}</Typography>
                <IconButton
                  aria-label={t("form.removeRule", { number: index + 1 })}
                  color="error"
                  onClick={() => onChange(rules.filter(item => item.id !== rule.id))}
                >
                  <DeleteOutlineRounded />
                </IconButton>
              </Stack>
              <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                <VireoLabelBox label={t("form.field")}>
                  <Select
                    fullWidth
                    value={rule.candidateId}
                    onChange={event => {
                      const next = candidates.find(item => item.id === event.target.value);
                      if (next) update(rule.id, current => updateQueryFilterRuleCandidate(current, next));
                    }}
                  >
                    {!candidate && <MenuItem value={rule.candidateId}>{t("form.unavailableField")}</MenuItem>}
                    {candidates.map(item => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </VireoLabelBox>
                {candidate && !candidate.relation && (
                  <VireoLabelBox label={t("form.operator")}>
                    <Select
                      fullWidth
                      value={rule.operator ?? ""}
                      onChange={event =>
                        update(rule.id, current =>
                          updateQueryFilterRuleOperator(current, candidate, event.target.value as never),
                        )
                      }
                    >
                      {candidate.operators.map(operator => (
                        <MenuItem key={operator} value={operator}>
                          {getQueryFilterOperatorLabel(t, operator)}
                        </MenuItem>
                      ))}
                    </Select>
                  </VireoLabelBox>
                )}
              </Box>
              {candidate && (
                <QueryFilterValueEditor
                  entityKey={entityKey}
                  candidate={candidate}
                  rule={rule}
                  onChange={value => update(rule.id, current => ({ ...current, value }))}
                />
              )}
              {errors[rule.id] && <Typography color="error.main">{errors[rule.id]}</Typography>}
            </Stack>
          </Box>
        );
      })}
      <Button
        startIcon={<AddRounded />}
        variant="outlined"
        onClick={() => onChange([...rules, createQueryFilterRule(candidates[0])])}
        sx={{ alignSelf: "flex-start" }}
      >
        {t("form.addFilter")}
      </Button>
    </Stack>
  );
}
