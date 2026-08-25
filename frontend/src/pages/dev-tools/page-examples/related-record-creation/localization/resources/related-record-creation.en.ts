const en = {
  header: {
    backDevTools: "Back to Dev tools",
    backInvoice: "Back to Invoice",
    invoiceTitle: "Related record creation",
    buyerTitle: "Create buyer",
    invoiceDescription: "Preserve an Invoice draft while creating and selecting a missing Buyer.",
    buyerDescription: "Create the related Buyer, then return it directly to the Invoice form.",
  },
  createOption: "Create “{{searchText}}”",
  invoice: {
    success: "Invoice {{invoiceNumber}} was saved for {{buyer}}.",
    selectedBuyer: "the selected buyer",
    section: {
      title: "Invoice details",
      description: "Search for an existing Buyer or create one without leaving this Invoice draft.",
    },
    fields: {
      number: "Invoice number",
      issueDate: "Issue date",
      buyer: "Buyer",
      total: "Invoice total (€)",
      note: "Note",
    },
    placeholders: { buyer: "Search buyers", note: "Optional payment note" },
    searching: "Searching buyers…",
    noBuyers: "No buyers found",
    validation: {
      number: "Enter an invoice number.",
      buyer: "Choose or create a buyer.",
      issueDate: "Choose an issue date.",
      total: "Enter an amount greater than zero.",
      note: "Keep the note under 300 characters.",
    },
    actions: { cancel: "Cancel", save: "Save invoice" },
  },
  buyer: {
    section: {
      title: "Buyer details",
      description: "Saving returns the canonical Buyer to the preserved Invoice form and selects its ID.",
    },
    fields: { name: "Buyer name", kind: "Buyer type", email: "Billing email", city: "City" },
    kinds: { COMPANY: "Company", INDIVIDUAL: "Individual" },
    validation: {
      name: "Enter at least two characters.",
      email: "Enter a valid billing email.",
      city: "Enter a city.",
    },
    actions: { cancel: "Cancel", create: "Create buyer" },
  },
} as const;
export default en;
