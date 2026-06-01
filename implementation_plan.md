# Implementation Plan: Centra Budget Manager Modernization

This document outlines the roadmap for migrating **Centra Budget Manager** from its current Vanilla JS/CSS architecture to a modern, professional, and "resume-ready" Full-Stack React application.

## 1. Project Vision
*   **Goal**: Transform the app into a premium financial dashboard.
*   **Design**: Modern, "Google Stitch" inspired UI with dark mode, smooth animations, and high-performance interactions.
*   **Architecture**: Single Page Application (SPA) with a robust, type-safe backend.

---

## Current Status (Latest Updates)

### Completed
*   **Foundation**: Vite + React + Tailwind + React Router (`/frontend`).
*   **Neon PostgreSQL** connection and backend TypeScript (`api/*.ts`, `NodeNext` ESM).
*   **Neon Auth (Better Auth)**: JWT verification via `jose`, `auth-helper.ts`, `@neondatabase/auth` on the client, `neon_auth_id` on `accounts`.
*   **Backend routes**: `accounts`, `schema`, `transactions`, `wallets`, `goals`, `chat` — all TypeScript.
*   **Shadcn/UI**: Core components (`Button`, `Input`, `Label`, `Dialog`, `Card`) under `frontend/src/components/ui/`, `components.json`, `@/` path alias.
*   **Zustand**: `frontend/src/stores/ui-store.ts` — theme (dark mode), FAB state, transaction list filters (persisted theme/sidebar preference).
*   **TanStack Query**: `QueryClientProvider` in `main.tsx`, `frontend/src/hooks/use-budget-data.ts` for wallets, transactions, goals, chat + mutations with cache invalidation.
*   **Zod**: `api/schemas.ts` + `api/validate.ts` — request body validation on all mutating API routes.
*   **Auth UI**: Login / Create Account modals use Shadcn `Dialog` + form primitives.
*   **Data pages on React Query**: Dashboard, Transactions, Wallets, Kwarta AI.

### Explicitly not adopted
*   **Drizzle ORM** — kept raw `@neondatabase/serverless` SQL (per project decision).

### Next steps
*   **Phase 2 (UI)**: Premium redesign pass for Dashboard, Transactions, Wallets, and Goals pages (Stitch-style polish).
*   **Savings Goals**: Replace mock data in `SavingsGoals.tsx` with `useGoals()` + goal mutations.
*   **Verification**: Full manual auth + CRUD test pass; `npm run build` in root and frontend.

---

## 2. Technology Stack

### Frontend (The "UI Shell")
| Tool | Status | Role |
|------|--------|------|
| React 19 + Vite | ✅ | SPA framework & build |
| Tailwind CSS v4 | ✅ | Styling & design tokens |
| Shadcn/UI | ✅ | Accessible UI primitives (`components/ui`) |
| Zustand | ✅ | Client UI state (`stores/ui-store.ts`) |
| TanStack Query | ✅ | Server state, cache, mutations (`hooks/use-budget-data.ts`) |
| React Router | ✅ | Navigation |
| Lucide React | ✅ | Icons (Dialog close; extend as needed) |

### Backend (The "Data Engine")
| Tool | Status | Role |
|------|--------|------|
| Node.js / Vercel Functions | ✅ | Serverless API |
| Neon PostgreSQL | ✅ | Database |
| Zod | ✅ | Request validation (`api/schemas.ts`) |
| TypeScript | ✅ | API + frontend typing |
| Drizzle ORM | ❌ | Not used — raw SQL retained |
| `jose` + Neon Auth | ✅ | JWT verification |

---

## 3. Implementation Phases

### Phase 1: Foundation & Setup — **Done**
1.  Vite React app in `/frontend`.
2.  Tailwind design tokens in `index.css`.
3.  Shadcn/UI initialized (`components.json`, core components).

### Phase 2: Frontend Modernization — **In progress**
1.  Auth modals — **Done** (Shadcn Dialog + Neon Auth).
2.  Dashboard / inner pages — **Functional**; visual redesign still open.
3.  Savings Goals — **Mock data**; wire to API next.

### Phase 3: Backend TypeScript Migration — **Done**
All serverless handlers are `.ts` with shared auth helper.

### Phase 4: Authentication Migration (Neon Auth) — **Done**
Custom HMAC removed; Neon Auth end-to-end.

### Phase 5: Modern data layer — **Done** (except ORM)
*   Zod on API write paths.
*   TanStack Query on main data views.
*   Zustand for cross-page UI state.

---

## 4. Key file map

| Area | Path |
|------|------|
| Shadcn components | `frontend/src/components/ui/` |
| UI state (Zustand) | `frontend/src/stores/ui-store.ts` |
| React Query hooks | `frontend/src/hooks/use-budget-data.ts` |
| Query client | `frontend/src/lib/query-client.ts` |
| API validation | `api/schemas.ts`, `api/validate.ts` |
| Auth | `frontend/src/lib/auth-client.ts`, `api/auth-helper.ts` |

---

## Verification Plan

### Automated
```bash
cd frontend && npm run build
npx tsc --noEmit -p tsconfig.json   # from repo root (api/)
```

### Manual
- Register / login / sign-out via modals.
- Dashboard loads wallets + transactions (cached on revisit).
- Add/delete transaction; create/transfer/delete wallet.
- Toggle dark mode in Settings (Zustand).
- Kwarta AI chat + clear history.
