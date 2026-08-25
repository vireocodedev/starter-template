import React from "react";
import type { Preview } from "@storybook/react-vite";
import "@fontsource-variable/inter";
import "../src/main.css";
import { AppStorybookProvider } from "../src/app/storybook/AppStorybookProvider";

const preview: Preview = {
  decorators: [
    Story => (
      <AppStorybookProvider>
        <Story />
      </AppStorybookProvider>
    ),
  ],
  parameters: {
    a11y: { test: "error" },
    backgrounds: { disable: true },
    controls: { disable: true },
    layout: "fullscreen",
    options: {
      storySort: {
        order: ["DOCUMENTATION", "APPLICATION", "FEATURES", "PAGES"],
      },
    },
  },
};

export default preview;
