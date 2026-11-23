import { useCallback, useRef } from 'react';
import type { TextInput } from 'react-native';
import { fieldReturnKeyType, resolveFieldSubmit, type FieldReturnKey } from './form-chain';

type FieldOptions = {
  multiline?: boolean;
  /** Return key on the last single-line field. Defaults to `done`. */
  lastAction?: Exclude<FieldReturnKey, 'next' | 'default'>;
};

type FieldProps = {
  inputRef: (node: TextInput | null) => void;
  returnKeyType: FieldReturnKey;
  /** Keeps the keyboard open while moving to the next field. */
  submitBehavior?: 'submit';
  onSubmitEditing?: () => void;
};

type UseFieldChainOptions = {
  /** Called when the user presses return on the last single-line field. */
  onSubmit?: () => void;
};

/**
 * Links a fixed number of text fields so "Next" focuses the next one and the
 * last field can submit. Spread `{...chain.field(i)}` onto each `TextField`.
 */
export function useFieldChain(count: number, options: UseFieldChainOptions = {}) {
  const refs = useRef<Array<TextInput | null>>(Array.from({ length: count }, () => null));
  const onSubmitRef = useRef(options.onSubmit);
  onSubmitRef.current = options.onSubmit;

  const field = useCallback(
    (index: number, fieldOptions: FieldOptions = {}): FieldProps => {
      const multiline = fieldOptions.multiline === true;
      const action = resolveFieldSubmit({ index, count, multiline });
      return {
        inputRef: (node) => {
          refs.current[index] = node;
        },
        returnKeyType: fieldReturnKeyType({
          index,
          count,
          multiline,
          lastAction: fieldOptions.lastAction,
        }),
        ...(multiline
          ? {}
          : {
              submitBehavior: 'submit' as const,
              onSubmitEditing: () => {
                if (action === 'focus-next') {
                  refs.current[index + 1]?.focus();
                  return;
                }
                if (action === 'submit') {
                  onSubmitRef.current?.();
                }
              },
            }),
      };
    },
    [count],
  );

  return { field };
}
