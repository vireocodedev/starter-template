import { type ColorSystemOptions } from "@mui/material/styles";
import { APP_SURFACES_LIGHT } from "@/app/ui/theme/config/theme.surfaces";

export const APP_THEME_LIGHT_COLOR_SCHEME: ColorSystemOptions = {
  palette: {
    mode: "light",
    primary: {
      main: "#8a5d00",
      light: "#c58a00",
      dark: "#5c3e00",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#087ea4",
      contrastText: "#ffffff",
    },
    background: {
      default: APP_SURFACES_LIGHT.sunken,
      paper: "#ffffff",
    },
    surface: APP_SURFACES_LIGHT,
    text: {
      primary: "#191c18",
      secondary: "#51584f",
      disabled: "#8a9188",
    },
    divider: "#cbd0c7",
    action: {
      hover: "rgba(138, 93, 0, 0.07)",
      selected: "rgba(197, 138, 0, 0.13)",
    },
  },
};
