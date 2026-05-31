# Implementation Plan: Centra Budget Manager Modernization

This document outlines the roadmap for migrating **Centra Budget Manager** from its current Vanilla JS/CSS architecture to a modern, professional, and "resume-ready" Full-Stack React application.

## 1. Project Vision
*   **Goal**: Transform the app into a premium financial dashboard.
*   **Design**: Modern, "Google Stitch" inspired UI with dark mode, smooth animations, and high-performance interactions.
*   **Architecture**: Single Page Application (SPA) with a robust, type-safe backend.

---

## Current Status (Latest Updates)
*   **Completed**: 
    *   Updated Neon PostgreSQL connection string.
    *   Set up `tsconfig.json` for backend TypeScript compilation (using `NodeNext` modules to match Vercel Node ESM requirements).
    *   Converted `schema.js` to `schema.ts` and enhanced it to automatically create the `accounts` table if missing and incrementally run safe column migrations.
    *   Converted `accounts.js` to `accounts.ts` (adding type definitions for `TokenPayload`, `AccountRow`, etc., and ensuring strict TS compliance).
    *   Fixed Vercel Node ESM relative imports runtime crash (500 error) by appending the `.js` extension to internal imports.
    *   Verified full TypeScript compilation (`tsc --noEmit`).
*   **Next Steps To Be Done**:
    *   Convert remaining backend routes to TypeScript (`transactions.js`, `wallets.js`, `goals.js`, `chat.js`).
    *   Implement **Neon Auth (Better Auth)** to replace the current custom HMAC system for native database branching and simpler config.

---
## 2. Technology Stack

### Frontend (The "UI Shell")
*   **Framework**: [React](https://react.dev/) (v18+)
*   **Build Tool**: [Vite](https://vitejs.dev/) (Industry standard speed)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/) (Premium component system)
*   **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Simple & fast)
*   **Data Fetching**: [TanStack Query](https://tanstack.com/query/latest) (Server-state management)
*   **Navigation**: [React Router](https://reactrouter.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)

### Backend (The "Data Engine")
*   **Runtime**: [Node.js](https://nodejs.org/) (Serverless via Vercel Functions)
*   **Database**: [Neon PostgreSQL](https://neon.tech/) (Serverless Postgres)
*   **ORM**: [Drizzle ORM](https://orm.drizzle.team/) (Type-safe, lightning fast)
*   **Validation**: [Zod](https://zod.dev/) (Input safety)
*   **Language**: [TypeScript](https://www.typescriptlang.org/) (Static typing for entire project)

---

## 3. Implementation Phases

### Phase 1: Foundation & Setup
1.  **Initialize Vite**: Create a `/frontend` or `/src` structure for React.
2.  **Tailwind Configuration**: Set up Design Tokens (colors, fonts, spacing).
3.  **Shadcn/UI Installation**: Initialize core UI components (Buttons, Inputs, Cards).

### Phase 2: Frontend Modernization (In Progress)
1.  **Auth Modals**: Refactor Login and Create Account modals to a premium "Google Stitch" design. (Complete)
2.  **Dashboard Redesign**: Update dashboard layouts and UI components to match the new design system.
3.  **Pages Redesign**: Modernize transactions, wallets, and goals pages.

### Phase 3: Backend TypeScript Migration (In Progress)
1.  **Setup**: Configure `tsconfig.json` for the backend API inside the Vercel Serverless environment. (Complete)
2.  **Conversion**: Convert all existing Vercel Serverless functions from `.js` to `.ts`.
    *   `accounts.js` -> `accounts.ts` (Complete)
    *   `schema.js` -> `schema.ts` (Complete)
    *   `transactions.js` -> `transactions.ts` (Planned)
    *   `wallets.js` -> `wallets.ts` (Planned)
    *   `goals.js` -> `goals.ts` (Planned)
    *   `chat.js` -> `chat.ts` (Planned)
3.  **Typing**: Add precise TypeScript interfaces for all database schema entities, request payloads, and API responses to achieve end-to-end type safety. (In Progress)
4.  **Validation**: Ensure types match between frontend `api.ts` definitions and backend implementations. (In Progress)

### Phase 4: Authentication Migration (Neon Auth) [NEW PLAN]

We will migrate the custom HMAC authentication to **Neon Auth** (built on Better Auth) using the credentials provided:
*   **Auth URL**: `https://ep-bold-wind-aoxjmshy.neonauth.c-2.ap-southeast-1.aws.neon.tech/neondb/auth`
*   **JWKS URL**: `https://ep-bold-wind-aoxjmshy.neonauth.c-2.ap-southeast-1.aws.neon.tech/neondb/auth/.well-known/jwks.json`

#### Proposed Changes

##### 1. Dependencies
*   **Root Backend**: Install `jose` for remote JWKS token verification.
*   **Frontend**: Install `@neondatabase/auth` for client-side authentication.

##### 2. Configuration (`.env`)
Add the following keys to `.env` at root:
```env
VITE_NEON_AUTH_URL=https://ep-bold-wind-aoxjmshy.neonauth.c-2.ap-southeast-1.aws.neon.tech/neondb/auth
NEON_JWKS_URL=https://ep-bold-wind-aoxjmshy.neonauth.c-2.ap-southeast-1.aws.neon.tech/neondb/auth/.well-known/jwks.json
NEON_AUTH_ISSUER=https://ep-bold-wind-aoxjmshy.neonauth.c-2.ap-southeast-1.aws.neon.tech/neondb/auth
```

##### 3. Database Schema
#### [MODIFY] [schema.ts](file:///e:/GitHub/bacaro-budget/api/schema.ts)
*   Add column `neon_auth_id TEXT UNIQUE` to the `accounts` table in `ensureAccountsSchema()`.

##### 4. Backend Verification Helper
#### [NEW] [auth-helper.ts](file:///e:/GitHub/bacaro-budget/api/auth-helper.ts)
*   Implement `requireAccount(req, res)` using `jose` and the JWKS URL.
*   Lookup or create the local `accounts` row based on the JWT `sub` (or fallback to `email` for existing users).

##### 5. Backend Routes Update
*   Modify `api/transactions.ts`, `api/wallets.ts`, `api/goals.ts`, and `api/chat.ts` to import `requireAccount` from `api/auth-helper.js` and remove duplicate token verification code.
*   Remove the duplicate authentication handlers from `api/accounts.ts` (e.g. login, register actions, `createToken`, `hashPassword`, etc.), since these are handled directly on the client side via Neon Auth. We will keep PUT/DELETE handlers for user settings.

##### 6. Frontend Client & Context
#### [NEW] [auth-client.ts](file:///e:/GitHub/bacaro-budget/frontend/src/lib/auth-client.ts)
*   Initialize the auth client using `@neondatabase/auth`.
```typescript
import { createAuthClient } from '@neondatabase/auth';
export const authClient = createAuthClient(import.meta.env.VITE_NEON_AUTH_URL);
```
#### [MODIFY] [AuthContext.tsx](file:///e:/GitHub/bacaro-budget/frontend/src/context/AuthContext.tsx)
*   Migrate `useAuth()`/`AuthProvider` to use `authClient` operations:
    *   `login(email, password)` calls `authClient.signIn.email({ email, password })`.
    *   `register(username, email, password)` calls `authClient.signUp.email({ email, password, name: username })`.
    *   `logout()` calls `authClient.signOut()`.
    *   Retrieve the JWT access token and store user details in the context.
#### [MODIFY] [api.ts](file:///e:/GitHub/bacaro-budget/frontend/src/lib/api.ts)
*   Retrieve the access token from `authClient` or local storage dynamically and attach it to the `Authorization` header.

##### 7. UI Modals
#### [MODIFY] [LoginModal.tsx](file:///e:/GitHub/bacaro-budget/frontend/src/components/LoginModal.tsx)
*   Update to use updated context `login` handler.
*   Optional: Wire up Google/Apple buttons using `authClient.signIn.social({ provider: 'google'/'apple' })`.
#### [MODIFY] [CreateAccountModal.tsx](file:///e:/GitHub/bacaro-budget/frontend/src/components/CreateAccountModal.tsx)
*   Update to use updated context `register` handler.
*   Optional: Wire up Google/Apple buttons.

---

## Verification Plan

### Automated Tests
- Run `npm run build` and ensure TypeScript compiles with zero errors on both frontend and backend.

### Manual Verification
- Test registration using the custom UI modal and verify the user is saved to the Neon database (`neon_auth.user` and our `accounts` table).
- Test login using the custom UI modal.
- Test dashboard data load (transactions, wallets, goals) to verify JWT backend validation.
- Test sign-out.
