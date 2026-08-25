export default {
  common: {
    back: "Natrag na razvojne alate",
    cancel: "Odustani",
    save: "Spremi primjer",
  },
  validation: {
    minimum: "Unesite najmanje tri znaka.",
    required: "Odaberite vrijednost.",
    minimumValue: "Unesite vrijednost veću od nule.",
  },
  advancedForm: {
    header: {
      title: "Napredni obrazac polja",
      description: "Produkcijski oblikovan obrazac s naprednijim Vireo poljima.",
    },
    section: {
      title: "Radni nalog",
      description: "Planirajte, dodijelite, klasificirajte i priložite popratni materijal.",
    },
  },
  urlState: {
    header: {
      title: "Stanje sinkronizirano s URL-om",
      description: "Kartice, filtri i prikaz ostaju sačuvani kroz osvježavanje i navigaciju.",
    },
  },
  asyncStates: {
    header: {
      title: "Stanja asinkronih podataka",
      description: "Učitavanje, uspjeh, prazno stanje i pogreška dijele istu granicu upita.",
    },
  },
  offlineCrud: {
    header: { title: "Izvanmrežni CRUD", description: "Optimistični lokalni zapisi i naredbe čekaju povratak veze." },
  },
  realtime: {
    header: {
      title: "Ažuriranja u stvarnom vremenu",
      description: "Validirani događaji između kartica osvježavaju aktivnosti bez ponovnog učitavanja.",
    },
  },
  dragDrop: {
    header: {
      title: "Ploča povlačenja",
      description: "Pristupačno premještanje zadataka pomoću Vireo DnD integracije.",
    },
  },
  canvas: {
    header: {
      title: "Beskonačno radno platno",
      description: "Pomicanje, zumiranje, vraćanje i puni zaslon transformiranog sadržaja.",
    },
  },
  regional: {
    header: {
      title: "Regionalno oblikovanje",
      description: "Kanonske vrijednosti prikazane prema aktivnom jeziku aplikacije.",
    },
  },
  browser: {
    header: {
      title: "Mogućnosti preglednika",
      description: "Povezivost, puni zaslon, odgoda i preuzimanja u jednom primjeru.",
    },
  },
  initialization: {
    header: {
      title: "Spremnost inicijalizacije",
      description: "Sadržaj aplikacije čeka asinkronu inicijalizaciju ovisnosti.",
    },
  },
} as const;
