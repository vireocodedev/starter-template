import type { WidenLeaves } from "@vireocodedev/starter-localization";
import type en from "./home.en";
const hr = {
  header: {
    title: "Pregled",
    description: "Sažeti pregled produkcijski oblikovanih tijekova rada uključenih u ovaj predložak.",
  },
  version: "Starter 0.1.0 · UI 7.0.0",
  title: "Čista polazna točka za sljedeću Vireo aplikaciju.",
  introduction:
    "Ovaj je repozitorij namjerno malen, ali svaki uključeni tijek rada oblikovan je za produkciju i oslanja se na najnovije Starter biblioteke.",
  status: {
    api: "API je povezan",
    pwa: "PWA je spreman",
    responsive: "Responzivna ljuska",
  },
  module: "Modul {{number}}",
  operational: "Operativno",
  cards: {
    entity: {
      title: "Cjelovit tijek entiteta",
      body: "Pretražujte, stvarajte, uređujte i brišite stvarni Spring Data entitet.",
    },
    contracts: {
      title: "Aktualni Vireo ugovori",
      body: "Responzivne tablice, preklopi i TanStack/Zod obrasci dolaze iz Startera.",
    },
    pwa: {
      title: "PWA osnova",
      body: "Instalabilna ljuska s izričitim mrežnim ponašanjem API-ja i podrškom za ažuriranja.",
    },
  },
} satisfies WidenLeaves<typeof en>;
export default hr;
