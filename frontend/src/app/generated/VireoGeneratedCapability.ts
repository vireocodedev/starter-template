import type { ComponentType } from "react";

export type VireoGeneratedCapability = {
  id: string;
  load: () => Promise<{ default: ComponentType }>;
  namespace: string;
  navigationLabels: { en: string; hr: string };
  navigationOrder: number;
  path: string;
  resources: {
    en: Record<string, unknown>;
    hr: Record<string, unknown>;
  };
};
