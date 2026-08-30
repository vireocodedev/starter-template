import { type ColorSystemOptions } from "@mui/material/styles";
import { APP_SURFACES_DARK } from "@/app/ui/theme/config/theme.surfaces";

export const APP_THEME_DARK_COLOR_SCHEME: ColorSystemOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#69d9ff",
      light: "#a8ecff",
      dark: "#30c5fb",
      contrastText: "#07111f",
    },
    secondary: {
      main: "#8396ff",
      light: "#aab5ff",
      dark: "#5b6fd4",
      contrastText: "#07111f",
    },
    success: { main: "#72d9aa" },
    warning: { main: "#f2b95d" },
    error: { main: "#ff8797" },
    info: { main: "#69d9ff" },
    background: {
      default: APP_SURFACES_DARK.canvas,
      paper: APP_SURFACES_DARK.overlay,
    },
    appSurface: APP_SURFACES_DARK,
    text: {
      primary: "#f4f5f6",
      secondary: "#a9adb5",
      disabled: "#70757d",
    },
    divider: "#303238",
    action: {
      hover: "rgba(105, 217, 255, 0.09)",
      selected: "rgba(105, 217, 255, 0.16)",
    },
  },
};
