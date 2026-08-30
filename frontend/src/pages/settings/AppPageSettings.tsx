import { useAppShellNavigation } from "@/app/shell/hooks/useAppShellNavigation";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { useAppPreferences } from "@/app/ui/preferences/hooks/useAppPreferences";
import {
  AspectRatioOutlined,
  DarkModeOutlined,
  LanguageOutlined,
  LockOutlined,
  OpenInFullOutlined,
  RestartAltRounded,
  SearchRounded,
  TableRowsOutlined,
} from "@mui/icons-material";
import { Box, Button, InputAdornment, MenuItem, Select, Switch, TextField } from "@mui/material";
import { VireoPreferencePanel, type VireoPreferenceSectionDefinition } from "@vireocodedev/ui";
import React from "react";
import { useTranslation } from "react-i18next";
import { SETTINGS_TRANSLATION_NAMESPACE } from "@/app/app.localization";

export function AppPageSettings() {
  const { t } = useTranslation(SETTINGS_TRANSLATION_NAMESPACE);
  const { mobile } = useAppShellNavigation();
  const { preferences, updatePreference, resetPreferences } = useAppPreferences();
  const [search, setSearch] = React.useState("");
  const sections: VireoPreferenceSectionDefinition[] = [
    {
      id: "appearance",
      title: t("sections.appearance"),
      items: [
        {
          id: "locale",
          icon: <LanguageOutlined fontSize="small" />,
          title: t("language.title"),
          description: t("language.description"),
          control: (
            <Select
              size="medium"
              fullWidth
              value={preferences.locale}
              onChange={event => updatePreference("locale", event.target.value as "en" | "hr")}
              inputProps={{ "aria-label": t("language.title") }}
            >
              <MenuItem value="en">{t("language.ENGLISH")}</MenuItem>
              <MenuItem value="hr">{t("language.CROATIAN")}</MenuItem>
            </Select>
          ),
        },
        {
          id: "theme",
          icon: <DarkModeOutlined fontSize="small" />,
          title: t("theme.title"),
          description: t("theme.description"),
          control: (
            <Switch
              checked={preferences.darkMode}
              onChange={(_, value) => updatePreference("darkMode", value)}
              slotProps={{ input: { "aria-label": t("theme.title") } }}
            />
          ),
        },
        {
          id: "table-size",
          icon: <TableRowsOutlined fontSize="small" />,
          title: t("tableDensity.title"),
          description: t("tableDensity.description"),
          control: (
            <Select
              size="medium"
              fullWidth
              value={preferences.tableSize}
              onChange={event => updatePreference("tableSize", event.target.value as "small" | "medium")}
              inputProps={{ "aria-label": t("tableDensity.title") }}
            >
              <MenuItem value="small">{t("tableDensity.COMPACT")}</MenuItem>
              <MenuItem value="medium">{t("tableDensity.COMFORTABLE")}</MenuItem>
            </Select>
          ),
        },
      ],
    },
    {
      id: "layout",
      title: t("sections.layout"),
      items: [
        {
          id: "page-width",
          icon: <AspectRatioOutlined fontSize="small" />,
          title: t("pageWidth.title"),
          description: t("pageWidth.description"),
          control: (
            <Select
              size="medium"
              fullWidth
              value={preferences.pageWidth}
              onChange={event => updatePreference("pageWidth", event.target.value as "md" | "lg" | "xl" | "full")}
              inputProps={{ "aria-label": t("pageWidth.title") }}
            >
              <MenuItem value="md">{t("pageWidth.MEDIUM")}</MenuItem>
              <MenuItem value="lg">{t("pageWidth.LARGE")}</MenuItem>
              <MenuItem value="xl">{t("pageWidth.EXTRA_LARGE")}</MenuItem>
              <MenuItem value="full">{t("pageWidth.FULL")}</MenuItem>
            </Select>
          ),
        },
        {
          id: "surface",
          icon: <OpenInFullOutlined fontSize="small" />,
          title: t("desktopSurface.title"),
          description: t("desktopSurface.description"),
          control: (
            <Select
              size="medium"
              fullWidth
              value={preferences.desktopSurface}
              onChange={event =>
                updatePreference(
                  "desktopSurface",
                  event.target.value as "dialog" | "overlaySidePanel" | "dockedSidePanel",
                )
              }
              inputProps={{ "aria-label": t("desktopSurface.title") }}
            >
              <MenuItem value="dialog">{t("desktopSurface.DIALOG")}</MenuItem>
              <MenuItem value="overlaySidePanel">{t("desktopSurface.OVERLAY")}</MenuItem>
              <MenuItem value="dockedSidePanel">{t("desktopSurface.DOCKED")}</MenuItem>
            </Select>
          ),
        },
        {
          id: "resize",
          icon: <OpenInFullOutlined fontSize="small" />,
          title: t("resizablePanels.title"),
          description: t("resizablePanels.description"),
          control: (
            <Switch
              checked={preferences.allowSidePanelResize}
              onChange={(_, value) => updatePreference("allowSidePanelResize", value)}
              slotProps={{ input: { "aria-label": t("resizablePanels.title") } }}
            />
          ),
        },
        {
          id: "navigation",
          icon: <LockOutlined fontSize="small" />,
          title: t("lockNavigation.title"),
          description: t("lockNavigation.description"),
          control: (
            <Switch
              checked={preferences.navigationLocked}
              onChange={(_, value) => updatePreference("navigationLocked", value)}
              slotProps={{ input: { "aria-label": t("lockNavigation.title") } }}
            />
          ),
        },
      ],
    },
    {
      id: "reset",
      title: t("sections.defaults"),
      items: [
        {
          id: "reset-all",
          icon: <RestartAltRounded fontSize="small" />,
          title: t("reset.title"),
          description: t("reset.description"),
          control: (
            <Button size="medium" variant="outlined" startIcon={<RestartAltRounded />} onClick={resetPreferences}>
              {t("reset.action")}
            </Button>
          ),
        },
      ],
    },
  ];

  return (
    <AppPageLayout
      paddingOnCompact={false}
      header={
        <AppPageHeader
          title={t("header.title")}
          description={t("header.description")}
          actions={
            <TextField
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder={t("search.placeholder")}
              size="medium"
              sx={{ width: { xs: "100%", sm: 300 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded fontSize="small" />
                    </InputAdornment>
                  ),
                },
                htmlInput: { "aria-label": t("search.placeholder") },
              }}
            />
          }
        />
      }
    >
      {mobile && (
        <Box
          data-settings-compact-command-section
          sx={{
            borderBottom: "1px solid var(--mui-palette-divider)",
            bgcolor: "appSurface.screen",
            p: 2,
          }}
        >
          <TextField
            fullWidth
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder={t("search.placeholder")}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded fontSize="small" />
                  </InputAdornment>
                ),
              },
              htmlInput: { "aria-label": t("search.placeholder") },
            }}
          />
        </Box>
      )}
      <VireoPreferencePanel
        sections={sections}
        searchQuery={search}
        emptyState={<>{t("search.empty", { search })}</>}
        defaultExpandedSectionIds={["appearance", "layout"]}
        sx={{ mt: 0 }}
      />
    </AppPageLayout>
  );
}
