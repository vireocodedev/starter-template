export type DevelopmentCredentials = Readonly<{ username: string; password: string }>;

export function resolveDevelopmentCredentials(
  apiMode: "http" | "mock",
  showDemoCredentials: boolean,
): DevelopmentCredentials | undefined {
  if (!showDemoCredentials) return undefined;
  return apiMode === "mock" ? { username: "demo", password: "demo123" } : { username: "admin", password: "admin123" };
}
