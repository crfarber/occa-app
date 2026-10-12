import { interpretLabels, type InterpretLabelsResult, type RawLabel } from './interpret-labels';

/**
 * Merges classifier output from several overview photos into one draft.
 * Label photos are not classified and must not be passed in.
 */
export function mergeInterpretResults(
  results: readonly InterpretLabelsResult[],
): InterpretLabelsResult {
  if (results.length === 0) {
    return interpretLabels([]);
  }
  if (results.length === 1) {
    const only = results[0];
    return only ?? interpretLabels([]);
  }

  const mergedLabels = dedupeLabels(results.flatMap((result) => result.labels));
  return interpretLabels(mergedLabels);
}

function dedupeLabels(labels: readonly RawLabel[]): RawLabel[] {
  const bestByText = new Map<string, RawLabel>();
  for (const label of labels) {
    const key = label.text.trim().toLowerCase();
    if (key === '') {
      continue;
    }
    const previous = bestByText.get(key);
    if (previous === undefined || label.confidence > previous.confidence) {
      bestByText.set(key, label);
    }
  }
  const merged = [...bestByText.values()];
  merged.sort((a, b) => b.confidence - a.confidence);
  return merged;
}
