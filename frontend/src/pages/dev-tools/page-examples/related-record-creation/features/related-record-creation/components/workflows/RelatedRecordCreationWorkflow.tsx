import React from "react";
import { AddRounded } from "@mui/icons-material";
import { Alert, Box, Button, Divider, Paper, Typography, type PaperProps } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { VireoLabelBox, VireoSlidingScreenStack, useUnsavedChangesRequestDiscard } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { useTranslation } from "react-i18next";
import { RELATED_RECORD_CREATION_TRANSLATION_NAMESPACE } from "@/app/app.localization";
import { APP_PAGES } from "@/app/app.pages";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { BuyerKind, buildValidatedBuyerSchema, getDefaultBuyer, type Buyer } from "../../models/Buyer";
import { buildValidatedInvoiceSchema, getDefaultInvoice, type Invoice } from "../../models/Invoice";

type WorkflowScreen = "invoice" | "create-buyer";

type BuyerCreateCommand = {
  label: string;
  onSelect: () => void;
};

type BuyerAutocompletePaperProps = PaperProps & { ownerState?: unknown };

const BuyerCreateCommandContext = React.createContext<BuyerCreateCommand | null>(null);

const BuyerAutocompletePaper = React.forwardRef<HTMLDivElement, BuyerAutocompletePaperProps>(
  function BuyerAutocompletePaper({ children, ownerState: _ownerState, ...props }, forwardedRef) {
    void _ownerState;
    const command = React.useContext(BuyerCreateCommandContext);

    return (
      <Paper {...props} ref={forwardedRef}>
        {command && (
          <>
            <Box sx={{ p: 1 }}>
              <Button
                fullWidth
                startIcon={<AddRounded />}
                type="button"
                onMouseDown={event => event.preventDefault()}
                onClick={command.onSelect}
                sx={{ justifyContent: "flex-start" }}
              >
                {command.label}
              </Button>
            </Box>
            <Divider />
          </>
        )}
        {children}
      </Paper>
    );
  },
);

const initialBuyers: Buyer[] = [
  { id: 101, name: "Northstar Analytics", email: "accounts@northstar.example", city: "Zagreb", kind: "COMPANY" },
  { id: 102, name: "Harbor Systems", email: "billing@harbor.example", city: "Split", kind: "COMPANY" },
  { id: 103, name: "Juniper Labs", email: "finance@juniper.example", city: "Rijeka", kind: "COMPANY" },
];

const INVOICE_SCOPE_ID = "related-record-creation/invoice";
const BUYER_SCOPE_ID = "related-record-creation/buyer";

export function RelatedRecordCreationWorkflow() {
  const { t } = useTranslation(RELATED_RECORD_CREATION_TRANSLATION_NAMESPACE);
  const [screen, setScreen] = React.useState<WorkflowScreen>("invoice");
  const [buyers, setBuyers] = React.useState<Buyer[]>(initialBuyers);
  const [buyerResults, setBuyerResults] = React.useState<Buyer[]>(initialBuyers);
  const [buyerInputValue, setBuyerInputValue] = React.useState("");
  const [buyerSearchIsUserInput, setBuyerSearchIsUserInput] = React.useState(false);
  const [buyerLoading, setBuyerLoading] = React.useState(false);
  const [selectedBuyer, setSelectedBuyer] = React.useState<Buyer | null>(null);
  const [createdBuyer, setCreatedBuyer] = React.useState<Buyer | null>(null);
  const [submittedInvoice, setSubmittedInvoice] = React.useState<Invoice | null>(null);
  const nextBuyerId = React.useRef(104);
  const invoiceDefaults = React.useMemo(getDefaultInvoice, []);
  const buyerDefaults = React.useMemo(getDefaultBuyer, []);
  const buyerKinds = React.useMemo(
    () => BuyerKind.options.map(value => ({ value, label: t(`buyer.kinds.${value}`) })),
    [t],
  );

  const invoiceForm = useVireoForm({
    defaultValues: invoiceDefaults,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: buildValidatedInvoiceSchema(t) },
    onSubmit: async ({ value }) => {
      await new Promise(resolve => window.setTimeout(resolve, 350));
      setSubmittedInvoice(value);
    },
  });

  const buyerForm = useVireoForm({
    defaultValues: buyerDefaults,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: buildValidatedBuyerSchema(t) },
    onSubmit: async ({ value }) => {
      await new Promise(resolve => window.setTimeout(resolve, 350));
      setCreatedBuyer({
        ...value,
        id: nextBuyerId.current++,
        name: value.name.trim(),
        email: value.email.trim(),
      });
    },
  });

  React.useEffect(() => {
    setBuyerLoading(true);
    const normalizedSearch = buyerInputValue.trim().toLocaleLowerCase();
    const timer = window.setTimeout(() => {
      setBuyerResults(
        buyers.filter(buyer =>
          [buyer.name, buyer.email].some(value => value.toLocaleLowerCase().includes(normalizedSearch)),
        ),
      );
      setBuyerLoading(false);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [buyerInputValue, buyers]);

  React.useEffect(() => {
    if (!createdBuyer) return;

    setBuyers(previous => [createdBuyer, ...previous]);
    setSelectedBuyer(createdBuyer);
    setBuyerInputValue(createdBuyer.name);
    setBuyerSearchIsUserInput(false);
    invoiceForm.setFieldValue("buyerId", createdBuyer.id);
    buyerForm.reset(buyerDefaults);
    setScreen("invoice");
    setCreatedBuyer(null);
  }, [buyerDefaults, buyerForm, createdBuyer, invoiceForm]);

  React.useEffect(() => {
    if (!submittedInvoice) return;
    invoiceForm.reset(submittedInvoice);
  }, [invoiceForm, submittedInvoice]);

  const returnToInvoice = React.useCallback(() => {
    buyerForm.reset(buyerDefaults);
    setBuyerInputValue(selectedBuyer?.name ?? "");
    setBuyerSearchIsUserInput(false);
    setScreen("invoice");
  }, [buyerDefaults, buyerForm, selectedBuyer]);

  const requestReturnToInvoice = useUnsavedChangesRequestDiscard(returnToInvoice, {
    scopeId: BUYER_SCOPE_ID,
  });

  const normalizedCreateText = buyerSearchIsUserInput ? buyerInputValue.trim() : "";
  const canCreateBuyer =
    normalizedCreateText.length > 0 &&
    !buyers.some(buyer => buyer.name.toLocaleLowerCase() === normalizedCreateText.toLocaleLowerCase());

  const openBuyerCreation = React.useCallback(() => {
    if (!normalizedCreateText) return;
    buyerForm.reset(buyerDefaults);
    buyerForm.setFieldValue("name", normalizedCreateText);
    setScreen("create-buyer");
  }, [buyerDefaults, buyerForm, normalizedCreateText]);

  const buyerCreateCommand = React.useMemo<BuyerCreateCommand | null>(
    () =>
      canCreateBuyer
        ? { label: t("createOption", { searchText: normalizedCreateText }), onSelect: openBuyerCreation }
        : null,
    [canCreateBuyer, normalizedCreateText, openBuyerCreation, t],
  );

  const resetInvoiceSelection = React.useCallback(() => {
    setSelectedBuyer(null);
    setBuyerInputValue("");
    setBuyerSearchIsUserInput(false);
    setSubmittedInvoice(null);
  }, []);

  const screens = [
    {
      id: "invoice",
      children: (
        <Box>
          <invoiceForm.Form layoutWidth="wide" unsavedChangesGuard unsavedChangesScopeId={INVOICE_SCOPE_ID}>
            {submittedInvoice && (
              <Alert severity="success">
                {t("invoice.success", {
                  invoiceNumber: submittedInvoice.invoiceNumber,
                  buyer: selectedBuyer?.name ?? t("invoice.selectedBuyer"),
                })}
              </Alert>
            )}

            <invoiceForm.Section
              label={t("invoice.section.title")}
              description={t("invoice.section.description")}
              maxColumns={2}
              variant="plain"
            >
              <invoiceForm.Field name="invoiceNumber">
                {field => (
                  <VireoLabelBox label={t("invoice.fields.number")} required>
                    <field.TextField
                      label={null}
                      placeholder="INV-2026-0042"
                      slotProps={{ htmlInput: { "aria-label": t("invoice.fields.number") } }}
                    />
                  </VireoLabelBox>
                )}
              </invoiceForm.Field>

              <invoiceForm.Field name="issueDate">
                {field => (
                  <VireoLabelBox label={t("invoice.fields.issueDate")} required>
                    <field.TemporalField
                      mode="date"
                      slotProps={{ htmlInput: { "aria-label": t("invoice.fields.issueDate") } }}
                    />
                  </VireoLabelBox>
                )}
              </invoiceForm.Field>

              <invoiceForm.SectionItem span="full">
                <invoiceForm.Field name="buyerId">
                  {field => (
                    <VireoLabelBox label={t("invoice.fields.buyer")} required>
                      <BuyerCreateCommandContext.Provider value={buyerCreateCommand}>
                        <field.AutocompleteField
                          label={null}
                          filterMode="server"
                          options={buyerResults}
                          selectedOption={selectedBuyer ?? undefined}
                          getOptionValue={buyer => buyer.id}
                          getOptionLabel={buyer => buyer.name}
                          inputValue={buyerInputValue}
                          loading={buyerLoading}
                          loadingText={t("invoice.searching")}
                          noOptionsText={t("invoice.noBuyers")}
                          placeholder={t("invoice.placeholders.buyer")}
                          onInputValueChange={(value, reason) => {
                            setBuyerInputValue(value);
                            setBuyerSearchIsUserInput(reason === "input");
                          }}
                          onValueChange={(_value, details) => {
                            if (details.reason === "selectOption") {
                              setSelectedBuyer(details.option);
                              setBuyerInputValue(details.option.name);
                              setBuyerSearchIsUserInput(false);
                              return;
                            }
                            setSelectedBuyer(null);
                            setBuyerInputValue("");
                            setBuyerSearchIsUserInput(false);
                          }}
                          renderOption={buyer => (
                            <Box sx={{ minWidth: 0 }}>
                              <Typography noWrap>{buyer.name}</Typography>
                              <Typography color="text.secondary" noWrap variant="body2">
                                {buyer.email}
                              </Typography>
                            </Box>
                          )}
                          slots={{ paper: BuyerAutocompletePaper }}
                          slotProps={{ htmlInput: { "aria-label": t("invoice.fields.buyer") } }}
                        />
                      </BuyerCreateCommandContext.Provider>
                    </VireoLabelBox>
                  )}
                </invoiceForm.Field>
              </invoiceForm.SectionItem>

              <invoiceForm.Field name="total">
                {field => (
                  <VireoLabelBox label={t("invoice.fields.total")} required>
                    <field.NumberField label={null} min={0.01} />
                  </VireoLabelBox>
                )}
              </invoiceForm.Field>

              <invoiceForm.SectionItem span="full">
                <invoiceForm.Field name="note">
                  {field => (
                    <VireoLabelBox label={t("invoice.fields.note")}>
                      <field.TextField
                        label={null}
                        multiline
                        minRows={4}
                        placeholder={t("invoice.placeholders.note")}
                        slotProps={{ htmlInput: { "aria-label": t("invoice.fields.note") } }}
                      />
                    </VireoLabelBox>
                  )}
                </invoiceForm.Field>
              </invoiceForm.SectionItem>

              <invoiceForm.SectionItem span="full">
                <invoiceForm.Actions>
                  <Button
                    type="button"
                    onClick={() => {
                      invoiceForm.reset();
                      resetInvoiceSelection();
                    }}
                  >
                    {t("invoice.actions.cancel")}
                  </Button>
                  <invoiceForm.SubmitButton variant="contained">{t("invoice.actions.save")}</invoiceForm.SubmitButton>
                </invoiceForm.Actions>
              </invoiceForm.SectionItem>
            </invoiceForm.Section>
          </invoiceForm.Form>
        </Box>
      ),
    },
    {
      id: "create-buyer",
      children: (
        <Box>
          <buyerForm.Form layoutWidth="wide" unsavedChangesGuard unsavedChangesScopeId={BUYER_SCOPE_ID}>
            <buyerForm.Section
              label={t("buyer.section.title")}
              description={t("buyer.section.description")}
              maxColumns={2}
              variant="plain"
            >
              <buyerForm.Field name="name">
                {field => (
                  <VireoLabelBox label={t("buyer.fields.name")} required>
                    <field.TextField
                      label={null}
                      autoFocus
                      placeholder="Northstar Analytics"
                      slotProps={{ htmlInput: { "aria-label": t("buyer.fields.name") } }}
                    />
                  </VireoLabelBox>
                )}
              </buyerForm.Field>

              <buyerForm.Field name="kind">
                {field => (
                  <VireoLabelBox label={t("buyer.fields.kind")} required>
                    <field.SelectField
                      label={null}
                      options={buyerKinds}
                      getOptionValue={option => option.value}
                      renderOption={option => option.label}
                      slotProps={{ select: { SelectDisplayProps: { "aria-label": t("buyer.fields.kind") } } }}
                    />
                  </VireoLabelBox>
                )}
              </buyerForm.Field>

              <buyerForm.Field name="email">
                {field => (
                  <VireoLabelBox label={t("buyer.fields.email")} required>
                    <field.TextField
                      label={null}
                      placeholder="billing@example.com"
                      type="email"
                      slotProps={{
                        htmlInput: { "aria-label": t("buyer.fields.email"), autoComplete: "email" },
                      }}
                    />
                  </VireoLabelBox>
                )}
              </buyerForm.Field>

              <buyerForm.Field name="city">
                {field => (
                  <VireoLabelBox label={t("buyer.fields.city")} required>
                    <field.TextField
                      label={null}
                      placeholder="Zagreb"
                      slotProps={{ htmlInput: { "aria-label": t("buyer.fields.city") } }}
                    />
                  </VireoLabelBox>
                )}
              </buyerForm.Field>

              <buyerForm.SectionItem span="full">
                <buyerForm.Actions>
                  <Button type="button" onClick={requestReturnToInvoice}>
                    {t("buyer.actions.cancel")}
                  </Button>
                  <buyerForm.SubmitButton variant="contained">{t("buyer.actions.create")}</buyerForm.SubmitButton>
                </buyerForm.Actions>
              </buyerForm.SectionItem>
            </buyerForm.Section>
          </buyerForm.Form>
        </Box>
      ),
    },
  ];

  return (
    <AppPageLayout
      header={
        <AppPageHeader
          backLabel={screen === "invoice" ? t("header.backDevTools") : t("header.backInvoice")}
          backTo={screen === "invoice" ? APP_PAGES.devTools : undefined}
          onBack={screen === "create-buyer" ? requestReturnToInvoice : undefined}
          title={screen === "invoice" ? t("header.invoiceTitle") : t("header.buyerTitle")}
          description={screen === "invoice" ? t("header.invoiceDescription") : t("header.buyerDescription")}
        />
      }
    >
      <VireoSlidingScreenStack
        activeScreen={screen}
        screens={screens}
        sx={{ minHeight: { xs: "calc(100dvh - 65px)", sm: 680 } }}
      />
    </AppPageLayout>
  );
}
