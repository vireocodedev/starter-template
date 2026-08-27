import { APP_PAGES } from "@/app/app.pages";
import { DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE } from "@/app/app.localization";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { AddRounded, CloudDoneOutlined, CloudOffOutlined, DeleteOutlined } from "@mui/icons-material";
import {
  Alert,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useVireoOnlineStatus } from "@vireocodedev/ui";
import React from "react";
import { useTranslation } from "react-i18next";

type RecordItem = { id: string; name: string; sync: "SYNCED" | "QUEUED" };
const initialItems: RecordItem[] = [{ id: "seed", name: "Existing server record", sync: "SYNCED" }];

export function AppPageOfflineCrud() {
  const { t } = useTranslation(DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE);
  const browserOnline = useVireoOnlineStatus();
  const [simulateOffline, setSimulateOffline] = React.useState(false);
  const online = browserOnline && !simulateOffline;
  const [name, setName] = React.useState("");
  const [items, setItems] = React.useState<RecordItem[]>(() => {
    const stored = window.localStorage.getItem("vireo-offline-example");
    return stored ? (JSON.parse(stored) as RecordItem[]) : initialItems;
  });
  React.useEffect(() => window.localStorage.setItem("vireo-offline-example", JSON.stringify(items)), [items]);
  const pendingCount = items.filter(item => item.sync === "QUEUED").length;
  const create = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setItems(current => [...current, { id: crypto.randomUUID(), name: trimmed, sync: online ? "SYNCED" : "QUEUED" }]);
    setName("");
  };
  const replay = () => setItems(current => current.map(item => ({ ...item, sync: "SYNCED" })));
  return (
    <AppPageLayout
      header={
        <AppPageHeader
          backTo={APP_PAGES.devTools}
          backLabel={t("common.back")}
          title={t("offlineCrud.header.title")}
          description={t("offlineCrud.header.description")}
        />
      }
    >
      <Stack spacing={2} sx={{ maxWidth: 760 }}>
        <Alert
          severity={online ? "success" : "warning"}
          icon={online ? <CloudDoneOutlined /> : <CloudOffOutlined />}
          action={
            <Button color="inherit" onClick={() => setSimulateOffline(value => !value)}>
              {simulateOffline ? "Use browser status" : "Simulate offline"}
            </Button>
          }
        >
          {online ? "Online — writes synchronize immediately." : "Offline — writes are stored locally and queued."}
        </Alert>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              value={name}
              onChange={event => setName(event.target.value)}
              label="Record name"
              sx={{ flex: 1 }}
            />
            <Button variant="contained" startIcon={<AddRounded />} onClick={create}>
              Create
            </Button>
            <Button disabled={!online || pendingCount === 0} onClick={replay}>
              Replay {pendingCount || ""}
            </Button>
          </Stack>
          <List>
            {items.map(item => (
              <ListItem
                key={item.id}
                divider
                secondaryAction={
                  <IconButton
                    aria-label="Delete record"
                    onClick={() => setItems(current => current.filter(candidate => candidate.id !== item.id))}
                  >
                    <DeleteOutlined />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={item.name}
                  secondary={item.sync === "QUEUED" ? "Optimistic local record" : "Server-aligned record"}
                />
                <Chip
                  size="small"
                  color={item.sync === "QUEUED" ? "warning" : "success"}
                  label={item.sync.toLowerCase()}
                />
              </ListItem>
            ))}
          </List>
          {items.length === 0 && <Typography color="text.secondary">No local records.</Typography>}
        </Paper>
      </Stack>
    </AppPageLayout>
  );
}
