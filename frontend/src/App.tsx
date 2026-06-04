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

// Wrapper that redirects to /login if not authenticated
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <span className="material-symbols-outlined animate-spin text-primary text-[48px]">
        progress_activity
      </span>
    </div>
  );
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

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const isPublicAuthPage =
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password";

  if (isLoading && !isPublicAuthPage) {
    return <AuthLoadingScreen />;
  }

  return (
    <>
      <ResetTokenRedirect />
      <Routes>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

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
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/wallets" element={<Wallets />} />
                  <Route path="/goals" element={<SavingsGoals />} />
                  <Route path="/kwarta-ai" element={<KwartaAI />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function ThemeInit() {
  const theme = useUiStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    const favicon32 = document.querySelector<HTMLLinkElement>(
      "link[rel='icon'][sizes='32x32']",
    );
    if (favicon32) {
      favicon32.href =
        theme === "dark" ? "/favicon-dark-32.png" : "/favicon-32.png";
    }
  }, [theme]);
  return null;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeInit />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
