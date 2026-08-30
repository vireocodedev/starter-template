import { parseAppEnv } from "./app-env";
import { APP_IDENTITY } from "../../../pwa-policy.mjs";

const environment = parseAppEnv(import.meta.env);

export const appConfig = Object.freeze({
  apiBaseUrl: environment.VITE_API_BASE_URL,
  apiMode: environment.VITE_API_MODE,
  identity: APP_IDENTITY,
  name: APP_IDENTITY.name,
  showDemoCredentials: environment.VITE_SHOW_DEMO_CREDENTIALS,
});
