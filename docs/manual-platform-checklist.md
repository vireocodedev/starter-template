# Manual accessibility and platform checklist

Automation cannot complete these rows. Copy this table into a release evidence
record and fill in revision, operator, date, exact software/hardware, result, issue
links, and retained artifact. `Not run` is an explicit limitation.

| ID           | Scenario                                                                                                                                                             | Minimum environment                              | Result  |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------- |
| `A11Y-01`    | Complete login, navigation, Item create/edit/delete, settings, logout, validation and error recovery using keyboard only; focus never disappears or becomes trapped. | Current supported Windows/browser combination    | Not run |
| `A11Y-02`    | Names, roles, states, headings, landmarks, table/card alternatives, dialogs, errors and status announcements are understandable.                                     | NVDA with branded Firefox or Chrome on Windows   | Not run |
| `A11Y-03`    | The same canonical workflows, including rotor/landmark navigation and dialog focus restoration, are understandable.                                                  | VoiceOver with branded Safari on macOS           | Not run |
| `A11Y-04`    | Content reflows without two-dimensional scrolling or loss at 200% and 400%; text-spacing overrides preserve content and operation.                                   | Branded Chrome/Firefox/Safari as applicable      | Not run |
| `A11Y-05`    | Forced/high-contrast mode retains visible focus, controls, selected/current states, errors and non-color cues.                                                       | Windows High Contrast/forced colors              | Not run |
| `A11Y-06`    | Reduced-motion preference removes non-essential motion; interruption or rapid repeated input does not strand state.                                                  | One desktop and one mobile environment           | Not run |
| `A11Y-07`    | Pointer targets meet the WCAG 2.2 target-size rule or a documented exception; drag/swipe actions have ordinary alternatives.                                         | Touch desktop emulation plus physical mobile     | Not run |
| `BROWSER-01` | Canonical workflow passes.                                                                                                                                           | Current branded Chrome and Edge on Windows       | Not run |
| `BROWSER-02` | Canonical workflow passes.                                                                                                                                           | Current branded Firefox on Windows or macOS      | Not run |
| `BROWSER-03` | Canonical workflow passes.                                                                                                                                           | Current branded Safari on macOS                  | Not run |
| `PWA-01`     | Install, first launch, standalone navigation, deep link, resume, back behavior and uninstall are coherent.                                                           | Representative physical Android/Chrome           | Not run |
| `PWA-02`     | Home-screen install, launch/resume, safe areas, keyboard, orientation and Safari fallback behavior are coherent.                                                     | Representative physical iPhone/Safari            | Not run |
| `PWA-03`     | A cached shell launches offline, API data is not leaked/cached, reconnect recovers, and logout/account switch leaves no sensitive screen state.                      | Android and iOS physical devices                 | Not run |
| `PWA-04`     | An available service-worker update prompts once, activation/reload succeeds, and corrupt-cache recovery follows the documented path.                                 | One physical mobile plus branded desktop Chrome  | Not run |
| `PERF-01`    | Cold and warm launch, navigation, form interaction and long Item list remain usable without sustained jank.                                                          | Representative low-end supported physical device | Not run |

## Evidence record

For each executed row record:

```text
Row:
Revision/release:
Date and operator:
OS/browser/AT or device versions:
Fresh install/cache state:
Commands/setup:
Observed result:
Issues and severity:
Artifact location:
Retest date:
```

Do not commit participant identities, credentials, personal data, private
vulnerability details, or device/account identifiers.
