import { APP_PAGES } from "@/app/app.pages";
import { DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE } from "@/app/app.localization";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { DownloadRounded, FullscreenExitRounded, FullscreenRounded } from "@mui/icons-material";
import { Alert, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useVireoDebouncedCallback, useVireoFullscreen, useVireoOnlineStatus } from "@vireocodedev/starter-ui";
import React from "react";
import { useTranslation } from "react-i18next";

export function AppPageBrowserCapabilities() {
  const { t } = useTranslation(DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE);
  const isOnline = useVireoOnlineStatus();
  const [target, setTarget] = React.useState<HTMLDivElement | null>(null);
  const [draftQuery, setDraftQuery] = React.useState("");
  const [committedQuery, setCommittedQuery] = React.useState("");
  const commitQuery = useVireoDebouncedCallback(setCommittedQuery, { delayMs: 400 });
  const fullscreen = useVireoFullscreen(target);

  const downloadSnapshot = () => {
    const blob = new Blob(
      [JSON.stringify({ committedQuery, isOnline, generatedAt: new Date().toISOString() }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "browser-capabilities.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppPageLayout
      header={
        <AppPageHeader
          backTo={APP_PAGES.devTools}
          backLabel={t("common.back")}
          title={t("browser.header.title")}
          description={t("browser.header.description")}
        />
      }
    >
      <Stack spacing={3}>
        <Alert severity={isOnline ? "success" : "warning"}>
          The browser currently reports that this application is {isOnline ? "online" : "offline"}.
        </Alert>
        <Paper ref={setTarget} sx={{ bgcolor: "surface.raised", p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Fullscreen-owned surface</Typography>
            <Typography color="text.secondary">
              Enter fullscreen for this surface only; the hook tracks browser support and ownership.
            </Typography>
            <Button
              disabled={!fullscreen.isSupported}
              startIcon={fullscreen.isFullscreen ? <FullscreenExitRounded /> : <FullscreenRounded />}
              variant="outlined"
              onClick={() => void fullscreen.toggleFullscreen({ navigationUI: "hide" })}
            >
              {fullscreen.isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            </Button>
          </Stack>
        </Paper>
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Debounced browser work</Typography>
            <TextField
              fullWidth
              label="Search query"
              value={draftQuery}
              onChange={event => {
                setDraftQuery(event.target.value);
                commitQuery.run(event.target.value);
              }}
            />
            <Typography color="text.secondary">Committed after 400 ms: {committedQuery || "Nothing yet"}</Typography>
            <Button startIcon={<DownloadRounded />} variant="contained" onClick={downloadSnapshot}>
              Download JSON snapshot
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </AppPageLayout>
  );
}
