import React from "react";
import {
  AccountCircleRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  CloseRounded,
  DashboardOutlined,
  DeveloperModeOutlined,
  Inventory2Outlined,
  LogoutOutlined,
  SettingsOutlined,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  Popover,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  VireoApplicationNavigation,
  VireoApplicationNavigationItem,
  VireoMobileBottomNavigation,
  type VireoApplicationNavigationMode,
} from "@vireocodedev/starter-ui";
import { Outlet, useLocation, useNavigate } from "react-router";
import { APP_NAVIGATION_PAGES, APP_PAGES, type AppNavigationIcon } from "@/app/app.pages";
import { AppShellNavigationContext } from "@/app/shell/contexts/AppShellNavigationContext";
import { useAppPreferences } from "@/app/ui/preferences/hooks/useAppPreferences";
import { useAppAuth } from "@/app/shell/hooks/useAppAuth";
import { useAppTranslation } from "@/app/ui/localization/use-app-translation";

const navigationIcons: Record<AppNavigationIcon, React.ReactNode> = {
  OVERVIEW: <DashboardOutlined />,
  ITEMS: <Inventory2Outlined />,
  SETTINGS: <SettingsOutlined />,
  DEV_TOOLS: <DeveloperModeOutlined />,
};
export function AppShellLayout() {
  const { t } = useAppTranslation();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [accountAnchor, setAccountAnchor] = React.useState<HTMLElement | null>(null);
  const { user, logout } = useAppAuth();
  const { preferences, updatePreference } = useAppPreferences();
  const location = useLocation();
  const navigate = useNavigate();
  const navigation = React.useMemo(
    () =>
      APP_NAVIGATION_PAGES.map(item => ({
        ...item,
        icon: navigationIcons[item.icon],
        label: t(`navigation.${item.labelKey}`),
      })),
    [t],
  );
  const mobileNavigationItems = React.useMemo(
    () => navigation.map(item => ({ icon: item.icon, label: item.label, value: item.path })),
    [navigation],
  );
  const activeNavigationPath =
    navigation.find(item =>
      item.path === APP_PAGES.home ? location.pathname === item.path : location.pathname.startsWith(item.path),
    )?.path ?? false;

  const commitNavigationWidth = React.useCallback(
    (width: number) => updatePreference("navigationWidth", width),
    [updatePreference],
  );
  const commitNavigationMode = React.useCallback(
    (mode: VireoApplicationNavigationMode) => updatePreference("navigationMode", mode),
    [updatePreference],
  );

  const navigateTo = React.useCallback(
    (path: string) => {
      void navigate(path);
      setMobileOpen(false);
      setAccountAnchor(null);
    },
    [navigate],
  );

  const closeMobileNavigation = React.useCallback(() => {
    setMobileOpen(false);
    setAccountAnchor(null);
  }, []);

  const shellNavigation = React.useMemo(
    () => ({ mobile: !desktop, openNavigation: () => setMobileOpen(true) }),
    [desktop],
  );

  const signOut = React.useCallback(() => {
    setAccountAnchor(null);
    void logout().then(() => navigate(APP_PAGES.login));
  }, [logout, navigate]);

  return (
    <Box sx={{ display: "flex", height: "100dvh", minHeight: 0, overflow: "hidden" }}>
      <VireoApplicationNavigation
        variant={desktop ? "permanent" : "temporary"}
        open={mobileOpen}
        onClose={closeMobileNavigation}
        mode={preferences.navigationMode}
        expandedWidth={preferences.navigationWidth}
        locked={preferences.navigationLocked}
        resizable={desktop && !preferences.navigationLocked}
        onModeChange={commitNavigationMode}
        onExpandedWidthChange={commitNavigationWidth}
      >
        {({ mode, toggleMode }) => {
          const compact = mode === "compact";
          const showBrandMark = !desktop || !compact || preferences.navigationLocked;

          return (
            <>
              <Box
                sx={{
                  alignItems: "center",
                  display: "flex",
                  flexDirection: "row",
                  gap: 1.5,
                  justifyContent: compact ? "center" : "flex-start",
                  minHeight: compact ? 72 : 89,
                  px: compact ? 1 : 2.25,
                  py: compact ? 1 : 2.5,
                }}
              >
                {showBrandMark && (
                  <Avatar
                    variant="rounded"
                    sx={{ bgcolor: "primary.main", color: "primary.contrastText", flex: "0 0 auto", fontWeight: 800 }}
                  >
                    V
                  </Avatar>
                )}
                {!compact && (
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography noWrap sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                      {t("brand.name")}
                    </Typography>
                    <Typography color="text.secondary" variant="caption">
                      {t("brand.tagline")}
                    </Typography>
                  </Box>
                )}
                {desktop && !preferences.navigationLocked && (
                  <Tooltip title={compact ? t("navigation.EXPAND") : t("navigation.COMPACT")}>
                    <IconButton
                      aria-label={compact ? t("navigation.EXPAND") : t("navigation.COMPACT")}
                      onClick={toggleMode}
                      size="small"
                    >
                      {compact ? <ChevronRightRounded /> : <ChevronLeftRounded />}
                    </IconButton>
                  </Tooltip>
                )}
                {!desktop && (
                  <Tooltip title={t("navigation.CLOSE")}>
                    <IconButton
                      aria-label={t("navigation.CLOSE")}
                      onClick={closeMobileNavigation}
                      size="small"
                      sx={{ ml: "auto" }}
                    >
                      <CloseRounded />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              <Divider />
              <List sx={{ flex: 1, px: compact ? 0.75 : 1.25, py: 2 }}>
                {navigation.map(item => (
                  <VireoApplicationNavigationItem
                    key={item.path}
                    icon={item.icon}
                    label={item.label}
                    selected={
                      item.path === APP_PAGES.home
                        ? location.pathname === item.path
                        : location.pathname.startsWith(item.path)
                    }
                    onClick={() => navigateTo(item.path)}
                    sx={{
                      mb: 0.5,
                      "&.Mui-selected": { bgcolor: "primary.main", color: "primary.contrastText" },
                      "&.Mui-selected:hover": { bgcolor: "primary.dark" },
                    }}
                  />
                ))}
              </List>
              <Divider />
              {compact ? (
                <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", p: 1 }}>
                  <Tooltip placement="right" title={t("account.OPEN_MENU")}>
                    <IconButton
                      aria-label={t("account.OPEN_MENU")}
                      onClick={event => setAccountAnchor(event.currentTarget)}
                      size="large"
                    >
                      <AccountCircleRounded fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                  <Popover
                    anchorEl={accountAnchor}
                    anchorOrigin={{ horizontal: "right", vertical: "center" }}
                    onClose={() => setAccountAnchor(null)}
                    open={Boolean(accountAnchor)}
                    transformOrigin={{ horizontal: "left", vertical: "center" }}
                    slotProps={{ paper: { role: "menu", sx: { ml: 1, minWidth: 240, p: 1 } } }}
                  >
                    <Box sx={{ alignItems: "center", display: "flex", gap: 1.25, p: 1 }}>
                      <Avatar sx={{ height: 36, width: 36 }}>{user?.username.slice(0, 1).toUpperCase()}</Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography noWrap variant="body2" sx={{ fontWeight: 700 }}>
                          {user?.username}
                        </Typography>
                        <Typography color="text.secondary" variant="caption">
                          {user?.role}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider />
                    <Button
                      color="inherit"
                      fullWidth
                      onClick={signOut}
                      role="menuitem"
                      startIcon={<LogoutOutlined />}
                      sx={{ justifyContent: "flex-start", mt: 0.5 }}
                    >
                      {t("account.SIGN_OUT")}
                    </Button>
                  </Popover>
                </Box>
              ) : (
                <Box sx={{ alignItems: "center", display: "flex", gap: 1.25, p: 2 }}>
                  <Avatar sx={{ height: 36, width: 36 }}>{user?.username.slice(0, 1).toUpperCase()}</Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography noWrap variant="body2" sx={{ fontWeight: 700 }}>
                      {user?.username}
                    </Typography>
                    <Typography color="text.secondary" variant="caption">
                      {user?.role}
                    </Typography>
                  </Box>
                  <Tooltip title={t("account.SIGN_OUT")}>
                    <IconButton aria-label={t("account.SIGN_OUT")} onClick={signOut} size="small">
                      <LogoutOutlined />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </>
          );
        }}
      </VireoApplicationNavigation>

      <AppShellNavigationContext.Provider value={shellNavigation}>
        <Box
          sx={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            height: "100dvh",
            maxWidth: "100%",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <Box
            component="main"
            sx={{ display: "flex", flex: 1, maxWidth: "100%", minHeight: 0, minWidth: 0, overflow: "hidden" }}
          >
            <Outlet />
          </Box>
          {!desktop && (
            <VireoMobileBottomNavigation
              aria-label={t("navigation.QUICK")}
              items={mobileNavigationItems}
              value={activeNavigationPath}
              onChange={navigateTo}
              sx={{
                position: "relative",
                zIndex: theme.zIndex.appBar,
              }}
            />
          )}
        </Box>
      </AppShellNavigationContext.Provider>
    </Box>
  );
}
