import { APP_PAGES } from "@/app/app.pages";
import { DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE } from "@/app/app.localization";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { DragIndicatorRounded } from "@mui/icons-material";
import { Chip, Paper, Stack, Typography } from "@mui/material";
import { VireoDndProvider, VireoDraggableItem, VireoDropZone } from "@vireocodedev/ui/hello-pangea-dnd";
import React from "react";
import { useTranslation } from "react-i18next";

type Lane = "BACKLOG" | "IN_PROGRESS" | "DONE";
type Task = { id: string; title: string };
const initialBoard: Record<Lane, Task[]> = {
  BACKLOG: [
    { id: "audit", title: "Audit component usage" },
    { id: "copy", title: "Review localized copy" },
  ],
  IN_PROGRESS: [{ id: "filters", title: "Polish mobile filters" }],
  DONE: [{ id: "shell", title: "Configure application shell" }],
};

export function AppPageDragDropBoard() {
  const { t } = useTranslation(DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE);
  const [board, setBoard] = React.useState(initialBoard);
  return (
    <AppPageLayout
      header={
        <AppPageHeader
          backTo={APP_PAGES.devTools}
          backLabel={t("common.back")}
          title={t("dragDrop.header.title")}
          description={t("dragDrop.header.description")}
        />
      }
    >
      <VireoDndProvider
        onDragEnd={result => {
          if (result.reason !== "drop" || !result.destination) return;
          const sourceLane = result.source.id.laneId as Lane;
          const destinationLane = result.destination.id.laneId as Lane;
          setBoard(current => {
            const next = {
              ...current,
              [sourceLane]: [...current[sourceLane]],
              [destinationLane]:
                sourceLane === destinationLane ? [...current[sourceLane]] : [...current[destinationLane]],
            };
            const [task] = next[sourceLane].splice(result.source.index, 1);
            if (task) next[destinationLane].splice(result.destination!.index, 0, task);
            return next;
          });
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          {(Object.keys(board) as Lane[]).map(lane => (
            <Paper key={lane} variant="outlined" sx={{ flex: 1, minWidth: 0, p: 2 }}>
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6">{lane.replaceAll("_", " ").toLowerCase()}</Typography>
                <Chip size="small" label={board[lane].length} />
              </Stack>
              <VireoDropZone
                id={{ type: "lane", laneId: lane }}
                mode="transfer"
                group="work-board"
                sx={{ minHeight: 180 }}
              >
                <Stack spacing={1}>
                  {board[lane].map((task, index) => (
                    <VireoDraggableItem key={task.id} id={{ type: "task", taskId: task.id }} index={index}>
                      <Paper sx={{ alignItems: "center", display: "flex", gap: 1, p: 1.5 }} variant="outlined">
                        <DragIndicatorRounded color="action" />
                        <Typography>{task.title}</Typography>
                      </Paper>
                    </VireoDraggableItem>
                  ))}
                </Stack>
              </VireoDropZone>
            </Paper>
          ))}
        </Stack>
      </VireoDndProvider>
    </AppPageLayout>
  );
}
