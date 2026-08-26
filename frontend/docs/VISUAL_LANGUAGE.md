# Command interface visual language

The application translates the useful parts of polished strategy and survival-game interfaces into a professional PWA. It should feel immediate, information-rich, and operational without resembling a game skin.

## Visual hierarchy

- Amber is the command accent. Reserve it for the current location, the primary action, focus, and the most important active readout.
- Green communicates healthy or completed state, cyan communicates informational capability, orange communicates caution, and red remains destructive.
- Page chrome uses raised surfaces, working content uses base surfaces, and the grid-backed sunken canvas separates the application environment from its active panels.
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

## Consequence-aware actions

Use `VireoActionPreviewButton` when the result, quantity, or permanence of an action deserves explanation before commitment:

```tsx
<VireoActionPreviewButton label="Create item" preview="Adds one record to this workspace" variant="contained" />
```

The preview is an accessible description, not decorative helper text. Keep it short and concrete. Ordinary actions whose labels already describe the full result should remain ordinary buttons.

## Boundaries

- Do not copy game-specific terminology, textures, meters, or ornamental HUD chrome.
- Do not use amber for ordinary body links or passive decoration.
- Do not increase density by reducing touch targets or readable type sizes.
- Do not animate the grid, shadows, or ambient surfaces.
- Reduced-motion, contrast, focus, and semantic status rules remain mandatory.
