import { describe, expect, it } from 'vitest';
import {
  createInitialLoginState,
  loginEmailChanged,
  loginPasswordChanged,
  loginReducer,
  loginSignInFailed,
  loginSignInFinished,
  loginSignInStarted,
} from './login.action';

describe('loginReducer', () => {
  it('starts empty and idle', () => {
    expect(createInitialLoginState()).toEqual({
      busy: false,
      messageKey: null,
      email: '',
      password: '',
    });
  });

  it('updates email and password', () => {
    let state = createInitialLoginState();
    state = loginReducer(state, loginEmailChanged('a@b.nl'));
    state = loginReducer(state, loginPasswordChanged('secret'));
    expect(state.email).toBe('a@b.nl');
    expect(state.password).toBe('secret');
  });

  it('clears the message and sets busy when sign-in starts', () => {
    const withError = loginReducer(
      createInitialLoginState(),
      loginSignInFailed('login.errors.failed'),
    );
    const next = loginReducer(withError, loginSignInStarted());
    expect(next).toEqual({
      busy: true,
      messageKey: null,
      email: '',
      password: '',
    });
  });

  it('clears busy after a finished attempt', () => {
    const busy = loginReducer(createInitialLoginState(), loginSignInStarted());
    expect(loginReducer(busy, loginSignInFinished()).busy).toBe(false);
  });

  it('stores a failure key and clears busy', () => {
    const busy = loginReducer(createInitialLoginState(), loginSignInStarted());
    const next = loginReducer(busy, loginSignInFailed('login.errors.unavailable'));
    expect(next.busy).toBe(false);
    expect(next.messageKey).toBe('login.errors.unavailable');
  });

  it('accepts a cancelled sign-in with no message', () => {
    const busy = loginReducer(createInitialLoginState(), loginSignInStarted());
    expect(loginReducer(busy, loginSignInFailed(null)).messageKey).toBeNull();
  });
});
