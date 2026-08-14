import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useUiStore } from "@/stores/ui-store";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Transactions from "./pages/Transactions";
import Wallets from "./pages/Wallets";
import SavingsGoals from "./pages/SavingsGoals";
import KwartaAI from "./pages/KwartaAI";
import LandingPage from "./pages/LandingPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { PrivacyPage, TermsPage } from "./pages/LegalPage";
import { PageSkeleton, type PageSkeletonVariant } from "@/components/PageSkeleton";

function getProtectedSkeletonVariant(pathname: string): PageSkeletonVariant {
  if (pathname.startsWith("/transactions")) return "transactions";
  if (pathname.startsWith("/wallets")) return "wallets";
  if (pathname.startsWith("/goals")) return "goals";
  if (pathname.startsWith("/kwarta-ai")) return "chat";
  if (pathname.startsWith("/settings")) return "settings";
  return "dashboard";
}

// Wrapper that redirects to /login if not authenticated
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageSkeleton variant={getProtectedSkeletonVariant(location.pathname)} label="Restoring your session" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function ResetTokenRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token && location.pathname === "/") {
      navigate(`/reset-password?token=${encodeURIComponent(token)}`, {
        replace: true,
      });
    }
  }, [location.pathname, location.search, navigate]);

  return null;
}

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <ResetTokenRedirect />
      <Routes>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* Public routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LandingPage />
            )
          }
        />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <Layout>
              <ProtectedRoute>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/wallets" element={<Wallets />} />
                  <Route path="/goals" element={<SavingsGoals />} />
                  <Route path="/kwarta-ai" element={<KwartaAI />} />
                </Routes>
              </ProtectedRoute>
            </Layout>
          }
        />
      </Routes>
    </>
  );
}

function ThemeInit() {
  const theme = useUiStore((s) => s.theme);
  const highContrast = useUiStore((s) => s.highContrast);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("high-contrast", highContrast);
    const faviconBySize: Record<string, string> = {
      "32x32": theme === "dark" ? "/favicon-dark-32.png?v=4" : "/favicon-32.png?v=4",
      "48x48": theme === "dark" ? "/favicon-dark-48.png?v=4" : "/favicon-48.png?v=4",
    };

    document.querySelectorAll<HTMLLinkElement>("link[rel='icon'][sizes]").forEach((link) => {
      const href = faviconBySize[link.sizes.value];
      if (href) link.href = href;
    });
  }, [theme, highContrast]);
  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <ThemeInit />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
