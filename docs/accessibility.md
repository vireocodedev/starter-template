# Accessibility statement and verification

Vireo targets WCAG 2.2 level AA for the canonical Template workflows. This is a
development target, not a claim that every application built from the Template or
every current page has received a complete conformance audit.

## Current automated evidence

- Every Template Storybook story treats addon-a11y findings as test failures.
- Full-stack Playwright runs axe-core WCAG 2.0/2.1/2.2 A/AA rules against login,
  the authenticated Item list, and the create dialog in desktop and mobile
  Chromium viewports.
- Lighthouse requires a perfect automated accessibility category score on the
  production login bundle.
- The cross-browser scheduled lane runs the complete browser suite in Playwright
  Firefox and WebKit engines.

Automated tools find only part of the accessibility surface. Passing them does not
prove WCAG conformance or assistive-technology usability.

## Responsibilities

MUI supplies semantics and keyboard behavior for many low-level controls. Vireo
owns the public component composition, names, states, focus behavior, responsive
alternatives, loading/error/offline surfaces, and Storybook evidence. The Template
owns page landmarks, navigation structure, translated names, complete workflows,
and its automated/manual release checks. Applications own domain language, custom
content, authorization outcomes, files/media, charts, third-party integrations,
and every modification after generation.

Never remove a visible label without supplying an accessible name. Do not rely on
color, hover, position, animation, or a gesture alone. Preserve focus visibility,
logical order, reduced motion, zoom/reflow, text spacing, touch alternatives, and
error announcements when customizing a component.

## Manual release evidence

Use the [manual accessibility and platform checklist](manual-platform-checklist.md)
for keyboard-only, NVDA, VoiceOver, zoom/reflow, high-contrast, reduced-motion,
target-size, physical-device, and installed-PWA checks. Record the exact revision,
operating system, branded browser, assistive technology/device, scenario, result,
issues, and evidence location.

Until both the NVDA/Windows and VoiceOver/Safari rows have current passing evidence,
manual assistive-technology verification remains a known limitation. Report public
accessibility defects through the bug form. Report an issue privately through the
security channel only when it exposes protected data or crosses an authorization
boundary.

Normative target: [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/).
