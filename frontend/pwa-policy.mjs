/**
 * Product identity and conservative PWA policy.
 *
 * This is deliberately plain ESM so the Vite config, browser application,
 * Playwright checks, and dependency-free Node contract checker consume exactly
 * the same values. Generators replace this one object for a new product.
 */
export const APP_IDENTITY = Object.freeze({
  id: "/vireo-starter",
  name: "Vireo Starter",
  shortName: "Vireo",
  description: "A production-oriented full-stack PWA built on Vireo Starter.",
  language: "en",
  themeColor: "#0b0c0e",
  backgroundColor: "#0b0c0e",
  startUrl: "/",
  scope: "/",
});

export const PWA_POLICY = Object.freeze({
  readinessPath: "/actuator/health/readiness",
  serviceWorkerPath: "/sw.js",
  manifestPath: "/manifest.webmanifest",
  apiPathPrefix: "/api",
  workbox: Object.freeze({
    navigationDenylistPathPatternSource: "^/api(?:/|\\?|$)",
    runtimeUrlPatternSource: "/api(?:/|\\?|$)",
    runtimeHandler: "NetworkOnly",
  }),
  icons: Object.freeze([
    Object.freeze({
      src: "/icons/icon-192x192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    }),
    Object.freeze({
      src: "/icons/icon-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    }),
    Object.freeze({
      src: "/icons/icon-maskable-192x192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "maskable",
    }),
    Object.freeze({
      src: "/icons/icon-maskable-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    }),
  ]),
  appleTouchIcon: Object.freeze({
    src: "/icons/apple-touch-icon.png",
    sizes: "180x180",
    type: "image/png",
  }),
});

export function createPwaManifest(identity = APP_IDENTITY) {
  // Vite's manifest type is mutable; never let it mutate the shared policy.
  const icons = PWA_POLICY.icons.map(icon => ({ ...icon }));
  return {
    id: identity.id,
    name: identity.name,
    short_name: identity.shortName,
    description: identity.description,
    lang: identity.language,
    theme_color: identity.themeColor,
    background_color: identity.backgroundColor,
    display: "standalone",
    start_url: identity.startUrl,
    scope: identity.scope,
    icons,
  };
}
