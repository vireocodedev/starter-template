import { APP_THEME_COMPONENTS } from "@/app/ui/theme/config/theme.components";
import { APP_THEME_DARK_COLOR_SCHEME } from "@/app/ui/theme/config/theme.dark";
import { APP_THEME_LIGHT_COLOR_SCHEME } from "@/app/ui/theme/config/theme.light";
import { APP_THEME_TOKENS } from "@/app/ui/theme/config/theme.tokens";
import "@/app/ui/theme/config/theme.types";
import { createTheme } from "@mui/material/styles";
import type {} from "@mui/material/themeCssVarsAugmentation";

export const APP_THEME = createTheme({
  appMotion: APP_THEME_TOKENS.motion,
  cssVariables: {
    colorSchemeSelector: "data",
  },
  colorSchemes: {
    light: APP_THEME_LIGHT_COLOR_SCHEME,
    dark: APP_THEME_DARK_COLOR_SCHEME,
  },
  components: APP_THEME_COMPONENTS,
  motion: {
    reducedMotion: "system",
  },
  shape: APP_THEME_TOKENS.shape,
  transitions: {
    duration: {
      shortest: APP_THEME_TOKENS.motion.duration.micro,
      shorter: APP_THEME_TOKENS.motion.duration.exit,
      short: APP_THEME_TOKENS.motion.duration.standard,
      standard: APP_THEME_TOKENS.motion.duration.standard,
      complex: APP_THEME_TOKENS.motion.duration.emphasized,
      enteringScreen: APP_THEME_TOKENS.motion.duration.enter,
      leavingScreen: APP_THEME_TOKENS.motion.duration.exit,
    },
    easing: {
      easeInOut: APP_THEME_TOKENS.motion.easing.standard,
      easeOut: APP_THEME_TOKENS.motion.easing.enter,
      easeIn: APP_THEME_TOKENS.motion.easing.exit,
      sharp: APP_THEME_TOKENS.motion.easing.exit,
    },
  },
  typography: APP_THEME_TOKENS.typography,
});
