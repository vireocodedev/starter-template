import { parseAppEnv } from "./app-env";

const environment = parseAppEnv(import.meta.env);

export const appConfig = Object.freeze({
  apiBaseUrl: environment.VITE_API_BASE_URL,
  name: environment.VITE_APP_NAME,
});
