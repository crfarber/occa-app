import { useReducer } from 'react';
import type { ResultFormDraft } from '../domain/draft-from-labels';
import type { Size } from '../domain/frame-crop';
import type { InterpretLabelsResult } from '../domain/interpret-labels';
import {
  captureFlashToggled,
  captureFormFieldChanged,
  captureModeChanged,
  captureReducer,
  captureReset,
  captureShowAlign,
  captureShowCamera,
  captureShowClassifying,
  captureShowError,
  captureShowRecognizing,
  captureShowResult,
  createInitialCaptureState,
  type CaptureErrorKey,
  type CaptureMode,
  type CaptureUiState,
} from '../domain/capture.action';

type UseCaptureUiResult = {
  state: CaptureUiState;
  showCamera: () => void;
  showAlign: (uri: string, imageSize: Size) => void;
  showRecognizing: (uri: string) => void;
  showClassifying: (uri: string) => void;
  showResult: (result: InterpretLabelsResult, draft: ResultFormDraft) => void;
  showError: (uri: string | null, messageKey: CaptureErrorKey, clearForm?: boolean) => void;
  toggleFlash: () => void;
  setCaptureMode: (mode: CaptureMode) => void;
  setFormField: <K extends keyof ResultFormDraft>(field: K, value: ResultFormDraft[K]) => void;
  resetUi: () => void;
};

/** Local capture phase machine + result form (Zustand draft stays in the scan store). */
export function useCaptureUi(): UseCaptureUiResult {
  const [state, dispatch] = useReducer(captureReducer, undefined, createInitialCaptureState);

  return {
    state,
    showCamera: () => {
      dispatch(captureShowCamera());
    },
    showAlign: (uri, imageSize) => {
      dispatch(captureShowAlign(uri, imageSize));
    },
    showRecognizing: (uri) => {
      dispatch(captureShowRecognizing(uri));
    },
    showClassifying: (uri) => {
      dispatch(captureShowClassifying(uri));
    },
    showResult: (result, draft) => {
      dispatch(captureShowResult(result, draft));
    },
    showError: (uri, messageKey, clearForm = false) => {
      dispatch(captureShowError(uri, messageKey, clearForm));
    },
    toggleFlash: () => {
      dispatch(captureFlashToggled());
    },
    setCaptureMode: (mode) => {
      dispatch(captureModeChanged(mode));
    },
    setFormField: (field, value) => {
      dispatch(captureFormFieldChanged(field, value));
    },
    resetUi: () => {
      dispatch(captureReset());
    },
  };
}
