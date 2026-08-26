# Loading states and skeletons

Vireo Starter Template follows the normative
[Vireo Loading-State and Skeleton Standard](https://github.com/vireocodedev/starter/blob/main/docs/LOADING_STATE_STANDARD.md).

The canonical standard is maintained in Vireo Starter so reusable UI contracts and consuming application conventions have one source of truth. Template route policies, page compositions, feature loading states, and tests MUST comply with that standard. Application-specific decisions and documented exceptions remain in this repository.

The [Phase 2 template audit](LOADING_STATE_AUDIT.md) records the current route and feature baseline, compliance gaps, geometry targets, and prioritized remediation queue.

The current adoption roadmap is:

1. Audit routes and async-capable visual surfaces.
2. Derive shared primitives from observed gaps.
3. Pilot the standard on a data-driven workflow.
4. Migrate remaining surfaces incrementally.
5. Enforce stable contracts through authoring guidance and CI.

The Overview Level A reference is verified across English and Croatian, all supported page-width preferences, and desktop/mobile browser viewports. This verification concerns presentation and geometry only; whether static routes should render eagerly or remain lazy is a separate routing decision.
