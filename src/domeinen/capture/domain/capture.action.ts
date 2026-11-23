import type { ResultFormDraft } from './draft-from-labels';
import type { Size } from './frame-crop';
import type { InterpretLabelsResult } from './interpret-labels';

export type CaptureMode = 'clothing' | 'textLabel';
export type FlashMode = 'off' | 'on';

export type CaptureErrorKey =
  | 'capture.errors.classify'
  | 'capture.errors.capture'
  | 'capture.errors.crop'
  | 'capture.errors.recognize';

export type CapturePhase =
  | { kind: 'camera' }
  | { kind: 'align'; uri: string; imageSize: Size }
  | { kind: 'classifying'; uri: string }
  | { kind: 'recognizing'; uri: string }
  | { kind: 'result'; result: InterpretLabelsResult }
  | { kind: 'error'; uri: string | null; messageKey: CaptureErrorKey };

/** Local capture UI: phase machine, flash, mode, and result-form draft. */
export type CaptureUiState = {
  phase: CapturePhase;
  flash: FlashMode;
  form: ResultFormDraft | null;
  captureMode: CaptureMode;
};

export const CaptureActionType = {
  ShowCamera: 'showCamera',
  ShowAlign: 'showAlign',
  ShowRecognizing: 'showRecognizing',
  ShowClassifying: 'showClassifying',
  ShowResult: 'showResult',
  ShowError: 'showError',
  FlashToggled: 'flashToggled',
  CaptureModeChanged: 'captureModeChanged',
  FormFieldChanged: 'formFieldChanged',
  Reset: 'reset',
} as const;

export type CaptureAction =
  | { type: typeof CaptureActionType.ShowCamera }
  | { type: typeof CaptureActionType.ShowAlign; uri: string; imageSize: Size }
  | { type: typeof CaptureActionType.ShowRecognizing; uri: string }
  | { type: typeof CaptureActionType.ShowClassifying; uri: string }
  | {
      type: typeof CaptureActionType.ShowResult;
      result: InterpretLabelsResult;
      draft: ResultFormDraft;
    }
  | {
      type: typeof CaptureActionType.ShowError;
      uri: string | null;
      messageKey: CaptureErrorKey;
      /** When true, drops the result draft (classify failures). */
      clearForm: boolean;
    }
  | { type: typeof CaptureActionType.FlashToggled }
  | { type: typeof CaptureActionType.CaptureModeChanged; mode: CaptureMode }
  | {
      type: typeof CaptureActionType.FormFieldChanged;
      field: keyof ResultFormDraft;
      value: ResultFormDraft[keyof ResultFormDraft];
    }
  | { type: typeof CaptureActionType.Reset };

export function createInitialCaptureState(): CaptureUiState {
  return {
    phase: { kind: 'camera' },
    flash: 'off',
    form: null,
    captureMode: 'clothing',
  };
}

export function captureShowCamera(): CaptureAction {
  return { type: CaptureActionType.ShowCamera };
}

export function captureShowAlign(uri: string, imageSize: Size): CaptureAction {
  return { type: CaptureActionType.ShowAlign, uri, imageSize };
}

export function captureShowRecognizing(uri: string): CaptureAction {
  return { type: CaptureActionType.ShowRecognizing, uri };
}

export function captureShowClassifying(uri: string): CaptureAction {
  return { type: CaptureActionType.ShowClassifying, uri };
}

export function captureShowResult(
  result: InterpretLabelsResult,
  draft: ResultFormDraft,
): CaptureAction {
  return { type: CaptureActionType.ShowResult, result, draft };
}

export function captureShowError(
  uri: string | null,
  messageKey: CaptureErrorKey,
  clearForm = false,
): CaptureAction {
  return { type: CaptureActionType.ShowError, uri, messageKey, clearForm };
}

export function captureFlashToggled(): CaptureAction {
  return { type: CaptureActionType.FlashToggled };
}

export function captureModeChanged(mode: CaptureMode): CaptureAction {
  return { type: CaptureActionType.CaptureModeChanged, mode };
}

export function captureFormFieldChanged<K extends keyof ResultFormDraft>(
  field: K,
  value: ResultFormDraft[K],
): CaptureAction {
  return { type: CaptureActionType.FormFieldChanged, field, value };
}

export function captureReset(): CaptureAction {
  return { type: CaptureActionType.Reset };
}

export function captureReducer(state: CaptureUiState, action: CaptureAction): CaptureUiState {
  switch (action.type) {
    case CaptureActionType.ShowCamera:
      return { ...state, phase: { kind: 'camera' } };
    case CaptureActionType.ShowAlign:
      return {
        ...state,
        phase: { kind: 'align', uri: action.uri, imageSize: action.imageSize },
      };
    case CaptureActionType.ShowRecognizing:
      return { ...state, phase: { kind: 'recognizing', uri: action.uri } };
    case CaptureActionType.ShowClassifying:
      return { ...state, phase: { kind: 'classifying', uri: action.uri } };
    case CaptureActionType.ShowResult:
      return {
        ...state,
        form: action.draft,
        phase: { kind: 'result', result: action.result },
      };
    case CaptureActionType.ShowError:
      return {
        ...state,
        form: action.clearForm ? null : state.form,
        phase: { kind: 'error', uri: action.uri, messageKey: action.messageKey },
      };
    case CaptureActionType.FlashToggled:
      return { ...state, flash: state.flash === 'on' ? 'off' : 'on' };
    case CaptureActionType.CaptureModeChanged:
      return { ...state, captureMode: action.mode };
    case CaptureActionType.FormFieldChanged: {
      if (state.form === null) return state;
      return {
        ...state,
        form: { ...state.form, [action.field]: action.value },
      };
    }
    case CaptureActionType.Reset:
      return {
        ...state,
        form: null,
        captureMode: 'clothing',
        phase: { kind: 'camera' },
      };
  }
}
