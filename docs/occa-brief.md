# Occa – projectbeschrijving

Productnaam: **Occa**.

## 1. Het idee

Een mobiele app (Expo / React Native) waarmee een **vintage kledingwinkel** tweedehands kleding, schoenen en accessoires veel sneller in de webshop krijgt.

De medewerker maakt alleen foto's. De app en de AI bepalen samen wat het item is (type, kleur, merk, maat, materiaal, conditie, periode) en schrijven een verkooptekst. De medewerker **controleert** in plaats van **invult**.

Kenmerken van het domein:

- Altijd kleding, schoenen of accessoires.
- Vintage: labels ontbreken vaak, zijn vervaagd of afgeknipt. Ontbrekende informatie is normaal, niet een fout.
- Verzonnen gegevens zijn erger dan lege velden. Liever `null` dan raden.

Doel op termijn: white-label product dat aan meerdere winkels wordt aangeboden per abonnement (multi-tenant).

## 2. De gebruikersflow

1. Medewerker maakt 1–5 foto's van één item: overzicht, en indien aanwezig label/waslabel/details.
2. Tikt op **"Volgende"** en fotografeert direct het volgende item. Niet wachten.
3. Per item draait **op de telefoon**: categorie-herkenning (eigen TFLite-model) en tekstherkenning op het label (OCR).
4. Daarna gaat het item **op de achtergrond** naar de backend, die het cloudmodel aanroept.
5. In het overzicht verschijnt bij elk item een **status-icoon**: bezig, klaar, klaar maar onvolledig, mislukt.
6. Tikken op een item opent een **popup/sheet** met de gevonden gegevens. Onzekere velden zijn gemarkeerd. De medewerker past aan en keurt goed.
7. Goedgekeurde items gaan naar de database, later naar de webshop.

Belangrijkste scherm: de controle-popup. Daar zit de snelheidswinst.

## 3. Architectuur

Het platformplaatje (API, database, opslag, AI-verwerking, omgevingen) staat op één plek: `techniek.md` in de Drive-map Occa/Techniek (repo-kopie: [techniek.md](techniek.md) en platform `docs/product/techniek.md`). Kort, voor deze app:

```
Expo app (dev build)
  ├─ camera / foto's
  ├─ op toestel: categorie (TFLite via ML Kit), OCR label, label-parsing, foto verkleinen
  ├─ lokale wachtrij (blijft werken bij slechte verbinding / app op achtergrond)
  └─ upload ──► Next.js /api/v1/shop (partner, Vercel)
                  ├─ foto's via signed URL naar Supabase Storage
                  ├─ concept + fototaak in Supabase (Postgres)
                  └─ concept-worker ──► uitknippen, kleur, korte omschrijving (zonder Mistral)
                                  └─ Mistral als tweede stap ──► app leest de status
```

Regels:

- **De app roept nooit zelf een AI-model aan.** Geen API-keys in de app. App → eigen API → worker of Mistral.
- De API antwoordt direct; verwerking gebeurt op de achtergrond via een wachtrij.
- Hosting: Vercel (Next.js), Supabase (EU), de concept-worker als Docker-image op GitHub Actions. Omgevingen: lokaal, test, acceptatie, productie (zie `techniek.md`, hoofdstuk Omgevingen).

## 4. Wat op de telefoon gebeurt (vóór de cloud)

Doel: zoveel mogelijk gratis en offline doen, de cloudcall goedkoper en betrouwbaarder maken.

| Stap                    | Hoe                                                                             | Levert op                        |
| ----------------------- | ------------------------------------------------------------------------------- | -------------------------------- |
| Foto verkleinen         | `expo-image-manipulator`, lange kant ~1024 px, JPEG ~0.8                        | minder tokens en upload          |
| Categorie               | eigen TFLite-model via ML Kit Image Labeling (custom model)                     | `trui`, `vest`, `jas`, … + score |
| OCR label               | ML Kit Text Recognition                                                         | ruwe labeltekst                  |
| Welke foto is het label | foto met veel OCR-tekst = waarschijnlijk label                                  | `photo_roles` hint               |
| Maat                    | regex op OCR-tekst: S/M/L/XL, EU 38, W32 L34, schoenmaten                       | `size_label` kandidaat           |
| Materiaal               | regex op percentages ("100% cotton", "60% katoen 40% polyester") + vertaaltabel | `material` kandidaat             |
| Merk                    | fuzzy match OCR-tekst tegen merkenlijst                                         | `brand` kandidaat                |
| Kwaliteit               | (later) wazig/donker detecteren, direct opnieuw laten maken                     | minder mislukte items            |

Alles wat de telefoon vindt, gaat als **hint** mee naar de cloud, met de bron erbij (`ocr`, `classifier`, `manual`). Het cloudmodel heeft het laatste woord, maar de app toont waar een waarde vandaan komt.

### Categoriemodel (TFLite)

- Eigen beeldclassificatie met de categorieën van de winkel (`trui`, `vest`, `overhemd_blouse`, `jas`, `broek`, `rok`, `jurk`, `schoenen`, `tas`, `accessoire`, …).
- Getraind met `training/train.py`: foto's per map (mapnaam = categorie), transfer learning op MobileNetV3Small.
- Export: `occa_category.tflite` (~1.2 MB int8/uint8) + `labels.json` (index → categorie).
- **Standaard int8** voor ML Kit (UINT8-input, geen metadata nodig). Float16
  (`train.py --quantize float16`) scoort hoger op desktop-eval (~75% vs ~57%) maar heeft
  float32-I/O zonder NormalizationOptions — ML Kit faalt dan met “Recognising the photo failed”.
- Het model heeft **geen labelmap in de metadata**: de app vertaalt `index` naar een categorie via `labels.json`. Gebruik niet het `text`-veld van ML Kit.
- Het ML Kit-basismodel (430 labels) is niet geschikt: het kent wel `Jacket`, maar geen trui, blouse of rok.

### Expo-randvoorwaarden

- **Development build verplicht** (`expo-dev-client`). ML Kit werkt niet in Expo Go.
- `metro.config.js`: `config.resolver.assetExts.push("tflite")`.
- Pakketten (Infinite Red): `@infinitered/react-native-mlkit-image-labeling` + `expo-asset`, en `@infinitered/react-native-mlkit-text-recognition`.
  - Image labeling: `useImageLabelingModels(MODELS)` laadt het model; `MODELS` moet een constante op moduleniveau zijn (anders herlaadt het steeds). Daarna `models.category?.classifyImage(uri)` → `[{ text, index, confidence }]`.
  - Text recognition: `recognizeText(uri)` → `{ text, blocks[] }`.
  - **Risico:** de huidige versies hangen af van verschillende versies van `@infinitered/react-native-mlkit-core` (5.0.0 vs 3.1.0). Controleer met `npx expo-doctor` en een native build of dit botst. Alternatief voor OCR: een ander ML Kit OCR-pakket.
- Gebruik `npx expo install` voor pakketten, zodat versies bij de Expo SDK passen.

## 5. Het cloudmodel (Mistral, via het platform)

Het platform gebruikt Mistral (EU) voor merk, materiaal, conditie en omschrijving; de huidige kosten en instellingen staan in `techniek.md` en de unit economics in Drive. Het voorstel is dat een artikel uit de app eerst een concept zonder Mistral wordt en Mistral een tweede stap is (`techniek.md`, "Concept zonder Mistral").

- Invoer per call: verkleinde of bijgesneden foto's, OCR-tekst, hints van de telefoon, handmatig ingevulde velden.
- "Onbekend" = `null`. Liever leeg dan verzonnen.
- `ai/instructions.md` en `ai/schema.json` in deze repo zijn de eerdere opzet uit de POC; het schema dat het platform gebruikt, is leidend.

Het schema is de bron van waarheid voor de app-types, de database en de webshop-mapping. Houd ze gelijk (bij voorkeur types genereren uit het schema).

## 6. Datamodel (POC, simpel)

```
Item
  id, tenantId, status (capturing | queued | processing | ready | incomplete | failed | approved)
  createdAt, approvedAt
  ai: <object volgens schema.json>
  hints: { category?, categoryScore?, ocrText?, size?, material?, brand?, source per veld }
  final: <goedgekeurde waarden na controle>
  corrections: velden die de medewerker heeft aangepast (AI-voorstel vs eindwaarde)

Photo
  id, itemId, uri, role, keepForWebshop (bool), createdAt
```

- Bewaar **altijd** het AI-voorstel én de gecorrigeerde versie. Dat is later de trainingsdata voor een beter model.
- `tenantId` vanaf dag één, ook met één klant.

## 7. Foto's en opslag

- Per item 1–5 foto's voor analyse; daarvan worden er ~2 bewaard voor de webshop.
- Analysefoto's die niet voor de webshop zijn: **na 24 uur verwijderen** (in Supabase Storage nog in te richten; zie `techniek.md`).
- Webshopfoto's: ~0,6 MB per item. Als de webshop de foto's zelf host, kunnen ook die na export weg.

## 8. Niet doen

- Geen API-keys of modelaanroepen vanuit de app.
- Geen merk, maat of materiaal verzinnen. Leeg is beter.
- Niet blokkeren tijdens fotograferen: alles wat traag is, gaat via de wachtrij.
- Geen Expo Go-only oplossingen; alles moet werken in een development build.
- Niet het ML Kit-`text`-veld gebruiken voor de categorie; altijd `index` → `labels.json`.

## 9. Fasering

1. **AI-test zonder app:** gedaan op het platform met Mistral (72 foto's, meerdere modellen en resoluties; zie de unit economics in Drive).
2. **App-POC:** foto's → "Volgende" → wachtrij → status-icoon → controle-popup → opslaan.
3. **Op toestel:** OCR + label-parsing, daarna eigen categoriemodel zodra er genoeg foto's zijn (100–500 per categorie).
4. **Test met één winkel:** tijd per item, correctieratio.
5. Later: webshop-koppelingen (Shopify, WooCommerce, Lightspeed), multi-tenant, abonnementen, prijssuggesties.

## 10. Open vragen

- Hosting: besloten op Vercel en Supabase (zie `techniek.md`); open is nog waar de concept-worker op termijn draait (GitHub Actions of Scaleway).
- Welke webshop(s) gebruiken de eerste winkels?
- Maten bij vintage: label-maat, afmetingen (oksel-oksel, lengte), of beide?
- Hoe groeperen we foto's per item: altijd expliciet via "Volgende" (huidige keuze), of later automatisch?
- Eén app voor alle winkels (branding via login) of builds per klant?
