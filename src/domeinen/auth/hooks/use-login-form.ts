import { useCallback, useReducer, useRef } from 'react';
import type { Result } from '@/shared/result';
import { describeLoginFailure, type LoginFailure } from '../domain/login-failures';
import {
  createInitialLoginState,
  loginEmailChanged,
  loginPasswordChanged,
  loginReducer,
  loginSignInFailed,
  loginSignInFinished,
  loginSignInStarted,
  type LoginUiState,
} from '../domain/login.action';
import type { SignInCredentials } from '../service/auth-service';

type SignInFn = (credentials?: SignInCredentials) => Promise<Result<void, LoginFailure>>;

type UseLoginFormResult = {
  state: LoginUiState;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  /**
   * Reads the latest credentials from a ref (avoids stale closures / React Compiler),
   * then runs the authenticator.
   */
  submitSignIn: (signIn: SignInFn, needsPassword: boolean) => Promise<void>;
};

/** Local login form: credentials, busy flag, and failure message key. */
export function useLoginForm(): UseLoginFormResult {
  const [state, dispatch] = useReducer(loginReducer, undefined, createInitialLoginState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const submitSignIn = useCallback(async (signIn: SignInFn, needsPassword: boolean) => {
    const { email, password } = stateRef.current;
    dispatch(loginSignInStarted());
    const result = await signIn(needsPassword ? { email, password } : undefined);
    if (!result.ok) {
      dispatch(loginSignInFailed(describeLoginFailure(result.error)));
      return;
    }
    dispatch(loginSignInFinished());
  }, []);

  return {
    state,
    setEmail: (email) => {
      dispatch(loginEmailChanged(email));
    },
    setPassword: (password) => {
      dispatch(loginPasswordChanged(password));
    },
    submitSignIn,
  };
}
