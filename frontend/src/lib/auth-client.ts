import { createAuthClient } from "@neondatabase/auth";

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

if (!authUrl) {
  console.warn(
    "VITE_NEON_AUTH_URL is not configured. Neon Auth will not work.",
  );
}

export const authClient = createAuthClient(authUrl || "http://localhost");

let inMemoryAccessToken: string | null = null;

interface AccessTokenOptions {
  forceRefresh?: boolean;
}

export async function resetAuthSession(): Promise<void> {
  clearPersistedSession();
  await authClient.signOut().catch(() => undefined);
}

export async function getAccessToken(
  options: AccessTokenOptions = {},
): Promise<string | null> {
  if (options.forceRefresh) {
    inMemoryAccessToken = null;
  }

  if (inMemoryAccessToken) {
    return inMemoryAccessToken;
  }

  try {
    // getSession exchanges OAuth verifiers, sets cookies, and injects the JWT via set-auth-jwt.
    const sessionResult = await authClient.getSession();
    const session = sessionResult.data?.session;

    // Anonymous public routes have no session. Calling token() here only creates
    // a noisy 401 and cannot produce a JWT without a session to exchange.
    if (!session) {
      inMemoryAccessToken = null;
      return null;
    }

    let token = session.token ?? null;

    // A forced refresh must bypass the SDK's cached session token. This is used
    // after a 401 so an expired in-memory JWT cannot poison every API request.
    if (options.forceRefresh || !token) {
      const tokenResult = await authClient.token();
      token = tokenResult.data?.token ?? null;
    }

    if (token) {
      inMemoryAccessToken = token;
      return token;
    }

    inMemoryAccessToken = null;
  } catch {
    inMemoryAccessToken = null;
  }

  return null;
}

export async function persistSessionToken(): Promise<string | null> {
  const token = await getAccessToken();
  if (!token) {
    inMemoryAccessToken = null;
  }
  return token;
}

export function clearPersistedSession(): void {
  inMemoryAccessToken = null;
}

export async function checkAuthAttemptAllowed(
  action: "login" | "password-reset",
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/auth-guard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    if (response.ok) return { success: true };

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    return {
      success: false,
      error: payload?.error || "Authentication is temporarily unavailable. Please try again.",
    };
  } catch {
    return {
      success: false,
      error: "Authentication is temporarily unavailable. Please try again.",
    };
  }
}

export async function requestPasswordReset(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  const guard = await checkAuthAttemptAllowed("password-reset");
  if (!guard.success) return guard;

  const redirectTo = `${window.location.origin}/reset-password`;
  const result = await authClient.requestPasswordReset({
    email,
    redirectTo,
  });

  if (result.error) {
    return {
      success: false,
      error: result.error.message || "Failed to send reset email",
    };
  }

  return { success: true };
}

export async function resetPasswordWithToken(
  newPassword: string,
  token: string,
): Promise<{ success: boolean; error?: string }> {
  const result = await authClient.resetPassword({
    newPassword,
    token,
  });

  if (result.error) {
    return {
      success: false,
      error: result.error.message || "Failed to reset password",
    };
  }

  return { success: true };
}
