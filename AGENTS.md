# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**qml2js** is a Vue 3 SPA called **EFAS Configuration App** — a water network management dashboard. It was ported from a QML/C++ desktop app (hence the repo name). The app manages water distribution zones ("DMAs"), displays an ArcGIS map, runs hydraulic/leak/anomaly analysis, and visualizes NRW (Non-Revenue Water) metrics.

## Commands

```bash
# Start dev server
npm run dev

# Type-check only (no emit)
npm run type-check

# Production build (type-checks first, then bundles)
npm run build

# Preview production build
npm run preview
```

There is no test runner configured (no Vitest/Jest).

## Environment

Copy `.env` and adjust for your backend. The key variables:
- `VITE_APP_TITLE` — browser/app title
- `VITE_API_BASE_URL` — backend REST API base URL (defaults to `http://localhost:5000/api` if unset)

## Architecture

### Authentication Flow
Auth is token-based with a **dual-token** scheme:
- The **access token** is kept **in memory only** (`stores/auth.ts`) — never in `localStorage`.
- The **refresh token** lives in an HttpOnly cookie managed by the backend.
- `services/api.ts` wraps Axios with two interceptors: one attaches the Bearer token; another retries failed 401 requests via `/auth/refresh` (skips the refresh endpoint itself to avoid infinite loops, deduplication via shared `refreshPromise`).
- `router/index.ts` has a `beforeEach` guard with a shared `tryRestoreSession()` helper:
  - Routes with `meta: { requiresAuth: true }` → restore session or redirect to `/login`.
  - Routes with `meta: { guestOnly: true }` (i.e. `/login`) and `/` → redirect to `/app/dashboard` if already authenticated.

### Routing Structure
All authenticated pages live under `/app` inside `MainLayout.vue` (a sidebar + `<RouterView>` with `<KeepAlive>`). Unauthenticated: `/login`. Route lazy-loads all views.

```
/              → smart redirect: authenticated → /app/dashboard, unauthenticated → /login
/login         → Login.vue  (meta: { guestOnly: true } — redirects to /app/dashboard if already logged in)
/app           → MainLayout.vue (requiresAuth)
  /dashboard   → Dashboard.vue
  /map         → Map.vue
  /zones       → Zones.vue  (→ ZoneDetail.vue rendered inline, not a child route)
  /management  → Management.vue
  /support     → Support.vue
  /settings    → Settings.vue
```

`ZoneDetail.vue` is **not** a router child route — `Zones.vue` shows it inline by toggling a selected zone object. The `zoneId` prop accepts either a raw ID or an object with `.id`.

### State Management (Pinia)
- `stores/auth.ts` — authentication state: `user`, `isAuthenticated`, `accessToken`. Actions: `login`, `logout`, `refresh`, `fetchUser`, `register`, `activateLicense`.
- `stores/zone.ts` — cached list of zones (`ZoneResponse[]`) fetched from backend. Actions: `fetchZones`.

### Services Layer
- `services/api.ts` — the single Axios instance; all API calls must go through this.
- `services/NetworkService.ts` — GIS file uploads (`multipart/form-data`) and network role saving for a zone. Endpoints: `/gis/zones/:zoneId/network/...`.
- `services/ZoneService.ts` — zone/project CRUD and permission user listing. Endpoints: `/system/...`.
- `services/NetworkGraphService.ts` — parses and processes raw network graph data (nodes, pipes) returned from the backend.

> `GeometryService.ts` and `UserManager.ts` have been **deleted** — they were mock stubs ported from C++ with no real implementation.

### Map
`components/map/MapCanvas.vue` uses **`@arcgis/core`** (ArcGIS JS SDK v4). The map renders into a `ref` div, uses `dark-gray-vector` basemap, and defaults to Hanoi (~105.8°E, 21.0°N). The `MapView` is destroyed on `onBeforeUnmount`.

### Zone Detail Workflow
`ZoneDetail.vue` contains four accordion tabs (via `ContentTabItem`), each housing a wizard or report:
1. **Network** → `NetworkSetupWizard` (4-step: DisplayConfig → AddNetworkFiles → ChooseInletNode → OverviewEdit)
2. **Operation** → `OperationalDataImport`
3. **Analysis** → `AnalysisSetting`
4. **Anomaly** → `AnomalyReport`

### Composables
- `composables/useNetworkMap.ts` — encapsulates all ArcGIS JS SDK logic for rendering a water network (nodes as Points, pipes as Polylines). Manages `MapView` lifecycle, inlet selection mode (hitTest), node highlighting, and cleanup via `onBeforeUnmount`. Each component gets its own instance (not global store).
- `composables/useSettings.ts` — encapsulates dialog state (edit field, confirm-delete) and delegates mutations to `useSettingsStore`. Provides a `showSuccess()` helper that auto-dismisses after 1.2 s.

### Styling
Tailwind CSS v3 + PostCSS + Sass. Path alias `@` maps to `src/`. Fonts used: `font-montserrat`, `font-inter`. Dark theme throughout (`bg-[#202020]`, `bg-black`).

### TypeScript
Strict mode enabled (`strict`, `noUnusedLocals`, `noUnusedParameters`). Bundler module resolution. `vue-tsc` is used for type-checking `.vue` files.

## Key Conventions
- All `.vue` files use `<script setup lang="ts">` (Composition API).
- Import paths use the `@/` alias for anything under `src/`.
- Services are exported as **singletons** (`export default new SomeClass()`).
- Stores use the **setup store** style (`defineStore('name', () => { ... })`).
- `KeepAlive` wraps the main `RouterView`, so view component state is preserved on navigation.
- `composables/` is for stateful logic tied to a component lifecycle. Use `stores/` for global shared state.
