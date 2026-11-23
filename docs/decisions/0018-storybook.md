# 0018. Storybook als webcatalogus, tokens als brug naar web

**Status:** aangenomen.

## Context

De app is React Native. Mensen moeten de look-and-feel kunnen bekijken zonder simulator, en een Next.js-project moet dezelfde uitstraling kunnen overnemen. De web-boilerplate gebruikt Tailwind en shadcn; deze app gebruikt `StyleSheet` en tokens ([0007](0007-styling.md)).

## Besluit

- Storybook draait in de browser via `@storybook/react-native-web-vite`. Het toont de primitieven in `src/shared/ui`, niet de schermen die camera, sessie of navigatie nodig hebben.
- Er komt geen gedeelde componentenbibliotheek voor React Native én Next.js. `View` en `StyleSheet` horen niet in een webproject.
- `src/shared/ui/remi-tokens.ts` blijft de bron van kleur, maat, radius en typografie. Een Next.js-project neemt die waarden over (bijvoorbeeld als CSS-variabelen) en bouwt zijn eigen componenten.
- Storybook vervangt de componenttests niet. Die blijven het latere `jest-expo`-spoor uit [0003](0003-vitest-in-node.md).

## Gevolgen

- `pnpm run storybook` opent de catalogus. `pnpm run build-storybook` maakt een statische site in `storybook-static/`.
- Stories staan naast de component (`*.stories.tsx`) en tellen niet mee voor de Vitest-dekking.
- Een on-device Storybook komt er pas bij als een component op het web te ver afwijkt (Reanimated, native modules).
