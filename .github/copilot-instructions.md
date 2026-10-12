# Copilot-instructies – Occa

Lees eerst `docs/occa-brief.md` voor het volledige idee, de flow en de architectuur.

## In het kort

Expo / React Native-app waarmee vintage kledingwinkels items online zetten door alleen foto's te maken. De telefoon doet categorie-herkenning (eigen TFLite-model via ML Kit) en OCR van het label; daarna verwerkt een cloudmodel (Azure AI Foundry, via onze eigen .NET-backend) het item tot gestructureerde JSON. De medewerker controleert en keurt goed.

## Harde regels

- Development build (`expo-dev-client`), geen Expo Go-only oplossingen.
- Pakketten installeren met `npx expo install`.
- De app roept **nooit** zelf een AI-model aan en bevat **geen** API-keys. Altijd via de backend.
- Fotograferen mag nooit blokkeren: verwerking loopt via een lokale wachtrij op de achtergrond.
- Liever `null` dan een verzonnen merk, maat of materiaal.
- Categorie uit ML Kit: gebruik `index` en vertaal via `labels.json`, niet het `text`-veld.
- `ai/schema.json` is de bron van waarheid voor types, database en webshop-mapping.
- Bewaar zowel het AI-voorstel als de door de gebruiker gecorrigeerde waarden.
- Elke entiteit heeft een `tenantId`, ook al is er nu één klant.

## Code

- TypeScript, strict.
- Logica op het toestel (label-parsing, merk-matching, payload bouwen) als pure functies met unit tests, los van UI en native modules.
- UI-teksten in het Nederlands, code en identifiers in het Engels.
- Run `npx tsc --noEmit` en `npx expo lint` voordat iets klaar is.
