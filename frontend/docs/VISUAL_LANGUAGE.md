# Command interface visual language

The application translates the useful parts of polished strategy and survival-game interfaces into a professional PWA. It should feel immediate, information-rich, and operational without resembling a game skin.

## Visual hierarchy

- Vireo blue is the command accent. Reserve it for the current location, the primary action, focus, and the most important active readout.
- Green communicates healthy or completed state, indigo communicates secondary capability, gold communicates caution, and red remains destructive.
- Page chrome, working content, recessed groups, controls, and overlays use explicit semantic surface roles. Color values may differ by scheme, but the role and nesting order do not change.
- Selected navigation and important panels use a narrow accent rail. Avoid surrounding every region with an accent border.
- Use compact uppercase metadata for status, module identity, and table headings. Use sentence case for actions and content.

## Command surfaces

Command surfaces are compact, bordered, and layered with subtle inset highlights. They may contain dense controls or status readouts, but their primary action and current state must remain obvious.

Use them for:

- page-level search and filtering;
- operational summaries;
- tables and responsive record lists;
- authentication and other focused entry workflows.

Do not add the grid treatment inside cards, forms, dialogs, or table rows. The grid belongs to the page canvas so content remains calm and legible.

## Surface contract

Every background has one semantic role:

- `canvas` is the regular/desktop application environment and owns the grid treatment. It is not a content surface.
- `screen` is the continuous compact/mobile application surface. It replaces the environmental canvas and does not use the grid treatment.
- `content` is the bright, primary working surface for page panels, command bars, table bodies, preference rows, and ordinary cards.
- `recessed` is reserved for subordinate readouts or genuinely inset groups inside a larger content surface; it must not replace the primary working layer.
- `control` is reserved for inputs, selects, text areas, and equivalent field surfaces.
- `elevated` is nested content that visually sits above an ordinary working surface.
- `chrome` is persistent application structure such as page headers and navigation bars.
- `overlay` is the shell of temporary dialogs, drawers, and side panels.

Use these nesting sequences:

```text
desktop page: canvas -> content
mobile page:  screen -> screen sections + true content cards
command bar:   content -> control
table:         content -> elevated header + content rows
preferences:   content -> elevated section header + content rows -> control
inset group:   content -> recessed -> control
overlay:       overlay -> recessed body -> control
```

Regular and compact layouts share data, actions, state, and accessibility semantics, but they do not have to share the same visual composition. A primary desktop panel becomes native compact-screen sections; it must not survive as a card whose margin, radius, and border were merely removed. Compact sections use spacing and standard dividers to express structure. Objects that remain local and movable in meaning—metric tiles, selectable options, previews, and similar units—remain true cards.

Controls must not sit directly on a parent with the same visual role. On desktop, command bars, tables, and preference panels use `content` above the `canvas`. On compact screens, their primary wrappers flatten into `screen` sections while controls retain `control`, preserving contrast without inventing another enclosing card.

Responsive data presentation follows the space required by its columns, not a generic device label. Switch a table to its record-list composition before titles, metadata, or actions start competing for width; a page may therefore use regular spacing while a dense table inside it uses its mobile anatomy.

Structural borders always use the semantic `divider` color unless they intentionally communicate a state such as focus, selection, warning, or error. The global baseline supplies `divider` when a border color is omitted, but border shorthands must still include an explicit semantic color because a shorthand can reset the color to CSS `currentColor`. The architecture check rejects numeric border shorthands; use width/style longhands with `borderColor`, or a color-complete CSS shorthand.

Use the `inset` Card variant only for intentionally recessed readouts such as dashboard metrics. Ordinary and actionable cards remain `outlined` content surfaces. Do not restyle every nested card with a descendant selector.

Interactive boundaries must remain identifiable without relying on placeholder text. Default field outlines target the non-text contrast requirement, focus uses the primary accent, and hover-only treatments are limited to devices that support hover.

## Consequence-aware actions

Use `VireoActionPreviewButton` when the result, quantity, or permanence of an action deserves explanation before commitment:

```tsx
<VireoActionPreviewButton label="Create item" preview="Adds one record to this workspace" variant="contained" />
```

The preview is an accessible description, not decorative helper text. Keep it short and concrete. Ordinary actions whose labels already describe the full result should remain ordinary buttons.

## Boundaries

- Do not copy game-specific terminology, textures, meters, or ornamental HUD chrome.
- Do not use the primary blue as passive decoration when it would compete with actions or current state.
- Do not increase density by reducing touch targets or readable type sizes.
- Do not animate the grid, shadows, or ambient surfaces.
- Reduced-motion, contrast, focus, and semantic status rules remain mandatory.
