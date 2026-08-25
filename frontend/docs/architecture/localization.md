# Localization

Every production-facing string—including validation messages, toasts, tooltips, and accessible labels—is owned by a localization namespace. English is canonical and every supported locale must have exact key parity.

```text
app/app.localization.ts
app/ui/localization/{app-i18n.ts,app-locales.ts,app-localization-provider.tsx,use-app-translation.ts,resources/}
features/item/localization/{use-item-translation.ts,resources/}
pages/home/localization/{use-home-translation.ts,resources/}
```

`app.localization.ts` explicitly registers every namespace. App navigation and global shell copy use the app namespace. Feature copy uses its feature namespace. Unique route copy uses a page namespace. Substantial dev examples own local namespaces.

Keys are semantic and use interpolation and pluralization rather than assembled fragments. Locale identifiers are BCP 47 compatible, English is the fallback, and missing translations must not be hidden behind ad hoc fallback text.

Enum values are uppercase or upper snake case. Translation keys preserve those exact values, making `t(`status.${value}`)` safe. Static option lists derive from the Zod enum's `.options` and a capability service/hook; they are not duplicated by hand.

Dates, numbers, and currencies use localization formatters with explicit locale and, when applicable, timezone. Models and APIs retain canonical values.
