import type { LoginMessageKey } from './login-failures';

/** Ephemeral sign-in form state for one visit to the login screen. */
export type LoginUiState = {
  busy: boolean;
  messageKey: LoginMessageKey | null;
  email: string;
  password: string;
};

export const LoginActionType = {
  EmailChanged: 'emailChanged',
  PasswordChanged: 'passwordChanged',
  SignInStarted: 'signInStarted',
  SignInFinished: 'signInFinished',
  SignInFailed: 'signInFailed',
} as const;

export type LoginAction =
  | { type: typeof LoginActionType.EmailChanged; email: string }
  | { type: typeof LoginActionType.PasswordChanged; password: string }
  | { type: typeof LoginActionType.SignInStarted }
  | { type: typeof LoginActionType.SignInFinished }
  | { type: typeof LoginActionType.SignInFailed; messageKey: LoginMessageKey | null };

export function createInitialLoginState(): LoginUiState {
  return { busy: false, messageKey: null, email: '', password: '' };
}

export function loginEmailChanged(email: string): LoginAction {
  return { type: LoginActionType.EmailChanged, email };
}

export function loginPasswordChanged(password: string): LoginAction {
  return { type: LoginActionType.PasswordChanged, password };
}

export function loginSignInStarted(): LoginAction {
  return { type: LoginActionType.SignInStarted };
}

export function loginSignInFinished(): LoginAction {
  return { type: LoginActionType.SignInFinished };
}

export function loginSignInFailed(messageKey: LoginMessageKey | null): LoginAction {
  return { type: LoginActionType.SignInFailed, messageKey };
}

export function loginReducer(state: LoginUiState, action: LoginAction): LoginUiState {
  switch (action.type) {
    case LoginActionType.EmailChanged:
      return { ...state, email: action.email };
    case LoginActionType.PasswordChanged:
      return { ...state, password: action.password };
    case LoginActionType.SignInStarted:
      return { ...state, busy: true, messageKey: null };
    case LoginActionType.SignInFinished:
      return { ...state, busy: false };
    case LoginActionType.SignInFailed:
      return { ...state, busy: false, messageKey: action.messageKey };
  }
}
