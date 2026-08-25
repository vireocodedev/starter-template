import { type Theme } from "@mui/material";

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
  },
};
