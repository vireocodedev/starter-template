import { type ColorSystemOptions } from "@mui/material/styles";
import { APP_SURFACES_DARK } from "@/app/ui/theme/config/theme.surfaces";

export const APP_THEME_DARK_COLOR_SCHEME: ColorSystemOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#f2c94c",
      light: "#ffe28a",
      dark: "#b79424",
      contrastText: "#171811",
    },
    secondary: {
      main: "#54c8e8",
      contrastText: "#101512",
    },
    background: {
      default: APP_SURFACES_DARK.sunken,
      paper: "#191e1a",
    },
    surface: APP_SURFACES_DARK,
    text: {
      primary: "#f5f7f2",
      secondary: "#aeb6ab",
      disabled: "#747c72",
    },
    divider: "#3b433b",
    action: {
      hover: "rgba(242, 201, 76, 0.09)",
      selected: "rgba(242, 201, 76, 0.16)",
    },
  },
};
