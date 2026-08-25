import { APP_PAGES } from "@/app/app.pages";
import { DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE } from "@/app/app.localization";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { SendRounded } from "@mui/icons-material";
import { Alert, Button, Chip, List, ListItem, ListItemText, Paper, Stack, TextField, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const ActivityEvent = z.object({ id: z.string(), summary: z.string().min(1), emittedAt: z.string() });
type ActivityEvent = z.infer<typeof ActivityEvent>;
const channelName = "vireo-template-realtime-example";

export function AppPageRealtimeUpdates() {
  const { t } = useTranslation(DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE);
  const [summary, setSummary] = React.useState("Customer record synchronized");
  const [events, setEvents] = React.useState<ActivityEvent[]>([]);
  const [invalidCount, setInvalidCount] = React.useState(0);
  const channelRef = React.useRef<BroadcastChannel | null>(null);
  React.useEffect(() => {
    const channel = new BroadcastChannel(channelName);
    channelRef.current = channel;
    channel.onmessage = message => {
      const parsed = ActivityEvent.safeParse(message.data);
      if (parsed.success) setEvents(current => [parsed.data, ...current]);
      else setInvalidCount(current => current + 1);
    };
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);
  const emit = (payload: unknown) => {
    channelRef.current?.postMessage(payload);
    const parsed = ActivityEvent.safeParse(payload);
    if (parsed.success) setEvents(current => [parsed.data, ...current]);
    else setInvalidCount(current => current + 1);
  };
  return (
    <AppPageLayout
      header={
        <AppPageHeader
          backTo={APP_PAGES.devTools}
          backLabel={t("common.back")}
          title={t("realtime.header.title")}
          description={t("realtime.header.description")}
        />
      }
    >
      <Stack spacing={2} sx={{ maxWidth: 760 }}>
        <Alert severity="info">
          Open this page in a second tab to see BroadcastChannel delivery. Every payload is Zod-validated before
          entering state.
        </Alert>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="Activity summary"
              value={summary}
              onChange={event => setSummary(event.target.value)}
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              startIcon={<SendRounded />}
              onClick={() => emit({ id: crypto.randomUUID(), summary, emittedAt: new Date().toISOString() })}
            >
              Broadcast
            </Button>
            <Button color="error" onClick={() => emit({ invalid: true })}>
              Invalid payload
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Chip label={`${events.length} accepted`} color="success" />
            <Chip label={`${invalidCount} rejected`} color={invalidCount ? "error" : "default"} />
          </Stack>
          <List>
            {events.map(event => (
              <ListItem key={event.id} divider>
                <ListItemText primary={event.summary} secondary={new Date(event.emittedAt).toLocaleTimeString()} />
              </ListItem>
            ))}
          </List>
          {events.length === 0 && (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              No validated realtime events yet.
            </Typography>
          )}
        </Paper>
      </Stack>
    </AppPageLayout>
  );
}
