import type { WidenLeaves } from "@vireocodedev/localization";
import type en from "./basic-form.en";
const hr = {
  header: {
    back: "Natrag na razvojne alate",
    title: "Osnovni obrazac",
    description: "Cjelovit responzivan obrazac sa zajedničkim rasporedom, validacijom i ponašanjem polja.",
  },
  success: "Projekt „{{name}}” prošao je validaciju i poslan je.",
  sections: {
    identity: { title: "Identitet projekta", description: "Definirajte projekt i tim odgovoran za isporuku." },
    delivery: { title: "Postavke isporuke", description: "Odaberite gdje se projekt izvodi i kako tim surađuje." },
  },
  fields: {
    projectName: { label: "Naziv projekta", placeholder: "Osvježenje korisničkog portala" },
    ownerEmail: { label: "E-pošta vlasnika", placeholder: "vlasnik@example.com" },
    department: { label: "Odjel", placeholder: "Odaberite odjel" },
    teamSize: { label: "Veličina tima" },
    environments: { label: "Ciljna okruženja", placeholder: "Odaberite okruženja" },
    deliveryModel: { label: "Model isporuke" },
    summary: { label: "Sažetak projekta", placeholder: "Opišite rezultat koji projekt treba isporučiti." },
    acknowledged: "Razumijem da su ovo demonstracijski podaci i da se neće pohraniti.",
  },
  departments: { DESIGN: "Dizajn", ENGINEERING: "Inženjering", OPERATIONS: "Operacije" },
  environments: { DEVELOPMENT: "Razvoj", STAGING: "Testiranje", PRODUCTION: "Produkcija" },
  deliveryModels: { REMOTE: "Udaljeno", HYBRID: "Hibridno", OFFICE: "U uredu" },
  validation: {
    projectName: "Unesite najmanje tri znaka.",
    ownerEmail: "Unesite valjanu adresu e-pošte.",
    department: "Odaberite odjel.",
    environments: "Odaberite najmanje jedno okruženje.",
    wholeNumber: "Upotrijebite cijeli broj.",
    teamSizeMin: "Dodajte najmanje jednog člana tima.",
    teamSizeMax: "Ograničite tim na 20 osoba.",
    summaryMin: "Opišite projekt s najmanje 20 znakova.",
    summaryMax: "Sažetak mora imati najviše 300 znakova.",
    acknowledged: "Potvrdite da se demonstracijski podaci smiju poslati.",
  },
  actions: { cancel: "Odustani", submit: "Stvori projekt" },
} satisfies WidenLeaves<typeof en>;
export default hr;
