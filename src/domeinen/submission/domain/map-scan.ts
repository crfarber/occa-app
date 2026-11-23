import type { InterpretLabelsResult, ProductCategory, ScanPhoto } from '@/domeinen/capture';
import type { ListingDraft } from '@/domeinen/capture';
import { platformCategoryOf } from './category-map';

/**
 * What the phone sends for one scan (shop create + photos, November 2026).
 * Pure: no I/O. The outbox stores this and the runner talks to the API.
 */

export type SubmissionFields = {
  category?: string | null;
  colour?: string | null;
  brand?: string | null;
  size?: string | null;
  description?: string | null;
  location?: string | null;
  priceCents?: number | null;
};

export type SubmissionSuggestions = {
  category?: string | null;
  colour?: string | null;
  brand?: string | null;
  size?: string | null;
};

export type SubmissionPhotoRole = 'main' | 'label' | 'extra';

export type SubmissionPhoto = {
  photoKey: string;
  role: SubmissionPhotoRole;
  uri: string;
};

export type SubmissionPayload = {
  clientKey: string;
  fields: SubmissionFields;
  suggestions: SubmissionSuggestions;
  photos: SubmissionPhoto[];
};

function trimmed(value: string | null | undefined): string | null {
  const text = value?.trim() ?? '';
  return text === '' ? null : text;
}

function priceCentsOf(price: string): number | null {
  const cleaned = price.trim().replace(',', '.');
  if (cleaned === '') return null;
  const euros = Number(cleaned);
  if (!Number.isFinite(euros) || euros < 0) return null;
  return Math.round(euros * 100);
}

/** Fields the volunteer filled in; empty ones stay out of the body. */
export function fieldsFromListing(listing: ListingDraft): SubmissionFields {
  const fields: SubmissionFields = {};
  const category = platformCategoryOf(listing.category as ProductCategory | '');
  if (category !== null) fields.category = category;
  const colour = trimmed(listing.color);
  if (colour !== null) fields.colour = colour;
  const brand = trimmed(listing.brand);
  if (brand !== null) fields.brand = brand;
  const size = trimmed(listing.size);
  if (size !== null) fields.size = size;
  const description = trimmed(listing.description);
  if (description !== null) fields.description = description;
  const location = trimmed(listing.shopSpot);
  if (location !== null) fields.location = location;
  const priceCents = priceCentsOf(listing.price);
  if (priceCents !== null) fields.priceCents = priceCents;
  return fields;
}

/** Guesses from on-device recognition; only what the volunteer did not override. */
export function suggestionsFromResult(
  result: InterpretLabelsResult,
  listing: ListingDraft,
): SubmissionSuggestions {
  const suggestions: SubmissionSuggestions = {};
  const category =
    result.category.kind === 'known' ? platformCategoryOf(result.category.category) : null;
  if (category !== null && trimmed(listing.category) === null) suggestions.category = category;
  const colour = result.colors[0] ?? null;
  if (colour !== null && trimmed(listing.color) === null) suggestions.colour = colour;
  return suggestions;
}

/**
 * Photos in send order: first overview is the main photo (concept worker),
 * label shots are labels, further overviews are extras. Keys are stable so a
 * retry stores the same path on the server.
 */
export function photosFromScan(photos: readonly ScanPhoto[]): SubmissionPhoto[] {
  const out: SubmissionPhoto[] = [];
  let overviewIndex = 0;
  let labelIndex = 0;
  let mainTaken = false;
  for (const photo of photos) {
    if (photo.role === 'label') {
      labelIndex += 1;
      out.push({ photoKey: `photo-label-${labelIndex}`, role: 'label', uri: photo.uri });
      continue;
    }
    overviewIndex += 1;
    if (!mainTaken) {
      mainTaken = true;
      out.push({ photoKey: `photo-main-${overviewIndex}`, role: 'main', uri: photo.uri });
    } else {
      out.push({ photoKey: `photo-extra-${overviewIndex}`, role: 'extra', uri: photo.uri });
    }
  }
  return out;
}

/** One scan → the payload the outbox keeps until the server has it. */
export function payloadFromScan(input: {
  clientKey: string;
  photos: readonly ScanPhoto[];
  result: InterpretLabelsResult;
  listing: ListingDraft;
}): SubmissionPayload {
  return {
    clientKey: input.clientKey,
    fields: fieldsFromListing(input.listing),
    suggestions: suggestionsFromResult(input.result, input.listing),
    photos: photosFromScan(input.photos),
  };
}
