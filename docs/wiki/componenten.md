# Componenten

> Gecontroleerd op: lokaal (2026-11-22)
> Bronnen: `src/app/`, `src/domeinen/*/screens/`, `src/shared/ui/`
> Zie ook: [ADR 0019](../decisions/0019-toetsenbord-en-formulieren.md), [ADR 0020](../decisions/0020-maatgrid.md), [conventions.md](../conventions.md) §4 en §8

## Waarvoor

Actuele kaart van Occa-routes ↔ schermen, zodat wiki en navigatie niet uiteenlopen.

## Hoe het werkt

Expo Router-mappen onder `src/app/` wijzen door naar schermen in `ui.ts` van domeinen. Login hangt
niet aan een route maar aan de root-gate ([inloggen.md](inloggen.md)).

Lokale form-/fasestatus (≥3 velden of een fasemachine) hoort in `domain/*.action.ts` +
`useReducer` in hooks; één UI-flag blijft `useState` (zie conventions §4).

## Beweringen

| ID    | Bewering                                                                                        | Code                                  | Test                 |
| ----- | ----------------------------------------------------------------------------------------------- | ------------------------------------- | -------------------- |
| UI-01 | Route `/scan` toont `CaptureScreen`.                                                            | `src/app/(scan)/scan.tsx`             | —                    |
| UI-02 | Tab `/home` toont `HomeScreen`.                                                                 | `src/app/(app)/(tabs)/home/index.tsx` | —                    |
| UI-03 | Route `/item/[id]` toont `ListingScreen`.                                                       | `src/app/(app)/item/[id].tsx`         | —                    |
| UI-04 | Gedeelde UI (Button, Screen, TabBar, toast, status overlay) zit in `shared/ui`.                 | `src/shared/ui/`                      | —                    |
| UI-05 | Tab `/inventory` toont `InventoryScreen` via nested Stack.                                      | `(app)/(tabs)/inventory/`             | —                    |
| UI-06 | ~~Route `/choose-store`~~ verwijderd (2026-11-22); detail via `/inventory/[id]`.                | `(app)/inventory/[id].tsx`            | —                    |
| UI-07 | Route `/settings` toont `SettingsScreen` (taal + uitloggen).                                    | `(app)/settings.tsx`                  | —                    |
| UI-08 | Bij `signed-out` rendert de root `LoginScreen` (geen `/login`-route).                           | `src/app/_layout.tsx`                 | —                    |
| UI-09 | Scrollende `Screen` houdt het actieve veld boven het toetsenbord (iOS/Android).                 | `shared/ui/screen.tsx`                | —                    |
| UI-10 | Formuliervelden koppelen via `useFieldChain` (Volgende → volgend veld).                         | `use-field-chain.ts`                  | `form-chain.test.ts` |
| UI-11 | Route `/inventory/[id]` toont `InventoryItemScreen`.                                            | `(app)/inventory/[id].tsx`            | —                    |
| UI-12 | Keuzelijsten in item-detail gebruiken gedeelde `SelectField` (sheet + radio).                   | `shared/ui/select-field.tsx`          | —                    |
| UI-13 | Filterchips gebruiken `Chip` / `ChipGroup`; kleurfilter in sheet gebruikt `InlineSelectField`.  | `chip.tsx`, `inline-select-field.tsx` | —                    |
| UI-14 | Inboedelrijen gebruiken `ListCard`.                                                             | `list-card.tsx`                       | —                    |
| UI-15 | `BottomSheet` kan optioneel een handle en ronde sluitknop tonen.                                | `bottom-sheet.tsx`                    | —                    |
| UI-16 | Stijlmaten volgen het grid: breedte per 5 (`spacingX`), hoogte 2 of per 4 (`spacingY`, `size`). | `theme.ts`, `size-grid.ts`            | `size-grid.test.ts`  |
| UI-17 | Stack-headers tonen geen schermtitel; `title` blijft voor toegankelijkheid en het terug-menu.   | `shared/ui/navigation.ts`             | `navigation.test.ts` |

## Randgevallen en bewuste keuzes

- TabBar is custom (`shared/ui/tab-bar.tsx`), niet de default Expo-tabchrome.
- Eén globale `KeyboardToolbar` in `_layout`; geen losse `KeyboardAvoidingView` per scherm.
- Settings houdt bewust één `useState` voor `signingOut` (onder de reducer-drempel).

## Open vragen

- Geen.
