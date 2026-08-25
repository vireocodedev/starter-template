const en = {
  header: {
    back: "Back to Dev tools",
    title: "Basic form page",
    description: "A complete responsive form with shared layout, validation, and field behavior.",
  },
  success: "Project “{{name}}” passed validation and was submitted.",
  sections: {
    identity: { title: "Project identity", description: "Define the project and the team responsible for delivery." },
    delivery: { title: "Delivery setup", description: "Choose where the project runs and how the team collaborates." },
  },
  fields: {
    projectName: { label: "Project name", placeholder: "Customer portal refresh" },
    ownerEmail: { label: "Owner email", placeholder: "owner@example.com" },
    department: { label: "Department", placeholder: "Choose a department" },
    teamSize: { label: "Team size" },
    environments: { label: "Target environments", placeholder: "Choose environments" },
    deliveryModel: { label: "Delivery model" },
    summary: { label: "Project summary", placeholder: "Describe the outcome this project should deliver." },
    acknowledged: "I understand that this is demonstration data and will not be persisted.",
  },
  departments: { DESIGN: "Design", ENGINEERING: "Engineering", OPERATIONS: "Operations" },
  environments: { DEVELOPMENT: "Development", STAGING: "Staging", PRODUCTION: "Production" },
  deliveryModels: { REMOTE: "Remote", HYBRID: "Hybrid", OFFICE: "Office" },
  validation: {
    projectName: "Enter at least three characters.",
    ownerEmail: "Enter a valid email address.",
    department: "Choose a department.",
    environments: "Choose at least one environment.",
    wholeNumber: "Use a whole number.",
    teamSizeMin: "Add at least one team member.",
    teamSizeMax: "Limit the team to 20 people.",
    summaryMin: "Describe the project in at least 20 characters.",
    summaryMax: "Keep the summary under 300 characters.",
    acknowledged: "Confirm that the example data may be submitted.",
  },
  actions: { cancel: "Cancel", submit: "Create project" },
} as const;
export default en;
