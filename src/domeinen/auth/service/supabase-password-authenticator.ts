import { z } from 'zod';
import { AuthExpiredError } from '@/shared/api/errors';
import type { Logger } from '@/shared/logging/logger';
import type { Clock } from '@/shared/platform/ports';
import { err, ok } from '@/shared/result';
import type { Authenticator, SignInCredentials } from './auth-service';

const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  expires_in: z.number().int().positive(),
});

export type SupabasePasswordAuthenticatorDeps = {
  url: string;
  anonKey: string;
  fetch: typeof fetch;
  clock: Clock;
  logger?: Logger;
};

/**
 * Signs in with e-mail and password against Supabase Auth (same accounts as partner).
 * Talks to `{url}/auth/v1/token` with the anon key; the API base URL is not used here.
 */
export function createSupabasePasswordAuthenticator(
  deps: SupabasePasswordAuthenticatorDeps,
): Authenticator {
  const tokenUrl = `${deps.url.replace(/\/+$/, '')}/auth/v1/token`;

  async function requestToken(
    grantType: 'password' | 'refresh_token',
    body: Record<string, string>,
  ): Promise<Response> {
    return deps.fetch(`${tokenUrl}?grant_type=${grantType}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        apikey: deps.anonKey,
      },
      body: JSON.stringify(body),
    });
  }

  function toTokenSet(payload: z.infer<typeof tokenResponseSchema>) {
    return {
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token,
      expiresAt: deps.clock.now() + payload.expires_in * 1000,
    };
  }

  return {
    method: 'supabase',

    async signIn(credentials?: SignInCredentials) {
      // Autofill / paste often insert spaces; strip all whitespace in the address.
      const email = credentials?.email.replace(/\s+/g, '') ?? '';
      if (credentials === undefined || email === '' || credentials.password === '') {
        deps.logger?.warn('auth', 'Sign-in refused: missing credentials', {
          hasCredentials: credentials !== undefined,
          emailLength: email.length,
          emailHasAt: email.includes('@'),
          passwordLength: credentials?.password.length ?? 0,
        });
        return err({ kind: 'failed' });
      }

      let response: Response;
      try {
        response = await requestToken('password', {
          email,
          password: credentials.password,
        });
      } catch (cause) {
        deps.logger?.warn('auth', 'Sign-in network error', {
          emailLength: email.length,
          emailHasAt: email.includes('@'),
          cause: cause instanceof Error ? cause.message : 'unknown',
        });
        return err({ kind: 'failed' });
      }

      if (!response.ok) {
        let errorCode: string | undefined;
        try {
          const body: unknown = await response.json();
          if (
            typeof body === 'object' &&
            body !== null &&
            'error_code' in body &&
            typeof body.error_code === 'string'
          ) {
            errorCode = body.error_code;
          }
        } catch {
          // ignore body parse
        }
        deps.logger?.warn('auth', 'Sign-in refused by Supabase', {
          status: response.status,
          errorCode: errorCode ?? null,
          emailLength: email.length,
          emailHasAt: email.includes('@'),
        });
        return err({ kind: 'failed' });
      }

      let json: unknown;
      try {
        json = await response.json();
      } catch {
        deps.logger?.warn('auth', 'Sign-in response was not JSON');
        return err({ kind: 'failed' });
      }

      const parsed = tokenResponseSchema.safeParse(json);
      if (!parsed.success) {
        deps.logger?.warn('auth', 'Sign-in response shape unexpected');
        return err({ kind: 'failed' });
      }

      return ok(toTokenSet(parsed.data));
    },

    async refresh(refreshToken: string) {
      let response: Response;
      try {
        response = await requestToken('refresh_token', { refresh_token: refreshToken });
      } catch (cause) {
        throw new AuthExpiredError('refresh-rejected', { cause });
      }

      if (response.status === 401 || response.status === 403) {
        throw new AuthExpiredError('refresh-rejected');
      }
      if (!response.ok) {
        throw new AuthExpiredError('refresh-rejected');
      }

      let json: unknown;
      try {
        json = await response.json();
      } catch (cause) {
        throw new AuthExpiredError('refresh-rejected', { cause });
      }

      const parsed = tokenResponseSchema.safeParse(json);
      if (!parsed.success) {
        throw new AuthExpiredError('refresh-rejected');
      }

      return toTokenSet(parsed.data);
    },
  };
}
