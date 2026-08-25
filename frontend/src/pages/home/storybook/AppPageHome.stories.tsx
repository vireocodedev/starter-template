import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppPageHome } from "../AppPageHome";

const meta = {
  title: "PAGES/Overview",
  component: AppPageHome,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof AppPageHome>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
