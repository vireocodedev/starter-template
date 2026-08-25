export const APP_THEME_TOKENS = {
  motion: {
    duration: {
      instant: 0,
      micro: 110,
      standard: 180,
      enter: 210,
      exit: 150,
      emphasized: 270,
    },
    easing: {
      standard: "cubic-bezier(0.2, 0, 0, 1)",
      enter: "cubic-bezier(0, 0, 0, 1)",
      exit: "cubic-bezier(0.3, 0, 1, 1)",
    },
    distance: {
      micro: 4,
      component: 8,
      surface: 16,
    },
    scale: {
      pressed: 0.98,
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "InterVariable, Inter, system-ui, sans-serif",
  },
} as const;
