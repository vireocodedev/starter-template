import { parseAppEnv } from "./app-env";

const environment = parseAppEnv(import.meta.env);

export const appConfig = Object.freeze({
  apiBaseUrl: environment.VITE_API_BASE_URL,
  apiMode: environment.VITE_API_MODE,
  name: environment.VITE_APP_NAME,
  showDemoCredentials: environment.VITE_SHOW_DEMO_CREDENTIALS,
});
