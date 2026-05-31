import { createAuthClient } from '@neondatabase/auth';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

if (!authUrl) {
  console.warn('VITE_NEON_AUTH_URL is not configured. Neon Auth will not work.');
}

export const authClient = createAuthClient(authUrl || 'http://localhost');

export async function getAccessToken(): Promise<string | null> {
  try {
    // getSession exchanges OAuth verifiers and establishes the cookie session.
    await authClient.getSession();

    const tokenResult = await authClient.token();
    const token = tokenResult.data?.token ?? null;
    if (token) {
      localStorage.setItem('centra_token', token);
      return token;
    }
  } catch {
    // Session may not exist yet
  }

  return localStorage.getItem('centra_token');
}

export async function persistSessionToken(): Promise<string | null> {
  const token = await getAccessToken();
  if (!token) {
    localStorage.removeItem('centra_token');
  }
  return token;
}

export function clearPersistedSession(): void {
  localStorage.removeItem('centra_token');
  localStorage.removeItem('centra_user');
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  const redirectTo = `${window.location.origin}/`;
  const result = await authClient.requestPasswordReset({
    email,
    redirectTo,
  });

  if (result.error) {
    return { success: false, error: result.error.message || 'Failed to send reset email' };
  }

  return { success: true };
}
