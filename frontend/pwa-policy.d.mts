export type AppIdentity = Readonly<{
  id: string;
  name: string;
  shortName: string;
  description: string;
  language: string;
  themeColor: string;
  backgroundColor: string;
  startUrl: string;
  scope: string;
}>;

export type PwaIcon = {
  src: string;
  sizes: string;
  type: "image/png";
  purpose: "any" | "maskable";
};

export declare const APP_IDENTITY: AppIdentity;
export declare const PWA_POLICY: Readonly<{
  readinessPath: string;
  serviceWorkerPath: string;
  manifestPath: string;
  apiPathPrefix: string;
  workbox: Readonly<{
    navigationDenylistPathPatternSource: string;
    runtimeUrlPatternSource: string;
    runtimeHandler: "NetworkOnly";
  }>;
  icons: readonly PwaIcon[];
  appleTouchIcon: Readonly<{
    src: string;
    sizes: "180x180";
    type: "image/png";
  }>;
}>;
export declare function createPwaManifest(identity?: AppIdentity): {
  id: string;
  name: string;
  short_name: string;
  description: string;
  lang: string;
  theme_color: string;
  background_color: string;
  display: "standalone";
  start_url: string;
  scope: string;
  icons: PwaIcon[];
};
