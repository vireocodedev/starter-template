import { type ColorSystemOptions } from "@mui/material/styles";
import { APP_SURFACES_LIGHT } from "@/app/ui/theme/config/theme.surfaces";

export const APP_THEME_LIGHT_COLOR_SCHEME: ColorSystemOptions = {
  palette: {
    mode: "light",
    primary: {
      main: "#009ee0",
      light: "#36c7fa",
      dark: "#0170a3",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#7f56d9",
      contrastText: "#ffffff",
    },
    background: {
      default: APP_SURFACES_LIGHT.sunken,
      paper: "#ffffff",
    },
    surface: APP_SURFACES_LIGHT,
    text: {
      primary: "#101828",
      secondary: "#475467",
      disabled: "#98a2b3",
    },
    divider: "#d0d5dd",
    action: {
      hover: "rgba(16, 24, 40, 0.04)",
      selected: "rgba(16, 24, 40, 0.08)",
    },
  },
};
