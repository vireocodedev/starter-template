# Styling and assets

The application theme is split into `theme.ts`, independent `theme.light.ts` and `theme.dark.ts` schemes, `theme.components.ts`, and optional token/type modules. Light and dark schemes expose the same semantic surface tokens; neither scheme is mechanically derived from the other.

Global component overrides belong in `theme.components.ts` only when every use should inherit them. Capability-specific styling stays beside the component with `sx` or `styled`; a separate kebab-case style module is allowed only for substantial styles. `main.css` is reserved for browser and root-element fundamentals.

Hardcoded palette colors are prohibited in component code. Use semantic theme tokens. Responsive decisions use app breakpoints or container-aware behavior as appropriate and are demonstrated in both compact and wide stories.

Global assets live in `app/ui/assets`, feature assets in that feature, and component-private assets under its `internal/`. Public URLs are reserved for files that must have stable URLs such as the PWA manifest and icons. Asset names are kebab-case and decorative/informative accessibility is explicit.
