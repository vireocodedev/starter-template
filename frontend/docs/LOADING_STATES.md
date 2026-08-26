# Loading states and skeletons

Vireo Starter Template follows the normative
[Vireo Loading-State and Skeleton Standard](https://github.com/vireocodedev/starter/blob/main/docs/LOADING_STATE_STANDARD.md).

The canonical standard is maintained in Vireo Starter so reusable UI contracts and consuming application conventions have one source of truth. Template route policies, page compositions, feature loading states, and tests MUST comply with that standard. Application-specific decisions and documented exceptions remain in this repository.

The [template audit and remediation record](LOADING_STATE_AUDIT.md) records the current route and feature baseline, geometry targets, completed vertical slices, and remaining enforcement work.

The current adoption roadmap is:

1. Audit routes and async-capable visual surfaces.
2. Derive shared primitives from observed gaps.
3. Pilot the standard on a data-driven workflow.
4. Migrate remaining surfaces incrementally. (Phase 7 complete.)
5. Enforce stable contracts through authoring guidance and CI. (Phase 8.)

The Overview Level A reference is verified across English and Croatian, all supported page-width preferences, and desktop/mobile browser viewports. Items, history, filter-definition, relation-option, item-form, deletion, and login surfaces now implement their applicable loading, refresh, recovery, accessibility, and geometry contracts. This verification concerns presentation and behavior only; whether static routes should render eagerly or remain lazy is a separate routing decision.
