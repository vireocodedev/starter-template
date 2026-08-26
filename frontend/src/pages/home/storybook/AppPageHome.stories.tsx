import React from "react";
import { CheckCircleOutlined, Inventory2Outlined, OfflineBoltOutlined } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  APP_LOCALIZATION_RESOURCES,
  APP_TRANSLATION_NAMESPACE,
  APP_TRANSLATION_NAMESPACES,
} from "@/app/app.localization";
import { APP_LOCALES, type AppLocale } from "@/app/ui/localization/app-locales";
import { AppPreferencesContext } from "@/app/ui/preferences/contexts/AppPreferencesContext";
import { DEFAULT_APP_PREFERENCES, type AppPreferences } from "@/app/ui/preferences/models/AppPreferences";
import { AppPageHome } from "../AppPageHome";
import { AppPageHomeView } from "../AppPageHomeView";

const meta = {
  title: "PAGES/Overview",
  component: AppPageHome,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Overview is a static route with a synchronously shared Level A loading composition. Refreshing, Empty, and Error stories are intentionally omitted because the page owns no asynchronous data state.",
      },
    },
  },
} satisfies Meta<typeof AppPageHome>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loaded: Story = {};

export const Loading: Story = {
  render: () => <AppPageHomeView loading />,
};

const storyI18n = Object.fromEntries(
  APP_LOCALES.map(locale => {
    const instance = createInstance();
    void instance.use(initReactI18next).init({
      defaultNS: APP_TRANSLATION_NAMESPACE,
      fallbackLng: "en",
      initAsync: false,
      interpolation: { escapeValue: false },
      lng: locale,
      ns: APP_TRANSLATION_NAMESPACES,
      react: { useSuspense: false },
      resources: APP_LOCALIZATION_RESOURCES,
      supportedLngs: APP_LOCALES,
    });
    return [locale, instance];
  }),
) as Record<AppLocale, ReturnType<typeof createInstance>>;

type OverviewScenarioProps = {
  loading: boolean;
  locale: AppLocale;
  pageWidth: AppPreferences["pageWidth"];
};

const overviewIcons = [<Inventory2Outlined />, <CheckCircleOutlined />, <OfflineBoltOutlined />] as const;

function OverviewScenario({ loading, locale, pageWidth }: OverviewScenarioProps) {
  const preferences = React.useMemo(
    () => ({
      preferences: { ...DEFAULT_APP_PREFERENCES, locale, pageWidth },
      resetPreferences: () => undefined,
      updatePreference: () => undefined,
    }),
    [locale, pageWidth],
  );

  return (
    <I18nextProvider i18n={storyI18n[locale]}>
      <AppPreferencesContext.Provider value={preferences}>
        <AppPageHomeView icons={overviewIcons} loading={loading} />
      </AppPreferencesContext.Provider>
    </I18nextProvider>
  );
}

export const CroatianLoaded: Story = {
  render: () => <OverviewScenario loading={false} locale="hr" pageWidth="xl" />,
};

export const CroatianLoading: Story = {
  render: () => <OverviewScenario loading locale="hr" pageWidth="xl" />,
};

const alignmentSelectors = [
  "header",
  "header h1",
  "[data-app-overview-frame]",
  "[data-app-overview-frame] h2",
  '[data-app-overview-card="entity"]',
  '[data-app-overview-card="contracts"]',
  '[data-app-overview-card="pwa"]',
] as const;

function measureAlignmentAnchors(canvasElement: HTMLElement) {
  return alignmentSelectors.map(selector => {
    const element = canvasElement.querySelector(selector);
    if (!(element instanceof HTMLElement)) throw new Error(`Missing Overview alignment anchor: ${selector}`);
    const { height, width, x, y } = element.getBoundingClientRect();
    return { height, selector, width, x, y };
  });
}

function AlignmentContractFixture() {
  const [loading, setLoading] = React.useState(false);

  return (
    <>
      <Button
        data-testid="toggle-overview-loading"
        onClick={() => setLoading(current => !current)}
        sx={{ position: "fixed", right: 8, top: 8, zIndex: theme => theme.zIndex.tooltip + 1 }}
      >
        Toggle loading
      </Button>
      <AppPageHomeView
        icons={[<Inventory2Outlined />, <CheckCircleOutlined />, <OfflineBoltOutlined />]}
        loading={loading}
      />
    </>
  );
}

export const AlignmentContract: Story = {
  render: () => <AlignmentContractFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const loaded = measureAlignmentAnchors(canvasElement);

    await userEvent.click(canvas.getByTestId("toggle-overview-loading"));
    await waitFor(() =>
      expect(canvasElement.querySelector('[data-app-overview-loading-phase="visible"]')).not.toBeNull(),
    );

    const loading = measureAlignmentAnchors(canvasElement);
    loading.forEach((measurement, index) => {
      const expected = loaded[index];
      expect(measurement.selector).toBe(expected.selector);
      expect(measurement.x).toBeCloseTo(expected.x, 1);
      expect(measurement.y).toBeCloseTo(expected.y, 1);
      expect(measurement.width).toBeCloseTo(expected.width, 1);
      expect(measurement.height).toBeCloseTo(expected.height, 1);
    });
  },
};

const alignmentScenarios = APP_LOCALES.flatMap(locale =>
  (["md", "lg", "xl", "full"] as const).map(pageWidth => ({ locale, pageWidth })),
);
const overviewHeadingByLocale: Record<AppLocale, string> = { en: "Overview", hr: "Pregled" };

function AlignmentMatrixFixture() {
  const [loading, setLoading] = React.useState(false);
  const [scenarioIndex, setScenarioIndex] = React.useState(0);
  const scenario = alignmentScenarios[scenarioIndex];

  return (
    <>
      <Button
        data-testid="toggle-overview-matrix-loading"
        onClick={() => setLoading(current => !current)}
        sx={{ position: "fixed", right: 8, top: 8, zIndex: theme => theme.zIndex.tooltip + 1 }}
      >
        Toggle loading
      </Button>
      <Button
        data-testid="next-overview-matrix-scenario"
        onClick={() => setScenarioIndex(current => (current + 1) % alignmentScenarios.length)}
        sx={{ position: "fixed", right: 8, top: 48, zIndex: theme => theme.zIndex.tooltip + 1 }}
      >
        Next scenario
      </Button>
      <Box data-overview-alignment-scenario={`${scenario.locale}-${scenario.pageWidth}`} sx={{ display: "contents" }}>
        <OverviewScenario loading={loading} locale={scenario.locale} pageWidth={scenario.pageWidth} />
      </Box>
    </>
  );
}

export const AlignmentMatrix: Story = {
  render: () => <AlignmentMatrixFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const scenario of alignmentScenarios) {
      const scenarioName = `${scenario.locale}-${scenario.pageWidth}`;
      await waitFor(() =>
        expect(canvasElement.querySelector(`[data-overview-alignment-scenario="${scenarioName}"]`)).not.toBeNull(),
      );
      expect(canvas.getByRole("heading", { level: 1, name: overviewHeadingByLocale[scenario.locale] })).toBeVisible();
      if (scenario.pageWidth === "full") {
        expect(canvasElement.querySelector('[class*="MuiContainer-maxWidth"]')).toBeNull();
      } else {
        const widthClass = `MuiContainer-maxWidth${scenario.pageWidth[0].toUpperCase()}${scenario.pageWidth.slice(1)}`;
        expect(canvasElement.querySelector(`.${widthClass}`)).not.toBeNull();
      }
      const loaded = measureAlignmentAnchors(canvasElement);

      await userEvent.click(canvas.getByTestId("toggle-overview-matrix-loading"));
      await waitFor(() =>
        expect(canvasElement.querySelector('[data-app-overview-loading-phase="visible"]')).not.toBeNull(),
      );

      const loading = measureAlignmentAnchors(canvasElement);
      loading.forEach((measurement, index) => {
        const expected = loaded[index];
        expect(measurement.selector).toBe(expected.selector);
        expect(measurement.x).toBeCloseTo(expected.x, 1);
        expect(measurement.y).toBeCloseTo(expected.y, 1);
        expect(measurement.width).toBeCloseTo(expected.width, 1);
        expect(measurement.height).toBeCloseTo(expected.height, 1);
      });

      await userEvent.click(canvas.getByTestId("toggle-overview-matrix-loading"));
      await waitFor(() => expect(canvasElement.querySelector('[data-app-overview-state="loaded"]')).not.toBeNull());

      if (scenario !== alignmentScenarios.at(-1)) {
        await userEvent.click(canvas.getByTestId("next-overview-matrix-scenario"));
      }
    }
  },
};
