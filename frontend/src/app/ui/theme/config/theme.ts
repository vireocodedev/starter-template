import { APP_THEME_COMPONENTS } from "@/app/ui/theme/config/theme.components";
import { APP_THEME_DARK_COLOR_SCHEME } from "@/app/ui/theme/config/theme.dark";
import { APP_THEME_LIGHT_COLOR_SCHEME } from "@/app/ui/theme/config/theme.light";
import { APP_THEME_TOKENS } from "@/app/ui/theme/config/theme.tokens";
import "@/app/ui/theme/config/theme.types";
import { createTheme } from "@mui/material/styles";
import type {} from "@mui/material/themeCssVarsAugmentation";

export const APP_THEME = createTheme({
  cssVariables: {
    colorSchemeSelector: "data",
  },
  colorSchemes: {
    light: APP_THEME_LIGHT_COLOR_SCHEME,
    dark: APP_THEME_DARK_COLOR_SCHEME,
  },
  components: APP_THEME_COMPONENTS,
  shape: APP_THEME_TOKENS.shape,
  typography: APP_THEME_TOKENS.typography,
});
