import type { WidenLeaves } from "@vireocodedev/starter-localization";
import type en from "./related-record-creation.en";
const hr = {
  header: {
    backDevTools: "Natrag na razvojne alate",
    backInvoice: "Natrag na račun",
    invoiceTitle: "Stvaranje povezanog zapisa",
    buyerTitle: "Stvori kupca",
    invoiceDescription: "Sačuvajte skicu računa dok stvarate i odabirete kupca koji nedostaje.",
    buyerDescription: "Stvorite povezanog kupca i vratite ga izravno u obrazac računa.",
  },
  createOption: "Stvori „{{searchText}}”",
  invoice: {
    success: "Račun {{invoiceNumber}} spremljen je za {{buyer}}.",
    selectedBuyer: "odabranog kupca",
    section: {
      title: "Detalji računa",
      description: "Potražite postojećeg kupca ili ga stvorite bez napuštanja ove skice računa.",
    },
    fields: {
      number: "Broj računa",
      issueDate: "Datum izdavanja",
      buyer: "Kupac",
      total: "Ukupni iznos računa (€)",
      note: "Napomena",
    },
    placeholders: { buyer: "Pretraži kupce", note: "Neobavezna napomena o plaćanju" },
    searching: "Pretraživanje kupaca…",
    noBuyers: "Nema pronađenih kupaca",
    validation: {
      number: "Unesite broj računa.",
      buyer: "Odaberite ili stvorite kupca.",
      issueDate: "Odaberite datum izdavanja.",
      total: "Unesite iznos veći od nule.",
      note: "Napomena mora imati najviše 300 znakova.",
    },
    actions: { cancel: "Odustani", save: "Spremi račun" },
  },
  buyer: {
    section: {
      title: "Detalji kupca",
      description: "Spremanje vraća kanonskog kupca u sačuvani obrazac računa i odabire njegov ID.",
    },
    fields: { name: "Naziv kupca", kind: "Vrsta kupca", email: "E-pošta za račune", city: "Grad" },
    kinds: { COMPANY: "Tvrtka", INDIVIDUAL: "Fizička osoba" },
    validation: {
      name: "Unesite najmanje dva znaka.",
      email: "Unesite valjanu e-poštu za račune.",
      city: "Unesite grad.",
    },
    actions: { cancel: "Odustani", create: "Stvori kupca" },
  },
} satisfies WidenLeaves<typeof en>;
export default hr;
