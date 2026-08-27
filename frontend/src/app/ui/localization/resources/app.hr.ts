import type { WidenLeaves } from "@vireocodedev/localization";
import type en from "./app.en";

const hr = {
  brand: {
    name: "Vireo Starter",
    tagline: "Full-stack PWA",
    online: "Sustav je povezan",
    offline: "Veza je prekinuta",
  },
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
  loading: { application: "Učitavanje aplikacije", page: "Učitavanje stranice" },
  pwa: {
    later: "Kasnije",
    offline: "Izvan mreže ste. Podaci s poslužitelja možda nisu dostupni.",
    offlineReady:
      "Aplikacijska ljuska spremna je za ograničeni izvanmrežni rad. Podaci s poslužitelja i dalje zahtijevaju vezu.",
    update: "Ažuriraj",
    updateReady: "Nova verzija je spremna.",
  },
  unsavedChanges: {
    title: "Odbaciti nespremljene promjene?",
    message: "Promjene će se izgubiti ako zatvorite ovaj obrazac.",
    keepEditing: "Nastavi uređivati",
    discard: "Odbaci promjene",
  },
} satisfies WidenLeaves<typeof en>;

export default hr;
