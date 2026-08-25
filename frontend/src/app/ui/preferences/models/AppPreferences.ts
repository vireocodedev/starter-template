import { z } from "zod";
import { APP_LOCALES, DEFAULT_APP_LOCALE } from "@/app/ui/localization/app-locales";

export const AppPreferencesSchema = z.object({
  locale: z.enum(APP_LOCALES).default(DEFAULT_APP_LOCALE),
  darkMode: z.boolean(),
  tableSize: z.enum(["small", "medium"]),
  pageWidth: z.enum(["md", "lg", "xl", "full"]),
  desktopSurface: z.enum(["dialog", "overlaySidePanel", "dockedSidePanel"]),
  allowSidePanelResize: z.boolean(),
  navigationMode: z.enum(["expanded", "compact"]).default("expanded"),
  navigationWidth: z.number().int().min(220).max(480).default(264),
  navigationLocked: z.boolean(),
});

export type AppPreferences = z.infer<typeof AppPreferencesSchema>;

export const DEFAULT_APP_PREFERENCES: AppPreferences = {
  locale: DEFAULT_APP_LOCALE,
  darkMode: true,
  tableSize: "medium",
  pageWidth: "xl",
  desktopSurface: "dialog",
  allowSidePanelResize: true,
  navigationMode: "expanded",
  navigationWidth: 264,
  navigationLocked: false,
};
