import type { WidenLeaves } from "@vireocodedev/localization";
import type en from "./basic-page.en";
const hr = {
  header: {
    back: "Natrag na razvojne alate",
    title: "Osnovna stranica",
    description: "Najmanji cjeloviti primjer stranice unutar aplikacijske ljuske.",
  },
  content: {
    title: "Jednostavan sadržaj stranice",
    description:
      "Ovaj primjer namjerno sadrži samo naslov i popratni tekst. Budući primjeri mogu na istom rasporedu stranice graditi obrasce, tablice, preklapanja i druge aplikacijske obrasce.",
  },
} satisfies WidenLeaves<typeof en>;
export default hr;
