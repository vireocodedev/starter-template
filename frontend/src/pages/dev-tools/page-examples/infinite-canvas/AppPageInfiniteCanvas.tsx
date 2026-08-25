import { APP_PAGES } from "@/app/app.pages";
import { DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE } from "@/app/app.localization";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { Add, CenterFocusStrong, Fullscreen, FullscreenExit, Remove } from "@mui/icons-material";
import { ButtonGroup, IconButton, Paper, Stack, Typography } from "@mui/material";
import {
  VireoInfiniteCanvas,
  VireoInfiniteCanvasBody,
  VireoInfiniteCanvasOverlay,
  useVireoInfiniteCanvas,
} from "@vireocodedev/starter-ui";
import { useTranslation } from "react-i18next";

function CanvasControls() {
  const canvas = useVireoInfiniteCanvas();
  return (
    <Paper elevation={4}>
      <Stack direction="row" sx={{ alignItems: "center" }}>
        <ButtonGroup>
          <IconButton aria-label="Zoom out" onClick={canvas.zoomOut}>
            <Remove />
          </IconButton>
          <IconButton aria-label="Reset canvas" onClick={canvas.resetTransform}>
            <CenterFocusStrong />
          </IconButton>
          <IconButton aria-label="Zoom in" onClick={canvas.zoomIn}>
            <Add />
          </IconButton>
          <IconButton
            aria-label={canvas.isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            disabled={!canvas.isFullscreenSupported}
            onClick={() => void canvas.toggleFullscreen()}
          >
            {canvas.isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        </ButtonGroup>
        <Typography variant="caption" sx={{ px: 1.5 }}>
          {Math.round(canvas.scale * 100)}%
        </Typography>
      </Stack>
    </Paper>
  );
}

export function AppPageInfiniteCanvas() {
  const { t } = useTranslation(DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE);
  return (
    <AppPageLayout
      paddingOnCompact={false}
      header={
        <AppPageHeader
          backTo={APP_PAGES.devTools}
          backLabel={t("common.back")}
          title={t("canvas.header.title")}
          description={t("canvas.header.description")}
        />
      }
    >
      <VireoInfiniteCanvas
        sx={{ height: { xs: "calc(100dvh - 112px)", md: 620 } }}
        defaultTransform={{ scale: 1, pan: { x: 180, y: 130 } }}
      >
        <VireoInfiniteCanvasBody>
          <Paper sx={{ left: 0, p: 2, position: "absolute", top: 0, width: 240 }}>
            <Typography variant="h6">Discover</Typography>
            <Typography color="text.secondary">Collect requirements and constraints.</Typography>
          </Paper>
          <Paper sx={{ left: 380, p: 2, position: "absolute", top: 100, width: 240 }}>
            <Typography variant="h6">Build</Typography>
            <Typography color="text.secondary">Turn validated decisions into implementation.</Typography>
          </Paper>
          <Paper sx={{ left: 760, p: 2, position: "absolute", top: 260, width: 240 }}>
            <Typography variant="h6">Verify</Typography>
            <Typography color="text.secondary">Exercise the complete consumer workflow.</Typography>
          </Paper>
        </VireoInfiniteCanvasBody>
        <VireoInfiniteCanvasOverlay position="top-right">
          <CanvasControls />
        </VireoInfiniteCanvasOverlay>
      </VireoInfiniteCanvas>
    </AppPageLayout>
  );
}
