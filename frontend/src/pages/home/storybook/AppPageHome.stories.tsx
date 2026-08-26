import React from "react";
import { CheckCircleOutlined, Inventory2Outlined, OfflineBoltOutlined } from "@mui/icons-material";
import { Button } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
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
