import { effect } from "@preact/signals-react";
import { sigAppPreferences } from "@/app/ui/preferences/signals/sigAppPreferences";
import { createAppPreferencesStorage } from "@/app/ui/preferences/services/app-preferences-storage";

let disposeSignalEffects: (() => void) | undefined;

export function initSignalEffects(): void {
  disposeSignalEffects?.();

  const preferencesStorage = createAppPreferencesStorage();
  disposeSignalEffects = effect(() => {
    preferencesStorage.write(sigAppPreferences.value);
  });
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    disposeSignalEffects?.();
    disposeSignalEffects = undefined;
  });
}
