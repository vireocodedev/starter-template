import type { WidenLeaves } from "@vireocodedev/localization";
import type en from "./dev-tools.en";
const hr = {
  header: { title: "Razvojni alati", description: "Istražite usmjerene primjere aplikacijskih obrazaca predloška." },
  sections: { examples: "Primjeri stranica", errors: "Stranice pogrešaka" },
  actions: { openExample: "Otvori primjer", openPage: "Otvori stranicu" },
  empty: "Nema dostupnih primjera stranica.",
  pages: {
    basic: {
      title: "Osnovna stranica",
      description: "Minimalna stranica sa standardnim zaglavljem i rasporedom sadržaja.",
      open: "Otvori osnovnu stranicu",
    },
    form: {
      title: "Osnovni obrazac",
      description: "Responzivan, validiran obrazac koji koristi nekoliko Vireo ugovora polja i rasporeda.",
      open: "Otvori osnovni obrazac",
    },
    filters: {
      title: "Filtri upita entiteta",
      description: "Izgradite tipizirane filtre stavki vođene metapodacima i pregledajte kanonski dokument.",
      open: "Otvori filtre upita entiteta",
    },
    related: {
      title: "Stvaranje povezanog zapisa",
      description: "Stvorite kupca koji nedostaje bez gubitka stanja nadređenog obrasca računa.",
      open: "Otvori stvaranje povezanog zapisa",
    },
    multiStep: {
      title: "Višekoračni obrazac",
      description: "Vodite jedan validirani obrazac kroz detalje, postavke i završni pregled.",
      open: "Otvori višekoračni obrazac",
    },
    advancedFieldForm: {
      title: "Napredni obrazac polja",
      description: "Isprobajte naprednija Vireo polja, prevedenu Zod validaciju i kanonske vrijednosti.",
      open: "Otvori napredni obrazac polja",
    },
    urlState: {
      title: "Stanje sinkronizirano s URL-om",
      description: "Sačuvajte kartice i prikaz u tipiziranim parametrima URL-a.",
      open: "Otvori stanje sinkronizirano s URL-om",
    },
    asyncStates: {
      title: "Stanja asinkronih podataka",
      description: "Pregledajte učitavanje, uspjeh, prazno stanje, ponavljanje i pogreške upita.",
      open: "Otvori asinkrona stanja",
    },
    offlineCrud: {
      title: "Simulacija izvanmrežnog stanja",
      description: "Istražite lokalna optimistična stanja i red čekanja bez tvrdnje o sinkronizaciji s poslužiteljem.",
      open: "Otvori simulaciju izvanmrežnog stanja",
    },
    realtime: {
      title: "Ažuriranja u stvarnom vremenu",
      description: "Validirajte događaje između kartica prije primjene na stanje aplikacije.",
      open: "Otvori ažuriranja u stvarnom vremenu",
    },
    dragDrop: {
      title: "Ploča povlačenja",
      description: "Promijenite redoslijed i premještajte zadatke između tipiziranih zona.",
      open: "Otvori ploču povlačenja",
    },
    canvas: {
      title: "Beskonačno platno",
      description: "Pomičite, zumirajte, vratite i proširite neograničeno radno područje.",
      open: "Otvori beskonačno platno",
    },
    regional: {
      title: "Regionalno oblikovanje",
      description: "Prikažite kanonske brojeve i datume prema aktivnom jeziku aplikacije.",
      open: "Otvori regionalno oblikovanje",
    },
    browser: {
      title: "Mogućnosti preglednika",
      description: "Sigurno koristite povezivost, puni zaslon, odgodu i preuzimanja.",
      open: "Otvori mogućnosti preglednika",
    },
    initialization: {
      title: "Spremnost inicijalizacije",
      description: "Zaštitite potomke dok asinkrone ovisnosti nisu spremne.",
      open: "Otvori spremnost inicijalizacije",
    },
    forbidden: {
      title: "Zabranjeno",
      description: "Pregledajte stranicu prikazanu kada račun nema pristup ruti.",
      open: "Otvori zabranjenu stranicu",
    },
    notFound: {
      title: "Nije pronađeno",
      description: "Pregledajte stranicu za nepoznatu aplikacijsku rutu.",
      open: "Otvori stranicu koja nije pronađena",
    },
  },
} satisfies WidenLeaves<typeof en>;
export default hr;
