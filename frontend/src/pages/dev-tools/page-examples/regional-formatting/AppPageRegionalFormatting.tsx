import { APP_PAGES } from "@/app/app.pages";
import { DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE } from "@/app/app.localization";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { useAppPreferences } from "@/app/ui/preferences/hooks/useAppPreferences";
import { CheckRounded } from "@mui/icons-material";
import { Alert, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { formatIntlNumber } from "@vireocodedev/localization";
import { VireoCountryFlag } from "@vireocodedev/ui";
import { useTranslation } from "react-i18next";

const SAMPLE_DATE = new Date("2026-08-25T12:30:00Z");

export function AppPageRegionalFormatting() {
  const { t } = useTranslation(DEV_TOOLS_EXAMPLES_TRANSLATION_NAMESPACE);
  const { preferences, updatePreference } = useAppPreferences();
  const locale = preferences.locale;
  const currency = formatIntlNumber(12500.75, {
    locale,
    options: { currency: "EUR", style: "currency" },
  });
  const percentage = formatIntlNumber(0.428, {
    locale,
    options: { maximumFractionDigits: 1, style: "percent" },
  });
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "full", timeZone: "Europe/Zagreb" }).format(SAMPLE_DATE);

  return (
    <AppPageLayout
      header={
        <AppPageHeader
          backTo={APP_PAGES.devTools}
          backLabel={t("common.back")}
          title={t("regional.header.title")}
          description={t("regional.header.description")}
        />
      }
    >
      <Stack spacing={3}>
        <Alert severity="info">
          The locale changes presentation only. Canonical model values remain locale-neutral and API-safe.
        </Alert>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          {(["en", "hr"] as const).map(option => (
            <Button
              key={option}
              startIcon={locale === option ? <CheckRounded /> : undefined}
              variant={locale === option ? "contained" : "outlined"}
              onClick={() => updatePreference("locale", option)}
            >
              {option === "en" ? "English" : "Hrvatski"}
            </Button>
          ))}
        </Stack>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Paper sx={{ flex: 1, p: 2.5 }}>
            <Typography color="text.secondary" variant="overline">
              Currency
            </Typography>
            <Typography variant="h5">{currency}</Typography>
            <Typography color="text.secondary">Canonical: 12500.75 EUR</Typography>
          </Paper>
          <Paper sx={{ flex: 1, p: 2.5 }}>
            <Typography color="text.secondary" variant="overline">
              Percentage
            </Typography>
            <Typography variant="h5">{percentage}</Typography>
            <Typography color="text.secondary">Canonical: 0.428</Typography>
          </Paper>
          <Paper sx={{ flex: 1, p: 2.5 }}>
            <Typography color="text.secondary" variant="overline">
              Calendar date
            </Typography>
            <Typography variant="h6">{date}</Typography>
            <Typography color="text.secondary">Canonical: 2026-08-25T12:30:00Z</Typography>
          </Paper>
        </Stack>
        <Paper sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <Chip label={`Active locale: ${locale}`} />
            <VireoCountryFlag countryCode="HR" enableTooltip />
            <Typography>Country assets remain independent from the active formatting locale.</Typography>
          </Stack>
        </Paper>
      </Stack>
    </AppPageLayout>
  );
}
