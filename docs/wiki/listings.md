# Listings

> Gecontroleerd op: `aa8cfdc` (2026-10-10)
> Bronnen: `capture/domain/listing.ts`, `capture/store/scan-store.ts`
> Zie ook: [open-vragen.md](../functioneel/open-vragen.md)

## Waarvoor

Lokale productkaart per scan: wat de medewerker invult of uit herkenning overneemt, tot er een
webshop/API is.

## Hoe het werkt

`ListingDraft` heeft vaste stringvelden (merk, prijs, …). Leeg starten. Scan-store houdt items
(newest first) met `photos[]` (rol overview/label), interpret-resultaat en listing. Lijst/thumbnail
gebruikt `primaryPhotoUri`. Bij uitloggen: `scanStore.clear()`.

## Beweringen

| ID      | Bewering                                                                     | Code            | Test                 |
| ------- | ---------------------------------------------------------------------------- | --------------- | -------------------- |
| LIST-01 | Listingvelden starten leeg; patches mergen veld-voor-veld.                   | `listing.ts`    | `listing.test.ts`    |
| LIST-02 | `record` zet een nieuw item vooraan in de lijst met optionele listing-patch. | `scan-store.ts` | `scan-store.test.ts` |
| LIST-03 | `updateListing` wijzigt alleen het item met het gegeven id.                  | `scan-store.ts` | `scan-store.test.ts` |
| LIST-04 | Bij uitloggen / expired sessie worden scans gewist (`clearUserData`).        | `container.ts`  | `container.test.ts`  |
| LIST-05 | Er is geen persistente disk-opslag voor scans (alleen geheugen/sessie).      | `scan-store.ts` | —                    |

## Randgevallen en bewuste keuzes

- Samenvatting in de lijst gebruikt subset van velden (`listingSummary`).
- Niets wordt naar een API gestuurd (open vraag 1).

## Open vragen

- [open-vragen.md](../functioneel/open-vragen.md) nr. 1.
