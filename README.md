# Centra Budget Manager

A full-stack personal finance app that helps users track wallets, transactions, and savings goals in one place—with an AI assistant (Kwarta AI) that answers questions using their real financial data.

**[🔗 Live Demo](https://centra-budget.vercel.app/)** | **[📂 Repository](https://github.com/NeoReveriii/centra-budget-manager)**

---

## 🚀 The Core Problem & Solution

* **The Problem:** Most people juggle spending across multiple wallets and accounts, but typical spreadsheets or generic budgeting apps make it hard to see balances, history, and progress toward goals in one coherent view—let alone get actionable advice without manually exporting data.
* **The Solution:** Centra Budget Manager centralizes wallets, transactions, and savings goals on a live dashboard, secures each user's data with Neon Auth, and powers **Kwarta AI**—a chat assistant that reads the user's actual transactions, wallets, and goals to deliver contextual financial guidance.

---

## 🛠️ Tech Stack

| Category | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS v4, React Router v7 |
| **UI Components** | Radix UI (`@radix-ui/react-dialog`, `@radix-ui/react-label`, `@radix-ui/react-slot`), Lucide React, shadcn/ui |
| **State Management** | Zustand v5 (client UI state + persistence), TanStack Query v5 (server state & caching) |
| **AI Chat** | `react-markdown` + `remark-gfm` (Markdown rendering), DeepSeek streaming |
| **Backend** | Vercel Serverless Functions (Node.js), `@vercel/node` |
| **Database** | PostgreSQL on Neon, `@neondatabase/serverless` |
| **Authentication** | Neon Auth (Better Auth), `@neondatabase/auth`, JWT verification with `jose` |
| **AI** | DeepSeek API (`deepseek-chat`, server-side SSE streaming) |
| **Deployment** | Vercel (frontend + API), Neon (database + auth) |

---

## ✨ Key Features & Engineering Highlights

* **Neon Auth integration:** Email/password sign-up, Google OAuth, password reset flows, and JWT-based API protection—with local `accounts` profiles auto-linked to Neon Auth identities on first login.
* **Financial dashboard:** Real-time overview of wallet balances, recent transactions, and savings goal progress in a responsive React SPA.
* **Multi-wallet transactions:** Income, expense, and transfer operations with balance calculations derived from transaction history. Full search, type filter, wallet filter, and pagination managed via Zustand.
* **Savings goals:** Goal creation, contributions, deadlines, category tags, priority levels, and progress tracking with per-goal contribution history rendered via `GoalCard`.
* **Kwarta AI:** Server-side SSE streaming chat that injects the user's real-time transactions, wallets, and goals into the system prompt. Supports inline chart tags (`[CHART:INCOME]`, `[CHART:EXPENSE]`) that the frontend renders as visual summaries. Responses are persisted to `ai_chats` and rendered with full Markdown (lists, bold, tables) via `react-markdown`.
* **Dark / Light mode:** Persistent theme toggle powered by Zustand (`centra-ui` key in `localStorage`), toggling `dark` class on `<html>` and swapping favicons at runtime.
* **Settings page:** Appearance (dark mode, contrast, language, currency display ₱), data management (CSV export), legal (privacy policy, terms), and a danger zone (delete account). App version displayed as `v4.2.0`.
* **Input validation layer:** All API routes validate request bodies against Zod schemas (`api/schemas.ts`) through a shared `parseBody` helper (`api/validate.ts`), returning structured 400 errors on bad input.
* **Dedicated auth pages:** Custom `/forgot-password` and `/reset-password` flows styled via `AuthPageShell`, matching the landing page experience. Neon Auth email links redirect back to the app and are intercepted by `ResetTokenRedirect`.

---

## 🧠 Technical Challenges & Learnings

### Challenge: Google OAuth & SPA routing on Vercel

* **The Issue:** After Google sign-in, users were redirected to `/dashboard` but hit Vercel 404s or bounced back to the landing page. The Neon Auth SDK only exchanges the OAuth `session_verifier` on `getSession()`, not on `token()`. Combined with `cleanUrls: true` in `vercel.json`, the SPA fallback rewrite pointed to the wrong destination and sub-routes never loaded the React app.
* **The Fix:** Switched token retrieval to `getSession()` first (so the verifier is exchanged), corrected the Vercel rewrite to `/index` for `cleanUrls`, added public routes for auth pages, and verified Neon JWTs against the auth host **origin** (not the full `/neondb/auth` path). OAuth callbacks now land on `/`, restore the session, and route authenticated users to the dashboard reliably.

### Challenge: Stale sessions & false "logged in" state

* **The Issue:** Logout did not always clear Neon Auth cookies, so "Continue with Google" could skip the provider and send users straight to the dashboard. Stale tokens in `localStorage` also allowed redirects before a valid user profile existed.
* **The Fix:** Clear Neon sessions before login, register, and social sign-in; require both `token` and `user` for protected routes; and stop falling back to cached localStorage tokens when the live session is empty.

### Challenge: Zustand UI state persistence & hydration

* **The Issue:** Theme preference and sidebar state needed to survive hard refreshes without a flash of wrong theme (FOWT). Naively reading from `localStorage` in `useEffect` caused a visible flash.
* **The Fix:** Zustand's `persist` middleware with `partialize` syncs only `theme` and `sidebarCollapsed` to `localStorage` under the `centra-ui` key. `ThemeInit` applies the `dark` class and swaps favicons synchronously on mount, before the first paint.

---

## 🗄️ Database Architecture

Neon hosts both application data (`public` schema) and auth data (`neon_auth` schema). App profiles in `accounts` are linked to Neon Auth users via `neon_auth_id`.

```text
  [ neon_auth.users_sync ] 1 ── links ── 0..1 [ accounts ]
                                                    │
                    ┌───────────────────────────────┼───────────────────────────────┐
                    │                               │                               │
                    ▼                               ▼                               ▼
              [ wallets ]                   [ transactions ]                  [ goals ]
                    │                               │                               │
                    └──────── wallet_id ────────────┘                               │
                                                                                      ▼
                                                                            [ goal_contributions ]

  [ accounts ] 1 ── * [ ai_chats ]   ← Kwarta AI conversation history
```

| Table | Purpose |
| :--- | :--- |
| `accounts` | User profile (username, email, avatar, bio, phone, `neon_auth_id`) |
| `wallets` | Cash / bank / e-wallet accounts with computed balances |
| `transactions` | Income, expense, and transfer records |
| `goals` | Savings targets with category, priority, status, and metadata |
| `goal_contributions` | Contribution history per goal |
| `ai_chats` | Persisted Kwarta AI messages per user |
| `neon_auth.*` | Managed by Neon Auth (users, sessions, OAuth) |

---

## ⚙️ Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/NeoReveriii/centra-budget-manager.git
   cd centra-budget-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm install --prefix frontend
   ```

3. **Configure environment variables** (root `.env`, used by Vite and Vercel dev)
   ```env
   DATABASE_URL=postgresql://...
   VITE_NEON_AUTH_URL=https://<your-branch>.neonauth.../neondb/auth
   NEON_JWKS_URL=https://<your-branch>.neonauth.../neondb/auth/.well-known/jwks.json
   NEON_AUTH_ISSUER=https://<your-branch>.neonauth.../neondb/auth
   DEEPSEEK_API_KEY=your_deepseek_key
   ```

4. **Run locally**
   ```bash
   npm run dev
   ```

5. **Production build**
   ```bash
   npm run build
   ```

### Neon Auth setup (production)

* Add your app URL to **Neon Console → Auth → Configuration → Domains** (e.g. `https://centra-budget.vercel.app`, no trailing slash).
* Replace shared Google OAuth keys with your own Client ID/Secret before going live.
* Password reset emails redirect to `/reset-password` on your app domain.

---

## 📁 Project Structure

```text
centra-budget-manager/
├── api/                    # Vercel serverless API routes
│   ├── accounts.ts         # Profile CRUD (username, avatar, bio, phone)
│   ├── auth-helper.ts      # JWT verification & Neon Auth account linking
│   ├── chat.ts             # Kwarta AI — DeepSeek SSE streaming + context injection
│   ├── goals.ts            # Goals & contributions CRUD
│   ├── schema.ts           # ensureAccountsSchema (DB migration helper)
│   ├── schemas.ts          # Zod validation schemas for all API payloads
│   ├── transactions.ts     # Transactions CRUD with balance logic
│   ├── validate.ts         # parseBody helper — runs Zod schemas, returns 400 on failure
│   └── wallets.ts          # Wallets CRUD with computed balance query
├── frontend/               # React 19 + Vite 6 SPA
│   └── src/
│       ├── components/     # Shared UI components
│       │   ├── ui/         # shadcn/ui primitives (button, card, dialog, input, label)
│       │   ├── AddTransactionModal.tsx # Dialog for adding new transactions
│       │   ├── AuthPageShell.tsx   # Wrapper layout for auth pages
│       │   ├── CentraBrand.tsx     # Logo / brand mark component
│       │   ├── CreateAccountModal.tsx
│       │   ├── GoalCard.tsx        # Savings goal card with progress bar
│       │   ├── Layout.tsx          # App shell (sidebar + main content area)
│       │   ├── LoginModal.tsx
│       │   └── Sidebar.tsx         # Navigation sidebar with user profile footer
│       ├── context/        # AuthProvider (AuthContext.tsx - Neon Auth session + user profile)
│       ├── hooks/          # use-budget-data.ts (TanStack Query data hook)
│       ├── lib/            # api.ts, auth-client.ts, query-client.ts, utils.ts
│       ├── pages/          # Route-level page components
│       │   ├── Dashboard.tsx       # Overview: balances, recent tx, goal progress
│       │   ├── ForgotPasswordPage.tsx
│       │   ├── KwartaAI.tsx        # AI chat with Markdown + chart rendering
│       │   ├── LandingPage.tsx
│       │   ├── ResetPasswordPage.tsx
│       │   ├── SavingsGoals.tsx
│       │   ├── Settings.tsx        # Theme, language, CSV export, danger zone
│       │   ├── Transactions.tsx    # Filterable, paginated transaction list
│       │   └── Wallets.tsx         # Wallet management with balance breakdown
│       └── stores/         # Zustand stores
│           └── ui-store.ts # Theme, sidebar, FAB, transaction filter & page state
├── public/                 # Built SPA output (generated on deploy)
└── vercel.json             # SPA rewrites + API routing + cache headers
```

---

## License

This project is licensed under the MIT License.
