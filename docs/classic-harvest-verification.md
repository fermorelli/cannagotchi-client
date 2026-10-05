# Classic harvest verification

Verified on 2026-10-05 with an isolated local fixture, fake authentication and in-memory API records. No real account records were changed.

- The Classic report exposes Harvest plant beside Edit plant and Delete.
- Cancellation preserves the record and returns to the report.
- Pending deletion disables confirmation, cancellation and close controls.
- An API failure preserves the plant, displays an error and allows retry.
- Successful retry removes only the selected record. The report stays mounted for the shared basket animation, then returns to the collection; the other fixture plant remains.
- Garden notebook harvest confirmation and cancellation still work with the shared dialog.
- Report actions fit at widths 280, 320, 390, 768 and 1280 px. The 320 px confirmation fits within the viewport without horizontal overflow.
- npm test: 36 passing tests. npm run build: passed.
- Garden sprites, map, movement and world model files are unchanged.

Screenshots: [Classic report](screenshots/classic-harvest-report.png), [mobile confirmation](screenshots/classic-harvest-confirmation-mobile.png), [success animation](screenshots/classic-harvest-success.png).
