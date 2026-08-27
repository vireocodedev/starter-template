import type { WidenLeaves } from "@vireocodedev/localization";
import type en from "./settings.en";
const hr = {
  header: { title: "Postavke", description: "Prilagodite ponašanje i prikaz podataka u ovom radnom prostoru." },
  search: { placeholder: "Pretraži postavke", empty: "Nijedna postavka ne odgovara upitu „{{search}}”." },
  sections: { appearance: "Izgled", layout: "Raspored", defaults: "Zadane vrijednosti" },
  language: {
    title: "Jezik",
    description: "Odaberite jezik i regionalno oblikovanje koje se koristi u cijeloj aplikaciji.",
    ENGLISH: "Engleski",
    CROATIAN: "Hrvatski",
  },
  theme: { title: "Tamni način", description: "Koristite tamnu paletu radnog prostora u cijeloj aplikaciji." },
  tableDensity: {
    title: "Gustoća tablice",
    description: "Odaberite količinu okomitog prostora koju koriste responzivne tablice.",
    COMPACT: "Zbijeno",
    COMFORTABLE: "Udobno",
  },
  pageWidth: {
    title: "Širina sadržaja stranice",
    description: "Ograničite sadržaj radi čitljivosti ili mu dopustite sav dostupan prostor.",
    MEDIUM: "Srednje",
    LARGE: "Veliko",
    EXTRA_LARGE: "Vrlo veliko",
    FULL: "Bez maksimuma",
  },
  desktopSurface: {
    title: "Površina obrasca na računalu",
    description: "Odaberite kako se responzivni obrasci prikazuju na računalu.",
    DIALOG: "Dijalog",
    OVERLAY: "Bočni panel preko sadržaja",
    DOCKED: "Usidreni bočni panel",
  },
  resizablePanels: {
    title: "Promjenjiva širina panela",
    description: "Dopustite promjenu širine bočnih panela pokazivačem.",
  },
  lockNavigation: {
    title: "Zaključaj navigaciju",
    description: "Spriječite promjenu širine uz očuvanje trenutačnog proširenog ili sažetog načina.",
  },
  reset: {
    title: "Vrati postavke aplikacije",
    description: "Vratite sve lokalne postavke prikaza na izvorne vrijednosti.",
    action: "Vrati postavke",
  },
} satisfies WidenLeaves<typeof en>;
export default hr;
