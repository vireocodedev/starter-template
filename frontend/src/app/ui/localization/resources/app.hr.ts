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
    PRIMARY: "Glavna navigacija",
    OVERVIEW: "Pregled",
    ITEMS: "Stavke",
    SETTINGS: "Postavke",
    EXPAND: "Proširi navigaciju",
    COMPACT: "Sažmi navigaciju",
    CLOSE: "Zatvori navigaciju",
    OPEN: "Otvori navigaciju",
    QUICK: "Brza navigacija",
  },
  account: { OPEN_MENU: "Otvori izbornik računa", SIGN_OUT: "Odjava" },
  auth: {
    outcomes: {
      unauthenticated: "Prijavite se za nastavak.",
      invalidCredentials: "Korisničko ime ili lozinka nisu ispravni.",
      forbidden: "Vašem računu nije dopušten pristup ovom radnom prostoru.",
      expiredSession: "Vaša je sesija istekla. Ponovno se prijavite.",
      offline: "Usluga prijave nije dostupna. Provjerite vezu i pokušajte ponovno.",
      server: "Usluga prijave privremeno nije dostupna. Pokušajte ponovno kasnije.",
      malformedResponse: "Usluga prijave vratila je neočekivan odgovor. Pokušajte ponovno ili kontaktirajte podršku.",
      logoutFailure: "Odjava nije dovršena. Još ste prijavljeni; pokušajte ponovno.",
    },
  },
  actions: { BACK: "Natrag" },
  loading: { application: "Učitavanje aplikacije", page: "Učitavanje stranice" },
  session: { expired: "Vaša je sesija istekla. Ponovno se prijavite." },
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
