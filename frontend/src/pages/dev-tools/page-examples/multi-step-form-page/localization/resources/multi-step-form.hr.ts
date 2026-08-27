import type { WidenLeaves } from "@vireocodedev/localization";
import type en from "./multi-step-form.en";
const hr = {
  header: {
    back: "Natrag na razvojne alate",
    title: "Višekoračni obrazac",
    description: "Validirani čarobnjak podržan jednim obrascem i Starterovom tipiziranom višekoračnom navigacijom.",
  },
  aria: "Postavljanje radnog prostora",
  success: "Radni prostor „{{name}}” uspješno je poslan.",
  steps: { details: "Detalji radnog prostora", preferences: "Postavke", review: "Pregled" },
  sections: {
    details: {
      title: "Detalji radnog prostora",
      description: "Definirajte radni prostor i njegovog početnog vlasnika.",
    },
    preferences: {
      title: "Postavke radnog prostora",
      description: "Odaberite početne postavke pristupa i komunikacije.",
    },
    review: {
      title: "Pregled radnog prostora",
      description: "Potvrdite cjelovitu postavu prije stvaranja radnog prostora.",
    },
  },
  fields: {
    workspaceName: { label: "Naziv radnog prostora", placeholder: "Radni prostor Northstar" },
    ownerEmail: { label: "E-pošta vlasnika", placeholder: "vlasnik@example.com" },
    workspaceType: { label: "Vrsta radnog prostora", placeholder: "Odaberite vrstu radnog prostora" },
    teamSize: { label: "Početna veličina tima" },
    visibility: { label: "Vidljivost" },
    weeklyDigest: "Šalji vlasniku tjedni sažetak aktivnosti",
    notes: {
      label: "Napomene postavljanja",
      placeholder: "Dodajte kontekst koji tim treba vidjeti pri pridruživanju.",
    },
    confirmed: "Pregledao sam ove detalje radnog prostora i oni su točni.",
  },
  workspaceTypes: { PRODUCT: "Proizvodni tim", AGENCY: "Agencija", INTERNAL: "Interne operacije" },
  visibility: { PRIVATE: "Privatno", ORGANIZATION: "Organizacija" },
  review: {
    workspace: "Radni prostor",
    owner: "Vlasnik",
    type: "Vrsta",
    teamSize: "Veličina tima",
    people: "{{count}} osoba",
    visibility: "Vidljivost",
    weeklyDigest: "Tjedni sažetak",
    reviewStatus: "Status pregleda",
    notProvided: "Nije uneseno",
    notSelected: "Nije odabrano",
    enabled: "Omogućeno",
    disabled: "Onemogućeno",
    confirmed: "Potvrđeno",
    notConfirmed: "Nije potvrđeno",
  },
  validation: {
    workspaceName: "Unesite najmanje tri znaka.",
    ownerEmail: "Unesite valjanu e-poštu vlasnika.",
    workspaceType: "Odaberite vrstu radnog prostora.",
    wholeNumber: "Upotrijebite cijeli broj.",
    teamSize: "Dodajte najmanje jednog člana tima.",
    notes: "Napomene moraju imati najviše 240 znakova.",
  },
  actions: { submit: "Stvori radni prostor" },
} satisfies WidenLeaves<typeof en>;
export default hr;
