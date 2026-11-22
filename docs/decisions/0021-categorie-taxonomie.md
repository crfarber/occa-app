# 0021. Categorie-taxonomie: platformslugs, geen UUID’s

**Status:** aangenomen.

## Besluit

1. **Bron van waarheid** voor opgeslagen `item.category` is de gesloten typelijst in Occa Next.js (`@occa/core` `CATEGORIES`). Geen UUID’s voor types.
2. **ID ≠ label.** Opslag is altijd een canonieke platformslug (`trui`, `sneaker`). Zichtbare tekst: in de app via `capture.category.*` (i18n); op partner/web via `@occa/core` vocabulary + `?locale=`.
3. **Twee lagen.** Capture houdt grove buckets (`PRODUCT_CATEGORIES`: `top`, `broek`, `schoenen`, …) voor model en snelle UI. Omzetting naar platform gebeurt alleen aan de submission-grens via `platformCategoryOf` in `category-map.ts`.
4. **Feit vs voorstel.** Keuze van de vrijwilliger → `fields.category`. Alleen herkenning zonder override → `suggestions.category` / `category_ai`. Een guess wordt nooit stil een website-feit.
5. **Alleen canonieke slugs outbound.** Synoniemen (`sneakers`) horen in platform-`CATEGORY_SYNONYMS`, niet als opslagwaarde vanuit de app. Voorbeeld: `schoenen` → `sneaker`.
6. **Gelijkheid over platformen** via een gedeelde allowlist:
   - Wire: Occa `packages/contracts` `PLATFORM_CATEGORIES` (set-gelijk aan core; CI-test).
   - Vendor in deze app: `src/domeinen/submission/domain/platform-categories.ts` (kopie; niet handmatig uitbreiden).
   - Guard: elke waarde in `TO_PLATFORM` moet in die allowlist zitten (`category-map.test.ts`).

### Wijzigingsritueel

1. Pas `@occa/core` aan (+ migratie/synoniemen indien nodig).
2. Werk contracts-`PLATFORM_CATEGORIES` bij tot de platformtest groen is.
3. Kopieer de allowlist naar de Expo-vendorfile; pas `category-map` / training aan als buckets of mappings wijzigen.
4. Expo-CI groen = outbound mapping is nog canonieke platformvocabulaire.

Geen runtime-sync vanaf de API voor de capture-map (offline/on-device). Inventory-labels blijven van de API (`?locale=`).

### Nieuw type (duikpak-voorbeeld)

- **Meestal:** synoniem onder bestaand platformtype (`duikpak` → `zwemkleding`) in `@occa/core` — geen nieuwe Expo-bucket.
- **Echt nieuw type:** core → contracts-allowlist → Expo-vendor; Inboedel krijgt het via `item-options` zonder app-bucket. Capture-bucket + i18n + `category-map` alleen als de scan-UI het moet tonen; model/training apart.

Uitwerking: [wiki/categorie-taxonomie.md](../wiki/categorie-taxonomie.md) · platform `docs/product/categorie-taxonomie.md`.

## Waarom

Zonder gedeelde allowlist en tests lopen telefoon en web stil uit elkaar (zoals `sneakers` vs `sneaker`). UUID’s maken logs, training en modelklassen onleesbaar en lossen sync niet op. Grove buckets houden de scan-UI snel; de volle typelijst blijft op het platform.

## Heroverwegen als

- De Expo-app een echte dependency op `@occa/contracts` krijgt (dan verdwijnt de vendor-kopie).
- Capture de volle 59 types moet kiezen (dan verdwijnt of krimpt `category-map`).
- De typelijst ooit UUID’s of locale-afhankelijke opslag zou gebruiken (nu expliciet afgewezen).
