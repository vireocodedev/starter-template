import type { WidenLeaves } from "@vireocodedev/localization";
import type en from "./app.en";

const hr = {
  connectivity: {
    "browser-offline": "Preglednik je izvan mreže",
    checking: "Provjera usluge",
    reachable: "Usluga je dostupna",
    unavailable: "Usluga nije dostupna",
    mock: "Lažna usluga",
    message: {
      "browser-offline": "Preglednik javlja da nema mrežne veze. Podaci s poslužitelja možda nisu dostupni.",
      checking: "Provjerava se može li se dosegnuti poslužitelj.",
      reachable: "Poslužitelj je dostupan.",
      unavailable: "Poslužitelj nije dostupan. Podaci s poslužitelja možda nisu dostupni.",
      mock: "Preglednik koristi lokalnu lažnu uslugu.",
    },
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
  account: { LABEL: "Račun", OPEN_MENU: "Otvori izbornik računa", SIGN_OUT: "Odjava" },
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
    offlineReady:
      "Aplikacijska ljuska spremna je za ograničeni izvanmrežni rad. Podaci s poslužitelja i dalje zahtijevaju vezu.",
    registrationUnavailable:
      "Izvanmrežna podrška nije omogućena. Osvježite stranicu ili se obratite podršci ako se ovo ponovi.",
    update: "Ažuriraj",
    updateReady: "Nova verzija je spremna.",
    updateUnavailable: "Ažuriranje nije primijenjeno. Nastavite raditi pa osvježite stranicu kada to bude sigurno.",
  },
  unsavedChanges: {
    title: "Odbaciti nespremljene promjene?",
    message: "Promjene će se izgubiti ako zatvorite ovaj obrazac.",
    keepEditing: "Nastavi uređivati",
    discard: "Odbaci promjene",
  },
} satisfies WidenLeaves<typeof en>;

export default hr;
