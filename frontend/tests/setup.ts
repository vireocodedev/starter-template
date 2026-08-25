import "@testing-library/jest-dom/vitest";
import { setI18n } from "react-i18next";
import { appI18n } from "@/app/ui/localization/app-i18n";

// Component and integration tests often render isolated application surfaces
// without the root App provider. Point react-i18next at the same initialized
// instance used by the application so those tests exercise real resources and
// never fall back to rendering translation keys.
setI18n(appI18n);
