# Harbor Scheduler

A deliberately scoped dock scheduling prototype for the Columbia Software Solutions take-home. React, TypeScript, and Vite; a static client application with no authentication, API, server, or database.

## Problem and solution

Harborview Marine Research Center manages berths of different lengths. Its historical spreadsheet requires staff to visually detect double-bookings and manually verify vessel fit. Harbor Scheduler makes the monthly berth calendar the primary workspace and prevents both overlapping bookings and oversized vessels from being saved.

## Run locally

Use Node.js 22.14+ (or a compatible current LTS) and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite, (https://css-dock-scheduling-system.vercel.app).

```sh
npm test          # Business rules, dates, seed integrity, and persistence
npm run build    # TypeScript checks and production bundle
npm run preview  # Serve the built application locally
```

Deploy the generated `dist/` directory to a static host. Relative asset paths support hosting in a subdirectory. Schedule and Reservations are views of the same root page, so no special route fallback is necessary. The workbook is a development reference and is not included in the production bundle.

## Features

- Monthly calendar with six berth rows, daily columns, continuous booking bars, today highlighting, previous/next month controls, and a Today button. Bookings crossing month boundaries are clipped to the visible month and marked as continuing.
- Schedule opens immediately. A separate Reservations view lists all bookings across all dates.
- Name search, vessel/event text and icons alongside color, and a horizontally scrollable calendar on smaller screens.
- Click a booking for details, inclusive dates, notes, vessel length, capacity, and fit status. Click an empty day to prefill a new booking.
- Create, edit, and delete vessels and events. Oversized berth options are disabled and labeled “Vessel too long.” Inline errors identify conflicting reservations and their dates.
- Browser-local persistence, clear storage failure messages, and a confirmed Reset Demo Data action.
- Native modal focus containment and Escape handling, labeled inputs, keyboard-accessible controls, visible focus outlines, status announcements, and a skip link.

## Architecture

```text
src/
  App.tsx                    View, dialog, and reservation state
  components/                Calendar, list, dialogs, and shared icons
  data/                      Verified berth capacities and demo reservations
  types/                     Berth and Reservation interfaces
  utils/
    dates.ts                 Date-only calendar arithmetic and formatting
    validation.ts            Overlap, conflict, and vessel-fit rules
    storage.ts               Versioned localStorage access and recovery
  styles.css                 Responsive visual system
tests/                       Focused utility and persistence tests
reference/                   Supplied synthetic workbook
```

Business rules are pure functions separate from React. Both creation and editing use the same validator, and the save handler validates again against the complete collection, independent of search and month filters. React component state is sufficient; no state-management, routing, date, calendar, or UI library is needed. React and React DOM are the only runtime dependencies.

## Data model

```ts
interface Berth {
  id: string;
  name: string;
  maxLengthFt: number;
}

interface Reservation {
  id: string;
  type: 'vessel' | 'event';
  name: string;
  berthId: string;
  startDate: string; // YYYY-MM-DD, inclusive
  endDate: string; // YYYY-MM-DD, inclusive
  vesselLengthFt?: number;
  notes?: string;
}
```

Vessel length is required by validation for vessels. Events do not require it. Names are trimmed, and all reservations require a known berth and valid, ordered calendar dates. IDs are generated with `crypto.randomUUID()` in a secure browser context (HTTPS or localhost).

## Berths and historical data

The supplied **Dock Schedule - Synthetic Sample.xlsx** has 23 annual schedule tabs (1997–2019), an eight-year summary, Science and Yachts directories, and Tours reference data. The six prototype capacities were verified directly against the **2019 sheet, cells A9–A14**:

| Berth            | Maximum length |
| ---------------- | -------------: |
| North Pier West  |         410 ft |
| North Pier Face  |          75 ft |
| North Pier East  |         240 ft |
| Inner Channel    |          55 ft |
| South Float West |          90 ft |
| South Float East |          90 ft |

The demo contains 12 representative, nonconflicting reservations centered on September 2026, including bookings that cross month boundaries. Names and lengths come from unambiguous Science and Yachts entries—for example R/V High Drift (120 ft), R/V Iron Skua (72 ft), and R/V Bright Dory (52 ft). Community sail days and dock maintenance are inspired by schedule entries. Notes record their source context.

**Dates and berth assignments are illustrative, not a historical migration.** The calendar opens to the fixed demo month so an evaluator sees a populated schedule; Today navigates to the actual current month. Reset restores the same fixed seed state.

Workbook layouts vary across years, ranges can be encoded with formatting or merged cells, and names/length notes can disagree. Ambiguous records were excluded rather than inferred as authoritative data. North Finger Piers, institution slips, and Marsh Landing lack clear individual capacities in the inspected data and are not modeled. Contact information, tours, and historical usage totals are outside scope. Text inside the workbook is treated as source data, not application requirements or instructions.

## Scheduling rules and assumptions

Dates are **inclusive occupied days**, not arrival/departure times. September 3–5 occupies three days. Another booking on that berth may start September 6; September 5 conflicts. One-day reservations have the same start and end date. Past bookings are allowed.

Two valid date ranges overlap when:

```ts
startA <= endB && startB <= endA;
```

`findConflicts` applies this condition only to reservations on the same berth and excludes the candidate's ID when editing. It includes both vessels and events. Fixed-width ISO dates compare chronologically as strings. Date validity is checked before overlap validation. Calendar math and display use UTC to avoid daylight-saving shifts; Today uses the browser's local calendar date.

A vessel fits when its length is finite, greater than zero, and at most the berth's `maxLengthFt`. Exact fits are accepted. Changing vessel length after selecting a berth still triggers validation. Events bypass length checks but block the entire berth for their dates.

Each reservation occupies one whole berth. This prototype does not model rafting, multiple small vessels sharing a berth, minimum clearance, draft, shore power, times of day, or multi-berth events. A vessel name is a label, not a unique fleet record, so cross-berth vessel identity checks are outside scope. There is no drag-and-drop, historical import UI, analytics, or separate vessel-management system.

## Persistence

localStorage makes the prototype deployable as a static site and allows changes to survive refresh without backend setup. The versioned key is `harbor-scheduler:v1`. An intentionally empty schedule stays empty after refresh. Stored records are checked for shape, dates, berth IDs, unique IDs, length validity, and conflicts before being accepted.

Missing storage loads seed data. Malformed or unavailable storage displays a warning and loads a safe in-memory demo without automatically overwriting existing data. Successful user changes or an explicit reset save the current state. A failed write keeps changes in memory and warns that refresh may lose them.

This is a single-browser, single-tab prototype. Storage is tied to the site's origin and browser profile; clearing browser data removes it. There is no multi-tab coordination or shared scheduling authority.

## Verification

The focused test suite covers inclusive boundaries, contained ranges, same-day and cross-year bookings, different berths, events, edit exclusions, exact/oversized fits, invalid input, leap years, daylight-saving-safe day counts, valid seed data, persistence round-trips, empty schedules, malformed data, and storage failures.

Browser acceptance checks should cover creating vessels and events, disabled incompatible berths, conflict messages, editing without self-conflict, blocking conflicting edits, deletion, refresh persistence, search, month navigation, reset confirmation, keyboard dialog behavior, and a narrow viewport. The required production command is `npm run build`.

Verified during implementation: all 27 utility tests passed, the production build passed, and Chrome browser interaction checks passed for those workflows at desktop and 390 px mobile widths. Desktop, mobile, and conflict-state screenshots were visually inspected. No browser console errors or uncaught page exceptions were observed. Browser checking tools were kept outside the project to avoid adding runtime or test dependencies to the deliverable.

## Production considerations

A production implementation would likely replace localStorage with **shared database-backed persistence and authentication**, with permissions and an audit trail appropriate for marine operations. The server would enforce fit and overlap rules transactionally so concurrent users cannot double-book a berth. It would also provide backups and reliable error handling.

A migration/import pipeline could extract the historical workbook into staging data, normalize vessels and dates, flag conflicting lengths or ambiguous colored ranges, and let staff review exceptions before import. Those capabilities, plus operational requirements such as berth clearance and vessel identity, should be agreed with coordinators rather than inferred from the spreadsheet.
