import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ItemForm, ItemFormActions } from "../components/forms/ItemForm";
import { useItemForm } from "../hooks/useItemForm";
import type { Item } from "../models/Item";

const submitted = fn();
const item: Item = {
  id: 7,
  name: "Design system audit",
  description: "Review the application against current Vireo contracts.",
  quantity: 4,
  status: "ACTIVE",
};

function ItemFormFixture() {
  const form = useItemForm(item, async value => {
    submitted(value);
  });

  return (
    <form.Form layoutWidth="standard">
      <ItemForm form={form} />
      <ItemFormActions editing form={form} onCancel={() => undefined} />
    </form.Form>
  );
}

const meta = {
  title: "FEATURES/Item/Item form",
  component: ItemFormFixture,
  parameters: { controls: { disable: true }, layout: "padded" },
} satisfies Meta<typeof ItemFormFixture>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ValidUpdate: Story = {
  beforeEach: () => {
    submitted.mockClear();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByRole("textbox", { name: "Name" });
    await userEvent.clear(name);
    await userEvent.type(name, "Updated item");
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(submitted).toHaveBeenCalledWith(expect.objectContaining({ name: "Updated item" }));
  },
};
