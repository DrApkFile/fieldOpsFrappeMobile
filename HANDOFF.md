# FieldOps Mobile — Handoff / Context Recap

_Written 2026-08-28 to hand this session off to a different AI CLI tool. Read this fully before making changes._

## What this project is

`fieldOpsFrappeMobile` — a React Native / Expo (TypeScript) mobile app for field agents, talking to a Frappe/ERPNext backend app called `fieldops` (repo: `../FieldOpsFrappe`, **do not edit that repo** — backend is out of scope, integration only).

Backend is multi-tenant via subdomain: tenant `excite` → `https://excite.fieldops.africa`. Auth is bearer-token based.

The authoritative spec for what endpoints exist and their exact request/response shapes is:
`FieldOps_Client_API_Integration_Contract.md` (repo root). **Always check this file before assuming an endpoint's shape.**

## Working method (important, follow this)

- Integrating **one endpoint at a time**, in order, verifying each works against the real backend before moving to the next. Do not batch-implement several endpoints speculatively.
- **No background/subagent work on this project** — the user wants to see all work happen directly and visibly in the main session, not delegated to background agents/subagents.
- No backend code changes — this is a mobile-app-only integration task. If a needed endpoint doesn't exist server-side, say so rather than adding one.

## Status of endpoints so far

- ✅ **Login** (`/auth/login`) — implemented and confirmed working (`src/services/api.ts` → `login()`).
- ✅ **Campaigns** (`GET /agent/campaigns`) — implemented and confirmed working (`getCampaigns()` + `mapCampaign()` in `src/services/api.ts`). Note: real API only returns id/name/campaign_type/dates/modules — no color/target/progress/description/beat fields exist server-side, so those are UI defaults, not invented backend data.
- 🔧 **Attendance clock-in** (`POST /agent/attendance/clock-in`) — just implemented, **currently broken/undiagnosed** (see "Active bug" below). This is the live task.
- ⏳ **Attendance clock-out** (`POST /agent/attendance/clock-out`) — not yet started. Backend handler confirmed to exist (`submit_checkout` in `mobile_api.py`), same FormData shape as clock-in. Natural next step once clock-in is confirmed working.
- ❌ Known gaps in the backend per the contract / prior exploration: outlets list, attendance history, opportunities, journey maps — endpoints not yet confirmed/implemented client-side.

## Attendance clock-in: what was implemented

Contract shape:
```
POST /agent/attendance/clock-in   (multipart/form-data)
  coordinates = JSON string {"lat":"...", "lng":"..."}
  image = optional file
```
No campaign parameter exists in the documented/observed shape. User explicitly accepted this limitation ("implement the one you see there" even with no campaign param).

Backend handler: `submit_attendance()` in `../FieldOpsFrappe/fieldops/api/mobile_api.py` (~line 443).

### `src/services/api.ts`
- Added `clockIn(coordinates: {lat, lng}, imageUri?: string)`: builds a `FormData` with a JSON-stringified `coordinates` field and, if `imageUri` given, an `image` field using the React-Native-specific file shape `{ uri, name, type }` (not a real `File`/`Blob` — that's normal/required for RN `fetch`).
- Rewrote the shared `authFetch()` helper to add logging robustness (see "why" below):
  - Logs the outgoing request (method, url, body-is-formdata-or-not) **before** calling `fetch()`.
  - Wraps `fetch()` in try/catch — a hard network failure now logs `NETWORK ERROR` and throws a clear message, instead of silently producing no output.
  - Still logs the response status + raw body after the request completes.
  - 401 → throws `AuthError`; non-ok or `status: 'error'` body → throws generic `Error` with server message.

### `src/screens/AttendanceScreen.tsx`
- Already had working GPS auto-capture (`captureGps`, via `expo-location`) and selfie capture (`captureFace`, via `expo-image-picker`) before this session — those UI flows were pre-existing and, per the user, visually appear to work correctly (GPS badge shows "Locked", selfie photo displays).
- Added `rawCoords` state (numeric `{lat,lng}`, separate from the display-formatted `coordsText` string) — set inside `captureGps` right after the position fix comes back.
- Added `isSubmitting` state for a loading UI.
- Rewrote `handleFinishClockIn` to be async: validates GPS-locked + photo present (else `Alert.alert`), then calls `clockIn(rawCoords, photoUri)`, shows a "Clock In Failed" alert on error, otherwise navigates to the `attendanceSuccess` screen as before.
- `Confirm clock in` button (`Button` component) now shows `disabled={!canConfirm || isSubmitting}` and label toggles to "Clocking in...".
- Two diagnostic `console.log` lines were added while debugging (see below) — **these are temporary and should be removed once the bug is fixed**:
  1. First line of `handleFinishClockIn`: `console.log('[Attendance] Confirm clock in pressed', { gpsStatus, rawCoords, photoUri, canConfirm });`
  2. Right before the component's JSX `return`, fires on every render: `console.log('[Attendance] render', { gpsStatus, hasPhoto: !!photoUri, canConfirm, isSubmitting });`

All edits verified to compile cleanly with `npx tsc --noEmit -p .` (no type errors introduced).

## 🔴 Active bug — unresolved, this is where to pick up

**Symptom:** Tapping "Confirm clock in" produces **zero console output whatsoever** in the Metro terminal — not the pre-flight API request log, not a network-error log, not even the `[Attendance] Confirm clock in pressed` handler-entry log that was added specifically to test whether the handler is even reached. This is despite the user reporting that, visually, both the GPS "Locked" badge and the selfie photo appear correctly on screen (i.e. `canConfirm` should be `true`, so the `Button`'s `disabled` prop should be `false`).

**Confirmed relevant fact:** `Button.tsx` wraps `Pressable` with `disabled={disabled || loading}` — in React Native, when a `Pressable` is `disabled`, `onPress` **never fires at all**. This was the first hypothesis (some gating state silently false) but the user says the visual state looks correct, which contradicts it — unless the *display* is stale/desynced from the actual state variables driving `canConfirm`.

**Diagnostic step in flight when this session ended:** A render-level `console.log('[Attendance] render', ...)` was just added (see above) that fires on *every* re-render — mount, GPS lock, photo capture, etc. — independent of whether the button is ever pressed. **The user had not yet reloaded the app and reported back what this logs (or whether it logs at all) when this session ended.**

### Next steps for whoever picks this up

1. Have the user **fully reload the app** (not Fast Refresh — full reload/rebuild, since new imports/state were added and Fast Refresh can silently fail to apply such changes) and open the Attendance screen, watching the **Metro bundler terminal** (not the on-device Logbox).
2. Check whether `[Attendance] render` appears at all:
   - **Never appears, not even on mount** → the device is running a stale bundle that doesn't include these edits at all. This is a caching issue, not a logic bug. Fix: stop Metro, run `npx expo start -c` (or `npx react-native start --reset-cache`), then reload the app fresh. Re-test after that.
   - **Appears on mount/state changes, but `canConfirm` is `false`** at the moment the user taps, despite the UI looking ready → one of `gpsStatus`/`photoUri` is out of sync with what's rendered on screen. Get the exact logged values at tap time and compare against what's displayed.
   - **Appears with `canConfirm: true`, but no further logs after tapping** → the touch isn't reaching `Pressable.onPress` at all despite it being enabled. Look for something overlapping the button (e.g. `ScrollView` gesture conflicts, a transparent view stacked on top, z-index/overflow issues) — a screenshot of the screen at that point would help.
3. Once the handler-entry log confirms the tap is reaching `handleFinishClockIn`, verify the actual `clockIn()` network call succeeds against the real backend (watch for the `[FieldOps API] POST .../agent/attendance/clock-in` log and its response), and that the success/failure UI paths behave correctly (navigates to `attendanceSuccess` on success, shows `Alert` on failure).
4. **Remove the two temporary diagnostic `console.log` lines** listed above once the bug is fixed and clock-in is confirmed working end-to-end.
5. Then implement `clockOut()` analogously (`POST /agent/attendance/clock-out`, same FormData shape, backend handler `submit_checkout` in `mobile_api.py` ~line 610) — likely wired into wherever the app's "clock out" UI lives (not yet located this session).

## Key files reference

- `src/services/api.ts` — all backend calls: `login`, `logout`, `authFetch` (shared bearer-token fetch wrapper), `getCampaigns`, `clockIn`.
- `src/services/apiConfig.ts` — `getBaseUrl(tenantId)`, AsyncStorage-backed token/tenant getters/setters.
- `src/screens/AttendanceScreen.tsx` — GPS + selfie capture UI, clock-in submit flow (currently broken, see above).
- `src/components/Button.tsx` — shared button component; note the `disabled={disabled || loading}` → `Pressable` behavior referenced above.
- `FieldOps_Client_API_Integration_Contract.md` — source of truth for endpoint shapes.
- `../FieldOpsFrappe/fieldops/api/mobile_api.py` — backend handlers for agent-facing mobile endpoints (`submit_attendance` ~443, `submit_checkout` ~610, `get_my_attendance` ~1045 — this last one isn't in the contract table but exists server-side, flagged as a possible future endpoint for attendance history).
- `../FieldOpsFrappe/fieldops/api/attendance.py` — separate **admin-facing** attendance functions, not relevant to agent mobile flows.

## Constraints to keep honoring

- One endpoint at a time, verify against real backend before moving on.
- No background/subagent delegation for this project's work.
- No backend repo edits.
- Don't invent UI fields not backed by real API data — use honest defaults/omit instead (see `mapCampaign` comment for the established pattern).
