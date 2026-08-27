import { VireoResponsiveFormOverlay } from "@vireocodedev/ui";
import { ItemForm, ItemFormActions } from "../forms/ItemForm";
import { useItemCreateMutation } from "../../hooks/useItemCreateMutation";
import { useItemUpdateMutation } from "../../hooks/useItemUpdateMutation";
import { useItemForm } from "../../hooks/useItemForm";
import type { Item } from "../../models/Item";
import { useAppPreferences } from "@/app/ui/preferences/hooks/useAppPreferences";
import { useItemTranslation } from "../../localization/use-item-translation";

export type ItemFormOverlayProps = {
  item?: Item;
  open: boolean;
  onClose: () => void;
  onExited?: () => void;
};

export function ItemFormOverlay({ item, open, onClose, onExited }: ItemFormOverlayProps) {
  const { t } = useItemTranslation();
  const createItem = useItemCreateMutation();
  const updateItem = useItemUpdateMutation();
  const { preferences } = useAppPreferences();
  const submit = async (value: Item) => {
    if (item) {
      await updateItem.mutateAsync({ id: item.id, value });
    } else {
      await createItem.mutateAsync(value);
    }
    onClose();
  };
  const form = useItemForm(item, submit);
  const savePending = createItem.isPending || updateItem.isPending;

  return (
    <VireoResponsiveFormOverlay
      open={open}
      onClose={onClose}
      onExited={onExited}
      closeDisabled={savePending}
      title={item ? t("form.updateTitle") : t("form.createTitle")}
      closeLabel={t("form.close")}
      desktopSurface={preferences.desktopSurface}
      allowSidePanelResize={preferences.allowSidePanelResize}
      desktopNavWidth={preferences.navigationMode === "compact" ? 80 : preferences.navigationWidth}
      desktopSidePanelWidth={560}
      maxWidth="md"
      renderForm={children => (
        <form.Form layoutWidth="full" unsavedChangesGuard>
          {children}
        </form.Form>
      )}
      actions={({ requestClose }) => (
        <ItemFormActions form={form} editing={item !== undefined} onCancel={requestClose} pending={savePending} />
      )}
    >
      <ItemForm form={form} />
    </VireoResponsiveFormOverlay>
  );
}
