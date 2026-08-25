import { APP_PAGES } from "@/app/app.pages";
import { DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE } from "@/app/app.localization";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { CheckCircleRounded, ReplayRounded } from "@mui/icons-material";
import { Alert, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { VireoInitializationBoundary } from "@vireocodedev/starter-ui";
import React from "react";
import { useTranslation } from "react-i18next";

const INITIALIZATION_STEPS = ["Load account", "Hydrate preferences", "Warm application dependencies"] as const;

export function AppPageInitializationReadiness() {
  const { t } = useTranslation(DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE);
  const [generation, setGeneration] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<string[]>([]);
  const initialize = React.useCallback(async () => {
    void generation;
    setCompletedSteps([]);
    for (const step of INITIALIZATION_STEPS) {
      await new Promise(resolve => setTimeout(resolve, 350));
      setCompletedSteps(current => [...current, step]);
    }
  }, [generation]);

  return (
    <AppPageLayout
      header={
        <AppPageHeader
          backTo={APP_PAGES.devTools}
          backLabel={t("common.back")}
          title={t("initialization.header.title")}
          description={t("initialization.header.description")}
        />
      }
    >
      <Stack spacing={3} sx={{ maxWidth: 760 }}>
        <Button
          startIcon={<ReplayRounded />}
          sx={{ alignSelf: "flex-start" }}
          variant="outlined"
          onClick={() => setGeneration(value => value + 1)}
        >
          Restart initialization
        </Button>
        <Paper sx={{ p: 3 }}>
          <VireoInitializationBoundary
            initialize={initialize}
            fallback={
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <CircularProgress size={22} />
                  <Typography>Preparing application dependencies…</Typography>
                </Stack>
                {INITIALIZATION_STEPS.map(step => (
                  <Stack key={step} direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    {completedSteps.includes(step) ? (
                      <CheckCircleRounded color="success" />
                    ) : (
                      <CircularProgress size={16} />
                    )}
                    <Typography color={completedSteps.includes(step) ? "text.primary" : "text.secondary"}>
                      {step}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            }
          >
            <Alert severity="success">
              Generation {generation + 1} is ready. Protected descendants render only after initialization resolves.
            </Alert>
          </VireoInitializationBoundary>
        </Paper>
      </Stack>
    </AppPageLayout>
  );
}
