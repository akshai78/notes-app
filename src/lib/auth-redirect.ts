import * as Linking from 'expo-linking';

/** Installed Code Red — used in confirmation and reset emails. */
export const APP_AUTH_REDIRECT = 'codered://welcome';

/**
 * Where Supabase should send the user after they tap Confirm / Reset.
 * Always the app scheme so the inbox does not open localhost:3000.
 * Override with EXPO_PUBLIC_AUTH_REDIRECT if you need Expo Go (exp://…).
 */
export function authRedirectUrl(): string {
  const override = process.env.EXPO_PUBLIC_AUTH_REDIRECT?.trim();
  if (override) return override;
  return APP_AUTH_REDIRECT;
}

export type AuthCallbackTokens = {
  code: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  type: string | null;
};

function pickParam(
  query: Record<string, undefined | string | string[]> | null | undefined,
  hashParams: URLSearchParams,
  key: string
): string | null {
  const raw = query?.[key];
  const fromQuery = Array.isArray(raw) ? raw[0] : raw;
  if (typeof fromQuery === 'string' && fromQuery.length > 0) return fromQuery;
  return hashParams.get(key);
}

/** Tokens from codered://welcome?code=… or #access_token=… */
export function parseAuthCallback(url: string): AuthCallbackTokens {
  const parsed = Linking.parse(url);
  const hash = url.includes('#') ? (url.split('#')[1] ?? '') : '';
  const hashParams = new URLSearchParams(hash);
  return {
    code: pickParam(parsed.queryParams, hashParams, 'code'),
    accessToken: pickParam(parsed.queryParams, hashParams, 'access_token'),
    refreshToken: pickParam(parsed.queryParams, hashParams, 'refresh_token'),
    type: pickParam(parsed.queryParams, hashParams, 'type'),
  };
}

export function isAuthCallbackUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const tokens = parseAuthCallback(url);
  return Boolean(tokens.code || (tokens.accessToken && tokens.refreshToken));
}
