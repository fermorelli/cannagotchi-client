# Cannagotchi

A React plant tracker with a small, original pixel-art garden. Garden mode and the existing classic dashboard use the same plant records; walking around is optional.

## Run locally

Use Node 20, 22, or 24 and npm. Install packages with `npm install` if they are not already present, then run:

```sh
npm run dev
```

Open the URL printed by Vite, normally **http://localhost:3000**. If that port is occupied, Vite chooses the next available port.

Go to **`/garden`** and choose **Start a local garden** to try the experience without a backend or account login. It starts with three clearly identified example plants. You can add, edit, and delete local plants, and changes persist in this browser. The local collection remains separate from account plants.

Other commands:

```sh
npm run build       # production files in build/
npm run preview     # preview the production build
npm start           # alias for the development server
```

## Visit the garden

- Move with **arrow keys** or **WASD**.
- Each tap takes one step. Holding a direction waits briefly, then walks at a steady pace; keyboard repeat settings do not change the speed.
- Use **E** or **Space** beside a plant or empty pot to interact.
- Use the on-screen direction and interaction buttons on touch devices.
- Click or tap a plant, or its sidebar card, to open its notebook directly.
- Interact with an empty pot, or choose **Plant something new**, to create a plant.
- Collections larger than six plants have multiple gardens. Use **Choose garden** or the arrows above the map; the visible range and full collection total are shown there. Opening a sidebar plant also selects its garden.
- Choose **Harvest plant** in its Garden notebook or Classic plant report after harvesting in real life. Confirming **Harvest and remove** permanently deletes that plant record from Garden and Classic, with a basket animation after the deletion succeeds. Classic returns to the plant collection after the animation. Account deletion also affects the deployed app. Browser care notes are retained but stop appearing in the garden; cancellation or a failed deletion keeps the plant visible.
- Choose **Classic** to open `/plants`; use the navigation's **Garden** link to return. The classic dashboard is at `/home`.

The notebook shows the plant's actual name, genetic family, grow mode, germination date, and age. Its journal accepts dated watering, feeding, observations, and height measurements. Logging a watering produces a brief visual response; it records care performed in the real world.

Plant sprites have six original growth appearances. The default stage is an approximation from plant age. Choose an **Observed growth stage** in the notebook to reflect your own observation. These visuals are not a health assessment or a cultivation schedule.

## Account collections and persistence

The existing account flow uses Firebase Authentication and the plant API. The API server is not included in this repository. By default, development and preview proxy `/api/*` to **https://cannagotchi-server.vercel.app**, matching the existing production rewrite in `vercel.json`. The `/api` prefix is removed: `/api/plants` becomes the backend's `/plants`.

Log in with your existing account to see the same collection as the deployed app. **Adding, editing, or deleting account plants from the local app changes that same account collection.** Use **Start a local garden** for separate browser-only examples.

To use a backend running on your own computer instead, create `.env.local` in this repository with:

```dotenv
VITE_API_TARGET=http://127.0.0.1:8080
```

Restart Vite after changing that setting. Firebase login and the plant API are separate services; a successful login alone does not establish an API connection. Account data-loading errors have a **Try again** button.

The shared auth context handles plant create, update, delete, loading, and service errors for both modes. Local garden changes use browser storage; account plant changes use the existing API.

**Care journals and observed visual stages are browser-only for all collections.** They are scoped to the signed-in Firebase user, or the separate local-garden identity, and are not uploaded to the API. They do not follow you to another browser or device. Clearing site storage removes local plants, journals, and stage choices. Storage also belongs to the exact site origin, so a different development port has separate records. A warning appears if journal storage is unavailable; those changes survive only for the current session.

## Implementation and checks

- React 18, React Router, and Vite; no game-engine dependency.
- The garden layer lives in `src/components/garden/`, with locally authored sprites and tile-based movement.
- `src/context/authContext.jsx` supplies plant data to both views and supports the explicit local garden.
- `src/context/careContext.jsx` and `src/components/care/PlantJournal.jsx` supply the shared browser journal.
- Existing classic views and styles remain available.
- Garden controls, notebooks and dialogs share the site's dark green palette and typography. Shared navigation, Classic screens, public pages and forms follow the same responsive sizing and spacing rules. See [the UI polish verification](docs/ui-polish-verification.md) for tested flows, viewport coverage and screenshots.

Run the focused persistence, care, plant-date, and world tests with:

```sh
npm test
```

The tests use Node's built-in runner and need no extra dependencies. They cover event timestamps, input validation, invalid storage, local/account isolation, calendar dates in Argentina, daylight-saving transitions, harvest estimates, collisions, reachable plant spots, garden paging, movement timing, API proxying, and plant deletion with pending collection requests.

For a manual smoke test: open `/garden`, start the local garden, walk to a plant, inspect it, add an entry, change its observed stage, close the notebook, create a plant, switch to Classic, edit the same plant, and refresh to check persistence. Also check a narrow viewport and touch controls. Account CRUD requires the API and a usable Firebase session.

## Current limits and next steps

- Journals and visual stages have no cloud sync, backup/export, or cross-device history yet.
- Photos and photo uploads are not implemented.
- Growth follows age estimates or explicit observations; care logs do not automatically determine plant health or growth.
- Each garden fits six plants. Additional gardens are selected above the map, and every plant remains accessible through the sidebar and Classic mode.
- Verify the account workflow against the real backend, then add server-supported journal records and optional photo history. Further garden customization can build on this small playable foundation.
