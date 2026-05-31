# Centra Budget Manager

A full-stack personal finance app that helps users track wallets, transactions, and savings goals in one place—with an AI assistant (Kwarta AI) that answers questions using their real financial data.

**[🔗 Live Demo](https://centra-budget.vercel.app/)** | **[📂 Repository](https://github.com/NeoReveriii/centra-budget-manager)**

---

## 🚀 The Core Problem & Solution

* **The Problem:** Most people juggle spending across multiple wallets and accounts, but typical spreadsheets or generic budgeting apps make it hard to see balances, history, and progress toward goals in one coherent view—let alone get actionable advice without manually exporting data.
* **The Solution:** Centra Budget Manager centralizes wallets, transactions, and savings goals on a live dashboard, secures each user’s data with Neon Auth, and powers **Kwarta AI**—a chat assistant that reads the user’s actual transactions, wallets, and goals to deliver contextual financial guidance.

---

## 🛠️ Tech Stack

| Category | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, React Router |
| **Backend** | Vercel Serverless Functions (Node.js), `@vercel/node` |
| **Database** | PostgreSQL on Neon, `@neondatabase/serverless` |
| **Authentication** | Neon Auth (Better Auth), `@neondatabase/auth`, JWT verification with `jose` |
| **AI** | DeepSeek API (streaming chat in Kwarta AI) |
| **Deployment** | Vercel (frontend + API), Neon (database + auth) |

---

## ✨ Key Features & Engineering Highlights

* **Neon Auth integration:** Email/password sign-up, Google OAuth, password reset flows, and JWT-based API protection—with local `accounts` profiles auto-linked to Neon Auth identities on first login.
* **Financial dashboard:** Real-time overview of wallet balances, recent transactions, and savings goal progress in a responsive React SPA.
* **Multi-wallet transactions:** Income, expense, and transfer operations with balance calculations derived from transaction history.
* **Savings goals:** Goal creation, contributions, deadlines, and progress tracking with contribution history.
* **Kwarta AI:** Server-side streaming chat that injects the user’s transactions, wallets, and goals into the prompt so responses stay personalized and data-aware.
* **Dedicated auth pages:** Custom `/forgot-password` and `/reset-password` flows styled to match the login experience, with Neon Auth email links redirecting back to the app.

---

## 🧠 Technical Challenges & Learnings

### Challenge: Google OAuth & SPA routing on Vercel

* **The Issue:** After Google sign-in, users were redirected to `/dashboard` but hit Vercel 404s or bounced back to the landing page. The Neon Auth SDK only exchanges the OAuth `session_verifier` on `getSession()`, not on `token()`. Combined with `cleanUrls: true` in `vercel.json`, the SPA fallback rewrite pointed to the wrong destination and sub-routes never loaded the React app.
* **The Fix:** Switched token retrieval to `getSession()` first (so the verifier is exchanged), corrected the Vercel rewrite to `/index` for `cleanUrls`, added public routes for auth pages, and verified Neon JWTs against the auth host **origin** (not the full `/neondb/auth` path). OAuth callbacks now land on `/`, restore the session, and route authenticated users to the dashboard reliably.

### Challenge: Stale sessions & false “logged in” state

* **The Issue:** Logout did not always clear Neon Auth cookies, so “Continue with Google” could skip the provider and send users straight to the dashboard. Stale tokens in `localStorage` also allowed redirects before a valid user profile existed.
* **The Fix:** Clear Neon sessions before login, register, and social sign-in; require both `token` and `user` for protected routes; and stop falling back to cached localStorage tokens when the live session is empty.

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
| `accounts` | User profile (username, email, avatar, `neon_auth_id`) |
| `wallets` | Cash / bank / e-wallet accounts with computed balances |
| `transactions` | Income, expense, and transfer records |
| `goals` | Savings targets with status and metadata |
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
   npx vercel dev
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
├── api/                 # Vercel serverless API routes
│   ├── accounts.ts      # Profile CRUD
│   ├── auth-helper.ts   # JWT verification & account linking
│   ├── chat.ts          # Kwarta AI (DeepSeek streaming)
│   ├── goals.ts
│   ├── transactions.ts
│   └── wallets.ts
├── frontend/            # React + Vite SPA
│   └── src/
│       ├── components/  # Login modal, sidebar, layout, auth pages
│       ├── context/     # AuthProvider
│       ├── lib/         # API client, Neon Auth client
│       └── pages/       # Dashboard, wallets, goals, Kwarta AI, etc.
├── public/              # Built SPA output (generated on deploy)
└── vercel.json          # SPA rewrites + API routing
```

---

## License

This project is licensed under the MIT License.
