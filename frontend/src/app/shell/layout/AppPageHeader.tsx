import { useAppShellNavigation } from "@/app/shell/hooks/useAppShellNavigation";
import { useAppTranslation } from "@/app/ui/localization/use-app-translation";
import { APP_THEME_TOKENS } from "@/app/ui/theme/config/theme.tokens";
import { ArrowBackRounded, MenuRounded } from "@mui/icons-material";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import { VireoActionPreviewButton, VireoPageHeader } from "@vireocodedev/ui";
import type React from "react";
import { useNavigate } from "react-router";

export type AppPageHeaderPrimaryAction = {
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  preview?: React.ReactNode;
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
  const headerHeight = mobile
    ? APP_THEME_TOKENS.layout.headerHeight.mobile
    : APP_THEME_TOKENS.layout.headerHeight.desktop;
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
    ) : primaryAction.preview ? (
      <VireoActionPreviewButton
        disabled={primaryAction.disabled}
        label={primaryAction.label}
        onClick={primaryAction.onClick}
        preview={primaryAction.preview}
        startIcon={primaryAction.icon}
        variant="contained"
      />
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
      sx={{ boxSizing: "border-box", height: headerHeight, maxHeight: headerHeight, minHeight: headerHeight }}
      title={
        <Box sx={{ alignItems: "stretch", display: "flex", gap: mobile ? 1 : 1.5, minWidth: 0 }}>
          <Box
            aria-hidden
            sx={{
              bgcolor: "primary.main",
              borderRadius: 0.5,
              //boxShadow: theme => `0 0 12px color-mix(in srgb, ${theme.palette.primary.main} 38%, transparent)`,
              flex: "0 0 auto",
              my: 0.25,
              width: 4,
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography component="h1" noWrap variant={mobile ? "h6" : "h5"}>
              {title}
            </Typography>
            {!mobile && (
              <Typography color="text.secondary" variant="body2">
                {description}
              </Typography>
            )}
          </Box>
        </Box>
      }
    />
  );
}
