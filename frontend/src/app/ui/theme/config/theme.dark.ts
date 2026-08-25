import { type ColorSystemOptions } from "@mui/material/styles";
import { APP_SURFACES_DARK } from "@/app/ui/theme/config/theme.surfaces";

export const APP_THEME_DARK_COLOR_SCHEME: ColorSystemOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#36c7fa",
      light: "#7cd9fd",
      dark: "#0170a3",
      contrastText: "#101828",
    },
    secondary: {
      main: "#a78bfa",
      contrastText: "#101828",
    },
    background: {
      default: APP_SURFACES_DARK.sunken,
      paper: "#1d2939",
    },
    surface: APP_SURFACES_DARK,
    text: {
      primary: "#f9fafb",
      secondary: "#98a2b3",
      disabled: "#667085",
    },
    divider: "#344054",
    action: {
      hover: "rgba(255, 255, 255, 0.08)",
      selected: "rgba(255, 255, 255, 0.12)",
    },
  },
};
