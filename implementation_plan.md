# Implementation Plan: Centra Budget Manager Modernization

This document outlines the roadmap for migrating **Centra Budget Manager** from its current Vanilla JS/CSS architecture to a modern, professional, and "resume-ready" Full-Stack React application.

## 1. Project Vision
*   **Goal**: Transform the app into a premium financial dashboard.
*   **Design**: Modern, "Google Stitch" inspired UI with dark mode, smooth animations, and high-performance interactions.
*   **Architecture**: Single Page Application (SPA) with a robust, type-safe backend.

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

### Phase 3: Backend TypeScript Migration (Planned)
1.  **Setup**: Configure `tsconfig.json` for the backend API inside the Vercel Serverless environment.
2.  **Conversion**: Convert all existing Vercel Serverless functions (e.g., `accounts.js`, `transactions.js`, `wallets.js`) from `.js` to `.ts`.
3.  **Typing**: Add precise TypeScript interfaces for all database schema entities, request payloads, and API responses to achieve end-to-end type safety.
4.  **Validation**: Ensure types match between frontend `api.ts` definitions and backend implementations.
5.  **Neon Auth (Better Auth) Integration**: Replace the custom HMAC authentication system with Neon Auth to enable database-native authentication, native branching support, and Google/Apple social logins.
