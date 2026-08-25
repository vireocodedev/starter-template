import type { WidenLeaves } from "@vireocodedev/starter-localization";
import type en from "./login.en";
const hr = {
  title: "Dobro došli natrag",
  description: "Prijavite se u Vireo Starter radni prostor.",
  fields: { username: "Korisničko ime", password: "Lozinka" },
  validation: { username: "Unesite korisničko ime.", password: "Unesite lozinku." },
  invalidCredentials: "Korisničko ime ili lozinka nisu ispravni.",
  submit: "Prijava",
  developmentCredentials: "Razvojni administrator: admin / admin123",
} satisfies WidenLeaves<typeof en>;
export default hr;
