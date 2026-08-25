import type { WidenLeaves } from "@vireocodedev/starter-localization";
import type en from "./app.en";

const hr = {
  brand: { name: "Vireo Starter", tagline: "Full-stack PWA" },
  navigation: {
    OVERVIEW: "Pregled",
    ITEMS: "Stavke",
    SETTINGS: "Postavke",
    DEV_TOOLS: "Razvojni alati",
    EXPAND: "Proširi navigaciju",
    COMPACT: "Sažmi navigaciju",
    CLOSE: "Zatvori navigaciju",
    OPEN: "Otvori navigaciju",
    QUICK: "Brza navigacija",
  },
  account: { OPEN_MENU: "Otvori izbornik računa", SIGN_OUT: "Odjava" },
  actions: { BACK: "Natrag" },
  unsavedChanges: {
    title: "Odbaciti nespremljene promjene?",
    message: "Promjene će se izgubiti ako zatvorite ovaj obrazac.",
    keepEditing: "Nastavi uređivati",
    discard: "Odbaci promjene",
  },
} satisfies WidenLeaves<typeof en>;

export default hr;
