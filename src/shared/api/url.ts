export type QueryValue = string | number | boolean | null | undefined | readonly string[];

/**
 * Builds a request URL by hand. React Native's URL/URLSearchParams support is partial,
 * so we do not depend on it. `+` in phone numbers is encoded as %2B, as the backend expects.
 * Arrays become repeated keys (`size=M&size=L`); empty arrays are skipped.
 */
export function buildUrl(
  baseUrl: string,
  path: string,
  query?: Record<string, QueryValue>,
): string {
  const base = baseUrl.replace(/\/+$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;

  const pairs: string[] = [];
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      for (const entry of value) {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(entry))}`);
      }
      continue;
    }
    pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }

  if (pairs.length === 0) {
    return `${base}${suffix}`;
  }
  const separator = suffix.includes('?') ? '&' : '?';
  return `${base}${suffix}${separator}${pairs.join('&')}`;
}

/** application/x-www-form-urlencoded body. */
export function encodeForm(fields: Record<string, string>): string {
  return Object.entries(fields)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}
