/**
 * Pure rules for chaining form fields: which return key to show and what happens
 * when the user presses it. The React hook (`use-field-chain.ts`) owns the refs.
 */

export type FieldReturnKey = 'next' | 'go' | 'done' | 'send' | 'search' | 'default';

export type FieldSubmitAction = 'focus-next' | 'submit' | 'none';

/** Return key for one field in a chain of `count` fields. */
export function fieldReturnKeyType(input: {
  index: number;
  count: number;
  multiline?: boolean;
  /** On the last single-line field. Defaults to `done`. */
  lastAction?: Exclude<FieldReturnKey, 'next' | 'default'>;
}): FieldReturnKey {
  if (input.multiline) {
    return 'default';
  }
  if (input.index < input.count - 1) {
    return 'next';
  }
  return input.lastAction ?? 'done';
}

/** What pressing the return key should do for this field. */
export function resolveFieldSubmit(input: {
  index: number;
  count: number;
  multiline: boolean;
}): FieldSubmitAction {
  if (input.multiline) {
    return 'none';
  }
  if (input.index < input.count - 1) {
    return 'focus-next';
  }
  return 'submit';
}
