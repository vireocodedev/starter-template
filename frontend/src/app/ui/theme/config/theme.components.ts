import { type Theme } from "@mui/material";
import { APP_THEME_TOKENS } from "@/app/ui/theme/config/theme.tokens";

export const APP_THEME_COMPONENTS: Theme["components"] = {
  MuiPaper: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${theme.palette.common.white} 3%, transparent), transparent 56px)`,
      }),
    },
  },
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
  MuiTableHead: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.surface.raised,
        boxShadow: `inset 0 -1px 0 ${theme.palette.divider}`,
      }),
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: ({ theme }) => ({
        color: theme.palette.text.secondary,
        fontSize: "0.6875rem",
        fontWeight: 800,
        letterSpacing: "0.075em",
        textTransform: "uppercase",
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
        borderColor: theme.palette.divider,
        boxShadow: `inset 0 1px 0 color-mix(in srgb, ${theme.palette.common.white} 8%, transparent)`,
      }),
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 4,
        fontWeight: 750,
        letterSpacing: "0.015em",
      },
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 5,
        minHeight: 40,
        transition: theme.transitions.create(["background-color", "border-color", "box-shadow", "transform"], {
          duration: APP_THEME_TOKENS.motion.duration.micro,
          easing: APP_THEME_TOKENS.motion.easing.standard,
        }),
        "&.MuiButton-contained": {
          boxShadow: `inset 0 1px 0 color-mix(in srgb, ${theme.palette.common.white} 22%, transparent), 0 2px 5px color-mix(in srgb, ${theme.palette.common.black} 18%, transparent)`,
        },
        "&.MuiButton-contained:hover": {
          boxShadow: `inset 0 1px 0 color-mix(in srgb, ${theme.palette.common.white} 26%, transparent), 0 4px 10px color-mix(in srgb, ${theme.palette.common.black} 20%, transparent)`,
          transform: "translateY(-1px)",
        },
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
        borderRadius: 5,
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
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.surface.base,
        borderRadius: 5,
        boxShadow: `inset 0 1px 2px color-mix(in srgb, ${theme.palette.common.black} 5%, transparent)`,
      }),
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderInlineStart: "3px solid currentColor",
        borderRadius: 4,
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 4,
        fontSize: "0.75rem",
        fontWeight: 650,
      },
    },
  },
};
