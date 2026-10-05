# UI polish verification

Verified locally on 5 October 2026. This pass integrates the Garden shell and interaction UI into the existing dark green and black product. The actual playable Garden remains visually intact.

## Changes

- Dark Garden shell, paging controls, touch controls, notebook, creation and harvest dialogs, notices and error/loading states. Plain counts and stage markers replace pills; plant names wrap in the sidebar. Its scroll affordance identifies all records beyond the visible portion.
- Shared restrained control radii, typography, spacing and focus styles. Classic metrics form a compact strip; plant attributes use labeled rows. Long names and emails wrap without expanding grids. Cards size independently.
- Responsive journal forms respond to their container width, including a narrow desktop notebook. Date fields, measurements, controls and long unbroken notes remain contained. Sticky notebook controls stay visible during scrolling.
- Mobile navigation closes on route changes and desktop resize. Logout cancellation restores focus to the visible menu toggle. Generic dialogs trap keyboard focus, handle Escape and restore body scrolling.
- Forms appear first on mobile. Inline errors sit below the relevant field and identify invalid controls accessibly. Existing validation rules remain unchanged; messages use readable wording.
- Journal scope changes reset the journal before children render without remounting the surrounding application. This preserves first-attempt signup confirmations while retaining account/local isolation and rejecting callbacks from a previous scope.
- User profiles show loading, service errors and retry instead of briefly claiming an empty collection. Failed deletion retains the profile, surfaces an error and guards duplicate submission.
- Public/auth pages use fewer nested boxes and badges. Login/signup have one primary heading. Placeholder FAQ content was replaced with real feature and persistence explanations. The footer's LinkedIn domain typo was corrected.

## Protected Garden

SHA-256 hashes of `sprites.jsx`, `GardenWorld.jsx`, `movement.mjs` and `worldModel.mjs` match the versions present before this UI pass. A parsed comparison also found all 24 protected world CSS rules and all 6 world animation definitions unchanged. No sprites, scenery, map layout or movement logic was redesigned.

## Browser coverage

The actual React application was run on the usual local server and a temporary isolated Vite fixture. The fixture used fake authentication and an in-memory API, so creation, editing, harvesting, signup and deletion did not alter real accounts or plants. The fixture and its server were removed after verification.

The final layout audit covers 92 combinations, recorded in [ui-polish-layout-audit.json](ui-polish-layout-audit.json):

| Surface | Widths in CSS pixels |
| --- | --- |
| Landing, login, signup, FAQs | 280, 320, 390, 768, 1024, 1440 |
| Dashboard, collection, plant record, Add/Edit plant, user list, Add/Edit user | 280, 320, 390, 768, 1024, 1440 |
| Garden | 280, 320, 390, 640, 750, 760, 761, 850, 1000, 1001, 1280, 1440, 1920 |
| Notebook with long name and journal history | 280, 320, 375, 390, 560, 1001, 1440 |

No unintended horizontal overflow or text escaping containers was found in the audited states. Intentional pixel-map label truncation, native input text scrolling and the sticky header's background extension were excluded from the overflow detector. The original map art was preserved. The notebook was also checked at 667 × 375, with its close control visible and content scrolling within the dialog.

Interaction checks included:

- Seven plants across two gardens, previous/next/select paging, visiting the seventh plant through the sidebar, and one-step WASD movement.
- Garden and Classic plant creation, required-field validation, editing, deletion, harvest cancellation and successful harvest animation.
- Observed stages, watering, feeding, observations, two height measurements, expanded history, long unbroken notes, removal cancellation and removal confirmation.
- Profile creation, editing and deletion; delayed loading, HTTP 503 failure and successful retry; pending deletion and failure retaining the profile.
- Fake login validation, incorrect credentials, successful login, first-attempt signup and its success dialog, a new account's empty dashboard and Garden, signed-out Garden entry, local Garden start and exit. Returning to the original account restores four care entries; adding a local note leaves those four account entries unchanged.
- Keyboard dialog focus wrapping, Escape, body scroll restoration and mobile logout focus. Mobile navigation and resize across its breakpoint. FAQ disclosure.
- Garden service failure and successful retry.

## Checks and scope

`npm test`: 36 passing tests. `npm run build`: successful. Vite still reports the existing bundle-size warning; the main bundle is approximately 612 KB with the shared Classic harvest dialog. No dependencies were added. Backend authorization and production Firebase account behavior were not revalidated with real records during this UI audit. Signup confirmation persistence and journal switching were verified through the real rendered application with fake authentication.

## Screenshots

Screenshots show the real application rendered with isolated example data:

- [Desktop Garden](screenshots/polish-garden-desktop.png)
- [Mobile Garden](screenshots/polish-garden-mobile.png)
- [Mobile notebook](screenshots/polish-notebook-mobile.png)
- [Classic collection](screenshots/polish-classic-desktop.png)
- [Mobile login](screenshots/polish-login-mobile.png)
