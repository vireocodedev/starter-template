import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { APP_THEME_TOKENS } from "@/app/ui/theme/config/theme.tokens";
import { describe, expect, it } from "vitest";

describe("application motion contract", () => {
  it("keeps route motion short, composited, and removable", () => {
    const css = readFileSync(resolve(process.cwd(), "src/main.css"), "utf8");
    const routeMotionCss = css.slice(css.indexOf("::view-transition-old(app-page)"));

    expect(APP_THEME_TOKENS.motion.duration.enter).toBeLessThanOrEqual(220);
    expect(css).toContain("::view-transition-old(app-page)");
    expect(css).toContain("::view-transition-new(app-page)");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toMatch(/@keyframes app-page-(?:enter|exit)[\s\S]*opacity/);
    expect(css).not.toMatch(/transition\s*:\s*all/);
    expect(routeMotionCss).not.toMatch(/^\s*(?:top|left|width|height)\s*:/m);
  });
});
