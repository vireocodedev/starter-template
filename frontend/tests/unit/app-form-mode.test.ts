import { AppFormMode } from "@/app/ui/forms/models/AppFormMode";
import { describe, expect, it } from "vitest";

describe("AppFormMode", () => {
  it("accepts the shared entity form lifecycle modes", () => {
    expect(AppFormMode.options).toEqual(["CREATE", "UPDATE", "READ"]);
    expect(AppFormMode.parse(AppFormMode.enum.CREATE)).toBe("CREATE");
    expect(AppFormMode.parse(AppFormMode.enum.UPDATE)).toBe("UPDATE");
    expect(AppFormMode.parse(AppFormMode.enum.READ)).toBe("READ");
  });

  it("rejects modes outside the standard", () => {
    expect(AppFormMode.safeParse("DELETE").success).toBe(false);
  });
});
