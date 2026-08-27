import React from "react";
import {
  UnsavedChangesContext,
  createUnsavedChangesRegistry,
  useVireoConfirmation,
  type UnsavedChangesContextValue,
  type UnsavedChangesDiscardRequest,
} from "@vireocodedev/ui";
import { useAppTranslation } from "@/app/ui/localization/use-app-translation";

/** Connects Vireo's dirty-state registry to the application's confirmation surface. */
export function AppUnsavedChangesProvider({ children }: React.PropsWithChildren) {
  const { t } = useAppTranslation();
  const [registry] = React.useState(createUnsavedChangesRegistry);
  const confirm = useVireoConfirmation();

  const requestDiscard = React.useCallback(
    ({ onDiscard, scopeId }: UnsavedChangesDiscardRequest) => {
      const status = registry.getStatus(scopeId);

      if (!status.dirty) {
        void registry.runWithoutNavigationBlock(onDiscard);
        return;
      }

      if (status.busy) return;

      void confirm({
        title: t("unsavedChanges.title"),
        message: t("unsavedChanges.message"),
        cancelLabel: t("unsavedChanges.keepEditing"),
        confirmLabel: t("unsavedChanges.discard"),
        confirmColor: "warning",
      }).then(confirmed => {
        if (confirmed) void registry.runWithoutNavigationBlock(onDiscard);
      });
    },
    [confirm, registry, t],
  );

  const context = React.useMemo<UnsavedChangesContextValue>(
    () => ({
      removeRegistration: registry.removeRegistration,
      requestDiscard,
      runWithoutNavigationBlock: registry.runWithoutNavigationBlock,
      upsertRegistration: registry.upsertRegistration,
    }),
    [registry, requestDiscard],
  );

  return <UnsavedChangesContext.Provider value={context}>{children}</UnsavedChangesContext.Provider>;
}
