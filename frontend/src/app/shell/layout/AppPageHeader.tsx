import { useAppShellNavigation } from "@/app/shell/hooks/useAppShellNavigation";
import { ArrowBackRounded, MenuRounded } from "@mui/icons-material";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import { VireoPageHeader } from "@vireocodedev/starter-ui";
import type React from "react";
import { useNavigate } from "react-router";
import { useAppTranslation } from "@/app/ui/localization/use-app-translation";

export type AppPageHeaderPrimaryAction = {
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
};

export type AppPageHeaderProps = {
  title: React.ReactNode;
  description: React.ReactNode;
  actions?: React.ReactNode;
  backLabel?: string;
  onBack?: () => void;
  backTo?: string;
  mobileActions?: React.ReactNode;
  primaryAction?: AppPageHeaderPrimaryAction;
};

export function AppPageHeader({
  actions,
  backLabel,
  onBack,
  backTo,
  description,
  mobileActions,
  primaryAction,
  title,
}: AppPageHeaderProps) {
  const { t } = useAppTranslation();
  const { mobile, openNavigation } = useAppShellNavigation();
  const navigate = useNavigate();
  const resolvedBackLabel = backLabel ?? t("actions.BACK");
  const leading = (
    <>
      {mobile && (
        <Tooltip title={t("navigation.OPEN")}>
          <IconButton aria-label={t("navigation.OPEN")} onClick={openNavigation}>
            <MenuRounded />
          </IconButton>
        </Tooltip>
      )}
      {(backTo || onBack) && (
        <Tooltip title={resolvedBackLabel}>
          <IconButton
            aria-label={resolvedBackLabel}
            onClick={() => {
              if (onBack) {
                onBack();
                return;
              }
              if (backTo) void navigate(backTo);
            }}
          >
            <ArrowBackRounded />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
  const responsivePrimaryAction = primaryAction ? (
    mobile ? (
      <Tooltip title={primaryAction.label}>
        <Box component="span" sx={{ display: "inline-flex" }}>
          <IconButton
            aria-label={primaryAction.label}
            disabled={primaryAction.disabled}
            onClick={primaryAction.onClick}
            color="primary"
          >
            {primaryAction.icon}
          </IconButton>
        </Box>
      </Tooltip>
    ) : (
      <Button
        disabled={primaryAction.disabled}
        onClick={primaryAction.onClick}
        size="medium"
        startIcon={primaryAction.icon}
        variant="contained"
      >
        {primaryAction.label}
      </Button>
    )
  ) : null;
  const supplementalActions = mobile ? mobileActions : actions;
  const responsiveActions =
    supplementalActions || responsivePrimaryAction ? (
      <>
        {supplementalActions}
        {responsivePrimaryAction}
      </>
    ) : undefined;

  return (
    <VireoPageHeader
      actions={responsiveActions}
      leading={mobile || backTo || onBack ? leading : undefined}
      slotProps={{ title: { component: "div" } }}
      sx={{ bgcolor: "background.paper", gap: mobile ? 0.5 : 2, px: mobile ? 1 : 3 }}
      title={
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h1" noWrap variant={mobile ? "h6" : "h5"} sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
          {!mobile && (
            <Typography color="text.secondary" variant="body2">
              {description}
            </Typography>
          )}
        </Box>
      }
    />
  );
}
