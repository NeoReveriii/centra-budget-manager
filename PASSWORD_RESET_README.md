# Password Reset with Neon Auth

This document outlines how password resets are handled in the modern **Centra Budget Manager** application, which now leverages Neon Auth (powered by Better Auth) instead of a custom-built SMTP email service.

## 🚀 How It Works

With the migration to Neon Auth, the entire password reset flow is now a managed service. We no longer need custom API endpoints, database tables for tokens, or manual email sending configurations.

1. **User Request**: The user clicks "Forgot Password?" in the React frontend (`LoginModal.tsx`).
2. **Neon Auth Client**: The frontend calls `authClient.forgetPassword({ email })` (or `requestPasswordReset`).
3. **Managed Email Delivery**: The Neon Auth server automatically generates a secure, single-use token and emails the reset link to the user.
4. **Reset Page**: The user clicks the link in their email, which routes them to a secure reset page hosted by Neon Auth (or a custom page you configure in your auth settings).
5. **Database Sync**: Once the user resets their password, the `neon_auth.account` table is automatically updated within the Neon database.

## 📁 Architecture Changes

During the migration, the following legacy systems were safely **deleted**:
- `api/reset.ts`: The custom Vercel serverless function that handled reset logic.
- `api/mailer.ts` / `api/email-service.ts`: The custom Nodemailer Gmail integrations.
- `views/reset-password.html`: The old static HTML page for resetting passwords.
- **Database Tables**: The `password_resets` table and legacy schema columns (like `password_reset_attempts`) were removed.
- **Dependencies**: `nodemailer`, `bcrypt`, and their associated types are no longer needed, reducing our bundle size and security surface area.

## 🧪 Testing the New Flow

To test the password reset functionality:
1. Ensure your `VITE_NEON_AUTH_URL` is correctly set in your Vercel Dashboard (and locally if testing in dev).
2. Open the Login Modal in the application.
3. Click "Forgot Password?".
4. Enter your email address and submit.
5. Check your inbox for the reset link and follow the prompts.

## 🚨 Troubleshooting

- **Not receiving emails?**
  Check your Neon Console -> Auth -> Email Settings to ensure your email provider (if customized) is correctly configured, or that Neon's default email service is functioning.
- **Invalid Token / Link Expired?**
  Neon Auth reset links have a strict expiration time for security purposes. Request a new link if it expires.

## 🧹 Legacy Code Note

If you are maintaining older parts of the application (such as the legacy `public/assets/js/main.js` or `views/guest.html`), please note that they may still contain references to the old `/api/reset` endpoint. These are no longer functional and should be cleaned up as the transition to the Full-Stack React SPA is completed.
