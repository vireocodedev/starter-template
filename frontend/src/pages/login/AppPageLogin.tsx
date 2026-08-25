import React from "react";
import { Alert, Box, Card, CardContent, Typography } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { Navigate, useNavigate } from "react-router";
import { useLocation } from "react-router";
import { z } from "zod";
import { resolvePostLoginPath } from "@vireocodedev/starter-shell";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { APP_PAGES } from "@/app/app.pages";
import { useAppAuth } from "@/app/shell/hooks/useAppAuth";
import { useTranslation } from "react-i18next";
import { LOGIN_TRANSLATION_NAMESPACE } from "@/app/app.localization";

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
  const { user, login } = useAppAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const form = useVireoForm({
    defaultValues: { username: "admin", password: "admin123" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: loginSchema },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await login(value.username, value.password);
        navigate(resolvePostLoginPath(location.state, APP_PAGES.home), { replace: true });
      } catch {
        setError(t("invalidCredentials"));
      }
    },
  });

  if (user) return <Navigate replace to={APP_PAGES.home} />;

  return (
    <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", minHeight: "100vh", p: 2.5 }}>
      <Card sx={{ maxWidth: 420, width: "100%", borderColor: "divider" }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 }, "&:last-child": { pb: { xs: 3, sm: 4 } } }}>
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <Typography component="h1" variant="h4" sx={{ fontWeight: 800 }}>
              {t("title")}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              {t("description")}
            </Typography>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form.Form layoutWidth="full">
            <form.Section label={null} variant="plain" layout="stack">
              <form.Field name="username">
                {field => (
                  <VireoLabelBox label={t("fields.username")} required>
                    <field.TextField label={null} slotProps={{ htmlInput: { autoComplete: "username" } }} />
                  </VireoLabelBox>
                )}
              </form.Field>
              <form.Field name="password">
                {field => (
                  <VireoLabelBox label={t("fields.password")} required>
                    <field.TextField
                      label={null}
                      type="password"
                      slotProps={{ htmlInput: { autoComplete: "current-password" } }}
                    />
                  </VireoLabelBox>
                )}
              </form.Field>
              <form.SubmitButton variant="contained" size="large">
                {t("submit")}
              </form.SubmitButton>
            </form.Section>
          </form.Form>
          <Typography color="text.secondary" variant="caption" sx={{ display: "block", mt: 2, textAlign: "center" }}>
            {t("developmentCredentials")}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
