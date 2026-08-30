import { type ColorSystemOptions } from "@mui/material/styles";
import { APP_SURFACES_LIGHT } from "@/app/ui/theme/config/theme.surfaces";

export const APP_THEME_LIGHT_COLOR_SCHEME: ColorSystemOptions = {
  palette: {
    mode: "light",
    primary: {
      main: "#006c98",
      light: "#30c5fb",
      dark: "#00577c",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#5366cc",
      light: "#8396ff",
      dark: "#3f50ad",
      contrastText: "#ffffff",
    },
    success: { main: "#087d50" },
    warning: { main: "#9c5d00" },
    error: { main: "#b4233e" },
    info: { main: "#006c98" },
    background: {
      default: APP_SURFACES_LIGHT.canvas,
      paper: APP_SURFACES_LIGHT.overlay,
    },
    appSurface: APP_SURFACES_LIGHT,
    text: {
      primary: "#172335",
      secondary: "#606872",
      disabled: "#9298a1",
    },
    divider: "#d5d8dd",
    action: {
      hover: "rgba(8, 126, 172, 0.07)",
      selected: "rgba(8, 126, 172, 0.13)",
    },
  },
};
