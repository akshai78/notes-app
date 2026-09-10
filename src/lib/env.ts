export function clerkPublishableKey(): string {
  return process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? '';
}

export function isClerkConfigured(): boolean {
  return clerkPublishableKey().length > 0;
}

export function apiBaseUrl(): string | null {
  const url = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!url) return null;
  return url.replace(/\/$/, '');
}
