import type { WidenLeaves } from "@vireocodedev/starter-localization";
import type en from "./forbidden.en";
const hr = {
  header: { title: "Pristup odbijen", description: "Nemate dopuštenje za pregled ove stranice." },
  title: "Ova stranica nije dostupna vašem računu",
  description: "Obratite se administratoru ako smatrate da biste trebali imati pristup.",
  return: "Povratak na pregled",
} satisfies WidenLeaves<typeof en>;
export default hr;
