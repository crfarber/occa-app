/**
 * Canonical shop category slugs (vendored from Occa
 * `packages/contracts/src/shop/v1/categories.ts`).
 *
 * Do not extend by hand: copy from that contracts export after `@occa/core`
 * CATEGORIES changes. See docs/decisions/0021-categorie-taxonomie.md.
 */
export const PLATFORM_CATEGORIES = [
  'jas',
  'blazer',
  'trui',
  'vest',
  'hoodie',
  't-shirt',
  'top',
  'overhemd',
  'blouse',
  'jurk',
  'rok',
  'broek',
  'jeans',
  'korte broek',
  'jumpsuit',
  'romper',
  'pak',
  'zwemkleding',
  'ondergoed',
  'overig kleding',
  'sneaker',
  'laars',
  'nette schoen',
  'instapper',
  'pump',
  'sandaal',
  'slipper',
  'pantoffel',
  'overige schoenen',
  'handtas',
  'schoudertas',
  'shopper',
  'clutch',
  'sporttas',
  'tas',
  'rugzak',
  'koffer',
  'overige tassen',
  'riem',
  'sjaal',
  'muts',
  'pet',
  'hoed',
  'handschoenen',
  'stropdas',
  'portemonnee',
  'zonnebril',
  'bretels',
  'haaraccessoire',
  'paraplu',
  'overige accessoires',
  'horloge',
  'ketting',
  'armband',
  'ring',
  'oorbellen',
  'broche',
  'overige sieraden en horloges',
  'overig',
] as const;

export type PlatformCategory = (typeof PLATFORM_CATEGORIES)[number];

const PLATFORM_SET = new Set<string>(PLATFORM_CATEGORIES);

/** Whether a string is a canonical platform category slug. */
export function isPlatformCategory(value: string): value is PlatformCategory {
  return PLATFORM_SET.has(value);
}
