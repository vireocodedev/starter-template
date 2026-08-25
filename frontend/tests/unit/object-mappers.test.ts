import { describe, expect, it } from "vitest";
import { omitKeys, withId } from "@/app/data/network/services/object-mappers";

describe("object mappers", () => {
  it("omits only the requested keys without mutating the source", () => {
    const source = { id: 7, name: "Audit", createdAt: "2026-08-25" };

    expect(omitKeys(source, ["createdAt"])).toEqual({ id: 7, name: "Audit" });
    expect(source).toEqual({ id: 7, name: "Audit", createdAt: "2026-08-25" });
  });

  it("removes a form placeholder ID for create payloads", () => {
    expect(withId({ id: 0, name: "Audit" }, "id", null)).toEqual({ name: "Audit" });
  });

  it("replaces the ID for update payloads", () => {
    expect(withId({ id: 0, name: "Audit" }, "id", 42)).toEqual({ id: 42, name: "Audit" });
  });
});
