# Home

> Gecontroleerd op: `aa8cfdc` (2026-10-10)
> Bronnen: `home/screens/home-screen.tsx`, `capture/domain/group-scans.ts`

## Waarvoor

Overzicht van scans in deze sessie en startpunt om opnieuw te scannen.

## Hoe het werkt

Sectielijst per herkende categorie. Lege staat met i18n. Knop navigeert naar scanroute `/`.
Tik op item → `/item/[id]`.

## Beweringen

| ID      | Bewering                                                                   | Code              | Test                  |
| ------- | -------------------------------------------------------------------------- | ----------------- | --------------------- |
| HOME-01 | Scans worden gegroepeerd op bekende categorie; unknown heeft eigen sectie. | `group-scans.ts`  | `group-scans.test.ts` |
| HOME-02 | Lege categorieën (geen items) worden weggelaten.                           | `group-scans.ts`  | `group-scans.test.ts` |
| HOME-03 | Start-actie navigeert naar de scanroute.                                   | `home-screen.tsx` | —                     |

## Randgevallen en bewuste keuzes

- Home zit achter `(app)` / `signed-in`; de standaardlanding is de scanroute.

## Open vragen

- Geen.
