import type { WidenLeaves } from "@vireocodedev/starter-localization";
import type en from "./entity-query-filters-example.en";
const hr = {
  header: {
    back: "Natrag na razvojne alate",
    title: "Filtri upita entiteta",
    description: "Metapodaci definiraju što se može filtrirati, a aplikacija određuje kako se uređivač prikazuje.",
    edit: "Uredi filtre",
  },
  content: {
    title: "Pohranjeni dokument filtra",
    description: "Radne izmjene ostaju izdvojene do primjene. Čišćenje odmah pohranjuje prazan dokument filtra.",
    filters: "Filtri",
    overlayTitle: "Filtriraj primjerne stavke",
  },
} satisfies WidenLeaves<typeof en>;
export default hr;
