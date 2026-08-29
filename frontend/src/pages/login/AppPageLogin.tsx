import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { Navigate, useNavigate } from "react-router";
import { useLocation } from "react-router";
import { z } from "zod";
import { resolvePostLoginPath } from "@vireocodedev/shell";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { APP_PAGES } from "@/app/app.pages";
import { appConfig } from "@/app/config/app-config";
import { useAppAuth } from "@/app/shell/hooks/useAppAuth";
import { useTranslation } from "react-i18next";
import { AppAuthFailureAlert } from "@/app/shell/components/AppAuthFailureAlert";
import { classifyAppAuthFailure, type AppAuthFailure } from "@/app/data/network/models/AppAuthFailure";
import { LOGIN_TRANSLATION_NAMESPACE } from "@/app/app.localization";
import { resolveDevelopmentCredentials } from "./login-development-credentials";

const DEVELOPMENT_CREDENTIALS = resolveDevelopmentCredentials(appConfig.apiMode, appConfig.showDemoCredentials);

export function AppPageLogin() {
  const { t } = useTranslation(LOGIN_TRANSLATION_NAMESPACE);
  const loginSchema = React.useMemo(
    () =>
      z.object({
        username: z.string().trim().min(1, t("validation.username")),
        password: z.string().min(1, t("validation.password")),
      }),
    [t],
  );
  const { user, login, failure: authFailure } = useAppAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [submitFailure, setSubmitFailure] = React.useState<AppAuthFailure | null>(null);
  const form = useVireoForm({
    defaultValues: DEVELOPMENT_CREDENTIALS ?? { username: "", password: "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: loginSchema },
    onSubmit: async ({ value }) => {
      setSubmitFailure(null);
      try {
        await login(value.username, value.password);
        navigate(resolvePostLoginPath(location.state, APP_PAGES.home), { replace: true });
      } catch (error) {
        setSubmitFailure(classifyAppAuthFailure(error, "login"));
      }
    },
  });

  if (user) return <Navigate replace to={APP_PAGES.home} />;

  return (
    <Box
      component="main"
      sx={{
        alignItems: "center",
        bgcolor: "surface.canvas",
        backgroundImage: theme =>
          `radial-gradient(circle at 50% 28%, color-mix(in srgb, ${theme.palette.primary.main} 14%, transparent), transparent 36%), linear-gradient(color-mix(in srgb, ${theme.palette.divider} 18%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, ${theme.palette.divider} 18%, transparent) 1px, transparent 1px)`,
        backgroundSize: "auto, 28px 28px, 28px 28px",
        display: "flex",
        justifyContent: "center",
        minHeight: "100dvh",
        p: 2.5,
      }}
    >
      <Card
        sx={{
          borderColor: "divider",
          boxShadow: theme =>
            `0 24px 72px color-mix(in srgb, ${theme.palette.common.black} 26%, transparent), inset 0 1px 0 color-mix(in srgb, ${theme.palette.common.white} 10%, transparent)`,
          maxWidth: 420,
          overflow: "hidden",
          position: "relative",
          width: "100%",
          "&::before": {
            bgcolor: "primary.main",
            content: '""',
            height: 4,
            insetInline: 0,
            position: "absolute",
            top: 0,
          },
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 }, "&:last-child": { pb: { xs: 3, sm: 4 } } }}>
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <Box
              aria-hidden
              sx={{
                alignItems: "center",
                bgcolor: "primary.main",
                borderColor: "primary.light",
                borderStyle: "solid",
                borderWidth: 1,
                borderRadius: 1,
                boxShadow: theme =>
                  `0 8px 24px color-mix(in srgb, ${theme.palette.primary.main} 25%, transparent), inset 0 1px 0 color-mix(in srgb, ${theme.palette.common.white} 28%, transparent)`,
                color: "primary.contrastText",
                display: "inline-flex",
                fontSize: "1.125rem",
                fontWeight: 900,
                height: 44,
                justifyContent: "center",
                mb: 2,
                width: 44,
              }}
            >
              V
            </Box>
            <Typography
              color="primary.main"
              sx={{ fontSize: "0.6875rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}
            >
              {t("access")}
            </Typography>
            <Typography component="h1" variant="h4" sx={{ mt: 0.5 }}>
              {t("title")}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              {t("description")}
            </Typography>
          </Box>
          {(submitFailure ?? authFailure) && (
            <AppAuthFailureAlert failure={(submitFailure ?? authFailure)!} sx={{ mb: 2 }} />
          )}
          <form.Form layoutWidth="full">
            <form.Section label={null} variant="outlined" layout="stack">
              <form.Field name="username">
                {field => (
                  <VireoLabelBox label={t("fields.username")} required>
                    <field.TextField
                      label={null}
                      slotProps={{ htmlInput: { "aria-label": t("fields.username"), autoComplete: "username" } }}
                    />
                  </VireoLabelBox>
                )}
              </form.Field>
              <form.Field name="password">
                {field => (
                  <VireoLabelBox label={t("fields.password")} required>
                    <field.TextField
                      label={null}
                      type="password"
                      slotProps={{
                        htmlInput: { "aria-label": t("fields.password"), autoComplete: "current-password" },
                      }}
                    />
                  </VireoLabelBox>
                )}
              </form.Field>
              <form.SubmitButton variant="contained" size="large">
                {t("submit")}
              </form.SubmitButton>
            </form.Section>
          </form.Form>
          {DEVELOPMENT_CREDENTIALS && (
            <Typography color="text.secondary" variant="caption" sx={{ display: "block", mt: 2, textAlign: "center" }}>
              {t("developmentCredentials", DEVELOPMENT_CREDENTIALS)}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
