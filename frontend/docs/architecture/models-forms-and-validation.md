# Models, forms, and validation

## Models and validated schemas

Every model and submodel owns one PascalCase file with four mandatory exports:

```ts
export const Item = z.object({/* structural schema */});
export type Item = z.infer<typeof Item>;
export function getDefaultItem(): Item {
  /* fresh defaults */
}
export const buildValidatedItemSchema: ValidatedSchemaFactory<Item> = t =>
  Item.extend({
    name: Item.shape.name.trim().min(1, t("validation.name.required")),
  });
```

The structural schema is the canonical frontend representation and parses data received from the backend. Defaults are functions, never module-load constants. A validated schema reuses `Model.shape.field`; it must not repeat structural constructors such as `z.string()` or `z.number()`.

Forms edit the canonical model directly. Do not create parallel `*FormValue`, `Create*Request`, or `Update*Request` types. Hidden server fields receive safe defaults until the backend returns canonical values. API mappers own the outgoing payload shape and return `unknown`; incoming responses are always parsed.

Typed object helpers such as `withId` and `omitKeys` preserve exact return types. Every API mapper has focused unit tests.

Validated-schema factories are pure. They receive translations and every runtime validation input explicitly; they do not call hooks, read React context, or read mutable global state. A contextual factory declares its feature-specific context:

```ts
export type ItemFormValidationContext = Readonly<{
  nameMinimumLength: number;
}>;

export type ItemValidatedSchemaContext = ItemFormValidationContext &
  Readonly<{
    mode: AppFormMode;
  }>;

export const buildValidatedItemSchema: ValidatedSchemaFactory<Item, "item", ItemValidatedSchemaContext> = (
  t,
  context,
) => {
  if (context.mode === AppFormMode.enum.READ) return Item as z.ZodType<Item, Item>;
  return Item.extend({
    name: Item.shape.name
      .trim()
      .min(context.nameMinimumLength, t("validation.name.min", { minimum: context.nameMinimumLength })),
  }) as z.ZodType<Item, Item>;
};
```

Context is readonly plain data: primitives, enums, IDs, immutable snapshots, and explicit version values. Loading conditions are represented explicitly, such as `permissions: null`. Services, query results, hooks, stores, and mutable references do not belong in schema context. Add a Zod schema for context only when it crosses an untrusted boundary.

## Application form modes

All entity forms share the application-wide Zod enum from `app/ui/forms/models/AppFormMode.ts`:

```ts
export const AppFormMode = z.enum(["CREATE", "UPDATE", "READ"]);
export type AppFormMode = z.infer<typeof AppFormMode>;
```

Compare modes through `AppFormMode.enum.CREATE`, `.UPDATE`, and `.READ`, not raw strings.

## Entity form fields

Entity field components use the `EntityFormFields` suffix and expose exactly two required props:

```ts
export type ItemFormFieldsProps = {
  form: ItemFormApi;
  mode: AppFormMode;
};
```

They do not accept `readOnly`, `disabled`, `pending`, `sx`, `className`, translations, submission callbacks, or action props. Feature-specific values live in form state or are obtained through feature hooks.

The host owns the semantic form boundary and maps READ mode to Vireo policy:

```tsx
<form.Form readOnly={mode === AppFormMode.enum.READ} readOnlyEmptyValue={t("form.notProvided")}>
  <ItemFormFields form={form} mode={mode} />
  {/* Existing consumer-owned actions */}
</form.Form>
```

`EntityFormFields` owns:

- the complete `VireoContainerGrid` layout;
- feature option-loading hooks;
- legitimate mode-dependent field visibility; and
- domain-specific `renderReadOnlyValue` formatting when Vireo defaults are insufficient.

It renders fields only. It does not invent a heading, description, or semantic section. A host that genuinely needs that content owns it outside `EntityFormFields`. It never renders `form.Form`, actions, submission controls, or manual validation errors. Bound Vireo fields own helper and validation-error rendering.

Use `VireoLabelBox`, give the bound field `label={null}`, and supply its accessible name through `slotProps`. Required markers appear only in editable modes, and autofocus is limited to CREATE:

```tsx
<VireoLabelBox label={t("fields.name")} required={mode !== AppFormMode.enum.READ}>
  <field.TextField
    label={null}
    autoFocus={mode === AppFormMode.enum.CREATE}
    slotProps={{ htmlInput: { "aria-label": t("fields.name") } }}
  />
</VireoLabelBox>
```

CREATE and UPDATE may render different fields. Their schemas, defaults, and form hooks must implement the corresponding validation behavior. READ renders display values through Vireo's inherited read-only policy.

## Feature form hooks

Every feature exports a named API type and an options-based hook:

```ts
export type UseItemFormOptions = {
  initialValue?: Item;
  mode: AppFormMode;
  onSubmit: (value: Item) => Promise<void>;
  validationContext: ItemFormValidationContext;
};

export type ItemFormApi = ReturnType<typeof useItemForm>;
```

The hook owns defaults, entity-to-form mapping, translated schema construction, explicit primitive memoization dependencies, submission, and context-change revalidation. Callers do not memoize validation-context objects.

```tsx
const schema = React.useMemo(
  () => buildValidatedItemSchema(t, { mode, nameMinimumLength: validationContext.nameMinimumLength }),
  [mode, t, validationContext.nameMinimumLength],
);

const form = useVireoForm({
  defaultValues,
  validationLogic: revalidateLogic(),
  validators: { onDynamic: schema },
  onSubmit: ({ value }) => onSubmit(value),
});

React.useEffect(() => {
  // Preserve submit-first UX: context changes remain silent until the user
  // has made a real submission attempt.
  if (form.state.submissionAttempts === 0) return;
  void form.validate("submit");
}, [form, schema]);
```

Before the first submit, mount, blur, and validation-context changes do not expose validation errors. After the first submit, changing validation context revalidates without remounting or resetting values, dirty state, or touched state.

## Actions

Actions are intentionally outside the `EntityFormFields` standard. `form.Actions` remains Vireo's layout container, `form.SubmitButton` retains its context-aware behavior, and consumers compose cancel and submit actions as they do today. There is no whole-form Reset action.

## Required coverage

Every fields component covers CREATE, UPDATE, and READ, including headings, required markers, autofocus, editable controls versus display values, explicit empty values, preservation of `0` and `false` where applicable, and mode-specific fields.

Every contextual schema factory directly covers meaningful mode/context combinations. Every context-sensitive form hook proves both submit-first validation and post-submit context revalidation while preserving values, dirty state, and touched state.
