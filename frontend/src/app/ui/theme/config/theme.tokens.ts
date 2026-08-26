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
    borderRadius: 6,
  },
  typography: {
    fontFamily: "InterVariable, Inter, system-ui, sans-serif",
    h1: { fontWeight: 850, letterSpacing: "-0.035em" },
    h2: { fontWeight: 850, letterSpacing: "-0.03em" },
    h3: { fontWeight: 825, letterSpacing: "-0.025em" },
    h4: { fontWeight: 825, letterSpacing: "-0.02em" },
    h5: { fontWeight: 800, letterSpacing: "-0.015em" },
    h6: { fontWeight: 800, letterSpacing: "-0.01em" },
    button: { fontWeight: 750, letterSpacing: "0.01em" },
  },
} as const;
