import React from "react";
import { Alert, Box, Button, CircularProgress, Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
  VireoOverlayHeader,
  VireoResponsiveOverlayFrame,
  useUnsavedChangesRegistration,
  useUnsavedChangesRequestDiscard,
} from "@vireocodedev/starter-ui";
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
      <Box sx={{ bgcolor: "surface.sunken", flex: 1, minHeight: 0, overflowY: "auto", p: 2 }}>
        {definition.isPending ? (
          <Box sx={{ minHeight: 240, display: "grid", placeItems: "center" }}>
            <CircularProgress aria-label={t("overlay.loading")} />
          </Box>
        ) : definition.isError ? (
          <Alert
            severity="error"
            action={<Button onClick={() => void definition.refetch()}>{t("overlay.retry")}</Button>}
          >
            {t("overlay.loadError")}
          </Alert>
        ) : (
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
        )}
      </Box>
      <Stack
        direction="row"
        spacing={1}
        sx={{ bgcolor: "surface.raised", borderTop: 1, borderColor: "divider", justifyContent: "flex-end", p: 2 }}
      >
        <Button disabled={rules.length === 0 && value == null} onClick={clear}>
          {t("overlay.clear")}
        </Button>
        <Button onClick={requestClose}>{t("overlay.cancel")}</Button>
        <Button disabled={definition.isPending || definition.isError} variant="contained" onClick={apply}>
          {t("overlay.apply")}
        </Button>
      </Stack>
    </VireoResponsiveOverlayFrame>
  );
}
