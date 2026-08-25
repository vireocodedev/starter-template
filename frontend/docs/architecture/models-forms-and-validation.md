# Models, forms, and validation

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

Feature form hooks own initialization, translated validation, mutations, and dirty-guard integration. Form components are deterministic presentation. There is no whole-form Reset action. Cancel and Submit share one action row and each consumes half of the available width; additional actions belong in a consumer-owned icon overflow menu.
