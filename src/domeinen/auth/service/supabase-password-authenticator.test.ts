import { describe, expect, it, vi } from 'vitest';
import { AuthExpiredError } from '@/shared/api/errors';
import { createFakeClock } from '@/test/fakes';
import { createSupabasePasswordAuthenticator } from './supabase-password-authenticator';

const NOW = Date.UTC(2026, 10, 22, 12, 0, 0);

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('createSupabasePasswordAuthenticator', () => {
  it('signs in with e-mail and password and maps expires_in to expiresAt', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({
        access_token: 'access-1',
        refresh_token: 'refresh-1',
        expires_in: 3600,
      }),
    );
    const auth = createSupabasePasswordAuthenticator({
      url: 'https://example.supabase.co',
      anonKey: 'anon',
      fetch: fetchImpl as typeof fetch,
      clock: createFakeClock(NOW),
    });

    const result = await auth.signIn({ email: 'a@b.nl', password: 'secret' });

    expect(result).toEqual({
      ok: true,
      value: {
        accessToken: 'access-1',
        refreshToken: 'refresh-1',
        expiresAt: NOW + 3_600_000,
      },
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://example.supabase.co/auth/v1/token?grant_type=password',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ apikey: 'anon' }),
      }),
    );
  });

  it('fails when credentials are missing', async () => {
    const auth = createSupabasePasswordAuthenticator({
      url: 'https://example.supabase.co',
      anonKey: 'anon',
      fetch: vi.fn() as unknown as typeof fetch,
      clock: createFakeClock(NOW),
    });

    expect(await auth.signIn()).toEqual({ ok: false, error: { kind: 'failed' } });
  });

  it('strips spaces from the e-mail before calling Supabase', async () => {
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      jsonResponse({
        access_token: 'access-1',
        refresh_token: 'refresh-1',
        expires_in: 3600,
      }),
    );
    const auth = createSupabasePasswordAuthenticator({
      url: 'https://example.supabase.co',
      anonKey: 'anon',
      fetch: fetchImpl as typeof fetch,
      clock: createFakeClock(NOW),
    });

    await auth.signIn({ email: ' a@b .nl ', password: 'secret' });

    expect(JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body))).toEqual({
      email: 'a@b.nl',
      password: 'secret',
    });
  });

  it('fails when Supabase refuses the password', async () => {
    const auth = createSupabasePasswordAuthenticator({
      url: 'https://example.supabase.co',
      anonKey: 'anon',
      fetch: vi.fn(async () => jsonResponse({ error: 'invalid_grant' }, 400)) as typeof fetch,
      clock: createFakeClock(NOW),
    });

    expect(await auth.signIn({ email: 'a@b.nl', password: 'wrong' })).toEqual({
      ok: false,
      error: { kind: 'failed' },
    });
  });

  it('refreshes with the refresh token', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({
        access_token: 'access-2',
        refresh_token: 'refresh-2',
        expires_in: 1800,
      }),
    );
    const auth = createSupabasePasswordAuthenticator({
      url: 'https://example.supabase.co/',
      anonKey: 'anon',
      fetch: fetchImpl as typeof fetch,
      clock: createFakeClock(NOW),
    });

    await expect(auth.refresh('refresh-1')).resolves.toEqual({
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
      expiresAt: NOW + 1_800_000,
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      expect.stringContaining('grant_type=refresh_token'),
      expect.any(Object),
    );
  });

  it('throws AuthExpiredError when refresh is refused', async () => {
    const auth = createSupabasePasswordAuthenticator({
      url: 'https://example.supabase.co',
      anonKey: 'anon',
      fetch: vi.fn(async () => jsonResponse({}, 401)) as typeof fetch,
      clock: createFakeClock(NOW),
    });

    await expect(auth.refresh('dead')).rejects.toBeInstanceOf(AuthExpiredError);
  });
});
