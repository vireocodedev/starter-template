import type { WidenLeaves } from "@vireocodedev/localization";
import type en from "./home.en";
const hr = {
  header: {
    title: "Pregled",
    description: "Operativni prikaz uživo za tijek zaliha uključen u ovaj predložak.",
  },
  title: "Održavajte terenske operacije opskrbljenima i u pokretu.",
  introduction:
    "Pratite aktivne zalihe, uočite stavke s malom količinom i odmah prijeđite u cjelovit tijek stavki. Svaki podatak dolazi iz API-ja uživo.",
  status: {
    live: "Snimka uživo",
    api: "API je povezan",
    offline: "Ljuska spremna za rad izvan mreže",
  },
  actions: { openInventory: "Otvori zalihe", retry: "Pokušaj ponovno" },
  metrics: {
    units: "Jedinica na stanju",
    active: "Aktivnih stavki",
    attention: "Za pregled",
    draft: "Nacrta planova",
  },
  health: {
    title: "Stanje zaliha",
    description: "Raspodjela statusa kroz {{count}} stavki zaliha.",
    active: "Aktivno",
    draft: "Nacrt",
    archived: "Arhivirano",
  },
  attention: {
    title: "Operativni red",
    description: "Stavke s malom količinom i nacrti za sljedeći pregled.",
    units: "{{count}} jedinica",
    clear: "Nijedna stavka zaliha ne zahtijeva pažnju.",
    emptyInventory: "Još nema zaliha. Otvorite zalihe i stvorite prvu stavku.",
  },
  error: "Snimku zaliha uživo nije bilo moguće učitati. Ostatak aplikacije i dalje je dostupan.",
} satisfies WidenLeaves<typeof en>;
export default hr;
