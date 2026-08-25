import type { Meta, StoryObj } from "@storybook/react-vite";
import { AddRounded } from "@mui/icons-material";
import { AppPageHeader } from "./AppPageHeader";

const meta = {
  title: "APPLICATION/Page header",
  component: AppPageHeader,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof AppPageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Items",
    description: "A complete responsive CRUD workflow backed by one Starter entity.",
    primaryAction: { icon: <AddRounded />, label: "Create item", onClick: () => undefined },
  },
};
