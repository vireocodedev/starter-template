import type { WidenLeaves } from "@vireocodedev/starter-localization";
import type itemEn from "./item.en";

const itemHr = {
  title: "Stavka",
  fields: {
    name: "Naziv",
    description: "Opis",
    quantity: "Količina",
    status: "Status",
  },
  status: {
    DRAFT: "Skica",
    ACTIVE: "Aktivno",
    ARCHIVED: "Arhivirano",
  },
  validation: {
    name: { min: "Unesite najmanje dva znaka." },
    description: { max: "Upotrijebite najviše 2.000 znakova." },
    quantity: {
      integer: "Upotrijebite cijeli broj.",
      nonnegative: "Količina ne može biti negativna.",
    },
  },
  form: {
    section: "Detalji stavke",
    description: "Polja u nastavku sprema Spring Boot API.",
    create: "Kreiraj stavku",
    update: "Spremi promjene",
    createTitle: "Kreiraj stavku",
    updateTitle: "Uredi stavku",
    close: "Zatvori obrazac stavke",
    namePlaceholder: "Revizija sustava dizajna",
    descriptionPlaceholder: "Što je potrebno napraviti?",
  },
  table: {
    item: "Stavka",
    noDescription: "Nema opisa",
    actions: "Radnje",
    history: "Povijest stavke",
    historyAria: "Povijest",
    edit: "Uredi stavku",
    editAria: "Uredi",
    delete: "Izbriši stavku",
    deleteAria: "Izbriši",
  },
  history: {
    title: "Povijest · {{name}}",
    close: "Zatvori povijest stavke",
    loading: "Učitavanje povijesti stavke",
    loadError: "Povijest stavke nije se mogla učitati.",
    empty: "Za ovu stavku nije zabilježena povijest.",
    description: "Zabilježene promjene prikazane su kronološkim redoslijedom.",
    entryAria: "Zapis povijesti za {{name}}",
    systemActor: "Sustav",
  },
  messages: {
    created: "Stavka je kreirana",
    createFailed: "Stavku nije moguće kreirati.",
    updated: "Stavka je ažurirana",
    updateFailed: "Stavku nije moguće ažurirati.",
    deleted: "Stavka je izbrisana",
    deleteFailed: "Stavku nije moguće izbrisati.",
  },
} satisfies WidenLeaves<typeof itemEn>;

export default itemHr;
