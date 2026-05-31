import { createAuthClient } from '@neondatabase/auth';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

if (!authUrl) {
  console.warn('VITE_NEON_AUTH_URL is not configured. Neon Auth will not work.');
}

export const authClient = createAuthClient(authUrl || 'http://localhost');

export async function resetAuthSession(): Promise<void> {
  clearPersistedSession();
  await authClient.signOut().catch(() => undefined);
}

export async function getAccessToken(): Promise<string | null> {
  try {
    // getSession exchanges OAuth verifiers, sets cookies, and injects the JWT via set-auth-jwt.
    const sessionResult = await authClient.getSession();
    let token = sessionResult.data?.session?.token ?? null;

    // token() is a separate POST; fall back only if the session response had no JWT.
    if (!token) {
      const tokenResult = await authClient.token();
      token = tokenResult.data?.token ?? null;
    }

    if (token) {
      localStorage.setItem('centra_token', token);
      return token;
    }

    localStorage.removeItem('centra_token');
  } catch {
    localStorage.removeItem('centra_token');
  }

  return null;
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
  const redirectTo = `${window.location.origin}/reset-password`;
  const result = await authClient.requestPasswordReset({
    email,
    redirectTo,
  });

  if (result.error) {
    return { success: false, error: result.error.message || 'Failed to send reset email' };
  }

  return { success: true };
}

export async function resetPasswordWithToken(
  newPassword: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const result = await authClient.resetPassword({
    newPassword,
    token,
  });

  if (result.error) {
    return { success: false, error: result.error.message || 'Failed to reset password' };
  }

  return { success: true };
}
