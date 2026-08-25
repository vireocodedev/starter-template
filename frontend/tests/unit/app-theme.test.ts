import { APP_THEME_COMPONENTS } from "@/app/ui/theme/config/theme.components";
import { APP_THEME_DARK_COLOR_SCHEME } from "@/app/ui/theme/config/theme.dark";
import { APP_THEME_LIGHT_COLOR_SCHEME } from "@/app/ui/theme/config/theme.light";
import { APP_THEME } from "@/app/ui/theme/config/theme";
import { describe, expect, it } from "vitest";

describe("application themes", () => {
  it("defines independent light and dark application color schemes", () => {
    expect(APP_THEME_LIGHT_COLOR_SCHEME.palette).toMatchObject({
      mode: "light",
      background: {
        default: "#f9fafb",
        paper: "#ffffff",
      },
      divider: "#d0d5dd",
    });

    expect(APP_THEME_DARK_COLOR_SCHEME.palette).toMatchObject({
      mode: "dark",
      background: {
        default: "#0c111d",
        paper: "#1d2939",
      },
      divider: "#344054",
    });
  });

  it("assembles both schemes into one CSS-variable theme", () => {
    expect(APP_THEME.colorSchemes.light?.palette.background).toMatchObject({
      default: "#f9fafb",
      paper: "#ffffff",
    });
    expect(APP_THEME.colorSchemes.dark?.palette.background).toMatchObject({
      default: "#0c111d",
      paper: "#1d2939",
    });
  });

  it("shares component policy across both themes", () => {
    expect(APP_THEME_COMPONENTS?.MuiCard?.defaultProps).toMatchObject({
      elevation: 0,
      variant: "outlined",
    });
    expect(APP_THEME_COMPONENTS?.MuiButton?.defaultProps).toMatchObject({
      disableElevation: true,
    });
    expect(APP_THEME_COMPONENTS?.MuiButton?.styleOverrides?.root).toBeDefined();
    expect(APP_THEME_COMPONENTS?.MuiIconButton?.styleOverrides?.root).toBeDefined();
    expect(APP_THEME_COMPONENTS?.MuiTableBody?.styleOverrides?.root).toBeDefined();
    expect(APP_THEME.components?.MuiCard?.defaultProps).toMatchObject({
      elevation: 0,
      variant: "outlined",
    });
  });

  it("uses the system reduced-motion preference and semantic application timing", () => {
    expect(APP_THEME.motion.reducedMotion).toBe("system");
    expect(APP_THEME.transitions.duration.standard).toBe(APP_THEME.appMotion.duration.standard);
    expect(APP_THEME.transitions.duration.enteringScreen).toBe(APP_THEME.appMotion.duration.enter);
  });

  it("removes tactile transforms and transition time for reduced-motion users", () => {
    const buttonRoot = APP_THEME_COMPONENTS?.MuiButton?.styleOverrides?.root;
    const iconButtonRoot = APP_THEME_COMPONENTS?.MuiIconButton?.styleOverrides?.root;
    expect(typeof buttonRoot).toBe("function");
    expect(typeof iconButtonRoot).toBe("function");

    const buttonStyles = typeof buttonRoot === "function" ? buttonRoot({ theme: APP_THEME } as never) : buttonRoot;
    const iconButtonStyles =
      typeof iconButtonRoot === "function" ? iconButtonRoot({ theme: APP_THEME } as never) : iconButtonRoot;
    expect(buttonStyles).toMatchObject({
      "@media (prefers-reduced-motion: reduce)": {
        transitionDuration: "0ms",
        "&:active:not(.Mui-disabled)": { transform: "none" },
      },
    });
    expect(iconButtonStyles).toMatchObject({
      "@media (prefers-reduced-motion: reduce)": {
        transitionDuration: "0ms",
        "&:active:not(.Mui-disabled)": { transform: "none" },
      },
    });
  });
});
