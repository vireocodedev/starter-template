import { APP_THEME_COMPONENTS } from "@/app/ui/theme/config/theme.components";
import { APP_THEME_DARK_COLOR_SCHEME } from "@/app/ui/theme/config/theme.dark";
import { APP_THEME_LIGHT_COLOR_SCHEME } from "@/app/ui/theme/config/theme.light";
import { APP_THEME } from "@/app/ui/theme/config/theme";
import { describe, expect, it } from "vitest";

describe("application themes", () => {
  it("defines independent light and dark application color schemes", () => {
    expect(APP_THEME_LIGHT_COLOR_SCHEME.palette).toMatchObject({
      mode: "light",
      primary: { main: "#006c98" },
      background: {
        default: "#f7f9fc",
        paper: "#ffffff",
      },
      surface: {
        canvas: "#f7f9fc",
        screen: "#ffffff",
        recessed: "#edf3f8",
        content: "#ffffff",
        control: "#f7f9fc",
        elevated: "#f4f8fc",
        chrome: "#ffffff",
        overlay: "#ffffff",
      },
      divider: "#cbd8e6",
    });

    expect(APP_THEME_DARK_COLOR_SCHEME.palette).toMatchObject({
      mode: "dark",
      primary: { main: "#69d9ff" },
      background: {
        default: "#07111f",
        paper: "#0a1728",
      },
      surface: {
        canvas: "#07111f",
        screen: "#07111f",
        recessed: "#07111f",
        content: "#102137",
        control: "#183552",
        elevated: "#1e4164",
        chrome: "#162b45",
        overlay: "#0a1728",
      },
      divider: "#29435f",
    });
  });

  it("assembles both schemes into one CSS-variable theme", () => {
    expect(APP_THEME.colorSchemes.light?.palette.background).toMatchObject({
      default: "#f7f9fc",
      paper: "#ffffff",
    });
    expect(APP_THEME.colorSchemes.dark?.palette.background).toMatchObject({
      default: "#07111f",
      paper: "#0a1728",
    });
  });

  it("shares component policy across both themes", () => {
    expect(APP_THEME_COMPONENTS?.MuiCssBaseline?.styleOverrides).toBeDefined();
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
    expect(APP_THEME_COMPONENTS?.MuiTableHead?.styleOverrides?.root).toBeDefined();
    expect(APP_THEME_COMPONENTS?.MuiOutlinedInput?.styleOverrides?.root).toBeDefined();
    expect(APP_THEME_COMPONENTS?.MuiMenuItem?.styleOverrides?.root).toBeDefined();
    expect(APP_THEME_COMPONENTS?.VireoApplicationNavigation?.styleOverrides?.surface).toBeDefined();
    expect(APP_THEME_COMPONENTS?.VireoApplicationNavigationItem?.styleOverrides?.root).toBeDefined();
    expect(APP_THEME_COMPONENTS?.VireoMobileBottomNavigation?.styleOverrides?.root).toBeDefined();
    expect(APP_THEME_COMPONENTS?.VireoActionPreviewButton?.styleOverrides?.preview).toMatchObject({ opacity: 1 });
    expect(APP_THEME_COMPONENTS?.VireoPage?.styleOverrides?.root).toBeDefined();
    expect(APP_THEME_COMPONENTS?.VireoPageHeader?.styleOverrides?.root).toBeDefined();
    expect(APP_THEME_COMPONENTS?.VireoFormSection?.styleOverrides?.content).toBeDefined();
    expect(APP_THEME_COMPONENTS?.VireoPreferencePanel?.styleOverrides?.item).toBeDefined();
    expect(APP_THEME_COMPONENTS?.VireoPreferencePanel?.styleOverrides?.itemControl).toBeDefined();
    expect(APP_THEME_COMPONENTS?.VireoResponsiveTable?.styleOverrides?.root).toBeDefined();
    expect(Object.keys(APP_THEME.components ?? {})).toEqual(
      expect.arrayContaining(["VireoPageHeader", "VireoPreferencePanel", "VireoResponsiveTable"]),
    );
    expect(APP_THEME.components?.MuiCard?.defaultProps).toMatchObject({
      elevation: 0,
      variant: "outlined",
    });
  });

  it("defaults structural borders to the semantic divider instead of currentColor", () => {
    const baseline = APP_THEME_COMPONENTS?.MuiCssBaseline?.styleOverrides;
    expect(typeof baseline).toBe("function");

    const styles = typeof baseline === "function" ? baseline(APP_THEME) : baseline;

    expect(styles).toMatchObject({
      "*, *::before, *::after": { borderColor: APP_THEME.palette.divider },
    });
  });

  it("keeps compatibility surface aliases aligned with the semantic roles", () => {
    for (const scheme of [APP_THEME_LIGHT_COLOR_SCHEME, APP_THEME_DARK_COLOR_SCHEME]) {
      const surface = scheme.palette?.surface;
      expect(surface?.sunken).toBe(surface?.recessed);
      expect(surface?.base).toBe(surface?.content);
      expect(surface?.raised).toBe(surface?.elevated);
    }
  });

  it("uses the system reduced-motion preference and semantic application timing", () => {
    expect(APP_THEME.motion.reducedMotion).toBe("system");
    expect(APP_THEME.transitions.duration.standard).toBe(APP_THEME.appMotion.duration.standard);
    expect(APP_THEME.transitions.duration.enteringScreen).toBe(APP_THEME.appMotion.duration.enter);
  });

  it("uses a continuous screen surface on compact pages and preserves the desktop canvas", () => {
    const pageRoot = APP_THEME_COMPONENTS?.VireoPage?.styleOverrides?.root;
    expect(typeof pageRoot).toBe("function");

    const compactStyles =
      typeof pageRoot === "function"
        ? pageRoot({ ownerState: { mode: "compact" }, theme: APP_THEME } as never)
        : pageRoot;
    const regularStyles =
      typeof pageRoot === "function"
        ? pageRoot({ ownerState: { mode: "regular" }, theme: APP_THEME } as never)
        : pageRoot;

    expect(compactStyles).toMatchObject({
      backgroundColor: APP_THEME.palette.surface.screen,
      backgroundImage: "none",
    });
    expect(regularStyles).toMatchObject({
      backgroundColor: APP_THEME.palette.surface.canvas,
      backgroundSize: "24px 24px",
    });
  });

  it("turns responsive table cards into screen sections without changing the desktop hierarchy", () => {
    const tableRoot = APP_THEME_COMPONENTS?.VireoResponsiveTable?.styleOverrides?.root;
    expect(typeof tableRoot).toBe("function");

    const mobileStyles =
      typeof tableRoot === "function"
        ? tableRoot({ ownerState: { layout: "mobile", skeleton: false }, theme: APP_THEME } as never)
        : tableRoot;
    const desktopStyles =
      typeof tableRoot === "function"
        ? tableRoot({ ownerState: { layout: "desktop", skeleton: false }, theme: APP_THEME } as never)
        : tableRoot;

    expect(mobileStyles).toMatchObject({
      backgroundColor: APP_THEME.palette.surface.screen,
      "& .MuiAccordionSummary-root": { backgroundColor: APP_THEME.palette.surface.screen },
      "& .MuiAccordionDetails-root": { backgroundColor: APP_THEME.palette.surface.screen },
    });
    expect(desktopStyles).toMatchObject({
      backgroundColor: APP_THEME.palette.surface.content,
      "& .MuiTableContainer-root": { backgroundColor: APP_THEME.palette.surface.content },
      "& .MuiTableBody-root > .MuiTableRow-root > .MuiTableCell-root": {
        backgroundColor: APP_THEME.palette.surface.content,
      },
    });
  });

  it("maps primary work areas, outlined fields, and inset cards to their semantic surface roles", () => {
    const inputRoot = APP_THEME_COMPONENTS?.MuiOutlinedInput?.styleOverrides?.root;
    const cardRoot = APP_THEME_COMPONENTS?.MuiCard?.styleOverrides?.root;
    const preferenceItem = APP_THEME_COMPONENTS?.VireoPreferencePanel?.styleOverrides?.item;
    expect(typeof inputRoot).toBe("function");
    expect(typeof cardRoot).toBe("function");
    expect(typeof preferenceItem).toBe("function");

    const inputStyles = typeof inputRoot === "function" ? inputRoot({ theme: APP_THEME } as never) : inputRoot;
    const cardStyles =
      typeof cardRoot === "function"
        ? cardRoot({ ownerState: { variant: "inset" }, theme: APP_THEME } as never)
        : cardRoot;
    const preferenceItemStyles =
      typeof preferenceItem === "function"
        ? preferenceItem({ ownerState: { isCompact: false }, theme: APP_THEME } as never)
        : preferenceItem;

    expect(inputStyles).toMatchObject({
      backgroundColor: APP_THEME.palette.surface.control,
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: APP_THEME.palette.primary.main },
      "&.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: APP_THEME.palette.error.main,
      },
    });
    expect(cardStyles).toMatchObject({ backgroundColor: APP_THEME.palette.surface.recessed });
    expect(preferenceItemStyles).toMatchObject({ backgroundColor: APP_THEME.palette.surface.content });
    expect(APP_THEME_COMPONENTS?.MuiMenuItem?.styleOverrides?.root).toMatchObject({
      "&&": { minHeight: 48, paddingBlock: 10 },
    });
  });

  it("turns compact preference panels into full-bleed screen sections", () => {
    const panelRoot = APP_THEME_COMPONENTS?.VireoPreferencePanel?.styleOverrides?.root;
    const item = APP_THEME_COMPONENTS?.VireoPreferencePanel?.styleOverrides?.item;
    expect(typeof panelRoot).toBe("function");
    expect(typeof item).toBe("function");

    const ownerState = { isCompact: true };
    const rootStyles =
      typeof panelRoot === "function" ? panelRoot({ ownerState, theme: APP_THEME } as never) : panelRoot;
    const itemStyles = typeof item === "function" ? item({ ownerState, theme: APP_THEME } as never) : item;

    expect(rootStyles).toMatchObject({
      backgroundColor: APP_THEME.palette.surface.screen,
      border: "none",
      borderRadius: 0,
      boxShadow: "none",
    });
    expect(itemStyles).toMatchObject({ backgroundColor: APP_THEME.palette.surface.screen });
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
