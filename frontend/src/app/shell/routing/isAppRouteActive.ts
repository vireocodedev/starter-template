function normalizeRoutePath(path: string): string {
  if (path === "/") return path;
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

export function isAppRouteActive(pathname: string, routePath: string): boolean {
  const normalizedRoute = normalizeRoutePath(routePath);
  const normalizedPathname = normalizeRoutePath(pathname);
  if (normalizedRoute === "/") return normalizedPathname === normalizedRoute;
  return normalizedPathname === normalizedRoute || normalizedPathname.startsWith(`${normalizedRoute}/`);
}
