## Summary

- User-visible behavior:
- Contract or architecture impact:

## Loading-state contract

- [ ] This change has no asynchronous visual state, or its category is declared: `content-preserving`, `skeleton-capable`, `busy-action`, or `boundary`.
- [ ] Geometry is declared as Level A, B, or C, and loading reuses the real composition where structure is known.
- [ ] Applicable `Loaded`, `Loading`, `Refreshing`, `Empty`, `Error`, and `AlignmentContract` states are covered; omissions are explained.
- [ ] One boundary owns delay, `aria-busy`, and announcements; skeleton leaves are decorative.
- [ ] Theme, localization, responsive viewport, reduced-motion, and unexpected layout-shift behavior were considered.

## Verification

- [ ] `./scripts/verify.sh`
- [ ] Local Starter integration, when Starter contracts changed
