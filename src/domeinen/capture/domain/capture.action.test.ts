import { describe, expect, it } from 'vitest';
import type { InterpretLabelsResult } from './interpret-labels';
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
} from './capture.action';

const emptyResult: InterpretLabelsResult = {
  category: { kind: 'unknown' },
  colors: [],
  pattern: { kind: 'unknown' },
  subtype: null,
  labels: [],
  uncertainFields: ['category', 'colors', 'pattern', 'subtype'],
};

const draft = {
  category: 'jas' as const,
  color: 'rood',
  subcategory: '',
  pattern: 'effen' as const,
};

describe('captureReducer', () => {
  it('starts on the camera with clothing mode', () => {
    expect(createInitialCaptureState()).toEqual({
      phase: { kind: 'camera' },
      flash: 'off',
      form: null,
      captureMode: 'clothing',
    });
  });

  it('moves through align, recognizing, and back to camera', () => {
    let state = createInitialCaptureState();
    state = captureReducer(state, captureShowAlign('file://a.jpg', { width: 100, height: 200 }));
    expect(state.phase.kind).toBe('align');
    state = captureReducer(state, captureShowRecognizing('file://b.jpg'));
    expect(state.phase).toEqual({ kind: 'recognizing', uri: 'file://b.jpg' });
    state = captureReducer(state, captureShowCamera());
    expect(state.phase.kind).toBe('camera');
  });

  it('stores the result draft after classifying', () => {
    let state = createInitialCaptureState();
    state = captureReducer(state, captureShowClassifying('file://c.jpg'));
    state = captureReducer(state, captureShowResult(emptyResult, draft));
    expect(state.phase.kind).toBe('result');
    expect(state.form).toEqual(draft);
  });

  it('clears the form only when showError asks for it', () => {
    let state = captureReducer(createInitialCaptureState(), captureShowResult(emptyResult, draft));
    state = captureReducer(state, captureShowError('file://x.jpg', 'capture.errors.crop'));
    expect(state.form).toEqual(draft);
    state = captureReducer(state, captureShowError(null, 'capture.errors.classify', true));
    expect(state.form).toBeNull();
    expect(state.phase.kind).toBe('error');
  });

  it('toggles flash and changes capture mode', () => {
    let state = createInitialCaptureState();
    state = captureReducer(state, captureFlashToggled());
    expect(state.flash).toBe('on');
    state = captureReducer(state, captureModeChanged('textLabel'));
    expect(state.captureMode).toBe('textLabel');
  });

  it('updates a form field when a draft exists', () => {
    let state = captureReducer(createInitialCaptureState(), captureShowResult(emptyResult, draft));
    state = captureReducer(state, captureFormFieldChanged('color', 'blauw'));
    expect(state.form?.color).toBe('blauw');
  });

  it('ignores form field changes without a draft', () => {
    const initial = createInitialCaptureState();
    expect(captureReducer(initial, captureFormFieldChanged('color', 'blauw'))).toBe(initial);
  });

  it('resets form and mode but keeps flash', () => {
    let state = captureReducer(createInitialCaptureState(), captureFlashToggled());
    state = captureReducer(state, captureModeChanged('textLabel'));
    state = captureReducer(state, captureShowResult(emptyResult, draft));
    state = captureReducer(state, captureReset());
    expect(state).toEqual({
      phase: { kind: 'camera' },
      flash: 'on',
      form: null,
      captureMode: 'clothing',
    });
  });
});
