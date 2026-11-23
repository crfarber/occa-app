# 0019. Toetsenbord en formulieren

**Status:** aangenomen.

## Context

Formulieren (login, listing, later meer) worden bedekt door het toetsenbord. Een losse
`KeyboardAvoidingView` per scherm is foutgevoelig, vooral op Android met edge-to-edge.
Ook wil de medewerker met "Volgende" naar het volgende veld zonder het toetsenbord te sluiten.

## Besluit

- [`react-native-keyboard-controller`](https://kirillzyusko.github.io/react-native-keyboard-controller/)
  is de enige keyboard-laag: `KeyboardProvider` in de root, `KeyboardAwareScrollView` in
  [`Screen`](../../src/shared/ui/screen.tsx), één globale `KeyboardToolbar`, sticky footer via
  `KeyboardStickyView`.
- Velden in een keten koppelen via [`useFieldChain`](../../src/shared/ui/use-field-chain.ts)
  (returntoets Volgende / Gereed of Inloggen). Pure regels staan in `form-chain.ts`.
- Geen losse `KeyboardAvoidingView` per scherm. Nieuwe formulieren gebruiken `Screen` +
  `useFieldChain`.

## Gevolgen

- Native dependency: na installatie opnieuw `pnpm ios` / `pnpm android`.
- Storybook (web) shimmt de module via `.storybook/shims/`.
- Bottom sheets behouden hun eigen keyboard-logica (`bottom-sheet.tsx`).
