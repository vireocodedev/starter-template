import { type Theme } from "@mui/material";
import { APP_THEME_TOKENS } from "@/app/ui/theme/config/theme.tokens";

export const APP_THEME_COMPONENTS: Theme["components"] = {
  MuiTableBody: {
    styleOverrides: {
      root: ({ theme }) => ({
        "& > .MuiTableRow-root:nth-of-type(odd)": {
          backgroundColor: `color-mix(in srgb, ${theme.palette.action.hover} 50%, transparent)`,
        },
        "& > .MuiTableRow-root.MuiTableRow-hover:hover": {
          backgroundColor: theme.palette.action.hover,
        },
      }),
    },
  },
  MuiCard: {
    defaultProps: {
      elevation: 0,
      variant: "outlined",
    },
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.surface.base,
      }),
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        transition: theme.transitions.create(["background-color", "border-color", "box-shadow", "transform"], {
          duration: APP_THEME_TOKENS.motion.duration.micro,
          easing: APP_THEME_TOKENS.motion.easing.standard,
        }),
        "&:active:not(.Mui-disabled)": { transform: "translateY(1px) scale(0.99)" },
        "@media (prefers-reduced-motion: reduce)": {
          transitionDuration: "0ms",
          "&:active:not(.Mui-disabled)": { transform: "none" },
        },
      }),
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        transition: theme.transitions.create(["background-color", "color", "transform"], {
          duration: APP_THEME_TOKENS.motion.duration.micro,
          easing: APP_THEME_TOKENS.motion.easing.standard,
        }),
        "&:active:not(.Mui-disabled)": { transform: `scale(${APP_THEME_TOKENS.motion.scale.pressed})` },
        "@media (pointer: coarse)": { minHeight: 44, minWidth: 44 },
        "@media (prefers-reduced-motion: reduce)": {
          transitionDuration: "0ms",
          "&:active:not(.Mui-disabled)": { transform: "none" },
        },
      }),
    },
  },
};
