import { APP_PAGES } from "@/app/app.pages";
import { DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE } from "@/app/app.localization";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { FormControlLabel, Paper, Stack, Switch, Typography } from "@mui/material";
import { VireoTabs, useVireoSearchParamState, vireoSearchParamCodecs } from "@vireocodedev/starter-ui";
import { useTranslation } from "react-i18next";

export function AppPageUrlSynchronizedState() {
  const { t } = useTranslation(DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE);
  const [tab, setTab] = useVireoSearchParamState("example-tab", { defaultValue: "summary", history: "push" });
  const [compact, setCompact] = useVireoSearchParamState("example-compact", {
    defaultValue: false,
    codec: vireoSearchParamCodecs.boolean,
  });
  const tabs = [
    { value: "summary", label: "Summary", content: <Typography>Shared account summary.</Typography> },
    { value: "activity", label: "Activity", content: <Typography>Recent application activity.</Typography> },
    { value: "access", label: "Access", content: <Typography>Roles and permission assignments.</Typography> },
  ];
  return (
    <AppPageLayout
      header={
        <AppPageHeader
          backTo={APP_PAGES.devTools}
          backLabel={t("common.back")}
          title={t("urlState.header.title")}
          description={t("urlState.header.description")}
        />
      }
    >
      <Paper variant="outlined" sx={{ maxWidth: 860, p: compact ? 1.5 : 3 }}>
        <Stack spacing={2}>
          <FormControlLabel
            control={<Switch checked={compact} onChange={event => setCompact(event.target.checked)} />}
            label="Compact presentation"
          />
          <VireoTabs tabs={tabs} value={tab} onChange={setTab} />
          <Typography variant="caption" color="text.secondary">
            Try browser Back/Forward after changing tabs, then refresh the page.
          </Typography>
        </Stack>
      </Paper>
    </AppPageLayout>
  );
}
