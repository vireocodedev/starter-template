import { z } from "zod";

const AppEnv = z.object({
  VITE_API_BASE_URL: z.string().min(1).default("/api"),
  VITE_API_MODE: z.enum(["http", "mock"]).default("http"),
  VITE_APP_NAME: z.string().min(1).default("Vireo Starter"),
});

export type AppEnv = z.infer<typeof AppEnv>;

export function parseAppEnv(environment: ImportMetaEnv): AppEnv {
  return AppEnv.parse(environment);
}
