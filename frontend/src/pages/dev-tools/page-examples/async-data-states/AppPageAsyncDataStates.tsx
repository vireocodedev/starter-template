import { APP_PAGES } from "@/app/app.pages";
import { DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE } from "@/app/app.localization";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { Alert, Button, ButtonGroup, Card, CardContent, Stack, Typography } from "@mui/material";
import { useSuspenseQuery } from "@tanstack/react-query";
import { VireoQueryBoundary } from "@vireocodedev/starter-ui/tanstack-query";
import React from "react";
import { useTranslation } from "react-i18next";

type State = "SUCCESS" | "EMPTY" | "ERROR";

function AsyncContent({ state, revision }: { state: State; revision: number }) {
  const { data } = useSuspenseQuery({
    queryKey: ["dev-tools", "async-state", state, revision],
    retry: false,
    queryFn: async () => {
      await new Promise(resolve => window.setTimeout(resolve, 700));
      if (state === "ERROR") throw new Error("The demonstration endpoint rejected the request.");
      return state === "EMPTY" ? [] : [{ id: 1, name: "Northstar Analytics", health: "Healthy" }];
    },
  });
  if (data.length === 0) return <Alert severity="info">No customers match the current request.</Alert>;
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6">{data[0]?.name}</Typography>
        <Typography color="success.main">{data[0]?.health}</Typography>
      </CardContent>
    </Card>
  );
}

export function AppPageAsyncDataStates() {
  const { t } = useTranslation(DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE);
  const [state, setState] = React.useState<State>("SUCCESS");
  const [revision, setRevision] = React.useState(0);
  return (
    <AppPageLayout
      header={
        <AppPageHeader
          backTo={APP_PAGES.devTools}
          backLabel={t("common.back")}
          title={t("asyncStates.header.title")}
          description={t("asyncStates.header.description")}
        />
      }
    >
      <Stack spacing={2} sx={{ maxWidth: 720 }}>
        <ButtonGroup aria-label="Async result state">
          {(["SUCCESS", "EMPTY", "ERROR"] as const).map(value => (
            <Button
              key={value}
              variant={state === value ? "contained" : "outlined"}
              onClick={() => {
                setState(value);
                setRevision(current => current + 1);
              }}
            >
              {value.toLowerCase()}
            </Button>
          ))}
        </ButtonGroup>
        <VireoQueryBoundary
          resetKeys={[state, revision]}
          onRetry={() => setRevision(current => current + 1)}
          errorTitle="Request failed"
          selectErrorDetails={error => ({ message: error instanceof Error ? error.message : String(error), state })}
        >
          <AsyncContent state={state} revision={revision} />
        </VireoQueryBoundary>
      </Stack>
    </AppPageLayout>
  );
}
