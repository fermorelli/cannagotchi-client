# Garden MVP verification

Verified locally on October 5, 2026, using the running Vite app at `http://127.0.0.1:3002`. Vite selected this port because 3000 and 3001 were already occupied. Use the URL printed by `npm run dev` on a fresh run.

## Implemented

- An original SVG pixel world with greenhouse, pond, trees, garden beds, a caretaker, and lightweight animations.
- Grid movement, solid scenery, adjacent interactions, and click/tap pathfinding. Keyboard input belongs to the focused map; notebooks pause movement and restore focus on close.
- Six growth appearances based on age or a manually observed stage. Larger collections have six plants per patch with pagination.
- Plant inspection and creation from an empty pot. Garden and classic screens share the same plant CRUD methods and owner checks.
- An explicit local garden with three sample plants and persistent browser records. Firebase/account collections retain their API flow; local mode never silently replaces a failed account request.
- Browser-only watering, feeding, observations, measurements, and observed growth stages, available in both views.
- Existing classic layouts and styles retained. Navigation includes Garden and Classic links; a small mobile-menu fix prevents offscreen overflow.
- Calendar-date correction for Argentina and daylight-saving transitions.

## Results

`npm run build`: passed. Vite retains a warning about the existing main bundle exceeding 500 kB; the garden is loaded as a separate route chunk.

`npm test`: 36 passed, 0 failed. Covers journal validation, per-user storage, corruption/quota handling, intentional empty gardens, calendar dates, harvest estimates, collisions, reachable plant spots, pagination, held-input timing, API proxy configuration and request forwarding, and deletion against stale refreshes, failures, ownership, and account changes.

Browser checks passed:

1. Preserved landing page loads and exposes the Garden entry.
2. Local garden starts with three plants, and the session and plants survive reload and exit/reentry.
3. Arrow-key movement changes coordinates; movement toward Menta's solid pot stops at tile `(12, 7)`.
4. E opens the adjacent plant's notebook. Clicking a plant walks to it and opens the same notebook.
5. Empty-pot interaction opens plant creation. A created plant appears in both garden and classic screens.
6. Watering and height records, plus an observed growth stage, persist across reload and appear in the classic journal.
7. Classic edit changes the garden plant's name. Both garden and classic creation and classic deletion succeed.
8. Escape closes the notebook and returns focus to the map.
9. At 390 × 844, the garden and notebook remain readable, touch buttons move the avatar, and the page has no horizontal overflow. Mobile navigation opens and closes correctly.
10. Exiting the local session returns to the landing page without deleting saved local plants.
11. No browser runtime errors or warnings were recorded after the final checks.

Disposable test plants and journal records were removed. The three initial example plants remain.

## Garden follow-up

Verified the updated components in an isolated temporary Vite fixture with seven in-memory test plants, mocked auth/care hooks, and a delayed mock deletion. This fixture had no account, API, or journal-storage access and was removed after verification.

- The selector above the map shows `Plants 1–6 of 7` and `Plants 7–7 of 7`; the second garden contains the seventh plant. The sidebar contains all seven. Opening plant 7 from garden 1 selects garden 2.
- A keyboard or touch tap moves exactly one tile. Held movement has a 280 ms initial delay and a 180 ms repeat interval, independent of OS repeat, with no catch-up burst. Collision and E interaction still work.
- Harvest confirmation explains permanent record deletion, its account/deploy impact, and retained browser notes. Cancel sends no request and returns to the notebook. Escape and close are blocked while deletion is pending.
- A failed mock deletion leaves all seven plants and an actionable retry. A successful deletion shows the basket animation, leaves six plants, collapses the second garden, and restores focus to the map. Double-clicking confirm sends only one deletion request.
- At 390 × 844 the garden selector, touch controls, and confirmation fit without horizontal overflow. The temporary viewport was reset.
- A clean final browser run produced no new runtime errors. Earlier fixture hot reloads during implementation remounted its test root; these were isolated harness reload errors, not production-app errors.

Screenshots of these fictitious plants are `garden-seven-plants.png`, `garden-harvest.png`, and `garden-harvest-mobile.png` in `docs/screenshots/`. No real account plants were harvested or deleted during these checks.

## Limits and next steps

During the initial garden checks, account CRUD was not tested against a real account. Follow-up diagnosis found that Vite targeted a nonexistent backend on port 8080. Development now uses the deployed backend configured by `vercel.json` by default, with `VITE_API_TARGET` available for a separate local backend. Read-only production and local-proxy checks confirmed JSON responses from both `/plants` and `/users`; no account plants were modified. See README for the shared-account data behavior.

Journal entries and observed stages are only stored in the current browser origin, even for account collections. Cloud sync, export/backup, and photo history remain next steps. There is no artificial care timer, XP system, or inferred plant-health mechanic.

Screenshots are in `docs/screenshots/`: `garden-desktop.jpg`, `garden-mobile.jpg`, and `plant-notebook-mobile.jpg`.

The verification above was completed before the release commit. No new dependencies were added.
