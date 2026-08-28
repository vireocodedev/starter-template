import React from "react";
import { Alert, Box, Button, CircularProgress, LinearProgress, Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
  VireoOverlayHeader,
  VireoLoadingRegion,
  VireoResponsiveOverlayFrame,
  useUnsavedChangesRegistration,
  useUnsavedChangesRequestDiscard,
} from "@vireocodedev/ui";
import { QueryEngineQuery } from "@/app/data/query/api/queryEngine.api";
import type { AppQueryEntityKey } from "@/app/data/query/models/AppQueryEntityKey";
import type { QueryFilterDocument } from "@/app/data/query/models/QueryFilterDocument";
import type { EntityQueryFilterPresentation, QueryFilterRuleDraft } from "../models/EntityQueryFilters";
import {
  areQueryFilterDraftsEqual,
  createQueryFilterCandidates,
  queryFilterDocumentToDraft,
  validateQueryFilterDraft,
} from "../services/entityQueryFilters";
import { useAppPreferences } from "@/app/ui/preferences/hooks/useAppPreferences";
import { EntityQueryFiltersForm } from "./EntityQueryFiltersForm";
import { useEntityQueryFiltersTranslation } from "../localization/use-entity-query-filters-translation";

export type EntityQueryFiltersOverlayProps = {
  entityKey: AppQueryEntityKey;
  title: string;
  open: boolean;
  value: QueryFilterDocument | null;
  presentation?: EntityQueryFilterPresentation;
  onApply: (value: QueryFilterDocument | null) => void;
  onClear: () => void;
  onClose: () => void;
  onExited?: () => void;
};

export function EntityQueryFiltersOverlay({
  entityKey,
  title,
  open,
  value,
  presentation,
  onApply,
  onClear,
  onClose,
  onExited,
}: EntityQueryFiltersOverlayProps) {
  const { t } = useEntityQueryFiltersTranslation();
  const { preferences } = useAppPreferences();
  const definition = useQuery({ ...QueryEngineQuery.describeEntity(entityKey), enabled: open });
  const candidates = React.useMemo(
    () =>
      definition.data ? createQueryFilterCandidates({ entityKey, definition: definition.data, presentation }) : [],
    [definition.data, entityKey, presentation],
  );
  const [rules, setRules] = React.useState<QueryFilterRuleDraft[]>([]);
  const [initialRules, setInitialRules] = React.useState<QueryFilterRuleDraft[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const initializedToken = React.useRef("");
  const token = `${open}:${definition.data?.key ?? "pending"}:${JSON.stringify(value)}`;
  const initialLoading = definition.isPending && !definition.data;
  const refreshing = definition.isFetching && !!definition.data;

  React.useEffect(() => {
    if (!open || !definition.data || initializedToken.current === token) return;
    const next = queryFilterDocumentToDraft(value, candidates);
    setRules(next);
    setInitialRules(next);
    setErrors({});
    initializedToken.current = token;
  }, [candidates, definition.data, open, token, value]);

  const dirty = !areQueryFilterDraftsEqual(rules, initialRules);
  const scopeId = `query-filters:${entityKey}`;
  useUnsavedChangesRegistration({ dirty, enabled: open, scopeId });
  const requestClose = useUnsavedChangesRequestDiscard(onClose, { scopeId });

  const apply = () => {
    const result = validateQueryFilterDraft(entityKey, rules, candidates, t);
    setErrors(result.errors);
    if (Object.keys(result.errors).length > 0) return;
    onApply(result.document);
    onClose();
  };

  const clear = () => {
    setRules([]);
    setErrors({});
    onClear();
    onClose();
  };

  return (
    <VireoResponsiveOverlayFrame
      open={open}
      onClose={requestClose}
      onExited={onExited}
      desktopSurface={preferences.desktopSurface}
      allowSidePanelResize={preferences.allowSidePanelResize}
      desktopNavWidth={preferences.navigationMode === "compact" ? 80 : preferences.navigationWidth}
      desktopSidePanelWidth={680}
      maxWidth="md"
      mobileMaxHeight="92dvh"
      mobileSurface="bottomDrawer"
    >
      <VireoOverlayHeader title={title} closeLabel={t("overlay.close")} onClose={requestClose} />
      <Box sx={{ bgcolor: "surface.recessed", flex: 1, minHeight: 0, overflowY: "auto", p: 2 }}>
        <VireoLoadingRegion loading={initialLoading || refreshing} loadingLabel={t("overlay.loading")}>
          {({ loadingVisible }) => (
            <Box
              data-filter-definition-state={initialLoading ? "loading" : refreshing ? "refreshing" : "settled"}
              sx={{ minHeight: initialLoading ? 240 : 0, position: "relative" }}
            >
              {refreshing && loadingVisible ? (
                <LinearProgress
                  aria-hidden
                  sx={{ height: 2, insetInline: 0, position: "absolute", top: 0, zIndex: 1 }}
                />
              ) : null}
              {initialLoading ? (
                <Box sx={{ display: "grid", minHeight: 240, placeItems: "center" }}>
                  {loadingVisible ? <CircularProgress aria-hidden /> : null}
                </Box>
              ) : definition.isError && !definition.data ? (
                <Alert
                  severity="error"
                  action={<Button onClick={() => void definition.refetch()}>{t("overlay.retry")}</Button>}
                >
                  {t("overlay.loadError")}
                </Alert>
              ) : (
                <Stack spacing={2}>
                  {definition.isError ? (
                    <Alert
                      severity="warning"
                      action={<Button onClick={() => void definition.refetch()}>{t("overlay.retry")}</Button>}
                    >
                      {t("overlay.staleError")}
                    </Alert>
                  ) : null}
                  <EntityQueryFiltersForm
                    entityKey={entityKey}
                    candidates={candidates}
                    rules={rules}
                    errors={errors}
                    onChange={next => {
                      setRules(next);
                      setErrors({});
                    }}
                  />
                </Stack>
              )}
            </Box>
          )}
        </VireoLoadingRegion>
      </Box>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          bgcolor: "surface.chrome",
          borderTopColor: "divider",
          borderTopStyle: "solid",
          borderTopWidth: 1,
          justifyContent: "flex-end",
          p: 2,
        }}
      >
        <Button disabled={rules.length === 0 && value == null} onClick={clear}>
          {t("overlay.clear")}
        </Button>
        <Button onClick={requestClose}>{t("overlay.cancel")}</Button>
        <Button disabled={!definition.data} variant="contained" onClick={apply}>
          {t("overlay.apply")}
        </Button>
      </Stack>
    </VireoResponsiveOverlayFrame>
  );
}
