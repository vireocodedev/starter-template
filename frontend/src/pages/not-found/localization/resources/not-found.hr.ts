import type { WidenLeaves } from "@vireocodedev/localization";
import type en from "./not-found.en";
const hr = {
  header: { title: "Stranica nije pronađena", description: "Tražena stranica ne postoji ili više nije dostupna." },
  title: "Nismo pronašli ovu stranicu",
  description: "Nijedna ruta aplikacije ne odgovara putanji {{path}}.",
  return: "Povratak na pregled",
} satisfies WidenLeaves<typeof en>;
export default hr;
