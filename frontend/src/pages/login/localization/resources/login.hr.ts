import type { WidenLeaves } from "@vireocodedev/localization";
import type en from "./login.en";
const hr = {
  title: "Dobro došli natrag",
  description: "Prijavite se u Vireo Starter radni prostor.",
  access: "Siguran pristup radnom prostoru",
  fields: { username: "Korisničko ime", password: "Lozinka" },
  validation: { username: "Unesite korisničko ime.", password: "Unesite lozinku." },
  invalidCredentials: "Korisničko ime ili lozinka nisu ispravni.",
  submit: "Prijava",
  developmentCredentials: "Razvojni podaci za prijavu: {{username}} / {{password}}",
} satisfies WidenLeaves<typeof en>;
export default hr;
