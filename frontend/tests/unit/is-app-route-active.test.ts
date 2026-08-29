import { isAppRouteActive } from "@/app/shell/routing/isAppRouteActive";

describe("isAppRouteActive", () => {
  it("owns the exact route and its nested segments", () => {
    expect(isAppRouteActive("/items", "/items")).toBe(true);
    expect(isAppRouteActive("/items/42/history", "/items")).toBe(true);
    expect(isAppRouteActive("/items/", "/items/")).toBe(true);
  });

  it("rejects prefix collisions and keeps the root exact", () => {
    expect(isAppRouteActive("/items-archive", "/items")).toBe(false);
    expect(isAppRouteActive("/item", "/items")).toBe(false);
    expect(isAppRouteActive("/settings", "/")).toBe(false);
  });
});
